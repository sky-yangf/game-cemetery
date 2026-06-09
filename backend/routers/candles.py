from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from database import get_db, IS_TURSO
from models import Game, Candle
from schemas import CandleOut

router = APIRouter(prefix="/api/games/{game_id}/candle", tags=["candles"])


@router.post("", response_model=CandleOut)
def add_candle(
    game_id: str,
    x_user_id: str = Header(...),
    db = Depends(get_db),
):
    escaped_game = game_id.replace(chr(39), chr(39) + chr(39))
    escaped_user = x_user_id.replace(chr(39), chr(39) + chr(39))

    if IS_TURSO:
        game = db.fetch_one(f"SELECT * FROM games WHERE id = '{escaped_game}'")
        if not game:
            raise HTTPException(404, "墓碑不存在")
        # 防刷：24h 内（改为静默返回 200，不抛 400）
        cutoff = (datetime.utcnow() - timedelta(hours=24)).isoformat()
        existing = db.fetch_one(
            f"SELECT * FROM candles WHERE game_id = '{escaped_game}' "
            f"AND user_id = '{escaped_user}' AND created_at > '{cutoff}' LIMIT 1"
        )
        if existing:
            # 已点过 - 不抛错，静默返回当前数
            return CandleOut(game_id=game_id, total_candles=int(game.get("candles", 0)))
        db.execute(f"INSERT INTO candles (game_id, user_id) VALUES ('{escaped_game}', '{escaped_user}')")
        db.execute(f"UPDATE games SET candles = candles + 1 WHERE id = '{escaped_game}'")
        game = db.fetch_one(f"SELECT candles FROM games WHERE id = '{escaped_game}'")
        return CandleOut(game_id=game_id, total_candles=int(game.get("candles", 0)) if game else 0)

    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(404, "墓碑不存在")
    cutoff = datetime.utcnow() - timedelta(hours=24)
    existing = db.query(Candle).filter(
        Candle.game_id == game_id,
        Candle.user_id == x_user_id,
        Candle.created_at > cutoff,
    ).first()
    if existing:
        # 本地模式也静默返回 200
        return CandleOut(game_id=game_id, total_candles=game.candles)
    candle = Candle(game_id=game_id, user_id=x_user_id)
    game.candles += 1
    db.add(candle)
    db.commit()
    return CandleOut(game_id=game_id, total_candles=game.candles)
