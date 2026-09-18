#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""读懂科学家 · 小程序历史照片压缩备料（上云前的最后一步准备）

为什么要有这一步：时间轴上的历史照片是这一版小程序的"脸面"，但原图合计约 29 MB，
主包 2 MB 的硬上限一张都装不下；个人主体又没法给外部域名做 ICP 备案，
所以只能走云存储。云存储按流量与容量计费，先压一道是必须的。

本脚本只做**压 + 量**，不做上传：
  · 压：JPG/PNG → WebP（最长边上限 828px，q=76），肉眼几乎无损，体积通常降到 1/4
  · 量：算出上云后的真实体积，给"要不要付费扩容"提供数字
  · 幂等：已存在且不旧于源文件的产物直接跳过

产物落在**项目目录之外**（../读懂牛顿-验证产物/miniapp-photos/），
不会被打进小程序包，也不会跟着静态站发布。

真正上传（需要云环境就绪后执行，二选一）：
  A. 微信开发者工具 → 云开发 → 存储 → 按 sid 目录整体上传
  B. tcb CLI：tcb storage upload <本地目录> <云端目录> -e <envId>
上传后把 fileID 写进 tools/miniapp_cloud_images.json：
  { "<sid>/<相对子站根的路径>": "cloud://<env>.<bucket>/<path>" }
再跑一次 tools/build_miniapp_page_assets.py，照片就自动点亮（页面代码无需改）。

用法：
    python3 tools/stage_miniapp_photos.py [--quality 76] [--max-width 828]
"""

import json
import os
import sys
import time

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PENDING = os.path.join(ROOT, "tools", "miniapp_pending_photos.json")
OUT_DIR = os.path.abspath(os.path.join(ROOT, "..", "读懂牛顿-验证产物", "miniapp-photos"))
REPORT = os.path.join(ROOT, "tools", "miniapp_photo_staging_report.json")


def arg(name, default):
    if name in sys.argv:
        return type(default)(sys.argv[sys.argv.index(name) + 1])
    return default


QUALITY = arg("--quality", 76)
MAXW = arg("--max-width", 828)


def main():
    if not os.path.exists(PENDING):
        raise SystemExit("！找不到待上云清单，请先跑 tools/build_miniapp_page_assets.py")
    pend = json.loads(open(PENDING, encoding="utf-8").read())

    before = after = 0
    done = skipped = 0
    per_sci = {}

    for it in pend["items"]:
        src = os.path.join(ROOT, it["file"])
        rel = os.path.splitext(it["rel"])[0] + ".webp"
        dst = os.path.join(OUT_DIR, it["sid"], rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)

        sz0 = os.path.getsize(src)
        before += sz0
        if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src):
            sz1 = os.path.getsize(dst)
            skipped += 1
        else:
            im = Image.open(src)
            if im.mode not in ("RGB", "L"):
                im = im.convert("RGB")
            if im.width > MAXW:
                im = im.resize((MAXW, max(1, round(im.height * MAXW / im.width))), Image.LANCZOS)
            im.save(dst, "WEBP", quality=QUALITY, method=6)
            sz1 = os.path.getsize(dst)
            done += 1
        after += sz1
        s = per_sci.setdefault(it["sid"], {"n": 0, "before": 0, "after": 0})
        s["n"] += 1
        s["before"] += sz0
        s["after"] += sz1

    rep = {
        "photos": len(pend["items"]),
        "converted": done,
        "skipped": skipped,
        "settings": {"quality": QUALITY, "max_width": MAXW, "format": "webp"},
        "bytes_before": before, "bytes_after": after,
        "ratio": round(after / before, 3) if before else 0,
        "staging_dir": OUT_DIR,
        "per_scientist": per_sci,
    }
    with open(REPORT, "w", encoding="utf-8") as f:
        json.dump(rep, f, ensure_ascii=False, indent=2, sort_keys=True)
        f.write("\n")

    print("照片总数   : %d 张（新压 %d / 跳过 %d）" % (rep["photos"], done, skipped))
    print("压缩前     : %.1f MB" % (before / 1024 / 1024))
    print("压缩后     : %.1f MB（%.0f%%，q=%d 最长边 %dpx）"
          % (after / 1024 / 1024, 100.0 * rep["ratio"], QUALITY, MAXW))
    print("备料目录   : %s" % OUT_DIR)
    print("报告       : %s" % os.path.relpath(REPORT, ROOT))
    print("下一步     : 上传该目录到云存储，再把 fileID 写进 tools/miniapp_cloud_images.json")
    print("OK")


if __name__ == "__main__":
    main()
