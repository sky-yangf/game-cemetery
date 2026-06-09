from fastapi import APIRouter, Depends, HTTPException, Header, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Game
from schemas import GameOut, GameCreate, GameUpdate
from routers import ADMIN_USERS
from typing import Optional
import uuid
from datetime import datetime

router = APIRouter(prefix="/api/games", tags=["games"])


def calc_lifespan(release: str, death: str) -> str:
    """根据 release/death 计算 lifespan"""
    try:
        r = datetime.strptime(release, "%Y-%m")
        d = datetime.strptime(death, "%Y-%m") if death else datetime.utcnow()
        months = (d.year - r.year) * 12 + (d.month - r.month)
        if months < 0:
            months = 0
        years = months // 12
        remain = months % 12
        if years == 0:
            return f"{months}个月" if months > 0 else "不足1个月"
        if remain == 0:
            return f"{years}年"
        return f"{years}年{remain}个月" if remain <= 6 else f"{years}.5年"
    except:
        return "未知"


def require_admin(user_id: str):
    if user_id not in ADMIN_USERS:
        raise HTTPException(403, "需要管理员权限")


# ── GET /api/games ────────────────────────────────────

@router.get("", response_model=list[GameOut])
def list_games(
    publisher: Optional[str] = Query(None),
    reason: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Game)
    if publisher:
        # 支持多选：?publisher=腾讯&publisher=暴雪
        publishers = publisher.split(",") if "," in publisher else [publisher]
        query = query.filter(Game.publisher.in_(publishers))
    if reason:
        reasons = reason.split(",") if "," in reason else [reason]
        query = query.filter(Game.reason.in_(reasons))
    if type:
        types = type.split(",") if "," in type else [type]
        query = query.filter(Game.type.in_(types))
    if q:
        query = query.filter(Game.name.contains(q))
    return query.order_by((Game.candles + Game.played * 2).desc()).all()


# ── GET /api/games/{id} ───────────────────────────────

@router.get("/{game_id}", response_model=GameOut)
def get_game(game_id: str, db: Session = Depends(get_db)):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(404, "墓碑不存在")
    return game


# ── POST /api/games ───────────────────────────────────

@router.post("", response_model=GameOut, status_code=201)
def create_game(
    body: GameCreate,
    x_user_id: str = Header(...),
    db: Session = Depends(get_db),
):
    # 计算生命周期
    from datetime import datetime
    r = datetime.strptime(body.release, "%Y-%m")
    d = datetime.strptime(body.death, "%Y-%m")
    months = (d.year - r.year) * 12 + d.month - r.month
    if months <= 0:
        raise HTTPException(400, "停服日期必须晚于运营起始日期")
    lifespan = f"{months}个月" if months < 12 else (
        f"{months / 12:.1f}年" if months < 24 else f"{int(months / 12)}年"
    )

    game = Game(
        id=str(uuid.uuid4())[:12],
        icon=body.icon,
        name=body.name,
        publisher=body.publisher,
        type=body.type,
        release=body.release,
        death=body.death,
        reason=body.reason,
        reason_emoji=body.reason_emoji,
        lifespan=lifespan,
        epitaph=body.epitaph or f"{body.name} 已停服",
        comment=body.comment or "玩家提交",
        candles=0,
        played=0,
        is_user_submitted=True,
        submitted_by=x_user_id,
    )
    db.add(game)
    db.commit()
    db.refresh(game)
    return game


# ── PATCH /api/games/{id} ─────────────────────────────

@router.patch("/{game_id}", response_model=GameOut)
def update_game(
    game_id: str,
    body: GameUpdate,
    x_user_id: str = Header(...),
    db: Session = Depends(get_db),
):
    require_admin(x_user_id)
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(404, "墓碑不存在")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(game, field, value)

    game.updated_by = x_user_id
    game.updated_at = __import__("datetime").datetime.utcnow()
    db.commit()
    db.refresh(game)
    return game


# ── DELETE /api/games/{id} ─────────────────────────────

@router.delete("/{game_id}")
def delete_game(
    game_id: str,
    x_user_id: str = Header(...),
    db: Session = Depends(get_db),
):
    require_admin(x_user_id)
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(404, "墓碑不存在")
    if not game.is_user_submitted:
        raise HTTPException(400, "不能删除内置墓碑")
    db.delete(game)
    db.commit()
    return {"ok": True}


# ── POST /api/admin/games/batch ───────────────────────
# Admin 批量上传/更新游戏数据
# 请求体：[{...}, {...}, ...]
# id 已存在 → UPDATE；id 不存在 → INSERT

@router.post("/batch", status_code=201)
def batch_upsert_games(
    games_data: list[GameCreate],
    x_user_id: str = Header(...),
    db: Session = Depends(get_db),
):
    require_admin(x_user_id)
    inserted, updated = 0, 0
    for g in games_data:
        lifespan = calc_lifespan(g.release, g.death)
        existing = db.query(Game).filter(Game.id == g.name).first()
        if existing:
            for key, value in g.model_dump().items():
                setattr(existing, key, value)
            existing.lifespan = lifespan
            existing.is_user_submitted = False
            existing.updated_by = x_user_id
            existing.updated_at = datetime.utcnow()
            updated += 1
        else:
            game_id = g.name.lower().replace(" ", "-")[:32]
            game = Game(
                id=game_id,
                icon=g.icon,
                name=g.name,
                publisher=g.publisher,
                type=g.type,
                release=g.release,
                death=g.death,
                reason=g.reason,
                reason_emoji=g.reason_emoji,
                lifespan=lifespan,
                epitaph=g.epitaph or "",
                comment="",
                candles=0,
                played=0,
                is_user_submitted=False,
                submitted_by=None,
            )
            db.add(game)
            inserted += 1
    db.commit()
    return {"inserted": inserted, "updated": updated, "total": inserted + updated}
