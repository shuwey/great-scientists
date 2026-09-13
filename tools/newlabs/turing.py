# -*- coding: utf-8 -*-
"""图灵「玩一玩」重做规格。

改动理由（见 tools/labs-audit.html）：
  实验1 图灵机       —— 原实现本身就是好实验（纸带 + 读写头 + 左右移动），逐字节用原函数保留
  实验2 一条规则     —— 原为递归二叉树（分形），与达尔文页「生命之树」、巴斯德页逐字节相同，
                        而且文案讲的是「生命之树」，跟图灵毫无关系
                        改为一维元胞自动机：拖动规则号，看一条极简规则怎样长出复杂图案
                        —— 这正是图灵晚年研究「形态发生」的核心思想，也解释了为什么「简单规则＝强能力」
  实验3 可计算的波形 —— 原属簇 1「通用曲线模板」（param1/param2 + expr 开关），默认画一条正弦，
                        与物理学页面的曲线模板同源、跟图灵无关
                        改为「波形采样与数字化」：拖动采样密度与量化位数，看连续的真实信号怎样变成
                        一串离散的 0/1 —— 机器只认符号，这是「可计算」的第一道门
"""

SITE = "turing"
TITLE = "动手玩一玩 · 三个图灵小实验 | 读懂图灵"
META = "三个可直接在网页上操作的互动演示：亲手跑一台图灵机看它一格一格地计算、拖动规则号看一条简单规则长出万千图案、拖动采样与量化把连续信号压成一串 0 和 1。拖动滑块，亲手体会图灵讲过的道理。"
CLAIM = "光看文字不够直观？下面三个小实验，你直接用鼠标拖动滑块——看读写头在纸带上一格一格地计算、看一条极简规则怎样长出复杂图案、看连续的真实信号怎样被压成一串 0 和 1。"

LABS = [
    {
        "id": "turing",
        "h2": "📜 实验一 · 亲手跑一台图灵机",
        "intro": "拖动“速度”，看读写头在纸带上一步步读、写、移动——再简单的规则，也能完成计算。",
        "kind": "turing",
        "card": "亲手跑一台图灵机",
        "badge": "可拖动",
        "desc": "看状态与步数如何随规则滚动。",
        "controls": [
            {"ctrl": "speed", "label": "速度", "v": "1.0×", "min": "0.2", "max": "3", "value": "1", "step": "0.1"},
        ],
        "callout": "这台机器只会三件事：读一格、改写这一格、向左或向右移一格。可就是这“三个动作 + 一张状态表”，被证明能完成任何可计算的计算——这就是“通用图灵机”的厉害之处。详见 <a href=\"detail/turing-machine.html\">图灵机：计算的“最小模型”</a>。",
    },
    {
        "id": "automaton",
        "h2": "🌱 实验二 · 一条规则，万千图案",
        "intro": "最上面的一个黑格，每一行按同一条规则往下长一行——拖动“规则号”，看同样是 256 条规则里的一条，如何决定了图案是长成三角形、走向混沌，还是干脆消失。",
        "kind": "automaton",
        "card": "一维元胞自动机",
        "badge": "可拖动",
        "desc": "规则只是一张 8 行的对应表，却能长出分形、混沌或空白。",
        "controls": [
            {"ctrl": "rule", "label": "规则号（0–255）", "v": "110", "min": "0", "max": "255", "value": "110", "step": "1"},
        ],
        "callout": "一条规则的“全部内容”，只是右边那张 8 行的对应表。可 110 号规则已经被证明是“图灵完备”的——它能模拟任何计算机能做的事。所以“能力”不在于规则多复杂，而在于规则能不能被反复迭代。想弄清“算得出”和“算不出”的分界，看这里：<a href=\"detail/computability.html\">可计算性：有些问题算不出</a>。",
    },
    {
        "id": "signal",
        "h2": "📈 实验三 · 把连续的世界压成 0 和 1",
        "intro": "真实世界的声音、图像都是连续变化的。拖动“采样密度”和“量化位数”，看一条连续波形怎样被切成一个个离散样本、再被压成有限个档位——最后交给机器的，只剩 0 和 1。",
        "kind": "signal",
        "card": "采样 × 量化 = 数字化",
        "badge": "可拖动",
        "desc": "采样太稀会“认错”波形，量化太粗会丢掉细微变化。",
        "controls": [
            {"ctrl": "density", "label": "采样密度（点/周期）", "v": "8", "min": "2", "max": "40", "value": "8", "step": "1"},
            {"ctrl": "bits", "label": "量化位数", "v": "4", "min": "1", "max": "8", "value": "4", "step": "1"},
        ],
        "callout": "机器不会读“连续”的东西，它只认离散的符号——所以进入计算机之前，一切都要先被采样、量化，编成一串 0 和 1。同一套思路，战时也用在截获的电报信号上：先把信号变成符号，剩下的才是破译。详见 <a href=\"detail/enigma.html\">破译恩尼格玛：密码的战争</a>。",
    },
]

