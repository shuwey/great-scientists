# -*- coding: utf-8 -*-
"""《读懂科学家》系列 · Canvas 实验模板库

每个模板返回一个完整的 JS 函数源码字符串：
    function lab_<key>(lab) { ... }
引擎会把它注入 site.js，并按 data-lab="<key>" 派发。

约定：
  - 模板从 lab 元素里读取 data-ctrl 命名的滑块，读取 .lab-readout 写读数。
  - 固定参数（轨道天体表、曲线类型等）以 `var P = <json>;` 注入，模板内用 P.xxx。
  - 所有模板统一 820×360 逻辑画布，setupCanvas 按 DPR 缩放。
"""

import json


def _head(key, params):
    return "function lab_%s(lab) {\n  var P = %s;\n" % (key, json.dumps(params, ensure_ascii=False))


def _tail():
    return "\n}\n"


# ----------------------------------------------------------------------
# 1. 轨道绕转（天文/原子电子通用）
#    ctrl: speed
#    P: {center:"木", centerColor:"#E8590C", bodies:[{name,r,period,color}], label}
# ----------------------------------------------------------------------
def orbit(params):
    key = params.pop("_key")
    return _head(key, params) + r"""
  var cv = $("canvas", lab);
  var sSpeed = $('[data-ctrl="speed"]', lab);
  var out = $(".lab-readout", lab);
  var vSpan = sSpeed ? sSpeed.closest(".ctrl").querySelector(".v") : null;
  var W = 820, H = 360, day = 0, last = 0;
  function draw(ts){
    if(!last) last = ts;
    var dt = Math.min(0.05,(ts-last)/1000); last = ts;
    var sp = sSpeed ? parseFloat(sSpeed.value) : 1;
    var maxP = 0; P.bodies.forEach(function(b){ if(b.period>maxP) maxP=b.period; });
    day += dt*sp*0.8; if(day>maxP) day -= maxP;
    var S = setupCanvas(cv, H/W); var ctx = S.ctx, k = S.w/W;
    ctx.save(); ctx.scale(k,k); ctx.clearRect(0,0,W,H);
    ctx.fillStyle = "#FBFCFE"; ctx.fillRect(0,0,W,H);
    var cx=W/2, cy=H/2;
    P.bodies.forEach(function(b){
      ctx.strokeStyle="rgba(91,107,130,.18)"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.arc(cx,cy,b.r,0,Math.PI*2); ctx.stroke();
    });
    // 中心
    ctx.fillStyle = P.centerColor; ctx.beginPath(); ctx.arc(cx,cy,26,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#fff"; ctx.font="800 16px -apple-system,sans-serif"; ctx.textAlign="center";
    ctx.fillText(P.center, cx, cy+6);
    // 卫星
    P.bodies.forEach(function(b){
      var ang=(day/b.period)*Math.PI*2;
      var mx=cx+Math.cos(ang)*b.r, my=cy+Math.sin(ang)*b.r*0.55;
      ctx.fillStyle=b.color; ctx.beginPath(); ctx.arc(mx,my,6,0,Math.PI*2); ctx.fill();
    });
    ctx.textAlign="left"; ctx.fillStyle="#5C6B82"; ctx.font="600 13px -apple-system,sans-serif";
    ctx.fillText(P.label, 24, 30);
    ctx.restore();
    if(vSpan) vSpan.textContent = sp.toFixed(1)+"×";
    if(out){
      var names = P.bodies.map(function(b){return b.name+"约"+b.period+"天/圈";}).join("，");
      out.innerHTML = "时间 ≈ <b>"+day.toFixed(1)+"</b> 天　·　"+names;
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
""" + _tail()


# ----------------------------------------------------------------------
# 2. 单摆
#    ctrl: length, mass
#    P: {label}
# ----------------------------------------------------------------------
def pendulum(params):
    key = params.pop("_key")
    return _head(key, params) + r"""
  var cv = $("canvas", lab);
  var sLen = $('[data-ctrl="length"]', lab);
  var sMass = $('[data-ctrl="mass"]', lab);
  var out = $(".lab-readout", lab);
  var lenSpan = sLen ? sLen.closest(".ctrl").querySelector(".v") : null;
  var massSpan = sMass ? sMass.closest(".ctrl").querySelector(".v") : null;
  var W=820,H=360,g=9.8,pivotX=W/2,pivotY=70,amp=0.5,t=0,last=0;
  function draw(ts){
    if(!last) last=ts;
    var dt=Math.min(0.05,(ts-last)/1000); last=ts;
    var L=sLen?parseFloat(sLen.value):1.0, m=sMass?parseFloat(sMass.value):1.0;
    var T=2*Math.PI*Math.sqrt(L/g); t+=dt;
    var ang=amp*Math.cos(2*Math.PI*t/T);
    var pixL=40+L*150, bx=pivotX+Math.sin(ang)*pixL, by=pivotY+Math.cos(ang)*pixL;
    var S=setupCanvas(cv,H/W); var ctx=S.ctx,k=S.w/W;
    ctx.save(); ctx.scale(k,k); ctx.clearRect(0,0,W,H); ctx.fillStyle="#FBFCFE"; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle="#C9D3E0"; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(pivotX-60,pivotY); ctx.lineTo(pivotX+60,pivotY); ctx.stroke();
    ctx.strokeStyle="#5C6B82"; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(pivotX,pivotY); ctx.lineTo(bx,by); ctx.stroke();
    var r=12+m*6, grd=ctx.createRadialGradient(bx-r*0.3,by-r*0.3,2,bx,by,r);
    grd.addColorStop(0,"#FFD8A8"); grd.addColorStop(1,"#E8590C");
    ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(bx,by,r,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#3B5BDB"; ctx.beginPath(); ctx.arc(pivotX,pivotY,5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#5C6B82"; ctx.font="600 13px -apple-system,sans-serif"; ctx.fillText(P.label,24,30);
    ctx.fillStyle="#1B2530"; ctx.font="800 20px -apple-system,sans-serif"; ctx.fillText("T = 2π√(L/g) ≈ "+T.toFixed(2)+" s",24,56);
    ctx.restore();
    if(lenSpan) lenSpan.textContent=L.toFixed(2)+" m";
    if(massSpan) massSpan.textContent=m.toFixed(1)+"×";
    if(out) out.innerHTML="摆长 L = <b>"+L.toFixed(2)+"</b> m　·　周期 T ≈ <b>"+T.toFixed(2)+"</b> s　·　质量 = "+m.toFixed(1)+"× 时周期不变";
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
""" + _tail()


