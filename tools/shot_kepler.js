const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const root = process.cwd(), PORT = 8073;
// 截图输出目录：默认放在项目**外**（不参与静态发布上传），可用 SHOTS_DIR 覆盖
const SHOTS = process.env.SHOTS_DIR || path.resolve(root, '..', '读懂牛顿-验证产物', 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const M = {'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png'};
const srv = http.createServer((q,s)=>{let p=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(p.endsWith('/'))p+='index.html';
  fs.readFile(p,(e,d)=>{if(e){s.writeHead(404);s.end();return;}s.writeHead(200,{'Content-Type':M[path.extname(p)]||'application/octet-stream'});s.end(d);});});
(async()=>{
  await new Promise(r=>srv.listen(PORT,r));
  const b = await chromium.launch();
  let pg = await b.newPage({viewport:{width:1280,height:520}});
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto(`http://localhost:${PORT}/scientists/kepler/index.html`,{waitUntil:'networkidle'});
  const heroOk = await pg.evaluate(()=>{const i=document.querySelector('.hero-art img');return i&&i.naturalWidth>0&&i.getBoundingClientRect().width>100;});
  await pg.screenshot({path:path.join(SHOTS,'kepler-hero-fixed.png')});
  await pg.goto(`http://localhost:${PORT}/scientists/kepler/detail/laws.html`,{waitUntil:'networkidle'});
  const figOk = await pg.evaluate(()=>{const i=document.querySelector('figure.fig img');return i&&i.naturalWidth>0;});
  await pg.screenshot({path:path.join(SHOTS,'kepler-laws-fixed.png')});
  console.log('hero 加载:',heroOk,'| laws 配图加载:',figOk,'| 报错:',errs.length);
  await b.close(); srv.close();
  setTimeout(() => process.exit(0), 300);
})();
