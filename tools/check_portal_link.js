// 验证「返回系列门户」入口：桌面点 .portal-link、移动端点汉堡菜单里的 .nav-portal，
// 都要跳回根 index.html（含 13 张 .ach-card）。同时确认时间轴未回归。
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');

const ROOT = process.cwd();
const PORT = 8075;
const MIME = {'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
const srv = http.createServer((req,res)=>{
  let p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (p.endsWith('/')) p += 'index.html';
  fs.readFile(p,(e,d)=>{ if(e){res.writeHead(404);res.end();return;}
    res.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'});res.end(d);});
});

// [子站, 页面] —— 覆盖子站根层与 detail 层两种相对路径
const CASES = [
  ['curie', 'index.html'], ['curie', 'detail/decay.html'],
  ['hawking', 'labs.html'], ['newton', 'timeline.html'],
  ['galileo', 'index.html'], ['einstein', 'detail/relativity.html'],
];

(async () => {
  await new Promise(r => srv.listen(PORT, r));
  const browser = await chromium.launch();
  let bad = 0;

  for (const [sid, page] of CASES) {
    for (const vp of [{w:1280,h:900,tag:'desktop'},{w:390,h:844,tag:'mobile'}]) {
      const ctx = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
      const errs = []; ctx.on('pageerror', e => errs.push(e.message));
      await ctx.goto(`http://localhost:${PORT}/scientists/${sid}/${page}`, { waitUntil: 'networkidle' });

      const sel = vp.tag === 'desktop' ? '.portal-link' : '.nav-portal';
      let res = { ok:false, why:'' };
      try {
        if (vp.tag === 'mobile') await ctx.click('.nav-toggle');
        await ctx.click(sel, { timeout: 3000 });
        await ctx.waitForLoadState('networkidle');
        const url = ctx.url();
        const cards = await ctx.locator('.ach-card').count();
        res = { ok: cards === 13 && /\/index\.html$/.test(url), why: `url=${url.replace(`http://localhost:${PORT}/`,'')} cards=${cards}` };
      } catch (e) {
        res = { ok:false, why: '点击/跳转失败: ' + e.message.split('\n')[0] };
      }
      if (!res.ok || errs.length) bad++;
      console.log(`${res.ok && !errs.length ? '✅' : '❌'} ${sid}/${page.padEnd(20)} ${vp.tag.padEnd(7)} ${sel.padEnd(13)} ${res.why} 报错${errs.length}`);
      await ctx.close();
    }
  }

  // 时间轴回归：年代 vs 配图不得重叠
  for (const sid of ['curie','newton','einstein','galileo']) {
    const ctx = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await ctx.goto(`http://localhost:${PORT}/scientists/${sid}/timeline.html`, { waitUntil: 'networkidle' });
    const r = await ctx.evaluate(() => {
      let ov = 0;
      for (const it of document.querySelectorAll('.tl-item')) {
        const y = it.querySelector('.tl-year'), g = it.querySelector('figure img, .tl-panel figure img');
        if (!y || !g) continue;
        const a = y.getBoundingClientRect(), b = g.getBoundingClientRect();
        if (Math.min(a.right,b.right) - Math.max(a.left,b.left) > 1 &&
            Math.min(a.bottom,b.bottom) - Math.max(a.top,b.top) > 1) ov++;
      }
      return { items: document.querySelectorAll('.tl-item').length, ov };
    });
    if (r.ov) bad++;
    console.log(`${r.ov ? '❌' : '✅'} ${sid} 时间轴 条目${r.items} 重叠${r.ov}`);
    await ctx.close();
  }

  await browser.close(); srv.close();
  console.log(bad ? `\n❌ ${bad} 项未通过` : '\n✅ 全部通过：返回入口可用、时间轴无回归');
  process.exit(bad ? 1 : 0);
})();
