# 页面说明：`/dashboard`（Auth / Redirect）

该页面用于兼容/占位：访问 `/dashboard` 时直接重定向到 `/account`。

## 路由与实现位置

- 路由：`/dashboard`
- Next.js 文件：`src/app/[locale]/(auth)/dashboard/page.tsx`
- 行为：`redirect(getI18nPath('/account', locale))`

## SEO（建议）

- **noindex**（重定向页无需收录）
- `robots.txt` 已 disallow `/dashboard`（`src/app/robots.ts`）

## Backend

- 无自建后端交互；仅前端路由重定向。
