// 游戏搜索 + 多选过滤 + 时间区间 + 综合排序

import { useMemo } from "react"
import type { Game, FilterState } from "@/types/game"
import { hotScore } from "@/types/game"

export function useGameFilter(games: Game[], filter: FilterState): Game[] {
  return useMemo(() => {
    const filtered = games.filter((g) => {
      // 搜索
      if (filter.search && !g.name.toLowerCase().includes(filter.search.toLowerCase())) {
        return false
      }
      // 多选发行商（空 = 全部）
      if (filter.publishers.length > 0 && !filter.publishers.includes(g.publisher)) {
        return false
      }
      // 多选死因
      if (filter.reasons.length > 0 && !filter.reasons.includes(g.reason)) {
        return false
      }
      // 多选类型（手游/网游）
      if (filter.types.length > 0 && !filter.types.includes(g.type)) {
        return false
      }
      // 时间区间
      const releaseYear = Number(g.release.slice(0, 4))
      if (releaseYear < filter.yearFrom || releaseYear > filter.yearTo) {
        return false
      }
      return true
    })
    return [...filtered].sort((a, b) => hotScore(b) - hotScore(a))
  }, [games, filter.search, filter.publishers, filter.reasons, filter.types, filter.yearFrom, filter.yearTo])
}
