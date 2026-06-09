from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, IS_TURSO, DB_URL, DB_TOKEN, _extract
from routers import games, candles, played, comments
import os
import time as _t
print(f"[BOOT] {os.getenv('RENDER_SERVICE_NAME','local')} pid={os.getpid()} t={int(_t.time())}", flush=True)

# 建表
if engine:
    Base.metadata.create_all(bind=engine)

app = FastAPI(title="数字墓园 API", version="1.0")

# 启动日志：方便定位 Turso 连接状态
@app.on_event("startup")
async def startup_log():
    print(f"[STARTUP] IS_TURSO={IS_TURSO}", flush=True)
    print(f"[STARTUP] DB_URL 前40字符={DB_URL[:40] if DB_URL else 'EMPTY'}", flush=True)
    print(f"[STARTUP] DB_TOKEN={'SET' if DB_TOKEN else 'MISSING'}", flush=True)
    # 一次性修表：DROP 旧 comments 表（缺 author 列）
    if IS_TURSO and DB_TOKEN:
        from database import get_db
        db = next(get_db())
        try:
            db.execute("DROP TABLE IF EXISTS comments")
            db.execute("""CREATE TABLE IF NOT EXISTS comments (
                id TEXT PRIMARY KEY, game_id TEXT NOT NULL,
                author TEXT, content TEXT NOT NULL,
                image TEXT, created_at TEXT DEFAULT (datetime('now'))
            )""")
            print("[STARTUP] comments 表重建完成", flush=True)
        except Exception as e:
            print(f"[STARTUP] comments 表处理失败: {e}", flush=True)

# CORS: 部署模式允许所有来源，本地开发只允许 localhost
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*")
origins = ALLOWED_ORIGINS.split(",") if ALLOWED_ORIGINS != "*" else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(games.router)
app.include_router(candles.router)
app.include_router(played.router)
app.include_router(comments.router)


@app.get("/")
def root():
    return {"name": "数字墓园 API", "version": "1.0", "status": "ok", "use_turso": IS_TURSO}


@app.get("/debug/tables")
def debug_tables():
    from database import get_db
    db = next(get_db())
    if IS_TURSO:
        rows = db.fetch_all("SELECT name, sql FROM sqlite_master WHERE type='table'")
        return [{"name": _extract(r.get("name")), "sql": _extract(r.get("sql"))} for r in rows]
    from models import Base
    return [t.name for t in Base.metadata.sorted_tables]


@app.options("/{rest_of_path:path}")
async def preflight_handler():
    return {"ok": True}
