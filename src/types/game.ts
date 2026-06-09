// 数字墓园 - 业务类型定义（统一用 snake_case 与后端一致）

export type ReasonEmoji = "⏰" | "💀" | "💥" | "🔄" | "💔"

export type Reason =
  | "运营停滞"
  | "全球停服"
  | "运营暴死"
  | "代理更换"
  | "代理决裂"
  | "代理到期"

export type GameType = "网游" | "手游"

export interface Game {
  id: string
  icon: string
  name: string
  publisher: string
  type: GameType
  release: string
  death: string
  reason: Reason
  reason_emoji: ReasonEmoji
  lifespan: string
  epitaph: string
  comment: string
  candles: number
  played: number
  is_user_submitted?: boolean
}

// 玩家留言
export interface Comment {
  id: string
  game_id: string
  author: string
  content: string
  image?: string
  created_at: number
}

// 综合热度分
export function hotScore(g: Game): number {
  return g.candles + g.played * 2
}

// 全部游戏年份范围
import { GAMES } from "@/data/games"
const ALL_YEARS = GAMES.map((g) => Number(g.release.slice(0, 4)))
export const MIN_YEAR = Math.min(...ALL_YEARS)
export const MAX_YEAR = Math.max(...ALL_YEARS)
export interface FilterState {
  search: string
  publishers: string[]
  reasons: string[]
  types: string[]
  yearFrom: number
  yearTo: number
}
