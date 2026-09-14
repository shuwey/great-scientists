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


  function lab_population(lab) {
    var cv = $("canvas", lab);
    var sR = $('[data-ctrl="rate"]', lab);
    var out = $(".lab-readout", lab);
    var vR = sR ? sR.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400, K = 60, COLS = 10, ROWS = 6;
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var r = sR ? parseFloat(sR.value) : 0.6;
      var born = Math.round(K * r * 1.6);
      var survive = Math.min(born, K);
      var culled = born - survive;
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var gx = 56, gy = 84, cw = 38, chh = 33, i, cx, cy;
      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("环境能养活的个体：60 个位置", gx, 56);
      ctx.strokeStyle = "#DDE3EC"; ctx.lineWidth = 1;
      ctx.strokeRect(gx - 8, gy - 8, COLS * cw + 16, ROWS * chh + 16);
      for (i = 0; i < K; i++) {
        cx = gx + (i % COLS) * cw + cw / 2;
        cy = gy + Math.floor(i / COLS) * chh + chh / 2;
        if (i < survive) {
          ctx.fillStyle = "#2F9E44";
          ctx.globalAlpha = 0.9;
        } else {
          ctx.fillStyle = "#EDF0F6";
          ctx.globalAlpha = 1;
        }
        ctx.beginPath(); ctx.arc(cx, cy, 11, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#5C6B82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("活下来的：" + survive + " / 60", gx, gy + ROWS * chh + 32);

      var ox = 496, oy = 68;
      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("这一代出生：" + born + " 个", ox, 56);
      ctx.strokeStyle = culled > 0 ? "#F5C6C6" : "#DDE3EC"; ctx.lineWidth = 1;
      ctx.strokeRect(ox - 8, oy - 8, 274, 214);
      if (culled > 0) {
        for (i = 0; i < culled; i++) {
          cx = ox + 8 + (i % 17) * 16;
          cy = oy + 10 + Math.floor(i / 17) * 19;
          ctx.fillStyle = "#E03131";
          ctx.globalAlpha = 0.85;
          ctx.beginPath(); ctx.arc(cx, cy, 5.2, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = "#C92A2A"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("被淘汰：" + culled + " 个", ox, oy + 224);

      ctx.fillStyle = "#5c6b82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("红点＝还没长大就被饿死、被捕食的个体。它们并非“不努力”，只是没赶上环境。", gx, 372);
      ctx.restore();

      if (vR) vR.textContent = r.toFixed(1);
      if (out) {
        if (culled > 0) {
          out.innerHTML = "繁殖速率 r = <b>" + r.toFixed(1) + "</b>　·　这一代出生约 <b>" + born +
            "</b> 个，环境只能养活 <b>60</b> 个 → <b>" + culled +
            "</b> 个被淘汰　·　后代总是多于食物，于是必然有竞争：这就是达尔文说的「生存竞争」。";
        } else {
          out.innerHTML = "繁殖速率 r = <b>" + r.toFixed(1) + "</b>　·　这一代只出生 <b>" + born +
            "</b> 个，少于 60 个位置，全部活了下来　·　资源宽裕时看不出竞争；一旦后代超过环境容量，淘汰就立刻出现。";
        }
      }
    }
    if (sR) sR.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }


  function lab_selection(lab) {
    var cv = $("canvas", lab);
    var sP = $('[data-ctrl="press"]', lab);
    var sG = $('[data-ctrl="gens"]', lab);
    var out = $(".lab-readout", lab);
    var vP = sP ? sP.closest(".ctrl").querySelector(".v") : null;
    var vG = sG ? sG.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var PX0 = 92, PX1 = 768, PY0 = 316, PY1 = 78;
    var X0 = 5, X1 = 13, MU0 = 8.2, SD0 = 1.25;
    function xOf(mm) { return PX0 + (mm - X0) / (X1 - X0) * (PX1 - PX0); }
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var press = sP ? parseFloat(sP.value) : 1;
      var gens = sG ? parseFloat(sG.value) : 3;
      var mu = MU0 + press * 0.22 * gens;
      var sd = Math.max(0.66, SD0 - press * 0.02 * gens);
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var NB = 24, bw = (PX1 - PX0) / NB, i, xx, h0, h1;
      var h0a = [], h1a = [], peak = 0.0001;
      for (i = 0; i < NB; i++) {
        xx = X0 + (i + 0.5) / NB * (X1 - X0);
        h0 = Math.exp(-Math.pow(xx - MU0, 2) / (2 * SD0 * SD0));
        h1 = Math.exp(-Math.pow(xx - mu, 2) / (2 * sd * sd));
        h0a.push(h0); h1a.push(h1);
        if (h0 > peak) peak = h0;
        if (h1 > peak) peak = h1;
      }

      ctx.strokeStyle = "#EDF0F6"; ctx.lineWidth = 1;
      for (i = 0; i <= 5; i++) {
        var gy2 = PY1 + (PY0 - PY1) * i / 5;
        ctx.beginPath(); ctx.moveTo(PX0, gy2); ctx.lineTo(PX1, gy2); ctx.stroke();
      }
      for (i = 0; i < NB; i++) {
        var bx = PX0 + i * bw + 1.5, wide = bw - 3;
        var hh0 = h0a[i] / peak * (PY0 - PY1);
        var hh1 = h1a[i] / peak * (PY0 - PY1);
        ctx.fillStyle = "rgba(160,172,190,0.45)";
        ctx.fillRect(bx, PY0 - hh0, wide, hh0);
        ctx.fillStyle = "rgba(232,89,12,0.78)";
        ctx.fillRect(bx, PY0 - hh1, wide, hh1);
      }
      ctx.strokeStyle = "#9AA7BE"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(PX0, PY0); ctx.lineTo(PX1, PY0); ctx.stroke();

      ctx.strokeStyle = "#8B96AA"; ctx.lineWidth = 1.6; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(xOf(MU0), PY0); ctx.lineTo(xOf(MU0), PY1 - 10); ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = "#E8590C"; ctx.lineWidth = 2.2; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(xOf(mu), PY0); ctx.lineTo(xOf(mu), PY1 - 10); ctx.stroke();
      ctx.setLineDash([]);

      ctx.lineWidth = 3;
      ctx.textAlign = "left";
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = "#8B96AA"; ctx.beginPath(); ctx.moveTo(596, 40); ctx.lineTo(620, 40); ctx.stroke();
      ctx.strokeStyle = "#E8590C"; ctx.beginPath(); ctx.moveTo(596, 62); ctx.lineTo(620, 62); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#5C6B82"; ctx.font = "700 12px -apple-system, sans-serif";
      ctx.fillText("原始平均 " + MU0.toFixed(1) + " mm", 628, 44);
      ctx.fillStyle = "#E8590C";
      ctx.fillText("现在平均 " + mu.toFixed(1) + " mm", 628, 66);

      ctx.fillStyle = "#5c6b82"; ctx.font = "600 12px -apple-system, sans-serif";
      for (i = 0; i <= 4; i++) {
        var mm = X0 + (X1 - X0) * i / 4;
        ctx.textAlign = "center";
        ctx.fillText(mm.toFixed(0) + "mm", xOf(mm), PY0 + 22);
      }
      ctx.textAlign = "left";
      ctx.fillText("地雀的喙深 →", PX1 - 96, PY0 + 44);
      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("连续干旱 → 硬壳种子多 → 喙深者更有优势", PX0, 36);
      ctx.fillStyle = "#5c6b82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("灰柱＝原来的种群　橙柱＝选择之后的种群", PX0, 56);
      ctx.restore();

      if (vP) vP.textContent = press.toFixed(1);
      if (vG) vG.textContent = gens.toFixed(0);
      if (out) {
        var dim = Math.abs(mu - MU0) < 0.02;
        out.innerHTML = "选择压力 <b>" + press.toFixed(1) + "</b>　·　经过 <b>" + gens.toFixed(0) +
          "</b> 代　·　种群平均喙深由 <b>" + MU0.toFixed(1) + "mm</b> 变为 <b>" + mu.toFixed(1) +
          "mm</b>（分布宽度 " + sd.toFixed(2) + "）　·　" +
          (dim ? "还没有变化——世代为 0 或压力为 0 时，分布原地不动：没有选择，就没有方向。" :
                 "压力越大、世代越多，整群右移得越远。进化不是某只鸟变了，而是整群的比例变了。");
      }
    }
    if (sP) sP.addEventListener("input", draw);
    if (sG) sG.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }


  function lab_tree(lab) {
    var cv = $("canvas", lab);
    var sM = $('[data-ctrl="mya"]', lab);
    var out = $(".lab-readout", lab);
    var vM = sM ? sM.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var PX0 = 104, PX1 = 556, TMAX = 16;
    function xOf(t) { return PX1 - t / TMAX * (PX1 - PX0); }
    var TIPS = [
      { nm: "人类", y: 96, c: "#E8590C", t: 0 },
      { nm: "黑猩猩", y: 166, c: "#3B5BDB", t: 7 },
      { nm: "大猩猩", y: 236, c: "#2F9E44", t: 10 },
      { nm: "红毛猩猩", y: 306, c: "#6741D9", t: 14 }
    ];
    var N1 = (TIPS[0].y + TIPS[1].y) / 2;
    var N2 = (N1 + TIPS[2].y) / 2;
    var N3 = (N2 + TIPS[3].y) / 2;
    function seg(ctx2, x1, y1, x2, y2, col, w) {
      ctx2.strokeStyle = col; ctx2.lineWidth = w;
      ctx2.beginPath(); ctx2.moveTo(x1, y1); ctx2.lineTo(x2, y2); ctx2.stroke();
    }
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var mya = sM ? parseFloat(sM.value) : 0;
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var i, t, gy;
      ctx.strokeStyle = "#EDF0F6"; ctx.lineWidth = 1;
      for (i = 0; i <= TMAX; i += 2) {
        ctx.beginPath(); ctx.moveTo(xOf(i), 60); ctx.lineTo(xOf(i), 336); ctx.stroke();
        ctx.fillStyle = "#5c6b82"; ctx.font = "600 11px -apple-system, sans-serif";
        ctx.textAlign = "center"; ctx.fillText(i + "", xOf(i), 354); ctx.textAlign = "left";
      }
      ctx.fillStyle = "#5c6b82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("← 越往左，年代越久远（单位：百万年前）", PX0, 40);
      ctx.fillText("横线上的年份＝两条支线分家的时刻；越晚分家的，血缘越近。", PX0, 372);

      var TR = "#C4CDDB";
      seg(ctx, xOf(TIPS[0].t), TIPS[0].y, PX1 + 26, TIPS[0].y, TR, 2.6);
      seg(ctx, xOf(TIPS[1].t), TIPS[1].y, PX1 + 26, TIPS[1].y, TR, 2.6);
      seg(ctx, xOf(TIPS[2].t), TIPS[2].y, PX1 + 26, TIPS[2].y, TR, 2.6);
      seg(ctx, xOf(TIPS[3].t), TIPS[3].y, PX1 + 26, TIPS[3].y, TR, 2.6);
      seg(ctx, xOf(7), N1, xOf(7), TIPS[0].y, TR, 2.6);
      seg(ctx, xOf(7), N1, xOf(7), TIPS[1].y, TR, 2.6);
      seg(ctx, xOf(7), N1, xOf(10), N1, TR, 2.6);
      seg(ctx, xOf(10), N1, xOf(10), TIPS[2].y, TR, 2.6);
      seg(ctx, xOf(10), N2, xOf(10), N1, TR, 2.6);
      seg(ctx, xOf(10), N2, xOf(14), N2, TR, 3);
      seg(ctx, xOf(14), N2, xOf(14), TIPS[3].y, TR, 3);
      seg(ctx, xOf(14), N3, xOf(14), N2, TR, 3);
      seg(ctx, xOf(14), N3, xOf(16), N3, TR, 3.6);

      for (i = 0; i < TIPS.length; i++) {
        t = TIPS[i];
        ctx.fillStyle = t.c;
        ctx.beginPath(); ctx.arc(PX1 + 26, t.y, 6.5, 0, Math.PI * 2); ctx.fill();
        ctx.font = "700 14px -apple-system, sans-serif";
        ctx.fillText(t.nm, PX1 + 42, t.y + 5);
      }
      ctx.fillStyle = "#5C6B82"; ctx.font = "600 11.5px -apple-system, sans-serif";
      ctx.fillText("现在", PX1 + 42, 336);

      var NODES = [
        { x: xOf(7), y: N1, lab: "人 · 黑猩猩共同祖先", a: "#E8590C", side: 1 },
        { x: xOf(10), y: N2, lab: "＋大猩猩", a: "#2F9E44", side: -1 },
        { x: xOf(14), y: N3, lab: "＋红毛猩猩", a: "#6741D9", side: -1 }
      ];
      for (i = 0; i < NODES.length; i++) {
        ctx.fillStyle = "#1B2530";
        ctx.beginPath(); ctx.arc(NODES[i].x, NODES[i].y, 4.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = NODES[i].a; ctx.font = "700 11.5px -apple-system, sans-serif";
        ctx.textAlign = NODES[i].side > 0 ? "left" : "right";
        ctx.fillText(NODES[i].lab, NODES[i].x + (NODES[i].side > 0 ? 8 : -8), NODES[i].y - 8);
      }
      ctx.textAlign = "left";

      ctx.strokeStyle = "#E03131"; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(xOf(mya), 52); ctx.lineTo(xOf(mya), 340); ctx.stroke();
      ctx.fillStyle = "#E03131"; ctx.font = "700 12px -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(mya + " 百万年前", xOf(mya), 66);
      ctx.textAlign = "left";
      ctx.restore();

      if (vM) vM.textContent = mya.toFixed(0);
      var msg;
      if (mya < 7) msg = "人类与黑猩猩还<b>没有分家</b>，整条支线还是同一个物种。";
      else if (mya < 10) msg = "人类与黑猩猩已经<b>分家</b>（约 700 万年前）；此时两者与大猩猩、红毛猩猩仍共祖。";
      else if (mya < 14) msg = "大猩猩也在约 <b>1000 万年前</b>分出，只剩人类、黑猩猩与红毛猩猩共祖。";
      else msg = "约 <b>1400 万年前</b>红毛猩猩也分出去了；再往前，就是全体大猿的共同祖先。";
      if (out) out.innerHTML = "距今 <b>" + mya.toFixed(0) + "</b> 百万年前：" + msg + "　·　血缘的远近，看的是分家时间早晚，而不是谁长得更像谁。";
    }
    if (sM) sM.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
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
        if (kind === "population") lab_population(lab);
        if (kind === "selection") lab_selection(lab);
        if (kind === "tree") lab_tree(lab);
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
