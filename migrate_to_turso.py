"""
迁移本地 SQLite 数据库到 Turso
运行方式：python migrate_to_turso.py
"""

import sqlite3
import json
import urllib.request
import ssl

# ============================================================
# 配置
# ============================================================
TURSO_HOST = "game-cemetery-sky-yangf.aws-ap-northeast-1.turso.io"
TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODA5NzY2NTQsImlkIjoiMDE5ZWFhNzItNjIwMS03M2QwLWIyZDAtM2Q0NjViMzhkMWY0IiwicmlkIjoiNmU1NDdiOTUtOGI4MS00OWYwLTkyNDktMzcyYjg4N2VkODE0In0.JLqwDx7idy1AsoHhsfA-NRWoVoZgxqBdbiaf_hWU8tVJnUJPOWxR5FnZQBlGaECLNx85AAaHIXEzTZxd9B_aDA"

LOCAL_DB = "E:/hermes_workspace/game_cemetery/backend/data/cemetery.db"
# ============================================================


def turso_sql(sql: str) -> dict:
    """执行一条 SQL，返回 Turso 的 JSON 响应"""
    body = json.dumps(
        {"requests": [{"type": "execute", "stmt": {"sql": sql}}]},
        ensure_ascii=False,
    ).encode("utf-8")

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    req = urllib.request.Request(
        f"https://{TURSO_HOST}/v2/pipeline",
        data=body,
        headers={
            "Authorization": f"Bearer {TURSO_TOKEN}",
            "Content-Type": "application/json; charset=utf-8",
        },
    )

    with urllib.request.urlopen(req, timeout=30, context=ctx) as resp:
        return json.loads(resp.read())


def main():
    # 1. 测试连接
    print("测试连接...", end=" ")
    r = turso_sql("SELECT 1 AS test")
    ok = r.get("results", [{}])[0].get("type")
    print(f"{'✅' if ok == 'ok' else '❌'} ({ok})")

    # 2. 建表
    print("建表...")
    turso_sql("""
        CREATE TABLE IF NOT EXISTS games (
            id TEXT PRIMARY KEY, icon TEXT, name TEXT NOT NULL,
            publisher TEXT, type TEXT, release TEXT, death TEXT,
            reason TEXT, reason_emoji TEXT, lifespan TEXT,
            epitaph TEXT, comment TEXT, candles INTEGER DEFAULT 0,
            played INTEGER DEFAULT 0, is_user_submitted INTEGER DEFAULT 0,
            submitted_by TEXT, submitted_at TEXT, updated_by TEXT, updated_at TEXT
        )
    """)
    turso_sql("""
        CREATE TABLE IF NOT EXISTS candles (
            id TEXT PRIMARY KEY, game_id TEXT NOT NULL,
            user_id TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now'))
        )
    """)
    turso_sql("""
        CREATE TABLE IF NOT EXISTS played (
            id TEXT PRIMARY KEY, game_id TEXT NOT NULL,
            user_id TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now'))
        )
    """)
    turso_sql("""
        CREATE TABLE IF NOT EXISTS comments (
            id TEXT PRIMARY KEY, game_id TEXT NOT NULL,
            user_id TEXT, username TEXT DEFAULT 'anon',
            content TEXT NOT NULL, image_url TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)
    print("  ✅ 4 表已建")

    # 3. 读本地数据
    local = sqlite3.connect(LOCAL_DB)
    games = local.execute("SELECT * FROM games").fetchall()
    cols = [str(d[1]) for d in local.execute("PRAGMA table_info(games)").fetchall()]
    print(f"本地: {len(games)} 款游戏 ({len(cols)} 列)")

    # 4. 逐条迁移
    ok = 0
    err = 0
    for i, row in enumerate(games):
        vals = []
        for v in row:
            if v is None:
                vals.append("NULL")
            elif isinstance(v, (int, float)):
                vals.append(str(v))
            else:
                escaped = str(v).replace("'", "''")
                vals.append(f"'{escaped}'")

        sql = f"INSERT OR IGNORE INTO games ({','.join(cols)}) VALUES ({','.join(vals)})"

        try:
            r = turso_sql(sql)
            if r.get("results", [{}])[0].get("type") == "ok":
                ok += 1
            else:
                err += 1
                if err <= 3:
                    msg = r.get("results", [{}])[0].get("error", {}).get("message", "")
                    print(f"  ❌ 第{i+1}条({row[2]}): {msg[:80]}")
        except Exception as e:
            err += 1
            if err <= 3:
                print(f"  ❌ 第{i+1}条 网络错误: {e}")

        if (i + 1) % 30 == 0:
            print(f"  {i+1}/{len(games)} (ok:{ok} err:{err})")

    local.close()
    print(f"\n迁移结果: ok={ok}  err={err}")

    # 5. 验证
    r = turso_sql("SELECT COUNT(*) AS c FROM games")
    count = r["results"][0]["response"]["result"]["rows"][0][0]["value"]
    print(f"Turso 现有: {count} 款游戏")

    if count == len(games):
        print("✅ 迁移成功！所有数据已同步到 Turso。")
        print("\n下一步：")
        print("1. Render Dashboard → Environment → 添加：")
        print(f"   DATABASE_URL = libsql://{TURSO_HOST}")
        print("   DATABASE_AUTH_TOKEN = （上面 TURSO_TOKEN 的值）")
        print("2. 右上角 Manual Deploy → Restart service")
        print("3. 刷新 game-cemetery.vercel.app → 数据永不丢了 🎉")
    else:
        print(f"⚠️  数据不一致（本地{len(games)} vs Turso{count}），建议重新运行本脚本。")


if __name__ == "__main__":
    main()
