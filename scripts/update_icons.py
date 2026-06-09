import json, os

# Read JSON (it's an array)
with open("E:/workspace/digital-cemetery/data/scraped_games.json", 'r', encoding='utf-8') as f:
    games = json.load(f)

# Find local icons
icon_dir = "E:/workspace/digital-cemetery/public/game-icons"
local_icons = {}
for fname in os.listdir(icon_dir):
    if fname.endswith(('.jpg', '.png', '.webp', '.jpeg')):
        name = os.path.splitext(fname)[0]
        local_icons[name] = f"game-icons/{name}{os.path.splitext(fname)[1]}"

# Update game icons
for g in games:
    gname = g["name"]
    matched = False
    for local_name, path in local_icons.items():
        if gname == local_name or gname.startswith(local_name) or local_name.startswith(gname):
            g["icon"] = f"/{path}"
            matched = True
            break
    if not matched:
        # Keep emoji as-is
        pass

# Save
with open("E:/workspace/digital-cemetery/data/scraped_games.json", 'w', encoding='utf-8') as f:
    json.dump(games, f, ensure_ascii=False, indent=2)

has = sum(1 for g in games if g["icon"].startswith("/game-icons/"))
no = sum(1 for g in games if not g["icon"].startswith("/game-icons/"))
print(f"✅ 有本地图标: {has} 个, 使用 emoji: {no} 个")
print(f"\n带图标的:")
for g in games:
    if g["icon"].startswith("/game-icons/"):
        print(f"  {g['name']:15s} → {g['icon']}")
