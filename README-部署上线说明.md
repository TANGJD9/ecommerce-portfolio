# 🌊 跨境电商运营模拟操盘案例 · 作品网站

> 目标岗位：**跨境电商运营专员** ｜ 主平台：亚马逊美国站（结构可迁移 TikTok Shop / Shopee / 独立站）

这是一个**纯静态网站**（HTML + CSS + JS + 本地内置 ECharts），无任何外部依赖、无需数据库，任何静态托管都能直接运行。所有运营数据均为**模拟数据**，用于展示运营方法论与数据能力。

---

## 一、网站结构

| 页面 | 文件 | 内容 |
|---|---|---|
| 首页 / 个人介绍 | `index.html` | 目标岗位、职业动机、4 大核心卖点、3 个月学习路径、案例总览 |
| 选品分析 | `selection.html` | 市场趋势图表、目标人群、4 竞品对比、**交互式利润测算器**、关键词验证 |
| 商品落地页 | `listing.html` | 亚马逊风格 Listing 演示、主图切换、价格促销策略、A+ 内容、信任背书 |
| 广告投放 | `ads.html` | 关键词分层、4 类广告结构、预算饼图、ACOS/ROAS 目标曲线 |
| 数据看板 | `dashboard.html` | 8 大核心指标、**时间段 / 渠道 / 广告类型筛选**、销售趋势、库存分析 |
| 复盘与优化 | `review.html` | 主图 A/B 测试前后对比、标题 A/B、下一步优化路线图 |

技术栈：原生 HTML/CSS/JS + [Apache ECharts](https://echarts.apache.org/)（已下载到 `assets/vendor/`，**离线可运行**）。产品视觉为代码生成的 SVG 插画。

---

## 二、本地预览

任选一种（无需安装任何东西）：

1. **直接双击** `index.html`（Chrome / Edge 打开即可，所有资源都是本地文件）
2. 或启动一个本地静态服务器（推荐，行为与线上一致）：
   - Python：在网站根目录运行 `python -m http.server 8000`，然后访问 `http://localhost:8000`
   - Node：`npx serve` 或在根目录运行 `npx http-server -p 8000`

---

## 三、部署上线（面试官通过链接访问）

任选一种免费方案，**推荐 GitHub Pages**（免费、稳定、可长期保留）。

### 方案 A：GitHub Pages（推荐）

1. 注册/登录 [GitHub](https://github.com)，新建仓库（如 `ecommerce-portfolio`，**设为 Public**）
2. 把本文件夹所有内容上传到仓库（网页端 Upload files，或 Git 命令行推送）
3. 仓库 → **Settings** → **Pages**
   - Source 选 **Deploy from a branch**
   - Branch 选 `main`，文件夹选 **/ (root)**，点 Save
4. 等 1–2 分钟，访问 `https://你的用户名.github.io/ecommerce-portfolio/`
5. 建议把该链接放入简历"个人作品"栏（可再买一个便宜域名绑定，如 `xiaolin-ops.com`，更有记忆点）

### 方案 B：Vercel / Netlify（拖拽上传，最快）

- **Vercel**：登录 vercel.com → New Project → 直接拖入本文件夹 → 部署完成即得链接
- **Netlify**：登录 netlify.com → **Add new site → Deploy manually** → 拖入本文件夹 → 完成

> 💡 面试前请确认：链接在**手机和电脑**上都能打开，且用**无痕窗口**再测一次（排除缓存/登录态问题）。

---

## 四、自定义修改指南

### 1. 换成你的真实信息（必做）
- **姓名**：全站使用"林晓"作为示例，搜索替换为你的名字（6 个 `*.html` + 顶部导航的 brand 区）
- **联系方式**：首页和页脚建议加上你的电话 / 邮箱 / LinkedIn（替换掉示例占位）

### 2. 调整产品与数据
- 想换成别的产品（如家居小件）：改 `selection.html`（选品逻辑）、`listing.html`（Listing 文案）、`assets/js/dashboard.js`（`data` 数组生成逻辑）
- 所有模拟数据都集中在：
  - `assets/js/dashboard.js` — 90 天数据生成（`ctr/cvr/acos/adShare` 等参数可调）
  - `assets/js/selection.js` — 市场规模与季节性
  - `assets/js/ads.js` — 预算分配与 ACOS 曲线
  - 各 `*.html` 内的表格与文案

### 3. 改成 TikTok Shop / Shopee / 独立站
- 核心数据指标通用（曝光/CTR/CVR/ROAS/库存周转）
- 替换平台专属表述：亚马逊佣金 15% → 按目标平台费率；FBA → 平台物流/自发货；SP 广告 → TikTok Ads / Shopee 广告 / Google Ads
- "结构要通用"这一点本身就是面试加分点，可在面试时主动说明

---

## 五、小贴士

- 面试官 3 分钟快速版：**首页 → 数据看板 → 复盘优化**
- 面试官 10 分钟完整版：按 01 → 05 顺序走一遍
- 正式面试前建议把网站数据（售价、ACOS、竞品名）背熟，被追问细节时能脱口而出

📄 配套文档：《面试演示脚本.md》—— 每页怎么讲 + 高频面试问答，建议打印一份带去面试。
