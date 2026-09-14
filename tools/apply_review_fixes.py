# -*- coding: utf-8 -*-
"""一次性应用「全项目科普内容审读报告」剩余 20 条的修正。

覆盖：A2 A3 A4 A6 A7 A8 A10 A11 A12 A13 A15 A16 · B1 B2 B3 B4 B6 B8 B9 B10
外加：全站页脚「浏览全部 15 位科学家 →」统一改为「浏览全部科学家 →」

设计原则：每条替换都要求**精确命中指定次数**，任何一条不匹配即整体中止，
不写出任何文件（避免留下半成品）。这样既防手误，也能当"变更清单"存档。

用法：
    python tools/apply_review_fixes.py --dry     # 只检查，不写
    python tools/apply_review_fixes.py           # 实际应用
"""
import sys, os, glob, json

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
os.chdir(ROOT)
DRY = "--dry" in sys.argv

E = []          # (文件, 旧串, 新串, 期望次数, 条目号/说明)


def add(f, old, new, n, note):
    E.append((f, old, new, n, note))


# ======================= A 类：科学准确性 / 严谨性 =======================

# A2 门捷列夫：118 是元素总数，不是"118 种人工合成元素"
add("scientists/mendeleev/detail/legacy.html",
    "从 60 多种到今天 118 种人工合成元素，周期表不断加长，框架却始终稳。",
    "从 60 多种到今天 118 种元素——其中不少重元素还是人工合成的，周期表不断加长，框架却始终稳。",
    1, "A2 118 种元素 ≠ 全为人工合成")

# A3 牛顿：质量不是"含有多少东西"（那是物质的量），本质是惯性大小的量度
add("scientists/newton/detail/laws.html",
    "<b>m</b>\u3000物体的质量，也就是\"含有多少东西\"。质量越大，越难被推动或停下。",
    "<b>m</b>\u3000物体的质量，衡量它有多\"难被推动\"（惯性大小），也大致反映它含有多少物质。质量越大，越难被推动或停下。",
    1, "A3 质量=惯性量度")
add("scientists/newton/assets/js/terms.js",
    '''    short: "一个物体含有多少“东西”",
    plain: "质量衡量物体里有多少物质，也衡量它有多“难被推动”。质量不随位置改变：在地球上、月球上，你的质量都一样。",''',
    '''    short: "衡量物体有多“难被推动”",
    plain: "质量衡量物体有多“难被推动”（惯性大小），也大致反映它含有多少物质。质量不随位置改变：在地球上、月球上，你的质量都一样。",''',
    1, "A3 质量条 short+plain")

# A4 牛顿：重量公式 W = mg（G 是引力常数，本站万有引力条正在用）
add("scientists/newton/assets/js/terms.js",
    "等于质量乘以重力加速度（G = mg）。",
    "等于质量乘以重力加速度（W = mg）。",
    1, "A4 重量 G=mg → W=mg")

# A6 牛顿：哈雷登门两处口径统一（补回"脱口而出椭圆、却拿不出计算稿"这一环）
add("scientists/newton/index.html",
    '出来的：<a href="detail/gravity.html" data-page-node-id="FyE4eNlfYWgzqRrzptjFyc">哈雷登门请教</a>，牛顿当场答不上来，回去重算，越算越多，最后算成了一本书。',
    '出来的。1684 年，<a href="detail/gravity.html" data-page-node-id="FyE4eNlfYWgzqRrzptjFyc">哈雷登门请教</a>，问："如果引力按距离的平方反比衰减，行星轨道会是什么形状？"牛顿随口答"椭圆"；哈雷追问依据，他一时找不出当年的计算稿，只好回去重算——越算越多，最后算成了一本书。',
    1, "A6 牛顿首页哈雷故事")
add("scientists/newton/assets/js/terms.js",
    "牛顿当场答：“椭圆。”哈雷追问，牛顿答不上来，于是重新算了一遍——算着算着，写成了《原理》。",
    "牛顿随口答：“椭圆。”哈雷追问依据，他一时找不出当年的计算稿，只好重算——越算越多，最后写成了《原理》。",
    1, "A6 术语库哈雷条对齐")

# A7 开普勒：椭圆/焦点是第一定律，"近快远慢"是第二定律——不能当因果串起来
add("scientists/kepler/detail/laws.html",
    "太阳不在中心，而在一个焦点上——这正是行星近太阳时更快的原因。",
    "太阳不在中心，而在一个焦点上——所以行星时近时远。至于近时快、远时慢，原因在第二定律：连线在相等时间里扫过相等的面积。",
    1, "A7 开普勒第一/第二定律拆开")
add("scientists/kepler/assets/js/terms.js",
    "而不是椭圆中心——这正是行星近太阳更快的原因。",
    "而不是椭圆中心——于是行星时近时远。至于近时快、远时慢，是第二定律说的：连线在相等时间扫过相等面积。",
    1, "A7 术语库焦点条")

