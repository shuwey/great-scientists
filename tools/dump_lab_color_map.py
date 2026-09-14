#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""按出现顺序抽出一个实验里"设置颜色"与"画文字/图形"的语句，用来确定
"某个颜色画的是什么东西" —— 写迷你图例时以此为依据，避免凭印象写错标签。

用法：python3 tools/dump_lab_color_map.py [站id]
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
IDS = ["copernicus","galileo","kepler","newton","faraday","darwin","pasteur","maxwell",
       "mendeleev","curie","einstein","bohr","turing","feynman","hawking"]
FN = re.compile(r"^\s*function (lab_?[A-Za-z_]+)\s*\(", re.M)
KEEP = re.compile(r"fillStyle|strokeStyle|fillText|createLinearGradient|addColorStop|"
                  r"arc\(|fillRect\(|moveTo\(|lineTo\(|class=|\.push\(\[|font=")
COLOR = re.compile(r"#[0-9A-Fa-f]{3,8}\b|rgba?\([^)]*\)")

args = [a for a in sys.argv[1:] if not a.startswith("-")]
only = args[0] if args else None
maxlines = 60

for sid in IDS:
    if only and sid != only:
        continue
    t = (ROOT / "scientists" / sid / "assets/js/site.js").read_text(encoding="utf-8")
    marks = [(m.start(), m.group(1)) for m in FN.finditer(t)]
    print(f"\n########## {sid} ##########")
    for i, (pos, name) in enumerate(marks):
        end = marks[i + 1][0] if i + 1 < len(marks) else len(t)
        body = t[pos:end]
        if "setupCanvas" not in body:
            continue
        print(f"\n--- {name} ---")
        n = 0
        for ln in body.split("\n"):
            s = ln.strip()
            if not s or not KEEP.search(s):
                continue
            if not (COLOR.search(s) or "fillText" in s or "addColorStop" in s):
                continue
            if len(s) > 118:
                s = s[:118] + "…"
            print("   " + s)
            n += 1
            if n >= maxlines:
                print("   …（截断）")
                break
