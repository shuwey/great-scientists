# -*- coding: utf-8 -*-
"""把子站顶部导航里的「详解页」链接收进「详解 ▾」下拉菜单（幂等）。

背景：详解页标题很长（如「量子电动力学：光与电子怎样打交道」），
4 条长标题 + 首页/时间轴/玩一玩/词典 会在 1440px 下就把导航压成 2–3 行，
甚至溢出到 nav 之外（实测 15 站中 11 站命中）。

做法：顶栏只留短项（全部科学家 / 首页 / 时间轴 / 玩一玩 / 词典 / 关于），
详解链接整体包进 .nav-more（checkbox hack，零 JS）。

用法：
    python3 tools/nav_more_menu.py            # 处理全部子站
    python3 tools/nav_more_menu.py faraday    # 只处理某一站

幂等：已含 class="nav-more" 的页面直接跳过；重建子站后需重跑一次。
"""
import os
import re
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
SCIENTISTS = os.path.join(ROOT, "scientists")

# 留在顶栏的短项（按 href 的文件名判定）
KEEP_NAMES = {"index.html", "timeline.html", "labs.html", "glossary.html", "about.html"}

A_RE = re.compile(r'<a\b[^>]*>.*?</a>', re.S)
# 注意：伽利略/牛顿等手工站的 nav-links 带 data-page-node-id 属性，不能用 `">` 收尾
START_RE = re.compile(r'<div class="nav-links"[^>]*>')

# 下拉样式：桌面 hover 展开 + 点击（checkbox）保持；≤1000px 转为竖排分组、仅点击展开
NAV_MORE_CSS_PATCH = """
/* ===== 通用补丁：详解页下拉（由 tools/nav_more_menu.py 注入，幂等） ===== */
.nav-more { position: relative; display: flex; align-items: center; }
.nav-more-cb { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
.nav-more-btn {
  display: inline-flex; align-items: center; gap: 6px; cursor: pointer;
  padding: 7px 13px; border-radius: 9px; font-size: 15px; font-weight: 600;
  color: var(--ink-2); transition: background .18s, color .18s;
  -webkit-user-select: none; user-select: none;
}
.nav-more-btn::after {
  content: ""; width: 0; height: 0; margin-top: 3px;
  border: 4px solid transparent; border-top-color: currentColor; transition: transform .2s;
}
.nav-more:hover > .nav-more-btn,
.nav-more-cb:checked + .nav-more-btn { background: var(--brand-soft); color: var(--brand); }
.nav-more-cb:checked + .nav-more-btn::after { transform: rotate(180deg); }
.nav-more-menu {
  position: absolute; top: calc(100% + 8px); right: 0; z-index: 80;
  min-width: 300px; max-width: 380px; padding: 6px;
  background: var(--white); border: 1px solid var(--line); border-radius: 12px;
  box-shadow: 0 14px 32px rgba(0, 0, 0, .14);
  display: none; flex-direction: column; gap: 2px;
}
.nav-more:hover .nav-more-menu,
.nav-more-cb:checked ~ .nav-more-menu { display: flex; }
.nav-more-menu a {
  padding: 9px 12px; border-radius: 8px; font-size: 14px; font-weight: 600;
  line-height: 1.45; color: var(--ink-2); white-space: normal;
}
.nav-more-menu a:hover { background: var(--brand-soft); color: var(--brand); text-decoration: none; }
.nav-more-menu a.active { color: var(--brand); background: var(--brand-soft); }
/* 当前页就在详解菜单里时，让「详解」按钮保持高亮（不支持 :has 的浏览器静默降级） */
.nav-more:has(.nav-more-menu a.active) > .nav-more-btn { color: var(--brand); background: var(--brand-soft); }
@media (max-width: 1000px) {
  .nav-more { flex-direction: column; align-items: stretch; }
  .nav-more-btn { padding: 12px 14px; font-size: 16px; }
  .nav-more-menu {
    position: static; display: none; margin: 2px 0 6px 14px; padding: 0 0 0 12px;
    background: transparent; border: 0; border-left: 2px solid var(--line);
    box-shadow: none; min-width: 0; max-width: none; border-radius: 0;
  }
  /* 触屏上 hover 会「粘住」，小屏只认点击 */
  .nav-more:hover .nav-more-menu { display: none; }
  .nav-more-cb:checked ~ .nav-more-menu { display: flex; }
  .nav-more-menu a { padding: 9px 10px; font-size: 15px; }
}
"""


