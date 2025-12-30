# ReverseImage.io — MVP 总说明（可直接 Vibe Coding 落地）

目标：本文档是“可执行的产品 + 技术 + 设计 + SEO 总说明”。即使你把代码删掉，也可以仅依靠这份 `readme-mvp.md` 重新实现 MVP（前端页面、后端接口、数据库、支付、SEO、UI/UX）。

> 定位：英文 SEO Landing + 登录后可用的“按次付费（credits）”反向搜图工具。  
> 技术基线：Next.js App Router + Clerk + Drizzle/Postgres + Cloudflare R2 + SerpApi + Stripe Checkout（一次性支付）。

---

## 目录

- 1. MVP 要做什么（范围 & 非目标）
- 2. 核心业务规则（Credits/扣费/退款/支付）
- 3. 信息架构（页面、导航、路由）
- 4. UI/UX 设计规范（可直接出稿）
- 5. SEO 规范（可直接落地）
- 6. 后端设计（API 契约 + 失败补偿 + 幂等）
- 7. 数据库设计（表结构 + 约束 + 迁移）
- 8. 第三方集成（Clerk / Stripe / R2 / SerpApi）
- 9. 页面级规格（功能/文案/SEO/UI/后端依赖）
- 10. 本地开发与验收（Checklist）
- 11. 从零重建步骤（Vibe Coding Checklist + Prompt）

---

## 1. MVP 要做什么（范围 & 非目标）

### 1.1 MVP 范围（必须实现）

- 以图搜图（Reverse Image Search）
  - 输入：上传图片文件 或 输入图片 URL
  - 输出：结果列表（必须能展示 `thumbnail/title/link/source`）
- Credits 点数制计费（Pay-per-use）
  - 新用户赠送 `3 credits`
  - 单次搜索消耗 `1 credit`
  - 余额不足必须拦截（HTTP `402` + 前端弹窗引导充值）
  - 搜索失败必须自动退回点数（失败补偿）
- 登录注册：Clerk
- 充值支付：Stripe Checkout（`mode=payment`，一次性支付，无订阅）
  - Webhook 入账：`checkout.session.completed`
  - 幂等：同一 `stripe_session_id` 只入账一次
- 页面：
  - `/`（SEO Landing + 搜索入口）
  - `/pricing`（点数包）
  - `/account`（余额 + 交易记录）
  - `/terms`、`/privacy`、`/refunds`
  - `/sign-in`、`/sign-up`
  - `/dashboard`（重定向到 `/account`）
- SEO 基础设施：
  - `sitemap.xml`
  - `robots.txt`
  - 首页 TDK + FAQ JSON-LD

### 1.2 非目标（MVP 不做）

- 订阅（Recurring）/ Customer Portal / 订阅管理
- credits 过期/套餐有效期/团队/多租户
- 搜索历史 UI（数据库已有 `search_logs`，但不要求前端展示）
- 复杂的相似度分数（SerpApi 返回不稳定，MVP 不展示）

---

## 2. 核心业务规则（Credits/扣费/退款/支付）

### 2.1 Credits 规则（必须写死）

- 初始赠送：新用户 `3 credits`
- 单次搜索成本：`1 credit`
- Credits 永久有效（Never expires）
- 余额不足：必须阻止搜索
  - 后端：返回 `402 Payment Required`
  - 前端：弹 `LowBalanceDialog`，主 CTA → `/pricing`
- 失败补偿：只要扣费发生且后续步骤失败（上传失败 / provider 调用失败 / 内部异常），必须：
  - 回补 `1 credit`
  - 返回 `500` 并明确提示已退款（refunded）

### 2.2 Stripe 支付规则（一次性 Payment Mode）

- 点数包（当前实现默认）：
  - `$5`：`500 credits`
  - `$10`：`1200 credits`
- Checkout Session 需要把入账所需数据放到 `metadata`：
  - `userId`（DB user id）
  - `credits`（购买点数）
  - `packageId`（Stripe price id）
- Webhook 必须幂等：
  - `transactions.stripe_session_id` 唯一约束
  - webhook 重复推送时不得重复加点数

### 2.3 退款政策（合规文案要覆盖）

- 自动退点数：搜索失败自动退回（最关键、最能减少纠纷）
- 付费退款例外（必须写清楚）：
  - 未使用全额退款（例如 14 天内且购买包点数未消费）
  - 技术故障导致扣点但无结果且未自动退回（人工补偿/退款）
  - 重复扣款（支付网关异常）
- 不退款情形：
  - 搜索结果不满意/搜不到（第三方索引决定）
  - 账号违规导致封禁
  - 点数包已部分消耗（至少消费 1 点）

---

## 3. 信息架构（页面、导航、路由）