# ----------------------------------------------------------------------
# 3. 抛体（抛物线）
#    ctrl: angle, speed
#    P: {g, label}
# ----------------------------------------------------------------------
def projectile(params):
    key = params.pop("_key")
    return _head(key, params) + r"""
  var cv = $("canvas", lab);
  var sA = $('[data-ctrl="angle"]', lab);
  var sV = $('[data-ctrl="speed"]', lab);
  var out = $(".lab-readout", lab);
  var aSpan = sA ? sA.closest(".ctrl").querySelector(".v") : null;
  var vSpan = sV ? sV.closest(".ctrl").querySelector(".v") : null;
  var W=820,H=360,g=P.g||9.8,last=0,t=0,running=true,resetAt=0;
  function draw(ts){
    if(!last) last=ts;
    var dt=Math.min(0.05,(ts-last)/1000); last=ts;
    var deg=sA?parseFloat(sA.value):45, v=sV?parseFloat(sV.value):20;
    var th=deg*Math.PI/180;
    var x0=70,y0=300, sc=7;
    var T=2*v*Math.sin(th)/g;
    if(ts>resetAt){ t+=dt; }
    if(t>T){ t=0; }
    var x=x0+v*Math.cos(th)*t*sc, y=y0-v*Math.sin(th)*t*sc+0.5*g*t*t*sc;
    var S=setupCanvas(cv,H/W); var ctx=S.ctx,k=S.w/W;
    ctx.save(); ctx.scale(k,k); ctx.clearRect(0,0,W,H); ctx.fillStyle="#FBFCFE"; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle="#C9D3E0"; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(40,300); ctx.lineTo(790,300); ctx.stroke();
    // 轨迹
    ctx.strokeStyle="rgba(59,91,219,.35)"; ctx.lineWidth=2; ctx.beginPath();
    for(var i=0;i<=T;i+=T/60){ var xx=x0+v*Math.cos(th)*i*sc, yy=y0-v*Math.sin(th)*i*sc+0.5*g*i*i*sc; if(i===0)ctx.moveTo(xx,yy); else ctx.lineTo(xx,yy);} ctx.stroke();
    ctx.fillStyle="#E8590C"; ctx.beginPath(); ctx.arc(x,Math.max(40,y),10,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#5C6B82"; ctx.font="600 13px -apple-system,sans-serif"; ctx.fillText(P.label,24,30);
    ctx.fillStyle="#1B2530"; ctx.font="800 18px -apple-system,sans-serif"; ctx.fillText("射高/射程取决于角度：45°最远",24,54);
    ctx.restore();
    if(aSpan) aSpan.textContent=deg.toFixed(0)+"°";
    if(vSpan) vSpan.textContent=v.toFixed(0);
    if(out) out.innerHTML="初速 v=<b>"+v.toFixed(0)+"</b>　·　仰角 <b>"+deg.toFixed(0)+"°</b>　·　飞行时间 "+T.toFixed(2)+" s　·　水平匀速 + 竖直匀加速 = 抛物线";
    requestAnimationFrame(draw);
  }
  if(sA) sA.addEventListener("input",function(){t=0;});
  if(sV) sV.addEventListener("input",function(){t=0;});
  requestAnimationFrame(draw);
""" + _tail()


# ----------------------------------------------------------------------
# 4. 行进波
#    ctrl: freq, amp
#    P: {label}
# ----------------------------------------------------------------------
def wave(params):
    key = params.pop("_key")
    return _head(key, params) + r"""
  var cv=$("canvas",lab); var sF=$('[data-ctrl="freq"]',lab); var sA=$('[data-ctrl="amp"]',lab);
  var out=$(".lab-readout",lab);
  var fSpan=sF?sF.closest(".ctrl").querySelector(".v"):null;
  var aSpan=sA?sA.closest(".ctrl").querySelector(".v"):null;
  var W=820,H=360,ph=0,last=0;
  function draw(ts){
    if(!last)last=ts; var dt=Math.min(0.05,(ts-last)/1000); last=ts;
    var f=sF?parseFloat(sF.value):1, a=sA?parseFloat(sA.value):1;
    ph+=dt*f*2;
    var S=setupCanvas(cv,H/W); var ctx=S.ctx,k=S.w/W;
    ctx.save(); ctx.scale(k,k); ctx.clearRect(0,0,W,H); ctx.fillStyle="#FBFCFE"; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle="#3B5BDB"; ctx.lineWidth=3; ctx.beginPath();
    for(var x=30;x<790;x+=4){ var y=180-60*a*Math.sin((x-30)/70 - ph); if(x===30)ctx.moveTo(x,y); else ctx.lineTo(x,y);} ctx.stroke();
    ctx.strokeStyle="#C9D3E0"; ctx.setLineDash([4,4]); ctx.beginPath(); ctx.moveTo(30,180); ctx.lineTo(790,180); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle="#5C6B82"; ctx.font="600 13px -apple-system,sans-serif"; ctx.fillText(P.label,24,30);
    ctx.restore();
    if(fSpan)fSpan.textContent=f.toFixed(1)+"×";
    if(aSpan)aSpan.textContent=a.toFixed(1)+"×";
    if(out)out.innerHTML="频率 f=<b>"+f.toFixed(1)+"</b>　·　振幅 A=<b>"+a.toFixed(1)+"</b>　·　波是振动的传播：介质不动，能量在走";
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
""" + _tail()