# A8 爱因斯坦：9×10¹⁶ 读作"九亿亿"，不是"九千万亿"（差 10 倍）
add("scientists/einstein/detail/mass-energy.html",
    "c² 就是约 9×10¹⁶（九千万亿）",
    "c² 就是约 9×10¹⁶（九亿亿）",
    1, "A8 c² 中文数量级")

# A10 麦克斯韦：三色合成彩色照片是 1861 年；1855 年是他的《论颜色》理论
#      处理方式：把错挂 1855 的节点整体移到 1861（与"方程组初成"同年），保证文档顺序仍是时间序
_OLD_COLOR = '''      <div class="tl-item" id="color" data-year="1855">
        <div class="tl-rail"><span class="dot"></span></div>
        <div class="tl-head">
          <span class="tl-year">1855</span>
          <span class="tl-title">彩色摄影实验</span>
        </div>
        <div class="tl-body">
          <figure>
            <img src="assets/img/history/color-photography.jpg" alt="最早的彩色照片" loading="lazy">
            <figcaption>用三原色叠出彩色。</figcaption>
          </figure>
          <p>他演示用红、绿、蓝三滤光底片合成彩色影像，是彩色摄影原理的早期实践。</p>
        </div>
      </div>
'''
_NEW_COLOR = '''      <div class="tl-item" id="color" data-year="1861">
        <div class="tl-rail"><span class="dot"></span></div>
        <div class="tl-head">
          <span class="tl-year">1861</span>
          <span class="tl-title">彩色摄影实验</span>
        </div>
        <div class="tl-body">
          <figure>
            <img src="assets/img/history/color-photography.jpg" alt="最早的彩色照片" loading="lazy">
            <figcaption>用三原色叠出彩色。</figcaption>
          </figure>
          <p>他根据自己 1855 年提出的三原色理论，用红、绿、蓝三张滤光底片叠合，演示出世界上第一张彩色照片。</p>
        </div>
      </div>
'''
_ANCHOR_EQ1 = '''          <p>他发表早期论文，把电、磁、感应的规律收纳进统一的方程框架。</p>
        </div>
      </div>
'''
add("scientists/maxwell/timeline.html", _OLD_COLOR, "", 1, "A10 先摘掉挂错年份的节点")
add("scientists/maxwell/timeline.html",
    _ANCHOR_EQ1,
    _ANCHOR_EQ1 + _NEW_COLOR,
    1, "A10 把彩色摄影节点挂回 1861")

# A11 巴斯德：分子手性是 1848 年（26 岁成名作），1854 是他去里尔的年份
add("scientists/pasteur/timeline.html",
    'id="asymmetry" data-year="1854"',
    'id="asymmetry" data-year="1848"',
    1, "A11 巴斯德节点 data-year")
add("scientists/pasteur/timeline.html",
    '<span class="tl-year">1854</span>',
    '<span class="tl-year">1848</span>',
    1, "A11 巴斯德节点显示年份")

# A12 霍金：1965 是彭罗斯单独的工作，霍金–彭罗斯联合定理是 1970 年
add("scientists/hawking/timeline.html",
    "<p>他与彭罗斯证明，在很一般的条件下时空必出现奇点，震动学界。</p>",
    "<p>1965 年彭罗斯证明引力坍缩必然产生奇点，霍金随即把这一套用到整个宇宙；1970 年，两人联合证明了著名的奇点定理。</p>",
    1, "A12 霍金奇点定理年份归属")

# A13 居里：α/β/γ 分类是卢瑟福的工作；"来自原子核"是 1911 年核模型之后的认识
add("scientists/curie/detail/radioactivity.html",
    "居里夫妇与贝克勒尔一起证明：某些原子会自发放出射线（α、β、γ），这种“放射性”来自原子核本身，与外界无关。",
    "居里夫妇与贝克勒尔一起证明：某些原子会自发放出射线，这种“放射性”来自原子本身、与外界无关。（后来才知道射线来自原子核；α、β、γ 的分类是卢瑟福等人的工作。）",
    1, "A13 居里射线归属")

# A15 法拉第：8 月 29 日是铁环（双线圈）实验；"磁铁插线圈"是同年 10 月
add("scientists/faraday/detail/induction.html",
    "1831 年 8 月 29 日，法拉第把一根磁铁插进线圈，发现线圈里瞬间冒出了电流——磁铁不动则没有，一动就有。",
    "1831 年 8 月 29 日，法拉第用铁环实验第一次看到“变化”的磁生出电流；同年 10 月，他又用磁铁插入线圈反复验证——磁铁不动则没有，一动就有。",
    1, "A15 法拉第 8·29 铁环实验")

