// 实测时间轴：年代(.tl-year) 与配图(figure img) 是否矩形重叠 + 截图
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');

const ROOT = process.cwd();
const PORT = 8076;
// 截图输出目录：默认放在项目**外**（不参与静态发布上传），可用 SHOTS_DIR 覆盖
const SHOTS = process.env.SHOTS_DIR || path.resolve(ROOT, '..', '读懂牛顿-验证产物', 'shots');
const MIME = {'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
const srv = http.createServer((req,res)=>{
  let p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (p.endsWith('/')) p += 'index.html';
  fs.readFile(p,(e,d)=>{ if(e){res.writeHead(404);res.end();return;}
    res.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'});res.end(d);});
});

const IDS = (process.argv[2] ? process.argv[2].split(',') : ['curie','bohr','turing','hawking','copernicus','galileo']);

(async () => {
  await new Promise(r => srv.listen(PORT, r));
  const browser = await chromium.launch();
  let bad = 0;
  for (const sid of IDS) {
    for (const vp of [{width:1280,height:900,tag:'desktop'},{width:390,height:844,tag:'mobile'}]) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      const errs = []; page.on('pageerror', e => errs.push(e.message));
      await page.goto(`http://localhost:${PORT}/scientists/${sid}/timeline.html`, { waitUntil: 'networkidle' });
      const r = await page.evaluate(() => {
        const items = [...document.querySelectorAll('.tl-item')];
        let overlaps = 0, worst = null, years = 0, imgs = 0, dots = 0;
        for (const it of items) {
          const y = it.querySelector('.tl-year');
          const g = it.querySelector('figure img');
          const d = it.querySelector('.tl-rail .dot, .tl-rail .tl-dot');
          if (y) years++;
          if (d) dots++;
          if (!y || !g) continue;
          imgs++;
          const a = y.getBoundingClientRect(), b = g.getBoundingClientRect();
          const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (ox > 1 && oy > 1) {
            overlaps++;
            const area = Math.round(ox * oy);
            if (!worst || area > worst.area) worst = { area, ox: Math.round(ox), oy: Math.round(oy), year: y.textContent.trim() };
          }
        }
        return { items: items.length, years, imgs, dots, overlaps, worst };
      });
      const flag = r.overlaps > 0 || errs.length ? '❌' : '✅';
      if (r.overlaps > 0 || errs.length) bad++;
      console.log(`${flag} ${sid} ${vp.tag.padEnd(7)} 条目${r.items} 年代${r.years} 配图${r.imgs} 圆点${r.dots} 重叠${r.overlaps}` +
        (r.worst ? ` 最大重叠 ${r.worst.ox}x${r.worst.oy}px (${r.worst.year})` : '') + ` 报错${errs.length}`);
      if (vp.tag === 'desktop') {
        fs.mkdirSync(SHOTS, { recursive: true });
        await page.screenshot({ path: path.join(SHOTS, `tl-${sid}.png`) });
      }
      await page.close();
    }
  }
  await browser.close(); srv.close();
  console.log(bad ? `\n❌ ${bad} 个组合仍有问题` : '\n✅ 全部通过：无重叠、无报错');
  process.exit(bad ? 1 : 0);
})();
