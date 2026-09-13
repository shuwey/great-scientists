# -*- coding: utf-8 -*-
"""玻尔「玩一玩」重做规格。

改动理由（见 tools/labs-audit.html）：
  实验1 原子的楼层 —— 原与居里夫人页 0.99 相同，改为「离散壳层 + 跃迁发光」
  实验2 允许的轨道 —— 原画的是连续绕转，恰好与「轨道量子化」相反，改为「能级台阶」
  实验3 谱线在哪里 —— 原为通用高斯曲线，改为真实的氢原子巴尔末系谱线
  同时删掉「用数学描述自然」这条兜底文案。
"""

SITE = "bohr"
TITLE = "动手玩一玩 · 三个玻尔小实验 | 读懂玻尔"
META = "三个可直接在网页上操作的互动演示：离散的电子壳层、只能站档位的能量台阶、以及氢原子的巴尔末系谱线。拖动滑块，亲眼看见玻尔为什么要说“量子化”。"
CLAIM = "光看文字不够直观？下面三个小实验，你直接用鼠标拖动滑块——看电子只能待在固定的几层、看能量为什么只能一档一档地变、看氢原子的谱线落在哪儿。"

LABS = [
    {
        "id": "shells",
        "h2": "⚛️ 实验一 · 原子的“楼层”",
        "intro": "拖动“动画速度”，看电子在固定的几层壳上来回跳。它跳下来一次，就放出一份光——放出的光是什么颜色，取决于它掉了多远。",
        "kind": "shells",
        "card": "离散的电子壳层",
        "badge": "可拖动",
        "desc": "电子只能待在 n=1、2、3、4 这几层上，跳一次就放出一份能量恰好的光。",
        "controls": [
            {"ctrl": "speed", "label": "动画速度", "v": "1.0×", "min": "0.2", "max": "3", "value": "1", "step": "0.1"},
        ],
        "callout": "关键是“离散”：电子不可能停在两层之间。所以它掉下来时放出的光，频率也是几个固定值——不是随便什么颜色都行。这就是玻尔模型最硬的那块骨头，详见 <a href=\"detail/bohr-model.html\">玻尔模型：原子的“楼层”</a>。",
    },
    {
        "id": "levels",
        "h2": "🪜 实验二 · 能量台阶：只能站在档位上",
        "intro": "把能量画成一道楼梯。拖动“能级 n”，看电子只能落在标出来的那几级上——两级之间涂红的地方，是它永远停不住的位置。",
        "kind": "levels",
        "card": "能量台阶与禁戒区",
        "badge": "可拖动",
        "desc": "能级是分开的档位，不是一段连续的坡。停在两档之间？量子力学说不行。",
        "controls": [
            {"ctrl": "level", "label": "能级 n", "v": "1", "min": "1", "max": "4", "value": "1", "step": "1"},
        ],
        "callout": "连续的世界里，物体可以停在任意位置；可原子里的能量偏偏是“一份一份”的。这正是“量子”二字的来历。想看它怎么被光谱证实，去看 <a href=\"detail/spectrum.html\">氢原子光谱：巴尔末系</a>。",
    },
    {
        "id": "lines",
        "h2": "🌈 实验三 · 氢原子的谱线落在哪",
        "intro": "电子从高能级掉到第 2 层，就会放出一条特定波长的光。拖动“上能级 n”，看这条线在可见光谱上往哪挪、变成什么颜色。",
        "kind": "lines",
        "card": "巴尔末系：四条著名的线",
        "badge": "可拖动",
        "desc": "n=3→2 是红色的 Hα，n=4→2 是青色的 Hβ，n=5、6 继续往蓝紫挪。",
        "controls": [
            {"ctrl": "level", "label": "上能级 n", "v": "3", "min": "3", "max": "10", "value": "3", "step": "1"},
        ],
        "callout": "氢原子的谱线不是连续的一条彩虹，而是几根清清楚楚的亮线——巴尔末当年靠经验凑出了公式，玻尔则用能级把它推导了出来。详见 <a href=\"detail/spectrum.html\">氢原子光谱：巴尔末系</a>。",
    },
]

