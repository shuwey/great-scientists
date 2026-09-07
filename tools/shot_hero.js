const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const root = process.cwd();
const mime = {'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg'};
const srv = http.createServer((req,res)=>{
  let p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (p.endsWith('/')) p += 'index.html';
  fs.readFile(p,(e,d)=>{ if(e){res.writeHead(404);res.end();return;}
    res.writeHead(200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream'});res.end(d);});
});
(async()=>{
  await new Promise(r=>srv.listen(8078,r));
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport:{width:1280,height:760}});
  await page.goto('http://localhost:8078/scientists/curie/index.html',{waitUntil:'networkidle'});
  await page.screenshot({path:'tools/shots/hero-fixed-curie.png'});
  await page.goto('http://localhost:8078/scientists/galileo/index.html',{waitUntil:'networkidle'});
  await page.screenshot({path:'tools/shots/hero-fixed-galileo.png'});
  await browser.close(); srv.close();
  console.log('shots done');
})();
