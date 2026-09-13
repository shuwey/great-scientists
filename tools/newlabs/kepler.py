# -*- coding: utf-8 -*-
"""开普勒「玩一玩」重做规格。

改动理由（见 tools/labs-audit.html）：
  实验1 椭圆轨道   —— 原本就是原创且质量好，保留（HTML 参数照旧）
  实验2 太阳系     —— 与哥白尼页字节级完全相同，改为开普勒自己的「面积定律」
  实验3 第三定律   —— 与哥白尼页字节级完全相同，改为真正的 T² ∝ a³ 对数拟合
  同时删掉「用数学描述自然」这条与开普勒无关的兜底文案。
"""

SITE = "kepler"
TITLE = "动手玩一玩 · 三个开普勒小实验 | 读懂开普勒"
META = "三个可直接在网页上操作的互动演示：椭圆轨道、面积定律、以及 T²∝a³ 的对数拟合。拖动滑块，亲眼看见开普勒怎么把天空写成公式。"
CLAIM = "光看文字不够直观？下面三个小实验，你直接用鼠标拖动滑块——看轨道怎么变扁、看行星扫过的面积为什么总是相等、看八颗行星怎样落在同一条直线上。"

LABS = [
    {
        "id": "ellipse",
        "h2": "🪐 实验一 · 椭圆轨道：太阳在焦点",
        "intro": "拖动“离心率”，看行星轨道如何从正圆变扁；注意它靠近太阳时明显更快。",
        "kind": "ellipse",
        "card": "椭圆轨道：太阳在焦点",
        "badge": "可拖动",
        "desc": "离心率越大，轨道越扁，近/远日点速度差越明显。",
        "controls": [
            {"ctrl": "ecc", "label": "离心率 e", "v": "0.40", "min": "0", "max": "0.8", "value": "0.4", "step": "0.05"},
        ],
        "callout": "行星走的不是正圆，是椭圆；太阳不在圆心，而在其中一个焦点上——这就是开普勒第一定律。想看它怎么被从火星数据里抠出来，去看 <a href=\"detail/mars.html\">火星：八年的纠缠</a>。",
    },
    {
        "id": "areal",
        "h2": "📐 实验二 · 面积定律：快慢不一样，面积一样",
        "intro": "轨道被切成 12 个扇形，每个扇形行星都花同样的时间走完。拖动“动画速度”看它跑——近日点那段又短又胖，远日点那段又长又瘦，可面积是一样的。",
        "kind": "areal",
        "card": "面积定律：等时间扫等面积",
        "badge": "可拖动",
        "desc": "行星与太阳的连线，在相同的时间里扫过相同的面积。",
        "controls": [
            {"ctrl": "speed", "label": "动画速度", "v": "1.0×", "min": "0.2", "max": "3", "value": "1", "step": "0.1"},
        ],
        "callout": "走得快的地方离太阳近，走得慢的地方离太阳远——但连线扫过的面积分毫不差。这就是开普勒第二定律。详见 <a href=\"detail/laws.html\">三大定律：把天空写成公式</a>。",
    },
    {
        "id": "third",
        "h2": "📈 实验三 · 第三定律：让八颗行星排成一条线",
        "intro": "横轴是轨道半长轴、纵轴是公转周期，都取了对数，所以“T = a 的 n 次方”画出来就是一条直线。拖动“指数 n”，把这条线拧到八颗行星全都落上去。",
        "kind": "third",
        "card": "第三定律：T² ∝ a³",
        "badge": "可拖动",
        "desc": "对数坐标下，八颗行星几乎落在同一条直线上——直线的斜率就是那个 1.5。",
        "controls": [
            {"ctrl": "power", "label": "周期指数 n", "v": "1.00", "min": "1", "max": "2", "value": "1", "step": "0.01"},
        ],
        "callout": "当 n 拧到 1.50，八颗行星——从水星到海王星，跨越 78 倍的距离——全部落在同一条直线上。开普勒当年手上只有 6 颗行星的数据（水星到土星）；天王星、海王星是后来才发现的，却也同样落在这条线上——这才是这条定律最厉害的地方。写成公式就是 T² ∝ a³。想读完整故事去看 <a href=\"detail/laws.html\">三大定律：把天空写成公式</a>。",
    },
]

