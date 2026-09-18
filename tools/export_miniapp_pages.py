#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""读懂科学家 · 小程序「生平时间轴 + 成就详解」内容抽取器

把静态站的两块核心内容抽成小程序可直接消费的结构化数据：
  · 时间轴：`scientists/<id>/timeline.html`  → 每个 `[data-year]` 节点
  · 详解页：`scientists/<id>/detail/*.html`  → 每个成就页的正文块
并顺带把「同期中国」对照卡片（tools/china_data.py，与网页端同一份数据源、
同一套 ±20 年窗口口径）算好一起下发 —— 网页端是浏览器端现算，小程序端
不适合带一份 JS 引擎进来，所以在这里预计算。

设计取舍（踩过的坑写在这里，改之前先看）：
  1) **不搬 HTML，搬数据。** 15 站结构高度一致但并非完全相同：13 站时间轴是
     `.tl-body`，牛顿/爱因斯坦是折叠式 `.tl-panel`；详解页正文块则出现
     callout / formula / fact / ul / figure 五种形态。本脚本把差异在这里抹平，
     页面侧只认一套 schema。
  2) **未知标签直接报错退出，不静默丢格式。** 与 export_miniapp_content.py 同一
     原则：rich-text 认不了的标签一旦悄悄吞掉，读者看到的就是缺内容的正文，
     而校验又查不出来。宁可炸。
  3) **rich-text 不认 class，也不认 CSS 变量。** 所以正文里的 `class` 全剥掉、
     `var(--x)` 全部替换成字面量十六进制（令牌值取自 miniapp/app.wxss 的 page:root，
     两边同值）。留着 var() 会渲染成默认黑字。
  4) **`data-page-node-id` 必须先剥掉。** 那是 Ardot 回写的编辑期标记，既占体积
     又无意义；牛顿/爱因斯坦两站的 HTML 里每个元素都有。
  5) **交叉核对是闸门。** 时间轴节点数、详解页篇数都用**独立路径**（正则数
     `class="tl-item"`、数列目录里的 .html）复核，不一致就退出。
  6) **幂等 + 确定性**：无时间戳，顺序取自源文件，重复跑逐字节一致。

用法：
    python3 tools/export_miniapp_pages.py
