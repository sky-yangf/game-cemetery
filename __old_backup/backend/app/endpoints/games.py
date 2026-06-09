"""
游戏墓碑端点
"""
import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models import Game, Candle, Comment, User
from app.schemas import GameCreate, GameResponse
from app.deps import get_current_user, require_admin
from app.config import STATIC_GAMES_JSON

router = APIRouter(prefix="/api/games", tags=["games"])


async def _game_to_response(game: Game, db: AsyncSession) -> dict:
    """把 ORM 对象转成 dict，附蜡烛数"""
    candle_count = (await db.execute(
        select(func.count(Candle.id)).where(Candle.game_id == game.id)
    )).scalar() or 0
    return {
        "id": game.id,
        "name": game.name,
        "icon": game.icon,
        "publisher": game.publisher,
        "game_type": game.game_type,
        "release_date": game.release_date,
        "death_date": game.death_date,
        "death_reason": game.death_reason,
        "death_reason_emoji": game.death_reason_emoji,
        "lifespan": game.lifespan,
        "platform": game.platform,
        "epitaph": game.epitaph,
        "comment": game.comment,
        "status": game.status,
        "candle_count": candle_count,
        "created_at": str(game.created_at),
    }


@router.get("")
async def list_games(
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    publisher: str = Query(None),
    death_year: str = Query(None),
    death_reason: str = Query(None),
    sort: str = Query("candles"),
    db: AsyncSession = Depends(get_db),
):
    q = select(Game).where(Game.status == "approved")

    if publisher:
        q = q.where(Game.publisher == publisher)
    if death_year:
        q = q.where(Game.death_date.like(f"{death_year}%"))
    if death_reason:
        q = q.where(Game.death_reason == death_reason)

    # 排序
    if sort == "candles":
        sub = select(func.count(Candle.id)).where(Candle.game_id == Game.id).scalar_subquery()
        q = q.order_by(sub.desc())
    elif sort == "death_date":
        q = q.order_by(Game.death_date.desc())
    else:
        q = q.order_by(Game.created_at.desc())

    q = q.offset(offset).limit(limit)
    games = (await db.execute(q)).scalars().all()
    return [await _game_to_response(g, db) for g in games]


@router.get("/{game_id}")
async def get_game(game_id: int, db: AsyncSession = Depends(get_db)):
    game = (await db.execute(select(Game).where(Game.id == game_id, Game.status == "approved"))).scalar_one_or_none()
    if not game:
        raise HTTPException(404, "墓碑不存在")
    return await _game_to_response(game, db)


@router.post("")
async def create_game(body: GameCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    game = Game(
        name=body.name, publisher=body.publisher, game_type=body.game_type,
        release_date=body.release_date, death_date=body.death_date,
        death_reason=body.death_reason, epitaph=body.epitaph, comment=body.comment,
        icon=body.icon, platform=body.platform,
        status="pending",  # 待审核
        submitter_id=user.id,
    )
    # 自动算享年
    game.lifespan = _calc_lifespan(body.release_date, body.death_date)
    db.add(game)
    await db.commit()
    await db.refresh(game)
    return {"id": game.id, "status": game.status, "message": "提交成功，等待审核"}


@router.put("/{game_id}/approve")
async def approve_game(game_id: int, status: str = Query(...), db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    game = (await db.execute(select(Game).where(Game.id == game_id))).scalar_one_or_none()
    if not game:
        raise HTTPException(404, "墓碑不存在")
    game.status = status
    await db.commit()
    await _rebuild_static_json(db)
    return {"message": f"审核完成：{status}"}


def _calc_lifespan(release: str, death: str) -> str:
    try:
        ry, rm = map(int, release.split("-"))
        dy, dm = map(int, death.split("-"))
        total_m = (dy - ry) * 12 + (dm - rm)
        if total_m >= 24:
            return f"{total_m // 12:.0f} 年"
        return f"{total_m} 个月"
    except Exception:
        return "未知"


async def _rebuild_static_json(db: AsyncSession):
    """重新生成 static/games.json（前 50 热门）"""
    sub = select(func.count(Candle.id)).where(Candle.game_id == Game.id).scalar_subquery()
    q = select(Game).where(Game.status == "approved").order_by(sub.desc()).limit(50)
    games = (await db.execute(q)).scalars().all()
    data = [await _game_to_response(g, db) for g in games]
    STATIC_GAMES_JSON.parent.mkdir(parents=True, exist_ok=True)
    with open(STATIC_GAMES_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
