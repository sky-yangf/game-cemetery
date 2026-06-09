from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, IS_TURSO, DB_URL, DB_TOKEN
from routers import games, candles, played, comments
import os

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
    return {"name": "数字墓园 API", "version": "1.0", "status": "ok"}
