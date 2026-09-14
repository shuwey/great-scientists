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


  function lab_lines(lab) {
    var cv = $("canvas", lab);
    var sS = $('[data-ctrl="strength"]', lab);
    var out = $(".lab-readout", lab);
    var vS = sS ? sS.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var CX = 410, CY = 196, DW = 128, DH = 30, D = 62;
    function fieldAt(px, py) {
      var d1x = px - (CX - D), d1y = py - CY;
      var d2x = px - (CX + D), d2y = py - CY;
      var r1 = Math.pow(d1x * d1x + d1y * d1y, 1.5) + 1e-4;
      var r2 = Math.pow(d2x * d2x + d2y * d2y, 1.5) + 1e-4;
      return { x: d1x / r1 - d2x / r2, y: d1y / r1 - d2y / r2 };
    }
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var str = sS ? parseFloat(sS.value) : 1;
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var i, j, L;
      ctx.strokeStyle = "#3B5BDB";
      ctx.lineWidth = Math.min(3, 1 + str * 1.1);
      ctx.globalAlpha = Math.min(0.95, 0.32 + str * 0.34);
      for (i = -5; i <= 5; i++) {
        var yy = CY + i * 13;
        var bulge = 30 + Math.abs(i) * 11;
        var sgn = i >= 0 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(CX - DW, yy);
        ctx.bezierCurveTo(CX - DW * 0.3, yy + sgn * bulge * 1.4,
                          CX + DW * 0.3, yy + sgn * bulge * 1.4,
                          CX + DW, yy);
        ctx.stroke();
        if (i % 2 !== 0) {
          var ay = yy + sgn * bulge * 1.05;
          ctx.fillStyle = "rgba(59,91,219," + Math.min(0.95, 0.45 + str * 0.3) + ")";
          ctx.beginPath();
          ctx.moveTo(CX + 7, ay); ctx.lineTo(CX - 5, ay - 5.5); ctx.lineTo(CX - 5, ay + 5.5);
          ctx.closePath(); ctx.fill();
        }
      }
      for (i = 1; i <= 3; i++) {
        var out1 = 44 + i * 42;
        ctx.beginPath();
        ctx.moveTo(CX - DW + 14, CY - DH);
        ctx.bezierCurveTo(CX - DW - out1 * 0.6, CY - DH - out1,
                          CX + DW + out1 * 0.6, CY - DH - out1,
                          CX + DW - 14, CY - DH);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(CX - DW + 14, CY + DH);
        ctx.bezierCurveTo(CX - DW - out1 * 0.6, CY + DH + out1,
                          CX + DW + out1 * 0.6, CY + DH + out1,
                          CX + DW - 14, CY + DH);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      for (i = 0; i < 46; i++) {
        for (j = 0; j < 26; j++) {
          var px = 50 + i * 16 + (j % 2) * 8;
          var py = 52 + j * 12;
          if (px > CX - DW && px < CX + DW && py > CY - DH - 6 && py < CY + DH + 6) continue;
          if (Math.abs(px - CX) > 350 || Math.abs(py - CY) > 150) continue;
          var f = fieldAt(px, py);
          var mag = Math.sqrt(f.x * f.x + f.y * f.y);
          if (mag < 0.00003) continue;
          var ang = Math.atan2(f.y, f.x);
          var len = 4.5 + Math.min(6, mag * 9000);
          var al = Math.min(0.82, (0.16 + str * 0.28) * Math.min(1, 0.30 + mag * 12000));
          ctx.strokeStyle = "rgba(70,80,105," + al.toFixed(3) + ")";
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(px - Math.cos(ang) * len / 2, py - Math.sin(ang) * len / 2);
          ctx.lineTo(px + Math.cos(ang) * len / 2, py + Math.sin(ang) * len / 2);
          ctx.stroke();
        }
      }

      ctx.fillStyle = "#E03131";
      ctx.fillRect(CX - DW, CY - DH, DW, DH * 2);
      ctx.fillStyle = "#1C7ED6";
      ctx.fillRect(CX, CY - DH, DW, DH * 2);
      ctx.strokeStyle = "#1B2530"; ctx.lineWidth = 1.6;
      ctx.strokeRect(CX - DW, CY - DH, DW * 2, DH * 2);
      ctx.fillStyle = "#fff"; ctx.font = "800 20px -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("N", CX - DW / 2, CY + 7);
      ctx.fillText("S", CX + DW / 2, CY + 7);
      ctx.textAlign = "left";

      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("条形磁铁：铁屑沿磁力线排队", 50, 32);
      ctx.fillStyle = "#5c6b82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("磁力线从 N 极出来 → 绕一大圈 → 回到 S 极，永远闭合，没有起点也没有终点。", 50, 378);
      ctx.restore();

      if (vS) vS.textContent = str.toFixed(1) + "×";
      if (out) {
        out.innerHTML = "磁性强弱 = <b>" + str.toFixed(1) + "×</b>　·　磁性越强，力线越密、铁屑排得越整齐，" +
          "小磁针受到的力也越大　·　" + (str < 0.6 ? "现在磁性很弱，铁屑几乎排不出方向。" : "现在磁力线清晰可见——越靠近两极，力线越密，磁场越强。");
      }
    }
    if (sS) sS.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }


  function lab_ac(lab) {
    var cv = $("canvas", lab);
    var sF = $('[data-ctrl="freq"]', lab);
    var sA = $('[data-ctrl="amp"]', lab);
    var out = $(".lab-readout", lab);
    var vF = sF ? sF.closest(".ctrl").querySelector(".v") : null;
    var vA = sA ? sA.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var ph = 0, last = 0, hist = [];
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      if (!last) last = ts;
      var dt = Math.min(0.05, (ts - last) / 1000); last = ts;
      var f = sF ? parseFloat(sF.value) : 1;
      var a = sA ? parseFloat(sA.value) : 1;
      ph += dt * f * 1.6;
      var emf = a * Math.cos(ph);
      hist.push(emf); if (hist.length > 240) hist.shift();

      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var i;
      ctx.fillStyle = "#E03131";
      ctx.fillRect(62, 118, 40, 128);
      ctx.fillStyle = "#1C7ED6";
      ctx.fillRect(360, 118, 40, 128);
      ctx.fillStyle = "#fff"; ctx.font = "800 20px -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("N", 82, 190); ctx.fillText("S", 380, 190);
      ctx.textAlign = "left";

      var cx2 = 231, cy2 = 182, rx = Math.abs(Math.cos(ph)) * 96 + 5, ry = 62;
      ctx.strokeStyle = "#F59F00"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.ellipse(cx2, cy2, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "rgba(245,159,0,0.18)";
      ctx.beginPath(); ctx.ellipse(cx2, cy2, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#B26A00"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx2, cy2 - ry); ctx.lineTo(cx2, cy2 + ry); ctx.stroke();

      ctx.strokeStyle = "#8B96AA"; ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(cx2, cy2 + ry); ctx.lineTo(cx2, 318); ctx.lineTo(452, 318); ctx.stroke();
      ctx.fillStyle = "#8B96AA";
      ctx.beginPath(); ctx.moveTo(432, 318); ctx.lineTo(424, 313); ctx.lineTo(424, 323);
      ctx.closePath(); ctx.fill();
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(cx2, cy2 - ry); ctx.lineTo(cx2, 318); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#5c6b82"; ctx.font = "600 11.5px -apple-system, sans-serif";
      ctx.fillText("引出导线，送往用电器", 78, 342);

      ctx.strokeStyle = "#F59F00"; ctx.lineWidth = 2.4;
      ctx.beginPath();
      for (i = 0; i <= 40; i++) {
        var aa = -1.15 + i * 0.058;
        var ax = cx2 + Math.cos(aa) * 118, ay = cy2 + Math.sin(aa) * 92;
        if (i === 0) ctx.moveTo(ax, ay); else ctx.lineTo(ax, ay);
      }
      ctx.stroke();
      var tax = cx2 + Math.cos(-0.02) * 118, tay = cy2 + Math.sin(-0.02) * 92;
      ctx.fillStyle = "#F59F00";
      ctx.beginPath(); ctx.moveTo(tax + 7, tay + 2); ctx.lineTo(tax - 6, tay - 6);
      ctx.lineTo(tax - 6, tay + 8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#B26A00"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("匀速转动", cx2 - 26, cy2 - 96);

      ctx.fillStyle = "#E8590C"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("① 线圈在磁场中转动", 62, 44);

      var BX = 486, BY = 240, BW = 300, BH = 150;
      ctx.fillStyle = "#E8590C"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("② 输出的交流电", BX, 44);
      ctx.strokeStyle = "#DDE3EC"; ctx.lineWidth = 1;
      for (i = 0; i <= 4; i++) {
        var gy = BY - BH + BH * i / 4;
        ctx.beginPath(); ctx.moveTo(BX, gy); ctx.lineTo(BX + BW, gy); ctx.stroke();
      }
      ctx.strokeStyle = "#9AA7BE"; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(BX, BY - BH / 2); ctx.lineTo(BX + BW, BY - BH / 2); ctx.stroke();
      ctx.fillStyle = "#5c6b82"; ctx.font = "600 11px -apple-system, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("+", BX - 6, BY - BH / 2 - 26);
      ctx.fillText("0", BX - 6, BY - BH / 2 + 4);
      ctx.fillText("−", BX - 6, BY - BH / 2 + 34);
      ctx.textAlign = "left";
      ctx.fillStyle = "#5c6b82"; ctx.font = "600 11px -apple-system, sans-serif";
      ctx.fillText("电流方向 + / −", BX, BY + 26);

      ctx.strokeStyle = "#2F9E44"; ctx.lineWidth = 2.6;
      ctx.beginPath();
      for (i = 0; i < hist.length; i++) {
        var hx = BX + BW * i / 239;
        var hy = BY - BH / 2 - hist[i] * 52;
        if (i === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
      }
      ctx.stroke();
      var lx = BX + BW * (hist.length - 1) / 239;
      var ly = BY - BH / 2 - emf * 52;
      ctx.fillStyle = "#2F9E44";
      ctx.beginPath(); ctx.arc(lx, ly, 5.5, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = "#5c6b82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("线圈一转，电流就换方向——这就是交流电（AC）。", 50, 378);
      ctx.restore();

      if (vF) vF.textContent = f.toFixed(1) + "×";
      if (vA) vA.textContent = a.toFixed(1) + "×";
      if (out) {
        var par = Math.abs(Math.cos(ph));
        out.innerHTML = "转速 <b>" + f.toFixed(1) + "×</b>　·　磁场强度 <b>" + a.toFixed(1) + "×</b>　·　此刻电动势 <b>" +
          emf.toFixed(2) + "</b>　·　" +
          (par > 0.85 ? "线圈平面与磁场<strong>平行</strong>，磁通变化最快 → 电流此刻最大；" :
           par < 0.15 ? "线圈平面与磁场<strong>垂直</strong>，磁通变化最慢 → 电流此刻为零；" :
                        "线圈正在转动，磁通时增时减 → 电流在最大与零之间来回摆；") +
          "转速越快、磁场越强，输出的电压越高。";
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  function lab_induction(lab) {
  var P = {"label": "磁铁一动，线圈里就冒出电流"};

  var cv=$("canvas",lab); var sS=$('[data-ctrl="speed"]',lab); var sN=$('[data-ctrl="turns"]',lab);
  var out=$(".lab-readout",lab);
  function _vs(el){ return el?el.closest(".ctrl").querySelector(".v"):null; }
  var vS=_vs(sS), vN=_vs(sN);
  var W=820,H=360, ph=0, last=0, hist=[];
  var CX=430, CY=148;
  function draw(ts){
    if(typeof ts!=="number")ts=Date.now();
    if(!last)last=ts; var dt=Math.min(0.05,(ts-last)/1000); last=ts;
    var sp=sS?parseFloat(sS.value):1;
    var N=sN?parseFloat(sN.value):4;
    var w=sp*1.15; ph+=dt*w;
    var mx=CX+175*Math.sin(ph);
    var vx=175*w*Math.cos(ph);
    var coup=Math.exp(-Math.pow((mx-CX)/115,2));
    var emf=Math.max(-1,Math.min(1, N*vx*coup/250));
    hist.push(emf); if(hist.length>300)hist.shift();
    var S=setupCanvas(cv,H/W); var ctx=S.ctx,k=S.w/W;
    ctx.save(); ctx.scale(k,k); ctx.clearRect(0,0,W,H);
    ctx.fillStyle="#FBFCFE"; ctx.fillRect(0,0,W,H);
    var turns=Math.round(N), i;
    ctx.strokeStyle="#495057"; ctx.lineWidth=2;
    for(i=0;i<turns;i++){
      var ex=CX-46+(turns>1?(92/(turns-1))*i:0);
      ctx.beginPath(); ctx.ellipse(ex,CY,10,62,0,0,Math.PI*2); ctx.stroke();
    }
    ctx.strokeStyle="#868E96"; ctx.lineWidth=1.6;
    ctx.beginPath(); ctx.moveTo(CX+46,CY+62); ctx.lineTo(690,CY+62); ctx.lineTo(690,232); ctx.stroke();
    var mw=118, mh=46;
    ctx.fillStyle="#E03131"; ctx.fillRect(mx-mw/2,CY-mh/2,mw/2,mh);
    ctx.fillStyle="#1C7ED6"; ctx.fillRect(mx,CY-mh/2,mw/2,mh);
    ctx.strokeStyle="#343A40"; ctx.lineWidth=1.4; ctx.strokeRect(mx-mw/2,CY-mh/2,mw,mh);
    ctx.fillStyle="#fff"; ctx.font="700 17px -apple-system,sans-serif"; ctx.textAlign="center";
    ctx.fillText("N",mx-mw/4,CY+6); ctx.fillText("S",mx+mw/4,CY+6);
    ctx.textAlign="left";
    ctx.fillStyle = "#c1440e"; ctx.font="700 12px -apple-system,sans-serif";
    ctx.fillText("磁铁",mx-mw/2,CY-32);
    var gx=690, gy=286, gr=52;
    ctx.fillStyle="#fff"; ctx.strokeStyle="#343A40"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(gx,gy,gr,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle="#ADB5BD"; ctx.lineWidth=1.2;
    for(i=-4;i<=4;i++){
      var aa=-Math.PI/2+i*(Math.PI/2)/4;
      ctx.beginPath(); ctx.moveTo(gx+Math.cos(aa)*(gr-8),gy+Math.sin(aa)*(gr-8));
      ctx.lineTo(gx+Math.cos(aa)*(gr-3),gy+Math.sin(aa)*(gr-3)); ctx.stroke();
    }
    var na=-Math.PI/2+emf*1.05;
    ctx.strokeStyle="#E03131"; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(gx,gy); ctx.lineTo(gx+Math.cos(na)*(gr-14),gy+Math.sin(na)*(gr-14)); ctx.stroke();
    ctx.fillStyle="#343A40"; ctx.beginPath(); ctx.arc(gx,gy,4,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = "#5c6b82"; ctx.font="600 11px -apple-system,sans-serif"; ctx.textAlign="center";
    ctx.fillText("电流计",gx,gy+gr-10); ctx.textAlign="left";
    var bx=60, by=300, bw=520, bh=44;
    ctx.strokeStyle="#DEE2E6"; ctx.lineWidth=1; ctx.beginPath();
    ctx.moveTo(bx,by+bh/2); ctx.lineTo(bx+bw,by+bh/2); ctx.stroke();
    ctx.strokeStyle="#1C7ED6"; ctx.lineWidth=2; ctx.beginPath();
    for(i=0;i<hist.length;i++){
      var xx=bx+bw*i/300, yy=by+bh/2-hist[i]*(bh/2-4);
      if(i===0)ctx.moveTo(xx,yy); else ctx.lineTo(xx,yy);
    }
    ctx.stroke();
    ctx.fillStyle="#495057"; ctx.font="600 12px -apple-system,sans-serif";
    ctx.fillText("感应电流随时间（磁铁来回穿过线圈）",bx,by-6);
    ctx.fillStyle = "#5c6b82"; ctx.font="600 13px -apple-system,sans-serif";
    ctx.fillText(P.label||"磁铁一动，线圈里就冒出电流", 14, 24);
    ctx.restore();
    if(vS)vS.textContent=sp.toFixed(1)+"×";
    if(vN)vN.textContent=turns+" 匝";
    if(out)out.innerHTML="磁铁速度 <b>"+sp.toFixed(1)+"×</b>、线圈 <b>"+turns+"</b> 匝：此刻感应电流 <b>"+emf.toFixed(2)+"</b>。磁通变化越快、匝数越多，电流越大——这就是法拉第电磁感应定律。";
    requestAnimationFrame(draw);
  }
  if(sS)sS.addEventListener("input",draw);
  if(sN)sN.addEventListener("input",draw);
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
        if (kind === "induction") lab_induction(lab);
        if (kind === "lines") lab_lines(lab);
        if (kind === "ac") lab_ac(lab);
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
