



--- 产品设计开始 ---

## 1) 核心页面列表（路径 + 目标）

### A. `/` 首页（SEO Landing + 搜索入口）

* **目标**：承接自然流量（SEO）、讲清价值、引导登录并获赠初始免费点数。

### B. `/search` 以图搜图（核心功能页）

* **目标**：上传/输入图片 → **检查余额** → 发起检索 → **扣除点数**。

### C. `/pricing` 充值与价格

* **目标**：展示点数包（Credits Package）差异，驱动进入 Stripe Checkout 完成**一次性支付**。

### D. `/account` 账号与余额

* **目标**：展示**当前剩余点数**、充值记录、快速充值入口。

### E. `/auth/*`（Clerk 登录/注册/回调页）

* **目标**：完成登录闭环，确保点数与账号绑定。

### F. `/terms`、`/privacy`

* **目标**：基础合规，明确虚拟商品（点数）的退款政策。

---

## 2) 每个页面的核心功能点（可拆任务）

### A. `/` 首页（SEO + 引导）

**必须（MVP）**

* **SEO 文本结构（同前）**：H1/H2/场景/FAQ。
* **搜索入口组件**：
* 上传按钮（本地文件）+ 示例图。
* **CTA 文案变更**：未登录 → “注册即送 1 次免费搜索”；已登录 → 进 `/search`。


* **基础 SEO**：title/description、sitemap 等。

### B. `/search` 以图搜图（核心业务）

**必须（MVP）**

* 登录态强校验。
* **点数检查与扣减逻辑（核心变更）**：
* **前置检查**：点击搜索时，判断 `用户余额 >= 1`。
* **余额不足**：拦截请求，弹窗提示“点数不足”，引导跳转 `/pricing` 充值。
* **余额充足**：允许请求，后端成功发起搜索后扣除 1 点。


* 结果展示：相似图片列表（缩略图 + 相似度 + 来源）。
* 错误与边界：
* **失败补偿**：若服务端报错（非用户原因），**不扣点数**或自动回补点数（按次付费对失败极其敏感）。
* 处理中 loading。



### C. `/pricing` 充值页（Stripe 一次性支付）

**必须（MVP）**

* **点数包卡片（变更）**：
* `$5`：500 点（永久有效）
* `$10`：1200 点（优惠装）


* 显示当前用户状态：
* 未登录：CTA 先登录。
* 已登录：显示“当前余额：X 点”。


* Stripe Checkout 跳转：
* 前端点击按钮 → 后端创建 **Mode 为 Payment** 的 Session → 返回 `checkout_url`。



### D. `/account` 账号与余额（留存 & 自助）

**必须（MVP）**

* **余额展示**：大字号显示剩余点数（Credits）。
* **充值入口**：由“管理订阅”改为“购买更多点数”（跳 `/pricing`）。
* **交易记录（MVP 简版）**：显示最近的充值时间与金额（可选，但建议有，增加信任）。
* 登出（Clerk）。

### E. `/auth/*`（Clerk）

**必须（MVP）**

* Clerk 标准登录/注册页面接入。
* **注册初始化**：新用户注册成功后，数据库需写入**初始赠送余额（如 1 点或 3 点）**。

### F. `/terms`、`/privacy`

**必须（MVP）**

* 简版条款 & 隐私政策。
* **新增**：关于点数有效期的说明（MVP 建议设为永久有效，降低法律风险）及退款规则。

---

## 3) 必须具备的通用功能模块

### 3.1 认证与用户体系（Clerk）

* 同前：`clerk_user_id` 作为主键关联余额。

### 3.2 支付与计费（Stripe Payment Mode）

* **Stripe 产品与价格（变更）**：
* 产品类型：**One-time (非 Recurring)**。
* `price_credit_500` ($5)
* `price_credit_1200` ($10)


* **后端接口**：
* `POST /api/billing/checkout`：创建 Session（`mode: 'payment'`）。
* `POST /api/stripe/webhook`：**监听 `checkout.session.completed**`（支付成功即充值）。
* *移除 Customer Portal 相关接口（一次性支付不需要管理订阅）。*


* **数据表/字段（结构简化）**：
* `users`: `clerk_user_id`, `stripe_customer_id`, **`credits` (Int, 默认为 1)**。
* `transactions` (新增/建议): `user_id`, `amount`, `credits_added`, `stripe_session_id`, `created_at`。
* *删除 `subscriptions` 表。*



