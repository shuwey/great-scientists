# -*- coding: utf-8 -*-
"""校验「同期中国」卡片：同站不重复、序号对齐、名词有解释。

为什么要有这一道：这些性质**在页面上看不出来**。
* 同一条大事在 3 个节点里各出现一次 —— 页面照常渲染，只有逐站对比才发现；
  去重逻辑一改就可能悄悄退回去（实测改动前 feynman 30 条人物里 13 条是重复）。
* 卡片按节点序号对齐，一旦错位，整站卡片集体张冠李戴，页面同样不报错。
* `data-term` 指向一个不存在的解释条目 → 点了没反应，也没有任何报错。

所以这里**只读生成产物**（china.js + timeline.html）做独立复核，
不去复用生成器的计算函数 —— 复用同一份逻辑等于自己给自己判卷。

用法：
    python3 tools/check_china_cards.py            # 全部子站
"""
import json
import os
import re
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
SCIENTISTS = os.path.join(ROOT, "scientists")

TAG = re.compile(r"<[^>]+>")


def strip_tags(s):
    return TAG.sub("", s)


def grab(src, name):
    """从生成的 JS 里取出 `var NAME = <json>;` 的值。

    用 raw_decode 而不是正则截取：JSON 里含中文与 ";"，正则截断会得到假报错。
    """
    m = re.search(r"var\s+%s\s*=\s*" % re.escape(name), src)
    if not m:
        raise ValueError("china.js 里找不到 var %s" % name)
    val, _ = json.JSONDecoder().raw_decode(src, m.end())
    return val


def check(sid, problems, info):
    site = os.path.join(SCIENTISTS, sid)
    tl = os.path.join(site, "timeline.html")
    jsp = os.path.join(site, "assets", "js", "china.js")
    for p in (tl, jsp):
        if not os.path.exists(p):
            problems.append("%s: 缺文件 %s" % (sid, os.path.relpath(p, site)))
            return
    html = open(tl, encoding="utf-8").read()
    src = open(jsp, encoding="utf-8").read()

    # 1) 脚本已注入
    if "assets/js/china.js" not in html:
        problems.append("%s: timeline.html 没有引用 china.js" % sid)

    years = [int(x) for x in re.findall(r'data-year="(\d{4})"', html)]
    if not years:
        problems.append("%s: 没有 data-year 节点" % sid)
        return

    cards = grab(src, "CARDS")
    terms = grab(src, "TERMS")

    # 2) 长度与序号对齐 —— 错位会让整站卡片张冠李戴，且页面照常渲染
    if len(cards) != len(years):
        problems.append("%s: 卡片 %d 张 ≠ 节点 %d 个" % (sid, len(cards), len(years)))
        return
    for i, (c, y) in enumerate(zip(cards, years)):
        if c.get("y") != y:
            problems.append("%s: 第 %d 张卡片年份 %s ≠ 节点年份 %d（序号错位）"
                            % (sid, i, c.get("y"), y))

    # 3) ★ 同站不重复
    seen_ev, seen_fg = {}, {}
    for i, c in enumerate(cards):
        ev = c.get("e") or []
        fg = c.get("f") or []
        if len(ev) > 3 or len(fg) > 3:
            problems.append("%s: 节点 %s 条目超限（大事 %d / 人物 %d）"
                            % (sid, c.get("y"), len(ev), len(fg)))
        for e in ev:
            key = (e[0], strip_tags(e[1]))
            if key in seen_ev:
                problems.append("%s: 大事重复出现 —— %s（节点 %s 与 %s）"
                                % (sid, key[1][:24], seen_ev[key], c.get("y")))
            seen_ev[key] = c.get("y")
        for f in fg:
            if f[0] in seen_fg:
                problems.append("%s: 人物重复出现 —— %s（节点 %s 与 %s）"
                                % (sid, f[0], seen_fg[f[0]], c.get("y")))
            seen_fg[f[0]] = c.get("y")

    # 4) 每个节点都要有朝代/年号标题
    for i, c in enumerate(cards):
        head = strip_tags(c.get("h") or "")
        if not head:
            problems.append("%s: 节点 %s 没有朝代年号标题" % (sid, c.get("y")))
        elif not re.match(r"^(明|清|民国|中华人民共和国)(·.+年)?$", head):
            problems.append("%s: 节点 %s 的标题格式异常「%s」" % (sid, c.get("y"), head))

    # 5) 名词：引用必须能落到解释条目上；条目必须真被用到
    used_ids, referenced = set(), set()
    for i, c in enumerate(cards):
        blob = (c.get("h") or "") + "".join(e[1] for e in (c.get("e") or [])) \
            + "".join(f[4] for f in (c.get("f") or []))
        for tid in re.findall(r'data-term="([^"]+)"', blob):
            referenced.add(tid)
            if tid not in terms:
                problems.append("%s: 名词 %s 没有解释条目（点了没反应）" % (sid, tid))
    used_ids |= set(terms.keys())
    for tid in sorted(used_ids - referenced):
        problems.append("%s: 名词 %s 带了定义却没人引用（白占体积）" % (sid, tid))

    # 6) 解释字段齐备，且不与站点自身术语库撞 id（撞了会静默覆盖）
    site_terms = os.path.join(site, "assets", "js", "terms.js")
    if os.path.exists(site_terms):
        tsrc = open(site_terms, encoding="utf-8").read()
        clash = [k for k in terms if '"%s"' % k in tsrc]
        if clash:
            problems.append("%s: 历史名词与站点术语库 id 撞车 %s" % (sid, clash))
    for tid, t in sorted(terms.items()):
        for field in ("cat", "name", "short", "plain"):
            if not t.get(field):
                problems.append("%s: 名词 %s 缺字段 %s" % (sid, tid, field))
        for field in ("plain", "extra"):
            if re.search(r"<[a-z]", str(t.get(field) or "")):
                problems.append("%s: 名词 %s 的 %s 里混进了标记" % (sid, tid, field))

    info.append("%-12s 节点%2d 大事%2d 人物%2d 名词%2d" % (
        sid, len(years), len(seen_ev), len(seen_fg), len(terms)))


def main():
    sids = sorted(d for d in os.listdir(SCIENTISTS)
                  if os.path.isdir(os.path.join(SCIENTISTS, d)) and not d.startswith("."))
    problems, info = [], []
    for sid in sids:
        check(sid, problems, info)
    for line in info:
        print(line)
    print()
    if problems:
        print("✗ %d 个问题：" % len(problems))
        for p in problems:
            print("  -", p)
        sys.exit(1)
    print("✓ 同期中国卡片：同站无重复、序号对齐、名词解释齐备（%d 站）" % len(sids))


if __name__ == "__main__":
    main()
