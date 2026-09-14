# -*- coding: utf-8 -*-
"""《读懂科学家》系列 · 系列门户（根 index.html）生成器

把 scientists/<id>/ 下的所有子站接进根目录总览页：
  - 已上线卡片区（15 张，按出生年份排序，带关键词过滤）
  - 路线图 roster（全部标记「已上线」并给链接）
  - 顶部导航、页脚站点目录

子站元数据集中在本文件 SCIENTISTS 列表里；新增/调整科学家只改这里，
然后 `python3 tools/build_portal.py` 重新生成根 index.html。
"""

import io
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# id, 中文名, 英文名, 生卒, 一句话简介, 缩略图, 缩略图底色
SCIENTISTS = [
    ("copernicus", "尼古拉·哥白尼", "Nicolaus Copernicus", "1473 – 1543",
     "用「日心说」把地球请出宇宙中心，掀起科学革命的第一声惊雷。",
     "thumb-heliocentric.svg", "#FFF4E6"),
    ("galileo", "伽利略·伽利雷", "Galileo Galilei", "1564 – 1642",
     "用望远镜把天空拉到眼前，用斜面与摆锤重新定义「运动」，近代实验科学之父。",
     "thumb-telescope.svg", "#F3EEFB"),
    ("kepler", "约翰内斯·开普勒", "Johannes Kepler", "1571 – 1630",
     "行星运动三大定律，用椭圆轨道把日心说变成可精确计算的模型。",
     "thumb-mars.svg", "#E7F5FF"),
    ("newton", "艾萨克·牛顿", "Isaac Newton", "1643 – 1727",
     "三大力学定律与万有引力，第一次把天体与地面连成同一种规律；还发明了微积分。",
     "thumb-optics.svg", "#E6FCF5"),
    ("faraday", "迈克尔·法拉第", "Michael Faraday", "1791 – 1867",
     "发现电磁感应、造出第一台发电机，提出「场」与力线——今天点亮世界的电，源头在他手上。",
     "thumb-induction.svg", "#FFF9DB"),
    ("darwin", "查尔斯·达尔文", "Charles Darwin", "1809 – 1882",
     "进化论与「物竞天择」，重新解释所有生命的来处与彼此的关联。",
     "thumb-finches.svg", "#EBFBEE"),
    ("pasteur", "路易·巴斯德", "Louis Pasteur", "1822 – 1895",
     "巴氏杀菌与疫苗，微生物学奠基，实打实拯救了无数人的生命。",
     "thumb-vaccine.svg", "#FFF0F6"),
    ("maxwell", "詹姆斯·麦克斯韦", "James Clerk Maxwell", "1831 – 1879",
     "用一组方程统一电、磁与光，现代通信的全部根基都从这里长出。",
     "thumb-equations.svg", "#EEF1F6"),
    ("mendeleev", "德米特里·门捷列夫", "Dmitri Mendeleev", "1834 – 1907",
     "元素周期表，把混乱的化学元素排成可被预言的秩序。",
     "thumb-table.svg", "#F1F8FF"),
    ("curie", "玛丽·居里", "Marie Curie", "1867 – 1934",
     "发现放射性元素钋与镭，两获诺贝尔奖，亲手推开原子时代的大门。",
     "thumb-radium.svg", "#FFF5F5"),
    ("einstein", "阿尔伯特·爱因斯坦", "Albert Einstein", "1879 – 1955",
     "相对论重写时间、光与引力，E=mc² 成为史上最有名的等式。",
     "thumb-relativity.svg", "#EAF0FF"),
    ("bohr", "尼尔斯·玻尔", "Niels Bohr", "1885 – 1962",
     "原子模型与量子跃迁，为现代量子力学奠定基石。",
     "thumb-bohr-model.svg", "#F3F0FF"),
    ("turing", "阿兰·图灵", "Alan Turing", "1912 – 1954",
     "图灵机与可计算性，计算机科学与人工智能的思想源头。",
     "thumb-turing-machine.svg", "#EDF2FF"),
    ("feynman", "理查德·费曼", "Richard Feynman", "1918 – 1988",
     "路径积分与费曼图重塑量子力学，用一杯冰水找出挑战者号事故真相，也是最会讲物理的人。",
     "thumb-qed.svg", "#FFF0F6"),
    ("hawking", "斯蒂芬·霍金", "Stephen Hawking", "1942 – 2018",
     "黑洞辐射与宇宙学普及，把最前沿的时空之谜讲给全世界听。",
     "thumb-blackhole.svg", "#F1F3F5"),
]

