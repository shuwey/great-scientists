# -*- coding: utf-8 -*-
"""霍金「玩一玩」重做规格。

改动理由（见 tools/labs-audit.html）：
  实验1 走近黑洞   —— 原实现是真正的黑洞动画（时空旋涡 + 光子环），内容对、画面活，保留
  实验2 绕着黑洞转 —— 原为「通用轨道模板」：只有一颗"光"按圆形轨道跑，读数是"光约4天/圈"
                     改为「引力弯光」：按零测地线方程真实积分，瞄准距离决定光线被吞还是被偏折
  实验3 霍金辐射   —— 原属簇 1「通用曲线模板」（param1/param2 + expr 开关），一条高斯峰冒充黑体谱
                     改为真·霍金辐射谱：普朗克曲线随质量移动峰位（T ∝ 1/M），并配视界附近的粒子对示意
"""

SITE = "hawking"
TITLE = "动手玩一玩 · 三个霍金小实验 | 读懂霍金"
META = "三个可直接在网页上操作的互动演示：走近黑洞看时空怎样被压弯、一束光要瞄得多准才会被黑洞吞掉或偏折、霍金辐射的光谱怎样随黑洞质量移动。拖动滑块，亲手试一试霍金研究的那些事。"
CLAIM = "光看文字不够直观？下面三个小实验，你直接用鼠标拖动滑块——看黑洞怎样把时空越压越深、看光线怎样绕着黑洞拐弯、看霍金辐射的峰值怎样随质量左右移动。"

LABS = [
    {
        "id": "bh",
        "h2": "🕳️ 实验一 · 走近黑洞",
        "intro": "拖动“质量”，看黑洞把时空压得越深、光子环越小——连光都逃不出视界。",
        "kind": "bh",
        "card": "走近黑洞",
        "badge": "可拖动",
        "desc": "质量越大，视界越大、时空被压得越深。",
        "controls": [
            {"ctrl": "mass", "label": "质量", "v": "1.0×", "min": "0.4", "max": "2.4", "value": "1", "step": "0.1"},
        ],
        "callout": "黑洞不是“宇宙里的一个洞”，而是一块被压得极度弯曲的时空：在事件视界以内，连光都只能向内走（“逃逸速度超过光速”只是入门近似）。详见 <a href=\"detail/blackhole.html\">黑洞：连光都逃不掉</a>。",
    },
    {
        "id": "orbit",
        "h2": "🪐 实验二 · 引力弯光：瞄得多准才被吞掉",
        "intro": "一束光从左边射向黑洞。拖动“瞄准距离”，看它是被掰弯后逃走，还是一头栽进视界——临界的那一条，恰好绕黑洞打转。",
        "kind": "orbit",
        "card": "光线经过黑洞",
        "badge": "可拖动",
        "desc": "瞄准距离小于约 2.6 倍视界半径时，光线再也回不来。",
        "controls": [
            {"ctrl": "aim", "label": "瞄准距离", "v": "3.5", "min": "0.6", "max": "7", "value": "3.5", "step": "0.1"},
        ],
        "callout": "牛顿的引力也能把光掰弯，但只有爱因斯坦的方程才给出正确的两倍偏折——而黑洞把这件事做到了极端：中间那个黑色的“阴影”，半径正好是 2.6 倍视界。详见 <a href=\"detail/blackhole.html\">黑洞：连光都逃不掉</a>。",
    },
    {
        "id": "temp",
        "h2": "🌡️ 实验三 · 霍金辐射的温度",
        "intro": "黑洞并不全黑，它会慢慢辐射。拖动“黑洞质量”，看辐射谱的峰值怎样移动——质量越小，反而越“热”、峰值越靠短波。",
        "kind": "temp",
        "card": "越小越热",
        "badge": "可拖动",
        "desc": "温度与质量成反比：质量减半，温度翻倍，峰值波长减半。",
        "controls": [
            {"ctrl": "mass", "label": "黑洞质量", "v": "1.0×", "min": "0.2", "max": "3", "value": "1", "step": "0.1"},
        ],
        "callout": "恒星量级的黑洞只有约 10⁻⁸ K，比宇宙微波背景还冷，其实在“吸热”；只有蒸发到极小的黑洞才会变得极热、最后炸掉。这就是霍金留下的悖论：信息去哪了？详见 <a href=\"detail/radiation.html\">霍金辐射：黑洞也会蒸发</a>。",
    },
]

