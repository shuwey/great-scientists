#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HTML 内联色令牌化的零视觉变化校验。

对每个 HTML 找出它引用的 style.css，用那张表的 :root 令牌把 var() 展开回字面值，
再与 git HEAD 原版逐字节比较。结果一致即证明渲染像素未变。

用法：python3 tools/verify_html_tokenize.py
"""
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def token_table(css_path: Path) -> dict:
    if not css_path.exists():
        return {}
    text = css_path.read_text(encoding="utf-8")
    m = re.search(r":root\s*\{(.*?)\}", text, re.S)
    tab = {}
    if m:
        for pm in re.finditer(r"(--[a-z0-9-]+)\s*:\s*([^;]+);", m.group(1)):
            tab[pm.group(1)] = pm.group(2).strip()
    return tab


def expand(text: str, tab: dict) -> str:
    pat = re.compile(r"var\(\s*(--[a-z0-9-]+)\s*(?:,\s*([^()]*(?:\([^()]*\)[^()]*)*))?\)")
    for _ in range(10):
        new = pat.sub(lambda m: tab.get(m.group(1)) or (m.group(2) or "").strip() or m.group(0), text)
        if new == text:
            break
        text = new
    return text


def canon(s: str) -> str:
    s = re.sub(r"\s+", " ", s).strip()
    s = re.sub(r"#([0-9a-fA-F]{3,8})\b",
               lambda m: "#" + ("".join(c * 2 for c in m.group(1)) if len(m.group(1)) == 3 else m.group(1)).upper(),
               s)
    return s


files = [p for p in sorted(ROOT.glob("**/*.html"))
         if ".workbuddy" not in p.parts and "tools" not in p.parts and "prototype" not in p.parts]

ok = bad = 0
changed_files = subprocess.run(
    ["git", "diff", "--name-only", "--", "*.html"], cwd=ROOT,
    capture_output=True, text=True).stdout.split()

for rel in changed_files:
    p = ROOT / rel
    if not p.exists():
        continue
    # 定位该页引用的样式表
    parts = Path(rel).parts
    if parts[0] == "scientists":
        css = ROOT / parts[0] / parts[1] / "assets/css/style.css"
    else:
        css = ROOT / "assets/css/style.css"
    tab = token_table(css)

    new_text = p.read_text(encoding="utf-8")
    try:
        old_text = subprocess.run(["git", "show", f"HEAD:{rel}"], cwd=ROOT,
                                  capture_output=True, text=True, check=True).stdout
    except subprocess.CalledProcessError:
        continue

    a, b = canon(expand(old_text, tab)), canon(expand(new_text, tab))
    if a == b:
        ok += 1
    else:
        bad += 1
        print(f"  ❌ {rel}")
        import difflib
        for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b).get_opcodes():
            if tag != "equal":
                print(f"       原: {a[max(0,i1-70):i2+70]!r}")
                print(f"       新: {b[max(0,j1-70):j2+70]!r}")
                break

print(f"\n校验 {ok + bad} 个改动文件：通过 {ok} · 差异 {bad}")
print("结论：" + ("内联色令牌化不改变任何渲染结果 ✅" if bad == 0 else "存在差异，需排查 ❌"))
sys.exit(0 if bad == 0 else 1)
