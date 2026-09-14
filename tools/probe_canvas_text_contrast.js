/**
 * 探针：画布内文字「实测对比度」+ 屏幕真实字号
 *
 * 方法（不做静态假设，直接量像素）：
 *  1) 劫持 CanvasRenderingContext2D 的 fillText / fillRect / fill / clearRect，
 *     以 clearRect 为"新的一帧"边界——每帧清空记录，于是 record 永远等于"当前位图那一帧"，
 *     保证后面量像素时，记录与画面严格对应（这一点很关键：移动的标签会跨帧换位置）。
 *  2) 量像素时（页面内 getImageData）对每条文字的包围盒做颜色直方图：
 *     众数色 = 它实际压着的底色；区域内除去底色外能达到的最大对比度 = 该文字"实际画出来的"
 *     对比度。不依赖"文字色 vs 猜出来的底色"这种静态推断。
 *
 * 用法：node tools/probe_canvas_text_contrast.js [视口宽=1440] [id1,id2|all]
 * 输出：<SHOTS_DIR>/labs-contrast/_measured.json
 */
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const OUT = '/Users/shuwei/WorkBuddy/读懂牛顿-验证产物/labs-contrast';
const PORT = 8139;
const BASE = `http://localhost:${PORT}`;
const PY = '/Users/shuwei/.workbuddy/binaries/python/versions/3.13.12/bin/python3';
const VW = Number(process.argv[2] || 1440);

const ALL = ['bohr', 'copernicus', 'curie', 'darwin', 'einstein', 'faraday', 'feynman',
  'galileo', 'hawking', 'kepler', 'maxwell', 'mendeleev', 'newton', 'pasteur', 'turing'];
const IDS = (!process.argv[3] || process.argv[3] === 'all') ? ALL : process.argv[3].split(',');

const waitServer = () => new Promise((res, rej) => {
  const t0 = Date.now();
  const tick = () => http.get(`${BASE}/index.html`, (r) => { r.destroy(); res(); })
    .on('error', () => (Date.now() - t0 > 15000 ? rej(new Error('timeout')) : setTimeout(tick, 300)));
  tick();
});

