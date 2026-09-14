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
(async()=>{
  await new Promise(r=>srv.listen(8077,r));
  const browser = await chromium.launch();
  for (const sid of ['curie','galileo','hawking']){
    for (const vp of [{width:1280,height:900},{width:390,height:844}]){
      const page = await browser.newPage({viewport:vp});
      const errs=[]; page.on('pageerror',e=>errs.push(e.message));
      await page.goto('http://localhost:8077/scientists/'+sid+'/index.html',{waitUntil:'networkidle'});
      const m = await page.evaluate(()=>{
        const img=document.querySelector('.hero-art img');
        const grid=document.querySelector('.hero-grid');
        if(!img) return {noimg:true};
        const r=img.getBoundingClientRect(), g=grid?grid.getBoundingClientRect():null;
        const gcs=getComputedStyle(grid||document.querySelector('.hero'));
        return {imgW:Math.round(r.width), imgH:Math.round(r.height),
                gridCols:gcs.gridTemplateColumns, gridDisp:gcs.display,
                gridW:g?Math.round(g.width):0};
      });
      console.log(sid, vp.width+'px', JSON.stringify(m), 'errs:'+errs.length);
      await page.close();
    }
  }
  await browser.close(); srv.close();
  setTimeout(() => process.exit(0), 300);
})();
