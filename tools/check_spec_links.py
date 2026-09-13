# -*- coding: utf-8 -*-
"""校验 tools/newlabs/*.py 与生成后的 scientists/*/labs.html 里，指向详解页的链接：
  ① 目标文件是否真实存在（坏链）；
  ② 链接文字是否与目标页 <h1> 一致（"顺手编了个像页名"的假名字）。

背景：两类问题都是在重做实验/补充旁白时最容易犯的。
  ① 例如给费曼页写 detail/doubleslit.html，而费曼站只有 diagram/path/qed/teacher；
  ② 例如旁白写「详见 黑洞：时空的深渊」，目标页真名却是「黑洞：连光都逃不掉」。
  ① 会被 validate_site.py 逮到（但要等全站跑完，反馈慢）；② 两者都查不出来。
  本脚本秒级自查，改完规格就能跑。

用法：python3 tools/check_spec_links.py
退出码：0 全部通过；1 存在问题（逐条打印，坏链会给出同站候选页）
"""
import os
import re
import glob
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
NEWLABS = os.path.join(ROOT, "tools", "newlabs")
SITES = os.path.join(ROOT, "scientists")

# 规格文件里 href 的引号被转义过：href=\"detail/x.html\"
LINK_RE = re.compile(r'href=\\?"(detail/[a-z0-9-]+\.html)\\?"[^>]*>([\s\S]{1,140}?)</a>')

# 按钮/CTA 文案与页面短称，不算"假页名"，不参与第 ② 项比对
WHITELIST = {
    "从核心成就说起", "从望远镜说起", "哈雷登门请教", "懂颜色与光的本质",
    "首页", "时间轴", "全部科学家", "回到首页总览",
}
WHITELIST_PREFIX = ("读", "看", "详见", "下一篇")


def h1_of(path):
    try:
        s = open(path, encoding="utf-8").read()
    except OSError:
        return None
    m = re.search(r"<h1[^>]*>([\s\S]*?)</h1>", s)
    if not m:
        return None
    return re.sub(r"\s+", "", re.sub(r"<[^>]+>", "", m.group(1))).replace("·", "")


def norm(s):
    return re.sub(r"[：:，,。·、\s“”\"'（）()\-—]", "", s)


def collect():
    """返回 [(来源描述, 站点, href, 链接文字)]，覆盖规格文件与生成后的 labs.html。"""
    rows = []
    for spec in sorted(glob.glob(os.path.join(NEWLABS, "*.py"))):
        site = os.path.basename(spec)[:-3]
        txt = open(spec, encoding="utf-8").read()
        for href, raw in LINK_RE.findall(txt):
            rows.append(("spec", site, href, raw))
    for page in sorted(glob.glob(os.path.join(SITES, "*", "labs.html"))):
        site = os.path.basename(os.path.dirname(page))
        txt = open(page, encoding="utf-8").read()
        for href, raw in LINK_RE.findall(txt):
            rows.append(("labs.html", site, href, raw))
    return rows


def main():
    missing = 0
    mismatch = 0
    total = 0
    seen = set()
    for src, site, href, raw in collect():
        key = (src, site, href, raw)
        if key in seen:
            continue
        seen.add(key)
        total += 1
        target = os.path.join(SITES, site, href)
        tag = "%s:%s" % (site, os.path.basename(src) if src == "spec" else "labs.html")

        if not os.path.isfile(target):
            missing += 1
            ddir = os.path.join(SITES, site, "detail")
            have = sorted(f for f in os.listdir(ddir)) if os.path.isdir(ddir) else []
            print("  ❌[坏链] %-26s %s" % (tag, href))
            print("          该站现有：%s" % ", ".join(have))
            continue

        text = norm(re.sub(r"<[^>]+>", "", raw).strip().strip("。→ "))
        title = h1_of(target)
        if not text or not title or len(text) <= 4:
            continue
        if text in WHITELIST or text.startswith(WHITELIST_PREFIX):
            continue
        a, b = norm(text), norm(title)
        if a not in b and b not in a:
            mismatch += 1
            print("  ⚠️[名不符] %-26s 链接文字『%s』 ≠ 页面标题『%s』" % (tag, text[:30], title[:30]))

    print("\n检查 %d 条链接：坏链 %d，链接文字与页面标题不符 %d" % (total, missing, mismatch))
    if missing or mismatch:
        if missing:
            print("→ 坏链：改成同站候选页，再重跑 patch_labs.py")
        if mismatch:
            print("→ 名不符：把链接文字改成目标页真实标题（脚本无法判断该改哪边，需人工确认）")
        return 1
    print("✅ 全部通过")
    return 0


if __name__ == "__main__":
    sys.exit(main())
