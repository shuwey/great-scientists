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


  function lab_orbit(lab) {
    var cv = $("canvas", lab);
    var sA = $('[data-ctrl="aim"]', lab);
    var out = $(".lab-readout", lab);
    var vA = sA ? sA.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400, CX = 410, CY = 200;
    var R0 = 12, S = 22, HH = -0.004, BCRIT = 2.598;
    function traceRay(b) {
      var phi0 = Math.PI - Math.asin(Math.min(0.998, b / R0));
      var uu = 1 / R0, du = Math.cos(phi0) / b, phi = phi0;
      var pts = [], captured = false, i, r, turn = 0, prev = null, ang, d, n, p0, p1;
      pts.push([CX - Math.sqrt(R0 * R0 - b * b) * S, CY - b * S]);
      for (i = 0; i < 4000; i++) {
        var ddu = -uu + 1.5 * uu * uu;
        du += ddu * HH;
        uu += du * HH;
        phi += HH;
        if (uu > 0.999) { captured = true; break; }
        r = 1 / uu;
        p1 = [CX + r * Math.cos(phi) * S, CY - r * Math.sin(phi) * S];
        pts.push(p1);
        n = pts.length;
        p0 = pts[n - 2];
        ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]);
        if (prev === null) prev = ang;
        else {
          d = ang - prev;
          while (d > Math.PI) d -= Math.PI * 2;
          while (d < -Math.PI) d += Math.PI * 2;
          turn += d; prev = ang;
        }
        if (r > R0 + 0.05) break;
      }
      return { pts: pts, captured: captured, turn: turn };
    }
    function poly(ctx, pts, col, w, dash) {
      var i;
      ctx.strokeStyle = col; ctx.lineWidth = w;
      if (dash) ctx.setLineDash(dash); else ctx.setLineDash([]);
      ctx.beginPath();
      for (i = 0; i < pts.length; i++) {
        if (i === 0) ctx.moveTo(pts[i][0], pts[i][1]); else ctx.lineTo(pts[i][0], pts[i][1]);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var aim = sA ? parseFloat(sA.value) : 3.5;
      var S2 = setupCanvas(cv, H / W);
      var ctx = S2.ctx, k = S2.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#0B1020"; ctx.fillRect(0, 0, W, H);

      var i, b, res, gb = [1.0, 1.8, 2.35, 2.62, 2.9, 4.0, 6.0];
      ctx.strokeStyle = "rgba(255,255,255,0.30)"; ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.setLineDash([6, 6]);
      ctx.arc(CX, CY, BCRIT * S, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("俘获边界（黑洞阴影）＝ 2.6 倍视界半径", 40, 372);

      ctx.strokeStyle = "rgba(255,212,59,0.55)"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.setLineDash([4, 4]);
      ctx.arc(CX, CY, 1.5 * S, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255,212,59,0.75)"; ctx.font = "600 11.5px -apple-system, sans-serif";
      ctx.fillText("光子球 1.5 倍视界半径", CX + 1.5 * S + 6, CY + 1.5 * S + 14);

      /* 对照线：如果黑洞不存在，你正在瞄的这束光本该沿这条水平线笔直穿过 */
      ctx.strokeStyle = "rgba(255,255,255,0.45)"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.setLineDash([7, 6]);
      ctx.moveTo(0, CY - aim * S); ctx.lineTo(W, CY - aim * S); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255,255,255,0.62)"; ctx.font = "600 11.5px -apple-system, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("白虚线：没有引力时的笔直路径", W - 24, CY - aim * S - 8);
      ctx.textAlign = "left";

      for (i = 0; i < gb.length; i++) {
        b = gb[i];
        res = traceRay(b);
        poly(ctx, res.pts, res.captured ? "rgba(224,49,49,0.45)" : "rgba(174,185,204,0.45)", 1.5, null);
        res = traceRay(-b);
        poly(ctx, res.pts, res.captured ? "rgba(224,49,49,0.45)" : "rgba(174,185,204,0.45)", 1.5, null);
      }

      res = traceRay(aim);
      poly(ctx, res.pts, res.captured ? "#FF6B6B" : "#FFD43B", 3, null);
      var npts = res.pts.length;
      if (!res.captured && npts > 2) {
        var e = res.pts[npts - 1], e0 = res.pts[npts - 3];
        var ea = Math.atan2(e[1] - e0[1], e[0] - e0[0]);
        if (e[0] > 16 && e[0] < 804 && e[1] > 16 && e[1] < 384) {
          ctx.fillStyle = "#FFD43B";
          ctx.beginPath();
          ctx.moveTo(e[0] + Math.cos(ea) * 9, e[1] + Math.sin(ea) * 9);
          ctx.lineTo(e[0] - Math.cos(ea - 0.5) * 7, e[1] - Math.sin(ea - 0.5) * 7);
          ctx.lineTo(e[0] - Math.cos(ea + 0.5) * 7, e[1] - Math.sin(ea + 0.5) * 7);
          ctx.closePath(); ctx.fill();
        }
      }

      ctx.fillStyle = "#000";
      ctx.beginPath(); ctx.arc(CX, CY, S, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#FFD43B"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(CX, CY, S, 0, Math.PI * 2); ctx.stroke();

      ctx.fillStyle = "#fff"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("黑洞（视界）", 30, 34);
      ctx.fillStyle = "#AEB9CC"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("白虚线：没有引力时本该笔直通过　　黄线：你正在瞄的那束光　　红线：被吞入的光线　　灰线：被掰弯后逃走的光线", 40, 350);
      ctx.restore();

      var deg = Math.abs(res.turn) * 180 / Math.PI;
      if (vA) vA.textContent = aim.toFixed(1);
      if (out) {
        if (res.captured) {
          out.innerHTML = "瞄准距离 <b>" + aim.toFixed(1) + "</b> 视界半径　·　临界值是约 <b>2.6</b>　·　这束光已经<b>被吞进视界</b>，回不来了。" +
            "　·　中间那片黑色的阴影就是这么来的：只要瞄得比 2.6 更近，任何光都逃不出。";
        } else {
          out.innerHTML = "瞄准距离 <b>" + aim.toFixed(1) + "</b> 视界半径　·　临界值约 <b>2.6</b>　·　这束光被掰弯 <b>" +
            deg.toFixed(0) + "°</b> 后逃走了　·　" +
            (deg > 150 ? "它已经贴着光子球绕了大半圈——再靠近一点就回不来了。" :
                         "瞄得越靠近 2.6，偏折越大；一旦绕成圈，就再也出不来。");
        }
      }
    }
    if (sA) sA.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }


  function lab_temp(lab) {
    var cv = $("canvas", lab);
    var sM = $('[data-ctrl="mass"]', lab);
    var out = $(".lab-readout", lab);
    var vM = sM ? sM.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var PX0 = 336, PX1 = 792, PY0 = 320, PY1 = 74;
    var LMIN = -1.3, LMAX = 1.0;
    function xOf(lg) { return PX0 + (lg - LMIN) / (LMAX - LMIN) * (PX1 - PX0); }
    function planck(lam, T) {
      var e = Math.exp(14.4 / (T * lam)) - 1;
      if (e <= 0) return 0;
      return Math.pow(lam, -5) / e;
    }
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var mass = sM ? parseFloat(sM.value) : 1;
      var T = 3 / mass;
      var lamPk = 2.9 / T;
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#0B1020"; ctx.fillRect(0, 0, W, H);

      var i, lam, lg, v, peak = 0.0000001, curv = [];
      for (i = 0; i <= 260; i++) {
        lg = LMIN + (LMAX - LMIN) * i / 260;
        lam = Math.pow(10, lg);
        v = planck(lam, T);
        curv.push([lg, v]);
        if (v > peak) peak = v;
      }
      var hx = 150, hy = 196, rr = 13 + mass * 7;
      ctx.fillStyle = "#0B1020";
      ctx.beginPath(); ctx.arc(hx, hy, rr, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#FFD43B"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(hx, hy, rr, 0, Math.PI * 2); ctx.stroke();
      for (i = 0; i < 8; i++) {
        var aa = i * Math.PI / 4 + 0.2;
        var r1 = rr + 14, r2 = rr + 34 + (i % 2) * 8;
        ctx.strokeStyle = "rgba(232,89,12,0.85)"; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(hx + Math.cos(aa) * r1, hy + Math.sin(aa) * r1);
        ctx.lineTo(hx + Math.cos(aa) * r2, hy + Math.sin(aa) * r2);
        ctx.stroke();
        ctx.fillStyle = "rgba(232,89,12,0.85)";
        ctx.beginPath();
        ctx.arc(hx + Math.cos(aa) * r2, hy + Math.sin(aa) * r2, 3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = "#E8590C";
      ctx.beginPath(); ctx.arc(hx - rr - 6, hy - rr - 2, 3.6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(hx + rr + 6, hy + rr * 0.3, 3.6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#FFC078"; ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(hx - rr * 0.5, hy + rr * 1.05);
      ctx.lineTo(hx - rr - 10, hy + rr + 8);
      ctx.stroke();
      ctx.fillStyle = "#E8EDF5"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("视界附近的粒子对", hx - 76, 60);
      ctx.fillText("一个掉进去，一个跑出来", hx - 76, 78);
      ctx.fillStyle = "#E8EDF5"; ctx.font = "700 15px -apple-system, sans-serif";
      ctx.fillText("黑洞质量 = " + mass.toFixed(1) + "×", hx - 52, hy + rr + 62);

      ctx.strokeStyle = "rgba(255,255,255,0.10)"; ctx.lineWidth = 1;
      for (i = 0; i <= 5; i++) {
        var gy = PY1 + (PY0 - PY1) * i / 5;
        ctx.beginPath(); ctx.moveTo(PX0, gy); ctx.lineTo(PX1, gy); ctx.stroke();
      }
      ctx.strokeStyle = "rgba(255,255,255,0.34)"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(PX0, PY0); ctx.lineTo(PX1, PY0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PX0, PY0); ctx.lineTo(PX0, PY1); ctx.stroke();
      ctx.fillStyle = "#AEB9CC"; ctx.font = "700 12.5px -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("短波", PX0 + 20, PY0 + 20);
      ctx.fillText("长波", PX1 - 20, PY0 + 20);
      ctx.textAlign = "left";

      ctx.strokeStyle = "#FF6B6B"; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(xOf(Math.log10(lamPk)), PY0); ctx.lineTo(xOf(Math.log10(lamPk)), PY1 - 10); ctx.stroke();
      ctx.setLineDash([]);

      var gp = ctx.createLinearGradient(PX0, 0, PX1, 0);
      gp.addColorStop(0, "#B197FC");
      gp.addColorStop(0.35, "#4DABF7");
      gp.addColorStop(0.62, "#69DB7C");
      gp.addColorStop(0.8, "#FFD43B");
      gp.addColorStop(1, "#FF6B6B");
      ctx.strokeStyle = gp; ctx.lineWidth = 3.2;
      ctx.beginPath();
      for (i = 0; i < curv.length; i++) {
        var cx2 = xOf(curv[i][0]), cy2 = PY0 - curv[i][1] / peak * (PY0 - PY1 - 8);
        if (i === 0) ctx.moveTo(cx2, cy2); else ctx.lineTo(cx2, cy2);
      }
      ctx.stroke();

      ctx.fillStyle = "#FF6B6B";
      ctx.beginPath(); ctx.arc(xOf(Math.log10(lamPk)), PY0 - (PY0 - PY1 - 8), 5, 0, Math.PI * 2); ctx.fill();
      var pkLeft = xOf(Math.log10(lamPk)) > PX1 - 118;
      ctx.fillStyle = "#FF6B6B"; ctx.font = "700 12.5px -apple-system, sans-serif";
      ctx.textAlign = pkLeft ? "right" : "left";
      ctx.fillText("峰值波长", xOf(Math.log10(lamPk)) + (pkLeft ? -8 : 8), PY1 - 18);
      ctx.textAlign = "left";

      ctx.fillStyle = "#E8EDF5"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("霍金辐射的频谱（曲线高度已归一化，只看峰的位置）", PX0, 40);
      ctx.fillStyle = "#AEB9CC"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("横轴：辐射波长（对数）　·　竖轴：辐射强度", PX0, 58);
      ctx.restore();

      if (vM) vM.textContent = mass.toFixed(1) + "×";
      if (out) {
        out.innerHTML = "黑洞质量 <b>" + mass.toFixed(1) + "×</b>　·　温度 ∝ 1/质量 = <b>" + T.toFixed(2) +
          "</b>（相对）　·　峰值波长 ∝ 质量 = <b>" + lamPk.toFixed(2) + "</b>（相对）　·　" +
          "质量越小 → 温度越高 → 峰值越靠左（短波）　·　真实尺度下，恒星量级黑洞的温度低到约 10⁻⁸ K，" +
          "它其实在“吸”宇宙微波背景的热——越蒸发越小，才会越热越快。";
      }
    }
    if (sM) sM.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }

  function lab_bh(lab) {
  var P = {"label": "黑洞弯曲时空，光子在视界外绕行"};

  var cv=$("canvas",lab); var sM=$('[data-ctrl="mass"]',lab);
  var out=$(".lab-readout",lab); var vSpan=sM?sM.closest(".ctrl").querySelector(".v"):null;
  var W=820,H=360, ph=0, last=0;
  function draw(ts){
    if(!last)last=ts; var dt=Math.min(0.05,(ts-last)/1000); last=ts;
    var m=sM?parseFloat(sM.value):1; ph+=dt*(0.4+m*0.8);
    var cx=W/2, cy=H/2;
    var S=setupCanvas(cv,H/W); var ctx=S.ctx,k=S.w/W;
    ctx.save(); ctx.scale(k,k); ctx.clearRect(0,0,W,H); ctx.fillStyle="#0B1020"; ctx.fillRect(0,0,W,H);
    for(var a=0;a<Math.PI*2;a+=0.16){
      var rr=80+26*Math.sin(a*3+ph*0.25);
      var x=cx+Math.cos(a)*rr, y=cy+Math.sin(a)*rr*0.5;
      ctx.fillStyle="hsl("+(((a*40)%360+40))+",80%,62%)"; ctx.globalAlpha=0.45;
      ctx.beginPath(); ctx.arc(x,y,2.2,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;
    var rh=Math.max(24, 52/(m*0.7+0.3));
    ctx.strokeStyle="#FFD43B"; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(cx,cy,rh,0,Math.PI*2); ctx.stroke();
    ctx.fillStyle="#000"; ctx.beginPath(); ctx.arc(cx,cy,rh-7,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle="rgba(255,255,255,.55)"; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(cx,cy,rh-7,0,Math.PI*2); ctx.stroke();
    var px=cx+Math.cos(ph)*rh, py=cy+Math.sin(ph)*rh;
    ctx.fillStyle="#FFE066"; ctx.beginPath(); ctx.arc(px,py,4,0,Math.PI*2); ctx.fill();
    ctx.textAlign="left"; ctx.fillStyle="#AEB9CC"; ctx.font="600 13px -apple-system,sans-serif";
    ctx.fillText(P.label||"黑洞弯曲时空，光子在视界外绕行", 14, 26);
    ctx.restore();
    if(vSpan)vSpan.textContent=m.toFixed(1)+"×";
    if(out)out.innerHTML="质量越大（<b>"+m.toFixed(1)+"×</b>），时空被压得越深、光子环越小——连光都逃不出视界。这正是霍金研究黑洞的舞台。";
    requestAnimationFrame(draw);
  }
  if(sM)sM.addEventListener("input",draw);
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
        if (kind === "bh") lab_bh(lab);
        if (kind === "orbit") lab_orbit(lab);
        if (kind === "temp") lab_temp(lab);
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
