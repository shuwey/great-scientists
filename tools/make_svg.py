#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成全站统一风格的 SVG 插图（扁平线描 + 低饱和配色）。
风格约定：线宽 3、圆角线帽、白底、主色靛蓝 / 辅助琥珀·青绿·橘·紫。
"""
import os

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "img", "draw")
os.makedirs(OUT, exist_ok=True)

B = "#3B5BDB"   # 主色 靛蓝
BL = "#A5B8FF"  # 浅蓝
A = "#F59F00"   # 琥珀
G = "#0CA678"   # 青绿
O = "#E8590C"   # 橘
P = "#7048E8"   # 紫
GR = "#8B96AA"  # 灰
GL = "#D4DBE5"  # 浅灰
INK = "#1B2530"

F = "-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif"

HEAD = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" '
        'width="800" height="480" role="img">')
HEAD_T = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160" '
          'width="240" height="160" role="img">')


def bg(w=800, h=480, color="#FFFFFF"):
    return f'<rect width="{w}" height="{h}" fill="{color}"/>'


def txt(x, y, s, size=18, fill=INK, weight="700", anchor="start"):
    return (f'<text x="{x}" y="{y}" font-family="{F}" font-size="{size}" '
            f'font-weight="{weight}" fill="{fill}" text-anchor="{anchor}">{s}</text>')


def arrow(x1, y1, x2, y2, color=B, w=3, dash=None, head=11):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return (f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" '
            f'stroke-width="{w}" stroke-linecap="round"{d}/>'
            f'<circle cx="{x2}" cy="{y2}" r="{w*0.9}" fill="{color}"/>')


SVG = {}

# ---------------------------------------------------------------- 1 棱镜色散
SVG["prism-dispersion.svg"] = f"""{HEAD}
{bg()}
<defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#CFE0FF"/><stop offset="1" stop-color="#E8EFFF"/>
</linearGradient></defs>

<!-- 白光入射：终点精确落在棱镜左面 (359,214) -->
{arrow(40, 214, 359, 214, INK, 4.5)}
{txt(46, 198, "白光", 19, INK)}

<path d="M400 92 L318 336 L482 336 Z" fill="url(#pg)" stroke="#94A9D6" stroke-width="3" stroke-linejoin="round"/>

<!-- 棱镜内部：未分开的单束光，从入射点到出射点 -->
<line x1="359" y1="214" x2="441" y2="214" stroke="#8B96AA" stroke-width="3" opacity=".7"/>
<circle cx="359" cy="214" r="3.4" fill="#1B2530"/>
<circle cx="441" cy="214" r="3.4" fill="#1B2530"/>

<!-- 出射色散：所有色光朝同一方向（底面）偏折，红偏少、紫偏多 -->
<g stroke-width="4.5" stroke-linecap="round" fill="none">
<line x1="441" y1="214" x2="752" y2="224" stroke="#E03131"/>
<line x1="441" y1="214" x2="752" y2="247" stroke="#F76707"/>
<line x1="441" y1="214" x2="752" y2="270" stroke="#FAB005"/>
<line x1="441" y1="214" x2="752" y2="292" stroke="#51CF66"/>
<line x1="441" y1="214" x2="752" y2="315" stroke="#3B5BDB"/>
<line x1="441" y1="214" x2="752" y2="337" stroke="#5F3DC4"/>
<line x1="441" y1="214" x2="752" y2="360" stroke="#9C36B5"/>
</g>

<!-- 屏（墙） -->
<line x1="750" y1="200" x2="750" y2="376" stroke="#D4DBE5" stroke-width="2.5" stroke-dasharray="6 6"/>
{txt(750, 190, "屏（墙）", 15, GR, "600", "middle")}

{txt(762, 229, "红", 16, "#E03131")}
{txt(762, 252, "橙", 16, "#F76707")}
{txt(762, 275, "黄", 16, "#D9A400")}
{txt(762, 297, "绿", 16, "#2F9E44")}
{txt(762, 320, "蓝", 16, B)}
{txt(762, 342, "靛", 16, "#5F3DC4")}
{txt(762, 365, "紫", 16, "#9C36B5")}

{txt(400, 442, "白光进入棱镜 → 各色偏折角度不同（都朝底面偏） → 在墙上散成七色光带", 19, GR, "600", "middle")}
</svg>"""

# ---------------------------------------------------------------- 2 反射望远镜
SVG["telescope.svg"] = f"""{HEAD}
{bg()}
<rect x="150" y="196" width="470" height="120" rx="14" fill="#F4F7FC" stroke="{GL}" stroke-width="3"/>
<rect x="600" y="190" width="26" height="132" rx="8" fill="#EDF1F7" stroke="{GL}" stroke-width="3"/>

