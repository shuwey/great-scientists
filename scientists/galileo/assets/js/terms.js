/* =========================================================
   《读懂伽利略》术语数据库
   ---------------------------------------------------------
   short   : 弹窗顶部金句（一句话，最直白）
   plain   : 弹窗正文（2~3 句通俗解释）
   analogy : 生活类比（打比方，让初中生秒懂）
   page    : 关联详解页（telescope / motion / inertia / method / timeline），无则 null
   related : 相关术语 id
   extra   : 可选补充（公式、年份、小知识）
   ========================================================= */
window.SITE_TERMS = {
  /* ---------------- 天文 ---------------- */
  telescope: {
    name: "望远镜",
    cat: "天文",
    short: "把“远处”一下子拉近到眼前的管子",
    plain: "1609 年前后，伽利略听说了荷兰人发明的“望远镜”，自己磨透镜做出能放大约 20 倍的版本。他把它指向天空，看到了肉眼永远看不到的东西：月球的坑、木星的卫星、金星的盈亏、太阳的黑子。",
    analogy: "就像给眼睛装了一副超级放大镜；以前人类只能“用肉眼读天书”，伽利略第一次把书凑到了灯下。",
    page: "telescope", anchor: "#moons",
    related: ["jupiter-moons", "lunar-craters", "venus-phases", "sunspots", "starry-messenger"]
  },
  "jupiter-moons": {
    name: "木星卫星",
    cat: "天文",
    short: "围着木星转的四颗“小月亮”",
    plain: "1610 年，伽利略用望远镜发现木星旁边有四颗小星，它们绕着木星转——后来叫“伽利略卫星”（伊奥、欧罗巴、盖尼米德、卡利斯托）。这证明并非所有天体都绕地球转，狠狠支持了日心说。",
    analogy: "就像一个缩小的“太阳系”：木星是中心，四颗卫星围着它转；这说明地球并不是宇宙唯一的中心。",
    extra: "这四颗卫星至今仍以“伽利略卫星”命名。",
    page: "telescope", anchor: "#moons",
    related: ["telescope", "heliocentrism", "copernicus", "starry-messenger"]
  },
  "lunar-craters": {
    name: "月球环形山",
    cat: "天文",
    short: "月亮表面并不光滑",
    plain: "伽利略通过望远镜看到，月球表面有高山、低谷和环形坑，并非古人以为的完美光滑球体。他据此推断：天体和地球一样，是“有瑕疵”的普通物质世界。",
    analogy: "月亮原来和我们脚下的地球一样，坑坑洼洼——天上的东西，并不比地上的更“神圣”。",
    page: "telescope", anchor: "#lunar",
    related: ["telescope", "starry-messenger"]
  },
  "venus-phases": {
    name: "金星相位",
    cat: "天文",
    short: "金星像月亮一样有圆有缺",
    plain: "伽利略发现金星会像月亮那样出现“盈缺变化”（相位）。这种完整相位只有在金星绕太阳转时才会出现；若一切绕地球转，金星就不该有这种表现。这是日心说的有力证据。",
    analogy: "金星一会儿像弯月、一会儿像满月——说明它有时会跑到太阳的另一侧，也就是绕着太阳跑，而不是绕着地球。",
    page: "telescope", anchor: "#venus",
    related: ["telescope", "heliocentrism", "copernicus"]
  },
  sunspots: {
    name: "太阳黑子",
    cat: "天文",
    short: "太阳脸上的“雀斑”",
    plain: "伽利略观测到太阳表面有会移动的黑斑（黑子），并能据此算出太阳在自转。这打破了“天体完美不变”的老观念：连太阳都不是永恒无瑕的。",
    analogy: "太阳也会“长斑”、也会转圈，和古希腊人眼里“永远完美”的天体形象完全不同。",
    page: "telescope", anchor: "#sunspots",
    related: ["telescope", "starry-messenger"]
  },
  "starry-messenger": {
    name: "《星空信使》",
    cat: "天文",
    short: "1610 年那本让全欧洲炸锅的小书",
    plain: "1610 年，伽利略出版《星空信使》（Sidereus Nuncius），公布望远镜下的新发现。这本书让他一夜成名，也让他卷入与旧观念、旧权威的长期冲突。",
    analogy: "相当于一次 17 世纪的“重磅论文爆款”，把人类看天的眼睛整个升级了。",
    page: "telescope", anchor: "#summary",
    related: ["telescope", "jupiter-moons", "lunar-craters"]
  },
  copernicus: {
    name: "哥白尼",
    cat: "天文",
    short: "提出“太阳在中心”的波兰天文学家",
    plain: "尼古拉·哥白尼在 1543 年提出：太阳静止在中心，地球和其他行星绕太阳转（日心说）。伽利略的望远镜观测为这一学说提供了关键证据。",
    analogy: "哥白尼先画了“新地图”，伽利略拿着望远镜去实地“验证”了它。",
    page: "telescope", anchor: "#copernicus",
    related: ["heliocentrism", "venus-phases", "jupiter-moons", "kepler"]
  },
  heliocentrism: {
    name: "日心说",
    cat: "天文",
    short: "太阳，而不是地球，坐在宇宙中心",
    plain: "日心说认为太阳是行星系统的中心，地球既是行星、又自转又公转。它取代了两千年来“地球静止在中心”的地心说，是科学史上最大的观念翻盘之一。",
    analogy: "以前以为自己是客厅正中的主角；日心说告诉我们：咱们只是绕着吊灯转的一盏小灯。",
    page: "telescope", anchor: "#copernicus",
    related: ["copernicus", "venus-phases", "jupiter-moons", "kepler"]
  },

  /* ---------------- 运动 ---------------- */
  "free-fall": {
    name: "自由落体",
    cat: "运动",
    short: "只受重力、往下掉的运动",
    plain: "伽利略论证：在忽略空气阻力时，所有物体不论轻重，都以相同加速度下落。这与“重的先落地”的常识相悖。他用斜面实验间接验证了这一点。",
    analogy: "把羽毛和铁球放进真空管里，它们会肩并肩同时落地——轻重并不决定快慢。",
    page: "motion", anchor: "#freefall",
    related: ["acceleration", "inclined-plane", "pisa-tower", "distance-time-square"]
  },
  "inclined-plane": {
    name: "斜面实验",
    cat: "运动",
    short: "让球在斜坡上滚，把“快”放慢来研究",
    plain: "为了测量下落这种太快看不清的运动，伽利略让铜球沿不同倾角的斜面滚下。斜面越缓，球越慢，便于计时；他由此推知“下落”的真实规律。",
    analogy: "像把陡峭的下楼梯改成平缓的滑梯——过程被拉长、看得清，但本质规律不变。",
    page: "motion", anchor: "#incline",
    related: ["free-fall", "acceleration", "distance-time-square", "uniform-motion"]
  },
  acceleration: {
    name: "加速度",
    cat: "运动",
    short: "速度“变得有多快”",
    plain: "加速度描述速度变化的快慢。伽利略发现：自由下落的物体，每秒钟速度的增加量是固定的——这就是“匀加速”。这是人类第一次把“变化率”当成研究对象。",
    analogy: "踩油门时车速越涨越快，加速度就是“涨得多快”的那股劲。",
    extra: "匀加速时，速度 v = a·t，位移 s = ½·a·t²。",
    page: "motion", anchor: "#freefall",
    related: ["free-fall", "velocity", "distance-time-square", "uniform-motion"]
  },
  "uniform-motion": {
    name: "匀速运动",
    cat: "运动",
    short: "速度不变、笔直往前走",
    plain: "匀速运动指速度大小和方向都不变的运动。伽利略把“匀速”当作运动的基准状态：物体不受干扰时会一直匀速走下去——这成了后来“惯性”的雏形。",
    analogy: "冰壶在冰面上滑出去，没人挡它就会一直滑；匀速，就是“不改主意”地往前。",
    page: "motion", anchor: "#incline",
    related: ["acceleration", "velocity", "inertia", "friction"]
  },
  "pisa-tower": {
    name: "比萨斜塔",
    cat: "运动",
    short: "传说中他做落体实验的地方",
    plain: "传说伽利略在比萨斜塔上同时丢下轻重不同的球，证明它们同时落地。这个故事真假有争议，但他确实用更巧妙的斜面实验得出了同样的结论。",
    analogy: "不管故事是真是假，核心结论都站得住：轻重一起掉，不分先后。",
    page: "motion", anchor: "#pisa",
    related: ["free-fall", "inclined-plane", "aristotle"]
  },
  velocity: {
    name: "速度",
    cat: "运动",
    short: "“多快”加“往哪”",
    plain: "速度描述物体运动的快慢和方向。伽利略第一次系统地把“速度—时间—距离”用数学关系写出来，开启了用公式研究运动的传统。",
    analogy: "说“时速 60 公里往北”，既说了多快、又说了往哪——这就是速度。",
    page: "motion", anchor: "#incline",
    related: ["acceleration", "uniform-motion", "distance-time-square"]
  },
  "distance-time-square": {
    name: "位移与时间平方成正比",
    cat: "运动",
    short: "时间翻倍，落下的距离翻四倍",
    plain: "伽利略最关键的发现之一：匀加速运动里，物体走过的距离 s 与时间 t 的平方成正比（s ∝ t²）。这意味着第 1 秒走 1 份，前 2 秒走 4 份，前 3 秒走 9 份……",
    analogy: "不是“时间×固定距离”，而是“时间的平方×固定距离”——越往后掉得越猛。",
    extra: "公式：s = ½·a·t²（a 为加速度）。",
    page: "motion", anchor: "#square",
    related: ["acceleration", "free-fall", "inclined-plane", "projectile"]
  },
  projectile: {
    name: "抛体运动",
    cat: "运动",
    short: "又平抛又下落，走出一条抛物线",
    plain: "伽利略指出：水平抛出的物体，一边匀速前进、一边匀加速下落，两条运动合起来走出一条抛物线。他第一次说清了炮弹、水花的飞行轨迹。",
    analogy: "往远处扔石子，它先平着飞、再往下坠，划出的弧线就是抛物线。",
    page: "motion", anchor: "#square",
    related: ["uniform-motion", "free-fall", "distance-time-square", "velocity"]
  },

  /* ---------------- 惯性 ---------------- */
  inertia: {
    name: "惯性",
    cat: "惯性",
    short: "物体“不想改变状态”的脾气",
    plain: "伽利略认为：一个物体在不受外力时，会保持原来的运动状态——静止的继续静止，运动的继续匀速直线运动。这推翻了“运动需要一直推”的旧想法，是牛顿第一定律的前身。",
    analogy: "桌上的杯子不动就一直不动；冰壶滑出去不碰墙就一直滑——物体天生“懒得变”。",
    page: "inertia", anchor: "#inertia",
    related: ["friction", "uniform-motion", "relativity-principle", "aristotle"]
  },
  "relativity-principle": {
    name: "相对性原理",
    cat: "惯性",
    short: "平稳船舱里，你测不出自己在动",
    plain: "伽利略提出：在一艘匀速直线行驶的密闭船舱里，做实验（例如让球下落）看到的现象，和船静止时完全一样。你没法靠这类实验判断船是停着还是匀速前进。",
    analogy: "平稳巡航的高铁上，你竖直抛钥匙会直上直下，和地面上一模一样——关起窗来分不清快慢。",
    page: "inertia", anchor: "#relativity",
    related: ["inertia", "ship-experiment", "uniform-motion", "friction"]
  },
  "ship-experiment": {
    name: "船舱思想实验",
    cat: "惯性",
    short: "用“想象一艘匀速的船”说清相对性",
    plain: "伽利略在《对话》里描写：船匀速前进时，舱里蝴蝶照飞、鱼照游、水滴照直落。这个思想实验说明——匀速运动本身不可察觉，只有“加速或转弯”才感觉得到。",
    analogy: "就像在平稳的电梯里蹦，你感觉不到楼在动，只觉得自己在蹦。",
    page: "inertia", anchor: "#ship",
    related: ["relativity-principle", "inertia", "uniform-motion"]
  },
  friction: {
    name: "摩擦",
    cat: "惯性",
    short: "让运动“慢下来”的那股阻力",
    plain: "伽利略意识到：现实中物体最终会停下，往往是因为地面摩擦、空气阻挡，而不是“天生不想动”。把摩擦理想化去掉，物体就能永远匀速——这才露出惯性的本来面目。",
    analogy: "冰壶在冰上滑得远、在沙地上立刻停，差别就在摩擦；没有摩擦，它会一直滑。",
    page: "inertia", anchor: "#friction",
    related: ["inertia", "uniform-motion", "relativity-principle"]
  },
  aristotle: {
    name: "亚里士多德",
    cat: "惯性",
    short: "两千年前的“权威”，但这次错在运动观",
    plain: "亚里士多德认为“重物下落更快”“运动要靠力一直推”。这些看法统治了欧洲近两千年。伽利略用实验和推理指出：在忽略阻力时，轻重落得一样快；运动不需要持续施力。",
    analogy: "老权威说“重的总是快”，伽利略拿斜坡和逻辑把这个说法拆了。",
    page: "inertia", anchor: "#inertia",
    related: ["inertia", "free-fall", "pisa-tower", "scientific-method"]
  },
  archimedes: {
    name: "阿基米德",
    cat: "惯性",
    short: "伽利略最佩服的“用数学看世界”的古人",
    plain: "阿基米德用严谨数学研究杠杆、浮力和平衡。伽利略奉他为榜样，主张物理结论必须用可测量的数学来表达，而不只是哲学辩论。",
    analogy: "伽利略想做的，就是把阿基米德那套“用数学算清楚”的方法，从静力学搬到运动学。",
    page: "inertia", anchor: "#friction",
    related: ["scientific-method", "mathematics", "uniform-motion"]
  },

  /* ---------------- 方法 ---------------- */
  "scientific-method": {
    name: "科学方法",
    cat: "方法",
    short: "用“观察+实验+数学”取代拍脑袋",
    plain: "伽利略被视为近代科学方法的奠基人：先观察自然，再做可控实验，最后用数学把规律写清楚，并接受反复检验。这把“自然哲学”变成了真正的科学。",
    analogy: "别人靠引经据典吵架，伽利略靠“做实验+算公式”定输赢。",
    page: "method", anchor: "#method",
    related: ["mathematics", "observation", "two-new-sciences", "aristotle"]
  },
  mathematics: {
    name: "数学化",
    cat: "方法",
    short: "把自然规律写成公式",
    plain: "伽利略有句名言：“自然之书是用数学语言写成的。”他认为物理真理必须能用几何与数字精确表达，而不是只做定性描述。",
    analogy: "看天不能只说“挺亮”，而要能算出“亮多少、怎么变”——用数字说话。",
    page: "method", anchor: "#method",
    related: ["scientific-method", "archimedes", "distance-time-square"]
  },
  observation: {
    name: "观测",
    cat: "方法",
    short: "拿证据说话的第一步",
    plain: "无论是望远镜看天，还是斜面计时，伽利略都强调：结论要从“看得到、量得出”的现象出发。观测，是他挑战旧权威的底气所在。",
    analogy: "先睁开眼仔细看，再开口下结论——这是他区别于空谈学者的最大特点。",
    page: "method", anchor: "#method",
    related: ["telescope", "scientific-method", "starry-messenger"]
  },
  "two-world-systems": {
    name: "《两大世界体系对话》",
    cat: "方法",
    short: "1632 年那本“日心 vs 地心”的辩论书",
    plain: "1632 年，伽利略出版《关于两大世界体系的对话》，借三人对话比较托勒密（地心）与哥白尼（日心）体系，字里行间力挺日心说。这本书直接招来了教会的审判。",
    analogy: "像一本“辩论现场实录”，三人对谈，但明眼人都看得出作者站哪边。",
    page: "method", anchor: "#dialogue",
    related: ["copernicus", "heliocentrism", "trial-1633", "dialogue"]
  },
  dialogue: {
    name: "对话录",
    cat: "方法",
    short: "他用“对话体”来讲科学",
    plain: "伽利略喜欢用三个人对话的形式写书（如支持日心说的《对话》），让不同观点交锋。这种写法既生动，又巧妙地表达了自己的立场。",
    analogy: "像用“圆桌讨论”讲科普，比干巴巴的论文好读得多。",
    page: "method", anchor: "#dialogue",
    related: ["two-world-systems", "two-new-sciences", "scientific-method"]
  },
  "two-new-sciences": {
    name: "《两种新科学》",
    cat: "方法",
    short: "晚年总结运动与材料力学的封笔之作",
    plain: "1638 年，已被软禁的伽利略出版《两种新科学》，系统总结了运动学（匀加速、抛体、斜面）和材料强度。这本书被视为近代物理学的真正起点，连牛顿都从中受益。",
    analogy: "相当于他把自己一辈子的“硬核发现”打包成教科书，传给了后人。",
    page: "method", anchor: "#newsciences",
    related: ["acceleration", "projectile", "inclined-plane", "house-arrest"]
  },
  "trial-1633": {
    name: "1633 年审判",
    cat: "方法",
    short: "因为支持日心说，他站上了宗教法庭",
    plain: "1633 年，宗教裁判所审判伽利略，认定他“强烈怀疑”地心说的观点有害，强迫他公开放弃日心说，并判处终身软禁。这是科学史与教会冲突的标志性事件。",
    analogy: "一个用望远镜看清事实的人，被要求当众说“我没看清”——知识与权力的正面碰撞。",
    page: "method", anchor: "#trial",
    related: ["church", "house-arrest", "two-world-systems", "heliocentrism"]
  },
  "house-arrest": {
    name: "软禁",
    cat: "方法",
    short: "审判后，他被“关在家里”做研究",
    plain: "1633 年审判后，伽利略被限制居住、不得随意外出讲学。但他仍在家中继续写书，1638 年完成《两种新科学》。",
    analogy: "人被困在院子里，脑子却没被关住，最重的成果反而诞生于此。",
    page: "method", anchor: "#trial",
    related: ["trial-1633", "two-new-sciences", "church"]
  },
  pendulum: {
    name: "摆",
    cat: "方法",
    short: "伽利略发现的“天然节拍器”",
    plain: "约 1583 年，年轻的伽利略观察比萨大教堂的吊灯摆动，发现不论摆幅大小，单次摆动用时几乎相同（等时性）。后来他提出摆的周期只与摆长有关、与质量无关。",
    analogy: "不管你推轻推重、推大推小，钟摆“滴答”的节奏都稳得像节拍器。",
    extra: "单摆周期 T = 2π·√(L/g)（L 摆长，g 重力加速度）。",
    page: "method", anchor: "#newsciences",
    related: ["two-new-sciences", "uniform-motion", "acceleration"]
  },
  church: {
    name: "教会",
    cat: "方法",
    short: "当时掌握“真理解释权”的力量",
    plain: "17 世纪，天主教会把“地心说”与教义绑在一起。伽利略支持日心说，触动了这套权威，最终被宗教裁判所审判。科学发展常常要与旧权威博弈。",
    analogy: "一边是望远镜里的真实，一边是几百年来的规定——伽利略卡在了中间。",
    page: "method", anchor: "#trial",
    related: ["trial-1633", "house-arrest", "heliocentrism"]
  },

  /* ---------------- 历史 ---------------- */
  "galileo-bio": {
    name: "伽利略·伽利雷",
    cat: "历史",
    short: "1564—1642，近代物理学之父",
    plain: "伽利略·伽利雷，意大利比萨人，天文学家、物理学家、哲学家。他把望远镜指向天空、用实验和数学重写运动学，被公认为“近代科学之父”。",
    analogy: "他像是把“看天”和“做实验”拧成一股绳的第一人。",
    page: "timeline", anchor: "",
    related: ["telescope", "scientific-method", "two-new-sciences", "trial-1633"]
  },
  "pisa-university": {
    name: "比萨大学",
    cat: "历史",
    short: "他读书、也教书的起点",
    plain: "伽利略少年时在比萨大学学医，后来却迷上数学与物理；1592 年前他曾任比萨大学数学教授，传说中的斜塔实验就发生在此时期。",
    analogy: "他的“老本行”是医学，结果半路改行，成了改写物理史的人。",
    page: "timeline", anchor: "#pisa",
    related: ["galileo-bio", "pisa-tower", "aristotle"]
  },
  padua: {
    name: "帕多瓦大学",
    cat: "历史",
    short: "他学术最自由的 18 年",
    plain: "1592—1610 年，伽利略在威尼斯共和国治下的帕多瓦大学任数学教授。这里比佛罗伦萨更自由，他完成了大量力学研究，也正是在此期间造出了望远镜。",
    analogy: "相当于他“最能放开手脚搞研究”的黄金岁月。",
    page: "timeline", anchor: "#padua",
    related: ["galileo-bio", "telescope", "inclined-plane"]
  },
  florence: {
    name: "佛罗伦萨",
    cat: "历史",
    short: "他晚年“御用”却也最危险的地方",
    plain: "1610 年后，伽利略移居托斯卡纳大公国首都佛罗伦萨，任“宫廷首席数学家”。地位更高，却也更靠近教会权力中心，最终在此酿成审判。",
    analogy: "从自由的大学，搬到有权有势的“总部”——名气更大，风险也更大。",
    page: "timeline", anchor: "#florence",
    related: ["galileo-bio", "trial-1633", "two-world-systems"]
  },
  "telescope-1609": {
    name: "1609 年造望远镜",
    cat: "历史",
    short: "听说了“荷兰管子”，他做出了更好的",
    plain: "1608 年荷兰人发明望远镜的消息传到意大利，1609 年伽利略自制出放大约 20 倍的版本并指向星空，开启天文学革命。",
    analogy: "别人发明了个玩具，他拿它干成了改变历史的大事。",
    page: "telescope", anchor: "#moons",
    related: ["telescope", "jupiter-moons", "starry-messenger"]
  },
  kepler: {
    name: "开普勒",
    cat: "历史",
    short: "同时代算出行星“椭圆轨道”的人",
    plain: "约翰内斯·开普勒与伽利略同时代，他提出行星沿椭圆轨道绕太阳运行。两人的工作互相印证，共同把日心说从“猜想”变成“可计算的体系”。",
    analogy: "伽利略负责“看见”卫星和相位，开普勒负责“算准”轨道——两人一拍即合。",
    page: "telescope", anchor: "#copernicus",
    related: ["copernicus", "heliocentrism", "jupiter-moons"]
  }
};

/* 详解页映射：术语弹窗的“了解更多”从这里取地址（相对子站根） */
window.SITE_PAGES = {
  telescope:  { title: "望远镜与天文发现", url: "detail/telescope.html" },
  motion:     { title: "自由落体与运动学", url: "detail/motion.html" },
  inertia:    { title: "惯性与相对性原理", url: "detail/inertia.html" },
  method:     { title: "科学方法与审判",   url: "detail/method.html" },
  timeline:   { title: "生平时间轴",       url: "timeline.html" }
};

/* 词典分类顺序 */
window.SITE_CATS = ["天文", "运动", "惯性", "方法", "历史"];
