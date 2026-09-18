/* 生平时间轴
 *
 * 数据来自 data/pages.js 的 timeline 段（抽取器已把两种网页结构 —— 静态列表式
 * 与折叠面板式 —— 抹平成同一 schema），页面本身不认识任何一位科学家。
 *
 * 「同期中国」卡片用的是与网页端同一份数据源（tools/china_data.py）和同一套
 * ±20 年窗口口径，只是在导出时**预算好**了 —— 小程序端不适合再带一份计算引擎进来。
 */

const roster = require('../../data/roster');
const pagesData = require('../../data/pages');
const termsData = require('../../data/terms');
const store = require('../../utils/store');
const cloud = require('../../utils/cloud');
const img = require('../../utils/img');
const pageOrder = require('../../utils/pages');

function lifeOf(f) {
  const b = f[1];
  const d = f[2];
  return b + (d ? '–' + d : '—');
}

Page({
  data: {
    s: null,
    nodes: [],
    details: [],
    years: [],
  },

  onLoad(options) {
    const id = (options && options.id) || '';
    const s = roster.scientists.filter((x) => x.id === id)[0];
    const raw = pagesData.timeline[id];
    if (!s || !raw) {
      wx.showToast({ title: '没找到这位科学家的时间轴', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 900);
      return;
    }
    this.id = id;
    this.sci = s;
    wx.setNavigationBarTitle({ title: s.shortName + ' · 时间轴' });
    store.markScientist(id);
    cloud.reportProgress({ scientistId: id, timelineViewed: true });

    const bundle = termsData.bySci[id] || { pages: {} };
    const details = pageOrder.detailOrder(bundle, pagesData.detail[id]);

    this.setData({
      s: s,
      details: details,
      years: raw.map((n) => n.y),
      nodes: raw.map((n) => this.toView(n)),
    });
  },

  /** 把导出数据翻成视图模型：解析图片、展开「同期中国」的人物生卒 */
  toView(n) {
    const blocks = (n.blocks || []).map((b) => {
      if (b.k === 'fig') {
        return { k: 'fig', src: img.resolve(this.id, b.img), cap: b.cap || '' };
      }
      return { k: 'p', h: b.h };
    });

    let cn = null;
    if (n.cn) {
      cn = {
        era: n.cn.era,
        ev: (n.cn.ev || []).map((e) => ({ y: e[0], t: e[1] })),
        fig: (n.cn.fig || []).map((f) => ({
          name: f[0], life: lifeOf(f), field: f[3], desc: f[4],
        })),
      };
    }
    return { y: n.y, t: n.t, s: n.s || '', tags: n.tags || [], blocks: blocks, cn: cn };
  },

  jumpYear(e) {
    const i = e.currentTarget.dataset.i;
    wx.pageScrollTo({ selector: '#tl-' + i, duration: 260, offsetTop: -24 });
  },

  openDetail(e) {
    wx.navigateTo({
      url: '/pages/detail/index?id=' + this.id + '&slug=' + e.currentTarget.dataset.slug,
    });
  },

  openLabs() {
    wx.showToast({ title: '动手实验还在迁移中', icon: 'none' });
  },

  onShareAppMessage() {
    const s = this.data.s || {};
    return { title: s.shortName + ' 的一生 · 时间轴', path: '/pages/timeline/index?id=' + this.id };
  },
});
