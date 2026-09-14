#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第二轮内容复核（tools/review2/science-review-2.html）中 23 条问题的**站点侧**修复。

设计要点（沿用第一轮 apply_review_fixes.py 的做法）：
  1. 每条替换都声明「期望命中次数」，逐条 count() 校验；
  2. 任一条不匹配 → 整体中止、**不写任何文件**（防半成品）；
  3. --dry 只报告不落盘。

⚠️ 站点文件与生成源必须同步修改，否则 build_scientist.py 重建时修正会被写回。
   生成源侧见 tools/sync_spec_fixes2.py。

用法：
  python3 tools/apply_review_fixes2.py --dry     # 只校验
  python3 tools/apply_review_fixes2.py           # 校验并写入
"""
import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

# (相对路径, 原文, 新文, 期望次数, 说明)
EDITS = [
    # ── A1 地轴倾斜的功劳被挂到开普勒、牛顿名下 ──────────────────────────
    ("scientists/copernicus/detail/earthmotion.html",
     "<p>哥白尼之后的开普勒、牛顿进一步澄清：地轴是斜的（约 23.5°）。正是这点倾斜，让南北半球在不同时间接收阳光多少不同，形成春夏秋冬。</p>",
     "<p>地轴是斜的（约 23.5°）——这不是后来才发现的：哥白尼的日心模型已经用这一点解释四季。正是这点倾斜，让南北半球在不同时间接收阳光多少不同，形成春夏秋冬；开普勒、牛顿后来又从力学上给出了完整的解释。</p>",
     1, "A1 地轴倾斜是哥白尼模型自带内容，不是后人澄清"),

    # ── A2「开普勒修正为椭圆」被标在 1619 ──────────────────────────────
    ("scientists/copernicus/timeline.html",
     '<span class="tl-title">开普勒修正为椭圆</span>',
     '<span class="tl-title">开普勒给出周期定律</span>',
     1, "A2 椭圆第一定律是 1609，1619 是第三定律"),
    ("scientists/copernicus/timeline.html",
     "<p>开普勒提出行星沿椭圆轨道运行，并给出周期—距离的定量定律，把哥白尼的草图变成精确蓝图。</p>",
     "<p>开普勒先在 1609 年公布行星沿椭圆运行，又在 1619 年给出周期与距离的定量定律，把哥白尼的草图变成精确蓝图。</p>",
     1, "A2 正文补出 1609/1619 的准确归属"),

    # ── A3 哥白尼时代「0.1 角秒」（精度拔高约 600 倍） ──────────────────
    ("scientists/copernicus/labs.html",
     "日心说预言了恒星视差，可当年最好的仪器只能测到约 0.1 角秒，星星的摆动小到根本看不出来——这反倒成了反对日心说的理由。直到 1838 年，贝塞尔才测出第一颗恒星的视差。",
     "日心说预言了恒星视差，可这个角度小得可怜——最近的恒星也只有约 0.8 角秒。当年最好的仪器精度只有角分（约 60 角秒）量级，连 0.1 角秒都摸不到，星星那点摆动根本看不出来——这反倒成了反对日心说的理由。直到 1838 年，贝塞尔才测出第一颗恒星的视差。",
     1, "A3 望远镜前仪器只能到角分级，0.1 角秒是 19 世纪的精度"),
    ("scientists/copernicus/assets/js/site.js",
     "<span style='color:#E03131;font-weight:800'>比当年仪器能测到的 0.1 角秒还小，根本看不出来</span>",
     "<span style='color:#E03131;font-weight:800'>已小到 0.1 角秒以下，早年的仪器根本分辨不出</span>",
     1, "A3 实验读数同上（labs 文案在 site.js 另有一份）"),

    # ── A4 第谷时代「望远镜还没普及」 ──────────────────────────────────
    ("scientists/kepler/detail/mars.html",
     "用肉眼（望远镜还没普及）做出了",
     "用肉眼（那时望远镜尚未发明）做出了",
     1, "A4 第谷观测时望远镜尚未发明"),

    # ── A5 棱镜实验写成「在剑桥（因为瘟疫回了老家）」 ──────────────────
    ("scientists/newton/detail/optics.html",
     "1666 年，牛顿在剑桥（因为瘟疫回了老家）做了一件简单到不可思议的事",
     "1666 年，牛顿因瘟疫停课、回到老家伍尔索普庄园，做了一件简单到不可思议的事",
     1, "A5 棱镜实验在老家伍尔索普做的"),

    # ── A6 牛顿生日历法冲突 ────────────────────────────────────────────
    ("scientists/newton/timeline.html",
     "12 月 25 日 · 英格兰林肯郡伍尔索普庄园",
     "1643 年 1 月 4 日（旧历 1642 年 12 月 25 日，圣诞节）· 英格兰林肯郡伍尔索普庄园",
     1, "A6 时间轴补双历法口径（保留圣诞节这个知识点）"),
    ("scientists/newton/timeline.html",
     "牛顿出生在圣诞节，是个早产儿",
     "牛顿出生于旧历 1642 年的圣诞节（新历 1643 年 1 月 4 日），是个早产儿",
     1, "A6 正文补双历法口径"),
    ("scientists/newton/index.html",
     "牛顿出生在圣诞节那天，是个早产儿",
     "牛顿出生于旧历 1642 年的圣诞节（新历 1643 年 1 月 4 日），是个早产儿",
     1, "A6 首页同上，与时间轴对齐"),

    # ── B3 首页写死「全部 15 个年份」（时间轴实为 14 个节点） ──────────
    ("scientists/newton/index.html",
     "查看全部 15 个年份 →",
     "查看完整时间轴 →",
     1, "B3 不再写死年份数，与页脚『去人数』同一原则"),

    # ── A7「也推翻了牛顿沿用两百多年的引力图景」 ────────────────────────
    ("scientists/einstein/timeline.html",
     "这比十年前的狭义相对论更进一步，也推翻了牛顿沿用两百多年的引力图景。",
     "这比十年前的狭义相对论更进一步，也把牛顿沿用两百多年的引力图景扩展到了更强、更极端的情形——牛顿引力只是它在弱场、低速下的近似。",
     1, "A7 与本站相对论页『没有推翻牛顿』统一口径"),

    # ── A8 巴氏杀菌被标成「灭菌」 ──────────────────────────────────────
    ("scientists/pasteur/detail/pasteurization.html",
     '<span class="tag">灭菌</span>',
     '<span class="tag">杀菌</span>',
     1, "A8 巴氏杀菌只杀大部分，不是灭菌（灭菌另有术语条目，不动）"),
    ("scientists/pasteur/detail/pasteurization.html",
     'alt="加热灭菌"',
     'alt="加热杀菌"',
     1, "A8 配图 alt 同属标签性用词"),

    # ── A9 用「天花被消灭」佐证巴斯德的减毒路线 ────────────────────────
    ("scientists/pasteur/detail/vaccine.html",
     "他创立的研究所至今仍在对抗传染病；天花被消灭，更证明其路线的深远。",
     "他创立的研究所至今仍在对抗传染病；而疫苗技术的持续发展，最终让天花这样的烈性传染病被彻底消灭。",
     1, "A9 天花疫苗是詹纳的、且非减毒路线，不能算作『其路线』"),

    # ── A10 把「逃逸速度超过光速」当成黑洞的定义 ───────────────────────
    ("scientists/hawking/detail/blackhole.html",
     "<p>一个天体若足够致密，其表面逃逸速度会超过光速。按相对论，光也逃不出——这就是黑洞。</p>",
     "<p>一个天体若足够致密，其表面的逃逸速度会超过光速，连光也逃不出去——这是理解黑洞的入门近似。严格说来，黑洞真正的边界是事件视界：那里的时空弯曲得连光都只能向内走（见下一节）。</p>",
     1, "A10 保留类比，补出事件视界这个严格边界"),
    ("scientists/hawking/labs.html",
     "在视界以内，连最快的逃逸速度也超过光速。",
     "在事件视界以内，连光都只能向内走（“逃逸速度超过光速”只是入门近似）。",
     1, "A10 labs 同一框表述"),

    # ── B1 正文混入未翻译英文词 combinations ───────────────────────────
    ("scientists/copernicus/detail/revolutionibus.html",
     "用圆和圆 combinations 拟合行星位置",
     "用一圈套一圈的圆去拟合行星位置",
     1, "B1 未译英文词"),

    # ── B2 术语库「第谷」条混入 microscope ─────────────────────────────
    ("scientists/kepler/assets/js/terms.js",
     "没 microscope 的“超级视力”",
     "没有望远镜的“超级视力”",
     1, "B2 应为望远镜，且第谷时代望远镜尚未发明"),

    # ── B4 正文混入未翻译英文词 Humanity ──────────────────────────────
    ("scientists/einstein/detail/mass-energy.html",
     "科学给出力量，怎么用，是 Humanity 的选择。",
     "科学给出力量，怎么用，是人类的抉择。",
     1, "B4 未译英文词（收尾金句）"),

    # ── B5 正文混入未翻译英文词 radio ─────────────────────────────────
    ("scientists/maxwell/index.html",
     "今天所有的 radio、Wi-Fi、光纤",
     "今天所有的无线电、Wi-Fi、光纤",
     1, "B5 同句内 Wi-Fi/光纤 均通用，radio 有现成中文"),

    # ── B6 实验二引言把「稀有气体最高、碱金属最低」说成普遍规律 ────────
    ("scientists/mendeleev/labs.html",
     "把元素的某种性质按原子序数画成柱子，会出现规律的锯齿：每到稀有气体冲到最高，一到碱金属就跌到最低，然后周而复始。拖动“性质”，换一种性质看看。",
     "把元素的某种性质按原子序数画成柱子，会出现规律的起伏。以默认的第一电离能为例：稀有气体冲到最高、碱金属跌到最低；换成原子半径等性质，趋势会整体反过来。拖动“性质”，换一种性质看看。",
     1, "B6 描述与自己的演示（原子半径/电负性）相反"),

    # ── B7 实验三称留了「三个空格」，详解页只讲镓、锗 ────────────────
    ("scientists/mendeleev/detail/predict.html",
     '<h2 id="germanium">四、锗坐实</h2>',
     '<h2 id="germanium">四、钪与锗相继坐实</h2>',
     1, "B7 标题纳入钪（锚点 id 不动，链接不受影响）"),
    ("scientists/mendeleev/detail/predict.html",
     "<p>1886 年，锗被发现，几乎完全符合“类硅”的预言。两次应验，让周期表从“巧妙排列”升格为“可信理论”。</p>",
     "<p>1879 年，钪被发现，正对应他预言的“类硼”；1886 年，锗被发现，几乎完全符合“类硅”的预言。三个空格全部应验，让周期表从“巧妙排列”升格为“可信理论”。</p>",
     1, "B7 补出第三个应验的预言，与实验三『三个空格』口径一致"),

    # ── B8 提纯实验一句话内自相矛盾 ──────────────────────────────────
    ("scientists/curie/labs.html",
     "约每吨沥青铀矿残渣只能提出 25 毫克镭，而这点量要用掉几吨矿石。",
     "约每吨沥青铀矿残渣只能提出几十毫克镭；要攒出 0.1 克氯化镭，得处理好几吨矿渣。",
     1, "B8 句内逻辑相反 + 数值口径与本站其它页统一"),

    # ── B9「一吨矿渣」与本站其它页「数吨矿渣」不一致 ──────────────────
    ("scientists/curie/index.html",
     "她从一吨矿渣里提炼出零点几克镭",
     "她从数吨矿渣里提炼出零点几克镭",
     1, "B9 首页导语与 detail/radium、timeline 统一为『数吨』"),
    ("scientists/curie/index.html",
     "<p>一吨矿渣，换回一小管会发光的镭。</p>",
     "<p>数吨矿渣，换回一小管会发光的镭。</p>",
     1, "B9 首页成就卡同句问题"),

    # ── B10 首页写「1864 巴氏杀菌」，时间轴没有 1864 节点 ─────────────
    ("scientists/pasteur/timeline.html",
     """      <div class="tl-item" id="spontaneous" data-year="1862">
        <div class="tl-rail"><span class="dot"></span></div>
        <div class="tl-head">
          <span class="tl-year">1862</span>
          <span class="tl-title">鹅颈瓶实验</span>
        </div>
        <div class="tl-body">
          <figure>
            <img src="assets/img/history/swan-neck-flask.jpg" alt="鹅颈瓶" loading="lazy">
            <figcaption>否定生命自然发生。</figcaption>
          </figure>
          <p>用鹅颈瓶证明肉汤变质来自空气中的微生物，而非无中生有，力压自然发生说。</p>
        </div>
      </div>
