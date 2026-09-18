#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""读懂科学家 · 小程序内容抽取器（v1）

把静态站的结构化内容抽成小程序可消费的数据模块。

设计取舍（踩过的坑写在这里，改之前先看）：
  1) **门户元数据从根 index.html 解析，不跑 build_portal.py。**
     门户首页在 2026-09-14 已转手工维护；重跑 build_portal.py 会覆盖它。
     与其去 import 一个会写文件的模块，不如直接把现行 HTML 当唯一真源。
  2) **术语用 Node 求值，不用正则解析。** terms.js 是 JS，含中文引号、
     注释、嵌套数组；正则只能取个大概。tools/miniapp_terms_dump.js 复用了
     静态站自己的引擎契约（SITE_TERMS / 兼容 NEWTON_TERMS）。
  3) **富文本要过一遍转换。** 术语的 plain/extra 里有 `<span class='hl'>`，
     而小程序 rich-text 只认内联 style、不认 class —— 直接塞进去高亮会丢。
     这里把白名单内的标签保留、class 换成内联样式，遇到白名单外的标签直接
     报错退出（宁可炸，也不要静默丢格式）。
  4) **幂等 + 确定性。** 无时间戳、顺序来源于源文件，重复跑结果逐字节一致，
     方便 CI 比对。
  5) **反向断言。** 术语总数会与一条**独立路径**（正则数顶层 key）交叉核对，
     不一致就退出——这是防"静默丢内容"的闸门。

用法：
    python3 tools/export_miniapp_content.py
"""

import glob
import json
import os
import re
import shutil
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import china_data as CHINA  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "miniapp", "data")
REPORT_PATH = os.path.join(ROOT, "tools", "miniapp_content_report.json")
PORTAL_HTML = os.path.join(ROOT, "index.html")
PORTAL_CSS = os.path.join(ROOT, "assets", "css", "style.css")
TERMS_DUMP = os.path.join(ROOT, "tools", "miniapp_terms_dump.js")

EXPECTED_SCIENTISTS = 15

# 设计令牌：来自 assets/css/style.css :root（有意不在这里发明颜色）
TOKENS = {
    "brand": "#3B5BDB",
    "accent": "#F59F00",
    "ink": "#1B2530",
    "hlBg": "#FFF3BF",
    "hlFg": "#6B4E12",
}

# 术语富文本里允许出现的标签。rich-text 支持的范围之外的一律报错。
ALLOWED_TAGS = {"span", "b", "strong", "i", "em", "u", "sub", "sup", "br"}

# class -> 内联样式（对应静态站 .hl 规则，见 style.css:263）
HL_STYLE = "background:%s;padding:0 4px;border-radius:4px;font-weight:600;color:%s" % (
    TOKENS["hlBg"], TOKENS["hlFg"],
)

CARD_RE = re.compile(
    r'<a\s+class="hp-item\s+d-(?P<discKey>[a-z]+)"\s+'
    r'href="scientists/(?P<id>[a-z]+)/index\.html"'
    r'(?P<attrs>[^>]*)>(?P<body>.*?)</a>',
    re.S,
)
DISC_RE = re.compile(r"\.d-(?P<key>[a-z]+)\s*\{\s*--disc:\s*(?P<hex>#[0-9A-Fa-f]{6})")

# —— 术语条数的「独立路径」交叉核对 ——
# 实测 15 份 terms.js 存在两种键名写法：`"heliocentrism": {`（带引号，如哥白尼）
# 与 `inertia: {`（不带引号，如牛顿）。早先只认后者，导致 12 份被误判为 0 条。
# 另外 SITE_PAGES 的条目是单行 `key: { title: ..., url: ... }`，只要求行尾为 `{`
# 就能天然排除它。核对必须**只扫 SITE_TERMS 区块**，否则会把 PAGES 的键算进来。
TERMS_BLOCK_RE = re.compile(r"window\.(?:SITE|NEWTON)_TERMS\s*=\s*\{")
NEXT_GLOBAL_RE = re.compile(r"\nwindow\.(?:SITE|NEWTON)_(?:PAGES|CATS)\s*=")
TERM_KEY_RE = re.compile(
    r"""^\s{2}(?:"([^"]+)"|'([^']+)'|([A-Za-z][A-Za-z0-9_-]*))\s*:\s*\{\s*$""", re.M,
)
CJK_RE = re.compile(r"[\u3400-\u9fff]")