# ----------------------------------------------------------------------
# 5. 函数曲线（静态绘图 + 滑块改参数）
#    ctrl: param1, param2
#    P: {expr:"a*sin(k*x)" 或 "exp"/"gauss"/"growth", label}
# ----------------------------------------------------------------------
def graph(params):
    key = params.pop("_key")
    return _head(key, params) + r"""
  var cv=$("canvas",lab); var s1=$('[data-ctrl="param1"]',lab); var s2=$('[data-ctrl="param2"]',lab);
  var out=$(".lab-readout",lab);
  var v1=s1?s1.closest(".ctrl").querySelector(".v"):null;
  var v2=s2?s2.closest(".ctrl").querySelector(".v"):null;
  var W=820,H=360;
  function yval(x,a,b){
    if(P.expr==="exp") return 250-200*(1-Math.exp(-a*x/4));
    if(P.expr==="gauss"){ var mean=3.5+(a-1)*2.5; return 250-160*Math.exp(-Math.pow(x-mean,2)/(b*1.5)); }
    if(P.expr==="growth") return 250-190*(Math.exp(a*x/9)-1)/(Math.exp(a)-1);
    return 250-90*a*Math.sin(b*x); // 默认 a*sin(kx)
  }
  function draw(){
    var a=s1?parseFloat(s1.value):1, b=s2?parseFloat(s2.value):1;
    var S=setupCanvas(cv,H/W); var ctx=S.ctx,k=S.w/W;
    ctx.save(); ctx.scale(k,k); ctx.clearRect(0,0,W,H); ctx.fillStyle="#FBFCFE"; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle="#5C6B82"; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(40,40); ctx.lineTo(40,280); ctx.lineTo(790,280); ctx.stroke();
    ctx.strokeStyle="#3B5BDB"; ctx.lineWidth=3; ctx.beginPath();
    for(var x=40;x<790;x+=4){ var t=(x-40)/60; var y=yval(t,a,b); y=Math.max(40,Math.min(280,y)); if(x===40)ctx.moveTo(x,y); else ctx.lineTo(x,y);} ctx.stroke();
    ctx.fillStyle="#5C6B82"; ctx.font="600 13px -apple-system,sans-serif"; ctx.fillText(P.label,24,30);
    ctx.restore();
    if(v1)v1.textContent=a.toFixed(1);
    if(v2)v2.textContent=b.toFixed(1);
    if(out)out.innerHTML="拖动滑块改变参数，看曲线如何随之改变——这是“用数学描述自然”的最小示范。";
  }
  if(s1)s1.addEventListener("input",draw); if(s2)s2.addEventListener("input",draw);
  draw();
""" + _tail()


# ----------------------------------------------------------------------
# 6. 原子模型（电子绕核）
#    ctrl: speed
#    P: {shells, label}
# ----------------------------------------------------------------------
def atom(params):
    key = params.pop("_key")
    return _head(key, params) + r"""
  var cv=$("canvas",lab); var sS=$('[data-ctrl="speed"]',lab);
  var out=$(".lab-readout",lab); var vSpan=sS?sS.closest(".ctrl").querySelector(".v"):null;
  var W=820,H=360,ph=0,last=0;
  function draw(ts){
    if(!last)last=ts; var dt=Math.min(0.05,(ts-last)/1000); last=ts;
    var sp=sS?parseFloat(sS.value):1; ph+=dt*sp;
    var cx=W/2,cy=H/2;
    var S=setupCanvas(cv,H/W); var ctx=S.ctx,k=S.w/W;
    ctx.save(); ctx.scale(k,k); ctx.clearRect(0,0,W,H); ctx.fillStyle="#FBFCFE"; ctx.fillRect(0,0,W,H);
    for(var i=1;i<=P.shells;i++){
      var r=30*i;
      ctx.strokeStyle="#C9D3E0"; ctx.lineWidth=1.4;
      ctx.save(); ctx.translate(cx,cy); ctx.rotate(i*30*Math.PI/180); ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.stroke(); ctx.restore();
      var ang=ph*(1/i)+i; var ex=cx+r*Math.cos(ang), ey=cy+r*Math.sin(ang);
      ctx.fillStyle="#E8590C"; ctx.beginPath(); ctx.arc(ex,ey,6,0,Math.PI*2); ctx.fill();
    }
    ctx.fillStyle="#3B5BDB"; ctx.beginPath(); ctx.arc(cx,cy,14,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#fff"; ctx.font="800 14px -apple-system,sans-serif"; ctx.textAlign="center"; ctx.fillText("+",cx,cy+5);
    ctx.textAlign="left"; ctx.fillStyle="#5C6B82"; ctx.font="600 13px -apple-system,sans-serif"; ctx.fillText(P.label,24,30);
    ctx.restore();
    if(vSpan)vSpan.textContent=sp.toFixed(1)+"×";
    if(out)out.innerHTML="动画速度 <b>"+sp.toFixed(1)+"×</b>：电子在不同“壳层”上绕核运动；能级跃迁时吸收或放出特定频率的光——这是原子光谱的来源。";
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
""" + _tail()


# ----------------------------------------------------------------------
# 7. 增长曲线（指数 vs 受限）
#    ctrl: rate
#    P: {label}
# ----------------------------------------------------------------------
def growth(params):
    key = params.pop("_key")
    return _head(key, params) + r"""
  var cv=$("canvas",lab); var sR=$('[data-ctrl="rate"]',lab);
  var out=$(".lab-readout",lab); var vSpan=sR?sR.closest(".ctrl").querySelector(".v"):null;
  var W=820,H=360;
  function draw(){
    var r=sR?parseFloat(sR.value):0.6;
    var S=setupCanvas(cv,H/W); var ctx=S.ctx,k=S.w/W;
    ctx.save(); ctx.scale(k,k); ctx.clearRect(0,0,W,H); ctx.fillStyle="#FBFCFE"; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle="#5C6B82"; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(40,40); ctx.lineTo(40,280); ctx.lineTo(790,280); ctx.stroke();
    function curve(kind,color,dash){ ctx.strokeStyle=color; ctx.lineWidth=3; if(dash)ctx.setLineDash([5,4]); else ctx.setLineDash([]); ctx.beginPath();
      for(var x=40;x<790;x+=4){ var t=(x-40)/60; var y; if(kind==="exp")y=280-220*(Math.exp(r*t)-1)/(Math.exp(r*9)-1); else y=280-230/(1+Math.exp(-r*(t-4))); y=Math.max(40,Math.min(280,y)); if(x===40)ctx.moveTo(x,y); else ctx.lineTo(x,y);} ctx.stroke(); ctx.setLineDash([]);}
    curve("exp","#3B5BDB",false); curve("log","#2F9E44",true);
    ctx.fillStyle="#5C6B82"; ctx.font="600 13px -apple-system,sans-serif"; ctx.fillText(P.label,24,30);
    ctx.restore();
    if(vSpan)vSpan.textContent=r.toFixed(1);
    if(out)out.innerHTML="速率 r = <b>"+r.toFixed(1)+"</b>：蓝线（指数，资源无限）与绿线（逻辑斯蒂，受容量限制）的分叉点随 r 移动；真实种群更接近绿线。";
  }
  if(sR)sR.addEventListener("input",draw);
  draw();
""" + _tail()


