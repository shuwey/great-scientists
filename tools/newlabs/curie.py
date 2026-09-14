# -*- coding: utf-8 -*-
"""居里夫人「玩一玩」重做规格。

改动理由（见 tools/labs-audit.html）：
  实验1 放射性原子  —— 原为玻尔电子壳层图（与玻尔页 0.99 相同），画面与「射线来自原子核」自相矛盾
                       改为 α / β / γ 三种射线的穿透对比
  实验2 X 射线      —— 原属「波动模板」四站共用，且 X 射线本非居里夫人的发现
                       改为「提纯的代价」：几吨沥青铀矿才换来零点几克镭
  实验3 新元素坐在哪 —— 原直接调用门捷列夫的周期表模板，读数都是门捷列夫口径
                       改为「半衰期」：镭的放射性强度怎么按 1600 年减半
"""

SITE = "curie"
TITLE = "动手玩一玩 · 三个居里夫人小实验 | 读懂居里夫人"
META = "三个可直接在网页上操作的互动演示：α/β/γ 三种射线谁能挡住谁、几吨矿石才换来一点点镭、放射性强度怎样按半衰期减弱。拖动滑块，亲眼看见居里夫人天天面对的东西。"
CLAIM = "光看文字不够直观？下面三个小实验，你直接用鼠标拖动滑块——看三种射线各能穿透多远、看提纯的代价有多惊人、看放射性强度的减弱有多规律。"

LABS = [
    {
        "id": "rays",
        "h2": "☢️ 实验一 · 三种射线，谁能挡住谁",
        "intro": "放射源会同时放出三种东西。拖动“屏蔽层厚度”，把纸、铝、铅一层层加厚，看哪一种最先被拦下、哪一种最难缠。",
        "kind": "rays",
        "card": "α / β / γ 的穿透力",
        "badge": "可拖动",
        "desc": "α 一张纸就挡住，β 要几毫米铝，γ 得靠几厘米厚铅。",
        "controls": [
            {"ctrl": "thick", "label": "屏蔽层厚度", "v": "0", "min": "0", "max": "100", "value": "0", "step": "1"},
        ],
        "callout": "三种射线的穿透力差了三个量级——这既是危险所在，也是当年它们能被区分开的原因。α 是氦核、β 是电子、γ 是高能光。详见 <a href=\"detail/radioactivity.html\">放射性：原子自己在放东西</a>。",
    },
    {
        "id": "purify",
        "h2": "⚗️ 实验二 · 提纯的代价：几吨矿石，换一点点镭",
        "intro": "沥青铀矿里镭的含量低得可怜。拖动“矿石吨数”，看要处理掉多少吨矿渣，才能攒出一点点镭——居里夫妇就是这么一锅一锅熬出来的。",
        "kind": "purify",
        "card": "从矿渣里淘出的光",
        "badge": "可拖动",
        "desc": "约每吨沥青铀矿残渣只能提出几十毫克镭；要攒出 0.1 克氯化镭，得处理好几吨矿渣。",
        "controls": [
            {"ctrl": "tons", "label": "处理矿石（吨）", "v": "1.0", "min": "0.5", "max": "10", "value": "1", "step": "0.5"},
        ],
        "callout": "居里夫妇在棚屋里处理了数吨沥青铀矿残渣，整整熬了四年，才得到 0.1 克氯化镭。它的放射性强到夜里会自己发光。详见 <a href=\"detail/radium.html\">镭：从矿渣里淘出的光</a>。",
    },
    {
        "id": "decay",
        "h2": "📉 实验三 · 半衰期：镭的强度怎么减弱",
        "intro": "镭-226 的半衰期约 1600 年。拖动“已经过去”，看它的放射性强度怎样有规律地往下掉——每过一个半衰期就只剩一半，不多不少。",
        "kind": "decay",
        "card": "半衰期：每 1600 年减一半",
        "badge": "可拖动",
        "desc": "不管剩下多少，再过 1600 年就又是一半。这条曲线谁也改不了。",
        "controls": [
            {"ctrl": "years", "label": "已经过去（年）", "v": "0", "min": "0", "max": "8000", "value": "0", "step": "100"},
        ],
        "callout": "半衰期是原子的“性格”，温度、压强、化学反应都改不了它——这一点让放射性成了可靠的天然时钟。详见 <a href=\"detail/decay.html\">衰变与半衰期：放射会变弱</a>。",
    },
]

