/* ==========================================================================
   《读懂牛顿》交互脚本
   1) 术语自动标注 + 弹窗    2) 导航 / 进度条   3) 时间轴展开
   4) 目录滚动高亮           5) 公式符号拆解    6) Canvas 演示 ×3
   7) 词典搜索               8) 返回顶部
   ========================================================================== */
(function () {
  "use strict";

  // 通用全局名：SITE_TERMS / SITE_PAGES / SITE_CATS（多科学家共用引擎）
  // 保留 NEWTON_* 兼容旧数据文件
  var T = window.SITE_TERMS || window.NEWTON_TERMS || {};
  var P = window.SITE_PAGES || window.NEWTON_PAGES || {};
  var BASE = document.body.getAttribute("data-base") || "";

  /* 弹窗"了解更多"链接修正：NEWTON_PAGES 里存的是相对站点根的路径
     （如 "detail/gravity.html"）。当弹窗从 detail/ 子目录页面弹出时，
     需去掉 "detail/" 前缀，得到与当前页同级的相对路径，避免 detail/detail/ 错误。
     根级页面保持原样即可。兼容 file:// 直接打开与 http 部署。 */
  function fixUrl(abs) {
    if (!abs) return abs;
    var p = location.pathname || "";
    if (/\/detail\/[^\/]*\.html$/.test(p) || /\/detail\/$/.test(p)) {
      return abs.replace(/^detail\//, "");
    }
    return abs;
  }

  /* ------------------------------------------------------------------ */
  /* 0. 小工具                                                            */
  /* ------------------------------------------------------------------ */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  }); }
  function fmt(n, d) { return Number(n).toFixed(d === undefined ? 2 : d); }

  /* ------------------------------------------------------------------ */
  /* 1. 术语自动标注                                                      */
  /* ------------------------------------------------------------------ */
  var SKIP_AUTO = ["force"];            // 单字高频词不自动标注
  var EXCLUDE_CTX = { integration: ["微"] }; // 前面出现这些字符时不标注

  var ALIAS = {
    "white-light": ["白光", "复色光"],
    "apple-story": ["苹果落地"],
    "plague-years": ["奇迹年", "奇迹岁月", "大瘟疫"],
    principia: ["《自然哲学的数学原理》", "《原理》"],
    "newton-laws": ["三大运动定律"],
    "calculus-priority": ["发明权之争"],
    "lucasian-professor": ["卢卡斯数学教授"],
    "trinity-college": ["三一学院"],
    "royal-society": ["皇家学会"],
    mint: ["造币厂"],
    knighthood: ["封爵", "爵士头衔"],
    "reflecting-telescope": ["反射望远镜"],
    "chromatic-aberration": ["色差"],
    "corpuscular-theory": ["微粒说"],
    "newtons-rings": ["牛顿环"],
    "gravitational-constant": ["引力常数"],
    "net-force": ["合力", "净力"],
    "center-of-mass": ["质心"]
  };

  // 构造匹配表：{ id, word }，按词长降序，长词优先占用文本
  function buildMatcher() {
    var list = [];
    Object.keys(T).forEach(function (id) {
      if (SKIP_AUTO.indexOf(id) >= 0) return;
      var words = ALIAS[id] || [T[id].name];
      words.forEach(function (w) { if (w) list.push({ id: id, word: w }); });
    });
    list.sort(function (a, b) { return b.word.length - a.word.length; });
    return list;
  }

  function annotateRoot(root) {
    var matcher = buildMatcher();
    var used = {};                       // 每个术语全页只标注首次出现
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        var tag = p.tagName;
        if (/^(SCRIPT|STYLE|CODE|PRE|A|BUTTON|TEXTAREA|SVG|CANVAS|OPTION|SELECT)$/.test(tag)) {
          return NodeFilter.FILTER_REJECT;
        }
        if (p.closest && p.closest(".term, .no-terms, [data-no-terms]")) {
          return NodeFilter.FILTER_REJECT;
        }
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    var targets = [];
    while (walker.nextNode()) targets.push(walker.currentNode);

    targets.forEach(function (node) {
      var text = node.nodeValue;
      var marks = [];                    // {start, end, id}
      matcher.forEach(function (m) {
        var from = 0, idx;
        while ((idx = text.indexOf(m.word, from)) >= 0) {
          var conflict = marks.some(function (k) {
            return !(idx + m.word.length <= k.start || idx >= k.end);
          });
          var badCtx = false;
          if (EXCLUDE_CTX[m.id]) {
            var prev = text.charAt(idx - 1);
            if (prev && EXCLUDE_CTX[m.id].indexOf(prev) >= 0) badCtx = true;
          }
          if (!conflict && !badCtx) {
            marks.push({ start: idx, end: idx + m.word.length, id: m.id, word: m.word });
            break;                       // 该术语在本节点只标一次
          }
          from = idx + 1;
        }
      });
      marks.sort(function (a, b) { return a.start - b.start; });
      // 逐个过滤：已被占用 / 已用过的术语
      var keep = [];
      marks.forEach(function (k) {
        if (used[k.id]) return;
        var overlap = keep.some(function (j) {
          return !(k.end <= j.start || k.start >= j.end);
        });
        if (!overlap) { keep.push(k); used[k.id] = true; }
      });
      if (!keep.length) return;

      var frag = document.createDocumentFragment();
      var pos = 0;
      keep.forEach(function (k) {
        if (k.start > pos) frag.appendChild(document.createTextNode(text.slice(pos, k.start)));
        var span = document.createElement("span");
        span.className = "term";
        span.setAttribute("data-term", k.id);
        span.setAttribute("tabindex", "0");
        span.setAttribute("role", "button");
        span.textContent = k.word;
        frag.appendChild(span);
        pos = k.end;
      });
      if (pos < text.length) frag.appendChild(document.createTextNode(text.slice(pos)));
      node.parentNode.replaceChild(frag, node);
    });
  }

  function autoAnnotate() {
    var roots = $$("[data-terms]");
    roots.forEach(function (r) {
      if (r.getAttribute("data-terms") === "off") return;
      annotateRoot(r);
    });
  }

  /* ------------------------------------------------------------------ */
  /* 2. 术语弹窗                                                          */
  /* ------------------------------------------------------------------ */
  var mask, modal, lastFocus = null;

  function ensureModal() {
    if (mask) return;
    mask = document.createElement("div");
    mask.className = "modal-mask";
    mask.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">' +
      '<div class="modal-head">' +
      '<button class="modal-close" aria-label="关闭">✕</button>' +
      '<span class="modal-cat" id="modalCat"></span>' +
      '<h3 id="modalTitle"></h3>' +
      '<p class="short" id="modalShort"></p>' +
      '</div>' +
      '<div class="modal-body" id="modalBody"></div>' +
      '<div class="modal-related" id="modalRel"></div>' +
      '<div class="modal-foot">' +
      '<span class="tip">读懂了，点关闭继续阅读</span>' +
      '<span id="modalGo"></span>' +
      '</div></div>';
    document.body.appendChild(mask);
    mask.addEventListener("click", function (e) {
      if (e.target === mask) closeModal();
    });
    $(".modal-close", mask).addEventListener("click", closeModal);
    // 底部抽屉下滑关闭（移动端）
    var startY = null;
    $(".modal", mask).addEventListener("touchstart", function (e) {
      startY = e.touches[0].clientY;
    }, { passive: true });
    $(".modal", mask).addEventListener("touchmove", function (e) {
      if (startY === null) return;
      var dy = e.touches[0].clientY - startY;
      var el = $(".modal", mask);
      if (dy > 0 && el.scrollTop <= 0) el.style.transform = "translateY(" + dy + "px)";
    }, { passive: true });
    $(".modal", mask).addEventListener("touchend", function (e) {
      var el = $(".modal", mask);
      var dy = (e.changedTouches[0].clientY - (startY || 0));
      el.style.transform = "";
      if (dy > 90 && el.scrollTop <= 0) closeModal();
      startY = null;
    });
  }

  function openTerm(id) {
    var t = T[id];
    if (!t) return;
    ensureModal();
    lastFocus = document.activeElement;

    $("#modalCat", mask).textContent = t.cat || "";
    $("#modalTitle", mask).textContent = t.name;
    $("#modalShort", mask).textContent = t.short || "";

    var html = '<div class="mb"><span class="mt">通俗解释</span><p>' + (t.plain || "") + "</p></div>";
    if (t.analogy) {
      html += '<div class="mb analogy"><span class="mt">生活里的例子</span><p>' + t.analogy + "</p></div>";
    }
    if (t.extra) {
      html += '<div class="mb extra"><span class="mt">再多知道一点</span><p>' + t.extra + "</p></div>";
    }
    $("#modalBody", mask).innerHTML = html;

    // 相关术语
    var rel = $("#modalRel", mask);
    var relIds = (t.related || []).filter(function (r) { return T[r]; });
    if (relIds.length) {
      rel.innerHTML = '<span class="mt">相关概念</span>' +
        relIds.map(function (r) {
          return '<span class="chip" data-term="' + r + '">' + esc(T[r].name) + "</span>";
        }).join("");
      rel.style.display = "flex";
    } else {
      rel.innerHTML = ""; rel.style.display = "none";
    }

    // 了解更多
    var go = $("#modalGo", mask);
    if (t.page && P[t.page]) {
      var p = P[t.page];
      go.innerHTML = '<a class="go" href="' + fixUrl(p.url) + (t.anchor || "") + '">了解更多 →</a>';
    } else {
      go.innerHTML = "";
    }

    mask.classList.add("show");
    document.body.style.overflow = "hidden";
    $(".modal", mask).scrollTop = 0;
    setTimeout(function () { $(".modal-close", mask).focus(); }, 60);
  }

  function closeModal() {
    if (!mask) return;
    mask.classList.remove("show");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener("click", function (e) {
    var el = e.target.closest ? e.target.closest(".term, .chip, [data-term]") : null;
    if (!el) return;
    e.preventDefault();
    openTerm(el.getAttribute("data-term"));
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
    if (e.key === "Enter" && e.target.classList && e.target.classList.contains("term")) {
      e.preventDefault();
      openTerm(e.target.getAttribute("data-term"));
    }
  });

  /* ------------------------------------------------------------------ */
  /* 3. 导航 / 进度条 / 返回顶部                                          */
  /* ------------------------------------------------------------------ */
  function initNav() {
    var nav = $(".nav");
    var bar = $("#progress");
    var toTop = $(".to-top");
    var toggle = $(".nav-toggle");

    if (toggle) {
      toggle.addEventListener("click", function () { nav.classList.toggle("open"); });
      $$(".nav-links a").forEach(function (a) {
        a.addEventListener("click", function () { nav.classList.remove("open"); });
      });
    }

    function onScroll() {
      var y = window.scrollY || document.documentElement.scrollTop;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      if (nav) nav.classList.toggle("scrolled", y > 8);
      if (bar) bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
      if (toTop) toTop.classList.toggle("show", y > 500);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (toTop) toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // 当前栏目高亮
    var here = location.pathname.split("/").pop() || "index.html";
    $$(".nav-links a").forEach(function (a) {
      var href = a.getAttribute("href").split("#")[0].split("/").pop();
      if (href && href === here) a.classList.add("active");
    });
  }

  /* ------------------------------------------------------------------ */
  /* 4. 时间轴展开                                                        */
  /* ------------------------------------------------------------------ */
  function initTimeline() {
    var items = $$(".tl-item");
    if (!items.length) return;
    items.forEach(function (it) {
      var head = $(".tl-head", it);
      if (!head) return;
      head.addEventListener("click", function () {
        var open = it.classList.toggle("open");
        head.setAttribute("aria-expanded", open ? "true" : "false");
      });
      head.setAttribute("role", "button");
      head.setAttribute("tabindex", "0");
      head.setAttribute("aria-expanded", "false");
      head.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); head.click(); }
      });
    });

    // 默认展开第一个
    if (items[0]) {
      items[0].classList.add("open");
      var h0 = $(".tl-head", items[0]);
      if (h0) h0.setAttribute("aria-expanded", "true");
    }

    // 滚动淡入
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.style.opacity = "1";
            en.target.style.transform = "none";
            io.unobserve(en.target);
          }
        });
      }, { threshold: 0.12 });
      items.forEach(function (it) {
        it.style.opacity = "0";
        it.style.transform = "translateY(10px)";
        it.style.transition = "opacity .45s, transform .45s";
        io.observe(it);
      });
    }

    // 支持 #year 定位
    if (location.hash) {
      var target = document.querySelector('.tl-item[data-year="' + location.hash.slice(1) + '"]');
      if (target) {
        target.classList.add("open", "highlight");
        setTimeout(function () { target.scrollIntoView({ behavior: "smooth", block: "center" }); }, 120);
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* 5. 目录滚动高亮                                                      */
  /* ------------------------------------------------------------------ */
  function initToc() {
    var links = $$(".toc a");
    if (!links.length) return;
    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      var el = document.getElementById(id);
      if (el) map[id] = { a: a, el: el };
    });
    function update() {
      var y = window.scrollY + 120, cur = null;
      Object.keys(map).forEach(function (id) {
        if (map[id].el.offsetTop <= y) cur = id;
      });
      links.forEach(function (a) { a.classList.remove("active"); });
      if (cur) map[cur].a.classList.add("active");
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ------------------------------------------------------------------ */
  /* 6. 公式符号拆解                                                      */
  /* ------------------------------------------------------------------ */
  function initFormula() {
    $$(".formula").forEach(function (box) {
      var syms = $$(".sym", box);
      var notes = $$(".sym-note", box);
      if (!syms.length) return;
      syms.forEach(function (s) {
        s.addEventListener("click", function () {
          var key = s.getAttribute("data-sym");
          var on = s.classList.contains("on");
          syms.forEach(function (x) { x.classList.remove("on"); });
          notes.forEach(function (n) { n.classList.remove("show"); });
          if (on) return;
          s.classList.add("on");
          var note = notes.filter(function (n) { return n.getAttribute("data-sym") === key; })[0];
          if (note) note.classList.add("show");
        });
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 7. Canvas 演示                                                       */
  /* ------------------------------------------------------------------ */
  function setupCanvas(cv, ratio) {
    var dpr = window.devicePixelRatio || 1;
    var w = cv.clientWidth || cv.parentElement.clientWidth;
    var h = Math.round(w * (ratio || 0.45));
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    cv.style.height = h + "px";
    var ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: h };
  }


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
      ctx.fillStyle = "#5c6b82"; ctx.font = "700 12px -apple-system, sans-serif";
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
      ctx.fillStyle = "#5c6b82"; ctx.font = "600 12px -apple-system, sans-serif";
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
          ctx.fillStyle = disc ? "#C1440E" : "#5C6B82";
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
        // 原子序数：原 9.5px（屏幕实测仅 12.4px，全站最小的文字）。格子间距 26px，够放大。
        ctx.fillStyle = "#5c6b82"; ctx.font = "600 11px -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(String(z), bx + (cw - 4) / 2, by - 4);
      }
      ctx.textAlign = "left";

      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("按原子序数排出的元素序列（1—36）", x0 - 6, 52);
      ctx.fillStyle = "#5c6b82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("蓝色＝当年已知　橙色实线＝后来发现并填上的　灰色虚线＝还没填上的空格", x0 - 6, 72);

      var TX0 = 96, TX1 = 748, TY = 300;
      function xT(y) { return TX0 + (y - 1869) / 31 * (TX1 - TX0); }
      ctx.strokeStyle = "#C9D3E0"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(TX0, TY); ctx.lineTo(TX1, TY); ctx.stroke();
      for (i = 0; i <= 3; i++) {
        var yy = 1869 + i * 10;
        ctx.strokeStyle = "#DDE3EC"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(xT(yy), TY - 6); ctx.lineTo(xT(yy), TY + 6); ctx.stroke();
        ctx.fillStyle = "#5c6b82"; ctx.font = "600 11.5px -apple-system, sans-serif";
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
      ctx.fillStyle = "#5c6b82"; ctx.font = "600 12px -apple-system, sans-serif";
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

  function lab_grid(lab) {
  var P = {"label": "把元素按规律排成行与列"};

  var cv=$("canvas",lab); var sG=$('[data-ctrl="group"]',lab);
  var out=$(".lab-readout",lab); var vSpan=sG?sG.closest(".ctrl").querySelector(".v"):null;
  var W=820,H=420;
  function rr(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
  function draw(){
    var g=sG?parseInt(sG.value):0;
    var S=setupCanvas(cv,H/W); var ctx=S.ctx,k=S.w/W;
    ctx.save(); ctx.scale(k,k); ctx.clearRect(0,0,W,H); ctx.fillStyle="#FBFCFE"; ctx.fillRect(0,0,W,H);
    var cols=18, rows=7, mx=44, my=46, gw=(W-mx-14)/cols, gh=(H-my-16-72)/rows;
    for(var r=0;r<rows;r++){ for(var c=0;c<cols;c++){
      var hue=(c/cols)*320; ctx.fillStyle="hsl("+hue.toFixed(0)+",60%,78%)";
      rr(ctx, mx+c*gw+2, my+r*gh+2, gw-4, gh-4, 5); ctx.fill();
    }}
    var fy=my+rows*gh+18;
    for(var r=0;r<2;r++){ for(var c=0;c<15;c++){
      var hue=((c+3)/cols)*320; ctx.fillStyle="hsl("+hue.toFixed(0)+",60%,78%)";
      rr(ctx, mx+(c+2)*gw+2, fy+r*gh+2, gw-4, gh-4, 5); ctx.fill();
    }}
    if(g>=1&&g<=18){ ctx.strokeStyle="#1B2530"; ctx.lineWidth=3; rr(ctx, mx+(g-1)*gw+2, my+2, gw-4, rows*gh-4, 5); ctx.stroke(); }
    ctx.fillStyle="#5C6B82"; ctx.font="600 12px -apple-system,sans-serif"; ctx.textAlign="center";
    for(var c=0;c<cols;c++){ ctx.fillText((c+1), mx+c*gw+gw/2, 26); }
    ctx.textAlign="left";
    for(var r=0;r<rows;r++){ ctx.fillText((r+1), 14, my+r*gh+gh/2+4); }
    ctx.fillStyle="#5C6B82"; ctx.font="600 13px -apple-system,sans-serif";
    ctx.fillText(P.label||"周期表：纵列为族，横行为周期", 14, H-8);
    ctx.restore();
    if(vSpan)vSpan.textContent=(g||"-");
    if(out)out.innerHTML="纵列（族）同色，表示化学性质相近；横行（周期）代表电子多一层。"+(g>=1&&g<=18?("高亮的是第 <b>"+g+"</b> 族——同一族最外层电子数相同，这是周期表分类的根本依据。"):"拖动滑块可高亮任意一族。");
  }
  if(sG)sG.addEventListener("input",draw);
  draw();

}

  /* ------------------------------------------------------------------ */
  /* 动画闸门：让"画面一直在自己动"的演示能暂停 / 单步                     */
  /* ------------------------------------------------------------------ */
  /* 有些演示一打开就在自己跑（行星公转、波形推进、图灵机走格、光点沿轨迹前进……）。
     老师想说"就停在这一帧，大家看这里"却按不住；学生想对比上一帧 / 这一帧也做不到。
     这里在 requestAnimationFrame 外面套一层闸门：
       暂停 —— 干脆不驱动实验的绘制回调，只把 rAF 链自己续下去，画面必然定格。
              （只冻结时间戳拦不住图灵机这类实验：它每帧固定走几步，与 dt 无关。）
       单步 —— 放行一次绘制，并把时钟往前推一帧，走一步再停住。
       继续 —— 恢复后的第一帧也按"过了一帧"计时，避免暂停很久后画面跳一大步。
     闸门按 .lab 分别记账，同一页上几个实验互不影响。 */
  var __labNow = null;                  /* 正在初始化 / 正在驱动的 .lab 元素 */
  var __labAnims = [];                  /* [{lab, paused, step, clock, used, tools, resume}] */
  var __rafReal = window.requestAnimationFrame.bind(window);

  function __animTrack(lab) {
    var rec = { lab: lab, paused: false, step: false, clock: 0, used: false, tools: false, resume: false };
    __labAnims.push(rec);
    if (!__watchStarted) { __watchStarted = true; setTimeout(__animWatchdog, 1500); }
    return rec;
  }
  var __watchStarted = false;

  /* 兜底探测：有些实验要点了按钮才开始动（如牛顿抛体），初始化时排不到 rAF，
     闸门抓不住它们。这里对"还没有按钮"的实验做轻量探测——把画布缩到 16×16 比指纹，
     一旦发现它动起来了就补上按钮。只在确有未决实验时运行，最多约 4 分钟。 */
  function __animWatchdog() {
    var probe = document.createElement("canvas");
    probe.width = 16; probe.height = 16;
    var pctx = probe.getContext("2d");
    var ticks = 0;
    var timer = setInterval(function () {
      if (++ticks > 340) { clearInterval(timer); return; }
      if (document.hidden) return;
      var pending = false, i, r, cv, h, d, k;
      for (i = 0; i < __labAnims.length; i++) {
        r = __labAnims[i];
        if (r.tools || r.dead) continue;
        pending = true;
        cv = $("canvas", r.lab);
        if (!cv) { r.dead = true; continue; }
        h = 0;
        try {
          pctx.clearRect(0, 0, 16, 16);
          pctx.drawImage(cv, 0, 0, 16, 16);
          d = pctx.getImageData(0, 0, 16, 16).data;
          for (k = 0; k < d.length; k += 4) h = (h * 31 + d[k] + d[k + 1] * 3 + d[k + 2] * 7) | 0;
        } catch (e) { r.dead = true; continue; }
        if (r.probe !== undefined && r.probe !== h) { r.tools = true; __addAnimTools(r.lab, r); }
        r.probe = h;
      }
      if (!pending) clearInterval(timer);
    }, 700);
  }
  function __animOf(lab) {
    for (var i = 0; i < __labAnims.length; i++) if (__labAnims[i].lab === lab) return __labAnims[i];
    return null;
  }

  window.requestAnimationFrame = function (cb) {
    var owner = __labNow;
    var rec = owner ? __animOf(owner) : null;
    if (rec) {
      rec.used = true;
      /* 首次排 rAF 时才注入按钮：这样"打开就在跑"的实验立刻有按钮，
         "点了发射才开始跑"的实验（如牛顿抛体）也会在启动那一刻拿到按钮。 */
      if (!rec.tools) { rec.tools = true; __addAnimTools(rec.lab, rec); }
    }
    function tick(ts) {
      var back = __labNow;
      __labNow = owner;                 /* 回调里再排 rAF 时，归属同一个实验 */
      try {
        if (!rec) { cb(ts); return; }                 /* 非实验的 rAF：原样放行 */
        if (rec.paused && !rec.step) {
          __rafReal(tick);                            /* 暂停：不驱动绘制，只续住链条 */
          return;
        }
        if (rec.step) {                               /* 单步：时钟 +1 帧，放行一次 */
          rec.step = false; rec.clock += 1000 / 60; cb(rec.clock); return;
        }
        var t2;
        if (rec.resume) {                             /* 刚恢复：按"过了一帧"接着走 */
          rec.resume = false; rec.clock += 1000 / 60; t2 = rec.clock;
        } else { rec.clock = ts; t2 = ts; }
        cb(t2);
      } finally { __labNow = back; }
    }
    return __rafReal(tick);
  };

  function __addAnimTools(lab, rec) {
    if ($(".lab-anim-tools", lab)) return;   /* 已经加过就不再重复（闸门与 initLabs 都可能触发） */
    var box = document.createElement("div");
    box.className = "lab-anim-tools";
    box.innerHTML = '<button type="button" class="lab-anim-btn" data-anim="toggle" title="暂停 / 继续这段动画">⏸ 暂停</button>' +
                    '<button type="button" class="lab-anim-btn" data-anim="step" title="画面暂停时，向前走一帧">⏭ 单步</button>' +
                    '<span class="lab-anim-tip">暂停后按「单步」可逐帧对照</span>';
    var btnToggle = $('[data-anim="toggle"]', box);
    var btnStep = $('[data-anim="step"]', box);
    function sync() {
      btnToggle.textContent = rec.paused ? "▶ 继续" : "⏸ 暂停";
      btnToggle.classList.toggle("on", rec.paused);
      box.classList.toggle("paused", rec.paused);
    }
    btnToggle.addEventListener("click", function () {
      rec.paused = !rec.paused;
      if (!rec.paused) rec.resume = true;
      sync();
    });
    btnStep.addEventListener("click", function () {
      if (!rec.paused) { rec.paused = true; sync(); }  /* 没暂停就先按下去，再走一帧 */
      rec.step = true;
    });
    var anchor = $(".lab-readout", lab);
    if (anchor && anchor.parentNode === lab) lab.insertBefore(box, anchor);
    else lab.appendChild(box);
  }

  function initLabs() {
    $$(".lab").forEach(function (lab) {
      var kind = lab.getAttribute("data-lab");
      var rec = __animTrack(lab);
      __labNow = lab;              /* 这段里排的 rAF 都记在这个实验头上 */
      try {
        if (kind === "grid") lab_grid(lab);
        if (kind === "trend") lab_trend(lab);
        if (kind === "fill") lab_fill(lab);
      } finally { __labNow = null; }
      if (rec.used && !rec.tools) __addAnimTools(lab, rec);
    });
  }
function initGlossary() {
    var grid = $("#term-grid");
    if (!grid) return;
    var input = $("#term-search");
    var cats = window.SITE_CATS || window.NEWTON_CATS || [];
    var curCat = "全部";

    var catBox = $("#cat-filter");
    if (catBox) {
      var all = ["全部"].concat(cats);
      catBox.innerHTML = all.map(function (c) {
        return '<button class="cat-btn' + (c === "全部" ? " on" : "") + '" data-cat="' + c + '">' + c + "</button>";
      }).join("");
      catBox.addEventListener("click", function (e) {
        var b = e.target.closest(".cat-btn");
        if (!b) return;
        curCat = b.getAttribute("data-cat");
        $$(".cat-btn", catBox).forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        render();
      });
    }

    function matches(id, q) {
      var t = T[id];
      if (curCat !== "全部" && t.cat !== curCat) return false;
      if (!q) return true;
      var hay = (t.name + " " + t.short + " " + t.plain + " " + (t.analogy || "") + " " + t.cat).toLowerCase();
      return hay.indexOf(q.toLowerCase()) >= 0;
    }

    function render() {
      var q = input ? input.value.trim() : "";
      var ids = Object.keys(T).filter(function (id) { return matches(id, q); });
      ids.sort(function (a, b) {
        var ca = cats.indexOf(T[a].cat), cb = cats.indexOf(T[b].cat);
        if (ca !== cb) return ca - cb;
        return T[a].name.localeCompare(T[b].name, "zh");
      });
      if (!ids.length) {
        grid.innerHTML = '<div class="empty">没有匹配的术语，换个词试试（比如"引力""棱镜""切线"）</div>';
        return;
      }
      grid.innerHTML = ids.map(function (id) {
        var t = T[id];
        var go = t.page && P[t.page] ? '<span class="go">→ ' + P[t.page].title + "</span>" : "";
        return '<button class="term-card" data-term="' + id + '">' +
          '<div class="tc-top"><span class="tc-cat">' + t.cat + "</span></div>" +
          "<h3>" + esc(t.name) + "</h3>" +
          "<p>" + esc(t.short) + "</p>" + go + "</button>";
      }).join("");
      var counter = $("#term-count");
      if (counter) counter.textContent = ids.length + " 条";
    }

    if (input) input.addEventListener("input", render);
    render();
  }

  /* ------------------------------------------------------------------ */
  /* 9. 启动                                                              */
  /* ------------------------------------------------------------------ */
  function boot() {
    autoAnnotate();
    initNav();
    initTimeline();
    initToc();
    initFormula();
    initLabs();
    initGlossary();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
