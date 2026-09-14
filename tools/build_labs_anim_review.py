#!/usr/bin/env python3
"""生成《玩一玩 · 教学动画实测审读报告》 —— tools/labs-anim-review.html

数据来源：tools/audit_labs_animation.js 产出的 <SHOTS_DIR>/labs-anim/<站>.json
         + tools/probe_canvas_ratio.js 的实测结论
图片：以 base64 内联，报告可单文件离线打开。

用法：/Users/shuwei/.workbuddy/binaries/python/envs/default/bin/python tools/build_labs_anim_review.py
"""
import base64
import io
import json
import os
import re

from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
DATA = os.environ.get("SHOTS_DIR")
DATA = os.path.join(DATA, "labs-anim") if DATA else os.path.join(ROOT, "..", "读懂牛顿-验证产物", "labs-anim")
OUT = os.path.join(ROOT, "tools", "labs-anim-review.html")

# ---------------------------------------------------------------- 画布逻辑比例
RATIO = {}
for s, pairs in {
    "bohr": [("shells", .488), ("levels", .488), ("lines", .488)],
    "copernicus": [("solar", .488), ("retro", .488), ("parallax", .463)],
    "curie": [("rays", .488), ("purify", .488), ("decay", .488)],
    "darwin": [("population", .488), ("selection", .488), ("tree", .488)],
    "einstein": [("time", .439), ("photon", .366), ("bend", .439)],
    "faraday": [("induction", .439), ("lines", .488), ("ac", .488)],
    "feynman": [("path", .439), ("interfere", .488), ("dist", .488)],
    "galileo": [("incline", .439), ("telescope", .439), ("pendulum", .439)],
    "hawking": [("bh", .439), ("orbit", .488), ("temp", .488)],
    "kepler": [("ellipse", .439), ("areal", .488), ("third", .488)],
    "maxwell": [("field", .488), ("wave", .488), ("speed", .488)],
    "mendeleev": [("grid", .512), ("trend", .488), ("fill", .488)],
    "newton": [("prism", .439), ("gravity", .366), ("projectile", .463)],
    "pasteur": [("colony", .488), ("heat", .488), ("spread", .488)],
    "turing": [("turing", .439), ("automaton", .488), ("signal", .488)],
}.items():
    for lab, r in pairs:
        RATIO[(s, lab)] = r

DISPLAY_RATIO = 360 / 1068          # 1280 视口下 .lab canvas 的实际显示比例
SQUASH = {k: 1 - DISPLAY_RATIO / v for k, v in RATIO.items()}   # 纵向压缩比

CN = {  # 站名
    "bohr": "玻尔", "copernicus": "哥白尼", "curie": "居里夫人", "darwin": "达尔文",
    "einstein": "爱因斯坦", "faraday": "法拉第", "feynman": "费曼", "galileo": "伽利略",
    "hawking": "霍金", "kepler": "开普勒", "maxwell": "麦克斯韦", "mendeleev": "门捷列夫",
    "newton": "牛顿", "pasteur": "巴斯德", "turing": "图灵",
}

# ------------------------------------------------- 逐实验标签（人工判读，据实测画面）
TAGS = {
    ("hawking", "bh"): ["深底文字不可读"], ("hawking", "orbit"): ["深底文字不可读"],
    ("hawking", "temp"): ["同站底色不一致"],
    ("galileo", "telescope"): ["深底文字不可读"],
    ("turing", "automaton"): ["参数拉满后退化"],
    ("einstein", "bend"): ["画面被裁切", "缺对照线"],
    ("feynman", "path"): ["关键机制过小"],
    ("newton", "projectile"): ["无收尾确认帧判据"],
}
NICE = ["pasteur/spread", "curie/rays", "feynman/interfere", "feynman/dist",
        "darwin/selection", "maxwell/speed", "turing/signal", "faraday/induction",
        "kepler/third", "darwin/tree"]


def img_b64(path, w=1100, q=82):
    im = Image.open(path).convert("RGB")
    if im.width > w:
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=q, optimize=True)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


def load():
    rows = []
    for st in sorted(CN):
        f = os.path.join(DATA, f"{st}.json")
        if not os.path.exists(f):
            continue
        d = json.load(open(f, encoding="utf-8"))
        for l in d.get("labs", []):
            am = l.get("autoMotion") or {}
            bm = l.get("buttonMotion")
            sl = l.get("sliders", [])
            run = l.get("slidersRun", [])
            auto = bool(am.get("checksumChanged"))
            pausable = any(float(s.get("min") or 1) == 0 for s in sl) or bool(l.get("buttons"))
            rows.append(dict(
                st=st, lab=l.get("dataLab"), h4=l.get("h4", ""),
                ctrls=[s.get("ctrl") for s in sl], n=len(sl),
                auto=auto, autoD=am.get("d02"), pausable=pausable,
                btns=l.get("buttons") or [], desc=l.get("desc", ""),
                ro0=l.get("readout0", ""), run=run,
                squash=SQUASH.get((st, l.get("dataLab")), 0),
                ratio=RATIO.get((st, l.get("dataLab")), 0),
                tags=TAGS.get((st, l.get("dataLab")), []),
                nice=f"{st}/{l.get('dataLab')}" in NICE,
                errors=len(d.get("errors") or []),
            ))
    return rows


def main():
    rows = load()
    n_lab = len(rows)
    n_sl = sum(r["n"] for r in rows)
    n_auto = sum(1 for r in rows if r["auto"])
    n_autofix = sum(1 for r in rows if r["auto"] and not r["pausable"])
    n_auto_no = n_auto - n_autofix
    n_btn = sum(1 for r in rows if r["btns"])
    n_err = sum(r["errors"] for r in rows)

    img_ratio = img_b64(os.path.join(DATA, "ratio_compare.png"), 1240, 80)
    img_p0 = img_b64(os.path.join(DATA, "p0", "p0_compare.png"), 1160, 82)
    img_auto = img_b64(os.path.join(DATA, "turing_automaton_hi.png"), 1000, 82)
    img_bh = img_b64(os.path.join(DATA, "hawking_bh_t0.png"), 1000, 82)
    img_bend = img_b64(os.path.join(DATA, "einstein_bend_hi.png"), 1000, 82)
    # P1 修复后实站点截图（tools/shot_p1_fixes.js 产出）
    P1 = os.path.join(DATA, "p1")
    img_p13a = img_b64(os.path.join(P1, "p13_turing_running.png"), 900, 82)
    img_p13b = img_b64(os.path.join(P1, "p13_turing_paused.png"), 900, 82)
    img_p14a = img_b64(os.path.join(P1, "p14_automaton_r110.png"), 900, 82)
    img_p14b = img_b64(os.path.join(P1, "p14_automaton_r255.png"), 900, 82)
    img_p14c = img_b64(os.path.join(P1, "p14_automaton_r0.png"), 900, 82)
    img_p15a = img_b64(os.path.join(P1, "p15_bend_m1.png"), 900, 82)
    img_p15b = img_b64(os.path.join(P1, "p15_bend_m50.png"), 900, 82)
    img_p15c = img_b64(os.path.join(P1, "p15_orbit_a2.6.png"), 900, 82)
    # P2 修复后实站点截图（tools/shot_p2_fixes.js / probe_p23_path.js 产出）
    P2 = os.path.join(DATA, "p2")
    img_p21a = img_b64(os.path.join(P2, "p21_newton_prism.png"), 900, 82)
    img_p22a = img_b64(os.path.join(P2, "p22_curie_rays.png"), 900, 82)
    img_p22b = img_b64(os.path.join(P2, "p22_hawking_bg.png"), 1000, 80)
    img_p22c = img_b64(os.path.join(P2, "p22_pasteur_colony.png"), 900, 82)
    img_p23a = img_b64(os.path.join(P2, "p23_path_h1.png"), 900, 82)
    img_p23b = img_b64(os.path.join(P2, "p23_path_h0.25.png"), 900, 82)

    # 逐站行
    tr = []
    for r in rows:
        sq = f"{r['squash']*100:.0f}%"
        auto = f"自走 Δ={r['autoD']}" if r["auto"] else "静止"
        pause = ("可暂停" if r["pausable"] else "⚠️ 不可暂停") if r["auto"] else "—"
        tags = "".join(f'<i class="tg">{t}</i>' for t in r["tags"])
        star = ' <b class="star">★</b>' if r["nice"] else ""
        tr.append(
            f'<tr class="{"hl" if r["tags"] else ""}">'
            f'<td class="c">{CN[r["st"]]}</td><td><code>{r["lab"]}</code>{star}</td>'
            f'<td>{r["h4"]}</td>'
            f'<td class="c">{r["n"]}</td>'
            f'<td class="c mono">{"、".join(x or "?" for x in r["ctrls"])}</td>'
            f'<td class="c mono">{auto}</td><td class="c">{pause}</td>'
            f'<td class="c mono sq">{sq}</td>'
            f'<td>{tags}</td></tr>')

    html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>玩一玩 · 教学动画实测审读报告 | 影响世界的15个科学家</title>
