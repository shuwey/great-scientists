#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把打印样式块里的裸值 `a { color: #000; }` 令牌化为 `var(--print-ink)`。

背景
----
这一行位于 `@media print` 内，作用是打印时把链接压成黑色（印刷常规：不吐彩墨）。
它的语义是「打印墨色」，不是品牌色 —— 直接换成 var(--brand) 会让打印件
出现蓝色链接，属于视觉回归。因此给它一个等值语义令牌，既清掉最后一个
硬编码字面值，又保证打印渲染像素零变化（由 verify_tokenize.py 数学证明）。

用法
----
  python3 tools/tokenize_print_link.py            # dry-run，只报告
  python3 tools/tokenize_print_link.py --apply    # 写入
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FILES = [ROOT / "assets/css/style.css"] + sorted(
    (ROOT / "scientists").glob("*/assets/css/style.css")
)

TOKEN_NAME = "--print-ink"
TOKEN_VALUE = "#000000"
OLD_RULE = "  a { color: #000; }"
NEW_RULE = "  a { color: var(--print-ink); }"

apply = "--apply" in sys.argv
if not apply:
    print("（dry-run 模式，加 --apply 才写入）\n")

changed, skipped, warned = 0, 0, 0
for f in FILES:
    rel = f.relative_to(ROOT)
    src = f.read_text(encoding="utf-8")

    if TOKEN_NAME + " " in src or TOKEN_NAME + ":" in src:
        print(f"  · {rel}  已令牌化，跳过")
        skipped += 1
        continue

    if OLD_RULE not in src:
        print(f"  ⚠ {rel}  未找到打印链接规则，跳过")
        warned += 1
        continue

    # 从 --white 行提取冒号列，新令牌按同列对齐
    anchor = re.search(r"^( *--white\s*:\s*#FFFFFF;)\s*$", src, re.M)
    if not anchor:
        print(f"  ⚠ {rel}  未找到 --white 锚点，跳过")
        warned += 1
        continue

    indent = len(anchor.group(1)) - len(anchor.group(1).lstrip())
    colon_col = anchor.group(1).index(":")
    token_line = (
        " " * indent
        + TOKEN_NAME.ljust(colon_col - indent)
        + ": "
        + TOKEN_VALUE
        + ";\n"
    )

    out = src
    out = out[: anchor.end()] + "\n" + token_line + out[anchor.end() :]
    out = out.replace(OLD_RULE, NEW_RULE, 1)

    if apply:
        f.write_text(out, encoding="utf-8")

    print(f"  {'✅' if apply else '·'} {rel}  +令牌 1，规则替换 ×1")
    changed += 1

print()
print(f"共 {len(FILES)} 个文件：改动 {changed}，已就绪跳过 {skipped}，异常 {warned}")
if not apply and changed:
    print("→ 复核无误后执行：python3 tools/tokenize_print_link.py --apply")
