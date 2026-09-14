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

  /* ---- 7.1 棱镜色散 ---- */
  function labPrism(lab) {
    var cv = $("canvas", lab);
    var sAngle = $('[data-ctrl="angle"]', lab);
    var sDisp = $('[data-ctrl="dispersion"]', lab);
    var out = $(".lab-readout", lab);
    var W = 820, H = 360;                 // 逻辑坐标系

    var COLORS = ["#E03131", "#F76707", "#FAB005", "#51CF66", "#3B5BDB", "#5F3DC4", "#9C36B5"];
    var NAMES = ["红", "橙", "黄", "绿", "蓝", "靛", "紫"];

    // 等边三角形顶点
    var TOP = { x: 400, y: 78 }, L = { x: 288, y: 272 }, R = { x: 512, y: 272 };
    var EDGES = [[TOP, L], [TOP, R], [L, R]];

    function rot(v, a) {
      var c = Math.cos(a), s = Math.sin(a);
      return { x: v.x * c - v.y * s, y: v.x * s + v.y * c };
    }
    function rayHit(o, d, a, b) {
      // 射线 o+t*d 与线段 a-b 求交，返回 t（>0 最小）
      var e = { x: b.x - a.x, y: b.y - a.y };
      var den = d.x * e.y - d.y * e.x;
      if (Math.abs(den) < 1e-9) return null;
      var f = { x: a.x - o.x, y: a.y - o.y };
      var t = (f.x * e.y - f.y * e.x) / den;
      var u = (f.x * d.y - f.y * d.x) / den;
      if (t > 1e-6 && u >= -1e-6 && u <= 1 + 1e-6) return t;
      return null;
    }

    function refract(d, N, eta) {
      // N 为指向入射侧的单位法线（N·d < 0）
      var c = -(N.x * d.x + N.y * d.y);
      var k = 1 - eta * eta * (1 - c * c);
      if (k < 0) return null;             // 全反射
      var s = eta * c - Math.sqrt(k);
      return { x: eta * d.x + s * N.x, y: eta * d.y + s * N.y };
    }

    function draw() {
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx;
      var k = S.w / W;
      ctx.save();
      ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);

      // 背景
      ctx.fillStyle = "#FBFCFE";
      ctx.fillRect(0, 0, W, H);

      var angDeg = sAngle ? parseFloat(sAngle.value) : 0;
      var spread = sDisp ? parseFloat(sDisp.value) : 1;   // 0~2，色散强度

      // 棱镜
      ctx.beginPath();
      ctx.moveTo(TOP.x, TOP.y); ctx.lineTo(R.x, R.y); ctx.lineTo(L.x, L.y); ctx.closePath();
      var grd = ctx.createLinearGradient(L.x, TOP.y, R.x, R.y);
      grd.addColorStop(0, "rgba(150,190,255,.42)");
      grd.addColorStop(1, "rgba(190,215,255,.30)");
      ctx.fillStyle = grd; ctx.fill();
      ctx.strokeStyle = "#94A9D6"; ctx.lineWidth = 2; ctx.stroke();

      // 入射点：左侧面上部 55% 处
      var M = { x: TOP.x + (L.x - TOP.x) * 0.5, y: TOP.y + (L.y - TOP.y) * 0.5 };

      // 入射面单位法线（朝外，左上）
      var ex = L.x - TOP.x, ey = L.y - TOP.y;
      var el = Math.hypot(ex, ey);
      var nOut = { x: ey / el, y: -ex / el };      // (ex,ey) 的法线
      if (nOut.x > 0) { nOut.x = -nOut.x; nOut.y = -nOut.y; }  // 保证朝左上
      var nIn = { x: -nOut.x, y: -nOut.y };

      var a = angDeg * Math.PI / 180;
      var dirIn = { x: Math.cos(a), y: Math.sin(a) };   // 水平向右为 0

      // 入射光线（从画布左缘到 M）
      var tBack = (M.x - 10) / dirIn.x;
      var P0 = { x: M.x - dirIn.x * tBack, y: M.y - dirIn.y * tBack };
      ctx.strokeStyle = "#5B6675"; ctx.lineWidth = 3.2; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(P0.x, P0.y); ctx.lineTo(M.x, M.y); ctx.stroke();
      ctx.fillStyle = "#5B6675"; ctx.font = "600 14px -apple-system, sans-serif";
      ctx.fillText("白光", P0.x + 4, P0.y - 10);

      var exits = [];
      for (var i = 0; i < 7; i++) {
        var eta = 1 / (1.40 + i * 0.014 * spread);
        var d1 = refract(dirIn, nOut, eta);
        if (!d1) continue;
        // 在棱镜内传播，依次尝试每个非入射面，取第一个能成功折射出射的面
        // （某面全反射时自动改走其他面，避免色光凭空消失）
        var d2 = null, X = null;
        for (var e = 0; e < EDGES.length; e++) {
          var A = EDGES[e][0], B = EDGES[e][1];
          if ((A === TOP && B === L) || (A === L && B === TOP)) continue;
          var t = rayHit(M, d1, A, B);
          if (t === null) continue;
          var Xc = { x: M.x + d1.x * t, y: M.y + d1.y * t };
          var fx = B.x - A.x, fy = B.y - A.y, fl = Math.hypot(fx, fy);
          var n2out = { x: fy / fl, y: -fx / fl };
          if (n2out.x * d1.x + n2out.y * d1.y < 0) { n2out.x = -n2out.x; n2out.y = -n2out.y; }
          var d2c = refract(d1, n2out, 1 / eta);
          if (d2c) { d2 = d2c; X = Xc; break; }
        }
        if (!d2) continue;

        // 棱镜内部光线（细）
        ctx.strokeStyle = COLORS[i] + "66"; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(M.x, M.y); ctx.lineTo(X.x, X.y); ctx.stroke();

        // 出射光线
        var len = 430;
        var E = { x: X.x + d2.x * len, y: X.y + d2.y * len };
        ctx.strokeStyle = COLORS[i]; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(X.x, X.y); ctx.lineTo(E.x, E.y); ctx.stroke();
        exits.push({ color: COLORS[i], name: NAMES[i], p: E });
      }

      // 色带标注
      if (exits.length) {
        var baseX = 680;
        var startY = 48;
        var gap = 22;
        ctx.globalAlpha = .25;
        exits.forEach(function (ex, i) {
          ctx.fillStyle = ex.color;
          ctx.fillRect(baseX, startY + i * gap, 18, 18);
        });
        ctx.globalAlpha = 1;
        ctx.font = "600 12px -apple-system, sans-serif";
        exits.forEach(function (ex, i) {
          ctx.fillStyle = "#5B6675";
          ctx.fillText(ex.name + "光", baseX + 24, startY + i * gap + 14);
        });
        ctx.fillStyle = "#5c6b82"; ctx.font = "600 11px -apple-system, sans-serif";
        ctx.fillText("光谱", baseX, startY - 8);
      }

      ctx.restore();
      if (out) {
        out.innerHTML = "光线方向 " + fmt(angDeg, 0) + "°　·　" +
          (spread < 0.15 ? "几乎不色散（牛顿的“单色光”实验）" : "七色分开 → 白光是混合光");
      }
    }

    [sAngle, sDisp].forEach(function (s) {
      if (s) s.addEventListener("input", draw);
    });
    window.addEventListener("resize", draw);
    draw();
  }

  /* ---- 7.2 万有引力 ---- */
  function labGravity(lab) {
    var cv = $("canvas", lab);
    var s1 = $('[data-ctrl="m1"]', lab);
    var s2 = $('[data-ctrl="m2"]', lab);
    var sr = $('[data-ctrl="r"]', lab);
    var out = $(".lab-readout", lab);
    var G = 6.674e-11;
    var W = 820, H = 300;

    function draw() {
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var m1 = s1 ? parseFloat(s1.value) : 100;   // 单位：亿吨 = 1e11 kg
      var m2 = s2 ? parseFloat(s2.value) : 100;
      var rKm = sr ? parseFloat(sr.value) : 100;  // 单位：千公里 = 1e6 m

      var Kg1 = m1 * 1e11, Kg2 = m2 * 1e11, Rm = rKm * 1e6;
      var F = G * Kg1 * Kg2 / (Rm * Rm);

      // 半径按质量立方根缩放
      var rad = function (m) { return Math.max(13, Math.min(62, 13 * Math.pow(m / 10, 1 / 3) * 1.55)); };
      var r1 = rad(m1), r2 = rad(m2);

      // 水平布局：距离映射到像素（对数，保证视觉可控）
      var maxR = 400, minR = 40;
      var px = minR + (maxR - minR) * (Math.log(rKm) - Math.log(1)) / (Math.log(400) - Math.log(1));
      var cx1 = W / 2 - px / 2 - r1, cx2 = W / 2 + px / 2 + r2;
      var cy = 150;

      // 距离标注线
      ctx.strokeStyle = "#D4DBE5"; ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.moveTo(cx1 + r1, cy); ctx.lineTo(cx2 - r2, cy); ctx.stroke();
      ctx.setLineDash([]);

      function ball(cx, rr, color, label, sub) {
        var g = ctx.createRadialGradient(cx - rr * .35, cy - rr * .4, rr * .15, cx, cy, rr);
        g.addColorStop(0, color.light);
        g.addColorStop(1, color.dark);
        ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        ctx.strokeStyle = color.line; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = "#1B2530";
        ctx.font = "800 15px -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(label, cx, cy + rr + 24);
        ctx.fillStyle = "#5c6b82"; ctx.font = "600 12.5px -apple-system, sans-serif";
        ctx.fillText(sub, cx, cy + rr + 42);
        ctx.textAlign = "left";
      }
      ball(cx1, r1, { light: "#A5B8FF", dark: "#3B5BDB", line: "#2F49AF" }, "物体 A", m1 + " 亿吨");
      ball(cx2, r2, { light: "#FFD8A8", dark: "#F59F00", line: "#E08500" }, "物体 B", m2 + " 亿吨");

      // 引力箭头：长度按 log(F) 归一化
      var lv = Math.log10(Math.max(F, 1e-12));
      var alen = Math.max(10, Math.min(46, (lv + 6) * 4.2));
      function arrow(fromX, dir, color) {
        ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 3;
        var tipX = fromX + dir * alen;
        ctx.beginPath(); ctx.moveTo(fromX, cy); ctx.lineTo(tipX, cy); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(tipX, cy);
        ctx.lineTo(tipX - dir * 9, cy - 7);
        ctx.lineTo(tipX - dir * 9, cy + 7);
        ctx.closePath(); ctx.fill();
      }
      arrow(cx1 + r1 + 2, -1, "#E8590C");
      arrow(cx2 - r2 - 2, 1, "#E8590C");

      // 中心标注
      ctx.textAlign = "center";
      ctx.fillStyle = "#5c6b82"; ctx.font = "600 13px -apple-system, sans-serif";
      ctx.fillText("距离 " + fmt(rKm, 0) + " 千公里", W / 2, cy - 16);
      ctx.fillStyle = "#E8590C"; ctx.font = "800 16px ui-monospace, monospace";
      ctx.fillText("F = " + fmt(F, 4) + " N", W / 2, cy + 30);
      ctx.textAlign = "left";

      ctx.restore();
      if (out) {
        var apples = F / 1.0;   // 一个苹果约重 1 N
        out.innerHTML =
          "F = G·m₁m₂ / r² = " + F.toExponential(3) + " N　·　" +
          "相当于托起约 " + fmt(apples, 2) + " 个苹果的力";
      }
    }
    [s1, s2, sr].forEach(function (s) { if (s) s.addEventListener("input", draw); });
    window.addEventListener("resize", draw);
    draw();
  }

  /* ---- 7.3 抛体运动 ---- */
  function labProjectile(lab) {
    var cv = $("canvas", lab);
    var sv = $('[data-ctrl="v"]', lab);
    var sa = $('[data-ctrl="angle"]', lab);
    var sg = $('[data-ctrl="g"]', lab);
    var btn = $(".lab-fire", lab);
    var out = $(".lab-readout", lab);
    var W = 820, H = 380;
    var anim = null;

    function vals() {
      return {
        v: sv ? parseFloat(sv.value) : 40,
        a: sa ? parseFloat(sa.value) : 45,
        g: sg ? parseFloat(sg.value) : 9.8
      };
    }

    function draw(progress) {
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      var p = vals();
      var rad = p.a * Math.PI / 180;
      var vx = p.v * Math.cos(rad), vy = p.v * Math.sin(rad);
      var Tf = 2 * vy / p.g;
      var range = vx * Tf;
      var hmax = vy * vy / (2 * p.g);

      ctx.save(); ctx.scale(k, k);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      // 地面
      var gy = H - 46;
      ctx.strokeStyle = "#C9D3E0"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(20, gy); ctx.lineTo(W - 20, gy); ctx.stroke();
      ctx.fillStyle = "#EDF1F7";
      ctx.fillRect(20, gy, W - 40, 46);

      // 坐标映射：x 0..range*1.12 → 60..W-70 ; y 0..hmax*1.25 → gy..50
      var xMax = Math.max(range * 1.12, 1);
      var yMax = Math.max(hmax * 1.25, 1);
      var X = function (x) { return 60 + (x / xMax) * (W - 130); };
      var Y = function (y) { return gy - (y / yMax) * (gy - 54); };

      // 网格
      ctx.strokeStyle = "#EEF2F7"; ctx.lineWidth = 1;
      for (var i = 1; i <= 4; i++) {
        var yy = gy - (gy - 54) * i / 4;
        ctx.beginPath(); ctx.moveTo(60, yy); ctx.lineTo(W - 70, yy); ctx.stroke();
      }

      // 轨迹
      ctx.beginPath();
      for (var t = 0; t <= Tf; t += Tf / 160) {
        var x = vx * t, y = vy * t - 0.5 * p.g * t * t;
        if (t === 0) ctx.moveTo(X(x), Y(y)); else ctx.lineTo(X(x), Y(y));
      }
      ctx.strokeStyle = "rgba(59,91,219,.35)"; ctx.lineWidth = 2.5;
      ctx.setLineDash([7, 5]); ctx.stroke(); ctx.setLineDash([]);

      // 已飞过的部分
      var tp = (progress === undefined ? null : Math.max(0, progress) * Tf);
      if (tp !== null && tp > 0) {
        var segs = 90, dt2 = tp / segs;
        ctx.beginPath();
        for (var t2 = 0; t2 <= tp + 1e-9; t2 += dt2) {
          var x2 = vx * t2, y2 = vy * t2 - 0.5 * p.g * t2 * t2;
          if (t2 === 0) ctx.moveTo(X(x2), Y(y2)); else ctx.lineTo(X(x2), Y(y2));
        }
        ctx.strokeStyle = "#3B5BDB"; ctx.lineWidth = 3.2; ctx.stroke();

        var px = X(vx * tp), py = Y(vy * tp - 0.5 * p.g * tp * tp);
        ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fillStyle = "#E8590C"; ctx.fill();
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 2.5; ctx.stroke();
      }

      // 发射角
      ctx.strokeStyle = "#F59F00"; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(X(0), Y(0));
      ctx.lineTo(X(Math.cos(rad) * p.v * 0.55), Y(Math.sin(rad) * p.v * 0.55));
      ctx.stroke();
      ctx.fillStyle = "#c1440e"; ctx.font = "800 14px -apple-system, sans-serif";
      ctx.fillText(p.a + "°", X(0) + 22, Y(0) - 12);

      // 落点
      ctx.beginPath(); ctx.arc(X(range), gy, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#0CA678"; ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();

      // 最高点虚线
      ctx.strokeStyle = "#C7D2FE"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(X(range / 2), Y(hmax)); ctx.lineTo(X(range / 2), gy); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#5c6b82"; ctx.font = "600 12.5px -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("最高 " + fmt(hmax, 1) + " m", X(range / 2), Y(hmax) - 10);

      // 射程标注
      ctx.strokeStyle = "#0CA678"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(X(0), gy + 18); ctx.lineTo(X(range), gy + 18); ctx.stroke();
      ctx.fillStyle = "#087F5B"; ctx.font = "800 14px -apple-system, sans-serif";
      ctx.fillText("射程 " + fmt(range, 1) + " m", X(range / 2), gy + 36);
      ctx.textAlign = "left";

      ctx.restore();
      if (out) {
        out.innerHTML = "初速 " + fmt(p.v, 0) + " m/s　·　角度 " + fmt(p.a, 0) + "°" +
          "　·　g = " + fmt(p.g, 2) + " m/s²　→　射程 " + fmt(range, 1) +
          " m，最高 " + fmt(hmax, 1) + " m，飞行 " + fmt(Tf, 2) + " 秒";
      }
    }

    [sv, sa, sg].forEach(function (s) { if (s) s.addEventListener("input", function () { draw(); }); });
    if (btn) {
      btn.addEventListener("click", function () {
        if (anim) cancelAnimationFrame(anim);
        var t0 = performance.now(), dur = 2200;
        (function step(now) {
          var pr = Math.min(1, (now - t0) / dur);
          draw(pr);
          if (pr < 1) anim = requestAnimationFrame(step); else anim = null;
        })(t0);
      });
    }
    window.addEventListener("resize", function () { draw(); });
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
        if (kind === "prism") labPrism(lab);
        else if (kind === "gravity") labGravity(lab);
        else if (kind === "projectile") labProjectile(lab);
      } finally { __labNow = null; }
      if (rec.used && !rec.tools) __addAnimTools(lab, rec);
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
