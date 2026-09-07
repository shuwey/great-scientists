# 读懂科学家 · 科普系列站点

面向中学生的科学家科普系列。每位科学家是一个**独立的子站点**（结构统一、引擎共用），根目录 `index.html` 是汇总 15 位的**系列门户**。

目前状态：**15 位科学家子站全部建成并接入门户**。全部通过静态校验（`validate_site.py`：92 项通过 / 0 警告 / 0 错误）与浏览器级 e2e（`e2e_check.js`：0 运行时报错、Canvas 均已绘制）。

---

## 一、目录结构

```
读懂牛顿/                      ← 项目根（git 仓库根）
├── index.html                ← 系列总览/入口页（读懂科学家）
├── assets/                   ← 根级共享引擎（css + js，不含任何科学家数据）
│   ├── css/style.css
│   └── js/site.js
├── scientists/               ← 每位科学家一个子站（15 位，按出生年份排列，结构完全一致）
│   ├── copernicus/           哥白尼     1473–1543
│   ├── galileo/              伽利略     1564–1642
│   ├── kepler/               开普勒     1571–1630
│   ├── newton/               牛顿       1643–1727
│   ├── darwin/               达尔文     1809–1882
│   ├── pasteur/              巴斯德     1822–1895
│   ├── maxwell/              麦克斯韦   1831–1879
│   ├── mendeleev/            门捷列夫   1834–1907
│   ├── curie/                居里夫人   1867–1934
│   ├── einstein/             爱因斯坦   1879–1955
│   ├── bohr/                 玻尔       1885–1962
│   ├── turing/               图灵       1912–1954
│   └── hawking/              霍金       1942–2018
│
│   每个子站内部结构（以牛顿为参考实现/模板）：
│   ├── index.html            首页
│   ├── timeline.html         生平时间轴
│   ├── glossary.html         术语词典
│   ├── labs.html             动手玩（Canvas 演示）
│   ├── about.html            资料来源与延伸阅读
│   ├── detail/               成就详解页（各科学家不同，通常 4 篇）
│   ├── assets/               该子站私有：引擎副本 + img（draw SVG / history 照片）
│   │   ├── css/style.css
│   │   ├── js/site.js        通用交互引擎（术语弹窗/时间轴/导航/演示）
│   │   └── js/terms.js       该科学家专属术语库（SITE_TERMS / SITE_PAGES / SITE_CATS）
│   └── prototype/            早期框架稿（仅牛顿有，校验器跳过）
├── tools/                    ← 开发/校验/生成工具（共享）
│   ├── build_scientist.py    通用建站编排器（spec.json → 完整子站）
│   ├── build_portal.py       系列门户生成器（产出根 index.html）
│   ├── lab_templates.py      Canvas 实验模板库（15 种：轨道/摆/抛体/波/曲线/电磁感应/路径积分/…）
│   ├── svg_scenes.py         自绘 SVG 线稿库
│   ├── spec_<id>.py / .json  各科学家内容提纲（spec 驱动建站的输入）
│   ├── validate_site.py      全站静态校验（多科学家）
│   ├── e2e_check.js          Playwright 浏览器级测试（按科学家参数化）
│   ├── e2e_portal.js         系列门户（根 index.html）浏览器验证
│   ├── new_scientist.py      新科学家子站生成器（骨架）
│   ├── download_images.py / fetch_commons.py   Wikimedia 历史图片抓取
│   ├── measure.js / check_angle.js / …  物理演示调试辅助
│   └── shots/                测试截图（gitignore，不入库）
└── .workbuddy/               项目记忆（工作日志/长期笔记）
```

> 设计取舍：每个子站自带一份引擎与图片副本（自包含），便于单独预览/部署、独立移动。
> 代价是 `style.css` / `site.js` 会多份重复——**最终整合阶段**会把共享部分提升到根 `assets/` 去重（见第五节）。

---

## 二、通用交互引擎（一次写好，人人复用）

`assets/js/site.js` 是引擎，与具体科学家解耦。它读取三个通用全局变量（位于各子站 `assets/js/terms.js`）：

| 全局变量 | 含义 |
|---|---|
| `window.SITE_TERMS` | 术语库：每条含 `name/short/plain/analogy/extra/page/anchor/related/cat` |
| `window.SITE_PAGES` | 详解页映射：`{ 页键: {title, url} }`（`url` 相对于子站根） |
| `window.SITE_CATS`  | 术语分类数组（用于词典筛选） |

