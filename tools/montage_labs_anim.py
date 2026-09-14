#!/usr/bin/env python3
"""玩一玩动画审计 · 接触印相（contact sheet）拼图

把 audit_labs_animation.js 产出的逐实验三帧，按站拼成一张 "实验 × 帧" 网格图，
便于一眼看出「初始 / 静置后 / 滑块拨到底」三态到底有没有变化。

用法：
    python3 tools/montage_labs_anim.py            # 全部站
    python3 tools/montage_labs_anim.py kepler     # 指定站

输入：<SHOTS_DIR>/labs-anim/<station>_<lab>_{t0,t1,hi,btn}.png + <station>.json
输出：<SHOTS_DIR>/labs-anim/montage_<station>.png
"""
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
OUT = os.environ.get("SHOTS_DIR")
OUT = os.path.join(OUT, "labs-anim") if OUT else os.path.join(ROOT, "..", "读懂牛顿-验证产物", "labs-anim")

FRAMES = [("t0", "初始状态"), ("t1", "静置 ~0.9s 后"), ("hi", "第一根滑块拨到最大"), ("btn", "点按钮后")]
LABEL_H = 26
PAD = 8


def font(sz):
    for p in ("/System/Library/Fonts/Supplemental/Songti.ttc",
              "/System/Library/Fonts/PingFang.ttc",
              "/System/Library/Fonts/Helvetica.ttc"):
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, sz)
            except Exception:
                pass
    return ImageFont.load_default()


def build(station):
    jf = os.path.join(OUT, f"{station}.json")
    if not os.path.exists(jf):
        print(f"  跳过 {station}：无 {station}.json")
        return None
    data = json.load(open(jf, encoding="utf-8"))
    labs = data.get("labs", [])
    rows = []
    for lab in labs:
        key = lab.get("dataLab")
        cells = []
        for tag, _ in FRAMES:
            p = os.path.join(OUT, f"{station}_{key}_{tag}.png")
            cells.append((tag, p if os.path.exists(p) else None))
        if any(c[1] for c in cells):
            rows.append((key, lab, cells))
    if not rows:
        return None

    # 统一单元格尺寸：取所有帧里最大的，缩放到统一宽度
    CW, CH = 400, 240
    cols = [c for c in FRAMES if any(any(t == c[0] and p for t, p in r[2]) for r in rows)]
    W = PAD + len(cols) * (CW + PAD)
    H = PAD + len(rows) * (LABEL_H + CH + PAD) + 30
    sheet = Image.new("RGB", (W, H), (250, 251, 253))
    d = ImageDraw.Draw(sheet)
    f_head = font(15)
    f_cell = font(13)
    d.text((PAD, 6), f"{station} · 玩一玩动画三态对照（每格为同一 canvas 的不同时刻/状态）", fill=(20, 25, 35), font=f_head)

    for ci, (tag, cname) in enumerate(cols):
        x = PAD + ci * (CW + PAD)
        d.text((x + 4, 26), cname, fill=(60, 70, 85), font=f_cell)

    for ri, (key, lab, cells) in enumerate(rows):
        y0 = 30 + PAD + ri * (LABEL_H + CH + PAD)
        auto = lab.get("autoMotion", {}).get("d02", 0)
        bm = lab.get("buttonMotion")
        head = f"{lab.get('h4') or key}  [{key}]   自走Δ={auto}"
        if bm:
            head += f"  按钮「{bm.get('label')}」Δ={bm.get('d03')}"
        d.text((PAD, y0 - 18), head, fill=(30, 40, 55), font=f_cell)
        for ci, (tag, _) in enumerate(cols):
            p = dict(cells).get(tag)
            x = PAD + ci * (CW + PAD)
            box = Image.new("RGB", (CW, CH), (235, 238, 243))
            if p:
                im = Image.open(p).convert("RGB")
                im.thumbnail((CW - 2, CH - 2), Image.LANCZOS)
                box.paste(im, ((CW - im.width) // 2, (CH - im.height) // 2))
            else:
                ImageDraw.Draw(box).text((10, 10), "（无此状态）", fill=(150, 155, 165), font=f_cell)
            sheet.paste(box, (x, y0))
            d.rectangle([x, y0, x + CW, y0 + CH], outline=(205, 212, 222))
    out = os.path.join(OUT, f"montage_{station}.png")
    sheet.save(out, "PNG", optimize=True)
    print(f"  ✅ {out}  ({sheet.width}×{sheet.height}, {len(rows)} 实验 × {len(cols)} 态)")
    return out


if __name__ == "__main__":
    stations = sys.argv[1:] or sorted(
        f[:-5] for f in os.listdir(OUT) if f.endswith(".json") and not f.startswith("_")
    )
    for s in stations:
        build(s)
