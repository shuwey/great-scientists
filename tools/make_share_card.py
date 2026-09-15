#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成门户首页分享卡（Open Graph 封面）1200x630。

设计：深色渐变底 + 双色微光，左侧主标题/副标题/学科色点缀条，
右侧 5x3 排满 15 位科学家头像（每颗带学科色描边，呼应门户「图标桌面」）。
复用 assets/img/homepage/ 下已统一影调 C 的 15 张 webp 头像。

输出：assets/img/homepage/og-cover.png 与 og-cover.jpg（取较小者作 og:image）。
"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = "/Users/shuwei/WorkBuddy/读懂牛顿"
ICON_DIR = os.path.join(ROOT, "assets/img/homepage")
OUT_PNG = os.path.join(ICON_DIR, "og-cover.png")
OUT_JPG = os.path.join(ICON_DIR, "og-cover.jpg")

W, H = 1200, 630
BG = (14, 18, 25)        # #0E1219 门户首屏底
BG2 = (19, 27, 40)       # 略亮，做纵向渐变
INK = (255, 255, 255)
MUTED = (199, 208, 220)  # #C7D0DC
FAINT = (126, 139, 156)  # #7E8B9C
KICK = (154, 167, 184)   # #9AA7B8

DISC = {
    "astro": (59, 91, 219),    # #3B5BDB
    "phys": (18, 184, 134),    # #12B886
    "life": (55, 178, 77),     # #37B24D
    "chem": (245, 159, 0),     # #F59F00
    "modern": (121, 80, 242),  # #7950F2
    "comp": (16, 152, 173),    # #1098AD
}
ORDER = [
    ("01-copernicus.webp", "astro"), ("02-galileo.webp", "astro"),
    ("03-kepler.webp", "astro"),     ("04-newton.webp", "phys"),
    ("05-faraday.webp", "phys"),     ("06-darwin.webp", "life"),
    ("07-pasteur.webp", "life"),     ("08-maxwell.webp", "phys"),
    ("09-mendeleev.webp", "chem"),   ("10-curie.webp", "chem"),
    ("11-einstein.webp", "modern"),  ("12-bohr.webp", "modern"),
    ("13-turing.webp", "comp"),      ("14-feynman.webp", "modern"),
    ("15-hawking.webp", "modern"),
]

FONT_TITLE = "/System/Library/Fonts/STHeiti Medium.ttc"
FONT_BODY = "/System/Library/Fonts/Hiragino Sans GB.ttc"


def vgrad(w, h, c1, c2):
    base = Image.new("RGB", (w, h), c1)
    top = Image.new("RGB", (w, h), c2)
    grad = Image.new("L", (1, h))
    px = grad.load()
    for y in range(h):
        px[0, y] = int(255 * (1 - y / (h - 1)))
    base.paste(top, (0, 0), grad.resize((w, h)))
    return base


def radial_glow(w, h, cx, cy, radius, color, maxa):
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(layer).ellipse(
        [cx - radius, cy - radius, cx + radius, cy + radius], fill=color + (255,))
    layer = layer.filter(ImageFilter.GaussianBlur(radius * 0.6))
    r, g, b, a = layer.split()
    a = a.point(lambda p: int(p * maxa / 255))
    return Image.merge("RGBA", (r, g, b, a))


def circle_avatar(src, size, ring_color):
    im = Image.open(src).convert("RGBA").resize((size, size), Image.LANCZOS)
    r = int(size * 0.22)
    m = Image.new("L", (size, size), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=255)
    im.putalpha(m)
    ring = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(ring).rounded_rectangle(
        [0, 0, size - 1, size - 1], radius=r, outline=ring_color + (255,), width=4)
    return Image.alpha_composite(im, ring)


def main():
    img = vgrad(W, H, BG, BG2)
    g1 = radial_glow(W, H, W - 160, -120, 520, DISC["modern"], 70)
    g2 = radial_glow(W, H, 40, H + 120, 520, DISC["phys"], 45)
    img = Image.alpha_composite(img.convert("RGBA"), g1)
    img = Image.alpha_composite(img, g2).convert("RGB")
    draw = ImageDraw.Draw(img)

    PX = 64
    draw.text((PX, 196), "读懂科学家", font=ImageFont.truetype(FONT_BODY, 26), fill=KICK)
    # 学科色点缀条
    bar_x, bar_y, bar_w, bar_h = PX, 236, 72, 6
    colors = list(DISC.values())
    for i in range(6):
        x0 = bar_x + i * (bar_w // 6)
        draw.rectangle([x0, bar_y, x0 + bar_w // 6, bar_y + bar_h], fill=colors[i])
    draw.text((PX, 258), "影响世界的15个科学家",
              font=ImageFont.truetype(FONT_TITLE, 52), fill=INK)
    draw.text((PX, 348), "一个把天才讲成人话的科普系列",
              font=ImageFont.truetype(FONT_BODY, 30), fill=MUTED)
    draw.text((PX, 410), "哥白尼 → 霍金 · 按时间顺序读懂 15 位科学巨匠",
              font=ImageFont.truetype(FONT_BODY, 22), fill=FAINT)

    cols, rows = 5, 3
    cell, gap = 92, 18
    grid_w = cols * cell + (cols - 1) * gap
    grid_h = rows * cell + (rows - 1) * gap
    gx = W - 64 - grid_w
    gy = int((H - grid_h) / 2)
    for idx, (fname, disc) in enumerate(ORDER):
        r, c = divmod(idx, cols)
        x = gx + c * (cell + gap)
        y = gy + r * (cell + gap)
        av = circle_avatar(os.path.join(ICON_DIR, fname), cell, DISC[disc])
        img.paste(av, (x, y), av)

    img.save(OUT_PNG, optimize=True)
    img.save(OUT_JPG, "JPEG", quality=90)
    print("PNG %d bytes -> %s" % (os.path.getsize(OUT_PNG), OUT_PNG))
    print("JPG %d bytes -> %s" % (os.path.getsize(OUT_JPG), OUT_JPG))


if __name__ == "__main__":
    main()