""",
     """      <div class="tl-item" id="spontaneous" data-year="1862">
        <div class="tl-rail"><span class="dot"></span></div>
        <div class="tl-head">
          <span class="tl-year">1862</span>
          <span class="tl-title">鹅颈瓶实验</span>
        </div>
        <div class="tl-body">
          <figure>
            <img src="assets/img/history/swan-neck-flask.jpg" alt="鹅颈瓶" loading="lazy">
            <figcaption>否定生命自然发生。</figcaption>
          </figure>
          <p>用鹅颈瓶证明肉汤变质来自空气中的微生物，而非无中生有，力压自然发生说。</p>
        </div>
      </div>
      <div class="tl-item" id="pasteurization" data-year="1864">
        <div class="tl-rail"><span class="dot"></span></div>
        <div class="tl-head">
          <span class="tl-year">1864</span>
          <span class="tl-title">巴氏杀菌</span>
        </div>
        <div class="tl-body">
          <figure>
            <img src="assets/img/history/etudes-sur-le-vin.jpg" alt="《酒的研究》1866 年初版书名页" loading="lazy">
            <figcaption>把酒加热到刚好，酸败止住了。</figcaption>
          </figure>
          <p>他证明酒的酸败来自微生物，并用适度加热把它们压下去——这就是沿用至今的巴氏杀菌。</p>
        </div>
      </div>
