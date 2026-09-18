#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""读懂科学家 · 小程序配图管线（示意图随包 + 照片上云）

为什么分两条路：
  · **示意图（SVG）**：64 张共 94 KB，是详解页的骨架（日心体系、波粒二象……），
    矢量、能随屏幕缩放不发虚 —— 直接打进包里最省事，也最快。
  · **历史照片（JPG）**：138+3 张共约 28 MB，远超小程序主包 2 MB 上限，
    唯一合规出路是**云存储**（个人主体无法给外部域名做 ICP 备案，
    downloadFile 白名单根本加不了）。所以照片只生成「待上云清单」，
    真正的上传由 tools/upload_miniapp_images.py 在云环境就绪后执行。

产出：
  · miniapp/assets/pages/<sid>-<name>.svg     打进包的示意图
  · miniapp/data/images.js                    路径 → 实际资源 的映射表
  · tools/miniapp_pending_photos.json         待上云清单（上传脚本读它）

映射表 key = "<sid>/<相对子站根的路径>"，页面侧用 utils/img.js 解析。
若 tools/miniapp_cloud_images.json 存在（上传脚本产出），会一并合并进来，
届时照片自动点亮，页面代码一行都不用改。

用法：
    python3 tools/build_miniapp_page_assets.py
"""

import json
import os
import re
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCIENTISTS = os.path.join(ROOT, "scientists")
MP = os.path.join(ROOT, "miniapp")
PAGES_DIR = os.path.join(MP, "assets", "pages")
IMAGES_JS = os.path.join(MP, "data", "images.js")
PENDING = os.path.join(ROOT, "tools", "miniapp_pending_photos.json")
CLOUD_MANIFEST = os.path.join(ROOT, "tools", "miniapp_cloud_images.json")

KEEP_IN_PACKAGE = (".svg",)          # 随包
CLOUD_EXTS = (".jpg", ".jpeg", ".png", ".webp")   # 上云


def read(p):
    with open(p, "r", encoding="utf-8") as f:
        return f.read()


def main():
    pages = json.loads(read(os.path.join(ROOT, "miniapp", "data", "pages.js"))
                       .split("module.exports = ", 1)[1].rsplit(";", 1)[0])

    refs = {}   # "sid/relpath" -> relpath
    for sid, nodes in pages["timeline"].items():
        for n in nodes:
            for b in n["blocks"]:
                if b["k"] == "fig" and b.get("img"):
                    refs["%s/%s" % (sid, b["img"])] = b["img"]
    for sid, ds in pages["detail"].items():
        for d in ds.values():
            for b in d["blocks"]:
                if b["k"] == "fig" and b.get("img"):
                    refs["%s/%s" % (sid, b["img"])] = b["img"]

    if os.path.isdir(PAGES_DIR):
        shutil.rmtree(PAGES_DIR)
    os.makedirs(PAGES_DIR, exist_ok=True)

    cloud = {}
    if os.path.exists(CLOUD_MANIFEST):
        cloud = json.loads(read(CLOUD_MANIFEST))

    mapping, pending, kept, kept_bytes = {}, [], 0, 0
    for key in sorted(refs):
        sid, rel = key.split("/", 1)
        src = os.path.join(SCIENTISTS, sid, rel)
        if not os.path.exists(src):
            raise SystemExit("！引用图不存在：%s" % src)
        ext = os.path.splitext(rel)[1].lower()
        if key in cloud:
            mapping[key] = cloud[key]
            continue
        if ext in KEEP_IN_PACKAGE:
            flat = "%s-%s" % (sid, os.path.basename(rel))
            dst = os.path.join(PAGES_DIR, flat)
            shutil.copyfile(src, dst)
            mapping[key] = "/assets/pages/" + flat
            kept += 1
            kept_bytes += os.path.getsize(dst)
        elif ext in CLOUD_EXTS:
            pending.append({"key": key, "sid": sid, "rel": rel,
                            "file": "scientists/%s/%s" % (sid, rel),
                            "bytes": os.path.getsize(src)})
        else:
            raise SystemExit("！未登记的图片格式 %s（%s）——请在这里明确它随包还是上云" % (ext, key))

    # 映射表
    with open(IMAGES_JS, "w", encoding="utf-8") as f:
        f.write("/* 读懂科学家 · 图片映射表\n"
                "   由 tools/build_miniapp_page_assets.py 生成，请勿手改。\n"
                "   key = \"<科学家id>/<相对子站根的路径>\"，值 = 包内路径或云文件 ID。 */\n")
        f.write("module.exports = %s;\n" % json.dumps(mapping, ensure_ascii=False, indent=1, sort_keys=True))

    with open(PENDING, "w", encoding="utf-8") as f:
        json.dump({"count": len(pending), "bytes": sum(p["bytes"] for p in pending),
                   "items": pending}, f, ensure_ascii=False, indent=2, sort_keys=True)
        f.write("\n")

    print("引用图片总数 : %d 张" % len(refs))
    print("随包（矢量） : %d 张 · %.0f KB → assets/pages/" % (kept, kept_bytes / 1024))
    print("待上云（照片）: %d 张 · %.1f MB → %s"
          % (len(pending), sum(p["bytes"] for p in pending) / 1024 / 1024, os.path.relpath(PENDING, ROOT)))
    if cloud:
        print("已合并云映射 : %d 条" % len(cloud))
    else:
        print("云映射       : 尚无（跑 tools/upload_miniapp_images.py 后自动点亮照片）")
    print("映射表       : %s（%d 条）" % (os.path.relpath(IMAGES_JS, ROOT), len(mapping)))
    print("OK")


if __name__ == "__main__":
    main()