# ----------------------------------------------------------------------
# 8. 场（力线 / 箭头）
#    ctrl: strength
#    P: {label}
# ----------------------------------------------------------------------
def emfield(params):
    key = params.pop("_key")
    return _head(key, params) + r"""
  var cv=$("canvas",lab); var sStr=$('[data-ctrl="strength"]',lab);
  var out=$(".lab-readout",lab); var vSpan=sStr?sStr.closest(".ctrl").querySelector(".v"):null;
  var W=820,H=360;
  function draw(){
    var str=sStr?parseFloat(sStr.value):1;
    var S=setupCanvas(cv,H/W); var ctx=S.ctx,k=S.w/W;
    ctx.save(); ctx.scale(k,k); ctx.clearRect(0,0,W,H); ctx.fillStyle="#FBFCFE"; ctx.fillRect(0,0,W,H);
    var x1=160,y1=90,x2=660,y2=90;
    ctx.fillStyle="#3B5BDB"; ctx.fillRect(x1-10,y1,20,180);
    ctx.fillStyle="#E8590C"; ctx.fillRect(x2-10,y2,20,180);
    ctx.strokeStyle="#5C6B82"; ctx.lineWidth=1.4; ctx.globalAlpha=Math.min(1,0.4+str*0.3);
    for(var row=-2;row<=2;row++){ var yy=180+row*26; ctx.beginPath(); ctx.moveTo(x1+10,yy); ctx.quadraticCurveTo(410,yy+row*8,x2-10,yy); ctx.stroke(); }
    ctx.globalAlpha=1;
    ctx.fillStyle="#5C6B82"; ctx.font="600 13px -apple-system,sans-serif"; ctx.fillText(P.label,24,30);
    ctx.restore();
    if(vSpan)vSpan.textContent=str.toFixed(1)+"×";
    if(out)out.innerHTML="场强 = <b>"+str.toFixed(1)+"</b>：两根带电棒之间，力线从正指向负、越密越强——看不见，却处处施加力，这就是“场”的直观图像。";
  }
  if(sStr)sStr.addEventListener("input",draw);
  draw();
""" + _tail()


# ----------------------------------------------------------------------
# 9. 椭圆轨道（开普勒第一/第二定律）
#    ctrl: ecc（离心率 0~0.8）
#    P: {center:"日", centerColor, label, bodyName, bodyColor, a}
#    太阳置于一个焦点；行星按偏心近点角匀速推进（等效近太阳快、远太阳慢）
# ----------------------------------------------------------------------
def ellipse(params):
    key = params.pop("_key")
    return _head(key, params) + r"""
  var cv=$("canvas",lab); var sE=$('[data-ctrl="ecc"]',lab);
  var out=$(".lab-readout",lab); var vSpan=sE?sE.closest(".ctrl").querySelector(".v"):null;
  var W=820,H=360,last=0,E=0;
  function draw(ts){
    if(!last)last=ts; var dt=Math.min(0.05,(ts-last)/1000); last=ts;
    var e=sE?parseFloat(sE.value):0.4, e=Math.max(0,Math.min(0.8,e));
    var cx=W/2, cy=H/2, a=P.a||170, b=a*Math.sqrt(1-e*e), c=a*e;
    E+=dt*(0.6+0.6*(1-e)); // 基础转速，离心率越大越慢一点点（仅观感）
    var px=cx+a*Math.cos(E), py=cy+b*Math.sin(E);     // 行星位置
    var sx=cx+c, sy=cy;                                // 太阳（右焦点）
    var S=setupCanvas(cv,H/W); var ctx=S.ctx,k=S.w/W;
    ctx.save(); ctx.scale(k,k); ctx.clearRect(0,0,W,H); ctx.fillStyle="#FBFCFE"; ctx.fillRect(0,0,W,H);
    // 椭圆轨道
    ctx.strokeStyle="#C9D3E0"; ctx.lineWidth=2; ctx.beginPath(); ctx.ellipse(cx,cy,a,b,0,0,Math.PI*2); ctx.stroke();
    // 太阳（焦点）
    ctx.fillStyle=P.centerColor; ctx.beginPath(); ctx.arc(sx,sy,22,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#fff"; ctx.font="800 15px -apple-system,sans-serif"; ctx.textAlign="center"; ctx.fillText(P.center,sx,sy+5);
    // 行星
    var r=10; ctx.fillStyle=P.bodyColor; ctx.beginPath(); ctx.arc(px,py,r,0,Math.PI*2); ctx.fill();
    // 焦点连线（速度提示）
    ctx.strokeStyle="rgba(232,89,12,.35)"; ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(px,py); ctx.stroke();
    // 另一个焦点
    ctx.fillStyle="#9AA7BC"; ctx.beginPath(); ctx.arc(cx-c,cy,3,0,Math.PI*2); ctx.fill();
    ctx.textAlign="left"; ctx.fillStyle="#5C6B82"; ctx.font="600 13px -apple-system,sans-serif"; ctx.fillText(P.label,24,30);
    ctx.fillStyle="#1B2530"; ctx.font="800 16px -apple-system,sans-serif";
    ctx.fillText("离心率 e = "+e.toFixed(2)+"：轨道越扁，近/远日点速度差越大",24,54);
    ctx.restore();
    if(vSpan)vSpan.textContent=e.toFixed(2);
    if(out)out.innerHTML="离心率 e = <b>"+e.toFixed(2)+"</b>：太阳坐在椭圆的一个焦点上（不是中心）。行星靠近太阳时跑得快、远离时慢——这就是开普勒第二定律。";
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
""" + _tail()


