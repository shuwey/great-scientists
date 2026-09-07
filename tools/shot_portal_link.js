const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const root = process.cwd(), PORT = 8074;
const M = {'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png'};
const srv = http.createServer((q,s)=>{let p=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(p.endsWith('/'))p+='index.html';
  fs.readFile(p,(e,d)=>{if(e){s.writeHead(404);s.end();return;}s.writeHead(200,{'Content-Type':M[path.extname(p)]||'application/octet-stream'});s.end(d);});});
(async()=>{
  await new Promise(r=>srv.listen(PORT,r));
  const b = await chromium.launch();
  let pg = await b.newPage({viewport:{width:1280,height:420}});
  await pg.goto(`http://localhost:${PORT}/scientists/curie/index.html`,{waitUntil:'networkidle'});
  await pg.screenshot({path:'tools/shots/portallink-desktop.png'});
  pg = await b.newPage({viewport:{width:390,height:700}});
  await pg.goto(`http://localhost:${PORT}/scientists/curie/index.html`,{waitUntil:'networkidle'});
  await pg.click('.nav-toggle'); await pg.waitForTimeout(300);
  await pg.screenshot({path:'tools/shots/portallink-mobile.png'});
  await b.close(); srv.close(); console.log('ok');
})();
