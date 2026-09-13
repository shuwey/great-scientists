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

  function lab_path(lab) {
  var P = {"label": "从 A 到 B：粒子把每一条路都走了一遍"};

  var cv=$("canvas",lab); var sH=$('[data-ctrl="hbar"]',lab);
  var out=$(".lab-readout",lab);
  function _vs(el){ return el?el.closest(".ctrl").querySelector(".v"):null; }
  var vH=_vs(sH);
  var W=820,H=360, t=0, last=0, i;
  var AX=90, BX=730, AY=158, MIDX=410;
  var M=21, SPREAD=132;
  var phs=new Array(M), dsv=new Array(M);
  function arrow(ctx,x,y,ang,len,col,lw){
    var ex=x+Math.cos(ang)*len, ey=y+Math.sin(ang)*len;
    ctx.strokeStyle=col; ctx.lineWidth=lw; ctx.beginPath();
    ctx.moveTo(x,y); ctx.lineTo(ex,ey); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ex,ey);
    ctx.lineTo(ex-Math.cos(ang-0.42)*5,ey-Math.sin(ang-0.42)*5);
    ctx.lineTo(ex-Math.cos(ang+0.42)*5,ey-Math.sin(ang+0.42)*5);
    ctx.closePath(); ctx.fillStyle=col; ctx.fill();
  }
  function draw(ts){
    if(typeof ts!=="number")ts=Date.now();
    if(!last)last=ts; var dt=Math.min(0.05,(ts-last)/1000); last=ts;
    var hb=sH?parseFloat(sH.value):1;
    t+=dt*0.5;
    for(i=0;i<M;i++){
      var d=-SPREAD+(2*SPREAD/(M-1))*i;
      dsv[i]=d; phs[i]=0.00045*d*d/hb+t;
    }
    var S=setupCanvas(cv,H/W); var ctx=S.ctx,k=S.w/W;
    ctx.save(); ctx.scale(k,k); ctx.clearRect(0,0,W,H);
    ctx.fillStyle="#FBFCFE"; ctx.fillRect(0,0,W,H);
    for(i=0;i<M;i++){
      var d=dsv[i], cls=Math.abs(d)<(2*SPREAD/(M-1))*0.5;
      ctx.beginPath(); ctx.moveTo(AX,AY);
      ctx.quadraticCurveTo(MIDX, AY+2*d, BX, AY);
      ctx.strokeStyle= cls? "rgba(232,89,12,.9)" : "rgba(73,80,87,.26)";
      ctx.lineWidth= cls? 2.6 : 1.1; ctx.stroke();
      var px=0.25*AX+0.5*MIDX+0.25*BX, py=AY+d;
      arrow(ctx,px,py,phs[i],9, cls? "#E8590C" : "#868E96", cls?1.8:1.2);
    }
    ctx.fillStyle="#495057"; ctx.font="700 14px -apple-system,sans-serif"; ctx.textAlign="center";
    ctx.fillText("A",AX,AY+34); ctx.fillText("B",BX,AY+34);
    ctx.fillStyle="#E8590C"; ctx.font="600 12px -apple-system,sans-serif";
    ctx.fillText("直线＝经典路径（作用量最小）",MIDX,AY+SPREAD+42);
    var sx=AX, sy=302, cxs=sx, cys=sy, L=6.4;
    ctx.strokeStyle="rgba(26,115,232,.75)"; ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(cxs,cys);
    for(i=0;i<M;i++){
      cxs+=Math.cos(phs[i])*L; cys+=Math.sin(phs[i])*L; ctx.lineTo(cxs,cys);
    }
    ctx.stroke();
    arrow(ctx,sx,sy,Math.atan2(cys-sy,cxs-sx),Math.sqrt((cxs-sx)*(cxs-sx)+(cys-sy)*(cys-sy)),"#E03131",2.6);
    var amp=Math.sqrt((cxs-sx)*(cxs-sx)+(cys-sy)*(cys-sy))/(M*L);
    ctx.textAlign="left"; ctx.fillStyle="#868E96"; ctx.font="600 12px -apple-system,sans-serif";
    ctx.fillText("把每条路径的相位箭头首尾相接（红箭头＝叠加后的总概率幅）",sx,sy-14);
    ctx.fillStyle="#868E96"; ctx.font="600 13px -apple-system,sans-serif";
    ctx.fillText(P.label||"从 A 到 B：粒子把每一条路都走了一遍", 14, 24);
    ctx.restore();
    if(vH)vH.textContent=hb.toFixed(1)+"×";
    if(out)out.innerHTML="约化普朗克常数 <b>"+hb.toFixed(1)+"×</b>：ℏ 越小，相邻路径的相位差越大、互相抵消得越厉害，最后只剩靠近直线的那几条——粒子看起来走直线（经典）。ℏ 越大，越多路径能相干叠加，量子效应越明显。当前净概率幅 <b>"+amp.toFixed(2)+"</b>。";
    requestAnimationFrame(draw);
  }
  if(sH)sH.addEventListener("input",draw);
  requestAnimationFrame(draw);

}

  function initLabs() {
    $$(".lab").forEach(function (lab) {
      var kind = lab.getAttribute("data-lab");
      if (kind === "path") lab_path(lab);
      if (kind === "interfere") lab_interfere(lab);
      if (kind === "dist") lab_dist(lab);
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
