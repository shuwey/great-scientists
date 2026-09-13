# -*- coding: utf-8 -*-
"""巴斯德「玩一玩」重做规格。

改动理由（见 tools/labs-audit.html）：
  实验1 细菌增长     —— 原实现与达尔文页「种群增长」逐字节相同（同一段 exp/log 曲线代码）
                       改为细菌生长曲线四阶段：迟缓期 → 对数期 → 稳定期 → 衰亡期
  实验2 巴氏杀菌     —— 原属簇 1「通用曲线模板」（param1/param2 + expr 开关），一条指数曲线冒充消毒效果
                       改为真正的 D/z 模型：温度决定 D 值，滑动温度看两个标准消毒条件如何等效
  实验3 传染扩散     —— 原为递归二叉树（分形），与达尔文页、图灵页逐字节相同，且与「传染」毫无关系
                       改为鹅颈瓶实验：瓶颈一弯，空气中的微生物就落不进肉汤——否定自然发生说的那一幕
"""

SITE = "pasteur"
TITLE = "动手玩一玩 · 三个巴斯德小实验 | 读懂巴斯德"
META = "三个可直接在网页上操作的互动演示：细菌在肉汤里怎样经历四个生长阶段、巴氏消毒的温度与时间怎样互相替换、鹅颈瓶的弯脖子怎样把空气中的微生物挡在外面。拖动滑块，亲手重做巴斯德当年的实验。"
CLAIM = "光看文字不够直观？下面三个小实验，你直接用鼠标拖动滑块——看细菌怎样从迟缓一路涨到衰亡、看加热温度和时间怎样互相换算、看一个弯脖子怎样把“自然发生说”彻底推翻。"

LABS = [
    {
        "id": "colony",
        "h2": "🦠 实验一 · 细菌生长：四个阶段",
        "intro": "把细菌接进新鲜肉汤，它不会一上来就疯长。拖动“环境适宜度”，看这条曲线怎样走完迟缓、对数、稳定、衰亡四段。",
        "kind": "colony",
        "card": "细菌生长的四个阶段",
        "badge": "可拖动",
        "desc": "先慢（迟缓）→ 猛涨（对数）→ 持平（稳定）→ 下滑（衰亡）。",
        "controls": [
            {"ctrl": "env", "label": "环境适宜度", "v": "1.0×", "min": "0.4", "max": "1.6", "value": "1", "step": "0.1"},
        ],
        "callout": "为什么稳定期会停？营养被吃光了、代谢废物攒多了。巴斯德要证明的正是：这些“小东西”不是凭空长出来的，而是从别处来的——所以控制它们的办法就是控制营养、温度和污染。详见 <a href=\"detail/germ.html\">病菌学说：病从微小处来</a>。",
    },
    {
        "id": "heat",
        "h2": "🔥 实验二 · 巴氏消毒：温度与时间可以互换",
        "intro": "杀死微生物有两个旋钮：温度和保持时间。拖动“温度”与“时间”，看能不能把微生物的存活数压到百万分之一以下——那就是巴氏消毒的两个标准条件。",
        "kind": "heat",
        "card": "温度 × 时间 = 消毒",
        "badge": "可拖动",
        "desc": "63℃ 要 30 分钟，72℃ 只要 15 秒：温度高，时间就能大大缩短。",
        "controls": [
            {"ctrl": "temp", "label": "消毒温度（℃）", "v": "63", "min": "55", "max": "100", "value": "63", "step": "1"},
            {"ctrl": "hold", "label": "保持时间（秒）", "v": "1800", "min": "1", "max": "1800", "value": "1800", "step": "1"},
        ],
        "callout": "巴氏消毒不是“把细菌全煮死”，而是把致病菌压到安全线以下，同时尽量不破坏牛奶的风味和营养——这就是为什么它用 72℃ 只烫 15 秒，而不是煮沸。详见 <a href=\"detail/pasteurization.html\">巴氏杀菌：用温度管住微生物</a>。",
    },
    {
        "id": "spread",
        "h2": "🌫️ 实验三 · 鹅颈瓶：一个弯道推翻一个学说",
        "intro": "空气里到处是微生物。拖动“瓶颈弯曲度”，看瓶子从一个直筒变成一个鹅颈——灰尘还能不能落进肉汤里。",
        "kind": "spread",
        "card": "鹅颈瓶实验",
        "badge": "可拖动",
        "desc": "瓶颈弯得够厉害时，灰尘全落在弯道里，肉汤放几个月都不腐败。",
        "controls": [
            {"ctrl": "bend", "label": "瓶颈弯曲度", "v": "0", "min": "0", "max": "100", "value": "0", "step": "5"},
        ],
        "callout": "这一弯，弯掉的是“自然发生说”：肉汤自己长不出生命，腐败一定来自外来的微生物。巴斯德的做法不是把空气完全隔绝（那样谁都不服气），而是让空气自由进出、只把灰尘拦住——实验设计的高明就在这儿。详见 <a href=\"detail/germ.html\">病菌学说：病从微小处来</a>。",
    },
]