""",
     1, "B10 时间轴补 1864「巴氏杀菌」节点（配《酒的研究》1866 初版书名页，PD）"),

    # ── B11 同一页里「生命之树」的总结句却写成了「网」 ────────────────
    ("scientists/darwin/detail/tree.html",
     "而是一张彼此相连的网。",
     "而是同一根上彼此相连的枝丫。",
     1, "B11 全页用『树』比喻，总结句却是『网』，同页自相矛盾"),

    # ── B12/B13 恩尼格玛破译只归图灵；「改进型」只改了首页 ─────────────
    ("scientists/turing/detail/enigma.html",
     "图灵在布莱切利园设计“炸弹机”，用机电方式大规模搜索密钥，大幅加速了破译。",
     "图灵在布莱切利园设计出改进型的“炸弹机”，用机电方式大规模搜索密钥，大幅加速了破译。",
     1, "B13 大标题句补『改进型』，与首页口径一致"),
    ("scientists/turing/detail/enigma.html",
     "<p>图灵设计的“炸弹机”用电动机电逻辑瞬间尝试成千上万种组合，自动筛掉不可能的密钥，极大缩短破译时间。</p>",
     "<p>图灵设计的改进型“炸弹机”用电动机电逻辑瞬间尝试成千上万种组合，自动筛掉不可能的密钥，极大缩短破译时间。它的思路并非凭空而来：战前波兰数学家雷耶夫斯基等人已经首破恩尼格玛、造出前驱装置 Bomba；图灵是在此基础上的改进，布莱切利园的胜利是多国协作的结果。</p>",
     1, "B12 补波兰 Bomba 前驱 + B13 补『改进型』"),
    ("scientists/turing/timeline.html",
     "他设计的炸弹机大规模加速密钥搜索，成为破译的关键装备。",
     "他设计的改进型炸弹机大规模加速密钥搜索，成为破译的关键装备。",
     1, "B13 时间轴 1940 节点补『改进型』"),
    ("scientists/turing/assets/js/terms.js",
     "炸弹机是图灵团队设计的机电装置，",
     "炸弹机是图灵团队在波兰 Bomba 基础上改进的机电装置，",
     1, "B12/B13 术语库 bombe 条补前驱与『改进』"),
]


def main():
    dry = "--dry" in sys.argv

    # ── 阶段一：逐条校验命中次数（先不写盘） ──
    problems = []
    texts = {}
    for rel, old, new, expect, note in EDITS:
        p = os.path.join(ROOT, rel)
        if p not in texts:
            if not os.path.exists(p):
                problems.append(f"文件不存在：{rel}")
                texts[p] = None
                continue
            texts[p] = open(p, encoding="utf-8").read()
        t = texts[p]
        if t is None:
            continue
        n = t.count(old)
        if n != expect:
            problems.append(f"[{note}] {rel}：期望命中 {expect} 次，实际 {n} 次\n     旧文：{old[:70]}…")
        elif old == new:
            problems.append(f"[{note}] {rel}：新旧文相同（空操作）")

    print(f"共 {len(EDITS)} 条替换，涉及 {len({e[0] for e in EDITS})} 个文件")
    if problems:
        print(f"\n❌ 校验未通过（{len(problems)} 条），**未写入任何文件**：\n")
        for x in problems:
            print("   • " + x)
        return 1
    print("✅ 全部命中次数符合预期")

    if dry:
        print("\n(--dry 模式，未写盘)")
        return 0

    # ── 阶段二：写入 ──
    written = {}
    for rel, old, new, expect, note in EDITS:
        p = os.path.join(ROOT, rel)
        if p in written:
            continue
        t = texts[p]
        for r2, o2, n2, e2, _ in EDITS:
            if r2 == rel:
                t = t.replace(o2, n2)
        with open(p, "w", encoding="utf-8") as fh:
            fh.write(t)
        written[p] = True

    print(f"\n✅ 已写入 {len(written)} 个文件：")
    for p in sorted(written):
        print("   · " + os.path.relpath(p, ROOT))
    return 0


if __name__ == "__main__":
    sys.exit(main())
