/* 云开发调用封装
 *
 * 全部接口都是「云环境没配好就静默降级」，调用方不需要判断 cloudReady。
 * 刻意不用自建服务器/域名：个人主体走这条路可以免掉域名备案与请求白名单。
 */

function app() {
  return getApp() || {};
}

function ready() {
  const g = app().globalData || {};
  return !!g.cloudReady;
}

function call(name, data) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: name,
      data: data || {},
      success: (res) => resolve(res.result || {}),
      fail: reject,
    });
  });
}

/** 上报学习进度（幂等 upsert，服务端按 openid 归集） */
function reportProgress(payload) {
  if (!ready()) return Promise.resolve({ ok: false, skipped: 'cloud-not-ready' });
  return call('report', { action: 'progress', payload: payload }).catch((e) => ({
    ok: false,
    error: (e && e.errMsg) || String(e),
  }));
}

/** 提交自测成绩 */
function reportQuiz(record) {
  if (!ready()) return Promise.resolve({ ok: false, skipped: 'cloud-not-ready' });
  return call('report', { action: 'quiz', payload: record }).catch((e) => ({
    ok: false,
    error: (e && e.errMsg) || String(e),
  }));
}

module.exports = { ready, call, reportProgress, reportQuiz };
