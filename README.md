# 数字墓园 · Digital Cemetery

> 已停服游戏名录 - 黑白讣告风 - 玩家最后的手写信

一个收集国内已停服游戏的纪念项目。玩家可浏览、立碑、点蜡烛、写评论。

## 架构

- **前端**: Vite + React 19 + TypeScript + Tailwind + shadcn/ui
- **后端**: FastAPI + SQLAlchemy + SQLite (本地) / Turso (部署)
- **数据**: 126 款已停服游戏 + 97 个真实游戏图标

## 本地开发

```bash
# 后端 (端口 8002)
cd backend
/f/aconda/envs/knowbase/python.exe -m uvicorn main:app --host 0.0.0.0 --port 8002

# 前端 (端口 5173)
npm install
npm run dev
```

访问 `http://localhost:5173/`

## 部署到生产环境（零费用）

### 架构

```
浏览器 → Vercel (前端) → CORS → Render (FastAPI) → Turso (SQLite 持久化)
```

### 步骤 1: 推送到 GitHub

```bash
git init
git add .
git commit -m "init"
# 在 GitHub 创建空仓库 YOUR_USER/game-cemetery，然后：
git remote add origin https://github.com/YOUR_USER/game-cemetery.git
git branch -M main
git push -u origin main
```

### 步骤 2: 部署后端到 Render

1. 访问 https://render.com → 用 GitHub 登录
2. **New** → **Web Service** → 选你的 repo
3. Render 会自动识别 `render.yaml` 配置
4. **关键设置**（在 Environment 标签页）：
   - `ALLOWED_ORIGINS` = `https://YOUR_VERCEL_DOMAIN.vercel.app`
   - `DATABASE_URL` 和 `DATABASE_AUTH_TOKEN`（如使用 Turso）
5. 拿到 Render 域名：`https://game-cemetery-api.onrender.com`

### 步骤 3: 配置 Turso 持久化（推荐）

Render Free 重启会**清空 SQLite**，必须外接持久化数据库：

```bash
# 注册 Turso (https://turso.tech)，GitHub 一键登录
turso db create game-cemetery
turso db tokens create game-cemetery
# 复制 DATABASE_URL 和 token

# 迁移本地数据到 Turso（一次性）
sqlite3 backend/data/cemetery.db .dump > dump.sql
turso db shell game-cemetery < dump.sql
```

在 Render Environment 设置：
- `DATABASE_URL` = `libsql://your-db.turso.io`
- `DATABASE_AUTH_TOKEN` = `your-token`

**不接 Turso 也行**——数据每次重启会丢，但代码可跑。

### 步骤 4: 部署前端到 Vercel

1. 访问 https://vercel.com → GitHub 登录
2. **New Project** → 选同一仓库
3. Vercel 自动识别 `vercel.json` 配置
4. **关键设置**（Environment Variables）：
   - `VITE_API_BASE_URL` = `https://game-cemetery-api.onrender.com`
5. 点 **Deploy** → 1-2 分钟拿到域名

### 步骤 5: 验证

访问 `https://YOUR_VERCEL_DOMAIN.vercel.app`：
- 首次打开列表可能**冷启动 30-60s**（Render Free 特性）
- 闲置 15 分钟后会再触发冷启动
- 前端 loading 提示已加，8 秒后显示「后端服务在冷启动中」

## 数据库 schema

```sql
games (id, icon, name, publisher, type, release, death, reason, reason_emoji,
       lifespan, epitaph, comment, candles, played, is_user_submitted, submitted_by,
       submitted_at, updated_by, updated_at)

candles (id, game_id, user_id, created_at)  -- 用户点蜡
played  (id, game_id, user_id, created_at)  -- 用户标记"我玩过"
comments (id, game_id, user_id, content, image_url, created_at)  -- 留言
```

## API

- `GET /api/games` - 列表（支持 `?limit=20&q=关键词&types=手游&year_from=2020`）
- `GET /api/games/{id}` - 详情
- `POST /api/games` - 新建（需 user header）
- `PATCH /api/games/{id}` - 更新
- `DELETE /api/games/{id}` - 删除
- `POST /api/games/{id}/candle` - 点蜡烛
- `POST /api/games/{id}/played` - 标记玩过
- `GET/POST/DELETE /api/games/{id}/comments` - 留言 CRUD

完整 Swagger: `https://game-cemetery-api.onrender.com/docs`

## 费用清单

| 服务 | 费用 | 限制 |
|---|---|---|
| Vercel | ¥0 | 100GB 流量/月 |
| Render Free | ¥0 | 750h/月，闲置 15min 冷启动 |
| Turso Free | ¥0 | 5GB + 10亿 reads/月 |
| GitHub | ¥0 | 公开 repo 无限 |
| **合计** | **¥0** | — |

## License

MIT
