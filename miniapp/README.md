# 读懂科学家 · 微信小程序

把静态站「读懂科学家」搬进微信小程序的工程。内容**不搬 HTML、搬数据**：
站点是内容源，这里通过抽取器消费它。

> 架构与合规依据见 [`ARCHITECTURE.md`](./ARCHITECTURE.md)（含个人主体红线、备案关键路径）。
> 账号注册与备案操作清单见 [`ACCOUNT_SETUP.md`](./ACCOUNT_SETUP.md)（注册顺序、命名红线、备案时间线）。

---

## 一、现状（v1 可跑）

| 模块 | 状态 |
|---|---|
| 内容层：15 位元数据 + 398 条术语 | ✅ 已抽取，两条独立路径交叉核对通过 |
| 工程骨架：app.json / app.js / app.wxss / 主题令牌 | ✅ |
| 门户页（**查询优先**：搜索框 → 跨库结果 → 图标桌面） | ✅ |
| 词典页（398 条 + 搜索 + 双筛选 + 触底分页） | ✅ |
| 科学家档案页（术语按分类分组 + 两个内容入口 + 弹层） | ✅ |
| **生平时间轴**（174 个节点，每节点带同期中国对照） | ✅ 内容已迁移（历史照片待上云） |
| **成就详解**（60 篇：小节/配图/提示框/公式符号表/概念胶囊） | ✅ 内容已迁移（3 张配图待上云） |
| 我的（学习档案 / 打卡 / 头像昵称填写能力 / 隐私入口） | ✅ |
| 账号与云端：静默登录、进度上报（云函数 ×2） | ✅ 代码就绪，**待部署** |
| 历史照片上云（144 张，压后 10.6MB） | ⬜ 待云环境就绪后上传 |
| 动手实验室（15 种 Canvas） | ⬜ 待移植 |
| 术语自测 + 成绩海报 | ⬜ 待开发 |
| 分包拆分的落地 | ⬜ v1 全在主包（1010KB，余量充足） |

静态校验：`python3 tools/validate_miniapp.py` → **34 项通过 / 0 错误 / 0 警告**。
页面自测：`node tools/e2e_miniapp_pages.js` → **887 条断言 / 0 问题**（假 wx 真跑 onLoad）。
护栏自证：`python3 tools/selftest_miniapp_guardrails.py` → **6 个人造错误全部拦住 + 1 个误报反例通过**。

---

## 二、首页为什么是「查询优先」

**这不是版式偏好，是过审的结构性约束。** 类目报的是「工具 > 信息查询」，
审核员打开首页第一眼必须看到「一个能查东西的工具」，而不是「一个看文章的地方」，
否则按**功能与类目不符**驳回——改文案糊不过去，只能改信息架构。

所以门户页的固定顺序是：

```
深色首屏    搜索框（视觉重心，唯一的白色块）
           实时跨库检索：术语 + 科学家
           示例查询词 chips
────────────────────────────────────
结果区      术语 N 条（一条一句话，点开弹层）
           科学家 M 位
           还有 X 条 → 跳词典看全部
────────────────────────────────────
浏览区      最近查过 / 按学科查 / 15 位图标桌面
```

两个实现纪律：

- **检索逻辑只有一份**（`utils/search.js`），门户与词典共用。
  同一个词在两处给出不同结果，用户会以为数据不一致——站点端踩过这个坑，端上不重演。
- **跨 tab 传参只能走一次性信箱**。`wx.switchTab` 不能带 query，
  所以门户跳词典时把关键词投进 `store.setPendingQuery()`，词典页 `onShow` 取走即清。
  同时清掉词典页的旧筛选，否则词带过去了却被上一次的筛选挡住，看着像「查不到」。

> ⚠️ 数据层目前**只有 roster + terms，没有 timeline**。
> 所以首页快捷查询只放有数据支撑的维度，**不要对外承诺「按年份查」**——
> 那是站点端的能力，小程序要等抽取器补 timeline 之后才有。

---

## 三、跑起来要填的两样东西

### 1. 小程序 AppID
`project.config.json` 里当前是 `touristappid`（游客模式，云开发不可用）。
换成你的真实 AppID；或在微信开发者工具里「详情 → 基本信息」直接改。

### 2. 云开发环境 ID
`app.js` 顶部：

```js
const CLOUD_ENV = '';   // 填成 cloud1-xxxxxxxx
```

**留空也能跑** —— 所有云能力会静默降级为本地档案（打卡、进度、看过的术语都存在本机），
页面不会报错。这是刻意的设计：先能跑，再谈云。

