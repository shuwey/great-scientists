#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""P2-2 ①：给每张画布加一条就地"图例"（色块＋字），写明颜色的含义。

为什么不用"跨实验大改色"：报告的评价是——每个实验**内部**颜色用法都是自洽的，
真正缺的是"跨实验的视觉词汇表"。所以这里不动各实验配好的颜色（改色要重调 45 张图的
配色，风险高、收益低），改为在每张画布下方就地标注颜色的含义。

写标签的纪律（避免在科普站写错知识）：
  ① 实验已经在画布上写明颜色含义的（例如"灰柱＝原来的种群 橙柱＝选择之后的种群"、
     "灰虚线：原来的温度 橙：现在的温度"），图例**照它自己的说法写**；
  ② 能从"同一个颜色画出来的文字标签"直接确认的（坐标变换后同一 fillStyle 紧邻 fillText），
     按确认结果写；
  ③ 确认不了的**一律不写**，改用系列级颜色语义兜底（暖色＝主体／冷色＝装置／红＝临界／灰＝参照），
     并在图例末尾标注"系列约定"，不含对该实验内部细节的断言。

用法：python3 tools/add_lab_legend.py [--dry-run|--rewrite]
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
IDS = ["copernicus","galileo","kepler","newton","faraday","darwin","pasteur","maxwell",
       "mendeleev","curie","einstein","bohr","turing","feynman","hawking"]
LABOPEN = re.compile(r'<div class="lab" data-lab="([^"]+)"')
CANVAS = re.compile(r'<canvas[^>]*></canvas>')

