#!/usr/bin/env python3
"""把已打好的动画闸门升级成"懒注入"版本（一次性收尾脚本，幂等）。

原因：initLabs 里是按"初始化时排过 rAF"来注入按钮的，这漏掉了
牛顿抛体这类"点了发射才开始动"的实验。改成在闸门里首次排 rAF 时注入，
两种实验就都能拿到按钮。

用法：python3 tools/upgrade_pause_step_lazy.py
"""
import os
import sys
import glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

OLD = """    if (rec) rec.used = true;
    return __rafReal(function (ts) {"""

NEW = """    if (rec) {
      rec.used = true;
      /* 首次排 rAF 时才注入按钮：这样"打开就在跑"的实验立刻有按钮，
         "点了发射才开始跑"的实验（如牛顿抛体）也会在启动那一刻拿到按钮。 */
      if (!rec.tools) { rec.tools = true; __addAnimTools(rec.lab, rec); }
    }
    return __rafReal(function (ts) {"""

n = 0
for f in sorted(glob.glob(os.path.join(ROOT, "scientists", "*", "assets", "js", "site.js"))):
    src = open(f, encoding="utf-8").read()
    rel = os.path.relpath(f, ROOT)
    if "__labAnims" not in src:
        print(f"  {rel:<48} skip(未打闸门)")
        continue
    if "rec.tools" in src:
        print(f"  {rel:<48} skip(已是懒注入)")
        continue
    if OLD not in src:
        print(f"  {rel:<48} FAIL(锚点未命中)")
        continue
    open(f, "w", encoding="utf-8").write(src.replace(OLD, NEW, 1))
    n += 1
    print(f"  {rel:<48} OK")
print(f"\n升级 {n} 个文件")
sys.exit(0)
