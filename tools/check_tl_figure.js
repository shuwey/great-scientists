// 渲染实测：时间轴配图「空框」问题 —— 改前 / 改后基线对比
// 判据：figure 宽 vs img 元素框 vs 内容(object-fit 后的实际像素) —— 三者分离即「空框」
// 用法：node tools/check_tl_figure.js [标签]
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');

const ROOT = process.cwd();
const TAG = process.argv[2] || 'baseline';
const PORT = 8092;
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.ico': 'image/x-icon' };
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
  .filter(d => fs.existsSync(path.join(ROOT, 'scientists', d, 'timeline.html')))
  .map(id => ({ id }));

(async () => {
  await new Promise(r => srv.listen(PORT, r));
  const browser = await chromium.launch();
  let fail = 0;
  for (const vp of [{ width: 1280, height: 900, tag: 'desktop' }, { width: 390, height: 844, tag: 'mobile' }]) {
    console.log(`\n########## ${TAG} · ${vp.tag} (${vp.width}px) ##########`);
    for (const site of SITES) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      const errs = [], bad = [];
      page.on('pageerror', e => errs.push(e.message));
      page.on('response', r => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url().split('/').slice(-1)[0]}`); });
      await page.goto(`http://localhost:${PORT}/scientists/${site.id}/timeline.html`, { waitUntil: 'networkidle' });

      await page.evaluate(() => {
        document.querySelectorAll('.tl-item').forEach(it => { if (it.querySelector('.tl-panel')) it.classList.add('open'); });
        // lazy 图统一转 eager，避免视口外漏测
        document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = 'eager'; });
      });
      await page.evaluate(async () => {
        const step = window.innerHeight * 0.8;
        for (let y = 0; y < document.body.scrollHeight; y += step) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(1200);

      const r = await page.evaluate(() => {
        const out = [];
        for (const it of document.querySelectorAll('.tl-item')) {
          const img = it.querySelector('figure img');
          if (!img) continue;
          const fig = img.closest('figure');
          const cap = fig ? fig.querySelector('figcaption') : null;
          const b = img.getBoundingClientRect();
          const fb = fig ? fig.getBoundingClientRect() : null;
          const cb = cap ? cap.getBoundingClientRect() : null;
          const nw = img.naturalWidth, nh = img.naturalHeight;
          const s = (nw && b.height) ? Math.min(b.width / nw, b.height / nh) : 0;
          out.push({
            year: it.dataset.year || '?',
            src: img.getAttribute('src').split('/').pop(),
            natural: [nw, nh],
            box: [Math.round(b.width), Math.round(b.height)],
            left: Math.round(b.left),
            figW: fb ? Math.round(fb.width) : null,
            figLeft: fb ? Math.round(fb.left) : null,
            capW: cb ? Math.round(cb.width) : null,
            capLeft: cb ? Math.round(cb.left) : null,
            content: [Math.round(nw * s), Math.round(nh * s)],
            loaded: img.complete && nw > 0,
          });
        }
        return out;
      });

      console.log(`\n--- ${site.id} ---`);
      console.log('  年份   源尺寸          figure宽  图片框      内容       空框%   图注宽  ');
      let worst = 0, worstSrc = '';
      for (const v of r) {
        const [cw, ch] = v.content, [bw, bh] = v.box;
        const gap = cw ? Math.round((1 - cw / bw) * 100) : NaN;
        const isSvg = /\.svg$/i.test(v.src);
        if (!isSvg && gap > worst) { worst = gap; worstSrc = v.src; }
        console.log(`  ${String(v.year).padEnd(6)} ${(v.natural[0] + 'x' + v.natural[1]).padEnd(14)} `
          + `${String(v.figW).padEnd(9)} ${(bw + 'x' + bh).padEnd(11)} ${(cw + 'x' + ch).padEnd(10)} `
          + `${String(gap + '%').padEnd(7)} ${v.capW}${isSvg ? '  [SVG]' : ''}${v.loaded ? '' : '  ❌未加载'}`);
      }
      console.log(`  → 位图最大空框 ${worst}%${worstSrc ? ' (' + worstSrc + ')' : ''}  |  ${r.length} 张图`);
      if (worst > 5) { console.log(`  ⚠️ 仍有位图空框 > 5%`); fail++; }
      if (errs.length) { console.log('  ❌ pageerror:', errs); fail++; }
      if (bad.length) { console.log('  ❌ 4xx/5xx:', bad); fail++; }
      await page.close();
    }
  }
  await browser.close(); srv.close();
  console.log(fail ? `\n结果：${fail} 项失败` : '\n结果：无 pageerror / 无 4xx');
  process.exit(fail ? 1 : 0);
})();
