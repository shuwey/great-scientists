/* 读懂科学家 · 小程序入口
 *
 * 个人主体路线：微信登录 → 云函数拿 openid（免鉴权、无授权弹窗）。
 * 云环境没配好时**不报错、不阻塞**，本地档案照常可用——先能跑，再谈云。
 */

const store = require('./utils/store');

// TODO ①：填成长计划领取的云开发环境 ID（形如 cloud1-xxxxxxxx）。
//          留空则只走本地档案，所有云能力自动降级。
const CLOUD_ENV = '';

App({
  globalData: {
    openid: '',
    nickName: '',
    avatarUrl: '',
    cloudReady: false,
    cloudError: '',
  },

  onLaunch() {
    store.touchCheckin();
    this.initCloud();
  },

  initCloud() {
    if (!CLOUD_ENV) {
      this.globalData.cloudError = '未配置云环境（miniapp/app.js 的 CLOUD_ENV）';
      return;
    }
    if (!wx.cloud) {
      this.globalData.cloudError = '当前基础库不支持云开发';
      return;
    }
    wx.cloud.init({ env: CLOUD_ENV, traceUser: true });
    this.globalData.cloudReady = true;

    this.silentLogin().then(
      () => {},
      (err) => {
        this.globalData.cloudError = (err && (err.errMsg || err.message)) || '登录失败';
        console.warn('[login] 静默登录失败：', err);
      }
    );
  },

  /** 静默登录：建用户档案，拿回 openid。首次调用会在 users 集合建档。 */
  silentLogin() {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'login',
        data: { inviteFrom: wx.getStorageSync('inviteFrom') || '' },
        success: (res) => {
          const r = res.result || {};
          if (r.ok) {
            this.globalData.openid = r.openid;
            wx.setStorageSync('openid', r.openid);
          }
          resolve(r);
        },
        fail: reject,
      });
    });
  },
});