### 3.3 次数限制与扣减（核心风控）

* **规则**：
* 单次搜索消耗 1 点 `credits`。


* **扣减时机与事务**：
* 建议采用**乐观锁**或**原子递减**：
`UPDATE users SET credits = credits - 1 WHERE id = ? AND credits > 0`
* 如果更新行数为 0，则报错“余额不足”。


* **失败处理**：
* 如果 API 搜索失败，必须确保不执行扣减，或者执行回滚（`credits + 1`）。



### 3.4 搜索 API

* `POST /api/search`
* 逻辑流程：验证 Token -> **原子扣费** -> 调用搜图引擎 -> 返回结果。
* 若搜图引擎超时/报错 -> **回滚费用** -> 返回错误给前端。



### 3.5 SEO 基础设施（必须）

* 同前（SSR、Sitemap、Robots、Meta）。

### 3.6 运营与风控（MVP 最小）

* **防刷**：因为是扣余额，天然具备防刷属性（刷完就没了），但仍需基础 IP 限流防止恶意消耗系统资源。
* 日志：重点记录**扣费日志**（User ID, Time, Before Balance, After Balance）。

---

## 4) MVP 必须（上线就要有）

* `/` SEO landing。
* `/search` 全链路（**余额检查 + 扣费** + 结果展示）。
* Clerk 登录接入 + **注册赠送初始点数**。
* Stripe Checkout (**One-time mode**) + Webhook (**充值到账逻辑**)。
* `/pricing`（展示点数包）、`/account`（展示余额）。
* Sitemap/Robots/Terms。

--- 产品设计结束 ---

--- 基础设施配置 ---





--- 开发设计开始 ---

以下是基于 **NestJS + PostgreSQL (Prisma)** 的设计。

---

### 第一部分：数据库设计 (PostgreSQL via Prisma Schema)

数据模型从“状态型”转变为“累积型”。核心是 `User.credits` 字段和 `Transaction` 流水表。

```prisma
// schema.prisma

model User {
  id               String   @id @default(uuid())
  clerkId          String   @unique  // Clerk 的 user_id
  email            String?
  stripeCustomerId String?  @unique  // 第一次支付时绑定

  // 核心资产：剩余点数
  // 注册时默认给 1 或 3 点 (MVP 建议给 3 点，容错率高一点)
  credits          Int      @default(3) 

  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  transactions     Transaction[] // 充值记录
  searchLogs       SearchLog[]   // 消耗记录
}

// 充值流水表 (只进不出的钱)
model Transaction {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  
  amount          Int      // 金额 (单位：分, e.g., 500 = $5.00)
  currency        String   // "usd"
  creditsAdded    Int      // 购买的点数 (e.g., 500)
  
  stripeSessionId String   @unique // 关键：防止 Webhook 重复处理
  status          String   // "succeeded", "pending"
  
  createdAt       DateTime @default(now())
}

// 消耗/搜索日志表 (用于审计和 debug)
model SearchLog {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  
  imageUrl        String   // 用户上传图的公网 URL
  providerStatus  String   // SerpApi 的返回状态
  cost            Int      // 本次消耗点数 (通常为 1，失败回滚则记为 0 或标记 failed)
  
  createdAt       DateTime @default(now())
}

```

---

### 第二部分：NestJS 接口设计

#### 1. 核心搜索模块 (`SearchModule`) —— **原子扣减是关键**

这里不仅要处理 API 调用，还要处理“扣费-服务-回滚”的事务一致性。

* **`POST /api/search`**
* **Guard**: Auth (Clerk)
* **Body**: `multipart/form-data` (文件)
* **Service 逻辑流程**:



