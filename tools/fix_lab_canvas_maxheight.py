#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""P0 修复：移除 `.lab canvas` 的高度上限（max-height），消除画布纵向压扁。

背景
----
各子站 assets/js/site.js 的 setupCanvas(cv, ratio) 已经做完等比：
    w = cv.clientWidth;  h = Math.round(w * ratio);  cv.style.height = h + "px";
也就是说画布高度本来就是"按容器宽度等比算出来的"。
但 CSS 里 `.lab canvas` 上还挂了一条 `max-height: 320px / 360px`
（来自后加的"通用补丁"小节，同优先级下后出现者生效）。
CSS 的 max-height 优先级高于元素的行内 height（max-* 永远赢过 height，不管行内还是样式表），
于是当 w*ratio > max-height 时——高度被截断、宽度仍是 100% → 画面纵向被压扁。

实测（tools/probe_canvas_ratio.js）：
    390px 视口 0% ／ 1024px 21% ／ 1280px 24~31% ／ 1600px 31%
视口越宽越失真，恰好是课堂投影最常用的档位。
后果不只是难看：圆变扁椭圆（玻尔圆轨道 vs 开普勒椭圆的对比被抹平）、分布峰被压低、离心率被夸大。

修法（零 JS 改动）
------------------
删掉每条 `.lab canvas` 规则里的 max-height 声明即可。
画布高度由 setupCanvas 按容器宽度等比算得；容器最大宽度 --max-w: 1160px，
等比高度上限约 594px（ratio 最大 0.512），不会失控，因此不需要另设高度上限。

脚本幂等：已修过的文件再跑不会重复改。

用法：python3 tools/fix_lab_canvas_maxheight.py [--dry-run]
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
TARGETS = [ROOT / "assets/css/style.css"] + sorted(ROOT.glob("scientists/*/assets/css/style.css"))

# 只匹配"规则体内含 max-height"的 .lab canvas（[^}]*? 不能跨 } ，
# 所以不含 max-height 的那条基础规则不会被误伤，也不会波及 .tl-body figure img 的 280px。
RULE = re.compile(r"(\.lab canvas \{)([^}]*?)\s*max-height:\s*\d+px;(\s*\})")
NOTE = "  /* P0修复(2026-09-14)：删除 max-height —— 它会覆盖 setupCanvas 写入的等比行内高度、导致画布纵向压扁；详见 tools/labs-anim-review.html */"
MARK = "P0修复(2026-09-14)"


def main():
    dry = "--dry-run" in sys.argv
    changed = 0
    # 注意：必须"全量替换"而不是只换第一处。
    # 例：galileo 的基础规则带了 max-height:320px、后加的补丁规则又带 360px，
    # 同优先级下后者生效——只删第一处等于没修。
    for f in TARGETS:
        rel = f.relative_to(ROOT)
        if not f.exists():
            print(f"  · 跳过（文件不存在）  {rel}")
            continue
        src = f.read_text(encoding="utf-8")
        if MARK in src:
            print(f"  = 已修过，跳过        {rel}")
            continue
        hits = [m.group(0) for m in RULE.finditer(src)]
        out, n = RULE.subn(
            lambda m: m.group(1) + m.group(2).rstrip() + NOTE + m.group(3), src)
        if not n:
            print(f"  ? 未匹配 .lab canvas  {rel}")
            continue
        vals = ",".join(re.findall(r"max-height:\s*(\d+)px", "".join(hits)))
        if not dry:
            f.write_text(out, encoding="utf-8")
        changed += 1
        print(f"  {'(dry) ' if dry else '✓ '}{rel}  {n} 处规则，删 max-height: {vals}px")
    print(f"\n{'[dry-run] ' if dry else ''}共处理 {changed} 个文件（目标 {len(TARGETS)} 个）")
    return 0 if changed or dry else 1


if __name__ == "__main__":
    sys.exit(main())