FUNCS = [
    ("lab_colony", '''
  function lab_colony(lab) {
    var cv = $("canvas", lab);
    var sE = $('[data-ctrl="env"]', lab);
    var out = $(".lab-readout", lab);
    var vE = sE ? sE.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var PX0 = 92, PX1 = 762, PY0 = 330, PY1 = 96, TMAX = 10;
    function xOf(t) { return PX0 + t / TMAX * (PX1 - PX0); }
    function frac(t, env) {
      var r = 1.75 * env;
      var grow = 1 / (1 + Math.exp(-r * (t - 2.3)));
      var die = 1 / (1 + Math.exp(2.05 * (t - 6.6 - (env - 1) * 1.2)));
      return Math.max(0.012, grow * die);
    }
    function yOf(f) { return PY0 - (Math.log10(f) + 1.85) / 1.85 * (PY0 - PY1); }
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var env = sE ? parseFloat(sE.value) : 1;
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var i, t, f, x, y;
      var PH = [
        { a: 0, b: 1.2, nm: "迟缓期", c: "#8B96AA", d: "细菌在适应新环境，数量几乎不变" },
        { a: 1.2, b: 4.6, nm: "对数期", c: "#1C7ED6", d: "按几何级数猛增，是最典型的“繁殖”阶段" },
        { a: 4.6, b: 7.4, nm: "稳定期", c: "#2F9E44", d: "营养渐少、废物渐多，新生与死亡持平" },
        { a: 7.4, b: 10, nm: "衰亡期", c: "#E03131", d: "营养耗尽、废物积累，数量逐步下滑" }
      ];
      for (i = 0; i < PH.length; i++) {
        ctx.fillStyle = PH[i].c + "12";
        ctx.fillRect(xOf(PH[i].a), PY1 - 24, xOf(PH[i].b) - xOf(PH[i].a), PY0 - PY1 + 24);
        ctx.fillStyle = PH[i].c; ctx.font = "700 13px -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(PH[i].nm, (xOf(PH[i].a) + xOf(PH[i].b)) / 2, PY1 - 34);
        ctx.textAlign = "left";
      }

      ctx.strokeStyle = "#EDF0F6"; ctx.lineWidth = 1;
      for (i = 0; i <= 5; i++) {
        y = PY1 + (PY0 - PY1) * i / 5;
        ctx.beginPath(); ctx.moveTo(PX0, y); ctx.lineTo(PX1, y); ctx.stroke();
        ctx.fillStyle = "#B0BAC9"; ctx.font = "600 11px -apple-system, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(Math.pow(10, -(i * 1.85 / 5)).toPrecision(1), PX0 - 8, y + 4);
        ctx.textAlign = "left";
      }
      ctx.strokeStyle = "#9AA7BE"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(PX0, PY0); ctx.lineTo(PX1, PY0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PX0, PY0); ctx.lineTo(PX0, PY1 - 10); ctx.stroke();
      for (i = 0; i <= TMAX; i += 2) {
        ctx.fillStyle = "#B0BAC9"; ctx.font = "600 11px -apple-system, sans-serif";
        ctx.textAlign = "center"; ctx.fillText(i + "h", xOf(i), PY0 + 20); ctx.textAlign = "left";
      }

      ctx.strokeStyle = "#6741D9"; ctx.lineWidth = 3.4;
      ctx.beginPath();
      for (i = 0; i <= 400; i++) {
        t = TMAX * i / 400;
        x = xOf(t); y = yOf(frac(t, env));
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = "rgba(103,65,217,0.10)";
      ctx.lineTo(xOf(TMAX), PY0); ctx.lineTo(PX0, PY0); ctx.closePath(); ctx.fill();

      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("细菌数量（对数刻度）随时间的变化", PX0, 34);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("横轴：接入新鲜肉汤后的时间（小时）　·　纵轴：细菌数量（相对初始值）", PX0, 54);
      ctx.fillText("四个阶段依次走完；环境越适宜，对数期越陡、稳定期来得越早、衰亡也越快。", PX0, 382);
      ctx.restore();

      if (vE) vE.textContent = env.toFixed(1) + "×";
      if (out) {
        f = frac(4.0, env);
        out.innerHTML = "环境适宜度 <b>" + env.toFixed(1) + "×</b>　·　对数期的繁殖速率 ≈ <b>" + (1.75 * env).toFixed(2) +
          "</b>（相对）　·　4 小时左右跑完迟缓期，数量已涨到初始的 <b>" + f.toFixed(2) +
          " 倍</b>　·　" + (env > 1.1 ? "环境很舒服：对数期又陡又快，稳定期提前，但稳定期一过衰亡也更猛。" :
            env < 0.9 ? "环境不太合适：迟缓期拉长，对数期变缓，整条曲线被压平。" :
                        "基准条件。注意稳定期不是“不再繁殖”，而是新生和死亡刚好抵消。");
      }
    }
    if (sE) sE.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }
'''),
    ("lab_heat", '''
  function lab_heat(lab) {
    var cv = $("canvas", lab);
    var sT = $('[data-ctrl="temp"]', lab);
    var sH = $('[data-ctrl="hold"]', lab);
    var out = $(".lab-readout", lab);
    var vT = sT ? sT.closest(".ctrl").querySelector(".v") : null;
    var vH = sH ? sH.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var PX0 = 96, PX1 = 744, PY0 = 316, PY1 = 100, TMAX = 1800, LOGMIN = 7;
    var TREF = 63, DREF = 360, ZVAL = 4.33;
    function dOf(T) { return DREF * Math.pow(10, -(T - TREF) / ZVAL); }
    function xOf(t) { return PX0 + t / TMAX * (PX1 - PX0); }
    function yOf(lg) { return PY0 - lg / LOGMIN * (PY0 - PY1); }
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var T = sT ? parseFloat(sT.value) : 63;
      var hold = sH ? parseFloat(sH.value) : 1800;
      var D = dOf(T);
      var lr = hold / D;
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var i, t, l, x, y;
      ctx.strokeStyle = "#EDF0F6"; ctx.lineWidth = 1;
      for (i = 0; i <= LOGMIN; i++) {
        y = yOf(i);
        ctx.beginPath(); ctx.moveTo(PX0, y); ctx.lineTo(PX1, y); ctx.stroke();
        ctx.fillStyle = "#B0BAC9"; ctx.font = "600 11px -apple-system, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(i === 0 ? "1" : "1e-" + i, PX0 - 8, y + 4);
        ctx.textAlign = "left";
      }
      ctx.strokeStyle = "#9AA7BE"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(PX0, PY0); ctx.lineTo(PX1, PY0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PX0, PY0); ctx.lineTo(PX0, PY1 - 12); ctx.stroke();
      ctx.fillStyle = "#B0BAC9"; ctx.font = "600 11px -apple-system, sans-serif";
      for (i = 0; i <= 4; i++) {
        var tv = TMAX * i / 4;
        ctx.textAlign = "center";
        ctx.fillText(tv === 0 ? "0" : (tv + "s"), xOf(tv), PY0 + 20);
      }
      ctx.textAlign = "left";

      ctx.strokeStyle = "#E03131"; ctx.lineWidth = 1.6; ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.moveTo(PX0, yOf(5)); ctx.lineTo(PX1, yOf(5)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#E03131"; ctx.font = "700 12px -apple-system, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("安全线：杀灭 5 个对数级", PX1 - 4, yOf(5) - 9);
      ctx.textAlign = "left";

      var CURVES = [
        { T: 63, c: "rgba(139,150,170,0.85)", dash: [5, 4], nm: "63℃（低温长时）" },
        { T: 72, c: "rgba(232,89,12,0.55)", dash: [5, 4], nm: "72℃（高温短时）" }
      ];
      for (i = 0; i < CURVES.length; i++) {
        var dd = dOf(CURVES[i].T);
        ctx.strokeStyle = CURVES[i].c; ctx.lineWidth = 1.8;
        ctx.setLineDash(CURVES[i].dash);
        ctx.beginPath();
        for (t = 0; t <= TMAX; t += 10) {
          l = t / dd;
          x = xOf(t); y = yOf(Math.min(LOGMIN, l));
          if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.strokeStyle = "#2F9E44"; ctx.lineWidth = 3.2;
      ctx.beginPath();
      for (t = 0; t <= TMAX; t += 6) {
        l = t / D;
        x = xOf(t); y = yOf(Math.min(LOGMIN, l));
        if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.strokeStyle = "#2F9E44"; ctx.lineWidth = 1.6; ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(xOf(hold), PY0); ctx.lineTo(xOf(hold), yOf(Math.min(LOGMIN, lr))); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#1B7A34";
      ctx.beginPath(); ctx.arc(xOf(hold), yOf(Math.min(LOGMIN, lr)), 7, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(xOf(hold), yOf(Math.min(LOGMIN, lr)), 7, 0, Math.PI * 2); ctx.stroke();

      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("存活微生物的比例（对数刻度）随时间下降", PX0 - 6, 36);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("绿实线＝当前温度 " + T + "℃　绿点＝现在的条件　灰虚线＝63℃　橙虚线＝72℃", PX0 - 6, 58);
      ctx.fillText("温度每升高约 4.3℃，同样的杀灭效果所需时间就缩短到 1/10。", PX0 - 6, 382);
      ctx.restore();

      if (vT) vT.textContent = T + "";
      if (vH) vH.textContent = hold + "";
      if (out) {
        var ok = lr >= 5;
        var dTxt = D >= 1 ? D.toFixed(0) + " s" : (D >= 0.01 ? D.toFixed(3) + " s" : D.toExponential(1) + " s");
        var lrTxt = lr > 12 ? "> 12" : lr.toFixed(1);
        out.innerHTML = "温度 <b>" + T + "℃</b>　·　保持 <b>" + hold + " s</b>　·　该温度下的 D 值 ≈ <b>" +
          dTxt + "</b>　·　杀灭 <b>" + lrTxt + " 个对数级</b>　·　存活约 <b>" +
          Math.pow(10, -Math.min(lr, 7)).toExponential(1) + "</b>　·　" +
          (ok ? "✅ 达到巴氏消毒标准（≥ 5 个对数级）：63℃/30 分钟与 72℃/15 秒是等效的两种做法。" :
                "还不够：需要把时间延长到约 <b>" + (5 * D >= 60 ? (5 * D / 60).toFixed(1) + " 分钟" : (5 * D).toFixed(0) + " 秒") + "</b>。");
      }
    }
    if (sT) sT.addEventListener("input", draw);
    if (sH) sH.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }
'''),
    ("lab_spread", '''
  function lab_spread(lab) {
    var cv = $("canvas", lab);
    var sB = $('[data-ctrl="bend"]', lab);
    var out = $(".lab-readout", lab);
    var vB = sB ? sB.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400, NX = 316, CY = 252;
    var dust = [], t0 = 0, i, u;
    for (i = 0; i < 30; i++) {
      u = Math.sin(i * 12.9898 + 3.3) * 43758.5453;
      dust.push({ x: 232 + (u - Math.floor(u)) * 400, s: (i % 7) / 7, r: 1.4 + (i % 3) * 0.6 });
    }
    function flaskPath(ctx) {
      ctx.beginPath();
      ctx.moveTo(NX - 9, CY);
      ctx.bezierCurveTo(NX - 26, CY + 16, NX - 116, CY + 40, NX - 116, CY + 88);
      ctx.bezierCurveTo(NX - 116, CY + 126, NX - 62, CY + 134, NX, CY + 134);
      ctx.bezierCurveTo(NX + 62, CY + 134, NX + 116, CY + 126, NX + 116, CY + 88);
      ctx.bezierCurveTo(NX + 116, CY + 40, NX + 26, CY + 16, NX + 9, CY);
    }
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      if (!t0) t0 = ts;
      var b = sB ? parseFloat(sB.value) : 0;
      var bend = b / 100;
      var r = 76 * bend, up = 110 - 20 * bend;
      var by = CY - up, hx = NX + r;
      var bad = bend < 0.55;
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var ph = ((ts - t0) / 2600) % 1;
      for (i = 0; i < dust.length; i++) {
        var dy = 16 + ((ph + dust[i].s) % 1) * 42;
        ctx.fillStyle = "rgba(120,132,152,0.62)";
        ctx.beginPath(); ctx.arc(dust[i].x, dy, dust[i].r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("空气里的灰尘与微生物", 40, 22);

      ctx.strokeStyle = "#9DB4D0"; ctx.lineWidth = 13;
      ctx.lineJoin = "round"; ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(NX, CY - 4);
      ctx.lineTo(NX, by);
      if (r > 2) {
        for (i = 1; i <= 40; i++) {
          var th = Math.PI - Math.PI * i / 40;
          ctx.lineTo(hx + Math.cos(th) * r, by - Math.sin(th) * r);
        }
      }
      ctx.stroke();
      ctx.strokeStyle = "#EAF2FB"; ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(NX, CY - 4);
      ctx.lineTo(NX, by);
      if (r > 2) {
        for (i = 1; i <= 40; i++) {
          var th2 = Math.PI - Math.PI * i / 40;
          ctx.lineTo(hx + Math.cos(th2) * r, by - Math.sin(th2) * r);
        }
      }
      ctx.stroke();

      flaskPath(ctx);
      ctx.save(); ctx.clip();
      var inside = bad;
      ctx.fillStyle = inside ? "rgba(150,168,86,0.62)" : "rgba(246,222,148,0.66)";
      ctx.fillRect(NX - 130, CY + 62, 260, 90);
      if (inside) {
        for (i = 0; i < 46; i++) {
          var ux = Math.sin(i * 7.77 + 1.1) * 9999;
          var uy = Math.sin(i * 3.31 + 2.2) * 9999;
          ux = ux - Math.floor(ux); uy = uy - Math.floor(uy);
          ctx.fillStyle = "rgba(84,104,32,0.75)";
          ctx.beginPath();
          ctx.arc(NX - 96 + ux * 192, CY + 74 + uy * 50, 2.1 + (i % 3) * 0.7, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.restore();
      ctx.strokeStyle = "#9DB4D0"; ctx.lineWidth = 3.4; ctx.stroke();

      if (bad) {
        ctx.strokeStyle = "#E03131"; ctx.lineWidth = 2.2; ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.moveTo(NX, 66); ctx.lineTo(NX, CY + 46); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#E03131";
        ctx.beginPath();
        ctx.moveTo(NX, CY + 58); ctx.lineTo(NX - 7, CY + 44); ctx.lineTo(NX + 7, CY + 44);
        ctx.closePath(); ctx.fill();
        ctx.font = "700 12.5px -apple-system, sans-serif";
        ctx.fillText("微生物直接落进肉汤", NX + 18, 188);
      } else {
        for (i = 0; i < 26; i++) {
          var tb = (i % 13) / 13;
          ctx.fillStyle = "rgba(120,132,152,0.88)";
          ctx.beginPath();
          ctx.arc(hx - 40 + tb * 80, by - r - 4 + (i % 4) * 2.4, 2.3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = "#5C6B82"; ctx.font = "700 12.5px -apple-system, sans-serif";
        ctx.fillText("灰尘全落在弯道外面，进不去", hx + 58, by - r + 18);
      }

      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("肉汤状态：", 620, 128);
      ctx.fillStyle = inside ? "#5E7018" : "#B8860B";
      ctx.font = "800 17px -apple-system, sans-serif";
      ctx.fillText(inside ? "浑浊、腐败" : "清澈、不腐", 620, 156);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText(inside ? "长满了微生物" : "放了几个月也没坏", 620, 178);
      ctx.fillText("瓶颈弯曲度 " + b + "%", 620, 96);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("空气始终可以自由进出瓶子——被拦住的只有灰尘。", 60, 382);
      ctx.restore();

      if (vB) vB.textContent = b + "";
      if (out) {
        out.innerHTML = "瓶颈弯曲度 <b>" + b + "%</b>　·　" +
          (bad ? "瓶颈还太直：空气中的微生物可以直接落进肉汤，肉汤很快就<b>浑浊腐败</b>。" :
                 "弯道足够深：灰尘落在弯道外面进不去，空气能自由进出、微生物却进不来，肉汤<b>几个月都不腐败</b>。") +
          "　·　这一弯证明了：腐败来自空气中的微生物，而不是肉汤自己“长出”生命——自然发生说就此站不住了。";
      }
    }
    if (sB) sB.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    requestAnimationFrame(function loop(ts) { draw(ts); requestAnimationFrame(loop); });
  }
'''),
]

INIT = [
    ("colony", "lab_colony"),
    ("heat", "lab_heat"),
    ("spread", "lab_spread"),
]
