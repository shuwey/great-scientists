#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""P2-1：给 45 个实验各加一句"先猜一猜"的可验证猜想（POE 教学法的 Predict 环节）。

现状：45 条引导语全是指令式（"拖动X，看Y"），含问号 0 处 —— 学生知道要拖，但不知道自己
要验证什么假设，操作容易变成看热闹。本脚本在每个实验的 `.lab-desc` 之后插入一个
`.lab-guess` 块，把"先猜想 → 再操作 → 后解释"补上。

用法：
  python3 tools/add_lab_guess.py --dry-run   # 只看会改什么
  python3 tools/add_lab_guess.py --rewrite   # 落盘（幂等，可重复跑）
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
IDS = ["copernicus","galileo","kepler","newton","faraday","darwin","pasteur","maxwell",
       "mendeleev","curie","einstein","bohr","turing","feynman","hawking"]

GUESS = {
 ("copernicus","solar"):    "离太阳最远的那颗行星绕一圈，会比地球慢几倍？先想一下再拖。",
 ("copernicus","retro"):    "火星真的在倒着走吗？如果站到太阳上看，它其实在做什么？",
 ("copernicus","parallax"): "把恒星放远 10 倍，摆动能小到当年仪器完全测不出来的程度吗？",
 ("galileo","incline"):     "橙色刻度是第 1、2、3 秒的位置——它们之间的间隔是越来越宽，还是越来越窄？",
 ("galileo","telescope"):   "如果四颗卫星都绕着木星转，“所有天体都绕地球转”这句话还成立吗？",
 ("galileo","pendulum"):    "把摆球换成 10 倍重的，摆一个来回会更快、更慢，还是一模一样？",
 ("kepler","ellipse"):      "轨道越扁，行星在离太阳最近那一点是跑得更快，还是更慢？",
 ("kepler","areal"):        "近日点跑得快、远日点跑得慢，那同样的时间扫过的面积会一样大吗？",
 ("kepler","third"):        "八颗行星的“周期”与“轨道大小”，真能落到同一条直线上吗？",
 ("newton","prism"):        "已经分出来的单色红光，再过一次棱镜，还会继续分成别的颜色吗？",
 ("newton","gravity"):      "把两个物体的距离拉到 2 倍，引力是减一半，还是减到四分之一？",
 ("newton","projectile"):   "平着打出去的炮弹，和同时松手掉下的石子，谁先落地？",
 ("faraday","induction"):   "磁铁停在线圈里不动的时候，还有电流吗？（这条最容易想错）",
 ("faraday","lines"):       "磁力线从 N 极出来、进到 S 极以后，是断掉了，还是接着走？",
 ("faraday","ac"):          "线圈转快一倍，电流是变大一倍，还是“一来一回”快一倍？",
 ("darwin","population"):   "一代生出一百多个后代，最后能长大、能留下后代的，会有几个？",
 ("darwin","selection"):    "干旱只持续几十年，喙深的变化真能让整群分布看出右移吗？",
 ("darwin","tree"):         "我们和黑猩猩、大猩猩、红毛猩猩，谁和我们分家最早？",
 ("pasteur","colony"):      "细菌一进新鲜肉汤就立刻疯长，还是先“愣”上一段时间？",
 ("pasteur","heat"):        "温度从 63℃ 提到 72℃，消毒时间能缩短几十倍吗？",
 ("pasteur","spread"):      "瓶口敞开但不弯，肉汤会坏吗？把脖子弯几道之后呢？",
 ("maxwell","field"):       "导线周围的小磁针，是顺着导线偏转，还是绕着导线转圈？",
 ("maxwell","wave"):        "电场和磁场是轮流出现、你等我我等你，还是同时一起到达？",
 ("maxwell","speed"):       "给气体加热，跑得特别快的分子比例是慢慢上升，还是猛增？",
 ("mendeleev","grid"):      "排在同一列的元素，到底是哪里像？",
 ("mendeleev","trend"):     "按原子序数排下去，元素性质会一直变大，还是会有规律地回弹？",
 ("mendeleev","fill"):      "门捷列夫留下那三个空格，是他偷懒没填，还是他根本不知道里面是什么？",
 ("curie","rays"):          "纸、铝、铅三种材料，哪一种最先被射线穿过去？",
 ("curie","purify"):        "处理一整吨矿石，能提出来的镭够装满一小瓶吗？",
 ("curie","decay"):         "镭每 1600 年减一半——再过两个 1600 年，是减到零，还是又减一半？",
 ("einstein","time"):       "飞船飞得越快，船上那“一秒”在地球上看来是变长还是变短？",
 ("einstein","photon"):     "用很暗的紫光能打出电子吗？换成很强的红光呢？",
 ("einstein","bend"):       "光没有质量，为什么还会被恒星“拉”弯？",
 ("bohr","shells"):         "电子从第 3 层掉到第 2 层，和从第 4 层掉到第 2 层，放出的光颜色一样吗？",
 ("bohr","levels"):         "电子能不能停在两级台阶正中间？量子力学说——先猜。",
 ("bohr","lines"):          "氢原子发出的光，是各种颜色都有，还是只有固定那几条？",
 ("turing","turing"):       "规则简单到只有几行，也能算出复杂的结果吗？",
 ("turing","automaton"):    "同一张 8 行的规则表，只换一个规则号，长出来的图案会完全不同吗？",
 ("turing","signal"):       "采样越密、档位越多，还原就越准——那代价是什么？",
 ("feynman","path"):        "光从 A 到 B 明明有无数条路，为什么我们只看见它走直线？",
 ("feynman","interfere"):   "把两条缝堵掉一条，明暗条纹还在吗？",
 ("feynman","dist"):        "电子一个一个打出去、落点完全随机，屏幕上还会自己长出条纹吗？",
 ("hawking","bh"):          "黑洞的质量翻倍，它的视界（边界）是变大还是变小？",
 ("hawking","orbit"):       "光线瞄得离黑洞很近时，是擦着边逃走，还是一头栽进去？",
 ("hawking","temp"):        "黑洞温度和质量成反比——谁翻倍，谁就减半？",
}