### 3.1 页面清单（MVP）

| Path | 目的 | 是否 SEO 收录 | 核心 CTA |
| --- | --- | --- | --- |
| `/` | SEO Landing + 搜索入口 | Yes | Sign up / Pricing |
| `/search` | 核心搜索页（建议独立） | No（建议 noindex） | Search / Pricing |
| `/pricing` | 点数包 + 支付入口 | Yes | Buy / Sign up |
| `/account` | 余额 + 最近交易 | No（建议 noindex） | Buy more credits |
| `/sign-in` | 登录 | No | Sign in |
| `/sign-up` | 注册 | No | Sign up |
| `/dashboard` | 兼容路由重定向 | No | — |
| `/terms` | 条款 | Yes | — |
| `/privacy` | 隐私 | Yes | — |
| `/refunds` | 退款政策 | Yes | — |

> i18n：使用 `next-intl` 的 `[locale]` 路由结构，目前仅启用 `en`，默认不显示 `/en` 前缀。

### 3.2 全局导航（Navbar）

设计目标：“余额是第一公民”。

- 左侧品牌：
  - 主标题：`Reverse Image Search`
  - 副标题：`Reverse image search`
- 链接：
  - Home（`/`）
  - Pricing（`/pricing`）
  - Account（`/account`，登录态显示也可；未登录点击后会要求登录）
- 登录态（SignedIn）：
  - CreditsBadge：`⚡ {credits} credits` + `Top up`（点击跳 `/pricing`）
  - `New search` 按钮（跳 `/` 或 `/search`）
  - `UserButton`（Clerk）
- 未登录态（SignedOut）：
  - `Sign in`
  - `Get started`

### 3.3 页脚（Footer）

固定链接：

- Terms → `/terms`
- Refunds → `/refunds`
- Privacy → `/privacy`
- Pricing → `/pricing`

---

## 4. UI/UX 设计规范（可直接出稿）

目标：Linear / Stripe 风格、卡片化、极简、高对比 CTA；让“credits/余额”成为最显眼的信息。

### 4.1 视觉设计系统（Design System）

#### 颜色（建议）

- Primary（主 CTA）：`slate-900`（hover `slate-800`）
- Accent（余额/价值感）：`amber` 系列（badge、low balance、点数相关）
- Info/Link：`indigo-600`
- 背景：`slate-50`
- 卡片：白底 `bg-white` + `border-slate-200` + `shadow-sm`

#### 排版

- 字体：`Inter`
- H1：4xl–5xl（Hero）
- H2：2xl
- 正文：text-sm / text-base

#### 布局与栅格

