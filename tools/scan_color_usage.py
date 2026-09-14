#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""静态核对：某个颜色在 site.js 里是"只用于文字"还是"也用于图形"。

判定法：按 `;` 切分语句，跟踪当前 fillStyle；遇到 fillText 就记一次"文字用途"，
遇到 fill/fillRect/stroke/arc 等就记一次"图形用途"（只在两次 fillStyle 赋值之间算一次）。

只有 text-only 的颜色才可全局替换；混合用途的必须按位置精修。

用法：python tools/scan_color_usage.py [#b0bac9 #8b96aa ...]
"""
import pathlib
import re
import sys
from collections import defaultdict

COLORS = sys.argv[1:] or ["#b0bac9", "#8b96aa", "#9aa7be", "#c7d0de", "#ffd43b", "#f59f00", "#5c6b82"]
ASSIGN = re.compile(r'fillStyle\s*=\s*["\']([^"\']+)["\']', re.I)
TEXT = re.compile(r"\bfillText\s*\(")
SHAPE = re.compile(r"\bfillRect\s*\(|\bfill\s*\(\s*\)|\bstroke\s*\(|\barc\s*\(|\bmoveTo\s*\(|\blineTo\s*\(")

FILES = sorted(pathlib.Path("scientists").glob("*/assets/js/site.js")) + [pathlib.Path("assets/js/site.js")]

print(f"{'颜色':<12}{'文字用途':>8}{'图形用途':>10}   判定")
print("-" * 78)
summary = {}
for col in COLORS:
    t = sh = 0
    where = defaultdict(int)
    for f in FILES:
        if not f.exists():
            continue
        st = f.parts[1] if f.parts[0] == "scientists" else "(根)"
        s = f.read_text("utf-8")
        # 收集所有赋值位置
        assigns = [(m.start(), m.end(), m.group(1).strip().lower()) for m in ASSIGN.finditer(s)]
        texts = [m.start() for m in TEXT.finditer(s)]
        for i, (a0, a1, val) in enumerate(assigns):
            if val != col:
                continue
            nxt = assigns[i + 1][0] if i + 1 < len(assigns) else len(s)
            seg = s[a1:nxt]
            has_t = bool(TEXT.search(seg))
            has_s = bool(SHAPE.search(seg))
            if has_t:
                t += 1
                where[st] += 1
            if has_s:
                sh += 1
    verdict = "✅ 纯文字，可全局替换" if (t and not sh) else (
        "⚠️ 图形也用，需按位置精修" if (t and sh) else ("— 未用于文字" if sh else "? 未发现"))
    print(f"{col:<12}{t:>8}{sh:>10}   {verdict}" + ("   " + ", ".join(f"{k}×{v}" for k, v in sorted(where.items())) if where else ""))
    summary[col] = (t, sh)
