"""创建数据库 + 插入 51 款内置墓碑"""
import os
from database import engine, Base, SessionLocal
from models import Game

# 51 款游戏数据（从 src/data/games.ts 搬运）
GAMES = [
    {"id":"qqtang","icon":"🪄","name":"QQ堂","publisher":"腾讯","type":"网游","release":"2004-11","death":"2018-08","reason":"运营停滞","reason_emoji":"⏰","lifespan":"14年","epitaph":"童年最爱的休闲网游，泡泡堂的中国亲戚","comment":"被自家 QQ飞车+LOL+王者联手打死的","candles":128,"played":45},
    {"id":"hots","icon":"⚔️","name":"风暴英雄","publisher":"暴雪","type":"网游","release":"2015-06","death":"2018-12","reason":"全球停服","reason_emoji":"💀","lifespan":"3.5年","epitaph":"MOBA 界的富二代，靠爹妈砸钱续命也没救活","comment":"暴雪最自豪的'我们终于有自己的 DOTA 了'，3年后官方宣布'我们不要了'","candles":256,"played":83},
    {"id":"audition","icon":"💃","name":"劲舞团","publisher":"久游","type":"网游","release":"2005-04","death":"2015-11","reason":"运营停滞","reason_emoji":"⏰","lifespan":"10年","epitaph":"非主流一代的青春","comment":"空格键按坏的青春","candles":89,"played":33},
    {"id":"gfl2","icon":"🔫","name":"少女前线2","publisher":"散爆网络","type":"手游","release":"2024-01","death":"2024-07","reason":"运营暴死","reason_emoji":"💥","lifespan":"0.5年","epitaph":"二次元抽卡界的塌房代表作","comment":"6个月从万众期待到万人唾弃","candles":1024,"played":314},
    {"id":"xuanzhong","icon":"🌙","name":"玄中记","publisher":"腾讯","type":"手游","release":"2022-05","death":"2023-04","reason":"运营暴死","reason_emoji":"💥","lifespan":"1年","epitaph":"鹅厂猪厂难得合作，结果双方都不要这孩子","comment":"合作生子的弃婴","candles":34,"played":17},
    {"id":"rhythm","icon":"🎵","name":"节奏大师","publisher":"腾讯","type":"手游","release":"2012-09","death":"2024-02","reason":"运营停滞","reason_emoji":"⏰","lifespan":"12年","epitaph":"通勤路上的指尖舞蹈","comment":"被版权和短视频一起打败","candles":167,"played":57},
    {"id":"maple2","icon":"🍁","name":"冒险岛2","publisher":"腾讯","type":"网游","release":"2018-04","death":"2020-04","reason":"运营暴死","reason_emoji":"💥","lifespan":"2年","epitaph":"韩服还在，国服先走一步","candles":78,"played":30},
    {"id":"ff14cn","icon":"⚔️","name":"最终幻想14(旧国服)","publisher":"盛大","type":"网游","release":"2014-08","death":"2023-08","reason":"代理更换","reason_emoji":"🔄","lifespan":"9年","epitaph":"等来了7.0，却等不来数据继承","comment":"老国服时代的落幕","candles":92,"played":34},
    {"id":"diablo3","icon":"💀","name":"暗黑破坏神3(国服)","publisher":"暴雪","type":"网游","release":"2015-04","death":"2023-01","reason":"代理到期","reason_emoji":"🔄","lifespan":"8年","epitaph":"暴雪全家桶塌房第一块多米诺","candles":145,"played":50},
    {"id":"ow","icon":"🦸","name":"守望先锋","publisher":"暴雪","type":"网游","release":"2016-05","death":"2022-11","reason":"代理决裂","reason_emoji":"💔","lifespan":"6年","epitaph":"暴雪和网易的分手礼","candles":234,"played":77},
    {"id":"apexm","icon":"🎯","name":"Apex英雄手游","publisher":"EA","type":"手游","release":"2022-05","death":"2023-05","reason":"全球停服","reason_emoji":"💀","lifespan":"1年","epitaph":"和所有手游一样，打不过和平精英","candles":56,"played":23},
    {"id":"kf2cn","icon":"🗡️","name":"剑灵2(国服)","publisher":"腾讯","type":"手游","release":"2023-08","death":"2024-08","reason":"运营暴死","reason_emoji":"💥","lifespan":"1年","epitaph":"MMO已经没人玩了","candles":89,"played":33},
    {"id":"qqpet","icon":"🐧","name":"QQ宠物","publisher":"腾讯","type":"网游","release":"2005-06","death":"2018-09","reason":"运营停滞","reason_emoji":"⏰","lifespan":"13年","epitaph":"一代人的电子宠物启蒙","comment":"鹅厂最经典的社交养成游戏没有之一","candles":312,"played":100},
    {"id":"roko","icon":"🎻","name":"洛奇","publisher":"世纪天成","type":"网游","release":"2005-11","death":"2023-12","reason":"运营停滞","reason_emoji":"⏰","lifespan":"18年","epitaph":"养活了无数代练工作室","candles":78,"played":30},
    {"id":"dnfht","icon":"🔥","name":"DNF怀旧服","publisher":"腾讯","type":"网游","release":"2023-08","death":"2024-03","reason":"运营暴死","reason_emoji":"💥","lifespan":"7个月","epitaph":"怀旧也救不了阿拉德","candles":45,"played":20},
    {"id":"aion","icon":"🦅","name":"永恒之塔","publisher":"盛趣","type":"网游","release":"2009-04","death":"2023-06","reason":"运营停滞","reason_emoji":"⏰","lifespan":"14年","epitaph":"外挂毁了一切","candles":67,"played":27},
    {"id":"seal","icon":"🪨","name":"封印之剑","publisher":"久游","type":"网游","release":"2007-08","death":"2014-12","reason":"运营停滞","reason_emoji":"⏰","lifespan":"7年","epitaph":"被自家劲舞团赚的钱烧没了","candles":23,"played":13},
    {"id":"redmoon","icon":"🌕","name":"红月","publisher":"亚联","type":"网游","release":"2001-06","death":"2006-12","reason":"运营停滞","reason_emoji":"⏰","lifespan":"5年","epitaph":"比传奇还早的网游活化石","candles":34,"played":17},
    {"id":"fanren","icon":"🎋","name":"凡人修仙传OL","publisher":"百游","type":"网游","release":"2012-05","death":"2018-08","reason":"运营停滞","reason_emoji":"⏰","lifespan":"6年","epitaph":"当年比盗墓笔记还火的修仙IP","candles":56,"played":23},
    {"id":"yutian","icon":"👹","name":"御天降魔传","publisher":"完美世界","type":"网游","release":"2015-08","death":"2020-12","reason":"运营停滞","reason_emoji":"⏰","lifespan":"5年","epitaph":"国产单机里动作做得最好的之一","candles":12,"played":10},
    {"id":"xianxia","icon":"🧙","name":"仙侠世界","publisher":"巨人网络","type":"网游","release":"2014-03","death":"2022-12","reason":"运营停滞","reason_emoji":"⏰","lifespan":"8年","epitaph":"也没干翻","candles":45,"played":20},
    {"id":"diablo_immortal","icon":"💀","name":"暗黑破坏神:不朽(国服)","publisher":"暴雪","type":"手游","release":"2022-07","death":"2023-01","reason":"代理到期","reason_emoji":"🔄","lifespan":"6个月","epitaph":"全球最赚钱暗黑手游但国服没活过半年","candles":678,"played":210},
    {"id":"hearthstone","icon":"🃏","name":"炉石传说(国服)","publisher":"暴雪","type":"手游","release":"2014-01","death":"2023-01","reason":"代理决裂","reason_emoji":"💔","lifespan":"9年","epitaph":"一场分手引发的血案","candles":445,"played":140},
    {"id":"d2r","icon":"🔥","name":"暗黑2重制(国服)","publisher":"暴雪","type":"网游","release":"2021-09","death":"2023-01","reason":"代理到期","reason_emoji":"🔄","lifespan":"1.3年","epitaph":"暴雪全家桶的一部分","candles":89,"played":33},
    {"id":"fifaonline","icon":"⚽","name":"FIFA Online 4","publisher":"腾讯","type":"网游","release":"2018-06","death":"2024-06","reason":"运营停滞","reason_emoji":"⏰","lifespan":"6年","epitaph":"被FIFA Mobile和实况手游夹击","candles":156,"played":53},
    {"id":"nba2kol","icon":"🏀","name":"NBA2K Online","publisher":"腾讯","type":"网游","release":"2013-05","death":"2024-01","reason":"运营停滞","reason_emoji":"⏰","lifespan":"11年","epitaph":"2K系列在中国最后的辉煌","candles":134,"played":47},
    {"id":"nfsol","icon":"🏎️","name":"极品飞车OL","publisher":"腾讯","type":"网游","release":"2017-11","death":"2022-12","reason":"运营停滞","reason_emoji":"⏰","lifespan":"5年","epitaph":"和微软的Forza一起沉了","candles":34,"played":17},
    {"id":"kof_destiny","icon":"🥊","name":"拳皇命运","publisher":"腾讯","type":"手游","release":"2018-05","death":"2021-08","reason":"运营停滞","reason_emoji":"⏰","lifespan":"3年","epitaph":"拳皇只能活在街机厅","candles":23,"played":13},
    {"id":"xingchen","icon":"⭐","name":"星辰变","publisher":"盛大","type":"手游","release":"2011-05","death":"2019-12","reason":"运营停滞","reason_emoji":"⏰","lifespan":"8年","epitaph":"和小说一样，后期乏力","candles":45,"played":20},
    {"id":"tianxia2","icon":"🏔️","name":"天下贰","publisher":"网易","type":"网游","release":"2008-03","death":"2023-06","reason":"运营停滞","reason_emoji":"⏰","lifespan":"15年","epitaph":"被自家天下3取代的经典","candles":89,"played":33},
    {"id":"cangqiong","icon":"⚡","name":"苍穹之剑","publisher":"蓝港","type":"网游","release":"2014-09","death":"2020-12","reason":"运营停滞","reason_emoji":"⏰","lifespan":"6年","epitaph":"被阴阳师的光环掩盖","candles":23,"played":13},
    {"id":"anhei_dawn","icon":"🌑","name":"暗黑黎明","publisher":"蓝港","type":"网游","release":"2015-01","death":"2022-06","reason":"运营停滞","reason_emoji":"⏰","lifespan":"7年","epitaph":"质量和名字一样黑暗","candles":34,"played":17},
    {"id":"xunlongjue","icon":"🐉","name":"寻龙诀","publisher":"网易","type":"网游","release":"2018-10","death":"2021-10","reason":"运营暴死","reason_emoji":"💥","lifespan":"3年","epitaph":"IP是好IP，游戏不是","candles":12,"played":10},
    {"id":"calabash","icon":"🎯","name":"卡拉比丘","publisher":"创天互娱","type":"手游","release":"2023-09","death":"2024-06","reason":"运营暴死","reason_emoji":"💥","lifespan":"9个月","epitaph":"试图复刻瓦洛兰特的失败案例","candles":67,"played":27},
    {"id":"blue_protocol","icon":"🔵","name":"蓝色协议(国服)","publisher":"腾讯","type":"手游","release":"2024-03","death":"2024-08","reason":"运营暴死","reason_emoji":"💥","lifespan":"5个月","epitaph":"还没火就凉了","candles":89,"played":33},
    {"id":"yanyun16","icon":"🎻","name":"燕云十六声(内测)","publisher":"网易","type":"手游","release":"2023-12","death":"2024-03","reason":"运营暴死","reason_emoji":"💥","lifespan":"3个月","epitaph":"首测资格比演唱会票还难抢","candles":234,"played":77},
    {"id":"naraka","icon":"⚔️","name":"永劫无间(走下坡)","publisher":"网易","type":"网游","release":"2021-07","death":"2024-12","reason":"运营停滞","reason_emoji":"⏰","lifespan":"3年","epitaph":"转免后反而更快凉了","candles":567,"played":177},
    {"id":"ace_warrior","icon":"🔫","name":"王牌战士","publisher":"腾讯","type":"手游","release":"2019-08","death":"2024-06","reason":"运营停滞","reason_emoji":"⏰","lifespan":"5年","epitaph":"腾讯的守望先锋青春版","comment":"试图复刻OW没成功","candles":45,"played":20},
    {"id":"gale_blade","icon":"💨","name":"疾风之刃","publisher":"腾讯","type":"网游","release":"2014-12","death":"2022-11","reason":"运营停滞","reason_emoji":"⏰","lifespan":"8年","epitaph":"外挂和运营双重打击","candles":56,"played":23},
    {"id":"luoqi","icon":"🎻","name":"洛奇","publisher":"Nexon","type":"网游","release":"2005-11","death":"2023-12","reason":"运营停滞","reason_emoji":"⏰","lifespan":"18年","epitaph":"养活了无数代练工作室","candles":78,"played":30},
    {"id":"rexuejh2","icon":"🗡️","name":"热血江湖2","publisher":"17game","type":"网游","release":"2015-07","death":"2020-12","reason":"运营停滞","reason_emoji":"⏰","lifespan":"5年","epitaph":"续集永远不如第一代","candles":23,"played":13},
    {"id":"rx_cq_huai","icon":"👑","name":"热血传奇怀旧服","publisher":"盛趣","type":"网游","release":"2018-06","death":"2022-12","reason":"运营停滞","reason_emoji":"⏰","lifespan":"4年","epitaph":"情怀也救不了的传奇","candles":89,"played":33},
    {"id":"rainbow","icon":"🌈","name":"彩虹岛","publisher":"盛大","type":"网游","release":"2007-05","death":"2023-08","reason":"运营停滞","reason_emoji":"⏰","lifespan":"16年","epitaph":"和冒险岛一起被遗忘","candles":67,"played":27},
    {"id":"mxd_huai","icon":"🍁","name":"冒险岛怀旧服","publisher":"盛趣","type":"网游","release":"2022-12","death":"2024-02","reason":"运营暴死","reason_emoji":"💥","lifespan":"1年","epitaph":"怀旧服比官服死得还快","candles":34,"played":17},
    {"id":"archeage","icon":"⛵","name":"上古世纪","publisher":"腾讯","type":"网游","release":"2015-08","death":"2023-12","reason":"运营停滞","reason_emoji":"⏰","lifespan":"8年","epitaph":"CryEngine引擎也救不了的运营","candles":56,"played":23},
    {"id":"dragon_nest","icon":"🐉","name":"龙之谷","publisher":"盛大","type":"网游","release":"2010-07","death":"2023-12","reason":"运营停滞","reason_emoji":"⏰","lifespan":"13年","epitaph":"和龙之谷2一样慢慢淡出","candles":145,"played":50},
    {"id":"xunxian","icon":"🧙","name":"寻仙","publisher":"腾讯","type":"网游","release":"2008-10","death":"2023-12","reason":"运营停滞","reason_emoji":"⏰","lifespan":"15年","epitaph":"中国味最浓的MMO","candles":78,"played":30},
    {"id":"chuangshi","icon":"🐒","name":"创世西游","publisher":"网易","type":"网游","release":"2011-07","death":"2015-12","reason":"运营暴死","reason_emoji":"💥","lifespan":"4年","epitaph":"好游戏死得早的经典案例","candles":34,"played":17},
    {"id":"qqxianxia","icon":"✨","name":"QQ仙侠传","publisher":"腾讯","type":"网游","release":"2011-09","death":"2020-12","reason":"运营停滞","reason_emoji":"⏰","lifespan":"9年","epitaph":"被自家天涯明月刀碾压","candles":45,"played":20},
    {"id":"freedom_war","icon":"⚡","name":"自由之战","publisher":"盖娅互娱","type":"手游","release":"2015-01","death":"2019-12","reason":"运营暴死","reason_emoji":"💥","lifespan":"5年","epitaph":"腾讯的王者荣耀直接抄死它","candles":89,"played":33},
    {"id":"vainglory","icon":"🏆","name":"虚荣(国服)","publisher":"巨人网络","type":"手游","release":"2015-11","death":"2020-12","reason":"全球停服","reason_emoji":"💀","lifespan":"5年","epitaph":"触屏操作天花板，可惜没人玩","candles":67,"played":27},
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    existing = db.query(Game).count()
    if existing > 0:
        print(f"数据库已有 {existing} 条记录，跳过 seed")
        db.close()
        return

    for g in GAMES:
        game = Game(
            id=g["id"],
            icon=g["icon"],
            name=g["name"],
            publisher=g["publisher"],
            type=g.get("type", "网游"),
            release=g["release"],
            death=g["death"],
            reason=g["reason"],
            reason_emoji=g["reason_emoji"],
            lifespan=g["lifespan"],
            epitaph=g["epitaph"],
            comment=g.get("comment", ""),
            candles=g["candles"],
            played=g["played"],
            is_user_submitted=False,
        )
        db.add(game)

    db.commit()
    db.close()
    print(f"Seed 完成：插入 {len(GAMES)} 款游戏")


if __name__ == "__main__":
    seed()
