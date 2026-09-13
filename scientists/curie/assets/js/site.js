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


  function lab_rays(lab) {
    var cv = $("canvas", lab);
    var sT = $('[data-ctrl="thick"]', lab);
    var out = $(".lab-readout", lab);
    var vT = sT ? sT.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var srcX = 128, sy = 200, barX = 236, unit = 4.55, farX = 792;
    var RAYS = [
      { nm: "α 射线", sub: "氦核（两个质子＋两个中子）", y: 132, c: "#E03131", range: 6 },
      { nm: "β 射线", sub: "高速电子", y: 200, c: "#3B5BDB", range: 40 },
      { nm: "γ 射线", sub: "高能光子", y: 268, c: "#0CA678", range: 100 }
    ];
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var th = sT ? parseFloat(sT.value) : 0;
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var i, r, end, stopped;
      ctx.fillStyle = "#EDEFF4";
      ctx.fillRect(barX, 76, th * unit, 268);
      ctx.strokeStyle = "#B9C3D4"; ctx.lineWidth = 1;
      ctx.strokeRect(barX, 76, th * unit, 268);

      var marks = [[6, "一张纸"], [40, "几毫米铝"], [100, "几厘米铅"]];
      for (i = 0; i < marks.length; i++) {
        var mx = barX + marks[i][0] * unit;
        ctx.strokeStyle = "rgba(139,150,170,.7)"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(mx, 62); ctx.lineTo(mx, 362); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#8B96AA"; ctx.font = "600 11.5px -apple-system, sans-serif";
        ctx.textAlign = "center"; ctx.fillText(marks[i][1], mx, 50); ctx.textAlign = "left";
      }

      ctx.fillStyle = "#4A5468";
      ctx.fillRect(88, 148, 26, 104);
      ctx.fillStyle = "rgba(245,159,0,.85)";
      ctx.beginPath(); ctx.arc(srcX - 4, sy, 13, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 11.5px -apple-system, sans-serif";
      ctx.fillText("放射源", 78, 282);
      ctx.fillText("（铅罐）", 78, 300);

      for (i = 0; i < RAYS.length; i++) {
        r = RAYS[i];
        stopped = th >= r.range;
        end = stopped ? barX + r.range * unit : farX;
        ctx.strokeStyle = r.c; ctx.lineWidth = stopped ? 2 : 3;
        ctx.beginPath();
        var x2;
        for (x2 = srcX + 12; x2 <= end; x2 += 6) {
          var yy = r.y + Math.sin(x2 / 7 + i) * 3.2;
          if (x2 === srcX + 12) ctx.moveTo(x2, yy); else ctx.lineTo(x2, yy);
        }
        ctx.stroke();
        if (stopped) {
          ctx.strokeStyle = r.c; ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(end - 8, r.y - 9); ctx.lineTo(end + 8, r.y + 9);
          ctx.moveTo(end + 8, r.y - 9); ctx.lineTo(end - 8, r.y + 9);
          ctx.stroke();
        } else {
          ctx.fillStyle = r.c;
          ctx.beginPath(); ctx.moveTo(farX, r.y); ctx.lineTo(farX - 11, r.y - 7);
          ctx.lineTo(farX - 11, r.y + 7); ctx.closePath(); ctx.fill();
        }
        ctx.fillStyle = r.c; ctx.font = "700 13px -apple-system, sans-serif";
        ctx.fillText(r.nm, 300, r.y - 34);
        ctx.fillStyle = "#8B96AA"; ctx.font = "600 11.5px -apple-system, sans-serif";
        ctx.fillText(r.sub, 300, r.y - 17);
        ctx.fillStyle = stopped ? "#B9C3D4" : r.c;
        ctx.font = "700 12px -apple-system, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(stopped ? "被挡住" : "穿过去了", 796, r.y - 17);
        ctx.textAlign = "left";
      }

      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("三种射线，穿透力差得很远", 300, 26);
      ctx.restore();

      var a1 = th >= 6, b1 = th >= 40, g1 = th >= 100;
      if (vT) vT.textContent = th.toFixed(0);
      if (out) {
        out.innerHTML = "屏蔽层厚度 = <b>" + th.toFixed(0) + "</b>（示意）　·　" +
          "α <b>" + (a1 ? "已挡住" : "穿过") + "</b>　·　" +
          "β <b>" + (b1 ? "已挡住" : "穿过") + "</b>　·　" +
          "γ <b>" + (g1 ? "刚够挡住" : "穿过（强度在减弱）") + "</b>　·　" +
          (a1 && b1 && g1 ? "要挡住三种，得动用厚铅墙" : "α 最脆弱，γ 最顽固");
      }
    }
    if (sT) sT.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }


  function lab_purify(lab) {
    var cv = $("canvas", lab);
    var sT = $('[data-ctrl="tons"]', lab);
    var out = $(".lab-readout", lab);
    var vT = sT ? sT.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var MG_PER_TON = 25;
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var tons = sT ? parseFloat(sT.value) : 1;
      var mg = tons * MG_PER_TON;
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var i, j, bx, by, n = Math.round(tons * 2);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("沥青铀矿残渣：" + tons.toFixed(1) + " 吨", 60, 54);
      for (i = 0; i < n; i++) {
        bx = 60 + (i % 10) * 34;
        by = 88 + Math.floor(i / 10) * 30;
        ctx.fillStyle = i % 2 ? "#6B5744" : "#7C6752";
        ctx.fillRect(bx, by, 28, 24);
        ctx.strokeStyle = "#584838"; ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, 28, 24);
      }
      for (i = n; i < 20; i++) {
        bx = 60 + (i % 10) * 34;
        by = 88 + Math.floor(i / 10) * 30;
        ctx.strokeStyle = "#E4E8F0"; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
        ctx.strokeRect(bx, by, 28, 24);
        ctx.setLineDash([]);
      }
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 11.5px -apple-system, sans-serif";
      ctx.fillText("（每格约 0.5 吨）", 60, 196);

      var vx = 662, vy = 198, glow = Math.min(1, mg / 250);
      ctx.fillStyle = "rgba(12,166,120," + (0.10 + glow * 0.26).toFixed(2) + ")";
      ctx.beginPath(); ctx.arc(vx, vy, 34 + glow * 44, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(12,166,120,0.22)";
      ctx.fillRect(vx - 34, vy - 74, 68, 96);
      ctx.strokeStyle = "#8B96AA"; ctx.lineWidth = 2;
      ctx.strokeRect(vx - 34, vy - 74, 68, 96);
      ctx.beginPath(); ctx.moveTo(vx - 34, vy - 74); ctx.lineTo(vx - 40, vy - 96);
      ctx.lineTo(vx + 40, vy - 96); ctx.lineTo(vx + 34, vy - 74); ctx.stroke();
      ctx.fillStyle = "rgba(12,166,120," + (0.35 + glow * 0.6).toFixed(2) + ")";
      ctx.fillRect(vx - 30, vy + 30 - Math.max(6, glow * 88), 60, Math.max(6, glow * 88));

      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(mg.toFixed(1) + " 毫克镭", vx, vy + 66);
      ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillStyle = "#8B96AA";
      ctx.fillText("约 " + (mg / 1000).toFixed(3) + " 克", vx, vy + 88);
      ctx.textAlign = "left";

      ctx.fillStyle = "#1B2530"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("凑够 1 克镭，需要 40 吨矿石", 60, 250);
      var pw = 460, px = 60, py = 268;
      ctx.fillStyle = "#EDEFF4"; ctx.fillRect(px, py, pw, 16);
      ctx.fillStyle = "#0CA678"; ctx.fillRect(px, py, pw * Math.min(1, mg / 1000), 16);
      ctx.strokeStyle = "#C7D0DE"; ctx.lineWidth = 1; ctx.strokeRect(px, py, pw, 16);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 11.5px -apple-system, sans-serif";
      ctx.fillText("0", px, py + 34);
      ctx.textAlign = "right"; ctx.fillText("1000 毫克", px + pw, py + 34); ctx.textAlign = "left";

      ctx.fillStyle = "#5C6B82"; ctx.font = "600 12.5px -apple-system, sans-serif";
      ctx.fillText("居里夫妇在漏风的棚屋里，一锅一锅地煮、一勺一勺地结晶，", 60, 344);
      ctx.fillText("整整四年，才拿到 0.1 克氯化镭。", 60, 366);
      ctx.restore();

      if (vT) vT.textContent = tons.toFixed(1);
      if (out) {
        out.innerHTML = "处理 <b>" + tons.toFixed(1) + "</b> 吨沥青铀矿 → 得到约 <b>" + mg.toFixed(1) +
          "</b> 毫克镭（每吨约 25 毫克）　·　要凑够 1 克，得处理约 <b>40</b> 吨　·　居里夫妇当年就是拿 0.1 克做出的名堂";
      }
    }
    if (sT) sT.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }


  function lab_decay(lab) {
    var cv = $("canvas", lab);
    var sT = $('[data-ctrl="years"]', lab);
    var out = $(".lab-readout", lab);
    var vT = sT ? sT.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var HL = 1600, TMAX = 8000;
    var PX0 = 110, PX1 = 700, PY0 = 330, PY1 = 66;
    function xOf(t) { return PX0 + t / TMAX * (PX1 - PX0); }
    function yOf(p) { return PY0 - p / 100 * (PY0 - PY1); }
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var t = sT ? parseFloat(sT.value) : 0;
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      var i, y, p;
      ctx.strokeStyle = "#EDF0F6"; ctx.lineWidth = 1;
      for (i = 0; i <= 5; i++) {
        y = yOf(i * 20);
        ctx.beginPath(); ctx.moveTo(PX0, y); ctx.lineTo(PX1, y); ctx.stroke();
        ctx.fillStyle = "#8B96AA"; ctx.font = "600 11.5px -apple-system, sans-serif";
        ctx.textAlign = "right"; ctx.fillText((i * 20) + "%", PX0 - 8, y + 4); ctx.textAlign = "left";
      }
      ctx.strokeStyle = "#9AA7BE"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(PX0, PY0); ctx.lineTo(PX1, PY0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PX0, PY0); ctx.lineTo(PX0, PY1); ctx.stroke();

      for (i = 1; i <= 4; i++) {
        var ht = i * HL;
        if (ht > TMAX) break;
        ctx.strokeStyle = "rgba(139,150,170,.75)"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(xOf(ht), PY0); ctx.lineTo(xOf(ht), PY1); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#8B96AA"; ctx.font = "600 11.5px -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText((Math.pow(0.5, i) * 100).toFixed(i > 2 ? 2 : 0) + "%", xOf(ht), PY1 - 10);
        ctx.fillText(ht + " 年", xOf(ht), PY0 + 20);
        ctx.textAlign = "left";
      }

      ctx.strokeStyle = "#3B5BDB"; ctx.lineWidth = 3;
      ctx.beginPath();
      var tt;
      for (tt = 0; tt <= TMAX; tt += 40) {
        p = Math.pow(0.5, tt / HL) * 100;
        if (tt === 0) ctx.moveTo(xOf(tt), yOf(p)); else ctx.lineTo(xOf(tt), yOf(p));
      }
      ctx.stroke();

      var pNow = Math.pow(0.5, t / HL) * 100;
      ctx.strokeStyle = "#E03131"; ctx.lineWidth = 1.6; ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(xOf(t), PY0); ctx.lineTo(xOf(t), yOf(pNow)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#E03131";
      ctx.beginPath(); ctx.arc(xOf(t), yOf(pNow), 7, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#FFF"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(xOf(t), yOf(pNow), 7, 0, Math.PI * 2); ctx.stroke();

      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("镭-226：半衰期约 1600 年", PX0, 40);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 11.5px -apple-system, sans-serif";
      ctx.fillText("纵轴＝还剩多少放射性强度", 60, PY1 - 34);
      ctx.fillText("横轴＝经过的时间（年）", PX1 - 150, PY0 + 44);

      ctx.fillStyle = "#1B2530"; ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillText("再久也一样", 726, 96);
      ctx.strokeStyle = "#E4E8F0"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(726, 108); ctx.lineTo(796, 108); ctx.stroke();
      ctx.fillStyle = "#5C6B82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("过了 1600 年剩 50%", 726, 138);
      ctx.fillText("再过 1600 年剩 25%", 726, 162);
      ctx.fillText("再过 1600 年剩 12.5%", 726, 186);
      ctx.fillStyle = "#8B96AA"; ctx.font = "600 11.5px -apple-system, sans-serif";
      ctx.fillText("剩下多少都不影响", 726, 224);
      ctx.fillText("下个半衰期的长度", 726, 244);
      ctx.fillStyle = "#1B2530"; ctx.font = "700 12.5px -apple-system, sans-serif";
      ctx.fillText("温度、压强、", 726, 288);
      ctx.fillText("化学反应都改不了", 726, 308);
      ctx.restore();

      var halvings = t / HL;
      if (vT) vT.textContent = t.toFixed(0);
      if (out) {
        out.innerHTML = "已经过了 <b>" + t.toFixed(0) + "</b> 年 = <b>" + halvings.toFixed(2) +
          "</b> 个半衰期　·　剩下的放射性强度 = <b>" + pNow.toFixed(1) + "%</b>　·　" +
          (t === 0 ? "现在一点没少" : "每过 1600 年就只剩一半，不多不少");
      }
    }
    if (sT) sT.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }

  function initLabs() {
    $$(".lab").forEach(function (lab) {
      var kind = lab.getAttribute("data-lab");
      if (kind === "rays") lab_rays(lab);
      if (kind === "purify") lab_purify(lab);
      if (kind === "decay") lab_decay(lab);
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