FUNCS = [
    ("lab_shells", '''
  function lab_shells(lab) {
    var cv = $("canvas", lab);
    var sS = $('[data-ctrl="speed"]', lab);
    var out = $(".lab-readout", lab);
    var vS = sS ? sS.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var nx = 240, ny = 205;
    var RAD = [0, 50, 86, 122, 158];
    var EN = [0, -13.6, -3.40, -1.51, -0.85];
    function wl2rgb(w) {
      var r = 0, g = 0, b = 0;
      if (w >= 380 && w < 440) { r = -(w - 440) / 60; b = 1; }
      else if (w < 490) { g = (w - 440) / 50; b = 1; }
      else if (w < 510) { g = 1; b = -(w - 510) / 20; }
      else if (w < 580) { r = (w - 510) / 70; g = 1; }
      else if (w < 645) { r = 1; g = -(w - 645) / 65; }
      else if (w <= 780) { r = 1; }
      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
    var cur = 1, ang = 0, holdT = 0, photons = [], jumpInfo = "还停在原地";
    var lastTrans = null, t0 = 0;
    var NAMES = ["", "第一层", "第二层", "第三层", "第四层"];
    function fire(from, to) {
      var de = Math.abs(EN[from] - EN[to]);
      var wl = 1240 / de;
      var col, tag;
      if (wl < 380) { col = [130, 110, 190]; tag = "紫外（看不见）"; }
      else if (wl > 780) { col = [150, 120, 100]; tag = "红外（看不见）"; }
      else { col = wl2rgb(wl); tag = wl.toFixed(0) + " nm 的可见光"; }
      photons.push({ a: ang, r: RAD[to], de: de, wl: wl, col: col, tag: tag, life: 1 });
      if (photons.length > 5) photons.shift();
      jumpInfo = "从" + NAMES[from] + "跳到" + NAMES[to] + "，放出 " + de.toFixed(2) + " eV（" + tag + "）";
    }
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      if (!t0) t0 = ts;
      var dt = Math.min(0.05, (ts - t0) / 1000); t0 = ts;
      var sp = sS ? parseFloat(sS.value) : 1;
      ang += dt * sp * 2.6 / cur;
      holdT += dt * sp;
      if (holdT > 1.5) {
        holdT = 0;
        var nxt = 1 + Math.floor(Math.random() * 4);
        if (nxt !== cur) {
          if (nxt < cur) fire(cur, nxt);
          else jumpInfo = "从" + NAMES[cur] + "跳到" + NAMES[nxt] + "，吸收了能量";
          cur = nxt; lastTrans = nxt;
        }
      }
      var i, p;
      for (i = photons.length - 1; i >= 0; i--) {
        photons[i].r += dt * sp * 130;
        photons[i].life -= dt * sp * 0.55;
        if (photons[i].life <= 0) photons.splice(i, 1);
      }
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = "#DCE2EC"; ctx.lineWidth = 1.6; ctx.setLineDash([5, 5]);
      for (i = 1; i <= 4; i++) {
        ctx.beginPath(); ctx.arc(nx, ny, RAD[i], 0, Math.PI * 2); ctx.stroke();
      }
      ctx.setLineDash([]);
      for (i = 1; i <= 4; i++) {
        ctx.fillStyle = "#9AA7BE"; ctx.font = "600 11.5px -apple-system, sans-serif";
        ctx.fillText("n=" + i, nx + RAD[i] - 4, ny - 6);
      }
      ctx.strokeStyle = "rgba(59,91,219,.35)"; ctx.lineWidth = 1.2; ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.arc(nx, ny, RAD[cur], 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);

      for (i = 0; i < photons.length; i++) {
        p = photons[i];
        ctx.strokeStyle = "rgba(" + p.col[0] + "," + p.col[1] + "," + p.col[2] + "," + Math.max(0, p.life).toFixed(2) + ")";
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(nx, ny, p.r, p.a - 0.5, p.a + 0.5); ctx.stroke();
      }

      ctx.fillStyle = "#F59F00";
      ctx.beginPath(); ctx.arc(nx, ny, 11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 11.5px -apple-system, sans-serif";
      ctx.fillText("原子核", nx - 55, ny + 4);

      var ex = nx + RAD[cur] * Math.cos(ang), ey = ny + RAD[cur] * Math.sin(ang);
      ctx.fillStyle = "#0CA678";
      ctx.beginPath(); ctx.arc(ex, ey, 7, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(12,166,120,.3)"; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(ex, ey, 10, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "#087F5B"; ctx.font = "700 12px -apple-system, sans-serif";
      ctx.fillText("电子", ex + 12, ey + 4);

      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("能级不是连续的，是一层一层的", 470, 84);
      ctx.strokeStyle = "#E4E8F0"; ctx.beginPath(); ctx.moveTo(470, 96); ctx.lineTo(796, 96); ctx.stroke();
      for (i = 1; i <= 4; i++) {
        var yy = 130 + (i - 1) * 44;
        ctx.strokeStyle = (i === cur) ? "#0CA678" : "#DCE2EC";
        ctx.lineWidth = (i === cur) ? 4 : 3;
        ctx.beginPath(); ctx.moveTo(470, yy); ctx.lineTo(500, yy); ctx.stroke();
        ctx.fillStyle = "#5C6B82"; ctx.font = "600 13px -apple-system, sans-serif";
        ctx.fillText("n=" + i, 510, yy + 5);
        ctx.fillStyle = "#1B2530"; ctx.font = "700 13px -apple-system, sans-serif";
        ctx.textAlign = "right"; ctx.fillText(EN[i].toFixed(2) + " eV", 796, yy + 5); ctx.textAlign = "left";
      }
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("两层之间：没有可以停留的位置", 470, 328);
      ctx.fillText("跳一次 = 放出一份能量恰好的光", 470, 352);
      ctx.restore();

      if (vS) vS.textContent = sp.toFixed(1) + "×";
      if (out) {
        out.innerHTML = "速度 <b>" + sp.toFixed(1) + "×</b>　·　电子在<b>第 " + cur + " 层</b>（E = " + EN[cur].toFixed(2) + " eV）　·　" + jumpInfo +
          "　·　只能在 4 层里挑，挑不到别处";
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }
'''),
    ("lab_levels", '''
  function lab_levels(lab) {
    var cv = $("canvas", lab);
    var sN = $('[data-ctrl="level"]', lab);
    var out = $(".lab-readout", lab);
    var vN = sN ? sN.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var X0 = 108, X1 = 396, TOP = 56, BOT = 352;
    var EMIN = -14.5, EMAX = 0.4;
    var prev = 1, glow = 0, absorbed = false;
    function yOf(e) { return BOT - (e - EMIN) / (EMAX - EMIN) * (BOT - TOP); }
    function eOf(n) { return -13.6 / (n * n); }
    var t0 = 0;
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      if (!t0) t0 = ts;
      var dt = Math.min(0.05, (ts - t0) / 1000); t0 = ts;
      var n = sN ? Math.round(parseFloat(sN.value)) : 1;
      if (n !== prev) { absorbed = n > prev; glow = 1; prev = n; }
      glow = Math.max(0, glow - dt * 1.4);
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var i, y1, y2;
      for (i = 1; i <= 4; i++) {
        y1 = yOf(eOf(i)); y2 = yOf(eOf(i + 1));
        ctx.fillStyle = "rgba(224,49,49,.07)";
        ctx.fillRect(X0, y2, X1 - X0, y1 - y2);
      }
      ctx.fillStyle = "rgba(224,49,49,.7)"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("红色区域：电子不许停在这里", X0 + 10, yOf(-2) + 4);

      ctx.strokeStyle = "#9AA7BE"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(X0 - 26, TOP); ctx.lineTo(X0 - 26, BOT); ctx.stroke();
      for (i = 0; i <= 4; i++) {
        ctx.fillStyle = "#8B96AA"; ctx.font = "600 11.5px -apple-system, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText((-13.6 + i * 3.4).toFixed(1), X0 - 34, yOf(-13.6 + i * 3.4) + 4);
        ctx.textAlign = "left";
      }
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("能量（eV）", X0 - 96, TOP - 22);

      for (i = 1; i <= 4; i++) {
        y1 = yOf(eOf(i));
        ctx.strokeStyle = (i === n) ? "#3B5BDB" : "#B9C3D4";
        ctx.lineWidth = (i === n) ? 6 : 4;
        ctx.beginPath(); ctx.moveTo(X0, y1); ctx.lineTo(X1, y1); ctx.stroke();
        ctx.fillStyle = (i === n) ? "#3B5BDB" : "#8B96AA";
        ctx.font = (i === n) ? "700 13px -apple-system, sans-serif" : "600 12px -apple-system, sans-serif";
        ctx.fillText("n=" + i + (i === n ? "　" + eOf(i).toFixed(2) + " eV" : ""), X1 + 14, y1 + 5);
      }
      ctx.fillStyle = "#C7D0DE"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("再往上 n=5、6…", X1 + 14, yOf(eOf(4)) - 26);
      ctx.fillText("会越挤越密", X1 + 14, yOf(eOf(4)) - 10);

      var ey = yOf(eOf(n));
      ctx.fillStyle = "rgba(12,166,120,.25)";
      ctx.beginPath(); ctx.arc(X0 + 160, ey, 26 + glow * 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#0CA678";
      ctx.beginPath(); ctx.arc(X0 + 160, ey, 13, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#087F5B"; ctx.font = "700 12px -apple-system, sans-serif";
      ctx.fillText("电子", X0 + 160 - 13, ey - 24);

      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("只能站在档位上", 560, 84);
      ctx.strokeStyle = "#E4E8F0"; ctx.beginPath(); ctx.moveTo(560, 96); ctx.lineTo(796, 96); ctx.stroke();
      ctx.fillStyle = "#5C6B82"; ctx.font = "600 12.5px -apple-system, sans-serif";
      ctx.fillText("像楼梯，不像斜坡。上楼只能一级", 560, 130);
      ctx.fillText("一级地跨，没有“半级”这个东西。", 560, 152);
      ctx.fillStyle = "#1B2530"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("往下一档：放出一份能量", 560, 200);
      ctx.fillStyle = "#5C6B82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("这份能量正好等于两档之差，", 560, 224);
      ctx.fillText("换成光就是一个固定的频率。", 560, 244);
      ctx.fillStyle = "#1B2530"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("往上一档：吸收一份能量", 560, 288);
      ctx.fillStyle = "#5C6B82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("给得不够，它就一步也上不去。", 560, 312);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("这就是“量子”两个字的意思", 560, 356);
      ctx.restore();

      if (vN) vN.textContent = String(n);
      if (out) {
        out.innerHTML = "电子在第 <b>" + n + "</b> 能级　·　E = -13.6 / " + n + "² = <b>" + eOf(n).toFixed(2) +
          " eV</b>　·　" + (absorbed ? "刚才吸收了一份能量，跳上了一档" : "刚才放出一份能量，掉下了一档") +
          "　·　两条档位之间没有可以停留的位置";
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }
'''),
    ("lab_lines", '''
  function lab_lines(lab) {
    var cv = $("canvas", lab);
    var sN = $('[data-ctrl="level"]', lab);
    var out = $(".lab-readout", lab);
    var vN = sN ? sN.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var RY = 1.097373e7;
    function lambda(n) { return 1e9 / (RY * (0.25 - 1 / (n * n))); }
    function wl2rgb(w) {
      var r = 0, g = 0, b = 0;
      if (w >= 380 && w < 440) { r = -(w - 440) / 60; b = 1; }
      else if (w < 490) { g = (w - 440) / 50; b = 1; }
      else if (w < 510) { g = 1; b = -(w - 510) / 20; }
      else if (w < 580) { r = (w - 510) / 70; g = 1; }
      else if (w < 645) { r = 1; g = -(w - 645) / 65; }
      else if (w <= 780) { r = 1; }
      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
    var SX0 = 348, SX1 = 790, SY = 208, SH = 52;
    function xOf(w) { return SX0 + (w - 375) / (785 - 375) * (SX1 - SX0); }
    var LAD = [1, 2, 3, 4, 5, 6];
    var LX0 = 78, LX1 = 268, LTOP = 62, LBOT = 292;
    function lyOf(n) { return LBOT - (LAD.length - n) / (LAD.length - 0.4) * (LBOT - LTOP); }
    var t0 = 0;
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var n = sN ? Math.round(parseFloat(sN.value)) : 3;
      var wl = lambda(n);
      var col = (wl >= 380 && wl <= 780) ? wl2rgb(wl) : [150, 150, 160];
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = "#1B2530"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("能级图（示意）", LX0, 40);
      var i, y;
      for (i = 0; i < LAD.length; i++) {
        y = lyOf(LAD[i]);
        ctx.strokeStyle = "#C7D0DE"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(LX0, y); ctx.lineTo(LX1, y); ctx.stroke();
        ctx.fillStyle = "#8B96AA"; ctx.font = "600 11.5px -apple-system, sans-serif";
        ctx.fillText("n=" + LAD[i], LX1 + 8, y + 4);
      }
      var yHi = lyOf(n), yLo = lyOf(2);
      ctx.strokeStyle = "#E03131"; ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.moveTo(LX0 + 118, yHi); ctx.lineTo(LX0 + 118, yLo); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(LX0 + 112, yLo - 8); ctx.lineTo(LX0 + 118, yLo); ctx.lineTo(LX0 + 124, yLo - 8);
      ctx.stroke();
      ctx.fillStyle = "#E03131"; ctx.font = "700 12px -apple-system, sans-serif";
      ctx.fillText("n=" + n + " → 2", LX0 + 132, (yHi + yLo) / 2 + 4);

      ctx.fillStyle = "#1B2530"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("可见光谱", SX0, 40);
      var w, c;
      for (w = 375; w <= 785; w += 1) {
        c = wl2rgb(w);
        if (w < 380 || w > 780) c = [232, 236, 243];
        ctx.fillStyle = "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
        ctx.fillRect(xOf(w), SY, (SX1 - SX0) / (785 - 375) + 0.6, SH);
      }
      ctx.strokeStyle = "#C7D0DE"; ctx.lineWidth = 1;
      ctx.strokeRect(SX0, SY, SX1 - SX0, SH);

      var marks = [3, 4, 5, 6], names = ["", "", "", "Hα", "Hβ", "Hγ", "Hδ"];
      for (i = 0; i < marks.length; i++) {
        var mw = lambda(marks[i]);
        ctx.strokeStyle = "rgba(27,37,48,.35)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(xOf(mw), SY + SH); ctx.lineTo(xOf(mw), SY + SH + 8); ctx.stroke();
        ctx.fillStyle = "#8B96AA"; ctx.font = "600 11px -apple-system, sans-serif";
        ctx.fillText(names[marks[i]], xOf(mw) - 10, SY + SH + 24);
      }

      var lx = xOf(wl);
      ctx.strokeStyle = "#E03131"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(lx, SY - 26); ctx.lineTo(lx, SY + SH + 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(lx - 6, SY - 18); ctx.lineTo(lx, SY - 26); ctx.lineTo(lx + 6, SY - 18); ctx.stroke();
      ctx.fillStyle = "#E03131"; ctx.font = "800 13px -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(wl.toFixed(1) + " nm", lx, SY - 36);
      ctx.textAlign = "left";

      ctx.fillStyle = "#8B96AA"; ctx.font = "600 11.5px -apple-system, sans-serif";
      ctx.fillText("380 nm", SX0 - 4, SY + SH + 42);
      ctx.fillText("780 nm", SX1 - 42, SY + SH + 42);
      ctx.fillText("波长越短 → 越偏蓝紫；越长 → 越偏红", SX0, SY - 56);

      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("为什么只有这几条线？", SX0, 340);
      ctx.fillStyle = "#5C6B82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("因为能级是固定的，落差就只有那么几种——", SX0, 364);
      ctx.fillText("换成光，自然也只有那么几个波长。", SX0, 386);
      ctx.restore();

      var nm = names[n] || "";
      if (vN) vN.textContent = String(n);
      if (out) {
        out.innerHTML = "上能级 n = <b>" + n + "</b> → 第 2 层　·　波长 λ = <b>" + wl.toFixed(1) +
          " nm</b>　·　" + (wl < 380 ? "已经落在紫外区，眼睛看不见了"
            : (nm ? "这就是巴尔末系的 " + nm + " 线" : "巴尔末系的第五条，已经很靠近紫外")) +
          "　·　n 越大，线越往蓝紫挤，最终挤在 364.6 nm 附近";
      }
    }
    if (sN) sN.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }
'''),
]

INIT = [
    ("shells", "lab_shells"),
    ("levels", "lab_levels"),
    ("lines", "lab_lines"),
]