# A16 伽利略：他给出的是等时性与"周期只与摆长有关"；带 g 的精确公式是惠更斯（1673）
add("scientists/galileo/detail/method.html",
    "的研究：单摆的周期只与摆长有关、与质量无关（T = 2π√(L/g)）。",
    "的研究：他发现单摆的周期只与摆长有关、与质量无关；带 g 的精确公式 T = 2π√(L/g) 是几十年后由惠更斯给出的。",
    1, "A16 单摆公式归属惠更斯")


# ======================= B 类：通俗可理解性 / 内部一致性 =======================

# B1 费曼：惠勒既是老师又是合作者，被并列写了两次，读起来像两个人
add("scientists/feynman/assets/js/terms.js",
    "费曼（与惠勒、以及老师惠勒的启发）提出过一个著名图像：",
    "费曼受老师惠勒启发，提出过一个著名图像：",
    1, "B1 费曼术语病句")

# B2 达尔文：正文漏译 environment
add("scientists/darwin/detail/selection.html",
    "长期下来，种群逐渐适应 environment，新类型由此产生。",
    "长期下来，种群逐渐适应环境，新类型由此产生。",
    1, "B2 environment 漏译")

# B3 达尔文：船名统一"小猎犬号"，首次出现处括注英名与另一译名
add("scientists/darwin/about.html",
    "核心事实（生卒、贝格尔号航行、《物种起源》、自然选择）",
    "核心事实（生卒、小猎犬号航行、《物种起源》、自然选择）",
    1, "B3 about 船名")
add("scientists/darwin/about.html",
    "以及《贝格尔号航行记》。",
    "以及《小猎犬号航海记》（HMS Beagle 航行记，又译《贝格尔号航海记》）。",
    1, "B3 about 延伸阅读书名")
add("scientists/darwin/assets/js/terms.js",
    "以贝格尔号航行观察为基础",
    "以小猎犬号航行观察为基础",
    1, "B3 术语库达尔文条")
add("scientists/darwin/assets/js/terms.js",
    "搭乘“小猎犬号”环球考察",
    "搭乘“小猎犬号”（HMS Beagle，又译“贝格尔号”）环球考察",
    1, "B3 术语库补括注")

# B4 居里：死因写明"再生障碍性贫血"；时间轴补 1934 逝世 / 1995 移灵先贤祠
add("scientists/curie/timeline.html",
    "1934 年逝于贫血（与长期辐射暴露相关）",
    "1934 年逝于再生障碍性贫血（与长期辐射暴露相关）",
    1, "B4 死因写明")
_CURIE_TAIL_OLD = '''          <p>一战期间她组织移动 X 光车上前线，为伤员定位弹片，挽救无数生命。</p>
        </div>
      </div>
    </div>
    <p style="text-align:center;margin-top:36px">'''
_CURIE_TAIL_NEW = '''          <p>一战期间她组织移动 X 光车上前线，为伤员定位弹片，挽救无数生命。</p>
        </div>
      </div>
      <div class="tl-item" id="died" data-year="1934">
        <div class="tl-rail"><span class="dot"></span></div>
        <div class="tl-head">
          <span class="tl-year">1934</span>
          <span class="tl-title">逝于再生障碍性贫血</span>
        </div>
        <div class="tl-body">
          <figure>
            <img src="assets/img/history/curie-portrait.jpg" alt="居里夫人" loading="lazy">
            <figcaption>一生与镭为伴，也被镭所伤。</figcaption>
          </figure>
          <p>7 月 4 日，她因长期辐射暴露导致的再生障碍性贫血去世，享年 66 岁。</p>
        </div>
      </div>
      <div class="tl-item" id="pantheon" data-year="1995">
        <div class="tl-rail"><span class="dot"></span></div>
        <div class="tl-head">
          <span class="tl-year">1995</span>
          <span class="tl-title">移灵先贤祠</span>
        </div>
        <div class="tl-body">
          <figure>
            <img src="assets/img/history/pantheon.jpg" alt="巴黎先贤祠" loading="lazy">
            <figcaption>与皮埃尔一同安息于先贤祠。</figcaption>
          </figure>
          <p>法国政府把她的灵柩移入巴黎先贤祠，她成为首位凭自身成就入葬于此的女性。</p>
        </div>
      </div>
    </div>
    <p style="text-align:center;margin-top:36px">'''
add("scientists/curie/timeline.html", _CURIE_TAIL_OLD, _CURIE_TAIL_NEW, 1, "B4 补 1934/1995 两个节点")

# B6 门捷列夫：莫塞莱用原子序数是 1913 年，且门捷列夫 1907 年已去世，"前夜"太糊
add("scientists/mendeleev/timeline.html",
    '<span class="tl-title">原子序数登场前夜</span>',
    '<span class="tl-title">周期表进入精细打磨期</span>',
    1, "B6 节点标题")
