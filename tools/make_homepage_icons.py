# -*- coding: utf-8 -*-
"""把「影调 C 方案」的 15 张方图标（512²，去色 + 暖灰 + 暗角）转成门户首页可直接用的资产。

- 源：../读懂牛顿-验证产物/shots/tone/processed-C/NN-<id>.png（项目外，只读）
- 出：assets/img/homepage/NN-<id>.webp（264² = 132px 显示尺寸的 2x）
- 只做等比缩放 + 重采样，**不重新调色**（影调已在源里烤好；若重跑影调，必须重跑本脚本）
- 幂等：可重复运行，结果一致

为什么不叫 -portrait：门户首页图标是「已烤好影调」的成品，若文件名含 -portrait
会被 site.css 的 img[src*="-portrait"] 规则再套一次滤镜，等于重复处理。
"""
import pathlib, sys
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = pathlib.Path("/Users/shuwei/WorkBuddy/读懂牛顿-验证产物/shots/tone/processed-C")
DST = ROOT / "assets" / "img" / "homepage"
SIZE = 264          # 132px 显示尺寸 @2x
QUALITY = 90

IDS = ["copernicus", "galileo", "kepler", "newton", "faraday", "darwin", "pasteur",
       "maxwell", "mendeleev", "curie", "einstein", "bohr", "turing", "feynman", "hawking"]

def main() -> int:
    if not SRC.is_dir():
        print("找不到源目录:", SRC)
        return 1
    DST.mkdir(parents=True, exist_ok=True)
    total = 0
    made = 0
    for i, sid in enumerate(IDS, 1):
        src = SRC / f"{i:02d}-{sid}.png"
        if not src.exists():
            print("  缺失:", src.name)
            return 1
        im = Image.open(src).convert("RGB")
        if im.size != (SIZE, SIZE):
            im = im.resize((SIZE, SIZE), Image.LANCZOS)
        out = DST / f"{i:02d}-{sid}.webp"
        # 先写到临时名再替换，避免半截文件被下一次读到
        tmp = out.with_suffix(".webp.tmp")
        im.save(tmp, "WEBP", quality=QUALITY, method=6)
        tmp.replace(out)
        kb = out.stat().st_size / 1024
        total += kb
        made += 1
        print(f"  {out.name:<22} {SIZE}×{SIZE}  {kb:6.1f} KB")
    print(f"\n共 {made} 张，合计 {total / 1024:.2f} MB，目录 {DST}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
