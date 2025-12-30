# 页面说明：`/refunds`（Legal / Refund Policy）

面向：前端、设计、内容同学。该页面用于解释点数（虚拟商品）的退款政策，增强信任并降低纠纷。

## 路由与实现位置

- 路由：`/refunds`
- Next.js 文件：`src/app/[locale]/(marketing)/refunds/page.tsx`
- 复用组件：`src/components/legal/RefundPolicy.tsx`

## 页面目标（MVP）

- 清晰说明：点数包一般不可退款；但存在“未使用全额退款 / 技术故障 / 重复扣款”等例外。
- 给出可执行的退款流程与联系方式。
- 与 `/terms` 互相链接，形成合规闭环。

## 页面结构（可实现）

1. Hero
   - H1：`Refund & Cancellation Policy`
   - 描述：`Our priority is your satisfaction. Please review our policy regarding digital credits and one-time payments.`
   - 链接：`View Terms of Service` → `/terms`
2. Quick Summary（3 项）
   - `Auto-Refund` / `14-Day Window` / `Fair Process`
3. Full Policy（组件 `RefundPolicy`）

## SEO（落地）

- Meta：
  - Title：`Refund Policy - ReverseImage.io`
  - Description：`Refund and cancellation policy for digital credits and one-time payments on ReverseImage.io.`
- H1：`Refund & Cancellation Policy`
- sitemap 已包含 `/refunds`（`src/app/sitemap.ts`）

## Backend / 自动退款与人工退款边界

- 自动退点数（search credit refund）：`POST /api/search` 在扣费后失败会执行 `credits + 1` 回补（并写入失败日志）。
- 支付退款（Stripe 退款）当前不提供自助接口；按页面政策通过邮箱人工处理。
