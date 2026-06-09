import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey, func
from sqlalchemy.orm import relationship
from database import Base


class Game(Base):
    __tablename__ = "games"

    id           = Column(String, primary_key=True)
    icon         = Column(String, nullable=False)
    name         = Column(String, nullable=False)
    publisher    = Column(String, nullable=False)
    type         = Column(String, nullable=False, default="网游")   # "网游" | "手游"
    release      = Column(String, nullable=False)
    death        = Column(String, nullable=False)
    reason       = Column(String, nullable=False)
    reason_emoji = Column(String, nullable=False)
    lifespan     = Column(String, nullable=False)
    epitaph      = Column(String, nullable=True)
    comment      = Column(String, nullable=True)
    candles      = Column(Integer, default=0)
    played       = Column(Integer, default=0)
    is_user_submitted = Column(Boolean, default=False)
    submitted_by = Column(String, nullable=True)
    updated_by   = Column(String, nullable=True)
    updated_at   = Column(DateTime, nullable=True)


class Candle(Base):
    __tablename__ = "candles"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    game_id    = Column(String, ForeignKey("games.id"), nullable=False)
    user_id    = Column(String, nullable=False)
    created_at = Column(DateTime, default=func.now())


class Played(Base):
    __tablename__ = "played"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    game_id    = Column(String, ForeignKey("games.id"), nullable=False)
    user_id    = Column(String, nullable=False)
    created_at = Column(DateTime, default=func.now())


class Comment(Base):
    __tablename__ = "comments"

    id         = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    game_id    = Column(String, ForeignKey("games.id"), nullable=False)
    author     = Column(String, nullable=False)
    content    = Column(String, nullable=False)
    image      = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