# ——— ①/② 经确认的实验专属条目（色值来自各站 site.js 的字面量） ———
LAB = {
 ("copernicus","retro"):    [("#3B7DD8","地球"), ("#C1553A","火星"), ("#E03131","逆行的那一段")],
 ("copernicus","parallax"): [("#3B7DD8","1 月的位置"), ("#0CA678","7 月的位置"), ("#E03131","摆动幅度")],
 ("copernicus","solar"):    [("#F59F00","太阳"), ("#DCE2EC","虚线圆＝行星轨道")],
 ("galileo","telescope"):   [("#E8A33D","伊奥"), ("#D7DCE5","欧罗巴"),
                             ("#C9A06B","盖尼米德"), ("#8B96AA","卡利斯托")],
 ("galileo","incline"):     [("#F59F00","橙色刻度＝第 1、2、3 秒应到的位置")],
 ("kepler","third"):        [("#E03131","红虚线＝离那条直线还有多远"), ("#0CA678","目标直线：T² ∝ a³")],
 ("newton","prism"):        [("{grad:7色}","棱镜分出的七色＝白光的成分"), ("#5B6675","入射的白光")],
 ("newton","gravity"):      [("#E8590C","物体 B"), ("#3B5BDB","物体 A")],
 ("newton","projectile"):   [("#E8590C","炮弹轨迹"), ("#087F5B","射程")],
 ("faraday","lines"):       [("#E03131","N 极"), ("#1C7ED6","S 极"), ("#3B5BDB","磁力线（永远闭合）")],
 ("darwin","selection"):    [("#8B96AA","灰柱＝原来的种群"), ("#E8590C","橙柱＝选择之后的种群")],
 ("darwin","population"):   [("#E03131","红点＝没长大就被淘汰的个体")],
 ("pasteur","heat"):        [("#2F9E44","绿实线＝当前温度"), ("#E03131","安全线：杀灭 5 个对数级")],
 ("maxwell","wave"):        [("#1C7ED6","电场 E（上下振）"), ("#E8590C","磁场 B（垂直纸面振）")],
 ("maxwell","speed"):       [("#B0BAC9","灰虚线＝原来的温度"), ("#E8590C","橙＝现在的温度"),
                             ("#F4C3A9","阴影＝速率超过门槛的分子")],
 ("maxwell","field"):       [("#C1440E","通电直导线"), ("#3B5BDB","环形磁力线")],
 ("mendeleev","grid"):      [("{grad:family}","同色的列＝同一族（最外层电子数相同）"),
                             ("#1B2530","黑框＝被高亮的那一族")],
 ("mendeleev","fill"):      [("#3B5BDB","蓝＝当年已知的元素"), ("#E8590C","橙实线＝后来发现、填上的"),
                             ("#C9D3E0","灰虚线＝还没填上的空格")],
 ("einstein","bend"):       [("#9AA7BE","灰虚线＝没有引力时本该笔直的路径"), ("#F59F00","恒星")],
 ("einstein","photon"):     [("#E8590C","光子"), ("#3B5BDB","金属里的电子")],
 ("einstein","time"):       [("#3B5BDB","蓝框＝飞船上的光钟"), ("#9AA7BE","灰粗线＝上下两面镜子"),
                             ("#F59F00","橙点＝光子（一上一下＝1 秒）")],
 ("bohr","levels"):         [("#F7C1C1","淡红区域＝电子不许停在这里")],
 ("bohr","shells"):         [("#F59F00","原子核"), ("#0CA678","电子"),
                             ("#DCE2EC","虚线圆＝电子可以待的能级轨道")],
 ("bohr","lines"):          [("{grad:7色}","彩带＝按真实波长上色的可见光谱"),
                             ("#E03131","红箭头＝电子这一次跃迁对应的谱线"),
                             ("#C7D0DE","灰横线＝能级（左侧能级图）")],
 ("turing","automaton"):    [("#2B3440","深格＝黑（1）"), ("#E7ECF3","浅格＝白（0）")],
 ("turing","turing"):       [("#3B5BDB","深蓝格＝纸带上写着 1"), ("#E7ECF3","浅格＝纸带上写着 0"),
                             ("#E8590C","橙条＝读写头当前所在格")],
 ("turing","signal"):       [("#3B5BDB","蓝线＝真实的连续信号"),
                             ("#E8590C","橙线＝采样量化后机器重建的波形"),
                             ("#2B3440","底部编码带：深格＝1，浅格＝0")],
 ("feynman","path"):        [("#DDE0E4","浅灰细线＝21 条可能路径"), ("#E8590C","橙线＝经典路径"),
                             ("#1A73E8","蓝＝各路径的相位箭头"), ("#E03131","红＝首尾相接后的净概率幅")],
 ("feynman","dist"):        [("#1C6ED6","单个电子的落点"), ("#E8590C","累积出的干涉条纹")],
 ("hawking","bh"):          [("#FFD43B","视界"), ("#FFE066","光子环")],
 ("hawking","orbit"):       [("#FFD43B","视界"), ("#858FA1","灰虚线＝没有引力时的笔直路径"),
                             ("#FF6B6B","逃不出去的那束光")],
 ("hawking","temp"):        [("#E8590C","霍金辐射的谱线"), ("#FFD43B","视界"), ("#FF6B6B","峰值波长")],

 # —— 第二轮补齐：原先只能靠系列兜底的实验，逐条读源码确认后写成真实标签 ——
 ("curie","rays"):          [("#E03131","α 射线（氦核，一张纸就挡住）"),
                             ("#3B5BDB","β 射线（高速电子）"),
                             ("#0CA678","γ 射线（高能光子，穿透力最强）"),
                             ("#B9C3D4","变灰＝被这一厚度的材料挡住")],
 ("curie","purify"):        [("#6B5744","棕格＝沥青铀矿残渣（每格约 0.5 吨）"),
                             ("rgba(12,166,120,0.6)","绿光＝提取出来的镭（越多越亮）")],
 ("curie","decay"):         [("#3B5BDB","蓝线＝还剩多少放射性强度"),
                             ("#E03131","红虚线＋红点＝当前时刻"),
                             ("rgba(139,150,170,0.8)","灰虚线＝每一个半衰期")],
 ("darwin","tree"):         [("#E03131","红竖线＝你拖动的那个年代"),
                             ("#C4CDDB","灰枝＝树的枝干，横线＝两支线分家的时刻"),
                             ("#E8590C","末端圆点＝现生物种（人／黑猩猩／大猩猩／红毛猩猩）")],
 ("faraday","induction"):   [("#E03131","磁铁 N 极 · 电流计的指针"),
                             ("#1C7ED6","磁铁 S 极 · 感应电流随时间的变化"),
                             ("#495057","深色圆环＝线圈")],
 ("faraday","ac"):          [("#E03131","N 极"), ("#1C7ED6","S 极"),
                             ("#F59F00","琥珀线圈＝在磁场里转动的线圈")],
 ("feynman","interfere"):   [("{grad:7色}","波的颜色＝你选的波长（按真实可见光上色）"),
                             ("#E8590C","橙线＝屏幕上的光强分布")],
 ("galileo","pendulum"):    [("linear-gradient(135deg,#FFD8A8,#E8590C)","橙球＝摆球（质量越大球越大）"),
                             ("#5C6B82","灰细线＝摆线"), ("#3B5BDB","蓝点＝悬点")],
 ("kepler","ellipse"):      [("#E8590C","太阳（坐在椭圆的一个焦点上）"),
                             ("#3B5BDB","行星"), ("#C9D3E0","灰椭圆＝轨道"),
                             ("#9AA7BC","灰点＝空着的另一个焦点")],
 ("kepler","areal"):        [("rgba(59,91,219,0.35)","淡蓝扇形＝12 块等时间的面积（每块一样大）"),
                             ("rgba(245,159,0,0.5)","橙扇形＝当前正在扫过的那块"),
                             ("#F59F00","橙点＝太阳")],
 ("mendeleev","trend"):     [("#6741D9","紫＝稀有气体（峰顶）"), ("#E03131","红＝碱金属（谷底）"),
                             ("rgba(59,91,219,0.62)","蓝＝其他元素")],
 ("pasteur","colony"):      [("#8B96AA","迟缓期"), ("#1C7ED6","对数期"), ("#2F9E44","稳定期"),
                             ("#E03131","衰亡期"), ("#6741D9","紫线＝当前曲线")],
 ("pasteur","spread"):      [("rgba(120,132,152,0.62)","灰点＝空气里的灰尘与微生物"),
                             ("#E03131","红虚线＝微生物直接落进肉汤"),
                             ("rgba(246,222,148,0.66)","黄＝清澈、不腐"),
                             ("rgba(150,168,86,0.62)","绿＝浑浊、腐败")],
}

