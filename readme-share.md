# 增量设计文档：签到与分享邀请模块（简化版：积分永久）

目标：在现有 MVP（Next.js App Router + Clerk + Drizzle/Postgres + Stripe）基础上新增：

- **每日签到**：每天签到送 `1` 积分，**永久有效**。
- **分享邀请**：分享邀请链接，**每成功邀请 1 个新用户**，邀请人获得 `20` 积分，**永久有效**。

简化点（与上一版不同）：

- **所有积分永久**，不再区分“限时点数/永久点数”。
- **无扣费优先级**（只需从总余额扣减）。
- **继续使用 `users.credits` 作为唯一余额来源**。

> 本文档为可落地设计说明，包含 Schema Change、Consumption Logic、API 契约与前端组件规范，用于直接 Vibe Coding。

---

## 0. 范围与假设

### 0.1 现状（MVP 已有）

- `users.credits` 存储余额（默认 3）。
- 搜索扣费：原子 `UPDATE users SET credits=credits-1 WHERE credits>=1`。
- 搜索失败自动退回 `1`。
- Stripe 入账：Webhook 给 `users.credits += credits` 并写 `transactions`。

### 0.2 本增量改变点

- 新增 **签到** 与 **邀请** 的奖励发放与归因。
- **不引入过期积分**，保持单余额模型。
- 仅新增奖励/归因相关表，不改动原有支付/搜索结构。

---

## 1. 产品规则（Business Rules）

### 1.1 每日签到

- 频率：**每个自然日 1 次**（建议按 UTC 计算）。
- 奖励：`+1` 永久积分。
- 幂等：同一天多次请求不重复加积分。

### 1.2 分享邀请

- 每个用户有一个**固定邀请链接**，可重复分享。
- 被邀请者通过链接进入并完成注册后，建立邀请关系。
- 奖励：邀请人获得 `+20` 永久积分。
- 幂等：同一被邀请者只能归因一次。
- 反作弊最低要求：
  - 禁止自邀（inviter == invitee）。
  - **仅新用户**可触发奖励（已有账号不发奖）。

> 是否给被邀请者奖励：当前 **不送**（需求未要求）。如需，复用同一发放流程扩展即可。

### 1.3 积分规则

- 全部积分永久有效（支付/签到/邀请）。
- 消费时只扣总余额，不需要优先级逻辑。

---

## 2. 数据库变更（Schema Change）

### 2.1 新表一览

| 表 | 用途 | 关键点 |
| --- | --- | --- |
| `user_checkins` | 记录每日签到 | `(user_id, checkin_day)` 唯一 |
| `referral_codes` | 邀请码（每用户 1 个） | `code` 唯一 |
| `referrals` | 邀请关系与发奖记录 | `invitee_user_id` 唯一 |

### 2.2 `user_checkins`

用途：确保“每天一次” + 可查询签到历史。

字段建议：

- `id` UUID PK
- `user_id` UUID FK → `users.id`
- `checkin_day` DATE NOT NULL（按 UTC 计算）
- `reward_credits` INT NOT NULL DEFAULT 1
- `created_at` TIMESTAMP NOT NULL DEFAULT now()

约束与索引：

- `UNIQUE(user_id, checkin_day)`
- `INDEX user_checkins_user_created (user_id, created_at desc)`

### 2.3 `referral_codes`

用途：用户固定邀请码（生成一次，可长期复用）。

字段建议：

- `id` UUID PK
- `user_id` UUID FK → `users.id`
- `code` TEXT NOT NULL UNIQUE（建议 8-12 位 base32/base62）
- `is_active` BOOLEAN NOT NULL DEFAULT true（可选）
- `created_at` TIMESTAMP NOT NULL DEFAULT now()
- `updated_at` TIMESTAMP NOT NULL DEFAULT now()

约束：

- `UNIQUE(user_id)`

### 2.4 `referrals`

用途：邀请归因 + 发奖记录。

字段建议：

- `id` UUID PK
- `inviter_user_id` UUID FK → `users.id`
- `invitee_user_id` UUID FK → `users.id`
- `referral_code_id` UUID FK → `referral_codes.id`
- `reward_credits` INT NOT NULL DEFAULT 20
- `reward_granted_at` TIMESTAMP NULL
- `created_at` TIMESTAMP NOT NULL DEFAULT now()

约束与索引：

- `UNIQUE(invitee_user_id)`（一个被邀请者只能归因一次）
- `INDEX referrals_inviter_created (inviter_user_id, created_at desc)`

---

## 3. 后端设计（Backend）

### 3.1 推荐服务层拆分

建议新增：