FUNCS = [
    ("lab_orbit", '''
  function lab_orbit(lab) {
    var cv = $("canvas", lab);
    var sA = $('[data-ctrl="aim"]', lab);
    var out = $(".lab-readout", lab);
    var vA = sA ? sA.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400, CX = 410, CY = 200;
    var R0 = 12, S = 22, HH = -0.004, BCRIT = 2.598;
    function traceRay(b) {
      var phi0 = Math.PI - Math.asin(Math.min(0.998, b / R0));
      var uu = 1 / R0, du = Math.cos(phi0) / b, phi = phi0;
      var pts = [], captured = false, i, r, turn = 0, prev = null, ang, d, n, p0, p1;
      pts.push([CX - Math.sqrt(R0 * R0 - b * b) * S, CY - b * S]);
      for (i = 0; i < 4000; i++) {
        var ddu = -uu + 1.5 * uu * uu;
        du += ddu * HH;
        uu += du * HH;
        phi += HH;
        if (uu > 0.999) { captured = true; break; }
        r = 1 / uu;
        p1 = [CX + r * Math.cos(phi) * S, CY - r * Math.sin(phi) * S];
        pts.push(p1);
        n = pts.length;
        p0 = pts[n - 2];
        ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]);
        if (prev === null) prev = ang;
        else {
          d = ang - prev;
          while (d > Math.PI) d -= Math.PI * 2;
          while (d < -Math.PI) d += Math.PI * 2;
          turn += d; prev = ang;
        }
        if (r > R0 + 0.05) break;
      }
      return { pts: pts, captured: captured, turn: turn };
    }
    function poly(ctx, pts, col, w, dash) {
      var i;
      ctx.strokeStyle = col; ctx.lineWidth = w;
      if (dash) ctx.setLineDash(dash); else ctx.setLineDash([]);
      ctx.beginPath();
      for (i = 0; i < pts.length; i++) {
        if (i === 0) ctx.moveTo(pts[i][0], pts[i][1]); else ctx.lineTo(pts[i][0], pts[i][1]);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var aim = sA ? parseFloat(sA.value) : 3.5;
      var S2 = setupCanvas(cv, H / W);
      var ctx = S2.ctx, k = S2.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#0B1020"; ctx.fillRect(0, 0, W, H);

      var i, b, res, gb = [1.0, 1.8, 2.35, 2.62, 2.9, 4.0, 6.0];
      ctx.strokeStyle = "rgba(255,255,255,0.30)"; ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.setLineDash([6, 6]);
      ctx.arc(CX, CY, BCRIT * S, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("俘获边界（黑洞阴影）＝ 2.6 倍视界半径", 40, 372);

      ctx.strokeStyle = "rgba(255,212,59,0.55)"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.setLineDash([4, 4]);
      ctx.arc(CX, CY, 1.5 * S, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255,212,59,0.75)"; ctx.font = "600 11.5px -apple-system, sans-serif";
      ctx.fillText("光子球 1.5 倍视界半径", CX + 1.5 * S + 6, CY + 1.5 * S + 14);

      for (i = 0; i < gb.length; i++) {
        b = gb[i];
        res = traceRay(b);
        poly(ctx, res.pts, res.captured ? "rgba(224,49,49,0.45)" : "rgba(174,185,204,0.45)", 1.5, null);
        res = traceRay(-b);
        poly(ctx, res.pts, res.captured ? "rgba(224,49,49,0.45)" : "rgba(174,185,204,0.45)", 1.5, null);
      }

      res = traceRay(aim);
      poly(ctx, res.pts, res.captured ? "#FF6B6B" : "#FFD43B", 3, null);
      var npts = res.pts.length;
      if (!res.captured && npts > 2) {
        var e = res.pts[npts - 1], e0 = res.pts[npts - 3];
        var ea = Math.atan2(e[1] - e0[1], e[0] - e0[0]);
        if (e[0] > 16 && e[0] < 804 && e[1] > 16 && e[1] < 384) {
          ctx.fillStyle = "#FFD43B";
          ctx.beginPath();
          ctx.moveTo(e[0] + Math.cos(ea) * 9, e[1] + Math.sin(ea) * 9);
          ctx.lineTo(e[0] - Math.cos(ea - 0.5) * 7, e[1] - Math.sin(ea - 0.5) * 7);
          ctx.lineTo(e[0] - Math.cos(ea + 0.5) * 7, e[1] - Math.sin(ea + 0.5) * 7);
          ctx.closePath(); ctx.fill();
        }
      }

      ctx.fillStyle = "#000";
      ctx.beginPath(); ctx.arc(CX, CY, S, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#FFD43B"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(CX, CY, S, 0, Math.PI * 2); ctx.stroke();

      ctx.fillStyle = "#fff"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("黑洞（视界）", 30, 34);
      ctx.fillStyle = "#AEB9CC"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("黄线：你正在瞄的那束光　　红线：被吞入的光线　　灰线：被掰弯后逃走的光线", 40, 350);
      ctx.restore();

      var deg = Math.abs(res.turn) * 180 / Math.PI;
      if (vA) vA.textContent = aim.toFixed(1);
      if (out) {
        if (res.captured) {
          out.innerHTML = "瞄准距离 <b>" + aim.toFixed(1) + "</b> 视界半径　·　临界值是约 <b>2.6</b>　·　这束光已经<b>被吞进视界</b>，回不来了。" +
            "　·　中间那片黑色的阴影就是这么来的：只要瞄得比 2.6 更近，任何光都逃不出。";
        } else {
          out.innerHTML = "瞄准距离 <b>" + aim.toFixed(1) + "</b> 视界半径　·　临界值约 <b>2.6</b>　·　这束光被掰弯 <b>" +
            deg.toFixed(0) + "°</b> 后逃走了　·　" +
            (deg > 150 ? "它已经贴着光子球绕了大半圈——再靠近一点就回不来了。" :
                         "瞄得越靠近 2.6，偏折越大；一旦绕成圈，就再也出不来。");
        }
      }
    }
    if (sA) sA.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }
'''),
    ("lab_temp", '''
  function lab_temp(lab) {
    var cv = $("canvas", lab);
    var sM = $('[data-ctrl="mass"]', lab);
    var out = $(".lab-readout", lab);
    var vM = sM ? sM.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var PX0 = 336, PX1 = 792, PY0 = 320, PY1 = 74;
    var LMIN = -1.3, LMAX = 1.0;
    function xOf(lg) { return PX0 + (lg - LMIN) / (LMAX - LMIN) * (PX1 - PX0); }
    function planck(lam, T) {
      var e = Math.exp(14.4 / (T * lam)) - 1;
      if (e <= 0) return 0;
      return Math.pow(lam, -5) / e;
    }
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var mass = sM ? parseFloat(sM.value) : 1;
      var T = 3 / mass;
      var lamPk = 2.9 / T;
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var i, lam, lg, v, peak = 0.0000001, curv = [];
      for (i = 0; i <= 260; i++) {
        lg = LMIN + (LMAX - LMIN) * i / 260;
        lam = Math.pow(10, lg);
        v = planck(lam, T);
        curv.push([lg, v]);
        if (v > peak) peak = v;
      }
      var hx = 150, hy = 196, rr = 13 + mass * 7;
      ctx.fillStyle = "#0B1020";
      ctx.beginPath(); ctx.arc(hx, hy, rr, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#FFD43B"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(hx, hy, rr, 0, Math.PI * 2); ctx.stroke();
      for (i = 0; i < 8; i++) {
        var aa = i * Math.PI / 4 + 0.2;
        var r1 = rr + 14, r2 = rr + 34 + (i % 2) * 8;
        ctx.strokeStyle = "rgba(232,89,12,0.85)"; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(hx + Math.cos(aa) * r1, hy + Math.sin(aa) * r1);
        ctx.lineTo(hx + Math.cos(aa) * r2, hy + Math.sin(aa) * r2);
        ctx.stroke();
        ctx.fillStyle = "rgba(232,89,12,0.85)";
        ctx.beginPath();
        ctx.arc(hx + Math.cos(aa) * r2, hy + Math.sin(aa) * r2, 3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = "#E8590C";
      ctx.beginPath(); ctx.arc(hx - rr - 6, hy - rr - 2, 3.6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(hx + rr + 6, hy + rr * 0.3, 3.6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#B26A00"; ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(hx - rr * 0.5, hy + rr * 1.05);
      ctx.lineTo(hx - rr - 10, hy + rr + 8);
      ctx.stroke();
      ctx.fillStyle = "#1B2530"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("视界附近的粒子对", hx - 76, 60);
      ctx.fillText("一个掉进去，一个跑出来", hx - 76, 78);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("黑洞质量 = " + mass.toFixed(1) + "×", hx - 52, hy + rr + 62);

      ctx.strokeStyle = "#EDF0F6"; ctx.lineWidth = 1;
      for (i = 0; i <= 5; i++) {
        var gy = PY1 + (PY0 - PY1) * i / 5;
        ctx.beginPath(); ctx.moveTo(PX0, gy); ctx.lineTo(PX1, gy); ctx.stroke();
      }
      ctx.strokeStyle = "#9AA7BE"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(PX0, PY0); ctx.lineTo(PX1, PY0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PX0, PY0); ctx.lineTo(PX0, PY1); ctx.stroke();
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 11px -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("短波", PX0 + 20, PY0 + 20);
      ctx.fillText("长波", PX1 - 20, PY0 + 20);
      ctx.textAlign = "left";

      ctx.strokeStyle = "#E03131"; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(xOf(Math.log10(lamPk)), PY0); ctx.lineTo(xOf(Math.log10(lamPk)), PY1 - 10); ctx.stroke();
      ctx.setLineDash([]);

      var gp = ctx.createLinearGradient(PX0, 0, PX1, 0);
      gp.addColorStop(0, "#B197FC");
      gp.addColorStop(0.35, "#4DABF7");
      gp.addColorStop(0.62, "#69DB7C");
      gp.addColorStop(0.8, "#FFD43B");
      gp.addColorStop(1, "#FF6B6B");
      ctx.strokeStyle = gp; ctx.lineWidth = 3.2;
      ctx.beginPath();
      for (i = 0; i < curv.length; i++) {
        var cx2 = xOf(curv[i][0]), cy2 = PY0 - curv[i][1] / peak * (PY0 - PY1 - 8);
        if (i === 0) ctx.moveTo(cx2, cy2); else ctx.lineTo(cx2, cy2);
      }
      ctx.stroke();

      ctx.fillStyle = "#E03131";
      ctx.beginPath(); ctx.arc(xOf(Math.log10(lamPk)), PY0 - (PY0 - PY1 - 8), 5, 0, Math.PI * 2); ctx.fill();
      var pkLeft = xOf(Math.log10(lamPk)) > PX1 - 118;
      ctx.fillStyle = "#E03131"; ctx.font = "700 12.5px -apple-system, sans-serif";
      ctx.textAlign = pkLeft ? "right" : "left";
      ctx.fillText("峰值波长", xOf(Math.log10(lamPk)) + (pkLeft ? -8 : 8), PY1 - 18);
      ctx.textAlign = "left";

      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("霍金辐射的频谱（曲线高度已归一化，只看峰的位置）", PX0, 40);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("横轴：辐射波长（对数）　·　竖轴：辐射强度", PX0, 58);
      ctx.restore();

      if (vM) vM.textContent = mass.toFixed(1) + "×";
      if (out) {
        out.innerHTML = "黑洞质量 <b>" + mass.toFixed(1) + "×</b>　·　温度 ∝ 1/质量 = <b>" + T.toFixed(2) +
          "</b>（相对）　·　峰值波长 ∝ 质量 = <b>" + lamPk.toFixed(2) + "</b>（相对）　·　" +
          "质量越小 → 温度越高 → 峰值越靠左（短波）　·　真实尺度下，恒星量级黑洞的温度低到约 10⁻⁸ K，" +
          "它其实在“吸”宇宙微波背景的热——越蒸发越小，才会越热越快。";
      }
    }
    if (sM) sM.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }
'''),
]

INIT = [
    ("bh", "lab_bh"),
    ("orbit", "lab_orbit"),
    ("temp", "lab_temp"),
]
