/* 我的 · 学习档案
 *
 * 只有"用户自己的数据"——个人主体不能做公开排行榜（社交/笔记类目未开放），
 * 所以这里不出现任何其他用户的信息。昵称头像走官方"头像昵称填写能力"，
 * 用户主动填，不做强制授权弹窗。
 */

const store = require('../../utils/store');
const roster = require('../../data/roster');
const termsData = require('../../data/terms');

Page({
  data: {
    nickName: '',
    avatarUrl: '',
    stats: { streak: 0, checkinDays: 0, scientists: 0, terms: 0 },
    totalScientists: 0,
    totalTerms: 0,
    sciPct: 0,
    termPct: 0,
    cloudReady: false,
    cloudHint: '',
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const g = (getApp() && getApp().globalData) || {};
    const stats = store.stats();
    const totalScientists = roster.scientists.length;
    const totalTerms = termsData.flatIndex.length;

    this.setData({
      stats: stats,
      nickName: g.nickName || wx.getStorageSync('nickName') || '',
      avatarUrl: g.avatarUrl || wx.getStorageSync('avatarUrl') || '',
      totalScientists: totalScientists,
      totalTerms: totalTerms,
      sciPct: totalScientists ? Math.round((stats.scientists / totalScientists) * 100) : 0,
      termPct: totalTerms ? Math.round((stats.terms / totalTerms) * 100) : 0,
      cloudReady: !!g.cloudReady,
      cloudHint: g.cloudError || '',
    });
  },

  /** 头像：官方 chooseAvatar 能力，用户主动选，不需要授权弹窗 */
  onChooseAvatar(e) {
    const url = e.detail && e.detail.avatarUrl;
    if (!url) return;
    wx.setStorageSync('avatarUrl', url);
    const app = getApp();
    if (app) app.globalData.avatarUrl = url;
    this.setData({ avatarUrl: url });
  },

  /** 昵称：官方 nickname 输入能力 */
  onNick(e) {
    const v = String((e.detail && e.detail.value) || '').trim();
    wx.setStorageSync('nickName', v);
    const app = getApp();
    if (app) app.globalData.nickName = v;
    this.setData({ nickName: v });
  },

  showPrivacy() {
    wx.showModal({
      title: '隐私说明',
      content:
        '我们只收集：① 你的微信 openid（用于识别身份、保存学习进度）；② 你主动填写的昵称与头像；③ 你在这台设备上的学习进度与打卡记录。\n\n不收集手机号、不收集位置、不向任何第三方提供，也不展示任何其他用户的信息。可随时在"清空本机记录"里删除本地数据。',
      showCancel: false,
      confirmText: '知道了',
    });
  },

  showAbout() {
    wx.showModal({
      title: '关于',
      content:
        '读懂科学家 · 面向中学生的科学史普及\n\n内容整理自公开史料与经典科普读物；图片来自 Wikimedia Commons，均为公有领域或 CC 授权，页面内保留来源标注。\n\n本小程序为个人主体非经营性产品，不含任何付费内容。',
      showCancel: false,
      confirmText: '知道了',
    });
  },

  resetLocal() {
    wx.showModal({
      title: '清空本机记录',
      content: '将清除本机的打卡、已读与术语记录（云端数据不受影响）。确定吗？',
      success: (res) => {
        if (!res.confirm) return;
        ['checkin', 'readScientists', 'viewedTerms'].forEach((k) => wx.removeStorageSync(k));
        this.refresh();
        wx.showToast({ title: '已清空', icon: 'none' });
      },
    });
  },

  goGlossary() {
    wx.switchTab({ url: '/pages/glossary/index' });
  },

  onShareAppMessage() {
    return { title: '读懂科学家 · 15 位改变世界的科学家', path: '/pages/portal/index' };
  },
});
