#!/usr/bin/env python3
"""
爬取萌娘百科停服游戏列表 → JSON（只保留国服/简中服）
"""
import re
import json
import requests
from datetime import datetime

URL = "https://zh.moegirl.org.cn/%E6%B8%B8%E6%88%8F%E5%85%B3%E6%9C%8D/%E5%81%9C%E6%9C%8D%E6%89%8B%E6%B8%B8%E5%88%97%E8%A1%A8"

DEFAULT_ICONS = ["🎮","🕹️","👾","🎯","🔮","🗡️","⚔️","🌸","🐱","💕","🎵","⚙️","🤖","🚀","⭐","🌙","🍜","🏗️","🧩","🥋","🎨","🐦","💤","🔫","🃏","🎤","🏰","🧭","⚽","🏎️"]
REASONS = ["运营停滞","全球停服","运营暴死","代理更换","代理到期","代理决裂"]
REASON_EMOJI = dict(zip(REASONS,["⏰","💀","💥","🔄","🔄","💔"]))

CN_SERVERS = ["国服","简中服","繁中服"]
FOREIGN_SERVERS = ["日服","韩服","台服","全球服","国际服","欧美服","美服"]

def is_cn(td_html: str) -> bool:
    """是否是中国区游戏"""
    txt = td_html
    # 有国服关键词
    for kw in CN_SERVERS:
        if kw in txt:
            return True
    # 有外服关键词 → 排除
    for kw in FOREIGN_SERVERS:
        if kw in txt:
            return False
    # 没有区服标注 → 保留（大多是国服游戏）
    return True

def parse_date(s: str) -> str:
    """解析日期为 YYYY-MM"""
    s = s.strip().replace('～','-').replace('~','-')
    m = re.search(r'(\d{4})[.\-/](\d{1,2})', s)
    if m:
        return f"{int(m.group(1)):04d}-{int(m.group(2)):02d}"
    return s

def extract_td_content(td: str) -> dict | None:
    """从一个 <td> 提取游戏信息"""
    # 去掉 HTML 标签，保留文本
    text = re.sub(r'<[^>]+>', '\n', td).strip()
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    if not lines:
        return None
    
    # 第一行: 【游戏名】（服务器）
    first = lines[0]
    name_match = re.search(r'【([^】]+)】', first)
    if not name_match:
        return None
    name = name_match.group(1)
    
    # 过滤
    if not is_cn(first):
        return None
    
    # 第二行: 日期
    date_line = lines[1] if len(lines) > 1 else ""
    # 第三行: 公司
    company = lines[2] if len(lines) > 2 else ""
    
    # 提取日期
    dates = re.findall(r'\d{4}[.\-/]\d{1,2}(?:[.\-/]\d{1,2})?', date_line)
    release, death = "", ""
    if len(dates) >= 2:
        release = parse_date(dates[0])
        death = parse_date(dates[1])
    elif len(dates) == 1:
        death = parse_date(dates[0])
    
    # 清理公司名
    company = company.split('*')[0].split('注:')[0].strip()
    # 去掉末尾的 [1] [2] 等索引
    company = re.sub(r'\[\d+\]$', '', company).strip()
    
    # 图标
    icon = DEFAULT_ICONS[hash(name) % len(DEFAULT_ICONS)]
    
    # 判断死因
    reason = "运营停滞"
    try:
        if release and death:
            r = datetime.strptime(release, "%Y-%m")
            d = datetime.strptime(death, "%Y-%m")
            if (d.year - r.year) * 12 + (d.month - r.month) < 12:
                reason = "运营暴死"
    except:
        pass
    if "代理" in company:
        reason = "代理到期"
    
    return {
        "icon": icon,
        "name": name,
        "publisher": company.split('/')[0].split('、')[0] if company else "未知",
        "type": "手游",
        "release": release,
        "death": death,
        "reason": reason,
        "reason_emoji": REASON_EMOJI.get(reason, "⏰"),
        "epitaph": f"运营 {release} ~ {death}" if release and death else death,
        "comment": ""
    }

def main():
    print("下载页面中...")
    resp = requests.get(URL, timeout=30, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    })
    resp.encoding = 'utf-8'
    html = resp.text
    
    # 找到所有 wikitable
    tables = re.findall(r'<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>.*?</table>', html, re.DOTALL)
    print(f"找到 {len(tables)} 个表格")
    
    all_games = []
    for table in tables:
        # 提取每个 td
        tds = re.findall(r'<td[^>]*style="width:85%"[^>]*>.*?</td>', table, re.DOTALL)
        for td in tds:
            g = extract_td_content(td)
            if g:
                all_games.append(g)
    
    # 去重
    seen = set()
    unique = []
    for g in all_games:
        key = g["name"]
        if key not in seen:
            seen.add(key)
            unique.append(g)
    
    unique.sort(key=lambda g: g["death"] or "0000", reverse=True)
    
    print(f"\n结果: 总计 {len(all_games)} 条, 去重后 {len(unique)} 条")
    
    # 保存
    output = {"total": len(unique), "source": URL, "games": unique}
    
    # 创建 data 目录
    import os
    os.makedirs("E:/workspace/digital-cemetery/data", exist_ok=True)
    
    path = "E:/workspace/digital-cemetery/data/scraped_games.json"
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"已保存到: {path}")
    print(f"\n预览前 15 条:")
    for g in unique[:15]:
        print(f"  {g['icon']} {g['name']:12s} | {g['publisher']:8s} | {g['release']}~{g['death']} | {g['reason']}")

if __name__ == "__main__":
    main()