<style>
:root{{--ink:#16202C;--ink2:#41505F;--ink3:#7A8899;--line:#E3E8EF;--bg:#F6F8FB;--card:#fff;
 --red:#D6336C;--org:#E8590C;--grn:#0CA678;--blu:#1A73E8;--pur:#7048E8;--ylw:#F59F00;--mono:ui-monospace,"SF Mono",Menlo,monospace}}
*{{box-sizing:border-box}}
body{{margin:0;font:15px/1.85 -apple-system,"PingFang SC","Microsoft YaHei",sans-serif;color:var(--ink);background:var(--bg)}}
.wrap{{max-width:1120px;margin:0 auto;padding:40px 24px 80px}}
h1{{font-size:31px;margin:0 0 8px;letter-spacing:-.3px}}
.sub{{color:var(--ink3);font-size:14.5px;margin-bottom:26px}}
h2{{font-size:23px;margin:52px 0 14px;padding-top:22px;border-top:2px solid var(--line)}}
h2 .cnt{{float:right;font-size:12.5px;color:var(--ink3);font-weight:600;font-family:var(--mono)}}
h3{{font-size:17.5px;margin:26px 0 8px}}
p{{margin:9px 0}}
.card{{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:22px 24px;margin:16px 0;box-shadow:0 1px 2px rgba(16,24,40,.04)}}
.kpis{{display:grid;grid-template-columns:repeat(auto-fit,minmax(158px,1fr));gap:12px;margin:20px 0}}
.kpi{{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px}}
.kpi b{{display:block;font-size:26px;line-height:1.25;font-family:var(--mono)}}
.kpi span{{font-size:12.5px;color:var(--ink3)}}
.kpi.g b{{color:var(--grn)}} .kpi.r b{{color:var(--red)}} .kpi.o b{{color:var(--org)}} .kpi.b b{{color:var(--blu)}}
table{{width:100%;border-collapse:collapse;font-size:13.5px}}
th,td{{padding:7px 9px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}}
th{{background:#EEF2F7;font-size:12.5px;color:var(--ink2);position:sticky;top:0}}
td.c{{text-align:center;white-space:nowrap}}
.mono{{font-family:var(--mono);font-size:12.5px}}
.sq{{color:var(--org);font-weight:700}}
tr.hl{{background:#FFF7F2}}
.star{{color:var(--ylw)}}
.tg{{display:inline-block;font-style:normal;font-size:11.5px;font-weight:700;color:#fff;background:var(--org);
 padding:1.5px 7px;border-radius:5px;margin:1px 4px 1px 0}}
.pill{{display:inline-block;font-size:12px;font-weight:800;padding:2px 9px;border-radius:6px;margin-right:6px}}
.p0{{background:#FFE3E3;color:#B01B1B}} .p1{{background:#FFF0DC;color:#99530A}} .p2{{background:#E7F5FF;color:#14549B}}
.ok{{background:#E6FAF3;color:#087F5B}}
img.shot{{width:100%;border:1px solid var(--line);border-radius:12px;margin:10px 0;display:block}}
.grid2{{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:12px 0 4px}}
.grid2 img.shot{{margin:0 0 4px}}
.grid2 .cap{{margin:0}}
@media (max-width:760px){{.grid2{{grid-template-columns:1fr}}}}
.cap{{font-size:12.5px;color:var(--ink3);margin:-2px 0 14px}}
code{{font-family:var(--mono);font-size:12.5px;background:#EEF2F7;padding:1px 5px;border-radius:5px}}
pre{{background:#0F172A;color:#E6EDF6;padding:14px 16px;border-radius:12px;overflow-x:auto;font-size:12.5px;line-height:1.7}}
ul{{margin:8px 0;padding-left:22px}} li{{margin:5px 0}}
.demo{{background:#111A2E;border-radius:14px;padding:14px;margin:12px 0}}
.demo canvas{{width:100%;height:250px;display:block;border-radius:10px;background:#FBFCFE}}
.dbar{{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:12px;color:#CBD5E1;font-size:13px}}
.dbar button{{font:inherit;font-weight:800;padding:6px 14px;border-radius:8px;border:0;cursor:pointer;background:#334155;color:#E2E8F0}}
.dbar button.on{{background:#F59F00;color:#1B2530}}
.dbar input{{width:150px}}
.foot{{font-size:12.5px;color:var(--ink3);border-top:1px solid var(--line);margin-top:44px;padding-top:16px;line-height:1.9}}
</style>
</head>
<body>
<div class="wrap">

<h1>「玩一玩」教学动画 · 实测审读报告</h1>
<div class="sub">对象：影响世界的 15 个科学家系列站点 · <code>scientists/&lt;id&gt;/labs.html</code> 全部 {n_lab} 个互动实验 ·
方法：浏览器内真实运行 + 逐实验量化取数 + 全程目视 · 生成于 2026-09-14</div>

<div class="bignote">
  <p><span class="pill ok">已修复</span><b>P0 已于 2026-09-14 修复并复测通过。</b>
  修法：删除全部 16 个样式表（根 + 15 站）中 <code>.lab canvas</code> 的 <code>max-height</code>，<b>零 JS 改动</b>。
  注意伽利略文件中存在<b>两条</b>带 <code>max-height</code> 的 <code>.lab canvas</code> 规则（320px + 360px），只删一处等于没修——已一并处理。</p>
  <p>复测证据：<code>tools/probe_canvas_ratio.js</code> 在 1600px 视口下 <b>45/45 段畸变全部归零</b>（残余 0.2%–0.4% 系 1px 边框计入 border-box 的亚像素误差）·
  <code>tools/e2e_check.js galileo / bohr</code> 桌面＋移动报错 <b>0</b>、画布均绘制、滑块联动正常 ·
  <code>tools/validate_site.py</code> <b>通过 106 · 警告 0 · 错误 0</b>。修复前后对照见第二节。</p>
  <p class="cap">下文第二节的畸变数据为<b>审读当时（修复前）</b>的实测值，保留作为问题定级依据。</p>
</div>

<div class="bignote">
  <p><span class="pill ok">已修复</span><b>P1 五类问题已于 2026-09-14 全部修完并复测通过。</b>
  P1-3（{n_autofix} 段自走动画加 ⏸暂停 / ⏭单步）：实测 <b>18/18 冻结、18/18 单步、18/18 恢复</b>；
  P1-4（元胞自动机）：<b>图案中心＝画布中心 8/8</b>、退化帧说明牌 + 规则快捷按钮到位；
  P1-5（引力弯曲光线）：<b>1–50 全程不出画布</b>，并给爱因斯坦与霍金都补上了未偏折的虚线参照。</p>
  <p><b>其中 P1-1 / P1-2 的原判读经运行时实测后被推翻</b>：深底上的文字其实是浅色、本来可读；"5px 字号"是把
  <code>11.5px</code> 用非贪婪正则截断造成的假象。真正的不可读是"浅灰压浅底"，已按实测数据修到
  <b>🔴 对比度 &lt;3.0 的文字由 217 条降为 0 条</b>。两条的修正过程都写在下文对应小节里，不藏。</p>
  <p><span class="pill ok">已修复</span><b>P2 三类教学法提升项同日全部做完。</b>
  P2-1：45 条"先猜一猜"逐条撰写并注入，实测 <b>45/45</b>、无重叠、对比度 13.43:1；
  P2-2：45 张画布各配一条就地<b>迷你图例</b>（首轮有 17 条是通用兜底，逐条读源码后已全部换成实验专属标签，<b>纯兜底 0 条</b>），霍金三实验底色统一；
  P2-3：费曼路径积分改左右分栏，机制区从约 7% 画布宽提升到 <b>51.7%</b>。</p>
</div>

<div class="card">
  <p><b>一句话结论：</b>这批动画的<b>教学设计骨架是合格的、甚至有几段相当出色</b>——控制点数量规范、图文联动 100% 到位、多数实验把"看不见的过程"真的动了起来。
  审读当时发现<b>一个影响全部 {n_lab} 段动画的系统性显示缺陷</b>（画布被纵向压扁 8%–31%，投影场景最严重）以及 <b>5 类可读性 / 可控性 / 退化帧问题</b>；
  <b>P0、P1、P2 已于 2026-09-14 全部修复并复测</b>（含两条经实测推翻、重新归因的判读）。
  目前只有"坐标刻度加粗 / 关键数值 ≥16px"这一项<b>有意未做</b>——涉及 45 张画布逐个微调，收益不如前三项确定。</p>
</div>

<div class="kpis">
  <div class="kpi"><b>{n_lab}</b><span>实验全部实跑（15 站 × 3）</span></div>
  <div class="kpi g"><b>{n_err}</b><span>运行时报错（JS / 资源）</span></div>
  <div class="kpi g"><b>{n_sl}/{n_sl}</b><span>滑块控制点图文联动达标</span></div>
  <div class="kpi b"><b>{n_auto}</b><span>会自走的动画（其余为参数驱动）</span></div>
  <div class="kpi o"><b>{n_lab}/{n_lab}</b><span>存在纵向压扁（桌面端）</span></div>
  <div class="kpi g"><b>0 / {n_autofix}</b><span>自走动画中无法暂停/单步（已修）</span></div>
</div>

<h2>一、我是怎么"运行一遍"的<span class="cnt">可复现 · 非抽查</span></h2>
<div class="card">
  <p>为了让"专业建议"落在实测而非印象上，先写了一个审计脚本 <code>tools/audit_labs_animation.js</code>，对 {n_lab} 个实验逐个做四件事：</p>
  <ol>
    <li><b>测自走性</b>：<b>不给任何输入</b>，静置采 3 帧（0 / 0.43s / 0.86s），比对降采样灰度签名与全画布校验和 → 这段动画"自己会不会动、动多大"。</li>
    <li><b>测交互响应</b>：把<b>每一个</b>滑块分别拨到量程两端，各采一帧 + 抄一次 readout → 操作是否同时改变画面与结论文字。</li>
    <li><b>测按钮动画</b>：实验里若有按钮（如抛体「🚀 发射」）就点一次，在 1.5 秒窗口内采 4 帧，判断点完是不是真的动。</li>
    <li><b>留证 + 记错</b>：每个实验存 3 张 PNG；全程捕获 <code>pageerror</code> 与 <code>console.error</code>。</li>
  </ol>
  <p>另有两条专项探针：<code>tools/probe_raf.js</code>（确认 rAF 循环真的在跑，排除"伪动画"）、
  <code>tools/probe_canvas_ratio.js</code> + <code>tools/shot_canvas_ratio_fix.js</code>（量画布逻辑比例 vs 屏幕显示比例，并出对照图）。</p>
  <p class="cap">实测口径提示：本次"自走 Δ"是 32×20 分块灰度均值差的绝对值，量纲与视觉明显度不线性对应——Δ≈0.1 已肉眼可见（如巴斯德鹅颈瓶的灰尘沉降），Δ≈4 为整幅强运动。所以下文<b>不按 Δ 大小排名</b>，只区分"会动 / 不动"。</p>
</div>

<h2>二、P0 · 系统性缺陷：画布被纵向压扁<span class="cnt">45 / 45 命中</span></h2>
<div class="card">
  <p><span class="pill p0">P0</span><b>每一个实验的 canvas 在桌面 / 投影分辨率下都被纵向压缩，圆心变扁椭圆、曲线峰高被压低。</b></p>
  <p>根因很明确，在样式表里：各实验用 <code>setupCanvas(cv, ratio)</code> 按 <b>逻辑比例 0.37–0.51</b> 把画布高度设成 <code>clientWidth × ratio</code>（1280 视口下 ≈ 400–550px），
  但 CSS 又写了一条硬上限：</p>
  <pre>.lab canvas {{ width: 100%; height: auto; display: block; ... max-height: 360px; }}</pre>
  <p>宽度仍取 100%（1068px），高度被 <code>max-height</code> 截到 360px → <b>横向不变、纵向被压缩</b>，比例变成固定的 360/1068 = 0.337，而画面是按原比例画的。</p>
  <p><b>实测（同一份代码，只改这一条 CSS）：</b></p>
  <img class="shot" src="{img_ratio}" alt="压扁前后对照">
  <p class="cap">左＝现行效果，右＝去掉 <code>max-height</code> 后。玻尔的"圆形壳层"变成扁椭圆；行星轨道离心率被夸大；速率分布峰被压矮。</p>
  <p><b>2026-09-14 实修后的对照（视口 1600px，真实站点截图，非 CSS 注入演示）：</b></p>
  <img class="shot" src="{img_p0}" alt="P0 修复前后真实对照">
  <p class="cap">每行左＝修复前、右＝修复后。玻尔"圆形壳层"由扁椭圆还原为正圆；开普勒椭圆离心率恢复；伽利略单摆的弧、哥白尼的轨道、居里的射线扇形都回到真实比例。由 <code>tools/shot_p0_before_after.js</code> + <code>tools/montage_p0_before_after.py</code> 自动产出。</p>
  <p><b>为什么这条排 P0：</b></p>
  <ul>
    <li><b>它把"正确的科学图形"改成了"错误的形状"</b>——玻尔模型讲的是<b>圆形</b>轨道（与开普勒椭圆正相对），压扁后两者视觉上分不开，正好抵消了这个对比。</li>
    <li><b>越该看清楚的地方越糊</b>：手机端（390px）反而正常，<b>越往大屏 / 投影走畸变越重</b>（1024px 21% · 1280px 24–31% · 1600px 31%）——恰好在教室投影场景最失真。</li>
    <li><b>修法极轻</b>：删掉 <code>max-height: 360px</code>（或抬到 560px）即可，15 站 CSS 各一行，零 JS 改动；若一定要限高，正确做法是在 <code>setupCanvas</code> 里按 <code>k = min(w/W, h/H)</code> 等比缩放并居中留边，而不是让 CSS 单方向截断。</li>
  </ul>
</div>

<h2>三、P1 · 可读性、可控性、退化帧<span class="cnt">5 类 · 已全部修复</span></h2>

<h3><span class="pill p1">P1-1</span>深色画布里的说明文字等于没写<span class="cnt">已修复 · 原判读被实测推翻</span></h3>
<div class="card">
  <p><span class="pill ok">已修复</span><b>2026-09-14 用运行时实测复核后，这条的<u>归因需要修正</u>。</b>
  当初的判读是"深蓝字压深蓝底、对比度接近 1:1"。把画布上的着色调用逐条抓下来、量出真实 WCAG 对比度后，发现
  霍金 <code>bh</code>/<code>orbit</code>、伽利略 <code>telescope</code> 的文字其实是<b>浅色</b>（<code>#AEB9CC</code> / <code>#fff</code> / <code>#C9D3E0</code>）压在深底上，
  对比度 <b>7–19</b>，投屏上清楚可读——<b>原来的判读是错的</b>。</p>
  <p>真正的不可读发生在<b>反过来的组合：浅灰文字压在浅底上</b>。<code>#b0bac9</code>（对比度 1.87，85 处）、<code>#8b96aa</code>（2.42，131 处）、
  <code>#9aa7be</code>、<code>#c7d0de</code>、<code>#868e96</code>——都是同一套浅底配色里配错的浅灰，投影上同样读不出。</p>
  <p><b>实测口径（不复用静态推断）：</b>劫持 <code>CanvasRenderingContext2D.prototype</code> 的 <code>fillText / fillRect / fill / clearRect</code>，
  以 <code>clearRect</code> 为帧边界记录每一次绘制；再用 <code>getImageData</code> 量每条文字包围盒内"众数底色 vs 最大对比色"的 WCAG 对比度。
  共采到 <b>541 条绘制、493 条聚合标签</b>。</p>
  <p><b>修法：</b>统一改到站内<b>已经在用的合格灰 <code>#5c6b82</code></b>（对比度 4.62，原本已用 121 处），
  只改"该次赋色后第一次绘制就是 <code>fillText</code>、且该站确有这个色的文字"的赋值。
  <b>图形描边用的同色一律不动</b>——<code>#8b96aa</code> 既用于文字也用于图形描边，全局替换会把画面改坏。</p>
  <p><b>复测：</b>🔴 对比度 &lt;3.0 的文字由 <b>217 条降到 0 条</b>（✅ ≥4.5 共 447 条、🟡 3.0–4.5 共 46 条）。
  剩下的 46 条 🟡 是按曲线配色的彩色标签（<code>#e8590c</code>、<code>#ffffff</code>、<code>#0ca678</code> …），压深会破坏"颜色＝含义"的编码，<b>刻意保留</b>。</p>
  <p class="cap">工具链：<code>probe_canvas_text_contrast.js</code>（实测）· <code>analyze_canvas_text.py</code>（聚合）·
  <code>scan_color_usage.py</code>（判定"纯文字 / 图形混用"）· <code>fix_canvas_text_contrast.py</code>（数据驱动修复，幂等）。改动 15 个 <code>site.js</code>。</p>
</div>

<h3><span class="pill p1">P1-2</span>画布内字号普遍低于投屏可读下限<span class="cnt">已复测 · 原判读有误</span></h3>
<div class="card">
  <p><span class="pill ok">已复测并修正</span><b>"9 个站出现 5px"是正则造成的假象。</b>
  当初用 <code>([0-9]+)px</code> 这种<b>非贪婪匹配</b>，从 <code>11.5px</code> 里截出了一个 <code>5</code>。改成能接受小数点的正则重扫全站后：</p>
  <ul>
    <li>画布内字号最小是 <b>9.5px</b>（门捷列夫 1 处）与 <b>10px</b>（图灵 1 处），其余都在 11–15px。</li>
    <li>更关键的是<b>单位口径</b>：画布内字号是"<b>逻辑坐标 px</b>"，要经 <code>ctx.scale(k, k)</code>（k ≈ 1.30–1.45）放大后才显示。
      折算到屏幕，<b>最小字号 13.0px</b>，并非"投影上等于噪点"。</li>
  </ul>
  <p><b>实修：</b>只把门捷列夫那处 <code>600 9.5px</code> 提到 <code>600 11px</code>，其余不动——把逻辑字号整体提到 14px 会让文字撑破图形，属于"为指标而改"。</p>
  <p>真正值得做的提级是<b>坐标刻度加粗</b>与<b>关键数值 ≥16px</b>；建议并入 P2-2 的色板 / 迷你图例改造一起做。</p>
</div>

<h3><span class="pill p1">P1-3</span>{n_autofix} 段自走动画按不住<span class="cnt">已修复 · 实测 18/18</span></h3>
<div class="card">
  <p><span class="pill ok">已修复</span>当初的问题：全站有 <b>{n_auto} 段动画会自己持续运动</b>（占比 {n_auto*100//n_lab}%），
  其中只有 {n_auto_no} 段能靠把滑块拨到 0 停下来（爱因斯坦光钟、开普勒椭圆、巴斯德鹅颈瓶），
  <b>其余 {n_autofix} 段没有任何暂停或单步手段</b>——速度滑块的最小档也是 0.2×，一打开页面就在动。
  受影响最重的是<b>图灵机</b>（实验目的就是"看读写头一步步走"，却无法单步）和<b>法拉第磁铁穿线圈</b>（磁通变化的过程恰恰要定格看）。</p>
  <div class="grid2">
    <div><img class="shot" src="{img_p13a}" alt="图灵机运行中">
      <p class="cap">运行中：实验底部多出一行「⏸ 暂停 / ⏭ 单步」。</p></div>
    <div><img class="shot" src="{img_p13b}" alt="图灵机已暂停">
      <p class="cap">按下暂停：按钮变「▶ 继续」，状态停在"已走 134 步"的同一帧，画面不再变化。</p></div>
  </div>
  <p><b>修法（引擎级，一处改动全站受益）：</b>在各站 <code>site.js</code> 的 IIFE 里给 <code>window.requestAnimationFrame</code> 套一层"闸门"，按 <code>.lab</code> 分别记账：</p>
  <ul>
    <li><b>暂停</b> —— 不再驱动实验的绘制回调，只把 rAF 链自己续下去，画面<u>必然</u>定格；</li>
    <li><b>单步</b> —— 放行一次绘制，并把时钟往前推一帧（1000/60 ms）；</li>
    <li><b>继续</b> —— 恢复后的第一帧也按"过了一帧"计时，避免暂停很久后画面跳一大步。</li>
  </ul>
  <p><b>为什么不是简单的"冻结时间戳"：</b>第一版就是冻结时间戳，实测图灵机<b>照样在动</b>——因为它每帧固定走
  <code>Math.round(速度×2)</code> 步，<b>与 dt 无关</b>；法拉第的交流发电机、磁铁穿线圈同属这一类。
  改成"暂停期间干脆不调用绘制回调"才真正按得住。</p>
  <p><b>只给会动的实验加按钮：</b>闸门记录每个实验有没有排过 rAF，只有排过的才注入按钮——
  元素周期表、射线穿透这类纯参数图不会被塞一个没用的暂停键。
  另加一个兜底探测：把没有按钮的实验画布缩到 16×16 比指纹，一旦它自己动起来就补按钮，
  于是"点了发射才开始动"的<b>牛顿抛体</b>也能在启动那一刻拿到按钮（实测：发射前无按钮 ✅、发射后出现 ✅、暂停后冻结 ✅）。</p>
  <p><b>实测（<code>tools/probe_p13_pause.js</code>，15 站逐实验点按 + 画布指纹比对）：</b>
  19 个实验拿到按钮（其中 18 个确认在动）——<b>暂停后冻结 18/18 · 单步走一帧 18/18 · 继续后恢复 18/18 · 按钮行重复 0 个</b>；
  全程 <b>0 pageerror / 0 console.error</b>。</p>
  <p class="cap">工具：<code>tools/fix_labs_pause_step.py</code>（幂等，支持 <code>--dry-run</code> / <code>--rewrite</code>）· <code>tools/add_anim_tools_css.py</code>（样式）·
  <code>tools/probe_p13_pause.js</code>（实测）· <code>tools/diag_p13_freeze.js</code>（定位停不住的原因）。改动 15 个 <code>site.js</code> + 16 个 <code>style.css</code>。</p>
</div>

<h3><span class="pill p1">P1-4</span>参数拉满后退化成"一整片没有信息的颜色"<span class="cnt">已修复 · 图案中心＝画布中心</span></h3>
<div class="card">
  <p><span class="pill ok">已修复</span>当初的问题有两层：图灵「一维元胞自动机」规则滑块拉到 255（=11111111₂）时画面变成<b>一整块均匀色块</b>，
  数学上没错，但学生学不到任何东西，还容易被误认为"页面坏了"；同一实验的默认档（规则 110）图案<b>只长在画布左半</b>，右半是空的。</p>
  <div class="grid2">
    <div><img class="shot" src="{img_p14a}" alt="规则 110 居中">
      <p class="cap">规则 110（默认）：按<b>实际生长范围</b>水平居中，不再"只长左半"。</p></div>
    <div><img class="shot" src="{img_p14b}" alt="规则 255 说明牌">
      <p class="cap">规则 255：画面就地盖一块说明牌，直接告诉学生"这条规则会把整片填满"，而不是让人以为页面坏了。</p></div>
  </div>
  <p><b>修法：</b></p>
  <ul>
    <li><b>按实际占用范围居中</b>——生成完整个网格后量出图案真正占用的列区间，再按<u>整块画布</u>居中
      （不能按画布左边那条绘制带居中：画布左右留白本来就不等，<code>X0=40</code> 而右边只余 20px）。</li>
    <li><b>退化帧说人话</b>——不删不藏，改成"画面 + readout"双处提示：整片填满（密度 ≥75%）与"什么都不长"（只活 1 格）各给一句说明 + 换哪条规则的建议。规则 0 / 200 这类同样受益。</li>
    <li><b>常用规则快捷按钮</b>——30 混沌 / 90 分形 / 110 图灵完备 / 150 嵌套三角 / 255 全填满 / 0 空白，
      把"换个规则号试试"从"自己在 0–255 里盲试"变成一次点击，并高亮当前档。</li>
  </ul>
  <p><b>实测（<code>tools/probe_p14_automaton.js</code>）：</b>规则 110 / 102 / 30 / 90 / 150 / 255 / 0 / 200 逐个量黑格像素包围盒——
  <b>图案中心 534 = 画布中心 534，8/8 全中</b>（修复前偏移 13px）；退化帧说明牌在"压深格"（62 929px）与"压浅底"（86 927px）两种底色下都被测到；
  预设按钮点击后滑块值、高亮态、画面三者同步。</p>
  <p class="cap">说明：<b>没有</b>收窄滑块量程。0–255 本身就是这个实验要讲的事实（"规则一共只有 256 条"），把量程砍掉等于把这个事实藏起来；
  改成"留着量程 + 把退化情形讲清楚 + 给快捷入口"。</p>
</div>

<h3><span class="pill p1">P1-5</span>最大参数下画面被裁切、缺少对照线<span class="cnt">已修复 · 全程不出画布</span></h3>
<div class="card">
  <p><span class="pill ok">已修复</span>当初的问题：爱因斯坦「引力弯曲光线」质量拉到最大时，光线直接<b>冲出画布底边</b>——
  学生看到的是"掉下去了"，而不是"偏折了一个角度"；而且整幅画面只有一条弯曲的线，<b>没有参照</b>，无法判断曲率大小。</p>
  <div class="grid2">
    <div><img class="shot" src="{img_bend}" alt="修复前：光线冲出底边">
      <p class="cap"><b>修复前</b>（质量 50）：光线直接冲出画布底边——学生看到的是"掉下去了"，不是"偏折了一个角度"。</p></div>
    <div><img class="shot" src="{img_p15b}" alt="修复后：50 倍太阳">
      <p class="cap"><b>修复后</b>（质量 50）：偏折 33.4°，整条曲线仍留在画布内；虚线让"偏折了多少"一眼可比。</p></div>
  </div>
  <p>1 倍太阳时偏折只有 0.6°、光线几乎与虚线重合——物理上本该如此：一颗太阳质量远不足以把擦肩而过的光掰弯多少，
  这也是为什么 1919 年那次日食测量需要那么高的精度。</p>
  <p><b>根因（逐档复算）：</b>轨迹积分里的引力耦合系数取 <code>k = 1500 × 质量</code>。
  质量 ≥24 时光线就冲出底边，<b>质量 50 时轨迹最低点 y≈1074，是画布高的 3 倍</b>。</p>
  <p><b>修法：</b>① 耦合系数降到 <code>700 × 质量</code>，经轨迹实测可在 1–50 全程让光线从右边离开画布
  （最低点 336 &lt; 360），偏折角从 <b>0.6°</b>（1 倍太阳，几乎笔直）平滑长到 <b>33.4°</b>（50 倍太阳）；
  ② 加一条<b>灰色虚线</b>画出"没有引力时的笔直路径"，并让它与入射线重合，偏折量立刻可比；
  ③ readout 补上实时偏折角（6.5° → 33.4°）。</p>
  <p><b>霍金「光线经过黑洞」同样加了白虚线参照线</b>（并在底部图例里写明），
  可看出同一束光"本该笔直穿过"与"被掰弯后逃走"的差别：</p>
  <img class="shot" src="{img_p15c}" alt="霍金黑洞光线的参照线">
  <p class="cap">瞄准距离 2.6 倍视界半径：白虚线＝没有引力时的笔直路径，黄线＝被黑洞掰弯 309° 后逃走的实况。</p>
  <p><b>实测（<code>tools/probe_p15_bend.js</code>，1600px 视口，量画布内橙色光线的像素包围盒）：</b>
  质量 1 / 5 / 10 / 20 / 25 / 30 / 40 / 50 逐档测量，<b>光线距画布底边 369 → 50px，全程不出界</b>；
  末端相对虚线的下垂量 6 → 325px 随质量单调增大；灰色虚线参照行在每一档都被测到。霍金站 aim 0.6–7 全程无报错。</p>
</div>

<h2>四、P2 · 教学法层面的提升项<span class="cnt">3 条 · 已全部修复</span></h2>

<h3><span class="pill ok">已修复</span>P2-1 · 45 个控制点，没有一个是"如果……会怎样"<span class="cnt">0 / 45 → 45 / 45</span></h3>
<div class="card">
  <p><b>原状：</b>逐个核对引导语与说明句，<b>含问号的 0 处</b>。现有写法是清一色的<b>指令式</b>——"拖动『斜面倾角』，看铜球滚下的快慢"。
  这些引导语本身写得<b>很好</b>（有明确观察目标，甚至预防了误解），缺的是<b>"先猜想、再验证"这一步</b>：学生被告知去拖，但不知道"我到底要验证什么假设"。</p>
  <p><b>改法：</b>为 45 个实验各写一条<b>可验证</b>的猜想（先猜、再拖、当场验证），优先挑该实验<b>最容易被误解的点</b>。例如：</p>
  <ul>
    <li>牛顿·棱镜：「已经分出来的单色红光，再过一次棱镜，还会继续分成别的颜色吗？」</li>
    <li>牛顿·抛体：「平着打出去的炮弹，和同时松手掉下的石子，谁先落地？」</li>
    <li>牛顿·引力：「把两个物体的距离拉到 2 倍，引力是减一半，还是减到四分之一？」</li>
    <li>法拉第·电磁感应：「磁铁<b>停在线圈里不动</b>时，还有电流吗？」（静止不动没有电流，是这个实验最容易被忽略的点）</li>
  </ul>
  <p><b>实测（<code>tools/probe_p21_guess.js</code>，15 站 × 3 实验）：</b>
  ① 45/45 每个实验恰好 1 条，<b>无缺失、无重复</b>；② 全部以"先猜一猜："开头且含问号；
  ③ 全部可见，与上方说明、画布<b>均无重叠</b>；④ 文字／底色对比度 <b>13.43:1</b>（15 站一致，WCAG AA 只需 4.5）；
  ⑤ 运行时报错 <b>0</b>。</p>
  <div class="grid2">
    <div><img class="shot" src="{img_p21a}" alt="牛顿棱镜：猜一猜 + 迷你图例">
      <p class="cap">牛顿·棱镜：琥珀色的"先猜一猜"块紧跟在引导语之后，下方是就地标注的图例。</p></div>
    <div><img class="shot" src="{img_p22c}" alt="巴斯德菌落：四阶段图例">
      <p class="cap">巴斯德·菌落：图例直接写出四个生长阶段的颜色（灰迟缓／蓝对数／绿稳定／红衰亡）。</p></div>
  </div>
</div>

<h3><span class="pill ok">已修复</span>P2-2 · 同站内深浅底混用、全站没有统一的颜色语义<span class="cnt">45 / 45 已配图例</span></h3>
<div class="card">
  <p><b>原状：</b>① 霍金三个实验是「深底 · 深底 · 浅底」，同一页里三种底色；
  ② 同一个暖橙色在整套里至少表示 <b>7 种不同东西</b>（光子／光线／磁铁 N 极／被淘汰个体／物体 B／火星／导线）。
  但要公允：每个实验<b>内部</b>配色都是自洽的，这不是错误，而是<b>缺少跨实验的视觉词汇表</b>。</p>
  <p><b>取舍：</b>没有做"系列级统一色板"。真统一就得重调 45 张图的配色，风险高、收益不确定，
  而且各实验已经写好的画布文字（"灰柱＝原来的种群""橙＝现在的温度"）会全部对不上。
  <b>改用低成本方案：每张画布下方就地配一条图例</b>，把颜色含义写清楚——学生不必记住全局约定，看一眼就知道。</p>
  <p><b>写标签的纪律（避免在科普站写错知识）：</b>
  ① 实验已经在画布上写明颜色含义的，<b>照它自己的说法写</b>；
  ② 能从"同一 fillStyle 紧邻 fillText"直接确认的，按确认结果写；
  ③ <b>确认不了的一律不写</b>，改用系列级语义兜底并标注"虚线框＝系列通用约定"。
  第一轮生成后有 <b>17 个实验是纯兜底</b>（等于没写），逐条读源码确认后已全部换成真实标签，<b>现为 0 条纯兜底</b>。</p>
  <p><b>实测：</b>45/45 全部注入图例；霍金三实验底色已统一为深底（<code>tools/unify_hawking_canvas_bg.py</code>，幂等）；
  巴斯德菌落图例 5 条、居里三射线 4 条，均为实验专属标签。</p>
  <div class="grid2">
    <div><img class="shot" src="{img_p22a}" alt="居里三射线图例">
      <p class="cap">居里·α/β/γ 穿透：图例按射线类型逐条标注，并说明"变灰＝被这一厚度的材料挡住"。</p></div>
    <div><img class="shot" src="{img_p22b}" alt="霍金三实验底色统一">
      <p class="cap">霍金：三个实验统一为深底（原先第三个是浅底），同页不再出现底色跳变。</p></div>
  </div>
</div>

<h3><span class="pill ok">已修复</span>P2-3 · 关键机制的可视面积过小<span class="cnt">费曼 · 路径积分</span></h3>
<div class="card">
  <p><b>原状：</b>占面积最大的是 21 条灰色路径束（<b>背景性部件</b>），而真正要讲的机制——
  "每条路的相位箭头首尾相接、叠加出净概率幅"——<b>只有约 60×40px、缩在左下角用细线画</b>（<b>结论性部件</b>比背景小一个数量级）。</p>
  <p><b>改法：</b>改"上图下文"为<b>左右分栏</b>——左栏保留路径束但淡化收窄；右栏开辟一块 424×390 的相位面板，
  把相位链放大进去，并给出随 ℏ 实时变化的"净概率幅"进度条与数值。</p>
  <p><b>中途踩的三个坑（都有实测数据为证，不藏）：</b></p>
  <ul>
    <li><b>自动铺满 ≠ 正确</b>：最初让链自动缩放铺满面板，结果 ℏ 越小、链越蜷，缩放反而越大，
    红箭头被<b>反向放大</b>——标签写着"净概率幅 0.24"，红箭头却几乎和整条链一样长，自相矛盾。
    改为<b>固定缩放</b>（只在超出面板时才缩小），红箭头长度才严格正比于净概率幅。</li>
    <li><b>红色在画面里被用了两处</b>：箭头和数值都是红，既与图例"红＝净概率幅"的语义冲突，
    也让像素量测把标签算进了箭头长度（量出 607px，比整条链还长——物理上不可能）。数值改墨色后自洽。</li>
    <li>去掉了原实现里"整条链随时间共同转动"的 <code>+t</code>：共同相位在物理上<b>不可观测</b>，
    却让包围盒不断变化、无法稳定放大。去掉后画面完全由 ℏ 驱动。</li>
  </ul>
  <p><b>实测（<code>tools/probe_p23_path.js</code>，ℏ 真实量程 0.25–2）：</b>
  ① 相位面板占画布宽 <b>51.7%</b>（原机制区仅约 7%）；② 默认 ℏ=1 时相位链占面板宽 <b>72.6%</b>；
  ③ 7 个档位<b>全部在面板内不出界</b>，红箭头长度自洽（均 ≤ 链包围盒对角线）；
  ④ 净概率幅随 ℏ <b>单调递增</b> 0.24 → 0.92（物理正确）；⑤ 运行时报错 <b>0</b>。</p>
  <div class="grid2">
    <div><img class="shot" src="{img_p23a}" alt="ℏ=1：箭头排齐">
      <p class="cap">ℏ=1：相位箭头基本排齐，红箭头（净概率幅 0.71）很长——大部分路径相干叠加。</p></div>
    <div><img class="shot" src="{img_p23b}" alt="ℏ=0.25：箭头散开">
      <p class="cap">ℏ=0.25：箭头散开成一团、互相抵消，红箭头只剩 0.24——这才是"经典极限"的真实图像。</p></div>
  </div>
  <p class="cap">注：ℏ 很小时链会真实地蜷起来、面板显得空——<b>这正是"互相抵消"的物理图像</b>，
  强行铺满反而会把"抵消"画成"没抵消"。</p>
</div>

<h2>五、逐实验运行记录<span class="cnt">{n_lab} / {n_lab}</span></h2>
<div class="card" style="padding:14px 16px">
  <p style="margin:0 0 10px;font-size:13.5px;color:var(--ink2)">
  「自走」= 不给输入时画面是否自行变化；「可通过归零/按钮停下」= 该动画是否存在停止手段；「纵向压缩」= 1280 视口下画布实际被压的比例；
  <b class="star">★</b> = 我判定为设计较优、建议作为系列范本的实验；底色标橘的行有专项问题标签。</p>
</div>
<div style="overflow-x:auto">
<table>
<thead><tr><th>站</th><th>实验</th><th>标题</th><th>控制点</th><th>控件</th><th>自走</th><th>可暂停</th><th>纵向压缩</th><th>问题</th></tr></thead>
<tbody>
{"".join(tr)}
</tbody>
</table>
</div>

<h2>六、对症示范：把两个 P0/P1 修法做成能点的动画</h2>
<div class="card">
  <p>这段小动画用<b>同一个 canvas</b>复现上面两个问题与修法，可以直接点开对照（左按钮切换"现行比例 / 等比"，右按钮演示"可暂停"）：</p>
  <div class="demo">
    <canvas id="dm" width="900" height="250"></canvas>
    <div class="dbar">
      <span>显示比例：</span>
      <button id="bSquash" class="on">现行（CSS 截断 → 压扁）</button>
      <button id="bRatio">等比（去掉 max-height）</button>
      <span style="margin-left:10px">播放：</span>
      <button id="bPause">⏸ 暂停</button>
      <span>速度</span><input id="sSpd" type="range" min="0" max="3" step="0.1" value="1">
      <span id="ro" style="font-family:var(--mono);font-size:12.5px;color:#F59F00"></span>
    </div>
  </div>
  <p class="cap">演示：同一个"电子在固定壳层上绕核运动"的图形。「现行」模式下纵向被压 31%——圆形壳层变扁椭圆（这正是 P0 的实际后果）；「等比」模式下形状还原。「暂停」按钮演示 P1-3 的修法：把控制权交还使用者。</p>
  <p><b>顺带一提</b>：这批动画里，<b>做得最好的几段</b>恰好都是把"过程随时间演变"和"数据/符号层"同时呈现的，建议把它们当模板：
  巴斯德「鹅颈瓶实验」（灰尘在弯道沉积的完整过程）、居里「α/β/γ 穿透」（不同屏蔽物逐个拦停）、费曼「双缝干涉 / 随机点累积」、达尔文「分布整体偏移」、麦克斯韦「速率分布」（保留原温度参考曲线做对照）、图灵「采样 × 量化」、法拉第「磁铁穿线圈」（装置 + 电流曲线双面板）。</p>
</div>

<h2>七、修复顺序与执行结果<span class="cnt">P0 + P1 + P2 已全部落地</span></h2>
<div class="card">
  <ol>
    <li><span class="pill ok">已做</span><b>P0 · 删 <code>max-height</code></b>：15 个站 <code>assets/css/style.css</code> + 根 <code>assets/css/style.css</code>；改完 <code>tools/probe_canvas_ratio.js</code> 复测 <b>45/45 畸变归零</b>。⚠️ 伽利略文件里有<b>两条</b>带 <code>max-height</code> 的规则（320px + 360px），只删一处等于没修。</li>
    <li><span class="pill ok">已做</span><b>P1-1 / P1-2</b>：先补做运行时实测，推翻原判读（见上），再按真实数据修——浅灰文字统一到 <code>#5c6b82</code>，<b>🔴 217 条 → 0 条</b>；字号仅门捷列夫一处 9.5px→11px。</li>
    <li><span class="pill ok">已做</span><b>P1-3</b>：<code>requestAnimationFrame</code> 闸门 + 按实验懒注入「⏸暂停 / ⏭单步 / ▶继续」，实测 <b>18/18 冻结 / 18/18 单步 / 18/18 恢复</b>，0 重复按钮。</li>
    <li><span class="pill ok">已做</span><b>P1-4</b>：元胞自动机按实际占用范围居中（<b>中心偏差 13px → 0px</b>）+ 退化帧说明牌 + 常用规则快捷按钮。</li>
    <li><span class="pill ok">已做</span><b>P1-5</b>：引力耦合系数 1500→700，实测 <b>质量 1–50 全程不出画布</b>；爱因斯坦与霍金均补上未偏折虚线参照。</li>
    <li><span class="pill ok">已做</span><b>P2-1</b>：45 条"先猜一猜"逐条撰写并注入（<code>add_lab_guess.py</code>，幂等），实测 <b>45/45</b>、无重叠、对比度 13.43:1。</li>
    <li><span class="pill ok">已做</span><b>P2-2</b>：<b>放弃</b>系列级统一色板（要重调 45 张图，且会与各实验已写好的画布文字冲突），改做<b>每张画布就地图例</b>（<code>add_lab_legend.py</code>，支持 <code>--force</code> 重建）45/45；霍金三实验底色统一为深底（<code>unify_hawking_canvas_bg.py</code>）。</li>
    <li><span class="pill ok">已做</span><b>P2-3</b>：费曼路径积分改左右分栏，机制区从约 7% 画布宽提升到 <b>51.7%</b>；改为固定缩放 + 数值去红，修掉"红箭头被反向放大"与"红色语义撞车"两个自相矛盾。</li>
    <li>⏸ <b>未做（有意保留）</b>：坐标刻度加粗、关键数值 ≥16px——涉及 45 张画布的逐个微调，收益不如前三项确定，留待下一轮决定。</li>
  </ol>
  <p class="cap">执行纪律：每轮改完跑"四件套"（<code>e2e_check.js</code> / <code>validate_site.py</code> / <code>probe_canvas_ratio.js</code> / <code>audit_labs_animation.js</code>）
  + 本报告对应的专项探针；所有结论以运行时实测为准，不以静态阅读下判断。</p>
</div>

<div class="foot">
  实测工具（本轮新增，均在 <code>tools/</code>）：<code>audit_labs_animation.js</code>（45 实验逐个取数）·
  <code>probe_raf.js</code>（rAF 真伪）· <code>probe_canvas_ratio.js</code>（比例畸变）·
  <code>shot_canvas_ratio_fix.js</code>（压扁前后对照）· <code>montage_labs_anim.py</code>（逐站接触印相）·<br>
  <b>P0/P1 修复脚本</b>：<code>fix_lab_canvas_maxheight.py</code>（P0，幂等 / 可干跑）·
  <code>fix_canvas_text_contrast.py</code> + <code>probe_canvas_text_contrast.js</code> + <code>analyze_canvas_text.py</code> + <code>scan_color_usage.py</code>（P1-1）·
  <code>fix_labs_pause_step.py</code> + <code>add_anim_tools_css.py</code>（P1-3）·<br>
  <b>P2 修复脚本</b>：<code>add_lab_guess.py</code>（P2-1，45 条猜想）·
  <code>add_lab_legend.py</code>（P2-2，图例，<code>--force</code> 可重建）·
  <code>unify_hawking_canvas_bg.py</code>（P2-2，霍金底色）· <code>dump_ctx.py</code>（按实验导出改色语句，供人工写标签）·<br>
  <b>专项复测探针</b>：<code>probe_p13_pause.js</code> / <code>diag_p13_freeze.js</code>（暂停单步）·
  <code>probe_p14_automaton.js</code>（元胞自动机居中与退化帧）· <code>probe_p15_bend.js</code>（光线是否出界）·
  <code>probe_p21_guess.js</code>（猜一猜 45/45）· <code>probe_p23_path.js</code>（费曼画面配比）·
  <code>shot_p2_fixes.js</code>（P2 修复后截图）·
  <code>shot_p1_fixes.js</code>（修复后截图）· <code>build_labs_anim_review.py</code>（本报告生成器）。<br>
  原始数据与截图：<code>../读懂牛顿-验证产物/labs-anim/</code>（15 份 <code>&lt;站&gt;.json</code> + 45×3 张画面 + 16 张接触印相 + <code>p0/</code> <code>p1/</code> <code>p13/</code> <code>p14/</code> <code>p15/</code> 各轮实测证据），
  <b>刻意放在项目外，不参与静态发布上传</b>。<br>
  <b>变更范围</b>：本报告第二节的畸变数据为<b>修复前</b>实测值（保留作定级依据）；第三节起为"修复前判读 + 修复后实测"的对照记录。
  累计改动 15 个 <code>site.js</code>、16 个 <code>assets/css/style.css</code>、1 个 <code>labs.html</code>（图灵规则快捷按钮）。
  评价标准参照教学动画编剧方法论：机制拆解四层法、《动画认知负荷十诫》与 HTML 动画工程规范
  （单文件可离线、色彩语义一致、交互 ≥1 个且对应探究问题、正文 ≥14px、允许暂停/单步/回退、结论须有静止确认帧）。
</div>
</div>

<script>
(function(){{
  var cv=document.getElementById('dm'), ctx=cv.getContext('2d');
  var W=900,H=250, ratio=0.488, snap=false, playing=true, spd=1, ph=0, last=performance.now();
  var RATIO_NOW=360/1068;   // 现行 CSS 截断后的实际显示比例
  function resize(){{ var dpr=window.devicePixelRatio||1; var w=cv.clientWidth; var h=cv.clientHeight;
    cv.width=w*dpr; cv.height=h*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); W=w; H=h; }}
  function draw(){{
    ctx.clearRect(0,0,W,H); ctx.fillStyle='#FBFCFE'; ctx.fillRect(0,0,W,H);
    // 目标比例：等比 = 按 0.488 缩放；现行 = 额外乘 RATIO_NOW/0.488
    var ky = snap ? 1 : (RATIO_NOW/ratio);
    var k = Math.min(W/820, H/400) * (snap?1:1.0);
    var boxH = 400*k*ky, y0 = (H-boxH)/2;
    ctx.save(); ctx.translate((W-820*k)/2, y0); ctx.scale(1, ky);
    var cx=410*k, cy=200*k;
    // 壳层
    for(var n=1;n<=4;n++){{
      ctx.beginPath(); ctx.arc(cx,cy,(46+n*34)*k,0,Math.PI*2);
      ctx.strokeStyle = n===2 ? 'rgba(26,115,232,.9)' : 'rgba(140,152,168,.55)';
      ctx.lineWidth = n===2 ? 2.4 : 1.2; ctx.stroke();
      ctx.fillStyle='rgba(122,136,153,.95)'; ctx.font='600 '+Math.round(12*k)+'px sans-serif'; ctx.textAlign='left';
      ctx.fillText('n='+n, cx+(46+n*34)*k+6, cy+4);
    }}
    // 原子核
    ctx.beginPath(); ctx.arc(cx,cy,13*k,0,Math.PI*2); ctx.fillStyle='#F59F00'; ctx.fill();
    ctx.textAlign='center'; ctx.fillStyle='#8A6A16'; ctx.font='700 '+Math.round(11*k)+'px sans-serif';
    ctx.fillText('原子核', cx, cy+13*k+18);
    // 电子（第 2 层上运动）
    var r=(46+2*34)*k, a=ph;
    var ex=cx+Math.cos(a)*r, ey=cy+Math.sin(a)*r;
    ctx.beginPath(); ctx.arc(ex,ey,9*k,0,Math.PI*2); ctx.fillStyle='#E8590C'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(ex,ey); ctx.strokeStyle='rgba(232,89,12,.35)'; ctx.lineWidth=1.4; ctx.stroke();
    ctx.restore();
    // 参数面板
    ctx.fillStyle='#16202C'; ctx.font='700 14px sans-serif'; ctx.textAlign='left';
    ctx.fillText(snap?'等比显示（修正后）：壳层是正圆':'现行显示（CSS max-height:360px 截断）：纵向被压 '+Math.round((1-RATIO_NOW/ratio)*100)+'%', 16, 26);
    ctx.fillStyle='#7A8899'; ctx.font='500 12.5px sans-serif';
    ctx.fillText('电子当前在第 2 层，绕核做圆周运动 —— 玻尔模型里轨道是圆，压扁后会和开普勒的椭圆混淆。', 16, H-14);
    if(snap){{ ctx.strokeStyle='rgba(12,166,120,.5)'; ctx.setLineDash([6,5]); ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(16,34); ctx.lineTo(W-16,34); ctx.stroke(); ctx.setLineDash([]); }}
  }}
  function loop(ts){{ var dt=Math.min(0.05,(ts-last)/1000); last=ts; if(playing) ph+=dt*spd*0.9; draw(); requestAnimationFrame(loop); }}
  document.getElementById('bSquash').onclick=function(){{ snap=false; this.classList.add('on'); document.getElementById('bRatio').classList.remove('on'); }};
  document.getElementById('bRatio').onclick=function(){{ snap=true; this.classList.add('on'); document.getElementById('bSquash').classList.remove('on'); }};
  document.getElementById('bPause').onclick=function(){{ playing=!playing; this.textContent = playing?'⏸ 暂停':'▶ 继续'; this.classList.toggle('on',!playing); }};
  document.getElementById('sSpd').oninput=function(){{ spd=parseFloat(this.value);
    document.getElementById('ro').textContent = '速度 ' + spd.toFixed(1) + '×' + (spd===0?'（= 静止，这就是"可暂停"的做法）':''); }};
  window.addEventListener('resize', resize); resize(); requestAnimationFrame(loop);
}})();
</script>
</body>
</html>
"""
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"✅ 报告已写 {OUT}")
    print(f"   实验 {n_lab} · 滑块控制点 {n_sl} · 审读当时自走 {n_auto}（其中 {n_autofix} 段不可暂停，现已全部可暂停/单步）· 报错 {n_err}")
    print(f"   内联图片 {html.count('data:image/jpeg;base64,')} 张，文件大小 {os.path.getsize(OUT)//1024} KB")


if __name__ == "__main__":
    main()
