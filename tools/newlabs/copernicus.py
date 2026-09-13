# -*- coding: utf-8 -*-
"""哥白尼「玩一玩」重做规格。

改动理由（见 tools/labs-audit.html）：
  实验1 太阳系      —— 与开普勒页字节级完全相同，改为「太阳在中心 + 行星周期对照」
  实验2 逆行错觉    —— 原为一条通用正弦曲线，改为真实几何：地球超车时视方向倒退
  实验3 距离与周期  —— 原为开普勒第三定律（1543 vs 1619 时代错位），改为恒星视差
"""

SITE = "copernicus"
TITLE = "动手玩一玩 · 三个哥白尼小实验 | 读懂哥白尼"
META = "三个可直接在网页上操作的互动演示：太阳在中心的行星次序、火星为什么会在天上倒退、以及恒星视差。拖动滑块，亲眼看见哥白尼要证明的道理。"
CLAIM = "光看文字不够直观？下面三个小实验，你直接用鼠标拖动滑块——看行星绕太阳排队、看火星在天上倒退、看恒星视差为什么测不出来。"

LABS = [
    {
        "id": "solar",
        "h2": "🌞 实验一 · 太阳在中心，行星排队转",
        "intro": "拖动“动画速度”，看六颗行星按由近及远的次序绕太阳运行。注意地球：它只是第三颗，和别的行星一样在跑——这正是哥白尼最让人难以接受的地方。",
        "kind": "solar",
        "card": "太阳系：行星各走各的圆",
        "badge": "可拖动",
        "desc": "离太阳越远，绕一圈就越久；地球排在第三位，并不特殊。",
        "controls": [
            {"ctrl": "speed", "label": "动画速度", "v": "1.0×", "min": "0.2", "max": "3", "value": "1", "step": "0.1"},
        ],
        "callout": "太阳在正中心，六颗行星各走各的圆，地球只是其中普通的一颗。想知道哥白尼为什么敢这么改，去看 <a href=\"detail/heliocentric.html\">日心说：太阳坐到中心</a>。",
    },
    {
        "id": "retro",
        "h2": "📉 实验二 · 火星为什么会倒退",
        "intro": "左边是俯视图：地球在内圈跑得快，火星在外圈跑得慢。右边是火星在“天上”的位置随时间的变化——红色那一段，就是它在倒退。",
        "kind": "retro",
        "card": "逆行：地球超车时的错觉",
        "badge": "可拖动",
        "desc": "地球追上并超过火星的那一刻，地球到火星的视线会短暂地反向转动。",
        "controls": [
            {"ctrl": "speed", "label": "动画速度", "v": "1.0×", "min": "0.2", "max": "3", "value": "1", "step": "0.1"},
        ],
        "callout": "火星并没有真的倒退——是地球从内圈超车时，我们的视线被迫转了回来。地心说要靠一层套一层的“本轮”才能凑出这个现象，日心说却一句话就解释完了。详见 <a href=\"detail/earthmotion.html\">地球真的在动</a>。",
    },
    {
        "id": "parallax",
        "h2": "🔭 实验三 · 恒星视差：当年为什么测不出",
        "intro": "地球半年走出一段基线，看一颗恒星时，它在背景上的位置应该会来回摆动。拖动“恒星距离”，看这段摆动怎样被拉小——小到当年的仪器根本测不出来。",
        "kind": "parallax",
        "card": "恒星视差",
        "badge": "可拖动",
        "desc": "恒星越远，视差越小；距离翻倍，摆动的角度就减半。",
        "controls": [
            {"ctrl": "dist", "label": "恒星距离（秒差距）", "v": "20", "min": "5", "max": "60", "value": "20", "step": "1"},
        ],
        "callout": "日心说预言了恒星视差，可当年最好的仪器只能测到约 0.1 角秒，星星的摆动小到根本看不出来——这反倒成了反对日心说的理由。直到 1838 年，贝塞尔才测出第一颗恒星的视差。详见 <a href=\"detail/copernican.html\">哥白尼革命</a>。",
    },
]