# ----------------------------------------------------------------------
# 10. 生命之树（分支演化 / 系统发育）
#    ctrl: depth（演化深度/时间）
#    P: {label, trunkColor, leafColors:[...]}
#    从一根主干逐级二分出更多分支，直观呈现“共同祖先 → 多样化”
# ----------------------------------------------------------------------
def branching(params):
    key = params.pop("_key")
    return _head(key, params) + r"""
  var cv=$("canvas",lab); var sD=$('[data-ctrl="depth"]',lab);
  var out=$(".lab-readout",lab); var vSpan=sD?sD.closest(".ctrl").querySelector(".v"):null;
  var W=820,H=360;
  function draw(){
    var depth=sD?parseInt(sD.value):4;
    var S=setupCanvas(cv,H/W); var ctx=S.ctx,k=S.w/W;
    ctx.save(); ctx.scale(k,k); ctx.clearRect(0,0,W,H); ctx.fillStyle="#FBFCFE"; ctx.fillRect(0,0,W,H);
    ctx.fillStyle="#5C6B82"; ctx.font="600 13px -apple-system,sans-serif"; ctx.fillText(P.label,24,30);
    var colors=P.leafColors||["#3B5BDB","#2F9E44","#E8590C","#6741D9","#0C8599","#C2255C"];
    // 递归画分支
    function branch(x,y,len,ang,d,wd){
      if(d<=0){
        ctx.fillStyle=colors[(d+depth)%colors.length];
        ctx.beginPath(); ctx.arc(x,y,5,0,Math.PI*2); ctx.fill(); return;
      }
      var x2=x+Math.cos(ang)*len, y2=y+Math.sin(ang)*len;
      ctx.strokeStyle="rgba(91,107,130,"+(0.35+0.5*(1-d/depth))+")"; ctx.lineWidth=wd;
      ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x2,y2); ctx.stroke();
      branch(x2,y2,len*0.72,ang-0.32,d-1,Math.max(1,wd*0.7));
      branch(x2,y2,len*0.72,ang+0.32,d-1,Math.max(1,wd*0.7));
    }
    branch(W/2,H-30,110,-Math.PI/2,depth,8);
    ctx.restore();
    if(vSpan)vSpan.textContent=depth+" 级";
    var tips=Math.pow(2,depth);
    if(out)out.innerHTML="从一根主干开始，每演化一级就一分为二：<b>"+depth+"</b> 级后会出现约 <b>"+tips+"</b> 个末梢——这就是“生命之树”的几何。";
  }
  if(sD)sD.addEventListener("input",draw);
  draw();
""" + _tail()


# ----------------------------------------------------------------------
# 11. 周期表网格（门捷列夫 / 居里夫人元素周期）
#    ctrl（可选）: group（1-18，高亮某一族）
#    P: {label}
#    静态网格 + 按列（族）上色；有 group 滑块时高亮该族并更新读数。
# ----------------------------------------------------------------------
def periodic(params):
    key = params.pop("_key")
    return _head(key, params) + r"""
  var cv=$("canvas",lab); var sG=$('[data-ctrl="group"]',lab);
  var out=$(".lab-readout",lab); var vSpan=sG?sG.closest(".ctrl").querySelector(".v"):null;
  var W=820,H=420;
  function rr(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
  function draw(){
    var g=sG?parseInt(sG.value):0;
    var S=setupCanvas(cv,H/W); var ctx=S.ctx,k=S.w/W;
    ctx.save(); ctx.scale(k,k); ctx.clearRect(0,0,W,H); ctx.fillStyle="#FBFCFE"; ctx.fillRect(0,0,W,H);
    var cols=18, rows=7, mx=44, my=46, gw=(W-mx-14)/cols, gh=(H-my-16-72)/rows;
    for(var r=0;r<rows;r++){ for(var c=0;c<cols;c++){
      var hue=(c/cols)*320; ctx.fillStyle="hsl("+hue.toFixed(0)+",60%,78%)";
      rr(ctx, mx+c*gw+2, my+r*gh+2, gw-4, gh-4, 5); ctx.fill();
    }}
    var fy=my+rows*gh+18;
    for(var r=0;r<2;r++){ for(var c=0;c<15;c++){
      var hue=((c+3)/cols)*320; ctx.fillStyle="hsl("+hue.toFixed(0)+",60%,78%)";
      rr(ctx, mx+(c+2)*gw+2, fy+r*gh+2, gw-4, gh-4, 5); ctx.fill();
    }}
    if(g>=1&&g<=18){ ctx.strokeStyle="#1B2530"; ctx.lineWidth=3; rr(ctx, mx+(g-1)*gw+2, my+2, gw-4, rows*gh-4, 5); ctx.stroke(); }
    ctx.fillStyle="#5C6B82"; ctx.font="600 12px -apple-system,sans-serif"; ctx.textAlign="center";
    for(var c=0;c<cols;c++){ ctx.fillText((c+1), mx+c*gw+gw/2, 26); }
    ctx.textAlign="left";
    for(var r=0;r<rows;r++){ ctx.fillText((r+1), 14, my+r*gh+gh/2+4); }
    ctx.fillStyle="#5C6B82"; ctx.font="600 13px -apple-system,sans-serif";
    ctx.fillText(P.label||"周期表：纵列为族，横行为周期", 14, H-8);
    ctx.restore();
    if(vSpan)vSpan.textContent=(g||"-");
    if(out)out.innerHTML="纵列（族）同色，表示化学性质相近；横行（周期）代表电子多一层。"+(g>=1&&g<=18?("高亮的是第 <b>"+g+"</b> 族——同一族最外层电子数相同，这是周期表分类的根本依据。"):"拖动滑块可高亮任意一族。");
  }
  if(sG)sG.addEventListener("input",draw);
  draw();
""" + _tail()


