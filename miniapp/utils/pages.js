/* 详解页顺序解析器
 *
 * 为什么不直接拿 terms.pages 的键当 slug：两处都对不上，而且是**静默**对不上。
 *   · einstein：键是 `massenergy`，文件是 `detail/mass-energy.html`
 *   · galileo ：SITE_PAGES 里混了一条 `timeline -> timeline.html`，不是详解页
 * 直接拿键去开页面会点进"没找到这篇内容"，拿文件名排序又会丢掉站点设定的顺序。
 * 所以统一在这里解析一次：**顺序随站点（SITE_PAGES），slug 取 url 的文件名**，
 * 只认 detail/ 下的条目；SITE_PAGES 漏登记的再按导出顺序补在后面兜底。
 */

function slugOf(url) {
  const base = String(url || '').split('/').pop();
  return base.replace(/\.html$/, '');
}

function detailOrder(bundle, detailMap) {
  const map = detailMap || {};
  const out = [];
  const seen = {};
  const pages = (bundle && bundle.pages) || {};

  Object.keys(pages).forEach((k) => {
    const url = pages[k].url || '';
    if (url.indexOf('detail/') !== 0) return;   // 时间轴等非详解页，跳过
    const slug = slugOf(url);
    if (!map[slug] || seen[slug]) return;
    seen[slug] = true;
    out.push({ slug: slug, title: pages[k].title || map[slug].title || slug });
  });

  Object.keys(map).forEach((slug) => {
    if (seen[slug]) return;
    seen[slug] = true;
    out.push({ slug: slug, title: map[slug].title || slug });
  });
  return out;
}

module.exports = { detailOrder: detailOrder, slugOf: slugOf };
