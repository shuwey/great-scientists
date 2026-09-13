# -*- coding: utf-8 -*-
"""法拉第「玩一玩」重做规格。

改动理由（见 tools/labs-audit.html）：
  实验1 磁铁穿过线圈 —— 原实现就是动画（磁铁往复 + 电流计 + 感应电流波形），内容对、画面活，保留
  实验2 铁屑磁力线   —— 标题说「铁屑沿磁力线排开」，画面却画两根「带电棒」（静电），且与麦克斯韦页逐字节相同
                       改为真正的条形磁铁 + 铁屑：N→S 的闭合磁力线，铁屑按局部磁场方向排列
  实验3 交流电       —— 原属「波动模板」三站共用（法拉第/费曼/麦克斯韦各一条同样的正弦波）
                       改为「线圈在磁场里转动发电」：左边画发电机结构，右边才是它输出的交流波形
"""

SITE = "faraday"
TITLE = "动手玩一玩 · 三个法拉第小实验 | 读懂法拉第"
META = "三个可直接在网页上操作的互动演示：磁铁进出线圈时电流怎么来、条形磁铁周围看不见的磁力线怎么让铁屑排队、线圈在磁场里转动怎样输出交流电。拖动滑块，亲手转动电磁感应。"
CLAIM = "光看文字不够直观？下面三个小实验，你直接用鼠标拖动滑块——看磁铁一停电流为什么立刻归零、看铁屑怎样把看不见的磁力线“画”出来、看转动线圈怎样把机械变成电。"

LABS = [
    {
        "id": "induction",
        "h2": "🧲 实验一 · 磁铁穿过线圈",
        "intro": "拖动“速度”和“匝数”，看磁铁进出线圈时电流计指针怎么摆——磁铁停下来，指针立刻归零。",
        "kind": "induction",
        "card": "磁铁穿过线圈",
        "badge": "可拖动",
        "desc": "磁铁运动时才有电流：磁通变化得快、匝数多，电流就大。",
        "controls": [
            {"ctrl": "speed", "label": "速度", "v": "1.0×", "min": "0.2", "max": "2.2", "value": "1", "step": "0.1"},
            {"ctrl": "turns", "label": "匝数", "v": "4 匝", "min": "1", "max": "8", "value": "4", "step": "1"},
        ],
        "callout": "关键不是磁铁有多强，而是磁通“变不变”：插进去有电流，停在里面反而没有。这一条，就是后来所有发电机、变压器、无线充电的根。详见 <a href=\"detail/induction.html\">电磁感应：磁铁一动，电就来了</a>。",
    },
    {
        "id": "lines",
        "h2": "🧭 实验二 · 铁屑排出的磁力线",
        "intro": "把铁屑撒在磁铁周围，它们会自动排队——排出来的形状就是磁力线。拖动“磁性强弱”，看力线怎么变密、铁屑排队怎么变整齐。",
        "kind": "lines",
        "card": "条形磁铁的磁力线",
        "badge": "可拖动",
        "desc": "磁力线从 N 极出、绕到 S 极进，形成一圈圈闭合的曲线。",
        "controls": [
            {"ctrl": "strength", "label": "磁性强弱", "v": "1.0×", "min": "0.2", "max": "2", "value": "1", "step": "0.1"},
        ],
        "callout": "磁力线是法拉第的发明——他说：“我看不见磁，但我可以画出一条线来说清它。”磁力线越密的地方，磁场越强、受力越大。详见 <a href=\"detail/field.html\">力线：他看见了看不见的“场”</a>。",
    },
    {
        "id": "ac",
        "h2": "🌊 实验三 · 线圈一转，交流电就来了",
        "intro": "把线圈放在磁场里转动就是一台发电机。拖动“转速”和“磁场强度”，看左边的线圈转一圈，右边的电流怎样一来一回地变化。",
        "kind": "ac",
        "card": "转动中的线圈",
        "badge": "可拖动",
        "desc": "线圈平面与磁场平行时电流最大，垂直时电流为零——于是电流不停地换方向。",
        "controls": [
            {"ctrl": "freq", "label": "转速", "v": "1.0×", "min": "0.3", "max": "2", "value": "1", "step": "0.1"},
            {"ctrl": "amp", "label": "磁场强度", "v": "1.0×", "min": "0.5", "max": "2", "value": "1", "step": "0.1"},
        ],
        "callout": "今天插座里的电，就是被这样“转”出来的——水轮机、汽轮机、风车负责转，法拉第的线圈负责把转动变成电。详见 <a href=\"detail/generator.html\">发电机：把运动变成电</a>。",
    },
]