FUNCS = [
    ("lab_rays", '''
  function lab_rays(lab) {
    var cv = $("canvas", lab);
    var sT = $('[data-ctrl="thick"]', lab);
    var out = $(".lab-readout", lab);
    var vT = sT ? sT.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var srcX = 128, sy = 200, barX = 236, unit = 4.55, farX = 792;
    var RAYS = [
      { nm: "α 射线", sub: "氦核（两个质子＋两个中子）", y: 132, c: "#E03131", range: 6 },
      { nm: "β 射线", sub: "高速电子", y: 200, c: "#3B5BDB", range: 40 },
      { nm: "γ 射线", sub: "高能光子", y: 268, c: "#0CA678", range: 100 }
    ];
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var th = sT ? parseFloat(sT.value) : 0;
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var i, r, end, stopped;
      ctx.fillStyle = "#EDEFF4";
      ctx.fillRect(barX, 76, th * unit, 268);
      ctx.strokeStyle = "#B9C3D4"; ctx.lineWidth = 1;
      ctx.strokeRect(barX, 76, th * unit, 268);

      var marks = [[6, "一张纸"], [40, "几毫米铝"], [100, "几厘米铅"]];
      for (i = 0; i < marks.length; i++) {
        var mx = barX + marks[i][0] * unit;
        ctx.strokeStyle = "rgba(139,150,170,.7)"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(mx, 62); ctx.lineTo(mx, 362); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#8B96AA"; ctx.font = "600 11.5px -apple-system, sans-serif";
        ctx.textAlign = "center"; ctx.fillText(marks[i][1], mx, 50); ctx.textAlign = "left";
      }

      ctx.fillStyle = "#4A5468";
      ctx.fillRect(88, 148, 26, 104);
      ctx.fillStyle = "rgba(245,159,0,.85)";
      ctx.beginPath(); ctx.arc(srcX - 4, sy, 13, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 11.5px -apple-system, sans-serif";
      ctx.fillText("放射源", 78, 282);
      ctx.fillText("（铅罐）", 78, 300);

      for (i = 0; i < RAYS.length; i++) {
        r = RAYS[i];
        stopped = th >= r.range;
        end = stopped ? barX + r.range * unit : farX;
        ctx.strokeStyle = r.c; ctx.lineWidth = stopped ? 2 : 3;
        ctx.beginPath();
        var x2;
        for (x2 = srcX + 12; x2 <= end; x2 += 6) {
          var yy = r.y + Math.sin(x2 / 7 + i) * 3.2;
          if (x2 === srcX + 12) ctx.moveTo(x2, yy); else ctx.lineTo(x2, yy);
        }
        ctx.stroke();
        if (stopped) {
          ctx.strokeStyle = r.c; ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(end - 8, r.y - 9); ctx.lineTo(end + 8, r.y + 9);
          ctx.moveTo(end + 8, r.y - 9); ctx.lineTo(end - 8, r.y + 9);
          ctx.stroke();
        } else {
          ctx.fillStyle = r.c;
          ctx.beginPath(); ctx.moveTo(farX, r.y); ctx.lineTo(farX - 11, r.y - 7);
          ctx.lineTo(farX - 11, r.y + 7); ctx.closePath(); ctx.fill();
        }
        ctx.fillStyle = r.c; ctx.font = "700 13px -apple-system, sans-serif";
        ctx.fillText(r.nm, 300, r.y - 34);
        ctx.fillStyle = "#8B96AA"; ctx.font = "600 11.5px -apple-system, sans-serif";
        ctx.fillText(r.sub, 300, r.y - 17);
        ctx.fillStyle = stopped ? "#B9C3D4" : r.c;
        ctx.font = "700 12px -apple-system, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(stopped ? "被挡住" : "穿过去了", 796, r.y - 17);
        ctx.textAlign = "left";
      }

      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("三种射线，穿透力差得很远", 300, 26);
      ctx.restore();

      var a1 = th >= 6, b1 = th >= 40, g1 = th >= 100;
      if (vT) vT.textContent = th.toFixed(0);
      if (out) {
        out.innerHTML = "屏蔽层厚度 = <b>" + th.toFixed(0) + "</b>（示意）　·　" +
          "α <b>" + (a1 ? "已挡住" : "穿过") + "</b>　·　" +
          "β <b>" + (b1 ? "已挡住" : "穿过") + "</b>　·　" +
          "γ <b>" + (g1 ? "刚够挡住" : "穿过（强度在减弱）") + "</b>　·　" +
          (a1 && b1 && g1 ? "要挡住三种，得动用厚铅墙" : "α 最脆弱，γ 最顽固");
      }
    }
    if (sT) sT.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }
'''),
    ("lab_purify", '''
  function lab_purify(lab) {
    var cv = $("canvas", lab);
    var sT = $('[data-ctrl="tons"]', lab);
    var out = $(".lab-readout", lab);
    var vT = sT ? sT.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var MG_PER_TON = 25;
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var tons = sT ? parseFloat(sT.value) : 1;
      var mg = tons * MG_PER_TON;
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var i, j, bx, by, n = Math.round(tons * 2);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("沥青铀矿残渣：" + tons.toFixed(1) + " 吨", 60, 54);
      for (i = 0; i < n; i++) {
        bx = 60 + (i % 10) * 34;
        by = 88 + Math.floor(i / 10) * 30;
        ctx.fillStyle = i % 2 ? "#6B5744" : "#7C6752";
        ctx.fillRect(bx, by, 28, 24);
        ctx.strokeStyle = "#584838"; ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, 28, 24);
      }
      for (i = n; i < 20; i++) {
        bx = 60 + (i % 10) * 34;
        by = 88 + Math.floor(i / 10) * 30;
        ctx.strokeStyle = "#E4E8F0"; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
        ctx.strokeRect(bx, by, 28, 24);
        ctx.setLineDash([]);
      }
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 11.5px -apple-system, sans-serif";
      ctx.fillText("（每格约 0.5 吨）", 60, 196);

      var vx = 662, vy = 198, glow = Math.min(1, mg / 250);
      ctx.fillStyle = "rgba(12,166,120," + (0.10 + glow * 0.26).toFixed(2) + ")";
      ctx.beginPath(); ctx.arc(vx, vy, 34 + glow * 44, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(12,166,120,0.22)";
      ctx.fillRect(vx - 34, vy - 74, 68, 96);
      ctx.strokeStyle = "#8B96AA"; ctx.lineWidth = 2;
      ctx.strokeRect(vx - 34, vy - 74, 68, 96);
      ctx.beginPath(); ctx.moveTo(vx - 34, vy - 74); ctx.lineTo(vx - 40, vy - 96);
      ctx.lineTo(vx + 40, vy - 96); ctx.lineTo(vx + 34, vy - 74); ctx.stroke();
      ctx.fillStyle = "rgba(12,166,120," + (0.35 + glow * 0.6).toFixed(2) + ")";
      ctx.fillRect(vx - 30, vy + 30 - Math.max(6, glow * 88), 60, Math.max(6, glow * 88));

      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(mg.toFixed(1) + " 毫克镭", vx, vy + 66);
      ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillStyle = "#8B96AA";
      ctx.fillText("约 " + (mg / 1000).toFixed(3) + " 克", vx, vy + 88);
      ctx.textAlign = "left";

      ctx.fillStyle = "#1B2530"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("凑够 1 克镭，需要 40 吨矿石", 60, 250);
      var pw = 460, px = 60, py = 268;
      ctx.fillStyle = "#EDEFF4"; ctx.fillRect(px, py, pw, 16);
      ctx.fillStyle = "#0CA678"; ctx.fillRect(px, py, pw * Math.min(1, mg / 1000), 16);
      ctx.strokeStyle = "#C7D0DE"; ctx.lineWidth = 1; ctx.strokeRect(px, py, pw, 16);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 11.5px -apple-system, sans-serif";
      ctx.fillText("0", px, py + 34);
      ctx.textAlign = "right"; ctx.fillText("1000 毫克", px + pw, py + 34); ctx.textAlign = "left";

      ctx.fillStyle = "#5C6B82"; ctx.font = "600 12.5px -apple-system, sans-serif";
      ctx.fillText("居里夫妇在漏风的棚屋里，一锅一锅地煮、一勺一勺地结晶，", 60, 344);
      ctx.fillText("整整四年，才拿到 0.1 克氯化镭。", 60, 366);
      ctx.restore();

      if (vT) vT.textContent = tons.toFixed(1);
      if (out) {
        out.innerHTML = "处理 <b>" + tons.toFixed(1) + "</b> 吨沥青铀矿 → 得到约 <b>" + mg.toFixed(1) +
          "</b> 毫克镭（每吨约 25 毫克）　·　要凑够 1 克，得处理约 <b>40</b> 吨　·　居里夫妇当年就是拿 0.1 克做出的名堂";
      }
    }
    if (sT) sT.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }
'''),
    ("lab_decay", '''
  function lab_decay(lab) {
    var cv = $("canvas", lab);
    var sT = $('[data-ctrl="years"]', lab);
    var out = $(".lab-readout", lab);
    var vT = sT ? sT.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var HL = 1600, TMAX = 8000;
    var PX0 = 110, PX1 = 700, PY0 = 330, PY1 = 66;
    function xOf(t) { return PX0 + t / TMAX * (PX1 - PX0); }
    function yOf(p) { return PY0 - p / 100 * (PY0 - PY1); }
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var t = sT ? parseFloat(sT.value) : 0;
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var i, y, p;
      ctx.strokeStyle = "#EDF0F6"; ctx.lineWidth = 1;
      for (i = 0; i <= 5; i++) {
        y = yOf(i * 20);
        ctx.beginPath(); ctx.moveTo(PX0, y); ctx.lineTo(PX1, y); ctx.stroke();
        ctx.fillStyle = "#8B96AA"; ctx.font = "600 11.5px -apple-system, sans-serif";
        ctx.textAlign = "right"; ctx.fillText((i * 20) + "%", PX0 - 8, y + 4); ctx.textAlign = "left";
      }
      ctx.strokeStyle = "#9AA7BE"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(PX0, PY0); ctx.lineTo(PX1, PY0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PX0, PY0); ctx.lineTo(PX0, PY1); ctx.stroke();

      for (i = 1; i <= 4; i++) {
        var ht = i * HL;
        if (ht > TMAX) break;
        ctx.strokeStyle = "rgba(139,150,170,.75)"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(xOf(ht), PY0); ctx.lineTo(xOf(ht), PY1); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#8B96AA"; ctx.font = "600 11.5px -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText((Math.pow(0.5, i) * 100).toFixed(i > 2 ? 2 : 0) + "%", xOf(ht), PY1 - 10);
        ctx.fillText(ht + " 年", xOf(ht), PY0 + 20);
        ctx.textAlign = "left";
      }

      ctx.strokeStyle = "#3B5BDB"; ctx.lineWidth = 3;
      ctx.beginPath();
      var tt;
      for (tt = 0; tt <= TMAX; tt += 40) {
        p = Math.pow(0.5, tt / HL) * 100;
        if (tt === 0) ctx.moveTo(xOf(tt), yOf(p)); else ctx.lineTo(xOf(tt), yOf(p));
      }
      ctx.stroke();

      var pNow = Math.pow(0.5, t / HL) * 100;
      ctx.strokeStyle = "#E03131"; ctx.lineWidth = 1.6; ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(xOf(t), PY0); ctx.lineTo(xOf(t), yOf(pNow)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#E03131";
      ctx.beginPath(); ctx.arc(xOf(t), yOf(pNow), 7, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#FFF"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(xOf(t), yOf(pNow), 7, 0, Math.PI * 2); ctx.stroke();

      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("镭-226：半衰期约 1600 年", PX0, 40);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 11.5px -apple-system, sans-serif";
      ctx.fillText("纵轴＝还剩多少放射性强度", 60, PY1 - 34);
      ctx.fillText("横轴＝经过的时间（年）", PX1 - 150, PY0 + 44);

      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("再久也一样", 726, 96);
      ctx.strokeStyle = "#E4E8F0"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(726, 108); ctx.lineTo(796, 108); ctx.stroke();
      ctx.fillStyle = "#5C6B82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("过了 1600 年剩 50%", 726, 138);
      ctx.fillText("再过 1600 年剩 25%", 726, 162);
      ctx.fillText("再过 1600 年剩 12.5%", 726, 186);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 11.5px -apple-system, sans-serif";
      ctx.fillText("剩下多少都不影响", 726, 224);
      ctx.fillText("下个半衰期的长度", 726, 244);
      ctx.fillStyle = "#1B2530"; ctx.font = "700 12.5px -apple-system, sans-serif";
      ctx.fillText("温度、压强、", 726, 288);
      ctx.fillText("化学反应都改不了", 726, 308);
      ctx.restore();

      var halvings = t / HL;
      if (vT) vT.textContent = t.toFixed(0);
      if (out) {
        out.innerHTML = "已经过了 <b>" + t.toFixed(0) + "</b> 年 = <b>" + halvings.toFixed(2) +
          "</b> 个半衰期　·　剩下的放射性强度 = <b>" + pNow.toFixed(1) + "%</b>　·　" +
          (t === 0 ? "现在一点没少" : "每过 1600 年就只剩一半，不多不少");
      }
    }
    if (sT) sT.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }
'''),
]

INIT = [
    ("rays", "lab_rays"),
    ("purify", "lab_purify"),
    ("decay", "lab_decay"),
]