<path d="M176 208 Q 150 256 176 304" fill="none" stroke="{B}" stroke-width="7" stroke-linecap="round"/>
<line x1="404" y1="336" x2="440" y2="266" stroke="{A}" stroke-width="8" stroke-linecap="round"/>
<rect x="392" y="120" width="46" height="80" rx="10" fill="#FFF8E9" stroke="{A}" stroke-width="3"/>
<circle cx="415" cy="110" r="15" fill="none" stroke="{A}" stroke-width="3"/>

<g stroke="{O}" stroke-width="3" fill="none" stroke-linecap="round">
<path d="M636 226 L176 226 Q 200 256 404 268 L415 210"/>
<path d="M636 256 L180 256 Q 204 256 410 272 L415 210"/>
<path d="M636 286 L180 286 Q 204 256 410 278 L415 210"/>
</g>
<circle cx="415" cy="206" r="7" fill="{O}"/>

{txt(120, 366, "凹面主镜", 18, B, "700", "middle")}
{txt(404, 392, "45° 平面副镜", 18, A, "700", "middle")}
{txt(452, 100, "目镜", 18, A)}
{txt(636, 348, "星光", 18, O)}
{txt(400, 448, "光只被反射、不穿过玻璃 → 不会产生色差", 20, GR, "600", "middle")}
</svg>"""

# ---------------------------------------------------------------- 3 切线与变化率
SVG["tangent.svg"] = f"""{HEAD}
{bg()}
<line x1="70" y1="400" x2="740" y2="400" stroke="{GL}" stroke-width="3"/>
<line x1="90" y1="60" x2="90" y2="400" stroke="{GL}" stroke-width="3"/>
{txt(56, 404, "O", 18, GR)}
{txt(748, 404, "时间", 18, GR)}
{txt(96, 52, "位置", 18, GR)}

<path d="M110 372 C 220 356 300 320 380 250 C 450 190 520 130 700 104"
      fill="none" stroke="{B}" stroke-width="5" stroke-linecap="round"/>

<line x1="250" y1="352" x2="560" y2="120" stroke="{A}" stroke-width="4" stroke-linecap="round"/>
<circle cx="380" cy="250" r="9" fill="{A}" stroke="#fff" stroke-width="3"/>
{txt(524, 112, "切线（这一瞬间的方向）", 19, A)}

<g stroke="{G}" stroke-width="2.5" fill="none" stroke-dasharray="6 5">
<line x1="380" y1="250" x2="520" y2="250"/>
<line x1="520" y1="250" x2="520" y2="196"/>
</g>
{txt(392, 272, "Δx", 18, G)}
{txt(532, 224, "Δy", 18, G)}
{txt(196, 424, "在某一点上，曲线有多陡 —— 这就是导数（变化率）", 20, GR, "600", "start")}
</svg>"""

# ---------------------------------------------------------------- 4 曲线下面积
SVG["area-strips.svg"] = f"""{HEAD}
{bg()}
<line x1="70" y1="400" x2="740" y2="400" stroke="{GL}" stroke-width="3"/>
<line x1="90" y1="70" x2="90" y2="400" stroke="{GL}" stroke-width="3"/>
{txt(56, 404, "O", 18, GR)}
{txt(748, 404, "时间", 18, GR)}
{txt(96, 62, "速度", 18, GR)}

