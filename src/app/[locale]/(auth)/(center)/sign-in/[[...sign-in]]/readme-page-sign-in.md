# 页面说明：`/sign-in`（Auth / Sign in）

面向：前端、设计同学。该页面承载 Clerk 登录。

## 路由与实现位置

- 路由：`/sign-in`
- Next.js 文件：`src/app/[locale]/(auth)/(center)/sign-in/[[...sign-in]]/page.tsx`
- 居中布局：`src/app/[locale]/(auth)/(center)/layout.tsx`
- 文案来源：`src/locales/en.json`（`SignIn.*`）

## 页面目标（MVP）

- 完成登录闭环；登录后回跳到 `/account`（由 `ClerkProvider` 配置）。

## 关键文案（可直接复用）

- SEO Title：`Sign in`
- SEO Description：`Access your Vibe Search account and credits.`

## SEO（建议）

- 该页建议 **noindex**（登录页不需要参与搜索引擎收录）。

## Backend / 登录后数据初始化

- 认证由 Clerk 托管，页面本身不直接调用自建后端。
- 数据库用户是“懒创建”：
  - 首次调用 `GET /api/users/me`、`POST /api/search`、`POST /api/billing/checkout` 等会触发 `getOrCreateUser()` 创建用户记录并写入初始 credits。
- 登录完成后默认回跳：`/account`（由 `src/app/[locale]/layout.tsx` 的 `ClerkProvider` 配置）。
