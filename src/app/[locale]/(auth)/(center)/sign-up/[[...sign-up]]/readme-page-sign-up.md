# 页面说明：`/sign-up`（Auth / Sign up）

面向：前端、设计同学。该页面承载 Clerk 注册，并让用户获得初始免费 credits。

## 路由与实现位置

- 路由：`/sign-up`
- Next.js 文件：`src/app/[locale]/(auth)/(center)/sign-up/[[...sign-up]]/page.tsx`
- 居中布局：`src/app/[locale]/(auth)/(center)/layout.tsx`
- 文案来源：`src/locales/en.json`（`SignUp.*`）
- 初始赠送 credits：`src/libs/UserService.ts`（`DEFAULT_STARTING_CREDITS = 3`，首次创建用户时写入 DB）

## 页面目标（MVP）

- 完成注册闭环；注册后回跳到 `/account`（由 `ClerkProvider` 配置）。
- 让用户明确获得“免费 credits”，并引导立即开始搜索（回到 `/` 或 `/search`）。

## 关键文案（可直接复用）

- SEO Title：`Sign up`
- SEO Description：`Create an account and get free credits to try reverse image search.`

## SEO（建议）

- 该页建议 **noindex**（注册页不需要参与搜索引擎收录）。

## Backend / 注册赠送 credits

- 初始赠送：`DEFAULT_STARTING_CREDITS = 3`（`src/libs/UserService.ts`）
- DB 用户创建时机：同样是“懒创建”（首次调用 `getOrCreateUser()` 的接口时写入 `users` 表）。
- 注册完成后默认回跳：`/account`（由 `src/app/[locale]/layout.tsx` 的 `ClerkProvider` 配置）。