- 页面容器：`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- 卡片圆角：`rounded-2xl/rounded-3xl`
- 模块间距：`space-y-8` 或 `space-y-16`（Landing）

### 4.2 微交互（必须）

- 搜索中：
  - Dropzone 按钮 icon 旋转（loading）
  - 结果区 skeleton（降低等待焦虑）
  - 顶部 pill：`Searching...`
- 成功：
  - toast：`Search complete`
  - results 数量 pill：`{N} found`
  - credits 实时更新（来自 `meta.remainingCredits`）
- 失败：
  - toast：`Search failed`（描述包含“refunded”）
  - 页面内 error banner（红色）
- 余额不足：
  - Modal（LowBalanceDialog）+ 强 CTA → `/pricing`

### 4.3 Search 页状态机（验收标准）

必须包含以下状态，并且每个状态都有明确 UI：

1) Empty / Idle  
2) Uploading / Processing（可合并为 Searching）  
3) Results（有结果）  
4) No results  
5) Error（服务错误）  
6) Low balance（402）  

---

## 5. SEO 规范（可直接落地）

### 5.1 全站 SEO 基础设施

- `sitemap.xml`
  - 必须包含：`/`、`/pricing`、`/terms`、`/privacy`、`/refunds`
  - 不包含：`/account`、`/dashboard`、`/api`、`/search`（建议）
- `robots.txt`
  - allow `/`
  - disallow：`/dashboard`、`/account`、`/api`（以及你决定 noindex 的页面）
- Meta 基础（建议）
  - canonical（可选）
  - Open Graph / Twitter card（可选但推荐）

### 5.2 首页 SEO（必须严格按结构）

#### 首页 TDK（Meta Tags）

- Title：`Reverse Image Search - Search by Image to Find Similar Photos`
- Description：`Use our fast reverse image search tool to find similar images, identify sources, and explore high-resolution versions. Support upload, URL, and drag-and-drop. Try ReverseImage.io for free.`
- Keywords：
  - `reverse image search`
  - `search by image`
  - `find similar images`
  - `photo lookup`
  - `image source finder`
  - `reverse photo search`

#### 首页内容结构（SEO 骨架）

- H1：`Reverse Image Search`
- 必须出现的 H2（至少覆盖以下 4 个主题）：
  - `Why use reverse image search?`
  - `How to search by image on desktop and mobile`
  - `Key features of ReverseImage.io`
  - `Common use cases for photo lookup`
- FAQ（3 条起）+ `FAQPage` JSON-LD

#### FAQ（示例文案）

- Q: `How do I do a reverse image search on my phone?`  
  A: `Open ReverseImage.io on your mobile browser, tap upload, choose a photo from your gallery, and start the search. It works on both iOS and Android.`
- Q: `Is this image search tool free?`  
  A: `Yes. New users get 3 free search credits upon registration. You can buy additional credit packs for higher-volume searching.`
- Q: `Can I find the original source of an image?`  
  A: `You can discover pages where the image appears and follow links to the sources to help identify where it was published.`

### 5.3 合规页 SEO（/refunds 重点）

- `/refunds`：
  - Title：`Refund Policy - ReverseImage.io`
  - H1：`Refund & Cancellation Policy`
  - 必须提到：`digital credits`、`one-time payments`

---

## 6. 后端设计（API 契约 + 失败补偿 + 幂等）

后端采用 Next.js Route Handlers（同仓库实现），契约必须保持稳定，保证前端可直接按状态码与字段做分支。

### 6.1 认证策略（Clerk）

- API 层：未登录统一返回
  - HTTP `401`
  - `{ "error": "Please sign in to continue." }`

### 6.2 API 总览

| Method | Path | 目的 | 必须点 |
| --- | --- | --- | --- |
| `GET` | `/api/users/me` | 获取余额/用户信息（懒创建 user） | 首次创建送 3 credits |
| `GET` | `/api/users/transactions` | 最近交易记录 | limit 10 |
| `POST` | `/api/search` | 搜索 + 原子扣费 + 失败补偿 | 402/500 契约稳定 |
| `POST` | `/api/billing/checkout` | Stripe Checkout | metadata 必须包含 userId/credits |
| `POST` | `/api/webhook/stripe` | webhook 入账 | 幂等（stripe_session_id unique） |
| `POST` | `/api/webhooks/stripe` | webhook 别名（可选） | 方便 Stripe 配置 |
| `POST` | `/api/upload` | 通用上传（可选） | 非搜索主流程必需 |

### 6.3 `GET /api/users/me`

目的：

- 读取用户 credits（Navbar/Account/全局）
- 如果数据库不存在该用户：创建 user 并写入初始 credits

响应（200）示例：

```json
{
  "id": "uuid",
  "clerkId": "user_xxx",
  "email": "a@b.com",
  "credits": 3,
  "stripeCustomerId": "cus_xxx"
}
```

失败（401）：

```json
{ "error": "Please sign in to continue." }
```

### 6.4 `GET /api/users/transactions`

响应（200）示例：

```json
{
  "transactions": [
    {
      "id": "uuid",
      "amount": 500,
      "currency": "usd",
      "creditsAdded": 500,
      "stripeSessionId": "cs_test_...",
      "status": "succeeded",
      "createdAt": "2025-12-18T00:00:00.000Z"
    }
  ]
}
```

### 6.5 `POST /api/search`（核心）

#### 输入支持

1) 上传文件（推荐）

- `Content-Type: multipart/form-data`
- 字段：`file`（兼容 `image`）
- 限制：
  - 类型：`image/jpeg`、`image/png`、`image/webp`
  - 大小：`<= 5MB`

2) 图片 URL

- `Content-Type: application/json`

```json
{ "imageUrl": "https://example.com/image.jpg" }
```

- URL 校验：
  - 必须是合法 URL
  - 必须是 `http(s)`

#### 扣费（必须原子，避免并发扣成负数）

用一条 update 带条件完成扣减：

- 语义：`UPDATE users SET credits = credits - 1 WHERE id = ? AND credits >= 1 RETURNING credits`
- 若返回 0 行：余额不足 → `402`

#### 失败补偿（必须可靠）

任何异常（上传失败/provider 失败/内部错误）：

- 如果已扣费：
  - `credits = credits + 1`
  - `search_logs.cost = 0`
  - 返回 `500` 且提示 “refunded”

#### 输出（必须包含 remainingCredits）

成功（200）：

```json
{
  "data": [
    {
      "id": "serpapi-1",
      "title": "Match",
      "link": "https://example.com",
      "thumbnail": "https://example.com/thumb.jpg",
      "source": "example.com"
    }
  ],
  "meta": {
    "cost": 1,
    "remainingCredits": 2
  }
}
```

结果过滤规则（必须）：

- 只保留有 `thumbnail` 的 item
- 最多返回前 100 条

状态码契约（前端可直接按此写逻辑）：

- `401`：未登录
- `402`：余额不足（必须）
- `400/413/415`：用户输入问题（缺图/过大/格式不支持）
- `500`：服务错误（如果扣费已发生必须退回）

### 6.6 `POST /api/billing/checkout`

请求：

```json
{ "packageId": "price_xxx" }
```

行为：

1. 必须登录（401）
2. 获取/创建 DB user（确保有 users.id）
3. 若无 `stripe_customer_id`：创建 Stripe Customer 并回写
4. 创建 Checkout Session：
   - `mode: 'payment'`
   - `line_items: [{ price: packageId, quantity: 1 }]`
   - `success_url`: `/account?success=true`
   - `cancel_url`: `/pricing?canceled=true`
   - `metadata`: `{ userId, credits, packageId }`
5. 返回 `session.url`

响应：

```json
{ "url": "https://checkout.stripe.com/..." }
```

### 6.7 Stripe Webhook：`POST /api/webhook/stripe`（入账）

必须点：

- 验签：`STRIPE_WEBHOOK_SECRET`
- 事件：`checkout.session.completed`
- 幂等：
  - 若 `transactions.stripe_session_id` 已存在：直接返回 `{ received: true }`
- 入账事务：
  - `users.credits += metadata.credits`
  - 插入 `transactions`（amount/currency/creditsAdded/sessionId/status）

---

## 7. 数据库设计（表结构 + 约束 + 迁移）

### 7.1 MVP 三表（必须）

- `users`
- `transactions`
- `search_logs`

> 说明：旧的 `counter` 表属于模板残留，已清理并提供删除迁移（`migrations/0002_marvelous_the_santerians.sql`）。

### 7.2 约束（必须）

- `users.clerk_id` unique（一个 Clerk 用户对应一个 DB 用户）
- `transactions.stripe_session_id` unique（webhook 幂等关键）
- `transactions.user_id` FK（on delete cascade）
- `search_logs.user_id` FK（on delete cascade）

### 7.3（推荐）索引

如果预计会展示更多记录或做风控，建议补：

- `transactions(user_id, created_at desc)`
- `search_logs(user_id, created_at desc)`

---

## 8. 第三方集成（Clerk / Stripe / R2 / SerpApi）

### 8.1 Clerk（Auth）

必须配置环境变量：

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

前端路由：

- `/sign-in`
- `/sign-up`

登录/注册完成后：

- 默认跳转 `/account`

### 8.2 SerpApi（Reverse Image Search Provider）

必须配置：

- `SEARCH_API_URL`（例如 `https://serpapi.com/search.json`）
- `SEARCH_API_KEY`