<g fill="{B}" opacity=".22" stroke="{B}" stroke-width="1.5">
<rect x="120" y="352" width="44" height="48"/>
<rect x="164" y="342" width="44" height="58"/>
<rect x="208" y="330" width="44" height="70"/>
<rect x="252" y="316" width="44" height="84"/>
<rect x="296" y="300" width="44" height="100"/>
<rect x="340" y="282" width="44" height="118"/>
<rect x="384" y="262" width="44" height="138"/>
<rect x="428" y="240" width="44" height="160"/>
<rect x="472" y="216" width="44" height="184"/>
<rect x="516" y="190" width="44" height="210"/>
<rect x="560" y="162" width="44" height="238"/>
<rect x="604" y="130" width="44" height="270"/>
</g>
<path d="M120 352 C 240 330 340 296 420 240 C 500 186 570 130 648 96"
      fill="none" stroke="{B}" stroke-width="5" stroke-linecap="round"/>
{arrow(660, 88, 706, 74, B, 3)}
{txt(120, 430, "把面积切成很多细长条，每条当长方形加起来 —— 切得越细越准（积分）", 20, GR, "600")}
{txt(566, 300, "面积 = 走过的距离", 19, B)}
</svg>"""

# ---------------------------------------------------------------- 5 苹果与月亮
SVG["apple-moon.svg"] = f"""{HEAD}
{bg()}
<circle cx="230" cy="290" r="118" fill="#E8EEFF" stroke="{B}" stroke-width="4"/>
<path d="M150 250 Q 200 214 258 236 Q 296 254 300 300 L300 340 L148 340 Z" fill="{G}" opacity=".22"/>
<circle cx="230" cy="290" r="118" fill="none" stroke="{B}" stroke-width="4" stroke-dasharray="0" opacity=".35"/>
{txt(230, 300, "地球", 22, B, "800", "middle")}

<line x1="352" y1="180" x2="322" y2="200" stroke="{G}" stroke-width="4" stroke-linecap="round"/>
<circle cx="368" cy="164" r="24" fill="#FFF0E8" stroke="{O}" stroke-width="4"/>
{txt(368, 170, "🍎", 22, INK, "400", "middle")}
{arrow(366, 196, 340, 258, O, 4)}

<path d="M300 200 Q 480 92 660 178" fill="none" stroke="{GL}" stroke-width="3" stroke-dasharray="8 7"/>
<circle cx="604" cy="152" r="40" fill="#F1F3F7" stroke="{GR}" stroke-width="4"/>
<circle cx="590" cy="140" r="8" fill="{GL}"/>
<circle cx="618" cy="168" r="5" fill="{GL}"/>
{txt(604, 216, "月球", 20, INK, "700", "middle")}
{arrow(590, 192, 430, 290, O, 4)}

{txt(400, 336, "同一个力：万有引力", 26, O, "800", "middle")}
{txt(400, 380, "让苹果落地的力，和一直把月球拉向地球的力，是同一种力。", 20, GR, "600", "middle")}
{txt(400, 418, "月球其实一直在“掉落”，只是它横向跑得太快，不断“错过”地球。", 19, GR, "600", "middle")}
</svg>"""

# ---------------------------------------------------------------- 6 平方反比
SVG["inverse-square.svg"] = f"""{HEAD}
{bg()}
<circle cx="150" cy="240" r="46" fill="#E8EEFF" stroke="{B}" stroke-width="4"/>
{txt(150, 246, "M", 24, B, "800", "middle")}

<g fill="none" stroke="{GL}" stroke-width="2.5" stroke-dasharray="7 6">
<circle cx="150" cy="240" r="110"/><circle cx="150" cy="240" r="180"/>
<circle cx="150" cy="240" r="250"/>
</g>

<g stroke="{O}" stroke-width="5" stroke-linecap="round">
<line x1="266" y1="240" x2="336" y2="240"/><circle cx="336" cy="240" r="5" fill="{O}"/>
<line x1="336" y1="240" x2="376" y2="240"/><circle cx="376" cy="240" r="5" fill="{O}"/>
<line x1="426" y1="240" x2="456" y2="240"/><circle cx="456" cy="240" r="5" fill="{O}"/>
</g>
{txt(300, 214, "距离 r", 19, GR)}
{txt(360, 214, "2r", 19, GR)}
{txt(430, 214, "3r", 19, GR)}

<g>
<rect x="596" y="120" width="180" height="52" rx="12" fill="{B}" opacity=".10"/>
{txt(612, 154, "力 = 1", 24, B, "800")}
<rect x="596" y="192" width="60" height="52" rx="12" fill="{B}" opacity=".10"/>
{txt(612, 226, "1/4", 24, B, "800")}
<rect x="596" y="264" width="27" height="52" rx="8" fill="{B}" opacity=".10"/>
{txt(616, 298, "1/9", 24, B, "800")}
</g>
<line x1="150" y1="146" x2="596" y2="146" stroke="{GL}" stroke-width="2" stroke-dasharray="5 5"/>
<line x1="150" y1="218" x2="596" y2="218" stroke="{GL}" stroke-width="2" stroke-dasharray="5 5"/>
<line x1="150" y1="290" x2="596" y2="290" stroke="{GL}" stroke-width="2" stroke-dasharray="5 5"/>

