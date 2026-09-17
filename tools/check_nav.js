// 量测子站顶部导航在常见桌面宽度下是否折行/竖排
// 判据：链接内文本的 client rects 行数 > 1 即为折行（Range 只覆盖文本，不含 padding）
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const root = process.cwd();
const mime = {'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
const srv = http.createServer((req,res)=>{
  let p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (p.endsWith('/')) p += 'index.html';
  fs.readFile(p,(e,d)=>{ if(e){res.writeHead(404);res.end();return;}
    res.writeHead(200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream'});res.end(d);});
});
const ALL = ['copernicus','galileo','kepler','newton','faraday','darwin','pasteur','maxwell','mendeleev','curie','einstein','bohr','turing','feynman','hawking'];
const SITES = (process.argv[2] && process.argv[2] !== 'all') ? process.argv[2].split(',') : ALL;
const WIDTHS = (process.argv[3] ? process.argv[3].split(',').map(Number) : [1440,1280,1024]);
(async()=>{
  await new Promise(r=>srv.listen(8078,r));
  const browser = await chromium.launch();
  let bad = 0, total = 0;
  for (const sid of SITES){
    for (const w of WIDTHS){
      total++;
      const page = await browser.newPage({viewport:{width:w,height:900}});
      await page.goto('http://localhost:8078/scientists/'+sid+'/index.html',{waitUntil:'domcontentloaded'});
      const m = await page.evaluate(()=>{
        const nav = document.querySelector('.nav');
        const box = document.querySelector('.nav-links');
        const links = [...(box?box.querySelectorAll('a'):[])];
        if(!nav || !links.length) return {none:true};
        const lines = a => { const r=document.createRange(); r.selectNodeContents(a); return r.getClientRects().length; };
        const navR = nav.getBoundingClientRect(), boxR = box.getBoundingClientRect();
        const wrapped = links.filter(a=>lines(a)>1)
          .map(a=>({t:a.textContent.trim().slice(0,10), L:lines(a)}));
        // 溢出判据：链接盒底超出 nav 底边
        const overflow = links.filter(a=>a.getBoundingClientRect().bottom > navR.bottom + 1).length;
        return {navH:Math.round(navR.height), boxH:Math.round(boxR.height),
                boxW:Math.round(boxR.width), wrapped, overflow, n:links.length};
      });
      const flag = (m.wrapped&&m.wrapped.length) || m.overflow;
      if(flag) bad++;
      console.log(`${sid} ${w}px navH=${m.navH} 链接盒${m.boxW}x${m.boxH} 折行=${(m.wrapped||[]).length}/${m.n} 溢出=${m.overflow}` +
        (flag? '  <<< '+JSON.stringify(m.wrapped) : '  OK'));
      await page.close();
    }
  }
  console.log(`--- 问题组合 ${bad}/${total} ---`);
  await browser.close(); srv.close();
  setTimeout(() => process.exit(0), 300);
})();
