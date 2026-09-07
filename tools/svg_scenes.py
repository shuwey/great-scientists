# -*- coding: utf-8 -*-
"""《读懂科学家》系列 · SVG 场景库（线稿风，浅蓝底，与爱因斯坦/伽利略一致）

每个 scene_* 函数返回一段 SVG 内部元素字符串（不含 <svg> 根标签）。
make_svg() 负责包裹根标签、背景、统一画布。

风格参数：
    BG      = "#EEF2FB"   浅蓝底
    INK     = "#1B2530"   主墨色
    SUB     = "#5C6B82"   次墨色
    BRAND   = "#3B5BDB"   主题蓝
    ACCENT  = "#E8590C"   强调橙
    SOFT    = "#C9D3E0"   浅描边
"""

BG = "#EEF2FB"
INK = "#1B2530"
SUB = "#5C6B82"
BRAND = "#3B5BDB"
ACCENT = "#E8590C"
SOFT = "#C9D3E0"
GOLD = "#C98A3C"
GREEN = "#2F9E44"
PURPLE = "#6741D9"


def make_svg(inner, w=480, h=320, bg=BG):
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" '
        'font-family="-apple-system,BlinkMacSystemFont,\'PingFang SC\',\'Microsoft YaHei\',sans-serif">'
        % (w, h)
        + '<rect width="%d" height="%d" fill="%s"/>' % (w, h, bg)
        + inner
        + "</svg>"
    )


def _t(x, y, s, fill=INK, size=15, weight="700", anchor="middle"):
    return '<text x="%g" y="%g" font-size="%g" font-weight="%s" fill="%s" text-anchor="%s">%s</text>' % (
        x, y, size, weight, fill, anchor, s)


# ----------------------------------------------------------------------
# 1. 日心体系：太阳居中 + 若干同心轨道 + 行星
# ----------------------------------------------------------------------
def heliocentric(planets=6, label="太阳居中，行星绕日"):
    cx, cy = 240, 160
    inner = ""
    for i in range(1, planets + 1):
        r = 26 + i * 22
        inner += '<circle cx="%d" cy="%d" r="%d" fill="none" stroke="%s" stroke-width="1.5"/>' % (cx, cy, r, SOFT)
        ang = (i * 47) % 360
        import math
        px = cx + r * math.cos(math.radians(ang))
        py = cy + r * math.sin(math.radians(ang))
        inner += '<circle cx="%g" cy="%g" r="7" fill="%s"/>' % (px, py, BRAND if i % 2 else GOLD)
    inner += '<circle cx="%d" cy="%d" r="16" fill="%s"/>' % (cx, cy, ACCENT)
    inner += _t(cx, cy + 5, "日", "#fff", 14, "800")
    inner += _t(240, 300, label, SUB, 14, "600")
    return make_svg(inner)


# ----------------------------------------------------------------------
# 2. 椭圆轨道（开普勒）：焦点处的太阳 + 椭圆
# ----------------------------------------------------------------------
def ellipse_orbit(label="行星沿椭圆轨道绕日，太阳在一个焦点上"):
    import math
    cx, cy = 250, 160
    rx, ry = 150, 95
    c = math.sqrt(rx * rx - ry * ry)  # 焦点偏距
    fx, fx2 = cx - c, cx + c
    inner = ""
    # 背景星点
    for sx, sy, sr in [(58, 52, 2), (110, 86, 1.5), (420, 60, 2), (452, 120, 1.5), (66, 250, 1.5), (430, 262, 2)]:
        inner += '<circle cx="%g" cy="%g" r="%g" fill="%s" opacity=".55"/>' % (sx, sy, sr, SOFT)
    # 椭圆轨道
    inner += '<ellipse cx="%d" cy="%d" rx="%d" ry="%d" fill="none" stroke="%s" stroke-width="2.5"/>' % (cx, cy, rx, ry, BRAND)
    # 长轴与两焦点（虚线）
    inner += '<line x1="%g" y1="%d" x2="%g" y2="%d" stroke="%s" stroke-width="1.5" stroke-dasharray="5 5" opacity=".7"/>' % (cx - rx, cy, cx + rx, cy, SOFT)
    inner += '<circle cx="%g" cy="%d" r="5" fill="none" stroke="%s" stroke-width="2"/>' % (fx2, cy, SUB)
    inner += _t(fx2, cy - 12, "另一焦点", SUB, 11, "600")
    # 太阳在焦点
    inner += '<circle cx="%g" cy="%d" r="13" fill="%s"/>' % (fx, cy, ACCENT)
    inner += _t(fx, cy + 5, "日", "#fff", 13, "800")
    # 行星在椭圆上 + 连日半径线
    ang = 0.6
    px = cx + rx * math.cos(ang)
    py = cy + ry * math.sin(ang)
    inner += '<line x1="%g" y1="%d" x2="%g" y2="%g" stroke="%s" stroke-width="1.5" stroke-dasharray="4 4"/>' % (fx, cy, px, py, GOLD)
    inner += '<circle cx="%g" cy="%g" r="8" fill="%s"/>' % (px, py, GOLD)
    inner += _t(px + 2, py - 14, "行星", GOLD, 11, "700")
    # 近日/远日标注（画在椭圆上缘内侧，避免贴边/出界）
    inner += _t(fx - 34, cy - ry + 22, "近日", SUB, 11, "600")
    inner += _t(fx2 + 34, cy - ry + 22, "远日", SUB, 11, "600")
    inner += _t(240, 300, label, SUB, 14, "600")
    return make_svg(inner)