TOTAL = len(SCIENTISTS)


def roster_html():
    out = []
    for i, (sid, zh, en, years, desc, thumb, bg) in enumerate(SCIENTISTS, 1):
        out.append("""      <a class="roster-item done" href="scientists/%s/index.html" style="text-decoration:none">
        <span class="roster-idx">%02d</span>
        <h3 class="roster-name">%s</h3>
        <span class="roster-en">%s</span>
        <span class="roster-years">%s</span>
        <p class="roster-desc">%s</p>
        <span class="roster-pill pill-done">已上线</span>
      </a>
""" % (sid, i, zh, en, years, desc))
    return "\n".join(out)


def footer_sites_html():
    out = []
    for sid, zh, en, years, desc, thumb, bg in SCIENTISTS:
        out.append('          <li><a href="scientists/%s/index.html">%s</a></li>' % (sid, zh))
    return "\n".join(out)


def short_name(zh):
    """卡片「进入X站」用的短称呼。"""
    for full, short in [
        ("尼古拉·哥白尼", "哥白尼"), ("伽利略·伽利雷", "伽利略"), ("约翰内斯·开普勒", "开普勒"),
        ("艾萨克·牛顿", "牛顿"), ("查尔斯·达尔文", "达尔文"), ("路易·巴斯德", "巴斯德"),
        ("詹姆斯·麦克斯韦", "麦克斯韦"), ("德米特里·门捷列夫", "门捷列夫"), ("玛丽·居里", "居里夫人"),
        ("阿尔伯特·爱因斯坦", "爱因斯坦"), ("尼尔斯·玻尔", "玻尔"), ("阿兰·图灵", "图灵"),
        ("斯蒂芬·霍金", "霍金"),
    ]:
        if zh == full:
            return short
    return zh


def cards_html2():
    out = []
    for sid, zh, en, years, desc, thumb, bg in SCIENTISTS:
        out.append("""      <a class="ach-card" href="scientists/%s/index.html" data-sci="%s %s %s">
        <div class="thumb" style="background:%s">
          <img src="scientists/%s/assets/img/draw/%s" alt="%s 示意图">
        </div>
        <div class="body">
          <span class="year">%s</span>
          <h3>%s</h3>
          <p>%s</p>
          <span class="more">进入%s站 →</span>
        </div>
      </a>
""" % (sid, zh, en, years, bg, sid, thumb, zh, years, zh, desc, short_name(zh)))
    return "\n".join(out)


HTML = u"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>读懂科学家 · 一个把天才讲成人话的科普系列</title>
<meta name="description" content="面向中学生的科学家科普系列「影响世界的15个科学家」：哥白尼、伽利略、开普勒、牛顿、法拉第、达尔文、巴斯德、麦克斯韦、门捷列夫、居里夫人、爱因斯坦、玻尔、图灵、费曼、霍金共 %(total)d 位全部上线。按时间顺序讲清一生与核心成就，难词点开就有解释。">
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body data-base="">

<!-- ===== 导航 ===== -->
<nav class="nav">
  <div class="nav-inner">
    <a class="brand" href="index.html"><span class="apple">🔭</span>读懂科学家</a>
    <button class="nav-toggle" aria-label="打开菜单"><i></i><i></i><i></i></button>
    <div class="nav-links">
      <a href="index.html">系列首页</a>
      <a href="#scientists">全部科学家</a>
      <a href="#howto">怎么读</a>
      <a href="#roadmap">路线图</a>
    </div>
  </div>
  <div id="progress"></div>
</nav>