```typescript
// search.service.ts (伪代码逻辑)

async searchImage(userId: string, file: Express.Multer.File) {
  // Step 1: 检查并原子扣减余额 (Optimistic Locking)
  // 解释：直接 update，条件是 credits > 0。如果返回影响行数 0，说明余额不足。
  // 这样避免了 "查余额 -> 余额够 -> 被另一个请求扣减 -> 扣成负数" 的并发问题。
  const updateResult = await this.prisma.user.updateMany({
    where: { 
      clerkId: userId, 
      credits: { gte: 1 } // 大于等于 1
    },
    data: { 
      credits: { decrement: 1 } // 扣 1
    }
  });

  if (updateResult.count === 0) {
    throw new HttpException('余额不足，请充值', 402); // 402 Payment Required
  }

  let publicUrl = '';
  try {
    // Step 2: 上传图片到 S3/R2
    publicUrl = await this.fileService.upload(file);

    // Step 3: 调用 SerpApi
    const searchResults = await this.serpApiService.search(publicUrl);

    // Step 4: 记录成功的日志
    await this.prisma.searchLog.create({
      data: { userId, imageUrl: publicUrl, cost: 1, providerStatus: 'success' }
    });

    return searchResults;

  } catch (error) {
    // Step 5: 异常补偿 (Compensation)
    // 如果 SerpApi 挂了或者代码崩了，必须把扣掉的 1 点还给用户
    console.error('Search failed, refunding credit', error);
    
    await this.prisma.user.update({
      where: { clerkId: userId },
      data: { credits: { increment: 1 } }
    });

    // 记录失败日志
    await this.prisma.searchLog.create({
      data: { userId, imageUrl: publicUrl, cost: 0, providerStatus: 'failed' }
    });

    throw new HttpException('搜索服务繁忙，点数已退回', 500);
  }
}

```

#### 2. 支付充值模块 (`BillingModule`)

对接 Stripe Checkout (Mode: Payment)。

* **`POST /api/billing/checkout`**
* **Guard**: Auth
* **Body**: `{ packageId: 'price_credit_500' }`
* **逻辑**:
1. 查找 User，获取或创建 `stripe_customer_id`。
2. 调用 `stripe.checkout.sessions.create`:
* `mode: 'payment'` (**重要**)
* `line_items`: `[{ price: packageId, quantity: 1 }]`
* `customer`: `user.stripeCustomerId`
* `metadata`: `{ userId: user.id, creditsAmount: 500 }` (将充值点数透传给 webhook)
* `success_url`: `https://yoursite.com/account?success=true`




* **返回**: `{ url: string }`


* **`POST /api/webhook/stripe`**
* **Guard**: Stripe Signature Check
* **逻辑 (处理充值到账)**:
* 监听事件: `checkout.session.completed`
* 从 event 中提取 `session_id`, `metadata.userId`, `metadata.creditsAmount`。
* **幂等性检查**: 查 `Transaction` 表，如果 `stripeSessionId` 已存在，直接返回 200 (忽略重复通知)。
* **入账事务**:
```typescript
await this.prisma.$transaction([
  // 1. 给用户加点数
  this.prisma.user.update({
    where: { id: userId },
    data: { credits: { increment: Number(creditsAmount) } }
  }),
  // 2. 记流水
  this.prisma.transaction.create({
    data: {
      userId: userId,
      stripeSessionId: sessionId,
      creditsAdded: Number(creditsAmount),
      amount: session.amount_total,
      currency: session.currency,
      status: 'succeeded'
    }
  })
]);

```







#### 3. 用户与状态模块 (`UserModule`)

* **`GET /api/users/me`**
* **逻辑**:
* 根据 Clerk ID 查 User。
* **Sync on Login**: 如果数据库没这个用户（刚注册），在此刻创建，并写入默认 `credits: 3`。


* **返回**: `{ credits: 5, email: "..." }`。


* **`GET /api/users/transactions`** (可选)
* **逻辑**: 分页查询该用户的 `Transaction` 表。



---

### 第三部分：开发实现的优先级建议

1. **Phase 1 (基础闭环)**:
* 跑通 Clerk 注册 -> `GET /me` (自动创建 DB 用户并送 3 点)。
* 实现 `/search` 接口，硬编码返回假数据，但先跑通 **“扣点 -> 失败回滚”** 的数据库逻辑。这是最容易出 Bug 的地方。


2. **Phase 2 (接入真实搜索)**:
* 接入 S3 上传和 SerpApi。
* 测试真实扣费。


3. **Phase 3 (接入支付)**:
* 配置 Stripe Product (One-time)。
* 实现 Checkout 和 Webhook。
* **测试重点**: 支付成功后，数据库的 credits 必须增加，且 Transaction 表必须有记录。




## 5) 技术实现细节补充（Critical for Coding）

