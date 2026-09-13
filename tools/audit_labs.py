#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""审计 15 个科学家子站的「玩一玩」(labs.html)，找出重复与不匹配项。

输出：
  1. 每个站点的实验清单（h2 标题 / data-lab 类型 / 卡片标题 / 描述 / 控件标签 / 是否有发射按钮）
  2. 跨站重复：同一 data-lab 类型被几个站使用
  3. 站内重复：同一站里 data-lab 或 标题 出现多次
  4. 文本重复：描述文字 / 控件标签 被多个站共用
  5. 关键文本残留：把别站科学家名字写进了本页（如牛顿站里出现“爱因斯坦”）
"""
import os
import re
import json
import html
from collections import defaultdict, Counter

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "scientists")

NAME_ZH = {
    "copernicus": "哥白尼", "galileo": "伽利略", "kepler": "开普勒", "newton": "牛顿",
    "faraday": "法拉第", "darwin": "达尔文", "pasteur": "巴斯德", "maxwell": "麦克斯韦",
    "mendeleev": "门捷列夫", "curie": "居里夫人", "einstein": "爱因斯坦", "bohr": "玻尔",
    "turing": "图灵", "feynman": "费曼", "hawking": "霍金",
}


def strip_tags(s):
    s = re.sub(r"<[^>]+>", "", s)
    s = html.unescape(s)
    return re.sub(r"\s+", " ", s).strip()


def extract(path):
    with open(path, encoding="utf-8") as f:
        raw = f.read()
    # 去掉 data-page-node-id 噪声，便于正则
    txt = re.sub(r'\s*data-page-node-id="[^"]*"', "", raw)

    d = {}
    m = re.search(r"<title>(.*?)</title>", txt, re.S)
    d["title"] = strip_tags(m.group(1)) if m else ""
    m = re.search(r'name="description" content="(.*?)"', txt, re.S)
    d["desc"] = html.unescape(m.group(1)) if m else ""
    m = re.search(r'<h1[^>]*>(.*?)</h1>', txt, re.S)
    d["h1"] = strip_tags(m.group(1)) if m else ""

    # meta 标签 chips
    d["chips"] = [strip_tags(x) for x in re.findall(r'<span class="tag [^"]*"[^>]*>(.*?)</span>', txt, re.S)]

    labs = []
    # 以 <div class="lab" ...> 为切分
    parts = re.split(r'<div class="lab"', txt)[1:]
    for p in parts:
        lab = {}
        m = re.search(r'data-lab="([^"]*)"', p)
        lab["kind"] = m.group(1) if m else "(无 data-lab)"
        m = re.search(r'<div class="lab-head"[^>]*><h4[^>]*>(.*?)</h4>', p, re.S)
        lab["card_title"] = strip_tags(m.group(1)) if m else ""
        m = re.search(r'<p class="lab-desc"[^>]*>(.*?)</p>', p, re.S)
        lab["lab_desc"] = strip_tags(m.group(1)) if m else ""
        lab["controls"] = []
        for c in re.findall(r'<label[^>]*>(.*?)</label>', p, re.S):
            lab["controls"].append(strip_tags(c))
        lab["has_fire"] = "lab-fire" in p
        labs.append(lab)
    d["labs"] = labs

    # 每个实验前的 h2 与说明段
    heads = []
    for m in re.finditer(r'<h2 id="([^"]*)"[^>]*>(.*?)</h2>\s*<p[^>]*>(.*?)</p>', txt, re.S):
        heads.append({
            "id": m.group(1),
            "h2": strip_tags(m.group(2)),
            "intro": strip_tags(m.group(3)),
        })
    d["heads"] = heads

    # 正文纯文本（用于残留检测）
    body = txt.split("<footer", 1)[0]
    d["text"] = strip_tags(body)
    return d


def main():
    sites = sorted(os.listdir(ROOT))
    data = {}
    for s in sites:
        p = os.path.join(ROOT, s, "labs.html")
        if os.path.isfile(p):
            data[s] = extract(p)

    print("=" * 90)
    print("一、各站点实验清单")
    print("=" * 90)
    for s, d in data.items():
        print(f"\n### {s}（{NAME_ZH.get(s,'?')}）")
        print(f"  <title> {d['title']}")
        print(f"  h1      {d['h1']}")
        print(f"  chips   {' | '.join(d['chips'])}")
        print(f"  实验数   {len(d['labs'])}")
        for i, lab in enumerate(d["labs"], 1):
            print(f"    [{i}] data-lab={lab['kind']:<14} 卡片名={lab['card_title']:<12} fire={lab['has_fire']}")
            print(f"        描述: {lab['lab_desc']}")
            print(f"        控件: {' / '.join(lab['controls'])}")
        for h in d["heads"]:
            print(f"    H2#{h['id']}: {h['h2']}")
            print(f"        引导: {h['intro']}")

    print("\n" + "=" * 90)
    print("二、跨站 data-lab 类型分布（重复=同一类型出现在多个站）")
    print("=" * 90)
    kind_map = defaultdict(list)
    for s, d in data.items():
        for lab in d["labs"]:
            kind_map[lab["kind"]].append(s)
    for k, v in sorted(kind_map.items(), key=lambda x: -len(x[1])):
        flag = "  <<< 重复" if len(v) > 1 else ""
        print(f"  {k:<16} {len(v)} 站: {', '.join(v)}{flag}")

    print("\n" + "=" * 90)
    print("三、站内重复（同一站 data-lab 或 卡片标题 重复）")
    print("=" * 90)
    any_dup = False
    for s, d in data.items():
        kc = Counter(l["kind"] for l in d["labs"])
        tc = Counter(l["card_title"] for l in d["labs"])
        for k, c in kc.items():
            if c > 1:
                print(f"  {s}: data-lab='{k}' 出现 {c} 次")
                any_dup = True
        for t, c in tc.items():
            if c > 1 and t:
                print(f"  {s}: 卡片标题'{t}' 出现 {c} 次")
                any_dup = True
    if not any_dup:
        print("  （无）")

    print("\n" + "=" * 90)
    print("四、全站共用文本（同一段描述/控件标签被 >=2 个站共用）")
    print("=" * 90)
    desc_map = defaultdict(list)
    ctrl_map = defaultdict(list)
    card_map = defaultdict(list)
    for s, d in data.items():
        for lab in d["labs"]:
            if lab["lab_desc"]:
                desc_map[lab["lab_desc"]].append(s)
            if lab["card_title"]:
                card_map[lab["card_title"]].append(s)
            for c in lab["controls"]:
                ctrl_map[c].append(s)
    print("\n-- 重复的 card 标题 --")
    for t, v in sorted(card_map.items(), key=lambda x: -len(x[1])):
        if len(v) > 1:
            print(f"  「{t}」 -> {', '.join(v)}")
    print("\n-- 重复的 lab-desc 描述 --")
    for t, v in sorted(desc_map.items(), key=lambda x: -len(x[1])):
        if len(v) > 1:
            print(f"  「{t[:70]}...」\n      -> {', '.join(v)}")
    print("\n-- 重复的控件标签 --")
    for t, v in sorted(ctrl_map.items(), key=lambda x: -len(x[1])):
        if len(v) > 1:
            print(f"  「{t}」 -> {', '.join(v)}")

    print("\n" + "=" * 90)
    print("五、关键词残留（本页正文出现别的科学家名字）")
    print("=" * 90)
    found = False
    for s, d in data.items():
        for k, zh in NAME_ZH.items():
            if k == s:
                continue
            # 排除 nav / footer 干扰：只看实验室区域不至于，此处全正文扫
            cnt = d["text"].count(zh)
            if cnt:
                print(f"  {s}（{NAME_ZH[s]}）正文里出现『{zh}』{cnt} 次")
                found = True
    if not found:
        print("  （无）")

    # 存一份 JSON 供后续使用
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "labs_audit.json"), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    print("\n[已写出] tools/labs_audit.json")


if __name__ == "__main__":
    main()
