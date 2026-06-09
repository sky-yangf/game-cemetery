from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ── Game ──────────────────────────────────────────────

class GameCreate(BaseModel):
    icon: str = Field(max_length=200000)
    name: str = Field(min_length=1, max_length=100)
    publisher: str = Field(min_length=1, max_length=100)
    type: str = "网游"
    release: str = ""
    death: str = ""
    reason: str = "运营停滞"
    reason_emoji: str = "⏰"
    epitaph: Optional[str] = Field(default=None, max_length=500)
    comment: Optional[str] = Field(default=None, max_length=200)


class GameUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=30)
    publisher: Optional[str] = Field(default=None, max_length=20)
    type: Optional[str] = None
    release: Optional[str] = None
    death: Optional[str] = None
    reason: Optional[str] = Field(default=None, max_length=10)
    reason_emoji: Optional[str] = Field(default=None, max_length=4)
    epitaph: Optional[str] = Field(default=None, max_length=100)
    comment: Optional[str] = Field(default=None, max_length=200)


class GameOut(BaseModel):
    id: str
    icon: str
    name: str
    publisher: str
    type: str
    release: str
    death: str
    reason: str
    reason_emoji: str
    lifespan: str
    epitaph: Optional[str]
    comment: Optional[str]
    candles: int
    played: int
    is_user_submitted: bool
    submitted_by: Optional[str]
    updated_by: Optional[str]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ── Candle ────────────────────────────────────────────

class CandleOut(BaseModel):
    game_id: str
    total_candles: int

    class Config:
        from_attributes = True


# ── Played ────────────────────────────────────────────

class PlayedOut(BaseModel):
    game_id: str
    played: bool
    already_marked: bool = False

    class Config:
        from_attributes = True


# ── Comment ───────────────────────────────────────────

class CommentCreate(BaseModel):
    author: str = Field(min_length=1, max_length=20)
    content: str = Field(min_length=1, max_length=200)
    image: Optional[str] = None


class CommentOut(BaseModel):
    id: str
    game_id: str
    author: str
    content: str
    image: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