搜索接口API：
GET  https://serpapi.com/search.json?engine=google_reverse_image&api_key=3c76a8cee4ff07ab9ec836f72eaa89129d92f7319ae886173b1a1fec8f3c6be0&image_url=<用户上传的图片URL>

response示例：
```json
{
search_metadata: {
id: "6943a11a50d43e42ef3623b6",
status: "Success",
json_endpoint: "https://serpapi.com/searches/9cdd7e55bdd0019b/6943a11a50d43e42ef3623b6.json",
created_at: "2025-12-18 06:37:14 UTC",
processed_at: "2025-12-18 06:37:14 UTC",
google_reverse_image_url: "https://www.google.com/searchbyimage?image_url=https://www.sgg.whu.edu.cn/__local/4/EF/8D/A99EBD2E41C7E3642E08439E034_F215DD3F_342A.jpeg&sbisrc=cr_1_5_2",
raw_html_file: "https://serpapi.com/searches/9cdd7e55bdd0019b/6943a11a50d43e42ef3623b6.html",
total_time_taken: 4.76
},
search_parameters: {
engine: "google_reverse_image",
image_url: "https://www.sgg.whu.edu.cn/__local/4/EF/8D/A99EBD2E41C7E3642E08439E034_F215DD3F_342A.jpeg",
google_domain: "google.com",
device: "desktop"
},
search_information: {
query_displayed: "for men",
total_results: 15,
time_taken_displayed: 0.41,
organic_results_state: "Results for exact spelling"
},
image_results: [
{
position: 1,
title: "ForMen Health: Doctor-Formulated Wellness & Personal Care ...",
link: "https://www.formen.health/",
redirect_link: "https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https://www.formen.health/&ved=2ahUKEwilic2Jw8aRAxWIl2oFHZX_IBEQFnoECAsQAQ&usg=AOvVaw38kp9Sypuv81eMAI-JYzDC",
displayed_link: "https://www.formen.health",
favicon: "https://serpapi.com/searches/6943a11a50d43e42ef3623b6/images/97e09e4a9523c4434c8605aa7df836dc806bd9b931dd0cb4.png",
snippet: "Optimise your male health with ForMen science-backed supplements. Supports Reproductive Health, Enhances Hormonal Balance, Increases Energy Levels.",
snippet_highlighted_words: [
"ForMen"
],
{
position: 7,
title: "王正涛-武汉大学测绘学院",
link: "https://www.sgg.whu.edu.cn/info/1403/2044.htm",
redirect_link: "https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https://www.sgg.whu.edu.cn/info/1403/2044.htm&ved=2ahUKEwilic2Jw8aRAxWIl2oFHZX_IBEQFnoECBYQAQ&usg=AOvVaw34JFX4EYs_nyPXyjWf4vFU",
displayed_link: "https://www.sgg.whu.edu.cn › info",
thumbnail: "https://serpapi.com/searches/6943a11a50d43e42ef3623b6/images/97e09e4a9523c4436b494b1cb94931c71a689a53a529b0a0451863c13ca5707b.jpeg",
snippet: "... for hydrological drought characterization in southwestern China using GRACE[J], Hydrogeology Journal. 2016. Jiandi Feng,Zhengtao Wang*, Weiping Jiang ...",
snippet_highlighted_words: [
"for"
],
source: "武汉大学"
}
]
}
```
后端需要数据过滤，只展示有 thumbnail 字段的 item, 并且只展示前100条数据

UI设计：
需要展示 title , link, thumbnail , source 字段






### 5.1 数据一致性与响应结构
* **Search Response**: `POST /api/search` 成功后，必须返回更新后的余额：
    ```json
    {
      "data": [ ...results ],
      "meta": {
        "cost": 1,
        "remainingCredits": 4 // 前端获取此值更新 UI，无需重新 fetch profile
      }
    }
    ```

### 5.2 安全与文件策略
* **Upload**: 限制文件类型 (jpg, png, webp) 和大小 (Max 5MB)。 存储使用cloudflare r2。 https://bde2a4fb5276f94ba60cec33fbe6ec38.r2.cloudflarestorage.com/images  页面配置上传文件的生命周期，不需要代码处理







生成高质量、现代且符合 SaaS 标准的前端代码，你需要定义一套清晰的 **UI 设计系统（Design System）** 和 **UX 交互规范**。

