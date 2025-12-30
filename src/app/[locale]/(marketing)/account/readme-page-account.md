# 页面说明：`/account`（Account / 账号与余额）

面向：前端、设计同学。该页面用于展示余额、充值记录，并提供快速充值入口。

## 路由与实现位置

- 路由：`/account`
- Next.js 文件：`src/app/[locale]/(marketing)/account/page.tsx`
- 主要 UI：`src/app/[locale]/(marketing)/account/AccountClient.tsx`
- 数据来源：
  - `GET /api/users/me`（用于刷新余额）
  - `GET /api/users/transactions`（最近充值记录）

## 页面目标（MVP）

- 大字号展示当前 credits（“余额是第一公民”）。
- 提供强 CTA：`Buy more credits` → `/pricing`。
- 提供最近充值记录（提升信任、便于对账）。
- 提供 Clerk 的用户菜单入口（登出/账号管理）。

## 页面结构（可实现）

1. **顶部两列卡片**
   - 左：Credits
     - 标签：`Credits`
     - 大数字：`{credits}`
     - 说明：`Use 1 credit per search. Credits never expire.`
     - 按钮：
       - `Buy more credits` → `/pricing`
       - `New search` → `/`
   - 右：Account
     - 标签：`Account`
     - 标题：`Manage your session`
     - 描述：`Signed in with Clerk. Secure payments via Stripe.`
     - 文案提示：
       - `Credits are tied to your account. Logging out keeps your balance safe.`
       - `Every payment creates a transaction log with amount, currency, and credits added.`
     - 提示 pill：`Use the avatar menu to sign out`
     - 右上角：`<UserButton />`

2. **History 卡片**
   - 标签：`History`
   - 标题：`Recent recharges`
   - 右侧链接：`Recharge credits` → `/pricing`
   - Loading：3 条 skeleton
   - Empty：
     - `No transactions yet. Start with your free credits or purchase a pack to see them here.`
   - List item：
     - `"$5 · +500 credits"`（金额按 `amount/currency` 格式化）
     - `status`
     - 时间（`MMM DD, YYYY, HH:mm`）

## SEO（建议）

- Meta（已实现）：
  - Title：`Account | Vibe Search`
  - Description：`Check your remaining credits, see recharge history, and jump back into reverse image search.`
- 建议 **noindex**（账户页不应参与 SEO）。
- `robots.txt` 已 disallow `/account`（`src/app/robots.ts`）。

## 交互与数据（前端实现）

- 页面加载拉取：
  - `GET /api/users/transactions`（失败 toast：`Unable to load transactions`）
  - 最终会调用 `refreshCredits()` 同步余额
- 未登录：
  - API 会返回 `401`；产品期望是页面级跳转到 `/sign-in`（可由 middleware 或页面逻辑实现）

## Backend / 数据接口（与实现一致）

### `GET /api/users/me`

- Route：`src/app/[locale]/api/users/me/route.ts`
- Auth：Clerk（未登录 `401`）
- 响应字段（用于 credits 同步）：
  - `credits`（Int）
  - 以及 `id`/`clerkId`/`email`/`stripeCustomerId`

### `GET /api/users/transactions`

- Route：`src/app/[locale]/api/users/transactions/route.ts`
- Auth：Clerk（未登录 `401`）
- 响应：`{ transactions: Transaction[] }`（最近 10 条，按时间倒序）
