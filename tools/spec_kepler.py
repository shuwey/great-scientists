# -*- coding: utf-8 -*-
"""开普勒子站内容规格。运行后生成 spec_kepler.json。"""
import json, os

SPEC = {
  "id": "kepler",
  "name": "开普勒",
  "en": "Johannes Kepler",
  "years": "1571–1630",
  "kicker": "行星定律之父 · 1571—1630",
  "lede": "他用了八年算火星，终于承认：行星走的不是正圆，是椭圆。三条定律，把哥白尼的草图变成了精确蓝图。",
  "meta": "读懂开普勒：用中学生能听懂的话，讲清三大定律如何把天体运动写成可计算的公式。",
  "biotitle": "他看不见，却算清了星空",
  "bio": [
    "约翰内斯·开普勒（1571—1630），德国人。他体弱、视力不好，却有一双能看穿数字的眼睛。",
    "他先做教士、后当老师，一边教数学一边琢磨星空。命运让他继承了第谷留下的、当时最精确的观测数据——这是他一生最大的运气。",
    "他一生穷困、颠沛，却在草稿纸上一遍遍逼近真理：行星沿椭圆运行，且离太阳越近跑得越快。"
  ],
  "portrait": "kepler-portrait.jpg",
  "about_claim": "本页说明开普勒子站内容的依据与延伸去处。",
  "about_body": "<h2>资料来源</h2><p>本子站内容依据公开史料与科学史通识编写，核心事实（生卒、三大定律、鲁道夫星表）与主流科学史一致。历史图片均来自 Wikimedia Commons 公有领域资源。</p><h2>延伸阅读</h2><p>想深入：开普勒《新天文学》（Astronomia Nova）、《宇宙和谐论》（Harmonices Mundi）；以及《开普勒的假说》（麦克雷）了解其思想脉络。</p>",
  "tl_desc": "从魏尔村的病弱少年到鲁道夫星表的作者：开普勒一生的关键节点。",
  "tl_claim": "1571 年出生，1630 年逝于雷根斯堡。他用八年算火星换来的椭圆，至今仍是天体力学的基础。",
  "cats": ["天文", "物理", "方法", "历史", "宇宙观"],
  "hero_scene": "ellipse_orbit",
  "hero_params": {"label": "行星沿椭圆轨道绕日，太阳在焦点"},

  "pages": {
    "laws": {
      "title": "三大定律：把天空写成公式",
      "file": "detail/laws.html",
      "claim": "椭圆轨道、面积速度、周期平方比——三条定律把行星运动彻底变成了可以算的数学。",
      "tags": ["三大定律", "椭圆", "天体力学"],
      "year": "1609–1619",
      "card": "行星走椭圆、近太阳快、周期平方正比于距离立方——三句话写尽天体运动。",
      "scene": "ellipse_orbit",
      "scene_params": {"label": "开普勒第一定律：椭圆轨道"},
      "remember": "一句话记住：开普勒把“天体必走正圆”的执念打破，换来了能精确预报的定律。",
      "sideterms": ["kepler-first", "kepler-second", "kepler-third", "ellipse-orbit", "focus", "heliocentrism", "newton", "gravity"],
      "sections": [
        {"id": "law1", "h": "一、第一定律：轨道是椭圆", "body": "开普勒发现，行星不是沿完美的圆、而是沿椭圆运行，太阳位于椭圆的一个焦点上。这一下子甩掉了“天体必须走正圆”的千年执念。",
         "fig": "laws", "figalt": "椭圆轨道与焦点", "figcap": "太阳不在中心，而在一个焦点上——所以行星时近时远。至于近时快、远时慢，原因在第二定律：连线在相等时间里扫过相等的面积。"},
        {"id": "law2", "h": "二、第二定律：近快远慢", "body": "行星和太阳的连线，在相等时间里扫过相等的面积。于是行星靠近太阳时跑得快、远离时慢。这解释了为什么同样一段弧，用时却不一样。",
         "figalt": "面积速度相等", "figcap": "等时扫等面积：连线扫过的“扇子”面积始终一样大。"},
        {"id": "law3", "h": "三、第三定律：周期与距离", "body": "行星公转周期的平方，正比于它到太阳平均距离的立方（T² ∝ a³）。离太阳越远，转一圈所需时间增长得比距离本身更快。",
         "figalt": "周期—距离关系", "figcap": "T² = k·a³：一条把“距离”和“周期”锁在一起的简单公式。"},
        {"id": "why", "h": "四、为什么是革命", "body": "三条定律全是“从数据里长出来”的：不是先想当然，而是被观测逼出来的。它们让天文学从“描述天体怎么走”跨入“计算天体怎么走”，也为后来牛顿的引力做好了铺垫。",
         "figalt": "从数据到定律", "figcap": "先有精确观测，再有简洁定律——这是现代科学的典型路径。"}
      ]
    },
    "mars": {
      "title": "火星：八年的纠缠",
      "file": "detail/mars.html",
      "claim": "为了算准火星，开普勒废掉圆、试了无数椭圆，终于让理论误差从 8 分降到 2 分以内。",
      "tags": ["火星", "第谷", "椭圆", "观测"],
      "year": "约1600–1609",
      "card": "八年算一颗火星，让他承认：圆不通，椭圆才通。",
      "scene": "orbit",
      "scene_params": {"label": "火星绕日的椭圆轨道"},
      "remember": "一句话记住：科学有时不是“想出新点子”，而是“舍不得丢掉那一小点误差”。",
      "sideterms": ["tycho", "mars-planet", "eight-years", "ptolemaic", "observation-precision", "scientific-method", "copernicus"],
      "sections": [
        {"id": "tycho", "h": "一、第谷留下的宝藏", "body": "丹麦天文学家第谷·布拉赫用肉眼（那时望远镜尚未发明）做出了史上最精确的恒星与行星位置记录。他去世后，这些资料落到开普勒手里——这是开普勒最大的运气。",
         "fig": "mars", "figalt": "第谷的精密观测", "figcap": "没有第谷的数据，就没有开普勒的定律。"},
        {"id": "eight", "h": "二、八年的计算", "body": "开普勒拿火星“开刀”，是因为火星轨道偏心率最大、最不圆，最能检验理论。他反反复复算，试图用圆和本轮去拟合，却总差那么一点。",
         "figalt": "反复试错的计算", "figcap": "火星是最“倔”的行星，逼出了真相。"},
        {"id": "circle", "h": "三、圆，就是不通", "body": "按托勒密和哥白尼的传统，天体该走正圆。但开普勒发现：无论怎么调圆和本轮，理论位置和第谷的观测都差约 8 角分——而他相信第谷的误差绝不可能这么大。",
         "figalt": "圆轨道对不上观测", "figcap": "8 角分的偏差，成了压垮“正圆”的最后一根稻草。"},
        {"id": "ellipse", "h": "四、椭圆，通了", "body": "开普勒大胆换用椭圆，让太阳坐在焦点上，误差立刻降到 2 角分以内，与观测吻合。一个小小的形状改变，换来了天空的精确秩序。",
         "figalt": "椭圆贴合观测", "figcap": "把“圆”轻轻压扁成“椭圆”，一切就对了。"}
      ]
    },
    "optics": {
      "title": "光学：眼睛、透镜与暗箱",
      "file": "detail/optics.html",
      "claim": "开普勒不光算行星，还写成了近代光学的奠基之作——解释了眼睛怎么成像、望远镜怎么工作。",
      "tags": ["光学", "望远镜", "折射", "眼睛"],
      "year": "约1604–1611",
      "card": "他弄清了眼睛如何成像，也帮望远镜说清了原理。",
      "scene": "wave",
      "scene_params": {"label": "光沿直线传播与折射"},
      "remember": "一句话记住：同一个爱算星空的人，也把“我们怎么看见东西”算明白了。",
      "sideterms": ["eye-optics", "lens", "telescope-kepler", "refraction", "camera-obscura"],
      "sections": [
        {"id": "eye", "h": "一、眼睛如何成像", "body": "在《光学补遗》里，开普勒描述：光线通过晶状体在视网膜上形成倒立的像，大脑再把它“正过来”。这是近代视觉理论的起点。",
         "fig": "optics", "figalt": "眼睛成像示意", "figcap": "光进入眼睛，在视网膜上投出倒立的像。"},
        {"id": "lens", "h": "二、透镜与望远镜", "body": "他研究凸透镜与凹透镜如何组合放大远处物体，解释了当时新出现的望远镜为什么能望远。今天中学显微镜、望远镜的光路，仍沿用他的分析。",
         "figalt": "透镜组合", "figcap": "两片透镜一组合，远处的星星就被拉近了。"},
        {"id": "refraction", "h": "三、折射的规律", "body": "开普勒探讨了光从一种介质进入另一种时偏折（折射）的现象，并尝试用数学描述它。虽然完整的折射定律由后来者给出，他已铺好了路。",
         "figalt": "光的折射", "figcap": "光“拐弯”不是随意的，而是有规律的。"},
        {"id": "camera", "h": "四、暗箱与成像", "body": "他分析了“暗箱”（小孔成像）等现象，把光学从哲学思辨拉向可测量的几何。近代摄影与相机的原理，正是这条线索的延续。",
         "figalt": "暗箱成像", "figcap": "一个黑箱子加一个小孔，就能把外面世界画进来。"}
      ]
    },
    "rudolphine": {
      "title": "鲁道夫星表：星空的使用说明书",
      "file": "detail/rudolphine.html",
      "claim": "他花二十多年，用第谷的数据和自创的定律，编出史上最准的星表——航海与天文用了上百年。",
      "tags": ["星表", "对数", "第谷", "遗产"],
      "year": "1627 出版",
      "card": "一张表，把上千颗星的位置算到前所未有的准。",
      "scene": "orbit",
      "scene_params": {"label": "星表预测行星位置"},
      "remember": "一句话记住：定律再美，也得落到“明天行星在哪”这种能查的表上，才算真有用。",
      "sideterms": ["rudolphine", "logarithm", "predict-comet", "star-catalog", "tycho"],
      "sections": [
        {"id": "inherit", "h": "一、接过第谷的遗产", "body": "星表以皇帝鲁道夫命名，根基却是第谷毕生的观测。开普勒把老师的数据、自己的椭圆定律和大量计算熔于一炉。",
         "fig": "rudolphine", "figalt": "鲁道夫星表", "figcap": "数据来自第谷，骨架来自开普勒的定律。"},
        {"id": "log", "h": "二、用对数省下力气", "body": "当时刚发明的对数，让海量的乘除变成加减。开普勒大量使用对数表，才在手工计算的时代完成了这种规模的运算。",
         "figalt": "对数简化运算", "figcap": "对数的出现，等于给天文学家发了台“手摇计算机”。"},
        {"id": "predict", "h": "三、能预言，才好用", "body": "星表不仅能回放历史记录，还能预报行星、彗星的位置。它成了航海与天文观测的实用工具，被沿用了上百年。",
         "figalt": "预言天体位置", "figcap": "能预言未来位置的表，才是真有用的表。"},
        {"id": "legacy", "h": "四、星表的遗产", "body": "鲁道夫星表是近代天文学的里程碑：它第一次把“观测—定律—预言”连成闭环。后来的牛顿，正是在这样的精度上验证自己的引力理论。",
         "figalt": "星表的长久影响", "figcap": "一张表，撑起了此后百年的天文与航海。"}
      ]
    }
  },

  "terms": {
    "ellipse-orbit": {"name": "椭圆轨道", "cat": "天文", "short": "行星走的不是正圆，是椭圆", "plain": "开普勒第一定律：每颗行星沿椭圆轨道运行，太阳位于椭圆的一个焦点上。椭圆比圆“扁”一点，却更贴合真实观测。", "analogy": "把正圆的“O”轻轻压扁成“0”，行星的轨迹就对了。", "page": "laws", "anchor": "#law1", "related": ["kepler-first", "focus", "heliocentrism"]},
    "focus": {"name": "焦点", "cat": "天文", "short": "椭圆里那两个特殊点之一", "plain": "椭圆有两个焦点。开普勒把太阳放在其中一个焦点上，而不是椭圆中心——于是行星时近时远。至于近时快、远时慢，是第二定律说的：连线在相等时间扫过相等面积。", "analogy": "椭圆像被两端钉住的橡皮圈，那两个钉子就是焦点。", "page": "laws", "anchor": "#law1", "related": ["ellipse-orbit", "kepler-first"]},
    "kepler-first": {"name": "第一定律", "cat": "天文", "short": "轨道是椭圆，太阳在焦点", "plain": "行星沿椭圆运行，太阳位于其中一个焦点。它打破了“天体必走正圆”的古老信念。", "analogy": "以前非要让行星走“正圆跑道”，开普勒改成了“椭圆跑道”。", "page": "laws", "anchor": "#law1", "related": ["ellipse-orbit", "focus", "kepler-second"]},
    "kepler-second": {"name": "第二定律", "cat": "天文", "short": "等时扫等面积", "plain": "行星和太阳的连线在相等时间内扫过相等面积。结果是近太阳时快、远太阳时慢。", "analogy": "甩动系着石子的绳子，离手近时石子明显掠得快——一个道理。", "page": "laws", "anchor": "#law2", "related": ["area-law", "ellipse-orbit"]},
    "area-law": {"name": "面积定律", "cat": "天文", "short": "另一种说法的第二定律", "plain": "“面积定律”是第二定律的别称：太阳—行星连线单位时间扫过的面积恒定。它量化了“近快远慢”。", "analogy": "同一把“扇子”，无论扇面胖瘦，面积都一样大。", "page": "laws", "anchor": "#law2", "related": ["kepler-second"]},
    "kepler-third": {"name": "第三定律", "cat": "天文", "short": "T² ∝ a³", "plain": "行星公转周期的平方，正比于它到太阳平均距离的立方。离太阳越远，转一圈所需时间增长得比距离更快。", "analogy": "离灯越远的小虫，绕一圈要花的时间，比“距离变远”涨得还快。", "page": "laws", "anchor": "#law3", "related": ["harmonic-law", "period"]},
    "harmonic-law": {"name": "调和定律", "cat": "天文", "short": "第三定律的雅称", "plain": "开普勒把第三定律称作“调和定律”，因为它揭示出行星运动里藏着像音乐一样的比例与和谐。", "analogy": "宇宙像一架大乐器，每颗行星都在按固定的比例“发声”。", "page": "laws", "anchor": "#law3", "related": ["kepler-third", "period"]},
    "period": {"name": "公转周期", "cat": "天文", "short": "绕太阳一圈要多久", "plain": "一颗行星绕太阳运行一周的时间，叫公转周期。地球的周期约 365 天，火星约 687 天。", "analogy": "周期就是“跑完操场一圈用了多少秒”。", "page": "laws", "anchor": "#law3", "related": ["kepler-third", "orbit"]},
    "why-kepler": {"name": "从数据到定律", "cat": "方法", "short": "不是拍脑袋，是算出来的", "plain": "开普勒的定律来自对数以千计的观测点反复拟合，而非先入为主的哲学。这种“让数据说话”的态度，是现代科学的标志。", "analogy": "先收集一堆散点，再找那条最贴合的线——而不是先画线再改数据。", "page": "laws", "anchor": "#why", "related": ["scientific-method", "observation-precision"]},
    "tycho": {"name": "第谷·布拉赫", "cat": "历史", "short": "用肉眼做出最精密记录的人", "plain": "丹麦天文学家第谷在没有望远镜的时代，靠精心设计的仪器做出极高精度的恒星与行星位置记录，后来全给了开普勒。", "analogy": "没有望远镜的“超级视力”：他用尺子和耐心，量出了别人量不到的精度。", "page": "mars", "anchor": "#tycho", "related": ["mars-planet", "observation-precision", "rudolphine"]},
    "mars-planet": {"name": "火星", "cat": "天文", "short": "开普勒的“试金石”", "plain": "火星轨道偏心率最大、最偏离正圆，最难用圆拟合。开普勒拿它反复试错，最终逼出了椭圆。", "analogy": "最倔强的学生，反而逼出了老师最好的教法。", "page": "mars", "anchor": "#tycho", "related": ["eight-years", "ellipse-orbit"]},
    "eight-years": {"name": "八年计算", "cat": "方法", "short": "为火星耗掉的青春", "plain": "开普勒为拟合火星轨道反复计算了近八年，试过圆、本轮、各种组合，才接受椭圆。科学常是长时间的“笨功夫”。", "analogy": "同一个错题本，改了八年，终于改对了一道大题。", "page": "mars", "anchor": "#eight", "related": ["scientific-method", "mars-planet"]},
    "ptolemaic": {"name": "托勒密体系", "cat": "宇宙观", "short": "地心+本轮的旧框架", "plain": "古代托勒密体系用“地球居中+本轮”拟合天体运动。开普勒发现，连哥白尼的正圆也套不住火星——必须换椭圆。", "analogy": "旧地图怎么描都描不准，不是你画功差，是底图错了。", "page": "mars", "anchor": "#circle", "related": ["geocentrism"]},
    "observation-precision": {"name": "精密观测", "cat": "方法", "short": "差一点点也不放过", "plain": "第谷的观测精度达角分级别。正是这“一点点”误差，让开普勒无法用圆蒙混过关，只能改换椭圆。", "analogy": "秤准了，才知道“差不多”其实差很多。", "page": "mars", "anchor": "#tycho", "related": ["tycho", "scientific-method"]},
    "scientific-method": {"name": "科学方法", "cat": "方法", "short": "假设—数据—修正", "plain": "开普勒的工作是现代科学方法的范本：先有模型，再用观测检验，不符就改模型，直到吻合。", "analogy": "先猜一个答案，拿事实去撞，撞歪了就调，直到严丝合缝。", "page": "mars", "anchor": "#ellipse", "related": ["why-kepler", "eight-years"]},
    "eye-optics": {"name": "眼睛成像", "cat": "物理", "short": "视网膜上的倒像", "plain": "开普勒说明：光线经晶状体折射，在视网膜上形成倒立的像，大脑再把它“正过来”。这是近代视觉理论的开端。", "analogy": "相机底片拍的是倒的，照片洗出来才正——眼睛也类似。", "page": "optics", "anchor": "#eye", "related": ["refraction", "lens"]},
    "lens": {"name": "透镜", "cat": "物理", "short": "会聚与发散的光学元件", "plain": "凸透镜把光会聚、凹透镜把光发散。开普勒用透镜组合解释望远镜的放大原理。", "analogy": "放大镜把阳光聚成一个小亮点，就是透镜在“收拢”光线。", "page": "optics", "anchor": "#lens", "related": ["telescope-kepler", "refraction"]},
    "telescope-kepler": {"name": "望远镜", "cat": "物理", "short": "把远方拉近的管子", "plain": "开普勒分析了望远镜的光路：物镜收集远方光线、目镜放大视角。他推进的“开普勒式”结构沿用至今。", "analogy": "两个透镜接力，把远处的星星“搬”到眼前。", "page": "optics", "anchor": "#lens", "related": ["lens", "refraction"]},
    "refraction": {"name": "折射", "cat": "物理", "short": "光“拐弯”的规律", "plain": "光从一种介质进入另一种（如空气到水）时会偏折，叫折射。开普勒研究其数学描述，为光学打下基础。", "analogy": "筷子插进水里看着弯了，就是折射在捣鬼。", "page": "optics", "anchor": "#refraction", "related": ["lens", "eye-optics"]},
    "camera-obscura": {"name": "暗箱", "cat": "物理", "short": "小孔成像的小黑箱", "plain": "暗箱是一个有小孔的黑箱，外面的景象透过小孔倒映在箱内。开普勒研究它，是摄影与相机原理的前身。", "analogy": "一个纸箱加一根针孔，就能把窗外“画”到箱壁上一一最早的相机。", "page": "optics", "anchor": "#camera", "related": ["eye-optics", "refraction"]},
    "rudolphine": {"name": "鲁道夫星表", "cat": "历史", "short": "开普勒编的精确星表", "plain": "1627 年出版的鲁道夫星表，融合第谷观测与开普勒定律，是当时最准的行星与恒星位置表，用了上百年。", "analogy": "相当于给全星空做了一本“精确到分钟的时刻表”。", "page": "rudolphine", "anchor": "#inherit", "related": ["tycho", "logarithm", "predict-comet"]},
    "logarithm": {"name": "对数", "cat": "方法", "short": "把乘除变加减", "plain": "对数能把复杂的乘除运算变成简单的加减。开普勒用它，在手算时代完成了星表所需的海量计算。", "analogy": "本来要背九九乘法表到很大，对数让你“加一加”就得到答案。", "page": "rudolphine", "anchor": "#log", "related": ["rudolphine", "star-catalog"]},
    "predict-comet": {"name": "预言天体", "cat": "方法", "short": "能算未来，才算真懂", "plain": "星表的价值在于能预报行星、彗星的位置。可验证、可预言，是科学理论有用的标志。", "analogy": "能告诉你“明天日出于几点”的表，才比一张风景画有用。", "page": "rudolphine", "anchor": "#predict", "related": ["rudolphine", "star-catalog"]},
    "star-catalog": {"name": "星表", "cat": "天文", "short": "星星的“通讯录”", "plain": "星表系统记录恒星与行星的位置。好的星表是导航、历法和天文学研究的基石。", "analogy": "把上千颗星的家庭住址都记在一本册子里，随查随用。", "page": "rudolphine", "anchor": "#legacy", "related": ["rudolphine", "logarithm"]},
    "copernicus": {"name": "哥白尼", "cat": "历史", "short": "日心说的提出者", "plain": "哥白尼把太阳请回中心，开普勒则把他的圆改成椭圆，让日心说从“猜想”变成“可计算的精确体系”。", "analogy": "哥白尼画了草图，开普勒把它改成了精确的建筑图纸。", "page": "mars", "anchor": "#ellipse", "related": ["heliocentrism", "kepler-first"]},
    "heliocentrism": {"name": "日心说", "cat": "宇宙观", "short": "太阳居中，地球绕日", "plain": "日心说认为太阳静止在中心，地球与其他行星绕它运行。开普勒的椭圆定律，是日心说最坚实的数学骨架。", "analogy": "把客厅吊灯当成中心，家具都绕着它摆——日心说就是这么摆的。", "page": "laws", "anchor": "#law1", "related": ["ellipse-orbit", "copernicus"]},
    "newton": {"name": "牛顿", "cat": "历史", "short": "用引力解释开普勒", "plain": "牛顿后来用万有引力与运动定律，解释了“为什么行星会按开普勒定律运行”。定律有了因果根基。", "analogy": "开普勒说“行星沿椭圆走”，牛顿回答了“凭什么走椭圆”。", "page": "laws", "anchor": "#why", "related": ["gravity", "kepler-third"]},
    "gravity": {"name": "引力", "cat": "天文", "short": "让天体彼此吸引的力", "plain": "牛顿之后，太阳靠引力“拉住”行星，使它们沿开普勒椭圆运行。定律从此不只是几何，而是有因果的物理。", "analogy": "看不见的橡皮筋，把行星拴在太阳身边。", "page": "laws", "anchor": "#why", "related": ["newton", "kepler-first"]},
    "orbit": {"name": "轨道", "cat": "天文", "short": "天体运行的路径", "plain": "天体绕中心体运行的路径叫轨道。在开普勒之前人们以为轨道必是正圆，他证明是椭圆。", "analogy": "操场上的跑道就是地球的“轨道”。", "page": "laws", "anchor": "#law1", "related": ["ellipse-orbit", "period"]},
    "geocentrism": {"name": "地心说", "cat": "宇宙观", "short": "地球居中，万物绕它", "plain": "地心说认为地球静止在宇宙中心。开普勒的工作，是日心说彻底取代地心说的关键一步。", "analogy": "把自家院子当成全世界的中心——直觉自然，却经不起细算。", "page": "mars", "anchor": "#circle", "related": ["ptolemaic", "heliocentrism"]}
  },

  "timeline": [
    {"year": 1571, "id": "born", "title": "生于魏尔村", "img": "kepler-portrait.jpg", "alt": "开普勒肖像", "fig": "开普勒 1571 年生于德国魏尔村，体弱多病。", "body": "12 月 27 日，约翰内斯·开普勒出生。幼年体弱、视力不佳，却展露出惊人的数学天赋。"},
    {"year": 1589, "id": "tuebingen", "title": "图宾根大学", "img": "kepler-tubingen.jpg", "alt": "图宾根大学", "fig": "在图宾根，他接触了哥白尼的日心说。", "body": "进入图宾根大学学习神学与数学，在这里第一次认真接受了哥白尼的日心体系。"},
    {"year": 1594, "id": "graz", "title": "格拉茨任教", "img": "kepler-graz.jpg", "alt": "格拉茨", "fig": "在格拉茨教数学，开始思考天体几何。", "body": "赴格拉茨任数学教师，课余钻研天体运行的几何关系，埋下毕生志趣。"},
    {"year": 1600, "id": "tycho", "title": "投奔第谷", "img": "tycho-brahe.jpg", "alt": "第谷·布拉赫", "fig": "与第谷会面，拿到最精确的观测数据。", "body": "前往布拉格会见第谷·布拉赫，成为其助手。第谷去世后，开普勒继承了那批珍贵观测资料。"},
    {"year": 1601, "id": "prague", "title": "接任皇家数学家", "img": "kepler-prague.jpg", "alt": "布拉格", "fig": "接替第谷，成为帝国数学家。", "body": "第谷去世，开普勒接任宫廷数学家，开始系统整理火星观测、推导行星定律。"},
    {"year": 1604, "id": "supernova", "title": "观测超新星", "img": "kepler-supernova.jpg", "alt": "开普勒超新星", "fig": "他详细记录了 1604 年的超新星。", "body": "开普勒观测并记录 SN 1604 超新星，写成专著——这也是肉眼能见的最后一颗银河系内超新星。"},
    {"year": 1609, "id": "nova", "title": "《新天文学》", "img": "kepler-mars.jpg", "alt": "《新天文学》", "fig": "提出前两大定律，火星问题得解。", "body": "出版《新天文学》，给出椭圆轨道与面积定律，八年火星纠缠终于收官。"},
    {"year": 1611, "id": "optics", "title": "光学著作", "img": "kepler-optics.jpg", "alt": "开普勒光学", "fig": "他写成了近代光学的奠基之作。", "body": "出版光学著作，解释眼睛成像与望远镜原理，奠定近代光学基础。"},
    {"year": 1619, "id": "harmony", "title": "《宇宙和谐论》", "img": "kepler-harmony.jpg", "alt": "《宇宙和谐论》", "fig": "第三定律在此提出：T² ∝ a³。", "body": "出版《宇宙和谐论》，提出第三定律（周期平方正比于距离立方），把行星运动写成简洁的比例。"},
    {"year": 1627, "id": "rudolphine", "title": "《鲁道夫星表》", "img": "kepler-rudolphine.jpg", "alt": "鲁道夫星表", "fig": "史上最精确的星表付印。", "body": "历经二十余年，《鲁道夫星表》出版，融合第谷数据与自创定律，成为此后百年的天文与航海标准。"},
    {"year": 1630, "id": "died", "title": "逝于雷根斯堡", "img": "kepler-monument.jpg", "alt": "开普勒纪念碑", "fig": "他在贫病交加中离世。", "body": "11 月 15 日，开普勒逝于雷根斯堡，享年 58 岁。他留下的定律，至今仍是天体力学基石。"}
  ],

  "images": [
    {"file": "kepler-portrait.jpg", "wiki": "File:Johannes Kepler 1610.jpg", "q": "Johannes Kepler portrait painting", "desc": "开普勒肖像", "author": "Public domain", "license": "Public domain"},
    {"file": "kepler-tubingen.jpg", "wiki": "File:Tübingen - Neckarfront.jpg", "q": "Tubingen university town", "desc": "图宾根大学", "author": "Public domain", "license": "Public domain"},
    {"file": "kepler-graz.jpg", "wiki": "File:Graz - Hauptplatz.jpg", "q": "Graz Austria city", "desc": "格拉茨", "author": "Public domain", "license": "Public domain"},
    {"file": "tycho-brahe.jpg", "wiki": "File:Tycho Brahe.jpg", "q": "Tycho Brahe portrait", "desc": "第谷·布拉赫", "author": "Public domain", "license": "Public domain"},
    {"file": "kepler-prague.jpg", "wiki": "File:Prague Castle.jpg", "q": "Prague Castle panorama", "desc": "布拉格（开普勒工作的地方）", "author": "Public domain", "license": "Public domain"},
    {"file": "kepler-supernova.jpg", "wiki": "File:Kepler's Supernova.jpg", "q": "Kepler supernova 1604", "desc": "开普勒超新星（1604）", "author": "Public domain", "license": "Public domain"},
    {"file": "kepler-mars.jpg", "wiki": "File:Kepler - Astronomia Nova (Title Page).jpg", "q": "Kepler Astronomia Nova title page", "desc": "《新天文学》书名页", "author": "Public domain", "license": "Public domain"},
    {"file": "kepler-optics.jpg", "wiki": "File:Kepler optics eye.svg", "q": "optics refraction lens eye diagram", "desc": "光学与眼睛成像", "author": "Public domain", "license": "Public domain"},
    {"file": "kepler-harmony.jpg", "wiki": "File:Harmonices Mundi.jpg", "q": "Kepler Harmonices Mundi", "desc": "《宇宙和谐论》", "author": "Public domain", "license": "Public domain"},
    {"file": "kepler-rudolphine.jpg", "wiki": "File:Rudolphine Tables.jpg", "q": "Rudolphine Tables title page", "desc": "《鲁道夫星表》", "author": "Public domain", "license": "Public domain"},
    {"file": "kepler-monument.jpg", "wiki": "File:Johannes Kepler Monument Regensburg.jpg", "q": "Johannes Kepler monument", "desc": "开普勒纪念碑", "author": "Public domain", "license": "Public domain"}
  ],

  "labs": [
    {"key": "ellipse", "kind": "ellipse", "icon": "🪐", "title": "椭圆轨道：太阳在焦点",
     "intro": "拖动“离心率”，看行星轨道如何从正圆变扁；注意它靠近太阳时明显更快。",
     "desc": "离心率越大，轨道越扁，近/远日点速度差越明显。",
     "ctrl": [{"name": "ecc", "label": "离心率 e", "min": 0, "max": 0.8, "value": 0.4, "step": 0.05, "init": "0.40"}],
     "params": {"center": "日", "centerColor": "#E8590C", "label": "行星沿椭圆绕日：太阳在一个焦点上", "bodyName": "行", "bodyColor": "#3B5BDB", "a": 175}},
    {"key": "solar", "kind": "orbit", "icon": "🌞", "title": "太阳系：行星绕太阳转",
     "intro": "拖动“动画速度”，看行星按由近及远的次序绕太阳运行——开普勒排定的秩序。",
     "desc": "水星最快、土星最慢；离太阳越远，转一圈越久。",
     "ctrl": [{"name": "speed", "label": "动画速度", "min": 0.2, "max": 3, "value": 1, "step": 0.1, "init": "1.0×"}],
     "params": {"center": "日", "centerColor": "#E8590C", "label": "行星绕太阳运行：由近及远，越远越慢",
                "bodies": [{"name": "水", "r": 45, "period": 88, "color": "#E8590C"}, {"name": "金", "r": 80, "period": 225, "color": "#C98A3C"}, {"name": "地", "r": 120, "period": 365, "color": "#3B5BDB"}, {"name": "火", "r": 165, "period": 687, "color": "#6741D9"}, {"name": "木", "r": 215, "period": 4333, "color": "#2F9E44"}, {"name": "土", "r": 260, "period": 10759, "color": "#5C6B82"}]}},
    {"key": "third", "kind": "graph", "icon": "📈", "title": "第三定律：距离与周期",
     "intro": "拖动滑块改变增长速率，看曲线如何随距离变陡——离太阳越远的行星，公转一圈越久。",
     "desc": "用一条上升曲线示意：距离越大，完成一圈所需的时间越长。",
     "ctrl": [{"name": "param1", "label": "速率 r", "min": 0.3, "max": 1.5, "value": 0.6, "step": 0.1, "init": "0.6"}, {"name": "param2", "label": "形状", "min": 0.5, "max": 2, "value": 1, "step": 0.1, "init": "1.0"}],
     "params": {"expr": "growth", "label": "越远的行星，公转周期越长（距离—周期关系）"}}
  ]
}


if __name__ == "__main__":
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "spec_kepler.json")
    json.dump(SPEC, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print("wrote", out)
