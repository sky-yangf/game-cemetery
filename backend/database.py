from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

# 支持环境变量覆盖（本地用 sqlite，部署用 Turso）
_raw_url = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(DATA_DIR, 'cemetery.db')}")

# libsql://xxx.turso.io → sqlite+libsql://xxx.turso.io（SQLAlchemy 需要这个前缀）
if _raw_url.startswith("libsql://"):
    DATABASE_URL = "sqlite+" + _raw_url
else:
    DATABASE_URL = _raw_url

# 兼容 libsql / sqlite 两种 connect_args
connect_args = {"check_same_thread": False}

# libsql 适配器支持 auth_token 单独传
if "libsql" in DATABASE_URL:
    auth_token = os.getenv("DATABASE_AUTH_TOKEN")
    if auth_token:
        connect_args["auth_token"] = auth_token

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
