# 页面说明：`/`（Home / SEO Landing + Search Entry）

面向：前端、设计、内容（SEO）同学。以下内容以现有实现为基线，可直接落地。

## 路由与实现位置

- 路由：`/`
- Next.js 文件：`src/app/[locale]/(marketing)/page.tsx`
- 共享布局（导航/页脚）：`src/app/[locale]/(marketing)/layout.tsx`

## 页面目标（MVP）

- 承接自然流量（SEO），用清晰的 H1/H2 + FAQ 建立“Reverse Image Search”相关关键词覆盖。
- 让用户快速理解产品价值：以图搜图、找来源、找更高清图。
- 将用户引导到注册（赠送免费 credits）或付费（Pricing）。
- 提供可体验的搜索入口：未登录展示 Demo，登录后可直接进行真实搜索（由 `SearchClient` 负责交互）。

## 页面结构（可实现）

1. **搜索入口（首屏）**
   - 组件：`SearchClient`（在首页顶部卡片中渲染）
   - 设计要点：醒目的卡片容器（圆角 + 轻阴影），作为“主入口”。

2. **价值主张 Hero（SEO + 转化）**
   - 品牌角标：`ReverseImage.io`
   - H1：`Reverse Image Search`
   - 副标题：`Search across 50+ stock sites. Find higher resolution versions. Identify sources instantly.`
   - 未登录用户：展示“免费试用”提示卡
   - CTA（见“文案”）
   - 可信点 chips：`50+ Stock Sites / Higher Resolution / Instant Results / Mobile & Desktop`

3. **Why / How（两张信息卡）**
   - H2：`Why use reverse image search?`
   - H2：`How to search by image on desktop and mobile`
   - Desktop / Mobile 两块简短说明

4. **Feature Grid（3 列卡片）**
   - 4 个卖点卡：`Search Across 50+ Sources / Find Higher Resolution / Instant Source Identification / Simple Pay-Per-Use`

5. **Key Features + Use Cases（两列）**
   - 左侧：编号列表（3 条）
   - 右侧：Use cases（4 条）+ CTA

6. **SEO Long-tail（2 张说明卡）**
   - `Secure and private image lookup`
   - `Google-powered visual search`

7. **FAQ 区域（带 JSON-LD）**
   - 展示 3 条问答（见“SEO/FAQ”）
   - 同步输出 FAQ JSON-LD（已在代码中实现）

8. **底部大 CTA**
   - 标题：`Ready to Find Your Images?`
   - 未登录 CTA：注册领取免费 credits
   - 已登录 CTA：引导进入 `/search`（注意：当前仓库未实现 `/search` 页面，需要补路由或改链接）

## 关键文案（建议直接复用）

### SEO Meta（TDK）

- Title：`Reverse Image Search - Search by Image to Find Similar Photos`
- Description：`Use our fast reverse image search tool to find similar images, identify sources, and explore high-resolution versions. Support upload, URL, and drag-and-drop. Try ReverseImage.io for free.`
- Keywords：
  - `reverse image search`
  - `search by image`
  - `find similar images`
  - `photo lookup`
  - `image source finder`
  - `reverse photo search`

### Hero（首屏）

- 角标：`ReverseImage.io`
- H1：`Reverse Image Search`
- Subheading：`Search across 50+ stock sites. Find higher resolution versions. Identify sources instantly.`
- 说明段落：
  - `Upload a photo, drag-and-drop a file, or paste a public image URL. We search the web for visually similar matches, surface thumbnails and source links, and help you track where images appear online.`

### 未登录用户提示卡

- 标题：`Get 3 Free Searches - No Credit Card Required`
- 描述：`Try our reverse image search for free. Find similar images, track sources, and discover higher resolution versions across the web.`

### CTA

- 未登录：
  - 主按钮：`Try free (3 credits)` → `/sign-up`
  - 次按钮：`View pricing` → `/pricing`
- 已登录：
  - `View balance` → `/account`

### Why / How

- H2：`Why use reverse image search?`
- Why 段落：
  - `Reverse image search helps you quickly discover where a photo appears online, find visually similar images, and validate sources. It is useful for verifying authenticity, tracking reuse, and locating higher-resolution versions.`
- H2：`How to search by image on desktop and mobile`
- Desktop：
  - `Drag and drop an image, upload a file, or paste a direct image URL, then run the search to see matches.`
- Mobile：
  - `Open ReverseImage.io in your browser, tap upload, pick a photo from your gallery, and search. Works on iOS and Android.`

### Key features（编号列表）

1. `Upload with ease`：`Drag and drop, upload a file, or use a public image URL to start searching.`
2. `Fast results with clear links`：`We return thumbnails, titles, and source links so you can quickly verify matches.`
3. `Simple credits, no subscriptions`：`Each successful search costs 1 credit. Failed searches are auto-refunded. Credits never expire.`

### Use cases

- `Find the original source`：`Locate pages where an image appears and follow source links.`
- `Check copyright and reuse`：`Spot reposts, duplicates, and potential infringement quickly.`
- `Identify products or people`：`Find similar images, listings, and context around a visual match.`
- `Find a higher-resolution version`：`Discover larger images and alternative crops for the same subject.`

### 底部 CTA

- 徽章：`Trusted by thousands of users`
- H2：`Ready to Find Your Images?`
- 描述：`Join thousands of photographers, designers, and content creators using ReverseImage.io to track image usage and find higher quality versions.`
- 未登录按钮：`Get Started with 3 Free Credits` → `/sign-up`
- 未登录辅助文案：`No credit card required · Start searching in seconds`
- 已登录按钮：`Start Searching Now` → `/search`（需要实现 `/search` 页面或将其改为 `/`）

## SEO/结构化数据（落地要求）

- H1：`Reverse Image Search`
- 核心 H2（与 README-PROMPT 一致）：
  - `Why use reverse image search?`
  - `How to search by image on desktop and mobile`
  - `Key features of ReverseImage.io`
  - `Common use cases for photo lookup`
- FAQ JSON-LD：使用 `@type: FAQPage`（已实现）
- Sitemap：`src/app/sitemap.ts` 已包含 `/`

## 依赖与交互（前端侧）

- 搜索组件：`src/app/[locale]/(marketing)/search/SearchClient.tsx`
- 未登录：展示 Demo；用户尝试上传/搜索时引导登录
- 已登录：进入真实搜索（扣点数 + 展示结果），详情见 `readme-page-search.md`

## Backend / 数据依赖

- Credits 显示：`GET /api/users/me`（登录后返回 `credits`）；前端由 `CreditsProvider` 拉取并缓存。
- 真实搜索：`POST /api/search`（关键状态码：`401` 未登录、`402` 余额不足、`200` 成功返回 `meta.remainingCredits`）。
- SEO：`/sitemap.xml` 与 `/robots.txt` 由 Next.js route 生成（`src/app/sitemap.ts`、`src/app/robots.ts`）。
