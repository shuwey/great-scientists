// 模拟 labProjectile 的核心数学与循环，验证 progress=0/0.5/1 都不死循环
function simulate(progress) {
  var v = 40, a = 45, g = 9.8;
  var rad = a * Math.PI / 180;
  var vx = v * Math.cos(rad), vy = v * Math.sin(rad);
  var Tf = 2 * vy / g;
  var tp = (progress === undefined ? null : Math.max(0, progress) * Tf);
  var steps = 0;
  if (tp !== null && tp > 0) {
    var segs = 90, dt2 = tp / segs;
    for (var t2 = 0; t2 <= tp + 1e-9; t2 += dt2) {
      steps++;
      if (steps > 100000) throw new Error("死循环未终止!");
    }
  }
  return { pr: progress, tp: tp, Tf: Tf, steps: steps };
}

[0, 0.001, 0.5, 1].forEach(function (p) {
  // 用极小的"第一帧"模拟
  var r = simulate(p);
  console.log("progress=" + p + " → tp=" + (r.tp === null ? "null" : r.tp.toFixed(3)) +
    " 循环步数=" + r.steps + " (Tf=" + r.Tf.toFixed(2) + "s)");
});
// 重点验证首个动画帧 progress=0 不再冻死
console.log("\n✅ progress=0 走 tp>0 守卫，循环被跳过，无死循环");
console.log("✅ 其余帧用固定 90 步，必定终止");
