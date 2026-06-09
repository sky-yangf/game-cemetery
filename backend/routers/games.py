from fastapi import APIRouter, Depends, HTTPException, Header, Query
from sqlalchemy.orm import Session
from database import get_db, IS_TURSO, _extract
from models import Game
from schemas import GameOut, GameCreate, GameUpdate
from routers import ADMIN_USERS
from typing import Optional
import uuid
from datetime import datetime

router = APIRouter(prefix="/api/games", tags=["games"])


def calc_lifespan(release: str, death: str) -> str:
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


def _row_to_game(row: dict) -> dict:
    """Turso row dict → 字段名转换 (snake_case 已是 schema 格式)"""
    # Turso 返回的 id 是 TEXT，candles/played/is_user_submitted 可能是 int
    row.setdefault("candles", 0)
    row.setdefault("played", 0)
    row.setdefault("is_user_submitted", False)
    return row


# ── GET /api/games ────────────────────────────────────

@router.get("", response_model=list[GameOut])
def list_games(
    publisher: Optional[str] = Query(None),
    reason: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    db = Depends(get_db),
):
    if IS_TURSO:
        # 简单查询 - 客户端过滤
        sql = "SELECT * FROM games"
        rows = db.fetch_all(sql)
        # 过滤
        result = []
        for row in rows:
            if publisher:
                pubs = publisher.split(",") if "," in publisher else [publisher]
                if row.get("publisher") not in pubs:
                    continue
            if reason:
                rs = reason.split(",") if "," in reason else [reason]
                if row.get("reason") not in rs:
                    continue
            if type:
                ts = type.split(",") if "," in type else [type]
                if row.get("type") not in ts:
                    continue
            if q and q not in (row.get("name") or ""):
                continue
            result.append(_row_to_game(row))
        # 排序
        result.sort(key=lambda g: (int(g.get("candles", 0)) + int(g.get("played", 0)) * 2), reverse=True)
        return result

    # SQLite 分支
    query = db.query(Game)
    if publisher:
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
def get_game(game_id: str, db = Depends(get_db)):
    if IS_TURSO:
        row = db.fetch_one(f"SELECT * FROM games WHERE id = '{game_id.replace(chr(39), chr(39)+chr(39))}'")
        if not row:
            raise HTTPException(404, "墓碑不存在")
        return _row_to_game(row)
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(404, "墓碑不存在")
    return game


# ── POST /api/games ───────────────────────────────────

@router.post("", response_model=GameOut, status_code=201)
def create_game(
    body: GameCreate,
    x_user_id: str = Header(...),
    db = Depends(get_db),
):
    r = datetime.strptime(body.release, "%Y-%m")
    d = datetime.strptime(body.death, "%Y-%m")
    months = (d.year - r.year) * 12 + d.month - r.month
    if months <= 0:
        raise HTTPException(400, "停服日期必须晚于运营起始日期")
    lifespan = f"{months}个月" if months < 12 else (
        f"{months / 12:.1f}年" if months < 24 else f"{int(months / 12)}年"
    )

    new_id = str(uuid.uuid4())[:12]
    epitaph = body.epitaph or f"{body.name} 已停服"
    comment = body.comment or "玩家提交"

    if IS_TURSO:
        db.execute(f"""INSERT INTO games (id, icon, name, publisher, type, release, death,
            reason, reason_emoji, lifespan, epitaph, comment, candles, played,
            is_user_submitted, submitted_by, submitted_at)
            VALUES ('{new_id}', '{body.icon.replace(chr(39), chr(39)+chr(39))}',
            '{body.name.replace(chr(39), chr(39)+chr(39))}',
            '{body.publisher.replace(chr(39), chr(39)+chr(39))}',
            '{body.type.replace(chr(39), chr(39)+chr(39))}',
            '{body.release}', '{body.death}',
            '{body.reason.replace(chr(39), chr(39)+chr(39))}',
            '{body.reason_emoji}',
            '{lifespan}',
            '{epitaph.replace(chr(39), chr(39)+chr(39))}',
            '{comment.replace(chr(39), chr(39)+chr(39))}', 0, 0, 1,
            '{x_user_id.replace(chr(39), chr(39)+chr(39))}',
            '{datetime.utcnow().isoformat()}')""")
        row = db.fetch_one(f"SELECT * FROM games WHERE id = '{new_id}'")
        return _row_to_game(row)

    game = Game(
        id=new_id, icon=body.icon, name=body.name, publisher=body.publisher,
        type=body.type, release=body.release, death=body.death,
        reason=body.reason, reason_emoji=body.reason_emoji,
        lifespan=lifespan, epitaph=epitaph, comment=comment,
        candles=0, played=0, is_user_submitted=True, submitted_by=x_user_id,
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
    db = Depends(get_db),
):
    require_admin(x_user_id)
    escaped_id = game_id.replace(chr(39), chr(39) + chr(39))

    if IS_TURSO:
        existing = db.fetch_one(f"SELECT * FROM games WHERE id = '{escaped_id}'")
        if not existing:
            raise HTTPException(404, "墓碑不存在")
        for field, value in body.model_dump(exclude_unset=True).items():
            if value is None:
                continue
            v = str(value).replace(chr(39), chr(39) + chr(39))
            db.execute(f"UPDATE games SET {field} = '{v}' WHERE id = '{escaped_id}'")
        db.execute(f"UPDATE games SET updated_by = '{x_user_id.replace(chr(39), chr(39)+chr(39))}', "
                   f"updated_at = '{datetime.utcnow().isoformat()}' WHERE id = '{escaped_id}'")
        return _row_to_game(db.fetch_one(f"SELECT * FROM games WHERE id = '{escaped_id}'"))

    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(404, "墓碑不存在")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(game, field, value)
    game.updated_by = x_user_id
    game.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(game)
    return game