{txt(400, 424, "距离变成 2 倍，引力只剩 1/4；距离变成 3 倍，只剩 1/9", 21, GR, "600", "middle")}
</svg>"""

# ---------------------------------------------------------------- 7 牛顿大炮
SVG["newton-cannon.svg"] = f"""{HEAD}
{bg()}
<circle cx="400" cy="300" r="140" fill="#E8EEFF" stroke="{B}" stroke-width="4"/>
<path d="M300 200 Q 360 168 418 190 Q 452 206 456 250 L456 300 L296 300 Z" fill="{G}" opacity=".2"/>
<circle cx="400" cy="300" r="140" fill="none" stroke="{B}" stroke-width="4" opacity=".4"/>
{txt(400, 392, "地球", 22, B, "800", "middle")}

<path d="M540 160 L536 196 L520 200 L520 166 Z" fill="{O}" opacity=".18" stroke="{O}" stroke-width="3"/>
<line x1="470" y1="200" x2="536" y2="176" stroke="{O}" stroke-width="8" stroke-linecap="round"/>
{txt(470, 148, "山顶大炮", 18, O, "700", "middle")}

<g fill="none" stroke-width="3.5" stroke-linecap="round">
<path d="M474 184 Q 470 300 420 372" stroke="{O}"/>
<path d="M474 184 Q 520 300 560 380" stroke="{O}" opacity=".8"/>
<path d="M474 184 Q 600 200 330 180 Q 200 160 240 40 Q 470 20 560 160" stroke="{A}"/>
</g>
<circle cx="420" cy="372" r="6" fill="{O}"/>
<circle cx="560" cy="380" r="6" fill="{O}"/>
{arrow(560, 168, 600, 132, A, 3)}
{txt(606, 122, "速度够快 → 绕地飞行", 18, A)}
{txt(120, 96, "牛顿的想法：把炮弹打得足够快，它就永远掉不到地面 —— 这就是人造卫星的原理", 19, GR, "600")}
<line x1="120" y1="112" x2="470" y2="112" stroke="{GL}" stroke-width="2"/>
</svg>"""

# ---------------------------------------------------------------- 8 惯性
SVG["law-inertia.svg"] = f"""{HEAD}
{bg()}
<rect x="150" y="216" width="300" height="128" rx="16" fill="#F4F7FC" stroke="{GL}" stroke-width="3"/>
<circle cx="210" cy="356" r="24" fill="#fff" stroke="{INK}" stroke-width="4"/>
<circle cx="390" cy="356" r="24" fill="#fff" stroke="{INK}" stroke-width="4"/>
<circle cx="210" cy="356" r="7" fill="{GR}"/>
<circle cx="390" cy="356" r="7" fill="{GR}"/>
<rect x="176" y="244" width="90" height="52" rx="8" fill="#CFE0FF"/>

<circle cx="330" cy="200" r="20" fill="{B}"/>
<path d="M330 220 L330 296" stroke="{B}" stroke-width="9" stroke-linecap="round"/>
<path d="M330 240 L372 210" stroke="{B}" stroke-width="9" stroke-linecap="round"/>
<path d="M330 296 L308 348 M330 296 L352 348" stroke="{B}" stroke-width="9" stroke-linecap="round"/>

{arrow(470, 200, 640, 200, O, 5)}
{txt(496, 176, "车突然刹车", 20, O, "700")}
{txt(496, 240, "身体还想往前走", 20, O, "700")}

{txt(400, 424, "没有外力改变它，运动状态就不变 —— 牛顿第一定律（惯性定律）", 21, GR, "600", "middle")}
</svg>"""

# ---------------------------------------------------------------- 9 F = ma
SVG["law-fma.svg"] = f"""{HEAD}
{bg()}
<rect x="90" y="250" width="180" height="110" rx="12" fill="#F4F7FC" stroke="{GL}" stroke-width="3"/>
<circle cx="140" cy="382" r="18" fill="#fff" stroke="{INK}" stroke-width="3.5"/>
<circle cx="222" cy="382" r="18" fill="#fff" stroke="{INK}" stroke-width="3.5"/>
{txt(180, 220, "空车", 20, INK, "700", "middle")}
{arrow(286, 306, 366, 306, B, 5)}
{txt(288, 284, "F", 22, B, "800")}
{arrow(392, 330, 500, 330, A, 5)}
{txt(452, 314, "加速快", 19, A, "700")}