# ----------------------------------------------------------------------
# 3. 单摆
# ----------------------------------------------------------------------
def pendulum(label="摆：质量不影响周期"):
    px, py = 240, 60
    inner = '<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="2"/>' % (px - 60, py, px + 60, py, SUB)
    bx, by = 240 + 90, py + 150
    inner += '<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="2.5"/>' % (px, py, bx, by, "#5C6B82")
    inner += '<circle cx="%d" cy="%d" r="16" fill="%s"/>' % (bx, by, ACCENT)
    inner += '<circle cx="%d" cy="%d" r="5" fill="%s"/>' % (px, py, BRAND)
    inner += _t(240, 300, label, SUB, 14, "600")
    return make_svg(inner)


# ----------------------------------------------------------------------
# 4. 行进波（正弦）
# ----------------------------------------------------------------------
def wave(label="波：振幅与波长"):
    import math
    inner = ""
    path = "M 30 160"
    for x in range(30, 450, 6):
        y = 160 - 55 * math.sin((x - 30) / 60.0)
        path += " L %d %d" % (x, y)
    inner += '<path d="%s" fill="none" stroke="%s" stroke-width="3"/>' % (path, BRAND)
    inner += '<line x1="30" y1="160" x2="450" y2="160" stroke="%s" stroke-width="1" stroke-dasharray="4 4"/>' % SOFT
    inner += _t(240, 300, label, SUB, 14, "600")
    return make_svg(inner)


# ----------------------------------------------------------------------
# 5. 中心天体 + 绕转卫星（望远镜/木星/原子外电子通用）
# ----------------------------------------------------------------------
def orbit(center_name="木", center_color=ACCENT, moons=4, label="卫星绕中心天体转"):
    import math
    cx, cy = 240, 150
    inner = ""
    import random
    random.seed(7)
    for i in range(1, moons + 1):
        r = 35 + i * 30
        inner += '<circle cx="%d" cy="%d" r="%d" fill="none" stroke="%s" stroke-width="1.3"/>' % (cx, cy, r, SOFT)
        ang = (i * 53) % 360
        mx = cx + r * math.cos(math.radians(ang))
        my = cy + r * math.sin(math.radians(ang)) * 0.6
        inner += '<circle cx="%g" cy="%g" r="6" fill="%s"/>' % (mx, my, GOLD if i % 2 else BRAND)
    # 中心
    inner += '<circle cx="%d" cy="%d" r="20" fill="%s"/>' % (cx, cy, center_color)
    inner += _t(cx, cy + 6, center_name, "#fff", 16, "800")
    inner += _t(240, 300, label, SUB, 14, "600")
    return make_svg(inner)


# ----------------------------------------------------------------------
# 6. 抛体抛物线
# ----------------------------------------------------------------------
def projectile(label="水平抛出 → 抛物线"):
    import math
    inner = '<line x1="40" y1="270" x2="450" y2="270" stroke="%s" stroke-width="2"/>' % SUB
    path = "M 60 270"
    for t in range(0, 40):
        x = 60 + t * 9
        y = 270 - (120 * (t / 39.0) - 90 * (t / 39.0) ** 2)
        y = max(40, min(270, y))
        path += " L %d %d" % (x, y)
    inner += '<path d="%s" fill="none" stroke="%s" stroke-width="3"/>' % (path, BRAND)
    inner += '<circle cx="60" cy="270" r="8" fill="%s"/>' % ACCENT
    inner += _t(240, 300, label, SUB, 14, "600")
    return make_svg(inner)


