# 页面说明：`/terms`（Legal / Terms of Service）

面向：前端、设计、内容同学。该页面用于合规，明确点数属性、计费方式与退款规则入口。

## 路由与实现位置

- 路由：`/terms`
- Next.js 文件：`src/app/[locale]/(marketing)/terms/page.tsx`
- 复用组件：`src/components/legal/RefundPolicy.tsx`

## 页面目标（MVP）

- 说明服务性质（点数制 reverse image search）。
- 明确 credits 为虚拟商品、永久有效、与账号绑定。
- 明确支付方式为 Stripe 一次性支付（非订阅）。
- 明确“搜索失败自动退点数”的机制与原则。
- 提供完整退款政策入口（`/refunds`）。

## 页面结构（可实现）

1. Hero
   - H1：`Terms of Service`
   - 辅助说明：`Please review these terms carefully. By using ReverseImage.io you agree to the rules below.`
2. Terms Grid（2 列）
   - `Service` / `Credits` / `Billing` / `Automatic refunds on failures` / `Acceptable use`
3. Refund Policy Section
   - 引导链接到 `/refunds`
4. Full Refund Policy（组件 `RefundPolicy`）

## SEO（落地）

- Meta：
  - Title：`Terms of Service | Vibe Search`
  - Description：`Terms of Service and Refund Policy for Vibe Search including credits, payments, and refund eligibility.`
- H1：`Terms of Service`
- sitemap 已包含 `/terms`（`src/app/sitemap.ts`）

## Backend / 与实现的对应关系

- Credits 永久有效：余额字段为 `users.credits`（不会过期扣减逻辑）。
- 一次性支付：Stripe Checkout 使用 `mode: 'payment'`（无订阅/无 portal）。
- “搜索失败自动退点数”：由 `POST /api/search` 在异常时执行 `credits + 1` 补偿实现（`src/app/[locale]/api/search/route.ts`）。
