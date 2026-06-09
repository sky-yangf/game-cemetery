"""
数字墓园 · 后端入口
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
from app.models import User, Game
from app.auth import hash_password
from app.config import ADMIN_EMAIL, ADMIN_PASSWORD, STATIC_GAMES_JSON
from app.endpoints import auth, games, comments, candles
from app.endpoints.games import _rebuild_static_json
from app.seed import seed
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import async_session
from sqlalchemy import select


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 建表
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # 创建管理员
    async with async_session() as db:
        admin = (await db.execute(select(User).where(User.email == ADMIN_EMAIL))).scalar_one_or_none()
        if not admin:
            db.add(User(email=ADMIN_EMAIL, password_hash=hash_password(ADMIN_PASSWORD),
                        name="管理员", role="admin"))
            await db.commit()
            print(f"✅ 管理员已创建：{ADMIN_EMAIL}")

        # 注入种子数据
        await seed(db)

        # 生成 games.json
        await _rebuild_static_json(db)
        print(f"✅ games.json 已生成（{STATIC_GAMES_JSON.stat().st_size} bytes）")

    yield


app = FastAPI(title="数字墓园", version="2.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# 静态文件
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# 路由
app.include_router(auth.router)
app.include_router(games.router)
app.include_router(comments.router)
app.include_router(candles.router)


@app.get("/api/ping")
async def ping():
    return {"message": "pong", "stage": "W2-1 done"}