# ----------------------------------------------------------------------
# 12. 图灵机（图灵 / 计算理论）
#    ctrl: speed（动画速度）
#    P: {label}
#    一条纸带 + 读写头，按极简规则逐格改写并左右移动；读数随步数变化。
# ----------------------------------------------------------------------
def turing(params):
    key = params.pop("_key")
    return _head(key, params) + r"""
  var cv=$("canvas",lab); var sS=$('[data-ctrl="speed"]',lab);
  var out=$(".lab-readout",lab); var vSpan=sS?sS.closest(".ctrl").querySelector(".v"):null;
  var W=820,H=360;
  var tape=new Array(23).fill(0), pos=11, state=0, step=0, last=0, dir=1;
  function stepOnce(){
    var sym=tape[pos];
    if(state===0){ tape[pos]=sym?0:1; if(sym){dir=-1;state=1;}else{dir=1;state=0;} }
    else { tape[pos]=sym?0:1; if(sym){dir=1;state=0;}else{dir=-1;state=1;} }
    pos+=dir; if(pos<0)pos=0; if(pos>tape.length-1)pos=tape.length-1; step++;
  }
  function draw(ts){
    if(!last)last=ts; var dt=Math.min(0.05,(ts-last)/1000); last=ts;
    var sp=sS?parseFloat(sS.value):1;
    var n=Math.max(1,Math.round(sp*2));
    for(var i=0;i<n;i++) stepOnce();
    if(step>1500){ tape.fill(0); pos=11; state=0; step=0; }
    var S=setupCanvas(cv,H/W); var ctx=S.ctx,k=S.w/W;
    ctx.save(); ctx.scale(k,k); ctx.clearRect(0,0,W,H); ctx.fillStyle="#FBFCFE"; ctx.fillRect(0,0,W,H);
    var nc=tape.length, cw=Math.min(34,(W-40)/nc), x0=(W-nc*cw)/2, y=H/2-17;
    for(var i=0;i<nc;i++){
      var on=tape[i];
      ctx.fillStyle=on?"#3B5BDB":"#E7ECF3"; ctx.fillRect(x0+i*cw+1,y,cw-2,34);
      ctx.strokeStyle="#C9D3E0"; ctx.lineWidth=1; ctx.strokeRect(x0+i*cw+1,y,cw-2,34);
      ctx.fillStyle=on?"#fff":"#5C6B82"; ctx.font="600 13px -apple-system,sans-serif"; ctx.textAlign="center";
      ctx.fillText(on?"1":"0", x0+i*cw+cw/2, y+22);
    }
    ctx.fillStyle="#E8590C"; ctx.fillRect(x0+pos*cw+1, y-6, cw-2, 5);
    ctx.beginPath(); ctx.moveTo(x0+pos*cw+cw/2, y-6); ctx.lineTo(x0+pos*cw+cw/2-6, y-14); ctx.lineTo(x0+pos*cw+cw/2+6, y-14); ctx.closePath(); ctx.fill();
    ctx.textAlign="left"; ctx.fillStyle="#5C6B82"; ctx.font="600 13px -apple-system,sans-serif";
    ctx.fillText(P.label||"图灵机：读一格、写一格、左右移动", 14, 28);
    ctx.restore();
    if(vSpan)vSpan.textContent=sp.toFixed(1)+"×";
    if(out)out.innerHTML="状态 <b>"+(state===0?"A":"B")+"</b> · 已走 <b>"+step+"</b> 步：机器每步读一格、改写并移动——再简单的规则，也能完成计算。";
    requestAnimationFrame(draw);
  }
  if(sS)sS.addEventListener("input",draw);
  requestAnimationFrame(draw);
""" + _tail()


# ----------------------------------------------------------------------
# 13. 黑洞：弯曲的时空（霍金 / 引力）
#    ctrl: mass（质量倍数）
#    P: {label}
#    中心黑洞 + 光子环（视界外）+ 吸积盘；质量越大时空被压得越深、光子环越小。
# ----------------------------------------------------------------------
def blackhole(params):
    key = params.pop("_key")
    return _head(key, params) + r"""
  var cv=$("canvas",lab); var sM=$('[data-ctrl="mass"]',lab);
  var out=$(".lab-readout",lab); var vSpan=sM?sM.closest(".ctrl").querySelector(".v"):null;
  var W=820,H=360, ph=0, last=0;
  function draw(ts){
    if(!last)last=ts; var dt=Math.min(0.05,(ts-last)/1000); last=ts;
    var m=sM?parseFloat(sM.value):1; ph+=dt*(0.4+m*0.8);
    var cx=W/2, cy=H/2;
    var S=setupCanvas(cv,H/W); var ctx=S.ctx,k=S.w/W;
    ctx.save(); ctx.scale(k,k); ctx.clearRect(0,0,W,H); ctx.fillStyle="#0B1020"; ctx.fillRect(0,0,W,H);
    for(var a=0;a<Math.PI*2;a+=0.16){
      var rr=80+26*Math.sin(a*3+ph*0.25);
      var x=cx+Math.cos(a)*rr, y=cy+Math.sin(a)*rr*0.5;
      ctx.fillStyle="hsl("+(((a*40)%360+40))+",80%,62%)"; ctx.globalAlpha=0.45;
      ctx.beginPath(); ctx.arc(x,y,2.2,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;
    var rh=Math.max(24, 52/(m*0.7+0.3));
    ctx.strokeStyle="#FFD43B"; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(cx,cy,rh,0,Math.PI*2); ctx.stroke();
    ctx.fillStyle="#000"; ctx.beginPath(); ctx.arc(cx,cy,rh-7,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle="rgba(255,255,255,.55)"; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(cx,cy,rh-7,0,Math.PI*2); ctx.stroke();
    var px=cx+Math.cos(ph)*rh, py=cy+Math.sin(ph)*rh;
    ctx.fillStyle="#FFE066"; ctx.beginPath(); ctx.arc(px,py,4,0,Math.PI*2); ctx.fill();
    ctx.textAlign="left"; ctx.fillStyle="#AEB9CC"; ctx.font="600 13px -apple-system,sans-serif";
    ctx.fillText(P.label||"黑洞弯曲时空，光子在视界外绕行", 14, 26);
    ctx.restore();
    if(vSpan)vSpan.textContent=m.toFixed(1)+"×";
    if(out)out.innerHTML="质量越大（<b>"+m.toFixed(1)+"×</b>），时空被压得越深、光子环越小——连光都逃不出视界。这正是霍金研究黑洞的舞台。";
    requestAnimationFrame(draw);
  }
  if(sM)sM.addEventListener("input",draw);
  requestAnimationFrame(draw);
""" + _tail()


