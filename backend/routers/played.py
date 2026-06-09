from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database import get_db
from models import Game, Played
from schemas import PlayedOut

router = APIRouter(prefix="/api/games/{game_id}/played", tags=["played"])


@router.post("", response_model=PlayedOut)
def mark_played(
    game_id: str,
    x_user_id: str = Header(...),
    db: Session = Depends(get_db),
):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(404, "墓碑不存在")

    # 同一用户已标记过则忽略
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
