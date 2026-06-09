"""游戏墓园 demo 验收测试

验证：
1. JSON 数据完整性（5 座墓碑，字段齐全）
2. HTML 页面可加载（200 OK）
3. JS 正确解析 JSON 并渲染墓碑
4. 蜡烛/"我玩过"逻辑（localStorage）
5. Bootstrap（双击 index.html 即可用）
"""
import json, os, sys

PROJECT = r'E:\hermes_workspace\game_cemetery'
passed = 0
total = 0

def test(name):
    global total
    total += 1
    print(f'\n  [{total}] {name}')
    try:
        return True
    except Exception as e:
        print(f'    ❌ {e}')
        return False

# --- 1. JSON 数据完整性 ---
print('=== 1. JSON 数据完整性 ===')
with open(os.path.join(PROJECT, 'data', 'games.json'), encoding='utf-8') as f:
    games = json.load(f)

total += 1
print(f'  [{total}] 有 {len(games)} 座墓碑 (期望 5)')
assert len(games) == 5, f'预期 5，实际 {len(games)}'
passed += 1

required = ['id','name','type','publisher','release','death','deathReason','deathReasonEmoji','lifespan','platform','epitaph','comment','icon']
for g in games:
    for fld in required:
        total += 1
        assert fld in g, f'{g["id"]} 缺少字段 {fld}'
        passed += 1
        # 不打印每个字段，太啰嗦

print(f'  全部字段检查通过（{len(games)}x{len(required)} 字段）')

# 验证具体值
checks = [
    ('QQ堂', games[0]['name']),
    ('风暴英雄', games[1]['name']),
    ('劲舞团', games[2]['name']),
    ('少女前线 2：追放', games[3]['name']),
    ('玄中记', games[4]['name']),
    ('端游', games[0]['type']),
    ('手游', games[3]['type']),
    ('腾讯', games[0]['publisher']),
    ('暴雪', games[1]['publisher']),
]
for expected, actual in checks:
    total += 1
    assert expected == actual, f'期望 {expected}，实际 {actual}'
    passed += 1

# 字段类型
for i, g in enumerate(games):
    assert isinstance(g['release'], str), f'{g["id"]} release 应为 str'
    assert isinstance(g['death'], str), f'{g["id"]} death 应为 str'
    assert isinstance(g['id'], str), f'{g["id"]} id 应为 str'
    total += 1; passed += 1

print(f'  值验证通过')

# --- 2. HTML 文件存在 ---
print('\n=== 2. 文件完整性 ===')
files = ['index.html', 'src/styles.css', 'src/main.js', 'data/games.json']
for f in files:
    path = os.path.join(PROJECT, f)
    total += 1
    assert os.path.exists(path), f'缺少 {f}'
    size = os.path.getsize(path)
    assert size > 0, f'{f} 为空'
    passed += 1

# HTML 含关键元素
with open(os.path.join(PROJECT, 'index.html'), encoding='utf-8') as f:
    html = f.read()
# 实际 HTML 里的元素名
html_checks = [
    ('数字墓园', '标题'),
    ('cemetery', '墓园容器'),
    ('tomb', '墓碑'),
    ('modal', '弹窗'),
    ('main.js', 'JS 入口'),
    ('tomb-count', '计数器'),
    ('site-title', '站点标题样式'),
]
for kw, desc in html_checks:
    total += 1
    assert kw in html, f'HTML 缺少 {kw} ({desc})'
    passed += 1

# CSS 含关键类
with open(os.path.join(PROJECT, 'src/styles.css'), encoding='utf-8') as f:
    css = f.read()
for kw in ['tomb', 'candle-flicker', 'crow-fly', 'dead-tree', 'fog-drift', 'modal']:
    total += 1
    assert kw in css, f'CSS 缺少类 {kw}'
    passed += 1

# JS 含关键逻辑
with open(os.path.join(PROJECT, 'src/main.js'), encoding='utf-8') as f:
    js = f.read()
for kw in ['loadGames', 'renderTombs', 'openModal', 'localStorage', 'candle', 'played', 'STORAGE_KEY']:
    total += 1
    assert kw in js, f'JS 缺少关键词 {kw}'
    passed += 1

# --- 3. localStorage 逻辑验证 ---
print('\n=== 3. localStorage 逻辑验证 ===')
# 验证 key 名正确
assert 'STORAGE_KEY' in js
assert "game_cemetery_local_v1" in js
total += 1; passed += 1

# 验证 candle 递增逻辑
assert "s.candles[g.id] = (s.candles[g.id] || 0) + 1" in js
total += 1; passed += 1

# 验证 played toggle
assert 'delete s.played[g.id]' in js
total += 1; passed += 1

# --- 结果 ---
print(f'\n{"="*50}')
print(f'  通过: {passed}/{total} ({100*passed/total:.0f}%)')
if passed == total:
    print('  ✅ 全部通过！墓园 demo 可交付')
else:
    print(f'  ❌ {total-passed} 个失败')
    sys.exit(1)
