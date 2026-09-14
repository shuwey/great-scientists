#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""P2-2 ②：统一霍金站内三张画布的底色

现状：「走近黑洞」「光线经过黑洞」是深底 #0B1020，而「越小越热」是浅底 #FBFCFE
（只在正中画一个深色圆盘当黑洞）。学生在同一页里连续看到两种底色。
统一方向选**深底**：该站题材是太空 / 黑洞，深底更贴题，且改动面最小
（另一个方向要把两个深底实验里所有白色系描边、浅灰文字全部重配色）。

顺带把标尺字号 11px 提到 12.5px、把关键数值（黑洞质量）提到 15px/700 并提亮，
对应报告里"坐标刻度加粗、关键数值 ≥16px"的提级项。

用法：python3 tools/unify_hawking_canvas_bg.py [--rewrite]
"""
import sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
P = ROOT / "scientists/hawking/assets/js/site.js"

# 先做行级替换（用原文，含尚未改色的 #5c6b82）
LINE_EDITS = [
    # 「黑洞质量」是这一屏的关键数值：12px → 15px、浅灰 → 近白
    ('      ctx.fillStyle = "#5c6b82"; ctx.font = "600 12px -apple-system, sans-serif";\n'
     '      ctx.fillText("黑洞质量 = " + mass.toFixed(1) + "×", hx - 52, hy + rr + 62);',
     '      ctx.fillStyle = "#E8EDF5"; ctx.font = "700 15px -apple-system, sans-serif";\n'
     '      ctx.fillText("黑洞质量 = " + mass.toFixed(1) + "×", hx - 52, hy + rr + 62);'),
    # 坐标刻度（短波 / 长波）11px → 12.5px
    ('ctx.fillStyle = "#5c6b82"; ctx.font = "600 11px -apple-system, sans-serif";',
     'ctx.fillStyle = "#5c6b82"; ctx.font = "700 12.5px -apple-system, sans-serif";'),
]

# 再做全局改色（这些色值在本文件里只出现在 lab_temp 内，已逐个 count 确认）
GLOBAL_EDITS = [
    ('"#FBFCFE"', '"#0B1020"'),                     # 浅底 → 深底
    ('"#1B2530"', '"#E8EDF5"'),                     # 深色标题文字 → 近白
    ('"#5c6b82"', '"#AEB9CC"'),                     # 深灰说明文字 → 浅灰
    ('"#E03131"', '"#FF6B6B"'),                     # 峰值标记/虚线：深红 → 亮红（深底上才够醒目）
    ('"#B26A00"', '"#FFC078"'),                     # 引线：暗棕 → 亮橙
    ('"#EDF0F6"', '"rgba(255,255,255,0.10)"'),      # 网格线
    ('"#9AA7BE"', '"rgba(255,255,255,0.34)"'),      # 坐标轴
]


def main():
    apply = "--rewrite" in sys.argv
    t = P.read_text(encoding="utf-8")
    orig = t
    rep = []
    for old, new in LINE_EDITS + GLOBAL_EDITS:
        n = t.count(old)
        if n == 0:
            rep.append(f"  未命中：{old[:52]}")
            continue
        t = t.replace(old, new)
        rep.append(f"  {n} 处 ×  {old[:46]}")
    for r in rep:
        print(r)
    if t == orig:
        print("无改动（可能已执行过）")
        return
    if apply:
        P.write_text(t, encoding="utf-8")
        print(f"已写入 {P.relative_to(ROOT)}")
    else:
        print("dry-run，未落盘（加 --rewrite 落盘）")


if __name__ == "__main__":
    main()
