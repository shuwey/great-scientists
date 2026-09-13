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


  function lab_colony(lab) {
    var cv = $("canvas", lab);
    var sE = $('[data-ctrl="env"]', lab);
    var out = $(".lab-readout", lab);
    var vE = sE ? sE.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var PX0 = 92, PX1 = 762, PY0 = 330, PY1 = 96, TMAX = 10;
    function xOf(t) { return PX0 + t / TMAX * (PX1 - PX0); }
    function frac(t, env) {
      var r = 1.75 * env;
      var grow = 1 / (1 + Math.exp(-r * (t - 2.3)));
      var die = 1 / (1 + Math.exp(2.05 * (t - 6.6 - (env - 1) * 1.2)));
      return Math.max(0.012, grow * die);
    }
    function yOf(f) { return PY0 - (Math.log10(f) + 1.85) / 1.85 * (PY0 - PY1); }
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var env = sE ? parseFloat(sE.value) : 1;
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var i, t, f, x, y;
      var PH = [
        { a: 0, b: 1.2, nm: "迟缓期", c: "#8B96AA", d: "细菌在适应新环境，数量几乎不变" },
        { a: 1.2, b: 4.6, nm: "对数期", c: "#1C7ED6", d: "按几何级数猛增，是最典型的“繁殖”阶段" },
        { a: 4.6, b: 7.4, nm: "稳定期", c: "#2F9E44", d: "营养渐少、废物渐多，新生与死亡持平" },
        { a: 7.4, b: 10, nm: "衰亡期", c: "#E03131", d: "营养耗尽、废物积累，数量逐步下滑" }
      ];
      for (i = 0; i < PH.length; i++) {
        ctx.fillStyle = PH[i].c + "12";
        ctx.fillRect(xOf(PH[i].a), PY1 - 24, xOf(PH[i].b) - xOf(PH[i].a), PY0 - PY1 + 24);
        ctx.fillStyle = PH[i].c; ctx.font = "700 13px -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(PH[i].nm, (xOf(PH[i].a) + xOf(PH[i].b)) / 2, PY1 - 34);
        ctx.textAlign = "left";
      }

      ctx.strokeStyle = "#EDF0F6"; ctx.lineWidth = 1;
      for (i = 0; i <= 5; i++) {
        y = PY1 + (PY0 - PY1) * i / 5;
        ctx.beginPath(); ctx.moveTo(PX0, y); ctx.lineTo(PX1, y); ctx.stroke();
        ctx.fillStyle = "#B0BAC9"; ctx.font = "600 11px -apple-system, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(Math.pow(10, -(i * 1.85 / 5)).toPrecision(1), PX0 - 8, y + 4);
        ctx.textAlign = "left";
      }
      ctx.strokeStyle = "#9AA7BE"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(PX0, PY0); ctx.lineTo(PX1, PY0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PX0, PY0); ctx.lineTo(PX0, PY1 - 10); ctx.stroke();
      for (i = 0; i <= TMAX; i += 2) {
        ctx.fillStyle = "#B0BAC9"; ctx.font = "600 11px -apple-system, sans-serif";
        ctx.textAlign = "center"; ctx.fillText(i + "h", xOf(i), PY0 + 20); ctx.textAlign = "left";
      }

      ctx.strokeStyle = "#6741D9"; ctx.lineWidth = 3.4;
      ctx.beginPath();
      for (i = 0; i <= 400; i++) {
        t = TMAX * i / 400;
        x = xOf(t); y = yOf(frac(t, env));
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = "rgba(103,65,217,0.10)";
      ctx.lineTo(xOf(TMAX), PY0); ctx.lineTo(PX0, PY0); ctx.closePath(); ctx.fill();

      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("细菌数量（对数刻度）随时间的变化", PX0, 34);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("横轴：接入新鲜肉汤后的时间（小时）　·　纵轴：细菌数量（相对初始值）", PX0, 54);
      ctx.fillText("四个阶段依次走完；环境越适宜，对数期越陡、稳定期来得越早、衰亡也越快。", PX0, 382);
      ctx.restore();

      if (vE) vE.textContent = env.toFixed(1) + "×";
      if (out) {
        f = frac(4.0, env);
        out.innerHTML = "环境适宜度 <b>" + env.toFixed(1) + "×</b>　·　对数期的繁殖速率 ≈ <b>" + (1.75 * env).toFixed(2) +
          "</b>（相对）　·　4 小时左右跑完迟缓期，数量已涨到初始的 <b>" + f.toFixed(2) +
          " 倍</b>　·　" + (env > 1.1 ? "环境很舒服：对数期又陡又快，稳定期提前，但稳定期一过衰亡也更猛。" :
            env < 0.9 ? "环境不太合适：迟缓期拉长，对数期变缓，整条曲线被压平。" :
                        "基准条件。注意稳定期不是“不再繁殖”，而是新生和死亡刚好抵消。");
      }
    }
    if (sE) sE.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }


  function lab_heat(lab) {
    var cv = $("canvas", lab);
    var sT = $('[data-ctrl="temp"]', lab);
    var sH = $('[data-ctrl="hold"]', lab);
    var out = $(".lab-readout", lab);
    var vT = sT ? sT.closest(".ctrl").querySelector(".v") : null;
    var vH = sH ? sH.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var PX0 = 96, PX1 = 744, PY0 = 316, PY1 = 100, TMAX = 1800, LOGMIN = 7;
    var TREF = 63, DREF = 360, ZVAL = 4.33;
    function dOf(T) { return DREF * Math.pow(10, -(T - TREF) / ZVAL); }
    function xOf(t) { return PX0 + t / TMAX * (PX1 - PX0); }
    function yOf(lg) { return PY0 - lg / LOGMIN * (PY0 - PY1); }
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var T = sT ? parseFloat(sT.value) : 63;
      var hold = sH ? parseFloat(sH.value) : 1800;
      var D = dOf(T);
      var lr = hold / D;
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var i, t, l, x, y;
      ctx.strokeStyle = "#EDF0F6"; ctx.lineWidth = 1;
      for (i = 0; i <= LOGMIN; i++) {
        y = yOf(i);
        ctx.beginPath(); ctx.moveTo(PX0, y); ctx.lineTo(PX1, y); ctx.stroke();
        ctx.fillStyle = "#B0BAC9"; ctx.font = "600 11px -apple-system, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(i === 0 ? "1" : "1e-" + i, PX0 - 8, y + 4);
        ctx.textAlign = "left";
      }
      ctx.strokeStyle = "#9AA7BE"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(PX0, PY0); ctx.lineTo(PX1, PY0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PX0, PY0); ctx.lineTo(PX0, PY1 - 12); ctx.stroke();
      ctx.fillStyle = "#B0BAC9"; ctx.font = "600 11px -apple-system, sans-serif";
      for (i = 0; i <= 4; i++) {
        var tv = TMAX * i / 4;
        ctx.textAlign = "center";
        ctx.fillText(tv === 0 ? "0" : (tv + "s"), xOf(tv), PY0 + 20);
      }
      ctx.textAlign = "left";

      ctx.strokeStyle = "#E03131"; ctx.lineWidth = 1.6; ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.moveTo(PX0, yOf(5)); ctx.lineTo(PX1, yOf(5)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#E03131"; ctx.font = "700 12px -apple-system, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("安全线：杀灭 5 个对数级", PX1 - 4, yOf(5) - 9);
      ctx.textAlign = "left";

      var CURVES = [
        { T: 63, c: "rgba(139,150,170,0.85)", dash: [5, 4], nm: "63℃（低温长时）" },
        { T: 72, c: "rgba(232,89,12,0.55)", dash: [5, 4], nm: "72℃（高温短时）" }
      ];
      for (i = 0; i < CURVES.length; i++) {
        var dd = dOf(CURVES[i].T);
        ctx.strokeStyle = CURVES[i].c; ctx.lineWidth = 1.8;
        ctx.setLineDash(CURVES[i].dash);
        ctx.beginPath();
        for (t = 0; t <= TMAX; t += 10) {
          l = t / dd;
          x = xOf(t); y = yOf(Math.min(LOGMIN, l));
          if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.strokeStyle = "#2F9E44"; ctx.lineWidth = 3.2;
      ctx.beginPath();
      for (t = 0; t <= TMAX; t += 6) {
        l = t / D;
        x = xOf(t); y = yOf(Math.min(LOGMIN, l));
        if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.strokeStyle = "#2F9E44"; ctx.lineWidth = 1.6; ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(xOf(hold), PY0); ctx.lineTo(xOf(hold), yOf(Math.min(LOGMIN, lr))); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#1B7A34";
      ctx.beginPath(); ctx.arc(xOf(hold), yOf(Math.min(LOGMIN, lr)), 7, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(xOf(hold), yOf(Math.min(LOGMIN, lr)), 7, 0, Math.PI * 2); ctx.stroke();

      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("存活微生物的比例（对数刻度）随时间下降", PX0 - 6, 36);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("绿实线＝当前温度 " + T + "℃　绿点＝现在的条件　灰虚线＝63℃　橙虚线＝72℃", PX0 - 6, 58);
      ctx.fillText("温度每升高约 4.3℃，同样的杀灭效果所需时间就缩短到 1/10。", PX0 - 6, 382);
      ctx.restore();

      if (vT) vT.textContent = T + "";
      if (vH) vH.textContent = hold + "";
      if (out) {
        var ok = lr >= 5;
        var dTxt = D >= 1 ? D.toFixed(0) + " s" : (D >= 0.01 ? D.toFixed(3) + " s" : D.toExponential(1) + " s");
        var lrTxt = lr > 12 ? "> 12" : lr.toFixed(1);
        out.innerHTML = "温度 <b>" + T + "℃</b>　·　保持 <b>" + hold + " s</b>　·　该温度下的 D 值 ≈ <b>" +
          dTxt + "</b>　·　杀灭 <b>" + lrTxt + " 个对数级</b>　·　存活约 <b>" +
          Math.pow(10, -Math.min(lr, 7)).toExponential(1) + "</b>　·　" +
          (ok ? "✅ 达到巴氏消毒标准（≥ 5 个对数级）：63℃/30 分钟与 72℃/15 秒是等效的两种做法。" :
                "还不够：需要把时间延长到约 <b>" + (5 * D >= 60 ? (5 * D / 60).toFixed(1) + " 分钟" : (5 * D).toFixed(0) + " 秒") + "</b>。");
      }
    }
    if (sT) sT.addEventListener("input", draw);
    if (sH) sH.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }


  function lab_spread(lab) {
    var cv = $("canvas", lab);
    var sB = $('[data-ctrl="bend"]', lab);
    var out = $(".lab-readout", lab);
    var vB = sB ? sB.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400, NX = 316, CY = 252;
    var dust = [], t0 = 0, i, u;
    for (i = 0; i < 30; i++) {
      u = Math.sin(i * 12.9898 + 3.3) * 43758.5453;
      dust.push({ x: 232 + (u - Math.floor(u)) * 400, s: (i % 7) / 7, r: 1.4 + (i % 3) * 0.6 });
    }
    function flaskPath(ctx) {
      ctx.beginPath();
      ctx.moveTo(NX - 9, CY);
      ctx.bezierCurveTo(NX - 26, CY + 16, NX - 116, CY + 40, NX - 116, CY + 88);
      ctx.bezierCurveTo(NX - 116, CY + 126, NX - 62, CY + 134, NX, CY + 134);
      ctx.bezierCurveTo(NX + 62, CY + 134, NX + 116, CY + 126, NX + 116, CY + 88);
      ctx.bezierCurveTo(NX + 116, CY + 40, NX + 26, CY + 16, NX + 9, CY);
    }
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      if (!t0) t0 = ts;
      var b = sB ? parseFloat(sB.value) : 0;
      var bend = b / 100;
      var r = 76 * bend, up = 110 - 20 * bend;
      var by = CY - up, hx = NX + r;
      var bad = bend < 0.55;
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var ph = ((ts - t0) / 2600) % 1;
      for (i = 0; i < dust.length; i++) {
        var dy = 16 + ((ph + dust[i].s) % 1) * 42;
        ctx.fillStyle = "rgba(120,132,152,0.62)";
        ctx.beginPath(); ctx.arc(dust[i].x, dy, dust[i].r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("空气里的灰尘与微生物", 40, 22);

      ctx.strokeStyle = "#9DB4D0"; ctx.lineWidth = 13;
      ctx.lineJoin = "round"; ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(NX, CY - 4);
      ctx.lineTo(NX, by);
      if (r > 2) {
        for (i = 1; i <= 40; i++) {
          var th = Math.PI - Math.PI * i / 40;
          ctx.lineTo(hx + Math.cos(th) * r, by - Math.sin(th) * r);
        }
      }
      ctx.stroke();
      ctx.strokeStyle = "#EAF2FB"; ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(NX, CY - 4);
      ctx.lineTo(NX, by);
      if (r > 2) {
        for (i = 1; i <= 40; i++) {
          var th2 = Math.PI - Math.PI * i / 40;
          ctx.lineTo(hx + Math.cos(th2) * r, by - Math.sin(th2) * r);
        }
      }
      ctx.stroke();

      flaskPath(ctx);
      ctx.save(); ctx.clip();
      var inside = bad;
      ctx.fillStyle = inside ? "rgba(150,168,86,0.62)" : "rgba(246,222,148,0.66)";
      ctx.fillRect(NX - 130, CY + 62, 260, 90);
      if (inside) {
        for (i = 0; i < 46; i++) {
          var ux = Math.sin(i * 7.77 + 1.1) * 9999;
          var uy = Math.sin(i * 3.31 + 2.2) * 9999;
          ux = ux - Math.floor(ux); uy = uy - Math.floor(uy);
          ctx.fillStyle = "rgba(84,104,32,0.75)";
          ctx.beginPath();
          ctx.arc(NX - 96 + ux * 192, CY + 74 + uy * 50, 2.1 + (i % 3) * 0.7, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.restore();
      ctx.strokeStyle = "#9DB4D0"; ctx.lineWidth = 3.4; ctx.stroke();

      if (bad) {
        ctx.strokeStyle = "#E03131"; ctx.lineWidth = 2.2; ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.moveTo(NX, 66); ctx.lineTo(NX, CY + 46); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#E03131";
        ctx.beginPath();
        ctx.moveTo(NX, CY + 58); ctx.lineTo(NX - 7, CY + 44); ctx.lineTo(NX + 7, CY + 44);
        ctx.closePath(); ctx.fill();
        ctx.font = "700 12.5px -apple-system, sans-serif";
        ctx.fillText("微生物直接落进肉汤", NX + 18, 188);
      } else {
        for (i = 0; i < 26; i++) {
          var tb = (i % 13) / 13;
          ctx.fillStyle = "rgba(120,132,152,0.88)";
          ctx.beginPath();
          ctx.arc(hx - 40 + tb * 80, by - r - 4 + (i % 4) * 2.4, 2.3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = "#5C6B82"; ctx.font = "700 12.5px -apple-system, sans-serif";
        ctx.fillText("灰尘全落在弯道外面，进不去", hx + 58, by - r + 18);
      }

      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("肉汤状态：", 620, 128);
      ctx.fillStyle = inside ? "#5E7018" : "#B8860B";
      ctx.font = "800 17px -apple-system, sans-serif";
      ctx.fillText(inside ? "浑浊、腐败" : "清澈、不腐", 620, 156);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText(inside ? "长满了微生物" : "放了几个月也没坏", 620, 178);
      ctx.fillText("瓶颈弯曲度 " + b + "%", 620, 96);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("空气始终可以自由进出瓶子——被拦住的只有灰尘。", 60, 382);
      ctx.restore();

      if (vB) vB.textContent = b + "";
      if (out) {
        out.innerHTML = "瓶颈弯曲度 <b>" + b + "%</b>　·　" +
          (bad ? "瓶颈还太直：空气中的微生物可以直接落进肉汤，肉汤很快就<b>浑浊腐败</b>。" :
                 "弯道足够深：灰尘落在弯道外面进不去，空气能自由进出、微生物却进不来，肉汤<b>几个月都不腐败</b>。") +
          "　·　这一弯证明了：腐败来自空气中的微生物，而不是肉汤自己“长出”生命——自然发生说就此站不住了。";
      }
    }
    if (sB) sB.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    requestAnimationFrame(function loop(ts) { draw(ts); requestAnimationFrame(loop); });
  }

  function initLabs() {
    $$(".lab").forEach(function (lab) {
      var kind = lab.getAttribute("data-lab");
      if (kind === "colony") lab_colony(lab);
      if (kind === "heat") lab_heat(lab);
      if (kind === "spread") lab_spread(lab);
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