# ----------------------------------------------------------------------
# 7. 原子（玻尔/居里通用）
# ----------------------------------------------------------------------
def atom(n_shells=3, label="原子核 + 绕转电子"):
    import math
    cx, cy = 240, 150
    inner = ""
    for i in range(1, n_shells + 1):
        r = 28 * i
        inner += '<circle cx="%d" cy="%d" r="%d" fill="none" stroke="%s" stroke-width="1.4" transform="rotate(%d %d %d)"/>' % (
            cx, cy, r, SOFT, i * 30, cx, cy)
    inner += '<circle cx="%d" cy="%d" r="12" fill="%s"/>' % (cx, cy, BRAND)
    inner += _t(cx, cy + 5, "+", "#fff", 14, "800")
    # 电子
    for i in range(n_shells):
        ang = (i * 120) % 360
        ex = cx + 28 * (i + 1) * math.cos(math.radians(ang))
        ey = cy + 28 * (i + 1) * math.sin(math.radians(ang))
        inner += '<circle cx="%g" cy="%g" r="5" fill="%s"/>' % (ex, ey, ACCENT)
    inner += _t(240, 300, label, SUB, 14, "600")
    return make_svg(inner)


# ----------------------------------------------------------------------
# 8. 坐标系 + 函数曲线
# ----------------------------------------------------------------------
def graph(kind="sine", label="y = f(x) 的图像"):
    import math
    inner = '<line x1="40" y1="40" x2="40" y2="280" stroke="%s" stroke-width="1.5"/>' % SUB
    inner += '<line x1="40" y1="250" x2="450" y2="250" stroke="%s" stroke-width="1.5"/>' % SUB
    pts = []
    for x in range(40, 450, 5):
        t = (x - 40) / 60.0
        if kind == "sine":
            y = 250 - 90 * math.sin(t)
        elif kind == "exp":
            y = 250 - 200 * (1 - math.exp(-t / 4.0))
        elif kind == "gauss":
            y = 250 - 150 * math.exp(-((t - 3.5) ** 2) / 3.0)
        elif kind == "growth":
            y = 250 - 190 * (math.exp(0.18 * t) - 1) / (math.exp(0.18 * 9) - 1)
        else:
            y = 250 - 90 * math.sin(t)
        y = max(40, min(280, y))
        pts.append((x, y))
    d = "M " + " L ".join("%d %d" % p for p in pts)
    inner += '<path d="%s" fill="none" stroke="%s" stroke-width="3"/>' % (d, BRAND)
    inner += _t(240, 300, label, SUB, 14, "600")
    return make_svg(inner)


# ----------------------------------------------------------------------
# 9. 指数增长曲线（达尔文/种群）
# ----------------------------------------------------------------------
def growth(label="种群：指数增长 vs 受限"):
    import math
    inner = '<line x1="40" y1="40" x2="40" y2="280" stroke="%s" stroke-width="1.5"/>' % SUB
    inner += '<line x1="40" y1="250" x2="450" y2="250" stroke="%s" stroke-width="1.5"/>' % SUB
    # 指数
    p1 = []
    for x in range(40, 450, 5):
        t = (x - 40) / 60.0
        y = 250 - 190 * (math.exp(0.16 * t) - 1) / (math.exp(0.16 * 9) - 1)
        p1.append((x, max(40, min(280, y))))
    inner += '<path d="M ' + " L ".join("%d %d" % p for p in p1) + '" fill="none" stroke="%s" stroke-width="3"/>' % BRAND
    # 受限（S 形）
    p2 = []
    for x in range(40, 450, 5):
        t = (x - 40) / 60.0
        y = 250 - 200 / (1 + math.exp(-(t - 4)))
        p2.append((x, max(40, min(280, y))))
    inner += '<path d="M ' + " L ".join("%d %d" % p for p in p2) + '" fill="none" stroke="%s" stroke-width="2.5" stroke-dasharray="5 4"/>' % GREEN
    inner += _t(240, 300, label, SUB, 14, "600")
    return make_svg(inner)


