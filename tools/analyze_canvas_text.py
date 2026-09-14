#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""分析 probe_canvas_text_contrast.js 的像素实测结果（_measured.json）。

每条标签的对比度是"区域实测最大对比度 crMax"——
即在文字包围盒内，除去众数底色外能达到的最大对比度，也就是这行字在屏幕上
真实画出来的墨水对比度。不做任何"文字色 vs 猜的底色"的静态推断。

用法：python tools/analyze_canvas_text.py [--fail-only] [--station id] [--by-color]
"""
import json
import pathlib
import sys
from collections import defaultdict

SRC = pathlib.Path("/Users/shuwei/WorkBuddy/读懂牛顿-验证产物/labs-contrast/_measured.json")
CN = {"bohr": "玻尔", "copernicus": "哥白尼", "curie": "居里夫人", "darwin": "达尔文",
      "einstein": "爱因斯坦", "faraday": "法拉第", "feynman": "费曼", "galileo": "伽利略",
      "hawking": "霍金", "kepler": "开普勒", "maxwell": "麦克斯韦", "mendeleev": "门捷列夫",
      "newton": "牛顿", "pasteur": "巴斯德", "turing": "图灵"}


def main():
    fail_only = "--fail-only" in sys.argv
    by_color = "--by-color" in sys.argv
    only = sys.argv[sys.argv.index("--station") + 1] if "--station" in sys.argv else None

    rows = [r for r in json.loads(SRC.read_text("utf-8")) if not only or r["st"] == only]

    # 同一标签会被反复绘制（图形在动），按 站/实验/文本/文字色 聚合取最差
    g = {}
    for r in rows:
        key = (r["st"], r["lab"], r["text"], r["decl"])
        e = g.get(key)
        if e is None:
            g[key] = dict(r, n=1)
        else:
            e["n"] += 1
            if r["crMax"] < e["crMax"]:
                e.update(r, n=e["n"])
    agg = sorted(g.values(), key=lambda x: x["crMax"])

    fail = [r for r in agg if r["crMax"] < 3.0]
    warn = [r for r in agg if 3.0 <= r["crMax"] < 4.5]

    print(f"实测标签 {len(agg)} 条（原始绘制 {len(rows)} 条）")
    print(f"🔴 实测对比度 <3.0（连大字标准都不达标）：{len(fail)} 条")
    print(f"🟡 实测对比度 3.0–4.5（正文不达标，大字勉强）：{len(warn)} 条")
    print(f"✅ ≥4.5：{len(agg) - len(fail) - len(warn)} 条\n")

    if fail:
        print("=== 🔴 实测不合格 ===")
        for r in fail:
            print(f"  {CN.get(r['st'], r['st']):<5}{r['lab']:<11} cr={r['crMax']:4.2f}  "
                  f"文字色 {str(r['decl']):<26} 实测底色 rgb{tuple(r['bg'])}  "
                  f"屏显{r['screen']:.1f}px  「{r['text'][:34]}」")

    if by_color:
        print("\n=== 按「文字色」归并（找出系统性元凶）===")
        c = defaultdict(lambda: [0, 9e9, []])
        for r in agg:
            e = c[str(r["decl"])]
            e[0] += 1
            e[1] = min(e[1], r["crMax"])
            e[2].append(f"{CN.get(r['st'], r['st'])}/{r['lab']}")
        for col, (n, worst, where) in sorted(c.items(), key=lambda kv: kv[1][1]):
            flag = "🔴" if worst < 3 else ("🟡" if worst < 4.5 else "✅")
            print(f"  {flag} {col:<28} 最差 {worst:4.2f}  用于 {n:>3} 条标签  例：{', '.join(sorted(set(where))[:3])}")

    if warn and not fail_only:
        print(f"\n=== 🟡 偏低（{len(warn)} 条，列前 30）===")
        for r in warn[:30]:
            print(f"  {CN.get(r['st'], r['st']):<5}{r['lab']:<11} cr={r['crMax']:4.2f}  "
                  f"文字色 {str(r['decl']):<26} 屏显{r['screen']:.1f}px  「{r['text'][:30]}」")

    print("\n=== 屏幕真实字号分布（逻辑 px × ctx 缩放系数）===")
    f = defaultdict(int)
    ex = {}
    for r in agg:
        kk = round(r["screen"], 1)
        f[kk] += 1
        ex.setdefault(kk, r)
    for kk in sorted(f):
        mark = "🔴" if kk < 10 else ("🟡" if kk < 12 else "✅")
        e = ex[kk]
        print(f"  {mark} {kk:>5.1f}px ×{f[kk]:<4} 例：{CN.get(e['st'], e['st'])}/{e['lab']}")
    print(f"\n低于 12px 的档位：{sorted(k for k in f if k < 12)}")


if __name__ == "__main__":
    main()
