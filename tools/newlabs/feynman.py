# -*- coding: utf-8 -*-
"""费曼「玩一玩」重做规格。

改动理由（见 tools/labs-audit.html）：
  实验1 把每一条路都走一遍 —— 原实现是真正的路径积分动画（多路径 + 相位箭头首尾相接），内容对、画面活，保留
  实验2 概率幅的干涉       —— 标题说「双缝实验里电子落点成条纹」，画面却是与法拉第、麦克斯韦共用的同一条通用正弦波
                             改为真·双缝干涉：两条缝发出的波叠出条纹，波长滑块连条纹颜色一起变
  实验3 落点的概率分布     —— 原属簇 1「通用曲线模板」（param1/param2 + expr 开关），读数还是「用数学描述自然」的占位文案
                             改为「单电子逐个落点」：一个个电子随机落下，累积起来条纹自己浮现——费曼最著名的那个思想实验
"""

SITE = "feynman"
TITLE = "动手玩一玩 · 三个费曼小实验 | 读懂费曼"
META = "三个可直接在网页上操作的互动演示：粒子为什么把每一条路都走一遍、双缝干涉怎样叠出明暗条纹、一个一个发射电子怎样自己攒出条纹。拖动滑块，亲手看见量子力学最怪的地方。"
CLAIM = "光看文字不够直观？下面三个小实验，你直接用鼠标拖动滑块——看每条路径的相位箭头怎样首尾相接、看波长怎样决定条纹的疏密、看电子一个一个落下来怎样自己排成条纹。"

LABS = [
    {
        "id": "path",
        "h2": "🌀 实验一 · 把每一条路都走一遍",
        "intro": "拖动“ℏ 大小”，看每条路径的相位箭头怎样首尾相接：ℏ 越小，箭头互相抵消得越厉害，最后只剩靠近直线的那几条。",
        "kind": "path",
        "card": "把每一条路都走一遍",
        "badge": "可拖动",
        "desc": "每条路都有一个箭头；箭头首尾相接，总长度就是最终的概率幅。",
        "controls": [
            {"ctrl": "hbar", "label": "ℏ 大小", "v": "1.0×", "min": "0.25", "max": "2", "value": "1", "step": "0.05"},
        ],
        "callout": "费曼的答案不是“粒子偷偷选了一条路”，而是“所有路都算数”——越接近直线的路，箭头方向越一致，加起来越长。详见 <a href=\"detail/path.html\">路径积分：粒子把每一条路都走一遍</a>。",
    },
    {
        "id": "interfere",
        "h2": "🌊 实验二 · 双缝干涉：波给出的答案",
        "intro": "两条缝各发出一列波。拖动“波长”与“缝间距”，看波峰与波峰叠成亮纹、波峰与波谷抵消成暗纹——这就是干涉条纹。",
        "kind": "interfere",
        "card": "两条缝叠出的明暗",
        "badge": "可拖动",
        "desc": "波长越短、缝间距越大，条纹越密。红光条纹宽，紫光条纹窄。",
        "controls": [
            {"ctrl": "wave", "label": "波长（nm）", "v": "550", "min": "380", "max": "700", "value": "550", "step": "10"},
            {"ctrl": "sep", "label": "缝间距", "v": "1.0×", "min": "0.5", "max": "2.5", "value": "1", "step": "0.1"},
        ],
        "callout": "条纹不是两条缝各自画的，而是“哪条路都走”的叠加结果：路程差正好是整数个波长 → 亮纹；差半个波长 → 暗纹。详见 <a href=\"detail/qed.html\">量子电动力学：光与电子怎么打交道</a>。",
    },
    {
        "id": "dist",
        "h2": "📉 实验三 · 一个一个电子，也能自己排成条纹",
        "intro": "把电子一个一个发射出去——每一个落在哪里都是随机的。拖动“已发射电子数”，看横七竖八的落点怎样自己攒出条纹。",
        "kind": "dist",
        "card": "随机的点，攒出确定的纹",
        "badge": "可拖动",
        "desc": "单次落点不可预测，大量落点的分布却和波的干涉条纹完全一致。",
        "controls": [
            {"ctrl": "n", "label": "已发射电子数", "v": "300", "min": "0", "max": "2000", "value": "300", "step": "50"},
            {"ctrl": "sep", "label": "缝间距", "v": "1.0×", "min": "0.5", "max": "2.5", "value": "1", "step": "0.1"},
        ],
        "callout": "这是量子力学最著名的一张增长图：少量电子时看不出规律，电子多了，条纹自己浮现。谁在安排它们？“哪一个缝”这个问题，一测量条纹就消失了。物理学家算这些概率，靠的是另一种“画图”的办法：<a href=\"detail/diagram.html\">费曼图：把一整页算式画成一张画</a>。",
    },
]

