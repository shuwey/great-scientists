#!/usr/bin/env python3
"""
install_site_icon.py —— 把站点图标接进全站（幂等，可重跑）。

做三件事：
  1. 用 icon/dist 的位图合成多尺寸 favicon.ico（16 微缩版 / 32·48 标准版）
  2. 把网页可用的图标集分发到根与 15 个子站的 assets/img/icon/
  3. 给每个页面 head 注入图标 link，并把导航品牌位的 emoji 换成矢量标记

── 设计上的两个决定，都写在这里以免以后被"顺手改掉" ──

① **不提供 SVG favicon**。SVG favicon 会被浏览器在 16px 标签页上直接使用，
   而 16px 该用微缩版（去轨道）、不该用标准版。一旦声明 image/svg+xml，
   浏览器就绕过了我们按尺寸分档的控制。所以只给 PNG + ICO。

② **相对路径 + 每个子站一份副本**，而不是全站共用一个绝对路径。
   理由是项目既有架构就是子站自包含（见 MEMORY.md），换绝对路径会让
   子站脱离根目录就打不开。代价是图标改动要重跑本脚本。

用法：
  python3 tools/install_site_icon.py            # 预演，只报告不写
  python3 tools/install_site_icon.py --apply    # 实际写入
"""
import os
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "icon" / "dist"

# 网页要用到的资产 → 分发到各处 assets/img/icon/
WEB_ASSETS = [
    "favicon.ico",
    "favicon-16.png",
    "favicon-32.png",
    "favicon-48.png",
    "apple-touch-icon-180.png",
    "mark-standard.svg",
]

# 导航品牌位用的标记（标准版，27px 实测可辨）
NAV_MARK = "mark-standard.svg"

ICON_LINK_RE = re.compile(
    r'<link(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="([^"]*?)assets/css/style\.css")[^>]*>'
)
# 无样式表引用的页面（自带行内 <style>）用 viewport 行做锚点
FALLBACK_ANCHOR_RE = re.compile(r'<meta[^>]*\bname="viewport"[^>]*>')
EXISTING_ICON_RE = re.compile(r'<link[^>]*\brel="(?:icon|apple-touch-icon)"', re.I)
APPLE_SPAN_RE = re.compile(r'<span class="apple"([^>]*)>(.*?)</span>', re.S)


def link_block(prefix: str) -> str:
    """图标 link 块。prefix 是到 assets/ 的相对前缀（根页为 ''，detail 页为 '../'）。"""
    p = f"{prefix}assets/img/icon/"
    return (
        f'\n<link rel="icon" href="{p}favicon.ico" sizes="16x16 32x32 48x48">'
        f'\n<link rel="icon" type="image/png" sizes="16x16" href="{p}favicon-16.png">'
        f'\n<link rel="icon" type="image/png" sizes="32x32" href="{p}favicon-32.png">'
        f'\n<link rel="icon" type="image/png" sizes="48x48" href="{p}favicon-48.png">'
        f'\n<link rel="apple-touch-icon" sizes="180x180" href="{p}apple-touch-icon-180.png">'
    )


def nav_mark_html(prefix: str, attrs: str) -> str:
    """把品牌位的标记换成矢量 img。

    页面里有两种品牌位，尺寸不同，必须逐个取值：
      · 导航 .brand   → 尺寸来自样式表 .brand .apple { width:27px }
      · 页脚 .brand-f → 尺寸写在元素行内 style 里（26px），且自带渐变与圆角
    写死 27 会让页脚那个溢出 1px，所以优先读行内 style 的 width。
    """
    m = re.search(r"width:\s*(\d+)px", attrs)
    size = m.group(1) if m else "27"
    p = f"{prefix}assets/img/icon/{NAV_MARK}"
    return (
        f'<span class="apple"{attrs}>'
        f'<img src="{p}" alt="" width="{size}" height="{size}">'
        f'</span>'
    )


def build_ico(apply: bool) -> None:
    """合成多尺寸 .ico。Pillow 需要逐张给图，不能靠单张降采样 ——
    因为 16px 用微缩版、32/48 用标准版，是两张不同的画。

    ⚠️ Pillow 的 ICO 保存会把「基准图的尺寸」当成上限，凡是大于基准的尺寸都
    直接跳过（见 IcoImagePlugin._save 里的 `if size[0] > width ... continue`）。
    所以基准必须是**最大的那张**（48），否则只会写出一个 16×16 的壳。
    """
    from PIL import Image

    sizes = (16, 32, 48)
    frames = {s: Image.open(DIST / f"favicon-{s}.png").convert("RGBA") for s in sizes}
    out = DIST / "favicon.ico"
    if apply:
        frames[48].save(
            out,
            format="ICO",
            sizes=[(s, s) for s in sizes],
            append_images=[frames[16], frames[32]],
        )
        written = Image.open(out).ico.sizes()
        print(f"✓ 合成 {out.relative_to(ROOT)}　内含尺寸 {sorted(written)}"
              f"（16 微缩版 + 32/48 标准版）")
    else:
        print(f"· 将合成 favicon.ico（16 微缩版 + 32/48 标准版）")


