// 复刻 site.js 棱镜几何，扫描安全角度范围
function rayHit(o, d, a, b) {
  const e = { x: b.x - a.x, y: b.y - a.y };
  const den = d.x * e.y - d.y * e.x;
  if (Math.abs(den) < 1e-9) return null;
  const f = { x: a.x - o.x, y: a.y - o.y };
  const t = (f.x * e.y - f.y * e.x) / den;
  const u = (f.x * d.y - f.y * d.x) / den;
  if (t > 1e-6 && u >= -1e-6 && u <= 1 + 1e-6) return t;
  return null;
}
function refract(d, N, eta) {
  const c = -(N.x * d.x + N.y * d.y);
  const k = 1 - eta * eta * (1 - c * c);
  if (k < 0) return null;
  const s = eta * c - Math.sqrt(k);
  return { x: eta * d.x + s * N.x, y: eta * d.y + s * N.y };
}
function scan(nBase, k0, f) {
  const TOP = { x: 400, y: 78 }, L = { x: 288, y: 272 }, R = { x: 512, y: 272 };
  const EDGES = [[TOP, L], [TOP, R], [L, R]];
  const M = { x: TOP.x + (L.x - TOP.x) * f, y: TOP.y + (L.y - TOP.y) * f };
  const ex = L.x - TOP.x, ey = L.y - TOP.y, el = Math.hypot(ex, ey);
  let nOut = { x: ey / el, y: -ex / el };
  if (nOut.x > 0) { nOut.x = -nOut.x; nOut.y = -nOut.y; }
  let safeMin = 99, safeMax = -99;
  for (let ang = -25; ang <= 25; ang += 1) {
    const a = ang * Math.PI / 180;
    const dirIn = { x: Math.cos(a), y: Math.sin(a) };
    let allOut = true;
    for (let i = 0; i < 7; i++) {
      const eta = 1 / (nBase + i * k0);
      const d1 = refract(dirIn, nOut, eta); if (!d1) { allOut = false; break; }
      let best = null;
      for (let e = 0; e < 3; e++) {
        const A = EDGES[e][0], B = EDGES[e][1];
        if ((A === TOP && B === L) || (A === L && B === TOP)) continue;
        const t = rayHit(M, d1, A, B);
        if (t !== null && (!best || t < best.t)) best = { t, a: A, b: B };
      }
      if (!best) { allOut = false; break; }
      const fx = best.b.x - best.a.x, fy = best.b.y - best.a.y, fl = Math.hypot(fx, fy);
      let n2 = { x: fy / fl, y: -fx / fl };
      if (n2.x * d1.x + n2.y * d1.y < 0) { n2.x = -n2.x; n2.y = -n2.y; }
      const d2 = refract(d1, n2, 1 / eta); if (!d2) { allOut = false; break; }
    }
    if (allOut) { safeMin = Math.min(safeMin, ang); safeMax = Math.max(safeMax, ang); }
  }
  return { nBase: nBase.toFixed(2), k0: k0.toFixed(3), f: f.toFixed(1), range: "[" + safeMin + " , " + safeMax + "]" };
}
console.log("nBase k0   f    安全角范围");
const res = [];
for (const nB of [1.40, 1.45, 1.49])
  for (const k0 of [0.010, 0.015, 0.020])
    for (const f of [0.3, 0.5, 0.7])
      res.push(scan(nB, k0, f));
res.forEach(r => console.log(r.nBase + "  " + r.k0 + " " + r.f + "  " + r.range));
