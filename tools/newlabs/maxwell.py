# -*- coding: utf-8 -*-
"""麦克斯韦「玩一玩」重做规格。

改动理由（见 tools/labs-audit.html）：
  实验1 电磁场：看不见的力线 —— 原实现与法拉第页「铁屑磁力线」逐字节相同（两根「带电棒」加几条近似直线的弯曲弧）
                                 改为「通电直导线的环形磁力线」：奥斯特实验那一幕，电流一开，磁场就绕着导线转
  实验2 电磁波：振荡着向前传 —— 原属「波动模板」三站共用（法拉第/费曼/麦克斯韦各一条同样的正弦波，读数还写着「波是振动的传播」）
                                 改为真正的电磁波：电场上下振、磁场垂直于纸面，两者同相一起向前跑
  实验3 分子速率分布         —— 原属簇 1「通用曲线模板」（param1/param2 + expr 开关），一条高斯峰冒充麦氏分布
                                 改为真·麦克斯韦-玻尔兹曼速率分布：温度升高，峰右移、变矮变宽，高能分子比例猛增
"""

SITE = "maxwell"
TITLE = "动手玩一玩 · 三个麦克斯韦小实验 | 读懂麦克斯韦"
META = "三个可直接在网页上操作的互动演示：通电导线周围怎样绕出一圈圈磁场、电磁波里电场与磁场怎样结伴向前传、分子速率分布怎样随温度右移变宽。拖动滑块，亲手验证麦克斯韦方程组里的那几件事。"
CLAIM = "光看文字不够直观？下面三个小实验，你直接用鼠标拖动滑块——看电流一开磁场怎样绕着导线转、看电场与磁场怎样互相垂直地一起前进、看加热之后分子速率分布怎样整体右移。"

LABS = [
    {
        "id": "field",
        "h2": "🔗 实验一 · 电流一开，磁场绕着导线转",
        "intro": "奥斯特发现：导线通电时，旁边的小磁针会偏转。拖动“电流强度”，看导线周围那一圈圈环形磁力线怎样变密变强。",
        "kind": "field",
        "card": "通电导线周围的磁场",
        "badge": "可拖动",
        "desc": "磁场是一圈圈闭合的圆环，套在导线外面——越靠近导线越强。",
        "controls": [
            {"ctrl": "strength", "label": "电流强度", "v": "1.0×", "min": "0.2", "max": "2", "value": "1", "step": "0.1"},
        ],
        "callout": "把导线竖直拿着，右手握住它、拇指指向电流方向，四指环绕的方向就是磁场方向——这就是安培定则。麦克斯韦要做的，是把这条“绕圈的磁场”和法拉第的“动起来才有的电”写成同一组方程。详见 <a href=\"detail/equations.html\">麦克斯韦方程组：把电、磁、光写成一体</a>。",
    },
    {
        "id": "wave",
        "h2": "🌊 实验二 · 电磁波：电场和磁场一起向前跑",
        "intro": "电场上下振动，磁场垂直于纸面振动，两者互相垂直、步调一致地向前传播。拖动“频率”与“振幅”，看这条波怎样随参数变化。",
        "kind": "wave",
        "card": "E ⊥ B，一起传播",
        "badge": "可拖动",
        "desc": "E 与 B 同相、互相垂直，方向由 E×B 决定，速度是光速。",
        "controls": [
            {"ctrl": "freq", "label": "频率", "v": "1.0×", "min": "0.5", "max": "2", "value": "1", "step": "0.1"},
            {"ctrl": "amp", "label": "振幅", "v": "1.0×", "min": "0.5", "max": "1.6", "value": "1", "step": "0.1"},
        ],
        "callout": "麦克斯韦算出这条波的速度正好是 3×10⁸ m/s——和光速一样。于是他断定：光本身就是电磁波。这是物理学史上最漂亮的一次“顺手发现”。详见 <a href=\"detail/light.html\">光，原来是一种电磁波</a>。",
    },
    {
        "id": "speed",
        "h2": "📊 实验三 · 分子速率分布：加热之后整群右移",
        "intro": "气体分子的速率参差不齐。拖动“温度”，看分布曲线怎样右移、变矮变宽——以及跑得够快的分子比例怎样猛增。",
        "kind": "speed",
        "card": "麦克斯韦速率分布",
        "badge": "可拖动",
        "desc": "温度越高，峰越靠右、曲线越矮越宽；高能分子比例急剧上升。",
        "controls": [
            {"ctrl": "temp", "label": "温度", "v": "1.0×", "min": "0.4", "max": "2.4", "value": "1", "step": "0.1"},
        ],
        "callout": "注意阴影部分：温度只升高一点，“跑得快”的分子比例却成倍增长——这就是为什么温度每升高 10℃，反应速率往往快一倍。详见 <a href=\"detail/gas.html\">气体动理论：分子在乱窜</a>。",
    },
]

