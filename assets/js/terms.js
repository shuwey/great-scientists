/* =========================================================
   《读懂牛顿》术语数据库
   ---------------------------------------------------------
   short   : 弹窗顶部金句（一句话，最直白）
   plain   : 弹窗正文（2~3 句通俗解释）
   analogy : 生活类比（打比方，让初中生秒懂）
   page    : 关联详解页（optics / calculus / gravity / laws），无则 null
   related : 相关术语 id
   extra   : 可选补充（公式、单位、小知识）
   ========================================================= */
window.NEWTON_TERMS = {
  /* ---------------- 力学 ---------------- */
  inertia: {
    name: "惯性",
    cat: "力学",
    short: "物体“不想改变现状”的脾气",
    plain: "静止的东西想继续静止，运动的东西想继续按原来的速度和方向运动。除非有外力逼它，否则它不会自己变。",
    analogy: "公交车突然刹车，你的身体还会往前冲——不是有人推你，是你的身体想保持原来的速度。",
    extra: "惯性只和<span class='hl'>质量</span>有关：越重的东西，脾气越大，越难被改变。",
    page: "laws", anchor: "#law-first",
    related: ["mass", "force", "motion-state"]
  },
  mass: {
    name: "质量",
    cat: "力学",
    short: "一个物体含有多少“东西”",
    plain: "质量衡量物体里有多少物质，也衡量它有多“难被推动”。质量不随位置改变：在地球上、月球上，你的质量都一样。",
    analogy: "推一辆空购物车很轻松，装满矿泉水的就难推——后者的质量大得多。",
    extra: "单位：千克（kg）。注意别和“重量”搞混：<span class='hl'>重量</span>是引力的拉力，到了月球会变小。",
    page: "laws", anchor: "#law-second",
    related: ["weight", "inertia", "force"]
  },
  weight: {
    name: "重量",
    cat: "力学",
    short: "引力把物体往下拉的力",
    plain: "重量是一种<span class='hl'>力</span>，等于质量乘以重力加速度（G = mg）。同一个物体在月球上的重量只有地球上的六分之一，但质量没变。",
    analogy: "同样的你，站在月球上的体重秤读数会变成约 1/6——可你身上的“东西”一点没少。",
    extra: "单位：牛顿（N）。1 千克质量的物体在地球上的重量约 9.8 N。",
    page: "laws", anchor: "#law-second",
    related: ["mass", "gravity", "free-fall"]
  },
  force: {
    name: "力",
    cat: "力学",
    short: "推或拉",
    plain: "力能让物体加速、减速或变形。力有大小和方向，是个“箭头”（矢量）。要判断物体会怎么动，得把所有的力合起来看。",
    analogy: "两个人从两边推门，一边推得猛，门就往另一边转——比的是<span class='hl'>合力</span>（净力）。",
    extra: "单位：牛顿（N），正是为了纪念牛顿本人命名的。",
    page: "laws",
    related: ["net-force", "mass", "acceleration"]
  },
  "net-force": {
    name: "合力（净力）",
    cat: "力学",
    short: "所有力加在一起剩下的那部分",
    plain: "把作用在物体上的所有力按方向加减，剩下的总效果就是合力。合力为零时，物体保持原来的运动状态不变。",
    analogy: "拔河两边力气一样大，绳子纹丝不动——不是没有力，是合力为零。",
    extra: "这是牛顿第一定律和第二定律之间的关键桥梁。",
    page: "laws", anchor: "#law-first",
    related: ["force", "acceleration", "inertia"]
  },
  acceleration: {
    name: "加速度",
    cat: "力学",
    short: "速度变化的快慢",
    plain: "加速度不是“速度大”，而是“速度变化得快”。踩油门、踩刹车、转弯，都算加速——因为速度的大小或方向变了。",
    analogy: "高铁匀速跑 350 km/h 时你几乎没感觉，但起步那几秒会被按在椅背上——后者才是明显的加速度。",
    extra: "单位：米/秒²（m/s²）。地球表面自由落体的加速度约为 9.8 m/s²。",
    page: "laws", anchor: "#law-second",
    related: ["force", "mass", "velocity"]
  },
  velocity: {
    name: "速度",
    cat: "力学",
    short: "位置变化的快慢和方向",
    plain: "速度等于单位时间内走过的位移，既有大小（速率）也有方向。方向变了，速度也算变了。",
    analogy: "匀速转圈的旋转木马，速率一直不变，可速度一直在变——因为方向一直在变，所以它一直在加速。",
    page: "laws",
    related: ["acceleration", "motion-state"]
  },
  "motion-state": {
    name: "运动状态",
    cat: "力学",
    short: "物体此刻是静止、还是怎么动",
    plain: "运动状态由速度决定：静止、匀速直线、加速、转弯，各自是不同状态。改变运动状态，必须有力的参与。",
    analogy: "桌上的书静静待着，你不推它，它就永远待着——它的运动状态不需要“维持”，只有“改变”才需要力。",
    page: "laws", anchor: "#law-first",
    related: ["inertia", "force", "velocity"]
  },
  friction: {
    name: "摩擦力",
    cat: "力学",
    short: "接触面之间拖拉的力",
    plain: "两个物体互相接触并有相对运动（或想运动）时，接触面会产生阻碍的力。它的方向总是和运动趋势相反。",
    analogy: "冰壶在冰上能滑很远，在水泥地上推两下就停——因为冰面的摩擦力小得多。",
    extra: "牛顿第一定律之所以不好验证，就是因为地球上的摩擦力无处不在。",
    page: "laws", anchor: "#law-first",
    related: ["force", "net-force", "inertia"]
  },
  "reference-frame": {
    name: "参考系",
    cat: "力学",
    short: "你站在哪儿看这件事",
    plain: "描述运动要先选定一个“不动”的参照物。同一个运动，换参考系描述，结果可以不同。",
    analogy: "坐在匀速行驶的高铁上，你看桌上的水杯是静止的，但站在路边的人看它是飞驰的——两个人都没错。",
    extra: "牛顿力学在其中成立的参考系叫“惯性参考系”。",
    page: "laws", anchor: "#law-first",
    related: ["velocity", "motion-state"]
  },

  /* ---------------- 引力 ---------------- */
  gravity: {
    name: "万有引力",
    cat: "引力",
    short: "任何两个有质量的东西都会互相吸引",
    plain: "宇宙里任意两个有<span class='hl'>质量</span>的物体之间都存在吸引力。质量越大，吸得越强；离得越远，吸得越弱。",
    analogy: "你和同桌之间也有引力，只是你俩太轻了，这股力量小到完全感觉不到；换成地球这么大的家伙，就牢牢把你按在地上。",
    extra: "牛顿的突破不在于“发现引力”，而在于证明：天上的力和地上的力，是同一个力。",
    page: "gravity",
    related: ["inverse-square", "gravitational-constant", "orbit", "mass"]
  },
  "inverse-square": {
    name: "平方反比",
    cat: "引力",
    short: "距离翻倍，力只剩四分之一",
    plain: "引力的大小和距离的<span class='hl'>平方</span>成反比。距离变成 2 倍，力变成 1/4；变成 3 倍，力变成 1/9。",
    analogy: "离篝火越远越不暖，而且暖意掉得特别快——往后退几步，热的感觉就明显弱了。",
    extra: "公式里的 r² 就是这个意思：F ∝ 1 / r²。",
    page: "gravity", anchor: "#formula",
    related: ["gravity", "gravitational-constant", "orbit"]
  },
  "gravitational-constant": {
    name: "引力常数 G",
    cat: "引力",
    short: "引力有多“强”的换算系数",
    plain: "G 是一个小得惊人的数字（约 6.67×10⁻¹¹），它把质量和距离换算成具体的引力大小。因为 G 太小，日常物体之间的引力微弱到测不出。",
    analogy: "两个 50 kg 的人相距 1 米，彼此的引力大约只有 0.00000017 牛顿——比一粒灰尘的重量还小得多。",
    extra: "G 的数值是牛顿之后 100 多年，由卡文迪什在实验室里测出来的。牛顿本人并不知道 G 的具体数值。",
    page: "gravity", anchor: "#formula",
    related: ["gravity", "inverse-square", "mass"]
  },
  orbit: {
    name: "轨道",
    cat: "引力",
    short: "一直“掉下去却永远掉不到”的路",
    plain: "天体在引力作用下不断向中心“下落”，但它同时有横向速度，结果就是一圈圈绕着转，永远掉不下去。",
    analogy: "你用绳子拴着小球甩圈：绳子一直在把球往里拉，球却始终没砸到你手上——因为它的横向速度让它不断“错过”中心。",
    extra: "月球其实一直在朝地球掉落，只是它横向跑得快，每掉一点就“错过”了地球。",
    page: "gravity", anchor: "#story",
    related: ["gravity", "escape-velocity", "free-fall", "velocity"]
  },
  "escape-velocity": {
    name: "逃逸速度",
    cat: "引力",
    short: "彻底甩掉引力所需的最低速度",
    plain: "从天体表面出发，要完全摆脱它的引力（再也不回来），出发速度必须超过一个临界值。地球表面约为 11.2 km/s。",
    analogy: "往上扔球，扔得慢会落回来；要是能扔得极快（还不考虑空气阻力），它就一去不回头了。",
    extra: "这也是为什么火箭要那么大——把速度加到 11.2 km/s 需要巨量燃料。",
    page: "gravity", anchor: "#try",
    related: ["gravity", "orbit", "velocity"]
  },
  "free-fall": {
    name: "自由落体",
    cat: "引力",
    short: "只受引力作用的坠落",
    plain: "忽略空气阻力时，任何物体无论轻重，下落的加速度都一样（约 9.8 m/s²）。羽毛和铁球在真空里会同时落地。",
    analogy: "牛顿的洞见：让苹果落地的力，和拽住月球的力，是同一种力——差别只在高度和速度。",
    page: "gravity", anchor: "#story",
    related: ["gravity", "acceleration", "weight", "orbit"]
  },
  tide: {
    name: "潮汐",
    cat: "引力",
    short: "月亮把海水“拎”起来",
    plain: "月球对地球不同位置的引力大小不同（近处强、远处弱），这个差别把海水拉成两头凸起的形状，地球自转一圈就经历两次涨潮。",
    analogy: "想象把一团橡皮泥朝月亮的方向轻轻拉长——两头鼓、中间瘪。",
    extra: "牛顿第一次用<span class='hl'>万有引力</span>解释了潮汐的成因，这是《原理》最漂亮的应用之一。",
    page: "gravity", anchor: "#impact",
    related: ["gravity", "inverse-square", "orbit"]
  },
  "center-of-mass": {
    name: "质心",
    cat: "引力",
    short: "整个物体质量“集中”的那一点",
    plain: "分析运动时可以把整个物体看成质量全部集中在一个点上，这个点叫质心。引力计算里，两个物体之间的 r 就是质心之间的距离。",
    analogy: "不规则形状的纸板，用一根手指顶住某一点它能平稳平衡——那个点就是它的质心。",
    extra: "牛顿在《原理》里严格证明了：均匀球体对外吸引时，可以看作全部质量集中在球心。",
    page: "gravity", anchor: "#formula",
    related: ["mass", "gravity", "orbit"]
  },

  /* ---------------- 光学 ---------------- */
  prism: {
    name: "棱镜",
    cat: "光学",
    short: "能把白光“拆开”的玻璃块",
    plain: "通常是三角形的玻璃。不同颜色的光在玻璃里“拐弯”的角度不同，穿过棱镜后就分成了彩虹色的光带。",
    analogy: "像一组并排的跑道：红光跑得偏一点，紫光偏得更多，冲出终点时就散开了。",
    extra: "牛顿的关键实验叫“判决性实验”：他让分出来的单色光再过一次棱镜，颜色不再变化，证明颜色是光本身的属性。",
    page: "optics",
    related: ["dispersion", "spectrum", "white-light", "refraction"]
  },
  dispersion: {
    name: "色散",
    cat: "光学",
    short: "不同颜色偏折程度不一样的现象",
    plain: "同一种介质（如玻璃）对不同颜色的光“阻力”不同，紫光偏折最多、红光偏折最少，于是混在一起的白光被拆开。",
    analogy: "一群人斜着从水泥路走进沙地：跑得慢的人偏得更多，队伍就被拉斜、散开了。",
    page: "optics", anchor: "#story",
    related: ["prism", "spectrum", "chromatic-aberration", "refraction"]
  },
  spectrum: {
    name: "光谱",
    cat: "光学",
    short: "拆开后按顺序排好的彩色光带",
    plain: "白光被<span class='hl'>色散</span>后，按红、橙、黄、绿、蓝、靛、紫的顺序排列成带，这就是光谱。牛顿最早把它系统地记录下来。",
    analogy: "就像把混在一起的颜料重新分成原来的七支单色笔。",
    extra: "牛顿把光谱分成七色，是为了和音乐里的七个音阶对应——这是他的个人趣味，实际的颜色是连续过渡的。",
    page: "optics", anchor: "#story",
    related: ["prism", "dispersion", "white-light"]
  },
  "white-light": {
    name: "白光（复色光）",
    cat: "光学",
    short: "很多颜色混在一起的混合光",
    plain: "太阳光看起来是白的，其实是各种颜色的光混合的结果。反过来，把光谱重新合起来，又变回白光。",
    analogy: "把七支彩笔快速旋转，看起来就是一片灰白——混合速度快，眼睛就分不出来了。",
    extra: "牛顿之前，人们普遍认为“白光是纯净的，棱镜把光染了色”。牛顿用实验推翻了这个看法。",
    page: "optics", anchor: "#story",
    related: ["spectrum", "prism", "dispersion"]
  },
  refraction: {
    name: "折射",
    cat: "光学",
    short: "光从一种介质进另一种时“拐弯”",
    plain: "光在水和玻璃里比在空气中走得慢，斜着进入时会改变方向。筷子插进水杯里看起来“折断”了，就是这个原因。",
    analogy: "轮椅斜着从水泥地冲进草地：先接触草地的一侧轮子变慢，整个方向就被“掰”过去了。",
    page: "optics", anchor: "#story",
    related: ["dispersion", "prism", "reflection"]
  },
  reflection: {
    name: "反射",
    cat: "光学",
    short: "光被表面弹回来",
    plain: "光遇到光滑表面会按“入射角等于反射角”的规律弹回。镜子能成像，靠的就是这个。",
    analogy: "打台球撞库边：球以多大角度撞上去，就以多大角度弹出来。",
    extra: "牛顿的望远镜用<span class='hl'>凹面镜</span>代替透镜聚光，巧妙避开了色差问题。",
    page: "optics", anchor: "#telescope",
    related: ["reflecting-telescope", "refraction", "chromatic-aberration"]
  },
  "chromatic-aberration": {
    name: "色差",
    cat: "光学",
    short: "透镜成像带彩色边的毛病",
    plain: "因为<span class='hl'>色散</span>，透镜对不同颜色的光聚焦位置不同，成像边缘就会出现彩色模糊。当时所有折射望远镜都有这个问题。",
    analogy: "就像几张不同颜色的照片没对准，叠在一起边上露出彩边。",
    extra: "牛顿一度认为色差无解，于是转向反射望远镜。后来人们用不同玻璃组合（消色差透镜）解决了它。",
    page: "optics", anchor: "#telescope",
    related: ["dispersion", "reflecting-telescope", "reflection"]
  },
  "reflecting-telescope": {
    name: "反射望远镜",
    cat: "光学",
    short: "用镜子代替透镜的望远镜",
    plain: "牛顿 1668 年发明。用凹面镜聚光、再用一块小平面镜把像折到镜筒侧面观察。因为反射不产生<span class='hl'>色散</span>，图像没有色差。",
    analogy: "望远镜从“透过玻璃看”改成“用镜子反光看”，彩虹边就没了。",
    extra: "今天世界上绝大多数大型天文望远镜，用的都是牛顿开创的这个原理。",
    page: "optics", anchor: "#telescope",
    related: ["reflection", "chromatic-aberration", "dispersion"]
  },
  "newtons-rings": {
    name: "牛顿环",
    cat: "光学",
    short: "镜片叠在一起出现的同心圆条纹",
    plain: "把一块凸透镜压在平板玻璃上，会看到一圈圈彩色或明暗相间的同心圆环。这是光的波动性造成的干涉现象。",
    analogy: "两块玻璃之间有一层极薄的空气“楔子”，光在里面来回反射后相互叠加或抵消。",
    extra: "有趣的是：牛顿观察到了它，却用错误的“光微粒说”解释它——正确的波动解释要等到 19 世纪。",
    page: "optics", anchor: "#misread",
    related: ["corpuscular-theory", "reflection"]
  },
  "corpuscular-theory": {
    name: "光的微粒说",
    cat: "光学",
    short: "牛顿主张的“光是小颗粒”理论",
    plain: "牛顿认为光由极小的微粒组成，能解释反射和折射，但解释不了干涉、衍射。18 世纪它因牛顿的威望而成为主流。",
    analogy: "把光想成一串飞快的小弹珠，撞到镜面就弹开。",
    extra: "这是牛顿少有的“站错队”：19 世纪托马斯·杨和菲涅耳用波动说推翻了它，20 世纪又发展出“波粒二象性”。",
    page: "optics", anchor: "#misread",
    related: ["newtons-rings", "reflection", "ether"]
  },

  /* ---------------- 数学 ---------------- */
  tangent: {
    name: "切线",
    cat: "数学",
    short: "刚好擦过曲线那一点的方向",
    plain: "切线是在某一点上与曲线“同方向”的直线。它描述曲线在这一点的<span class='hl'>瞬时方向</span>，也就是变化率。",
    analogy: "你甩绳子上的小球，绳子突然断开，球会沿着那一刻的切线方向直飞出去。",
    page: "calculus", anchor: "#story",
    related: ["rate-of-change", "derivative", "curve"]
  },
  "rate-of-change": {
    name: "变化率",
    cat: "数学",
    short: "一个量随另一个量变化得有多快",
    plain: "把某段时间内的变化量除以这段时间，就是平均变化率；时间取得无限短，就叫瞬时变化率。速度就是位置的变化率。",
    analogy: "汽车速度表显示的 60 km/h，就是“位置”在“时间”上的变化率。",
    extra: "微积分解决的问题之一：当“时间段”短到接近 0 时，怎么还算得出来？答案就是微分。",
    page: "calculus",
    related: ["tangent", "derivative", "infinitesimal", "velocity"]
  },
  derivative: {
    name: "导数（微分）",
    cat: "数学",
    short: "瞬时变化率",
    plain: "导数就是<span class='hl'>变化率</span>在某一瞬间的精确值。几何上它等于曲线在该点<span class='hl'>切线</span>的斜率。",
    analogy: "拍视频时截取一帧：那一瞬间车“正在以多快的速度”前进，就是导数。",
    extra: "牛顿管它叫“流数”（fluxion）——随时间流动的量，其流动的速度。",
    page: "calculus",
    related: ["rate-of-change", "tangent", "fluxion", "integration"]
  },
  integration: {
    name: "积分",
    cat: "数学",
    short: "把无数小块加起来的技术",
    plain: "积分用来求不规则形状的面积、体积、或者一段时间内的累积量。做法是先切成很多小块求和，再让小块无限变薄。",
    analogy: "要算一片弯曲湖面的面积，就把它切成很多细长条，每条当成长方形算面积再加起来；条越细越准。",
    extra: "牛顿最关键的洞见：积分和<span class='hl'>导数</span>互为逆运算——这就是“微积分基本定理”。",
    page: "calculus",
    related: ["derivative", "infinitesimal", "area", "fluxion"]
  },
  area: {
    name: "曲线下面积",
    cat: "数学",
    short: "不规则图形怎么算面积",
    plain: "用一组窄条去“填满”曲线下方的区域，把每条近似当矩形求和。牛顿证明了：当窄条无限变窄，这个和会趋向一个确定的值。",
    analogy: "给一个圆形的花坛铺地砖，地砖越小越贴合边缘，空隙就越小。",
    extra: "这个“逼近”的想法，是微积分的基石之一。",
    page: "calculus", anchor: "#story",
    related: ["integration", "infinitesimal", "limit"]
  },
  infinitesimal: {
    name: "无穷小",
    cat: "数学",
    short: "比任何正数都小，却不是零",
    plain: "微积分里把变化切成一个个“无限小”的碎片来处理。这个概念当时引发了长达两百年的争论，直到 19 世纪才用<span class='hl'>极限</span>严格化。",
    analogy: "把一根绳子无限次对折，每段越来越短——但只要你还在“切”，每段就还是一段绳子，不是“没有”。",
    extra: "贝克莱主教曾嘲讽无穷小是“已死量的幽灵”。严格的极限定义 19 世纪才由柯西等人给出。",
    page: "calculus", anchor: "#story",
    related: ["limit", "derivative", "integration", "fluxion"]
  },
  limit: {
    name: "极限",
    cat: "数学",
    short: "无限靠近，但不一定到达",
    plain: "极限描述一个量“无限趋近”的目标值。它是现代微积分的严格基础，用来定义导数和积分。",
    analogy: "你每次走到离墙距离的一半：0.5 米、0.25 米、0.125 米……你永远碰不到墙，但你的位置的极限就是墙。",
    page: "calculus", anchor: "#story",
    related: ["infinitesimal", "derivative", "integration"]
  },
  fluxion: {
    name: "流数",
    cat: "数学",
    short: "牛顿给“导数”起的原名",
    plain: "牛顿把变化的量叫“流量”（fluent），把它的变化速度叫“流数”（fluxion），记作在字母上方加一点（如 ẋ）。",
    analogy: "牛顿的记法是“点的语言”，莱布尼茨的 dy/dx 是“比的语言”——后者更好用，流传至今。",
    extra: "今天我们用的 ∫ 和 dy/dx 都来自莱布尼茨，但思想与牛顿是同一套。",
    page: "calculus", anchor: "#priority",
    related: ["derivative", "calculus-priority", "integration"]
  },
  function: {
    name: "函数",
    cat: "数学",
    short: "一个量随另一个量变化的规则",
    plain: "给定一个输入，就有一个确定的输出，这种对应关系叫函数。微积分研究的就是函数怎么变、变多快、累积了多少。",
    analogy: "自动售货机：按下哪个按钮（输入），就掉出对应的饮料（输出）。",
    page: "calculus",
    related: ["curve", "rate-of-change", "derivative"]
  },
  curve: {
    name: "曲线",
    cat: "数学",
    short: "函数画出来的图",
    plain: "把函数的输入输出画在坐标系里，得到的图形就是曲线。曲线的陡峭程度对应<span class='hl'>导数</span>，曲线下方的区域对应<span class='hl'>积分</span>。",
    analogy: "把一条曲线想成一段山路：坡度陡的地方导数大，平缓的地方导数小。",
    page: "calculus",
    related: ["tangent", "area", "function", "derivative"]
  },

  /* ---------------- 历史与人物 ---------------- */
  "plague-years": {
    name: "奇迹年（奇迹岁月）",
    cat: "历史",
    short: "瘟疫停课回家的两年，他完成了大半辈子的成就",
    plain: "1665 年伦敦大瘟疫，剑桥停课。23 岁的牛顿回到乡下老家，在 1665–1667 年间做出了微积分、光学和万有引力的最初突破。",
    analogy: "相当于大学被迫休学两年，在家自学，结果顺手改写了好几个学科。",
    extra: "牛顿自己回忆：“在那两年里，我正处于发明的盛年，对数学和哲学的思考，比此后任何时候都多。”",
    page: null,
    related: ["principia", "fluxion", "gravity"]
  },
  principia: {
    name: "《自然哲学的数学原理》",
    cat: "历史",
    short: "1687 年出版的“物理学第一本书”",
    plain: "简称《原理》，用拉丁文写成。书中提出三大运动定律和万有引力定律，第一次用数学把天上和地上的运动统一起来。",
    analogy: "在牛顿之前，“苹果为什么落地”和“行星为什么绕太阳”是两个问题；《原理》之后，它们是同一个问题。",
    extra: "全书用几何证明写成，一个代数公式都没有——因为当时欧洲数学界更认几何。",
    page: "gravity",
    related: ["gravity", "halley", "royal-society", "newton-laws"]
  },
  "newton-laws": {
    name: "牛顿三大运动定律",
    cat: "历史",
    short: "惯性定律、加速度定律、作用反作用定律",
    plain: "第一定律讲“不变”的条件，第二定律给出 F=ma 的定量关系，第三定律说明力总是成对出现。三条合起来，构成了经典力学的基础。",
    analogy: "第一定律说“没人管就一直这样”，第二定律说“管得多用力就变多快”，第三定律说“你推别人，别人同时也在推你”。",
    page: "laws",
    related: ["inertia", "force", "acceleration", "principia"]
  },
  halley: {
    name: "埃德蒙·哈雷",
    cat: "历史",
    short: "把《原理》催生出来的人",
    plain: "1684 年，哈雷专程到剑桥请教牛顿：“如果引力按距离平方反比衰减，行星轨道会是什么形状？”牛顿当场答：“椭圆。”哈雷追问，牛顿答不上来，于是重新算了一遍——算着算着，写成了《原理》。",
    analogy: "一句话的提问，换来了一本书。哈雷还自掏腰包付了出版费。",
    extra: "哈雷用牛顿的理论预言了那颗后来以他命名的彗星的回归。",
    page: "gravity", anchor: "#story",
    related: ["principia", "royal-society", "gravity", "orbit"]
  },
  hooke: {
    name: "罗伯特·胡克",
    cat: "历史",
    short: "与牛顿缠斗一生的对手",
    plain: "胡克是皇家学会的实验主管，在光学和引力上都与牛顿激烈争论。他声称自己先提出了平方反比思想，牛顿则长期视他为眼中钉。",
    analogy: "学术圈里最典型的“谁先想到”之争——当时没有论文预印本，很难说清。",
    extra: "牛顿那句“如果说我看得更远，那是因为我站在巨人的肩膀上”，常被解读为对身材矮小的胡克的暗讽。",
    page: null,
    related: ["royal-society", "calculus-priority", "inverse-square"]
  },
  "calculus-priority": {
    name: "微积分发明权之争",
    cat: "历史",
    short: "牛顿和莱布尼茨谁先发明",
    plain: "牛顿在 1660 年代就做出了微积分，但没有发表；莱布尼茨在 1670 年代独立做出并先发表。双方支持者互相指控抄袭，闹了几十年。",
    analogy: "两人各自算出了同一道题，一个先做完没交卷，一个先交卷——后来历史认定：两人各自独立发明。",
    extra: "今天数学史的共识是：牛顿先发明、莱布尼茨先发表，彼此独立。我们用的符号来自莱布尼茨。",
    page: "calculus", anchor: "#priority",
    related: ["fluxion", "hooke", "infinitesimal"]
  },
  "royal-society": {
    name: "英国皇家学会",
    cat: "历史",
    short: "世界上最老的科学学会之一",
    plain: "成立于 1660 年，牛顿 1672 年因反射望远镜的成果被选为会员，1703 年起担任会长直到去世。",
    analogy: "相当于当时英国科学家的“俱乐部”，牛顿后来当了二十多年会长。",
    page: null,
    related: ["halley", "hooke", "principia"]
  },
  "mint": {
    name: "皇家造币厂",
    cat: "历史",
    short: "牛顿的“第二职业”",
    plain: "1696 年牛顿离开剑桥前往伦敦，担任造币厂监管，后来升为厂长。他极其认真地打击假币，据说曾伪装成酒客去搜集伪币犯的证据。",
    analogy: "一个大科学家转行去当金融监管，而且干得相当较真。",
    page: null,
    related: ["knighthood", "plague-years"]
  },
  knighthood: {
    name: "封爵",
    cat: "历史",
    short: "1705 年，科学家第一次因科学获此荣誉",
    plain: "安妮女王授予牛顿爵士头衔。这是英国历史上第一次有人主要因为科学贡献而被封为爵士，抬高了科学家的社会地位。",
    analogy: "就像今天给科学家颁发国家级最高荣誉，而且这是头一回。",
    page: null,
    related: ["mint", "royal-society"]
  },
  alchemy: {
    name: "炼金术",
    cat: "历史",
    short: "牛顿花了一辈子时间的“副业”",
    plain: "牛顿留下的手稿中，关于炼金术和神学的字数远超物理学。他希望通过炼金实验揭示物质的本质，这在当时与化学的诞生纠缠在一起。",
    analogy: "今天看来是“伪科学”，但在 17 世纪，炼金术和化学还没有分家。",
    extra: "了解这一点，是为了破除“牛顿是完美理性机器”的神话——他是个充满好奇心、也会走弯路的真人。",
    page: null,
    related: ["theology", "ether"]
  },
  theology: {
    name: "神学与《圣经》研究",
    cat: "历史",
    short: "牛顿的另一半手稿在写上帝",
    plain: "牛顿是虔诚（但不正统）的基督徒，写过大量神学手稿，研究过《圣经》年代学和《启示录》，他持有的一些观点在当时属于异端。",
    analogy: "他留下的笔记本里，一半在算行星轨道，一半在推算《圣经》年代。",
    extra: "在他看来，研究自然规律和研究上帝创造的世界，是同一件事的两面。",
    page: null,
    related: ["alchemy", "principia"]
  },
  ether: {
    name: "以太",
    cat: "历史",
    short: "一种被证明不存在的“介质”",
    plain: "当时人们认为光需要某种介质才能传播，就假想了一种看不见、摸不着、充满空间的物质叫以太。牛顿后期也倾向于这种想法。",
    analogy: "像空气之于声音——人们想当然地认为光也得有东西“托着”才能传。",
    extra: "19 世纪末的迈克尔逊-莫雷实验没有找到以太，爱因斯坦的狭义相对论彻底抛弃了它。",
    page: "optics", anchor: "#misread",
    related: ["corpuscular-theory", "newtons-rings"]
  },
  "lucasian-professor": {
    name: "卢卡斯数学教授席位",
    cat: "历史",
    short: "牛顿在剑桥的教职",
    plain: "1669 年，年仅 26 岁的牛顿接任剑桥卢卡斯数学教授。这个席位后来由霍金担任，是科学史上最有名的教席之一。",
    analogy: "相当于 26 岁就当上了剑桥的“数学首席教授”，后来霍金坐过同一把椅子。",
    page: null,
    related: ["plague-years", "trinity-college"]
  },
  "trinity-college": {
    name: "剑桥三一学院",
    cat: "历史",
    short: "牛顿待了三十多年的地方",
    plain: "1661 年牛顿以“减费生”身份入学——靠为富家子弟做杂务抵扣学费。他在这里度过了大半学术生涯。",
    analogy: "牛顿入学时是“打工换学费”的穷学生身份，和富家子弟同堂上课。",
    page: null,
    related: ["lucasian-professor", "plague-years"]
  },
  "apple-story": {
    name: "苹果落地的故事",
    cat: "历史",
    short: "半真半假的传说",
    plain: "牛顿被苹果砸到头的故事广为流传，但更接近事实的版本是：他在老家果园里看到苹果落下，开始思考“为什么它总是直直落向地心”。这个故事由牛顿本人晚年讲述，被后人不断加工。",
    analogy: "苹果大概没有砸到他头上，但确实“砸”出了一个问题：这个拉力能延伸多远？一直到月球那么远吗？",
    extra: "关键不在苹果，在于牛顿问出了那个别人没问的问题。",
    page: "gravity", anchor: "#story",
    related: ["gravity", "orbit", "free-fall", "plague-years"]
  }
};

/* 详解页元信息（供弹窗底部"了解更多"与卡片渲染使用） */
window.NEWTON_PAGES = {
  optics:   { title: "光学与颜色", url: "detail/optics.html",   icon: "🔬", color: "#0CA678" },
  calculus: { title: "微积分",     url: "detail/calculus.html", icon: "📐", color: "#3B5BDB" },
  gravity:  { title: "万有引力",   url: "detail/gravity.html",  icon: "🌙", color: "#7048E8" },
  laws:     { title: "三大运动定律", url: "detail/laws.html",   icon: "🎯", color: "#E8590C" }
};

/* 术语分类顺序（供词典页分组） */
window.NEWTON_CATS = ["力学", "引力", "光学", "数学", "历史"];
