# 📋 维护指南 · Digital Cemetery

> 最后更新：2026-06-09
> 项目地址：https://github.com/sky-yangf/game-cemetery
> 线上地址：https://game-cemetery.vercel.app

---

## 项目结构

```
game_cemetery/
├── backend/                # FastAPI 后端
│   ├── main.py             # 应用入口
│   ├── database.py         # 数据库连接（支持 SQLite/Turso）
│   ├── models.py           # SQLAlchemy 模型
│   ├── schemas.py          # Pydantic 验证
│   ├── routers/            # API 路由（games/candles/played/comments）
│   ├── data/cemetery.db    # **真理之源**：SQLite 数据库
│   └── requirements.txt    # Python 依赖
├── src/                    # React 前端
│   ├── components/         # UI 组件（GameCard/GameDialog/Comments...）
│   ├── hooks/              # React Hooks（useApiData/useGameFilter...）
│   ├── lib/api.ts          # API 客户端
│   ├── types/game.ts       # TypeScript 类型
│   └── data/games.ts       # 前端 fallback 数据（API 失败时用）
├── public/game-icons/      # 游戏图标（92 个 .jpg/.png/.webp）
├── scripts/                # 爬取工具
│   ├── scrape_games.py     # 爬取停服游戏数据
│   └── update_icons.py     # 从萌娘百科下载图标
├── data/                   # 爬取原始数据
├── __old_backup/           # 旧版 HTML 项目（已归档）
├── migrate_to_turso.py     # 本地→Turso 迁移脚本
├── render.yaml             # Render 部署配置
├── vercel.json             # Vercel 部署配置
├── README.md               # 完整部署文档
├── README-latest.md        # 跟随 main 的快速指南
└── MAINTENANCE.md          # 本文档
```

---

## 日常操作

### 1. 新增游戏（批量）

修改 `backend/data/cemetery.db`，然后 commit + push：

```bash
# 用任意 SQLite 工具编辑（DB Browser / sqlite3 CLI / Python）
sqlite3 backend/data/cemetery.db

# 插入新游戏（示例）
INSERT INTO games (id, icon, name, publisher, type, release, death, reason, reason_emoji, epitaph)
VALUES ('xxx-uuid', '🎮', '游戏名', '发行商', '手游', '2018-01', '2024-12', '运营停滞', '💔', '墓志铭...');

# 退出
.quit

# 提交
git add backend/data/cemetery.db
git commit -m "add: 新游戏名"
git push origin main
```

Render 自动部署 → Vercel 刷新 → 线上可见。

### 2. 更新现有游戏

```bash
# 改错字、补数据
sqlite3 backend/data/cemetery.db "UPDATE games SET epitaph='新墓志铭' WHERE name='游戏名';"
git add backend/data/cemetery.db
git commit -m "fix: 修正 游戏名 墓志铭"
git push origin main
```

### 3. 前端提交讣告（零代码）

打开 https://game-cemetery.vercel.app → 右上角 **「+ 提交讣告」** 填表。
> ⚠️ 注意：用户前端提交的数据写入 Turso（如果已接），否则仅存临时 DB。

### 4. 添加图标

```bash
# 已下载的图标放到 public/game-icons/ 目录
# 命名规则：游戏原名 + 扩展名（如 七雄争霸.jpg）

# 更新 DB 中的 icon 字段
sqlite3 backend/data/cemetery.db "UPDATE games SET icon='/game-icons/游戏名.jpg' WHERE name='游戏名';"

# 提交
git add public/game-icons/游戏名.jpg backend/data/cemetery.db
git commit -m "icon: 游戏名"
git push origin main
```

> 图标推荐来源：TapTap（格式 `https://img-tc.tapimg.com/.../xxx.png/_tap_appicon.jpg`）

---

## 部署流程

```
本地改 DB → git add + commit → git push origin main
                                    ↓
                 Render 自动部署（3min）→ 后端更新
              Vercel 无需重部署（静态资源不变）
```

### 强制重新部署

```bash
git commit --allow-empty -m "chore: force redeploy"
git push origin main
```

### 查看部署日志

- **Render**：https://dashboard.render.com → 服务 → Logs
- **Vercel**：https://vercel.com → 项目 → Deployments

---

## 数据库管理

### 备份

```bash
# 本地
cp backend/data/cemetery.db backups/cemetery-$(date +%F).db

# 线上（Turso 如果已接）
# Turso 自动备份，无需手动
```

### 导出当前线上数据

```bash
curl -s https://game-cemetery.onrender.com/api/games > /tmp/online_games.json
python -c "
import json
with open('/tmp/online_games.json') as f:
    data = json.load(f)
print(f'{len(data)} 款游戏')
"
```

### 迁移本地 → Turso（如重新初始化）

```bash
python migrate_to_turso.py
```
> 运行前确保 Turso Token 正确写入脚本第 15 行。

---

## 技术栈版本

| 组件 | 版本 | 备注 |
|---|---|---|
| React | 19.x | |
| Vite | 7.x | |
| TypeScript | 5.x | |
| Tailwind CSS | 4.x | |
| shadcn/ui | latest | |
| FastAPI | 0.115 | |
| SQLAlchemy | 2.0 | |
| Python | 3.11 | 本地 conda knowbase 环境 |
| Node | latest LTS | |

---

## 常见问题

### Q: 线上数据跟本地不一致？
A: 线上 Render 从 GitHub 读 DB → 确认 `git push` 了最新 `backend/data/cemetery.db`。

### Q: Vercel 页面显示"0 座墓碑"？
A: Render 可能冷启动中（30-60s）→ 等一会刷新。或者 Render 挂了 → 检查 Render Logs。

### Q: CORS 报错？
A: Render 环境变量 `ALLOWED_ORIGINS` 没包含 Vercel 域名。去 Render Dashboard → Environment 改。

### Q: 图标显示不出来？
A: 检查 `public/game-icons/` 是否有对应文件 → 检查 DB 中 `icon` 字段是否为 `/game-icons/xxx.jpg` 格式 → commit + push。

### Q: Turso 连接失败？
A: Token 可能过期 → 去 https://turso.tech 重新生成 → 更新 Render `DATABASE_AUTH_TOKEN` 环境变量。

### Q: 想加新功能/改 UI？
A: 本地改 `src/` 代码 → `npm run dev` 测试 → commit + push → Vercel 自动部署前端。

---

## 记录

| 日期 | 变更 |
|---|---|
| 2026-06-09 | 初始部署：Vercel + Render + Turso |
| 2026-06-09 | 126 款游戏 + 92 个真实图标 + 完整墓志铭 |
| 2026-06-09 | Turso 持久化（Render 重启不丢数据） |
