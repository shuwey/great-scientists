/* 《读懂达尔文》术语数据库（引擎通用：SITE_TERMS/SITE_PAGES/SITE_CATS） */
window.SITE_TERMS = {
  "evolution": {
    name: "进化",
    cat: "演化",
    short: "物种随时间逐渐变化",
    plain: "进化指生物种群的特征在世代更替中发生改变。达尔文说明：这种变化是累积的、有方向的，最终造成新类型的产生。",
    analogy: "不是单个生物“变成”另一种，而是整个种群的特征像河流一样慢慢改道。",
    page: "evolution", anchor: "#idea",
    related: ["species", "natural-selection", "common-ancestor"]
  },
  "species": {
    name: "物种",
    cat: "生物",
    short: "能互相繁殖的一群生物",
    plain: "物种通常指能够自然交配并产生可育后代的一群生物。达尔文之前，人们认为物种是固定不变的种类；他证明物种会分化与演变。",
    analogy: "像是自然界里“能互相通婚的家族”，边界并非绝对。",
    page: "evolution", anchor: "#before",
    related: ["evolution", "variation"]
  },
  "common-ancestor": {
    name: "共同祖先",
    cat: "演化",
    short: "亲缘物种追溯到的源头",
    plain: "亲缘相近的物种，若一直向上追溯，会汇向一位更早的共同祖先。这是“生命之树”的核心：枝丫再多，根只有一条。",
    analogy: "表兄弟再不同，往上数总有同一对爷爷奶奶。",
    page: "tree", anchor: "#ancestor",
    related: ["tree-of-life", "evolution"]
  },
  "hms-beagle": {
    name: "小猎犬号",
    cat: "历史",
    short: "达尔文环球航行的船",
    plain: "1831—1836 年，达尔文以随船博物学家的身份搭乘“小猎犬号”环球考察，目睹各地迥异的生物，是进化思想的重要起点。",
    analogy: "这趟五年航行，像是把他送进了一座露天的“世界生物博物馆”。",
    page: "evolution", anchor: "#before",
    related: ["darwin", "galapagos"]
  },
  "origin-of-species": {
    name: "《物种起源》",
    cat: "历史",
    short: "1859 年那本改变世界的书",
    plain: "达尔文 1859 年出版《论借助自然选择（即在生存斗争中保存优良族）的物种起源》，系统提出进化论与自然选择机制。",
    analogy: "相当于给“生命为何如此多样”交了一份有据可查的答卷。",
    page: "evolution", anchor: "#idea",
    related: ["evolution", "natural-selection"]
  },
  "darwin": {
    name: "查尔斯·达尔文",
    cat: "历史",
    short: "进化论的主要提出者",
    plain: "英国博物学家，以贝格尔号航行观察为基础，提出以自然选择为核心的进化论，深刻改变了生物学与人类自我认知。",
    analogy: "他像是把“生物为何这么多样”这个大问题，第一次讲成了可验证的故事。",
    page: "evolution", anchor: "#before",
    related: ["evolution", "wallace"]
  },
  "natural-selection": {
    name: "自然选择",
    cat: "演化",
    short: "环境替差异做筛选",
    plain: "个体有差异、繁殖过剩、资源有限，于是对生存繁殖更有利的特征被更多传给后代，逐代积累成适应。这就是进化的主要机制。",
    analogy: "像一场没有考官的考试：环境悄悄记下了“更合适的”成绩。",
    page: "selection", anchor: "#result",
    related: ["variation", "competition", "fitness"]
  },
  "variation": {
    name: "变异",
    cat: "生物",
    short: "同种个体间的差异",
    plain: "同一物种的个体在形态、生理上总有细微不同，部分差异可遗传。变异是自然选择的“原材料”。",
    analogy: "同一批种子，长出来的苗也高矮不一——这就是变异。",
    page: "selection", anchor: "#variation",
    related: ["natural-selection", "mutation"]
  },
  "competition": {
    name: "生存竞争",
    cat: "演化",
    short: "资源有限下的较量",
    plain: "生物产生的后代常多于环境能承载的数量，于是在食物、空间、配偶上相互竞争。竞争是自然选择的“压力源”。",
    analogy: "一场名额有限的考试，人多座位少，必然有人落选。",
    page: "selection", anchor: "#struggle",
    related: ["natural-selection", "malthus"]
  },
  "fitness": {
    name: "适应度",
    cat: "演化",
    short: "留下后代的能力",
    plain: "在进化里，“适合度”不指身体强壮，而指个体留下可育后代的多寡。适应度高的特征会在种群中变多。",
    analogy: "考试不在乎你多壮，只在乎你最终“晋级”了几个人。",
    page: "selection", anchor: "#struggle",
    related: ["natural-selection", "adaptation"]
  },
  "inheritance": {
    name: "遗传",
    cat: "生物",
    short: "特征传给下一代",
    plain: "父母的部分特征会传给后代，使有利差异得以积累。达尔文时代还不懂基因，却已看出“可遗传”是选择生效的前提。",
    analogy: "好手艺能传给徒弟，才谈得上代代精进。",
    page: "selection", anchor: "#inheritance",
    related: ["variation", "mutation"]
  },
  "malthus": {
    name: "马尔萨斯",
    cat: "历史",
    short: "点醒达尔文的经济学家",
    plain: "马尔萨斯在《人口论》中指出：人口按几何增长、资源按算术增长，必然导致“过剩”。这启发达尔文想到生物界的生存竞争。",
    analogy: "一句“生的多、活的少”，成了进化论的齿轮之一。",
    page: "selection", anchor: "#struggle",
    related: ["competition", "natural-selection"]
  },
  "survival-of-fittest": {
    name: "适者生存",
    cat: "演化",
    short: "更合适的留下更多",
    plain: "这是后人（斯宾塞）对自然选择的概括。准确地说，是“更适应环境的个体留下更多后代”，而非字面“最强者活”。",
    analogy: "不是拳击冠军活下来，而是“最对路”的那位留下更多孩子。",
    page: "selection", anchor: "#result",
    related: ["fitness", "natural-selection"]
  },
  "galapagos": {
    name: "加拉帕戈斯",
    cat: "生物",
    short: "达尔文灵感的群岛",
    plain: "太平洋上的火山群岛，各岛隔离且环境不同。这里的雀鸟、龟类等表现出明显的局部适应，成为进化论的活证据。",
    analogy: "一座座孤岛，像一个个被隔开的小实验室。",
    page: "finches", anchor: "#islands",
    related: ["finch", "biogeography", "hms-beagle"]
  },
  "finch": {
    name: "达尔文雀",
    cat: "生物",
    short: "喙形各异的近亲群",
    plain: "加拉帕戈斯群岛上一群亲缘相近的雀鸟，因岛屿食物不同演化出不同形状的喙。它们不是一种，而是一组“适应故事”的主角。",
    analogy: "同一个家族分住几座岛，各凭本事的“饭碗”长成了不同模样。",
    page: "finches", anchor: "#beaks",
    related: ["beak", "galapagos", "adaptation"]
  },
  "beak": {
    name: "喙",
    cat: "生物",
    short: "鸟的“餐具”也是工具",
    plain: "鸟的喙形对应其食性：尖细的吃虫，粗壮的磕种子。喙的差异是适应不同环境最直观的“简历”。",
    analogy: "喙就像手的形状——干不同活，长不同样。",
    page: "finches", anchor: "#beaks",
    related: ["finch", "adaptation"]
  },
  "biogeography": {
    name: "生物地理",
    cat: "方法",
    short: "生物分布里的线索",
    plain: "研究物种在地球上的分布规律。远离大陆的岛屿常有独特且近缘的特有种，这强烈支持“就地分化”而非“各自被搬来”。",
    analogy: "看谁和谁做邻居，就能猜出它们是不是亲戚。",
    page: "finches", anchor: "#islands",
    related: ["galapagos", "common-ancestor"]
  },
  "adaptation": {
    name: "适应",
    cat: "演化",
    short: "特征与环境的契合",
    plain: "适应指生物的特征与环境需求相契合，如骆驼储水、鸟的喙形配食性。它是自然选择长期积累的结果。",
    analogy: "钥匙磨得久了，就贴合了那把锁。",
    page: "finches", anchor: "#beaks",
    related: ["natural-selection", "fitness"]
  },
  "tree-of-life": {
    name: "生命之树",
    cat: "演化",
    short: "用树比喻亲缘",
    plain: "达尔文用树状图表示：物种像枝丫从共同的根分叉而来，亲缘近的枝丫靠得近。它强调连通，而非“谁高级”。",
    analogy: "不是登顶的梯子，而是同根生出的繁茂枝丫。",
    page: "tree", anchor: "#branching",
    related: ["common-ancestor", "extinction"]
  },
  "extinction": {
    name: "灭绝",
    cat: "演化",
    short: "枝丫的断落",
    plain: "当物种无法适应环境变化，便会消失。灭绝是生命之树上的“断枝”，使树的形态不断被修剪。",
    analogy: "树上有些枝丫枯了，整棵树却因此换了形状。",
    page: "tree", anchor: "#branching",
    related: ["tree-of-life", "natural-selection"]
  },
  "fossil": {
    name: "化石",
    cat: "生物",
    short: "留在石头里的远古生命",
    plain: "化石是古生物的遗体或痕迹，按地层由深到浅记录着生命的更迭，为“生命之树”提供时间维度。",
    analogy: "化石是这棵大树留在地下的年轮。",
    page: "tree", anchor: "#fossils",
    related: ["evolution", "common-ancestor"]
  },
  "homology": {
    name: "同源器官",
    cat: "生物",
    short: "模样不同、来源相同",
    plain: "人的手臂、鲸的鳍、蝙蝠的翼，骨骼结构相似却功能各异，说明它们来自共同祖先的同一结构。这是亲缘关系的铁证。",
    analogy: "同一款零件，装在不同机器上干不同的活。",
    page: "evolution", anchor: "#evidence",
    related: ["common-ancestor", "evolution"]
  },
  "mutation": {
    name: "突变",
    cat: "生物",
    short: "遗传信息的偶然改动",
    plain: "基因在复制时偶尔出错，产生新的变异。现代生物学把突变视为变异的重要来源；达尔文当时尚不知其机制。",
    analogy: "抄作业时偶尔抄错一个字，可能变成新版本。",
    page: "selection", anchor: "#variation",
    related: ["variation", "inheritance"]
  },
  "geology": {
    name: "地质学",
    cat: "方法",
    short: "读懂地球的时间厚度",
    plain: "地质学通过岩层推断地球的漫长历史。达尔文借重它，才敢相信“缓慢变化”足以造就大差异。",
    analogy: "把地球当成一本厚书，一页页都是时间。",
    page: "evolution", anchor: "#evidence",
    related: ["uniformitarianism", "lyell"]
  },
  "lyell": {
    name: "赖尔",
    cat: "历史",
    short: "均变论的代表",
    plain: "地质学家赖尔主张“现在是认识过去的钥匙”：同样缓慢的地质作用，长期积累能塑造巨大变化。这深刻影响了达尔文。",
    analogy: "今天还在发生的小变化，攒久了能改写大山。",
    page: "evolution", anchor: "#evidence",
    related: ["geology", "uniformitarianism"]
  },
  "uniformitarianism": {
    name: "均变论",
    cat: "方法",
    short: "缓慢累积成巨变",
    plain: "均变论认为：今日可见的缓慢自然过程，长期作用足以造成地质与生物的巨大变迁。它是进化论的时间观基础。",
    analogy: "每天挪一毫米，十年也能搬走一座山。",
    page: "evolution", anchor: "#evidence",
    related: ["geology", "lyell"]
  },
  "wallace": {
    name: "华莱士",
    cat: "历史",
    short: "独立想到自然选择的人",
    plain: "阿尔弗雷德·华莱士几乎同时独立提出自然选择学说。正是他 1858 年的来信，促使达尔文尽快发表自己的成果。",
    analogy: "同一个答案，被两个人各自解了出来。",
    page: "evolution", anchor: "#idea",
    related: ["darwin", "natural-selection"]
  },
  "population": {
    name: "种群",
    cat: "生物",
    short: "进化的真正单位",
    plain: "进化发生在种群（一群可交配的个体）层面，而非单个生物。自然选择改变的是种群中特征的频率。",
    analogy: "改的不是某棵树，而是整片林子的平均身高。",
    page: "selection", anchor: "#struggle",
    related: ["natural-selection", "variation"]
  }
};

window.SITE_PAGES = {
  evolution: { title: "进化论：物种也会变", url: "detail/evolution.html" },
  selection: { title: "自然选择：进化的发动机", url: "detail/selection.html" },
  finches: { title: "加拉帕戈斯雀：一枚钥匙", url: "detail/finches.html" },
  tree: { title: "生命之树：我们共享祖先", url: "detail/tree.html" }
};

window.SITE_CATS = ["生物", "演化", "方法", "历史"];