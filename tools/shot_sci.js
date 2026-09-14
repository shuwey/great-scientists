const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const root = process.cwd(), PORT = 8071;
// 截图输出目录：默认放在项目**外**（不参与静态发布上传），可用 SHOTS_DIR 覆盖
const SHOTS = process.env.SHOTS_DIR || path.resolve(root, '..', '读懂牛顿-验证产物', 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const M = {'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png'};
const srv = http.createServer((q,s)=>{let p=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(p.endsWith('/'))p+='index.html';
  fs.readFile(p,(e,d)=>{if(e){s.writeHead(404);s.end();return;}s.writeHead(200,{'Content-Type':M[path.extname(p)]||'application/octet-stream'});s.end(d);});});
const JOBS = [
  ['faraday','index.html','sci-faraday-home'],
  ['faraday','labs.html','sci-faraday-labs'],
  ['feynman','index.html','sci-feynman-home'],
  ['feynman','labs.html','sci-feynman-labs'],
];
(async()=>{
  await new Promise(r=>srv.listen(PORT,r));
  const b = await chromium.launch();
  const pg = await b.newPage({viewport:{width:1280,height:820}});
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  for(const [sid,page,name] of JOBS){
    await pg.goto(`http://localhost:${PORT}/scientists/${sid}/${page}`,{waitUntil:'networkidle'});
    await pg.waitForTimeout(900);
    await pg.screenshot({path:path.join(SHOTS, `${name}.png`)});
    const info = await pg.evaluate(()=>{
      const cvs=[...document.querySelectorAll('.lab canvas')].map(c=>{
        const r=c.getBoundingClientRect();
        const ctx=c.getContext('2d'); let painted=0;
        try{const d=ctx.getImageData(0,0,c.width,c.height).data;for(let i=0;i<d.length;i+=4000){if(d[i+3]>0)painted++;}}catch(e){}
        return Math.round(r.width)+'x'+Math.round(r.height)+':'+painted;
      });
      const hero=document.querySelector('.hero-art img');
      return {canvas:cvs, hero: hero?Math.round(hero.getBoundingClientRect().width)+'x'+Math.round(hero.getBoundingClientRect().height):'无'};
    });
    console.log(sid, page, 'hero='+info.hero, 'canvas='+JSON.stringify(info.canvas));
  }
  console.log('运行时报错:', errs.length, errs.slice(0,3));
  await b.close(); srv.close();
})();
