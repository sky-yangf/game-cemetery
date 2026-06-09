from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import games, candles, played, comments
import os

# 建表
Base.metadata.create_all(bind=engine)

app = FastAPI(title="数字墓园 API", version="1.0")

# CORS: 默认本地开发，部署时改 ALLOWED_ORIGINS 环境变量
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS if o.strip()],
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
