"""
数据模型：用户 / 游戏墓碑 / 留言 / 蜡烛
"""
from datetime import datetime
from sqlalchemy import String, Integer, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    name: Mapped[str] = mapped_column(String(100))
    role: Mapped[str] = mapped_column(String(20), default="user")  # user | admin
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    comments = relationship("Comment", back_populates="user")
    games_submitted = relationship("Game", back_populates="submitter", foreign_keys="Game.submitter_id")


class Game(Base):
    __tablename__ = "games"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200))
    icon: Mapped[str] = mapped_column(String(10), default="🪦")
    publisher: Mapped[str] = mapped_column(String(200))
    game_type: Mapped[str] = mapped_column(String(20), default="端游")  # 端游/手游/页游
    release_date: Mapped[str] = mapped_column(String(20))  # YYYY-MM
    death_date: Mapped[str] = mapped_column(String(20))
    death_reason: Mapped[str] = mapped_column(String(500))
    death_reason_emoji: Mapped[str] = mapped_column(String(10), default="⏰")
    lifespan: Mapped[str] = mapped_column(String(50))
    platform: Mapped[str] = mapped_column(String(50), default="PC")
    epitaph: Mapped[str] = mapped_column(Text)        # 墓志铭
    comment: Mapped[str] = mapped_column(Text)         # 一句幽默评语
    status: Mapped[str] = mapped_column(String(20), default="approved")  # approved/pending/rejected
    submitter_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    submitter = relationship("User", back_populates="games_submitted", foreign_keys=[submitter_id])
    comments = relationship("Comment", back_populates="game")
    candles = relationship("Candle", back_populates="game")


class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    game_id: Mapped[int] = mapped_column(ForeignKey("games.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    content: Mapped[str] = mapped_column(Text)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="approved")  # approved/pending/deleted
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    game = relationship("Game", back_populates="comments")
    user = relationship("User", back_populates="comments")


class Candle(Base):
    __tablename__ = "candles"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    game_id: Mapped[int] = mapped_column(ForeignKey("games.id"))
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    game = relationship("Game", back_populates="candles")
