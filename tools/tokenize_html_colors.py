#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把 HTML 内联 style="..." 里逃逸的硬编码颜色收敛为 var() 引用。

与 CSS 批次同一原则：只做同值替换，渲染零变化。
范围刻意收窄 —— 只处理「与既有/新增令牌同值」的品牌色与中性色。
labs.html 里那些实验图例的数据系列色（#E03131 / #9C36B5 / #51CF66 …）
是有意不统一的图表调色板，不在映射表内，因此不会被触碰。

用法：
  python3 tools/tokenize_html_colors.py --dry-run
  python3 tools/tokenize_html_colors.py
"""
import re
import argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

MAP = {
    # 品牌
    "#3B5BDB": "--brand",
    "#6E8BFF": "--brand-light",
    "#2F49AF": "--brand-dark",
    "#EDF1FD": "--brand-soft",
    "#C7D2FE": "--brand-line",
    # 强调 / 功能辅色
    "#F59F00": "--accent",
    "#FFF8E9": "--accent-soft",
    "#F2D675": "--accent-line",
    "#0CA678": "--green",
    "#E6FCF5": "--green-soft",
    "#087F5B": "--green-ink",
    "#7048E8": "--purple",
    "#F1EBFF": "--purple-soft",
    "#5B30C4": "--purple-ink",
    "#E8590C": "--orange",
    "#FFF0E8": "--orange-soft",
    "#C2410C": "--orange-ink",
    # 中性
    "#1B2530": "--ink",
    "#14202B": "--ink-strong",
    "#2B3644": "--ink-body",
    "#56617A": "--ink-2",
    "#5C6B82": "--ink-soft",
    "#8B96AA": "--ink-3",
    "#E3E8EF": "--line",
    "#D4DBE5": "--line-2",
    "#EDF1F7": "--bg-alt",
    "#F7F9FC": "--bg",
    "#FBFCFE": "--bg-elev",
    "#F4F6FA": "--img-bg",
    "#FFFFFF": "--card",
    "#FFF": "--card",
    # 高亮 / 页脚
    "#FFF3BF": "--highlight-bg",
    "#6B4E12": "--highlight-fg",
    "#A9B4C4": "--foot-fg",
    "#CBD5E1": "--foot-link",
    "#2C3846": "--foot-line",
    "#7B8798": "--foot-dim",
}

STYLE_ATTR = re.compile(r'style="([^"]*)"', re.I)
COLOR_RE = re.compile(r"#[0-9a-fA-F]{3,8}\b")


def norm(v: str) -> str:
    return v.upper()


def tokenize(html: str, stats: dict):
    def repl_style(m):
        body = m.group(1)

        def repl_color(cm):
            key = norm(cm.group(0))
            # 6 位优先于 3 位：正则已贪婪匹配，无需额外处理
            tok = MAP.get(key)
            if not tok:
                stats.setdefault("skipped", {}).setdefault(key, 0)
                stats["skipped"][key] += 1
                return cm.group(0)
            stats[key] = stats.get(key, 0) + 1
            return f"var({tok})"

        return 'style="' + COLOR_RE.sub(repl_color, body) + '"'

    return STYLE_ATTR.sub(repl_style, html)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    files = [p for p in sorted(ROOT.glob("**/*.html"))
             if ".workbuddy" not in p.parts
             and "tools" not in p.parts
             # prototype/ 是原型草稿，未引入 style.css，var() 会失效
             and "prototype" not in p.parts]

    grand, skipped_all, changed = {}, {}, 0
    for f in files:
        raw = f.read_text(encoding="utf-8")
        if "style=" not in raw:
            continue
        stats = {}
        new = tokenize(raw, stats)
        hits = sum(v for k, v in stats.items() if k != "skipped")
        if not hits:
            continue
        changed += 1
        if not args.dry_run:
            f.write_text(new, encoding="utf-8")
        for k, v in stats.items():
            if k == "skipped":
                for kk, vv in v.items():
                    skipped_all[kk] = skipped_all.get(kk, 0) + vv
            else:
                grand[k] = grand.get(k, 0) + v

    print(f"涉及文件 {changed} / {len(files)}")
    print(f"\n=== 合计替换 {sum(grand.values())} 处 ===")
    for k, v in sorted(grand.items(), key=lambda x: -x[1]):
        print(f"  {k:<12} → var({MAP[k]:<16}) ×{v}")
    print(f"\n=== 有意跳过（不在映射表内）===")
    for k, v in sorted(skipped_all.items(), key=lambda x: -x[1])[:25]:
        print(f"  {k:<12} ×{v}")
    if args.dry_run:
        print("\n[dry-run] 未写入任何文件")


if __name__ == "__main__":
    main()
