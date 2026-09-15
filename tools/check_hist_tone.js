// 历史肖像影调统一（B 方案）量化验收
// 1) 覆盖率：所有 img[src*="-portrait"] 都必须吃到 --hist-tone（computed filter 含 grayscale）
// 2) 影调目标：改前/改后「明度中位数极差」——B 方案应把极差压下来（实测 B 参考值 176→151 于图标口径）
// 3) 曲线保真：站内实渲染像素 vs PIL 参考 B（灰度→#161310/#F2EEE8 斜坡）的 MAE
// 4) 回归：无 4xx / 无 pageerror
// 用法：node tools/check_hist_tone.js [标签]
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');

const ROOT = process.cwd();
const TAG = process.argv[2] || 'hist-tone';
const PORT = 8096;
const SHOTS_DIR = process.env.SHOTS_DIR
  || path.resolve(ROOT, '..', '读懂牛顿-验证产物', 'shots', 'tone', 'render');
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.json': 'application/json', '.ico': 'image/x-icon' };
const srv = http.createServer((req, res) => {
  let p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (p.endsWith('/')) p += 'index.html';
  fs.readFile(p, (e, d) => {
    if (e) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
    res.end(d);
  });
});

const SITES = fs.readdirSync(path.join(ROOT, 'scientists'))
  .filter(d => fs.existsSync(path.join(ROOT, 'scientists', d, 'index.html'))).map(id => ({ id }));
const PAGES = [
  { label: 'portal', url: 'index.html' },
  ...SITES.map(s => ({ label: s.id, url: `scientists/${s.id}/index.html` })),
  ...SITES.map(s => ({ label: s.id + '/tl', url: `scientists/${s.id}/timeline.html` })),
].filter(p => fs.existsSync(path.join(ROOT, p.url)));

// 与 16 份 style.css 里的 --hist-tone 必须一致（--px-only 模式下作为兜底）
const CSS_FILTER = 'grayscale(1) sepia(.07) saturate(1.87) brightness(.99) contrast(.85)';

// 曲线保真抽验：挑「彩色油画 / 暖褐油画 / 纯灰照片」三类各一张
const SAMPLE = [
  ['copernicus-portrait', 'scientists/copernicus/assets/img/history/copernicus-portrait.jpg'],
  ['galileo-portrait', 'scientists/galileo/assets/img/history/galileo-portrait.jpg'],
  ['maxwell-portrait', 'scientists/maxwell/assets/img/history/maxwell-portrait.jpg'],
];
const PX_ONLY = process.argv.includes('--px-only');
const PXW = 0;               // 0 = 按原图尺寸渲染（不做缩放，排除重采样对 MAE 的干扰）

