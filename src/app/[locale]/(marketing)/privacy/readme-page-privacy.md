# 页面说明：`/privacy`（Legal / Privacy Policy）

面向：前端、设计、内容同学。该页面用于隐私合规与用户信任建设。

## 路由与实现位置

- 路由：`/privacy`
- Next.js 文件：`src/app/[locale]/(marketing)/privacy/page.tsx`

## 页面目标（MVP）

- 说明收集的数据范围（账号/邮箱/余额/交易/搜索日志）。
- 说明图片处理与存储（Cloudflare R2，用于生成可检索的公网 URL）。
- 说明支付数据（Stripe 处理，站点不存卡信息）。
- 提供删除请求联系邮箱。

## 页面结构（可实现）

1. Hero
   - H1：`Privacy Policy`
   - 描述：`We focus on transparency. Below is how we handle your data and uploaded files.`
2. Key Promises（3 项）
   - `Secure Storage` / `No Training` / `Full Transparency`
3. Privacy Sections（2 列卡片）
   - `Data we collect` / `Images & storage` / `Payments` / `Retention`
4. Contact Section
   - `Questions about your data?`
   - 邮箱：`help@support.reverseimage.io`

## SEO（落地）

- Meta：
  - Title：`Privacy Policy | Vibe Search`
  - Description：`How Vibe Search handles uploaded images, personal data, and payment information.`
- H1：`Privacy Policy`
- sitemap 已包含 `/privacy`（`src/app/sitemap.ts`）

## Backend / 数据与存储（与实现一致）

- `users`：保存 `clerk_id`、`email`、`stripe_customer_id`、`credits`
- `transactions`：保存充值流水（金额/币种/增加点数/stripe_session_id/status）
- `search_logs`：保存每次搜索的 `image_url`（公网 URL）与成本/状态（用于审计与排错）
- 上传存储：上传文件会先存到 Cloudflare R2 获取公网 URL，再调用搜索提供方（SerpApi）