引擎自动提供：术语自动标注 + 点击弹窗、导航/进度条/返回顶部、时间轴展开、目录高亮、公式拆解、Canvas 演示、词典搜索。
兼容 `file://` 直接打开（自动按 `data-base` 修正相对路径），也兼容 http 部署。

> 历史兼容：引擎仍认 `NEWTON_*` 旧全局名；新子站一律用 `SITE_*`。

---

## 三、如何新增一位科学家

有两条路，**推荐走 A（spec 驱动）**——15 位里有 12 位就是这么建的。

### A. spec 驱动（推荐，一条命令出完整子站）

把内容提纲写成一个 spec（Python 或 JSON 均可），交给编排器：

```bash
python3 tools/build_scientist.py tools/spec_<id>.json
```

它会一次性产出：术语库 `terms.js`、详解页 `detail/*.html`、首页/时间轴/词典/关于、labs、自绘 SVG、Canvas 实验注入、CSS 补齐，并自动抓取 Wikimedia 真实历史照片（走 weserv 代理规避限流）。

spec 里的**硬约定**（踩过坑，务必遵守）：

- 每个 section 的 `"fig"` 值**必须等于对应 page 的 key**，否则 SVG 生成会错配。
- Canvas 实验 `kind` 必须在 `lab_templates.py` 的 `TEMPLATES` 里**已实现**（当前 15 种：orbit / pendulum / projectile / wave / graph / atom / growth / field / ellipse / branching / periodic / turing / blackhole / induction / pathintegral）。引用未实现的 kind 会在构建时 `NameError`。
- **e2e 要求第一个实验的滑块能改变 `.lab-readout` 文本**，所以 readout 文案里要带上滑块当前值（静态文案会被判 ⚠️）。
- 模板生成的 JS 运行在 `site.js` 的 **`"use strict"` IIFE 内**——任何变量都必须 `var` 声明，隐式全局会直接抛 `xxx is not defined`（图灵机模板曾栽在这里）。

### B. 骨架复制（手工精修时用）

```bash
python3 tools/new_scientist.py <id> <中文名> [英文名]
```

生成 `scientists/<id>/`，并把「读懂牛顿→读懂<名>」等品牌名替换好，然后手工填：

- `assets/js/terms.js`：术语库（保留 `SITE_*` 三个全局名）。
- `detail/*.html`：成就详解页（记得同步 `SITE_PAGES`）。
- `timeline.html` / `index.html` / `assets/img/history/*` + `CREDITS.json`。

### 3. 挂到总览（改一处即可）

编辑 `tools/build_portal.py` 顶部的 `SCIENTISTS` 列表，加入新科学家，然后重新生成门户：

```bash
python3 tools/build_portal.py
```

### 4. 校验 + 自测

```bash
python3 tools/validate_site.py          # 静态：链接/锚点/术语/ SVG / JS / labs 绑定
node tools/e2e_check.js <id>            # 浏览器级：双端截图 + 运行时报错 + 交互/Canvas
node tools/e2e_portal.js                # 门户：15 张卡片 + 检索过滤 + 跳转
```

> 全站 `validate_site.py` 与 `e2e_check.js` 跑满 15 个站点较慢（约 3 分钟），
> 建议用 `run_in_background` 跑，避免同步 120s 超时被 SIGTERM。

---

## 四、校验与测试工具

| 工具 | 作用 | 说明 |
|---|---|---|
| `tools/build_scientist.py` | spec → 完整子站 | `python3 tools/build_scientist.py tools/spec_<id>.json` |
| `tools/build_portal.py` | 生成系列门户 | 改 `SCIENTISTS` 列表后 `python3 tools/build_portal.py` |
| `tools/lab_templates.py` | Canvas 实验模板库 | 15 种模板；新增 kind 必须同步注册进 `TEMPLATES` |
| `tools/svg_scenes.py` | 自绘 SVG 线稿库 | 按 page key 生成，注意 `fig` 必须等于 page key |
| `tools/validate_site.py` | 全站静态校验 | 自动发现 `scientists/*` 逐个校验；ROOT 取脚本父目录，不写死路径。 |
| `tools/e2e_check.js` | Playwright 双端 e2e | `node tools/e2e_check.js <id>`（默认 `newton`）；截图与报告落在 `tools/shots/`。 |
| `tools/e2e_portal.js` | 门户浏览器验证 | 卡片数 / 缩略图 / 检索过滤 / 跳转 / 双端报错 |
| `tools/new_scientist.py` | 生成新子站骨架 | 见上（路径 B）。 |

