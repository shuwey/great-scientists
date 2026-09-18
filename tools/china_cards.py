# -*- coding: utf-8 -*-
"""「同期中国」卡片的唯一计算口径（网页端与小程序端共用）。

为什么要单独一个模块
--------------------
这段逻辑原先有两份拷贝：`build_china_era.py` 里生成的 JS 版，和
`export_miniapp_pages.py` 里的 Python 版，靠注释写着「逐条同口径」靠人盯。
★ 一份逻辑两处实现必然漂移 —— 这次加「同一站内不重复」时两边都得改。
抽出来之后只改一处，两端天然一致。

提供的三件事
------------
1. `era_head(y)`  —— 节点年份 → 「清·康熙二十六年」
2. `assign(years)` —— 全局贪心分配：**同一站内每条大事/人物只出现一次**，
   每个节点每类最多 `CAP` 条。
3. `mark(text)`   —— 把生僻名词包成可点击的 `<span class="term">`，
   并回报用到了哪些名词（供生成器做体积切片）。

关于「不重复」的算法
--------------------
不能各节点独立取前 3：相邻节点的 ±20 年窗口大幅重叠，独立取会让同一条目在好几个
节点里反复出现（实测 `feynman` 的 30 条人物里有 13 条是重复；`newton` 的梅文鼎
在 14 个节点里出现了 13 次）。所以改成**按距离全局排队占位**：

    1. 枚举所有 (条目, 节点) 候选对，代价 = 条目年份与节点年份的距离；
    2. 按代价升序扫描，条目未被占用、且该节点该类别还没满 CAP 条，就落位；
    3. 已被占用的条目跳过（但它仍会以更远的节点身份出现在后面的候选里，
       所以只是「换一个节点」，不会消失）。

结果：每条只落在离它最近的、还装得下的节点上。并列时取更早的节点，保证确定性。
"""
import re

import china_data as D

WIN = 20          # 匹配窗口：±20 年
CAP = 3           # 每个节点每类最多显示几条

_CN = "零一二三四五六七八九"
_INDEX = None     # 名词匹配表缓存：[("中文平均律", "cn-...")]，按词长降序


# --------------------------------------------------------------------------- #
# 1. 朝代 / 年号
# --------------------------------------------------------------------------- #
def num2cn(n):
    """1 → 元，11 → 十一，26 → 二十六（用于「康熙二十六年」）。"""
    if n == 1:
        return "元"
    if n < 10:
        return _CN[n]
    if n == 10:
        return "十"
    if n < 20:
        return "十" + _CN[n - 10]
    t, r = divmod(n, 10)
    s = _CN[t] + "十"
    return s + _CN[r] if r else s


def era_of(y):
    """年份 → {dyn, era, n}；年号表覆盖不到时退回朝代名，都覆盖不到返回 None。"""
    for e in D.ERAS:
        if e[0] <= y <= e[1]:
            return {"dyn": e[3], "era": e[2], "n": y - e[0] + 1}
    for d in D.DYNASTIES:
        if d[0] <= y <= d[1]:
            return {"dyn": d[2], "era": "", "n": 0}
    return None


def era_head(y):
    """节点年份 → 卡片标题文字，如「清·康熙二十六年」；无朝代信息返回空串。"""
    er = era_of(y)
    if not er:
        return ""
    if er["era"]:
        return er["dyn"] + "·" + er["era"] + num2cn(er["n"]) + "年"
    return er["dyn"]


# --------------------------------------------------------------------------- #
# 2. 全局分配（去重）
# --------------------------------------------------------------------------- #
def _mid(f):
    """人物的「在世中点」；在世者（卒年为 None）按生年 +40 估。"""
    return (f[1] + (f[2] if f[2] is not None else f[1] + 40)) / 2.0