def read(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def attr(attrs, name):
    m = re.search(r'\b%s="([^"]*)"' % re.escape(name), attrs)
    return m.group(1) if m else None


def inner(body, cls):
    m = re.search(r'<span class="%s">(.*?)</span>' % re.escape(cls), body, re.S)
    return re.sub(r"\s+", " ", m.group(1)).strip() if m else ""


def richify(text, where):
    """把术语里的 HTML 转成小程序 rich-text 认的形式（只保留内联 style）。"""
    if not text:
        return ""
    t = re.sub(r"<span\s+class=['\"]hl['\"]\s*>", '<span style="%s">' % HL_STYLE, text)

    # 去掉除 style 以外的一切属性：rich-text 的 HTML String 模式不支持 class/id
    def strip_attrs(m):
        tag, raw = m.group(1), m.group(2) or ""
        sm = re.search(r'style=["\']([^"\']*)["\']', raw)
        return "<%s%s>" % (tag, ' style="%s"' % sm.group(1) if sm else "")

    t = re.sub(r"<([a-zA-Z][a-zA-Z0-9]*)((?:\s[^>]*?)?)>", strip_attrs, t)

    used = set(x.lower() for x in re.findall(r"</?([a-zA-Z][a-zA-Z0-9]*)", t))
    bad = used - ALLOWED_TAGS
    if bad:
        raise SystemExit(
            "！术语富文本含小程序不支持的标签 %s\n  位置：%s\n  片段：%s"
            % (sorted(bad), where, t[:160])
        )
    return t


def parse_roster():
    """从根 index.html 解析 15 位科学家元数据（现行权威来源）。"""
    html = read(PORTAL_HTML)
    discs = dict(DISC_RE.findall(read(PORTAL_CSS)))
    disc_zh = {}

    roster = []
    for m in CARD_RE.finditer(html):
        body, attrs = m.group("body"), m.group("attrs")
        sid = m.group("id")
        disc_key = m.group("discKey")
        full = attr(attrs, "data-full") or inner(body, "hp-name")
        years = attr(attrs, "data-years") or inner(body, "hp-years")
        disc_zh[disc_key] = attr(attrs, "data-disc") or disc_zh.get(disc_key, "")

        # data-sci 是检索串：中英全名 + 生卒 + 学科 + 主题词
        toks = (attr(attrs, "data-sci") or "").split()
        ascii_head = []
        for tk in toks:
            if tk.isascii() and tk.replace("-", "").isalpha():
                ascii_head.append(tk)
            else:
                break
        drop = set(full.split()) | set(years.split()) | {"\u2013"} | set(ascii_head)
        keywords = [tk for tk in toks if tk not in drop and CJK_RE.search(tk)]

        img = re.search(r'<img\s+src="([^"]+)"', body)
        icon = img.group(1) if img else ""
        no = ""
        mo = re.search(r"/(\d{2})-%s\.webp$" % re.escape(sid), icon)
        if mo:
            no = mo.group(1)

        roster.append({
            "id": sid,
            "no": no,
            "shortName": inner(body, "hp-name"),
            "fullName": full,
            "enName": " ".join(ascii_head),
            "years": years,
            "disc": disc_zh[disc_key],
            "discKey": disc_key,
            "keywords": keywords,
            "tagline": inner(body, "hp-desc"),
            "icon": icon,
            # 小程序内的图标路径（tabBar 与首屏都从包内读，不走网络）
            "iconMini": "/assets/icons/%s-%s.webp" % (no, sid) if no else "",
            "sitePath": "scientists/%s/" % sid,
        })

    for r in roster:
        r["discColor"] = discs.get(r["discKey"], "")
    return roster, discs


def find_node():
    for c in (os.environ.get("MINIAPP_NODE"), shutil.which("node"),
              "/Users/shuwei/.workbuddy/binaries/node/versions/24.14.0/bin/node"):
        if c and os.path.exists(c):
            return c
    raise SystemExit("找不到 node（可用环境变量 MINIAPP_NODE 指定）")


def dump_terms(ids):
    files = []
    for sid in ids:
        p = os.path.join(ROOT, "scientists", sid, "assets", "js", "terms.js")
        if not os.path.exists(p):
            raise SystemExit("！缺少术语库：%s" % p)
        files.append(p)

    proc = subprocess.run(
        [find_node(), TERMS_DUMP] + files,
        capture_output=True, text=True, cwd=ROOT,
    )
    if proc.returncode != 0:
        raise SystemExit("！术语求值失败（exit %s）\n%s" % (proc.returncode, proc.stderr[:2000]))
    try:
        payload = json.loads(proc.stdout)
    except ValueError:
        raise SystemExit("！术语求值输出不是 JSON：%s" % proc.stdout[:500])

    if payload.get("errors"):
        for e in payload["errors"]:
            sys.stderr.write("  · 术语求值告警 %s -> %s(%s)\n" % (e["file"], e["error"], e["stage"]))
    return payload["data"]


def cross_count(src, where):
    """独立路径：正则数 SITE_TERMS 区块里的顶层 key。

    用来核对 Node 求值结果有没有静默丢条目。刻意不复用求值结果里的任何信息，
    也不依赖缩进之外的格式假设。
    """
    m = TERMS_BLOCK_RE.search(src)
    if not m:
        raise SystemExit("！%s 里找不到 window.SITE_TERMS = { 区块" % where)
    start = m.end()
    nxt = NEXT_GLOBAL_RE.search(src, start)
    block = src[start:nxt.start()] if nxt else src[start:]
    return len(TERM_KEY_RE.findall(block))


def build(roster, terms_data):
    by_sci = {}
    flat = []
    per_counts = {}

    for r in roster:
        sid = r["id"]
        d = terms_data.get(sid)
        if not d:
            raise SystemExit("！%s 没有求值出术语数据" % sid)

        terms = {}
        for tid, t in d["terms"].items():
            where = "%s/%s" % (sid, tid)
            item = {
                "name": t.get("name") or tid,
                "cat": t.get("cat") or "",
                "short": richify(t.get("short") or "", where),
                "plain": richify(t.get("plain") or "", where),
                "analogy": richify(t.get("analogy") or "", where),
                "extra": richify(t.get("extra") or "", where),
                "page": t.get("page"),
                "anchor": t.get("anchor"),
                "related": t.get("related") or [],
            }
            terms[tid] = item
            flat.append({
                "sci": sid,
                "k": tid,
                "name": item["name"],
                "cat": item["cat"],
                "short": item["short"],
            })

        per_counts[sid] = len(terms)
        by_sci[sid] = {
            "terms": terms,
            "pages": d["pages"],
            "cats": d["cats"],
        }

    # 独立路径交叉核对
    src_total, src_counts = 0, {}
    for r in roster:
        rel = "scientists/%s/assets/js/terms.js" % r["id"]
        src = read(os.path.join(ROOT, rel))
        n = cross_count(src, rel)
        src_counts[r["id"]] = n
        src_total += n

    parsed_total = sum(per_counts.values())
    mismatched = [k for k in per_counts if per_counts[k] != src_counts[k]]
    if mismatched:
        detail = "\n".join(
            "    %-12s 求值 %d / 正则 %d" % (k, per_counts[k], src_counts[k]) for k in mismatched
        )
        raise SystemExit(
            "！术语条数交叉核对不一致（求值合计 %d / 正则合计 %d）。\n"
            "  两种可能：① 抽取真丢了条目；② terms.js 的写法又变了，需要更新 TERM_KEY_RE。\n"
            "  请先人工核对下列文件的 SITE_TERMS 区块：\n%s"
            % (parsed_total, src_total, detail)
        )

    return by_sci, flat, per_counts, src_total


def write_module(path, var_obj, header):
    body = json.dumps(var_obj, ensure_ascii=False, indent=1)
    with open(path, "w", encoding="utf-8") as f:
        f.write("/* %s\n   由 tools/export_miniapp_content.py 生成，请勿手改。 */\n" % header)
        f.write("module.exports = %s;\n" % body)
    return os.path.getsize(path)


def build_cn_terms():
    """「同期中国」卡片里的名词解释（源：tools/china_data.py 的 TERMS）。

    刻意放在**独立的 `cn` 命名空间**，不并进 `bySci`：这些不是某位科学家的
    科学术语，混进去会让「术语词典」页多出一批历史名词、也会污染按人聚合的计数。

    字段名对齐 term-popup 组件（name/cat/short/plain/analogy/extra）；
    正文是纯文本，没有标记要转，所以不用走 richify。
    """
    out = {}
    for t in CHINA.TERMS:
        tid, name, _aliases, cat, short, plain, extra = t
        out[tid] = {"name": name, "cat": cat, "short": short,
                    "plain": plain, "analogy": "", "extra": extra}
    if len(out) != len(CHINA.TERMS):
        raise SystemExit("！名词 id 有重复：%d 条定义只得到 %d 个键"
                         % (len(CHINA.TERMS), len(out)))
    return out


def main():
    roster, discs = parse_roster()
    if len(roster) != EXPECTED_SCIENTISTS:
        raise SystemExit("！门户解析出 %d 位科学家，期望 %d 位（index.html 结构可能变了）"
                         % (len(roster), EXPECTED_SCIENTISTS))

    missing_disc = sorted({r["discKey"] for r in roster} - set(discs))
    if missing_disc:
        raise SystemExit("！以下学科色在 style.css 里没找到定义：%s" % missing_disc)

    terms_data = dump_terms([r["id"] for r in roster])
    by_sci, flat, per_counts, src_total = build(roster, terms_data)

    for r in roster:
        r["termCount"] = per_counts[r["id"]]

    os.makedirs(OUT_DIR, exist_ok=True)

    roster_obj = {
        "tokens": TOKENS,
        "discColors": {k: {"color": v, "name": next(
            (x["disc"] for x in roster if x["discKey"] == k), "")} for k, v in discs.items()},
        "scientists": roster,
    }
    size_roster = write_module(os.path.join(OUT_DIR, "roster.js"), roster_obj,
                               "小程序 · 门户与科学家元数据")
    cn_terms = build_cn_terms()
    size_terms = write_module(os.path.join(OUT_DIR, "terms.js"),
                              {"bySci": by_sci, "flatIndex": flat, "cn": cn_terms},
                              "小程序 · 术语库（科学 %d 条 + 同期中国名词 %d 条）"
                              % (len(flat), len(cn_terms)))

    report = {
        "scientists": len(roster),
        "terms_total": len(flat),
        "terms_total_by_regex": src_total,
        "cn_terms_total": len(cn_terms),
        "terms_per_scientist": per_counts,
        "disc_colors": discs,
        "bytes": {"roster.js": size_roster, "terms.js": size_terms,
                  "total": size_roster + size_terms},
        "hl_style": HL_STYLE,
    }
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2, sort_keys=True)
        f.write("\n")

    print("科学家        : %d 位（期望 %d）" % (len(roster), EXPECTED_SCIENTISTS))
    print("术语总数      : %d 条（正则独立核对 %d 条，一致）" % (len(flat), src_total))
    print("术语数区间    : %d ~ %d 条/人" % (min(per_counts.values()), max(per_counts.values())))
    print("学科色        : %s" % ", ".join(sorted(discs)))
    print("产出体积      : roster.js %.1f KB + terms.js %.1f KB = %.1f KB"
          % (size_roster / 1024, size_terms / 1024, (size_roster + size_terms) / 1024))
    print("报告          : %s" % os.path.relpath(REPORT_PATH, ROOT))
    print("OK")


if __name__ == "__main__":
    main()
