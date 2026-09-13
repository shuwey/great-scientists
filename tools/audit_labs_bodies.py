#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""提取各站 site.js 里 lab_* 函数的函数体，做跨站相似度比对，找出复制粘贴的模板。"""
import os, re, json, hashlib
from collections import defaultdict
from difflib import SequenceMatcher

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "scientists")
NAME_ZH = {"copernicus":"哥白尼","galileo":"伽利略","kepler":"开普勒","newton":"牛顿",
 "faraday":"法拉第","darwin":"达尔文","pasteur":"巴斯德","maxwell":"麦克斯韦",
 "mendeleev":"门捷列夫","curie":"居里夫人","einstein":"爱因斯坦","bohr":"玻尔",
 "turing":"图灵","feynman":"费曼","hawking":"霍金"}


def grab_body(src, start_idx):
    """从 function 名后的 '(' 开始，用括号配对取整个函数体（含大括号）。"""
    i = src.index("{", start_idx)
    depth = 0
    j = i
    while j < len(src):
        c = src[j]
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return src[i:j + 1]
        j += 1
    return src[i:]


def norm(b):
    b = re.sub(r"//[^\n]*", "", b)
    b = re.sub(r"/\*.*?\*/", "", b, flags=re.S)
    b = re.sub(r"\s+", "", b)
    return b


def labs_of(site):
    p = os.path.join(ROOT, site, "assets/js/site.js")
    src = open(p, encoding="utf-8").read()
    out = {}
    for m in re.finditer(r"function\s+(lab[A-Za-z_]*)\s*\(", src):
        name = m.group(1)
        body = grab_body(src, m.start())
        out[name] = body
    return out, src


def main():
    sites = sorted(d for d in os.listdir(ROOT) if os.path.isdir(os.path.join(ROOT, d)))
    allf = {}
    srcs = {}
    for s in sites:
        allf[s], srcs[s] = labs_of(s)

    # 记录每站的 data-lab -> 函数名 映射（从 initLabs 里解析）
    mapping = {}
    for s in sites:
        src = srcs[s]
        m = re.search(r"function\s+initLabs\(\)\s*\{.*?\n\}", src, re.S)
        blk = m.group(0) if m else ""
        pairs = re.findall(r'kind\s*===\s*"([^"]+)"\)\s*(?:lab\w+)', blk)
        fns = re.findall(r'kind\s*===\s*"([^"]+)"\)\s*(lab[A-Za-z_]+)', blk)
        mapping[s] = dict(fns)

    print("=" * 100)
    print("一、data-lab 名 与 实际函数 的对应（同名不同义预警）")
    print("=" * 100)
    name_use = defaultdict(list)
    for s in sites:
        for kind, fn in mapping[s].items():
            name_use[kind].append((s, fn))
    for kind, uses in sorted(name_use.items()):
        fns = sorted({fn for _, fn in uses})
        mark = ""
        if len(set(fns)) > 1:
            mark = "   <<< 同名却用了不同函数（含义可能不同）"
        if len(uses) > 1:
            print(f"  data-lab='{kind}': " + ", ".join(f"{s}({NAME_ZH.get(s,'')})->{fn}" for s, fn in uses) + mark)

    print("\n" + "=" * 100)
    print("二、跨站函数体完全相同（字节级复制）")
    print("=" * 100)
    h = defaultdict(list)
    for s, fns in allf.items():
        for fn, body in fns.items():
            h[hashlib.md5(norm(body).encode()).hexdigest()].append((s, fn, body))
    for key, v in sorted(h.items(), key=lambda x: -len(x[1])):
        if len(v) > 1:
            print(f"  [{len(v)} 处完全相同] " + " ; ".join(f"{s}({NAME_ZH.get(s,'')}).{fn}" for s, fn, _ in v))

    print("\n" + "=" * 100)
    print("三、跨站函数体高度相似（>=0.80，非字节级）")
    print("=" * 100)
    flat = [(s, fn, norm(b)) for s, fns in allf.items() for fn, b in fns.items()]
    seen = set()
    for i in range(len(flat)):
        for j in range(i + 1, len(flat)):
            s1, f1, b1 = flat[i]
            s2, f2, b2 = flat[j]
            if s1 == s2:
                continue
            if abs(len(b1) - len(b2)) > max(len(b1), len(b2)) * 0.5:
                continue
            r = SequenceMatcher(None, b1, b2).ratio()
            if r >= 0.80:
                k = tuple(sorted([(s1, f1), (s2, f2)]))
                if k in seen:
                    continue
                seen.add(k)
                print(f"  相似度 {r:.2f}  {s1}({NAME_ZH.get(s1,'')}).{f1}  <->  {s2}({NAME_ZH.get(s2,'')}).{f2}  [{len(b1)} vs {len(b2)} 字符]")

    print("\n" + "=" * 100)
    print("四、函数体内出现的关键短语（判断画的是什么）")
    print("=" * 100)
    for s in sites:
        print(f"\n--- {s}（{NAME_ZH.get(s,'')}） ---")
        for fn, body in allf[s].items():
            strs = re.findall(r'["\u201c]([^"\u201d]{4,60})["\u201d]', body)
            strs = [x for x in strs if not x.startswith(("ctx", "2d", "rgba", "#"))]
            print(f"  {fn:<16} len={len(norm(body)):<6} 文案样本: " + " | ".join(strs[:3]))

    print("\n" + "=" * 100)
    print("五、通用兜底文案扫描：'用数学描述自然' 等模板句出现在哪些站")
    print("=" * 100)
    patterns = ["用数学描述自然", "拖动滑块改变参数", "中心位置", "峰宽", "曲线如何随之改变"]
    for pat in patterns:
        hits = [f"{s}({NAME_ZH.get(s,'')})" for s in sites if pat in srcs[s]]
        print(f"  「{pat}」 -> {', '.join(hits) if hits else '（无）'}")

    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "labs_bodies.json"), "w", encoding="utf-8") as f:
        json.dump({s: {k: v for k, v in d.items()} for s, d in allf.items()}, f, ensure_ascii=False, indent=1)
    print("\n[已写出] tools/labs_bodies.json")


if __name__ == "__main__":
    main()
