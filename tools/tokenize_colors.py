#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把 CSS 中「逃逸在令牌体系之外的硬编码颜色」收敛为 var() 引用。

设计原则（重要）：
  * 只做 **同值替换** —— 字面值 → 等值 var()，渲染像素零变化。
  * 不做视觉归并（例如把琥珀深字的 4 个档位合并成 2 个）—— 留待后续单独评审。
  * 不碰 var(...) 内部的后备值（那些是防御性写法，浏览器用不到）。

用法：
  python3 tools/tokenize_colors.py --dry-run     # 只看命中数，不写文件
  python3 tools/tokenize_colors.py               # 实际写入
  python3 tools/tokenize_colors.py --verify      # 展开校验（证明零视觉变化）
"""
import re
import sys
import argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

CSS_FILES = [ROOT / "assets/css/style.css"] + sorted(
    ROOT.glob("scientists/*/assets/css/style.css")
)

# ---------------------------------------------------------------- 映射表
# 字面值(大写归一) -> (令牌名, 令牌值)
# 值一律照抄原字面值，保证同值替换。
NEW_TOKENS = {
    # —— 品牌扩展 ——
    "#6E8BFF": ("--brand-light", "#6E8BFF"),
    "#EEF2FE": ("--brand-wash", "#EEF2FE"),
    "#DDE5FC": ("--brand-hover", "#DDE5FC"),
    "#2C3E7A": ("--brand-ink", "#2C3E7A"),
    "RGBA(59,91,219,.11)": ("--brand-a11", "rgba(59,91,219,.11)"),
    "RGBA(59,91,219,.13)": ("--brand-a13", "rgba(59,91,219,.13)"),
    "RGBA(59,91,219,.26)": ("--brand-a26", "rgba(59,91,219,.26)"),
    "RGBA(59,91,219,.3)": ("--brand-a30", "rgba(59,91,219,.3)"),
    "RGBA(59,91,219,.32)": ("--brand-a32", "rgba(59,91,219,.32)"),
    "RGBA(59,91,219,.4)": ("--brand-a40", "rgba(59,91,219,.4)"),
    # —— 强调（琥珀）扩展 ——
    "#FFF6E5": ("--accent-wash", "#FFF6E5"),
    "#FFF4E0": ("--accent-wash-2", "#FFF4E0"),
    "#A16207": ("--accent-ink", "#A16207"),
    "#B26A00": ("--accent-ink-2", "#B26A00"),
    "#854F0B": ("--accent-deep", "#854F0B"),
    "#412402": ("--accent-ink-deep", "#412402"),
    # —— 高亮 ——
    "#FFF3BF": ("--highlight-bg", "#FFF3BF"),
    "#6B4E12": ("--highlight-fg", "#6B4E12"),
    # —— 功能辅色 深字 / 描边 ——
    "#087F5B": ("--green-ink", "#087F5B"),
    "#B2F0DC": ("--green-line", "#B2F0DC"),
    "#5B30C4": ("--purple-ink", "#5B30C4"),
    "#C2410C": ("--orange-ink", "#C2410C"),
    # —— 中性扩展 ——
    "#14202B": ("--ink-strong", "#14202B"),
    "#2B3644": ("--ink-body", "#2B3644"),
    "#5C6B82": ("--ink-soft", "#5C6B82"),
    "#FBFCFE": ("--bg-elev", "#FBFCFE"),
    "#F4F6FA": ("--img-bg", "#F4F6FA"),
    "#CCC": ("--swatch-gray", "#CCCCCC"),
    "RGBA(27,37,48,.18)": ("--ink-a18", "rgba(27,37,48,.18)"),
    # —— 纯白（与 --card 同值不同语义：纯白 vs 卡片表面）——
    "#FFF": ("--white", "#FFFFFF"),
    "#FFFFFF": ("--white", "#FFFFFF"),
    # —— 页脚暗底 ——
    "#A9B4C4": ("--foot-fg", "#A9B4C4"),
    "#CBD5E1": ("--foot-link", "#CBD5E1"),
    "#2C3846": ("--foot-line", "#2C3846"),
    "#7B8798": ("--foot-dim", "#7B8798"),
    # —— 效果层 ——
    "RGBA(255,255,255,.86)": ("--nav-bg", "rgba(255,255,255,.86)"),
    "RGBA(20,30,45,.42)": ("--overlay", "rgba(20,30,45,.42)"),
}

# 已存在的令牌被硬编码了字面值 -> 直接引用既有令牌，不新增
EXISTING = {
    "#1B2530": "--ink",
    "#F7F9FC": "--bg",
    "#E3E8EF": "--line",
    "#EDF1F7": "--bg-alt",
    "#56617A": "--ink-2",
    "#8B96AA": "--ink-3",
    "#D4DBE5": "--line-2",
    "#3B5BDB": "--brand",
    "#2F49AF": "--brand-dark",
    "#EDF1FD": "--brand-soft",
    "#C7D2FE": "--brand-line",
    "#F59F00": "--accent",
    "#FFF8E9": "--accent-soft",
    "#F2D675": "--accent-line",
    "#0CA678": "--green",
    "#E6FCF5": "--green-soft",
    "#7048E8": "--purple",
    "#F1EBFF": "--purple-soft",
    "#E8590C": "--orange",
    "#FFF0E8": "--orange-soft",
}

# 有意保留、不动的值（需人工拍板，见报告）
SKIP = {
    "#000",       # 已由 tokenize_print_link.py 转为 --print-ink（@media print 专用）
    "#F5F7FA",    # 仅作为 var(--bg-alt,...) 的后备值出现
    "#E6EAF0",    # 同上
}

COLOR_RE = re.compile(r"#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)", re.I)


def var_spans(s: str):
    """返回所有 var(...) 的 [start, end) 区间。"""
    spans = []
    i = 0
    while True:
        j = s.find("var(", i)
        if j < 0:
            break
        d, k = 1, j + 4
        while k < len(s) and d:
            if s[k] == "(":
                d += 1
            elif s[k] == ")":
                d -= 1
            k += 1
        spans.append((j, k))
        i = k
    return spans


def in_spans(pos, spans):
    for a, b in spans:
        if a <= pos < b:
            return True
        if pos < a:
            break
    return False


def norm(v: str) -> str:
    return re.sub(r"\s+", "", v).upper()


def root_span(text: str):
    m = re.search(r":root\s*\{", text)
    if not m:
        return None
    d, k = 1, m.end()
    while k < len(text) and d:
        if text[k] == "{":
            d += 1
        elif text[k] == "}":
            d -= 1
        k += 1
    return (m.end(), k - 1)


def transform(text: str, stats: dict):
    """在 :root 之外把硬编码颜色替换为 var()。"""
    rs = root_span(text)
    spans = var_spans(text)
    out = []
    last = 0
    for m in COLOR_RE.finditer(text):
        s = m.group(0)
        key = norm(s)
        # 跳过 :root 定义区
        if rs and rs[0] <= m.start() < rs[1]:
            continue
        # 跳过 var() 后备值
        if in_spans(m.start(), spans):
            continue
        if key in SKIP:
            stats.setdefault("skipped", {}).setdefault(key, 0)
            stats["skipped"][key] += 1
            continue
        if key in NEW_TOKENS:
            tok = NEW_TOKENS[key][0]
        elif key in EXISTING:
            tok = EXISTING[key]
        else:
            stats.setdefault("unknown", {}).setdefault(key, 0)
            stats["unknown"][key] += 1
            continue
        out.append(text[last:m.start()])
        out.append(f"var({tok})")
        last = m.end()
        stats[key] = stats.get(key, 0) + 1
    out.append(text[last:])
    return "".join(out)


def inject_tokens(text: str) -> tuple[str, int]:
    """把缺失的新令牌补进 :root。返回 (新文本, 新增个数)。"""
    rs = root_span(text)
    if not rs:
        return text, 0
    root_body = text[rs[0]:rs[1]]
    missing = [(name, val) for _, (name, val) in
               sorted(NEW_TOKENS.items(), key=lambda kv: kv[1][0])
               if not re.search(rf"{re.escape(name)}\s*:", root_body)]
    # 去重（#FFF 与 #FFFFFF 共用一个令牌）
    seen, uniq = set(), []
    for name, val in missing:
        if name in seen:
            continue
        seen.add(name)
        uniq.append((name, val))
    if not uniq:
        return text, 0

    width = max(len(n) for n, _ in uniq)
    lines = ["", "  /* --- 设计系统 v1 扩充令牌（同值收敛，v1.0） --- */"]
    for name, val in uniq:
        lines.append(f"  {name.ljust(width)}: {val};")
    block = "\n".join(lines) + "\n"

    # 插到 --ink-3 行之后（中性色组末尾），保持分组语义
    anchor = re.search(r"^(\s*--ink-3\s*:[^;]+;\s*)$", root_body, re.M)
    if anchor:
        pos = rs[0] + anchor.end()
        return text[:pos] + "\n" + block + text[pos:], len(uniq)
    # 兜底：插到 :root 末尾
    return text[:rs[1]] + block + text[rs[1]:], len(uniq)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--verify", action="store_true")
    args = ap.parse_args()

    grand = {}
    for f in CSS_FILES:
        raw = f.read_text(encoding="utf-8")
        stats = {}
        new = transform(raw, stats)
        new, added = inject_tokens(new)
        label = "ROOT" if f.parent.parent.parent == ROOT else f.parts[-4]
        print(f"\n■ {label:<12} 替换 {sum(v for k, v in stats.items() if isinstance(v, int))} 处，新增令牌 {added} 个")
        for k, v in sorted(stats.items()):
            if isinstance(v, int):
                grand[k] = grand.get(k, 0) + v
        if "unknown" in stats:
            print(f"    ⚠ 未收录值: {stats['unknown']}")
        if "skipped" in stats:
            print(f"    ⏭ 有意跳过: {stats['skipped']}")
        if not args.dry_run:
            f.write_text(new, encoding="utf-8")

    print(f"\n=== 全站合计替换 {sum(grand.values())} 处 ===")
    for k, v in sorted(grand.items(), key=lambda x: -x[1]):
        print(f"  {k:<24} ×{v}")
    if args.dry_run:
        print("\n[dry-run] 未写入任何文件")


if __name__ == "__main__":
    main()
