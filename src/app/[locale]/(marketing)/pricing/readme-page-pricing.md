# 页面说明：`/pricing`（Pricing / 充值与价格）

面向：前端、设计同学。该页面用于解释“点数制一次性支付”并驱动进入 Stripe Checkout。

## 路由与实现位置

- 路由：`/pricing`
- Next.js 文件：`src/app/[locale]/(marketing)/pricing/page.tsx`
- 主要 UI：`src/app/[locale]/(marketing)/pricing/PricingClient.tsx`
- 点数包配置：`src/libs/Billing.ts`（`CREDIT_PACKAGES`）

## 页面目标（MVP）

- 清晰展示两档点数包（一次性支付、永久有效、无订阅）。
- 已登录用户显示当前余额（增强“充值后可用”的确定性）。
- 未登录用户引导先注册/登录（注册会送免费 credits）。
- 进入 Stripe Checkout（`mode=payment`）。

## 页面结构（可实现）

1. **Hero**
   - 徽章：`Simple Pricing`
   - H1：`Pay Once, Use Forever`
   - 描述：`No subscriptions. No hidden fees. Buy credits when you need them.`
   - 已登录：展示 `Your Balance: {credits} Credits`

2. **Pricing Cards（2 列）**
   - 卡片标题：`One-Time Payment` + `{pkg.label}`
   - 高亮包：`Best Value`
   - 展示：
     - 价格：`$ {pkg.price/100}`
     - 点数：`{pkg.credits} credits`
     - 单价提示：`Only $X per credit · Never expires`
   - 3 条卖点：
     - `Credits never expire`
     - `Secure Stripe checkout`
     - `Auto-refund on failures`
   - CTA：
     - 默认：`Buy Now`
     - Loading：`Processing...`

3. **Features Grid（3 项）**
   - `Auto-Refund` / `No Subscriptions` / `Instant Results`

4. **Refund Policy Summary**
   - 小标题：`Fair Refund Policy`
   - H2：`Your Purchase is Protected`
   - 要点：
     - `Unused credit packs eligible for full refund within 14 days`
     - `Technical failures automatically refunded to your account`
     - `Duplicate charges corrected or refunded immediately`
   - 链接：`Read full refund policy` → `/refunds`

5. **未登录 CTA（SignedOut）**
   - 徽章：`Free Trial`
   - 标题：`Try Before You Buy`
   - 描述：`Sign up now and get 3 free search credits to test the quality`
   - 辅助：`No credit card required · Credits never expire`
   - CTA：`Get Started Free` → `/sign-up`

## SEO（落地）

### Meta（TDK）

- Title：`Pricing | Vibe Search`
- Description：`Buy lifetime credits for reverse image search. $5 for 500 credits or $10 for 1200 credits. No subscriptions.`

### 结构

- H1：`Pay Once, Use Forever`
- 该页应可被索引（sitemap 已包含 `/pricing`：`src/app/sitemap.ts`）。

## 交互与数据（前端实现）

- 点击购买：
  - 未登录：跳转 `/sign-in`
  - 已登录：`POST /api/billing/checkout`，成功后 `window.location.href = payload.url`
- 失败 toast：
  - `Unable to start checkout`（含 description）
  - `Checkout link missing. Please retry.`

## Backend / 支付与入账（与实现一致）

### 点数包来源

- 配置：`src/libs/Billing.ts`
- 价格 ID：优先读环境变量 `STRIPE_PRICE_CREDIT_500` / `STRIPE_PRICE_CREDIT_1200`（否则使用占位 `price_credit_500` / `price_credit_1200`）

### `POST /api/billing/checkout`

- Route：`src/app/[locale]/api/billing/checkout/route.ts`
- 请求：`{ "packageId": "<stripe_price_id>" }`
- 成功：`{ "url": "<stripe_checkout_url>" }`
- 失败：
  - `401` 未登录
  - `400` packageId 无效
  - `503` Stripe 未配置（缺 `STRIPE_SECRET_KEY`）
  - `500` 创建 session 失败
- URL：
  - success：`/account?success=true`
  - cancel：`/pricing?canceled=true`

### Stripe Webhook 入账

- Route：
  - `/api/webhook/stripe` → `src/app/api/webhook/stripe/route.ts`
  - `/api/webhooks/stripe`（别名）→ `src/app/api/webhooks/stripe/route.ts`
- 事件：`checkout.session.completed`
- 校验：`STRIPE_WEBHOOK_SECRET`
- 幂等：`transactions.stripe_session_id` 唯一；重复通知会被忽略
- 入账：`users.credits += metadata.credits` 并插入一条 `transactions`
