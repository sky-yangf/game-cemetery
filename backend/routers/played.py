from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database import get_db, IS_TURSO
from models import Game, Played
from schemas import PlayedOut

router = APIRouter(prefix="/api/games/{game_id}/played", tags=["played"])


@router.post("", response_model=PlayedOut)
def mark_played(
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
        existing = db.fetch_one(
            f"SELECT * FROM played WHERE game_id = '{escaped_game}' "
            f"AND user_id = '{escaped_user}' LIMIT 1"
        )
        if existing:
            return PlayedOut(game_id=game_id, played=True, already_marked=True)
        db.execute(f"INSERT INTO played (game_id, user_id) VALUES ('{escaped_game}', '{escaped_user}')")
        db.execute(f"UPDATE games SET played = played + 1 WHERE id = '{escaped_game}'")
        return PlayedOut(game_id=game_id, played=True, already_marked=False)

    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(404, "墓碑不存在")
    existing = db.query(Played).filter(
        Played.game_id == game_id,
        Played.user_id == x_user_id,
    ).first()
    if existing:
        return PlayedOut(game_id=game_id, played=True, already_marked=True)
    played = Played(game_id=game_id, user_id=x_user_id)
    game.played += 1
    db.add(played)
    db.commit()
    return PlayedOut(game_id=game_id, played=True, already_marked=False)
