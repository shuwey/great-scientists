# -*- coding: utf-8 -*-
"""麦克斯韦子站内容规格。运行后生成 spec_maxwell.json。"""
import json, os

SPEC = {
  "id": "maxwell",
  "name": "麦克斯韦",
  "en": "James Clerk Maxwell",
  "years": "1831–1879",
  "kicker": "电磁学统一者 · 1831—1879",
  "lede": "他用一组方程把电、磁、光拧成了一件事，预言了看不见的电磁波，也给后来的相对论与量子论埋下种子。",
  "meta": "读懂麦克斯韦：用中学生能听懂的话，讲清一组方程如何统一了电磁与光，并预言了电磁波。",
  "biotitle": "他用一支笔，把整个世界连上了电",
  "bio": [
    "詹姆斯·克拉克·麦克斯韦（1831—1879），苏格兰人。他少年时就能自己做实验，后来成为继牛顿之后又一位改变物理图景的英国人。",
    "他先把法拉第的“力线”翻译成严格的数学，又把电、磁、光统一进同一组方程；正是这组方程，预言了以光速传播的电磁波。",
    "他一生高产却只活到 48 岁。今天所有的无线电、Wi-Fi、光纤，底层都是他写下的那组方程在起作用。"
  ],
  "portrait": "maxwell-portrait.jpg",
  "about_claim": "本页说明麦克斯韦子站内容的依据与延伸去处。",
  "about_body": "<h2>资料来源</h2><p>本子站内容依据公开史料与科学史通识编写，核心事实（生卒、麦克斯韦方程组、电磁波预言、气体动理论）与主流科学史一致。历史图片均来自 Wikimedia Commons 公有领域资源。</p><h2>延伸阅读</h2><p>想深入：麦克斯韦《电磁通论》（A Treatise on Electricity and Magnetism）；以及《麦克斯韦方程》（由 Longair 等编）。</p>",
  "tl_desc": "从爱丁堡的少年到卡文迪许实验室的创立者：麦克斯韦一生的关键节点。",
  "tl_claim": "1831 年出生，1879 年逝于剑桥。他用一组方程把电、磁、光统一起来，让“看不见的波”第一次有了名字。",
  "cats": ["物理", "电磁", "方法", "历史"],
  "hero_scene": "field",
  "hero_params": {"label": "电场与磁场彼此激发：电磁世界的一体两面"},

  "pages": {
    "equations": {
      "title": "麦克斯韦方程组：把电、磁、光写成一体",
      "file": "detail/equations.html",
      "claim": "四个方程，把电、磁、光统一进同一个数学框架——这是物理学史上最优雅的“大一统”之一。",
      "tags": ["方程组", "电磁统一", "物理"],
      "year": "1865",
      "card": "电会生磁、磁会生电，光也只是这种相互作用的波动。",
      "scene": "field",
      "scene_params": {"label": "电场与磁场相互激发：电磁是一体的"},
      "remember": "一句话记住：麦克斯韦把前人零散的电磁定律，织成了一张完整而自洽的网。",
      "sideterms": ["maxwell-eq", "em-field", "displacement-current", "faraday", "unification"],
      "sections": [
        {"id": "before", "h": "一、三股力量先到齐", "body": "在麦克斯韦之前，库仑说清了电荷间的力，安培说清了电流产生磁场，法拉第说清了变化的磁场产生电场。但它们各自为政，像四散的零件。",
         "fig": "equations", "figalt": "前人的电磁定律", "figcap": "电、磁、感应，各自成说，等着被拧成一体。"},
        {"id": "displacement", "h": "二、位移电流：关键一笔", "body": "麦克斯韦发现：变化的电场也会“等效”地产生磁场。他引入“位移电流”这一项，补上了原有理论的缺口——这一步是天才的直觉。",
         "figalt": "变化的电场生磁场", "figcap": "给方程补上一块拼图，整个体系才闭合。"},
        {"id": "couple", "h": "三、电场与磁场互相激发", "body": "变化的电场生磁场，变化的磁场又生电场，二者彼此推着向前跑。方程组描述的就是这种“你推我、我推你”的连锁反应。",
         "figalt": "电磁互激", "figcap": "电场和磁场像两个人轮流推秋千，越推越远。"},
        {"id": "why", "h": "四、为什么是革命", "body": "一组方程同时管住了静电、磁铁、电流和光。它不再是一堆经验公式，而是一个能推演一切的体系——现代电气文明就立在这张网上。",
         "figalt": "统一的电磁框架", "figcap": "把零散的“零件”装成一台会运转的机器，才是真正的理论。"}
      ]
    },
    "light": {
      "title": "光，原来是一种电磁波",
      "file": "detail/light.html",
      "claim": "麦克斯韦从方程里推出：电磁扰动以某个固定速度传播，那个速度恰好等于光速——光，就是电磁波。",
      "tags": ["电磁波", "光速", "光"],
      "year": "1865",
      "card": "从方程里“算”出光速，顺手认出光就是电磁波。",
      "scene": "wave",
      "scene_params": {"label": "电磁波：振荡的电场与磁场结伴传播"},
      "remember": "一句话记住：不是先有光再去解释，而是先有方程，再“算”出光本该存在。",
      "sideterms": ["em-wave", "light-speed", "hertz", "spectrum", "maxwell-eq"],
      "sections": [
        {"id": "speed", "h": "一、一个惊人的速度", "body": "把方程的常数代入，麦克斯韦得到电磁波的传播速度：1/√(ε₀μ₀)。算出一看，竟和当时测得的光速几乎一样。",
         "fig": "light", "figalt": "算出的波速等于光速", "figcap": "两个本不相干的数，竟然撞出了同一个值。"},
        {"id": "islight", "h": "二、光就是电磁波", "body": "速度吻合到这种程度，麦克斯韦大胆判断：光本身就是一种电磁波，只是频率落在人眼能感受的范围。颜色，不过是频率不同。",
         "figalt": "光是电磁波", "figcap": "换个频率，光就成了看不见的电波。"},
        {"id": "hertz", "h": "三、赫兹证实了它", "body": "二十多年后，赫兹用实验真正发出并接收到了无线电波，证实麦克斯韦的预言。今天所有的无线通信，都站在这一步上。",
         "figalt": "赫兹的实验", "figcap": "看不见的波，终于被“抓”到了。"},
        {"id": "spectrum", "h": "四、整条电磁波谱", "body": "从无线电、微波、红外、可见光到紫外线、X 光、γ 射线，其实都是同一种波，只是频率不同。麦克斯韦的方程，给整条谱系提供了统一的家。",
         "figalt": "电磁波谱", "figcap": "同一类波，换个频道就是不同世界。"}
      ]
    },
    "gas": {
      "title": "气体动理论：分子在乱窜",
      "file": "detail/gas.html",
      "claim": "麦克斯韦用概率与统计，把“气体”看成无数乱窜的分子，并给出了分子速率的分布规律。",
      "tags": ["气体动理论", "统计", "分子"],
      "year": "约1860",
      "card": "气体不是模糊的一团，而是亿万分子的集体舞蹈。",
      "scene": "graph",
      "scene_params": {"label": "分子速率：有的快、有的慢，呈钟形分布"},
      "remember": "一句话记住：单个分子乱撞不可预测，但亿万分子合起来却守着一条稳定的分布曲线。",
      "sideterms": ["kinetic-theory", "maxwell-boltzmann", "molecule", "temperature", "statistical"],
      "sections": [
        {"id": "molecules", "h": "一、气体是乱窜的分子", "body": "麦克斯韦采纳“气体由大量微小分子构成、彼此碰撞”的图景，用力学加概率去描述它，而不是把它当连续的流体。",
         "fig": "gas", "figalt": "乱窜的分子", "figcap": "每个分子都随心乱跑，整体却有规律。"},
        {"id": "distribution", "h": "二、速率分布：快的快、慢的慢", "body": "他给出著名的速率分布：大多数分子速率居中，特别快和特别慢的都少，呈“钟形”。这就是麦克斯韦—玻尔兹曼分布。",
         "figalt": "速率分布曲线", "figcap": "不是所有分子一样快，而是各有快慢、各有比例。"},
        {"id": "temperature", "h": "三、温度到底是什么", "body": "在这个图景里，温度不是神秘的属性，而是分子平均动能的度量：越热，分子平均跑得越快。",
         "figalt": "温度与平均动能", "figcap": "“热”翻译成大白话，就是“分子跑得更猛”。"},
        {"id": "statistical", "h": "四、统计规律的威力", "body": "单个分子撞向哪完全随机，但亿万个加起来却稳稳服从分布律。这种“个体随机、整体确定”的思想，开启了统计物理。",
         "figalt": "统计的确定性", "figcap": "乱成一锅粥，整体却有它自己的秩序。"}
      ]
    },
    "rings": {
      "title": "土星环：为什么不会散？",
      "file": "detail/rings.html",
      "claim": "麦克斯韦用数学证明：土星环若要稳定，必须是由无数小颗粒组成，而不是一整块实心环。",
      "tags": ["土星环", "稳定性", "力学"],
      "year": "1859",
      "card": "一道力学难题，被他用数学漂亮地收了尾。",
      "scene": "orbit",
      "scene_params": {"label": "环上的小颗粒各自绕土星运行"},
      "remember": "一句话记住：他还没看见颗粒，却先用数学“算”出了颗粒的存在。",
      "sideterms": ["saturn-ring", "stability", "newton", "angular-momentum"],
      "sections": [
        {"id": "puzzle", "h": "一、一个力学难题", "body": "土星外圈那圈漂亮的光环，到底是实心的一块，还是无数碎块？19 世纪的天文学家为此争论不休。",
         "fig": "rings", "figalt": "土星环之谜", "figcap": "看着像一圈，本质却是个问号。"},
        {"id": "stable", "h": "二、稳定轨道的分布", "body": "麦克斯韦分析：若是一整块刚性环，引力与离心力很难处处平衡，极易崩塌；只有分成许多独立小颗粒，各自按轨道运行才稳定。",
         "figalt": "颗粒的稳定性", "figcap": "化整为零，反而稳得住。"},
        {"id": "math", "h": "三、数学的胜利", "body": "他写下长长的力学计算，证明实心环在动力学上站不住脚。后来的观测（尤其旅行者号）证实了：环确实由冰与岩的碎粒组成。",
         "figalt": "理论与观测吻合", "figcap": "先有算式，后有照片——数学赢了。"},
        {"id": "legacy", "h": "四、更大的意义", "body": "这道题展示了麦克斯韦的本事：把现实难题翻译成方程，让数学替你下结论。这种“以算代猜”的风格，贯穿了他的全部工作。",
         "figalt": "以算代猜", "figcap": "不是凭感觉，而是让方程说话。"}
      ]
    }
  },

  "terms": {
    "maxwell-eq": {"name": "麦克斯韦方程组", "cat": "电磁", "short": "统一电磁与光的四个方程", "plain": "麦克斯韦方程组由四个方程组成，分别描述电荷生电场、磁单极不存在、变化的磁场生电场、变化的电场生磁场。它们统一了电、磁、光。", "analogy": "像四句歌词，合起来唱出了一整首电磁的交响曲。", "page": "equations", "anchor": "#before", "related": ["em-field", "displacement-current", "faraday", "light-speed"]},
    "em-field": {"name": "电磁场", "cat": "电磁", "short": "看不见却处处有力的“场”", "plain": "场是分布在空间里的物理量。电磁场把电荷、磁体之间的联系，从“隔空作用”变成了“通过场传递”。", "analogy": "磁场像一圈圈看不见的波纹，磁铁把“波纹”铺在了周围。", "page": "equations", "anchor": "#couple", "related": ["field-concept", "faraday", "displacement-current"]},
    "displacement-current": {"name": "位移电流", "cat": "电磁", "short": "变化的电场也能生磁", "plain": "麦克斯韦提出：即使没有真实电荷流动，变化的电场也等效于一种“电流”，同样能产生磁场。这一项让方程组自洽，也直接催生电磁波。", "analogy": "好比电场在“流动”，虽然没有电线里的电子在跑。", "page": "equations", "anchor": "#displacement", "related": ["maxwell-eq", "em-field"]},
    "faraday": {"name": "法拉第", "cat": "历史", "short": "把磁力线画进物理的人", "plain": "英国科学家法拉第用“力线”直观描述电场与磁场，并发现电磁感应。麦克斯韦把他这些图像化的想法，翻译成了严格的数学。", "analogy": "法拉第画出草图，麦克斯韦把它变成了工程图纸。", "page": "equations", "anchor": "#before", "related": ["electromagnetic-induction", "em-field", "maxwell-eq"]},
    "unification": {"name": "统一", "cat": "方法", "short": "把不同的现象归到一个理论", "plain": "统一指用同一个理论解释原本看似无关的现象。麦克斯韦把电、磁、光统一进方程组，是物理学“大一统”传统的典范。", "analogy": "本来是三把不同的锁，被同一把钥匙打开了。", "page": "equations", "anchor": "#why", "related": ["maxwell-eq", "em-wave"]},
    "electromagnetic-induction": {"name": "电磁感应", "cat": "电磁", "short": "变化的磁场生电场", "plain": "法拉第发现：磁场变化时，附近导体里会出现电动势（感应电流）。这是发电机的原理，也是麦克斯韦方程组的一条。", "analogy": "磁铁“晃一晃”，电线里就被“推”出电流。", "page": "equations", "anchor": "#before", "related": ["faraday", "em-field"]},
    "field-concept": {"name": "场", "cat": "电磁", "short": "空间里每点都有值", "plain": "场是分布在空间中的物理量（如温度场、引力场、电磁场）。它让“作用如何通过虚空传递”有了清晰的描述。", "analogy": "房间里每一点都有温度，电磁场就是空间每点的“电磁温度”。", "page": "equations", "anchor": "#couple", "related": ["em-field", "newton"]},
    "em-wave": {"name": "电磁波", "cat": "电磁", "short": "电场磁场结伴传播的波", "plain": "变化的电场生磁场、变化的磁场再生电场，二者互相推着向前，便形成以光速传播的电磁波。光、无线电都是它。", "analogy": "电场和磁场像两个人轮流推秋千，越推越远，传向四方。", "page": "light", "anchor": "#islight", "related": ["maxwell-eq", "light-speed", "spectrum"]},
    "light-speed": {"name": "光速", "cat": "物理", "short": "约每秒 30 万公里", "plain": "光速 c≈3.0×10⁸ m/s，是电磁波在真空中的传播速度。麦克斯韦方程给出的波速恰好等于它，从而认出光是电磁波。", "analogy": "宇宙给信息设了一条“最高限速”，光正好跑在这条线上。", "page": "light", "anchor": "#speed", "related": ["em-wave", "maxwell-eq"]},
    "hertz": {"name": "赫兹", "cat": "历史", "short": "第一个抓住电磁波的人", "plain": "德国物理学家赫兹在 1887 年用实验产生并检测到无线电波，证实了麦克斯韦的电磁波预言。频率单位“赫兹”以他命名。", "analogy": "麦克斯韦在纸上算出有只“看不见的鸟”，赫兹真的把它抓进了笼子。", "page": "light", "anchor": "#hertz", "related": ["em-wave", "spectrum"]},
    "spectrum": {"name": "电磁波谱", "cat": "电磁", "short": "从无线电到 γ 射线", "plain": "电磁波按频率（或波长）排成一列，就是波谱：无线电、微波、红外、可见光、紫外、X 光、γ 射线——本质相同，只是频率不同。", "analogy": "同一类乐器，音高不同就成了不同的曲子。", "page": "light", "anchor": "#spectrum", "related": ["em-wave", "light-speed"]},
    "kinetic-theory": {"name": "气体动理论", "cat": "物理", "short": "气体是乱窜的分子群", "plain": "气体动理论认为气体由大量做无规则热运动的分子组成，压强、温度等宏观性质来自分子的集体统计行为。", "analogy": "气球不是“气”的一团糊，而是亿万小球在疯狂撞墙。", "page": "gas", "anchor": "#molecules", "related": ["molecule", "maxwell-boltzmann", "temperature"]},
    "maxwell-boltzmann": {"name": "麦克斯韦—玻尔兹曼分布", "cat": "物理", "short": "分子速率的钟形分布", "plain": "在平衡态下，气体分子的速率服从一条钟形分布：多数居中，特别快和特别慢的都少。它刻画了“乱中自有比例”。", "analogy": "全班跑步，大多数人速度中等，飞快和极慢的都是少数。", "page": "gas", "anchor": "#distribution", "related": ["kinetic-theory", "temperature", "statistical"]},
    "molecule": {"name": "分子", "cat": "物理", "short": "保持物质性质的最小粒", "plain": "分子是由原子构成的、能保持物质化学性质的最小微粒。气体动理论把气体看成大量分子的群体。", "analogy": "一滴水再分下去，分到“水分子”这级，就还是水；再分就不是水了。", "page": "gas", "anchor": "#molecules", "related": ["kinetic-theory", "temperature"]},
    "temperature": {"name": "温度", "cat": "物理", "short": "分子平均动能的尺", "plain": "在分子图景里，温度反映分子运动的平均剧烈程度：越热，分子平均动能越大、跑得越快。", "analogy": "“热”翻译成大白话，就是“粒子跑得更猛”。", "page": "gas", "anchor": "#temperature", "related": ["kinetic-theory", "molecule"]},
    "statistical": {"name": "统计规律", "cat": "方法", "short": "个体随机、整体确定", "plain": "统计规律描述大量随机个体合起来的稳定行为（如分布律）。物理学中宏观量往往是微观随机运动的统计平均。", "analogy": "单个人买彩票全凭运气，但一亿人里中奖人数却很稳定。", "page": "gas", "anchor": "#statistical", "related": ["maxwell-boltzmann", "kinetic-theory"]},
    "saturn-ring": {"name": "土星环", "cat": "物理", "short": "由碎粒组成的光环", "plain": "土星环是绕土星运行的无数冰与岩碎粒。麦克斯韦先于观测，用数学证明它必须是碎粒集合才能稳定。", "analogy": "看着像一整圈，其实是无数小石子排队绕圈。", "page": "rings", "anchor": "#puzzle", "related": ["stability", "newton", "angular-momentum"]},
    "stability": {"name": "稳定性", "cat": "方法", "short": "受扰后仍回正轨", "plain": "稳定性指系统在微小扰动后能否保持或回到原有状态。麦克斯韦用稳定性分析判定实心环会崩塌、碎粒环才站得住。", "analogy": "不倒翁晃一晃又立直，就是稳；一推就倒，就是不稳。", "page": "rings", "anchor": "#stable", "related": ["saturn-ring", "newton"]},
    "newton": {"name": "牛顿", "cat": "历史", "short": "经典力学与引力之父", "plain": "牛顿建立运动三定律与万有引力，是经典物理的基石。麦克斯韦的电磁与力学都站在牛顿框架之上，又把它推向新高度。", "analogy": "牛顿铺好了地基，麦克斯韦在上面盖起了电磁的大厦。", "page": "rings", "anchor": "#math", "related": ["field-concept", "stability"]},
    "angular-momentum": {"name": "角动量", "cat": "物理", "short": "转动里的“动量守恒”", "plain": "角动量描述物体转动的状态，在无外力矩时守恒。它帮助理解行星、环上颗粒为何能稳定绕行。", "analogy": "花样滑冰收手臂转更快，就是角动量守恒在生活里露脸。", "page": "rings", "anchor": "#stable", "related": ["saturn-ring", "newton"]},
    "color-photography": {"name": "彩色摄影", "cat": "历史", "short": "用三原色叠出彩色", "plain": "麦克斯韦 1861 年用红、绿、蓝三张滤光底片叠合，做出了最早的真彩照片（一条格子 ribbon）。这是三原色原理的早期胜利。", "analogy": "像用红绿蓝三盏灯，调出了世间所有颜色。", "page": "light", "anchor": "#spectrum", "related": ["spectrum", "hertz"]},
    "vector-calculus": {"name": "矢量与场论数学", "cat": "方法", "short": "描述场的数学工具", "plain": "麦克斯韦方程组依赖矢量分析（散度、旋度、梯度）来表达场的空间变化。这套数学让“场”得以被精确书写。", "analogy": "场是画在空中的画，矢量数学是画它用的笔法。", "page": "equations", "anchor": "#why", "related": ["em-field", "unification"]}
  },

  "timeline": [
    {"year": 1831, "id": "born", "title": "生于爱丁堡", "img": "maxwell-portrait.jpg", "alt": "麦克斯韦肖像", "fig": "麦克斯韦 1831 年生于苏格兰爱丁堡。", "body": "6 月 13 日，詹姆斯·克拉克·麦克斯韦出生。他自幼好奇，爱自己动手做实验。"},
    {"year": 1847, "id": "edinburgh", "title": "爱丁堡大学", "img": "edinburgh.jpg", "alt": "爱丁堡", "fig": "在爱丁堡打下数理底子。", "body": "进入爱丁堡大学，早早展现出数学与实验天赋，开始独立思考自然规律。"},
    {"year": 1850, "id": "cambridge", "title": "剑桥求学", "img": "cambridge.jpg", "alt": "剑桥", "fig": "转入剑桥，跻身顶尖数学圈。", "body": "到剑桥大学深造，获数学荣誉，结识一批一流的物理学与数学头脑。"},
    {"year": 1859, "id": "rings", "title": "土星环论文", "img": "saturn-rings.jpg", "alt": "土星环", "fig": "证明环是碎粒组成。", "body": "发表土星环稳定性研究，用数学证明环只能由无数小颗粒构成，获亚当斯奖。"},
    {"year": 1860, "id": "gas", "title": "气体动理论", "img": "kinetic-theory.jpg", "alt": "分子运动", "fig": "给出分子速率分布。", "body": "他提出气体分子速率分布律，开创统计物理，把“随机”与“确定”第一次拴在一起。"},
    {"year": 1861, "id": "eq1", "title": "方程组初成", "img": "maxwell-equations.jpg", "alt": "麦克斯韦方程组", "fig": "把电磁写成一组方程。", "body": "他发表早期论文，把电、磁、感应的规律收纳进统一的方程框架。"},
    {"year": 1861, "id": "color", "title": "彩色摄影实验", "img": "color-photography.jpg", "alt": "最早的彩色照片", "fig": "用三原色叠出彩色。", "body": "他根据自己 1855 年提出的三原色理论，用红、绿、蓝三张滤光底片叠合，演示出世界上第一张彩色照片。"},
    {"year": 1865, "id": "eq2", "title": "预言电磁波与光速", "img": "em-wave.jpg", "alt": "电磁波", "fig": "光就是电磁波。", "body": "他完善方程组，推出电磁扰动以光速传播，断言光本身是一种电磁波——惊动整个物理学。"},
    {"year": 1871, "id": "cavendish", "title": "执掌卡文迪许实验室", "img": "cavendish.jpg", "alt": "卡文迪许实验室", "fig": "建立顶尖实验物理阵地。", "body": "出任剑桥卡文迪许实验室首任主任，把英国实验物理带上新高度。"},
    {"year": 1873, "id": "treatise", "title": "《电磁通论》", "img": "maxwell-equations.jpg", "alt": "电磁通论", "fig": "集大成的电磁巨著。", "body": "出版《电磁通论》，系统陈述电磁场理论，成为后世电磁学的标准教科书。"},
    {"year": 1879, "id": "died", "title": "逝于剑桥", "img": "maxwell-portrait.jpg", "alt": "麦克斯韦", "fig": "电磁学统一者落幕。", "body": "11 月 5 日，麦克斯韦病逝，年仅 48 岁。他留下的方程，点亮了整个电气时代。"}
  ],

  "images": [
    {"file": "maxwell-portrait.jpg", "wiki": "File:James Clerk Maxwell.png", "q": "James Clerk Maxwell portrait", "desc": "麦克斯韦肖像", "author": "Public domain", "license": "Public domain"},
    {"file": "edinburgh.jpg", "wiki": "File:Edinburgh from the north.jpg", "q": "Edinburgh city Scotland", "desc": "爱丁堡", "author": "Public domain", "license": "Public domain"},
    {"file": "cambridge.jpg", "wiki": "File:Cambridge King's College chapel.jpg", "q": "Cambridge University King's College", "desc": "剑桥", "author": "Public domain", "license": "Public domain"},
    {"file": "faraday.jpg", "wiki": "File:Michael Faraday.jpg", "q": "Michael Faraday portrait", "desc": "法拉第", "author": "Public domain", "license": "Public domain"},
    {"file": "maxwell-equations.jpg", "wiki": "File:Maxwell's equations.svg", "q": "Maxwell equations blackboard", "desc": "麦克斯韦方程组", "author": "Public domain", "license": "Public domain"},
    {"file": "em-wave.jpg", "wiki": "File:Onde electromagnetique.svg", "q": "electromagnetic wave diagram", "desc": "电磁波", "author": "Public domain", "license": "Public domain"},
    {"file": "kinetic-theory.jpg", "wiki": "File:Translational motion.gif", "q": "gas molecules kinetic theory animation", "desc": "分子运动", "author": "Public domain", "license": "Public domain"},
    {"file": "maxwell-boltzmann.jpg", "wiki": "File:Maxwell-Boltzmann distribution.svg", "q": "Maxwell-Boltzmann distribution", "desc": "速率分布", "author": "Public domain", "license": "Public domain"},
    {"file": "saturn-rings.jpg", "wiki": "File:Saturn during equinox.jpg", "q": "Saturn rings Cassini", "desc": "土星环", "author": "Public domain", "license": "Public domain"},
    {"file": "color-photography.jpg", "wiki": "File:Tartan ribbon.jpg", "q": "Maxwell first color photograph tartan", "desc": "最早的彩色照片", "author": "Public domain", "license": "Public domain"},
    {"file": "cavendish.jpg", "wiki": "File:Cavendish Laboratory.jpg", "q": "Cavendish Laboratory Cambridge", "desc": "卡文迪许实验室", "author": "Public domain", "license": "Public domain"}
  ],

  "labs": [
    {"key": "field", "kind": "field", "icon": "🔗", "title": "电磁场：看不见的力线",
     "intro": "拖动“场强”，看两根带电棒之间的力线如何变密变疏。",
     "desc": "场越强，力线越密——这就是“场”的直观图像。",
     "ctrl": [{"name": "strength", "label": "场强", "min": 0.3, "max": 1.8, "value": 1, "step": 0.1, "init": "1.0"}],
     "params": {"label": "两根带电棒之间的力线：看不见，却处处有力"}},
    {"key": "wave", "kind": "wave", "icon": "🌊", "title": "电磁波：振荡着向前传",
     "intro": "拖动“频率”与“振幅”，看电场与磁场如何结伴向前传播。",
     "desc": "频率越高、波长越短——这正是整条电磁波谱的来历。",
     "ctrl": [{"name": "freq", "label": "频率", "min": 0.3, "max": 2, "value": 1, "step": 0.1, "init": "1.0"}, {"name": "amp", "label": "振幅", "min": 0.4, "max": 1.6, "value": 1, "step": 0.1, "init": "1.0"}],
     "params": {"label": "电场与磁场互相推着，向前传成电磁波"}},
    {"key": "speed", "kind": "graph", "icon": "📊", "title": "分子速率分布：钟形的一群",
     "intro": "拖动“加热”，看分子速率的钟形分布如何整体右移、变宽。",
     "desc": "温度越高，分子平均跑得越快，快慢差距也越大。",
     "ctrl": [{"name": "param1", "label": "温度", "min": 0.3, "max": 1.8, "value": 1, "step": 0.1, "init": "1.0"}, {"name": "param2", "label": "展宽", "min": 0.6, "max": 2, "value": 1, "step": 0.1, "init": "1.0"}],
     "params": {"expr": "gauss", "label": "分子速率分布随温度整体右移（示意）"}}
  ]
}


if __name__ == "__main__":
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "spec_maxwell.json")
    json.dump(SPEC, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print("wrote", out)
