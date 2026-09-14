#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
令牌化零视觉变化校验。

原理：把改后文件里所有 `var(--x)` 展开回它的字面值，若结果与 git HEAD 的原版
逐字节一致（除 :root 新增的令牌定义行外），即证明渲染像素不会发生任何变化。

用法：python3 tools/verify_tokenize.py
"""
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FILES = ["assets/css/style.css"] + [f"scientists/{p}/assets/css/style.css" for p in sorted(
    d.name for d in (ROOT / "scientists").iterdir() if d.is_dir()
)]


def token_table(text: str) -> dict:
    m = re.search(r":root\s*\{(.*?)\}", text, re.S)
    tab = {}
    if not m:
        return tab
    for pm in re.finditer(r"(--[a-z0-9-]+)\s*:\s*([^;]+);", m.group(1)):
        tab[pm.group(1)] = pm.group(2).strip()
    return tab


def expand(text: str, tab: dict) -> str:
    """把 var(--x) / var(--x, fallback) 展开为字面值，迭代到不动点。"""
    pat = re.compile(r"var\(\s*(--[a-z0-9-]+)\s*(?:,\s*([^()]*(?:\([^()]*\)[^()]*)*))?\)")
    for _ in range(10):
        new = pat.sub(lambda m: tab.get(m.group(1)) or (m.group(2) or "").strip() or m.group(0), text)
        if new == text:
            break
        text = new
    return text


def norm_ws(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def canon_color(s: str) -> str:
    """CSS 颜色等价性归一：#fff == #FFFFFF。"""
    def six(m):
        h = m.group(1)
        if len(h) == 3:
            h = "".join(c * 2 for c in h)
        return "#" + h.upper()

    s = re.sub(r"#([0-9a-fA-F]{3,8})\b", six, s)
    # rgba(59,91,219,.32) 与 rgba(59, 91, 219, .32) 等价
    s = re.sub(r"rgba?\(([^)]*)\)",
               lambda m: "rgba(" + ",".join(x.strip() for x in m.group(1).split(",")) + ")",
               s, flags=re.I)
    return s


ok_all = True
for rel in FILES:
    p = ROOT / rel
    if not p.exists():
        continue
    new_text = p.read_text(encoding="utf-8")
    try:
        old_text = subprocess.run(
            ["git", "show", f"HEAD:{rel}"],
            cwd=ROOT, capture_output=True, text=True, check=True
        ).stdout
    except subprocess.CalledProcessError:
        print(f"  {rel}: 不在 git 中，跳过")
        continue

    tab = token_table(new_text)
    # 两侧都要展开：原版里同样存在 var(--sans) 这类既有引用，
    # 只展开新版会造成假阳性。用同一张令牌表处理，对比才公平。
    expanded = expand(new_text, tab)
    old_text = expand(old_text, tab)
    # 只比较 :root 之外的声明体（:root 新增令牌是预期差异）
    def outside_root(t):
        m = re.search(r":root\s*\{", t)
        if not m:
            return t
        d, k = 1, m.end()
        while k < len(t) and d:
            if t[k] == "{":
                d += 1
            elif t[k] == "}":
                d -= 1
            k += 1
        return t[:m.end()] + t[k:]

    a = canon_color(norm_ws(outside_root(old_text)))
    b = canon_color(norm_ws(outside_root(expanded)))
    label = "ROOT" if rel.startswith("assets") else rel.split("/")[1]
    if a == b:
        print(f"  ✅ {label:<12} 展开后与原版逐字节一致")
    else:
        ok_all = False
        print(f"  ❌ {label:<12} 存在差异")
        # 定位第一处差异
        import difflib
        sm = difflib.SequenceMatcher(None, a, b)
        for tag, i1, i2, j1, j2 in sm.get_opcodes():
            if tag != "equal":
                print(f"       原: ...{a[max(0,i1-60):i2+60]!r}")
                print(f"       新: ...{b[max(0,j1-60):j2+60]!r}")
                break

print()
print("结论：" + ("全部通过 —— 令牌化不改变任何渲染结果 ✅" if ok_all else "存在差异，需排查 ❌"))
sys.exit(0 if ok_all else 1)
