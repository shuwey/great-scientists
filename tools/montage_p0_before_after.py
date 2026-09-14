#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 P0 修复的 before/after 截图拼成一张对照图（左=修复前，右=修复后）。

用法：python3 tools/montage_p0_before_after.py
产物：<OUT>/p0_compare.png
"""
import pathlib
from PIL import Image, ImageDraw, ImageFont

OUT = pathlib.Path("/Users/shuwei/WorkBuddy/读懂牛顿-验证产物/labs-anim/p0")
CELL_W = 620                      # 每格宽度
ROWS = [("bohr", 1, "玻尔·电子壳层（圆轨道）"),
        ("kepler", 1, "开普勒·椭圆轨道"),
        ("galileo", 3, "伽利略·单摆"),
        ("copernicus", 1, "哥白尼·日心模型"),
        ("curie", 1, "居里夫人·辐射射线")]
FONT = "/System/Library/Fonts/PingFang.ttc"


def font(sz, bold=False):
    try:
        return ImageFont.truetype(FONT, sz, index=1 if bold else 0)
    except Exception:
        try:
            return ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", sz)
        except Exception:
            return ImageFont.load_default()


def load(stage, sid, n):
    p = OUT / f"p0_{stage}_{sid}-{n}.png"
    im = Image.open(p).convert("RGB")
    h = round(im.height * CELL_W / im.width)
    return im.resize((CELL_W, h), Image.LANCZOS)


def main():
    cells = [(load("before", s, n), load("after", s, n), label) for s, n, label in ROWS]
    pad, hdr, gap = 18, 34, 14
    row_h = [max(b.height, a.height) for b, a, _ in cells]
    W = pad * 3 + CELL_W * 2
    H = hdr + sum(r + hdr for r in row_h) + pad
    cv = Image.new("RGB", (W, H), "#FFFFFF")
    d = ImageDraw.Draw(cv)
    d.text((pad, 6), "P0 修复对照：左＝修复前（纵向被压扁）　右＝修复后（等比还原）  视口 1600px",
           fill="#111827", font=font(15, True))
    y = hdr
    for (b, a, label), rh in zip(cells, row_h):
        d.text((pad, y + 4), label, fill="#374151", font=font(13, True))
        yy = y + hdr
        cv.paste(b, (pad, yy))
        cv.paste(a, (pad * 2 + CELL_W, yy))
        for x, tag, col in ((pad, "修复前", "#B91C1C"), (pad * 2 + CELL_W, "修复后", "#15803D")):
            d.rectangle([x, yy, x + 56, yy + 20], fill="#FFFFFF", outline=col)
            d.text((x + 8, yy + 3), tag, fill=col, font=font(12, True))
        d.rectangle([pad, yy, pad + CELL_W * 2 + pad, yy + rh], outline="#D1D5DB")
        y = yy + rh + gap
    cv.save(OUT / "p0_compare.png", optimize=True)
    print(f"✅ {OUT / 'p0_compare.png'}  {cv.width}×{cv.height}")


if __name__ == "__main__":
    main()
