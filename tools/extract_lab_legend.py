#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从每个实验的绘制代码里自动抽取 (颜色, 标签) 候选对，作为"迷你图例"的原始素材。

三种来源（按可信度排序）：
  A. 数据数组里"名称 + 颜色"成对出现，例：[["地球", "#3B7DD8"], ...] / {name:"地球", c:"#3B7DD8"}
  B. 同一个 fillStyle 之后紧跟着画的文字标签（中间没有再次改色）——标签就是用这个颜色写的
  C. 颜色出现在某个 arc/fillRect 之前 200 字符内、且能找到变量名注释的（弱信号，仅作参考）

输出 JSON 到 tools/_lab_legend_src.json，人工复核后再注入页面。
"""
import re, sys, json, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
IDS = ["copernicus","galileo","kepler","newton","faraday","darwin","pasteur","maxwell",
       "mendeleev","curie","einstein","bohr","turing","feynman","hawking"]
FN = re.compile(r"^\s*function (lab_?[A-Za-z_]+)\s*\(", re.M)
HEX = r"#[0-9A-Fa-f]{3,8}\b"
STR = r'"((?:[^"\\]|\\.)*)"'

PAIR_A1 = re.compile(r'[\[{]\s*' + STR + r'\s*,\s*"(' + HEX + r')"')          # ["名称","#hex"]
PAIR_A2 = re.compile(STR + r'\s*,"\s*(' + HEX + r')"')                        # "名称","#hex"
PAIR_A3 = re.compile(r'name\s*:\s*' + STR + r'[^}]{0,80}?(?:c|color)\s*:\s*"(' + HEX + r')"')
PAIR_A4 = re.compile(r'(?:c|color)\s*:\s*"(' + HEX + r')"[^}]{0,80}?name\s*:\s*' + STR)
B_PAIR = re.compile(r'fillStyle\s*=\s*"(' + HEX + r')"((?:(?!fillStyle)[\s\S]){0,320}?)fillText\(\s*' + STR)

result = {}
for sid in IDS:
    t = (ROOT / "scientists" / sid / "assets/js/site.js").read_text(encoding="utf-8")
    marks = [(m.start(), m.group(1)) for m in FN.finditer(t)]
    for i, (pos, name) in enumerate(marks):
        end = marks[i + 1][0] if i + 1 < len(marks) else len(t)
        body = t[pos:end]
        if "setupCanvas" not in body:
            continue
        pairs = []
        for m in PAIR_A1.finditer(body):
            pairs.append((m.group(2), m.group(1), "A"))
        for m in PAIR_A2.finditer(body):
            if (m.group(2), m.group(1), "A") not in pairs:
                pairs.append((m.group(2), m.group(1), "A"))
        for m in PAIR_A3.finditer(body):
            pairs.append((m.group(1), m.group(2), "A"))
        for m in PAIR_A4.finditer(body):
            pairs.append((m.group(1), m.group(2), "A"))
        for m in B_PAIR.finditer(body):
            pairs.append((m.group(1), m.group(3), "B"))
        # 去重（同色同标签）
        seen, uniq = set(), []
        for c, l, k in pairs:
            key = (c.lower(), l)
            if key in seen or len(l) > 22:
                continue
            seen.add(key); uniq.append({"color": c, "label": l, "src": k})
        result[f"{sid}/{name}"] = uniq

json.dump(result, open(ROOT / "tools/_lab_legend_src.json", "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)

only = [a for a in sys.argv[1:] if not a.startswith("-")]
tot = 0
for k, v in result.items():
    if only and not any(k.startswith(o) for o in only):
        continue
    tot += len(v)
    print(f"\n{k}  ({len(v)} 对)")
    for p in v[:10]:
        print(f"   [{p['src']}] {p['color']:>9}  {p['label']}")
print(f"\n合计 {tot} 对，已写入 tools/_lab_legend_src.json")