add("scientists/mendeleev/timeline.html",
    "<p>周期表进入精细打磨期，等待莫塞莱用原子序数给出更深的依据。</p>",
    "<p>周期表进入精细打磨期。可惜门捷列夫 1907 年去世，没能等到 1913 年莫塞莱用原子序数给出更深的依据。</p>",
    1, "B6 节点正文")

# B8 图灵：炸弹机是在波兰 Bomba 基础上做的改进型，且站内另两处都写"设计"
add("scientists/turing/index.html",
    "二战期间，他在布莱切利园领导破译德军恩尼格玛密码，发明的“炸弹机”大幅缩短了战争。",
    "二战期间，他在布莱切利园领导破译德军恩尼格玛密码，设计出改进型的“炸弹机”，大幅缩短了战争。",
    1, "B8 炸弹机 发明→设计")

# B9 法拉第：苯是有机化学分子，却挂在"电磁"分类下
add("scientists/faraday/assets/js/terms.js",
    '''    name: "苯",
    cat: "电磁",''',
    '''    name: "苯",
    cat: "化学",''',
    1, "B9 苯的分类")
add("scientists/faraday/assets/js/terms.js",
    'SITE_CATS = ["物理", "电磁", "历史", "科普"]',
    'SITE_CATS = ["物理", "电磁", "化学", "历史", "科普"]',
    1, "B9 分类表补「化学」")

# B10 牛顿：第一定律的一句话总结太省略，读者不知所指
add("scientists/newton/detail/laws.html",
    "。是\"懒\"，不是\"停\"。",
    "。物体的\"懒\"，是懒得改变运动状态；不是\"不推就停\"。",
    1, "B10 第一定律收尾句")


# ======================= 执行 =======================

def main():
    # 1) 逐条校验
    problems = []
    for f, old, new, n, note in E:
        if not os.path.isfile(f):
            problems.append("!! 文件不存在: %s" % f); continue
        s = open(f, encoding="utf-8").read()
        c = s.count(old)
        if c != n:
            problems.append("!! %-52s [%s] 期望命中 %d 次，实际 %d 次" % (f, note, n, c))
    # 页脚替换（批量）
    FOOT_FILES = sorted(set(glob.glob("scientists/*/*.html") + glob.glob("scientists/*/detail/*.html") + ["index.html"]))
    FOOT_OLD, FOOT_NEW = "浏览全部 15 位科学家 →", "浏览全部科学家 →"
    foot_hits = [f for f in FOOT_FILES if FOOT_OLD in open(f, encoding="utf-8").read()]

    if problems:
        print("❌ 校验未通过，未写入任何文件：")
        for p in problems:
            print("   " + p)
        sys.exit(1)

    print("✅ 全部 %d 条精确命中；页脚待替换 %d 个文件" % (len(E), len(foot_hits)))
    if DRY:
        print("（--dry：未写入）")
        return

    # 2) 写入（同一文件串行，避免并行丢更新）
    touched = {}
    for f, old, new, n, note in E:
        s = touched.get(f) or open(f, encoding="utf-8").read()
        s = s.replace(old, new)
        touched[f] = s
    for f in foot_hits:
        touched[f] = touched.get(f) or open(f, encoding="utf-8").read()
        touched[f] = touched[f].replace(FOOT_OLD, FOOT_NEW)
    for f, s in touched.items():
        open(f, "w", encoding="utf-8").write(s)
    print("✅ 已写入 %d 个文件" % len(touched))

    # 3) 残留复核
    print("\n--- 旧文案残留复核 ---")
    stale = ["118 种人工合成元素", "含有多少东西", "（G = mg）", "九千万亿",
             "这正是行星近太阳时更快的原因", "这正是行星近太阳更快的原因",
             "费曼（与惠勒、以及老师惠勒的启发）", "适应 environment",
             "贝格尔号", "逝于贫血", "原子序数登场前夜", "发明的“炸弹机”",
             "是\"懒\"，不是\"停\"", "G = mg", FOOT_OLD]
    for p in stale:
        hit = []
        for f in FOOT_FILES + [e[0] for e in E] + ["scientists/faraday/assets/js/terms.js",
                                                   "scientists/darwin/assets/js/terms.js",
                                                   "scientists/newton/assets/js/terms.js",
                                                   "scientists/hawking/timeline.html",
                                                   "scientists/pasteur/timeline.html",
                                                   "scientists/maxwell/timeline.html",
                                                   "scientists/galileo/detail/method.html",
                                                   "scientists/curie/detail/radioactivity.html"]:
            if p in open(f, encoding="utf-8").read():
                hit.append(f.replace("scientists/", ""))
        print("   %-30s → %s" % (p, "✅ 已清零" if not hit else "仍有: " + ", ".join(sorted(set(hit)))))


if __name__ == "__main__":
    main()
