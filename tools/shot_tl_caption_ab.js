// 图注对齐 A/B 实拍：同一页面只切换 text-align 这一条，截同一元素的「图片底部 + 图注」条带
// 用法：node tools/shot_tl_caption_ab.js
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');

const ROOT = process.cwd();
const PORT = 8096;
const SHOTS = process.env.SHOTS_DIR || path.resolve(ROOT, '..', '读懂牛顿-验证产物', 'shots');
const OUT = path.join(SHOTS, 'einstein', 'caption-ab');
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

// 还原「改前」：图注回到整行宽左对齐
const BEFORE = `.tl-body figcaption, .tl-panel figcaption { text-align: left !important; }`;

const CASES = [
  { id: 'einstein', year: '1921', note: '典型：中位图注 + 竖长肖像（折叠式，max-height 360）' },
  { id: 'newton', year: '1704', note: '极端：最长图注 45 字（折叠式）' },
  { id: 'bohr', year: '1943', note: '静态式时间轴（内容列更宽 1078px）' },
  { id: 'galileo', year: '1610', note: '伽利略（唯一有重复规则、且源图偏小的站）' },
];

(async () => {
  await new Promise(r => srv.listen(PORT, r));
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
    await page.waitForTimeout(900);

    const found = await page.evaluate(({ year }) => {
      const it = [...document.querySelectorAll('.tl-item')].find(x => x.dataset.year === year);
      if (!it) return false;
      const fig = it.querySelector('figure');
      if (!fig) return false;
      fig.parentElement.setAttribute('data-target', '1');
      return true;
    }, { year: c.year });
    if (!found) { console.log(`跳过 ${c.id} ${c.year}`); await page.close(); continue; }

    for (const [tag, on] of [['before', true], ['after', false]]) {
      await page.evaluate(({ css, on }) => {
        const old = document.getElementById('__ab'); if (old) old.remove();
        if (on) { const s = document.createElement('style'); s.id = '__ab'; s.textContent = css; document.head.appendChild(s); }
      }, { css: BEFORE, on });
      await page.waitForTimeout(220);

      const geo = await page.evaluate(({ year }) => {
        const it = [...document.querySelectorAll('.tl-item')].find(x => x.dataset.year === year);
        const fig = it.querySelector('figure'), host = fig.parentElement;
        const cap = fig.querySelector('figcaption'), img = fig.querySelector('img');
        const hb = host.getBoundingClientRect(), cb = cap.getBoundingClientRect(), ib = img.getBoundingClientRect();
        const rng = document.createRange(); rng.selectNodeContents(cap);
        const tb = rng.getBoundingClientRect();
        return {
          hostW: Math.round(hb.width),
          figBottom: Math.round(fig.getBoundingClientRect().bottom - hb.top),
          capTop: Math.round(cb.top - hb.top), capH: Math.round(cb.height),
          capW: Math.round(cb.width), capLeft: Math.round(cb.left - hb.left),
          imgLeft: Math.round(ib.left - hb.left), imgW: Math.round(ib.width),
          imgH: Math.round(ib.height), nw: img.naturalWidth, nh: img.naturalHeight,
          imgCenter: ib.left + ib.width / 2, textCenter: tb.left + tb.width / 2,
          capText: cap.textContent.replace(/\s+/g, ' ').trim(),
        };
      }, { year: c.year });

      const f = path.join(OUT, `${c.id}-${c.year}-${tag}.png`);
      await page.locator('[data-target="1"]').screenshot({ path: f });
      meta.push({ site: c.id, year: c.year, note: c.note, tag, file: path.basename(f), ...geo });
      console.log(`✓ ${c.id} ${c.year} ${tag.padEnd(6)} 图注中心 ${geo.textCenter.toFixed(1)}  图片中心 ${geo.imgCenter.toFixed(1)}  偏差 ${Math.abs(geo.textCenter - geo.imgCenter).toFixed(1)}px`);
    }
    await page.close();
  }
  await browser.close(); srv.close();
  fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify(meta, null, 1));
  console.log(`\n→ ${OUT}`);
})();
