/* 《读懂麦克斯韦》术语数据库（引擎通用：SITE_TERMS/SITE_PAGES/SITE_CATS） */
window.SITE_TERMS = {
  "maxwell-eq": {
    name: "麦克斯韦方程组",
    cat: "电磁",
    short: "统一电磁与光的四个方程",
    plain: "麦克斯韦方程组由四个方程组成，分别描述电荷生电场、磁单极不存在、变化的磁场生电场、变化的电场生磁场。它们统一了电、磁、光。",
    analogy: "像四句歌词，合起来唱出了一整首电磁的交响曲。",
    page: "equations", anchor: "#before",
    related: ["em-field", "displacement-current", "faraday", "light-speed"]
  },
  "em-field": {
    name: "电磁场",
    cat: "电磁",
    short: "看不见却处处有力的“场”",
    plain: "场是分布在空间里的物理量。电磁场把电荷、磁体之间的联系，从“隔空作用”变成了“通过场传递”。",
    analogy: "磁场像一圈圈看不见的波纹，磁铁把“波纹”铺在了周围。",
    page: "equations", anchor: "#couple",
    related: ["field-concept", "faraday", "displacement-current"]
  },
  "displacement-current": {
    name: "位移电流",
    cat: "电磁",
    short: "变化的电场也能生磁",
    plain: "麦克斯韦提出：即使没有真实电荷流动，变化的电场也等效于一种“电流”，同样能产生磁场。这一项让方程组自洽，也直接催生电磁波。",
    analogy: "好比电场在“流动”，虽然没有电线里的电子在跑。",
    page: "equations", anchor: "#displacement",
    related: ["maxwell-eq", "em-field"]
  },
  "faraday": {
    name: "法拉第",
    cat: "历史",
    short: "把磁力线画进物理的人",
    plain: "英国科学家法拉第用“力线”直观描述电场与磁场，并发现电磁感应。麦克斯韦把他这些图像化的想法，翻译成了严格的数学。",
    analogy: "法拉第画出草图，麦克斯韦把它变成了工程图纸。",
    page: "equations", anchor: "#before",
    related: ["electromagnetic-induction", "em-field", "maxwell-eq"]
  },
  "unification": {
    name: "统一",
    cat: "方法",
    short: "把不同的现象归到一个理论",
    plain: "统一指用同一个理论解释原本看似无关的现象。麦克斯韦把电、磁、光统一进方程组，是物理学“大一统”传统的典范。",
    analogy: "本来是三把不同的锁，被同一把钥匙打开了。",
    page: "equations", anchor: "#why",
    related: ["maxwell-eq", "em-wave"]
  },
  "electromagnetic-induction": {
    name: "电磁感应",
    cat: "电磁",
    short: "变化的磁场生电场",
    plain: "法拉第发现：磁场变化时，附近导体里会出现电动势（感应电流）。这是发电机的原理，也是麦克斯韦方程组的一条。",
    analogy: "磁铁“晃一晃”，电线里就被“推”出电流。",
    page: "equations", anchor: "#before",
    related: ["faraday", "em-field"]
  },
  "field-concept": {
    name: "场",
    cat: "电磁",
    short: "空间里每点都有值",
    plain: "场是分布在空间中的物理量（如温度场、引力场、电磁场）。它让“作用如何通过虚空传递”有了清晰的描述。",
    analogy: "房间里每一点都有温度，电磁场就是空间每点的“电磁温度”。",
    page: "equations", anchor: "#couple",
    related: ["em-field", "newton"]
  },
  "em-wave": {
    name: "电磁波",
    cat: "电磁",
    short: "电场磁场结伴传播的波",
    plain: "变化的电场生磁场、变化的磁场再生电场，二者互相推着向前，便形成以光速传播的电磁波。光、无线电都是它。",
    analogy: "电场和磁场像两个人轮流推秋千，越推越远，传向四方。",
    page: "light", anchor: "#islight",
    related: ["maxwell-eq", "light-speed", "spectrum"]
  },
  "light-speed": {
    name: "光速",
    cat: "物理",
    short: "约每秒 30 万公里",
    plain: "光速 c≈3.0×10⁸ m/s，是电磁波在真空中的传播速度。麦克斯韦方程给出的波速恰好等于它，从而认出光是电磁波。",
    analogy: "宇宙给信息设了一条“最高限速”，光正好跑在这条线上。",
    page: "light", anchor: "#speed",
    related: ["em-wave", "maxwell-eq"]
  },
  "hertz": {
    name: "赫兹",
    cat: "历史",
    short: "第一个抓住电磁波的人",
    plain: "德国物理学家赫兹在 1887 年用实验产生并检测到无线电波，证实了麦克斯韦的电磁波预言。频率单位“赫兹”以他命名。",
    analogy: "麦克斯韦在纸上算出有只“看不见的鸟”，赫兹真的把它抓进了笼子。",
    page: "light", anchor: "#hertz",
    related: ["em-wave", "spectrum"]
  },
  "spectrum": {
    name: "电磁波谱",
    cat: "电磁",
    short: "从无线电到 γ 射线",
    plain: "电磁波按频率（或波长）排成一列，就是波谱：无线电、微波、红外、可见光、紫外、X 光、γ 射线——本质相同，只是频率不同。",
    analogy: "同一类乐器，音高不同就成了不同的曲子。",
    page: "light", anchor: "#spectrum",
    related: ["em-wave", "light-speed"]
  },
  "kinetic-theory": {
    name: "气体动理论",
    cat: "物理",
    short: "气体是乱窜的分子群",
    plain: "气体动理论认为气体由大量做无规则热运动的分子组成，压强、温度等宏观性质来自分子的集体统计行为。",
    analogy: "气球不是“气”的一团糊，而是亿万小球在疯狂撞墙。",
    page: "gas", anchor: "#molecules",
    related: ["molecule", "maxwell-boltzmann", "temperature"]
  },
  "maxwell-boltzmann": {
    name: "麦克斯韦—玻尔兹曼分布",
    cat: "物理",
    short: "分子速率的钟形分布",
    plain: "在平衡态下，气体分子的速率服从一条钟形分布：多数居中，特别快和特别慢的都少。它刻画了“乱中自有比例”。",
    analogy: "全班跑步，大多数人速度中等，飞快和极慢的都是少数。",
    page: "gas", anchor: "#distribution",
    related: ["kinetic-theory", "temperature", "statistical"]
  },
  "molecule": {
    name: "分子",
    cat: "物理",
    short: "保持物质性质的最小粒",
    plain: "分子是由原子构成的、能保持物质化学性质的最小微粒。气体动理论把气体看成大量分子的群体。",
    analogy: "一滴水再分下去，分到“水分子”这级，就还是水；再分就不是水了。",
    page: "gas", anchor: "#molecules",
    related: ["kinetic-theory", "temperature"]
  },
  "temperature": {
    name: "温度",
    cat: "物理",
    short: "分子平均动能的尺",
    plain: "在分子图景里，温度反映分子运动的平均剧烈程度：越热，分子平均动能越大、跑得越快。",
    analogy: "“热”翻译成大白话，就是“粒子跑得更猛”。",
    page: "gas", anchor: "#temperature",
    related: ["kinetic-theory", "molecule"]
  },
  "statistical": {
    name: "统计规律",
    cat: "方法",
    short: "个体随机、整体确定",
    plain: "统计规律描述大量随机个体合起来的稳定行为（如分布律）。物理学中宏观量往往是微观随机运动的统计平均。",
    analogy: "单个人买彩票全凭运气，但一亿人里中奖人数却很稳定。",
    page: "gas", anchor: "#statistical",
    related: ["maxwell-boltzmann", "kinetic-theory"]
  },
  "saturn-ring": {
    name: "土星环",
    cat: "物理",
    short: "由碎粒组成的光环",
    plain: "土星环是绕土星运行的无数冰与岩碎粒。麦克斯韦先于观测，用数学证明它必须是碎粒集合才能稳定。",
    analogy: "看着像一整圈，其实是无数小石子排队绕圈。",
    page: "rings", anchor: "#puzzle",
    related: ["stability", "newton", "angular-momentum"]
  },
  "stability": {
    name: "稳定性",
    cat: "方法",
    short: "受扰后仍回正轨",
    plain: "稳定性指系统在微小扰动后能否保持或回到原有状态。麦克斯韦用稳定性分析判定实心环会崩塌、碎粒环才站得住。",
    analogy: "不倒翁晃一晃又立直，就是稳；一推就倒，就是不稳。",
    page: "rings", anchor: "#stable",
    related: ["saturn-ring", "newton"]
  },
  "newton": {
    name: "牛顿",
    cat: "历史",
    short: "经典力学与引力之父",
    plain: "牛顿建立运动三定律与万有引力，是经典物理的基石。麦克斯韦的电磁与力学都站在牛顿框架之上，又把它推向新高度。",
    analogy: "牛顿铺好了地基，麦克斯韦在上面盖起了电磁的大厦。",
    page: "rings", anchor: "#math",
    related: ["field-concept", "stability"]
  },
  "angular-momentum": {
    name: "角动量",
    cat: "物理",
    short: "转动里的“动量守恒”",
    plain: "角动量描述物体转动的状态，在无外力矩时守恒。它帮助理解行星、环上颗粒为何能稳定绕行。",
    analogy: "花样滑冰收手臂转更快，就是角动量守恒在生活里露脸。",
    page: "rings", anchor: "#stable",
    related: ["saturn-ring", "newton"]
  },
  "color-photography": {
    name: "彩色摄影",
    cat: "历史",
    short: "用三原色叠出彩色",
    plain: "麦克斯韦 1861 年用红、绿、蓝三张滤光底片叠合，做出了最早的真彩照片（一条格子 ribbon）。这是三原色原理的早期胜利。",
    analogy: "像用红绿蓝三盏灯，调出了世间所有颜色。",
    page: "light", anchor: "#spectrum",
    related: ["spectrum", "hertz"]
  },
  "vector-calculus": {
    name: "矢量与场论数学",
    cat: "方法",
    short: "描述场的数学工具",
    plain: "麦克斯韦方程组依赖矢量分析（散度、旋度、梯度）来表达场的空间变化。这套数学让“场”得以被精确书写。",
    analogy: "场是画在空中的画，矢量数学是画它用的笔法。",
    page: "equations", anchor: "#why",
    related: ["em-field", "unification"]
  }
};

window.SITE_PAGES = {
  equations: { title: "麦克斯韦方程组：把电、磁、光写成一体", url: "detail/equations.html" },
  light: { title: "光，原来是一种电磁波", url: "detail/light.html" },
  gas: { title: "气体动理论：分子在乱窜", url: "detail/gas.html" },
  rings: { title: "土星环：为什么不会散？", url: "detail/rings.html" }
};

window.SITE_CATS = ["物理", "电磁", "方法", "历史"];