FUNCS = [
    ("lab_field", '''
  function lab_field(lab) {
    var cv = $("canvas", lab);
    var sS = $('[data-ctrl="strength"]', lab);
    var out = $(".lab-readout", lab);
    var vS = sS ? sS.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400, CX = 340, CY = 198;
    var RR = [30, 54, 82, 114, 150, 190];
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var I = sS ? parseFloat(sS.value) : 1;
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var i, r, ry, al, cy2;
      var RN = 4;
      for (i = 0; i < RN; i++) {
        cy2 = 88 + i * 74;
        r = 172 - i * 30;
        ry = r * 0.30;
        al = Math.min(0.92, (0.34 + I * 0.30) / (1 + i * 0.12));
        ctx.strokeStyle = "rgba(59,91,219," + al.toFixed(3) + ")";
        ctx.lineWidth = Math.max(1.2, (3.0 - i * 0.35) * (0.6 + I * 0.35));
        ctx.beginPath(); ctx.ellipse(CX, cy2, r, ry, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = "rgba(59,91,219," + Math.min(1, al + 0.15).toFixed(3) + ")";
        ctx.beginPath();
        ctx.moveTo(CX + r, cy2 + 9);
        ctx.lineTo(CX + r - 6.5, cy2 - 4);
        ctx.lineTo(CX + r + 6.5, cy2 - 4);
        ctx.closePath(); ctx.fill();
      }

      ctx.strokeStyle = "#E8590C"; ctx.lineWidth = 5 + I * 4;
      ctx.beginPath(); ctx.moveTo(CX, 44); ctx.lineTo(CX, 340); ctx.stroke();
      ctx.fillStyle = "#E8590C";
      ctx.beginPath();
      ctx.moveTo(CX, 30); ctx.lineTo(CX - 9, 50); ctx.lineTo(CX + 9, 50);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#C1440E"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("电流 I ↑", CX + 14, 52);

      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("通电直导线：磁场像一串圆环，套在导线外面", 40, 30);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("右手握住导线，拇指指向电流方向，四指环绕的方向就是磁场方向。", 40, 366);
      ctx.fillText("离导线越远，磁场越弱——磁场大小 ∝ 电流 ÷ 距离：距离翻倍，磁场减半。", 40, 386);

      ctx.fillStyle = "#5C6B82"; ctx.font = "600 12.5px -apple-system, sans-serif";
      ctx.fillText("小磁针会沿着这些圆环偏转", 596, 108);
      ctx.strokeStyle = "#5C6B82"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(610, 118); ctx.lineTo(646, 152); ctx.stroke();
      ctx.fillStyle = "#fff"; ctx.strokeStyle = "#5C6B82"; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(650, 156, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = "#E03131"; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(643, 163); ctx.lineTo(657, 149); ctx.stroke();
      ctx.restore();

      if (vS) vS.textContent = I.toFixed(1) + "×";
      if (out) {
        out.innerHTML = "电流强度 = <b>" + I.toFixed(1) + "×</b>　·　电流越大，每圈磁力线越强、小磁针偏得越厉害　·　" +
          "磁场大小 ∝ 电流 / 距离：离导线 2 倍远，磁场只剩一半　·　" +
          (I < 0.6 ? "现在电流很小，磁力线几乎看不见。" : "这些圆环永远闭合，没有起点也没有终点——磁场线总是闭合的。");
      }
    }
    if (sS) sS.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }
'''),
    ("lab_wave", '''
  function lab_wave(lab) {
    var cv = $("canvas", lab);
    var sF = $('[data-ctrl="freq"]', lab);
    var sA = $('[data-ctrl="amp"]', lab);
    var out = $(".lab-readout", lab);
    var vF = sF ? sF.closest(".ctrl").querySelector(".v") : null;
    var vA = sA ? sA.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400, AX = 210, X0 = 74, X1 = 764;
    var ph = 0, last = 0;
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      if (!last) last = ts;
      var dt = Math.min(0.05, (ts - last) / 1000); last = ts;
      var f = sF ? parseFloat(sF.value) : 1;
      var a = sA ? parseFloat(sA.value) : 1;
      ph += dt * f * 3.2;
      var lam = 300 / f;
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var i, x, ang, ev, bv, bx, by, amp = 104 * a;
      ctx.strokeStyle = "#C9D3E0"; ctx.lineWidth = 1.6; ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.moveTo(X0 - 10, AX); ctx.lineTo(X1 + 22, AX); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#8B96AA";
      ctx.beginPath(); ctx.moveTo(X1 + 30, AX); ctx.lineTo(X1 + 16, AX - 6);
      ctx.lineTo(X1 + 16, AX + 6); ctx.closePath(); ctx.fill();
      ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("传播方向 →", X0 - 10, AX + 24);

      ctx.strokeStyle = "rgba(232,89,12,0.30)"; ctx.lineWidth = 1.2;
      for (i = 0; i <= 26; i++) {
        x = X0 + (X1 - X0) * i / 26;
        ang = (x - X0) / lam * Math.PI * 2 - ph;
        bv = Math.sin(ang) * amp * 0.46;
        ctx.beginPath(); ctx.moveTo(x, AX); ctx.lineTo(x + bv * 0.72, AX + bv * 0.72); ctx.stroke();
      }
      ctx.strokeStyle = "#E8590C"; ctx.lineWidth = 2.6;
      ctx.beginPath();
      for (i = 0; i <= 300; i++) {
        x = X0 + (X1 - X0) * i / 300;
        ang = (x - X0) / lam * Math.PI * 2 - ph;
        bv = Math.sin(ang) * amp * 0.46;
        bx = x + bv * 0.72; by = AX + bv * 0.72;
        if (i === 0) ctx.moveTo(bx, by); else ctx.lineTo(bx, by);
      }
      ctx.stroke();

      ctx.strokeStyle = "#1C7ED6"; ctx.lineWidth = 3;
      ctx.beginPath();
      for (i = 0; i <= 300; i++) {
        x = X0 + (X1 - X0) * i / 300;
        ang = (x - X0) / lam * Math.PI * 2 - ph;
        ev = AX - Math.sin(ang) * amp;
        if (i === 0) ctx.moveTo(x, ev); else ctx.lineTo(x, ev);
      }
      ctx.stroke();

      var xa = X0 + 62, ea = AX - Math.sin((xa - X0) / lam * Math.PI * 2 - ph) * amp;
      ctx.strokeStyle = "#1C7ED6"; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(xa, AX); ctx.lineTo(xa, ea); ctx.stroke();
      ctx.fillStyle = "#1C7ED6";
      ctx.beginPath(); ctx.moveTo(xa, ea - 10); ctx.lineTo(xa - 5, ea + 2);
      ctx.lineTo(xa + 5, ea + 2); ctx.closePath(); ctx.fill();
      ctx.font = "800 15px -apple-system, sans-serif";
      ctx.fillText("E", xa + 9, ea - 6);

      var xb = X0 + 122, bb = Math.sin((xb - X0) / lam * Math.PI * 2 - ph) * amp * 0.46;
      ctx.fillStyle = "#E8590C";
      ctx.font = "800 15px -apple-system, sans-serif";
      ctx.fillText("B", xb + bb * 0.72 + 8, AX + bb * 0.72 + 18);

      ctx.strokeStyle = "#5C6B82"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(X0 + 20, AX + 130, 44, -Math.PI / 2, 0); ctx.stroke();
      ctx.fillStyle = "#5C6B82"; ctx.font = "600 11.5px -apple-system, sans-serif";
      ctx.fillText("90°", X0 + 70, AX + 130 - 34);
      ctx.fillText("E ⊥ B，且都垂直于传播方向", X0 + 56, AX + 140);

      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("电磁波：电场（蓝，上下振）＋ 磁场（橙，垂直于纸面）", X0 - 10, 40);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("橙色的波画成斜向，是为了表示它垂直于纸面——和蓝波一样，一上一下地振。", X0 - 10, 372);
      ctx.restore();

      if (vF) vF.textContent = f.toFixed(1) + "×";
      if (vA) vA.textContent = a.toFixed(1) + "×";
      if (out) {
        out.innerHTML = "频率 <b>" + f.toFixed(1) + "×</b>　·　振幅 <b>" + a.toFixed(1) + "×</b>　·　波长 ≈ <b>" +
          lam.toFixed(0) + "</b>（相对）　·　E 与 B 步调完全一致（同相），谁也离不开谁：变化的电场生磁场，变化的磁场生电场，于是波自己跑下去　·　" +
          "频率越高波长越短，但两者乘积（波速）始终是光速。";
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }
'''),
    ("lab_speed", '''
  function lab_speed(lab) {
    var cv = $("canvas", lab);
    var sT = $('[data-ctrl="temp"]', lab);
    var out = $(".lab-readout", lab);
    var vT = sT ? sT.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var PX0 = 88, PX1 = 756, PY0 = 322, PY1 = 78, VMAX = 4.0, V0 = 1.8;
    function pdf(v, T) {
      var a2 = T, a3 = Math.pow(T, 1.5);
      return Math.sqrt(2 / Math.PI) * v * v * Math.exp(-v * v / (2 * a2)) / a3;
    }
    function tail(T) {
      var n = 600, hh = (VMAX * 1.6 - V0) / n, s = 0, i, v, w;
      for (i = 0; i <= n; i++) {
        v = V0 + i * hh;
        w = (i === 0 || i === n) ? 1 : (i % 2 ? 4 : 2);
        s += w * pdf(v, T);
      }
      return s * hh / 3;
    }
    function xOf(v) { return PX0 + v / VMAX * (PX1 - PX0); }
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var T = sT ? parseFloat(sT.value) : 1;
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var SC = 1.22, i, v, p, x, y;
      ctx.strokeStyle = "#EDF0F6"; ctx.lineWidth = 1;
      for (i = 0; i <= 4; i++) {
        y = PY1 + (PY0 - PY1) * i / 4;
        ctx.beginPath(); ctx.moveTo(PX0, y); ctx.lineTo(PX1, y); ctx.stroke();
      }
      ctx.strokeStyle = "#9AA7BE"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(PX0, PY0); ctx.lineTo(PX1, PY0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PX0, PY0); ctx.lineTo(PX0, PY1); ctx.stroke();

      ctx.fillStyle = "rgba(232,89,12,0.14)";
      ctx.beginPath();
      ctx.moveTo(xOf(V0), PY0);
      for (i = 0; i <= 200; i++) {
        v = V0 + (VMAX - V0) * i / 200;
        ctx.lineTo(xOf(v), PY0 - pdf(v, T) * SC * (PY0 - PY1));
      }
      ctx.lineTo(xOf(VMAX), PY0);
      ctx.closePath(); ctx.fill();

      ctx.strokeStyle = "#B0BAC9"; ctx.lineWidth = 2; ctx.setLineDash([6, 5]);
      ctx.beginPath();
      for (i = 0; i <= 300; i++) {
        v = VMAX * i / 300;
        x = xOf(v); y = PY0 - pdf(v, 1) * SC * (PY0 - PY1);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "rgba(232,89,12,0.55)";
      ctx.beginPath();
      ctx.moveTo(xOf(0), PY0);
      for (i = 0; i <= 300; i++) {
        v = VMAX * i / 300;
        ctx.lineTo(xOf(v), PY0 - pdf(v, T) * SC * (PY0 - PY1));
      }
      ctx.lineTo(xOf(VMAX), PY0);
      ctx.closePath(); ctx.fill();

      ctx.strokeStyle = "#E8590C"; ctx.lineWidth = 3;
      ctx.beginPath();
      for (i = 0; i <= 300; i++) {
        v = VMAX * i / 300;
        x = xOf(v); y = PY0 - pdf(v, T) * SC * (PY0 - PY1);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      var vp = Math.sqrt(2 * T);
      ctx.strokeStyle = "#E03131"; ctx.lineWidth = 1.6; ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(xOf(vp), PY0); ctx.lineTo(xOf(vp), PY1 + 14); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#E03131"; ctx.font = "700 12px -apple-system, sans-serif";
      ctx.textAlign = xOf(vp) > PX1 - 120 ? "right" : "left";
      ctx.fillText("最概然速率", xOf(vp) + (xOf(vp) > PX1 - 120 ? -8 : 8), PY1 + 12);

      ctx.strokeStyle = "#495057"; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(xOf(V0), PY0 + 6); ctx.lineTo(xOf(V0), PY0 - 4); ctx.stroke();
      ctx.textAlign = "center";
      ctx.fillStyle = "#495057"; ctx.font = "700 12px -apple-system, sans-serif";
      ctx.fillText("门槛速率", xOf(V0), PY0 + 24);
      ctx.textAlign = "left";

      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      for (i = 1; i <= 4; i++) {
        ctx.textAlign = "center";
        ctx.fillText(i + "", xOf(i), PY0 + 22);
      }
      ctx.textAlign = "left";
      ctx.fillText("分子速率 →", PX1 - 96, PY0 + 46);

      var vbar = 2 * Math.sqrt(2 * T / Math.PI);
      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("麦克斯韦-玻尔兹曼速率分布", PX0, 44);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("灰虚线：原来的温度（1.0×）　橙：现在的温度　阴影：速率超过门槛的分子", PX0, 64);

      ctx.fillStyle = "#1B2530"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("最概然 " + vp.toFixed(2) + "　平均 " + vbar.toFixed(2) + "　越过门槛 " + (tail(T) * 100).toFixed(1) + "%", 566, PY1 + 12);
      ctx.restore();

      if (vT) vT.textContent = T.toFixed(1) + "×";
      if (out) {
        var pc = tail(T) * 100, pc0 = tail(1) * 100;
        out.innerHTML = "温度 <b>" + T.toFixed(1) + "×</b>　·　最概然速率 <b>" + vp.toFixed(2) +
          "</b>（∝√T）　·　越过门槛速率的分子比例 <b>" + pc.toFixed(1) + "%</b>（1.0× 时只有 " + pc0.toFixed(1) + "%）　·　" +
          (T > 1.05 ? "温度升高，峰右移、变矮变宽，更关键的是右尾猛涨——能越过反应门槛的分子成倍增加。" :
           T < 0.95 ? "温度降低，峰左移变高，跑得快的分子迅速变少——反应也就慢下来了。" :
                      "这是基准温度：峰的位置由 √T 决定，整条曲线的面积始终是 1。");
      }
    }
    if (sT) sT.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }
'''),
]

INIT = [
    ("field", "lab_field"),
    ("wave", "lab_wave"),
    ("speed", "lab_speed"),
]
