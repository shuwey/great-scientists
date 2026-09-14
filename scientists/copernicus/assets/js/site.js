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

  function closeModal(skipFocus) {
    if (!mask) return;
    mask.classList.remove("show");
    document.body.style.overflow = "";
    if (!skipFocus && lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener("click", function (e) {
    var t = e.target;

    /* 弹窗里的「了解更多」：术语多半指向它自己所属的那个详解页，
       而读者常常正停在那一页。此时浏览器对同址跳转"原地不动"，
       弹窗又仍盖在页面上、body 还锁着滚动 —— 合起来就是"点了没反应"。
       所以先关弹窗（撤掉遮挡、放开滚动），同页再手动滚到锚点。 */
    var go = t.closest ? t.closest(".modal-foot a.go") : null;
    if (go) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return; // 让"新标签打开"走原生
      var parts = go.href.split("#");
      closeModal(true);
      if (parts[0] === location.href.split("#")[0]) {
        e.preventDefault();
        var node = parts[1] ? document.getElementById(decodeURIComponent(parts[1])) : null;
        if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
        else window.scrollTo({ top: 0, behavior: "smooth" });
        try { history.replaceState(null, "", go.getAttribute("href")); } catch (err) {}
      }
      return;
    }

    var el = t.closest ? t.closest(".term, .chip, [data-term]") : null;
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


  function lab_solar(lab) {
    var cv = $("canvas", lab);
    var sS = $('[data-ctrl="speed"]', lab);
    var out = $(".lab-readout", lab);
    var vS = sS ? sS.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400, cx = 280, cy = 208;
    var PL = [
      ["水星", 54, 0.241, "#A08A7A", 0.4, "88 天"],
      ["金星", 82, 0.615, "#E0B04A", 1.7, "225 天"],
      ["地球", 110, 1.0, "#3B7DD8", 3.0, "365 天"],
      ["火星", 140, 1.881, "#C1553A", 4.2, "687 天"],
      ["木星", 184, 11.86, "#C89A6B", 5.4, "11.9 年"],
      ["土星", 226, 29.45, "#D9C08A", 0.8, "29.5 年"]
    ];
    var years = 0, t0 = 0;
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      if (!t0) t0 = ts;
      var dt = Math.min(0.05, (ts - t0) / 1000); t0 = ts;
      var sp = sS ? parseFloat(sS.value) : 1;
      years += dt * sp * 0.3;
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var i, p, a, x, y;
      ctx.strokeStyle = "#DCE2EC"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 5]);
      for (i = 0; i < PL.length; i++) {
        ctx.beginPath(); ctx.arc(cx, cy, PL[i][1], 0, Math.PI * 2); ctx.stroke();
      }
      ctx.setLineDash([]);

      ctx.fillStyle = "#F59F00";
      ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#5c6b82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("太阳", cx - 13, cy + 31);

      for (i = 0; i < PL.length; i++) {
        p = PL[i];
        a = p[4] + years / p[2] * Math.PI * 2;
        x = cx + p[1] * Math.cos(a); y = cy + p[1] * Math.sin(a);
        ctx.fillStyle = p[3];
        ctx.beginPath(); ctx.arc(x, y, i > 3 ? 7 : 5.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#5C6B82"; ctx.font = "600 12px -apple-system, sans-serif";
        ctx.fillText(p[0], x + 9, y + 4);
      }

      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("离太阳越远，绕一圈越久", 556, 74);
      ctx.strokeStyle = "#E4E8F0"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(556, 86); ctx.lineTo(796, 86); ctx.stroke();
      for (i = 0; i < PL.length; i++) {
        p = PL[i]; y = 118 + i * 42;
        ctx.fillStyle = p[3];
        ctx.beginPath(); ctx.arc(570, y, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#5C6B82"; ctx.font = "600 13px -apple-system, sans-serif";
        ctx.fillText(p[0], 588, y + 5);
        ctx.fillStyle = "#1B2530"; ctx.font = "700 13px -apple-system, sans-serif";
        ctx.textAlign = "right"; ctx.fillText(p[5], 796, y + 5); ctx.textAlign = "left";
      }
      ctx.fillStyle = "#5c6b82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("地球排第三，和别的行星一样在跑", 556, 380);
      ctx.restore();

      if (vS) vS.textContent = sp.toFixed(1) + "×";
      if (out) {
        out.innerHTML = "已经过去 <b>" + years.toFixed(2) + "</b> 年　·　地球转了 <b>" + Math.floor(years) +
          "</b> 圈，木星才转 <b>" + Math.floor(years / 11.86) + "</b> 圈　·　太阳在正中心，六颗行星各走各的圆";
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }


  function lab_retro(lab) {
    var cv = $("canvas", lab);
    var sS = $('[data-ctrl="speed"]', lab);
    var out = $(".lab-readout", lab);
    var vS = sS ? sS.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var ox = 200, oy = 200, RE = 60, RM = 91.44;
    var TSPAN = 2.6, N = 240;
    var SE = [], SM = [], ANG = [], BACK = [];
    (function buildSeries() {
      var i, t, ex, ey, mx, my, p, prev = null, unw = 0, d;
      for (i = 0; i <= N; i++) {
        t = i * TSPAN / N;
        ex = ox + RE * Math.cos(t * 2 * Math.PI);
        ey = oy + RE * Math.sin(t * 2 * Math.PI);
        mx = ox + RM * Math.cos(0.9 + t / 1.881 * 2 * Math.PI);
        my = oy + RM * Math.sin(0.9 + t / 1.881 * 2 * Math.PI);
        SE.push([ex, ey]); SM.push([mx, my]);
        p = Math.atan2(my - ey, mx - ex);
        if (prev === null) { BACK.push(false); } else {
          d = p - prev;
          while (d > Math.PI) d -= 2 * Math.PI;
          while (d < -Math.PI) d += 2 * Math.PI;
          unw += d;
          BACK.push(d < 0);
        }
        prev = p;
        ANG.push(unw);
      }
    })();
    var aMin = Math.min.apply(null, ANG), aMax = Math.max.apply(null, ANG);
    var CX0 = 452, CX1 = 792, CY0 = 344, CY1 = 66;
    function px(t) { return CX0 + t / TSPAN * (CX1 - CX0); }
    function py(a) { return CY0 - (a - aMin) / (aMax - aMin) * (CY0 - CY1); }
    var ph = 0, t0 = 0;
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      if (!t0) t0 = ts;
      var dt = Math.min(0.05, (ts - t0) / 1000); t0 = ts;
      var sp = sS ? parseFloat(sS.value) : 1;
      ph += dt * sp * 0.16;
      if (ph > 1) ph = 0;
      var idx = Math.max(1, Math.floor(ph * N));
      var years = ph * TSPAN;
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var i, E, M;
      ctx.strokeStyle = "#DCE2EC"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 5]);
      ctx.beginPath(); ctx.arc(ox, oy, RE, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(ox, oy, RM, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#F59F00";
      ctx.beginPath(); ctx.arc(ox, oy, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#5c6b82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("太阳", ox - 13, oy - 16);
      ctx.fillStyle = "#5c6b82";
      ctx.fillText("内圈快、外圈慢", 46, 68);
      ctx.fillStyle = "#1B2530"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("俯视：谁跑得快", 46, 46);

      E = SE[idx]; M = SM[idx];
      ctx.strokeStyle = "rgba(59,91,219,.45)"; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(E[0], E[1]); ctx.lineTo(M[0], M[1]); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#3B7DD8";
      ctx.beginPath(); ctx.arc(E[0], E[1], 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#C1553A";
      ctx.beginPath(); ctx.arc(M[0], M[1], 7, 0, Math.PI * 2); ctx.fill();
      ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillStyle = "#3B7DD8"; ctx.fillText("地球", E[0] + 10, E[1] + 16);
      ctx.fillStyle = "#C1553A"; ctx.fillText("火星", M[0] + 11, M[1] + 4);

      ctx.strokeStyle = "#E4E8F0"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(CX0, CY0); ctx.lineTo(CX1, CY0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(CX0, CY0); ctx.lineTo(CX0, CY1); ctx.stroke();
      ctx.fillStyle = "#1B2530"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("火星在天上的位置", CX0, 46);
      ctx.fillStyle = "#5c6b82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("时间 →", CX1 - 46, CY0 + 20);
      ctx.fillText("线越陡＝火星跑得越快；线往下走＝倒退", CX0, CY0 + 38);

      for (i = 1; i <= idx; i++) {
        if (!BACK[i] || BACK[i - 1]) continue;
        var runEnd = i;
        while (runEnd < idx && BACK[runEnd + 1]) runEnd++;
        if (runEnd - i < 2) continue;
        ctx.fillStyle = "rgba(224,49,49,.09)";
        ctx.fillRect(px((i - 1) * TSPAN / N), CY1, px(runEnd * TSPAN / N) - px((i - 1) * TSPAN / N), CY0 - CY1);
        ctx.fillStyle = "#E03131"; ctx.font = "700 12px -apple-system, sans-serif";
        ctx.fillText("逆行", px((i - 1) * TSPAN / N) - 8, CY1 - 8);
      }

      for (i = 1; i <= idx; i++) {
        ctx.strokeStyle = BACK[i] ? "#E03131" : "#3B5BDB";
        ctx.lineWidth = BACK[i] ? 3.4 : 2.6;
        ctx.beginPath();
        ctx.moveTo(px(i * TSPAN / N - TSPAN / N), py(ANG[i - 1]));
        ctx.lineTo(px(i * TSPAN / N), py(ANG[i]));
        ctx.stroke();
      }
      ctx.strokeStyle = "#1B2530"; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(px(years), CY1); ctx.lineTo(px(years), CY0); ctx.stroke();
      ctx.setLineDash([]);
      var cur = SM[idx], ce = SE[idx];
      var dirx = cur[0] - ce[0], diry = cur[1] - ce[1];
      var ln = Math.sqrt(dirx * dirx + diry * diry) || 1;
      ctx.strokeStyle = "rgba(224,49,49,.55)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(px(years), py(ANG[idx]));
      ctx.lineTo(px(years) + dirx / ln * 34, py(ANG[idx]) - diry / ln * 34); ctx.stroke();
      ctx.fillStyle = "#FFF"; ctx.strokeStyle = "#1B2530"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(px(years), py(ANG[idx]), 5, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.restore();

      if (vS) vS.textContent = sp.toFixed(1) + "×";
      if (out) {
        out.innerHTML = "已经过去 <b>" + years.toFixed(2) + "</b> 年（火星约 2.1 年一个来回）　·　地球转了 <b>" +
          Math.floor(years) + "</b> 圈，火星转了 <b>" + (years / 1.881).toFixed(2) +
          "</b> 圈　·　图上<span style='color:#E03131;font-weight:800'>红色</span>那一段就是逆行";
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }


  function lab_parallax(lab) {
    var cv = $("canvas", lab);
    var sD = $('[data-ctrl="dist"]', lab);
    var out = $(".lab-readout", lab);
    var vD = sD ? sD.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 380;
    var sunX = 200, sunY = 205, RE = 70;
    var e1x = sunX - RE, e2x = sunX + RE;
    var starY = 150, curtX = 760, curtTop = 46, curtBot = 348;
    var STARS = [[0.18, 0.14], [0.52, 0.2], [0.84, 0.1], [0.3, 0.55], [0.7, 0.62],
                 [0.12, 0.83], [0.46, 0.9], [0.9, 0.78], [0.6, 0.42], [0.36, 0.34]];
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var d = sD ? parseFloat(sD.value) : 20;
      var starX = 420 + 5.6 * d;
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var i, sp, y1, y2;
      ctx.fillStyle = "#EDEFF4";
      ctx.fillRect(curtX, curtTop, 26, curtBot - curtTop);
      ctx.fillStyle = "#C7D0DE";
      for (i = 0; i < STARS.length; i++) {
        sp = STARS[i];
        ctx.beginPath();
        ctx.arc(curtX + 4 + sp[0] * 18, curtTop + sp[1] * (curtBot - curtTop), 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#5c6b82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("背景恒星", curtX - 12, curtTop - 12);

      ctx.strokeStyle = "#DCE2EC"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 5]);
      ctx.beginPath(); ctx.arc(sunX, sunY, RE, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#F59F00";
      ctx.beginPath(); ctx.arc(sunX, sunY, 11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#5c6b82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("太阳", sunX - 13, sunY + 26);

      ctx.strokeStyle = "#9AA7BE"; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(e1x, sunY); ctx.lineTo(e2x, sunY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#5c6b82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("基线：2 天文单位（地球走半年）", 62, sunY + 40);

      y1 = starY + (curtX - starX) * (starY - sunY) / (starX - e1x);
      y2 = starY + (curtX - starX) * (starY - sunY) / (starX - e2x);
      ctx.strokeStyle = "rgba(59,91,219,.75)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(e1x, sunY); ctx.lineTo(curtX, y1); ctx.stroke();
      ctx.strokeStyle = "rgba(12,166,120,.85)";
      ctx.beginPath(); ctx.moveTo(e2x, sunY); ctx.lineTo(curtX, y2); ctx.stroke();

      ctx.fillStyle = "#3B7DD8";
      ctx.beginPath(); ctx.arc(e1x, sunY, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#0CA678";
      ctx.beginPath(); ctx.arc(e2x, sunY, 7, 0, Math.PI * 2); ctx.fill();
      ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillStyle = "#3B7DD8"; ctx.fillText("1 月", e1x - 34, sunY + 5);
      ctx.fillStyle = "#0CA678"; ctx.fillText("7 月", e2x - 14, sunY + 26);

      ctx.fillStyle = "#F59F00";
      ctx.beginPath(); ctx.arc(starX, starY, 8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(245,159,0,.35)"; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(starX, starY, 12, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "#5c6b82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("恒星", starX - 13, starY - 20);

      ctx.fillStyle = "#3B7DD8";
      ctx.beginPath(); ctx.arc(curtX + 13, y1, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#0CA678";
      ctx.beginPath(); ctx.arc(curtX + 13, y2, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#E03131"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(curtX + 40, y1); ctx.lineTo(curtX + 40, y2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(curtX + 35, y1 + 4); ctx.lineTo(curtX + 40, y1); ctx.lineTo(curtX + 45, y1 + 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(curtX + 35, y2 - 4); ctx.lineTo(curtX + 40, y2); ctx.lineTo(curtX + 45, y2 - 4); ctx.stroke();
      ctx.fillStyle = "#E03131"; ctx.font = "700 12px -apple-system, sans-serif";
      ctx.fillText("摆动幅度", curtX - 66, (y1 + y2) / 2 + 4);

      ctx.fillStyle = "#1B2530"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("地球半年走出一条基线", 46, 46);

      ctx.restore();

      var theta = 1 / d;
      var ly = d * 3.26;
      if (vD) vD.textContent = d.toFixed(0);
      if (out) {
        out.innerHTML = "恒星距离 = <b>" + d.toFixed(0) + "</b> 秒差距（≈ " + ly.toFixed(0) +
          " 光年）　·　视差角 θ ≈ 1/" + d.toFixed(0) + " = <b>" + theta.toFixed(3) +
          "</b> 角秒　·　" + (theta < 0.1
            ? "<span style='color:#E03131;font-weight:800'>已小到 0.1 角秒以下，早年的仪器根本分辨不出</span>"
            : "距离再翻一倍，摆幅还要减半");
      }
    }
    if (sD) sD.addEventListener("input", draw);
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
        if (kind === "solar") lab_solar(lab);
        if (kind === "retro") lab_retro(lab);
        if (kind === "parallax") lab_parallax(lab);
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
