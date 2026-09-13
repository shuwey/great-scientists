# -*- coding: utf-8 -*-
"""达尔文「玩一玩」重做规格。

改动理由（见 tools/labs-audit.html）：
  实验1 种群增长   —— 原为「指数 vs 逻辑斯蒂」两条抽象曲线，且与巴斯德页逐字节相同
                     改为「过度繁殖与生存竞争」：每代生出的后代远多于环境能养活的，点阵直观显示谁被淘汰
  实验2 选择压力   —— 原属簇 1「通用曲线模板」（param1/param2 + expr 开关），四站共用一张万能图
                     改为「喙深分布随世代右移」的直方图：这才是自然选择真正在做的统计动作
  实验3 生命之树   —— 原为递归二叉树（分形），与巴斯德页、图灵页逐字节相同
                     改为「人科系统发生树」：人类/黑猩猩/大猩猩/红毛猩猩在几百万年前如何分家
"""

SITE = "darwin"
TITLE = "动手玩一玩 · 三个达尔文小实验 | 读懂达尔文"
META = "三个可直接在网页上操作的互动演示：过度繁殖之下谁能活下来、自然选择怎样让整群地雀的喙一代代变深、人类和其他猿类在几百万年前才分家。拖动滑块，亲眼看见达尔文讲过的道理。"
CLAIM = "光看文字不够直观？下面三个小实验，你直接用鼠标拖动滑块——看每代生出的后代为什么远多于能活下来的、看选择压力怎样把整群地雀的喙推得更深、看我们在演化树上和谁最亲。"

LABS = [
    {
        "id": "population",
        "h2": "🌱 实验一 · 过度繁殖与生存竞争",
        "intro": "每个物种生出的后代，都远远多于环境能养活的。拖动“繁殖速率”，看这一代生出多少、又有多少还没长大就被淘汰——达尔文正是从这句话想通了“生存竞争”。",
        "kind": "population",
        "card": "生得多，活得少",
        "badge": "可拖动",
        "desc": "环境只有 60 个位置，后代却有上百个。多出来的，就是竞争中被淘汰的。",
        "controls": [
            {"ctrl": "rate", "label": "繁殖速率", "v": "0.6", "min": "0.3", "max": "1.5", "value": "0.6", "step": "0.1"},
        ],
        "callout": "资源充裕时谁都能活；一旦后代超过环境容量，就必然有一批被饿死、被捕食、被淘汰。活下来的未必最强，但一定是最适应当下环境的——这就是自然选择的起点。详见 <a href=\"detail/selection.html\">自然选择：进化的发动机</a>。",
    },
    {
        "id": "selection",
        "h2": "📊 实验二 · 自然选择：喙深一代代变深",
        "intro": "加拉帕戈斯地雀的喙深本来参差不齐。连续干旱时，硬壳种子占多数，喙深的个体更容易活下来。拖动“选择压力”和“世代数”，看整群的喙深分布怎样一步步向右移。",
        "kind": "selection",
        "card": "整群分布整体偏移",
        "badge": "可拖动",
        "desc": "灰柱是原来的种群，橙柱是若干代之后的种群。分布整体右移，平均喙深就变深了。",
        "controls": [
            {"ctrl": "press", "label": "选择压力", "v": "1.0", "min": "0", "max": "2", "value": "1", "step": "0.1"},
            {"ctrl": "gens", "label": "经过世代", "v": "3", "min": "0", "max": "8", "value": "3", "step": "1"},
        ],
        "callout": "注意：这一代没有哪只鸟“努力”把喙变深，变的是整群的比例。选择不制造变异，它只是筛选已有的变异——这正是达尔文与拉马克的分水岭。详见 <a href=\"detail/finches.html\">加拉帕戈斯雀：一枚钥匙</a>。",
    },
    {
        "id": "tree",
        "h2": "🌳 实验三 · 生命之树：我们和谁最亲",
        "intro": "把时间倒着拨回去。拖动“距今”，看人类的祖先什么时候才和黑猩猩、大猩猩、红毛猩猩分家——越靠左，是越久远的共同祖先。",
        "kind": "tree",
        "card": "人科：一部分家史",
        "badge": "可拖动",
        "desc": "人类与黑猩猩约 700 万年前分家，与大猩猩约 1000 万年，与红毛猩猩约 1400 万年。",
        "controls": [
            {"ctrl": "mya", "label": "距今（百万年前）", "v": "0", "min": "0", "max": "16", "value": "0", "step": "1"},
        ],
        "callout": "血缘不是“谁像谁”，而是“谁跟谁分家更晚”。人类不是从黑猩猩变来的——我们和黑猩猩是从同一个祖先分头走出来的两条支线。详见 <a href=\"detail/tree.html\">生命之树：我们共享祖先</a>。",
    },
]

