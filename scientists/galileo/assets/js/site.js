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

    /* ---- 7.1 斜面滚球（伽利略） ---- */
  function labIncline(lab) {
    var cv = $("canvas", lab);
    var sAngle = $('[data-ctrl="angle"]', lab);
    var out = $(".lab-readout", lab);
    var vSpan = sAngle ? sAngle.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 360;
    var g = 9.8;
    var t = 0, last = 0, rolling = true, resetAt = 0;

    function geom(deg) {
      var th = deg * Math.PI / 180;
      var x0 = 120, y0 = 90, len = 560;
      return { x0: x0, y0: y0, x1: x0 + Math.cos(th) * len, y1: y0 + Math.sin(th) * len, len: len };
    }

    function draw(ts) {
      if (!last) last = ts;
      var dt = Math.min(0.05, (ts - last) / 1000); last = ts;
      var deg = sAngle ? parseFloat(sAngle.value) : 30;
      var G = geom(deg);
      var a = g * Math.sin(deg * Math.PI / 180);
      var maxS = (G.len * 2.2) / 100;     // 像素映射到“米”的尺度，使球能到底
      if (ts > resetAt) { t += dt; }
      var s = 0.5 * a * t * t;
      if (rolling) {
        if (s >= maxS) { s = maxS; rolling = false; resetAt = ts + 1300; }
      } else if (ts > resetAt) { t = 0; rolling = true; }
      var frac = Math.min(1, s / maxS);

      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = "#C9D3E0"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(40, G.y1 + 8); ctx.lineTo(780, G.y1 + 8); ctx.stroke();

      ctx.strokeStyle = "#3B5BDB"; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(G.x0, G.y0); ctx.lineTo(G.x1, G.y1); ctx.stroke();

      // t=1,2,3 秒的刻度（s ∝ t²）
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      [1, 2, 3].forEach(function (tt) {
        var ss = 0.5 * a * tt * tt;
        if (ss > maxS) return;
        var f = ss / maxS;
        var px = G.x0 + (G.x1 - G.x0) * f, py = G.y0 + (G.y1 - G.y0) * f;
        ctx.strokeStyle = "#E8590C"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(px, py - 9); ctx.lineTo(px, py + 9); ctx.stroke();
        ctx.fillText("t=" + tt + "s", px - 14, py - 15);
      });

      var bx = G.x0 + (G.x1 - G.x0) * frac, by = G.y0 + (G.y1 - G.y0) * frac;
      ctx.fillStyle = "#F59F00";
      ctx.beginPath(); ctx.arc(bx, by, 11, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = "#8B96AA"; ctx.font = "600 13px -apple-system, sans-serif";
      ctx.fillText("小球沿斜面滚下：倾角越大加速度越大；走过的距离 s 与时间平方 t² 成正比", 24, 30);
      ctx.fillStyle = "#1B2530"; ctx.font = "800 20px -apple-system, sans-serif";
      ctx.fillText("a = g·sin" + deg.toFixed(0) + "° = " + a.toFixed(1) + " m/s²", 24, 56);
      ctx.restore();

      if (vSpan) vSpan.textContent = deg.toFixed(0) + "°";
      if (out) {
        out.innerHTML = "倾角 " + deg.toFixed(0) + "°　·　加速度 a = g·sinθ = <b>" + a.toFixed(2) + "</b> m/s²" +
          "　·　已滚 " + t.toFixed(2) + " s　·　s = ½·a·t²（每多等 1 秒，这 1 秒走的比上 1 秒更" + "远——这正是 s ∝ t²）";
      }
      requestAnimationFrame(draw);
    }
    if (sAngle) sAngle.addEventListener("input", function () { t = 0; rolling = true; });
    requestAnimationFrame(draw);
  }

  /* ---- 7.2 望远镜看木星卫星（伽利略） ---- */
  function labTelescope(lab) {
    var cv = $("canvas", lab);
    var sSpeed = $('[data-ctrl="speed"]', lab);
    var out = $(".lab-readout", lab);
    var vSpan = sSpeed ? sSpeed.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 360;
    var moons = [
      { name: "伊奥",    r: 70,  period: 1.77, color: "#E8A33D" },
      { name: "欧罗巴",  r: 110, period: 3.55, color: "#D7DCE5" },
      { name: "盖尼米德", r: 158, period: 7.15, color: "#C9A06B" },
      { name: "卡利斯托", r: 210, period: 16.7, color: "#8B96AA" }
    ];
    var day = 0, last = 0;

    function draw(ts) {
      if (!last) last = ts;
      var dt = Math.min(0.05, (ts - last) / 1000); last = ts;
      var sp = sSpeed ? parseFloat(sSpeed.value) : 1;
      day += dt * sp * 0.8;
      if (day > 16.7) day -= 16.7;

      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#0B1020"; ctx.fillRect(0, 0, W, H);

      var cx = W / 2, cy = H / 2;
      moons.forEach(function (m) {
        ctx.strokeStyle = "rgba(255,255,255,.16)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(cx, cy, m.r, 0, Math.PI * 2); ctx.stroke();
      });
      var grad = ctx.createLinearGradient(cx - 30, cy - 30, cx + 30, cy + 30);
      grad.addColorStop(0, "#F3D9A6"); grad.addColorStop(1, "#C98A3C");
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(120,70,20,.5)"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, cy, 30, -0.4, 0.4); ctx.stroke();

      moons.forEach(function (m) {
        var ang = (day / m.period) * Math.PI * 2;
        var mx = cx + Math.cos(ang) * m.r;
        var my = cy + Math.sin(ang) * m.r * 0.5;
        ctx.fillStyle = m.color;
        ctx.beginPath(); ctx.arc(mx, my, 6, 0, Math.PI * 2); ctx.fill();
      });

      ctx.fillStyle = "#fff"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("木星与它的四颗卫星（伽利略卫星）", 24, 30);
      ctx.fillStyle = "#C9D3E0"; ctx.font = "600 13px -apple-system, sans-serif";
      ctx.fillText("拖动“动画速度”看卫星绕转；1610 年伽利略正是凭此证明：并非所有天体都绕地球转", 24, 52);
      ctx.restore();

      if (vSpan) vSpan.textContent = sp.toFixed(1) + "×";
      if (out) {
        out.innerHTML = "时间 ≈ <b>" + day.toFixed(1) + "</b> 天　·　伊奥约 1.8 天一圈、卡利斯托约 16.7 天一圈" +
          "　·　卫星明显围着木星转 → 地球并非宇宙唯一中心";
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  /* ---- 7.3 单摆：周期只与摆长有关（伽利略） ---- */
  function labPendulum(lab) {
    var cv = $("canvas", lab);
    var sLen = $('[data-ctrl="length"]', lab);
    var sMass = $('[data-ctrl="mass"]', lab);
    var out = $(".lab-readout", lab);
    var lenSpan = sLen ? sLen.closest(".ctrl").querySelector(".v") : null;
    var massSpan = sMass ? sMass.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 360;
    var g = 9.8, pivotX = W / 2, pivotY = 70, amp = 0.5, t = 0, last = 0;

    function draw(ts) {
      if (!last) last = ts;
      var dt = Math.min(0.05, (ts - last) / 1000); last = ts;
      var L = sLen ? parseFloat(sLen.value) : 1.0;
      var m = sMass ? parseFloat(sMass.value) : 1.0;
      var T = 2 * Math.PI * Math.sqrt(L / g);
      t += dt;
      var ang = amp * Math.cos(2 * Math.PI * t / T);
      var pixL = 40 + L * 150;
      var bx = pivotX + Math.sin(ang) * pixL;
      var by = pivotY + Math.cos(ang) * pixL;

      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = "#C9D3E0"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(pivotX - 60, pivotY); ctx.lineTo(pivotX + 60, pivotY); ctx.stroke();
      ctx.strokeStyle = "#5C6B82"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(pivotX, pivotY); ctx.lineTo(bx, by); ctx.stroke();
      var r = 12 + m * 6;
      var grd = ctx.createRadialGradient(bx - r * 0.3, by - r * 0.3, 2, bx, by, r);
      grd.addColorStop(0, "#FFD8A8"); grd.addColorStop(1, "#E8590C");
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#3B5BDB";
      ctx.beginPath(); ctx.arc(pivotX, pivotY, 5, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = "#8B96AA"; ctx.font = "600 13px -apple-system, sans-serif";
      ctx.fillText("单摆：摆长越长摆动越慢；换大换小摆球（质量）不改变节奏", 24, 30);
      ctx.fillStyle = "#1B2530"; ctx.font = "800 20px -apple-system, sans-serif";
      ctx.fillText("T = 2π√(L/g) ≈ " + T.toFixed(2) + " s", 24, 56);
      ctx.restore();

      if (lenSpan) lenSpan.textContent = L.toFixed(2) + " m";
      if (massSpan) massSpan.textContent = m.toFixed(1) + "×";
      if (out) {
        out.innerHTML = "摆长 L = <b>" + L.toFixed(2) + "</b> m　·　周期 T ≈ <b>" + T.toFixed(2) + "</b> s" +
          "　·　质量 = " + m.toFixed(1) + "× 时周期不变（球变大变小，快慢不变）" +
          "　·　摆长变 4 倍，周期只变 2 倍（√ 关系）";
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

function initLabs() {
    $$(".lab").forEach(function (lab) {
      var kind = lab.getAttribute("data-lab");
      if (kind === "incline") labIncline(lab);
      else if (kind === "telescope") labTelescope(lab);
      else if (kind === "pendulum") labPendulum(lab);
    });
  }

  /* ------------------------------------------------------------------ */
  /* 8. 词典页                                                            */
  /* ------------------------------------------------------------------ */
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
