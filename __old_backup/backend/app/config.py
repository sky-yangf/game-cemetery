"""
数字墓园 · 后端配置
"""
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]

# SQLite 单文件
DATABASE_URL = f"sqlite+aiosqlite:///{BASE_DIR}/cemetery.db"

# JWT
JWT_SECRET = "cemetery-2026-secret-change-in-prod"
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_DAYS = 30

# 管理员
ADMIN_EMAIL = "admin@cemetery.com"
ADMIN_PASSWORD = "admin123"  # 生产环境改掉

# 上传
UPLOAD_DIR = BASE_DIR / "uploads"
MAX_UPLOAD_SIZE = 5 * 1024 * 1024  # 5MB

# 静态 JSON（前 50 热门）
STATIC_GAMES_JSON = BASE_DIR / "static" / "games.json"