"""

import glob
import html as H
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import china_cards as C  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCIENTISTS = os.path.join(ROOT, "scientists")
OUT = os.path.join(ROOT, "miniapp", "data", "pages.js")
REPORT = os.path.join(ROOT, "tools", "miniapp_pages_report.json")

EXPECTED_SCIENTISTS = 15
EXPECTED_DETAIL_PER = 4

# ---- rich-text 白名单（含行内标签）----
ALLOWED = {"span", "b", "strong", "i", "em", "u", "sub", "sup", "br"}

# ---- 设计令牌：取自 miniapp/app.wxss 的 page 选择器（与静态站同值）----
TOKENS = {
    "brand": "#3B5BDB", "brand-dark": "#2F49AF", "brand-soft": "#EDF1FD",
    "brand-wash": "#EEF2FE", "brand-line": "#C7D2FE",
    "accent": "#F59F00", "accent-soft": "#FFF8E9",
    "bg": "#F7F9FC", "bg-alt": "#EDF1F7", "card": "#FFFFFF", "white": "#FFFFFF",
    "line": "#E3E8EF", "line-2": "#D4DBE5",
    "ink": "#1B2530", "ink-body": "#2B3644", "ink-2": "#56617A", "ink-3": "#8B96AA",
    "hl-bg": "#FFF3BF", "hl-fg": "#6B4E12",
}
TERM_STYLE = ("color:%s;border-bottom:1rpx dashed %s" % (TOKENS["brand"], TOKENS["brand-line"]))
SYM_STYLE = "color:%s;font-weight:600" % TOKENS["brand"]

BLOCK_OPEN_RE = re.compile(r"<(h2|h3|p|figure|div|ul)\b", re.I)
VAR_RE = re.compile(r"var\(--([a-zA-Z0-9-]+)\)")


def read(p):
    with open(p, "r", encoding="utf-8") as f:
        return f.read()


def text_of(frag):
    """取纯文本：去标签、去实体、压空白。"""
    s = re.sub(r"<br\s*/?>", " ", frag, flags=re.I)
    s = re.sub(r"<[^>]+>", "", s)
    return re.sub(r"\s+", " ", H.unescape(s)).strip()


def slice_block(s, start, tag):
    """start 指向 '<tag'，返回该元素完整片段（含闭合标签）。嵌套同名标签会正确配对。"""
    pat = re.compile(r"<%s\b|</%s\s*>" % (tag, tag), re.I)
    depth = 0
    for m in pat.finditer(s, start):
        if m.group(0).startswith("</"):
            depth -= 1
            if depth == 0:
                return s[start:m.end()]
        else:
            depth += 1
    raise SystemExit("！标签未闭合：<%s> @%d\n  %s" % (tag, start, s[start:start + 120]))


def attr(frag, name):
    m = re.search(r'(?:^|\s)%s="([^"]*)"' % re.escape(name), frag)
    return m.group(1) if m else ""


def img_src(frag):
    """取 <img> 的 src。刻意不用 attr()：`data-src` 也会被 \\b 边界匹配上。"""
    m = re.search(r"<img\b[^>]*?((?:^|\s)src=\"[^\"]*\")", frag)
    return attr(m.group(1), "src") if m else ""


def fix_style(raw):
    """把 var(--x) 换成字面量；遇到未知令牌直接报错（不留渲染成黑字的隐患）。"""
    def sub(m):
        k = m.group(1)
        if k not in TOKENS:
            raise SystemExit("！样式里出现未登记的令牌 var(--%s)，请在 TOKENS 里补上" % k)
        return TOKENS[k]
    return VAR_RE.sub(sub, raw)


def rich(frag, where, terms_out=None):
    """行内富文本 → rich-text 可用的 HTML 串（只保留 style，class 全剥掉）。"""
    if frag is None:
        return ""
    t = frag

    # 术语高亮：静态站靠 JS 点击，小程序 rich-text 不支持事件，这里退化成"看得见的下划线"，
    # 可点击的入口由页面下方的术语胶囊承担（不假装能点）。
    if terms_out is not None:
        for k in re.findall(r'<span class="term"[^>]*data-term="([^"]+)"', t):
            if k not in terms_out:
                terms_out.append(k)
    t = re.sub(r'<span class="term"[^>]*>', '<span style="%s">' % TERM_STYLE, t)
    t = re.sub(r'<span class="sym"[^>]*>', '<span style="%s">' % SYM_STYLE, t)
    t = re.sub(r'<span class="sym-note"[^>]*>', "<span>", t)
    t = re.sub(r'<span class="ct"[^>]*>', "<b>", t)
    # 链接降级成普通文字（rich-text 里点不开，留个假链接更糟）
    t = re.sub(r"<a\b[^>]*>", "", t)
    t = re.sub(r"</a\s*>", "", t)
    # 只留 style，其余属性（class / id / data-* ）一律剥掉
    def strip_attrs(m):
        tag, raw = m.group(1), m.group(2) or ""
        sm = re.search(r'style=["\']([^"\']*)["\']', raw)
        return "<%s%s>" % (tag, ' style="%s"' % fix_style(sm.group(1)) if sm else "")
    t = re.sub(r"<([a-zA-Z][a-zA-Z0-9]*)((?:\s[^>]*?)?)>", strip_attrs, t)

    used = set(x.lower() for x in re.findall(r"</?([a-zA-Z][a-zA-Z0-9]*)", t))
    bad = used - ALLOWED
    if bad:
        raise SystemExit("！%s 里出现 rich-text 不支持的标签 %s\n  片段：%s"
                         % (where, sorted(bad), t[:200]))
    return re.sub(r"\s+", " ", t).strip()


def norm_img(src, sid, where, missing):
    """图片路径归一：相对子站根目录。返回 '' 表示没有图。"""
    if not src:
        return ""
    if re.match(r"^https?:", src):
        raise SystemExit("！%s 引用了外链图片（小程序需走云存储）：%s" % (where, src))
    rel = src
    while rel.startswith("../"):
        rel = rel[3:]
    rel = rel.lstrip("./")
    if not os.path.exists(os.path.join(SCIENTISTS, sid, rel)):
        missing.append("%s -> %s" % (where, rel))
        return ""
    return rel


# --------------------------------------------------------------------------- #
# 同期中国
#
# 计算全部交给 tools/china_cards.py（网页端生成器用的是同一份代码）——
# 这里只做「翻译」：把共用结构翻成 rich-text / WXML 好消费的纯文本形态。
# 端上不跑计算引擎，也不该有第二份去重规则。
# --------------------------------------------------------------------------- #
def attach_china(nodes):
    """给整站节点按序号分配「同期中国」卡片（同站不重复）。

    注意传的是**节点年份列表**而不是集合：同一年可能有两个节点
    （哥白尼 1543 既是《天体运行论》出版、又是逝世），按年份做键会让两个
    节点拿到同一张卡 —— 那正是要消灭的重复。
    """
    years = [n["y"] for n in nodes]
    got = C.assign(years)
    for n, g in zip(nodes, got):
        head = C.era_head(n["y"])
        ev, terms = [], []
        for e in g["ev"]:
            ev.append([e[0], e[1]])
            terms += C.mark(e[1])[1]
        fig = []
        for f in g["fg"]:
            fig.append([f[0], f[1], f[2], f[3], f[4]])
            terms += C.mark(f[4])[1]
        if head:
            terms.append(C.NIANHAO)
        if not head and not ev and not fig:
            continue
        # terms 是「网页端会标出来的名词」，端上渲染成页尾胶囊 —— rich-text 不认事件，
        # 所以不能把 <span class="term"> 搬过去，只能换成可点的胶囊。
        n["cn"] = {"era": head, "ev": ev, "fig": fig,
                   "terms": sorted(set(terms))}
    return nodes


# --------------------------------------------------------------------------- #
# 时间轴
# --------------------------------------------------------------------------- #
def parse_timeline(sid, missing):
    path = os.path.join(SCIENTISTS, sid, "timeline.html")
    src = read(path)
    nodes = []
    for m in re.finditer(r'<div class="tl-item"[^>]*>', src):
        frag = slice_block(src, m.start(), "div")
        where = "%s/timeline" % sid
        y = int(attr(frag, "data-year") or (re.search(r'class="tl-(?:year|title)"[^>]*>(\d{4})<', frag) or
                                            [None, "0"])[1])
        # 标题：静态式在 .tl-title，折叠式在 <p class="t">
        # ★ 类名后面必须允许其他属性：手工站的标签写作
        #   `<span class="tl-title" data-page-node-id="...">`（Ardot 回写），
        #   精确匹配会静默漏掉整站标题（伽利略 13 个节点全空，页面上不报错）。
        tm = re.search(r'<span class="tl-title"[^>]*>(.*?)</span>', frag, re.S)
        if tm:
            title = text_of(tm.group(1))
            sub = ""
        else:
            tm = re.search(r'<p class="t"[^>]*>(.*?)</p>', frag, re.S)
            sm = re.search(r'<p class="s"[^>]*>(.*?)</p>', frag, re.S)
            title = text_of(tm.group(1)) if tm else ""
            sub = text_of(sm.group(1)) if sm else ""

        host = re.search(r'<div class="(?:tl-body|tl-panel)"[^>]*>', frag)
        body = slice_block(frag, host.start(), "div") if host else ""

        blocks = []
        i = 0
        while True:
            mm = re.compile(r"<(figure|p)\b", re.I).search(body, i)
            if not mm:
                break
            tag = mm.group(1).lower()
            piece = slice_block(body, mm.start(), tag)
            i = mm.start() + len(piece)
            if tag == "figure":
                cap = re.search(r"<figcaption[^>]*>(.*?)</figcaption>", piece, re.S)
                blocks.append({"k": "fig", "img": norm_img(img_src(piece), sid, where, missing),
                               "cap": rich(cap.group(1), where) if cap else ""})
            else:
                inner = re.sub(r"^<p\b[^>]*>|</p\s*>$", "", piece, flags=re.I | re.S)
                blocks.append({"k": "p", "h": rich(inner, where)})

        tags = [text_of(x) for x in re.findall(r'<span class="tag[^"]*"[^>]*>(.*?)</span>', frag, re.S)]
        node = {"y": y, "t": title, "s": sub, "blocks": [b for b in blocks if b.get("h") or b.get("img")],
                "tags": [t for t in tags if t]}
        nodes.append(node)
    # 闸门：站点侧 china.js 是按 `[data-year]` 的出现顺序对齐卡片的
    # （见 build_china_era.py 与它生成脚本里的 c.y !== y 守卫）。这里用的是
    # `.tl-item` 的顺序 —— 两者一旦不一致，端上与网页的同期中国卡片就会各说各话，
    # 而两边都不会报错。把它变成显式断言，结构漂移时立刻炸出来。
    dy = [int(x) for x in re.findall(r'data-year="(\d{4})"', src)]
    if dy != [n["y"] for n in nodes]:
        raise SystemExit("！%s：`data-year` 序列与 tl-item 序列不一致（端上卡片会与网页错位）\n"
                         "   data-year %s\n   tl-item   %s"
                         % (sid, dy[:8], [n["y"] for n in nodes][:8]))
    # 卡片必须在**收齐整站节点之后**再分配：去重是全局的（同一条目只落一个节点）
    attach_china(nodes)
    return src, nodes


# --------------------------------------------------------------------------- #
# 详解页
# --------------------------------------------------------------------------- #
def parse_detail(sid, path, missing):
    src = read(path)
    slug = os.path.basename(path)[:-5]
    where = "%s/detail/%s" % (sid, slug)

    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", src, re.S)
    claim = re.search(r'<p class="big-claim"[^>]*>(.*?)</p>', src, re.S)
    meta = re.search(r'<div class="meta-row"[^>]*>(.*?)</div>', src, re.S)
    tags = [text_of(x) for x in re.findall(r"<span[^>]*>(.*?)</span>", meta.group(1), re.S)] if meta else []

    art = re.search(r'<article class="article"[^>]*>(.*?)</article>', src, re.S)
    if not art:
        raise SystemExit("！%s 找不到 <article class=\"article\">" % where)
    body = art.group(1)

    terms = []
    blocks, toc = [], []
    i = 0
    while True:
        m = BLOCK_OPEN_RE.search(body, i)
        if not m:
            break
        tag = m.group(1).lower()
        frag = slice_block(body, m.start(), tag)
        i = m.start() + len(frag)

        if tag in ("h2", "h3"):
            bid = attr(frag, "id")
            t = text_of(frag)
            blocks.append({"k": "h", "id": bid, "t": t})
            if bid:
                toc.append({"id": bid, "t": t})
            continue
        if tag == "p":
            cls = attr(frag, "class")
            inner = re.sub(r"^<p\b[^>]*>|</p\s*>$", "", frag, flags=re.I | re.S)
            if "fact" in cls:
                blocks.append({"k": "fact", "h": rich(inner, where, terms)})
            else:
                blocks.append({"k": "p", "h": rich(inner, where, terms)})
            continue
        if tag == "ul":
            items = [rich(x, where, terms) for x in
                     re.findall(r"<li\b[^>]*>(.*?)</li>", frag, re.S)]
            blocks.append({"k": "ul", "items": items})
            continue
        if tag == "figure":
            cap = re.search(r"<figcaption[^>]*>(.*?)</figcaption>", frag, re.S)
            blocks.append({"k": "fig",
                           "img": norm_img(img_src(frag), sid, where, missing),
                           "cap": rich(cap.group(1), where, terms) if cap else ""})
            continue
        # div
        cls = attr(frag, "class")
        if "page-nav" in cls:
            continue
        if "callout" in cls:
            ct = re.search(r'<span class="ct"[^>]*>(.*?)</span>', frag, re.S)
            ps = re.findall(r"<p\b[^>]*>(.*?)</p>", frag, re.S)
            blocks.append({"k": "note",
                           "tone": "green" if "green" in cls else "amber",
                           "t": rich(ct.group(1), where) if ct else "",
                           "h": " ".join(rich(x, where, terms) for x in ps)})
            continue
        if "formula" in cls:
            expr = re.search(r'<div class="(?:eq|sym-row)"[^>]*>(.*?)</div>', frag, re.S)
            note = re.search(r'<div class="eq-note"[^>]*>(.*?)</div>', frag, re.S)
            notes = [rich(x, where) for x in
                     re.findall(r'<(?:div|span) class="sym-note"[^>]*>(.*?)</(?:div|span)>', frag, re.S)]
            blocks.append({"k": "form", "expr": rich(expr.group(1), where) if expr else "",
                           "note": text_of(note.group(1)) if note else "", "notes": notes})
            continue
        if "fact" in cls:
            blocks.append({"k": "fact", "h": rich(frag, where, terms)})
            continue
        raise SystemExit("！%s 出现未处理的 div class=%r（新增块类型要在这里登记）" % (where, cls))

    # 侧栏「一句话记住」
    fact = ""
    fm = re.search(r'<p class="fact"[^>]*>(.*?)</p>', src, re.S)
    if fm:
        fact = rich(re.sub(r"^一句话记住：", "", text_of(fm.group(1))), where)
    # 侧栏术语
    side = re.findall(r'<span class="term"[^>]*data-term="([^"]+)"', src)
    for k in side:
        if k not in terms:
            terms.append(k)

    return {
        "slug": slug, "title": text_of(h1.group(1)) if h1 else slug,
        "claim": text_of(claim.group(1)) if claim else "",
        "tags": tags, "toc": toc, "fact": fact, "terms": terms,
        "blocks": [b for b in blocks if b.get("h") or b.get("img") or b.get("items")
                   or b.get("expr") or b.get("t")],
    }


# --------------------------------------------------------------------------- #
def main():
    ids = sorted(d for d in os.listdir(SCIENTISTS)
                 if os.path.isdir(os.path.join(SCIENTISTS, d)) and not d.startswith("."))
    if len(ids) != EXPECTED_SCIENTISTS:
        raise SystemExit("！子站 %d 个，期望 %d 个" % (len(ids), EXPECTED_SCIENTISTS))

    missing, tl_out, dt_out = [], {}, {}
    tl_stats, dt_stats = {}, {}

    for sid in ids:
        src, nodes = parse_timeline(sid, missing)
        n_src = len(re.findall(r'class="tl-item"', src))
        if len(nodes) != n_src:
            raise SystemExit("！%s 时间轴节点数不一致：解析 %d / 正则 %d" % (sid, len(nodes), n_src))
        if not nodes:
            raise SystemExit("！%s 时间轴解析出 0 个节点" % sid)
        no_title = [n["y"] for n in nodes if not n["t"]]
        if no_title:
            raise SystemExit(
                "！%s 有 %d 个节点没解析出标题（年份 %s）。\n"
                "  多半是时间轴的标签写法又变了 —— 记得类名后面要允许其他属性，"
                "如 `<span class=\"tl-title\" data-page-node-id=\"...\">`。" % (sid, len(no_title), no_title[:6]))
        years = [n["y"] for n in nodes]
        if any(y < 1000 or y > 2100 for y in years):
            raise SystemExit("！%s 时间轴出现异常年份：%s" % (sid, years))
        tl_out[sid] = nodes
        tl_stats[sid] = {"nodes": len(nodes), "with_cn": sum(1 for n in nodes if n.get("cn")),
                         "with_img": sum(1 for n in nodes if any(b["k"] == "fig" and b["img"] for b in n["blocks"]))}

        files = sorted(glob.glob(os.path.join(SCIENTISTS, sid, "detail", "*.html")))
        if len(files) != EXPECTED_DETAIL_PER:
            raise SystemExit("！%s 详解页 %d 篇，期望 %d 篇" % (sid, len(files), EXPECTED_DETAIL_PER))
        dt_out[sid] = {}
        for f in files:
            d = parse_detail(sid, f, missing)
            if d["slug"] in dt_out[sid]:
                raise SystemExit("！%s 详解页 slug 重复：%s" % (sid, d["slug"]))
            dt_out[sid][d["slug"]] = d
        dt_stats[sid] = {"pages": len(files),
                         "blocks": sum(len(d["blocks"]) for d in dt_out[sid].values()),
                         "terms": sum(len(d["terms"]) for d in dt_out[sid].values())}

    if missing:
        raise SystemExit("！%d 个图片引用在磁盘上找不到：\n  %s"
                         % (len(missing), "\n  ".join(missing[:20])))

    payload = {"timeline": tl_out, "detail": dt_out}
    body = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("/* 读懂科学家 · 时间轴与成就详解内容\n"
                "   由 tools/export_miniapp_pages.py 生成，请勿手改。 */\n")
        f.write("module.exports = %s;\n" % body)

    size = os.path.getsize(OUT)
    tl_nodes = sum(v["nodes"] for v in tl_stats.values())
    dt_pages = sum(v["pages"] for v in dt_stats.values())
    report = {
        "scientists": len(ids),
        "timeline": {"nodes": tl_nodes, "per_scientist": tl_stats},
        "detail": {"pages": dt_pages, "per_scientist": dt_stats},
        "bytes": size,
        "china_window_years": C.WIN,
    }
    with open(REPORT, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2, sort_keys=True)
        f.write("\n")

    print("子站        : %d 个" % len(ids))
    print("时间轴      : %d 个节点（其中带同期中国 %d、带图 %d）"
          % (tl_nodes, sum(v["with_cn"] for v in tl_stats.values()),
             sum(v["with_img"] for v in tl_stats.values())))
    print("成就详解    : %d 篇（正文块 %d 个、关联术语 %d 条）"
          % (dt_pages, sum(v["blocks"] for v in dt_stats.values()),
             sum(v["terms"] for v in dt_stats.values())))
    print("产出体积    : %.1f KB → %s" % (size / 1024, os.path.relpath(OUT, ROOT)))
    print("报告        : %s" % os.path.relpath(REPORT, ROOT))
    print("OK")


if __name__ == "__main__":
    main()