# ----------------------------------------------------------------------
# 10. 显微镜 / 培养皿（巴斯德/微生物）
# ----------------------------------------------------------------------
def microscope(label="显微镜：看见肉眼看不见的"):
    inner = ""
    # 镜筒
    inner += '<rect x="200" y="70" width="22" height="120" rx="6" fill="%s" transform="rotate(20 211 130)"/>' % BRAND
    # 载物台
    inner += '<rect x="170" y="200" width="140" height="14" rx="4" fill="%s"/>' % SUB
    # 标本
    inner += '<circle cx="250" cy="207" r="9" fill="%s" opacity="0.5"/>' % GREEN
    inner += '<circle cx="258" cy="204" r="6" fill="%s" opacity="0.6"/>' % GOLD
    # 镜臂/底座
    inner += '<path d="M 188 200 L 160 250 L 300 250 L 280 210" fill="none" stroke="%s" stroke-width="3"/>' % SUB
    inner += _t(240, 300, label, SUB, 14, "600")
    return make_svg(inner)


# ----------------------------------------------------------------------
# 11. 元素周期表网格（门捷列夫）
# ----------------------------------------------------------------------
def periodic(cols=8, rows=4, label="元素周期表：规律的秩序"):
    inner = ""
    x0, y0, cw, ch = 60, 60, 42, 38
    for r in range(rows):
        for c in range(cols):
            x = x0 + c * cw
            y = y0 + r * ch
            fill = BRAND if (r + c) % 5 == 0 else ("#fff" if (r * cols + c) % 2 else "#F4F7FE")
            inner += '<rect x="%d" y="%d" width="%d" height="%d" rx="5" fill="%s" stroke="%s" stroke-width="1"/>' % (
                x, y, cw - 4, ch - 4, fill, SOFT)
            if (r * cols + c) % 4 == 0:
                inner += _t(x + (cw - 4) / 2, y + 22, "●", ACCENT, 12, "800")
    inner += _t(240, 300, label, SUB, 14, "600")
    return make_svg(inner)


# ----------------------------------------------------------------------
# 12. 进化树（达尔文）
# ----------------------------------------------------------------------
def tree(label="生命之树：从共同祖先分枝"):
    inner = ""
    # 主干
    inner += '<line x1="60" y1="250" x2="200" y2="160" stroke="%s" stroke-width="3"/>' % SUB
    branches = [(200, 160, 280, 90), (200, 160, 300, 150), (200, 160, 290, 220), (200, 160, 260, 260)]
    for ex, ey, tx, ty in branches:
        inner += '<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="2.5"/>' % (ex, ey, tx, ty, BRAND)
        inner += '<circle cx="%d" cy="%d" r="9" fill="%s"/>' % (tx, ty, GREEN)
    inner += '<circle cx="60" cy="250" r="9" fill="%s"/>' % GOLD
    inner += _t(240, 300, label, SUB, 14, "600")
    return make_svg(inner)


# ----------------------------------------------------------------------
# 13. 图灵机：纸带 + 读写头
# ----------------------------------------------------------------------
def turing(label="图灵机：一条纸带 + 一个读写头"):
    inner = ""
    y = 170
    for i in range(8):
        x = 70 + i * 44
        fill = ACCENT if i == 3 else "#fff"
        inner += '<rect x="%d" y="%d" width="40" height="44" rx="5" fill="%s" stroke="%s" stroke-width="1.5"/>' % (
            x, y, fill, SOFT)
        sym = ["0", "1", "1", "0", "1", "0", "0", "1"][i]
        inner += _t(x + 20, y + 28, sym, "#fff" if i == 3 else INK, 16, "800")
    # 读写头
    inner += '<path d="M 252 130 L 240 130 L 264 130 L 252 150 Z" fill="%s"/>' % BRAND
    inner += _t(240, 300, label, SUB, 14, "600")
    return make_svg(inner)


# ----------------------------------------------------------------------
# 14. 黑洞 / 时空弯曲（霍金）
# ----------------------------------------------------------------------
def blackhole(label="黑洞：时空被压出一个洞"):
    cx, cy = 240, 150
    inner = ""
    import math
    # 吸积盘（椭圆环）
    for i in range(3):
        r = 70 + i * 22
        inner += '<ellipse cx="%d" cy="%d" rx="%d" ry="%d" fill="none" stroke="%s" stroke-width="2" opacity="%g"/>' % (
            cx, cy, r, r * 0.32, GOLD if i == 0 else SOFT, 0.9 - i * 0.25)
    # 事件视界
    inner += '<circle cx="%d" cy="%d" r="34" fill="#0B1020"/>' % (cx, cy)
    inner += '<circle cx="%d" cy="%d" r="34" fill="none" stroke="%s" stroke-width="2"/>' % (cx, cy, BRAND)
    inner += _t(240, 300, label, SUB, 14, "600")
    return make_svg(inner)