function installer() {
  const ID = new WeakMap();
  const EL = {};                        // id -> canvas 元素（只留在闭包里，不参与序列化）
  let next = 1;
  window.__cv = {};                     // id -> 可序列化的元数据 + 当前帧 ops

  function slot(c) {
    let id = ID.get(c);
    if (!id) {
      id = next++; ID.set(c, id); EL[id] = c;
      const labEl = c.closest && c.closest('.lab');
      window.__cv[id] = {
        lab: labEl ? labEl.getAttribute('data-lab') : '(非实验区)',
        cssBg: getComputedStyle(c).backgroundColor,
        w: c.width, h: c.height, frame: 0, ops: [],
      };
    }
    return id;
  }
  function snap(ctx) {
    const m = ctx.getTransform ? ctx.getTransform() : { a: 1 };
    return { fill: String(ctx.fillStyle), font: ctx.font, alpha: ctx.globalAlpha, k: m.a };
  }
  const P = CanvasRenderingContext2D.prototype;

  const _cr = P.clearRect;
  P.clearRect = function () {                    // 帧边界
    const id = slot(this.canvas);
    window.__cv[id].frame++; window.__cv[id].ops.length = 0;
    return _cr.apply(this, arguments);
  };
  const _ft = P.fillText;
  P.fillText = function (text, x, y) {
    const el = this.canvas, s = snap(this);
    const o = { t: 'text', text: String(text), x: +x, y: +y, fill: s.fill,
                font: s.font, alpha: s.alpha, k: s.k,
                ta: this.textAlign, tb: this.textBaseline };
    try { o.tw = this.measureText(o.text).width; } catch (e) { o.tw = 0; }
    window.__cv[slot(el)].ops.push(o);
    return _ft.apply(this, arguments);
  };
  const _fr = P.fillRect;
  P.fillRect = function (x, y, w, h) {
    const s = snap(this);
    window.__cv[slot(this.canvas)].ops.push({ t: 'rect', x: +x, y: +y, w: +w, h: +h, fill: s.fill });
    return _fr.apply(this, arguments);
  };
  const _f = P.fill;
  P.fill = function () {
    const s = snap(this);
    window.__cv[slot(this.canvas)].ops.push({ t: 'path', fill: s.fill });
    return _f.apply(this, arguments);
  };

  /* ---------------- 位图实测 ---------------- */
  function relLum(c) {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  }
  function contrast(a, b) {
    const l1 = relLum(a), l2 = relLum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }
  function cssRGB(s) {
    const m = /rgba?\(([^)]+)\)/.exec(s || '');
    if (!m) return [251, 252, 254];
    const p = m[1].split(',').map(parseFloat);
    return [p[0] || 0, p[1] || 0, p[2] || 0];
  }
  function hexRGB(s) {
    const m = /^#([0-9a-f]{6})$/i.exec(String(s || '').trim());
    if (!m) return null;
    const h = m[1];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }

  window.__measure = function () {
    const out = [];
    for (const id in window.__cv) {
      const s = window.__cv[id], el = EL[id];
      if (!el || el.tagName !== 'CANVAS') continue;
      const ctx = el.getContext('2d'), W = el.width, H = el.height, base = cssRGB(s.cssBg);
      let D;
      try { D = ctx.getImageData(0, 0, W, H).data; } catch (e) { continue; }
      for (const o of s.ops) {
        if (o.t !== 'text' || !o.text.trim()) continue;
        const k = o.k || 1;
        const mm = /(\d+(?:\.\d+)?)px/.exec(o.font || '');
        const fpk = mm ? parseFloat(mm[1]) : 13;
        const fh = fpk * k;
        const tw = (o.tw || o.text.length * fpk) * k;
        // 必须按 textAlign / textBaseline 还原包围盒：
        // 居中/右对齐的标签若按左对齐取框，框里根本没有字 → 会实测成"纯底色"（假阳性）。
        const ta = o.ta || 'start', tb = o.tb || 'alphabetic';
        let xl = o.x * k;
        if (ta === 'center') xl -= tw / 2;
        else if (ta === 'right' || ta === 'end') xl -= tw;
        let yt = o.y * k;
        if (tb === 'middle') yt -= fh / 2;
        else if (tb === 'top' || tb === 'hanging') yt -= fh * 0.15;
        else yt -= fh * 0.82;
        let l = Math.round(xl - 2), t = Math.round(yt - 2);
        let w = Math.round(Math.min(tw, W) + 4), hh = Math.round(fh * 1.15 + 4);
        l = Math.max(0, Math.min(l, W - 3)); t = Math.max(0, Math.min(t, H - 3));
        w = Math.max(3, Math.min(w, W - l)); hh = Math.max(3, Math.min(hh, H - t));
        const hist = new Map();
        for (let y = t; y < t + hh; y++) {
          for (let x = l; x < l + w; x++) {
            const i = (y * W + x) * 4, a = D[i + 3] / 255;
            const r = D[i] * a + base[0] * (1 - a), g = D[i + 1] * a + base[1] * (1 - a), b = D[i + 2] * a + base[2] * (1 - a);
            const key = (r >> 2 << 12) | (g >> 2 << 6) | (b >> 2);
            hist.set(key, (hist.get(key) || 0) + 1);
          }
        }
        let modeKey = 0, modeN = -1;
        for (const [key, n] of hist) if (n > modeN) { modeN = n; modeKey = key; }
        const unq = (key, sh) => ((key >> sh) & 63) * 255 / 63;
        const bg = [unq(modeKey, 12), unq(modeKey, 6), unq(modeKey, 0)];
        let crMax = 1, crMaxColor = bg;
        for (const [key, n] of hist) {
          if (n < 2 || key === modeKey) continue;
          const c = [unq(key, 12), unq(key, 6), unq(key, 0)];
          const cr = contrast(c, bg);
          if (cr > crMax) { crMax = cr; crMaxColor = c; }
        }
        const decl = hexRGB(o.fill);
        out.push({
          lab: s.lab, text: o.text, fpk: +fh.toFixed(1), screen: +fh.toFixed(1),
          decl: o.fill, bg: bg.map(Math.round), bgShare: +(modeN / (w * hh)).toFixed(2),
          crMax: +crMax.toFixed(2), crMaxColor: crMaxColor.map(Math.round),
          crDecl: decl ? +contrast(decl, bg).toFixed(2) : null,
          px: w * hh, colors: hist.size,
        });
      }
    }
    return out;
  };
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const srv = spawn(PY, ['-m', 'http.server', String(PORT), '--directory', ROOT], { stdio: 'ignore' });
  const all = [];
  try {
    await waitServer();
    const browser = await chromium.launch();
    const ctx = await browser.newContext({ viewport: { width: VW, height: 1000 } });
    await ctx.addInitScript(installer);
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('pageerror', (e) => errs.push(e.message));
    for (const id of IDS) {
      errs.length = 0;
      await pg.goto(`${BASE}/scientists/${id}/labs.html`, { waitUntil: 'networkidle' });
      await pg.waitForTimeout(900);
      const rows = await pg.evaluate(() => window.__measure());
      rows.forEach((r) => all.push(Object.assign({ st: id }, r)));
      const bad = rows.filter((r) => r.crMax < 3).length;
      console.log(`  · ${id}：${rows.length} 条文字，其中实测对比度 <3.0 的 ${bad} 条${errs.length ? '  ⚠️' + errs[0] : ''}`);
    }
    await browser.close();
    fs.writeFileSync(path.join(OUT, '_measured.json'), JSON.stringify(all, null, 1));
    console.log(`\n✅ 实测数据 → ${OUT}/_measured.json（${all.length} 条）`);
  } catch (e) { console.error('❌', e.message); } finally { srv.kill(); }
  setTimeout(() => process.exit(0), 300);
})();