调用方式（GET）：

- `engine=google_reverse_image`
- `api_key=<SEARCH_API_KEY>`
- `image_url=<public_image_url>`

后端必须做的“数据清洗”：

- 只返回带 `thumbnail` 的条目
- 只返回前 100 条

### 8.3 Cloudflare R2（上传）

必须配置：

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_BASE_URL`

要求：

- 上传后返回公网 URL（SerpApi 需要）
- 文件类型/大小限制与 `/api/search` 保持一致（5MB、jpg/png/webp）
- 建议在 R2 配置生命周期自动清理（不在代码中做删除）

### 8.4 Stripe（支付）

必须配置：

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_CREDIT_500`
- `STRIPE_PRICE_CREDIT_1200`

本地 webhook 调试：

1. `stripe listen --forward-to http://localhost:3000/api/webhooks/stripe`
2. 把 `whsec_...` 写到 `.env.local`

### 8.5 PostgreSQL（数据库）

必须配置：

- `DATABASE_URL`（Postgres 连接串，Drizzle/pg 直接使用）

推荐：

- 开发使用 `.env.local` 放置真实连接串（不要提交到 git）
- 生产使用 `.env.production.local` 或部署平台的 Secrets

### 8.6 Hosting/Base URL（影响 SEO & Stripe 回跳）

必须理解的一点：站点的“对外 Base URL”会影响：

- `sitemap.xml` 的 `url`
- `robots.txt` 的 `sitemap` 地址
- Stripe checkout 的 `success_url` / `cancel_url` 生成逻辑（如果你用统一的 `getBaseUrl()`）

建议配置：

- `NEXT_PUBLIC_APP_URL`（例如 `https://www.reverseimage.io`）

### 8.7（可选）安全/监控/分析

按需配置：