由于你的后端已经确定为“点数制”，前端的核心任务是**“显性化余额”**和**“平滑的支付/消耗体验”**。

以下是针对你的 Vibe Coding 项目的 UI 约束清单和提示词设计：


### 1. 技术栈与设计风格约束 (Tech & Style Constraints)

告诉 AI 你想要什么样的“基调”。目前最流行、AI 写得最好的是 **"Linear / Stripe 风格"**。

* **UI 库**: `Shadcn/ui` (基于 Radix UI) + `Tailwind CSS` (必须强制使用)。
* **图标库**: `Lucide React`。
* **字体**: `Inter` 或 `Geist Sans` (Vercel 出品，适合数字显示)。
* **色调**:
* **主色 (Primary)**: 深黑 (`slate-900`) 或 深蓝 (`indigo-600`)，用于 CTA 按钮。
* **强调色 (Accent)**: 橙色或金色，专门用于 **“点数/余额”** 的展示（暗示金钱/价值）。
* **背景**: 极简白/灰 (`slate-50`)，卡片带轻微阴影和圆角 (`rounded-xl`).


* **布局**:
* **PC 端**: 限制最大宽度 (`max-w-7xl`), 居中 (`mx-auto`).
* **移动端**: 100% 响应式，导航栏折叠为汉堡菜单。



---

### 2. 核心组件的交互规范 (Component Rules)

这是为了配合你的“点数逻辑”和“搜索逻辑”。

#### A. 导航栏 (Navbar) —— “余额是第一公民”

* **未登录**: 显示“登录/注册”。
* **已登录**:
* 必须显示 **余额徽章 (Credits Badge)**：例如 `⚡ 12 Credits`。
* 点击徽章直接跳转 `/pricing`。
* 余额数字变化时，最好有一个“数字滚动”或“闪烁”动画。



#### B. 搜索页 (Search Page) —— “状态机 UI”

AI 需要知道页面有几种状态：

1. **Empty (初始)**: 居中显示巨大的上传区域 (Drag & Drop)，文案提示“消耗 1 点数”。
2. **Uploading (上传中)**: 进度条。
3. **Processing (搜索中)**: **骨架屏 (Skeleton)** 占位，模拟正在加载图片的布局，减少等待焦虑。
4. **Results (结果)**: 瀑布流 (Masonry) 或 网格布局展示图片。
5. **Error (余额不足)**: 拦截操作，弹出 **Pricing Modal**（不要只显示一行报错文字，直接推销）。

#### C. 充值卡片 (Pricing Card)

* **设计**: 包含“最受欢迎”标签 (Best Value)。
* **行为**: 既然是一次性支付，不需要显示 `/month`，而是显示 `Lifetime Access` 或 `One-time payment`。

---

### 3. 具体页面的 Vibe Coding 提示词 (Prompts)

你可以直接复制这些提示词给 Cursor/v0。

#### 场景 1：生成全局布局与导航栏

> **Prompt:**
> "Create a global Layout component using Next.js 14, Tailwind CSS, and Shadcn/ui.
> The Navbar should be sticky.
> **Key Requirement**: Check the user's login status (Clerk).
> * If logged out: Show 'Sign In' and a 'Get Started' button.
> * If logged in: Show a 'UserDropdown' and crucially, a **'CreditsBadge' component**.
> * The 'CreditsBadge' should display an icon (Zap/Coins) and the current integer balance (e.g., '500 Credits'). Make the badge clickable, linking to `/pricing`. Use a gold/yellow accent color for the credits icon to make it stand out against a minimal white background."
> 
> 

#### 场景 2：生成以图搜图核心页 (/search)

> **Prompt:**
> "Build the `/search` page logic and UI.
> **State Management**: Use `useState` for 'idle', 'uploading', 'searching', 'success', 'error'.
> **UI Components**:
> 1. **Idle**: A large, centered drag-and-drop zone (use `react-dropzone`). Add text: 'Search visual matches. Cost: 1 Credit per search.'
> 2. **Searching**: Display a grid of 8 Skeleton cards (Shadcn) to simulate loading results.
> 3. **Results**: A responsive grid (mobile: 1 col, desktop: 4 cols) showing image thumbnails.
> **Error Handling (Important)**:
> If the API returns 402 (Payment Required), do NOT show a simple toast. Instead, trigger a 'LowBalanceDialog' that informs the user they are out of credits and provides a button to go to Pricing."
> 
> 