FUNCS = [
    ("lab_areal", '''
  function lab_areal(lab) {
    var cv = $("canvas", lab);
    var sS = $('[data-ctrl="speed"]', lab);
    var out = $(".lab-readout", lab);
    var vS = sS ? sS.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var sunX = 420, sunY = 200, A = 165, ECC = 0.6;
    var B = A * Math.sqrt(1 - ECC * ECC), CC = A * ECC, cxE = sunX - CC;
    var NSEC = 12, ES = [];
    (function solveAll() {
      var k, E, M, d, it;
      for (k = 0; k <= NSEC; k++) {
        M = Math.PI * 2 * k / NSEC;
        E = M;
        for (it = 0; it < 60; it++) {
          d = (E - ECC * Math.sin(E) - M) / (1 - ECC * Math.cos(E));
          E -= d;
          if (Math.abs(d) < 1e-10) break;
        }
        ES.push(E);
      }
    })();
    function pt(E) { return [cxE + A * Math.cos(E), sunY - B * Math.sin(E)]; }
    function arcTo(ctx, E1, E2) {
      var n = 26, i, E, p;
      for (i = 0; i <= n; i++) {
        E = E1 + (E2 - E1) * i / n;
        p = pt(E);
        if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
      }
    }
    function solveE(M) {
      var E = M, d, it;
      for (it = 0; it < 60; it++) {
        d = (E - ECC * Math.sin(E) - M) / (1 - ECC * Math.cos(E));
        E -= d;
        if (Math.abs(d) < 1e-10) break;
      }
      return E;
    }
    var t0 = 0, Mnow = 0;
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      if (!t0) t0 = ts;
      var dt = Math.min(0.05, (ts - t0) / 1000); t0 = ts;
      var sp = sS ? parseFloat(sS.value) : 1;
      Mnow += dt * sp * 0.42;
      if (Mnow > Math.PI * 2) Mnow -= Math.PI * 2;
      var idxNow = Math.floor(Mnow / (Math.PI * 2) * NSEC);

      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var i;
      for (i = 0; i < NSEC; i++) {
        ctx.beginPath();
        ctx.moveTo(sunX, sunY);
        arcTo(ctx, ES[i], ES[i + 1]);
        ctx.lineTo(sunX, sunY);
        ctx.closePath();
        ctx.fillStyle = (i === idxNow) ? "rgba(245,159,0,.30)"
          : (i % 2 ? "rgba(59,91,219,.14)" : "rgba(12,166,120,.13)");
        ctx.fill();
      }
      ctx.strokeStyle = "#8B96AA"; ctx.lineWidth = 1.8;
      ctx.beginPath(); arcTo(ctx, 0, Math.PI * 2); ctx.stroke();

      var Enow = solveE(Mnow), P = pt(Enow);
      ctx.fillStyle = "#F59F00";
      ctx.beginPath(); ctx.arc(sunX, sunY, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("太阳", sunX - 13, sunY + 30);

      ctx.strokeStyle = "rgba(27,37,48,.55)"; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(sunX, sunY); ctx.lineTo(P[0], P[1]); ctx.stroke();
      ctx.fillStyle = "#3B5BDB";
      ctx.beginPath(); ctx.arc(P[0], P[1], 7, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = "#C1553A"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("近日点", pt(0)[0] - 34, pt(0)[1] - 18);
      ctx.fillStyle = "#3B7DD8";
      ctx.fillText("远日点", pt(Math.PI)[0] - 8, pt(Math.PI)[1] - 12);

      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("相同的时间，相同的面积", 566, 88);
      ctx.strokeStyle = "#E4E8F0"; ctx.beginPath(); ctx.moveTo(566, 100); ctx.lineTo(796, 100); ctx.stroke();
      ctx.fillStyle = "rgba(59,91,219,.35)";
      ctx.fillRect(566, 122, 26, 18); ctx.strokeStyle = "#3B5BDB"; ctx.lineWidth = 1; ctx.strokeRect(566, 122, 26, 18);
      ctx.fillStyle = "#5C6B82"; ctx.font = "600 13px -apple-system, sans-serif";
      ctx.fillText("12 个扇形，每块面积相同", 604, 136);
      ctx.fillStyle = "rgba(245,159,0,.5)";
      ctx.fillRect(566, 158, 26, 18); ctx.strokeStyle = "#F59F00"; ctx.strokeRect(566, 158, 26, 18);
      ctx.fillStyle = "#5C6B82";
      ctx.fillText("当前正在扫过的那一块", 604, 172);
      ctx.fillStyle = "#1B2530"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("近日点：跑得快", 566, 226);
      ctx.fillStyle = "#5C6B82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("又短又胖的一段，几周就走完", 566, 248);
      ctx.fillStyle = "#1B2530"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("远日点：跑得慢", 566, 286);
      ctx.fillStyle = "#5C6B82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("又长又瘦的一段，要磨很久", 566, 308);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("12 块面积加起来，就是整条轨道", 566, 352);
      ctx.restore();

      if (vS) vS.textContent = sp.toFixed(1) + "×";
      if (out) {
        out.innerHTML = "行星正走在第 <b>" + (idxNow + 1) + "</b> / 12 块扇形里　·　每块用的时间一样、面积也一样　·　" +
          (idxNow === 0 ? "现在贴近近日点，走得最快" : (idxNow === 6 ? "现在到了远日点，走得最慢" : "连线扫过的面积始终相等"));
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }
'''),
    ("lab_third", '''
  function lab_third(lab) {
    var cv = $("canvas", lab);
    var sN = $('[data-ctrl="power"]', lab);
    var out = $(".lab-readout", lab);
    var vN = sN ? sN.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var PL = [
      ["水星", 0.387, 0.2408], ["金星", 0.723, 0.6152], ["地球", 1.0, 1.0], ["火星", 1.524, 1.8808],
      ["木星", 5.203, 11.862], ["土星", 9.537, 29.457], ["天王星", 19.19, 84.02], ["海王星", 30.07, 164.79]
    ];
    var PX0 = 96, PX1 = 500, PY0 = 340, PY1 = 62;
    var XL = -0.55, XR = 1.62, YB = -0.86, YT = 2.42;
    function lx(v) { return PX0 + (v - XL) / (XR - XL) * (PX1 - PX0); }
    function ly(v) { return PY0 - (v - YB) / (YT - YB) * (PY0 - PY1); }
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var n = sN ? parseFloat(sN.value) : 1;
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var i, j, la, lt, on = 0;
      ctx.strokeStyle = "#EDF0F6"; ctx.lineWidth = 1;
      var vgrid = [0.3, 0.5, 1, 2, 3, 5, 10, 20, 30];
      for (j = 0; j < vgrid.length; j++) {
        ctx.beginPath(); ctx.moveTo(lx(Math.log(vgrid[j]) / Math.LN10), PY1);
        ctx.lineTo(lx(Math.log(vgrid[j]) / Math.LN10), PY0); ctx.stroke();
      }
      var hgrid = [0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200];
      for (j = 0; j < hgrid.length; j++) {
        ctx.beginPath(); ctx.moveTo(PX0, ly(Math.log(hgrid[j]) / Math.LN10));
        ctx.lineTo(PX1, ly(Math.log(hgrid[j]) / Math.LN10)); ctx.stroke();
      }
      ctx.strokeStyle = "#9AA7BE"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(PX0, PY0); ctx.lineTo(PX1, PY0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PX0, PY0); ctx.lineTo(PX0, PY1); ctx.stroke();

      ctx.strokeStyle = "#E03131"; ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(lx(XL), ly(Math.max(YB, Math.min(YT, n * XL))));
      ctx.lineTo(lx(XR), ly(Math.max(YB, Math.min(YT, n * XR))));
      ctx.stroke();

      ctx.font = "600 12px -apple-system, sans-serif";
      for (i = 0; i < PL.length; i++) {
        la = Math.log(PL[i][1]) / Math.LN10;
        lt = Math.log(PL[i][2]) / Math.LN10;
        var dy = lt - n * la;
        var good = Math.abs(dy) < 0.03;
        if (good) on++;
        ctx.strokeStyle = good ? "rgba(12,166,120,.5)" : "rgba(224,49,49,.45)";
        ctx.lineWidth = good ? 2 : 1.6;
        ctx.setLineDash(good ? [] : [3, 3]);
        ctx.beginPath(); ctx.moveTo(lx(la), ly(lt)); ctx.lineTo(lx(la), ly(n * la)); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = good ? "#0CA678" : "#3B5BDB";
        ctx.beginPath(); ctx.arc(lx(la), ly(lt), 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#5C6B82";
        ctx.fillText(PL[i][0], lx(la) + 9, ly(lt) + 4);
      }

      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("轨道半长轴 a（天文单位，对数轴）", PX0 + 60, PY0 + 26);
      ctx.fillText("公转周期 T（年，对数轴）", PX0 - 6, PY1 - 16);

      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText(Math.abs(n - 1.5) < 0.005 ? "T² = a³" : "T = a^" + n.toFixed(2), 560, 88);
      ctx.strokeStyle = "#E4E8F0"; ctx.beginPath(); ctx.moveTo(560, 100); ctx.lineTo(796, 100); ctx.stroke();
      ctx.fillStyle = on === PL.length ? "#087F5B" : "#E03131";
      ctx.font = "800 15px -apple-system, sans-serif";
      ctx.fillText(on + " / " + PL.length + " 颗落在直线上", 560, 130);
      ctx.fillStyle = "#5C6B82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("红虚线＝离直线还有多远", 560, 156);
      ctx.fillStyle = "#1B2530"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("拖动滑块找那条直线", 560, 200);
      ctx.fillStyle = "#5C6B82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("从水星到海王星，a 差了 78 倍、", 560, 226);
      ctx.fillText("T 差了 684 倍，可它们偏偏落在", 560, 246);
      ctx.fillText("同一条直线上——斜率就是 1.5。", 560, 266);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("对数坐标：直线＝幂律关系", 560, 306);
      ctx.restore();

      if (vN) vN.textContent = n.toFixed(2);
      if (out) {
        out.innerHTML = "周期指数 n = <b>" + n.toFixed(2) + "</b>　·　8 颗行星里有 <b>" + on +
          "</b> 颗落在直线上　·　" + (on === PL.length
            ? "<span style='color:#087F5B;font-weight:800'>全部对齐：T² ∝ a³</span>"
            : "继续拧，让所有点都贴到那条线上");
      }
    }
    if (sN) sN.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }
'''),
]

INIT = [
    ("ellipse", "lab_ellipse"),
    ("areal", "lab_areal"),
    ("third", "lab_third"),
]
