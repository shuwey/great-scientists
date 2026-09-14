/* 《读懂费曼》术语数据库（引擎通用：SITE_TERMS/SITE_PAGES/SITE_CATS） */
window.SITE_TERMS = {
  "qed": {
    name: "量子电动力学",
    cat: "物理",
    short: "光与带电粒子的理论",
    plain: "量子电动力学（QED）是描述光（电磁场）与带电粒子如何相互作用的量子理论。它的预言与实验吻合到极高精度，是最精确的物理理论之一。",
    analogy: "一本算得极准的“光与电子的账本”。",
    page: "qed", anchor: "#problem",
    related: ["photon", "electron", "feynman-diagram"]
  },
  "photon": {
    name: "光子",
    cat: "物理",
    short: "光的量子",
    plain: "光子是电磁相互作用的基本量子，也就是“一份光”。在 QED 里，带电粒子之间的电磁力正是通过交换光子实现的。",
    analogy: "像是被扔来扔去的一个球。",
    page: "qed", anchor: "#photon",
    related: ["qed", "electron", "virtual-particle"]
  },
  "electron": {
    name: "电子",
    cat: "物理",
    short: "带负电的基本粒子",
    plain: "电子是带一个单位负电荷的基本粒子，是原子结构与电流的主角。它与光子的相互作用正是 QED 研究的核心。",
    analogy: "原子里跑得最欢的那一个。",
    page: "qed", anchor: "#photon",
    related: ["photon", "qed", "positron"]
  },
  "coupling": {
    name: "耦合常数",
    cat: "物理",
    short: "相互作用有多强",
    plain: "耦合常数衡量一种相互作用有多强。电磁相互作用的强度由精细结构常数（约 1/137）刻画，它也是费曼图逐级展开的小参数。",
    analogy: "像是握手力气的大小。",
    page: "qed", anchor: "#coupling",
    related: ["qed", "feynman-diagram"]
  },
  "path-integral": {
    name: "路径积分",
    cat: "量子",
    short: "所有路径求和",
    plain: "路径积分是费曼提出的量子力学表述：粒子从 A 到 B 的概率幅，等于所有可能路径贡献的概率幅之和，每条路径的权重由其作用量决定。",
    analogy: "不是选一条路，而是把每条路都走一遍。",
    page: "path", anchor: "#idea",
    related: ["amplitude", "action", "uncertainty"]
  },
  "amplitude": {
    name: "概率幅",
    cat: "量子",
    short: "要先加、再平方的量",
    plain: "概率幅是一个复数（可画成小箭头）。量子力学先对所有路径的概率幅求和，再取平方得到概率——这正是干涉现象的来源。",
    analogy: "先排好队再一起算，而不是各算各的。",
    page: "path", anchor: "#amplitude",
    related: ["path-integral", "interference"]
  },
  "action": {
    name: "作用量",
    cat: "量子",
    short: "给每条路径打的分",
    plain: "作用量是判断一条路径“代价”的量。在路径积分中，它决定该路径概率幅的相位；作用量取极值的路径就是经典路径。",
    analogy: "像给每条路记一笔“路程费”。",
    page: "path", anchor: "#classical",
    related: ["path-integral", "amplitude"]
  },
  "uncertainty": {
    name: "不确定性原理",
    cat: "量子",
    short: "位置与动量不能同时精确",
    plain: "不确定性原理指出，粒子的位置与动量无法同时被精确确定。这正是“所有路径都要考虑”的深层原因：粒子没有一条确定的轨道。",
    analogy: "你说得越准它在哪，就越说不准它往哪去。",
    page: "path", anchor: "#idea",
    related: ["path-integral", "amplitude"]
  },
  "interference": {
    name: "干涉",
    cat: "量子",
    short: "概率幅的相加相消",
    plain: "干涉指概率幅叠加时出现的加强与抵消。双缝实验中电子的落点分布，正是不同路径的概率幅互相干涉的结果。",
    analogy: "两队人马，有时凑成一支，有时散成一地。",
    page: "path", anchor: "#amplitude",
    related: ["amplitude", "path-integral"]
  },
  "feynman-diagram": {
    name: "费曼图",
    cat: "方法",
    short: "把算式画成图",
    plain: "费曼图是用线条与顶点表示粒子相互作用过程的图：线代表粒子传播，顶点代表相互作用。它对应一套严格的规则，可以照图写出积分式。",
    analogy: "物理界的流程图。",
    page: "diagram", anchor: "#draw",
    related: ["vertex", "virtual-particle", "qed"]
  },
  "vertex": {
    name: "顶点",
    cat: "方法",
    short: "图上发生相互作用的点",
    plain: "在费曼图中，顶点代表一次相互作用发生的位置，每个顶点对应一个耦合常数因子与守恒律约束。",
    analogy: "图上那个“握手”的瞬间。",
    page: "diagram", anchor: "#rules",
    related: ["feynman-diagram", "coupling"]
  },
  "virtual-particle": {
    name: "虚粒子",
    cat: "量子",
    short: "不能直接看见的中间粒子",
    plain: "虚粒子是费曼图内部线上交换的粒子，不能被直接探测到，它只在计算过程中出现，是相互作用的中介。",
    analogy: "像递东西时那只一闪而过的手。",
    page: "diagram", anchor: "#loop",
    related: ["feynman-diagram", "photon"]
  },
  "positron": {
    name: "正电子",
    cat: "量子",
    short: "电子的反粒子",
    plain: "正电子是电子的反粒子，带正电。费曼受老师惠勒启发，提出过一个著名图像：正电子可以看作在时间中逆行的电子。",
    analogy: "像是倒着放的那一段影片。",
    page: "diagram", anchor: "#rules",
    related: ["electron", "feynman-diagram"]
  },
  "renormalization": {
    name: "重整化",
    cat: "物理",
    short: "把无穷大收拾干净",
    plain: "重整化是一套处理计算中出现的无穷大的方法，通过重新定义质量与电荷等参量，得到有限的、可与实验比较的结果。它是 QED 成功的关键一步。",
    analogy: "把爆掉的数字，重新校准成能用的尺子。",
    page: "qed", anchor: "#test",
    related: ["qed", "feynman-diagram"]
  },
  "superfluid": {
    name: "超流体",
    cat: "物理",
    short: "没有黏性的液体",
    plain: "超流体是低温下失去全部黏性、可以无阻力流动的量子液体。费曼在 1950 年代对液氦超流给出了重要的微观解释。",
    analogy: "倒进杯子里，能自己爬出来。",
    page: "qed", anchor: "#test",
    related: ["qed", "feynman"]
  },
  "nanotech": {
    name: "纳米技术",
    cat: "方法",
    short: "在原子尺度上造东西",
    plain: "纳米技术是在纳米尺度操纵物质的技术。费曼 1959 年的演讲《底下还有很大空间》被视为这一领域最早的思想源头。",
    analogy: "把零件做到原子那么小。",
    page: "teacher", anchor: "#nano",
    related: ["feynman", "popular-science"]
  },
  "challenger": {
    name: "挑战者号",
    cat: "历史",
    short: "一杯冰水找出的真相",
    plain: "1986 年美国航天飞机挑战者号升空后爆炸，七名航天员牺牲。费曼作为调查委员，用冰水演示 O 形环在低温下失去弹性，指出了事故的直接原因。",
    analogy: "最朴素的一次演示，最有力的一份证词。",
    page: "teacher", anchor: "#challenger",
    related: ["feynman", "popular-science"]
  },
  "lectures": {
    name: "《费曼物理学讲义》",
    cat: "科普",
    short: "给大一新生讲的名著",
    plain: "《费曼物理学讲义》是费曼 1961 年起在加州理工为本科生讲授物理的记录，共三卷。它不堆公式，而是讲物理是怎么想出来的。",
    analogy: "一本讲思路，而不是讲题型的物理书。",
    page: "teacher", anchor: "#lectures",
    related: ["popular-science", "feynman"]
  },
  "popular-science": {
    name: "科学普及",
    cat: "科普",
    short: "把专业讲给大众",
    plain: "科学普及是把专业研究用通俗方式讲给公众。法拉第开创的这一传统，在费曼、霍金手里被推向新的高度。",
    analogy: "把实验室的话，翻译成街头的话。",
    page: "teacher", anchor: "#attitude",
    related: ["lectures", "challenger"]
  },
  "bohr": {
    name: "玻尔",
    cat: "历史",
    short: "哥本哈根那一派",
    plain: "尼尔斯·玻尔提出原子结构与互补性原理，是量子力学哥本哈根解释的代表人物。费曼的路径积分给出的是同一套物理的另一种讲法。",
    analogy: "同一座山，两条不同的上山路。",
    page: "path", anchor: "#equivalent",
    related: ["path-integral", "uncertainty"]
  },
  "feynman": {
    name: "费曼",
    cat: "历史",
    short: "量子世界的画师",
    plain: "理查德·费曼是美国理论物理学家，提出路径积分与费曼图，因量子电动力学获 1965 年诺贝尔物理学奖，同时也是二十世纪最著名的科学传播者之一。",
    analogy: "他把最难的物理，画成了最好懂的图。",
    page: "qed", anchor: "#photon",
    related: ["qed", "feynman-diagram", "path-integral"]
  }
};

window.SITE_PAGES = {
  "qed": { title: "量子电动力学：光与电子怎么打交道", url: "detail/qed.html" },
  "path": { title: "路径积分：粒子把每一条路都走一遍", url: "detail/path.html" },
  "diagram": { title: "费曼图：把一整页算式画成一张画", url: "detail/diagram.html" },
  "teacher": { title: "讲台上的费曼：讲义、冰水与好奇心", url: "detail/teacher.html" }
};

window.SITE_CATS = ["物理", "量子", "方法", "历史", "科普"];