(async () => {
  fs.mkdirSync(SHOTS_DIR, { recursive: true });
  await new Promise(r => srv.listen(PORT, r));
  const browser = await chromium.launch();
  let fail = 0;

  // ---------- 1) 覆盖率 + 回归 ----------
  const seen = new Map();      // src -> {before, after}
  const filters = new Set();
  let imgTotal = 0;
  if (!PX_ONLY)
  for (const vp of [{ width: 1280, height: 900, tag: 'desktop' }, { width: 390, height: 844, tag: 'mobile' }]) {
    console.log(`\n########## ${TAG} · ${vp.tag} (${vp.width}px) ##########`);
    for (const pg of PAGES) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, reducedMotion: 'reduce' });
      const errs = [], bad = [];
      page.on('pageerror', e => errs.push(e.message));
      page.on('response', r => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url().split('/').slice(-1)[0]}`); });
      await page.goto(`http://localhost:${PORT}/${pg.url}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => {
        document.querySelectorAll('.tl-item').forEach(it => { if (it.querySelector('.tl-panel')) it.classList.add('open'); });
        document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = 'eager'; });
      });
      await page.evaluate(async () => {
        const step = window.innerHeight * 0.8;
        for (let y = 0; y < document.body.scrollHeight; y += step) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(400);

      const r = await page.evaluate(async () => {
        const list = [...document.querySelectorAll('img[src*="-portrait"]')];
        const out = [];
        for (const im of list) {
          if (!im.complete || !im.naturalWidth) { try { await im.decode(); } catch (e) { } }
          const cs = getComputedStyle(im);
          out.push({
            src: im.getAttribute('src'), filter: cs.filter,
            box: [Math.round(im.getBoundingClientRect().width), Math.round(im.getBoundingClientRect().height)],
            ok: im.complete && im.naturalWidth > 0,
          });
          // 画布量：改前（无滤镜）与改后（同一 computed filter）的 256px 缩略统计
          const S = 256, c = document.createElement('canvas'); c.width = c.height = S;
          const cx = c.getContext('2d');
          const draw = (f) => { cx.filter = f; cx.clearRect(0, 0, S, S); cx.drawImage(im, 0, 0, S, S); return cx.getImageData(0, 0, S, S).data; };
          const stat = (d) => {
            const L = new Float64Array(S * S); let ch = 0;
            for (let i = 0, j = 0; i < d.length; i += 4, j++) {
              L[j] = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
              ch += Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]);
            }
            const s = Float64Array.from(L).sort();
            return { med: s[Math.floor(s.length / 2)], chroma: ch / (S * S) };
          };
          out[out.length - 1].before = stat(draw('none'));
          out[out.length - 1].after = stat(draw(cs.filter === 'none' ? 'none' : cs.filter));
        }
        return out;
      });

      const miss = r.filter(v => !/grayscale/.test(v.filter));
      const broken = r.filter(v => !v.ok);
      imgTotal += r.length;
      r.forEach(v => filters.add(v.filter));
      if (!seen.size) r.forEach(v => { if (!seen.has(v.src)) seen.set(v.src, v); });
      else r.forEach(v => { if (!seen.has(v.src)) seen.set(v.src, v); });
      console.log(`  ${pg.label.padEnd(16)} 肖像 ${String(r.length).padStart(2)} 张 ｜ 未吃到滤镜 ${miss.length} ｜ 加载失败 ${broken.length} ｜ pageerror ${errs.length} ｜ 4xx ${bad.length}`);
      if (miss.length) { console.log('     ❌ 未吃到：', miss.map(m => m.src)); fail++; }
      if (broken.length) { console.log('     ❌ 加载失败：', broken.map(b => b.src)); fail++; }
      if (errs.length) { console.log('     ❌ pageerror:', errs); fail++; }
      if (bad.length) { console.log('     ❌ 4xx/5xx:', bad); fail++; }
      await page.close();
    }
  }
  console.log(`\n---- 覆盖率 ----\n共 ${imgTotal} 处肖像引用 ｜ computed filter 去重 ${filters.size} 种：`);
  filters.forEach(f => console.log('   ', f));

  // ---------- 2) 影调目标：明度中位数极差 ----------
  const uniq = [...seen.values()].filter(v => v.before && v.after);
  const b = uniq.map(v => v.before.med), a = uniq.map(v => v.after.med);
  const spread = xs => xs.length ? Math.max(...xs) - Math.min(...xs) : 0;
  const cb = uniq.map(v => v.before.chroma), ca = uniq.map(v => v.after.chroma);
  if (uniq.length) {
    console.log(`\n---- 影调目标（${uniq.length} 张唯一肖像，256px 缩略口径）----`);
    console.log(`  明度中位数极差   改前 ${spread(b).toFixed(1)}  →  改后 ${spread(a).toFixed(1)}`);
    console.log(`  明度中位数区间   改前 [${Math.min(...b).toFixed(0)}–${Math.max(...b).toFixed(0)}]  →  改后 [${Math.min(...a).toFixed(0)}–${Math.max(...a).toFixed(0)}]`);
    console.log(`  平均色度(chroma) 改前 ${(cb.reduce((x, y) => x + y, 0) / cb.length).toFixed(1)}  →  改后 ${(ca.reduce((x, y) => x + y, 0) / ca.length).toFixed(1)}`);
    const rows = uniq.map(v => ({ src: v.src.split('/').pop(), b: v.before.med.toFixed(0), a: v.after.med.toFixed(0), cb: v.before.chroma.toFixed(1), ca: v.after.chroma.toFixed(1) }))
      .sort((x, y) => x.a - y.a);
    console.log('  逐张（改后明度升序）：');
    rows.forEach(x => console.log(`    ${x.src.padEnd(30)} L ${String(x.b).padStart(3)} → ${String(x.a).padStart(3)} ｜ chroma ${x.cb.padStart(5)} → ${x.ca.padStart(5)}`));
  }

  // ---------- 3) 曲线保真：站内渲染像素 vs PIL 参考 B ----------
  console.log(`\n---- 曲线保真（实渲染 vs PIL 参考 B）----`);
  const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 1 });
  for (const [name, rel] of SAMPLE) {
    const filter = [...filters].find(f => /grayscale/.test(f)) || CSS_FILTER;
    await page.setContent(`<body style="margin:0;background:#fff"><img id="t" src="http://localhost:${PORT}/${rel}" style="display:block;${PXW ? `width:${PXW}px;` : ''}height:auto;filter:${filter}"></body>`);
    await page.waitForFunction(() => { const i = document.getElementById('t'); return i.complete && i.naturalWidth > 0; });
    const el = await page.$('#t');
    const out = path.join(SHOTS_DIR, `${name}-render.png`);
    await el.screenshot({ path: out });
    const nb = await el.boundingBox();
    console.log(`  ${name.padEnd(22)} ${Math.round(nb.width)}×${Math.round(nb.height)}（原图尺寸渲染）→ ${out}`);
  }
  await page.close();

  await browser.close(); srv.close();
  console.log(`\n${fail ? `❌ ${fail} 项失败` : '✅ 覆盖与回归全部通过'}`);
  process.exit(fail ? 1 : 0);
})();
