#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""读懂科学家 · 小程序静态校验

对应静态站的 validate_site.py，管的是小程序这一侧的判据。检查项：

  1. 产出数据能解析、计数自洽（15 位 / 398 条）
  2. 元数据完整性：id 唯一、学科色合法、图标文件真实存在
  3. 富文本合法：不含 class=（rich-text 不认）、标签在白名单内
  4. 路由自洽：app.json 的 pages 四件套齐全、tabBar 页面必须在主包、
     tabBar 图标必须是 PNG（小程序不支持 SVG）
  5. usingComponents 指向的组件存在
  5b. 跳转自洽（★ 反向检查）：代码里 navigateTo / redirectTo / switchTab 的
     目标必须已登记在 app.json；switchTab 只能跳 tabBar 页（微信硬规则）；
     navigateTo 不能跳 tabBar 页；require 的相对路径必须能解析
  6. 包体积预算（主包 ≤ 2MB；本项目的目标是留足余量）
  7. 提审红线词扫描（个人主体类目红线）

护栏本身也要自证：`tools/selftest_miniapp_guardrails.py` 会注入人造错误，
确认上面每条真的拦得住（「全过」只说明工程干净，不说明护栏有效）。

用法：
    python3 tools/validate_miniapp.py
退出码非 0 表示有 ERROR。
"""

import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# 允许指向副本：tools/selftest_miniapp_guardrails.py 的变异测试必须在副本上注入
# 人造错误，不能把已知错误写进真工程再跑。
MP = os.environ.get("MINIAPP_DIR") or os.path.join(ROOT, "miniapp")

# 个人主体提审红线词（与静态站的机审扫描同一个词表）
REDLINE = [
    "课程", "培训", "辅导", "报名", "学费", "收费", "资料包", "购买", "兑换",
    "会员", "订阅", "直播", "题库", "答疑", "一对一", "教学", "上课",
    "支付", "打赏", "充值", "办卡", "拼团", "优惠券",
]
# 这些是允许出现的说明性用法（关于页/隐私页里说明"不含付费内容"等）
REDLINE_ALLOW = {"付费内容", "不含任何付费", "非经营性"}

ERRORS = []
WARNINGS = []
CHECKS = [0]


def ok(msg):
    CHECKS[0] += 1
    print("  OK   %s" % msg)


def err(msg):
    ERRORS.append(msg)
    print("  ERR  %s" % msg)


def warn(msg):
    WARNINGS.append(msg)
    print("  WARN %s" % msg)


def read(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def load_module(path):
    """把生成的 `module.exports = {...}` 模块当 JSON 读回来。"""
    src = read(path)
    i = src.index("module.exports = ")
    body = src[i + len("module.exports = "):].rstrip()
    if body.endswith(";"):
        body = body[:-1]
    return json.loads(body)


# ---------------------------------------------------------------- 1. 数据层
def check_data():
    print("\n[1] 数据层")
    roster = load_module(os.path.join(MP, "data", "roster.js"))
    terms = load_module(os.path.join(MP, "data", "terms.js"))

    scientists = roster["scientists"]
    if len(scientists) == 15:
        ok("roster：15 位科学家")
    else:
        err("roster：期望 15 位，实得 %d 位" % len(scientists))

    ids = [s["id"] for s in scientists]
    if len(set(ids)) == len(ids):
        ok("roster：id 唯一")
    else:
        err("roster：id 有重复 -> %s" % ids)

    nos = [s["no"] for s in scientists]
    if all(re.fullmatch(r"\d{2}", n or "") for n in nos) and len(set(nos)) == len(nos):
        ok("roster：编号 01–15 唯一")
    else:
        err("roster：编号异常 -> %s" % nos)

    bad_color = [s["id"] for s in scientists if not re.fullmatch(r"#[0-9A-Fa-f]{6}", s.get("discColor") or "")]
    if bad_color:
        err("roster：学科色非法 -> %s" % bad_color)
    else:
        ok("roster：学科色均为 #RRGGBB")

    missing_icon = []
    for s in scientists:
        p = os.path.join(MP, (s.get("iconMini") or "").lstrip("/"))
        if not s.get("iconMini") or not os.path.exists(p):
            missing_icon.append(s["id"])
    if missing_icon:
        err("roster：图标文件缺失 -> %s" % missing_icon)
    else:
        ok("roster：15 张图标文件均存在")

    by_sci = terms["bySci"]
    flat = terms["flatIndex"]
    total = sum(len(v["terms"]) for v in by_sci.values())
    if total == len(flat):
        ok("terms：bySci 术语数(%d) 与 flatIndex(%d) 一致" % (total, len(flat)))
    else:
        err("terms：bySci 合计 %d，flatIndex %d，不一致" % (total, len(flat)))

    if len(flat) == 398:
        ok("terms：398 条（与静态站一致）")
    else:
        warn("terms：%d 条，静态站基线是 398 条" % len(flat))

    covered = set(by_sci.keys()) == set(ids)
    if covered:
        ok("terms：15 位科学家全部有术语数据")
    else:
        err("terms：缺失术语数据的科学家 -> %s" % (set(ids) - set(by_sci.keys())))

    dangling = [x["sci"] + "/" + x["k"] for x in flat if x["k"] not in by_sci.get(x["sci"], {}).get("terms", {})]
    if dangling:
        err("terms：flatIndex 有 %d 条无法回指 bySci -> %s" % (len(dangling), dangling[:5]))
    else:
        ok("terms：flatIndex 每条都能回指 bySci")

    # 相关术语悬空检查
    dangling_rel = []
    for sid, bundle in by_sci.items():
        for k, t in bundle["terms"].items():
            for rk in t.get("related") or []:
                if rk not in bundle["terms"]:
                    dangling_rel.append("%s/%s->%s" % (sid, k, rk))
    if dangling_rel:
        warn("terms：%d 个 related 指向不存在的术语（静态站本就如此，前端已过滤）" % len(dangling_rel))
    else:
        ok("terms：related 全部可解析")

    return roster, terms


# ------------------------------------------------------------- 2. 富文本
def check_richtext(terms):
    print("\n[2] 富文本（rich-text 兼容）")
    fields = ("short", "plain", "analogy", "extra")
    allowed = {"span", "b", "strong", "i", "em", "u", "sub", "sup", "br"}

    cls_hits, bad_tags, hl_hits = [], [], 0
    for sid, bundle in terms["bySci"].items():
        for k, t in bundle["terms"].items():
            for f in fields:
                v = t.get(f) or ""
                if "class=" in v:
                    cls_hits.append("%s/%s.%s" % (sid, k, f))
                hl_hits += v.count("background:#FFF3BF")
                for tag in re.findall(r"</?([a-zA-Z][\w]*)", v):
                    if tag.lower() not in allowed:
                        bad_tags.append("%s/%s.%s:<%s>" % (sid, k, f, tag))

    if cls_hits:
        err("富文本仍有 class=（rich-text 不会生效）-> %s" % cls_hits[:5])
    else:
        ok("富文本无残留 class=")

    if bad_tags:
        err("富文本含白名单外标签 -> %s" % sorted(set(bad_tags))[:5])
    else:
        ok("富文本标签均在白名单内")

    # 与源侧做真交叉核对（注意一个字段里可能出现多次高亮，所以按"出现次数"比，
    # 而不是"含高亮的字段数"——后者会少算，第一版就踩过这个坑）
    src_hl = 0
    for sid in terms["bySci"]:
        p = os.path.join(ROOT, "scientists", sid, "assets", "js", "terms.js")
        src = read(p)
        src_hl += src.count("class='hl'") + src.count('class="hl"')
    if hl_hits == src_hl:
        ok("高亮转换 %d 处，与源侧 class='hl' 计数一致" % hl_hits)
    else:
        err("高亮转换 %d 处，源侧为 %d 处（抽取可能丢了高亮）" % (hl_hits, src_hl))


# --------------------------------------------------------------- 3. 路由
def check_routes():
    print("\n[3] 路由与静态资源")
    app = json.loads(read(os.path.join(MP, "app.json")))

    pages = app.get("pages") or []
    miss = []
    for p in pages:
        for ext in ("js", "json", "wxml", "wxss"):
            if not os.path.exists(os.path.join(MP, "%s.%s" % (p, ext))):
                miss.append("%s.%s" % (p, ext))
    if miss:
        err("app.json 的页面缺少文件 -> %s" % miss)
    else:
        ok("app.json：%d 个页面四件套齐全" % len(pages))

    tb = app.get("tabBar") or {}
    tb_pages = [i["pagePath"] for i in (tb.get("list") or [])]
    not_main = [p for p in tb_pages if p.startswith("subpackage/")]
    if not_main:
        err("tabBar 页面必须在主包，但发现分包页面 -> %s" % not_main)
    else:
        ok("tabBar：%d 项全部在主包" % len(tb_pages))

    missing_tb = [p for p in tb_pages if p not in pages]
    if missing_tb:
        err("tabBar 页面未登记在 app.json pages -> %s" % missing_tb)
    else:
        ok("tabBar 页面均已登记")

    bad_icon = []
    for item in tb.get("list") or []:
        for key in ("iconPath", "selectedIconPath"):
            v = item.get(key)
            if not v:
                continue
            if not v.lower().endswith(".png"):
                bad_icon.append("%s(非PNG)" % v)
            elif not os.path.exists(os.path.join(MP, v)):
                bad_icon.append("%s(缺失)" % v)
    if bad_icon:
        err("tabBar 图标必须是存在的 PNG -> %s" % bad_icon)
    else:
        ok("tabBar：图标均为存在的 PNG（小程序不支持 SVG）")

    # usingComponents 解析
    bad_comp = []
    for dirpath, dirnames, filenames in os.walk(MP):
        if "cloudfunctions" in dirpath:
            continue
        for fn in filenames:
            if not fn.endswith(".json"):
                continue
            p = os.path.join(dirpath, fn)
            try:
                cfg = json.loads(read(p))
            except ValueError as e:
                bad_comp.append("%s 解析失败 %s" % (fn, e))
                continue
            for name, ref in (cfg.get("usingComponents") or {}).items():
                base = os.path.join(MP, ref.lstrip("/")) if ref.startswith("/") else os.path.join(dirpath, ref)
                if not os.path.exists(base + ".wxml"):
                    bad_comp.append("%s -> %s" % (name, ref))
    if bad_comp:
        err("usingComponents 指向不存在的组件 -> %s" % bad_comp)
    else:
        ok("usingComponents 全部可解析")

    check_links(pages, tb_pages)


# ------------------------------------------------- 3b. 跳转与 require
JUMP_RE = re.compile(
    r"wx\.(navigateTo|redirectTo|switchTab|reLaunch)\s*\(\s*\{[^}]*?url\s*:\s*['\"]([^'\"]+)['\"]",
    re.S,
)
REQUIRE_RE = re.compile(r"require\(\s*['\"](\.[^'\"]+)['\"]\s*\)")


def check_links(pages, tb_pages):
    """★ 反向检查：代码里跳转的目标是否登记过。

    这个缺口真的放过一次 bug——门户页 navigateTo('/pages/scientist/index')
    指向一个没写进 app.json 的页面，点下去就是死链，而正向检查
    （「app.json 里的页面文件是否齐全」）完全看不见它：方向反了。
    三条规则都是微信的硬规则，不是风格偏好。
    """
    print("\n[3b] 跳转目标与依赖")
    unregistered, wrong_switch, wrong_nav, bad_req = set(), set(), set(), set()

    for dirpath, dirnames, filenames in os.walk(MP):
        if "cloudfunctions" in dirpath.split(os.sep):
            continue
        for fn in filenames:
            if not fn.endswith(".js"):
                continue
            p = os.path.join(dirpath, fn)
            rel = os.path.relpath(p, MP)
            if os.sep + "data" + os.sep in p:
                continue
            txt = read(p)

            for m in JUMP_RE.finditer(txt):
                api, url = m.group(1), m.group(2)
                target = url.split("?")[0].lstrip("/")
                if not target.startswith("pages/"):
                    continue  # 非页面路径不在本检查范围
                if target not in pages:
                    unregistered.add("%s: %s -> /%s" % (rel, api, target))
                elif api == "switchTab" and target not in tb_pages:
                    wrong_switch.add("%s -> /%s" % (rel, target))
                elif api != "switchTab" and target in tb_pages:
                    wrong_nav.add("%s: %s -> /%s" % (rel, api, target))

            for m in REQUIRE_RE.finditer(txt):
                ref = m.group(1)
                base = os.path.normpath(os.path.join(dirpath, ref))
                if not (
                    os.path.exists(base)
                    or os.path.exists(base + ".js")
                    or os.path.exists(os.path.join(base, "index.js"))
                ):
                    bad_req.add("%s: require('%s')" % (rel, ref))

    if unregistered:
        err("跳转目标未登记在 app.json pages（点了是死链）-> %s" % sorted(unregistered))
    else:
        ok("所有页面跳转目标均已登记")

    if wrong_switch:
        err("wx.switchTab 只能跳 tabBar 页面 -> %s" % sorted(wrong_switch))
    else:
        ok("wx.switchTab 目标均为 tabBar 页面")

    if wrong_nav:
        err("navigateTo/redirectTo 不能跳 tabBar 页面 -> %s" % sorted(wrong_nav))
    else:
        ok("navigateTo 未指向 tabBar 页面")

    if bad_req:
        err("require 路径解析不到 -> %s" % sorted(bad_req))
    else:
        ok("require 路径全部可解析")


# ------------------------------------------------------- 4. 体积 / 5. 红线
def package_files():
    out = []
    for dirpath, dirnames, filenames in os.walk(MP):
        if "cloudfunctions" in dirpath.split(os.sep):
            continue
        for fn in filenames:
            if fn == "project.config.json" or fn == ".DS_Store":
                continue
            out.append(os.path.join(dirpath, fn))
    return out


def check_size():
    print("\n[4] 包体积")
    files = package_files()
    total = sum(os.path.getsize(f) for f in files)
    data = sum(os.path.getsize(f) for f in files if os.sep + "data" + os.sep in f)
    icons = sum(os.path.getsize(f) for f in files if os.sep + "assets" + os.sep in f)
    print("       合计 %.1f KB（data %.1f KB / assets %.1f KB / 其余 %.1f KB）"
          % (total / 1024, data / 1024, icons / 1024, (total - data - icons) / 1024))
    if total > 2 * 1024 * 1024:
        err("主包 %.1f KB 超过 2MB 上限" % (total / 1024))
    elif total > 1.5 * 1024 * 1024:
        warn("主包 %.1f KB 已超 1.5MB 目标线" % (total / 1024))
    else:
        ok("主包 %.1f KB，余量充足（上限 2048 KB）" % (total / 1024))


def check_redline(roster, terms):
    print("\n[5] 提审红线词（个人主体）")
    hits = []
    for f in package_files():
        if not f.endswith((".wxml", ".js", ".wxss", ".json")):
            continue
        if os.sep + "data" + os.sep in f:
            continue  # 数据层是站点原文，另行按内容审查
        txt = read(f)
        for w in REDLINE:
            if w in txt:
                for m in re.finditer(re.escape(w), txt):
                    ctx = txt[max(0, m.start() - 12):m.start() + 12].replace("\n", " ")
                    if any(a in ctx for a in REDLINE_ALLOW):
                        continue
                    hits.append("%s: …%s…" % (os.path.relpath(f, MP), ctx))
    if hits:
        warn("命中 %d 处红线词，需人工判断是否为当代语境（历史叙述无害）：" % len(hits))
        for h in hits[:10]:
            print("        %s" % h)
    else:
        ok("未命中提审红线词")


def main():
    print("=" * 64)
    print("读懂科学家 · 小程序静态校验")
    print("=" * 64)
    roster, terms = check_data()
    check_richtext(terms)
    check_routes()
    check_size()
    check_redline(roster, terms)

    print("\n" + "=" * 64)
    print("检查 %d 项 · 错误 %d · 警告 %d" % (CHECKS[0], len(ERRORS), len(WARNINGS)))
    if ERRORS:
        print("\n错误明细：")
        for e in ERRORS:
            print("  - %s" % e)
    print("=" * 64)
    return 1 if ERRORS else 0


if __name__ == "__main__":
    sys.exit(main())