- Arcjet（Bot/Shield 等风控）：`ARCJET_KEY`
- Sentry：`NEXT_PUBLIC_SENTRY_DSN`、`SENTRY_AUTH_TOKEN`、`SENTRY_ORGANIZATION`、`SENTRY_PROJECT`
- PostHog：`NEXT_PUBLIC_POSTHOG_KEY`、`NEXT_PUBLIC_POSTHOG_HOST`

---

## 9. 页面级规格（功能/文案/SEO/UI/后端依赖）

说明：这一章用“可直接实现”的粒度描述每个页面。你可以把它当成 PRD + UX Spec + SEO Copy + API 依赖说明。

### 9.1 `/`（Home / SEO Landing + Search Entry）

**页面目标（MVP）**

- 承接自然流量（SEO），解释价值并引导转化
- 提供搜索入口（未登录可 Demo，登录后可真实搜索）
- 主要转化：`/sign-up`（领取 3 credits）与 `/pricing`

**SEO（必须）**

- Title：`Reverse Image Search - Search by Image to Find Similar Photos`
- Description：`Use our fast reverse image search tool to find similar images, identify sources, and explore high-resolution versions. Support upload, URL, and drag-and-drop. Try ReverseImage.io for free.`
- Keywords：
  - `reverse image search`
  - `search by image`
  - `find similar images`
  - `photo lookup`
  - `image source finder`
  - `reverse photo search`
- H1：`Reverse Image Search`
- H2（至少覆盖）：
  - `Why use reverse image search?`
  - `How to search by image on desktop and mobile`
  - `Key features of ReverseImage.io`
  - `Common use cases for photo lookup`
- FAQ：至少 3 条，并输出 `FAQPage` JSON-LD（首页必须有结构化数据）

**页面结构（可直接出设计稿）**

1) Search Tool（首屏入口）

- 容器：大圆角白卡片（`rounded-3xl` + `shadow-sm`）
- 内部组件：复用 `SearchClient`
- 交互：
  - 未登录：展示 Demo 版本（提示注册）
  - 登录：展示真实搜索 UI（余额、上传区、结果区）

2) Hero（价值主张）

- Brand pill：`ReverseImage.io`
- H1：`Reverse Image Search`
- Subheading：`Search across 50+ stock sites. Find higher resolution versions. Identify sources instantly.`
- 未登录提示卡（SignedOut）：
  - Title：`Get 3 Free Searches - No Credit Card Required`
  - Body：`Try our reverse image search for free. Find similar images, track sources, and discover higher resolution versions across the web.`
- 支持性描述段落：
  - `Upload a photo, drag-and-drop a file, or paste a public image URL. We search the web for visually similar matches, surface thumbnails and source links, and help you track where images appear online.`
- CTA（根据登录态变化）：
  - 未登录主按钮：`Try free (3 credits)` → `/sign-up`
  - 未登录次按钮：`View pricing` → `/pricing`
  - 已登录：`View balance` → `/account`
- 信任 chips：`50+ Stock Sites / Higher Resolution / Instant Results / Mobile & Desktop`

3) Why / How（两列信息卡）

- Card A：
  - H2：`Why use reverse image search?`
  - 文案：`Reverse image search helps you quickly discover where a photo appears online, find visually similar images, and validate sources. It is useful for verifying authenticity, tracking reuse, and locating higher-resolution versions.`
- Card B：
  - H2：`How to search by image on desktop and mobile`
  - Desktop：`Drag and drop an image, upload a file, or paste a direct image URL, then run the search to see matches.`
  - Mobile：`Open ReverseImage.io in your browser, tap upload, pick a photo from your gallery, and search. Works on iOS and Android.`

4) Feature Grid（4 张卖点卡）

- `Search Across 50+ Sources`
- `Find Higher Resolution`
- `Instant Source Identification`
- `Simple Pay-Per-Use`（强调：No subscriptions / Credits never expire / Auto-refund）

5) Key features + Use cases（两列）

- Key features（编号 1–3）：
  1. `Upload with ease`
  2. `Fast results with clear links`
  3. `Simple credits, no subscriptions`
- Use cases：
  - `Find the original source`
  - `Check copyright and reuse`
  - `Identify products or people`
  - `Find a higher-resolution version`
- CTA：
  - `View pricing` → `/pricing`
  - 未登录：`Get started` → `/sign-up`

6) Privacy / Provider（两张信息卡）

- `Secure and private image lookup`：强调 R2、安全处理、不训练模型
- `Google-powered visual search`：强调通过 SerpApi 获取 google reverse image 结果

7) FAQ（展示 + JSON-LD）

- 展示上面的 3 条 FAQ
- 同步输出 `FAQPage` JSON-LD（必须）

8) Bottom CTA（深色背景大 CTA）