FUNCS = [
    ("lab_lines", '''
  function lab_lines(lab) {
    var cv = $("canvas", lab);
    var sS = $('[data-ctrl="strength"]', lab);
    var out = $(".lab-readout", lab);
    var vS = sS ? sS.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var CX = 410, CY = 196, DW = 128, DH = 30, D = 62;
    function fieldAt(px, py) {
      var d1x = px - (CX - D), d1y = py - CY;
      var d2x = px - (CX + D), d2y = py - CY;
      var r1 = Math.pow(d1x * d1x + d1y * d1y, 1.5) + 1e-4;
      var r2 = Math.pow(d2x * d2x + d2y * d2y, 1.5) + 1e-4;
      return { x: d1x / r1 - d2x / r2, y: d1y / r1 - d2y / r2 };
    }
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var str = sS ? parseFloat(sS.value) : 1;
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var i, j, L;
      ctx.strokeStyle = "#3B5BDB";
      ctx.lineWidth = Math.min(3, 1 + str * 1.1);
      ctx.globalAlpha = Math.min(0.95, 0.32 + str * 0.34);
      for (i = -5; i <= 5; i++) {
        var yy = CY + i * 13;
        var bulge = 30 + Math.abs(i) * 11;
        var sgn = i >= 0 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(CX - DW, yy);
        ctx.bezierCurveTo(CX - DW * 0.3, yy + sgn * bulge * 1.4,
                          CX + DW * 0.3, yy + sgn * bulge * 1.4,
                          CX + DW, yy);
        ctx.stroke();
        if (i % 2 !== 0) {
          var ay = yy + sgn * bulge * 1.05;
          ctx.fillStyle = "rgba(59,91,219," + Math.min(0.95, 0.45 + str * 0.3) + ")";
          ctx.beginPath();
          ctx.moveTo(CX + 7, ay); ctx.lineTo(CX - 5, ay - 5.5); ctx.lineTo(CX - 5, ay + 5.5);
          ctx.closePath(); ctx.fill();
        }
      }
      for (i = 1; i <= 3; i++) {
        var out1 = 44 + i * 42;
        ctx.beginPath();
        ctx.moveTo(CX - DW + 14, CY - DH);
        ctx.bezierCurveTo(CX - DW - out1 * 0.6, CY - DH - out1,
                          CX + DW + out1 * 0.6, CY - DH - out1,
                          CX + DW - 14, CY - DH);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(CX - DW + 14, CY + DH);
        ctx.bezierCurveTo(CX - DW - out1 * 0.6, CY + DH + out1,
                          CX + DW + out1 * 0.6, CY + DH + out1,
                          CX + DW - 14, CY + DH);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      for (i = 0; i < 46; i++) {
        for (j = 0; j < 26; j++) {
          var px = 50 + i * 16 + (j % 2) * 8;
          var py = 52 + j * 12;
          if (px > CX - DW && px < CX + DW && py > CY - DH - 6 && py < CY + DH + 6) continue;
          if (Math.abs(px - CX) > 350 || Math.abs(py - CY) > 150) continue;
          var f = fieldAt(px, py);
          var mag = Math.sqrt(f.x * f.x + f.y * f.y);
          if (mag < 0.00003) continue;
          var ang = Math.atan2(f.y, f.x);
          var len = 4.5 + Math.min(6, mag * 9000);
          var al = Math.min(0.82, (0.16 + str * 0.28) * Math.min(1, 0.30 + mag * 12000));
          ctx.strokeStyle = "rgba(70,80,105," + al.toFixed(3) + ")";
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(px - Math.cos(ang) * len / 2, py - Math.sin(ang) * len / 2);
          ctx.lineTo(px + Math.cos(ang) * len / 2, py + Math.sin(ang) * len / 2);
          ctx.stroke();
        }
      }

      ctx.fillStyle = "#E03131";
      ctx.fillRect(CX - DW, CY - DH, DW, DH * 2);
      ctx.fillStyle = "#1C7ED6";
      ctx.fillRect(CX, CY - DH, DW, DH * 2);
      ctx.strokeStyle = "#1B2530"; ctx.lineWidth = 1.6;
      ctx.strokeRect(CX - DW, CY - DH, DW * 2, DH * 2);
      ctx.fillStyle = "#fff"; ctx.font = "800 20px -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("N", CX - DW / 2, CY + 7);
      ctx.fillText("S", CX + DW / 2, CY + 7);
      ctx.textAlign = "left";

      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("条形磁铁：铁屑沿磁力线排队", 50, 32);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("磁力线从 N 极出来 → 绕一大圈 → 回到 S 极，永远闭合，没有起点也没有终点。", 50, 378);
      ctx.restore();

      if (vS) vS.textContent = str.toFixed(1) + "×";
      if (out) {
        out.innerHTML = "磁性强弱 = <b>" + str.toFixed(1) + "×</b>　·　磁性越强，力线越密、铁屑排得越整齐，" +
          "小磁针受到的力也越大　·　" + (str < 0.6 ? "现在磁性很弱，铁屑几乎排不出方向。" : "现在磁力线清晰可见——越靠近两极，力线越密，磁场越强。");
      }
    }
    if (sS) sS.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }
'''),
    ("lab_ac", '''
  function lab_ac(lab) {
    var cv = $("canvas", lab);
    var sF = $('[data-ctrl="freq"]', lab);
    var sA = $('[data-ctrl="amp"]', lab);
    var out = $(".lab-readout", lab);
    var vF = sF ? sF.closest(".ctrl").querySelector(".v") : null;
    var vA = sA ? sA.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var ph = 0, last = 0, hist = [];
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      if (!last) last = ts;
      var dt = Math.min(0.05, (ts - last) / 1000); last = ts;
      var f = sF ? parseFloat(sF.value) : 1;
      var a = sA ? parseFloat(sA.value) : 1;
      ph += dt * f * 1.6;
      var emf = a * Math.cos(ph);
      hist.push(emf); if (hist.length > 240) hist.shift();

      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var i;
      ctx.fillStyle = "#E03131";
      ctx.fillRect(62, 118, 40, 128);
      ctx.fillStyle = "#1C7ED6";
      ctx.fillRect(360, 118, 40, 128);
      ctx.fillStyle = "#fff"; ctx.font = "800 20px -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("N", 82, 190); ctx.fillText("S", 380, 190);
      ctx.textAlign = "left";

      var cx2 = 231, cy2 = 182, rx = Math.abs(Math.cos(ph)) * 96 + 5, ry = 62;
      ctx.strokeStyle = "#F59F00"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.ellipse(cx2, cy2, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "rgba(245,159,0,0.18)";
      ctx.beginPath(); ctx.ellipse(cx2, cy2, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#B26A00"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx2, cy2 - ry); ctx.lineTo(cx2, cy2 + ry); ctx.stroke();

      ctx.strokeStyle = "#8B96AA"; ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(cx2, cy2 + ry); ctx.lineTo(cx2, 318); ctx.lineTo(452, 318); ctx.stroke();
      ctx.fillStyle = "#8B96AA";
      ctx.beginPath(); ctx.moveTo(432, 318); ctx.lineTo(424, 313); ctx.lineTo(424, 323);
      ctx.closePath(); ctx.fill();
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(cx2, cy2 - ry); ctx.lineTo(cx2, 318); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 11.5px -apple-system, sans-serif";
      ctx.fillText("引出导线，送往用电器", 78, 342);

      ctx.strokeStyle = "#F59F00"; ctx.lineWidth = 2.4;
      ctx.beginPath();
      for (i = 0; i <= 40; i++) {
        var aa = -1.15 + i * 0.058;
        var ax = cx2 + Math.cos(aa) * 118, ay = cy2 + Math.sin(aa) * 92;
        if (i === 0) ctx.moveTo(ax, ay); else ctx.lineTo(ax, ay);
      }
      ctx.stroke();
      var tax = cx2 + Math.cos(-0.02) * 118, tay = cy2 + Math.sin(-0.02) * 92;
      ctx.fillStyle = "#F59F00";
      ctx.beginPath(); ctx.moveTo(tax + 7, tay + 2); ctx.lineTo(tax - 6, tay - 6);
      ctx.lineTo(tax - 6, tay + 8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#B26A00"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("匀速转动", cx2 - 26, cy2 - 96);

      ctx.fillStyle = "#E8590C"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("① 线圈在磁场中转动", 62, 44);

      var BX = 486, BY = 240, BW = 300, BH = 150;
      ctx.fillStyle = "#E8590C"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("② 输出的交流电", BX, 44);
      ctx.strokeStyle = "#DDE3EC"; ctx.lineWidth = 1;
      for (i = 0; i <= 4; i++) {
        var gy = BY - BH + BH * i / 4;
        ctx.beginPath(); ctx.moveTo(BX, gy); ctx.lineTo(BX + BW, gy); ctx.stroke();
      }
      ctx.strokeStyle = "#9AA7BE"; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(BX, BY - BH / 2); ctx.lineTo(BX + BW, BY - BH / 2); ctx.stroke();
      ctx.fillStyle = "#B0BAC9"; ctx.font = "600 11px -apple-system, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("+", BX - 6, BY - BH / 2 - 26);
      ctx.fillText("0", BX - 6, BY - BH / 2 + 4);
      ctx.fillText("−", BX - 6, BY - BH / 2 + 34);
      ctx.textAlign = "left";
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 11px -apple-system, sans-serif";
      ctx.fillText("电流方向 + / −", BX, BY + 26);

      ctx.strokeStyle = "#2F9E44"; ctx.lineWidth = 2.6;
      ctx.beginPath();
      for (i = 0; i < hist.length; i++) {
        var hx = BX + BW * i / 239;
        var hy = BY - BH / 2 - hist[i] * 52;
        if (i === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
      }
      ctx.stroke();
      var lx = BX + BW * (hist.length - 1) / 239;
      var ly = BY - BH / 2 - emf * 52;
      ctx.fillStyle = "#2F9E44";
      ctx.beginPath(); ctx.arc(lx, ly, 5.5, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("线圈一转，电流就换方向——这就是交流电（AC）。", 50, 378);
      ctx.restore();

      if (vF) vF.textContent = f.toFixed(1) + "×";
      if (vA) vA.textContent = a.toFixed(1) + "×";
      if (out) {
        var par = Math.abs(Math.cos(ph));
        out.innerHTML = "转速 <b>" + f.toFixed(1) + "×</b>　·　磁场强度 <b>" + a.toFixed(1) + "×</b>　·　此刻电动势 <b>" +
          emf.toFixed(2) + "</b>　·　" +
          (par > 0.85 ? "线圈平面与磁场<strong>平行</strong>，磁通变化最快 → 电流此刻最大；" :
           par < 0.15 ? "线圈平面与磁场<strong>垂直</strong>，磁通变化最慢 → 电流此刻为零；" :
                        "线圈正在转动，磁通时增时减 → 电流在最大与零之间来回摆；") +
          "转速越快、磁场越强，输出的电压越高。";
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }
'''),
]

INIT = [
    ("induction", "lab_induction"),
    ("lines", "lab_lines"),
    ("ac", "lab_ac"),
]
