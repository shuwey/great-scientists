#!/usr/bin/env python3
"""
verify_site_icon.py —— 图标接入的全量校验。

四组断言，全部基于"解析出来的真实路径/真实字节"，不靠肉眼：
  1. 每个页面的每一条图标 link、品牌位 img，解析到磁盘上都必须存在
  2. 每个页面的 head 必须恰好有一组图标 link（不重复、不缺失）
  3. .apple 里不应再有 emoji（应已被矢量标记替换）
  4. 16 处 assets/img/icon/ 的资产必须逐字节一致（防漏拷/拷错）

用法：python3 tools/verify_site_icon.py
"""
import hashlib
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
WEB_ASSETS = [
    "favicon.ico", "favicon-16.png", "favicon-32.png", "favicon-48.png",
    "apple-touch-icon-180.png", "mark-standard.svg",
]

ICON_LINK_RE = re.compile(r'<link[^>]*\brel="(?:icon|apple-touch-icon)"[^>]*>')
HREF_RE = re.compile(r'\bhref="([^"]+)"')
APPLE_RE = re.compile(r'<span class="apple"[^>]*>(.*?)</span>', re.S)
IMG_RE = re.compile(r'<img[^>]*\bsrc="([^"]+)"')
EMOJI_RE = re.compile(
    "[\U0001F300-\U0001FAFF\U00002600-\U000027BF\U0001F000-\U0001F2FF]"
)

fail = []
warn = []
no_nav = []

pages = sorted(
    p for p in ROOT.rglob("*.html")
    if not any(part.startswith(".") for part in p.relative_to(ROOT).parts)
    and "tools" not in p.relative_to(ROOT).parts
)
print(f"页面 {len(pages)} 个\n")

for p in pages:
    html = p.read_text(encoding="utf-8")

    # 1) 图标 link 解析
    links = ICON_LINK_RE.findall(html)
    if len(links) != 5:
        fail.append(f"{p.relative_to(ROOT)}：图标 link 数量 {len(links)}，应为 5")
    for tag in links:
        href = HREF_RE.search(tag)
        if not href:
            fail.append(f"{p.relative_to(ROOT)}：图标 link 缺少 href —— {tag[:70]}")
            continue
        u = urlparse(href.group(1))
        if u.scheme or href.group(1).startswith("//"):
            warn.append(f"{p.relative_to(ROOT)}：图标用了绝对 URL {href.group(1)}")
            continue
        target = (p.parent / u.path).resolve()
        if not target.exists():
            fail.append(f"{p.relative_to(ROOT)}：图标路径不存在 → {href.group(1)}")

    # 2) 品牌位（有才查 —— newton/prototype 的框架确认稿本身就没有导航）
    apples = APPLE_RE.findall(html)
    if not apples:
        no_nav.append(p)
    for inner in apples:
        if EMOJI_RE.search(inner):
            fail.append(f"{p.relative_to(ROOT)}：品牌位仍有 emoji → {inner.strip()[:40]}")
        m = IMG_RE.search(inner)
        if not m:
            fail.append(f"{p.relative_to(ROOT)}：品牌位没有 img → {inner.strip()[:60]}")
            continue
        u = urlparse(m.group(1))
        target = (p.parent / u.path).resolve()
        if not target.exists():
            fail.append(f"{p.relative_to(ROOT)}：品牌位图片不存在 → {m.group(1)}")

# 3) 16 处资产逐字节一致
icon_dirs = sorted(ROOT.glob("**/assets/img/icon"))
print(f"图标目录 {len(icon_dirs)} 处")
if len(icon_dirs) != 16:
    fail.append(f"图标目录数量 {len(icon_dirs)}，应为 16（根 + 15 子站）")

digests = {}
for d in icon_dirs:
    for f in WEB_ASSETS:
        fp = d / f
        if not fp.exists():
            fail.append(f"{d.relative_to(ROOT)}：缺少 {f}")
            continue
        h = hashlib.sha256(fp.read_bytes()).hexdigest()
        digests.setdefault(f, {}).setdefault(h, []).append(str(d.relative_to(ROOT)))
for f, by_hash in digests.items():
    if len(by_hash) > 1:
        fail.append(f"{f} 在各处内容不一致：" + " / ".join(
            f"{len(v)} 处 {k[:8]}" for k, v in by_hash.items()))
    else:
        print(f"  ✓ {f:<26} 16 处一致")

print()
if no_nav:
    print(f"ℹ️  {len(no_nav)} 个页面没有导航品牌位（自包含草稿页，只需图标 link）：")
    for p in no_nav:
        print(f"   {p.relative_to(ROOT)}")
if warn:
    print(f"⚠️  警告 {len(warn)} 条")
    for w in warn[:10]:
        print("   " + w)
if fail:
    print(f"✗ 失败 {len(fail)} 条")
    for f in fail[:30]:
        print("   " + f)
    sys.exit(1)
print(f"✅ 全部通过：{len(pages)} 个页面 · {len(icon_dirs)} 处资产 · 0 失败 · {len(warn)} 警告")