def assign(years):
    """years（**节点年份列表，允许重复**）→ 等长的分配结果列表。

    按**节点序号**而不是年份做键：同一年可能有两个节点（哥白尼 1543 既是
    《天体运行论》出版、又是逝世），按年份做键会让两个节点拿到完全相同的卡片 ——
    那正是要消灭的「重复」。返回列表，与 `[data-year]` 的出现顺序一一对应。
    """
    idxs = list(range(len(years)))
    out = {i: {"ev": [], "fg": []} for i in idxs}

    # ---- 大事 ----
    cands = []
    for i in idxs:
        for k, e in enumerate(D.EVENTS):
            d = abs(e[0] - years[i])
            if d <= WIN:
                cands.append((d, e[0], i, k, e))
    cands.sort(key=lambda c: (c[0], c[1], c[2]))
    taken = set()
    for d, ey, i, k, e in cands:
        if k in taken or len(out[i]["ev"]) >= CAP:
            continue
        out[i]["ev"].append(e)
        taken.add(k)

    # ---- 人物 ----
    cands = []
    for i in idxs:
        for k, f in enumerate(D.FIGURES):
            end = f[2] if f[2] is not None else 9999
            if f[1] <= years[i] + WIN and end >= years[i] - WIN:
                cands.append((abs(_mid(f) - years[i]), f[1], i, k, f))
    cands.sort(key=lambda c: (c[0], c[1], c[2]))
    taken = set()
    for d, fb, i, k, f in cands:
        if k in taken or len(out[i]["fg"]) >= CAP:
            continue
        out[i]["fg"].append(f)
        taken.add(k)

    for i in idxs:
        out[i]["ev"].sort(key=lambda e: e[0])
        out[i]["fg"].sort(key=lambda f: f[1])
    return [out[i] for i in idxs]


def cards(years, annotate=True):
    """years → 等长的卡片列表 [{y, head, ev, fg, used}]（顺序即节点顺序）。

    `head` 已含年号名词的点击标记；`ev` / `fg` 里的文本已做名词标注。
    `annotate=False` 时只做 HTML 转义、不插名词标记 —— 用于页面上没有加载
    术语库（terms.js）的子站，否则会留下一堆点了没反应的下划线。
    """
    got = assign(years)
    out = []
    for y, g in zip(years, got):
        head = era_head(y)
        head_html, used = "", []
        if head:
            head_html = (_wrap(head, NIANHAO) if annotate else esc(head))
            if annotate:
                used.append(NIANHAO)
        ev = []
        for e in g["ev"]:
            html, ids = (mark(e[1]) if annotate else (esc(e[1]), []))
            used += ids
            ev.append([e[0], html])
        fg = []
        for f in g["fg"]:
            html, ids = (mark(f[4]) if annotate else (esc(f[4]), []))
            used += ids
            fg.append([f[0], f[1], f[2], f[3], html])
        out.append({"y": y, "head": head_html, "ev": ev, "fg": fg,
                    "used": sorted(set(used))})
    return out


# --------------------------------------------------------------------------- #
# 3. 名词标注
# --------------------------------------------------------------------------- #
NIANHAO = "cn-nianhao"   # 卡片标题统一指向「年号纪年」


def esc(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;")
             .replace(">", "&gt;").replace('"', "&quot;"))


def _index_map():
    global _INDEX
    if _INDEX is None:
        idx = []
        for t in D.TERMS:
            for w in (t[1],) + tuple(t[2]):
                if w:
                    idx.append((w, t[0]))
        # 长词优先：「三藩之乱」必须先于「三藩」被占位
        idx.sort(key=lambda x: (-len(x[0]), x[0]))
        _INDEX = idx
    return _INDEX


def _wrap(word, tid):
    return ('<span class="term" data-term="%s" tabindex="0" role="button">%s</span>'
            % (tid, esc(word)))


def mark(text, limit=1):
    """把 `text` 里最先出现的名词包成可点击 span，返回 (html, [用到的 id])。

    `limit` 限制每行最多标几处 —— 卡片一行一句，标满会变成一片下划线。
    取「按位置最先 vs 按词最长」时选了**先按最长词占位、再按出现位置**，
    这样「《南京条约》」不会被拆成「南京条约」。
    """
    hits = []
    for w, tid in _index_map():
        at = 0
        while True:
            i = text.find(w, at)
            if i < 0:
                break
            if not any(not (i + len(w) <= a or i >= b) for a, b, _ in hits):
                hits.append((i, i + len(w), tid))
                break
            at = i + 1
    hits.sort()
    hits = hits[:limit]
    if not hits:
        return esc(text), []
    parts, pos, used = [], 0, []
    for a, b, tid in hits:
        parts.append(esc(text[pos:a]))
        parts.append(_wrap(text[a:b], tid))
        used.append(tid)
        pos = b
    parts.append(esc(text[pos:]))
    return "".join(parts), used


def term_entry(tid):
    """id → 站点术语弹窗认识的字段结构（cat/name/short/plain/extra）。"""
    for t in D.TERMS:
        if t[0] == tid:
            return {"cat": t[3], "name": t[1], "short": t[4],
                    "plain": t[5], "extra": t[6]}
    return None