- `src/libs/RewardsService.ts`
  - `checkIn(userId, checkinDay)`
  - `getCheckInStatus(userId, checkinDay)`
  - `getOrCreateReferralCode(userId)`
  - `claimReferral(inviteeUserId, code)`

> 所有积分变更统一写在服务层，避免分散在路由里重复发奖。

### 3.2 API 契约

#### 3.2.1 `POST /api/rewards/checkin`

用途：用户点击签到。

响应（建议）：

```json
{
  "ok": true,
  "checkedIn": true,
  "alreadyCheckedIn": false,
  "reward": { "amount": 1, "type": "permanent" },
  "credits": 12
}
```

事务逻辑：

1. 计算 `checkin_day`（UTC）。
2. `INSERT user_checkins ... ON CONFLICT DO NOTHING RETURNING id`。
3. 若插入成功：`UPDATE users SET credits=credits+1`。
4. 返回最新 `credits`。

#### 3.2.2 `GET /api/rewards/checkin/status`

用途：页面加载显示“今日是否已签到”。

响应（建议）：

```json
{
  "ok": true,
  "checkedInToday": false,
  "checkinDay": "2026-01-01",
  "nextResetAt": "2026-01-02T00:00:00.000Z"
}
```

#### 3.2.3 `GET /api/rewards/invite`

用途：获取邀请码/邀请链接/统计。

响应（建议）：

```json
{
  "ok": true,
  "code": "AB12CD34",
  "inviteUrl": "https://your-domain.com/invite/AB12CD34",
  "stats": {
    "invitedUsers": 3,
    "creditsEarned": 60
  },
  "recent": [
    { "inviteeUserId": "uuid", "inviteeEmailMasked": "a***@b.com", "createdAt": "..." }
  ]
}
```

实现要点：

- `getOrCreateReferralCode(userId)`：无则创建。
- `inviteUrl` 使用 `getBaseUrl()`（`NEXT_PUBLIC_APP_URL` 优先）。
- `creditsEarned` 可用 `SUM(referrals.reward_credits)`。

#### 3.2.4 `POST /api/rewards/referrals/claim`

用途：被邀请者登录后认领邀请码（建立归因并给邀请人发奖）。

请求（两种方式任选）：

1) 从 cookie 读取 `referral_code`（推荐），无需 body  
2) body 传：

```json
{ "code": "AB12CD34" }
```

响应（建议）：

```json
{
  "ok": true,
  "claimed": true,
  "alreadyClaimed": false,
  "inviterUserId": "uuid",
  "rewardGranted": { "amount": 20, "type": "permanent" }
}
```

事务逻辑：

1. 根据 `code` 找到 `inviter_user_id`。
2. 禁止自邀（inviter == invitee）。
3. **只允许新用户**：
   - 推荐做法：在用户首次创建后立即调用 claim（从 cookie 读取），并在服务层判断 `created_at` 是否在可接受窗口内（例如 24h 内）。
4. `INSERT INTO referrals ...`（`invitee_user_id` 唯一保证幂等）。
5. 插入成功则 `UPDATE users SET credits=credits+20`，并写 `reward_granted_at=now()`。
6. 清理 cookie（若使用 cookie 方案）。

#### 3.2.5 `GET /invite/[code]`

用途：邀请链接落地。

行为：

- 设置 `referral_code=<code>` cookie（HttpOnly, SameSite=Lax, Max-Age=30d）。
- 重定向到 `/sign-up`（或 `/`）。

SEO：建议 `noindex`，避免索引大量邀请页。

---

## 4. 消费逻辑（Consumption Logic，简化版）

由于所有积分永久，扣费逻辑为单余额模型：

### 4.1 扣费

- 使用原子更新：

```
UPDATE users
SET credits = credits - 1
WHERE id = $userId AND credits >= 1
RETURNING credits;
```

- 若无返回行 → 余额不足，返回 `402`。

### 4.2 失败补偿

搜索失败时：

```
UPDATE users
SET credits = credits + 1
WHERE id = $userId;
```

建议保留 `search_logs` 写入 `provider_status='failed'` 作为审计。

---

## 5. 前端与页面设计（Frontend / Pages）

### 5.1 放置策略

- `/account` 页面新增 **Rewards** 区块（签到 + 邀请）。
- 新增 `/invite/[code]` 跳转页。

### 5.2 `/account` 信息架构（建议）

在现有页面基础上新增：

1) **Credits 卡片（文案更新）**

- 文案：`Credits never expire — includes check-in and invite rewards.`

2) **Rewards 区块（两列卡片）**

- 左：Daily Check-in
- 右：Invite Friends

### 5.3 组件规范（Component Spec）

