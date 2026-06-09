"""
蜡烛端点
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from app.database import get_db
from app.models import User, Game, Candle
from app.deps import get_current_user, get_optional_user, require_admin
from typing import Optional

router = APIRouter(prefix="/api/candles", tags=["candles"])


@router.get("/{game_id}")
async def candle_count(game_id: int, db: AsyncSession = Depends(get_db)):
    count = (await db.execute(
        select(func.count(Candle.id)).where(Candle.game_id == game_id)
    )).scalar() or 0
    return {"game_id": game_id, "count": count}


@router.post("/{game_id}")
async def light_candle(
    game_id: int,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user),
):
    """点蜡烛 — 支持匿名（user 为空时走匿名分支）"""
    import traceback
    try:
        # 检查游戏存在
        game = (await db.execute(select(Game).where(Game.id == game_id))).scalar_one_or_none()
        if not game:
            raise HTTPException(404, "墓碑不存在")
        candle = Candle(game_id=game_id, user_id=user.id if user else None)
        db.add(candle)
        await db.commit()
        count = (await db.execute(
            select(func.count(Candle.id)).where(Candle.game_id == game_id)
        )).scalar() or 0
        return {"game_id": game_id, "count": count, "message": "🕯️ 已点蜡烛"}
    except Exception as e:
        print(f"CANDLE ERROR: {traceback.format_exc()}")
        raise