# ——— ③ 系列级颜色语义兜底 ———
SERIES = [
 ("#E8590C", "暖色（橙／琥珀）＝主体、被观察的对象", "warm"),
 ("#3B5BDB", "冷色（蓝）＝装置、作用于它的一方", "cool"),
 ("#E03131", "红＝临界、被淘汰或结论", "red"),
 ("#9AA7BE", "灰＝参照线、网格、未选中", "gray"),
]
FAM = {
 "warm": re.compile(r"#E8590C|#F59F00|#F76707|#FAB005|#C1440E|#FF6B6B|#FFD43B|#E8A33D|"
                    r"#C98A3C|#FFC078|#FFE066|#B26A00|#E08500|#C1553A"),
 "cool": re.compile(r"#3B5BDB|#1C7ED6|#3B7DD8|#4DABF7|#2F49AF|#6741D9|#5F3DC4|#B197FC|#A5B8FF|#1C73E8"),
 "red":  re.compile(r"#E03131|#C92A2A|#FF6B6B|rgba\(224\s*,\s*49\s*,\s*49"),
 "gray": re.compile(r"#9AA7BE|#8B96AA|#C9D3E0|#B0BAC9|#DCE2EC|#5B6675|#4A5468|#2B3440|#868E96|#ADB5BD"),
}

CSS_BLOCK = """
/* ===== P2-2：画布就地图例（颜色语义，2026-09-14） =====
   报告指出：45 个实验内部配色各自自洽，但没有跨实验的"视觉词汇表"——
   同一个暖橙在整套里至少表示光子/光线/磁极/被淘汰个体/物体B/火星/导线 7 种东西。
   做法不改各实验配好的颜色（改色要重调 45 张图、风险高），而是在每张画布下方
   就地标出颜色含义；实验自己在画面上写明过的，就照它的说法标注。 */
.lab-legend {
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px 18px;
  margin: 10px 0 0; font-size: 12.5px; color: var(--ink-2); line-height: 1.5;
}
.lab-legend .lg-head {
  font-weight: 700; color: var(--ink); letter-spacing: .02em;
  padding-right: 2px; border-right: 1px solid var(--line); margin-right: 4px;
}
.lab-legend .lg-item { display: inline-flex; align-items: center; gap: 6px; }
.lab-legend .lg-item i {
  width: 15px; height: 11px; border-radius: 3px; flex: 0 0 auto;
  border: 1px solid rgba(27, 37, 48, .18);
  background: #ccc;
}
.lab-legend .lg-item.series i { border-style: dashed; }
.lab-legend .lg-note { color: var(--ink-3); font-size: 12px; }
"""


def lab_bodies(sid):
    t = (ROOT / "scientists" / sid / "assets/js/site.js").read_text(encoding="utf-8")
    marks = [(m.start(), m.group(1)) for m in re.finditer(r"^\s*function (lab_?[A-Za-z_]+)\s*\(", t, re.M)]
    out = {}
    for i, (pos, name) in enumerate(marks):
        end = marks[i + 1][0] if i + 1 < len(marks) else len(t)
        out[name] = t[pos:end]
    return out


