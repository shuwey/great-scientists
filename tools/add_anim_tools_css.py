#!/usr/bin/env python3
"""P1-3 配套：把「动画闸门 暂停/单步」按钮的样式追加到各站 style.css（以及根参考样式）。

幂等：含 `.lab-anim-tools` 就跳过。
用法：python3 tools/add_anim_tools_css.py [--dry-run]
"""
import os
import sys
import glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DRY = "--dry-run" in sys.argv

BLOCK = """
/* ===== 动画闸门：暂停 / 单步（把动画的控制权交还使用者） ===== */
.lab-anim-tools {
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
  margin: 12px 0 2px; font-size: 13px; color: var(--ink-2);
}
.lab-anim-btn {
  appearance: none; -webkit-appearance: none; cursor: pointer;
  padding: 5px 12px; border-radius: 999px; font-size: 13px; font-weight: 700;
  background: var(--bg-alt); border: 1px solid var(--line); color: var(--ink-2);
  font-family: inherit; line-height: 1.4;
  transition: background .16s, color .16s, border-color .16s;
}
.lab-anim-btn:hover { background: #fff; color: var(--brand); border-color: var(--brand-line); }
.lab-anim-btn.on { background: var(--brand); border-color: var(--brand); color: #fff; }
.lab-anim-tip { opacity: .75; }
.lab-anim-tools.paused .lab-anim-tip { opacity: 1; color: var(--brand); font-weight: 700; }
"""

targets = sorted(glob.glob(os.path.join(ROOT, "scientists", "*", "assets", "css", "style.css")))
targets.append(os.path.join(ROOT, "assets", "css", "style.css"))

n_ok = 0
for f in targets:
    if not os.path.exists(f):
        print(f"  {os.path.relpath(f, ROOT):<52} MISSING")
        continue
    src = open(f, encoding="utf-8").read()
    rel = os.path.relpath(f, ROOT)
    if ".lab-anim-tools" in src:
        print(f"  {rel:<52} skip(已打过)")
        continue
    if not DRY:
        with open(f, "a", encoding="utf-8") as fh:
            fh.write(BLOCK)
    n_ok += 1
    print(f"  {rel:<52} OK")

print(f"\n共 {len(targets)} 个 style.css，写入 {n_ok} 个" + ("（dry-run）" if DRY else ""))