<rect x="470" y="250" width="220" height="110" rx="12" fill="#EDF1F7" stroke="{GL}" stroke-width="3"/>
<circle cx="530" cy="382" r="18" fill="#fff" stroke="{INK}" stroke-width="3.5"/>
<circle cx="632" cy="382" r="18" fill="#fff" stroke="{INK}" stroke-width="3.5"/>
<g fill="{G}" opacity=".35"><circle cx="548" cy="272" r="17"/><circle cx="588" cy="272" r="17"/><circle cx="628" cy="272" r="17"/></g>
{txt(580, 220, "装满货物的车", 20, INK, "700", "middle")}
{arrow(700, 306, 760, 306, B, 8)}
{txt(716, 284, "2F", 22, B, "800")}
{arrow(392, 424, 470, 424, A, 3)}
{txt(392, 412, "加速慢", 19, A, "700")}

<rect x="230" y="60" width="340" height="80" rx="18" fill="{B}" opacity=".08"/>
{txt(400, 112, "加速度 = 力 ÷ 质量", 30, B, "800", "middle")}
{txt(400, 468, "同样的力推轻车，跑得更快；同样的加速度要推重车，得用更大的力", 19, GR, "600", "middle")}
</svg>"""

# ---------------------------------------------------------------- 10 作用与反作用
SVG["law-action.svg"] = f"""{HEAD}
{bg()}
<rect x="120" y="330" width="150" height="20" rx="6" fill="{GL}"/>
<rect x="530" y="330" width="150" height="20" rx="6" fill="{GL}"/>

<circle cx="250" cy="256" r="22" fill="{B}"/>
<path d="M250 278 L250 330" stroke="{B}" stroke-width="8" stroke-linecap="round"/>
<path d="M250 300 L282 300" stroke="{B}" stroke-width="8" stroke-linecap="round"/>
<path d="M250 330 L228 372 M250 330 L272 372" stroke="{B}" stroke-width="8" stroke-linecap="round"/>
<rect x="150" y="310" width="200" height="20" rx="8" fill="{B}" opacity=".25"/>

<circle cx="550" cy="256" r="22" fill="{A}"/>
<path d="M550 278 L550 330" stroke="{A}" stroke-width="8" stroke-linecap="round"/>
<path d="M550 300 L518 300" stroke="{A}" stroke-width="8" stroke-linecap="round"/>
<path d="M550 330 L528 372 M550 330 L572 372" stroke="{A}" stroke-width="8" stroke-linecap="round"/>
<rect x="450" y="310" width="200" height="20" rx="8" fill="{A}" opacity=".25"/>

{arrow(300, 214, 392, 214, O, 5)}
{arrow(500, 214, 410, 214, O, 5)}
{txt(346, 190, "推", 20, O, "700")}
{txt(430, 190, "同时也被推", 20, O, "700")}
{txt(400, 268, "两个力：大小相等、方向相反、作用在不同物体上", 21, GR, "600", "middle")}

{txt(400, 424, "你推墙的同时，墙也在以同样大的力推你 —— 牛顿第三定律", 21, GR, "600", "middle")}
</svg>"""

# ---------------------------------------------------------------- 11 椭圆轨道
SVG["orbit-ellipse.svg"] = f"""{HEAD}
{bg()}
<ellipse cx="400" cy="240" rx="290" ry="140" fill="none" stroke="{GL}" stroke-width="3" stroke-dasharray="8 7"/>
<ellipse cx="330" cy="240" rx="290" ry="140" fill="none" stroke="{B}" stroke-width="4"/>

<circle cx="330" cy="240" r="34" fill="#FFF3BF" stroke="{A}" stroke-width="4"/>
<circle cx="330" cy="240" r="12" fill="{A}"/>
{txt(330, 200, "太阳（焦点）", 18, A, "700", "middle")}

<circle cx="600" cy="330" r="26" fill="#E8EEFF" stroke="{B}" stroke-width="4"/>
{txt(600, 380, "行星（近）快", 18, B, "700", "middle")}
<circle cx="70" cy="150" r="26" fill="#E8EEFF" stroke="{B}" stroke-width="4"/>
{txt(96, 96, "行星（远）慢", 18, B, "700", "middle")}

<line x1="330" y1="240" x2="600" y2="330" stroke="{O}" stroke-width="3" stroke-dasharray="6 5"/>
<line x1="330" y1="240" x2="70" y2="150" stroke="{O}" stroke-width="3" stroke-dasharray="6 5"/>

