from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from database import get_db
from models import Game, Candle
from schemas import CandleOut

router = APIRouter(prefix="/api/games/{game_id}/candle", tags=["candles"])


@router.post("", response_model=CandleOut)
def add_candle(
    game_id: str,
    x_user_id: str = Header(...),
    db: Session = Depends(get_db),
):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(404, "墓碑不存在")

    # 防刷：同一用户 24h 内不能重复点
    cutoff = datetime.utcnow() - timedelta(hours=24)
    existing = db.query(Candle).filter(
        Candle.game_id == game_id,
        Candle.user_id == x_user_id,
        Candle.created_at > cutoff,
    ).first()
    if existing:
        raise HTTPException(400, "今天已经点过了")

    candle = Candle(game_id=game_id, user_id=x_user_id)
    game.candles += 1
    db.add(candle)
    db.commit()

    return CandleOut(game_id=game_id, total_candles=game.candles)
