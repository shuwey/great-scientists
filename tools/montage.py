# -*- coding: utf-8 -*-
"""把某个站点三个实验的截图拼成一张联系表，方便一眼看构图问题。

用法：python3 tools/montage.py darwin [state]
     state 默认 c（滑块最大值），可选 a/b/c
产出：<项目外的验证产物目录>/montage_<site>_<state>.png
     （默认 ../读懂牛顿-验证产物/shots，可用 SHOTS_DIR 覆盖）
"""
import os
import sys
from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
# 截图目录默认放在项目**外**（不参与静态发布上传）
SHOTS = os.environ.get("SHOTS_DIR") or os.path.join(os.path.dirname(ROOT), "读懂牛顿-验证产物", "shots")
NEW = os.path.join(SHOTS, "new")


def main():
    site = sys.argv[1]
    state = sys.argv[2] if len(sys.argv) > 2 else "c"
    kinds = ["population", "selection", "tree", "induction", "lines", "ac",
             "path", "interfere", "dist", "bh", "orbit", "temp",
             "field", "wave", "speed", "grid", "trend", "fill",
             "colony", "heat", "spread", "turing", "signal", "rays",
             "purify", "decay", "solar", "retro", "parallax",
             "ellipse", "areal", "third", "shells", "levels", "linesH"]
    shots = []
    for k in kinds:
        p = os.path.join(NEW, "%s_%s_%s.png" % (site, k, state))
        if os.path.isfile(p):
            shots.append((k, p))
    if not shots:
        print("没有找到截图：%s_*_%s.png" % (site, state))
        return
    ims = [(k, Image.open(p).convert("RGB")) for k, p in shots]
    w = max(im.width for _, im in ims)
    pad = 14
    total_h = sum(im.height + 26 + pad for _, im in ims)
    canvas = Image.new("RGB", (w + pad * 2, total_h + pad), (245, 247, 250))
    d = ImageDraw.Draw(canvas)
    y = pad
    for k, im in ims:
        d.text((pad + 4, y + 4), "%s / %s" % (site, k), fill=(20, 26, 40))
        y += 24
        canvas.paste(im, (pad, y))
        y += im.height + pad
    out = os.path.join(SHOTS, "montage_%s_%s.png" % (site, state))
    canvas.save(out)
    print("已写出", out, canvas.size)


if __name__ == "__main__":
    main()