# ----------------------------------------------------------------------
# 15. 电场 / 力线（麦克斯韦）
# ----------------------------------------------------------------------
def field(label="场：看不见，却处处有力"):
    import math
    inner = ""
    cx, cy = 240, 150
    # 两根带电棒
    inner += '<rect x="%d" y="%d" width="20" height="120" rx="4" fill="%s"/>' % (120, 90, BRAND)
    inner += '<rect x="%d" y="%d" width="20" height="120" rx="4" fill="%s"/>' % (340, 90, ACCENT)
    # 力线（抛物线状连接）
    for k in range(-2, 3):
        yy = 150 + k * 22
        path = "M 140 %d Q 240 %d 360 %d" % (yy, yy + (0 if k == 0 else 0), yy)
        inner += '<path d="%s" fill="none" stroke="%s" stroke-width="1.4" opacity="0.6"/>' % (path, SUB)
    inner += _t(240, 300, label, SUB, 14, "600")
    return make_svg(inner)


# ----------------------------------------------------------------------
# 场景分发
# ----------------------------------------------------------------------
def feynman_diagram(label="两条电子线交换一个虚光子"):
    """费曼图：时间向上、空间向右；两条电子线交换一个光子。"""
    import math
    inner = ""
    xl, xr, ytop, ybot, ymid = 170, 330, 70, 250, 160
    # 电子线（时间向上）
    for x in (xl, xr):
        inner += '<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="2.5"/>' % (x, ytop, x, ymid - 5, BRAND)
        inner += '<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="2.5"/>' % (x, ymid + 5, x, ybot, BRAND)
        inner += '<polygon points="%d,%d %d,%d %d,%d" fill="%s"/>' % (x - 6, ytop + 56, x + 6, ytop + 56, x, ytop + 44, BRAND)
    # 光子交换（横向波浪线）
    pts = []
    for i in range(81):
        xx = xl + (xr - xl) * i / 80.0
        yy = ymid + 12 * math.sin(2 * math.pi * 3 * (xx - xl) / (xr - xl))
        pts.append("%g,%g" % (xx, yy))
    inner += '<polyline points="%s" fill="none" stroke="%s" stroke-width="2.2"/>' % (" ".join(pts), ACCENT)
    # 相互作用顶点
    for x in (xl, xr):
        inner += '<circle cx="%d" cy="%d" r="4.5" fill="%s"/>' % (x, ymid, BRAND)
    # 背景星点（量子真空涨落暗示）
    for sx, sy, sr in [(70, 120, 1.8), (92, 200, 1.4), (420, 130, 1.8), (446, 214, 1.4)]:
        inner += '<circle cx="%g" cy="%g" r="%g" fill="%s" opacity=".5"/>' % (sx, sy, sr, SOFT)
    # 标签
    inner += _t(xl, ytop - 12, "e\u207b", BRAND, 15, "700")
    inner += _t(xr, ytop - 12, "e\u207b", BRAND, 15, "700")
    inner += _t((xl + xr) / 2, ymid - 26, "\u03b3", ACCENT, 15, "700")
    inner += _t(250, 288, label, SUB, 13, "600")
    return make_svg(inner)


SCENES = {
    "heliocentric": heliocentric,
    "ellipse": ellipse_orbit,
    "ellipse_orbit": ellipse_orbit,
    "pendulum": pendulum,
    "wave": wave,
    "orbit": orbit,
    "projectile": projectile,
    "atom": atom,
    "graph": graph,
    "growth": growth,
    "microscope": microscope,
    "periodic": periodic,
    "tree": tree,
    "turing": turing,
    "blackhole": blackhole,
    "field": field,
    "feynman": feynman_diagram,
    "feynman_diagram": feynman_diagram,
}


def render(scene, params=None, w=480, h=320):
    """统一入口：scene 为场景名，params 为参数 dict（含可选 label 覆盖）。"""
    fn = SCENES.get(scene)
    if not fn:
        # 未知场景：兜底画一个占位（并在构建日志里大声警告，避免静默上线占位图）
        import sys as _sys
        print("⚠️  svg_scenes: 未知场景 %r，输出占位图" % scene, file=_sys.stderr)
        return make_svg(_t(240, 160, "示意", SUB, 18, "700"), w, h)
    params = params or {}
    # 把 label 从 params 里抽出来传给函数
    if "label" in params:
        return fn(label=params["label"], **{k: v for k, v in params.items() if k != "label"})
    try:
        return fn(**params)
    except TypeError:
        return fn()
