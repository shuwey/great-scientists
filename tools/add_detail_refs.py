# -*- coding: utf-8 -*-
"""
给每个详解页（「了解更多」落地页）注入「资料来源与延伸阅读」区块（P3）。
- 引用内容来自 detail_refs.py（只含真实可核查的著作）。
- 每条末尾自动追加维基百科 Special:Search 链接（永不 404）。
- 幂等：已存在 .refblock 则替换；--rewrite 落盘，默认 --dry-run。
"""
import os, re, sys, glob, urllib.parse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from detail_refs import REFS, WIKI

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

REFBLOCK_RE = re.compile(r'<section class="refblock".*?</section>\s*', re.S)
FOOTER_RE = re.compile(r'<footer class="foot">')
BODY_RE = re.compile(r'</body>')

CSS = """
/* 详解页引用区块（P3 新增） */
.refblock{margin:40px 0 8px;padding:22px 24px;background:var(--bg-alt,#F5F7FA);border:1px solid var(--line,#E6EAF0);border-left:4px solid var(--brand,#3B5BDB);border-radius:14px}
.refblock h3{font-size:17px;margin:0 0 12px;color:var(--ink,#1B2530);display:flex;align-items:center;gap:8px}
.refblock ol{margin:0;padding-left:22px}
.refblock li{font-size:15px;color:var(--ink-2,#5c6b82);line-height:1.75;margin:8px 0}
.refblock li b{color:var(--ink,#1B2530)}
.refblock .ref-note{margin:14px 0 0;font-size:13px;color:var(--ink-3,#8B96AA);line-height:1.7}
.refblock a{color:var(--brand,#3B5BDB);text-decoration:none}
.refblock a:hover{text-decoration:underline}
"""

def build_block(sid, items):
    wiki = WIKI.get(sid, "")
    wiki_url = "https://zh.wikipedia.org/wiki/Special:Search?search=" + urllib.parse.quote(wiki)
    lis = []
    for t, a, n in items:
        line = '<li><b>%s</b>' % t
        if a:
            # 作者字段若自带括号（年份/年代/机构/说明，如「艾萨克·牛顿（1704）」），直接拼接避免双括号；
            # 否则补一层外层括号，保持引用样式统一。
            if '（' in a or '(' in a:
                line += ' %s' % a
            else:
                line += '（%s）' % a
        if n:
            line += '— %s' % n
        line += '</li>'
        lis.append(line)
    ol = '<ol>\n      ' + '\n      '.join(lis) + '\n    </ol>'
    note = ('<p class="ref-note">本页内容依据公开史料与科学史通识编写；更多来源见 '
            '<a href="../about.html">本站《资料来源与延伸阅读》</a>。'
            '延伸检索：<a href="%s" target="_blank" rel="noopener">维基百科「%s」词条 ↗</a></p>'
            % (wiki_url, wiki))
    return ('<section class="refblock" id="refs">\n'
            '  <h3>📚 资料来源与延伸阅读</h3>\n'
            '    ' + ol + '\n'
            '    ' + note + '\n'
            '</section>\n')

def inject_html(html, sid, page, items):
    block = build_block(sid, items)
    html = REFBLOCK_RE.sub('', html)  # 先清掉旧的，保证幂等
    if FOOTER_RE.search(html):
        return FOOTER_RE.sub(block + '<footer class="foot">', html, count=1)
    if BODY_RE.search(html):
        return BODY_RE.sub(block + '</body>', html, count=1)
    return html + block

def main():
    apply = "--rewrite" in sys.argv
    total = 0
    miss = []
    for sid, pages in REFS.items():
        sp = os.path.join(ROOT, "scientists", sid)
        for page, items in pages.items():
            fp = os.path.join(sp, "detail", page + ".html")
            if not os.path.exists(fp):
                miss.append((sid, page, "文件不存在"))
                continue
            html = open(fp, encoding="utf-8").read()
            if REFBLOCK_RE.search(html) and not apply:
                pass  # dry-run 下仍统计，下面会提示将替换
            new = inject_html(html, sid, page, items)
            if apply:
                open(fp, "w", encoding="utf-8").write(new)
            total += 1
    # CSS
    css_files = [os.path.join(ROOT, "scientists", s, "assets", "css", "style.css") for s in REFS]
    css_added = 0
    for cf in css_files:
        if not os.path.exists(cf):
            continue
        c = open(cf, encoding="utf-8").read()
        if ".refblock" in c:
            continue
        if apply:
            open(cf, "w", encoding="utf-8").write(c.rstrip() + "\n" + CSS)
        css_added += 1
    print("[详解页引用区块] 注入 %d 处" % total + ("（已落盘）" if apply else "（dry-run）"))
    print("[CSS] 新增 .refblock 样式 %d 个站点" % css_added + ("（已落盘）" if apply else "（dry-run）"))
    if miss:
        print("缺失：", miss)

if __name__ == "__main__":
    main()