LABOPEN = re.compile(r'<div class="lab" data-lab="([^"]+)"')
DESC = re.compile(r'([ \t]*)<p class="lab-desc"[^>]*>.*?</p>', re.S)

CSS_BLOCK = """
/* ===== P2-1：先猜一猜（POE 教学法的 Predict 环节，2026-09-14） =====
   45 个实验原本只有指令式引导语，学生不知道自己要验证什么假设。
   在每个实验的一句话说明后补一句可验证的猜想：先猜 -> 再拖 -> 后解释。 */
.lab-guess {
  font-size: 14px; line-height: 1.62; color: #412402;
  background: var(--accent-soft); border-left: 3px solid var(--accent);
  border-radius: 10px; padding: 10px 13px; margin: 0 0 14px;
}
.lab-guess b { color: #854F0B; font-weight: 700; margin-right: 2px; }
"""


def lab_blocks(html):
    """配平 div，返回 [(lab, start, end)]，start/end 为内层内容区间。"""
    out = []
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
        out.append((lab, start, i))
    return out


def main():
    apply = "--rewrite" in sys.argv
    total, skip, miss = 0, 0, []
    for sid in IDS:
        p = ROOT / "scientists" / sid / "labs.html"
        html = p.read_text(encoding="utf-8")
        # 从后往前插入，避免前面改动使后面的下标失效
        for lab, start, end in reversed(lab_blocks(html)):
            block = html[start:end]
            if 'class="lab-guess"' in block:
                skip += 1; continue
            key = (sid, lab)
            if key not in GUESS:
                miss.append((sid, lab, "文案缺失")); continue
            d = DESC.search(block)
            if not d:
                miss.append((sid, lab, "找不到 .lab-desc")); continue
            indent = d.group(1) or "      "
            ins = f'\n{indent}<p class="lab-guess"><b>先猜一猜：</b>{GUESS[key]}</p>'
            html = html[:start] + block[:d.end()] + ins + block[d.end():] + html[end:]
            total += 1
        if apply:
            p.write_text(html, encoding="utf-8")
    print(f"[labs.html] 注入 {total} 处" + ("（已落盘）" if apply else "（dry-run，未落盘）")
          + f" · 已有跳过 {skip} 处")
    if miss:
        print("⚠️ 未处理：", miss)

    css_targets = [ROOT / "scientists" / s / "assets/css/style.css" for s in IDS]
    css_targets.append(ROOT / "assets/css/style.css")
    n = 0
    for c in css_targets:
        if not c.exists():
            print("CSS 缺失：", c); continue
        t = c.read_text(encoding="utf-8")
        if ".lab-guess" in t:
            continue
        if apply:
            c.write_text(t.rstrip() + "\n" + CSS_BLOCK, encoding="utf-8")
        n += 1
    print(f"[style.css] {'写入' if apply else '待写入'} {n} 个文件（15 站 + 根）")
    print("文案总数：", len(GUESS))


if __name__ == "__main__":
    main()
