# 部署指南 · Latest（跟随 main 分支）

> ⚠️ 本文档**不锁版本**——所有命令跟着代码 main 分支走。如果跟 README.md 冲突，**以本文件为准**。

## 一句话部署

```bash
git push origin main  # → Render + Vercel 自动部署
```

## 当前生产环境

| 资源 | URL / 位置 | 备注 |
|---|---|---|
| 前端 | `https://game-cemetery.vercel.app` | Vercel 自动部署 |
| 后端 | `https://game-cemetery-api.onrender.com` | Render Free Web Service |
| DB | Turso `libsql://game-cemetery.turso.io` | 5GB 免费 |
| Repo | `https://github.com/YOUR_USER/game-cemetery` | public |

## 快速操作

### 看后端日志
```bash
# 在 Render Dashboard
https://dashboard.render.com/web/YOUR_SERVICE_ID → Logs
```

### 手动触发部署
```bash
git commit --allow-empty -m "chore: trigger redeploy"
git push origin main
```

### 数据库操作
```bash
# 备份
turso db shell game-cemetery ".dump" > backup-$(date +%F).sql

# 看用量
turso db show game-cemetery
```

### 加新游戏（不用部署）
- 登录前端 → 主页右上角「+ 提交讣告」→ 填表提交
- 或直接：`curl -X POST https://game-cemetery-api.onrender.com/api/games -H "Content-Type: application/json" -d '{...}'`

## Render 冷启动应对

- **第一次访问或闲置 15min 后**：30-60 秒冷启动
- **前端兜底**：8 秒后显示「后端服务在冷启动中」提示
- **避免冷启动**：把 Render 升级到 $7/月 Starter（不推荐——这是 0 费用方案）

## 故障排查

| 现象 | 原因 | 修法 |
|---|---|---|
| 列表加载 60s 后空白 | Render 冷启动失败 | 检查 Render 日志 |
| CORS 报错 | `ALLOWED_ORIGINS` 没设 | Render 环境变量加上 Vercel 域名 |
| 蜡烛点不动 | DB 连接失败 | 检查 Turso token 是否过期 |
| Vercel 404 | 路由 SPA 没 fallback | 确认 `vercel.json` 有 `rewrites` |

## 升级路径（如有需要）

- **数据量 > 5GB**：Turso $5/月 100GB
- **不想冷启动**：Render Starter $7/月
- **后端上 Cloudflare Workers**：免费但要重构

## 变更记录

最近更新：2026-06-09
- Render Free 部署 + Turso 持久化
- 前端 Vercel 部署 + 冷启动提示
- CORS 收窄到生产域名