def chip(spec):
    if spec.startswith("{grad:7色}"):
        return ('<i style="background:linear-gradient(90deg,#E03131,#F76707,#FAB005,'
                '#51CF66,#3B5BDB,#5F3DC4,#9C36B5)"></i>')
    if spec.startswith("{grad:family}"):
        # 周期表的族色是 hsl(c/18*320, 60%, 78%)，用同样的 hsl 画渐变，颜色对得上
        return ('<i style="background:linear-gradient(90deg,hsl(0,60%,78%),hsl(80,60%,78%),'
                'hsl(160,60%,78%),hsl(240,60%,78%),hsl(320,60%,78%))"></i>')
    return f'<i style="background:{spec}"></i>'


def norm(name):
    # data-lab 的属性值与函数名不一定同名（lab_retro ↔ retro、labTime ↔ time）
    return re.sub(r"^lab", "", name).lstrip("_").lower()


def fn_key(bodies, lab):
    """按归一化后的名字精确匹配绘制函数（不做子串匹配，避免 field/wave 这类误配）。"""
    target = norm(lab)
    for fn in bodies:
        if norm(fn) == target:
            return fn
    return ""


def build_legend(sid, lab, body):
    items, used = [], set()
    for c, t in LAB.get((sid, lab), []):
        items.append(f'<span class="lg-item">{chip(c)}{t}</span>')
    # 系列兜底：按该实验实际用到的颜色族补齐（最多补到 3 条）
    for c, t, fam in SERIES:
        if len(items) >= 3:
            break
        if fam in used:
            continue
        if FAM[fam].search(body):
            used.add(fam)
            items.append(f'<span class="lg-item series">{chip(c)}{t}</span>')
    if not items:
        return None
    note = '<span class="lg-note">（虚线框＝系列通用约定）</span>' if any("series" in i for i in items) else ""
    return ('<div class="lab-legend"><span class="lg-head">颜色含义</span>'
            + "".join(items) + note + "</div>")


LEGEND_DIV = re.compile(r'[ \t]*<div class="lab-legend">.*?</div>\n?', re.S)


def main():
    apply = "--rewrite" in sys.argv
    force = "--force" in sys.argv          # 先清掉旧图例再重建（改了 LAB 条目后必须加）
    tot, miss, stripped = 0, [], 0
    for sid in IDS:
        p = ROOT / "scientists" / sid / "labs.html"
        html = p.read_text(encoding="utf-8")
        if force:
            html, n = LEGEND_DIV.subn("", html)
            stripped += n
        bodies = lab_bodies(sid)
        # 从后往前插，避免下标失效
        spans = []
        for m in LABOPEN.finditer(html):
            lab, start = m.group(1), m.end()
            depth, i = 1, start
            while depth > 0 and i < len(html):
                no, nc = html.find("<div", i), html.find("</div>", i)
                if nc == -1:
                    break
                if no != -1 and no < nc:
                    depth += 1; i = no + 4
                else:
                    depth -= 1; i = nc + 6
            spans.append((lab, start, i))
        for lab, start, end in reversed(spans):
            block = html[start:end]
            if 'class="lab-legend"' in block:
                continue
            body = bodies.get(fn_key(bodies, lab), "")
            if not body:
                miss.append((sid, lab, "找不到对应的绘制函数")); continue
            lg = build_legend(sid, lab, body)
            if not lg:
                miss.append((sid, lab, "无可用条目")); continue
            cm = CANVAS.search(block)
            if not cm:
                miss.append((sid, lab, "找不到 <canvas>")); continue
            indent = "      "
            new_block = block[:cm.end()] + f"\n{indent}{lg}" + block[cm.end():]
            html = html[:start] + new_block + html[end:]
            tot += 1
        if apply:
            p.write_text(html, encoding="utf-8")
    print(f"[labs.html] 清除旧图例 {stripped} 处 / 注入图例 {tot} 处"
          + ("（已落盘）" if apply else "（dry-run）"))
    if miss:
        print("⚠️ 未处理：")
        for x in miss:
            print("   ", x)

    css_targets = [ROOT / "scientists" / s / "assets/css/style.css" for s in IDS]
    css_targets.append(ROOT / "assets/css/style.css")
    n = 0
    for c in css_targets:
        if not c.exists():
            continue
        t = c.read_text(encoding="utf-8")
        if ".lab-legend" in t:
            continue
        if apply:
            c.write_text(t.rstrip() + "\n" + CSS_BLOCK, encoding="utf-8")
        n += 1
    print(f"[style.css] {'写入' if apply else '待写入'} {n} 个文件")


if __name__ == "__main__":
    main()
