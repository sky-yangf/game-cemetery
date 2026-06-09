"""
鉴权端点：注册 / 登录
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import User
from app.schemas import RegisterRequest, LoginRequest, AuthResponse
from app.auth import hash_password, verify_password, create_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register")
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = (await db.execute(select(User).where(User.email == body.email))).scalar_one_or_none()
    if existing:
        raise HTTPException(400, "邮箱已注册")
    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        name=body.name,
        role="user",
    )
    db.add(user)
    await db.commit()
    token = create_token(user.id, user.email, user.role)
    return AuthResponse(token=token, user={"id": user.id, "name": user.name, "role": user.role, "email": user.email})


@router.post("/login")
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = (await db.execute(select(User).where(User.email == body.email))).scalar_one_or_none()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(401, "邮箱或密码错误")
    token = create_token(user.id, user.email, user.role)
    return AuthResponse(token=token, user={"id": user.id, "name": user.name, "role": user.role, "email": user.email})
