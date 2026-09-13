# -*- coding: utf-8 -*-
"""门捷列夫「玩一玩」重做规格。

改动理由（见 tools/labs-audit.html）：
  实验1 排一排：把元素放进格子 —— 原实现就是周期表网格 + 高亮一族，内容对、画面清楚，保留
  实验2 周期律：性质起起伏伏 —— 原属簇 1「通用曲线模板」（param1/param2 + expr 开关），一条正弦/高斯冒充周期律
                                改为真实数据：第一电离能 / 原子半径 / 电负性 随原子序数画出的锯齿形
  实验3 留白的格子           —— 原同样调用通用曲线模板（一个钟形峰标"缺失处"），与实验2 画面几乎一样
                                改为「三个空格被逐个填满」：1869 年的预言 vs 1875/1879/1886 三次被发现
"""

SITE = "mendeleev"
TITLE = "动手玩一玩 · 三个门捷列夫小实验 | 读懂门捷列夫"
META = "三个可直接在网页上操作的互动演示：把元素按规律排进格子、看元素性质怎样随位置周期性起伏、看门捷列夫留下的三个空格怎样被后来的发现逐个填满。拖动滑块，亲手走一遍周期律被发现的过程。"
CLAIM = "光看文字不够直观？下面三个小实验，你直接用鼠标拖动滑块——看同族元素怎样排成一列、看原子半径自左向右递减、电离能总体递增却带局部下凹（两者趋势相反）、看那三个“空格”是怎样被一个个找回来的。"

LABS = [
    {
        "id": "grid",
        "h2": "🧪 实验一 · 排一排：把元素放进格子",
        "intro": "这是一张自动排好的周期表：拖动“族”滑块，看某一族如何被高亮——同族（同一列）颜色相近，性质也相近。",
        "kind": "grid",
        "card": "排一排：把元素放进格子",
        "badge": "可拖动",
        "desc": "纵列是族，横行是周期；同族最外层电子数相同。",
        "controls": [
            {"ctrl": "group", "label": "族", "v": "-", "min": "0", "max": "18", "value": "0", "step": "1"},
        ],
        "callout": "门捷列夫最厉害的一步，不是把已知元素排整齐，而是敢在表里留出空格——他相信“规律比事实更可靠”。详见 <a href=\"detail/law.html\">周期律：性质会“循环”</a>。",
    },
    {
        "id": "trend",
        "h2": "📈 实验二 · 周期律：性质一起一伏",
        "intro": "把元素的某种性质按原子序数画成柱子，会出现规律的锯齿：每到稀有气体冲到最高，一到碱金属就跌到最低，然后周而复始。拖动“性质”，换一种性质看看。",
        "kind": "trend",
        "card": "三种性质的周期起伏",
        "badge": "可拖动",
        "desc": "同一周期内总体递增、还带局部下凹（比如 N→O、P→S），跨过周期边界就突跳——这就是“周期性”。",
        "controls": [
            {"ctrl": "prop", "label": "性质", "v": "第一电离能", "min": "0", "max": "2", "value": "0", "step": "1"},
        ],
        "callout": "“周期性”不是画出来的，是元素本身的性质：每填满一层电子，就重新开始。门捷列夫把它写成了周期律，也顺手预言了还没被发现的元素该长什么样。详见 <a href=\"detail/law.html\">周期律：性质会“循环”</a>。",
    },
    {
        "id": "fill",
        "h2": "🧩 实验三 · 留白的格子：三个空格被逐个填满",
        "intro": "1869 年门捷列夫在表里留了三个空格，还写下了它们的性质预测。拖动“年份”，看这三个空格怎样被后来的发现一个一个填回来。",
        "kind": "fill",
        "card": "三个空格的二十年",
        "badge": "可拖动",
        "desc": "1875 年镓、1879 年钪、1886 年锗——预言全部应验。",
        "controls": [
            {"ctrl": "year", "label": "年份", "v": "1869", "min": "1869", "max": "1900", "value": "1869", "step": "1"},
        ],
        "callout": "一个理论真正的分量，看它敢不敢“说还没发生的事”。镓的密度、锗的原子量，门捷列夫当年都写下来了，后来测出来只差一点点。详见 <a href=\"detail/predict.html\">大胆预言：留白的格子</a>。",
    },
]

