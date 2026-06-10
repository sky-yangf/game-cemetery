#数字墓园 — 当前状态（2026-06-10留言 +性能修复）

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
| **留言 POST→GET持久化** | ✅修复（commit `dede099`）|
| **冷启动不丢** | ✅修复（commit `dede099`，startup 不再 DROP）|
| **TursoClient eager init** | ✅修复（commit `eddcf94`，避免 lazy-init 时序 bug）|
| **ensure_tables 只跑1 次** | ✅修复（commit `e1d33e7`）|
| **gameId切换立即清空留言** | ✅ 前端修复（commit `a906a31`）|
| CORS * | ✅ |
| Pydantic null兼容 | ✅ _extract 处理 `{"type":"null"}` |
|留言 schema | ✅ CommentOut created_at=str |

## 🎯性能改善记录（2026-06-10）

| 操作 |修复前 |修复后 |
|---|---|---|
| GET留言 |4-5 秒 | **2-3 秒** |
| POST留言 |3-5 秒 | **2-3 秒** |
| GET /api/games |2.8 秒 | **1.9 秒** |

**剩余延迟来源**：Render US ↔ Turso AWS ap-northeast-1跨太平洋网络往返（物理限制）
- 每个 GET留言 =2 次 Turso 查询（games存在性 + comments列表）=2 次往返
- 每个 GET列表 =1 次 Turso 查询

## 🔧性能优化路线（可选）

|方案 |预期收益 | 工作量 |
|---|---|---|
|移除 games存在性检查 | -1 次往返 (GET留言到 ~1s) |5 分钟 |
| 用 JOIN合并查询 | 同上 |10 分钟 |
| 前端加 loading spinner | UX改善 |5 分钟 |
| Turso region改 us-east | -50% 网络延迟 | Render Dashboard |

## 📂关键文件

| 文件 |作用 |
|---|---|
| `backend/database.py` | TursoClient eager init + ensure_tables_once + 单例 |
| `backend/main.py` | startup 调用 ensure_tables_once + ALTER 自检 |
| `backend/routers/comments.py` |留言 CRUD（list仍查 games存在性）|
| `backend/routers/games.py` | 游戏列表 CRUD |
| `src/hooks/useApiData.ts` | useComments gameId变化立即清空 |

## 🗑️ 待清理（上线测试垃圾）

Turso 现在有 smoke留言4 条，待清理：
```
DELETE FROM comments WHERE author LIKE 'smoke-%'
```

## ❌ 已废弃的修复路径

- ❌ commit `876f3dd`：移除了 ensure_tables 的 DROP 但忘了移除 ensure_tables本身
- ❌ commit `e1d33e7`：用 lazy-init (`_get_turso()`)，导致 startup 时序 bug
- ❌ commit `eddcf94`：改 eager init解决时序问题