FUNCS = [
    ("lab_interfere", '''
  function lab_interfere(lab) {
    var cv = $("canvas", lab);
    var sW = $('[data-ctrl="wave"]', lab);
    var sS = $('[data-ctrl="sep"]', lab);
    var out = $(".lab-readout", lab);
    var vW = sW ? sW.closest(".ctrl").querySelector(".v") : null;
    var vS = sS ? sS.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var BX = 286, SX = 606, SY = 214, HALF = 138;
    function rgbOf(w) {
      var r = 0, g = 0, b = 0, t = 0;
      if (w >= 380 && w < 440) { r = -(w - 440) / 60; b = 1; }
      else if (w < 490) { g = (w - 440) / 50; b = 1; }
      else if (w < 510) { g = 1; b = -(w - 510) / 20; }
      else if (w < 580) { r = (w - 510) / 70; g = 1; }
      else if (w < 645) { r = 1; g = -(w - 645) / 65; }
      else { r = 1; }
      if (w > 700) t = 0.35; else if (w < 420) t = 0.35 + 0.65 * (w - 380) / 40;
      else if (w > 660) t = 0.35 + 0.65 * (700 - w) / 40; else t = 1;
      r = Math.round(255 * Math.pow(Math.max(0, r) * t, 0.8));
      g = Math.round(255 * Math.pow(Math.max(0, g) * t, 0.8));
      b = Math.round(255 * Math.pow(Math.max(0, b) * t, 0.8));
      return "rgb(" + r + "," + g + "," + b + ")";
    }
    function nameOf(w) {
      if (w < 430) return "紫";
      if (w < 490) return "蓝";
      if (w < 545) return "绿";
      if (w < 590) return "黄";
      if (w < 625) return "橙";
      return "红";
    }
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var wl = sW ? parseFloat(sW.value) : 550;
      var sep = sS ? parseFloat(sS.value) : 1;
      var gap = 22 + sep * 12;
      var k = 3 * sep;
      var col = rgbOf(wl);
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, kk = S.w / W;
      ctx.save(); ctx.scale(kk, kk);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var i, y, s, inten;
      ctx.strokeStyle = col; ctx.lineWidth = 1.6;
      ctx.globalAlpha = 0.5;
      for (i = 0; i < 7; i++) {
        var wx = 60 + i * 34;
        ctx.beginPath(); ctx.moveTo(wx, 74); ctx.lineTo(wx, 354); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("入射波", 60, 62);
      ctx.fillText("两条缝 →", BX - 66, 372);

      ctx.fillStyle = "#4A5468";
      ctx.fillRect(BX, 66, 12, HALF - gap);
      ctx.fillRect(BX, SY + gap, 12, HALF - gap);

      ctx.globalAlpha = 0.34; ctx.strokeStyle = col; ctx.lineWidth = 1.3;
      var S1 = SY - gap, S2 = SY + gap;
      for (i = 1; i <= 5; i++) {
        var rr = i * 42;
        ctx.beginPath(); ctx.arc(BX + 12, S1, rr, -1.25, 1.25); ctx.stroke();
        ctx.beginPath(); ctx.arc(BX + 12, S2, rr, -1.25, 1.25); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#5C6B82"; ctx.font = "700 12px -apple-system, sans-serif";
      ctx.fillText("缝 A", BX - 40, S1 - 6);
      ctx.fillText("缝 B", BX - 40, S2 + 16);

      ctx.fillStyle = "#EDF0F6"; ctx.fillRect(SX, 66, 92, 288);
      ctx.strokeStyle = "#C9D3E0"; ctx.lineWidth = 1; ctx.strokeRect(SX, 66, 92, 288);
      for (y = 66; y <= 354; y += 3) {
        s = (y - SY) / HALF;
        inten = Math.pow(Math.cos(Math.PI * k * s), 2) * Math.exp(-s * s * 1.05);
        if (inten < 0.004) continue;
        ctx.globalAlpha = Math.min(1, inten);
        ctx.fillStyle = col;
        ctx.fillRect(SX + 1, y, 90, 3.2);
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#1B2530"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("屏幕", SX + 30, 58);

      var CX0 = SX + 104, CW = 96;
      ctx.strokeStyle = "#9AA7BE"; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(CX0, 66); ctx.lineTo(CX0, 354); ctx.stroke();
      ctx.strokeStyle = "#E8590C"; ctx.lineWidth = 2;
      ctx.beginPath();
      for (y = 66; y <= 354; y += 2) {
        s = (y - SY) / HALF;
        inten = Math.pow(Math.cos(Math.PI * k * s), 2) * Math.exp(-s * s * 1.05);
        var cxp = CX0 + inten * CW;
        if (y === 66) ctx.moveTo(cxp, y); else ctx.lineTo(cxp, y);
      }
      ctx.stroke();
      ctx.fillStyle = "#E8590C"; ctx.font = "700 12px -apple-system, sans-serif";
      ctx.fillText("光强", CX0, 58);

      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("双缝干涉：波峰遇波峰 = 亮纹，波峰遇波谷 = 暗纹", 60, 34);
      ctx.restore();

      var dY = 30 / (k * 1.0);
      if (vW) vW.textContent = wl.toFixed(0);
      if (vS) vS.textContent = sep.toFixed(1) + "×";
      if (out) {
        out.innerHTML = "波长 <b>" + wl.toFixed(0) + " nm</b>（" + nameOf(wl) + "光）　·　缝间距 <b>" + sep.toFixed(1) +
          "×</b>　·　条纹间距 ≈ <b>" + dY.toFixed(1) + " mm</b>　·　" +
          "波长越短、缝间距越大 → 条纹越密（" + nameOf(wl) + "光在屏幕上排出的明暗，就是这两条缝“合起来”的结果）。";
      }
    }
    if (sW) sW.addEventListener("input", draw);
    if (sS) sS.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }
'''),
    ("lab_dist", '''
  function lab_dist(lab) {
    var cv = $("canvas", lab);
    var sN = $('[data-ctrl="n"]', lab);
    var sS = $('[data-ctrl="sep"]', lab);
    var out = $(".lab-readout", lab);
    var vN = sN ? sN.closest(".ctrl").querySelector(".v") : null;
    var vS = sS ? sS.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var BX = 208, SY = 214, HALF = 138, PX = 438, PW = 242;
    var NB = 150, SLO = -1.12, SHI = 1.12;
    function frac(x) { return x - Math.floor(x); }
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var n = sN ? parseFloat(sN.value) : 300;
      var sep = sS ? parseFloat(sS.value) : 1;
      var k = 3 * sep, gap = 22 + sep * 12;
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, kk = S.w / W;
      ctx.save(); ctx.scale(kk, kk);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var i, s, cdf = [], cum = 0, v;
      for (i = 0; i < NB; i++) {
        s = SLO + (SHI - SLO) * (i + 0.5) / NB;
        cum += Math.pow(Math.cos(Math.PI * k * s), 2) * Math.exp(-s * s * 1.05);
        cdf.push(cum);
      }
      for (i = 0; i < NB; i++) cdf[i] = cdf[i] / cum;

      ctx.fillStyle = "#4A5468";
      ctx.fillRect(BX, 66, 12, HALF - gap);
      ctx.fillRect(BX, SY + gap, 12, HALF - gap);
      ctx.fillStyle = "#5C6B82"; ctx.font = "700 12px -apple-system, sans-serif";
      ctx.fillText("缝 A", BX - 42, SY - gap - 6);
      ctx.fillText("缝 B", BX - 42, SY + gap + 16);

      ctx.globalAlpha = 0.3; ctx.strokeStyle = "#7B8AA8"; ctx.lineWidth = 1.2;
      for (i = 1; i <= 4; i++) {
        var rr = i * 46;
        ctx.beginPath(); ctx.arc(BX + 12, SY - gap, rr, -1.15, 1.15); ctx.stroke();
        ctx.beginPath(); ctx.arc(BX + 12, SY + gap, rr, -1.15, 1.15); ctx.stroke();
      }
      ctx.globalAlpha = 1;

      ctx.fillStyle = "#EDF0F6"; ctx.fillRect(PX, 66, PW, 288);
      ctx.strokeStyle = "#C9D3E0"; ctx.lineWidth = 1; ctx.strokeRect(PX, 66, PW, 288);
      ctx.fillStyle = "#1B2530"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("屏幕：每一颗都是一个电子", PX - 4, 58);

      var shown = Math.min(n, 2000), u, lo, hi, mid, dotY, dotX;
      for (i = 0; i < shown; i++) {
        u = frac(Math.sin(i * 12.9898 + 4.1) * 43758.5453);
        lo = 0; hi = NB - 1;
        while (lo < hi) {
          mid = (lo + hi) >> 1;
          if (cdf[mid] < u) lo = mid + 1; else hi = mid;
        }
        s = SLO + (SHI - SLO) * (lo + 0.5) / NB;
        dotY = SY + s * HALF;
        dotX = PX + 8 + frac(Math.sin(i * 31.7 + 1.3) * 20000) * (PW - 16);
        ctx.fillStyle = "rgba(28,110,214," + (0.55 + 0.35 * frac(Math.sin(i * 7.7) * 9000)).toFixed(2) + ")";
        ctx.beginPath(); ctx.arc(dotX, dotY, 2.1, 0, Math.PI * 2); ctx.fill();
      }

      ctx.strokeStyle = "rgba(232,89,12,0.85)"; ctx.lineWidth = 2;
      ctx.beginPath();
      for (i = 0; i <= 120; i++) {
        s = SLO + (SHI - SLO) * i / 120;
        v = Math.pow(Math.cos(Math.PI * k * s), 2) * Math.exp(-s * s * 1.05);
        var ex = PX + PW + 10 + v * 96;
        var ey = SY + s * HALF;
        if (i === 0) ctx.moveTo(ex, ey); else ctx.lineTo(ex, ey);
      }
      ctx.stroke();
      ctx.fillStyle = "#E8590C"; ctx.font = "700 12px -apple-system, sans-serif";
      ctx.fillText("理论条纹", PX + PW + 12, 58);

      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("一个一个发射电子：单次随机，累积成条纹", 60, 34);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("每一个电子落在哪里都说不准；可它们自己排出的疏密，恰好就是干涉条纹。", 60, 374);
      ctx.restore();

      if (vN) vN.textContent = n.toFixed(0);
      if (vS) vS.textContent = sep.toFixed(1) + "×";
      if (out) {
        var dens = n < 60 ? "现在点还很稀，看不出规律——单看几颗，落点是随机的。" :
                   n < 600 ? "点的疏密开始成形：亮纹的地方点数明显更多。" :
                             "条纹已经清晰浮现：中间一条最亮，两侧对称变暗。";
        out.innerHTML = "已发射电子 <b>" + n.toFixed(0) + "</b> 颗　·　缝间距 <b>" + sep.toFixed(1) + "×</b>　·　" +
          dens + "　·　单个电子的落点无法预测，但成千上万颗的分布完全被波决定——这就是费曼说的「一个电子也干涉」。";
      }
    }
    if (sN) sN.addEventListener("input", draw);
    if (sS) sS.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }
'''),
]

INIT = [
    ("path", "lab_path"),
    ("interfere", "lab_interfere"),
    ("dist", "lab_dist"),
]