FUNCS = [
    ("lab_trend", '''
  function lab_trend(lab) {
    var cv = $("canvas", lab);
    var sP = $('[data-ctrl="prop"]', lab);
    var out = $(".lab-readout", lab);
    var vP = sP ? sP.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var PX0 = 86, PX1 = 772, PY0 = 326, PY1 = 92;
    var SYM = ["H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne",
               "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar"];
    var ION = [1312, 2372, 520, 899, 801, 1086, 1402, 1314, 1681, 2081,
               496, 738, 578, 787, 1012, 1000, 1251, 1521];
    var RAD = [53, 31, 167, 112, 87, 67, 56, 48, 42, 38,
               190, 145, 118, 111, 98, 88, 79, 71];
    var EN = [2.20, 0, 0.98, 1.57, 2.04, 2.55, 3.04, 3.44, 3.98, 0,
              0.93, 1.31, 1.61, 1.90, 2.19, 2.58, 3.16, 0];
    var PROPS = [
      { nm: "第一电离能", unit: "kJ/mol", d: ION, up: "变大", hi: "稀有气体最高" },
      { nm: "原子半径", unit: "pm", d: RAD, up: "变小", hi: "碱金属最大" },
      { nm: "电负性", unit: "Pauling", d: EN, up: "变大", hi: "卤素最高" }
    ];
    function xOf(i) { return PX0 + i / 17 * (PX1 - PX0); }
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var pi = sP ? Math.round(parseFloat(sP.value)) : 0;
      if (pi < 0) pi = 0;
      if (pi > 2) pi = 2;
      var P = PROPS[pi];
      var mx = 0, i, v;
      for (i = 0; i < P.d.length; i++) if (P.d[i] > mx) mx = P.d[i];
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = "rgba(59,91,219,0.05)";
      ctx.fillRect(xOf(0) - 20, PY1 - 14, xOf(1) - xOf(0) + 40, PY0 - PY1 + 14);
      ctx.fillStyle = "rgba(47,158,68,0.06)";
      ctx.fillRect(xOf(2) - 20, PY1 - 14, xOf(9) - xOf(2) + 40, PY0 - PY1 + 14);
      ctx.fillStyle = "rgba(232,89,12,0.06)";
      ctx.fillRect(xOf(10) - 20, PY1 - 14, xOf(17) - xOf(10) + 40, PY0 - PY1 + 14);
      ctx.fillStyle = "#B0BAC9"; ctx.font = "700 12px -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("第 1 周期", (xOf(0) + xOf(1)) / 2, PY1 - 16);
      ctx.fillText("第 2 周期", (xOf(2) + xOf(9)) / 2, PY1 - 16);
      ctx.fillText("第 3 周期", (xOf(10) + xOf(17)) / 2, PY1 - 16);
      ctx.textAlign = "left";

      ctx.strokeStyle = "#EDF0F6"; ctx.lineWidth = 1;
      for (i = 0; i <= 4; i++) {
        var gy = PY1 + (PY0 - PY1) * i / 4;
        ctx.beginPath(); ctx.moveTo(PX0 - 16, gy); ctx.lineTo(PX1 + 16, gy); ctx.stroke();
      }
      ctx.strokeStyle = "#9AA7BE"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(PX0 - 16, PY0); ctx.lineTo(PX1 + 26, PY0); ctx.stroke();

      var bw = 24, hh, y;
      for (i = 0; i < 18; i++) {
        v = P.d[i];
        if (v <= 0) {
          ctx.fillStyle = "#D5DBE5";
          ctx.fillRect(xOf(i) - bw / 2, PY0 - 4, bw, 4);
          ctx.fillStyle = "#B0BAC9"; ctx.font = "700 12px -apple-system, sans-serif";
          ctx.textAlign = "center"; ctx.fillText("—", xOf(i), PY0 - 12); ctx.textAlign = "left";
          continue;
        }
        hh = v / mx * (PY0 - PY1);
        var isNoble = (i === 1 || i === 9 || i === 17);
        var isAlk = (i === 2 || i === 10);
        ctx.fillStyle = isNoble ? "#6741D9" : (isAlk ? "#E03131" : "rgba(59,91,219,0.62)");
        ctx.fillRect(xOf(i) - bw / 2, PY0 - hh, bw, hh);
      }

      ctx.strokeStyle = "#1B2530"; ctx.lineWidth = 2;
      ctx.beginPath();
      for (i = 0; i < 18; i++) {
        if (P.d[i] <= 0) { ctx.stroke(); ctx.beginPath(); continue; }
        y = PY0 - P.d[i] / mx * (PY0 - PY1);
        if (i === 0) ctx.moveTo(xOf(i), y); else ctx.lineTo(xOf(i), y);
      }
      ctx.stroke();

      ctx.fillStyle = "#5C6B82"; ctx.font = "700 12.5px -apple-system, sans-serif";
      for (i = 0; i < 18; i++) {
        ctx.textAlign = "center";
        ctx.fillText(SYM[i], xOf(i), PY0 + 20);
      }
      ctx.textAlign = "left";

      ctx.fillStyle = "#6741D9"; ctx.font = "700 12px -apple-system, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("■ 稀有气体（峰顶）", PX1 + 16, 32);
      ctx.fillStyle = "#E03131";
      ctx.fillText("■ 碱金属（谷底）", PX1 + 16, 52);
      ctx.fillStyle = "rgba(59,91,219,0.75)";
      ctx.fillText("■ 其他元素", PX1 + 16, 72);
      ctx.textAlign = "left";

      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText(P.nm + "（" + P.unit + "）随原子序数的起伏", PX0 - 16, 44);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("柱子越高＝这个性质越大；每根柱子对应下面一个元素符号。", PX0 - 16, 64);
      ctx.fillText("同一周期内" + P.up + "；跨过周期边界就突跳——这就是“周期”二字的意思。", PX0 - 16, 376);
      ctx.restore();

      if (vP) vP.textContent = P.nm;
      if (out) {
        out.innerHTML = "正在看：<b>" + P.nm + "</b>（单位 " + P.unit + "）　·　同一周期从左到右" + P.up +
          "　·　" + P.hi + "　·　" +
          (pi === 0 ? "第一电离能：越难把电子拽走，值越大。稀有气体最“不舍得”，碱金属最“松手”。" :
           pi === 1 ? "原子半径：同周期从左到右变小（核电荷增加，把电子拉得更紧）；每换一个周期又突然变大。" :
                      "电负性：越靠右上方越大。氟是最大的一个（3.98），铯最小（约 0.79）。稀有气体一般不记电负性。");
      }
    }
    if (sP) sP.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }
'''),
    ("lab_fill", '''
  function lab_fill(lab) {
    var cv = $("canvas", lab);
    var sY = $('[data-ctrl="year"]', lab);
    var out = $(".lab-readout", lab);
    var vY = sY ? sY.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var SYM = ["H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne",
               "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar",
               "K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni",
               "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr"];
    var GAPS = { 21: 1879, 31: 1875, 32: 1886 };
    var GNAME = { 21: "钪 Sc", 31: "镓 Ga", 32: "锗 Ge" };
    var GWHO = { 21: "瑞典 尼尔森", 31: "法国 布瓦博德朗", 32: "德国 文克勒" };
    var GWAT = { 21: "门捷列夫叫它“类硼”，预言的氧化物性质几乎全对",
                 31: "门捷列夫叫它“类铝”，预言的密度 5.9 实测 5.94",
                 32: "门捷列夫叫它“类硅”，预言的原子量 72 实测 72.6" };
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var yr = sY ? parseFloat(sY.value) : 1869;
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var cw = 38, ch = 40, x0 = 64, i, r, c, z, found, bx, by;
      for (i = 0; i < 36; i++) {
        z = i + 1;
        r = Math.floor(i / 18);
        c = i % 18;
        bx = x0 + c * cw;
        by = 96 + r * (ch + 26);
        found = GAPS[z] !== undefined;
        if (found) {
          var disc = yr >= GAPS[z];
          ctx.fillStyle = disc ? "#FFF4E6" : "#F1F3F7";
          ctx.fillRect(bx, by, cw - 4, ch);
          ctx.strokeStyle = disc ? "#E8590C" : "#8B96AA";
          ctx.lineWidth = 2.4;
          if (!disc) ctx.setLineDash([5, 4]);
          ctx.strokeRect(bx + 1, by + 1, cw - 6, ch - 2);
          ctx.setLineDash([]);
          ctx.fillStyle = disc ? "#C1440E" : "#8B96AA";
          ctx.font = disc ? "700 14px -apple-system, sans-serif" : "800 16px -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(disc ? SYM[i] : "?", bx + (cw - 4) / 2, by + 26);
        } else {
          ctx.fillStyle = "rgba(59,91,219,0.10)";
          ctx.fillRect(bx, by, cw - 4, ch);
          ctx.strokeStyle = "#C9D3E0"; ctx.lineWidth = 1;
          ctx.strokeRect(bx, by, cw - 4, ch);
          ctx.fillStyle = "#5C6B82"; ctx.font = "700 12px -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(SYM[i], bx + (cw - 4) / 2, by + 25);
        }
        ctx.fillStyle = "#B0BAC9"; ctx.font = "600 9.5px -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(String(z), bx + (cw - 4) / 2, by - 4);
      }
      ctx.textAlign = "left";

      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("按原子序数排出的元素序列（1—36）", x0 - 6, 52);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("蓝色＝当年已知　橙色实线＝后来发现并填上的　灰色虚线＝还没填上的空格", x0 - 6, 72);

      var TX0 = 96, TX1 = 748, TY = 300;
      function xT(y) { return TX0 + (y - 1869) / 31 * (TX1 - TX0); }
      ctx.strokeStyle = "#C9D3E0"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(TX0, TY); ctx.lineTo(TX1, TY); ctx.stroke();
      for (i = 0; i <= 3; i++) {
        var yy = 1869 + i * 10;
        ctx.strokeStyle = "#DDE3EC"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(xT(yy), TY - 6); ctx.lineTo(xT(yy), TY + 6); ctx.stroke();
        ctx.fillStyle = "#B0BAC9"; ctx.font = "600 11.5px -apple-system, sans-serif";
        ctx.fillText(String(yy), xT(yy), TY + 24);
      }
      var MS = [
        { y: 1875, z: 31, c: "#E8590C" },
        { y: 1879, z: 21, c: "#2F9E44" },
        { y: 1886, z: 32, c: "#6741D9" }
      ];
      for (i = 0; i < MS.length; i++) {
        var on = yr >= MS[i].y;
        ctx.fillStyle = on ? MS[i].c : "#D5DBE5";
        ctx.beginPath(); ctx.arc(xT(MS[i].y), TY, on ? 8 : 6, 0, Math.PI * 2); ctx.fill();
        if (on) {
          ctx.fillStyle = MS[i].c; ctx.font = "700 12px -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(String(MS[i].y), xT(MS[i].y), TY - 18);
          ctx.textAlign = "left";
        }
      }
      ctx.fillStyle = "#1B2530"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("1869：留下 3 个空格", TX0 - 4, TY - 44);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("→", TX0 + 152, TY - 44);

      ctx.strokeStyle = "#E03131"; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(xT(yr), TY - 34); ctx.lineTo(xT(yr), TY + 12); ctx.stroke();
      ctx.fillStyle = "#E03131"; ctx.font = "700 12px -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(yr + " 年", xT(yr), TY + 44);
      ctx.textAlign = "left";
      ctx.restore();

      var got = 0;
      if (yr >= 1875) got++;
      if (yr >= 1879) got++;
      if (yr >= 1886) got++;
      if (vY) vY.textContent = yr.toFixed(0);
      var line = [];
      if (yr < 1875) line.push("1869 年门捷列夫留下 3 个空格（Z=21、31、32），并写下了它们的性质预测——当时同行大多不信。");
      else if (yr < 1879) line.push("<b>1875 年</b>，法国化学家布瓦博德朗发现了 <b>" + GNAME[31] + "</b>（Z=31）：" + GWAT[31] + "。");
      else if (yr < 1886) line.push("<b>1879 年</b>，瑞典化学家尼尔森发现了 <b>" + GNAME[21] + "</b>（Z=21）：" + GWAT[21] + "。");
      else line.push("<b>1886 年</b>，德国化学家文克勒发现了 <b>" + GNAME[32] + "</b>（Z=32）：" + GWAT[32] + "——三个空格全部填满，预言被彻底证实。");
      if (out) out.innerHTML = "年份 <b>" + yr.toFixed(0) + "</b>　·　已填满 <b>" + got + " / 3</b> 个空格　·　" + line.join(" ");
    }
    if (sY) sY.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }
'''),
]

INIT = [
    ("grid", "lab_grid"),
    ("trend", "lab_trend"),
    ("fill", "lab_fill"),
]