{txt(400, 448, "哈雷问：“引力按距离平方衰减，轨道会是什么形状？” 牛顿答：“椭圆。”", 21, GR, "600", "middle")}
</svg>"""

# ---------------------------------------------------------------- 12 首页卡片缩略图
SVG["thumb-optics.svg"] = f"""{HEAD_T}
{bg(240,160)}
<path d="M120 46 L86 116 L154 116 Z" fill="#E8EEFF" stroke="#94A9D6" stroke-width="3" stroke-linejoin="round"/>
{arrow(22, 78, 104, 78, INK, 4)}
<g stroke-width="4" stroke-linecap="round" fill="none">
<line x1="120" y1="82" x2="226" y2="56" stroke="#E03131"/>
<line x1="120" y1="82" x2="226" y2="70" stroke="#FAB005"/>
<line x1="120" y1="82" x2="226" y2="84" stroke="#51CF66"/>
<line x1="120" y1="82" x2="226" y2="98" stroke="{B}"/>
<line x1="120" y1="82" x2="226" y2="112" stroke="#9C36B5"/>
</g>
{txt(120, 146, "光与颜色", 17, GR, "700", "middle")}
</svg>"""

SVG["thumb-calculus.svg"] = f"""{HEAD_T}
{bg(240,160)}
<line x1="26" y1="128" x2="216" y2="128" stroke="{GL}" stroke-width="3"/>
<line x1="34" y1="26" x2="34" y2="128" stroke="{GL}" stroke-width="3"/>
<path d="M40 116 C 80 104 110 84 140 60 C 160 44 180 36 210 32" fill="none" stroke="{B}" stroke-width="4.5" stroke-linecap="round"/>
<line x1="70" y1="106" x2="186" y2="24" stroke="{A}" stroke-width="3.5" stroke-linecap="round"/>
<circle cx="118" cy="76" r="6" fill="{A}" stroke="#fff" stroke-width="2.5"/>
{txt(120, 152, "微积分", 17, GR, "700", "middle")}
</svg>"""

SVG["thumb-gravity.svg"] = f"""{HEAD_T}
{bg(240,160)}
<circle cx="86" cy="86" r="44" fill="#E8EEFF" stroke="{B}" stroke-width="3.5"/>
<ellipse cx="120" cy="86" rx="78" ry="46" fill="none" stroke="{GL}" stroke-width="2.5" stroke-dasharray="6 5"/>
<circle cx="198" cy="58" r="17" fill="#F1F3F7" stroke="{GR}" stroke-width="3"/>
<circle cx="193" cy="53" r="4" fill="{GL}"/>
{arrow(190, 78, 130, 100, O, 2.5, None, 7)}
{txt(120, 152, "万有引力", 17, GR, "700", "middle")}
</svg>"""

SVG["thumb-laws.svg"] = f"""{HEAD_T}
{bg(240,160)}
<rect x="34" y="86" width="76" height="46" rx="8" fill="#F4F7FC" stroke="{GL}" stroke-width="3"/>
<circle cx="56" cy="138" r="10" fill="#fff" stroke="{INK}" stroke-width="3"/>
<circle cx="90" cy="138" r="10" fill="#fff" stroke="{INK}" stroke-width="3"/>
{arrow(120, 108, 176, 108, B, 4)}
<rect x="180" y="30" width="44" height="96" rx="8" fill="{A}" opacity=".16"/>
<g fill="{G}" opacity=".3"><circle cx="200" cy="46" r="14"/><circle cx="200" cy="76" r="14"/><circle cx="200" cy="106" r="14"/></g>
{txt(120, 152, "三大运动定律", 17, GR, "700", "middle")}
</svg>"""

# ---------------------------------------------------------------- 13 首页 Hero 装饰
SVG["hero-deco.svg"] = f"""{HEAD}
{bg(800, 480, "none")}
<g opacity=".5">
<path d="M60 300 C 200 230 320 330 470 250 C 600 182 660 200 760 150" fill="none" stroke="{GL}" stroke-width="3" stroke-dasharray="10 8"/>
<circle cx="470" cy="250" r="9" fill="{B}"/>
<circle cx="200" cy="236" r="6" fill="{GR}"/>
<circle cx="700" cy="164" r="6" fill="{GR}"/>
</g>
</svg>"""

# ---------------------------------------------------------------- 输出
for name, content in SVG.items():
    path = os.path.join(OUT, name)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  {name:26s} {len(content)//1024+1:3d} KB")

print(f"\n共生成 {len(SVG)} 个 SVG → {os.path.normpath(OUT)}")
