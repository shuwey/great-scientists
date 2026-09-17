#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""读懂科学家 · 小程序 tabBar 图标生成器

为什么要单独生成：小程序 **tabBar 的 icon 不支持 SVG**（只吃 PNG），
而静态站的图标资产全是 SVG。所以这里用 PIL 重绘一套 81×81 的 PNG，
配色走静态站的设计令牌（未选中 c-gray-400，选中 brand 靛蓝）。

线稿风格与静态站一致：圆角端点 + 细线，不用实心块。

用法（需要 PIL，用托管 venv）：
    /Users/shuwei/.workbuddy/binaries/python/envs/default/bin/python \
        tools/make_miniapp_tabbar.py
"""

import os

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "miniapp", "assets", "tabbar")

SIZE = 81
OFF = "#888780"   # 未选中（c-gray 400）
ON = "#3B5BDB"    # 选中（--brand）


def new_canvas():
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    return img, ImageDraw.Draw(img)


def draw_portal(d, c):
    """门户：2×2 图标网格（对应首页的图标桌面）。"""
    w = 5
    for x in (11, 45):
        for y in (11, 45):
            d.rounded_rectangle([x, y, x + 25, y + 25], radius=7, outline=c, width=w)


def draw_glossary(d, c):
    """词典：放大镜。"""
    d.ellipse([12, 12, 54, 54], outline=c, width=6)
    d.line([(51, 51), (68, 68)], fill=c, width=7)


def draw_labs(d, c):
    """实验室：摆锤（静态站 labs 的经典演示）。"""
    d.line([(22, 13), (59, 13)], fill=c, width=5)
    d.line([(40, 13), (40, 50)], fill=c, width=5)
    d.ellipse([26, 47, 54, 75], outline=c, width=6)


def draw_profile(d, c):
    """我的：人像。"""
    d.ellipse([27, 12, 53, 38], outline=c, width=6)
    d.arc([15, 43, 65, 93], start=196, end=344, fill=c, width=6)


ICONS = {
    "portal": draw_portal,
    "glossary": draw_glossary,
    "labs": draw_labs,
    "profile": draw_profile,
}


def main():
    os.makedirs(OUT, exist_ok=True)
    written = []
    for name, fn in ICONS.items():
        for suffix, color in ((".png", OFF), ("-on.png", ON)):
            img, d = new_canvas()
            fn(d, color)
            path = os.path.join(OUT, name + suffix)
            img.save(path, "PNG", optimize=True)
            written.append((os.path.basename(path), os.path.getsize(path)))
    for n, s in written:
        print("  %-16s %5d B" % (n, s))
    print("共 %d 个文件 -> %s" % (len(written), os.path.relpath(OUT, ROOT)))


if __name__ == "__main__":
    main()