<!-- ===== Hero ===== -->
<header class="hero">
  <div class="hero-inner">
    <div>
      <span class="sec-kicker">初中 · 高中 都能读得懂</span>
      <h1>读懂科学家</h1>
      <p class="sub">一个把天才讲成人话的科普系列</p>
      <p class="lead">每一个改变了世界的头脑，都曾是会犯错、会卡壳、会对着窗户发呆的普通人。这个系列用你能听懂的话，把一位科学家的一生与核心成就，按时间顺序讲清楚。看到不懂的词，点一下就有解释。</p>
      <div class="hero-actions">
        <a class="btn" href="scientists/newton/index.html">从牛顿开始 →</a>
        <a class="btn ghost" href="#scientists">看看全部 %(total)d 位</a>
      </div>
    </div>
    <div class="hero-art">
      <figure class="hero-portrait">
        <img src="scientists/newton/assets/img/history/newton-portrait-1702.jpg" alt="牛顿 1702 年肖像" width="300" height="364">
        <figcaption>系列第一位完整上线的站点：艾萨克·牛顿（1643–1727）<br>肖像 · 戈弗雷·内勒绘</figcaption>
      </figure>
    </div>
  </div>
</header>

<!-- ===== 为什么做这个系列 ===== -->
<section id="howto">
  <div class="wrap">
    <div class="sec-head">
      <span class="sec-kicker">这个系列怎么读</span>
      <h2>不是背公式，是把"为什么"讲明白</h2>
      <p>每个科学家站点都遵循同一套结构，方便你一路读下来、也方便老师直接拿去课堂用。</p>
    </div>
    <div class="grid g3">
      <div class="card">
        <h3 style="font-size:17px;margin-bottom:8px">📜 一条时间线串起一生</h3>
        <p style="font-size:15px;color:var(--ink-2);margin:0">从出生到谢幕，哪一年发生了什么、为什么重要，点开年份就能看。</p>
      </div>
      <div class="card">
        <h3 style="font-size:17px;margin-bottom:8px">🧩 成就拆成一篇篇短文</h3>
        <p style="font-size:15px;color:var(--ink-2);margin:0">光学、数学、物理……每个核心领域单独成篇，配图、配通俗解释，不怕看不懂。</p>
      </div>
      <div class="card">
        <h3 style="font-size:17px;margin-bottom:8px">🔍 难词点开就看</h3>
        <p style="font-size:15px;color:var(--ink-2);margin:0">全站带虚线下划线的词都能点，弹窗给"人话"解释；还有完整术语词典可查。</p>
      </div>
      <div class="card">
        <h3 style="font-size:17px;margin-bottom:8px">🧪 亲手玩一玩</h3>
        <p style="font-size:15px;color:var(--ink-2);margin:0">网页里直接拖一拖、调一调的小演示，把抽象规律变成你能操控的东西。</p>
      </div>
      <div class="card">
        <h3 style="font-size:17px;margin-bottom:8px">📚 课件友好</h3>
        <p style="font-size:15px;color:var(--ink-2);margin:0">内容依据公开史料编写，图文可截图引用，适合课堂与自学。</p>
      </div>
      <div class="card">
        <h3 style="font-size:17px;margin-bottom:8px">🔗 一人一站点，已汇成系列</h3>
        <p style="font-size:15px;color:var(--ink-2);margin:0">%(total)d 位科学家各有一个结构统一的子站点，全部从这里进入。</p>
      </div>
    </div>
  </div>
</section>

<!-- ===== 已上线科学家 ===== -->
<section id="scientists" style="background:#fff;border-top:1px solid var(--line);border-bottom:1px solid var(--line)">
  <div class="wrap">
    <div class="sec-head">
      <span class="sec-kicker">全部 %(total)d 位 · 已上线</span>
      <h2>挑一位科学家开始读</h2>
      <p>点开任意一张卡片，进入 TA 的完整子站点（含时间轴、详解、动手玩一玩与术语词典）。也可以直接搜索。</p>
    </div>
    <div class="filter-bar">
      <input id="sci-filter" type="search" placeholder="搜索科学家、英文名或关键词（如「黑洞」「进化」）…" aria-label="搜索科学家">
      <span id="sci-count" class="filter-count">%(total)d 位</span>
    </div>
    <div class="grid g3" id="sci-grid">
%(cards)s
    </div>
    <p id="sci-empty" class="roster-note" style="display:none">没有匹配的科学家，换个词试试。</p>
  </div>
</section>