def split_links(block):
    """把 nav-links 块内的 <a> 分成 (保留, 详解) 两组，保持各自原顺序。"""
    keep, move = [], []
    for m in A_RE.finditer(block):
        a = m.group(0)
        href = re.search(r'href="([^"]*)"', a)
        name = os.path.basename((href.group(1) if href else "").split("?")[0])
        if 'class="nav-portal"' in a or 'nav-portal' in a:
            keep.append(a)
        elif name in KEEP_NAMES:
            keep.append(a)
        else:
            move.append(a)
    return keep, move


def build_block(keep, move, indent):
    """重建 nav-links 内容。详解组插回它原来所在的位置（第一个详解项处）。"""
    pad = " " * indent
    first_move = move[0] if move else None
    out = []
    for a in keep:
        out.append(pad + a)
    more = [
        pad + '<div class="nav-more">',
        pad + '  <input class="nav-more-cb" type="checkbox" id="navMore">',
        pad + '  <label class="nav-more-btn" for="navMore">详解</label>',
        pad + '  <div class="nav-more-menu">',
    ]
    for a in move:
        more.append(pad + "    " + a)
    more.append(pad + "  </div>")
    more.append(pad + "</div>")
    # 详解组原位于「时间轴」之后、「玩一玩」之前：插到 keep 的第 3 项之后（若可判定）
    if first_move is not None:
        pos = len(out)
        for i, a in enumerate(keep):
            if 'timeline.html' in a:
                pos = i + 1
                break
        out = out[:pos] + more + out[pos:]
    return out


def process_file(path):
    src = open(path, encoding="utf-8").read()
    if 'class="nav-more"' in src:
        return "skip"
    m = START_RE.search(src)
    if not m:
        return "nonav"
    # nav-links 内部不嵌套 div，取其后第一个 </div> 即块结束
    end = src.find("</div>", m.end())
    if end == -1:
        return "nonav"
    block = src[m.end():end]
    keep, move = split_links(block)
    if not move:
        return "nodetail"
    # 取块内首个 <a> 的缩进
    am = A_RE.search(block)
    pre = block[:am.start()] if am else ""
    indent = len(pre.split("\n")[-1]) if "\n" in pre else 6
    lines = build_block(keep, move, indent)
    new_inner = "\n" + "\n".join(lines) + "\n" + " " * max(indent - 2, 0)
    open(path, "w", encoding="utf-8").write(src[:m.end()] + new_inner + src[end:])
    return "ok"


def patch_css(site_dir):
    """给子站 style.css 追加下拉样式（幂等：已含 .nav-more-menu 则跳过）。"""
    path = os.path.join(site_dir, "assets", "css", "style.css")
    if not os.path.exists(path):
        return "nocss"
    css = open(path, encoding="utf-8").read()
    if ".nav-more-menu" in css:
        return "skip"
    with open(path, "a", encoding="utf-8") as f:
        f.write(NAV_MORE_CSS_PATCH)
    return "ok"


def inject_dir(root):
    stats = {}
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if not d.startswith(".")]
        for fn in filenames:
            if not fn.endswith(".html"):
                continue
            r = process_file(os.path.join(dirpath, fn))
            stats[r] = stats.get(r, 0) + 1
    return stats


def main():
    if len(sys.argv) > 1:
        targets = [os.path.join(SCIENTISTS, s) for s in sys.argv[1].split(",")]
    else:
        targets = [os.path.join(SCIENTISTS, d) for d in sorted(os.listdir(SCIENTISTS))
                   if os.path.isdir(os.path.join(SCIENTISTS, d)) and not d.startswith(".")]
    total = {}
    for t in targets:
        if not os.path.isdir(t):
            print("⚠️ 跳过（不存在）:", t)
            continue
        s = inject_dir(t)
        print("%-28s %s  css:%s" % (os.path.basename(t), s, patch_css(t)))
        for k, v in s.items():
            total[k] = total.get(k, 0) + v
    print("合计:", total)


if __name__ == "__main__":
    main()
