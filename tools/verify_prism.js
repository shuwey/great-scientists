// 验证选定棱镜参数：nBase=1.40, k0=0.014, f=0.5
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
function analyze(nBase, k0, f, angDeg) {
  const TOP = { x: 400, y: 78 }, L = { x: 288, y: 272 }, R = { x: 512, y: 272 };
  const EDGES = [[TOP, L], [TOP, R], [L, R]];
  const M = { x: TOP.x + (L.x - TOP.x) * f, y: TOP.y + (L.y - TOP.y) * f };
  const ex = L.x - TOP.x, ey = L.y - TOP.y, el = Math.hypot(ex, ey);
  let nOut = { x: ey / el, y: -ex / el };
  if (nOut.x > 0) { nOut.x = -nOut.x; nOut.y = -nOut.y; }
  const a = angDeg * Math.PI / 180;
  const dirIn = { x: Math.cos(a), y: Math.sin(a) };
  let outCount = 0, faces = {};
  const dirs = [];
  for (let i = 0; i < 7; i++) {
    const eta = 1 / (nBase + i * k0);
    const d1 = refract(dirIn, nOut, eta); if (!d1) continue;
    let done = false;
    for (let e = 0; e < 3; e++) {
      const A = EDGES[e][0], B = EDGES[e][1];
      if ((A === TOP && B === L) || (A === L && B === TOP)) continue;
      const t = rayHit(M, d1, A, B); if (t === null) continue;
      const fx = B.x - A.x, fy = B.y - A.y, fl = Math.hypot(fx, fy);
      let n2 = { x: fy / fl, y: -fx / fl };
      if (n2.x * d1.x + n2.y * d1.y < 0) { n2.x = -n2.x; n2.y = -n2.y; }
      const d2 = refract(d1, n2, 1 / eta);
      if (d2) {
        faces[e === 1 ? 'TOP-R' : 'L-R'] = (faces[e === 1 ? 'TOP-R' : 'L-R'] || 0) + 1;
        outCount++; dirs.push(Math.atan2(d2.y, d2.x) * 180 / Math.PI); done = true; break;
      }
    }
    if (!done) continue;
  }
  let spreadDeg = 0;
  if (dirs.length >= 2) {
    let mn = Math.min(...dirs), mx = Math.max(...dirs); spreadDeg = +(mx - mn).toFixed(1);
  }
  return { angDeg, outCount, faces, spreadDeg };
}
const cfg = { nBase: 1.40, k0: 0.014, f: 0.5 };
console.log("参数", JSON.stringify(cfg));
for (const ang of [-25, -15, -10, -8, -5, 0, 3, 5]) {
  const r = analyze(cfg.nBase, cfg.k0, cfg.f, ang);
  console.log(`angle=${String(ang).padStart(3)}°  出射色数=${r.outCount}/7  出射面=${JSON.stringify(r.faces)}  扇形张角=${r.spreadDeg}°`);
}