- Badge：`Trusted by thousands of users`
- H2：`Ready to Find Your Images?`
- Body：`Join thousands of photographers, designers, and content creators using ReverseImage.io to track image usage and find higher quality versions.`
- 未登录按钮：`Get Started with 3 Free Credits` → `/sign-up`
- 未登录辅助：`No credit card required · Start searching in seconds`
- 已登录按钮：`Start Searching Now`
  - 推荐链接：`/search`
  - 如果你不做独立 `/search`：就指回 `/`（避免死链）

**Backend 依赖**

- credits：`GET /api/users/me`
- 搜索：`POST /api/search`
- SEO：`/sitemap.xml`、`/robots.txt`

**验收标准**

- 页面可直接被 Google 收录（indexable）
- 首页含 FAQ JSON-LD（可在 devtools 查看 script）
- 未登录点击搜索会引导登录（或展示 Demo）
- 登录后能完成一次真实搜索并扣费/更新余额

### 9.2 `/search`（Search / 核心功能页）

> 建议独立页面用于“登录后主操作”。当前仓库可能没有该页面文件，但必须保证 CTA 指向存在的页面。

**SEO（建议）**

- 建议 `noindex`（因为更偏工具页，且可能要求登录）
- 不进 sitemap

**页面结构（推荐：两列布局）**

左侧：输入与上传

- Header：
  - 小标题：`Powered Search`
  - H1：`Find Similar Images`
  - 右侧 badge：`{credits} credits`（显性化）
- Dropzone：
  - 主文案（状态变化）：
    - `Drop an image to begin`
    - `Searching for visual matches...`
    - `Results ready`
    - `There was an error`
  - 固定文案：
    - `Drag & drop or click to upload`
    - `JPG, PNG, or WEBP up to 5MB`
    - `1 credit per search`
- URL Search：
  - 标题：`Or search by URL`
  - Placeholder：`https://example.com/image.jpg`
  - Button：`Search`
  - Tip：`Paste a direct image URL for instant reverse search`
- Preview（可选）：展示当前选择的图片预览
- Error banner（可选）：红色区块显示 `errorMessage`

右侧：结果

- Header：
  - 小标题：`Search Results`
  - H2：`Visual Matches`
  - Searching pill：`Searching...`（带 spinner）
  - 成功数量：`{N} found`
- Searching：骨架屏
- Success + results：
  - 列表项：thumbnail（lazy）+ title + source badge + link（可点击/新开）
- Success + empty：
  - `No matches found` + 建议换图文案
- Idle 引导卡：
  - `Ready to Search`
  - `Upload an image or paste a URL to find similar images across 50+ sources`
- Tips：
  - `Use clear, high-quality images for best results`
  - `Different angles can reveal different matches`
  - `Search multiple variations to find all sources`

**状态机（必须验收）**

- Idle（初始）
- Searching（请求中）
- Success（有结果）
- Success（无结果）
- Error（500）
- Low balance（402）→ LowBalanceDialog

**LowBalanceDialog（必须）**

- Title：`You are out of credits`
- Body：`Each reverse image search costs 1 credit. Recharge to continue searching — credits never expire and failed searches are auto-refunded.`
- CTA：
  - `Go to pricing` → `/pricing`
  - `Maybe later`

**Backend 依赖**

- `POST /api/search`
  - 成功必须返回 `meta.remainingCredits`
  - 401/402/500 的契约必须稳定（前端按状态码走分支）

### 9.3 `/pricing`（Pricing / 点数包）

**页面目标**

- 清晰解释“按次付费、无订阅”
- 展示两档点数包
- 引导进入 Stripe Checkout
- 已登录显示当前余额（增强确定性）

**SEO**

- Title：`Pricing | Vibe Search`
- Description：`Buy lifetime credits for reverse image search. $5 for 500 credits or $10 for 1200 credits. No subscriptions.`

**页面结构（可实现）**

1) Hero

- Badge：`Simple Pricing`
- H1：`Pay Once, Use Forever`
- 描述：`No subscriptions. No hidden fees. Buy credits when you need them.`
- SignedIn：`Your Balance: {credits} Credits`

2) Pricing Cards（两列）

- 标题：`One-Time Payment`
- Package label：`Starter` / `Pro`
- 高亮：`Best Value`（Pro）
- 价格显示：`$5` / `$10`
- 点数显示：`500 credits` / `1200 credits`
- 单价提示：`Only $X per credit · Never expires`
- 卖点三条：
  - `Credits never expire`
  - `Secure Stripe checkout`
  - `Auto-refund on failures`
- CTA：
  - `Buy Now`
  - loading：`Processing...`

3) Refund Policy Summary + Link

- 展示 3 条可理解的退款要点
- Link：`Read full refund policy` → `/refunds`

4) SignedOut CTA

