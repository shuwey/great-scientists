// 验证「同期中国」卡片：年号换算、事件与人物命中、无运行时报错
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const http=require('http'),fs=require('fs'),path=require('path');
const root=process.cwd();
const OUT='/Users/shuwei/WorkBuddy/读懂牛顿-验证产物/shots';
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg'};
const srv=http.createServer((q,s)=>{let p=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(p.endsWith('/'))p+='index.html';
 fs.readFile(p,(e,d)=>{if(e){s.writeHead(404);s.end();return;}s.writeHead(200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream'});s.end(d);});});
const SID = process.argv[2] || 'copernicus';
(async()=>{fs.mkdirSync(OUT,{recursive:true});await new Promise(r=>srv.listen(8085,r));
 const b=await chromium.launch();
 for (const vp of [{width:1280,height:1000},{width:390,height:844}]){
  const page=await b.newPage({viewport:vp});
  const errs=[];page.on('pageerror',e=>errs.push(e.message));
  await page.goto('http://localhost:8085/scientists/'+SID+'/timeline.html',{waitUntil:'networkidle'});
  const r=await page.evaluate(()=>{
    const nodes=[...document.querySelectorAll('[data-year]')];
    return nodes.map(n=>{
      const y=n.getAttribute('data-year');
      const note=n.querySelector('.cn-note');
      if(!note) return {y, missing:true};
      const head=note.querySelector('.cn-head').textContent.trim();
      const evs=[...note.querySelectorAll('.cn-row ul li')].length;
      const hasFig=!!note.querySelector('.cn-fig');
      return {y, head, rows:evs, fig:hasFig};
    });
  });
  console.log('--- '+vp.width+'px ---  pageerror='+errs.length);
  r.forEach(x=>console.log('  '+x.y+' → '+(x.missing?'❌ 无卡片':x.head+' | 条目'+x.rows+(x.fig?' | 有人物':''))));
  await page.screenshot({path:`${OUT}/china-${SID}-${vp.width}.png`, fullPage:vp.width<500?false:true});
  await page.close();
 }
 await b.close();srv.close();setTimeout(()=>process.exit(0),300);})();
