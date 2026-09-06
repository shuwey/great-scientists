const angDeg = -9;
const a = angDeg * Math.PI / 180;
const dirIn = { x: Math.cos(a), y: Math.sin(a) };
console.log("滑块角度:", angDeg + "°");
console.log("方向向量: (" + dirIn.x.toFixed(4) + ", " + dirIn.y.toFixed(4) + ")");
console.log("水平(右): " + dirIn.x.toFixed(3));
console.log("垂直(Canvas下): " + dirIn.y.toFixed(3) + (dirIn.y < 0 ? " → 向上走" : " → 向下走"));

const TOP={x:400,y:78}, L={x:288,y:272};
const M={x:TOP.x+(L.x-TOP.x)*0.5,y:TOP.y+(L.y-TOP.y)*0.5};
const ex=L.x-TOP.x,ey=L.y-TOP.y,el=Math.hypot(ex,ey);
let nOut={x:ey/el,y:-ex/el};
if(nOut.x>0){nOut.x=-nOut.x;nOut.y=-nOut.y;}
const dot = nOut.x*dirIn.x + nOut.y*dirIn.y;
console.log("\n--- 光学入射角（与法线夹角） ---");
console.log("法线 nOut: (" + nOut.x.toFixed(3) + ", " + nOut.y.toFixed(3) + ")");
console.log("nOut·dirIn = " + dot.toFixed(4));
const realAngleDeg = Math.acos(Math.abs(dot)) * 180 / Math.PI;
console.log("真正的光学入射角: " + realAngleDeg.toFixed(1) + "°");
console.log("\n结论：滑块值是「光线绝对方向」(0°=水平向右)，不是光学入射角");
