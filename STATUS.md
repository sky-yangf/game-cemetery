# 数字墓园 — 当前状态（2026-06-09 部署中）

## ✅ 已完成

| 事项 | 状态 |
|---|---|
| GitHub 仓库 | https://github.com/sky-yangf/game-cemetery |
| Vercel 前端部署 | https://game-cemetery.vercel.app |
| Render 后端部署 | https://game-cemetery.onrender.com |
| Turso 数据持久化 | libsql://game-cemetery-sky-yangf.aws-ap-northeast-1.turso.io |
| 数据库迁移（126 款游戏）| migrate_to_turso.py |
| 图标 | 95/126 真实图标，31 款 emoji |
| 蜡烛/已玩过/游戏列表 | ✅ 重启后持久化确认 |
| CORS * | ✅ |
| Pydantic null 兼容 | ✅ _extract 处理 {"type":"null"} |
| 留言 schema | ✅ CommentOut created_at=str |

## ❌ 未修复 — 留言不持久

**现象**：POST 成功（200）但 GET 返回 `[]`

**已定位的真凶链条**：
1. ensure_tables() 里 CREATE TABLE 失败（comments 缺 author 列 → `[Turso] SQL err: table comments has no column named author`）
2. 临时加了 DROP TABLE IF EXISTS + CREATE，但 ensure_tables 在**每次 get_db() 都跑**
3. POST 写入 → GET 请求重新 ensure_tables → 删表 → 数据消失
4. **最新修复（876f3dd）**：DROP+CREATE 移到 main.py startup 只跑一次，ensure_tables 不再删表
5. **待验证**：修复后 Render 是否拿到最新 commit → POST → GET → 评论持久化

## 📂 关键文件

| 文件 | 作用 |
|---|---|
| `backend/database.py` | TursoClient、ensure_tables、_extract |
| `backend/main.py` | CORS、startup 日志、一次性修表 |
| `backend/routers/comments.py` | 留言 CRUD（INSERT+retry+fallback） |
| `backend/schemas.py` | CommentOut created_at=str |
| `backend/data/cemetery.db` | 本地 SQLite（126 款 + 图标）|
| `migrate_to_turso.py` | 推本地 DB → Turso |

## 🔑 环境变量（Render 配置）

| Key | Value |
|---|---|
| `DATABASE_URL` | `libsql://game-cemetery-sky-yangf.aws-ap-northeast-1.turso.io` |
| `DATABASE_AUTH_TOKEN` | （Turso 给的完整 Token，279 字符）|
| `ALLOWED_ORIGINS` | 默认 `*`（可不设）|

## 🐛 明天继续步骤

1. Render Dashboard → 确认最新 commit = `876f3dd`，如果不是 → Manual Deploy
2. 看 Logs → 确认有 `[STARTUP] comments 表重建完成`
3. `curl -X POST .../qqpet/comments` → 200 → `curl GET .../qqpet/comments` → 不只是 `[]`
4. 验证冷启动不丢：Restart → GET → 评论还在

## 🗑️ 测试垃圾清理（完成后操作）

本地 DB 有测试数据，待上线后清理（DELETE FROM comments WHERE author IN ('test','debug','retry',...)