- 标题：`Try Before You Buy`
- 文案：`Sign up now and get 3 free search credits to test the quality`
- CTA：`Get Started Free` → `/sign-up`

**Backend 依赖**

- `POST /api/billing/checkout` → `{ url }`
- `POST /api/webhook/stripe`（由 Stripe 调用）

### 9.4 `/account`（Account / 余额 + 交易记录）

**页面目标**

- 大字号展示余额（核心资产）
- 快速入口购买 credits
- 展示最近交易（增加信任）

**SEO（建议）**

- 建议 noindex
- robots disallow

**页面结构**

1) Credits 卡

- Label：`Credits`
- 大数字：`{credits}`
- 文案：`Use 1 credit per search. Credits never expire.`
- CTA：
  - `Buy more credits` → `/pricing`
  - `New search` → `/`

2) Account 卡

- Label：`Account`
- Title：`Manage your session`
- 文案：`Signed in with Clerk. Secure payments via Stripe.`
- 说明两条：
  - `Credits are tied to your account...`
  - `Every payment creates a transaction log...`
- `UserButton`（Clerk 头像菜单）

3) History 卡

- Label：`History`
- Title：`Recent recharges`
- Loading：skeleton
- Empty：`No transactions yet...`
- List item：`$X · +{creditsAdded} credits` + status + 时间

**Backend 依赖**

- `GET /api/users/me`
- `GET /api/users/transactions`

### 9.5 `/sign-in`（Auth / Sign in）

**页面目标**

- 完成登录闭环
- 登录后跳到 `/account`

**SEO（建议）**

- noindex

**文案（meta）**

- Title：`Sign in`
- Description：`Access your Vibe Search account and credits.`

**Backend 依赖**

- 无直接自建后端依赖（Clerk 托管），但登录后会触发 `GET /api/users/me` 创建/同步用户

### 9.6 `/sign-up`（Auth / Sign up）

**页面目标**

- 完成注册闭环
- 用户获得 `3 credits` 并跳转 `/account`

**SEO（建议）**

- noindex

**文案（meta）**

- Title：`Sign up`
- Description：`Create an account and get free credits to try reverse image search.`

**Backend 依赖**

- 注册完成后首次触发 `getOrCreateUser()` 才会创建 DB user 并赠送 credits（懒创建策略）

### 9.7 `/dashboard`（Redirect）

- 行为：直接重定向到 `/account`
- SEO：noindex

### 9.8 `/terms`（Terms）

**页面目标**

- 明确服务性质、点数属性、支付方式、失败补偿
- 引导 `/refunds`

**SEO**

- Title：`Terms of Service | Vibe Search`
- Description：`Terms of Service and Refund Policy for Vibe Search including credits, payments, and refund eligibility.`
- 可收录（进 sitemap）

**内容要点（必须覆盖）**

- credits 是虚拟商品，与账号绑定
- credits 永久有效
- 支付为 Stripe 一次性支付
- 搜索失败自动退点数（原子扣费 + 失败补偿）

### 9.9 `/privacy`（Privacy）

**页面目标**

- 清晰说明数据收集、图片存储、支付数据处理方式
- 提供删除/咨询邮箱

**SEO**

- Title：`Privacy Policy | Vibe Search`
- Description：`How Vibe Search handles uploaded images, personal data, and payment information.`

**内容要点**

- 数据收集：clerkId/email/credits/transactions/search logs
- 图片：R2 存储用于生成 URL（提示不要上传敏感内容）
- 支付：Stripe 处理，站点不存卡信息
- 联系：`help@support.reverseimage.io`

### 9.10 `/refunds`（Refund Policy）

**页面目标**

- 解释数字点数的退款边界
- 强化“自动退点数”与“未使用可退款”

**SEO**

- Title：`Refund Policy - ReverseImage.io`
- Description：`Refund and cancellation policy for digital credits and one-time payments on ReverseImage.io.`
- H1：`Refund & Cancellation Policy`

**内容要点（必须覆盖）**

- 未使用点数包：14 天内可退款
- 技术故障：扣点但无结果且未自动退回 → 人工补偿/退款
- 重复扣款：原路退款
- 不退款：结果不满意/部分消耗/违规封禁

---

## 10. 本地开发与验收（Checklist）

### 9.1 本地启动

1. `npm i`
2. 配置 `.env.local`
3. `npm run db:migrate`
4. `npm run dev:next`

### 9.2 必须通过的验收清单（逐条勾选）

Auth/用户：

- [ ] 未登录访问 `/` 正常，点击搜索会引导登录
- [ ] 新用户注册后进入 `/account`，显示 `3 credits`

搜索扣费：