def detect_prefix(html: str, page: Path | None = None) -> tuple[str | None, str]:
    """推导资源前缀。返回 (前缀, 来源说明)。

    首选：从页面的样式表 link 反推（与页面深度无关，永远自洽）。
    兜底：没有样式表引用的页面（如 newton/prototype 的框架确认稿，
          自带行内 <style>），按目录位置算到所属科学家站的根。
    """
    m = ICON_LINK_RE.search(html)
    if m:
        return m.group(1), "样式表"

    if page is not None:
        for site in (ROOT / "scientists").glob("*"):
            try:
                page.relative_to(site)
            except ValueError:
                continue
            rel = os.path.relpath(site, page.parent).replace(os.sep, "/")
            return ("" if rel == "." else rel + "/"), "目录位置"

    return None, "未找到"


def main() -> int:
    apply = "--apply" in sys.argv

    for f in WEB_ASSETS:
        if f == "favicon.ico":
            continue  # 由本脚本从位图合成
        src = DIST / f
        if not src.exists():
            print(f"✗ 缺少资产 {f}，先跑 node tools/build_icon_set.js")
            return 1

    build_ico(apply)

    # ── 分发目标：根 + 15 个子站 ──
    # 注意：图标目录可能还不存在，所以按 */assets 去找（assets 一定存在），再拼 img/icon
    sites = sorted(p.parent for p in (ROOT / "scientists").glob("*/assets"))
    targets = [ROOT] + sites
    print(f"\n① 分发资产到 {len(targets)} 处")
    for base in targets:
        t = base / "assets" / "img" / "icon"
        if apply:
            t.mkdir(parents=True, exist_ok=True)
            for f in WEB_ASSETS:
                shutil.copy2(DIST / f, t / f)
        label = "根" if base == ROOT else str(base.relative_to(ROOT))
        print(f"   {'✓' if apply else '·'} {label}/assets/img/icon/ ← {len(WEB_ASSETS)} 个文件")

    # ── 页面处理 ──
    # ⚠️ 必须排除点目录（.workbuddy / .git 等）。曾用 rglob("*.html") 只排除 .git 与
    #    tools/，结果把 .workbuddy/backup-labs-*/ 下的备份页也改了 —— 备份未入 git，
    #    只能靠逆变换还原。凡是"遍历全项目 HTML"的脚本都要用这个过滤。
    pages = sorted(
        p for p in ROOT.rglob("*.html")
        if not any(part.startswith(".") for part in p.relative_to(ROOT).parts)
        and "tools" not in p.relative_to(ROOT).parts
    )
    print(f"\n② 处理页面 {len(pages)} 个")

    no_prefix, by_fallback, touched_links, touched_nav = [], [], 0, 0
    for p in pages:
        html = p.read_text(encoding="utf-8")
        prefix, how = detect_prefix(html, p)
        if prefix is None:
            no_prefix.append(p)
            continue
        if how == "目录位置":
            by_fallback.append(p)

        new = html
        # 图标 link —— 已存在则跳过（幂等判据只认结构，不认会变的文案）
        if not EXISTING_ICON_RE.search(new):
            block = link_block(prefix)
            new, n = ICON_LINK_RE.subn(lambda m: m.group(0) + block, new, count=1)
            if n == 0:
                # 没有样式表引用 → 退到 viewport 行之后
                new, n = FALLBACK_ANCHOR_RE.subn(lambda m: m.group(0) + block, new, count=1)
            if n:
                touched_links += 1

        # 品牌位（导航 + 页脚）—— 只认 span.apple 结构；已换成 img 则跳过
        def repl(m):
            nonlocal touched_nav
            if "<img" in m.group(2):
                return m.group(0)
            touched_nav += 1
            return nav_mark_html(prefix, m.group(1))
        new = APPLE_SPAN_RE.sub(repl, new)

        if new != html and apply:
            p.write_text(new, encoding="utf-8")

    if no_prefix:
        print(f"\n⚠️  {len(no_prefix)} 个页面连目录兜底都失败，已跳过：")
        for p in no_prefix[:10]:
            print(f"   {p.relative_to(ROOT)}")
    else:
        print("   全部页面都定位到了资源前缀 ✅")

    if by_fallback:
        print(f"   其中 {len(by_fallback)} 个页面无样式表引用，按目录位置兜底：")
        for p in by_fallback:
            print(f"     {p.relative_to(ROOT)} → {detect_prefix(p.read_text(encoding='utf-8'), p)[0]}")

    print(f"\n   图标 link 注入：{touched_links} 个页面")
    print(f"   品牌位标记替换：{touched_nav} 处（导航 + 页脚）")
    if not apply:
        print(f"   （预演模式，未写入；加 --apply 执行）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