def induction(params):
    """法拉第电磁感应：磁铁穿过线圈，磁通变化越快、匝数越多，感应电流越大。
    ctrl: speed（磁铁速度）, turns（线圈匝数）
    """
    key = params.pop("_key")
    return _head(key, params) + r"""
  var cv=$("canvas",lab); var sS=$('[data-ctrl="speed"]',lab); var sN=$('[data-ctrl="turns"]',lab);
  var out=$(".lab-readout",lab);
  function _vs(el){ return el?el.closest(".ctrl").querySelector(".v"):null; }
  var vS=_vs(sS), vN=_vs(sN);
  var W=820,H=360, ph=0, last=0, hist=[];
  var CX=430, CY=148;
  function draw(ts){
    if(typeof ts!=="number")ts=Date.now();
    if(!last)last=ts; var dt=Math.min(0.05,(ts-last)/1000); last=ts;
    var sp=sS?parseFloat(sS.value):1;
    var N=sN?parseFloat(sN.value):4;
    var w=sp*1.15; ph+=dt*w;
    var mx=CX+175*Math.sin(ph);
    var vx=175*w*Math.cos(ph);
    var coup=Math.exp(-Math.pow((mx-CX)/115,2));
    var emf=Math.max(-1,Math.min(1, N*vx*coup/250));
    hist.push(emf); if(hist.length>300)hist.shift();
    var S=setupCanvas(cv,H/W); var ctx=S.ctx,k=S.w/W;
    ctx.save(); ctx.scale(k,k); ctx.clearRect(0,0,W,H);
    ctx.fillStyle="#FBFCFE"; ctx.fillRect(0,0,W,H);
    var turns=Math.round(N), i;
    ctx.strokeStyle="#495057"; ctx.lineWidth=2;
    for(i=0;i<turns;i++){
      var ex=CX-46+(turns>1?(92/(turns-1))*i:0);
      ctx.beginPath(); ctx.ellipse(ex,CY,10,62,0,0,Math.PI*2); ctx.stroke();
    }
    ctx.strokeStyle="#868E96"; ctx.lineWidth=1.6;
    ctx.beginPath(); ctx.moveTo(CX+46,CY+62); ctx.lineTo(690,CY+62); ctx.lineTo(690,232); ctx.stroke();
    var mw=118, mh=46;
    ctx.fillStyle="#E03131"; ctx.fillRect(mx-mw/2,CY-mh/2,mw/2,mh);
    ctx.fillStyle="#1C7ED6"; ctx.fillRect(mx,CY-mh/2,mw/2,mh);
    ctx.strokeStyle="#343A40"; ctx.lineWidth=1.4; ctx.strokeRect(mx-mw/2,CY-mh/2,mw,mh);
    ctx.fillStyle="#fff"; ctx.font="700 17px -apple-system,sans-serif"; ctx.textAlign="center";
    ctx.fillText("N",mx-mw/4,CY+6); ctx.fillText("S",mx+mw/4,CY+6);
    ctx.textAlign="left";
    ctx.fillStyle="#FFD43B"; ctx.font="700 12px -apple-system,sans-serif";
    ctx.fillText("磁铁",mx-mw/2,CY-32);
    var gx=690, gy=286, gr=52;
    ctx.fillStyle="#fff"; ctx.strokeStyle="#343A40"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(gx,gy,gr,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle="#ADB5BD"; ctx.lineWidth=1.2;
    for(i=-4;i<=4;i++){
      var aa=-Math.PI/2+i*(Math.PI/2)/4;
      ctx.beginPath(); ctx.moveTo(gx+Math.cos(aa)*(gr-8),gy+Math.sin(aa)*(gr-8));
      ctx.lineTo(gx+Math.cos(aa)*(gr-3),gy+Math.sin(aa)*(gr-3)); ctx.stroke();
    }
    var na=-Math.PI/2+emf*1.05;
    ctx.strokeStyle="#E03131"; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(gx,gy); ctx.lineTo(gx+Math.cos(na)*(gr-14),gy+Math.sin(na)*(gr-14)); ctx.stroke();
    ctx.fillStyle="#343A40"; ctx.beginPath(); ctx.arc(gx,gy,4,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#868E96"; ctx.font="600 11px -apple-system,sans-serif"; ctx.textAlign="center";
    ctx.fillText("电流计",gx,gy+gr-10); ctx.textAlign="left";
    var bx=60, by=300, bw=520, bh=44;
    ctx.strokeStyle="#DEE2E6"; ctx.lineWidth=1; ctx.beginPath();
    ctx.moveTo(bx,by+bh/2); ctx.lineTo(bx+bw,by+bh/2); ctx.stroke();
    ctx.strokeStyle="#1C7ED6"; ctx.lineWidth=2; ctx.beginPath();
    for(i=0;i<hist.length;i++){
      var xx=bx+bw*i/300, yy=by+bh/2-hist[i]*(bh/2-4);
      if(i===0)ctx.moveTo(xx,yy); else ctx.lineTo(xx,yy);
    }
    ctx.stroke();
    ctx.fillStyle="#495057"; ctx.font="600 12px -apple-system,sans-serif";
    ctx.fillText("感应电流随时间（磁铁来回穿过线圈）",bx,by-6);
    ctx.fillStyle="#868E96"; ctx.font="600 13px -apple-system,sans-serif";
    ctx.fillText(P.label||"磁铁一动，线圈里就冒出电流", 14, 24);
    ctx.restore();
    if(vS)vS.textContent=sp.toFixed(1)+"×";
    if(vN)vN.textContent=turns+" 匝";
    if(out)out.innerHTML="磁铁速度 <b>"+sp.toFixed(1)+"×</b>、线圈 <b>"+turns+"</b> 匝：此刻感应电流 <b>"+emf.toFixed(2)+"</b>。磁通变化越快、匝数越多，电流越大——这就是法拉第电磁感应定律。";
    requestAnimationFrame(draw);
  }
  if(sS)sS.addEventListener("input",draw);
  if(sN)sN.addEventListener("input",draw);
  requestAnimationFrame(draw);
""" + _tail()


