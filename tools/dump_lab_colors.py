#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""列出每个实验函数里用到的颜色字面量及其出现次数（源码侧视图）。
与 probe_lab_palette.js 的"渲染侧实测"互为对照：写迷你图例时以实测色为准。"""
import re, sys, pathlib, collections

ROOT = pathlib.Path(__file__).resolve().parent.parent
IDS = ["copernicus","galileo","kepler","newton","faraday","darwin","pasteur","maxwell",
       "mendeleev","curie","einstein","bohr","turing","feynman","hawking"]
FN = re.compile(r"^\s*function (lab_?[A-Za-z_]+)\s*\(", re.M)
COL = re.compile(r"#[0-9A-Fa-f]{3,8}\b|rgba?\([0-9]{1,3}\s*,\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}[^)]*\)")

only = sys.argv[1] if len(sys.argv) > 1 else None
for sid in IDS:
    if only and sid != only:
        continue
    p = ROOT / "scientists" / sid / "assets/js/site.js"
    t = p.read_text(encoding="utf-8")
    marks = [(m.start(), m.group(1)) for m in FN.finditer(t)]
    print(f"\n===== {sid} =====")
    for i, (pos, name) in enumerate(marks):
        end = marks[i + 1][0] if i + 1 < len(marks) else len(t)
        body = t[pos:end]
        if "setupCanvas" not in body:
            continue                      # 不是画布实验
        c = collections.Counter(COL.findall(body))
        items = [f"{k}×{v}" for k, v in c.most_common(12)]
        print(f"  {name}: " + " ".join(items))
        # 画布上已有的文字标签（用来确认"这个颜色画的是什么"，避免写错图例）
        txt = [re.sub(r"\s+", " ", s) for s in
               re.findall(r'fillText\(\s*"((?:[^"\\]|\\.)*)"', body)]
        if txt:
            seen, uniq = set(), []
            for s in txt:
                if s not in seen and s:
                    seen.add(s); uniq.append(s)
            print("      标签: " + " / ".join(uniq[:10]))
