from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database import get_db
from models import Game, Comment as CommentModel
from schemas import CommentCreate, CommentOut
from routers import ADMIN_USERS
import uuid

router = APIRouter(prefix="/api/games/{game_id}/comments", tags=["comments"])

ADMIN = ADMIN_USERS


def require_admin(user_id: str):
    if user_id not in ADMIN:
        raise HTTPException(403, "需要管理员权限")


# ── GET /api/games/{id}/comments ──────────────────────

@router.get("", response_model=list[CommentOut])
def list_comments(game_id: str, db: Session = Depends(get_db)):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(404, "墓碑不存在")
    return (
        db.query(CommentModel)
        .filter(CommentModel.game_id == game_id)
        .order_by(CommentModel.created_at.desc())
        .all()
    )


# ── POST /api/games/{id}/comments ─────────────────────

@router.post("", response_model=CommentOut, status_code=201)
def create_comment(
    game_id: str,
    body: CommentCreate,
    x_user_id: str = Header(...),
    db: Session = Depends(get_db),
):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(404, "墓碑不存在")

    comment = CommentModel(
        id=str(uuid.uuid4()),
        game_id=game_id,
        author=body.author,
        content=body.content,
        image=body.image,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


# ── DELETE /api/comments/{id} ─────────────────────────

@router.delete("/{comment_id}")
def delete_comment(
    game_id: str,
    comment_id: str,
    x_user_id: str = Header(...),
    db: Session = Depends(get_db),
):
    require_admin(x_user_id)
    comment = db.query(CommentModel).filter(
        CommentModel.id == comment_id,
        CommentModel.game_id == game_id,
    ).first()
    if not comment:
        raise HTTPException(404, "留言不存在")
    db.delete(comment)
    db.commit()
    return {"ok": True}
