// 图注对齐方案目视对比：同一张图 × 五种图注 CSS，逐方案截「图片底部 + 图注」条带
// 用法：node tools/shot_tl_caption_cmp.js
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');

const ROOT = process.cwd();
const PORT = 8094;
const SHOTS = process.env.SHOTS_DIR || path.resolve(ROOT, '..', '读懂牛顿-验证产物', 'shots');
const OUT = path.join(SHOTS, 'einstein', 'caption-cmp');
fs.mkdirSync(OUT, { recursive: true });

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

const SEL_CAP = '.tl-body figcaption, .tl-panel figcaption';
const SEL_FIG = '.tl-body figure, .tl-panel figure';
const VARIANTS = [
  { id: 'V0', label: '现状：图注整行宽、左对齐', css: `` },
  { id: 'V1', label: 'V1 图注居中（不限宽）', css: `${SEL_CAP} { text-align: center; }` },
  { id: 'V2', label: 'V2 居中 + 限宽 30em', css: `${SEL_CAP} { text-align: center; max-width: 30em; margin-left: auto; margin-right: auto; }` },
  { id: 'V3', label: 'V3 figure 收缩成 table（图注=图宽）', css:
      `${SEL_FIG} { display: table; width: auto; margin-left: auto; margin-right: auto; }\n` +
      `${SEL_CAP} { display: table-caption; caption-side: bottom; text-align: center; }` },
  { id: 'V4', label: 'V4 figure width:fit-content', css:
      `${SEL_FIG} { width: fit-content; max-width: 100%; margin-left: auto; margin-right: auto; }\n` +
      `${SEL_CAP} { text-align: center; }` },
];

// 取样条目：（站, 年份, 说明）
const CASES = [
  { id: 'einstein', year: '1921', note: '典型：中位图注（11 字）+ 竖长肖像' },
  { id: 'newton', year: '1704', note: '极端：最长图注（45 字）+ 最窄图（194px）' },
];

(async () => {
  await new Promise(r => srv.listen(PORT, r));
  // reducedMotion: 消除 .tl-panel 的 fadeDown(opacity 0) 动画，否则会抓到空白
  const browser = await chromium.launch();
  const meta = [];

  for (const c of CASES) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
    await page.goto(`http://localhost:${PORT}/scientists/${c.id}/timeline.html`, { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      document.querySelectorAll('.tl-item').forEach(it => { if (it.querySelector('.tl-panel')) it.classList.add('open'); });
      document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = 'eager'; });
    });
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.8;
      for (let y = 0; y < document.body.scrollHeight; y += step) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 70)); }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1000);

    const got = await page.evaluate(({ year }) => {
      const it = [...document.querySelectorAll('.tl-item')].find(x => x.dataset.year === year);
      if (!it) return null;
      const fig = it.querySelector('figure');
      // 抓父容器（宽度恒定 944/1078），否则 figure 变 table 后宽度会跟着收缩，无法并排比较
      const host = fig.parentElement;
      host.setAttribute('data-target', '1');
      return { cap: (fig.querySelector('figcaption') || {}).textContent, ok: true };
    }, { year: c.year });
    if (!got || !got.ok) { console.log(`跳过 ${c.id} ${c.year}`); await page.close(); continue; }

    for (const v of VARIANTS) {
      await page.evaluate(({ css }) => {
        document.querySelectorAll('style[data-probe]').forEach(s => s.remove());
        const s = document.createElement('style');
        s.setAttribute('data-probe', '1'); s.textContent = css;
        document.head.appendChild(s);
      }, { css: v.css });
      await page.waitForTimeout(200);

      const geo = await page.evaluate(({ year }) => {
        const it = [...document.querySelectorAll('.tl-item')].find(x => x.dataset.year === year);
        const fig = it.querySelector('figure');
        const host = fig.parentElement;
        const cap = fig.querySelector('figcaption');
        const img = fig.querySelector('img');
        const hb = host.getBoundingClientRect(), cb = cap.getBoundingClientRect(), ib = img.getBoundingClientRect();
        const nw = img.naturalWidth, nh = img.naturalHeight;
        const s = (nw && ib.height) ? Math.min(ib.width / nw, ib.height / nh) : 0;
        return {
          hostW: Math.round(hb.width), hostH: Math.round(hb.height), hostLeft: Math.round(hb.left),
          figH: Math.round(fig.getBoundingClientRect().height),
          capTop: Math.round(cb.top - hb.top), capH: Math.round(cb.height),
          capW: Math.round(cb.width), capLeft: Math.round(cb.left - hb.left),
          figTop: Math.round(fig.getBoundingClientRect().top - hb.top),
          imgW: Math.round(ib.width), imgH: Math.round(ib.height),
          imgContentW: Math.round(nw * s), imgContentH: Math.round(nh * s),
          imgLeft: Math.round(ib.left - hb.left),
        };
      }, { year: c.year });

      const f = path.join(OUT, `${c.id}-${c.year}-${v.id}.png`);
      await page.locator(`[data-target="1"]`).screenshot({ path: f });
      meta.push({ site: c.id, year: c.year, note: c.note, variant: v.id, label: v.label, capText: (got.cap || '').trim(), file: path.basename(f), ...geo });
      console.log(`✓ ${c.id} ${c.year} ${v.id}  图注宽 ${geo.capW}  图内容宽 ${geo.imgContentW}  图注左 ${geo.capLeft} 图左 ${geo.imgLeft}`);
    }
    await page.close();
  }

  await browser.close(); srv.close();
  fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify(meta, null, 1));
  console.log(`\n→ ${OUT}`);
})();
