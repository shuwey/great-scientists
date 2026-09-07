/* 《读懂哥白尼》术语数据库（引擎通用：SITE_TERMS/SITE_PAGES/SITE_CATS） */
window.SITE_TERMS = {
  "heliocentrism": {
    name: "日心说",
    cat: "宇宙观",
    short: "太阳，而不是地球，坐在宇宙中心",
    plain: "日心说认为太阳静止在中心，地球和其他行星一起绕太阳转。它取代了统治千年的地心说，是科学史上最大的观念翻盘之一。",
    analogy: "以前以为自己是客厅正中的主角；日心说告诉我们：咱们只是绕着吊灯转的一盏小灯。",
    page: "heliocentric", anchor: "#solar",
    related: ["geocentrism", "earth-orbit", "sun", "kepler"]
  },
  "geocentrism": {
    name: "地心说",
    cat: "宇宙观",
    short: "地球静止在宇宙中心，万物绕它转",
    plain: "地心说认为地球不动、位居中心，日月星辰都绕地球运行。它统治了欧洲近两千年，代表人物是托勒密。",
    analogy: "把自家院子当成全世界的中心——直觉上很自然，却经不起细算。",
    page: "copernican", anchor: "#before",
    related: ["ptolemaic", "heliocentrism", "paradigm-shift"]
  },
  "ptolemaic": {
    name: "托勒密体系",
    cat: "宇宙观",
    short: "用地心+本轮硬凑出行星轨迹",
    plain: "托勒密把地心说写成精巧的数学：行星在大圆（均轮）上再套小圆（本轮）运动，用复杂结构拟合观测。它能算得相当准，却越来越臃肿。",
    analogy: "为了证明“地球不动”，不得不在天上画一层又一层的圆圈。",
    page: "copernican", anchor: "#before",
    related: ["geocentrism", "epicycle", "heliocentrism"]
  },
  "epicycle": {
    name: "本轮",
    cat: "天文",
    short: "套在轨道上的小圆圈",
    plain: "本轮是托勒密体系里的小圆：行星先绕一个小圆转，小圆的中心再绕大圆转。靠叠加足够多的本轮，可以逼近真实的复杂轨迹。",
    analogy: "像在旋转木马上再转一圈——两层转叠加出拐弯的效果。",
    page: "heliocentric", anchor: "#evidence",
    related: ["ptolemaic", "retrograde"]
  },
  "retrograde": {
    name: "行星逆行",
    cat: "天文",
    short: "行星偶尔“倒着走”的错觉",
    plain: "从地球看，外行星有时会短暂“向后”移动，再恢复向前。地心说要用本轮硬凑；日心说里这只是地球公转超车外行星时的视角错觉。",
    analogy: "你坐快车超过慢车时，对方好像在往后退——其实它还在往前。",
    page: "heliocentric", anchor: "#evidence",
    related: ["epicycle", "earth-orbit", "heliocentrism"]
  },
  "earth-orbit": {
    name: "地球公转",
    cat: "天文",
    short: "地球每年绕太阳一圈",
    plain: "哥白尼让地球沿近似圆形的轨道每年绕太阳一圈，这带来了寒来暑往的一年。公转是日心说成立的关键动作之一。",
    analogy: "地球像在操场上绕旗杆慢跑，一年正好一圈。",
    page: "earthmotion", anchor: "#orbit",
    related: ["earth-spin", "earth-axis", "heliocentrism"]
  },
  "earth-spin": {
    name: "地球自转",
    cat: "天文",
    short: "地球每天自己转一圈",
    plain: "哥白尼让地球绕地轴每天转一圈，于是有了昼夜。我们看到的太阳东升西落，其实是地球在“翻身”。",
    analogy: "你坐在旋转椅上转一圈，窗外的景就“绕着你转”——可真正动的是椅子。",
    page: "earthmotion", anchor: "#spin",
    related: ["earth-orbit", "earth-axis"]
  },
  "earth-axis": {
    name: "地轴倾斜",
    cat: "天文",
    short: "地球斜着身子转，约23.5°",
    plain: "地轴相对公转轨道面倾斜约 23.5°。正是这点倾斜，让南北半球接受到的阳光随季节变化，形成春夏秋冬。",
    analogy: "一个斜着转的陀螺，顶面朝向会随位置变化——四季就这么来的。",
    page: "earthmotion", anchor: "#axis",
    related: ["earth-spin", "earth-orbit"]
  },
  "sun": {
    name: "太阳",
    cat: "天文",
    short: "太阳系的中心恒星",
    plain: "在日心说里，太阳静止在中心，是所有行星绕转的引力中心（引力的完整解释要等牛顿）。哥白尼把太阳请回了“C位”。",
    analogy: "太阳是操场的旗杆，地球是绕它跑的那个人。",
    page: "heliocentric", anchor: "#solar",
    related: ["heliocentrism", "earth-orbit"]
  },
  "planet-order": {
    name: "行星次序",
    cat: "天文",
    short: "水金地火木土，由近及远",
    plain: "哥白尼排定了行星由近及远的次序：水星、金星、地球、火星、木星、土星。这个次序让亮度与逆行的变化有了自然的解释。",
    analogy: "把跑道按里圈到外圈编号，谁快谁慢一目了然。",
    page: "heliocentric", anchor: "#solar",
    related: ["heliocentrism", "earth-orbit"]
  },
  "celestial-sphere": {
    name: "恒星天",
    cat: "天文",
    short: "包裹一切的最外层天球",
    plain: "哥白尼仍沿用“最外层是恒星天”的旧框架，认为恒星固定在遥远的天球上。他没料到恒星其实远得难以想象，也不绕地球转。",
    analogy: "像把一个大圆顶扣在宇宙最外面，星星都钉在顶上。",
    page: "heliocentric", anchor: "#solar",
    related: ["heliocentrism", "sun"]
  },
  "paradigm-shift": {
    name: "范式转换",
    cat: "方法",
    short: "不是改答案，是换看问题的方式",
    plain: "哥白尼带来的不是某个新数据，而是观察起点的整体更换：从“地球为中心”到“地球只是行星”。这种整体框架的更替，后来被库恩称为“范式转换”。",
    analogy: "不是把地图改个地名，而是把“上北下南”换成了另一种坐标。",
    page: "copernican", anchor: "#shift",
    related: ["geocentrism", "heliocentrism", "renaissance"]
  },
  "model": {
    name: "数学模型",
    cat: "方法",
    short: "用圆和公式把天文写成可算的题",
    plain: "哥白尼相信天体运行能用几何与数字精确描述。他用圆周运动建模行星轨道，让“天怎么动”变成可以计算的题目。",
    analogy: "把天象翻译成一组公式，像给宇宙写使用说明书。",
    page: "revolutionibus", anchor: "#math",
    related: ["mathematics", "de-revolutionibus"]
  },
  "mathematics": {
    name: "数学化",
    cat: "方法",
    short: "把自然规律写成公式",
    plain: "哥白尼继承“自然之书用数学语言写成”的信念：物理真理必须能用几何与数字表达，而不只是定性描述。",
    analogy: "看天不能只说“挺亮”，而要能算出“亮多少、怎么变”。",
    page: "revolutionibus", anchor: "#math",
    related: ["model", "observation"]
  },
  "observation": {
    name: "观测",
    cat: "方法",
    short: "拿证据说话的第一步",
    plain: "哥白尼长期用天文仪器（如星盘、象限仪）记录行星位置。他的体系建立在长期、细致的观测数据之上，而非空想。",
    analogy: "先睁眼仔细量，再开口下结论。",
    page: "revolutionibus", anchor: "#content",
    related: ["model", "mathematics"]
  },
  "de-revolutionibus": {
    name: "《天体运行论》",
    cat: "历史",
    short: "1543 年那本改变天文学的书",
    plain: "哥白尼在 1543 年出版《天体运行论》，系统给出日心体系与全套数学推导，标志着现代天文学的开端。",
    analogy: "相当于给宇宙发了一份正式的“新版说明书”。",
    page: "revolutionibus", anchor: "#book",
    related: ["heliocentrism", "banned", "mathematics"]
  },
  "banned": {
    name: "被列为禁书",
    cat: "历史",
    short: "因为“说地球会动”",
    plain: "起初教会反应平淡；直到伽利略用日心说挑战权威，这本书才在 1616 年被列为禁书，两个多世纪后才解除。",
    analogy: "一个科学结论，曾因“不合旧观念”而被封口。",
    page: "revolutionibus", anchor: "#ban",
    related: ["de-revolutionibus", "galileo", "church"]
  },
  "renaissance": {
    name: "文艺复兴",
    cat: "历史",
    short: "重新打量古典、也敢质疑权威的时代",
    plain: "哥白尼生活在文艺复兴时期，人们重新研究古希腊文献、也重新敢于用理性审视旧权威。这种氛围，给了日心说生长的土壤。",
    analogy: "一个大家都在“重新翻老书、也敢提新问题”的开明时代。",
    page: "copernican", anchor: "#before",
    related: ["paradigm-shift", "humanism"]
  },
  "humanism": {
    name: "人文主义",
    cat: "历史",
    short: "把人重新放回思考的中心",
    plain: "文艺复兴的人文主义重视人的理性与古典学问。它间接鼓励学者用自己的观察和推理，而非只引经据典。",
    analogy: "少背教条、多用自己的眼睛和脑子。",
    page: "copernican", anchor: "#shift",
    related: ["renaissance", "paradigm-shift"]
  },
  "kepler": {
    name: "开普勒",
    cat: "历史",
    short: "把圆改成椭圆的人",
    plain: "开普勒在哥白尼之后提出行星沿椭圆轨道绕日，并给出周期与距离的定量定律，把日心说从“猜想的圆”变成“可计算的椭圆”。",
    analogy: "哥白尼画了草图，开普勒把它改成了精确的建筑图纸。",
    page: "copernican", anchor: "#after",
    related: ["heliocentrism", "ellipse", "newton"]
  },
  "ellipse": {
    name: "椭圆轨道",
    cat: "天文",
    short: "行星走的不是正圆，是椭圆",
    plain: "开普勒发现行星轨道是椭圆、太阳位于其中一个焦点。这比哥白尼的正圆更准确地吻合观测，也奠定了天体力学。",
    analogy: "把正圆的“O”轻轻压扁成“0”，轨迹就对了。",
    page: "copernican", anchor: "#after",
    related: ["kepler", "heliocentrism"]
  },
  "galileo": {
    name: "伽利略",
    cat: "历史",
    short: "用望远镜为日心说找证据",
    plain: "伽利略用望远镜看到木星卫星、金星盈亏，成为日心说的强力证据；他也因此与教会冲突。他接过了哥白尼点燃的引线。",
    analogy: "哥白尼提出猜想，伽利略拿望远镜去“现场取证”。",
    page: "copernican", anchor: "#after",
    related: ["heliocentrism", "telescope", "kepler"]
  },
  "telescope": {
    name: "望远镜",
    cat: "天文",
    short: "把人类的眼睛伸向星空",
    plain: "伽利略之后的望远镜观测，让日心说从纸面计算变成肉眼可验证的事实。哥白尼时代还没有望远镜，他的证据更多是几何上的简洁。",
    analogy: "哥白尼用脑子算出了答案，后来的人才用管子亲眼看见。",
    page: "copernican", anchor: "#after",
    related: ["galileo", "heliocentrism"]
  },
  "newton": {
    name: "牛顿",
    cat: "历史",
    short: "用引力把一切统一",
    plain: "牛顿用万有引力与运动定律，解释了为什么行星会绕太阳转。哥白尼的“日心”终于有了力学根基。",
    analogy: "哥白尼说“地球在绕太阳转”，牛顿回答了“凭什么转”。",
    page: "copernican", anchor: "#after",
    related: ["kepler", "heliocentrism", "gravity"]
  },
  "gravity": {
    name: "引力",
    cat: "天文",
    short: "让天体彼此吸引的力",
    plain: "牛顿之后，太阳靠引力“拉住”行星，使它们绕日运行。日心说从此不只是几何模型，而是有因果的物理理论。",
    analogy: "看不见的橡皮筋，把行星拴在太阳身边。",
    page: "copernican", anchor: "#after",
    related: ["newton", "heliocentrism"]
  },
  "church": {
    name: "教会",
    cat: "历史",
    short: "当时掌握“真理解释权”的力量",
    plain: "16—17 世纪，天主教会把地心说与教义绑在一起。日心说动摇了这套权威，因此招致抵制与审判。",
    analogy: "一边是望远镜里的真实，一边是几百年来的规定。",
    page: "revolutionibus", anchor: "#ban",
    related: ["banned", "galileo"]
  },
  "canon": {
    name: "教士",
    cat: "历史",
    short: "哥白尼的“正职”",
    plain: "哥白尼大半生担任神职人员（教士/ canon），有稳定收入与时间钻研天文。科学研究，是他“业余”的热爱。",
    analogy: "白天是神职人员，夜里是数星星的人。",
    related: ["frombork", "copernicus-bio"]
  },
  "frombork": {
    name: "弗龙堡",
    cat: "历史",
    short: "他观测星空的地方",
    plain: "哥白尼在波罗的海边的弗龙堡（Frombork）居住、行医并观测天象，他的许多计算就完成于这里的塔楼。",
    analogy: "他真正的“天文台”，是一座位海边小城的塔楼。",
    related: ["canon", "copernicus-bio"]
  },
  "copernicus-bio": {
    name: "尼古拉·哥白尼",
    cat: "历史",
    short: "1473—1543，日心说提出者",
    plain: "波兰天文学家，提出日心说、写就《天体运行论》，被公认为现代天文学与科学革命的起点人物。",
    analogy: "他像是悄悄把“地球从宇宙中心”请下来的人。",
    related: ["heliocentrism", "de-revolutionibus", "torun"]
  },
  "torun": {
    name: "托伦",
    cat: "历史",
    short: "哥白尼的出生地",
    plain: "哥白尼 1473 年生于波兰托伦（Toruń）一个商人家庭。这座中世纪老城至今仍以他为荣。",
    analogy: "一切的起点，是一座维斯瓦河畔的小城。",
    related: ["copernicus-bio"]
  },
  "krakow": {
    name: "克拉科夫大学",
    cat: "历史",
    short: "他最早求学的地方",
    plain: "哥白尼在克拉科夫大学接触天文学与数学，那里是当时波兰学术的中心，点燃了他对星空的兴趣。",
    analogy: "他“入坑”天文的第一站。",
    related: ["copernicus-bio", "bolonga"]
  },
  "bolonga": {
    name: "博洛尼亚/帕多瓦",
    cat: "历史",
    short: "他留学意大利，学法律也学天文",
    plain: "哥白尼曾赴意大利的博洛尼亚、帕多瓦等地求学，接触了更前沿的天文学与古希腊文献，日心说的种子在此萌芽。",
    analogy: "在意大利，他既拿了法学学位，也偷偷把天文底子打厚了。",
    related: ["krakow", "copernicus-bio"]
  },
  "copernican-timid": {
    name: "谨慎的发表",
    cat: "方法",
    short: "他犹豫了很久才出书",
    plain: "哥白尼担心日心说招来非议，书稿长期未公开发表，直到友人催促、且以“假设”口吻写作，才在晚年付印。",
    analogy: "一个颠覆性的想法，被他小心翼翼地揣在怀里很多年。",
    page: "revolutionibus", anchor: "#book",
    related: ["de-revolutionibus", "paradigm-shift"]
  }
};

window.SITE_PAGES = {
  heliocentric: { title: "日心说：太阳坐到中心", url: "detail/heliocentric.html" },
  revolutionibus: { title: "《天体运行论》", url: "detail/revolutionibus.html" },
  earthmotion: { title: "地球真的在动", url: "detail/earthmotion.html" },
  copernican: { title: "哥白尼革命", url: "detail/copernican.html" }
};

window.SITE_CATS = ["天文", "宇宙观", "方法", "历史"];