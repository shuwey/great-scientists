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


  function lab_areal(lab) {
    var cv = $("canvas", lab);
    var sS = $('[data-ctrl="speed"]', lab);
    var out = $(".lab-readout", lab);
    var vS = sS ? sS.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var sunX = 420, sunY = 200, A = 165, ECC = 0.6;
    var B = A * Math.sqrt(1 - ECC * ECC), CC = A * ECC, cxE = sunX - CC;
    var NSEC = 12, ES = [];
    (function solveAll() {
      var k, E, M, d, it;
      for (k = 0; k <= NSEC; k++) {
        M = Math.PI * 2 * k / NSEC;
        E = M;
        for (it = 0; it < 60; it++) {
          d = (E - ECC * Math.sin(E) - M) / (1 - ECC * Math.cos(E));
          E -= d;
          if (Math.abs(d) < 1e-10) break;
        }
        ES.push(E);
      }
    })();
    function pt(E) { return [cxE + A * Math.cos(E), sunY - B * Math.sin(E)]; }
    function arcTo(ctx, E1, E2) {
      var n = 26, i, E, p;
      for (i = 0; i <= n; i++) {
        E = E1 + (E2 - E1) * i / n;
        p = pt(E);
        if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
      }
    }
    function solveE(M) {
      var E = M, d, it;
      for (it = 0; it < 60; it++) {
        d = (E - ECC * Math.sin(E) - M) / (1 - ECC * Math.cos(E));
        E -= d;
        if (Math.abs(d) < 1e-10) break;
      }
      return E;
    }
    var t0 = 0, Mnow = 0;
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      if (!t0) t0 = ts;
      var dt = Math.min(0.05, (ts - t0) / 1000); t0 = ts;
      var sp = sS ? parseFloat(sS.value) : 1;
      Mnow += dt * sp * 0.42;
      if (Mnow > Math.PI * 2) Mnow -= Math.PI * 2;
      var idxNow = Math.floor(Mnow / (Math.PI * 2) * NSEC);

      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var i;
      for (i = 0; i < NSEC; i++) {
        ctx.beginPath();
        ctx.moveTo(sunX, sunY);
        arcTo(ctx, ES[i], ES[i + 1]);
        ctx.lineTo(sunX, sunY);
        ctx.closePath();
        ctx.fillStyle = (i === idxNow) ? "rgba(245,159,0,.30)"
          : (i % 2 ? "rgba(59,91,219,.14)" : "rgba(12,166,120,.13)");
        ctx.fill();
      }
      ctx.strokeStyle = "#8B96AA"; ctx.lineWidth = 1.8;
      ctx.beginPath(); arcTo(ctx, 0, Math.PI * 2); ctx.stroke();

      var Enow = solveE(Mnow), P = pt(Enow);
      ctx.fillStyle = "#F59F00";
      ctx.beginPath(); ctx.arc(sunX, sunY, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#5c6b82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("太阳", sunX - 13, sunY + 30);

      ctx.strokeStyle = "rgba(27,37,48,.55)"; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(sunX, sunY); ctx.lineTo(P[0], P[1]); ctx.stroke();
      ctx.fillStyle = "#3B5BDB";
      ctx.beginPath(); ctx.arc(P[0], P[1], 7, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = "#C1553A"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("近日点", pt(0)[0] - 34, pt(0)[1] - 18);
      ctx.fillStyle = "#3B7DD8";
      ctx.fillText("远日点", pt(Math.PI)[0] - 8, pt(Math.PI)[1] - 12);

      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("相同的时间，相同的面积", 566, 88);
      ctx.strokeStyle = "#E4E8F0"; ctx.beginPath(); ctx.moveTo(566, 100); ctx.lineTo(796, 100); ctx.stroke();
      ctx.fillStyle = "rgba(59,91,219,.35)";
      ctx.fillRect(566, 122, 26, 18); ctx.strokeStyle = "#3B5BDB"; ctx.lineWidth = 1; ctx.strokeRect(566, 122, 26, 18);
      ctx.fillStyle = "#5C6B82"; ctx.font = "600 13px -apple-system, sans-serif";
      ctx.fillText("12 个扇形，每块面积相同", 604, 136);
      ctx.fillStyle = "rgba(245,159,0,.5)";
      ctx.fillRect(566, 158, 26, 18); ctx.strokeStyle = "#F59F00"; ctx.strokeRect(566, 158, 26, 18);
      ctx.fillStyle = "#5C6B82";
      ctx.fillText("当前正在扫过的那一块", 604, 172);
      ctx.fillStyle = "#1B2530"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("近日点：跑得快", 566, 226);
      ctx.fillStyle = "#5C6B82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("又短又胖的一段，几周就走完", 566, 248);
      ctx.fillStyle = "#1B2530"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("远日点：跑得慢", 566, 286);
      ctx.fillStyle = "#5C6B82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("又长又瘦的一段，要磨很久", 566, 308);
      ctx.fillStyle = "#5c6b82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("12 块面积加起来，就是整条轨道", 566, 352);
      ctx.restore();

      if (vS) vS.textContent = sp.toFixed(1) + "×";
      if (out) {
        out.innerHTML = "行星正走在第 <b>" + (idxNow + 1) + "</b> / 12 块扇形里　·　每块用的时间一样、面积也一样　·　" +
          (idxNow === 0 ? "现在贴近近日点，走得最快" : (idxNow === 6 ? "现在到了远日点，走得最慢" : "连线扫过的面积始终相等"));
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }


  function lab_third(lab) {
    var cv = $("canvas", lab);
    var sN = $('[data-ctrl="power"]', lab);
    var out = $(".lab-readout", lab);
    var vN = sN ? sN.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var PL = [
      ["水星", 0.387, 0.2408], ["金星", 0.723, 0.6152], ["地球", 1.0, 1.0], ["火星", 1.524, 1.8808],
      ["木星", 5.203, 11.862], ["土星", 9.537, 29.457], ["天王星", 19.19, 84.02], ["海王星", 30.07, 164.79]
    ];
    var PX0 = 96, PX1 = 500, PY0 = 340, PY1 = 62;
    var XL = -0.55, XR = 1.62, YB = -0.86, YT = 2.42;
    function lx(v) { return PX0 + (v - XL) / (XR - XL) * (PX1 - PX0); }
    function ly(v) { return PY0 - (v - YB) / (YT - YB) * (PY0 - PY1); }
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var n = sN ? parseFloat(sN.value) : 1;
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var i, j, la, lt, on = 0;
      ctx.strokeStyle = "#EDF0F6"; ctx.lineWidth = 1;
      var vgrid = [0.3, 0.5, 1, 2, 3, 5, 10, 20, 30];
      for (j = 0; j < vgrid.length; j++) {
        ctx.beginPath(); ctx.moveTo(lx(Math.log(vgrid[j]) / Math.LN10), PY1);
        ctx.lineTo(lx(Math.log(vgrid[j]) / Math.LN10), PY0); ctx.stroke();
      }
      var hgrid = [0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200];
      for (j = 0; j < hgrid.length; j++) {
        ctx.beginPath(); ctx.moveTo(PX0, ly(Math.log(hgrid[j]) / Math.LN10));
        ctx.lineTo(PX1, ly(Math.log(hgrid[j]) / Math.LN10)); ctx.stroke();
      }
      ctx.strokeStyle = "#9AA7BE"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(PX0, PY0); ctx.lineTo(PX1, PY0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PX0, PY0); ctx.lineTo(PX0, PY1); ctx.stroke();

      ctx.strokeStyle = "#E03131"; ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(lx(XL), ly(Math.max(YB, Math.min(YT, n * XL))));
      ctx.lineTo(lx(XR), ly(Math.max(YB, Math.min(YT, n * XR))));
      ctx.stroke();

      ctx.font = "600 12px -apple-system, sans-serif";
      for (i = 0; i < PL.length; i++) {
        la = Math.log(PL[i][1]) / Math.LN10;
        lt = Math.log(PL[i][2]) / Math.LN10;
        var dy = lt - n * la;
        var good = Math.abs(dy) < 0.03;
        if (good) on++;
        ctx.strokeStyle = good ? "rgba(12,166,120,.5)" : "rgba(224,49,49,.45)";
        ctx.lineWidth = good ? 2 : 1.6;
        ctx.setLineDash(good ? [] : [3, 3]);
        ctx.beginPath(); ctx.moveTo(lx(la), ly(lt)); ctx.lineTo(lx(la), ly(n * la)); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = good ? "#0CA678" : "#3B5BDB";
        ctx.beginPath(); ctx.arc(lx(la), ly(lt), 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#5C6B82";
        ctx.fillText(PL[i][0], lx(la) + 9, ly(lt) + 4);
      }

      ctx.fillStyle = "#5c6b82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("轨道半长轴 a（天文单位，对数轴）", PX0 + 60, PY0 + 26);
      ctx.fillText("公转周期 T（年，对数轴）", PX0 - 6, PY1 - 16);

      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText(Math.abs(n - 1.5) < 0.005 ? "T² = a³" : "T = a^" + n.toFixed(2), 560, 88);
      ctx.strokeStyle = "#E4E8F0"; ctx.beginPath(); ctx.moveTo(560, 100); ctx.lineTo(796, 100); ctx.stroke();
      ctx.fillStyle = on === PL.length ? "#087F5B" : "#E03131";
      ctx.font = "800 15px -apple-system, sans-serif";
      ctx.fillText(on + " / " + PL.length + " 颗落在直线上", 560, 130);
      ctx.fillStyle = "#5C6B82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("红虚线＝离直线还有多远", 560, 156);
      ctx.fillStyle = "#1B2530"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("拖动滑块找那条直线", 560, 200);
      ctx.fillStyle = "#5C6B82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("从水星到海王星，a 差了 78 倍、", 560, 226);
      ctx.fillText("T 差了 684 倍，可它们偏偏落在", 560, 246);
      ctx.fillText("同一条直线上——斜率就是 1.5。", 560, 266);
      ctx.fillStyle = "#5c6b82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("对数坐标：直线＝幂律关系", 560, 306);
      ctx.restore();

      if (vN) vN.textContent = n.toFixed(2);
      if (out) {
        out.innerHTML = "周期指数 n = <b>" + n.toFixed(2) + "</b>　·　8 颗行星里有 <b>" + on +
          "</b> 颗落在直线上　·　" + (on === PL.length
            ? "<span style='color:#087F5B;font-weight:800'>全部对齐：T² ∝ a³</span>"
            : "继续拧，让所有点都贴到那条线上");
      }
    }
    if (sN) sN.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }

  function lab_ellipse(lab) {
  var P = {"center": "日", "centerColor": "#E8590C", "label": "行星沿椭圆绕日：太阳在一个焦点上", "bodyName": "行", "bodyColor": "#3B5BDB", "a": 175};

  var cv=$("canvas",lab); var sE=$('[data-ctrl="ecc"]',lab);
  var out=$(".lab-readout",lab); var vSpan=sE?sE.closest(".ctrl").querySelector(".v"):null;
  var W=820,H=360,last=0,E=0;
  function draw(ts){
    if(!last)last=ts; var dt=Math.min(0.05,(ts-last)/1000); last=ts;
    var e=sE?parseFloat(sE.value):0.4, e=Math.max(0,Math.min(0.8,e));
    var cx=W/2, cy=H/2, a=P.a||170, b=a*Math.sqrt(1-e*e), c=a*e;
    E+=dt*(0.6+0.6*(1-e)); // 基础转速，离心率越大越慢一点点（仅观感）
    var px=cx+a*Math.cos(E), py=cy+b*Math.sin(E);     // 行星位置
    var sx=cx+c, sy=cy;                                // 太阳（右焦点）
    var S=setupCanvas(cv,H/W); var ctx=S.ctx,k=S.w/W;
    ctx.save(); ctx.scale(k,k); ctx.clearRect(0,0,W,H); ctx.fillStyle="#FBFCFE"; ctx.fillRect(0,0,W,H);
    // 椭圆轨道
    ctx.strokeStyle="#C9D3E0"; ctx.lineWidth=2; ctx.beginPath(); ctx.ellipse(cx,cy,a,b,0,0,Math.PI*2); ctx.stroke();
    // 太阳（焦点）
    ctx.fillStyle=P.centerColor; ctx.beginPath(); ctx.arc(sx,sy,22,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#fff"; ctx.font="800 15px -apple-system,sans-serif"; ctx.textAlign="center"; ctx.fillText(P.center,sx,sy+5);
    // 行星
    var r=10; ctx.fillStyle=P.bodyColor; ctx.beginPath(); ctx.arc(px,py,r,0,Math.PI*2); ctx.fill();
    // 焦点连线（速度提示）
    ctx.strokeStyle="rgba(232,89,12,.35)"; ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(px,py); ctx.stroke();
    // 另一个焦点
    ctx.fillStyle="#9AA7BC"; ctx.beginPath(); ctx.arc(cx-c,cy,3,0,Math.PI*2); ctx.fill();
    ctx.textAlign="left"; ctx.fillStyle="#5C6B82"; ctx.font="600 13px -apple-system,sans-serif"; ctx.fillText(P.label,24,30);
    ctx.fillStyle="#1B2530"; ctx.font="800 16px -apple-system,sans-serif";
    ctx.fillText("离心率 e = "+e.toFixed(2)+"：轨道越扁，近/远日点速度差越大",24,54);
    ctx.restore();
    if(vSpan)vSpan.textContent=e.toFixed(2);
    if(out)out.innerHTML="离心率 e = <b>"+e.toFixed(2)+"</b>：太阳坐在椭圆的一个焦点上（不是中心）。行星靠近太阳时跑得快、远离时慢——这就是开普勒第二定律。";
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);

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
        if (kind === "ellipse") lab_ellipse(lab);
        if (kind === "areal") lab_areal(lab);
        if (kind === "third") lab_third(lab);
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