FUNCS = [
    ("lab_automaton", '''
  function lab_automaton(lab) {
    var cv = $("canvas", lab);
    var sR = $('[data-ctrl="rule"]', lab);
    var out = $(".lab-readout", lab);
    var vR = sR ? sR.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var CELL = 4, COLS = 190, ROWS = 74, X0 = 40, Y0 = 66;
    var MID = Math.floor(COLS / 2);
    var KNOWN = {
      0: "什么都不长：一开就熄",
      30: "混沌无序、看似随机，却完全由规则决定",
      90: "谢尔宾斯基三角形：经典的自相似分形",
      110: "图灵完备！这条简单规则能模拟任何计算",
      150: "嵌套的谢尔宾斯基方块：大三角里套着小三角",
      18: "谢尔宾斯基三角形（另一种画法）",
      22: "谢尔宾斯基三角形（斜向生长）",
      60: "谢尔宾斯基三角形（向左偏移）",
      102: "谢尔宾斯基三角形（上下对称）",
      126: "谢尔宾斯基三角形（粗线条）",
      182: "谢尔宾斯基三角形（点阵状）",
      255: "全部填满：一黑到底"
    };
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var rule = sR ? parseInt(sR.value, 10) : 110;
      var bin = rule.toString(2);
      while (bin.length < 8) bin = "0" + bin;
      var r, c, i, j, y, x, sx, bx, gy, gx, gw, cs, patt, bits3, o, outbit;
      var row = new Array(COLS);
      var nxt = new Array(COLS);
      var tmp, lc, md, rc, pat;
      for (c = 0; c < COLS; c++) row[c] = 0;
      row[MID] = 1;
      var rows = [];
      for (r = 0; r < ROWS; r++) {
        rows.push(row.slice());
        for (c = 0; c < COLS; c++) {
          lc = c > 0 ? row[c - 1] : 0;
          md = row[c];
          rc = c < COLS - 1 ? row[c + 1] : 0;
          pat = (lc << 2) | (md << 1) | rc;
          nxt[c] = (rule >> pat) & 1;
        }
        tmp = row; row = nxt; nxt = tmp;
      }
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      ctx.textAlign = "left";
      ctx.fillStyle = "#1B2530"; ctx.font = "700 15px -apple-system, sans-serif";
      ctx.fillText("一维元胞自动机：一条规则，万千图案", X0, 24);
      ctx.fillStyle = "#6741D9"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("当前规则号 " + rule + " ＝ " + bin + "₂", X0, 46);

      gx = 505; gy = 18; gw = 33; cs = 9;
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 11px -apple-system, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("规则表", gx - 10, gy + 12);
      ctx.textAlign = "left";
      for (i = 0; i < 8; i++) {
        patt = 7 - i;
        bx = gx + i * gw;
        bits3 = [(patt >> 2) & 1, (patt >> 1) & 1, patt & 1];
        for (j = 0; j < 3; j++) {
          ctx.fillStyle = bits3[j] ? "#2B3440" : "#E7ECF3";
          ctx.fillRect(bx + j * cs, gy, cs - 1, cs - 1);
        }
        outbit = (rule >> patt) & 1;
        ctx.fillStyle = outbit ? "#1C7ED6" : "#E7ECF3";
        ctx.fillRect(bx + cs, gy + cs + 5, cs - 1, cs - 1);
        ctx.fillStyle = "#B0BAC9"; ctx.font = "600 10px -apple-system, sans-serif";
        ctx.fillText("↓", bx + cs - 3, gy + cs + 4);
      }

      for (r = 0; r < rows.length; r++) {
        y = Y0 + r * CELL;
        for (c = 0; c < COLS; c++) {
          if (!rows[r][c]) continue;
          ctx.fillStyle = "#2B3440";
          ctx.fillRect(X0 + c * CELL, y, CELL - 0.5, CELL - 0.5);
        }
      }
      sx = X0 + MID * CELL + CELL / 2;
      ctx.fillStyle = "#E8590C";
      ctx.beginPath();
      ctx.moveTo(sx, Y0 - 2);
      ctx.lineTo(sx - 5, Y0 - 10);
      ctx.lineTo(sx + 5, Y0 - 10);
      ctx.closePath(); ctx.fill();

      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("最上面是一个黑格；每一行都按同一条规则、看上排左中右三格长出来。", X0, 384);
      ctx.restore();

      if (vR) vR.textContent = rule + "";
      if (out) {
        out.innerHTML = "规则 <b>" + rule + "</b>（" + bin + "₂）　·　" +
          (KNOWN[rule] || "一条普通规则：图案很快趋于简单重复或彻底消失") + "　·　" +
          (rule === 110 ? "⭐ 110 号规则已被证明是“图灵完备”的——理论上它能算任何可计算的东西。规则一共只有 256 条，能长出什么，全看规则怎么定。" :
                          "规则一共只有 256 条，却能长出分形、混沌甚至空白——能力不来自规则多复杂，而来自反复迭代。");
      }
    }
    if (sR) sR.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }
'''),
    ("lab_signal", '''
  function lab_signal(lab) {
    var cv = $("canvas", lab);
    var sD = $('[data-ctrl="density"]', lab);
    var sB = $('[data-ctrl="bits"]', lab);
    var out = $(".lab-readout", lab);
    var vD = sD ? sD.closest(".ctrl").querySelector(".v") : null;
    var vB = sB ? sB.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var PX0 = 70, PX1 = 782, PY0 = 268, PY1 = 84, TPER = 3;
    var CY = (PY0 + PY1) / 2, AY = (PY0 - PY1) / 2 - 8;
    var BAND_Y = 300, BAND_LABEL = 316, BAND_TOP = 326, BAND_H = 52;
    function sig(u) { return Math.sin(u * 2 * Math.PI * TPER); }
    function xOf(u) { return PX0 + u * (PX1 - PX0); }
    function yOf(s) { return CY - s * AY; }
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var dens = sD ? parseFloat(sD.value) : 8;
      var bits = sB ? parseInt(sB.value, 10) : 4;
      var lv = Math.pow(2, bits);
      var NS = Math.max(3, Math.round(dens * TPER));
      var q = [], j, uu, sv, qv, code, bi, cellH, colw, step, count;
      for (j = 0; j <= NS; j++) {
        uu = j / NS;
        sv = sig(uu);
        qv = Math.round((sv + 1) / 2 * (lv - 1)) / (lv - 1) * 2 - 1;
        q.push(qv);
      }
      var err = 0, M = 1200, m, ut, kk, d, ideal;
      for (m = 0; m < M; m++) {
        ut = m / M;
        kk = Math.min(NS, Math.floor(ut * NS));
        d = q[kk] - sig(ut);
        err += d * d;
      }
      err = Math.sqrt(err / M);
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);
      ctx.textAlign = "left";

      ctx.fillStyle = "#1B2530"; ctx.font = "700 15px -apple-system, sans-serif";
      ctx.fillText("把连续波形采样 + 量化：机器最终只拿到 0 和 1", PX0, 26);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("蓝线＝真实信号　橙线＝机器重建出来的样子　每个采样点被压到 " + lv + " 个档位之一", PX0, 46);

      var i2;
      ctx.strokeStyle = "#EDF0F6"; ctx.lineWidth = 1;
      for (i2 = 0; i2 < lv; i2++) {
        var lvv = -1 + 2 * i2 / (lv - 1);
        ctx.beginPath(); ctx.moveTo(PX0, yOf(lvv)); ctx.lineTo(PX1, yOf(lvv)); ctx.stroke();
      }
      ctx.strokeStyle = "#9AA7BE"; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(PX0, yOf(0)); ctx.lineTo(PX1, yOf(0)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PX0, PY1 - 10); ctx.lineTo(PX0, PY0); ctx.stroke();
      ctx.fillStyle = "#B0BAC9"; ctx.font = "600 11px -apple-system, sans-serif";
      for (i2 = 0; i2 <= TPER; i2++) {
        ctx.textAlign = "center";
        ctx.fillText(i2 + "T", xOf(i2 / TPER), PY0 + 18);
      }
      ctx.textAlign = "left";

      ctx.strokeStyle = "#3B5BDB"; ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (i2 = 0; i2 <= 300; i2++) {
        uu = i2 / 300;
        var yy = yOf(sig(uu));
        if (i2 === 0) ctx.moveTo(xOf(uu), yy); else ctx.lineTo(xOf(uu), yy);
      }
      ctx.stroke();

      ctx.strokeStyle = "#E8590C"; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(xOf(0), yOf(q[0]));
      for (j = 1; j <= NS; j++) {
        ctx.lineTo(xOf(j / NS), yOf(q[j - 1]));
        ctx.lineTo(xOf(j / NS), yOf(q[j]));
      }
      ctx.stroke();

      for (j = 0; j <= NS; j++) {
        uu = j / NS;
        ctx.strokeStyle = "rgba(232,89,12,0.28)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(xOf(uu), yOf(sig(uu))); ctx.lineTo(xOf(uu), yOf(q[j])); ctx.stroke();
        ctx.fillStyle = "#3B5BDB";
        ctx.beginPath(); ctx.arc(xOf(uu), yOf(sig(uu)), 2.4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#E8590C";
        ctx.fillRect(xOf(uu) - 2.2, yOf(q[j]) - 2.2, 4.4, 4.4);
      }

      count = Math.min(NS, 30);
      step = (PX1 - PX0) / count;
      colw = Math.min(step - 3, 20);
      cellH = BAND_H / bits;
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 11px -apple-system, sans-serif";
      ctx.fillText("样本编码（二进制，每一位不是 1 就是 0）", PX0, BAND_LABEL);
      for (j = 0; j < count; j++) {
        code = Math.round((q[j] + 1) / 2 * (lv - 1));
        for (bi = 0; bi < bits; bi++) {
          var bit = (code >> (bits - 1 - bi)) & 1;
          ctx.fillStyle = bit ? "#2B3440" : "#E7ECF3";
          ctx.fillRect(PX0 + j * step, BAND_TOP + bi * cellH, colw, cellH - 1);
        }
      }
      ctx.restore();

      if (vD) vD.textContent = dens + "";
      if (vB) vB.textContent = bits + "";
      if (out) {
        var verdict;
        if (dens < 4) verdict = "采样太稀：点根本抓不住波峰波谷，机器会把快波当成慢波（这叫混叠失真）。";
        else if (bits <= 2) verdict = "量化太粗：档位太少，重建出的信号成了台阶，细微变化全丢了。";
        else if (dens >= 12 && bits >= 6) verdict = "又密又细：重建的橙线几乎和真实蓝线重合，肉眼已看不出差别——这就是高质量数字化。";
        else verdict = "已经像那么回事了：想更接近真实，可以把采样调密一点、量化位数调高一点。";
        out.innerHTML = "采样密度 <b>" + dens + " 点/周期</b>（本图共 " + NS + " 个采样点）　·　量化 <b>" + bits +
          " 位</b>（" + lv + " 个档位）　·　重建误差 ≈ <b>" + (err * 100).toFixed(1) + "%</b>　·　" + verdict;
      }
    }
    if (sD) sD.addEventListener("input", draw);
    if (sB) sB.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }
'''),
]

INIT = [
    ("turing", "lab_turing"),
    ("automaton", "lab_automaton"),
    ("signal", "lab_signal"),
]
