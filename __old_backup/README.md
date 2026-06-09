# 🪦 数字墓园

> 中国游戏公墓 — 纪念那些曾经鲜活、但已被遗忘的游戏

![墓园](https://img.shields.io/badge/status-MVP-green) ![Python](https://img.shields.io/badge/python-3.11+-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-teal)

## ✨ 功能

- 🪦 **50 款预置墓碑** — 中国游戏史上停运的经典（QQ堂/风暴英雄/QQ宠物/少前2...）
- 🎨 **3 种主题** — 暮色/暗夜/淡雅
- 🔍 **筛选** — 按厂商/停运年份/死因/搜索
- 🕯️ **点蜡烛** — 匿名可点
- 📝 **留言** — 注册用户留纪念
- ➕ **用户提交** — 新墓碑提交后管理员审核
- 🔐 **鉴权** — JWT + bcrypt
- 🛡️ **管理员面板** — 审核墓碑/留言/删除评论

## 🛠️ 技术栈

| 层 | 选型 |
|---|---|
| 前端 | 纯 HTML/CSS/JS（无框架）|
| 后端 | FastAPI + SQLAlchemy 2 (async) + SQLite |
| 鉴权 | JWT (python-jose) + bcrypt |
| 部署 | Cloudflare Pages + Railway |

## 🚀 本地启动

### 1. 后端
```bash
cd backend
pip install fastapi uvicorn sqlalchemy[asyncio] aiosqlite python-jose[cryptography] bcrypt python-multipart
python -m uvicorn app.main:app --host 0.0.0.0 --port 8002
```

### 2. 前端
```bash
# 另开一个终端
cd game_cemetery
python -m http.server 8765
```

打开 `http://127.0.0.1:8765/`

## 🔐 默认账号

| 角色 | 邮箱 | 密码 |
|---|---|---|
| 管理员 | `admin@cemetery.com` | `admin123` |
| 用户 | 注册即可 | 任意 |

**生产部署前改密码**！改 `backend/app/config.py` 里的 `ADMIN_PASSWORD`。

## 📡 API

### 公开
| Method | Path | 用途 |
|---|---|---|
| GET | `/api/games?offset=0&limit=50&publisher=腾讯&death_year=2024` | 列表 |
| GET | `/api/games/{id}` | 详情 |
| GET | `/api/comments/game/{id}` | 留言列表 |
| GET | `/api/candles/{id}` | 蜡烛数 |
| POST | `/api/candles/{id}` | 点蜡烛（匿名） |
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/login` | 登录 |

### 需登录
| POST | `/api/games` | 提交新墓碑 |
| POST | `/api/comments/game/{id}?content=...` | 留言 |

### 管理员
| PUT | `/api/games/{id}/approve?status=approved\|pending\|rejected` | 审核墓碑 |
| PUT | `/api/comments/{id}/approve?status=...` | 审核留言 |
| DELETE | `/api/comments/{id}` | 删除留言 |

## 🌐 部署

### 前端（Cloudflare Pages）
1. 登录 https://pages.cloudflare.com/
2. 上传 `game_cemetery/` 整个目录
3. 构建命令：**留空**（纯静态）
4. 输出目录：**`./`**
5. 完成后给你一个 `xxx.pages.dev` 域名

### 后端（Railway）
1. 登录 https://railway.app/
2. 新建项目 → Deploy from GitHub
3. 选择 `backend/` 目录
4. 启动命令：`uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. 拿到 `xxx.railway.app` 域名

### 修改前端 API 地址
部署前改 `src/main2.js` 第 7 行：
```js
const API = 'https://你的后端域名.railway.app/api';
```

## ✅ 测试

```bash
cd backend
python tests/test_e2e.py
# 应输出: 通过: 25/25 (100%)
```

## 📂 目录结构

```
game_cemetery/
├── index.html              # 入口
├── data/games.json         # 静态缓存（前 50 热门，由后端自动生成）
├── src/
│   ├── main2.js            # 主逻辑
│   ├── styles.css          # 通用样式
│   └── themes.css          # 3 种主题
└── backend/
    ├── app/
    │   ├── main.py         # 入口
    │   ├── config.py       # 配置（管理员密码在这里）
    │   ├── database.py     # SQLite 引擎
    │   ├── models.py       # 数据模型
    │   ├── auth.py         # JWT + bcrypt
    │   ├── deps.py         # 依赖注入
    │   ├── schemas.py      # Pydantic
    │   ├── seed.py         # 50 款种子数据
    │   └── endpoints/      # API 路由
    ├── tests/test_e2e.py   # 25 个端到端测试
    └── cemetery.db         # SQLite（运行后生成）
```

## 🎯 主题切换

右上角 3 个按钮：🌅 暮色 / 🌙 暗夜 / ☀️ 淡雅  
选择会存 `localStorage`，刷新保留。

## 📝 提交新墓碑

1. 右上角点「登录」→ 注册账号
2. 登录后点「+ 提交新墓碑」
3. 填表单（游戏名/厂商/日期/死因/墓志铭/评语）
4. 提交后状态为 `pending`，管理员审核通过后显示
5. 管理员登录后用 API：`PUT /api/games/{id}/approve?status=approved`

## 🪦 5 座预置墓碑（demo）

- 🪄 **QQ堂** (2004-2018) - 14年，被自家 QQ飞车+LOL+王者联手打死
- ⚔️ **风暴英雄** (2015-2018) - 暴雪最自豪的"我们终于有自己的DOTA"，3年后"不要了"
- 💃 **劲舞团** (2005-2015) - 非主流一代的青春
- 🔫 **少女前线2** (2024) - 二次元抽卡界的塌房代表作
- 🌙 **玄中记** (2022-2023) - 鹅厂猪厂难得合作，结果双方都不要这孩子

## 📜 License

MIT