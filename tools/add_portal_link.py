#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
给子站所有页面注入「返回系列门户」入口（幂等，可重复执行）。

三处入口，覆盖桌面/移动、顶部/底部：
  1. 顶部导航 brand 左侧胶囊  <a class="portal-link">‹ 全部科学家</a>   （桌面显示）
  2. 汉堡菜单首项              <a class="nav-portal">全部科学家</a>       （≤640px 显示）
  3. 页脚「更多」列            浏览全部 13 位科学家 →                     （全部尺寸）

用法：
  python3 tools/add_portal_link.py            # 处理全部子站
  python3 tools/add_portal_link.py curie bohr # 只处理指定子站
"""
import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def portal_rel(rel_path):
    """由页面相对项目根的路径，算出回到根 index.html 的相对路径。

    scientists/curie/index.html        → ../../index.html      （上 2 级）
    scientists/curie/detail/decay.html → ../../../index.html   （上 3 级）
    即：上级数 = 路径中的斜杠数（= 文件所在目录深度）
    """
    return "../" * rel_path.count("/") + "index.html"


def inject(html, portal):
    """注入三处入口，返回 (新 html, 注入计数)。"""
    n = 0

    # 1) 顶部导航：brand 左侧胶囊
    if 'class="portal-link"' not in html:
        new, k = re.subn(
            r'(\n([ \t]*))<a class="brand"',
            lambda m: '%s<a class="portal-link" href="%s">‹ 全部科学家</a>\n%s<a class="brand"' % (m.group(1), portal, m.group(2)),
            html, count=1)
        if k:
            html, n = new, n + 1

    # 2) 汉堡菜单首项（移动端）——注意部分页是 <div class="nav-links"><a …> 同行写法
    if 'class="nav-portal"' not in html:
        new, k = re.subn(
            r'(<div class="nav-links"[^>]*>)(\s*)',
            lambda m: '%s\n      <a class="nav-portal" href="%s">全部科学家</a>\n      ' % (m.group(1), portal),
            html, count=1)
        if k:
            html, n = new, n + 1

    # 3) 页脚「更多」列（只在页脚段内判断，避免被顶部导航的 href 误判为已注入）
    if 'class="foot-bottom"' in html and "13 位科学家" not in html.split('class="foot-bottom"')[0]:
        new, k = re.subn(
            r'(<h5[^>]*>更多</h5>\s*<ul[^>]*>)(.*?)(</ul>)',
            lambda m: m.group(1) + m.group(2) +
                      '          <li><a href="%s">浏览全部 13 位科学家 →</a></li>\n        ' % portal +
                      m.group(3),
            html, count=1, flags=re.S)
        if k:
            html, n = new, n + 1

    return html, n


def main():
    ids = sys.argv[1:] or sorted(
        d for d in os.listdir(os.path.join(ROOT, "scientists"))
        if os.path.isdir(os.path.join(ROOT, "scientists", d)))

    pages, touched, total = 0, 0, 0
    for sid in ids:
        base = os.path.join(ROOT, "scientists", sid)
        files = []
        for fn in sorted(os.listdir(base)):
            if fn.endswith(".html"):
                files.append(os.path.join(base, fn))
        d = os.path.join(base, "detail")
        if os.path.isdir(d):
            files += [os.path.join(d, fn) for fn in sorted(os.listdir(d)) if fn.endswith(".html")]

        for fp in files:
            pages += 1
            rel = os.path.relpath(fp, ROOT).replace(os.sep, "/")
            portal = portal_rel(rel)
            html = io.open(fp, encoding="utf-8").read()
            new, n = inject(html, portal)
            if n:
                io.open(fp, "w", encoding="utf-8").write(new)
                touched += 1
                total += n
        print("  %-11s %d 页" % (sid, len(files)))

    print("\n扫描 %d 页，修改 %d 页，注入 %d 处入口" % (pages, touched, total))


if __name__ == "__main__":
    main()