FUNCS = [
    ("lab_solar", '''
  function lab_solar(lab) {
    var cv = $("canvas", lab);
    var sS = $('[data-ctrl="speed"]', lab);
    var out = $(".lab-readout", lab);
    var vS = sS ? sS.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400, cx = 280, cy = 208;
    var PL = [
      ["水星", 54, 0.241, "#A08A7A", 0.4, "88 天"],
      ["金星", 82, 0.615, "#E0B04A", 1.7, "225 天"],
      ["地球", 110, 1.0, "#3B7DD8", 3.0, "365 天"],
      ["火星", 140, 1.881, "#C1553A", 4.2, "687 天"],
      ["木星", 184, 11.86, "#C89A6B", 5.4, "11.9 年"],
      ["土星", 226, 29.45, "#D9C08A", 0.8, "29.5 年"]
    ];
    var years = 0, t0 = 0;
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      if (!t0) t0 = ts;
      var dt = Math.min(0.05, (ts - t0) / 1000); t0 = ts;
      var sp = sS ? parseFloat(sS.value) : 1;
      years += dt * sp * 0.3;
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var i, p, a, x, y;
      ctx.strokeStyle = "#DCE2EC"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 5]);
      for (i = 0; i < PL.length; i++) {
        ctx.beginPath(); ctx.arc(cx, cy, PL[i][1], 0, Math.PI * 2); ctx.stroke();
      }
      ctx.setLineDash([]);

      ctx.fillStyle = "#F59F00";
      ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("太阳", cx - 13, cy + 31);

      for (i = 0; i < PL.length; i++) {
        p = PL[i];
        a = p[4] + years / p[2] * Math.PI * 2;
        x = cx + p[1] * Math.cos(a); y = cy + p[1] * Math.sin(a);
        ctx.fillStyle = p[3];
        ctx.beginPath(); ctx.arc(x, y, i > 3 ? 7 : 5.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#5C6B82"; ctx.font = "600 12px -apple-system, sans-serif";
        ctx.fillText(p[0], x + 9, y + 4);
      }

      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("离太阳越远，绕一圈越久", 556, 74);
      ctx.strokeStyle = "#E4E8F0"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(556, 86); ctx.lineTo(796, 86); ctx.stroke();
      for (i = 0; i < PL.length; i++) {
        p = PL[i]; y = 118 + i * 42;
        ctx.fillStyle = p[3];
        ctx.beginPath(); ctx.arc(570, y, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#5C6B82"; ctx.font = "600 13px -apple-system, sans-serif";
        ctx.fillText(p[0], 588, y + 5);
        ctx.fillStyle = "#1B2530"; ctx.font = "700 13px -apple-system, sans-serif";
        ctx.textAlign = "right"; ctx.fillText(p[5], 796, y + 5); ctx.textAlign = "left";
      }
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("地球排第三，和别的行星一样在跑", 556, 380);
      ctx.restore();

      if (vS) vS.textContent = sp.toFixed(1) + "×";
      if (out) {
        out.innerHTML = "已经过去 <b>" + years.toFixed(2) + "</b> 年　·　地球转了 <b>" + Math.floor(years) +
          "</b> 圈，木星才转 <b>" + Math.floor(years / 11.86) + "</b> 圈　·　太阳在正中心，六颗行星各走各的圆";
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }
'''),
    ("lab_retro", '''
  function lab_retro(lab) {
    var cv = $("canvas", lab);
    var sS = $('[data-ctrl="speed"]', lab);
    var out = $(".lab-readout", lab);
    var vS = sS ? sS.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var ox = 200, oy = 200, RE = 60, RM = 91.44;
    var TSPAN = 2.6, N = 240;
    var SE = [], SM = [], ANG = [], BACK = [];
    (function buildSeries() {
      var i, t, ex, ey, mx, my, p, prev = null, unw = 0, d;
      for (i = 0; i <= N; i++) {
        t = i * TSPAN / N;
        ex = ox + RE * Math.cos(t * 2 * Math.PI);
        ey = oy + RE * Math.sin(t * 2 * Math.PI);
        mx = ox + RM * Math.cos(0.9 + t / 1.881 * 2 * Math.PI);
        my = oy + RM * Math.sin(0.9 + t / 1.881 * 2 * Math.PI);
        SE.push([ex, ey]); SM.push([mx, my]);
        p = Math.atan2(my - ey, mx - ex);
        if (prev === null) { BACK.push(false); } else {
          d = p - prev;
          while (d > Math.PI) d -= 2 * Math.PI;
          while (d < -Math.PI) d += 2 * Math.PI;
          unw += d;
          BACK.push(d < 0);
        }
        prev = p;
        ANG.push(unw);
      }
    })();
    var aMin = Math.min.apply(null, ANG), aMax = Math.max.apply(null, ANG);
    var CX0 = 452, CX1 = 792, CY0 = 344, CY1 = 66;
    function px(t) { return CX0 + t / TSPAN * (CX1 - CX0); }
    function py(a) { return CY0 - (a - aMin) / (aMax - aMin) * (CY0 - CY1); }
    var ph = 0, t0 = 0;
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      if (!t0) t0 = ts;
      var dt = Math.min(0.05, (ts - t0) / 1000); t0 = ts;
      var sp = sS ? parseFloat(sS.value) : 1;
      ph += dt * sp * 0.16;
      if (ph > 1) ph = 0;
      var idx = Math.max(1, Math.floor(ph * N));
      var years = ph * TSPAN;
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var i, E, M;
      ctx.strokeStyle = "#DCE2EC"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 5]);
      ctx.beginPath(); ctx.arc(ox, oy, RE, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(ox, oy, RM, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#F59F00";
      ctx.beginPath(); ctx.arc(ox, oy, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("太阳", ox - 13, oy - 16);
      ctx.fillStyle = "#8B96AA";
      ctx.fillText("内圈快、外圈慢", 46, 68);
      ctx.fillStyle = "#1B2530"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("俯视：谁跑得快", 46, 46);

      E = SE[idx]; M = SM[idx];
      ctx.strokeStyle = "rgba(59,91,219,.45)"; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(E[0], E[1]); ctx.lineTo(M[0], M[1]); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#3B7DD8";
      ctx.beginPath(); ctx.arc(E[0], E[1], 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#C1553A";
      ctx.beginPath(); ctx.arc(M[0], M[1], 7, 0, Math.PI * 2); ctx.fill();
      ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillStyle = "#3B7DD8"; ctx.fillText("地球", E[0] + 10, E[1] + 16);
      ctx.fillStyle = "#C1553A"; ctx.fillText("火星", M[0] + 11, M[1] + 4);

      ctx.strokeStyle = "#E4E8F0"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(CX0, CY0); ctx.lineTo(CX1, CY0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(CX0, CY0); ctx.lineTo(CX0, CY1); ctx.stroke();
      ctx.fillStyle = "#1B2530"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("火星在天上的位置", CX0, 46);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("时间 →", CX1 - 46, CY0 + 20);
      ctx.fillText("线越陡＝火星跑得越快；线往下走＝倒退", CX0, CY0 + 38);

      for (i = 1; i <= idx; i++) {
        if (!BACK[i] || BACK[i - 1]) continue;
        var runEnd = i;
        while (runEnd < idx && BACK[runEnd + 1]) runEnd++;
        if (runEnd - i < 2) continue;
        ctx.fillStyle = "rgba(224,49,49,.09)";
        ctx.fillRect(px((i - 1) * TSPAN / N), CY1, px(runEnd * TSPAN / N) - px((i - 1) * TSPAN / N), CY0 - CY1);
        ctx.fillStyle = "#E03131"; ctx.font = "700 12px -apple-system, sans-serif";
        ctx.fillText("逆行", px((i - 1) * TSPAN / N) - 8, CY1 - 8);
      }

      for (i = 1; i <= idx; i++) {
        ctx.strokeStyle = BACK[i] ? "#E03131" : "#3B5BDB";
        ctx.lineWidth = BACK[i] ? 3.4 : 2.6;
        ctx.beginPath();
        ctx.moveTo(px(i * TSPAN / N - TSPAN / N), py(ANG[i - 1]));
        ctx.lineTo(px(i * TSPAN / N), py(ANG[i]));
        ctx.stroke();
      }
      ctx.strokeStyle = "#1B2530"; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(px(years), CY1); ctx.lineTo(px(years), CY0); ctx.stroke();
      ctx.setLineDash([]);
      var cur = SM[idx], ce = SE[idx];
      var dirx = cur[0] - ce[0], diry = cur[1] - ce[1];
      var ln = Math.sqrt(dirx * dirx + diry * diry) || 1;
      ctx.strokeStyle = "rgba(224,49,49,.55)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(px(years), py(ANG[idx]));
      ctx.lineTo(px(years) + dirx / ln * 34, py(ANG[idx]) - diry / ln * 34); ctx.stroke();
      ctx.fillStyle = "#FFF"; ctx.strokeStyle = "#1B2530"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(px(years), py(ANG[idx]), 5, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.restore();

      if (vS) vS.textContent = sp.toFixed(1) + "×";
      if (out) {
        out.innerHTML = "已经过去 <b>" + years.toFixed(2) + "</b> 年（火星约 2.1 年一个来回）　·　地球转了 <b>" +
          Math.floor(years) + "</b> 圈，火星转了 <b>" + (years / 1.881).toFixed(2) +
          "</b> 圈　·　图上<span style='color:#E03131;font-weight:800'>红色</span>那一段就是逆行";
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }
'''),
    ("lab_parallax", '''
  function lab_parallax(lab) {
    var cv = $("canvas", lab);
    var sD = $('[data-ctrl="dist"]', lab);
    var out = $(".lab-readout", lab);
    var vD = sD ? sD.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 380;
    var sunX = 200, sunY = 205, RE = 70;
    var e1x = sunX - RE, e2x = sunX + RE;
    var starY = 150, curtX = 760, curtTop = 46, curtBot = 348;
    var STARS = [[0.18, 0.14], [0.52, 0.2], [0.84, 0.1], [0.3, 0.55], [0.7, 0.62],
                 [0.12, 0.83], [0.46, 0.9], [0.9, 0.78], [0.6, 0.42], [0.36, 0.34]];
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var d = sD ? parseFloat(sD.value) : 20;
      var starX = 420 + 5.6 * d;
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var i, sp, y1, y2;
      ctx.fillStyle = "#EDEFF4";
      ctx.fillRect(curtX, curtTop, 26, curtBot - curtTop);
      ctx.fillStyle = "#C7D0DE";
      for (i = 0; i < STARS.length; i++) {
        sp = STARS[i];
        ctx.beginPath();
        ctx.arc(curtX + 4 + sp[0] * 18, curtTop + sp[1] * (curtBot - curtTop), 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("背景恒星", curtX - 12, curtTop - 12);

      ctx.strokeStyle = "#DCE2EC"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 5]);
      ctx.beginPath(); ctx.arc(sunX, sunY, RE, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#F59F00";
      ctx.beginPath(); ctx.arc(sunX, sunY, 11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("太阳", sunX - 13, sunY + 26);

      ctx.strokeStyle = "#9AA7BE"; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(e1x, sunY); ctx.lineTo(e2x, sunY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("基线：2 天文单位（地球走半年）", 62, sunY + 40);

      y1 = starY + (curtX - starX) * (starY - sunY) / (starX - e1x);
      y2 = starY + (curtX - starX) * (starY - sunY) / (starX - e2x);
      ctx.strokeStyle = "rgba(59,91,219,.75)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(e1x, sunY); ctx.lineTo(curtX, y1); ctx.stroke();
      ctx.strokeStyle = "rgba(12,166,120,.85)";
      ctx.beginPath(); ctx.moveTo(e2x, sunY); ctx.lineTo(curtX, y2); ctx.stroke();

      ctx.fillStyle = "#3B7DD8";
      ctx.beginPath(); ctx.arc(e1x, sunY, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#0CA678";
      ctx.beginPath(); ctx.arc(e2x, sunY, 7, 0, Math.PI * 2); ctx.fill();
      ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillStyle = "#3B7DD8"; ctx.fillText("1 月", e1x - 34, sunY + 5);
      ctx.fillStyle = "#0CA678"; ctx.fillText("7 月", e2x - 14, sunY + 26);

      ctx.fillStyle = "#F59F00";
      ctx.beginPath(); ctx.arc(starX, starY, 8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(245,159,0,.35)"; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(starX, starY, 12, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("恒星", starX - 13, starY - 20);

      ctx.fillStyle = "#3B7DD8";
      ctx.beginPath(); ctx.arc(curtX + 13, y1, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#0CA678";
      ctx.beginPath(); ctx.arc(curtX + 13, y2, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#E03131"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(curtX + 40, y1); ctx.lineTo(curtX + 40, y2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(curtX + 35, y1 + 4); ctx.lineTo(curtX + 40, y1); ctx.lineTo(curtX + 45, y1 + 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(curtX + 35, y2 - 4); ctx.lineTo(curtX + 40, y2); ctx.lineTo(curtX + 45, y2 - 4); ctx.stroke();
      ctx.fillStyle = "#E03131"; ctx.font = "700 12px -apple-system, sans-serif";
      ctx.fillText("摆动幅度", curtX - 66, (y1 + y2) / 2 + 4);

      ctx.fillStyle = "#1B2530"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("地球半年走出一条基线", 46, 46);

      ctx.restore();

      var theta = 1 / d;
      var ly = d * 3.26;
      if (vD) vD.textContent = d.toFixed(0);
      if (out) {
        out.innerHTML = "恒星距离 = <b>" + d.toFixed(0) + "</b> 秒差距（≈ " + ly.toFixed(0) +
          " 光年）　·　视差角 θ ≈ 1/" + d.toFixed(0) + " = <b>" + theta.toFixed(3) +
          "</b> 角秒　·　" + (theta < 0.1
            ? "<span style='color:#E03131;font-weight:800'>比当年仪器能测到的 0.1 角秒还小，根本看不出来</span>"
            : "距离再翻一倍，摆幅还要减半");
      }
    }
    if (sD) sD.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }
'''),
]

INIT = [
    ("solar", "lab_solar"),
    ("retro", "lab_retro"),
    ("parallax", "lab_parallax"),
]
