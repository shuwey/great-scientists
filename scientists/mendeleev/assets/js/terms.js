/* 《读懂门捷列夫》术语数据库（引擎通用：SITE_TERMS/SITE_PAGES/SITE_CATS） */
window.SITE_TERMS = {
  "periodic-table": {
    name: "元素周期表",
    cat: "化学",
    short: "给元素排座位的表",
    plain: "元素周期表把元素按原子序数排成行列，性质相近的在同一列。它是化学组织知识的中心工具。",
    analogy: "像给所有元素排了一张大课桌，相似的坐同一排。",
    page: "table", anchor: "#arrange",
    related: ["element", "group", "period", "periodicity"]
  },
  "element": {
    name: "元素",
    cat: "化学",
    short: "由同种原子构成的物质",
    plain: "元素是由一类原子（质子数相同）构成的物质，如氢、氧、铁。化合物则由多种元素组成。",
    analogy: "元素像是化学的“字母”，化合物是用字母拼出的词。",
    page: "table", anchor: "#mess",
    related: ["atomic-number", "periodic-table"]
  },
  "atomic-weight": {
    name: "原子量",
    cat: "化学",
    short: "门捷列夫排序用的尺",
    plain: "原子量是元素原子的平均质量（相对氢或碳）。门捷列夫最初按原子量排表；后来被更准的原子序数取代。",
    analogy: "当年排座位的“身高尺”，后来换成更准的学号。",
    page: "table", anchor: "#arrange",
    related: ["atomic-number", "periodic-table"]
  },
  "atomic-number": {
    name: "原子序数",
    cat: "化学",
    short: "核里质子的个数",
    plain: "原子序数 = 原子核内质子数，决定元素身份和周期表中的位置。莫塞莱证明它才是排列的真正依据。",
    analogy: "每个元素独一无二的“学号”，从小到大排就是周期表。",
    page: "law", anchor: "#atomic-number",
    related: ["element", "atomic-weight", "mosley"]
  },
  "group": {
    name: "族（纵列）",
    cat: "化学",
    short: "同一列的元素一家",
    plain: "周期表的纵列叫族，同族元素最外层电子数相近，化学性质相似（如碱金属、卤素）。",
    analogy: "同一列就是元素的一个“家族”，脾气相近。",
    page: "table", anchor: "#cols",
    related: ["period", "periodic-table", "noble-gas"]
  },
  "period": {
    name: "周期（横行）",
    cat: "化学",
    short: "横着的一行",
    plain: "周期表的横行叫周期，每换一行代表电子多了一层。行数反映了电子壳层数。",
    analogy: "横着的一排，等于给原子多加了一层“外套”。",
    page: "table", anchor: "#cols",
    related: ["group", "electron-shell"]
  },
  "periodicity": {
    name: "周期律",
    cat: "化学",
    short: "性质随位置循环",
    plain: "周期律指元素性质随原子序数呈周期性变化。它是周期表背后的根本规律。",
    analogy: "性质像波浪：上来、下去、又上来，循环往复。",
    page: "law", anchor: "#repeat",
    related: ["property", "periodic-table", "atomic-number"]
  },
  "property": {
    name: "元素性质",
    cat: "化学",
    short: "元素的“脾气”",
    plain: "元素性质包括原子半径、化合价、密度趋势、反应性等。周期律描述这些性质如何随位置变化。",
    analogy: "每个元素有自己的“性格”，位置能大致推测性格。",
    page: "law", anchor: "#repeat",
    related: ["periodicity", "atomic-number"]
  },
  "prediction": {
    name: "预言未知元素",
    cat: "方法",
    short: "指着空格说“这里有东西”",
    plain: "门捷列夫依据周期律，预言尚未发现元素的存在与性质，后被镓、锗等证实。这是理论预测力的典范。",
    analogy: "在拼图留白处，先画出“这里该有只猫”。",
    page: "predict", anchor: "#gap",
    related: ["eka", "gallium", "germanium"]
  },
  "eka": {
    name: "类某元素（eka-）",
    cat: "方法",
    short: "给未知数的临时名",
    plain: "门捷列夫用梵语“eka-”（意为“第一/下一号”）给预言元素临时命名，如“类铝”“类硅”，对应后来的镓、锗。",
    analogy: "给还没出生的小孩先起个代号。",
    page: "predict", anchor: "#eka",
    related: ["prediction", "gallium", "germanium"]
  },
  "gallium": {
    name: "镓",
    cat: "化学",
    short: "第一个应验的预言",
    plain: "镓（Ga）1875 年被发现，性质与门捷列夫预言的“类铝”高度吻合，是周期律最早的实证之一。",
    analogy: "预言里的“类铝”，落地成了真镓。",
    page: "predict", anchor: "#gallium",
    related: ["prediction", "eka", "germanium"]
  },
  "germanium": {
    name: "锗",
    cat: "化学",
    short: "第二个应验的预言",
    plain: "锗（Ge）1886 年被发现，几乎完全符合“类硅”的预言，进一步坐实了周期表的可信度。",
    analogy: "又一张“预言彩票”兑了奖。",
    page: "predict", anchor: "#germanium",
    related: ["prediction", "eka", "gallium"]
  },
  "mendeleev": {
    name: "门捷列夫",
    cat: "历史",
    short: "周期表的作者",
    plain: "俄国化学家门捷列夫于 1869 年发表元素周期表，并预言未知元素，奠定了无机化学的秩序框架。",
    analogy: "他给所有元素发了“座位表”。",
    page: "table", anchor: "#why",
    related: ["periodic-table", "prediction", "mosley"]
  },
  "mosley": {
    name: "莫塞莱",
    cat: "历史",
    short: "用原子序数重排表",
    plain: "英国物理学家莫塞莱通过 X 射线实验确定原子序数，证明它才是元素排列的真正依据，修正了少数按原子量排错的位次。",
    analogy: "他换了一把更准的尺，把表排得更服帖。",
    page: "law", anchor: "#atomic-number",
    related: ["atomic-number", "periodic-table"]
  },
  "noble-gas": {
    name: "稀有气体",
    cat: "化学",
    short: "最右一列的“懒人”",
    plain: "稀有气体（氦、氖、氩、氪、氙、氡）化学性质极不活泼，单独占据周期表最右一列，完美契合周期律。",
    analogy: "一族“不爱交际”的元素，自成一列。",
    page: "legacy", anchor: "#noble",
    related: ["group", "electron-shell"]
  },
  "electron-shell": {
    name: "电子层",
    cat: "物理",
    short: "原子外的“洋葱层”",
    plain: "电子分层排布在原子核外。电子层的重复出现，正是元素性质呈周期变化的微观根源。",
    analogy: "原子像洋葱，一层层裹着；层数重复，性质就重复。",
    page: "legacy", anchor: "#shell",
    related: ["period", "noble-gas", "atomic-number"]
  },
  "classification": {
    name: "分类",
    cat: "方法",
    short: "先归类，再发现规律",
    plain: "分类是把相似事物归在一起的方法。门捷列夫靠给元素分类，才让周期律浮现出来——分类是科学发现的基本功。",
    analogy: "先分好抽屉，东西的规律才看得清。",
    page: "legacy", anchor: "#wall",
    related: ["periodic-table", "periodicity"]
  },
  "newlands": {
    name: "纽兰兹",
    cat: "历史",
    short: "早一步的“八音律”",
    plain: "英国化学家纽兰兹曾提出元素按八个数一循环（八音律），思路接近周期律，但因证据不足未被广泛接受，门捷列夫后来完成了体系化。",
    analogy: "有人先弹了前奏，门捷列夫写完了整首曲子。",
    page: "table", anchor: "#mess",
    related: ["periodicity", "mendeleev"]
  }
};

window.SITE_PAGES = {
  table: { title: "元素周期表：给元素排座位", url: "detail/table.html" },
  law: { title: "周期律：性质会“循环”", url: "detail/law.html" },
  predict: { title: "大胆预言：留白的格子", url: "detail/predict.html" },
  legacy: { title: "影响：现代化学的骨架", url: "detail/legacy.html" }
};

window.SITE_CATS = ["化学", "方法", "历史", "物理"];