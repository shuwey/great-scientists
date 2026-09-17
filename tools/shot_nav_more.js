// 验证「详解 ▾」下拉：桌面 hover 展开、移动端点开，量测 + 截图
const { chromium } = require('/Users/shuwei/.workbuddy/binaries/node/workspace/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const root = process.cwd();
const OUT = '/Users/shuwei/WorkBuddy/读懂牛顿-验证产物/shots';
const mime = {'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
const srv = http.createServer((req,res)=>{
  let p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (p.endsWith('/')) p += 'index.html';
  fs.readFile(p,(e,d)=>{ if(e){res.writeHead(404);res.end();return;}
    res.writeHead(200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream'});res.end(d);});
});
const SITES = (process.argv[2] ? process.argv[2].split(',') : ['faraday','feynman','turing']);
(async()=>{
  fs.mkdirSync(OUT, {recursive:true});
  await new Promise(r=>srv.listen(8079,r));
  const browser = await chromium.launch();
  // 1) 桌面：hover 展开
  for (const sid of SITES){
    const page = await browser.newPage({viewport:{width:1440,height:900}});
    await page.goto('http://localhost:8079/scientists/'+sid+'/index.html',{waitUntil:'networkidle'});
    const before = await page.evaluate(()=>{
      const m=document.querySelector('.nav-more-menu');
      return m? getComputedStyle(m).display : 'none';
    });
    await page.hover('.nav-more-btn');
    await page.waitForTimeout(250);
    const m = await page.evaluate(()=>{
      const menu=document.querySelector('.nav-more-menu');
      const r=menu.getBoundingClientRect();
      const items=[...menu.querySelectorAll('a')].map(a=>{
        const rr=document.createRange(); rr.selectNodeContents(a);
        return {t:a.textContent.trim().slice(0,10), L:rr.getClientRects().length, w:Math.round(a.getBoundingClientRect().width)};
      });
      const nav=document.querySelector('.nav').getBoundingClientRect();
      return {disp:getComputedStyle(menu).display, w:Math.round(r.width), h:Math.round(r.height),
              right:Math.round(r.right), navRight:Math.round(nav.right), items,
              overflowRight: r.right > window.innerWidth};
    });
    console.log(`[桌面1440] ${sid} 收起=${before} 展开=${m.disp} 菜单${m.w}x${m.h} 右溢出=${m.overflowRight}`);
    console.log('   条目:', JSON.stringify(m.items));
    await page.screenshot({path:`${OUT}/nav-more-desktop-${sid}.png`, clip:{x:0,y:0,width:1440,height:340}});
    await page.close();
  }
  // 2) 移动：汉堡 → 点开详解
  for (const sid of SITES.slice(0,2)){
    const page = await browser.newPage({viewport:{width:390,height:844}});
    await page.goto('http://localhost:8079/scientists/'+sid+'/index.html',{waitUntil:'networkidle'});
    await page.click('.nav-toggle');
    await page.waitForTimeout(250);
    const menuOpen = await page.evaluate(()=>getComputedStyle(document.querySelector('.nav-links')).display);
    await page.click('.nav-more-btn');
    await page.waitForTimeout(250);
    const m = await page.evaluate(()=>{
      const menu=document.querySelector('.nav-more-menu');
      const r=menu.getBoundingClientRect();
      return {disp:getComputedStyle(menu).display, h:Math.round(r.height), w:Math.round(r.width),
              items:menu.querySelectorAll('a').length, pos:getComputedStyle(menu).position};
    });
    console.log(`[移动390] ${sid} 主菜单=${menuOpen} 详解=${m.disp} ${m.w}x${m.h} 条目${m.items} position=${m.pos}`);
    await page.screenshot({path:`${OUT}/nav-more-mobile-${sid}.png`, clip:{x:0,y:0,width:390,height:640}});
    await page.close();
  }
  await browser.close(); srv.close();
  setTimeout(()=>process.exit(0), 300);
})();
