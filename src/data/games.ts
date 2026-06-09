// 51 款停服/暴死的国产游戏数据（fallback，后端 API 是真理之源）
// 数据来源：玩家社群整理 + 后端 SQLite

import type { Game } from "@/types/game"

export const GAMES: Game[] = [
  { id: "gfl2", icon: "/game-icons/少女前线2.jpg", name: "少女前线2", publisher: "散爆网络", type: "手游", release: "2024-01", death: "2024-07", reason: "运营暴死", reason_emoji: "💥", lifespan: "0.5年", epitaph: "二次元抽卡界的塌房代表作", comment: "6个月从万众期待到万人唾弃", candles: 1025, played: 315 },
  { id: "diablo_immortal", icon: "💀", name: "暗黑破坏神:不朽(国服)", publisher: "暴雪", type: "手游", release: "2022-07", death: "2023-01", reason: "代理到期", reason_emoji: "🔄", lifespan: "6个月", epitaph: "全球最赚钱暗黑手游但国服没活过半年", comment: "", candles: 679, played: 210 },
  { id: "naraka", icon: "/game-icons/永劫无间(走下坡).jpg", name: "永劫无间(走下坡)", publisher: "网易", type: "网游", release: "2021-07", death: "2024-12", reason: "运营停滞", reason_emoji: "⏰", lifespan: "3年", epitaph: "转免后反而更快凉了", comment: "", candles: 569, played: 179 },
  { id: "hearthstone", icon: "/game-icons/炉石传说.jpg", name: "炉石传说(国服)", publisher: "暴雪", type: "手游", release: "2014-01", death: "2023-01", reason: "代理决裂", reason_emoji: "💔", lifespan: "9年", epitaph: "一场分手引发的血案", comment: "", candles: 445, played: 141 },
  { id: "qqpet", icon: "/game-icons/QQ宠物.png", name: "QQ宠物", publisher: "腾讯", type: "网游", release: "2005-06", death: "2018-09", reason: "运营停滞", reason_emoji: "⏰", lifespan: "13年", epitaph: "一代人的电子宠物启蒙", comment: "鹅厂最经典的社交养成游戏没有之一", candles: 313, played: 102 },
  { id: "hots", icon: "/game-icons/风暴英雄.jpg", name: "风暴英雄", publisher: "暴雪", type: "网游", release: "2015-06", death: "2018-12", reason: "全球停服", reason_emoji: "💀", lifespan: "3.5年", epitaph: "MOBA 界的富二代，靠爹妈砸钱续命也没救活", comment: "暴雪最自豪的'我们终于有自己的 DOTA 了'，3年后官方宣布'我们不要了'", candles: 256, played: 83 },
  { id: "ow", icon: "/game-icons/守望先锋(国服).jpg", name: "守望先锋", publisher: "暴雪", type: "网游", release: "2016-05", death: "2022-11", reason: "代理决裂", reason_emoji: "💔", lifespan: "6年", epitaph: "暴雪和网易的分手礼", comment: "", candles: 235, played: 78 },
  { id: "yanyun16", icon: "/game-icons/燕云十六声(内测).jpg", name: "燕云十六声(内测)", publisher: "网易", type: "手游", release: "2023-12", death: "2024-03", reason: "运营暴死", reason_emoji: "💥", lifespan: "3个月", epitaph: "首测资格比演唱会票还难抢", comment: "", candles: 234, played: 77 },
  { id: "rhythm", icon: "/game-icons/节奏大师.jpg", name: "节奏大师", publisher: "腾讯", type: "手游", release: "2012-09", death: "2024-02", reason: "运营停滞", reason_emoji: "⏰", lifespan: "12年", epitaph: "通勤路上的指尖舞蹈", comment: "被版权和短视频一起打败", candles: 167, played: 57 },
  { id: "fifaonline", icon: "/game-icons/FIFA Online 4.jpg", name: "FIFA Online 4", publisher: "腾讯", type: "网游", release: "2018-06", death: "2024-06", reason: "运营停滞", reason_emoji: "⏰", lifespan: "6年", epitaph: "被FIFA Mobile和实况手游夹击", comment: "", candles: 156, played: 53 },
  { id: "diablo3", icon: "/game-icons/暗黑破坏神3(国服).jpg", name: "暗黑破坏神3(国服)", publisher: "暴雪", type: "网游", release: "2015-04", death: "2023-01", reason: "代理到期", reason_emoji: "🔄", lifespan: "8年", epitaph: "暴雪全家桶塌房第一块多米诺", comment: "", candles: 145, played: 50 },
  { id: "dragon_nest", icon: "/game-icons/龙之谷.jpg", name: "龙之谷", publisher: "盛大", type: "网游", release: "2010-07", death: "2023-12", reason: "运营停滞", reason_emoji: "⏰", lifespan: "13年", epitaph: "和龙之谷2一样慢慢淡出", comment: "", candles: 145, played: 50 },
  { id: "qqtang", icon: "/game-icons/QQ堂.jpg", name: "QQ堂-改", publisher: "腾讯", type: "网游", release: "2004-11", death: "2018-08", reason: "运营停滞", reason_emoji: "⏰", lifespan: "14年", epitaph: "童年最爱的休闲网游，泡泡堂的中国亲戚", comment: "被自家 QQ飞车+LOL+王者联手打死的", candles: 131, played: 48 },
  { id: "nba2kol", icon: "/game-icons/NBA2K Online.jpg", name: "NBA2K Online", publisher: "腾讯", type: "网游", release: "2013-05", death: "2024-01", reason: "运营停滞", reason_emoji: "⏰", lifespan: "11年", epitaph: "2K系列在中国最后的辉煌", comment: "", candles: 134, played: 47 },
  { id: "ff14cn", icon: "/game-icons/最终幻想14(旧国服).jpg", name: "最终幻想14(旧国服)", publisher: "盛大", type: "网游", release: "2014-08", death: "2023-08", reason: "代理更换", reason_emoji: "🔄", lifespan: "9年", epitaph: "等来了7.0，却等不来数据继承", comment: "老国服时代的落幕", candles: 92, played: 34 },
  { id: "audition", icon: "/game-icons/劲舞团.jpg", name: "劲舞团", publisher: "久游", type: "网游", release: "2005-04", death: "2015-11", reason: "运营停滞", reason_emoji: "⏰", lifespan: "10年", epitaph: "非主流一代的青春", comment: "空格键按坏的青春", candles: 89, played: 33 },
  { id: "kf2cn", icon: "/game-icons/剑灵2(国服).jpg", name: "剑灵2(国服)", publisher: "腾讯", type: "手游", release: "2023-08", death: "2024-08", reason: "运营暴死", reason_emoji: "💥", lifespan: "1年", epitaph: "MMO已经没人玩了", comment: "", candles: 89, played: 33 },
  { id: "d2r", icon: "/game-icons/暗黑2重制(国服).jpg", name: "暗黑2重制(国服)", publisher: "暴雪", type: "网游", release: "2021-09", death: "2023-01", reason: "代理到期", reason_emoji: "🔄", lifespan: "1.3年", epitaph: "暴雪全家桶的一部分", comment: "", candles: 89, played: 33 },
  { id: "tianxia2", icon: "/game-icons/天下贰.jpg", name: "天下贰", publisher: "网易", type: "网游", release: "2008-03", death: "2023-06", reason: "运营停滞", reason_emoji: "⏰", lifespan: "15年", epitaph: "被自家天下3取代的经典", comment: "", candles: 89, played: 33 },
  { id: "blue_protocol", icon: "/game-icons/蓝色协议(国服).jpg", name: "蓝色协议(国服)", publisher: "腾讯", type: "手游", release: "2024-03", death: "2024-08", reason: "运营暴死", reason_emoji: "💥", lifespan: "5个月", epitaph: "还没火就凉了", comment: "", candles: 89, played: 33 },
  { id: "rx_cq_huai", icon: "/game-icons/热血传奇怀旧服.png", name: "热血传奇怀旧服", publisher: "盛趣", type: "网游", release: "2018-06", death: "2022-12", reason: "运营停滞", reason_emoji: "⏰", lifespan: "4年", epitaph: "情怀也救不了的传奇", comment: "", candles: 89, played: 33 },
  { id: "freedom_war", icon: "/game-icons/自由之战.jpg", name: "自由之战", publisher: "盖娅互娱", type: "手游", release: "2015-01", death: "2019-12", reason: "运营暴死", reason_emoji: "💥", lifespan: "5年", epitaph: "腾讯的王者荣耀直接抄死它", comment: "", candles: 89, played: 33 },
  { id: "maple2", icon: "/game-icons/冒险岛2.jpg", name: "冒险岛2", publisher: "腾讯", type: "网游", release: "2018-04", death: "2020-04", reason: "运营暴死", reason_emoji: "💥", lifespan: "2年", epitaph: "韩服还在，国服先走一步", comment: "", candles: 78, played: 30 },
  { id: "roko", icon: "/game-icons/洛奇.jpg", name: "洛奇", publisher: "世纪天成", type: "网游", release: "2005-11", death: "2023-12", reason: "运营停滞", reason_emoji: "⏰", lifespan: "18年", epitaph: "养活了无数代练工作室", comment: "", candles: 78, played: 30 },
  { id: "luoqi", icon: "/game-icons/洛奇.jpg", name: "洛奇", publisher: "Nexon", type: "网游", release: "2005-11", death: "2023-12", reason: "运营停滞", reason_emoji: "⏰", lifespan: "18年", epitaph: "养活了无数代练工作室", comment: "", candles: 78, played: 30 },
  { id: "xunxian", icon: "/game-icons/寻仙.jpg", name: "寻仙", publisher: "腾讯", type: "网游", release: "2008-10", death: "2023-12", reason: "运营停滞", reason_emoji: "⏰", lifespan: "15年", epitaph: "中国味最浓的MMO", comment: "", candles: 78, played: 30 },
  { id: "aion", icon: "/game-icons/永恒之塔.jpg", name: "永恒之塔", publisher: "盛趣", type: "网游", release: "2009-04", death: "2023-06", reason: "运营停滞", reason_emoji: "⏰", lifespan: "14年", epitaph: "外挂毁了一切", comment: "", candles: 67, played: 27 },
  { id: "calabash", icon: "/game-icons/卡拉比丘.png", name: "卡拉比丘", publisher: "创天互娱", type: "手游", release: "2023-09", death: "2024-06", reason: "运营暴死", reason_emoji: "💥", lifespan: "9个月", epitaph: "试图复刻瓦洛兰特的失败案例", comment: "", candles: 67, played: 27 },
  { id: "rainbow", icon: "/game-icons/彩虹岛.jpg", name: "彩虹岛", publisher: "盛大", type: "网游", release: "2007-05", death: "2023-08", reason: "运营停滞", reason_emoji: "⏰", lifespan: "16年", epitaph: "和冒险岛一起被遗忘", comment: "", candles: 67, played: 27 },
  { id: "vainglory", icon: "/game-icons/虚荣(国服).jpg", name: "虚荣(国服)", publisher: "巨人网络", type: "手游", release: "2015-11", death: "2020-12", reason: "全球停服", reason_emoji: "💀", lifespan: "5年", epitaph: "触屏操作天花板，可惜没人玩", comment: "", candles: 67, played: 27 },
  { id: "apexm", icon: "/game-icons/Apex英雄手游.jpg", name: "Apex英雄手游", publisher: "EA", type: "手游", release: "2022-05", death: "2023-05", reason: "全球停服", reason_emoji: "💀", lifespan: "1年", epitaph: "和所有手游一样，打不过和平精英", comment: "", candles: 56, played: 23 },
  { id: "fanren", icon: "/game-icons/凡人修仙传OL.png", name: "凡人修仙传OL", publisher: "百游", type: "网游", release: "2012-05", death: "2018-08", reason: "运营停滞", reason_emoji: "⏰", lifespan: "6年", epitaph: "当年比盗墓笔记还火的修仙IP", comment: "", candles: 56, played: 23 },
  { id: "gale_blade", icon: "/game-icons/疾风之刃.jpg", name: "疾风之刃", publisher: "腾讯", type: "网游", release: "2014-12", death: "2022-11", reason: "运营停滞", reason_emoji: "⏰", lifespan: "8年", epitaph: "外挂和运营双重打击", comment: "", candles: 56, played: 23 },
  { id: "archeage", icon: "/game-icons/上古世纪.jpg", name: "上古世纪", publisher: "腾讯", type: "网游", release: "2015-08", death: "2023-12", reason: "运营停滞", reason_emoji: "⏰", lifespan: "8年", epitaph: "CryEngine引擎也救不了的运营", comment: "", candles: 56, played: 23 },
  { id: "qqxianxia", icon: "/game-icons/QQ仙侠传.jpg", name: "QQ仙侠传", publisher: "腾讯", type: "网游", release: "2011-09", death: "2020-12", reason: "运营停滞", reason_emoji: "⏰", lifespan: "9年", epitaph: "被自家天涯明月刀碾压", comment: "", candles: 46, played: 21 },
  { id: "dnfht", icon: "🔥", name: "DNF怀旧服", publisher: "腾讯", type: "网游", release: "2023-08", death: "2024-03", reason: "运营暴死", reason_emoji: "💥", lifespan: "7个月", epitaph: "怀旧也救不了阿拉德", comment: "", candles: 45, played: 20 },
  { id: "xianxia", icon: "/game-icons/仙侠世界.jpg", name: "仙侠世界", publisher: "巨人网络", type: "网游", release: "2014-03", death: "2022-12", reason: "运营停滞", reason_emoji: "⏰", lifespan: "8年", epitaph: "也没干翻", comment: "", candles: 45, played: 20 },
  { id: "xingchen", icon: "/game-icons/星辰变.jpg", name: "星辰变", publisher: "盛大", type: "手游", release: "2011-05", death: "2019-12", reason: "运营停滞", reason_emoji: "⏰", lifespan: "8年", epitaph: "和小说一样，后期乏力", comment: "", candles: 45, played: 20 },
  { id: "ace_warrior", icon: "/game-icons/王牌战士.jpg", name: "王牌战士", publisher: "腾讯", type: "手游", release: "2019-08", death: "2024-06", reason: "运营停滞", reason_emoji: "⏰", lifespan: "5年", epitaph: "腾讯的守望先锋青春版", comment: "试图复刻OW没成功", candles: 45, played: 20 },
  { id: "xuanzhong", icon: "/game-icons/玄中记.jpg", name: "玄中记", publisher: "腾讯", type: "手游", release: "2022-05", death: "2023-04", reason: "运营暴死", reason_emoji: "💥", lifespan: "1年", epitaph: "鹅厂猪厂难得合作，结果双方都不要这孩子", comment: "合作生子的弃婴", candles: 34, played: 17 },
  { id: "redmoon", icon: "/game-icons/红月.jpg", name: "红月", publisher: "亚联", type: "网游", release: "2001-06", death: "2006-12", reason: "运营停滞", reason_emoji: "⏰", lifespan: "5年", epitaph: "比传奇还早的网游活化石", comment: "", candles: 34, played: 17 },
  { id: "nfsol", icon: "/game-icons/极品飞车OL.jpg", name: "极品飞车OL", publisher: "腾讯", type: "网游", release: "2017-11", death: "2022-12", reason: "运营停滞", reason_emoji: "⏰", lifespan: "5年", epitaph: "和微软的Forza一起沉了", comment: "", candles: 34, played: 17 },
  { id: "anhei_dawn", icon: "/game-icons/暗黑黎明.jpg", name: "暗黑黎明", publisher: "蓝港", type: "网游", release: "2015-01", death: "2022-06", reason: "运营停滞", reason_emoji: "⏰", lifespan: "7年", epitaph: "质量和名字一样黑暗", comment: "", candles: 34, played: 17 },
  { id: "mxd_huai", icon: "/game-icons/冒险岛怀旧服.jpg", name: "冒险岛怀旧服", publisher: "盛趣", type: "网游", release: "2022-12", death: "2024-02", reason: "运营暴死", reason_emoji: "💥", lifespan: "1年", epitaph: "怀旧服比官服死得还快", comment: "", candles: 34, played: 17 },
  { id: "chuangshi", icon: "/game-icons/创世西游.jpg", name: "创世西游", publisher: "网易", type: "网游", release: "2011-07", death: "2015-12", reason: "运营暴死", reason_emoji: "💥", lifespan: "4年", epitaph: "好游戏死得早的经典案例", comment: "", candles: 34, played: 17 },
  { id: "seal", icon: "/game-icons/封印之剑.jpg", name: "封印之剑", publisher: "久游", type: "网游", release: "2007-08", death: "2014-12", reason: "运营停滞", reason_emoji: "⏰", lifespan: "7年", epitaph: "被自家劲舞团赚的钱烧没了", comment: "", candles: 23, played: 13 },
  { id: "kof_destiny", icon: "/game-icons/拳皇命运.jpg", name: "拳皇命运", publisher: "腾讯", type: "手游", release: "2018-05", death: "2021-08", reason: "运营停滞", reason_emoji: "⏰", lifespan: "3年", epitaph: "拳皇只能活在街机厅", comment: "", candles: 23, played: 13 },
  { id: "cangqiong", icon: "/game-icons/苍穹之剑.png", name: "苍穹之剑", publisher: "蓝港", type: "网游", release: "2014-09", death: "2020-12", reason: "运营停滞", reason_emoji: "⏰", lifespan: "6年", epitaph: "被阴阳师的光环掩盖", comment: "", candles: 23, played: 13 },
  { id: "rexuejh2", icon: "/game-icons/热血江湖2.jpg", name: "热血江湖2", publisher: "17game", type: "网游", release: "2015-07", death: "2020-12", reason: "运营停滞", reason_emoji: "⏰", lifespan: "5年", epitaph: "续集永远不如第一代", comment: "", candles: 23, played: 13 },
  { id: "yutian", icon: "/game-icons/御天降魔传.jpg", name: "御天降魔传", publisher: "完美世界", type: "网游", release: "2015-08", death: "2020-12", reason: "运营停滞", reason_emoji: "⏰", lifespan: "5年", epitaph: "国产单机里动作做得最好的之一", comment: "", candles: 12, played: 10 },
  { id: "xunlongjue", icon: "/game-icons/寻龙诀.jpg", name: "寻龙诀", publisher: "网易", type: "网游", release: "2018-10", death: "2021-10", reason: "运营暴死", reason_emoji: "💥", lifespan: "3年", epitaph: "IP是好IP，游戏不是", comment: "", candles: 12, played: 10 },
]

// 发行商列表（去重 + 全部）
export const PUBLISHERS = ["全部", ...Array.from(new Set(GAMES.map((g) => g.publisher)))]

// 死因列表（去重 + 全部）
export const REASONS = ["全部", ...Array.from(new Set(GAMES.map((g) => g.reason)))]

// 总蜡烛数
export const TOTAL_CANDLES = 6699
// 总玩过数
export const TOTAL_PLAYED = 2350