FUNCS = [
    ("lab_population", '''
  function lab_population(lab) {
    var cv = $("canvas", lab);
    var sR = $('[data-ctrl="rate"]', lab);
    var out = $(".lab-readout", lab);
    var vR = sR ? sR.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400, K = 60, COLS = 10, ROWS = 6;
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var r = sR ? parseFloat(sR.value) : 0.6;
      var born = Math.round(K * r * 1.6);
      var survive = Math.min(born, K);
      var culled = born - survive;
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var gx = 56, gy = 84, cw = 38, chh = 33, i, cx, cy;
      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("环境能养活的个体：60 个位置", gx, 56);
      ctx.strokeStyle = "#DDE3EC"; ctx.lineWidth = 1;
      ctx.strokeRect(gx - 8, gy - 8, COLS * cw + 16, ROWS * chh + 16);
      for (i = 0; i < K; i++) {
        cx = gx + (i % COLS) * cw + cw / 2;
        cy = gy + Math.floor(i / COLS) * chh + chh / 2;
        if (i < survive) {
          ctx.fillStyle = "#2F9E44";
          ctx.globalAlpha = 0.9;
        } else {
          ctx.fillStyle = "#EDF0F6";
          ctx.globalAlpha = 1;
        }
        ctx.beginPath(); ctx.arc(cx, cy, 11, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#5C6B82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("活下来的：" + survive + " / 60", gx, gy + ROWS * chh + 32);

      var ox = 496, oy = 68;
      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("这一代出生：" + born + " 个", ox, 56);
      ctx.strokeStyle = culled > 0 ? "#F5C6C6" : "#DDE3EC"; ctx.lineWidth = 1;
      ctx.strokeRect(ox - 8, oy - 8, 274, 214);
      if (culled > 0) {
        for (i = 0; i < culled; i++) {
          cx = ox + 8 + (i % 17) * 16;
          cy = oy + 10 + Math.floor(i / 17) * 19;
          ctx.fillStyle = "#E03131";
          ctx.globalAlpha = 0.85;
          ctx.beginPath(); ctx.arc(cx, cy, 5.2, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = "#C92A2A"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("被淘汰：" + culled + " 个", ox, oy + 224);

      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("红点＝还没长大就被饿死、被捕食的个体。它们并非“不努力”，只是没赶上环境。", gx, 372);
      ctx.restore();

      if (vR) vR.textContent = r.toFixed(1);
      if (out) {
        if (culled > 0) {
          out.innerHTML = "繁殖速率 r = <b>" + r.toFixed(1) + "</b>　·　这一代出生约 <b>" + born +
            "</b> 个，环境只能养活 <b>60</b> 个 → <b>" + culled +
            "</b> 个被淘汰　·　后代总是多于食物，于是必然有竞争：这就是达尔文说的「生存竞争」。";
        } else {
          out.innerHTML = "繁殖速率 r = <b>" + r.toFixed(1) + "</b>　·　这一代只出生 <b>" + born +
            "</b> 个，少于 60 个位置，全部活了下来　·　资源宽裕时看不出竞争；一旦后代超过环境容量，淘汰就立刻出现。";
        }
      }
    }
    if (sR) sR.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }
'''),
    ("lab_selection", '''
  function lab_selection(lab) {
    var cv = $("canvas", lab);
    var sP = $('[data-ctrl="press"]', lab);
    var sG = $('[data-ctrl="gens"]', lab);
    var out = $(".lab-readout", lab);
    var vP = sP ? sP.closest(".ctrl").querySelector(".v") : null;
    var vG = sG ? sG.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var PX0 = 92, PX1 = 768, PY0 = 316, PY1 = 78;
    var X0 = 5, X1 = 13, MU0 = 8.2, SD0 = 1.25;
    function xOf(mm) { return PX0 + (mm - X0) / (X1 - X0) * (PX1 - PX0); }
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var press = sP ? parseFloat(sP.value) : 1;
      var gens = sG ? parseFloat(sG.value) : 3;
      var mu = MU0 + press * 0.22 * gens;
      var sd = Math.max(0.66, SD0 - press * 0.02 * gens);
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var NB = 24, bw = (PX1 - PX0) / NB, i, xx, h0, h1;
      var h0a = [], h1a = [], peak = 0.0001;
      for (i = 0; i < NB; i++) {
        xx = X0 + (i + 0.5) / NB * (X1 - X0);
        h0 = Math.exp(-Math.pow(xx - MU0, 2) / (2 * SD0 * SD0));
        h1 = Math.exp(-Math.pow(xx - mu, 2) / (2 * sd * sd));
        h0a.push(h0); h1a.push(h1);
        if (h0 > peak) peak = h0;
        if (h1 > peak) peak = h1;
      }

      ctx.strokeStyle = "#EDF0F6"; ctx.lineWidth = 1;
      for (i = 0; i <= 5; i++) {
        var gy2 = PY1 + (PY0 - PY1) * i / 5;
        ctx.beginPath(); ctx.moveTo(PX0, gy2); ctx.lineTo(PX1, gy2); ctx.stroke();
      }
      for (i = 0; i < NB; i++) {
        var bx = PX0 + i * bw + 1.5, wide = bw - 3;
        var hh0 = h0a[i] / peak * (PY0 - PY1);
        var hh1 = h1a[i] / peak * (PY0 - PY1);
        ctx.fillStyle = "rgba(160,172,190,0.45)";
        ctx.fillRect(bx, PY0 - hh0, wide, hh0);
        ctx.fillStyle = "rgba(232,89,12,0.78)";
        ctx.fillRect(bx, PY0 - hh1, wide, hh1);
      }
      ctx.strokeStyle = "#9AA7BE"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(PX0, PY0); ctx.lineTo(PX1, PY0); ctx.stroke();

      ctx.strokeStyle = "#8B96AA"; ctx.lineWidth = 1.6; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(xOf(MU0), PY0); ctx.lineTo(xOf(MU0), PY1 - 10); ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = "#E8590C"; ctx.lineWidth = 2.2; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(xOf(mu), PY0); ctx.lineTo(xOf(mu), PY1 - 10); ctx.stroke();
      ctx.setLineDash([]);

      ctx.lineWidth = 3;
      ctx.textAlign = "left";
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = "#8B96AA"; ctx.beginPath(); ctx.moveTo(596, 40); ctx.lineTo(620, 40); ctx.stroke();
      ctx.strokeStyle = "#E8590C"; ctx.beginPath(); ctx.moveTo(596, 62); ctx.lineTo(620, 62); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#5C6B82"; ctx.font = "700 12px -apple-system, sans-serif";
      ctx.fillText("原始平均 " + MU0.toFixed(1) + " mm", 628, 44);
      ctx.fillStyle = "#E8590C";
      ctx.fillText("现在平均 " + mu.toFixed(1) + " mm", 628, 66);

      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      for (i = 0; i <= 4; i++) {
        var mm = X0 + (X1 - X0) * i / 4;
        ctx.textAlign = "center";
        ctx.fillText(mm.toFixed(0) + "mm", xOf(mm), PY0 + 22);
      }
      ctx.textAlign = "left";
      ctx.fillText("地雀的喙深 →", PX1 - 96, PY0 + 44);
      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("连续干旱 → 硬壳种子多 → 喙深者更有优势", PX0, 36);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("灰柱＝原来的种群　橙柱＝选择之后的种群", PX0, 56);
      ctx.restore();

      if (vP) vP.textContent = press.toFixed(1);
      if (vG) vG.textContent = gens.toFixed(0);
      if (out) {
        var dim = Math.abs(mu - MU0) < 0.02;
        out.innerHTML = "选择压力 <b>" + press.toFixed(1) + "</b>　·　经过 <b>" + gens.toFixed(0) +
          "</b> 代　·　种群平均喙深由 <b>" + MU0.toFixed(1) + "mm</b> 变为 <b>" + mu.toFixed(1) +
          "mm</b>（分布宽度 " + sd.toFixed(2) + "）　·　" +
          (dim ? "还没有变化——世代为 0 或压力为 0 时，分布原地不动：没有选择，就没有方向。" :
                 "压力越大、世代越多，整群右移得越远。进化不是某只鸟变了，而是整群的比例变了。");
      }
    }
    if (sP) sP.addEventListener("input", draw);
    if (sG) sG.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }
'''),
    ("lab_tree", '''
  function lab_tree(lab) {
    var cv = $("canvas", lab);
    var sM = $('[data-ctrl="mya"]', lab);
    var out = $(".lab-readout", lab);
    var vM = sM ? sM.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var PX0 = 104, PX1 = 556, TMAX = 16;
    function xOf(t) { return PX1 - t / TMAX * (PX1 - PX0); }
    var TIPS = [
      { nm: "人类", y: 96, c: "#E8590C", t: 0 },
      { nm: "黑猩猩", y: 166, c: "#3B5BDB", t: 7 },
      { nm: "大猩猩", y: 236, c: "#2F9E44", t: 10 },
      { nm: "红毛猩猩", y: 306, c: "#6741D9", t: 14 }
    ];
    var N1 = (TIPS[0].y + TIPS[1].y) / 2;
    var N2 = (N1 + TIPS[2].y) / 2;
    var N3 = (N2 + TIPS[3].y) / 2;
    function seg(ctx2, x1, y1, x2, y2, col, w) {
      ctx2.strokeStyle = col; ctx2.lineWidth = w;
      ctx2.beginPath(); ctx2.moveTo(x1, y1); ctx2.lineTo(x2, y2); ctx2.stroke();
    }
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var mya = sM ? parseFloat(sM.value) : 0;
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var i, t, gy;
      ctx.strokeStyle = "#EDF0F6"; ctx.lineWidth = 1;
      for (i = 0; i <= TMAX; i += 2) {
        ctx.beginPath(); ctx.moveTo(xOf(i), 60); ctx.lineTo(xOf(i), 336); ctx.stroke();
        ctx.fillStyle = "#B0BAC9"; ctx.font = "600 11px -apple-system, sans-serif";
        ctx.textAlign = "center"; ctx.fillText(i + "", xOf(i), 354); ctx.textAlign = "left";
      }
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("← 越往左，年代越久远（单位：百万年前）", PX0, 40);
      ctx.fillText("横线上的年份＝两条支线分家的时刻；越晚分家的，血缘越近。", PX0, 372);

      var TR = "#C4CDDB";
      seg(ctx, xOf(TIPS[0].t), TIPS[0].y, PX1 + 26, TIPS[0].y, TR, 2.6);
      seg(ctx, xOf(TIPS[1].t), TIPS[1].y, PX1 + 26, TIPS[1].y, TR, 2.6);
      seg(ctx, xOf(TIPS[2].t), TIPS[2].y, PX1 + 26, TIPS[2].y, TR, 2.6);
      seg(ctx, xOf(TIPS[3].t), TIPS[3].y, PX1 + 26, TIPS[3].y, TR, 2.6);
      seg(ctx, xOf(7), N1, xOf(7), TIPS[0].y, TR, 2.6);
      seg(ctx, xOf(7), N1, xOf(7), TIPS[1].y, TR, 2.6);
      seg(ctx, xOf(7), N1, xOf(10), N1, TR, 2.6);
      seg(ctx, xOf(10), N1, xOf(10), TIPS[2].y, TR, 2.6);
      seg(ctx, xOf(10), N2, xOf(10), N1, TR, 2.6);
      seg(ctx, xOf(10), N2, xOf(14), N2, TR, 3);
      seg(ctx, xOf(14), N2, xOf(14), TIPS[3].y, TR, 3);
      seg(ctx, xOf(14), N3, xOf(14), N2, TR, 3);
      seg(ctx, xOf(14), N3, xOf(16), N3, TR, 3.6);

      for (i = 0; i < TIPS.length; i++) {
        t = TIPS[i];
        ctx.fillStyle = t.c;
        ctx.beginPath(); ctx.arc(PX1 + 26, t.y, 6.5, 0, Math.PI * 2); ctx.fill();
        ctx.font = "700 14px -apple-system, sans-serif";
        ctx.fillText(t.nm, PX1 + 42, t.y + 5);
      }
      ctx.fillStyle = "#5C6B82"; ctx.font = "600 11.5px -apple-system, sans-serif";
      ctx.fillText("现在", PX1 + 42, 336);

      var NODES = [
        { x: xOf(7), y: N1, lab: "人 · 黑猩猩共同祖先", a: "#E8590C", side: 1 },
        { x: xOf(10), y: N2, lab: "＋大猩猩", a: "#2F9E44", side: -1 },
        { x: xOf(14), y: N3, lab: "＋红毛猩猩", a: "#6741D9", side: -1 }
      ];
      for (i = 0; i < NODES.length; i++) {
        ctx.fillStyle = "#1B2530";
        ctx.beginPath(); ctx.arc(NODES[i].x, NODES[i].y, 4.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = NODES[i].a; ctx.font = "700 11.5px -apple-system, sans-serif";
        ctx.textAlign = NODES[i].side > 0 ? "left" : "right";
        ctx.fillText(NODES[i].lab, NODES[i].x + (NODES[i].side > 0 ? 8 : -8), NODES[i].y - 8);
      }
      ctx.textAlign = "left";

      ctx.strokeStyle = "#E03131"; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(xOf(mya), 52); ctx.lineTo(xOf(mya), 340); ctx.stroke();
      ctx.fillStyle = "#E03131"; ctx.font = "700 12px -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(mya + " 百万年前", xOf(mya), 66);
      ctx.textAlign = "left";
      ctx.restore();

      if (vM) vM.textContent = mya.toFixed(0);
      var msg;
      if (mya < 7) msg = "人类与黑猩猩还<b>没有分家</b>，整条支线还是同一个物种。";
      else if (mya < 10) msg = "人类与黑猩猩已经<b>分家</b>（约 700 万年前）；此时两者与大猩猩、红毛猩猩仍共祖。";
      else if (mya < 14) msg = "大猩猩也在约 <b>1000 万年前</b>分出，只剩人类、黑猩猩与红毛猩猩共祖。";
      else msg = "约 <b>1400 万年前</b>红毛猩猩也分出去了；再往前，就是全体大猿的共同祖先。";
      if (out) out.innerHTML = "距今 <b>" + mya.toFixed(0) + "</b> 百万年前：" + msg + "　·　血缘的远近，看的是分家时间早晚，而不是谁长得更像谁。";
    }
    if (sM) sM.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }
'''),
]

INIT = [
    ("population", "lab_population"),
    ("selection", "lab_selection"),
    ("tree", "lab_tree"),
]
