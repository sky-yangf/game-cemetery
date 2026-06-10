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
    #启动自检：仅确保表结构存在，**不 DROP 不清数据**
    if IS_TURSO and DB_TOKEN:
        from database import ensure_tables_once, get_db
        ensure_tables_once()
        db = next(get_db())
        try:
            info = db.execute("PRAGMA table_info(comments)") or []
            cols = [r.get("name") for r in info] if isinstance(info, list) else []
            if cols and "author" not in cols:
                db.execute("ALTER TABLE comments ADD COLUMN author TEXT")
                print("[STARTUP] comments.author 列已补齐", flush=True)
            else:
                print(f"[STARTUP] comments 表健康（列={cols}）", flush=True)
        except Exception as e:
            print(f"[STARTUP] comments 表自检失败: {e}", flush=True)

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