<!-- ===== 规划 ===== -->
<section id="roadmap">
  <div class="wrap">
    <div class="sec-head">
      <span class="sec-kicker">路线图</span>
      <h2>影响世界的15个科学家</h2>
      <p>这个系列要讲透 %(total)d 位真正改变了世界的头脑。下面按出生年份排列——全部已上线，点任意一张即可进入对应站点。从哥白尼到霍金，正好串起近 550 年科学如何重塑人类世界。</p>
    </div>

    <div class="roster">
%(roster)s
    </div>

    <p class="roster-note">名单按出生年份排列，涵盖天文、物理、化学、生物、医学、计算六大领域；后续仍可按需增删。</p>

    <div class="sec-head" style="margin-top:52px">
      <span class="sec-kicker">推进方式</span>
      <h2>项目怎么一步步长成</h2>
      <p>本系列采用「一人一子站 → 统一门户」的方式建设：每位科学家先用同一套引擎独立成型并通过校验，最后接进这个总览入口统一发布。</p>
    </div>
    <div class="grid g3">
      <div class="card">
        <h3 style="font-size:17px;margin-bottom:8px">① 子站各自成型</h3>
        <p style="font-size:15px;color:var(--ink-2);margin:0">每位科学家是独立子站点，共用一套引擎（术语弹窗 / 时间轴 / Canvas 实验），内容各自撰写并逐一通过静态校验与浏览器验证。</p>
      </div>
      <div class="card">
        <h3 style="font-size:17px;margin-bottom:8px">② 统一导航与检索</h3>
        <p style="font-size:15px;color:var(--ink-2);margin:0">根目录做系列总览入口，%(total)d 位一屏可达，并可按姓名、领域或关键词检索。</p>
      </div>
      <div class="card">
        <h3 style="font-size:17px;margin-bottom:8px">③ 整合为系列门户</h3>
        <p style="font-size:15px;color:var(--ink-2);margin:0">子站作为栏目统一部署为一个站点，共享样式与脚本，结构统一、便于持续扩展。</p>
      </div>
    </div>
  </div>
</section>

<!-- ===== 页脚 ===== -->
<footer class="foot">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <div class="brand-f"><span class="apple" style="width:26px;height:26px;font-size:14px;border-radius:7px;background:linear-gradient(140deg,#3B5BDB,#6E8BFF);display:grid;place-items:center">🔭</span>读懂科学家</div>
        <p style="margin:0;color:#8B96AA;font-size:13.5px">一个面向中学生的科学家科普系列。把难词讲成人话，把天才讲成普通人。</p>
      </div>
      <div>
        <h5>全部科学家</h5>
        <ul>
%(footer_sites)s
        </ul>
      </div>
      <div>
        <h5>关于</h5>
        <ul>
          <li><a href="#roadmap">系列规划</a></li>
          <li><a href="#howto">怎么读这个系列</a></li>
          <li><a href="#scientists">全部科学家</a></li>
        </ul>
      </div>
    </div>
    <div class="foot-bottom">
      <span>课堂与自学用途 · 内容依据公开史料编写</span>
      <span>历史图片来自 Wikimedia Commons</span>
    </div>
  </div>
</footer>

<button class="to-top" aria-label="回到顶部">↑</button>
<script src="assets/js/site.js"></script>
<script>
(function () {
  var input = document.getElementById("sci-filter");
  var grid = document.getElementById("sci-grid");
  var count = document.getElementById("sci-count");
  var empty = document.getElementById("sci-empty");
  if (!input || !grid) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll(".ach-card"));
  input.addEventListener("input", function () {
    var q = (input.value || "").trim().toLowerCase();
    var n = 0;
    cards.forEach(function (c) {
      var hay = ((c.getAttribute("data-sci") || "") + " " + (c.textContent || "")).toLowerCase();
      var hit = !q || hay.indexOf(q) >= 0;
      c.style.display = hit ? "" : "none";
      if (hit) n++;
    });
    if (count) count.textContent = n + " 位";
    if (empty) empty.style.display = n === 0 ? "" : "none";
  });
})();
</script>
</body>
</html>
"""


def main():
    html = HTML % {
        "total": TOTAL,
        "cards": cards_html2(),
        "roster": roster_html(),
        "footer_sites": footer_sites_html(),
    }
    path = os.path.join(ROOT, "index.html")
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(html)
    print("✅ 已生成 %s（%d 位科学家）" % (path, TOTAL))


if __name__ == "__main__":
    main()