def pathintegral(params):
    """费曼路径积分：从 A 到 B 的每一条路径都走一遍，各自的相位箭头首尾相接。
    ctrl: hbar（约化普朗克常数相对大小）
    """
    key = params.pop("_key")
    return _head(key, params) + r"""
  var cv=$("canvas",lab); var sH=$('[data-ctrl="hbar"]',lab);
  var out=$(".lab-readout",lab);
  function _vs(el){ return el?el.closest(".ctrl").querySelector(".v"):null; }
  var vH=_vs(sH);
  var W=820,H=360, t=0, last=0, i;
  var AX=90, BX=730, AY=158, MIDX=410;
  var M=21, SPREAD=132;
  var phs=new Array(M), dsv=new Array(M);
  function arrow(ctx,x,y,ang,len,col,lw){
    var ex=x+Math.cos(ang)*len, ey=y+Math.sin(ang)*len;
    ctx.strokeStyle=col; ctx.lineWidth=lw; ctx.beginPath();
    ctx.moveTo(x,y); ctx.lineTo(ex,ey); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ex,ey);
    ctx.lineTo(ex-Math.cos(ang-0.42)*5,ey-Math.sin(ang-0.42)*5);
    ctx.lineTo(ex-Math.cos(ang+0.42)*5,ey-Math.sin(ang+0.42)*5);
    ctx.closePath(); ctx.fillStyle=col; ctx.fill();
  }
  function draw(ts){
    if(typeof ts!=="number")ts=Date.now();
    if(!last)last=ts; var dt=Math.min(0.05,(ts-last)/1000); last=ts;
    var hb=sH?parseFloat(sH.value):1;
    t+=dt*0.5;
    for(i=0;i<M;i++){
      var d=-SPREAD+(2*SPREAD/(M-1))*i;
      dsv[i]=d; phs[i]=0.00045*d*d/hb+t;
    }
    var S=setupCanvas(cv,H/W); var ctx=S.ctx,k=S.w/W;
    ctx.save(); ctx.scale(k,k); ctx.clearRect(0,0,W,H);
    ctx.fillStyle="#FBFCFE"; ctx.fillRect(0,0,W,H);
    for(i=0;i<M;i++){
      var d=dsv[i], cls=Math.abs(d)<(2*SPREAD/(M-1))*0.5;
      ctx.beginPath(); ctx.moveTo(AX,AY);
      ctx.quadraticCurveTo(MIDX, AY+2*d, BX, AY);
      ctx.strokeStyle= cls? "rgba(232,89,12,.9)" : "rgba(73,80,87,.26)";
      ctx.lineWidth= cls? 2.6 : 1.1; ctx.stroke();
      var px=0.25*AX+0.5*MIDX+0.25*BX, py=AY+d;
      arrow(ctx,px,py,phs[i],9, cls? "#E8590C" : "#868E96", cls?1.8:1.2);
    }
    ctx.fillStyle="#495057"; ctx.font="700 14px -apple-system,sans-serif"; ctx.textAlign="center";
    ctx.fillText("A",AX,AY+34); ctx.fillText("B",BX,AY+34);
    ctx.fillStyle="#E8590C"; ctx.font="600 12px -apple-system,sans-serif";
    ctx.fillText("直线＝经典路径（作用量最小）",MIDX,AY+SPREAD+42);
    var sx=AX, sy=302, cxs=sx, cys=sy, L=6.4;
    ctx.strokeStyle="rgba(26,115,232,.75)"; ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(cxs,cys);
    for(i=0;i<M;i++){
      cxs+=Math.cos(phs[i])*L; cys+=Math.sin(phs[i])*L; ctx.lineTo(cxs,cys);
    }
    ctx.stroke();
    arrow(ctx,sx,sy,Math.atan2(cys-sy,cxs-sx),Math.sqrt((cxs-sx)*(cxs-sx)+(cys-sy)*(cys-sy)),"#E03131",2.6);
    var amp=Math.sqrt((cxs-sx)*(cxs-sx)+(cys-sy)*(cys-sy))/(M*L);
    ctx.textAlign="left"; ctx.fillStyle="#868E96"; ctx.font="600 12px -apple-system,sans-serif";
    ctx.fillText("把每条路径的相位箭头首尾相接（红箭头＝叠加后的总概率幅）",sx,sy-14);
    ctx.fillStyle="#868E96"; ctx.font="600 13px -apple-system,sans-serif";
    ctx.fillText(P.label||"从 A 到 B：粒子把每一条路都走了一遍", 14, 24);
    ctx.restore();
    if(vH)vH.textContent=hb.toFixed(1)+"×";
    if(out)out.innerHTML="约化普朗克常数 <b>"+hb.toFixed(1)+"×</b>：ℏ 越小，相邻路径的相位差越大、互相抵消得越厉害，最后只剩靠近直线的那几条——粒子看起来走直线（经典）。ℏ 越大，越多路径能相干叠加，量子效应越明显。当前净概率幅 <b>"+amp.toFixed(2)+"</b>。";
    requestAnimationFrame(draw);
  }
  if(sH)sH.addEventListener("input",draw);
  requestAnimationFrame(draw);
""" + _tail()


TEMPLATES = {
    "orbit": orbit,
    "pendulum": pendulum,
    "projectile": projectile,
    "wave": wave,
    "graph": graph,
    "atom": atom,
    "growth": growth,
    "field": emfield,
    "ellipse": ellipse,
    "branching": branching,
    "periodic": periodic,
    "turing": turing,
    "blackhole": blackhole,
    "induction": induction,
    "pathintegral": pathintegral,
}


def build(key, kind, params):
    """返回完整 JS 函数源码。params 为模板固定参数 dict。"""
    fn = TEMPLATES.get(kind)
    if not fn:
        raise ValueError("未知实验模板: %s" % kind)
    p = dict(params or {})
    p["_key"] = key
    return fn(p)