> ⚠️ 新建环境时注意：成长计划「可免费创建 1 个 6 个月有效的个人版环境」；
> 而**免费体验版环境是每账号一个**，账号下若已被其他项目占用，就不会再有免费体验名额。
> 另外免费环境在小程序**发布上线后第 15 天到期**，不付费则隔离 7 天后删数据 —— 上线即转付费。

---

## 四、部署云函数与数据库

1. 开发者工具 → 右键 `cloudfunctions/login` → **上传并部署（云端安装依赖）**；`report` 同理。
2. 云开发控制台 → 数据库 → 建集合：`users`、`progress`、`quizRecords`。
3. **每个集合的权限都设「仅创建者可读写」**（`users` 至少也要创建者可读）。
   云函数写入时必须显式带 `_openid`，已在 `login/index.js`、`report/index.js` 里处理。
4. 建议索引：`progress` 建 `_openid + scientistId` 复合索引。

---

## 五、内容怎么更新

**单向同步，别反向改。**

```
改静态站内容（spec_*.py / terms.js / index.html）
        ↓
python3 tools/export_miniapp_content.py      # 术语 + 门户元数据 → data/roster.js、data/terms.js
python3 tools/export_miniapp_pages.py        # 时间轴 + 成就详解   → data/pages.js
python3 tools/build_miniapp_page_assets.py   # 配图编目        → assets/pages/、data/images.js
        ↓
python3 tools/validate_miniapp.py            # 静态校验
node    tools/e2e_miniapp_pages.js            # 页面逻辑无头自测
        ↓
微信开发者工具上传新版本
```

抽取器有两条独立路径交叉核对术语条数（Node 求值 vs 正则数键），
不一致直接退出——防"静默丢内容"。

### 内容层新增了什么（2026-09-18）

小程序原先是"门户 + 术语词典"，缺了主站最核心的两块内容。现在补齐：

| 页面 | 内容 | 规模 |
|---|---|---|
| `pages/timeline/index` | 生平时间轴，每个节点带**同期中国**对照卡（朝代年号 / 同期大事 / 同期人物 / **可点名词胶囊**） | 174 个节点 |
| `pages/detail/index` | 成就详解：小节 + 配图 + 提示框 + 公式符号表 + 关键概念胶囊 | 60 篇 |

同期中国的计算与网页端**共用同一份实现**（`tools/china_cards.py`，数据源是
`tools/china_data.py`）——不是"两边口径一致"而是"同一段代码"。端上只做翻译：

- **同一条目在同一站只出现一次**（全局按距离分配），每节点每类最多 3 条；
- **历史名词**（年号、科举、虎门销烟…，85 条）放在 `data/terms.js` 的**独立 `cn` 命名空间**，
  不进 `bySci` —— 否则「术语词典」页会混进一批历史名词、按人聚合的计数也会被污染；
- rich-text 不认事件，所以网页端标在正文里的名词，端上**降级成卡片末尾的可点胶囊**；
  标题那行的年号本身就是入口（虚线下划线提示）。点开走既有的 `term-popup` 组件。

⚠️ 端上点历史名词**不写** `store.markTerm` / `cloud.reportProgress`：术语进度是按科学术语
统计的，把 `cn-*` 混进同一个数组会污染词典页的掌握计数与后台报表。

### 配图怎么走（重要）

| 类型 | 体积 | 去处 |
|---|---|---|
| 示意图 SVG | 65 张 / 96 KB | **打进包** → `assets/pages/`，矢量不失真 |
| 历史照片 JPG | 144 张 / 29 MB | **云存储** → 压到 10.6 MB 后上传 |

历史照片换成云存储不是选择而是**唯一出路**：个人主体无法给外部域名做 ICP 备案，
`downloadFile` 白名单根本加不了；而 29 MB 也远超主包 2 MB 上限。

`data/images.js` 是"路径 → 实际资源"的映射表。照片还没上云时解析为空字符串，
**页面据此不渲染图片 —— 绝不出现裂图**。上传完成后把 fileID 写进
`tools/miniapp_cloud_images.json` 再重跑一次配图脚本，照片自动点亮，页面代码一行都不用改。

```bash
python3 tools/stage_miniapp_photos.py        # 压缩备料 → ../读懂牛顿-验证产物/miniapp-photos/
# 上传该目录到云存储 → 写 tools/miniapp_cloud_images.json
python3 tools/build_miniapp_page_assets.py   # 合并云映射，照片点亮
```

### 相关工具

