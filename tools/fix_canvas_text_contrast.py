#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""P1-1 修复：画布内、压在浅底上的"过浅文字色"统一压深到已合格的次级灰。

为什么必须按位置改、不能全局替换：
  像 #8b96aa 这类颜色同时用于"图形描边/填色"（网格线、卫星球体）与"文字"，
  全局替换会把图形也改色。本脚本按"实测结果 → 代码位置"定位，只改
  那些**确实在给文字上色**的 fillStyle 赋值。

判定一个赋值是"给文字上色"：从该 fillStyle 赋值到下一次 fillStyle 赋值之间，
第一次出现的绘制调用必须是 fillText（若先出现图形调用则视为图形用途，跳过）。

用法：
  python tools/fix_canvas_text_contrast.py            # 干跑，列出将要改的点
  python tools/fix_canvas_text_contrast.py --apply    # 真正写入
"""
import json
import pathlib
import re
import sys
from collections import defaultdict

BASE = pathlib.Path("/Users/shuwei/WorkBuddy/读懂牛顿")
MEASURED = pathlib.Path("/Users/shuwei/WorkBuddy/读懂牛顿-验证产物/labs-contrast/_measured.json")

# 过浅的"次级灰" → 站内已有的合格次级灰（实测 4.62:1）
GREY_MAP = {
    "#b0bac9": "#5c6b82",   # 实测 1.87
    "#8b96aa": "#5c6b82",   # 实测 2.42
    "#9aa7be": "#5c6b82",   # 实测 2.43
    "#c7d0de": "#5c6b82",   # 实测 1.52
    "#868e96": "#5c6b82",   # 实测 3.31
    # 半透明红压浅粉底，实测 2.82；同为"说明性文字"，改为站内已有的实心红
    "rgba(224, 49, 49, 0.7)": "#c92a2a",
}
# 站内特例：黄/橙字压在浅底上，几乎不可见 → 深橙（站内 #c1440e 实测 5.02）
# 用 (站, 原色) 作键，仍然只作用于"给文字上色"的那次赋值，不动图形
STATION_MAP = {
    ("faraday", "#ffd43b"): "#c1440e",   # 实测 1.39
    ("newton", "#f59f00"): "#c1440e",    # 实测 2.12
}
THRESHOLD = 4.5

ASSIGN = re.compile(r'fillStyle\s*=\s*["\']([^"\']+)["\']')
# 只匹配位置即可：刻度标签常写成 fillText(i + "h", …)，第一个参数不是字符串字面量。
# 早先按"字面文本"匹配会漏掉这一大片，是第二轮的漏改原因。
TEXT = re.compile(r"fillText\s*\(")
LITERAL = re.compile(r'fillText\s*\(\s*["\'](.*?)["\']')
SHAPE = re.compile(r"\bfillRect\s*\(|\bfill\s*\(\s*\)|\bstroke\s*\(|\barc\s*\(|\bmoveTo\s*\(|\blineTo\s*\(|\bsetLineDash\s*\(")
# 实验函数命名两种风格并存：lab_shells（下划线，12 站）与 labTime/labPrism（驼峰，einstein/galileo/newton）。
# 只认下划线会漏掉后三站——这是第三轮的漏改原因。
LABFN = re.compile(r"function\s+(lab_?[A-Za-z]\w*)\s*\(")


def lab_key(fn_name):
    s = fn_name[3:] if fn_name[:3].lower() == "lab" else fn_name
    return s.lstrip("_").lower()


def main():
    apply = "--apply" in sys.argv
    measured = json.loads(MEASURED.read_text("utf-8"))

    # 需要修的"文字色"：(站, 实验) -> 实测不达标的颜色集合
    # 注意：不能按"字面文本"匹配——坐标轴刻度这类标签的文字是变量（fillText(i, …)），
    # 按文本匹配会漏掉一大片。按颜色匹配 + "只改给文字上色的那次赋值" 双重约束即可安全。
    need_color = defaultdict(set)
    for r in measured:
        if r["crMax"] < THRESHOLD:
            need_color[(r["st"], r["lab"])].add(str(r["decl"]).strip().lower())

    files = sorted(BASE.glob("scientists/*/assets/js/site.js"))
    plan = []
    for f in files:
        st = f.parts[f.parts.index("scientists") + 1]
        s = f.read_text("utf-8")
        assigns = [(m.start(), m.end(), m.group(1).strip().lower()) for m in ASSIGN.finditer(s)]
        labfns = [(m.start(), lab_key(m.group(1))) for m in LABFN.finditer(s)]
        texts = [m.start() for m in TEXT.finditer(s)]
        lits = {m.start(): m.group(1) for m in LITERAL.finditer(s)}

        def lit_of(pos):
            line = s[pos:s.find("\n", pos)] if s.find("\n", pos) > 0 else s[pos:]
            m = re.search(r'fillText\s*\(\s*["\'](.*?)["\']', line)
            return m.group(1) if m else "(变量标签)"

        def lab_of(pos):
            cur = None
            for p, n in labfns:
                if p < pos:
                    cur = n
                else:
                    break
            return cur

        for i, (a0, a1, col) in enumerate(assigns):
            new = GREY_MAP.get(col) or STATION_MAP.get((st, col))
            if not new:
                continue
            nxt = assigns[i + 1][0] if i + 1 < len(assigns) else len(s)
            seg = s[a1:nxt]
            t_hits = [p for p in texts if a1 <= p < nxt]
            if not t_hits:
                continue
            sm = SHAPE.search(seg)
            first_t = seg.find("fillText")
            if sm and sm.start() < first_t:
                continue                                  # 先画图形 → 这段色是给图形的
            lab = lab_of(a0)
            if not lab or col not in need_color.get((st, lab), ()):
                continue
            plan.append((f, st, lab, col, new, a0, a1, [lit_of(p) for p in t_hits[:3]], len(t_hits)))

    # 单点特例已并入 STATION_MAP，走同一套"只改给文字上色的那次赋值"判定

    print(f"共 {len(plan)} 处待改（阈值 crMax < {THRESHOLD}）\n")
    by_file = defaultdict(list)
    for p in plan:
        by_file[p[0]].append(p)

    for f, items in by_file.items():
        print(f"── {f.relative_to(BASE)}  （{len(items)} 处）")
        for _, st, lab, col, new, a0, a1, got, n in items:
            print(f"     {lab:<11} {col} → {new}   {n} 条文字，例：{got}")

    if not apply:
        print("\n（干跑，未写入。加 --apply 生效）")
        return

    for f, items in by_file.items():
        s = f.read_text("utf-8")
        # 从后往前替换，避免位置漂移
        for _, st, lab, col, new, a0, a1, got, n in sorted(items, key=lambda x: -x[5]):
            s = s[:a0] + f'fillStyle = "{new}"' + s[a1:]
        f.write_text(s, encoding="utf-8")
    print(f"\n✅ 已写入 {len(by_file)} 个文件、{len(plan)} 处")


if __name__ == "__main__":
    main()
