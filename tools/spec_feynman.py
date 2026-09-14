# -*- coding: utf-8 -*-
"""费曼子站内容规格。运行后生成 spec_feynman.json。"""
import json, os

SPEC = {
  "id": "feynman",
  "name": "费曼",
  "en": "Richard Feynman",
  "years": "1918–1988",
  "kicker": "把量子力学画成图的人 · 1918—1988",
  "lede": "他用一个小画把最难算的量子过程变成了连线游戏，也说“没人真正懂量子力学”——可正是他，给出了量子力学最优雅的一种讲法。他还是个敲邦戈鼓、画素描、拆解保险柜的人。",
  "meta": "读懂费曼：用中学生能听懂的话，讲清量子电动力学在算什么、路径积分是怎么回事、费曼图为什么能代替一整页算式，以及他为什么是最好的科学老师。",
  "biotitle": "他把最难的量子过程，画成了一张连线的图",
  "bio": [
    "理查德·费曼（1918—1988），美国理论物理学家。生于纽约，MIT 本科、普林斯顿博士，24 岁即参与曼哈顿计划。",
    "他提出量子力学的“路径积分”表述、发明“费曼图”，并因量子电动力学（QED）的工作与施温格、朝永振一郎共享 1965 年诺贝尔物理学奖。",
    "他也是二十世纪最好的科学传播者之一：《费曼物理学讲义》影响了一代又一代学生，1986 年他在挑战者号事故调查中用一杯冰水当众演示了 O 形环失效的原因。"
  ],
  "portrait": "feynman-portrait.jpg",
  "about_claim": "本页说明费曼子站内容的依据与延伸去处。",
  "about_body": "<h2>资料来源</h2><p>本子站内容依据公开科学史通识编写，核心事实（1918 年生、MIT 与普林斯顿求学、曼哈顿计划、1948 年路径积分、1949 年费曼图、1965 年诺贝尔物理学奖、1959 年“底下还有很大空间”演讲、1986 年挑战者号调查、1988 年逝世）与主流科学史一致。历史图片均来自 Wikimedia Commons 公有领域或自由授权资源。</p><h2>延伸阅读</h2><p>想深入：费曼《费曼物理学讲义》《QED：光和物质的奇异理论》《别闹了，费曼先生！》。</p>",
  "tl_desc": "从布鲁克林的少年到量子世界的画师：一个把物理讲活了的人。",
  "tl_claim": "1918 年出生，1988 年辞世。他画的图，今天每个物理系学生都还在用。",
  "cats": ["物理", "量子", "方法", "历史", "科普"],
  "hero_scene": "feynman",
  "hero_params": {"label": "两条电子线交换一个虚光子"},

  "pages": {
    "qed": {
      "title": "量子电动力学：光与电子怎么打交道",
      "file": "detail/qed.html",
      "claim": "量子电动力学（QED）是描述光与带电粒子如何相互作用的理论。它的计算结果与实验的吻合精度，相当于测量洛杉矶到纽约的距离误差不到一根头发丝。",
      "tags": ["QED", "光子", "耦合"],
      "year": "1940s",
      "card": "人类最精确的一个理论。",
      "scene": "feynman",
      "scene_params": {"label": "电子之间通过交换光子相互作用"},
      "remember": "一句话记住：在 QED 里，两个电子之所以互相推开，是因为它们之间“扔”了一个光子。",
      "sideterms": ["qed", "photon", "electron", "coupling"],
      "sections": [
        {"id": "problem", "h": "一、难题出在哪", "body": "把量子力学和电磁学直接拼在一起，算出来的结果常常是无穷大——这在 1930 年代困住了整整一代理论物理学家。",
         "fig": "qed", "figalt": "电子与光子的相互作用", "figcap": "最简单的过程，算出了最难的式子。"},
        {"id": "photon", "h": "二、力是“交换粒子”", "body": "在量子世界里，相互作用被理解为交换粒子：两个带电粒子之间的电磁力，来自它们不断交换光子。这是 QED 的核心图像。",
         "figalt": "交换光子", "figcap": "你扔给我，我扔给你，就成了力。"},
        {"id": "coupling", "h": "三、一个决定一切的数", "body": "这个交换发生的强度由一个数决定，叫“精细结构常数”，约为 1/137。它越小，计算就越容易收敛——费曼图正是按这个数来“分级”的。",
         "figalt": "精细结构常数", "figcap": "一个小数字，撑起一整套算法。"},
        {"id": "test", "h": "四、准到离谱的验证", "body": "QED 对电子磁矩的预言与实验吻合到小数点后十来位，是科学史上被检验得最精确的理论。费曼、施温格、朝永振一郎因此共享 1965 年诺贝尔物理学奖。",
         "figalt": "理论与实验的吻合", "figcap": "算得比量得还准。"}
      ]
    },
    "path": {
      "title": "路径积分：粒子把每一条路都走一遍",
      "file": "detail/path.html",
      "claim": "费曼 1948 年提出：一个粒子从 A 到 B，并不是只走一条路，而是同时走了所有可能的路；每条路贡献一个“概率幅”，把它们全部加起来，才是真正的结果。",
      "tags": ["路径积分", "概率幅", "经典极限"],
      "year": "1948",
      "card": "不是走哪条路，而是把路都走一遍。",
      "scene": "wave",
      "scene_params": {"label": "经典路径附近，相位箭头才不会互相抵消"},
      "remember": "一句话记住：离直线越远的路，相位箭头转得越快、互相抵消得越干净——所以宏观世界里，物体看起来总走直线。",
      "sideterms": ["path-integral", "amplitude", "action", "uncertainty"],
      "sections": [
        {"id": "idea", "h": "一、一个反常识的想法", "body": "经典力学说：物体沿一条确定的路径走。量子力学说：所有路径都算数——直的、绕远的、甚至先跑到月球再回来的，都要计入。",
         "fig": "path", "figalt": "从 A 到 B 的所有路径", "figcap": "每一条，都走一遍。"},
        {"id": "amplitude", "h": "二、加的是“概率幅”，不是概率", "body": "每条路径贡献一个小箭头（复数），有方向也有长度。把箭头首尾相接，得到的净长度才是总概率幅；概率是它的平方。这就是为什么概率会出现干涉。",
         "figalt": "首尾相接的相位箭头", "figcap": "箭头会帮彼此，也会抵消彼此。"},
        {"id": "classical", "h": "三、经典世界从哪里来", "body": "远离直线的路径，作用量变化剧烈，相位箭头飞快旋转，彼此抵消；只有作用量取极值（通常是直线）附近的路留了下来。这就是经典力学的来历。",
         "figalt": "经典路径附近的相干", "figcap": "剩下的那一条，就是牛顿说的那条。"},
        {"id": "equivalent", "h": "四、与薛定谔等价", "body": "费曼证明了这套路径积分与薛定谔方程、海森堡矩阵力学完全等价——同一个量子力学的第三种写法。它的好处是直观，尤其适合处理场与粒子。",
         "figalt": "三种等价的表述", "figcap": "同一首曲子，三种乐器。"}
      ]
    },
    "diagram": {
      "title": "费曼图：把一整页算式画成一张画",
      "file": "detail/diagram.html",
      "claim": "1949 年，费曼发明了一种图：一条线代表一个粒子，一个交点代表一次相互作用，波浪线代表光子。只要照着图写下对应的式子，复杂的计算就有了章法。",
      "tags": ["费曼图", "顶点", "虚粒子"],
      "year": "1949",
      "card": "物理史上最省纸的发明。",
      "scene": "feynman",
      "scene_params": {"label": "看图写式子：线与顶点的规则"},
      "remember": "一句话记住：费曼图不是画给眼睛看的示意图，而是一套严格的“图形算法”——照图写式子，一字不差。",
      "sideterms": ["feynman-diagram", "vertex", "virtual-particle", "photon"],
      "sections": [
        {"id": "draw", "h": "一、一张图能省掉什么", "body": "一个看似简单的散射过程，用传统方法要写满几页纸的积分。费曼把它画成几条线与两个交点，算式长度缩短了几个数量级。",
         "fig": "diagram", "figalt": "一张费曼图", "figcap": "几页积分，缩成几条线。"},
        {"id": "rules", "h": "二、看图写式子的规则", "body": "费曼给每条线和每个顶点配了明确的数学因子：内线对应传播子，顶点对应耦合常数，外线对应入射与出射粒子。规则是死的，照着写就行。",
         "figalt": "线与顶点的对应规则", "figcap": "图上的每一笔，都有对应的式子。"},
        {"id": "loop", "h": "三、圈图与修正", "body": "图里出现闭合的“圈”时，代表更高阶的量子修正。圈越多，贡献越小——这正是 QED 能逐级逼近精确答案的原因。",
         "figalt": "带圈的费曼图", "figcap": "多画一个圈，就多准一位。"},
        {"id": "language", "h": "四、成了通用语言", "body": "今天，从粒子物理到凝聚态物理，全世界的物理学家都在用费曼图交流。它已经不只是费曼的工具，而是整个学科的通用语言。",
         "figalt": "通用的图形语言", "figcap": "一种画，说遍所有物理。"}
      ]
    },
    "teacher": {
      "title": "讲台上的费曼：讲义、冰水与好奇心",
      "file": "detail/teacher.html",
      "claim": "费曼另一个身份是最好的科学老师。他为大一新生重讲物理，留下《费曼物理学讲义》；他在国会听证会上用一杯冰水找出航天飞机失事的真凶；1959 年他预言了纳米技术。",
      "tags": ["讲义", "挑战者号", "纳米"],
      "year": "1959–1986",
      "card": "他让物理说人话。",
      "scene": "graph",
      "scene_params": {"label": "理解与背诵的差别：一个随时间分岔的曲线"},
      "remember": "一句话记住：他最擅长的不是让人觉得物理简单，而是让人觉得物理有趣。",
      "sideterms": ["lectures", "challenger", "nanotech", "popular-science"],
      "sections": [
        {"id": "lectures", "h": "一、《费曼物理学讲义》", "body": "1961 年起，他为加州理工的大一学生重讲整套物理学。讲义整理成三卷本，至今仍被全世界学生反复阅读——它讲的不是题型，是物理本身。",
         "fig": "teacher", "figalt": "费曼物理学讲义", "figcap": "给新生讲的书，物理学家也在读。"},
        {"id": "challenger", "h": "二、一杯冰水的证词", "body": "1986 年挑战者号失事后，他在调查听证会上把航天飞机的 O 形环泡进一杯冰水，当众演示它在低温下失去弹性——真相就这样被摆上了桌面。",
         "figalt": "冰水中的 O 形环", "figcap": "不用一句术语，说清了事故。"},
        {"id": "nano", "h": "三、底下还有很大空间", "body": "1959 年他做了那场著名演讲《底下还有很大空间》，提出可以在原子尺度上操纵物质、把整部百科全书写在一个针尖上——这被视为纳米技术的最早构想。",
         "figalt": "纳米尺度的构想", "figcap": "比时代早了几十年的预言。"},
        {"id": "attitude", "h": "四、诚实的乐趣", "body": "他说“科学的第一原则是：你绝不能骗自己，而你自己恰恰是最容易被骗的人”。他享受“不知道”的状态，认为承认不懂才是思考的起点。",
         "figalt": "承认不知道", "figcap": "不懂，才是开始。"}
      ]
    }
  },

  "terms": {
    "qed": {"name": "量子电动力学", "cat": "物理", "short": "光与带电粒子的理论", "plain": "量子电动力学（QED）是描述光（电磁场）与带电粒子如何相互作用的量子理论。它的预言与实验吻合到极高精度，是最精确的物理理论之一。", "analogy": "一本算得极准的“光与电子的账本”。", "page": "qed", "anchor": "#problem", "related": ["photon", "electron", "feynman-diagram"]},
    "photon": {"name": "光子", "cat": "物理", "short": "光的量子", "plain": "光子是电磁相互作用的基本量子，也就是“一份光”。在 QED 里，带电粒子之间的电磁力正是通过交换光子实现的。", "analogy": "像是被扔来扔去的一个球。", "page": "qed", "anchor": "#photon", "related": ["qed", "electron", "virtual-particle"]},
    "electron": {"name": "电子", "cat": "物理", "short": "带负电的基本粒子", "plain": "电子是带一个单位负电荷的基本粒子，是原子结构与电流的主角。它与光子的相互作用正是 QED 研究的核心。", "analogy": "原子里跑得最欢的那一个。", "page": "qed", "anchor": "#photon", "related": ["photon", "qed", "positron"]},
    "coupling": {"name": "耦合常数", "cat": "物理", "short": "相互作用有多强", "plain": "耦合常数衡量一种相互作用有多强。电磁相互作用的强度由精细结构常数（约 1/137）刻画，它也是费曼图逐级展开的小参数。", "analogy": "像是握手力气的大小。", "page": "qed", "anchor": "#coupling", "related": ["qed", "feynman-diagram"]},
    "path-integral": {"name": "路径积分", "cat": "量子", "short": "所有路径求和", "plain": "路径积分是费曼提出的量子力学表述：粒子从 A 到 B 的概率幅，等于所有可能路径贡献的概率幅之和，每条路径的权重由其作用量决定。", "analogy": "不是选一条路，而是把每条路都走一遍。", "page": "path", "anchor": "#idea", "related": ["amplitude", "action", "uncertainty"]},
    "amplitude": {"name": "概率幅", "cat": "量子", "short": "要先加、再平方的量", "plain": "概率幅是一个复数（可画成小箭头）。量子力学先对所有路径的概率幅求和，再取平方得到概率——这正是干涉现象的来源。", "analogy": "先排好队再一起算，而不是各算各的。", "page": "path", "anchor": "#amplitude", "related": ["path-integral", "interference"]},
    "action": {"name": "作用量", "cat": "量子", "short": "给每条路径打的分", "plain": "作用量是判断一条路径“代价”的量。在路径积分中，它决定该路径概率幅的相位；作用量取极值的路径就是经典路径。", "analogy": "像给每条路记一笔“路程费”。", "page": "path", "anchor": "#classical", "related": ["path-integral", "amplitude"]},
    "uncertainty": {"name": "不确定性原理", "cat": "量子", "short": "位置与动量不能同时精确", "plain": "不确定性原理指出，粒子的位置与动量无法同时被精确确定。这正是“所有路径都要考虑”的深层原因：粒子没有一条确定的轨道。", "analogy": "你说得越准它在哪，就越说不准它往哪去。", "page": "path", "anchor": "#idea", "related": ["path-integral", "amplitude"]},
    "interference": {"name": "干涉", "cat": "量子", "short": "概率幅的相加相消", "plain": "干涉指概率幅叠加时出现的加强与抵消。双缝实验中电子的落点分布，正是不同路径的概率幅互相干涉的结果。", "analogy": "两队人马，有时凑成一支，有时散成一地。", "page": "path", "anchor": "#amplitude", "related": ["amplitude", "path-integral"]},
    "feynman-diagram": {"name": "费曼图", "cat": "方法", "short": "把算式画成图", "plain": "费曼图是用线条与顶点表示粒子相互作用过程的图：线代表粒子传播，顶点代表相互作用。它对应一套严格的规则，可以照图写出积分式。", "analogy": "物理界的流程图。", "page": "diagram", "anchor": "#draw", "related": ["vertex", "virtual-particle", "qed"]},
    "vertex": {"name": "顶点", "cat": "方法", "short": "图上发生相互作用的点", "plain": "在费曼图中，顶点代表一次相互作用发生的位置，每个顶点对应一个耦合常数因子与守恒律约束。", "analogy": "图上那个“握手”的瞬间。", "page": "diagram", "anchor": "#rules", "related": ["feynman-diagram", "coupling"]},
    "virtual-particle": {"name": "虚粒子", "cat": "量子", "short": "不能直接看见的中间粒子", "plain": "虚粒子是费曼图内部线上交换的粒子，不能被直接探测到，它只在计算过程中出现，是相互作用的中介。", "analogy": "像递东西时那只一闪而过的手。", "page": "diagram", "anchor": "#loop", "related": ["feynman-diagram", "photon"]},
    "positron": {"name": "正电子", "cat": "量子", "short": "电子的反粒子", "plain": "正电子是电子的反粒子，带正电。费曼受老师惠勒启发，提出过一个著名图像：正电子可以看作在时间中逆行的电子。", "analogy": "像是倒着放的那一段影片。", "page": "diagram", "anchor": "#rules", "related": ["electron", "feynman-diagram"]},
    "renormalization": {"name": "重整化", "cat": "物理", "short": "把无穷大收拾干净", "plain": "重整化是一套处理计算中出现的无穷大的方法，通过重新定义质量与电荷等参量，得到有限的、可与实验比较的结果。它是 QED 成功的关键一步。", "analogy": "把爆掉的数字，重新校准成能用的尺子。", "page": "qed", "anchor": "#test", "related": ["qed", "feynman-diagram"]},
    "superfluid": {"name": "超流体", "cat": "物理", "short": "没有黏性的液体", "plain": "超流体是低温下失去全部黏性、可以无阻力流动的量子液体。费曼在 1950 年代对液氦超流给出了重要的微观解释。", "analogy": "倒进杯子里，能自己爬出来。", "page": "qed", "anchor": "#test", "related": ["qed", "feynman"]},
    "nanotech": {"name": "纳米技术", "cat": "方法", "short": "在原子尺度上造东西", "plain": "纳米技术是在纳米尺度操纵物质的技术。费曼 1959 年的演讲《底下还有很大空间》被视为这一领域最早的思想源头。", "analogy": "把零件做到原子那么小。", "page": "teacher", "anchor": "#nano", "related": ["feynman", "popular-science"]},
    "challenger": {"name": "挑战者号", "cat": "历史", "short": "一杯冰水找出的真相", "plain": "1986 年美国航天飞机挑战者号升空后爆炸，七名航天员牺牲。费曼作为调查委员，用冰水演示 O 形环在低温下失去弹性，指出了事故的直接原因。", "analogy": "最朴素的一次演示，最有力的一份证词。", "page": "teacher", "anchor": "#challenger", "related": ["feynman", "popular-science"]},
    "lectures": {"name": "《费曼物理学讲义》", "cat": "科普", "short": "给大一新生讲的名著", "plain": "《费曼物理学讲义》是费曼 1961 年起在加州理工为本科生讲授物理的记录，共三卷。它不堆公式，而是讲物理是怎么想出来的。", "analogy": "一本讲思路，而不是讲题型的物理书。", "page": "teacher", "anchor": "#lectures", "related": ["popular-science", "feynman"]},
    "popular-science": {"name": "科学普及", "cat": "科普", "short": "把专业讲给大众", "plain": "科学普及是把专业研究用通俗方式讲给公众。法拉第开创的这一传统，在费曼、霍金手里被推向新的高度。", "analogy": "把实验室的话，翻译成街头的话。", "page": "teacher", "anchor": "#attitude", "related": ["lectures", "challenger"]},
    "bohr": {"name": "玻尔", "cat": "历史", "short": "哥本哈根那一派", "plain": "尼尔斯·玻尔提出原子结构与互补性原理，是量子力学哥本哈根解释的代表人物。费曼的路径积分给出的是同一套物理的另一种讲法。", "analogy": "同一座山，两条不同的上山路。", "page": "path", "anchor": "#equivalent", "related": ["path-integral", "uncertainty"]},
    "feynman": {"name": "费曼", "cat": "历史", "short": "量子世界的画师", "plain": "理查德·费曼是美国理论物理学家，提出路径积分与费曼图，因量子电动力学获 1965 年诺贝尔物理学奖，同时也是二十世纪最著名的科学传播者之一。", "analogy": "他把最难的物理，画成了最好懂的图。", "page": "qed", "anchor": "#photon", "related": ["qed", "feynman-diagram", "path-integral"]}
  },

  "timeline": [
    {"year": 1918, "id": "born", "title": "生于纽约", "img": "feynman-portrait.jpg", "alt": "费曼", "fig": "理查德·费曼 1918 年 5 月 11 日生于纽约。", "body": "他在纽约皇后区长大，父亲很早就教他观察世界、追问“为什么”，而不是只记住名字。"},
    {"year": 1939, "id": "mit", "title": "MIT 与普林斯顿", "img": "mit.jpg", "alt": "MIT", "fig": "从本科到博士。", "body": "他在 MIT 读完本科，随后到普林斯顿大学读研究生，师从惠勒研究量子力学。"},
    {"year": 1942, "id": "losalamos", "title": "曼哈顿计划", "img": "los-alamos.jpg", "alt": "洛斯阿拉莫斯", "fig": "24 岁，进了最机密的地方。", "body": "还没拿到博士学位，他就被招募参与曼哈顿计划，在洛斯阿拉莫斯负责理论计算工作。"},
    {"year": 1948, "id": "path", "title": "路径积分", "img": "path.jpg", "alt": "路径积分", "fig": "粒子把每条路都走一遍。", "body": "他提出量子力学的路径积分表述：概率幅是对所有可能路径的求和，与薛定谔方程等价。"},
    {"year": 1949, "id": "diagram", "title": "费曼图", "img": "diagram.jpg", "alt": "费曼图", "fig": "一整页算式，缩成一张画。", "body": "他发表费曼图，把复杂的散射计算变成照图写式子的标准流程，很快被整个领域采纳。"},
    {"year": 1954, "id": "helium", "title": "液氦超流", "img": "helium.jpg", "alt": "液氦", "fig": "解释没有黏性的液体。", "body": "他对液氦的超流现象给出微观解释，展示了量子力学在低温宏观系统中的威力。"},
    {"year": 1959, "id": "nano", "title": "底下还有很大空间", "img": "nano.jpg", "alt": "纳米尺度", "fig": "比时代早几十年的预言。", "body": "他做了那场著名演讲，提出可以在原子尺度操纵物质，被视为纳米技术思想的源头。"},
    {"year": 1961, "id": "lectures", "title": "《费曼物理学讲义》", "img": "lectures.jpg", "alt": "讲义", "fig": "给大一新生重讲物理。", "body": "他开始为加州理工的学生讲授整套基础物理，讲义后来整理成三卷本，成为传世名著。"},
    {"year": 1965, "id": "nobel", "title": "诺贝尔物理学奖", "img": "nobel.jpg", "alt": "诺贝尔奖", "fig": "量子电动力学的加冕。", "body": "他因量子电动力学的工作，与施温格、朝永振一郎共同获得诺贝尔物理学奖。"},
    {"year": 1986, "id": "challenger", "title": "挑战者号调查", "img": "challenger.jpg", "alt": "挑战者号", "fig": "一杯冰水，找出真凶。", "body": "他参与挑战者号事故调查，用一杯冰水当众演示 O 形环在低温下失效，推动了事故原因的确认。"},
    {"year": 1988, "id": "died", "title": "辞世", "img": "feynman-portrait.jpg", "alt": "费曼", "fig": "他说：死亡太无聊了。", "body": "2 月 15 日，费曼因癌症并发症逝世，享年 69 岁。他留下的图与讲义，至今仍在使用。"}
  ],

  "images": [
    {"file": "feynman-portrait.jpg", "wiki": "File:Richard Feynman.jpg", "q": "Richard Feynman portrait", "desc": "费曼肖像", "author": "Public domain", "license": "Public domain"},
    {"file": "mit.jpg", "wiki": "File:MIT Building 10.jpg", "q": "Massachusetts Institute of Technology campus", "desc": "MIT 校园", "author": "CC BY-SA", "license": "CC BY-SA"},
    {"file": "los-alamos.jpg", "wiki": "File:Los Alamos National Laboratory.jpg", "q": "Los Alamos National Laboratory", "desc": "洛斯阿拉莫斯", "author": "Public domain", "license": "Public domain"},
    {"file": "path.jpg", "wiki": "File:Path integral.svg", "q": "path integral formulation diagram", "desc": "路径积分示意", "author": "Public domain", "license": "Public domain"},
    {"file": "diagram.jpg", "wiki": "File:Feynman diagram ee scattering.svg", "q": "Feynman diagram electron scattering", "desc": "费曼图", "author": "Public domain", "license": "Public domain"},
    {"file": "helium.jpg", "wiki": "File:Liquid helium.jpg", "q": "liquid helium superfluid", "desc": "液氦", "author": "Public domain", "license": "Public domain"},
    {"file": "nano.jpg", "wiki": "File:Nanoscale.svg", "q": "nanoscale size comparison", "desc": "纳米尺度", "author": "Public domain", "license": "Public domain"},
    {"file": "lectures.jpg", "wiki": "File:The Feynman Lectures on Physics.jpg", "q": "Feynman Lectures on Physics books", "desc": "费曼物理学讲义", "author": "Public domain", "license": "Public domain"},
    {"file": "nobel.jpg", "wiki": "File:Nobel Prize medal.jpg", "q": "Nobel Prize medal physics", "desc": "诺贝尔奖章", "author": "Public domain", "license": "Public domain"},
    {"file": "challenger.jpg", "wiki": "File:Challenger explosion.jpg", "q": "Space Shuttle Challenger disaster", "desc": "挑战者号", "author": "Public domain", "license": "Public domain"}
  ],

  "labs": [
    {"key": "path", "kind": "pathintegral", "icon": "🌀", "title": "把每一条路都走一遍",
     "intro": "拖动“ℏ 大小”，看每条路径的相位箭头怎样首尾相接：ℏ 越小，箭头互相抵消得越厉害，最后只剩靠近直线的那几条。",
     "desc": "经典世界，就是抵消之后剩下的部分。",
     "ctrl": [{"name": "hbar", "label": "ℏ 大小", "min": 0.3, "max": 3, "value": 1, "step": 0.1, "init": "1.0×"}],
     "params": {"label": "从 A 到 B：粒子把每一条路都走了一遍"}},
    {"key": "interfere", "kind": "wave", "icon": "🌊", "title": "概率幅的干涉",
     "intro": "拖动“频率”与“幅度”，看两列概率幅怎样互相加强或抵消——这就是双缝实验里电子落点成条纹的原因。",
     "desc": "加的是箭头，不是概率。",
     "ctrl": [{"name": "freq", "label": "频率", "min": 0.3, "max": 3, "value": 1, "step": 0.1, "init": "1.0×"},
              {"name": "amp", "label": "幅度", "min": 0.3, "max": 2, "value": 1, "step": 0.1, "init": "1.0×"}],
     "params": {"label": "两列概率幅的相长与相消"}},
    {"key": "dist", "kind": "graph", "icon": "📉", "title": "落点的概率分布",
     "intro": "拖动滑块，看概率分布曲线的中心与宽度怎么变——曲线的高度不是概率，概率幅的平方才是。",
     "desc": "先加箭头，再平方。",
     "ctrl": [{"name": "param1", "label": "中心位置", "min": 0.3, "max": 1.8, "value": 1, "step": 0.1, "init": "1.0"},
              {"name": "param2", "label": "宽度", "min": 0.6, "max": 2, "value": 1, "step": 0.1, "init": "1.0"}],
     "params": {"expr": "gauss", "label": "电子落点的概率分布（概率幅的平方）"}}
  ]
}


if __name__ == "__main__":
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "spec_feynman.json")
    json.dump(SPEC, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print("wrote", out)
