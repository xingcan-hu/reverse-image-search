# 页面说明：`/search`（Search / 核心功能页）

面向：前端、设计同学。该页面用于承载“真实搜索 + 扣点数 + 结果展示”的主流程。

> 现状：仓库当前没有 `src/app/[locale]/(marketing)/search/page.tsx`，但首页底部 CTA 已指向 `/search`，因此建议补齐该页面（或把 CTA 改回 `/`）。

## 路由与建议实现位置

- 路由：`/search`
- 建议新增 Next.js 文件：`src/app/[locale]/(marketing)/search/page.tsx`
  - 复用组件：`src/app/[locale]/(marketing)/search/SearchClient.tsx`

## 页面目标（MVP）

- 登录后用户的“主操作页”：上传/粘贴图片 → 发起搜索 → 扣 1 credit → 展示结果。
- 显性化余额（credits），并提供“余额不足”强提示与充值引导。
- 结果展示必须清晰：缩略图 + 标题 + 来源 + 跳转链接（新开标签）。

## 页面状态机（可实现）

由 `SearchClient` 已实现，设计/前端按以下状态验收：

1. **Idle（初始）**
   - Dropzone 文案：`Drop an image to begin`
   - 右侧结果区：引导卡 `Ready to Search` + `💡 Pro Tips`

2. **Searching（处理中）**
   - Dropzone 主文案：`Searching for visual matches...`
   - 结果区显示骨架屏 + 右上角 pill：`Searching...`

3. **Success（有结果）**
   - 右上角展示 `N found`
   - 列表项：thumbnail（lazy）+ title + source badge + link（可复制/可点）

4. **Success（无结果）**
   - 提示卡：`No matches found`
   - 建议文案：`Try another image, a different angle, or a higher resolution photo for better results.`

5. **Error（请求失败）**
   - 页面内红色错误条：展示 `errorMessage`
   - 同时 toast：`Search failed` + description
   - 失败会触发 credits 刷新（避免显示不一致）

6. **余额不足（402）**
   - 弹窗组件：`LowBalanceDialog`
   - 主按钮：`Go to pricing` → `/pricing`

## 关键模块与文案（建议直接复用）

### 顶部信息条

- 左侧：
  - 小标题：`Powered Search`
  - H1：`Find Similar Images`
- 右侧余额 badge：`{credits} credits`

### 上传区（Dropzone）

- 动态主文案：
  - `Drop an image to begin` / `Searching for visual matches...` / `Results ready` / `There was an error`
- 固定文案：
  - `Drag & drop or click to upload`
  - `JPG, PNG, or WEBP up to 5MB`
  - `1 credit per search`

### URL 搜索区

- 标题：`Or search by URL`
- Placeholder：`https://example.com/image.jpg`
- 按钮：`Search`
- 提示：`💡 Paste a direct image URL for instant reverse search`

### 结果区

- 小标题：`Search Results`
- H2：`Visual Matches`
- Empty 引导卡：
  - 标题：`Ready to Search`
  - 描述：`Upload an image or paste a URL to find similar images across 50+ sources`
- Tips：
  - `💡 Pro Tips`
  - `Use clear, high-quality images for best results`
  - `Different angles can reveal different matches`
  - `Search multiple variations to find all sources`

### 余额不足弹窗

- Title：`You are out of credits`
- Body：`Each reverse image search costs 1 credit. Recharge to continue searching — credits never expire and failed searches are auto-refunded.`
- CTA：
  - `Go to pricing`
  - `Maybe later`

## SEO（建议）

- 该页建议 **noindex**（核心原因：需要登录/不用于 SEO 承接）。
- 不加入 sitemap；并在 `robots.txt` 中 disallow `/search`（与 `/account` 同级）。

## 前端接口依赖（实现要点）

- 发起搜索：`POST /api/search`
  - 上传：`multipart/form-data` `file`
  - URL：`application/json` `{ imageUrl }`
- 成功响应需包含余额：`meta.remainingCredits`（用于即时更新 UI）
- 余额不足：HTTP `402` → 打开 `LowBalanceDialog`

## Backend / API 约定（与实现一致）

### `POST /api/search`（核心）

- Route：`src/app/[locale]/api/search/route.ts`
- Auth：Clerk（未登录返回 `401`）
- Cost：每次成功搜索消耗 `1 credit`（原子扣减）；若后续步骤失败会自动回补

**请求**

- 上传：`multipart/form-data`
  - 字段：`file`（兼容 `image`）
  - 限制：`JPG/PNG/WEBP`，最大 `5MB`
- URL：`application/json`
  - `{ "imageUrl": "https://..." }`（仅允许 http(s)）

**响应**

- `200`：
  - `data`: 搜索结果数组（只保留带 `thumbnail` 的条目，最多 100 条）
  - `meta`: `{ cost: 1, remainingCredits: number }`
- `401`：`{ error: "Please sign in to continue." }`
- `402`：`{ error: "Insufficient credits. Please top up to continue." }`
- `400/413/415`：输入/文件校验失败（缺图、超大、格式不支持）
- `500`：搜索失败；如果已扣费会返回“点数已退回”的提示文案

**数据落库**

- 扣费：`UPDATE users SET credits = credits - 1 WHERE credits >= 1`
- 日志：写入 `search_logs`（成功 `cost=1`，失败 `cost=0`）

### 依赖服务与环境变量

- Cloudflare R2 上传（上传文件场景）：
  - `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET_NAME` / `R2_PUBLIC_BASE_URL`
- 搜索提供方（SerpApi）：
  - `SEARCH_API_URL`（例如 `https://serpapi.com/search.json`）
  - `SEARCH_API_KEY`
