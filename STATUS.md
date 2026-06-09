#数字墓园 — 当前状态（2026-06-10 已修复 ✅）

## ✅ 已完成

|事项 |状态 |
|---|---|
| GitHub仓库 | https://github.com/sky-yangf/game-cemetery |
| Vercel 前端部署 | https://game-cemetery.vercel.app |
| Render 后端部署 | https://game-cemetery.onrender.com |
| Turso 数据持久化 | libsql://game-cemetery-sky-yangf.aws-ap-northeast-1.turso.io |
| 数据库迁移（126款游戏）| migrate_to_turso.py |
| 图标 |95/126真实图标，31款 emoji |
|蜡烛/已玩过/游戏列表 | ✅ 重启后持久化确认 |
| **留言 POST→GET持久化** | ✅ **2026-06-10验证通过** |
|冷启动不丢 | ✅验证通过 |
| CORS * | ✅ |
| Pydantic null兼容 | ✅ _extract 处理 `{"type":"null"}` |
|留言 schema | ✅ CommentOut created_at=str |

## ✅ 已修复 —留言不持久（根因确认）

**真凶链条**（已修）：
1. ensure_tables() 里 CREATE TABLE失败（comments缺 author 列 → `[Turso] SQL err: table comments has no column named author`）
2.临时加了 DROP TABLE IF EXISTS + CREATE，但 ensure_tables 在**每次 get_db() 都跑**
3. POST写入 → GET 请求重新 ensure_tables →删表 → 数据消失
4. **修复（876f3dd）**：DROP+CREATE移到 main.py startup 只跑一次，ensure_tables 不再删表

**验证证据**（2026-06-10真实 curl）：
- `POST /api/games/qqpet/comments`（带 `x-user-id` header）→ **HTTP201**，返回 id `91bb401f-...` / `af663ef9-...`
-立即 `GET /api/games/qqpet/comments` → **HTTP200**，列表含上述2 条
-跨 endpoint 调用 candle 后再 GET →留言仍在

**API关键发现**（之前 STATUS.md写错的）：
-真实路径：**`/api/games/{game_id}/comments`**（不是 `/qqpet/comments`）
- POST 必须带 header：**`x-user-id: <uuid-or-id>`**（否则422 missing）

## 📂关键文件

| 文件 |作用 |
|---|---|
| `backend/database.py` | TursoClient、ensure_tables、_extract |
| `backend/main.py` | CORS、startup 日志、一次性修表（876f3dd关键修复） |
| `backend/routers/comments.py` |留言 CRUD（INSERT+retry+fallback） |
| `backend/schemas.py` | CommentOut created_at=str |
| `backend/data/cemetery.db` | 本地 SQLite（126款 + 图标） |
| `migrate_to_turso.py` |推本地 DB → Turso |

## 🔑 环境变量（Render 配置）

| Key | Value |
|---|---|
| `DATABASE_URL` | `libsql://game-cemetery-sky-yangf.aws-ap-northeast-1.turso.io` |
| `DATABASE_AUTH_TOKEN` | （Turso 给的完整 Token，279字符） |
| `ALLOWED_ORIGINS` | 默认 `*`（可不设） |

## 🗑️ 待清理（上线测试垃圾）

Turso 现在有 smoke留言2 条，待清理：
```
DELETE FROM comments WHERE author = 'smoke-2026-06-10'
```
作者：af663ef9（中文）/91bb401f（英文）

清理方式（任选其一）：
- **A. Turso CLI**：`turso db shell game-cemetery-sky-yangf "DELETE FROM comments WHERE author = 'smoke-2026-06-10'"`
- **B.临时 endpoint**：本地启 backend，跑 cleanup脚本
- **C. 直接在 Turso Web Console** SQL 编辑器执行

## 🎯 下一步候选

1. **图标补全**：35款仍缺真图标（emoji 占位），可走 camofox + moegirl批量流
2. **前端 V0风格重做**：用 `V0_PROMPTS.md` 的 Bento+Vercel prompt（之前没拿到代码）
3. **清理 smoke 测试数据**（上面3 选项）
4. **整体验收**：前端能渲染留言吗？（Vercel部署的 static HTML 是否已修复 POST 调用路径）
