#!/usr/bin/env python3
"""让所有锚点跳转都避开吸顶导航。

问题：`scroll-margin-top` 只写在 `.article h2` 上。而锚点并不都在 h2 上 ——
牛顿的 `#story` 挂在 <p>、`#impact`/`#try` 挂在 <li>、`#formula` 挂在 <div>、
`#misread` 挂在 <p>。这些元素跳过去正好停在 y=0，被 62px 的吸顶导航压住，
第一行字看不见 —— 点「了解更多」跳是跳了，等于没跳到位。

改法：补一条 `[id]` 通用规则。16 份样式表的插入点逐字节相同，精确整段替换。幂等。
用法：python3 tools/fix_anchor_offset.py [--apply]
"""
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
APPLY = "--apply" in sys.argv

MARK = ".article h2:first-child { margin-top: 0; }"

ADD = """

/* 任何可能作为锚点的元素，跳转时都让开吸顶导航。
   .article h2 那条只覆盖了 h2，而术语锚点还有挂在 <p>/<li>/<div> 上的，
   它们会正好停在 y=0 被导航栏压住，跳过去等于没跳到位。 */
[id] { scroll-margin-top: calc(var(--nav-h) + 16px); }"""

files = [ROOT / "assets/css/style.css"] + sorted(ROOT.glob("scientists/*/assets/css/style.css"))
print(f"目标 {len(files)} 份样式表\n")

hit, skip, miss = [], [], []
for f in files:
    t = f.read_text(encoding="utf-8")
    if "[id] { scroll-margin-top" in t:
        skip.append(f)
        continue
    n = t.count(MARK)
    if n != 1:
        miss.append((f, n))
        continue
    if APPLY:
        f.write_text(t.replace(MARK, MARK + ADD, 1), encoding="utf-8")
    hit.append(f)

for f in hit:
    print(f"   {'✓ 已改' if APPLY else '· 待改'} {f.relative_to(ROOT)}")
for f in skip:
    print(f"   = 已有规则（跳过）{f.relative_to(ROOT)}")
for f, n in miss:
    print(f"   ✗ 插入点命中 {n} 次（异常）{f.relative_to(ROOT)}")

print(f"\n命中 {len(hit)} · 已有 {len(skip)} · 异常 {len(miss)}")
if not APPLY:
    print("（预演，未写入；加 --apply 执行）")
sys.exit(1 if miss else 0)
