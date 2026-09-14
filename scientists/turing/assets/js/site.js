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


  function lab_automaton(lab) {
    var cv = $("canvas", lab);
    var sR = $('[data-ctrl="rule"]', lab);
    var out = $(".lab-readout", lab);
    var vR = sR ? sR.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var CELL = 4, COLS = 190, ROWS = 74, X0 = 40, Y0 = 66;
    var MID = Math.floor(COLS / 2);
    var KNOWN = {
      0: "什么都不长：一开就熄",
      30: "混沌无序、看似随机，却完全由规则决定",
      90: "谢尔宾斯基三角形：经典的自相似分形",
      110: "图灵完备！这条简单规则能模拟任何计算",
      150: "嵌套的谢尔宾斯基方块：大三角里套着小三角",
      18: "谢尔宾斯基三角形（另一种画法）",
      22: "谢尔宾斯基三角形（斜向生长）",
      60: "谢尔宾斯基三角形（向左偏移）",
      102: "谢尔宾斯基三角形（上下对称）",
      126: "谢尔宾斯基三角形（粗线条）",
      182: "谢尔宾斯基三角形（点阵状）",
      255: "全部填满：一黑到底"
    };
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var rule = sR ? parseInt(sR.value, 10) : 110;
      syncPresets(rule);
      var bin = rule.toString(2);
      while (bin.length < 8) bin = "0" + bin;
      var r, c, i, j, y, x, sx, bx, gy, gx, gw, cs, patt, bits3, o, outbit;
      var row = new Array(COLS);
      var nxt = new Array(COLS);
      var tmp, lc, md, rc, pat;
      for (c = 0; c < COLS; c++) row[c] = 0;
      row[MID] = 1;
      var rows = [];
      for (r = 0; r < ROWS; r++) {
        rows.push(row.slice());
        for (c = 0; c < COLS; c++) {
          lc = c > 0 ? row[c - 1] : 0;
          md = row[c];
          rc = c < COLS - 1 ? row[c + 1] : 0;
          pat = (lc << 2) | (md << 1) | rc;
          nxt[c] = (rule >> pat) & 1;
        }
        tmp = row; row = nxt; nxt = tmp;
      }
      /* 量出图案实际占用的列范围。种子原本固定落在正中央，但不少规则的生长是不对称的
         （例如默认的 110 只往左半边长），结果整个图案偏在画布一侧、另一半是空的。
         这里按"实际占用范围"把图案水平居中，任何规则都能长在画面正中。 */
      var total = 0, cmin = COLS, cmax = -1;
      for (r = 0; r < rows.length; r++) {
        for (c = 0; c < COLS; c++) {
          if (rows[r][c]) { total++; if (c < cmin) cmin = c; if (c > cmax) cmax = c; }
        }
      }
      /* 按整块画布 W 居中（而不是按 X0 起的那条带居中）：画布左右留白本来就不等
         （X0=40，右边只余 20px），按画布居中才真的落在正中。 */
      var offX = (cmax >= cmin)
        ? Math.round((W - (cmax - cmin + 1) * CELL) / 2 - X0 - cmin * CELL)
        : 0;
      var density = total / (COLS * ROWS);
      var degenerate = density >= 0.75;  /* 规则 255 之类：整片填满，只剩一块纯色 */
      var barren = total <= 1;           /* 规则 0 / 200 之类：种子一代就熄灭 */
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);

      ctx.textAlign = "left";
      ctx.fillStyle = "#1B2530"; ctx.font = "700 15px -apple-system, sans-serif";
      ctx.fillText("一维元胞自动机：一条规则，万千图案", X0, 24);
      ctx.fillStyle = "#6741D9"; ctx.font = "700 13px -apple-system, sans-serif";
      ctx.fillText("当前规则号 " + rule + " ＝ " + bin + "₂", X0, 46);

      gx = 505; gy = 18; gw = 33; cs = 9;
      ctx.fillStyle = "#5c6b82"; ctx.font = "600 11px -apple-system, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("规则表", gx - 10, gy + 12);
      ctx.textAlign = "left";
      for (i = 0; i < 8; i++) {
        patt = 7 - i;
        bx = gx + i * gw;
        bits3 = [(patt >> 2) & 1, (patt >> 1) & 1, patt & 1];
        for (j = 0; j < 3; j++) {
          ctx.fillStyle = bits3[j] ? "#2B3440" : "#E7ECF3";
          ctx.fillRect(bx + j * cs, gy, cs - 1, cs - 1);
        }
        outbit = (rule >> patt) & 1;
        ctx.fillStyle = outbit ? "#1C7ED6" : "#E7ECF3";
        ctx.fillRect(bx + cs, gy + cs + 5, cs - 1, cs - 1);
        ctx.fillStyle = "#5c6b82"; ctx.font = "600 10px -apple-system, sans-serif";
        ctx.fillText("↓", bx + cs - 3, gy + cs + 4);
      }

      for (r = 0; r < rows.length; r++) {
        y = Y0 + r * CELL;
        for (c = 0; c < COLS; c++) {
          if (!rows[r][c]) continue;
          ctx.fillStyle = "#2B3440";
          ctx.fillRect(X0 + offX + c * CELL, y, CELL - 0.5, CELL - 0.5);
        }
      }
      sx = X0 + offX + MID * CELL + CELL / 2;
      ctx.fillStyle = "#E8590C";
      ctx.beginPath();
      ctx.moveTo(sx, Y0 - 2);
      ctx.lineTo(sx - 5, Y0 - 10);
      ctx.lineTo(sx + 5, Y0 - 10);
      ctx.closePath(); ctx.fill();

      /* 退化帧说人话：整片填满 / 什么都不长时，画面本身给不出信息，
         就地盖一块说明牌，避免学生以为"页面坏了"。 */
      if (degenerate || barren) {
        ctx.fillStyle = "rgba(255,252,246,0.95)";
        ctx.fillRect(80, 150, 660, 86);
        ctx.strokeStyle = degenerate ? "#F0B27A" : "#B7C3D6"; ctx.lineWidth = 1.5;
        ctx.strokeRect(80, 150, 660, 86);
        ctx.textAlign = "center";
        ctx.fillStyle = "#C1440E"; ctx.font = "700 16px -apple-system, sans-serif";
        ctx.fillText(degenerate ? "这条规则把整片格子都填满了" : "这条规则下，一个黑格也长不出来", 410, 183);
        ctx.fillStyle = "#5c6b82"; ctx.font = "600 13px -apple-system, sans-serif";
        ctx.fillText(degenerate
          ? "画面只剩一整片纯色，看不出任何结构 —— 把规则号挪到别的数值再试试"
          : "种子下一代就熄灭了 —— 换一个规则号试试（如 30／90／110／150）", 410, 212);
        ctx.textAlign = "left";
      }

      ctx.fillStyle = "#5c6b82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("最上面是一个黑格；每一行都按同一条规则、看上排左中右三格长出来。", X0, 384);
      ctx.restore();

      if (vR) vR.textContent = rule + "";
      if (out) {
        var desc = degenerate
          ? "⚠️ 这条规则会把整片格子都点亮，画面只剩一整块纯色、看不出任何结构——换个规则号试试。"
          : barren
            ? "⚠️ 这条规则下，最初的单个黑格下一代就熄灭了，画面什么也长不出来——换个规则号试试。"
            : (KNOWN[rule] || "一条普通规则：图案很快趋于简单重复或彻底消失");
        out.innerHTML = "规则 <b>" + rule + "</b>（" + bin + "₂）　·　" + desc + "　·　" +
          (rule === 110 ? "⭐ 110 号规则已被证明是“图灵完备”的——理论上它能算任何可计算的东西。规则一共只有 256 条，能长出什么，全看规则怎么定。" :
                          "规则一共只有 256 条，却能长出分形、混沌甚至空白——能力不来自规则多复杂，而来自反复迭代。");
      }
    }
    if (sR) sR.addEventListener("input", draw);

    /* 规则号快捷按钮：一键跳到"有结构"的经典规则，避免学生在 0–255 里盲试 */
    var sBtns = $$("[data-rule]", lab);
    sBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        if (!sR) return;
        sR.value = b.getAttribute("data-rule");
        sR.dispatchEvent(new Event("input", { bubbles: true }));
      });
    });
    function syncPresets(rule) {
      sBtns.forEach(function (b) {
        b.classList.toggle("on", parseInt(b.getAttribute("data-rule"), 10) === rule);
      });
    }
    window.addEventListener("resize", draw);
    draw(performance.now());
  }


  function lab_signal(lab) {
    var cv = $("canvas", lab);
    var sD = $('[data-ctrl="density"]', lab);
    var sB = $('[data-ctrl="bits"]', lab);
    var out = $(".lab-readout", lab);
    var vD = sD ? sD.closest(".ctrl").querySelector(".v") : null;
    var vB = sB ? sB.closest(".ctrl").querySelector(".v") : null;
    var W = 820, H = 400;
    var PX0 = 70, PX1 = 782, PY0 = 268, PY1 = 84, TPER = 3;
    var CY = (PY0 + PY1) / 2, AY = (PY0 - PY1) / 2 - 8;
    var BAND_Y = 300, BAND_LABEL = 316, BAND_TOP = 326, BAND_H = 52;
    function sig(u) { return Math.sin(u * 2 * Math.PI * TPER); }
    function xOf(u) { return PX0 + u * (PX1 - PX0); }
    function yOf(s) { return CY - s * AY; }
    function draw(ts) {
      if (typeof ts !== "number") ts = performance.now();
      var dens = sD ? parseFloat(sD.value) : 8;
      var bits = sB ? parseInt(sB.value, 10) : 4;
      var lv = Math.pow(2, bits);
      var NS = Math.max(3, Math.round(dens * TPER));
      var q = [], j, uu, sv, qv, code, bi, cellH, colw, step, count;
      for (j = 0; j <= NS; j++) {
        uu = j / NS;
        sv = sig(uu);
        qv = Math.round((sv + 1) / 2 * (lv - 1)) / (lv - 1) * 2 - 1;
        q.push(qv);
      }
      var err = 0, M = 1200, m, ut, kk, d, ideal;
      for (m = 0; m < M; m++) {
        ut = m / M;
        kk = Math.min(NS, Math.floor(ut * NS));
        d = q[kk] - sig(ut);
        err += d * d;
      }
      err = Math.sqrt(err / M);
      var S = setupCanvas(cv, H / W);
      var ctx = S.ctx, k = S.w / W;
      ctx.save(); ctx.scale(k, k);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0, 0, W, H);
      ctx.textAlign = "left";

      ctx.fillStyle = "#1B2530"; ctx.font = "700 15px -apple-system, sans-serif";
      ctx.fillText("把连续波形采样 + 量化：机器最终只拿到 0 和 1", PX0, 26);
      ctx.fillStyle = "#5c6b82"; ctx.font = "600 12px -apple-system, sans-serif";
      ctx.fillText("蓝线＝真实信号　橙线＝机器重建出来的样子　每个采样点被压到 " + lv + " 个档位之一", PX0, 46);

      var i2;
      ctx.strokeStyle = "#EDF0F6"; ctx.lineWidth = 1;
      for (i2 = 0; i2 < lv; i2++) {
        var lvv = -1 + 2 * i2 / (lv - 1);
        ctx.beginPath(); ctx.moveTo(PX0, yOf(lvv)); ctx.lineTo(PX1, yOf(lvv)); ctx.stroke();
      }
      ctx.strokeStyle = "#9AA7BE"; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(PX0, yOf(0)); ctx.lineTo(PX1, yOf(0)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PX0, PY1 - 10); ctx.lineTo(PX0, PY0); ctx.stroke();
      ctx.fillStyle = "#5c6b82"; ctx.font = "600 11px -apple-system, sans-serif";
      for (i2 = 0; i2 <= TPER; i2++) {
        ctx.textAlign = "center";
        ctx.fillText(i2 + "T", xOf(i2 / TPER), PY0 + 18);
      }
      ctx.textAlign = "left";

      ctx.strokeStyle = "#3B5BDB"; ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (i2 = 0; i2 <= 300; i2++) {
        uu = i2 / 300;
        var yy = yOf(sig(uu));
        if (i2 === 0) ctx.moveTo(xOf(uu), yy); else ctx.lineTo(xOf(uu), yy);
      }
      ctx.stroke();

      ctx.strokeStyle = "#E8590C"; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(xOf(0), yOf(q[0]));
      for (j = 1; j <= NS; j++) {
        ctx.lineTo(xOf(j / NS), yOf(q[j - 1]));
        ctx.lineTo(xOf(j / NS), yOf(q[j]));
      }
      ctx.stroke();

      for (j = 0; j <= NS; j++) {
        uu = j / NS;
        ctx.strokeStyle = "rgba(232,89,12,0.28)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(xOf(uu), yOf(sig(uu))); ctx.lineTo(xOf(uu), yOf(q[j])); ctx.stroke();
        ctx.fillStyle = "#3B5BDB";
        ctx.beginPath(); ctx.arc(xOf(uu), yOf(sig(uu)), 2.4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#E8590C";
        ctx.fillRect(xOf(uu) - 2.2, yOf(q[j]) - 2.2, 4.4, 4.4);
      }

      count = Math.min(NS, 30);
      step = (PX1 - PX0) / count;
      colw = Math.min(step - 3, 20);
      cellH = BAND_H / bits;
      ctx.fillStyle = "#5c6b82"; ctx.font = "600 11px -apple-system, sans-serif";
      ctx.fillText("样本编码（二进制，每一位不是 1 就是 0）", PX0, BAND_LABEL);
      for (j = 0; j < count; j++) {
        code = Math.round((q[j] + 1) / 2 * (lv - 1));
        for (bi = 0; bi < bits; bi++) {
          var bit = (code >> (bits - 1 - bi)) & 1;
          ctx.fillStyle = bit ? "#2B3440" : "#E7ECF3";
          ctx.fillRect(PX0 + j * step, BAND_TOP + bi * cellH, colw, cellH - 1);
        }
      }
      ctx.restore();

      if (vD) vD.textContent = dens + "";
      if (vB) vB.textContent = bits + "";
      if (out) {
        var verdict;
        if (dens < 4) verdict = "采样太稀：点根本抓不住波峰波谷，机器会把快波当成慢波（这叫混叠失真）。";
        else if (bits <= 2) verdict = "量化太粗：档位太少，重建出的信号成了台阶，细微变化全丢了。";
        else if (dens >= 12 && bits >= 6) verdict = "又密又细：重建的橙线几乎和真实蓝线重合，肉眼已看不出差别——这就是高质量数字化。";
        else verdict = "已经像那么回事了：想更接近真实，可以把采样调密一点、量化位数调高一点。";
        out.innerHTML = "采样密度 <b>" + dens + " 点/周期</b>（本图共 " + NS + " 个采样点）　·　量化 <b>" + bits +
          " 位</b>（" + lv + " 个档位）　·　重建误差 ≈ <b>" + (err * 100).toFixed(1) + "%</b>　·　" + verdict;
      }
    }
    if (sD) sD.addEventListener("input", draw);
    if (sB) sB.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw(performance.now());
  }

  function lab_turing(lab) {
  var P = {"label": "图灵机：读一格、写一格、左右移动"};

  var cv=$("canvas",lab); var sS=$('[data-ctrl="speed"]',lab);
  var out=$(".lab-readout",lab); var vSpan=sS?sS.closest(".ctrl").querySelector(".v"):null;
  var W=820,H=360;
  var tape=new Array(23).fill(0), pos=11, state=0, step=0, last=0, dir=1;
  function stepOnce(){
    var sym=tape[pos];
    if(state===0){ tape[pos]=sym?0:1; if(sym){dir=-1;state=1;}else{dir=1;state=0;} }
    else { tape[pos]=sym?0:1; if(sym){dir=1;state=0;}else{dir=-1;state=1;} }
    pos+=dir; if(pos<0)pos=0; if(pos>tape.length-1)pos=tape.length-1; step++;
  }
  function draw(ts){
    if(!last)last=ts; var dt=Math.min(0.05,(ts-last)/1000); last=ts;
    var sp=sS?parseFloat(sS.value):1;
    var n=Math.max(1,Math.round(sp*2));
    for(var i=0;i<n;i++) stepOnce();
    if(step>1500){ tape.fill(0); pos=11; state=0; step=0; }
    var S=setupCanvas(cv,H/W); var ctx=S.ctx,k=S.w/W;
    ctx.save(); ctx.scale(k,k); ctx.clearRect(0,0,W,H); ctx.fillStyle="#FBFCFE"; ctx.fillRect(0,0,W,H);
    var nc=tape.length, cw=Math.min(34,(W-40)/nc), x0=(W-nc*cw)/2, y=H/2-17;
    for(var i=0;i<nc;i++){
      var on=tape[i];
      ctx.fillStyle=on?"#3B5BDB":"#E7ECF3"; ctx.fillRect(x0+i*cw+1,y,cw-2,34);
      ctx.strokeStyle="#C9D3E0"; ctx.lineWidth=1; ctx.strokeRect(x0+i*cw+1,y,cw-2,34);
      ctx.fillStyle=on?"#fff":"#5C6B82"; ctx.font="600 13px -apple-system,sans-serif"; ctx.textAlign="center";
      ctx.fillText(on?"1":"0", x0+i*cw+cw/2, y+22);
    }
    ctx.fillStyle="#E8590C"; ctx.fillRect(x0+pos*cw+1, y-6, cw-2, 5);
    ctx.beginPath(); ctx.moveTo(x0+pos*cw+cw/2, y-6); ctx.lineTo(x0+pos*cw+cw/2-6, y-14); ctx.lineTo(x0+pos*cw+cw/2+6, y-14); ctx.closePath(); ctx.fill();
    ctx.textAlign="left"; ctx.fillStyle="#5C6B82"; ctx.font="600 13px -apple-system,sans-serif";
    ctx.fillText(P.label||"图灵机：读一格、写一格、左右移动", 14, 28);
    ctx.restore();
    if(vSpan)vSpan.textContent=sp.toFixed(1)+"×";
    if(out)out.innerHTML="状态 <b>"+(state===0?"A":"B")+"</b> · 已走 <b>"+step+"</b> 步：机器每步读一格、改写并移动——再简单的规则，也能完成计算。";
    requestAnimationFrame(draw);
  }
  if(sS)sS.addEventListener("input",draw);
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
        if (kind === "turing") lab_turing(lab);
        if (kind === "automaton") lab_automaton(lab);
        if (kind === "signal") lab_signal(lab);
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
