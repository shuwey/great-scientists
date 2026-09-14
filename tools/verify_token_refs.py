#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查所有 var(--x) 引用是否都能解析到定义。

令牌化之后，最大的残留风险不是视觉差异（已被展开校验证明），
而是「引用了某站 :root 里不存在的令牌」——那时 var() 会失效并回退到继承值。

用法：python3 tools/verify_token_refs.py
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VAR_USE = re.compile(r"var\(\s*(--[a-z0-9-]+)")
VAR_DEF = re.compile(r"(--[a-z0-9-]+)\s*:")


def defs_of(css: Path) -> set:
    if not css.exists():
        return set()
    text = re.sub(r"/\*.*?\*/", "", css.read_text(encoding="utf-8"), flags=re.S)
    m = re.search(r":root\s*\{(.*?)\}", text, re.S)
    if not m:
        return set()
    return set(VAR_DEF.findall(m.group(1)))


root_defs = defs_of(ROOT / "assets/css/style.css")
sub_defs = {}
for d in sorted((ROOT / "scientists").iterdir()):
    if d.is_dir():
        sub_defs[d.name] = defs_of(d / "assets/css/style.css")

print(f"根 :root 令牌 {len(root_defs)} 个；15 子站各 {len(next(iter(sub_defs.values())))} 个左右")
sizes = {k: len(v) for k, v in sub_defs.items()}
if len(set(sizes.values())) > 1:
    print(f"  ⚠ 子站令牌数量不一致：{sizes}")

def local_defs(html: str) -> set:
    """页面自身 <style> 块里定义的令牌（原型页常自带 :root）。"""
    out = set()
    for m in re.finditer(r"<style[^>]*>(.*?)</style>", html, re.S | re.I):
        block = re.sub(r"/\*.*?\*/", "", m.group(1), flags=re.S)
        for rm in re.finditer(r":root\s*\{(.*?)\}", block, re.S):
            out |= set(VAR_DEF.findall(rm.group(1)))
    return out


problems = 0

# 1) 检查 HTML 内联 style 与 <style> 块
for f in sorted(ROOT.glob("**/*.html")):
    if ".workbuddy" in f.parts or "tools" in f.parts:
        continue
    rel = f.relative_to(ROOT)
    parts = rel.parts
    text = f.read_text(encoding="utf-8")
    if parts[0] == "scientists":
        avail = sub_defs.get(parts[1], set()) | local_defs(text)
    elif "prototype" in parts:
        avail = local_defs(text)  # 原型未引入样式表，只靠自身 <style>
    else:
        avail = root_defs | local_defs(text)
    missing = sorted({v for v in VAR_USE.findall(text) if v not in avail})
    if missing:
        problems += 1
        print(f"  ❌ {rel}")
        for m in missing:
            print(f"        var({m}) 未定义")

# 2) 检查 CSS 文件自身的引用
for css in [ROOT / "assets/css/style.css"] + sorted(ROOT.glob("scientists/*/assets/css/style.css")):
    own = defs_of(css)
    text = re.sub(r"/\*.*?\*/", "", css.read_text(encoding="utf-8"), flags=re.S)
    refs = set(VAR_USE.findall(text))
    # 允许引用根级通用令牌
    missing = sorted(r for r in refs if r not in own and r not in root_defs)
    if missing:
        problems += 1
        label = "ROOT" if css.parent.parent.parent == ROOT else css.parts[-4]
        print(f"  ❌ [CSS] {label}: {missing}")

print()
if problems == 0:
    print("✅ 全部 var() 引用均可解析 —— 无悬空令牌")
else:
    print(f"❌ 发现 {problems} 处悬空引用")
sys.exit(0 if problems == 0 else 1)
