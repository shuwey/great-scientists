#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""修正 kicker 类名错配。

背景：`assets/css/style.css` 里只定义了 `.sec-kicker`，但生成器模板
（`tools/build_scientist.py` 的 INDEX_TPL）写的是 `class="kicker"`，
于是 13 个站首页的 4 处小标签（hero 的 kicker + 「四大成就」/「先认识这个人」/
「关于这个站」）**一直没有样式**。

这类「HTML 类名 ↔ CSS 规则错配」validate_site.py 与 e2e 都不会报错，
只能靠渲染实测或逐名核对发现。

用法：python tools/fix_kicker_class.py [--dry-run]
"""
import os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
SCI = os.path.join(ROOT, "scientists")
OLD, NEW = 'class="kicker"', 'class="sec-kicker"'
DRY = "--dry-run" in sys.argv


def main():
    # 护栏：确认 CSS 里确实只有 .sec-kicker
    css = open(os.path.join(SCI, "bohr", "assets", "css", "style.css"), encoding="utf-8").read()
    if re.search(r"^\.kicker\s*\{", css, re.M):
        print("！CSS 里出现了 .kicker 规则，本脚本的前提不成立，请先复核")
        return 1
    if ".sec-kicker" not in css:
        print("！CSS 里找不到 .sec-kicker，中止")
        return 1

    total, touched = 0, 0
    for sid in sorted(os.listdir(SCI)):
        p = os.path.join(SCI, sid, "index.html")
        if not os.path.isfile(p):
            continue
        s = open(p, encoding="utf-8").read()
        n = s.count(OLD)
        if not n:
            print("  %-12s 已是 sec-kicker，跳过" % sid)
            continue
        if not DRY:
            open(p, "w", encoding="utf-8").write(s.replace(OLD, NEW))
        total += n
        touched += 1
        print("  %-12s 替换 %d 处" % (sid, n))

    print("\n%s：%d 个站 · %d 处" % ("将替换" if DRY else "已替换", touched, total))
    return 0


if __name__ == "__main__":
    sys.exit(main())