#### 5.3.1 `DailyCheckInCard`

用途：签到按钮 + 今日状态。

依赖数据：

- `checkedInToday: boolean`
- `nextResetAt: string`

状态机：

1. loading：按钮 disabled，`Loading...`
2. canCheckIn：主 CTA `Check in (+1 permanent credit)`
3. alreadyCheckedIn：按钮 disabled，`Checked in today`
4. error：toast + 可重试

行为：

- **仅用户点击后触发**（禁止自动签到）
- 点击调用 `POST /api/rewards/checkin`
- 成功 toast：`Checked in! +1 credit`
- 成功后展示轻量动画（如 `+1 credit` badge 弹跳/闪烁 1–2 秒）
- 成功后刷新 `credits`

#### 5.3.2 `InviteFriendsCard`

用途：展示邀请链接、复制按钮、统计与最近邀请。

依赖数据：

- `inviteUrl`
- `stats`
- `recent[]`（可选）

交互：

- Copy 成功 toast：`Link copied`
- 说明文案：
  - `Earn 20 permanent credits for each new user who signs up with your link.`

### 5.4 余额不足引导（Search Low Balance）

触发：搜索接口返回 `402` 时，前端弹出 `LowBalanceDialog`。

要求：

- **首要引导**：提醒可通过“签到 + 分享邀请”获取免费积分。
- **备选引导**：提供充值入口（/pricing）。

LowBalanceDialog 行为：

- **Check-in CTA**：
  - **仅用户点击后触发**（禁止自动签到）
  - 点击调用 `POST /api/rewards/checkin`
  - 成功提示 `Checked in! +1 credit`，并给出轻量动画（如 `+1` pill 弹跳/闪烁）
  - 若已签到：显示 `Checked in today`
  - 成功后刷新 `credits`
- **Invite CTA**：
  - 打开弹窗时调用 `GET /api/rewards/invite` 预取 `inviteUrl`
  - 点击 `Copy invite link` 复制链接（失败 toast）
- **Pricing CTA**：
  - 文本或按钮链接到 `/pricing`

文案建议：

- 标题：`You are out of credits`
- 描述：`Get free credits by checking in daily or inviting friends. Paid credits are available anytime.`

Search 页面补充提示：

- 当 `credits == 0` 时，在上传卡片内展示提示条（不阻断页面）：
  - `You are out of credits. Get free credits by checking in daily or inviting friends, or buy credits anytime.`
  - CTA：`Get free credits`（打开 LowBalanceDialog）、`Buy credits`（/pricing）
- 用户尝试上传图片或点击 URL 搜索时，若积分为 0，**直接弹出 LowBalanceDialog**。
- 签到后的成功动画应保持简短（1–2 秒），避免打断继续搜索。

---

## 6. 风控与运营（MVP 最低）

### 6.1 签到防刷

- DB 唯一约束 `(user_id, checkin_day)`。
- 可选：Arcjet 限速。

### 6.2 邀请防刷

- 自邀禁止。
- 仅新用户触发奖励（通过 `created_at` 窗口限制或首次创建后立即 claim）。
- 可选：要求被邀请者完成 1 次搜索后再发奖（延迟发奖）。

---

## 7. 验收标准（Acceptance Criteria）

### 7.1 签到

- 未登录调用签到接口返回 `401`。
- 同日首次签到：
  - `checkedIn=true`，`credits +1`。
- 同日重复签到：
  - 不重复加积分。

### 7.2 邀请

- 用户可获取固定邀请码与 `inviteUrl`。
- invitee 注册并 claim 后：
  - 建立 `referrals` 记录
  - inviter `credits +20`
- 同一 invitee 重复 claim：
  - 不重复发奖（幂等）。
- 自邀：
  - 不发奖。

### 7.3 扣费与退款

- 扣费使用原子更新，余额不足返回 `402`。
- 搜索失败自动退回 `1`。

---

## 8. Vibe Coding 实施顺序（Checklist）

1) **DB**
   - 在 `src/models/Schema.ts` 增加 `user_checkins` / `referral_codes` / `referrals`
   - `npm run db:generate` 生成 migration
2) **RewardsService**
   - `checkIn / getStatus / getOrCreateReferralCode / claimReferral`
3) **API 路由**
   - `/api/rewards/checkin`
   - `/api/rewards/checkin/status`
   - `/api/rewards/invite`
   - `/api/rewards/referrals/claim`
4) **页面与组件**
   - `/account` 增加 Rewards 区块
   - `/invite/[code]` 设置 cookie + redirect
5) **验收**
   - 签到幂等、邀请幂等、自邀拦截、扣费/退款流程