# ── DELETE /api/games/{id} ─────────────────────────────

@router.delete("/{game_id}")
def delete_game(
    game_id: str,
    x_user_id: str = Header(...),
    db = Depends(get_db),
):
    require_admin(x_user_id)
    escaped_id = game_id.replace(chr(39), chr(39) + chr(39))

    if IS_TURSO:
        existing = db.fetch_one(f"SELECT * FROM games WHERE id = '{escaped_id}'")
        if not existing:
            raise HTTPException(404, "墓碑不存在")
        if not existing.get("is_user_submitted"):
            raise HTTPException(400, "不能删除内置墓碑")
        db.execute(f"DELETE FROM games WHERE id = '{escaped_id}'")
        return {"ok": True}

    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(404, "墓碑不存在")
    if not game.is_user_submitted:
        raise HTTPException(400, "不能删除内置墓碑")
    db.delete(game)
    db.commit()
    return {"ok": True}


# ── POST /api/admin/games/batch ───────────────────────

@router.post("/batch", status_code=201)
def batch_upsert_games(
    games_data: list[GameCreate],
    x_user_id: str = Header(...),
    db = Depends(get_db),
):
    require_admin(x_user_id)
    inserted, updated = 0, 0

    for g in games_data:
        lifespan = calc_lifespan(g.release, g.death)
        g_name = g.name.replace(chr(39), chr(39) + chr(39))

        if IS_TURSO:
            existing = db.fetch_one(f"SELECT * FROM games WHERE name = '{g_name}'")
            if existing:
                for field, value in g.model_dump().items():
                    if value is None:
                        continue
                    v = str(value).replace(chr(39), chr(39) + chr(39))
                    db.execute(f"UPDATE games SET {field} = '{v}' "
                               f"WHERE name = '{g_name}'")
                db.execute(f"UPDATE games SET lifespan = '{lifespan}', "
                           f"is_user_submitted = 0, updated_by = '{x_user_id}', "
                           f"updated_at = '{datetime.utcnow().isoformat()}' "
                           f"WHERE name = '{g_name}'")
                updated += 1
            else:
                game_id = g.name.lower().replace(" ", "-")[:32]
                g_icon = g.icon.replace(chr(39), chr(39) + chr(39))
                g_pub = g.publisher.replace(chr(39), chr(39) + chr(39))
                g_type = g.type.replace(chr(39), chr(39) + chr(39))
                g_reason = g.reason.replace(chr(39), chr(39) + chr(39))
                g_epi = (g.epitaph or "").replace(chr(39), chr(39) + chr(39))
                db.execute(f"""INSERT INTO games (id, icon, name, publisher, type, release, death,
                    reason, reason_emoji, lifespan, epitaph, comment, candles, played,
                    is_user_submitted)
                    VALUES ('{game_id}', '{g_icon}', '{g_name}', '{g_pub}', '{g_type}',
                    '{g.release}', '{g.death}', '{g_reason}', '{g.reason_emoji}',
                    '{lifespan}', '{g_epi}', '', 0, 0, 0)""")
                inserted += 1
            continue

        # SQLite 分支
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
                id=game_id, icon=g.icon, name=g.name, publisher=g.publisher,
                type=g.type, release=g.release, death=g.death,
                reason=g.reason, reason_emoji=g.reason_emoji,
                lifespan=lifespan, epitaph=g.epitaph or "", comment="",
                candles=0, played=0, is_user_submitted=False, submitted_by=None,
            )
            db.add(game)
            inserted += 1
    if not IS_TURSO:
        db.commit()
    return {"inserted": inserted, "updated": updated, "total": inserted + updated}