#### 场景 3：生成充值页 (/pricing)

> **Prompt:**
> "Design a `/pricing` page for one-time credit purchases (Non-subscription).
> Create two cards using Tailwind:
> 1. **Starter**: $5 for 500 Credits.
> 2. **Pro (Highlight this)**: $10 for 1200 Credits. Add a 'Best Value' badge on top.
> **Features**:
> 
> 

> * Clean typography, big price numbers.
> * 'Buy Now' button calls the Stripe Checkout API.
> * List features with checkmarks (e.g., 'Never expires', 'High speed', 'Access to all tools')."
> 
> 

---

### 4. 必须交代的“微交互”细节 (Micro-interactions)

这些细节决定了产品是否“好用”。

* **Toast 通知 (Sonner/Hot-toast)**:
* 充值成功 -> 绿色 Toast "充值成功！余额已更新"。
* 搜索失败 -> 红色 Toast "服务繁忙，点数已退回"。


* **Loading 状态锁定**:
* 当点击“搜索”或“支付”时，按钮必须进入 `disabled + loading spinner` 状态，防止用户重复点击导致重复扣费。



### 5. 给 AI 的最终“UI/UX Master Prompt”


```markdown
# Frontend UI/UX Guidelines for "ImageSearch SaaS"

## 1. Design System
- **Framework**: Next.js 14 (App Router), React, TypeScript.
- **Styling**: Tailwind CSS.
- **Components**: Shadcn/ui (Radix UI).
- **Icons**: Lucide React.
- **Aesthetics**: "Linear-style", clean, minimal, high whitespace, rounded-xl borders.
- **Fonts**: Inter or Geist Sans.

## 2. Color Palette
- **Background**: White (#ffffff) / Slate-50 (#f8fafc).
- **Text**: Slate-900 (Headings), Slate-500 (Body).
- **Primary**: Indigo-600 (Buttons/Links).
- **Accent (Credits)**: Amber-500 or Yellow-500 (Used specifically for Credit Balance & Pricing tiers).

## 3. Critical UX Requirements
- **Real-time Balance**: The Navbar must always show the current user credits. Update this optimistically or via context refresh after search/payment.
- **Feedback Loops**:
  - Show Skeleton loaders during the search API call.
  - Show a "Low Balance" Modal immediately if the API returns 402.
- **Mobile First**: The search results grid must collapse to 1 column on mobile and 3-4 columns on desktop.
- **Button States**: All async actions (Search, Pay) must show a loading spinner in the button.

## 4. Key Pages
- **Home**: SEO focused, H1 hero section, clear "Try for Free" CTA.
- **Search**: Center stage upload box. When results load, move upload box to top-bar or keep results below.
- **Pricing**: Simple 2-column layout. One-time payment focus (no "/month" text).

```


补充：规则

#### 错误处理
代码中所有的报错给用户提示的报错需要用户友好，日志需要程序员友好，不要出现中文。
#### 国际化 
代码中暂时只需要支持英文，后续需要支持其他语言，实现上需要考虑语言国际化。
### 退款政策
需要补充退款政策， 在terms页面来展示退款政策,同时在/refunds页面来展示退款政策， 同时在购买的页面需要展示简要退款政策。
1. 核心政策概览 (General Policy)
不可退款性：明确说明点数（Credits）属于数字虚拟内容，一旦购买并充值到账，原则上不予退款。

确认条款：提醒用户在支付时即代表同意“开始履行合规义务”，从而放弃法定冷静期的退款权利（符合欧盟及多数地区对数字产品的规定）。

2. 可退款的特殊例外 (Exceptions & Eligibility)
即使是点数制，为了合规和用户体验，必须保留以下例外：

未消费全额退款：用户购买点数包后 7 天内（或 14 天） 且 点数余额完全未被消耗（1 点都没用过），可以申请原路退款。

技术故障：由于系统底层错误导致点数扣除但未给出搜索结果，且系统未自动执行“点数回补”时，用户有权申请补偿或退款。

重复扣款：因支付网关抖动导致的同一订单多次扣费。

