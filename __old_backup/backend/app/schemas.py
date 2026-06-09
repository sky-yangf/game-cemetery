"""
Pydantic schemas
"""
from pydantic import BaseModel, Field
from typing import Optional


# --- Auth ---
class RegisterRequest(BaseModel):
    email: str
    password: str = Field(min_length=6)
    name: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    token: str
    user: dict


# --- Game ---
class GameCreate(BaseModel):
    name: str
    publisher: str
    game_type: str = "端游"
    release_date: str
    death_date: str
    death_reason: str
    epitaph: str
    comment: str
    icon: str = "🪦"
    platform: str = "PC"


class GameResponse(BaseModel):
    id: int
    name: str
    icon: str
    publisher: str
    game_type: str
    release_date: str
    death_date: str
    death_reason: str
    death_reason_emoji: str
    lifespan: str
    platform: str
    epitaph: str
    comment: str
    status: str
    candle_count: int = 0
    created_at: str


# --- Comment ---
class CommentCreate(BaseModel):
    content: str


class CommentResponse(BaseModel):
    id: int
    game_id: int
    user_name: str
    content: str
    image_url: Optional[str] = None
    created_at: str