| 工具 | 作用 |
|---|---|
| `tools/export_miniapp_content.py` | 站点 → 小程序内容层（术语 + 元数据，幂等、确定性） |
| `tools/export_miniapp_pages.py` | 站点 → 时间轴 + 成就详解（含同期中国预计算） |
| `tools/build_miniapp_page_assets.py` | 配图编目：随包 / 上云分流，产出 `data/images.js` |
| `tools/stage_miniapp_photos.py` | 历史照片压 WebP 备料 + 量出上云体积 |
| `tools/miniapp_terms_dump.js` | 在沙箱里求值各站 `terms.js`，输出 JSON |
| `tools/validate_miniapp.py` | 小程序静态校验（数据/富文本/内容层/路由/跳转/体积/红线词） |
| `tools/e2e_miniapp_pages.js` | 页面逻辑无头自测（假 wx，真跑 onLoad，断言 887 条） |
| `tools/preview_miniapp_pages.js` | 版式预览：真数据 + 真 wxss 渲成网页，不开开发者工具也能目视验收 |
| `tools/selftest_miniapp_guardrails.py` | 护栏自证：注入人造错误，确认校验器拦得住 |
| `tools/make_miniapp_tabbar.py` | 生成 tabBar PNG 图标（小程序不支持 SVG） |
| `tools/miniapp_content_report.json` | 抽取产物报告（计数与体积） |
| `tools/miniapp_pages_report.json` | 时间轴/详解抽取报告 |
| `tools/miniapp_pending_photos.json` | 待上云照片清单（上传脚本读它） |

---

## 六、目录结构

```
miniapp/
├── app.js / app.json / app.wxss      入口、路由、设计令牌
├── project.config.json               ⚠️ 改 AppID
├── sitemap.json
├── data/                             由抽取器生成，不要手改
│   ├── roster.js                     15 位元数据 + 设计令牌 + 学科色
│   ├── terms.js                      bySci（全量）+ flatIndex（列表/搜索索引）
│   ├── pages.js                      timeline（174 节点，含同期中国）+ detail（60 篇）
│   └── images.js                     图片映射表（包内路径 / 云 fileID；未就绪则为空）
├── assets/
│   ├── icons/                        15 张首屏图标（webp，228KB，走包内）
│   ├── pages/                        65 张详解页示意图（SVG，96KB，走包内）
│   └── tabbar/                       tabBar 图标（PNG，4 组 × 2 态）
├── components/term-popup/            术语弹层（rich-text 渲染高亮）
├── pages/
│   ├── portal/                       门户（tab）· 查询优先
│   ├── glossary/                     词典（tab）· 与门户共用检索层
│   ├── profile/                      我的（tab）
│   ├── scientist/                    科学家档案（非 tab，必须在 app.json 里登记）
│   ├── timeline/                     生平时间轴（含同期中国对照）
│   └── detail/                       成就详解
├── utils/
│   ├── search.js                     检索层（排序与匹配的唯一实现）
│   ├── store.js                      本地学习档案（打卡/已读/术语/查询记录）
│   ├── cloud.js                      云调用封装（未配环境则静默降级）
│   ├── img.js                        图片解析（未上云的照片返回空，页面不渲染占位）
│   └── pages.js                      详解页顺序解析（SITE_PAGES 顺序 + 文件名 slug）
└── cloudfunctions/
    ├── login/                        静默登录 / 建档
    └── report/                       进度与成绩上报（幂等 upsert）
```

> `cloudfunctions/` 不参与小程序包体积；静态站发布时也不会引用这里的任何文件。

---

## 七、提审前 checklist

- [ ] 类目：**工具 > 信息查询**（单一类目，**不要加「教育」**——会让成长计划失去 6 个月免费云环境资格）
- [ ] 名称 / 简介不含 `教育 / 培训 / 新闻 / 金融 / 直播 / 图书` 等前置审批词（备案入口会拦）
- [ ] 已在 mp 后台「行业能力 → AI 小程序成长计划」报名并领到 6 个月云环境
- [ ] 备案通过并拿到备案号，填到「我的 → 页脚」
- [ ] 后台配置《小程序用户隐私保护指引》：声明收集 openid / 昵称 / 头像及用途
- [ ] 「我的」页有隐私说明与关于入口（已内置）
- [ ] **首页首屏是「查询」而不是「阅读」**（见第二节，这是过审的结构性要求）
- [ ] 无诱导分享、无公开排行榜、无用户间可见内容（已按此设计）；付费只做**工具型虚拟商品**（会员 / 解锁 / 额度包），**不做卖课卖资料**
- [ ] 图片署名：`assets/` 内图均为站点同源（Wikimedia PD/CC），迁移详情页时补齐来源标注
- [ ] 文案红线词扫描：`python3 tools/validate_miniapp.py` 第 [5] 项
- [ ] ⚠️ 站点侧 `scientists/newton/detail/gravity.html` 的「看火箭发射**直播**」需改成「实况」——
      迁移这篇详情页前先改掉
