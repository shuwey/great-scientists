/* 《读懂霍金》术语数据库（引擎通用：SITE_TERMS/SITE_PAGES/SITE_CATS） */
window.SITE_TERMS = {
  "singularity": {
    name: "奇点",
    cat: "物理",
    short: "曲率无限大的点",
    plain: "奇点是广义相对论中密度与时空曲率趋于无限的区域，已知物理定律在此失效。霍金与彭罗斯证明它在很一般的条件下必然出现。",
    analogy: "像是公式的悬崖，再往前走定律就说不出话。",
    page: "singularity", anchor: "#singularity",
    related: ["gravity", "relativity", "bigbang"]
  },
  "bigbang": {
    name: "大爆炸",
    cat: "宇宙",
    short: "宇宙的起点",
    plain: "大爆炸理论指宇宙从一个极热极密的状态膨胀而来；倒推回去，它指向一个奇点式的开端。",
    analogy: "宇宙像一颗倒放的电影，开头是一点光。",
    page: "singularity", anchor: "#bang",
    related: ["singularity", "universe", "cosmology"]
  },
  "relativity": {
    name: "广义相对论",
    cat: "物理",
    short: "引力=时空弯曲",
    plain: "广义相对论把引力解释为时空的弯曲：物质告诉时空如何弯，时空告诉物质如何走。它是理解黑洞与宇宙的基础。",
    analogy: "时空像一张被重物压出坑的橡胶膜。",
    page: "singularity", anchor: "#gr",
    related: ["gravity", "spacetime-curvature", "singularity"]
  },
  "gravity": {
    name: "引力",
    cat: "物理",
    short: "把东西拉到一起的力",
    plain: "引力是质量之间的相互吸引。在广义相对论中，它表现为时空的弯曲；引力越强，对光与时间的扭曲越明显。",
    analogy: "宇宙里看不见的“往下拉”的手。",
    page: "blackhole", anchor: "#escape",
    related: ["relativity", "spacetime-curvature", "blackhole"]
  },
  "spacetime-curvature": {
    name: "时空曲率",
    cat: "物理",
    short: "时空被压出的“坑”",
    plain: "时空曲率描述时空被物质和能量压弯的程度。黑洞附近曲率极大，连光线路径都被掰弯。",
    analogy: "质量越大，橡胶膜上的坑越深。",
    page: "blackhole", anchor: "#escape",
    related: ["gravity", "relativity", "blackhole"]
  },
  "blackhole": {
    name: "黑洞",
    cat: "物理",
    short: "连光也逃不出的天体",
    plain: "黑洞是引力强到连光都无法逃逸的天体，边界为事件视界。2019 年事件视界望远镜首次拍到其“阴影”。",
    analogy: "宇宙里一口太深的井，光也爬不出来。",
    page: "blackhole", anchor: "#horizon",
    related: ["event-horizon", "gravity", "hawking-radiation"]
  },
  "event-horizon": {
    name: "事件视界",
    cat: "物理",
    short: "黑洞的“不归点”",
    plain: "事件视界是黑洞的边界：一旦越过，任何信号（包括光）都到不了外界。它定义了黑洞的“大小”。",
    analogy: "一条线，跨过去就再也回不来。",
    page: "blackhole", anchor: "#horizon",
    related: ["blackhole", "gravity"]
  },
  "hawking-radiation": {
    name: "霍金辐射",
    cat: "物理",
    short: "黑洞也会“漏光”",
    plain: "霍金把量子效应用于黑洞边缘，发现黑洞会以极慢速度放出辐射（霍金辐射）并因此蒸发；质量越小越热、蒸发越快。",
    analogy: "黑洞不是只进不出，也会一点点“漏”光。",
    page: "radiation", anchor: "#hawking",
    related: ["blackhole", "evaporation", "thermodynamics"]
  },
  "evaporation": {
    name: "蒸发",
    cat: "物理",
    short: "黑洞慢慢变小",
    plain: "因霍金辐射带走能量，黑洞质量缓慢减少；质量越小温度越高、蒸发越快，最终可能以爆发结束。",
    analogy: "漏着漏着，坑就填平了。",
    page: "radiation", anchor: "#evaporate",
    related: ["hawking-radiation", "blackhole"]
  },
  "thermodynamics": {
    name: "黑洞热力学",
    cat: "物理",
    short: "黑洞也讲冷热",
    plain: "黑洞热力学把黑洞的面积、温度、熵联系起来，揭示黑洞与热力学定律的深刻对应，是统一引力量子理论的重要线索。",
    analogy: "黑洞也有自己的“冷热账本”。",
    page: "radiation", anchor: "#paradox",
    related: ["hawking-radiation", "blackhole"]
  },
  "universe": {
    name: "宇宙",
    cat: "宇宙",
    short: "我们所在的全体时空",
    plain: "宇宙是包含一切时空、物质与能量的总体。宇宙学研究的正是它的起源、结构与演化。",
    analogy: "所有“这里”和“那时”的总和。",
    page: "cosmology", anchor: "#time",
    related: ["bigbang", "cosmology", "singularity"]
  },
  "cosmology": {
    name: "宇宙学",
    cat: "宇宙",
    short: "研究宇宙的整体",
    plain: "宇宙学是研究宇宙起源、演化与结构的学科。霍金的工作把奇点、黑洞与宇宙开端连成一条线。",
    analogy: "把整个宇宙当作一个“病例”来读。",
    page: "cosmology", anchor: "#questions",
    related: ["universe", "bigbang", "brief-history"]
  },
  "brief-history": {
    name: "《时间简史》",
    cat: "科普",
    short: "卖出千万册的宇宙书",
    plain: "霍金 1988 年出版的《时间简史》用通俗语言讲宇宙与黑洞，成为全球畅销书，极大推动了科学普及。",
    analogy: "一本小书，把宇宙讲给全世界听。",
    page: "cosmology", anchor: "#time",
    related: ["popular-science", "cosmology", "hawking"]
  },
  "popular-science": {
    name: "科学普及",
    cat: "科普",
    short: "把高深讲给大众",
    plain: "科学普及是把专业研究用通俗方式传递给公众。霍金是科普的典范，让黑洞与宇宙成为大众话题。",
    analogy: "把实验室的话，翻译成街头的话。",
    page: "cosmology", anchor: "#legacy",
    related: ["brief-history", "hawking"]
  },
  "hawking": {
    name: "霍金",
    cat: "历史",
    short: "黑洞与宇宙的讲述者",
    plain: "史蒂芬·霍金是英国理论物理学家，提出奇点定理与霍金辐射，并以《时间简史》将宇宙学带入大众视野。",
    analogy: "他研究最深的黑暗，却把光带给最多人。",
    page: "singularity", anchor: "#theorem",
    related: ["blackhole", "hawking-radiation", "brief-history"]
  },
  "einstein": {
    name: "爱因斯坦",
    cat: "历史",
    short: "相对论的提出者",
    plain: "爱因斯坦创立广义相对论，预言了引力对时空的弯曲，为黑洞与宇宙学研究奠定基础。霍金的许多工作都建立在他的框架上。",
    analogy: "他画好了时空的图纸，后人照着施工。",
    page: "singularity", anchor: "#gr",
    related: ["relativity", "gravity", "hawking"]
  },
  "lucasian": {
    name: "卢卡斯教授",
    cat: "历史",
    short: "牛顿也曾担任的讲席",
    plain: "卢卡斯数学教授是剑桥大学的著名讲席，牛顿、狄拉克都曾任此职；霍金 1979 年出任，接下这一学术传统。",
    analogy: "一把传了三百年的“物理交椅”。",
    page: "cosmology", anchor: "#questions",
    related: ["hawking", "relativity"]
  }
};

window.SITE_PAGES = {
  singularity: { title: "奇点：时间与空间的尽头", url: "detail/singularity.html" },
  blackhole: { title: "黑洞：连光都逃不掉", url: "detail/blackhole.html" },
  radiation: { title: "霍金辐射：黑洞也会蒸发", url: "detail/radiation.html" },
  cosmology: { title: "把宇宙讲给所有人", url: "detail/cosmology.html" }
};

window.SITE_CATS = ["物理", "宇宙", "历史", "科普"];