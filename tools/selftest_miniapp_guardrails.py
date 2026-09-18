#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""护栏自证 · 变异测试（小程序侧）

「校验器 N 项全过」只能证明当前工程是干净的，不能证明校验器拦得住错误。
所以对每条护栏注入一个人造错误，确认它真的报错——否则护栏只是个摆设
（本项目已经吃过一次：正向检查页面文件是否齐全，却看不见「跳转目标没登记」，
结果一个死链从 20 项全过的校验里溜了过去）。

做法：把 miniapp 复制到临时目录，在副本上注入变异，用 MINIAPP_DIR 指过去跑
validate_miniapp.py。真工程全程只读，不会留下任何脏状态。

用法：
    python3 tools/selftest_miniapp_guardrails.py
退出码非 0 表示有护栏失效（漏报）。
"""

import json
import os
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MP = os.path.join(ROOT, "miniapp")
VALIDATOR = os.path.join(ROOT, "tools", "validate_miniapp.py")

# (用例名, 相对文件, 原文锚点, 变异为, 期望出现在输出里的判据)
CASES = [
    (
        "页面未登记（死链）",
        "app.json",
        '"pages/scientist/index",',
        "",
        "跳转目标未登记在 app.json pages",
    ),
    (
        "switchTab 跳非 tabBar 页",
        "pages/portal/index.js",
        "wx.switchTab({ url: '/pages/glossary/index' });",
        "wx.switchTab({ url: '/pages/scientist/index' });",
        "wx.switchTab 只能跳 tabBar 页面",
    ),
    (
        "navigateTo 跳 tabBar 页",
        "pages/portal/index.js",
        "wx.navigateTo({ url: '/pages/scientist/index?id=' + id });",
        "wx.navigateTo({ url: '/pages/glossary/index?id=' + id });",
        "navigateTo/redirectTo 不能跳 tabBar 页面",
    ),
    (
        "require 路径不存在",
        "pages/portal/index.js",
        "require('../../utils/search')",
        "require('../../utils/searcher')",
        "require 路径解析不到",
    ),
    (
        "组件路径写错",
        "pages/portal/index.json",
        '"/components/term-popup/index"',
        '"/components/term-popup-typo/index"',
        "usingComponents 指向不存在的组件",
    ),
    (
        "tabBar 图标用了 SVG",
        "app.json",
        '"assets/tabbar/glossary.png"',
        '"assets/tabbar/glossary.svg"',
        "tabBar 图标必须是存在的 PNG",
    ),
]


def run_case(name, relfile, old, new, expect):
    """在干净副本上注入一个变异，看校验器是否报出预期判据。"""
    tmp = tempfile.mkdtemp(prefix="miniapp-mut-")
    try:
        dst = os.path.join(tmp, "miniapp")
        shutil.copytree(MP, dst)

        target = os.path.join(dst, relfile)
        if not os.path.exists(target):
            return False, "用例文件不存在：%s" % relfile

        with open(target, "r", encoding="utf-8") as f:
            src = f.read()
        if old not in src:
            return False, "变异锚点在 %s 里找不到（护栏脚本已与代码脱节）" % relfile

        with open(target, "w", encoding="utf-8") as f:
            f.write(src.replace(old, new, 1))

        return judge(dst, expect)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def judge(dst, expect):
    env = dict(os.environ, MINIAPP_DIR=dst)
    proc = subprocess.run(
        [sys.executable, VALIDATOR], capture_output=True, text=True, env=env
    )
    out = proc.stdout + proc.stderr
    caught = expect in out
    failed = proc.returncode != 0

    if caught and failed:
        return True, "拦住（报 %s，退出码 %d）" % (expect, proc.returncode)
    if caught and not failed:
        return False, "只打印了判据但退出码为 0（闸门没关）"
    return False, "漏报：没出现判据「%s」" % expect


def run_fn_case(name, fn, expect):
    """结构化变异：字符串替换表达不了的（如「把 A 节点的事件复制到 B 节点」）。"""
    tmp = tempfile.mkdtemp(prefix="miniapp-mut-")
    try:
        dst = os.path.join(tmp, "miniapp")
        shutil.copytree(MP, dst)
        fn(dst)
        return judge(dst, expect)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


# ---------------------------------------------------------------- 结构化变异
def _pages(dst):
    p = os.path.join(dst, "data", "pages.js")
    s = open(p, encoding="utf-8").read()
    i = s.index("module.exports = ") + len("module.exports = ")
    obj, _ = json.JSONDecoder().raw_decode(s, i)
    return p, s[:i], obj


def _save(p, head, obj):
    with open(p, "w", encoding="utf-8") as f:
        f.write(head + json.dumps(obj, ensure_ascii=False, indent=1) + ";\n")


def mut_dup_event(dst):
    """把 copernicus 有一条大事的节点，复制到一个空节点 → 同一站内重复。"""
    p, head, obj = _pages(dst)
    tl = obj["timeline"]["copernicus"]
    src = next(n for n in tl if (n.get("cn") or {}).get("ev"))
    dst_n = next(n for n in tl if not (n.get("cn") or {}).get("ev"))
    dst_n["cn"]["ev"] = [list(src["cn"]["ev"][0])]
    _save(p, head, obj)


def mut_dangling_cn_term(dst):
    """把某个历史名词 id 改错 → 端上胶囊点开是空弹层（点了毫无反应）。"""
    p = os.path.join(dst, "data", "pages.js")
    s = open(p, encoding="utf-8").read()
    if '"cn-nianhao"' not in s:
        raise SystemExit("！pages.js 里找不到 cn-nianhao")
    open(p, "w", encoding="utf-8").write(s.replace('"cn-nianhao"', '"cn-nianhao-typo"', 1))


def mut_drop_popup(dst):
    """时间轴页不再注册术语弹层组件 → 点名词什么都不发生。"""
    p = os.path.join(dst, "pages", "timeline", "index.json")
    s = open(p, encoding="utf-8").read()
    open(p, "w", encoding="utf-8").write(s.replace(
        '"usingComponents": {\n    "term-popup": "/components/term-popup/index"\n  }',
        '"usingComponents": {}', 1))


FN_CASES = [
    ("同期中国条目重复", mut_dup_event, "同一站内大事重复出现"),
    ("历史名词 id 悬空", mut_dangling_cn_term, "名词引用悬空"),
    ("时间轴页漏挂弹层", mut_drop_popup, "没注册 term-popup 组件"),
]


def main():
    print("=" * 68)
    print("护栏自证 · 对每条护栏注入一个人造错误，确认它拦得住")
    print("=" * 68)

    bad = 0
    for name, relfile, old, new, expect in CASES:
        passed, detail = run_case(name, relfile, old, new, expect)
        print("  %s  %-22s %s" % ("PASS" if passed else "FAIL", name, detail))
        if not passed:
            bad += 1

    for name, fn, expect in FN_CASES:
        passed, detail = run_fn_case(name, fn, expect)
        print("  %s  %-22s %s" % ("PASS" if passed else "FAIL", name, detail))
        if not passed:
            bad += 1

    # 反向：不改任何东西时必须全过（否则是误报，同样不能要）
    proc = subprocess.run([sys.executable, VALIDATOR], capture_output=True, text=True)
    clean = proc.returncode == 0
    print(
        "  %s  %-22s %s"
        % (
            "PASS" if clean else "FAIL",
            "原样工程应全过",
            "退出码 0" if clean else "误报：干净工程也报错",
        )
    )
    if not clean:
        bad += 1

    total = len(CASES) + len(FN_CASES) + 1
    print("\n" + "=" * 68)
    print("用例 %d 个（含 1 个误报反例）· 失效 %d 个" % (total, bad))
    print("=" * 68)
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
