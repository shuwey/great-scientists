/* =========================================================
   《读懂爱因斯坦》术语数据库
   ---------------------------------------------------------
   short   : 弹窗顶部金句（一句话，最直白）
   plain   : 弹窗正文（2~3 句通俗解释）
   analogy : 生活类比（打比方，让初中生秒懂）
   page    : 关联详解页（relativity / photoelectric / gravity / massenergy），无则 null
   related : 相关术语 id
   extra   : 可选补充（公式、单位、小知识）
   ========================================================= */
window.SITE_TERMS = {
  /* ---------------- 相对论 ---------------- */
  relativity: {
    name: "相对论",
    cat: "相对论",
    short: "关于“时间、空间、运动”的新看法",
    plain: "相对论是爱因斯坦在 1905（狭义）和 1915（广义）年建立的两套理论。它改写了人类几百年来的常识：时间和空间不是绝对不变的舞台，而会随运动状态、附近有没有大质量物体而改变。",
    analogy: "就像你坐火车时觉得窗外的树在动、而自己坐着没动——“动”和“静”其实要看你站在谁的立场，相对论把这种“看问题的角度”变成了物理规律。",
    page: "relativity", anchor: "#summary",
    related: ["special-relativity", "general-relativity", "reference-frame"]
  },
  "special-relativity": {
    name: "狭义相对论",
    cat: "相对论",
    short: "匀速运动下，物理规律对谁都一样",
    plain: "1905 年提出。它的出发点是两条：物理定律在所有匀速直线运动的参考系里都一样；真空中的光速对任何观察者都恒定不变。由此推出时间会变慢、长度会缩短等反直觉结论。",
    analogy: "无论你是在静止的站台，还是坐在匀速飞驰的高铁上，做同一个物理实验得到的结果都一样——没人能靠关在车厢里做实验“测出”自己有多快。",
    page: "relativity", anchor: "#speed",
    related: ["speed-of-light", "reference-frame", "inertial-frame", "time-dilation"]
  },
  "general-relativity": {
    name: "广义相对论",
    cat: "相对论",
    short: "引力，其实是时空被“压弯”了",
    plain: "1915 年提出，把引力解释为物质和能量让时空发生弯曲，物体沿着弯曲时空里的“最直路径”运动，看起来就像被引力吸引。它比牛顿引力更精确，预言了光线偏折、引力波等现象。",
    analogy: "在一张绷紧的橡胶膜上放一颗保龄球，膜会凹陷，旁边的小弹珠会滚向它——不是有只手在推，而是“地面本身弯了”。",
    page: "gravity", anchor: "#curvature",
    related: ["equivalence", "spacetime-curvature", "gravitational-lensing", "geodesic"]
  },
  "speed-of-light": {
    name: "光速",
    cat: "相对论",
    short: "真空里光每秒约走 30 万公里",
    plain: "光在真空中的速度约为 299792 公里/秒，记作 c。它是宇宙的速度上限，也是相对论里最核心的常数：无论光源或观察者怎么运动，测得的光速都一样。",
    analogy: "不管你朝着光跑还是背着光跑，光追上你的速度永远是同一个数——这和我们平时对“速度相加”的直觉完全相反。",
    extra: "c ≈ 3.0×10⁸ m/s。从地球到月亮，光只要约 1.3 秒。",
    page: "relativity", anchor: "#speed",
    related: ["light-constant", "time-dilation"]
  },
  "light-constant": {
    name: "光速不变",
    cat: "相对论",
    short: "谁测都是同一个数",
    plain: "这是狭义相对论的第二根支柱：真空光速对任何匀速运动的观察者都相同，不随光源或观察者的运动而改变。正是这一点推翻了“速度可以简单相加”的常识。",
    analogy: "你站在路边、朋友坐高铁飞驰，你们各自用仪器测同一束光，读数居然一模一样——这反直觉的事实，是相对论一切奇景的起点。",
    page: "relativity", anchor: "#speed",
    related: ["speed-of-light", "special-relativity", "reference-frame"]
  },
  "reference-frame": {
    name: "参考系",
    cat: "相对论",
    short: "你“站在哪儿”看问题",
    plain: "描述运动必须先选一个“观察立足点”，比如地面、火车或飞船，这个立足点加上它自己的运动状态，就叫参考系。同一件事在不同参考系里看到的画面可以不同。",
    analogy: "你在匀速行驶的高铁上竖直向上抛钥匙，你觉得它直上直下；站台上的人却看到它划出一条抛物线——同一个动作，不同参考系看法不同。",
    page: "relativity", anchor: "#simultaneity",
    related: ["inertial-frame", "special-relativity", "simultaneity"]
  },
  "inertial-frame": {
    name: "惯性系",
    cat: "相对论",
    short: "没有加速、平稳匀速的参考系",
    plain: "惯性系指不受外力、保持匀速直线运动（或静止）的参考系。狭义相对论只在这些“平稳”的参考系里成立；一旦猛烈加速或转弯，就要交给广义相对论。",
    analogy: "平稳巡航的飞机里，你感觉和地面静止时差不多；可一旦起飞爬升或遇气流颠簸，杯子里的水就会晃——平稳那段才是“惯性系”。",
    page: "relativity", anchor: "#speed",
    related: ["reference-frame", "special-relativity", "equivalence"]
  },
  simultaneity: {
    name: "同时性的相对性",
    cat: "相对论",
    short: "“同一时刻”并不 universal",
    plain: "在狭义相对论里，两个事件是否“同时发生”，取决于观察者的运动状态。对甲同时的两件事，对高速运动的乙可能一先一后。绝对的同时不存在。",
    analogy: "一列飞驰的火车中间闪光，车上的你觉得前后车厢同时被照亮；站台上的人却觉得靠他近的那头先亮——谁都没错，只是参考系不同。",
    page: "relativity", anchor: "#simultaneity",
    related: ["reference-frame", "special-relativity", "time-dilation"]
  },
  "time-dilation": {
    name: "时间膨胀",
    cat: "相对论",
    short: "动得快，时间就“慢”下来",
    plain: "物体运动得越快，它身上的时间相对于静止观察者就流逝得越慢。这不是钟表坏了，而是时空本身的性质。速度越接近光速，这种“慢”越明显。",
    analogy: "一对双胞胎，一个坐近光速飞船远行回来，会比留在地球的那位年轻——这就是著名的“双生子佯谬”。",
    extra: "变慢倍数 γ = 1/√(1−v²/c²)。v 达到 0.87c 时，时间约为地球上的 1/2。",
    page: "relativity", anchor: "#dilation",
    related: ["lorentz-factor", "speed-of-light", "twin-paradox", "simultaneity"]
  },
  "lorentz-factor": {
    name: "洛伦兹因子 γ",
    cat: "相对论",
    short: "衡量“相对论效应”有多强",
    plain: "γ = 1/√(1−v²/c²)，是相对论里反复出现的一个数。它告诉大家：运动速度 v 占光速 c 的比例越大，时间膨胀、长度收缩等效应就越显著。",
    analogy: "像一根“加速旋钮”：速度很小时 γ≈1（几乎没感觉），越接近光速 γ 飙升，效应就越夸张。",
    extra: "v=0 时 γ=1；v=0.99c 时 γ≈7.1，即时间约为原来的 1/7。",
    page: "relativity", anchor: "#dilation",
    related: ["time-dilation", "length-contraction", "speed-of-light"]
  },
  "length-contraction": {
    name: "长度收缩",
    cat: "相对论",
    short: "动得越快，沿运动方向越“短”",
    plain: "在静止观察者看来，高速运动的物体沿运动方向会被压缩变短（垂直方向不变）。和时间膨胀一样，这是时空几何的必然结果，不是被“压扁”了。",
    analogy: "一把高速飞过的尺子，你量它的长度会比它自己量得的短——就像时间变慢一样，是“看问题的坐标系”不同造成的。",
    page: "relativity", anchor: "#contraction",
    related: ["time-dilation", "lorentz-factor", "special-relativity"]
  },
  "twin-paradox": {
    name: "双生子佯谬",
    cat: "相对论",
    short: "去太空转一圈，回来更年轻",
    plain: "一对双胞胎，一个留在地球，一个乘近光速飞船往返。按时间膨胀，宇航员回来时比地球同胞更年轻。看似“矛盾”，其实因为往返必须加速、掉头，两边并不对称。",
    analogy: "就像两人走不同路线去同一终点，路程（经历的“固有时”）可以不一样长——宇航员的“路程”在时空里更短。",
    page: "relativity", anchor: "#dilation",
    related: ["time-dilation", "special-relativity", "inertial-frame"]
  },

  /* ---------------- 量子 ---------------- */
  photoelectric: {
    name: "光电效应",
    cat: "量子",
    short: "光也能“敲”出电子",
    plain: "某些金属被光照射时，表面会“溅出”电子。奇怪的是：能不能打出电子，取决于光的频率（颜色），而不是亮度。爱因斯坦用“光是一份份光子”解释了这个现象，并因此获诺贝尔奖。",
    analogy: "像用硬币敲钟：一枚枚硬币（光子）带着固定能量砸下来，频率太低（硬币太轻）再多也敲不响；频率够高（硬币够重）一下就敲出电子。",
    page: "photoelectric", anchor: "#photon",
    related: ["photon", "quanta", "threshold-frequency", "work-function", "stopping-voltage"]
  },
  photon: {
    name: "光子",
    cat: "量子",
    short: "光的一份一份的“能量包”",
    plain: "光子是光的最小能量单元，既有波动性又有粒子性。每个光子的能量只和它的频率有关：E = h·f。频率越高（颜色越蓝紫），单个光子能量越大。",
    analogy: "光不像连续的水流，而像一粒粒均匀的小珠子；每颗珠子的大小（能量）由颜色决定，紫光珠子比红光珠子“重”。",
    extra: "E = h·f，h 为普朗克常数 ≈ 6.626×10⁻³⁴ J·s。",
    page: "photoelectric", anchor: "#photon",
    related: ["quanta", "plancks-constant", "photoelectric", "threshold-frequency"]
  },
  quanta: {
    name: "量子",
    cat: "量子",
    short: "物理量可以“一份份”跳着变",
    plain: "“量子”指某些物理量只能取离散的、一份一份的值，不能连续微调。爱因斯坦把这一思想用到光上，提出光也是一份份的，开启了量子物理。",
    analogy: "普通楼梯是连续的斜坡；量子世界像一级级台阶——你只能站在某一阶，不能停在两阶之间。",
    page: "photoelectric", anchor: "#photon",
    related: ["photon", "plancks-constant", "photoelectric"]
  },
  "plancks-constant": {
    name: "普朗克常数 h",
    cat: "量子",
    short: "量子世界的“最小台阶”",
    plain: "h 是量子理论的基本常数，约等于 6.626×10⁻³⁴ 焦耳·秒。它决定了能量一份有多大：E = h·f。h 极小，所以日常尺度下“一份份”的效应看不出来。",
    analogy: "如果能量是金币，h 就是最小面值——在宏观世界我们感觉钱是连续的数，但最底层其实有最小单位。",
    extra: "h ≈ 6.626×10⁻³⁴ J·s。由马克斯·普朗克于 1900 年引入。",
    page: "photoelectric", anchor: "#photon",
    related: ["quanta", "photon", "photoelectric"]
  },
  "threshold-frequency": {
    name: "截止频率",
    cat: "量子",
    short: "低于它，再亮也打不出电子",
    plain: "每种金属都有一个特定的最小光频率 f₀。只有光的频率高于它，才能把电子敲出来；低于它，光再强也没用。这用“光是连续波”的旧理论无法解释。",
    analogy: "像考试及格线：分数（频率）不够，刷题量（光强）再大也及不了格。",
    page: "photoelectric", anchor: "#threshold",
    related: ["work-function", "photon", "photoelectric", "stopping-voltage"]
  },
  "work-function": {
    name: "逸出功",
    cat: "量子",
    short: "把电子“拽”出金属要花的力气",
    plain: "逸出功 W 是金属把最外层电子束缚住、需要克服的最小能量。只有光子能量 h·f 超过 W，多余的能量才变成电子的动能。",
    analogy: "像井里的水要舀出来，得先克服井的深度（逸出功）；光子带的“水桶”不够深，水就提不上来。",
    extra: "爱因斯坦方程：½mv² = h·f − W。",
    page: "photoelectric", anchor: "#threshold",
    related: ["threshold-frequency", "photon", "stopping-voltage", "photoelectric"]
  },
  "stopping-voltage": {
    name: "截止电压",
    cat: "量子",
    short: "反向电压一够大，电子就回去了",
    plain: "在光电实验中加一个反向电场，能拦住飞出的电子。把电流刚好压到零所需的电压叫截止电压，它直接对应电子的最大动能。这用来验证光子能量公式。",
    analogy: "像往斜坡上扔球，电压就是坡度；坡够陡时，球（电子）再也爬不上去，电流归零。",
    page: "photoelectric", anchor: "#threshold",
    related: ["photoelectric", "work-function", "threshold-frequency"]
  },
  "brownian-motion": {
    name: "布朗运动",
    cat: "量子",
    short: "花粉在水里“醉步”乱晃",
    plain: "悬浮在水中的花粉或灰尘会做无规则的乱晃，这是水分子从四面八方撞击它们造成的。爱因斯坦 1905 年算出了这种运动的规律，强有力地证明了原子和分子真实存在。",
    analogy: "像盲盒里一只小虫被无数看不见的弹珠从各方向随机撞，只能东倒西歪地乱走。",
    page: "photoelectric", anchor: "#photon",
    related: ["atom", "miracle-year"]
  },

  /* ---------------- 引力 / 时空 ---------------- */
  equivalence: {
    name: "等效原理",
    cat: "引力",
    short: "加速和引力，感觉分不清",
    plain: "广义相对论的基石：在一个小房间里，你无法区分“房间在向上加速”和“房间里有个向下的引力场”。加速运动与引力在局部等效。",
    analogy: "电梯突然上升时你感到“变重”，和站在地面上被地球拉住，脚底的感觉一模一样——两者在局部不可区分。",
    page: "gravity", anchor: "#equivalence",
    related: ["general-relativity", "spacetime-curvature", "inertial-frame"]
  },
  "spacetime-curvature": {
    name: "时空弯曲",
    cat: "引力",
    short: "有质量的物体，把时空压出坑",
    plain: "在广义相对论里，质量和能量会弯曲周围的时空。物体并不是被“看不见的力”拉过去，而是顺着弯曲时空里自然的路径运动。这就是引力的本质。",
    analogy: "保龄球放在橡皮膜上压出凹坑，小弹珠顺着坑边滚——不是有人推，是“地”本身弯了。",
    page: "gravity", anchor: "#curvature",
    related: ["general-relativity", "equivalence", "geodesic", "gravitational-lensing"]
  },
  geodesic: {
    name: "测地线",
    cat: "引力",
    short: "弯曲时空里的“最直路线”",
    plain: "在弯曲的时空中，物体自由运动时走的“最直、最短”的那条路径叫测地线。行星绕太阳转，其实是在弯曲时空里沿测地线“直直地”走。",
    analogy: "地球表面两点间的最短航线是大圆航线——在球面上它“看起来弯”，但其实是最直的路；测地线就是时空里的“大圆”。",
    page: "gravity", anchor: "#curvature",
    related: ["spacetime-curvature", "general-relativity", "gravity"]
  },
  "gravitational-lensing": {
    name: "引力透镜",
    cat: "引力",
    short: "大质量天体把光“掰弯”",
    plain: "光线经过大质量天体（如星系、黑洞）附近时，路径会被弯曲的时空偏折，就像经过透镜一样。1919 年日食观测首次证实了这一点，让爱因斯坦举世闻名。",
    analogy: "像用放大镜把背后的字“挪位”、甚至重影——只不过这片“透镜”是天体的质量，而不是玻璃。",
    extra: "1919 年爱丁顿观测日全食，测得星光经过太阳边缘偏折约 1.75 角秒。",
    page: "gravity", anchor: "#lensing",
    related: ["spacetime-curvature", "general-relativity", "eclipse-1919", "black-hole"]
  },
  "gravitational-redshift": {
    name: "引力红移",
    cat: "引力",
    short: "从深“引力坑”爬出来的光会变红",
    plain: "光从强引力处逃向弱引力处时，会损失能量、频率降低、波长变长，看起来偏红，这叫引力红移。它是时空弯曲的直接证据之一。",
    analogy: "像把球从井底往上抛，它得消耗能量才能爬出来；光的“能量”变少，颜色就往红端挪。",
    page: "gravity", anchor: "#redshift",
    related: ["spacetime-curvature", "general-relativity", "equivalence"]
  },
  "gravitational-wave": {
    name: "引力波",
    cat: "引力",
    short: "时空本身的“涟漪”",
    plain: "当大质量天体剧烈加速（如两个黑洞合并），会像石头丢进水里一样，在时空上激起传播的“波纹”——引力波。爱因斯坦 1916 年预言，2015 年才被直接探测到。",
    analogy: "在拉紧的床单上抖一下保龄球，会看到波纹一圈圈传开——引力波就是时空床单上的波纹。",
    page: "gravity", anchor: "#redshift",
    related: ["general-relativity", "spacetime-curvature", "black-hole"]
  },
  "black-hole": {
    name: "黑洞",
    cat: "引力",
    short: "连光都逃不出的“深坑”",
    plain: "当质量被压缩到足够小，周围的时空弯曲到连光都无法逃逸，就形成黑洞。它是广义相对论最极端的预言之一，如今已被观测广泛证实。",
    analogy: "就像引力坑深到边缘太陡，任何东西滚进去都上不来——连最快的光也被“困住”。",
    page: "gravity", anchor: "#redshift",
    related: ["spacetime-curvature", "general-relativity", "gravitational-wave", "gravitational-lensing"]
  },
  gravity: {
    name: "引力",
    cat: "引力",
    short: "万物互相吸引的那股劲",
    plain: "引力是质量之间相互吸引的力。牛顿把它描述为“平方反比”的拉力，爱因斯坦则解释为时空弯曲。两者在弱引力下结果几乎一致，强引力下相对论更准。",
    analogy: "地球拽着你、你也拽着地球，只是你轻得多，所以主要是你往地上掉。",
    page: "gravity", anchor: "#curvature",
    related: ["spacetime-curvature", "equivalence", "general-relativity"]
  },

  /* ---------------- 质能 ---------------- */
  "mass-energy": {
    name: "质能关系",
    cat: "质能",
    short: "质量，就是藏起来的能量",
    plain: "质量和能量是同一回事的两种“账本写法”，可以互相换算。一个物体的总能量等于它的质量乘以光速的平方。质量越大，蕴含的能量越惊人。",
    analogy: "就像钞票和存款是同一笔钱的不同形式——质量“兑换”成能量时，汇率就是 c²，这个汇率大得吓人。",
    page: "massenergy", anchor: "#meaning",
    related: ["emc2", "energy", "mass", "nuclear"]
  },
  emc2: {
    name: "E = mc²",
    cat: "质能",
    short: "史上最有名的等式",
    plain: "这是质能关系的公式：E（能量）= m（质量）× c²（光速的平方）。它说明极小的一点质量，也对应着极大的能量。",
    analogy: "c 是光速，约 30 万公里/秒，c² 是个天文数字——所以“一丁点质量”里，其实锁着海量的能量。",
    extra: "1 克质量完全转化 ≈ 9×10¹³ 焦耳，相当于约 2 万吨 TNT 的当量。",
    page: "massenergy", anchor: "#meaning",
    related: ["mass-energy", "speed-of-light", "nuclear", "energy"]
  },
  nuclear: {
    name: "核反应",
    cat: "质能",
    short: "质量“亏掉”一点，放出巨大能量",
    plain: "在核裂变或核聚变中，反应前后总质量会略微减少（质量亏损），亏掉的那点质量按 E=mc² 变成能量。核电站、太阳发光都靠这个原理。",
    analogy: "像找零：反应前“重一点”，反应后“轻一点”，少掉的那点质量被换成光和热付给你。",
    page: "massenergy", anchor: "#nuclear",
    related: ["emc2", "mass-energy", "energy", "star"]
  },
  star: {
    name: "恒星发光",
    cat: "质能",
    short: "星星靠“烧质量”点亮",
    plain: "太阳和恒星内部持续进行核聚变，把氢变成氦，过程中极少量质量转化为能量，以光和热的形式辐射出来。我们晒到的阳光，源头就是 E=mc²。",
    analogy: "恒星像一台超级慢的“质量熔炉”，每天悄悄烧掉约 400 万吨质量，换来照亮整个太阳系的阳光。",
    page: "massenergy", anchor: "#star",
    related: ["nuclear", "emc2", "mass-energy"]
  },

  /* ---------------- 历史 / 人物 ---------------- */
  "miracle-year": {
    name: "奇迹年 1905",
    cat: "历史",
    short: "一年发了 4 篇改变物理的论文",
    plain: "1905 年，在伯尔尼专利局当小职员的爱因斯坦，一年内发表了四篇划时代论文：解释光电效应、证明原子存在（布朗运动）、提出狭义相对论、导出 E=mc²。",
    analogy: "像一个人一年内同时写出四本改变世界的书——而且他当时还不是大学教授。",
    page: "relativity", anchor: "#summary",
    related: ["bern-patent-office", "photoelectric", "special-relativity", "emc2"]
  },
  "bern-patent-office": {
    name: "伯尔尼专利局",
    cat: "历史",
    short: "他“白天上班、晚上想宇宙”的地方",
    plain: "1902—1909 年，爱因斯坦在瑞士伯尔尼的专利局做技术员，审查发明申请。他常在上班空隙琢磨物理问题，奇迹年的许多想法就在这里萌芽。",
    analogy: "像一份朝九晚五的普通工作，他利用业余时间，把人类对时空的理解彻底重写了一遍。",
    page: "relativity", anchor: "#summary",
    related: ["miracle-year", "nobel-prize"]
  },
  "nobel-prize": {
    name: "诺贝尔物理学奖",
    cat: "历史",
    short: "1921 年，因光电效应获奖",
    plain: "爱因斯坦 1921 年获得诺贝尔物理学奖，获奖理由是“对光电效应定律的发现”——而不是更出名的相对论（当时相对论仍有争议）。",
    analogy: "就像颁给他“最没争议的一项成就”，而他自己觉得更牛的相对论，评委们还在观望。",
    page: "photoelectric", anchor: "#nobel",
    related: ["photoelectric", "photon", "miracle-year"]
  },
  "eclipse-1919": {
    name: "1919 年日食",
    cat: "历史",
    short: "一次日食，证实了时空弯曲",
    plain: "1919 年日全食期间，爱丁顿率领的观测队测到星光经过太阳边缘时发生偏折，数值与广义相对论预言吻合。消息轰动全球，爱因斯坦一夜成名。",
    analogy: "像在关键时刻做一次“现场实验直播”：理论说会偏 1.75 角秒，天文望远镜一量，还真偏了那么多。",
    page: "gravity", anchor: "#lensing",
    related: ["gravitational-lensing", "general-relativity", "spacetime-curvature"]
  },
  "ether": {
    name: "以太",
    cat: "历史",
    short: "当年假想装光的“宇宙海水”",
    plain: "19 世纪很多人相信光需要一种充满宇宙的特殊介质“以太”来传播。但实验始终找不到它，爱因斯坦干脆抛弃以太，直接把“光速不变”当作基本原理。",
    analogy: "像以为空气之外还有一层更隐形的“超级空气”托着光；结果证明光在真空中也能跑，这层“超级空气”根本不存在。",
    page: "relativity", anchor: "#speed",
    related: ["speed-of-light", "light-constant", "michelson-morley"]
  },
  "michelson-morley": {
    name: "迈克尔逊—莫雷实验",
    cat: "历史",
    short: "怎么都测不到“以太风”",
    plain: "1887 年的这个实验想测出地球在“以太”中穿行产生的速度差，结果无论怎么测都是零。这个“零结果”为抛弃以太、接受光速不变埋下伏笔。",
    analogy: "像站在行驶的车里伸手感觉风，结果前后左右都一模一样——说明你以为存在的“风”（以太）其实并不存在。",
    page: "relativity", anchor: "#speed",
    related: ["ether", "speed-of-light", "light-constant"]
  },
  princeton: {
    name: "普林斯顿高等研究院",
    cat: "历史",
    short: "他晚年追求“统一场论”的地方",
    plain: "1933 年纳粹上台后，身为犹太人的爱因斯坦移居美国，加入普林斯顿高等研究院。此后他长期尝试把引力和电磁力统一起来（统一场论），未竟全功。",
    analogy: "像一位功成名就的学者，在安静的象牙塔里想攻克最后一道大题——把自然界几种力写进同一个公式。",
    page: "gravity", anchor: "#unified",
    related: ["unified-field", "general-relativity"]
  },
  "unified-field": {
    name: "统一场论",
    cat: "历史",
    short: "把几种力写进同一个公式",
    plain: "爱因斯坦晚年致力于把引力与电磁力（后来还包括其他基本力）统一到一个理论框架里。这是他未完成的梦想，也是今天理论物理仍在追求的目标。",
    analogy: "像想把电、磁、光、引力都归到同一本“说明书”里——他开了头，但完整答案留给后人。",
    page: "gravity", anchor: "#unified",
    related: ["general-relativity", "princeton"]
  },
  atom: {
    name: "原子",
    cat: "历史",
    short: "物质能分到的最小“积木”之一",
    plain: "原子是构成物质的基本单位。20 世纪初“原子是否真实存在”还有争议，爱因斯坦用布朗运动论文给出了决定性证据：原子真实存在。",
    analogy: "像乐高最小颗粒；爱因斯坦证明了这些“看不见的小颗粒”确实在四处乱撞。",
    page: "photoelectric", anchor: "#photon",
    related: ["brownian-motion", "quanta", "photon"]
  },
  energy: {
    name: "能量",
    cat: "质能",
    short: "让事情发生的“本钱”",
    plain: "能量是物体做功、发热、发光、运动的本钱，可以多种形式相互转换（动能、热能、光能、质量能）。质能关系告诉我们，质量本身也是一种能量。",
    analogy: "像手机电量：可以显示成数字、变成屏幕光、变成发热——形式在变，总量（含质量）守恒。",
    page: "massenergy", anchor: "#meaning",
    related: ["mass-energy", "emc2", "mass"]
  },
  mass: {
    name: "质量",
    cat: "质能",
    short: "一个物体含有多少“东西”",
    plain: "质量衡量物体里有多少物质，也衡量它有多“难被推动”。在相对论里，运动物体的质量会随速度增大一点点（速度接近光速时才明显）。",
    analogy: "推空购物车轻松、装满矿泉水难推——后者质量大，更“倔”。",
    page: "massenergy", anchor: "#meaning",
    related: ["mass-energy", "emc2", "energy"]
  },
  momentum: {
    name: "动量",
    cat: "质能",
    short: "“又重又快”的冲劲儿",
    plain: "动量 = 质量 × 速度，描述物体“撞过来有多唬人”。在相对论里，动量和能量被统一成一个更完整的描述。",
    analogy: "同样速度下，大卡车比自行车“冲”得多——因为动量更大。",
    page: "relativity", anchor: "#summary",
    related: ["mass", "energy", "mass-energy"]
  }
};

/* 详解页映射：术语弹窗的“了解更多”从这里取地址（相对子站根） */
window.SITE_PAGES = {
  relativity:   { title: "狭义相对论",   url: "detail/relativity.html" },
  photoelectric:{ title: "光电效应",     url: "detail/photoelectric.html" },
  gravity:      { title: "广义相对论",   url: "detail/gravity.html" },
  massenergy:   { title: "质能方程",     url: "detail/mass-energy.html" }
};

/* 词典分类顺序 */
window.SITE_CATS = ["相对论", "量子", "引力", "质能", "历史"];
