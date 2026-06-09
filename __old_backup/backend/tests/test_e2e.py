"""端到端测试 — 验证墓园全功能链路

用法：cd backend && python tests/test_e2e.py
前提：backend 已在 8002 端口跑
"""
import httpx, json, time, sys

BASE = "http://127.0.0.1:8002/api"
passed = 0
total = 0

def check(name, ok, detail=""):
    global passed, total
    total += 1
    icon = "✅" if ok else "❌"
    print(f"  [{total}] {icon} {name}" + (f" — {detail}" if detail else ""))
    if ok: passed += 1

with httpx.Client(base_url=BASE, timeout=10) as c:
    print("=== 1. 健康检查 ===")
    r = c.get("/ping")
    check("ping", r.status_code == 200 and r.json().get("message") == "pong")

    print("\n=== 2. 墓园主页（默认 50 款）===")
    r = c.get("/games?limit=50")
    games = r.json()
    check("获取 50 款", len(games) == 50, f"实际 {len(games)}")
    check("有真实游戏", any(g["name"] == "QQ堂" for g in games))
    check("字段齐全", all("icon" in g and "epitaph" in g and "comment" in g for g in games))

    print("\n=== 3. 加载更多（第 51 款不存在，留空）===")
    r = c.get("/games?offset=50&limit=10")
    more = r.json()
    check("offset 50 = 0 款", len(more) == 0, f"实际 {len(more)}")

    print("\n=== 4. 筛选（按厂商）===")
    r = c.get("/games?publisher=腾讯&limit=100")
    tencent = r.json()
    check("腾讯游戏 ≥ 10 款", len(tencent) >= 10, f"实际 {len(tencent)}")
    check("全部是腾讯", all(g["publisher"] == "腾讯" for g in tencent))

    print("\n=== 5. 筛选（按年份）===")
    r = c.get("/games?death_year=2024&limit=100")
    y2024 = r.json()
    check("2024 停运游戏 ≥ 5 款", len(y2024) >= 5, f"实际 {len(y2024)}")
    check("全部 2024", all(g["death_date"].startswith("2024") for g in y2024))

    print("\n=== 6. 排序（按蜡烛数）===")
    r = c.get("/games?sort=candles&limit=5")
    top = r.json()
    check("返回 5 款", len(top) == 5)

    print("\n=== 7. 点蜡烛（匿名）===")
    target_id = games[0]["id"]
    r = c.post(f"/candles/{target_id}")
    check("点蜡烛 200", r.status_code == 200)
    count = r.json()["count"]
    check("计数 = 1", count == 1, f"实际 {count}")

    print("\n=== 8. 注册新用户 ===")
    email = f"test_{int(time.time())}@x.com"
    r = c.post("/auth/register", json={"email": email, "password": "123456", "name": "测试"})
    check("注册 200", r.status_code == 200, r.text[:100] if r.status_code != 200 else "")
    token = r.json()["token"]
    check("拿到 token", bool(token))
    check("默认角色 user", r.json()["user"]["role"] == "user")

    print("\n=== 9. 登录 ===")
    r = c.post("/auth/login", json={"email": email, "password": "123456"})
    check("登录 200", r.status_code == 200)
    token = r.json()["token"]

    print("\n=== 10. 登录用户留言 ===")
    headers = {"Authorization": f"Bearer {token}"}
    r = c.post(f"/comments/game/{target_id}?content=这是我童年的回忆！", headers=headers)
    check("留言成功", r.status_code == 200)
    r = c.get(f"/comments/game/{target_id}")
    comments = r.json()
    check("能看到留言", len(comments) >= 1)
    check("留言内容正确", any("童年" in c["content"] for c in comments))

    print("\n=== 11. 提交新墓碑（需审核）===")
    r = c.post("/games", json={
        "name": "测试游戏", "publisher": "测试公司", "game_type": "端游",
        "release_date": "2020-01", "death_date": "2024-01",
        "death_reason": "运营停止", "epitaph": "测试墓志铭", "comment": "测试评语"
    }, headers=headers)
    check("提交 200", r.status_code == 200, r.text[:100] if r.status_code != 200 else "")
    check("状态 pending", r.json().get("status") == "pending")
    new_id = r.json()["id"]

    print("\n=== 12. pending 不在公开列表 ===")
    r = c.get("/games?limit=100")
    visible = r.json()
    check("新墓碑不显示", not any(g["id"] == new_id for g in visible))

    print("\n=== 13. 管理员审核 ===")
    r = c.post("/auth/login", json={"email": "admin@cemetery.com", "password": "admin123"})
    admin_token = r.json()["token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    r = c.put(f"/games/{new_id}/approve?status=approved", headers=admin_headers)
    check("审核通过 200", r.status_code == 200)

    print("\n=== 14. 审核后可见 ===")
    r = c.get("/games?limit=100")
    visible = r.json()
    check("新墓碑可见", any(g["id"] == new_id for g in visible))

    print("\n=== 15. 普通用户不能审核 ===")
    r = c.put(f"/games/{target_id}/approve?status=rejected", headers=headers)
    check("403 拒绝", r.status_code == 403)

    print(f"\n{'='*50}\n  通过: {passed}/{total} ({100*passed/total:.0f}%)")
    if passed == total:
        print("  ✅ 全部通过！墓园全功能链路就绪")
    else:
        print(f"  ❌ {total - passed} 个失败")
        sys.exit(1)