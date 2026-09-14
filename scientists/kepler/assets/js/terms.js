/* 《读懂开普勒》术语数据库（引擎通用：SITE_TERMS/SITE_PAGES/SITE_CATS） */
window.SITE_TERMS = {
  "ellipse-orbit": {
    name: "椭圆轨道",
    cat: "天文",
    short: "行星走的不是正圆，是椭圆",
    plain: "开普勒第一定律：每颗行星沿椭圆轨道运行，太阳位于椭圆的一个焦点上。椭圆比圆“扁”一点，却更贴合真实观测。",
    analogy: "把正圆的“O”轻轻压扁成“0”，行星的轨迹就对了。",
    page: "laws", anchor: "#law1",
    related: ["kepler-first", "focus", "heliocentrism"]
  },
  "focus": {
    name: "焦点",
    cat: "天文",
    short: "椭圆里那两个特殊点之一",
    plain: "椭圆有两个焦点。开普勒把太阳放在其中一个焦点上，而不是椭圆中心——于是行星时近时远。至于近时快、远时慢，是第二定律说的：连线在相等时间扫过相等面积。",
    analogy: "椭圆像被两端钉住的橡皮圈，那两个钉子就是焦点。",
    page: "laws", anchor: "#law1",
    related: ["ellipse-orbit", "kepler-first"]
  },
  "kepler-first": {
    name: "第一定律",
    cat: "天文",
    short: "轨道是椭圆，太阳在焦点",
    plain: "行星沿椭圆运行，太阳位于其中一个焦点。它打破了“天体必走正圆”的古老信念。",
    analogy: "以前非要让行星走“正圆跑道”，开普勒改成了“椭圆跑道”。",
    page: "laws", anchor: "#law1",
    related: ["ellipse-orbit", "focus", "kepler-second"]
  },
  "kepler-second": {
    name: "第二定律",
    cat: "天文",
    short: "等时扫等面积",
    plain: "行星和太阳的连线在相等时间内扫过相等面积。结果是近太阳时快、远太阳时慢。",
    analogy: "甩动系着石子的绳子，离手近时石子明显掠得快——一个道理。",
    page: "laws", anchor: "#law2",
    related: ["area-law", "ellipse-orbit"]
  },
  "area-law": {
    name: "面积定律",
    cat: "天文",
    short: "另一种说法的第二定律",
    plain: "“面积定律”是第二定律的别称：太阳—行星连线单位时间扫过的面积恒定。它量化了“近快远慢”。",
    analogy: "同一把“扇子”，无论扇面胖瘦，面积都一样大。",
    page: "laws", anchor: "#law2",
    related: ["kepler-second"]
  },
  "kepler-third": {
    name: "第三定律",
    cat: "天文",
    short: "T² ∝ a³",
    plain: "行星公转周期的平方，正比于它到太阳平均距离的立方。离太阳越远，转一圈所需时间增长得比距离更快。",
    analogy: "离灯越远的小虫，绕一圈要花的时间，比“距离变远”涨得还快。",
    page: "laws", anchor: "#law3",
    related: ["harmonic-law", "period"]
  },
  "harmonic-law": {
    name: "调和定律",
    cat: "天文",
    short: "第三定律的雅称",
    plain: "开普勒把第三定律称作“调和定律”，因为它揭示出行星运动里藏着像音乐一样的比例与和谐。",
    analogy: "宇宙像一架大乐器，每颗行星都在按固定的比例“发声”。",
    page: "laws", anchor: "#law3",
    related: ["kepler-third", "period"]
  },
  "period": {
    name: "公转周期",
    cat: "天文",
    short: "绕太阳一圈要多久",
    plain: "一颗行星绕太阳运行一周的时间，叫公转周期。地球的周期约 365 天，火星约 687 天。",
    analogy: "周期就是“跑完操场一圈用了多少秒”。",
    page: "laws", anchor: "#law3",
    related: ["kepler-third", "orbit"]
  },
  "why-kepler": {
    name: "从数据到定律",
    cat: "方法",
    short: "不是拍脑袋，是算出来的",
    plain: "开普勒的定律来自对数以千计的观测点反复拟合，而非先入为主的哲学。这种“让数据说话”的态度，是现代科学的标志。",
    analogy: "先收集一堆散点，再找那条最贴合的线——而不是先画线再改数据。",
    page: "laws", anchor: "#why",
    related: ["scientific-method", "observation-precision"]
  },
  "tycho": {
    name: "第谷·布拉赫",
    cat: "历史",
    short: "用肉眼做出最精密记录的人",
    plain: "丹麦天文学家第谷在没有望远镜的时代，靠精心设计的仪器做出极高精度的恒星与行星位置记录，后来全给了开普勒。",
    analogy: "没 microscope 的“超级视力”：他用尺子和耐心，量出了别人量不到的精度。",
    page: "mars", anchor: "#tycho",
    related: ["mars-planet", "observation-precision", "rudolphine"]
  },
  "mars-planet": {
    name: "火星",
    cat: "天文",
    short: "开普勒的“试金石”",
    plain: "火星轨道偏心率最大、最偏离正圆，最难用圆拟合。开普勒拿它反复试错，最终逼出了椭圆。",
    analogy: "最倔强的学生，反而逼出了老师最好的教法。",
    page: "mars", anchor: "#tycho",
    related: ["eight-years", "ellipse-orbit"]
  },
  "eight-years": {
    name: "八年计算",
    cat: "方法",
    short: "为火星耗掉的青春",
    plain: "开普勒为拟合火星轨道反复计算了近八年，试过圆、本轮、各种组合，才接受椭圆。科学常是长时间的“笨功夫”。",
    analogy: "同一个错题本，改了八年，终于改对了一道大题。",
    page: "mars", anchor: "#eight",
    related: ["scientific-method", "mars-planet"]
  },
  "ptolemaic": {
    name: "托勒密体系",
    cat: "宇宙观",
    short: "地心+本轮的旧框架",
    plain: "古代托勒密体系用“地球居中+本轮”拟合天体运动。开普勒发现，连哥白尼的正圆也套不住火星——必须换椭圆。",
    analogy: "旧地图怎么描都描不准，不是你画功差，是底图错了。",
    page: "mars", anchor: "#circle",
    related: ["geocentrism"]
  },
  "observation-precision": {
    name: "精密观测",
    cat: "方法",
    short: "差一点点也不放过",
    plain: "第谷的观测精度达角分级别。正是这“一点点”误差，让开普勒无法用圆蒙混过关，只能改换椭圆。",
    analogy: "秤准了，才知道“差不多”其实差很多。",
    page: "mars", anchor: "#tycho",
    related: ["tycho", "scientific-method"]
  },
  "scientific-method": {
    name: "科学方法",
    cat: "方法",
    short: "假设—数据—修正",
    plain: "开普勒的工作是现代科学方法的范本：先有模型，再用观测检验，不符就改模型，直到吻合。",
    analogy: "先猜一个答案，拿事实去撞，撞歪了就调，直到严丝合缝。",
    page: "mars", anchor: "#ellipse",
    related: ["why-kepler", "eight-years"]
  },
  "eye-optics": {
    name: "眼睛成像",
    cat: "物理",
    short: "视网膜上的倒像",
    plain: "开普勒说明：光线经晶状体折射，在视网膜上形成倒立的像，大脑再把它“正过来”。这是近代视觉理论的开端。",
    analogy: "相机底片拍的是倒的，照片洗出来才正——眼睛也类似。",
    page: "optics", anchor: "#eye",
    related: ["refraction", "lens"]
  },
  "lens": {
    name: "透镜",
    cat: "物理",
    short: "会聚与发散的光学元件",
    plain: "凸透镜把光会聚、凹透镜把光发散。开普勒用透镜组合解释望远镜的放大原理。",
    analogy: "放大镜把阳光聚成一个小亮点，就是透镜在“收拢”光线。",
    page: "optics", anchor: "#lens",
    related: ["telescope-kepler", "refraction"]
  },
  "telescope-kepler": {
    name: "望远镜",
    cat: "物理",
    short: "把远方拉近的管子",
    plain: "开普勒分析了望远镜的光路：物镜收集远方光线、目镜放大视角。他推进的“开普勒式”结构沿用至今。",
    analogy: "两个透镜接力，把远处的星星“搬”到眼前。",
    page: "optics", anchor: "#lens",
    related: ["lens", "refraction"]
  },
  "refraction": {
    name: "折射",
    cat: "物理",
    short: "光“拐弯”的规律",
    plain: "光从一种介质进入另一种（如空气到水）时会偏折，叫折射。开普勒研究其数学描述，为光学打下基础。",
    analogy: "筷子插进水里看着弯了，就是折射在捣鬼。",
    page: "optics", anchor: "#refraction",
    related: ["lens", "eye-optics"]
  },
  "camera-obscura": {
    name: "暗箱",
    cat: "物理",
    short: "小孔成像的小黑箱",
    plain: "暗箱是一个有小孔的黑箱，外面的景象透过小孔倒映在箱内。开普勒研究它，是摄影与相机原理的前身。",
    analogy: "一个纸箱加一根针孔，就能把窗外“画”到箱壁上一一最早的相机。",
    page: "optics", anchor: "#camera",
    related: ["eye-optics", "refraction"]
  },
  "rudolphine": {
    name: "鲁道夫星表",
    cat: "历史",
    short: "开普勒编的精确星表",
    plain: "1627 年出版的鲁道夫星表，融合第谷观测与开普勒定律，是当时最准的行星与恒星位置表，用了上百年。",
    analogy: "相当于给全星空做了一本“精确到分钟的时刻表”。",
    page: "rudolphine", anchor: "#inherit",
    related: ["tycho", "logarithm", "predict-comet"]
  },
  "logarithm": {
    name: "对数",
    cat: "方法",
    short: "把乘除变加减",
    plain: "对数能把复杂的乘除运算变成简单的加减。开普勒用它，在手算时代完成了星表所需的海量计算。",
    analogy: "本来要背九九乘法表到很大，对数让你“加一加”就得到答案。",
    page: "rudolphine", anchor: "#log",
    related: ["rudolphine", "star-catalog"]
  },
  "predict-comet": {
    name: "预言天体",
    cat: "方法",
    short: "能算未来，才算真懂",
    plain: "星表的价值在于能预报行星、彗星的位置。可验证、可预言，是科学理论有用的标志。",
    analogy: "能告诉你“明天日出于几点”的表，才比一张风景画有用。",
    page: "rudolphine", anchor: "#predict",
    related: ["rudolphine", "star-catalog"]
  },
  "star-catalog": {
    name: "星表",
    cat: "天文",
    short: "星星的“通讯录”",
    plain: "星表系统记录恒星与行星的位置。好的星表是导航、历法和天文学研究的基石。",
    analogy: "把上千颗星的家庭住址都记在一本册子里，随查随用。",
    page: "rudolphine", anchor: "#legacy",
    related: ["rudolphine", "logarithm"]
  },
  "copernicus": {
    name: "哥白尼",
    cat: "历史",
    short: "日心说的提出者",
    plain: "哥白尼把太阳请回中心，开普勒则把他的圆改成椭圆，让日心说从“猜想”变成“可计算的精确体系”。",
    analogy: "哥白尼画了草图，开普勒把它改成了精确的建筑图纸。",
    page: "mars", anchor: "#ellipse",
    related: ["heliocentrism", "kepler-first"]
  },
  "heliocentrism": {
    name: "日心说",
    cat: "宇宙观",
    short: "太阳居中，地球绕日",
    plain: "日心说认为太阳静止在中心，地球与其他行星绕它运行。开普勒的椭圆定律，是日心说最坚实的数学骨架。",
    analogy: "把客厅吊灯当成中心，家具都绕着它摆——日心说就是这么摆的。",
    page: "laws", anchor: "#law1",
    related: ["ellipse-orbit", "copernicus"]
  },
  "newton": {
    name: "牛顿",
    cat: "历史",
    short: "用引力解释开普勒",
    plain: "牛顿后来用万有引力与运动定律，解释了“为什么行星会按开普勒定律运行”。定律有了因果根基。",
    analogy: "开普勒说“行星沿椭圆走”，牛顿回答了“凭什么走椭圆”。",
    page: "laws", anchor: "#why",
    related: ["gravity", "kepler-third"]
  },
  "gravity": {
    name: "引力",
    cat: "天文",
    short: "让天体彼此吸引的力",
    plain: "牛顿之后，太阳靠引力“拉住”行星，使它们沿开普勒椭圆运行。定律从此不只是几何，而是有因果的物理。",
    analogy: "看不见的橡皮筋，把行星拴在太阳身边。",
    page: "laws", anchor: "#why",
    related: ["newton", "kepler-first"]
  },
  "orbit": {
    name: "轨道",
    cat: "天文",
    short: "天体运行的路径",
    plain: "天体绕中心体运行的路径叫轨道。在开普勒之前人们以为轨道必是正圆，他证明是椭圆。",
    analogy: "操场上的跑道就是地球的“轨道”。",
    page: "laws", anchor: "#law1",
    related: ["ellipse-orbit", "period"]
  },
  "geocentrism": {
    name: "地心说",
    cat: "宇宙观",
    short: "地球居中，万物绕它",
    plain: "地心说认为地球静止在宇宙中心。开普勒的工作，是日心说彻底取代地心说的关键一步。",
    analogy: "把自家院子当成全世界的中心——直觉自然，却经不起细算。",
    page: "mars", anchor: "#circle",
    related: ["ptolemaic", "heliocentrism"]
  }
};

window.SITE_PAGES = {
  laws: { title: "三大定律：把天空写成公式", url: "detail/laws.html" },
  mars: { title: "火星：八年的纠缠", url: "detail/mars.html" },
  optics: { title: "光学：眼睛、透镜与暗箱", url: "detail/optics.html" },
  rudolphine: { title: "鲁道夫星表：星空的使用说明书", url: "detail/rudolphine.html" }
};

window.SITE_CATS = ["天文", "物理", "方法", "历史", "宇宙观"];