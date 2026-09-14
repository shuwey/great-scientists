#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""列出 15 站 labs.html 里全部实验的元数据（data-lab / 标题 / 一句话说明 / 引导语），供 P2-1 撰写猜想问题用。"""
import re, sys, json, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
IDS = ["copernicus","galileo","kepler","newton","faraday","darwin","pasteur","maxwell",
       "mendeleev","curie","einstein","bohr","turing","feynman","hawking"]

TAG = re.compile(r"<[^>]+>")
def clean(s):
    s = TAG.sub("", s)
    s = s.replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
    return re.sub(r"\s+", " ", s).strip()

# 取每个 <div class="lab" data-lab="xxx" ...> ... </div> 区块（用配平法）
LABOPEN = re.compile(r'<div class="lab" data-lab="([^"]+)"')
DESC = re.compile(r'<p class="lab-desc"[^>]*>(.*?)</p>', re.S)
HEAD = re.compile(r'<h4[^>]*>(.*?)</h4>', re.S)

out = []
for sid in IDS:
    p = ROOT / "scientists" / sid / "labs.html"
    if not p.exists():
        print("MISSING", sid, file=sys.stderr); continue
    html = p.read_text(encoding="utf-8")
    for m in LABOPEN.finditer(html):
        lab = m.group(1)
        start = m.end()
        # 配平 div 找到该实验区块末尾
        depth, i = 1, start
        while depth > 0 and i < len(html):
            nxt_open = html.find("<div", i)
            nxt_close = html.find("</div>", i)
            if nxt_close == -1: break
            if nxt_open != -1 and nxt_open < nxt_close:
                depth += 1; i = nxt_open + 4
            else:
                depth -= 1; i = nxt_close + 6
        block = html[start:i]
        # 该 lab 前面的引导语：往回找最近一个 <p style="color:var(--ink-2)...">
        pre = html[max(0, m.start()-1600):m.start()]
        gp = re.findall(r'<p style="color:var\(--ink-2\)[^>]*>(.*?)</p>', pre, re.S)
        guide = clean(gp[-1]) if gp else ""
        h2 = re.findall(r"<h2[^>]*>(.*?)</h2>", pre, re.S)
        h2t = clean(h2[-1]) if h2 else ""
        # 已有的 .lab-guess（幂等检查）
        has_guess = 'class="lab-guess"' in block
        out.append(dict(station=sid, lab=lab, h2=h2t,
                        head=clean(HEAD.search(block).group(1)) if HEAD.search(block) else "",
                        desc=clean(DESC.search(block).group(1)) if DESC.search(block) else "",
                        guide=guide, has_guess=has_guess))

print(f"共 {len(out)} 个实验；已含 lab-guess 的 {sum(1 for x in out if x['has_guess'])} 个")
for x in out:
    print(f"\n[{x['station']}] data-lab={x['lab']}  head={x['head']}")
    print(f"  h2   : {x['h2']}")
    print(f"  desc : {x['desc']}")
    print(f"  guide: {x['guide'][:150]}")

(ROOT / "tools" / "_labs_meta.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
print("\n-> tools/_labs_meta.json")
