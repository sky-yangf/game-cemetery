from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
import json
import urllib.request
import ssl

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

# 从环境变量读（Render Dashboard 配置）
DB_URL = os.getenv("DATABASE_URL", "")
DB_TOKEN = os.getenv("DATABASE_AUTH_TOKEN", "")
# IS_TURSO: 有 token 必走 Turso，或者 URL 含 libsql:// 前缀
IS_TURSO = bool(DB_TOKEN) or DB_URL.startswith(("libsql://", "sqlite+libsql://", "https://", "http://"))
if IS_TURSO and not DB_URL:
    # 兜底：有 token 但没 URL，用默认 Turso 地址
    DB_URL = "libsql://game-cemetery-sky-yangf.aws-ap-northeast-1.turso.io"


class TursoClient:
    """Turso HTTP REST 客户端（纯 stdlib）"""

    def __init__(self):
        url = DB_URL
        for prefix in ("sqlite+libsql://", "libsql://", "https://", "http://"):
            if url.startswith(prefix):
                url = url[len(prefix):]
        self.host = url.rstrip("/")
        self.token = DB_TOKEN
        self._ctx = ssl.create_default_context()
        self._ctx.check_hostname = False
        self._ctx.verify_mode = ssl.CERT_NONE

    def execute(self, sql: str) -> dict:
        body = json.dumps({
            "requests": [{"type": "execute", "stmt": {"sql": sql}}],
        }, ensure_ascii=False).encode("utf-8")
        req = urllib.request.Request(
            f"https://{self.host}/v2/pipeline",
            data=body,
            headers={
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json",
            },
        )
        with urllib.request.urlopen(req, timeout=30, context=self._ctx) as resp:
            r = json.loads(resp.read())
        # 检查执行结果
        for i, result in enumerate(r.get("results", [])):
            if result.get("type") != "ok":
                print(f"[Turso] SQL err #{i}: {result.get('error', result)}", flush=True)
            elif result.get("response", {}).get("result", {}).get("rows_affected") is not None:
                print(f"[Turso] rows_affected={result['response']['result']['rows_affected']}", flush=True)
        return r

    def fetch_all(self, sql: str) -> list[dict]:
        try:
            r = self.execute(sql)
        except Exception as e:
            print(f"[Turso] fetch_all err: {e}")
            return []
        result = r.get("results", [{}])[0]
        if result.get("type") != "ok":
            return []
        cols = [c["name"] for c in result["response"]["result"]["cols"]]
        rows = result["response"]["result"]["rows"]
        return [dict(zip(cols, [_extract(v) for v in row])) for row in rows]

    def fetch_one(self, sql: str) -> dict | None:
        rows = self.fetch_all(sql)
        return rows[0] if rows else None

    def ensure_tables(self):
        """首次启动建表（部署环境）"""
        for ddl in [
            """CREATE TABLE IF NOT EXISTS games (
                id TEXT PRIMARY KEY, icon TEXT, name TEXT NOT NULL,
                publisher TEXT, type TEXT, release TEXT, death TEXT,
                reason TEXT, reason_emoji TEXT, lifespan TEXT,
                epitaph TEXT, comment TEXT, candles INTEGER DEFAULT 0,
                played INTEGER DEFAULT 0, is_user_submitted INTEGER DEFAULT 0,
                submitted_by TEXT, submitted_at TEXT, updated_by TEXT, updated_at TEXT
            )""",
            """CREATE TABLE IF NOT EXISTS candles (
                id INTEGER PRIMARY KEY AUTOINCREMENT, game_id TEXT NOT NULL,
                user_id TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now'))
            )""",
            """CREATE TABLE IF NOT EXISTS played (
                id INTEGER PRIMARY KEY AUTOINCREMENT, game_id TEXT NOT NULL,
                user_id TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now'))
            )""",
            """CREATE TABLE IF NOT EXISTS comments (
                id TEXT PRIMARY KEY, game_id TEXT NOT NULL,
                author TEXT, content TEXT NOT NULL,
                image TEXT, created_at TEXT DEFAULT (datetime('now'))
            )""",
        ]:
            try:
                self.execute(ddl)
            except Exception as e:
                print(f"[Turso] DDL failed: {e}", flush=True)


def _extract(v):
    if isinstance(v, dict):
        if "value" in v:
            return v["value"]
        if v.get("type") == "null":
            return None
    return v


# ============================================================
# 本地 SQLite
# ============================================================
if not IS_TURSO:
    _local_url = DB_URL or f"sqlite:///{os.path.join(DATA_DIR, 'cemetery.db')}"
    engine = create_engine(_local_url, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
else:
    engine = None
    SessionLocal = None

Base = declarative_base()


# TursoClient module-level singleton
_turso_client = None

def _get_turso():
    global _turso_client
    if _turso_client is None:
        _turso_client = TursoClient()
        return _turso_client

def ensure_tables_once():
    if IS_TURSO:
        _get_turso().ensure_tables()

def get_db():
    if IS_TURSO:
        yield _get_turso()
    else:
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
