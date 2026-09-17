/* 检索层 · 门户与词典共用
 *
 * 为什么必须抽成一个模块：同一个词在两处给出不同结果，用户会以为数据不一致。
 * 站点端踩过的坑（同一事实跨页口径不一致）不要在端上重演。
 *
 * 排序规则（分越小越靠前）：
 *   0 名称完全匹配  1 名称前缀  2 名称包含  3 分类包含  4 一句话包含  5 科学家名包含
 * q 为空时返回原序 —— 排序只在「有查询词」时发生，词典页按需筛选不受影响。
 */

function norm(s) {
  return String(s == null ? '' : s).trim().toLowerCase();
}

/** 术语扁平索引：预拼检索字段（398 条只算一次，且不放进 setData） */
function buildTerms(termsData, sciNameOf) {
  return termsData.flatIndex.map(function (x) {
    const sciName = sciNameOf[x.sci] || '';
    return {
      sci: x.sci,
      k: x.k,
      name: x.name,
      cat: x.cat,
      short: x.short,
      sciName: sciName,
      _n: norm(x.name),
      _c: norm(x.cat),
      _s: norm(x.short),
      _p: norm(sciName),
    };
  });
}

function termScore(x, q) {
  if (x._n === q) return 0;
  if (x._n.indexOf(q) === 0) return 1;
  if (x._n.indexOf(q) >= 0) return 2;
  if (x._c.indexOf(q) >= 0) return 3;
  if (x._s.indexOf(q) >= 0) return 4;
  if (x._p.indexOf(q) >= 0) return 5;
  return -1;
}

/** 过滤 + 排序；q 为空原样返回（是否截断由调用方决定） */
function rankTerms(rows, q) {
  const k = norm(q);
  if (!k) return rows.slice();

  const scored = [];
  for (let i = 0; i < rows.length; i++) {
    const sc = termScore(rows[i], k);
    if (sc >= 0) scored.push({ x: rows[i], sc: sc });
  }
  scored.sort(function (a, b) {
    if (a.sc !== b.sc) return a.sc - b.sc;
    // 同分时短名优先，结果更像「查得到」而不是「碰运气」
    if (a.x._n.length !== b.x._n.length) return a.x._n.length - b.x._n.length;
    return a.x.name < b.x.name ? -1 : a.x.name > b.x.name ? 1 : 0;
  });
  return scored.map(function (r) {
    return r.x;
  });
}

/** 科学家索引：姓名 / 全名 / 英文名 / 学科 / 生卒 / 关键词 */
function buildScientists(scientists) {
  return scientists.map(function (s) {
    return Object.assign({}, s, {
      _hay: norm(
        [s.shortName, s.fullName, s.enName, s.disc, s.years]
          .concat(s.keywords || [])
          .join(' ')
      ),
    });
  });
}

function matchScientists(rows, q) {
  const k = norm(q);
  if (!k) return rows.slice();
  return rows.filter(function (s) {
    return s._hay.indexOf(k) >= 0;
  });
}

module.exports = {
  norm: norm,
  buildTerms: buildTerms,
  rankTerms: rankTerms,
  buildScientists: buildScientists,
  matchScientists: matchScientists,
};
