"""
留言端点
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import Comment, Game, User
from app.schemas import CommentCreate, CommentResponse
from app.deps import get_current_user, require_admin
from app.config import UPLOAD_DIR

router = APIRouter(prefix="/api/comments", tags=["comments"])
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.get("/game/{game_id}")
async def list_comments(
    game_id: int,
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    q = (
        select(Comment, User.name)
        .join(User, Comment.user_id == User.id)
        .where(Comment.game_id == game_id, Comment.status == "approved")
        .order_by(Comment.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    rows = (await db.execute(q)).all()
    return [
        {
            "id": c.id,
            "game_id": c.game_id,
            "user_name": user_name,
            "content": c.content,
            "image_url": c.image_url,
            "created_at": str(c.created_at),
        }
        for c, user_name in rows
    ]


@router.post("/game/{game_id}")
async def create_comment(
    game_id: int,
    content: str = Query(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    comment = Comment(game_id=game_id, user_id=user.id, content=content, status="approved")
    db.add(comment)
    await db.commit()
    return {"message": "留言成功"}


@router.put("/{comment_id}/approve")
async def approve_comment(
    comment_id: int,
    status: str = Query(...),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin),
):
    comment = (await db.execute(select(Comment).where(Comment.id == comment_id))).scalar_one_or_none()
    if not comment:
        raise HTTPException(404, "留言不存在")
    comment.status = status
    await db.commit()
    return {"message": f"审核完成：{status}"}


@router.delete("/{comment_id}")
async def delete_comment(
    comment_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin),
):
    comment = (await db.execute(select(Comment).where(Comment.id == comment_id))).scalar_one_or_none()
    if not comment:
        raise HTTPException(404, "留言不存在")
    comment.status = "deleted"
    await db.commit()
    return {"message": "已删除"}
