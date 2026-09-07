/* 《读懂玻尔》术语数据库（引擎通用：SITE_TERMS/SITE_PAGES/SITE_CATS） */
window.SITE_TERMS = {
  "bohr-model": {
    name: "玻尔模型",
    cat: "物理",
    short: "电子分层待着的原子图",
    plain: "玻尔模型认为电子只能在若干固定的能级（轨道）上运动；在定态不辐射，跃迁时放出或吸收一份光子。它首次成功解释了氢原子光谱。",
    analogy: "像一栋楼，人只能待在某一层，换层时灯亮或灭。",
    page: "bohr-model", anchor: "#quantize",
    related: ["energy-level", "stationary-state", "electron", "quantum"]
  },
  "quantization": {
    name: "量子化",
    cat: "量子",
    short: "只能取某些离散值",
    plain: "量子化指某些物理量（如角动量、能量）不能连续取值，只能取离散的“一份一份”。这是量子世界与日常连续世界的根本区别。",
    analogy: "楼梯只能一级一级走，不能停在半级。",
    page: "bohr-model", anchor: "#quantize",
    related: ["quantum", "energy-level", "bohr-model"]
  },
  "stationary-state": {
    name: "定态",
    cat: "量子",
    short: "不辐射的“停留态”",
    plain: "定态是电子在允许能级上稳定停留的状态，此时不向外辐射能量——正因如此原子才不会瞬间塌缩。",
    analogy: "停在楼梯某一级上不动，就不会滑下去。",
    page: "bohr-model", anchor: "#stationary",
    related: ["energy-level", "bohr-model", "photon"]
  },
  "energy-level": {
    name: "能级",
    cat: "物理",
    short: "电子能待的“楼层”",
    plain: "能级是原子中电子允许具有的离散能量值，由低到高像楼层。电子在能级间跃迁，能量差以光子形式出现。",
    analogy: "原子的“楼层表”，每层有固定高度。",
    page: "bohr-model", anchor: "#quantize",
    related: ["bohr-model", "photon", "spectral-line"]
  },
  "electron": {
    name: "电子",
    cat: "物理",
    short: "带负电的轻粒子",
    plain: "电子是绕核运动的带负电轻粒子，决定原子的化学性质；在玻尔模型里，它只能待在固定能级上。",
    analogy: "原子核是太阳，电子是绕转的小行星。",
    page: "bohr-model", anchor: "#problem",
    related: ["nucleus", "photon", "energy-level"]
  },
  "photon": {
    name: "光子",
    cat: "量子",
    short: "光的“一份”能量",
    plain: "光子是光的最小能量单位，能量 = 普朗克常数 × 频率。电子跃迁时，能级差正好等于放出光子的能量。",
    analogy: "光不是流水，而是一颗颗能量小珠子。",
    page: "bohr-model", anchor: "#stationary",
    related: ["energy-level", "quantum", "spectral-line"]
  },
  "spectral-line": {
    name: "谱线",
    cat: "物理",
    short: "分光后的一条亮线",
    plain: "谱线是物质发光经分光后出现的离散亮线，每条对应特定能级差。元素谱线像指纹，可用于辨认成分。",
    analogy: "每种物质都有自己的“光纹身”。",
    page: "spectrum", anchor: "#lines",
    related: ["balmer", "energy-level", "photon"]
  },
  "balmer": {
    name: "巴尔末系",
    cat: "物理",
    short: "氢可见光谱线族",
    plain: "巴尔末系是氢原子电子跳到第二能级时发出的可见光谱线族，1885 年被公式精确描述，后被玻尔模型从理论解释。",
    analogy: "氢的“可见签名”，几条线排成规律。",
    page: "spectrum", anchor: "#balmer",
    related: ["spectral-line", "energy-level", "bohr-model"]
  },
  "quantum": {
    name: "量子",
    cat: "量子",
    short: "离散的“最小份额”",
    plain: "量子指物理量的最小不可分割份额；量子力学研究微观世界里能量、角动量等取离散值的现象。",
    analogy: "世界在最小处是“颗粒状”的，不是连续的。",
    page: "complementarity", anchor: "#duality",
    related: ["quantization", "photon", "complementarity"]
  },
  "complementarity": {
    name: "互补原理",
    cat: "量子",
    short: "波与粒子，互补才完整",
    plain: "互补原理认为微观对象同时具有波与粒子两面，但这两面不能在同一实验中同时完整显现；二者互补才构成完整描述。",
    analogy: "硬币有两面，你一次只能看清一面。",
    page: "complementarity", anchor: "#complement",
    related: ["quantum", "uncertainty", "copenhagen"]
  },
  "uncertainty": {
    name: "测不准原理",
    cat: "量子",
    short: "位置与动量难兼得",
    plain: "测不准原理（海森堡）指出，微观粒子的位置与动量无法同时被任意精确测定；这与互补原理共同刻画了量子测量的边界。",
    analogy: "越看清它“在哪”，就越糊涂它“要去哪”。",
    page: "complementarity", anchor: "#measure",
    related: ["complementarity", "quantum", "copenhagen"]
  },
  "copenhagen": {
    name: "哥本哈根学派",
    cat: "历史",
    short: "量子力学的思想中心",
    plain: "哥本哈根学派以玻尔研究所为核心，是量子力学诠释（互补原理、概率本性）的主要来源，对现代物理影响深远。",
    analogy: "一个实验室，养出了整个时代的脑子。",
    page: "copenhagen", anchor: "#institute",
    related: ["bohr-model", "complementarity", "rutherford"]
  },
  "rutherford": {
    name: "卢瑟福",
    cat: "历史",
    short: "先发现原子核",
    plain: "卢瑟福通过 α 粒子散射实验发现原子中心有个很小的核，并提出行星式原子模型；玻尔是他的学生，在此基础上加入量子化。",
    analogy: "他先画出太阳，玻尔再给行星定轨道。",
    page: "copenhagen", anchor: "#institute",
    related: ["nucleus", "bohr-model", "electron"]
  },
  "nucleus": {
    name: "原子核",
    cat: "物理",
    short: "原子中心的小而重",
    plain: "原子核位于原子中心，集中了几乎全部质量与正电荷；玻尔的“液滴模型”把它比作会抖动的液滴，用以理解裂变。",
    analogy: "原子像个带核的小宇宙，核是极重的心脏。",
    page: "copenhagen", anchor: "#droplet",
    related: ["electron", "rutherford", "fission"]
  },
  "fission": {
    name: "核裂变",
    cat: "物理",
    short: "重核裂成两半",
    plain: "核裂变是重原子核（如铀）被中子撞击后分裂成两个较轻核，并释放能量与更多中子。玻尔的液滴模型帮助理解了这一过程。",
    analogy: "一颗水珠被撞裂成两滴，还溅出水花。",
    page: "copenhagen", anchor: "#fission",
    related: ["nucleus", "nucleus", "copenhagen"]
  },
  "correspondence": {
    name: "对应原理",
    cat: "方法",
    short: "量子要退化回经典",
    plain: "对应原理要求：在宏观（大量子数）极限下，量子理论的结果必须与经典物理一致。它是玻尔构造新理论的方法论准则。",
    analogy: "新理论在“大尺度”上要认老理论这个亲戚。",
    page: "bohr-model", anchor: "#why",
    related: ["bohr-model", "quantum", "copenhagen"]
  },
  "nobel": {
    name: "诺贝尔奖",
    cat: "历史",
    short: "他拿了物理奖",
    plain: "玻尔因原子结构及辐射研究获 1922 年诺贝尔物理奖；他主持的研究所也走出了多位诺奖得主。",
    analogy: "一座奖杯，背后是一整个学派。",
    page: "copenhagen", anchor: "#institute",
    related: ["bohr-model", "copenhagen"]
  }
};

window.SITE_PAGES = {
  "bohr-model": { title: "玻尔模型：原子的“楼层”", url: "detail/bohr-model.html" },
  "spectrum": { title: "氢原子光谱：巴尔末系", url: "detail/spectrum.html" },
  "complementarity": { title: "互补原理：波还是粒子？", url: "detail/complementarity.html" },
  "copenhagen": { title: "哥本哈根学派与核裂变", url: "detail/copenhagen.html" }
};

window.SITE_CATS = ["物理", "量子", "历史", "方法"];