3. 明确不予退款的情境 (Non-refundable Scenarios)
搜索结果不满意：因 SerpApi 或 Google 索引导致的“搜不到想要的结果”或“相似度不高”，不属于退款理由（因为点数消耗的是计算资源和服务调用）。

账户违规：因违反服务条款（如恶意刷接口、逆向工程）导致账户被封禁，剩余点数不予退款。

点数已部分消耗：只要点数包被使用过（哪怕只消耗了 1 点），该点数包即被视为“已激活服务”，不再支持全额退款。

4. 退款流程 (Refund Process)
申请方式：提供一个明确的联系邮箱（例如 support@yourdomain.com）。

所需信息：要求用户提供： 注册邮箱。Stripe 交易单号（Invoice ID）。

申请退款的具体原因。
处理时效：承诺在 3-5 个工作日 内审核并回复，退款到账时间取决于银行（通常 5-10 天）。

5. 法律合规补充 (Legal Compliance)
货币限制：退款将按原支付货币和路径退回，不承担汇率波动损失。

地区差异：声明若当地法律（如欧盟消费者权利指令）有强制性规定，则以当地法律为准。


### 首页seo 


以下是为你定制的 **ReverseImage.io** SEO 文案全案：

---

## 1. TDK (Meta Tags) 设定

| 标签 | 内容文案 (Copywriting) |
| --- | --- |
| **Title** | Reverse Image Search - Search by Image to Find Similar Photos |
| **Description** | Use our fast reverse image search tool to find similar images, identify sources, and explore high-resolution versions. Support upload, URL, and drag-and-drop. Try ReverseImage.io for free. |
| **Keywords** | reverse image search, search by image, find similar images, photo lookup, image source finder, reverse photo search |

---

## 2. 页面文本结构 (H1, H2, Content)

### **H1: Reverse Image Search**

*(副标题：Find similar images and identify image sources in seconds.)*

### **H2 布局 (核心价值与功能说明)**

1. **Why Use Reverse Image Search?** (转化意图)
2. **How to Search by Image on Desktop and Mobile?** (操作指南)
3. **Key Features of ReverseImage.io** (产品差异化)
4. **Common Use Cases for Photo Lookup** (场景覆盖)

---

## 3. 具体文案内容

### **A. 功能介绍 (How it works)**

> **Upload with Ease**
> Simply drag and drop your image, upload a file, or paste a direct image URL. Our advanced algorithm powered by Google Reverse Image API will analyze your photo and find the best matches across the web.

### **B. SEO 增强长尾文本 (用于页面底部)**

> **Secure and Private Image Lookup**
> At ReverseImage.io, we prioritize your privacy. All uploaded images are processed via secure Cloudflare R2 storage and are automatically deleted after processing. We don't store your personal data or index your private photos.
> **Multi-Engine Visual Search**
> Our tool bridges the gap between different search engines. Whether you are looking for a high-res version of a wallpaper, checking for copyright infringement, or identifying a person or product, our reverse photo search provides comprehensive results from the most extensive databases.

---

## 4. FAQ 常见问题 (SEO 权重极高)

> 使用 `Schema.org` 的 FAQ 格式可以增加在 Google 搜索结果中展示的概率。

* **Q: How do I do a reverse image search on my phone?**
* **A:** Open reverseimage.io on your mobile browser, tap the upload button, select a photo from your gallery, and hit search. It works on both iOS and Android.


* **Q: Is this image search tool free?**
* **A:** Yes! New users get 3 free search credits upon registration. You can purchase additional credit packages for high-volume searching.


* **Q: Can I find the original source of an image?**
* **A:** Absolutely. Our tool scans the web to find where the image first appeared and provides links to the original source.



---

## 5. 针对 /refunds 页面的 SEO 文案

虽然是功能页，但为了专业度，建议 TDK 如下：

* **Title**: Refund Policy - ReverseImage.io
* **H1**: Refund & Cancellation Policy
* **Text**: Our priority is your satisfaction. Please read our policy regarding digital credits and one-time payments. (接着使用前文提到的合规要点)

---




## 总结readme-mvp.md
这个总结需要越详细越好，需要拆解清晰，可落地，能指导前端后端开发，能指导seo, 能指导页面UI设计。比如我删除了代码，能通过这个md 来vibe coding 落地

