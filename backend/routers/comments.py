from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database import get_db, IS_TURSO
from models import Game, Comment as CommentModel
from schemas import CommentCreate, CommentOut
from routers import ADMIN_USERS
import uuid

router = APIRouter(prefix="/api/games/{game_id}/comments", tags=["comments"])
ADMIN = ADMIN_USERS


def require_admin(user_id: str):
    if user_id not in ADMIN:
        raise HTTPException(403, "需要管理员权限")


def _row_to_comment(row: dict) -> dict:
    """Turso row → CommentOut 格式（key 重命名）"""
    return {
        "id": row.get("id"),
        "game_id": row.get("game_id"),
        "author": row.get("author"),
        "content": row.get("content"),
        "image": row.get("image"),
        "created_at": row.get("created_at"),
    }


# ── GET /api/games/{id}/comments ──────────────────────

@router.get("", response_model=list[CommentOut])
def list_comments(game_id: str, db = Depends(get_db)):
    escaped_game = game_id.replace(chr(39), chr(39) + chr(39))

    if IS_TURSO:
        rows = db.fetch_all(
            f"SELECT * FROM comments WHERE game_id = '{escaped_game}' "
            f"ORDER BY created_at DESC"
        )
        return [_row_to_comment(r) for r in rows]

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
    db = Depends(get_db),
):
    escaped_game = game_id.replace(chr(39), chr(39) + chr(39))
    new_id = str(uuid.uuid4())
    author = body.author.replace(chr(39), chr(39) + chr(39))
    content = body.content.replace(chr(39), chr(39) + chr(39))
    image = (body.image or "").replace(chr(39), chr(39) + chr(39)) if body.image else None
    img_sql = f"'{image}'" if image else "NULL"

    if IS_TURSO:
        db.execute(
            f"INSERT INTO comments (id, game_id, author, content, image) "
            f"VALUES ('{new_id}', '{escaped_game}', '{author}', '{content}', {img_sql})"
        )
        # INSERT 后重新读：Turso HTTP 不保证立刻可见，retry
        import time
        for _ in range(3):
            time.sleep(0.3)
            row = db.fetch_one(f"SELECT * FROM comments WHERE id = '{new_id}'")
            if row:
                return _row_to_comment(row)
        # fallback: 返回创建的数据
        return {
            "id": new_id, "game_id": game_id,
            "author": body.author, "content": body.content,
            "image": body.image, "created_at": "",
        }

    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(404, "墓碑不存在")
    comment = CommentModel(
        id=new_id, game_id=game_id, author=body.author,
        content=body.content, image=body.image,
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
    db = Depends(get_db),
):
    require_admin(x_user_id)
    escaped_game = game_id.replace(chr(39), chr(39) + chr(39))
    escaped_comment = comment_id.replace(chr(39), chr(39) + chr(39))

    if IS_TURSO:
        existing = db.fetch_one(
            f"SELECT * FROM comments WHERE id = '{escaped_comment}' "
            f"AND game_id = '{escaped_game}'"
        )
        if not existing:
            raise HTTPException(404, "留言不存在")
        db.execute(f"DELETE FROM comments WHERE id = '{escaped_comment}'")
        return {"ok": True}

    comment = db.query(CommentModel).filter(
        CommentModel.id == comment_id,
        CommentModel.game_id == game_id,
    ).first()
    if not comment:
        raise HTTPException(404, "留言不存在")
    db.delete(comment)
    db.commit()
    return {"ok": True}