> 历史图片版权：用于课件，优先 Wikimedia Commons 公有领域/CC BY-SA 真实历史照片。

---

## 五、最终整合路线图（大项目）

三步走，前两步已完成：

1. **子站各自成型** ✅ 已完成：15 位科学家全部建成，各自通过静态校验与浏览器 e2e。
2. **统一导航与检索** ✅ 已完成：根 `index.html` 是真正的系列门户——15 张卡片 + 按出生年份的路线图 + 关键词检索过滤，一处进入全部子站。
3. **整合成单一站点**（可选收尾）：
   - 把共享的 `style.css` 提升到根 `assets/`，各子站改为引用 `../../assets/...`（或构建期注入），去掉重复副本；
   - 统一部署为一个站点，子站作为栏目（如 `/newton/`、`/einstein/`）；
   - 总览页与各子站共享同一套导航与视觉系统。

> 关于第 3 步：**已评估，暂不做字节级去重**（2026-09-07）。
>
> 实测发现根 `style.css` 并不是各子站 CSS 的超集——子站副本里含有根缺失的
> 「通用补丁」（`.bio` / `.lab canvas` 高度上限 / 时间轴 `.tl-body` 配图上限，
> 恰好是历史上反复返工的三个关键尺寸），且各子站之间存在冲突值
> （如 `.lab canvas` 上限有 320px 与 360px 两种）。
> 直接把子站的 CSS 引用改到根，会让其余子站丢失各自补丁 → 视觉回归。
>
> 因此采取两步：
> 1. 已把缺失的通用补丁**补齐到根 `style.css`**（第 18 节），使根成为完整的一份参考样式；
>    门户页不使用这些选择器，故对现有页面零影响。
> 2. 各子站**继续保留自包含**的 `style.css`（可单独预览、单独部署），这是本项目的既定设计取舍。
>
> 若将来确需统一：先把根样式做成真超集（合并各子站独有规则并统一冲突值），
> 再把 117 个 HTML 的 CSS 引用改到根并删除副本——**务必重点回归伽利略的时间轴**
> （它的 `.tl-rail` 时间轴 CSS 是为修复"图片盖住年代"单独重写过的）。

---

## 六、部署与历史

- **当前线上（系列门户，15 位全集）**：<https://4e2abcc9f8f84b9dae34f54e08e489ff.app.workbuddy.link>
  部署的是**项目根目录**，因此一个链接即可访问全部 15 个子站（`/scientists/<id>/...`）。
- 该链接复用了此前「牛顿子站」的发布沙箱——**原先那个只讲牛顿的链接现在指向整个系列门户**，牛顿站仍可在 `/scientists/newton/` 访问。
- 爱因斯坦子站另有一个独立的历史链接（`7f19849c…`），内容同样可从新门户进入，可按需下线。
- 仓库历史：原为单站 `newton-science-site`，现重组为多科学家 monorepo，根目录为系列总览；2026-09-07 仓库已更名为 **`great-scientists`**（GitHub 旧地址自动重定向）：<https://github.com/shuwey/great-scientists>
- 关键经验沉淀见 `.workbuddy/memory/`；物理演示曾踩过的坑（全反射、循环步长零守卫、坐标奇点）记录在 `tools/` 调试脚本与记忆里。

---

## 七、快速命令速查

```bash
# 本地预览整个系列（根目录即门户入口）
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080/index.html

# 本地预览某个子站
python3 -m http.server 8080 --directory scientists/newton

# 全站静态校验（较慢，建议后台跑）
python3 tools/validate_site.py

# 浏览器级自测（需 Playwright；较慢，建议后台跑）
node tools/e2e_check.js <id>

# 门户验证
node tools/e2e_portal.js

# 重新生成门户（改过科学家名单后）
python3 tools/build_portal.py

# 开新科学家（spec 驱动，推荐）
python3 tools/build_scientist.py tools/spec_<id>.json
```
