#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""《读懂科学家》系列 · 新科学家子站生成器

用法：
    python3 tools/new_scientist.py <id> <中文名> [英文名]

示例：
    python3 tools/new_scientist.py einstein 爱因斯坦 Einstein
    python3 tools/new_scientist.py galileo 伽利略 Galilei

做的事：
    1. 复制 scientists/newton/ 为 scientists/<id>/（已验证可用的完整骨架）
    2. 把可见品牌令牌替换成新科学家的名字
       - 读懂牛顿  -> 读懂<中文名>
       - 牛顿      -> <中文名>
       - Newton    -> <英文名>（仅 .html 中的独立英文词，避开文件名）
    3. 跳过 prototype/ 旧框架文档，不污染新子站
    4. 打印「你接下来要改的清单」

注意：
    - labs.html 里的棱镜/引力/抛体演示是牛顿专属物理，新科学家若领域不同需自行替换。
    - 术语库（assets/js/terms.js）与 detail/*.html、timeline.html 的内容需你填写。
    - 历史图片 assets/img/history/* 目前是牛顿的，需替换为对应科学家的真实历史照片。
"""
import os, sys, shutil, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
SRC = os.path.join(ROOT, "scientists", "newton")
SKIP_DIRS_IN_COPY = {"prototype", "__pycache__", "history",
                   "optics.html", "calculus.html", "gravity.html", "laws.html"}
BINARY_EXT = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".woff", ".woff2", ".ttf", ".eot", ".mp4", ".pdf"}


def die(msg):
    print("❌ " + msg)
    sys.exit(1)


def main():
    args = sys.argv[1:]
    if len(args) < 2:
        die("用法: python3 tools/new_scientist.py <id> <中文名> [英文名] [--force]")
    force = "--force" in args
    args = [a for a in args if a != "--force"]
    sid = args[0].strip().lower()
    if not re.match(r"^[a-z0-9][a-z0-9_-]*$", sid):
        die("id 只能含小写字母/数字/连字符，且以字母数字开头（建议用英文姓）。")
    name = args[1].strip()
    en = (args[2].strip() if len(args) > 2 else sid.capitalize())

    dst = os.path.join(ROOT, "scientists", sid)
    existed = os.path.exists(dst)
    if existed and not force:
        die("目标已存在：%s（加 --force 可增量覆盖，或先删掉/换 id）" % os.path.relpath(dst, ROOT))

    if not os.path.isdir(SRC):
        die("找不到骨架源：%s" % os.path.relpath(SRC, ROOT))

    # ---- 1. 复制（跳过 prototype 等） ----
    # 增量覆盖：用 copytree(dir_ok) 取代 rmtree，避免整目录删除触发安全守卫
    shutil.copytree(SRC, dst, ignore=shutil.ignore_patterns(*SKIP_DIRS_IN_COPY), dirs_exist_ok=True)
    print("✅ 已复制骨架 -> %s%s" % (os.path.relpath(dst, ROOT), "（增量覆盖）" if existed else ""))

    # ---- 2. 品牌令牌替换 ----
    rep = [
        ("读懂牛顿", "读懂" + name),
        ("牛顿", name),
    ]
    count = 0
    for dp, _, fs in os.walk(dst):
        for f in fs:
            ext = os.path.splitext(f)[1].lower()
            if ext in BINARY_EXT:
                continue
            if f in {"site.js"}:   # 引擎不碰，已是通用版
                continue
            fp = os.path.join(dp, f)
            try:
                txt = open(fp, encoding="utf-8").read()
            except Exception:
                continue
            new = txt
            for a, b in rep:
                new = new.replace(a, b)
            # 仅对 .html 处理独立英文词 Newton -> <en>，避开 newton- 文件名
            if f.endswith(".html"):
                new = re.sub(r'\bNewton\b', en, new)
            if new != txt:
                open(fp, "w", encoding="utf-8").write(new)
                count += 1
    print("✅ 品牌令牌替换完成（%d 个文件）" % count)

    # ---- 3. 提示下一步 ----
    rel = os.path.relpath(dst, ROOT)
    print("\n" + "=" * 56)
    print("骨架已就绪，下面这些需要你填内容：")
    print("=" * 56)
    checklist = [
        ("术语库", "%s/assets/js/terms.js" % rel, "把 SITE_TERMS / SITE_PAGES / SITE_CATS 换成你这位科学家的；保留这三个全局名。"),
        ("成就详解", "%s/detail/*.html" % rel, "optics/calculus/gravity/laws 四个模板页，改成这位科学家的核心成就（可增删页面）。"),
        ("生平时间轴", "%s/timeline.html" % rel, "把年份节点换成这位科学家的一生事件。"),
        ("动手实验", "%s/labs.html" % rel, "棱镜/引力/抛体是牛顿专属物理；换领域要改 site.js 的 labPrism/labGravity/labProjectile 或另写。"),
        ("历史图片", "%s/assets/img/history/*" % rel, "目前是牛顿照片，替换为该科学家真实历史图，并改 CREDITS.json。"),
        ("首页文案", "%s/index.html" % rel, "Hero、四大成就卡片、常见误解等按新科学家改写。"),
        ("总览入口", "index.html（项目根）", "在「已上线」区加一张指向 %s/index.html 的卡片。" % rel),
    ]
    for i, (k, path, note) in enumerate(checklist, 1):
        print("  %d. [%s] %s\n     %s" % (i, k, path, note))
    print("\n本地预览：用任意静态服务器打开 %s/index.html（或用 tools/e2e_check.js %s 做浏览器级验证）。" % (rel, sid))
    print("校验：python3 tools/validate_site.py")


if __name__ == "__main__":
    main()