- [ ] credits >= 1：搜索成功后 credits -1
- [ ] credits = 0：搜索返回 402，前端弹 `LowBalanceDialog`，引导 `/pricing`
- [ ] provider 失败：用户 credits 不变（或扣后立即退回），并显示 “refunded”

支付入账：

- [ ] `/pricing` 点击购买跳转 Stripe Checkout
- [ ] 支付成功后 webhook 入账，`users.credits` 增加
- [ ] `transactions` 插入一条记录
- [ ] webhook 重复推送不会重复加点数（幂等）

SEO：

- [ ] `/` 有正确 Title/Description/Keywords
- [ ] `/` 有 H1/H2/FAQ + FAQ JSON-LD
- [ ] `sitemap.xml` 正确包含公开页面
- [ ] `robots.txt` 禁止 account/dashboard/api

---

## 11. 从零重建步骤（Vibe Coding Checklist + Prompt）

这部分是“删库跑路后重建指南”。按顺序做，成功率最高。

### 10.1 Step-by-step Checklist

1) 搭基础工程

- [ ] Next.js App Router + Tailwind
- [ ] next-intl（仅 en 也行）
- [ ] Clerk（`/sign-in`、`/sign-up`）

2) 搭数据库与迁移

- [ ] Drizzle schema：`users/transactions/search_logs`
- [ ] 生成迁移并 migrate

3) 搭服务层（libs）

- [ ] `Env`（集中管理 env vars）
- [ ] `DB`（Drizzle + pg Pool）
- [ ] `UserService`（`getOrCreateUser()`：懒创建 + 初始 credits）
- [ ] `Billing`（点数包常量：500/1200）
- [ ] `Stripe`（client + webhook verify）
- [ ] `Storage`（R2 上传）
- [ ] `SearchProvider`（SerpApi 调用 + 结果过滤）

4) 实现 API（按优先级）

- [ ] `GET /api/users/me`
- [ ] `POST /api/search`（原子扣费 + 失败补偿 + remainingCredits）
- [ ] `POST /api/billing/checkout`
- [ ] `POST /api/webhook/stripe`（幂等入账）
- [ ] `GET /api/users/transactions`

5) 实现 UI 组件

- [ ] `CreditsProvider`（全局拉取 credits）
- [ ] `CreditsBadge`（导航栏显性化余额）
- [ ] `LowBalanceDialog`（402 弹窗）
- [ ] `SearchClient`（上传/URL 搜索 + 状态机）

6) 实现页面

- [ ] `/`（SEO Landing + SearchClient + FAQ JSON-LD）
- [ ] `/pricing`（点数包 + Buy Now）
- [ ] `/account`（余额 + 交易记录）
- [ ] `/terms`、`/privacy`、`/refunds`

7) 加 SEO 基础设施

- [ ] `sitemap.ts`
- [ ] `robots.ts`
- [ ] 首页 TDK + FAQ JSON-LD

### 10.2 给 AI 的“强约束 Prompt”（可直接复制）

把下面整段贴给 AI，让它按本文档实现：

```txt
Build a Reverse Image Search SaaS MVP with Next.js App Router + Tailwind + Clerk + Drizzle(Postgres) + Cloudflare R2 + SerpApi + Stripe Checkout (one-time payment).

Business rules (MUST):
- New users start with 3 credits.
- Each successful search costs 1 credit.
- If the search fails after charging, refund the credit automatically and clearly inform the user.
- If credits are insufficient, block the search and return HTTP 402. Frontend must show a modal and link to /pricing.
- Stripe is one-time payment (mode=payment). On webhook checkout.session.completed, add credits and insert a transaction row. Must be idempotent by stripe_session_id unique constraint.

SEO (MUST):
- Home page TDK:
  Title: Reverse Image Search - Search by Image to Find Similar Photos
  Description: Use our fast reverse image search tool to find similar images, identify sources, and explore high-resolution versions. Support upload, URL, and drag-and-drop. Try ReverseImage.io for free.
  Keywords: reverse image search, search by image, find similar images, photo lookup, image source finder, reverse photo search
- Home page must contain H1 + key H2 sections + FAQ + FAQ JSON-LD.
- Provide sitemap.xml and robots.txt. Disallow /account, /dashboard, /api.

API contract (MUST):
- POST /api/search accepts multipart file or JSON {imageUrl}. Validates file type and size (<= 5MB). Returns {data, meta:{cost:1, remainingCredits}} on success. Returns 401/402/500 accordingly.
- POST /api/billing/checkout returns {url} to Stripe Checkout.
- POST /api/webhook/stripe handles checkout.session.completed and credits user.
- GET /api/users/me returns user profile and credits and auto-creates user on first call.
- GET /api/users/transactions returns latest 10 transactions.
```
