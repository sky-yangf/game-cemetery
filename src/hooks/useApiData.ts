// 数据 hooks - 包装 API 调用 + 本地状态

import { useState, useEffect, useCallback } from "react"
import { api, type Game as ApiGame } from "@/lib/api"
import type { Game, Comment } from "@/types/game"
import { GAMES as FALLBACK_GAMES } from "@/data/games"

export function useGames() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)  // 清除历史错误
      const data = await api.getGames()
      // snake_case -> camelCase for compatibility
      const normalized = (data as unknown as Game[]).map((g) => ({
        ...g,
        reasonEmoji: g.reason_emoji,
        is_user_submitted: g.is_user_submitted ?? false,
      }))
      setGames(normalized)
    } catch (e) {
      setGames(FALLBACK_GAMES as Game[])
      setError(e instanceof Error ? e.message : "加载失败")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { games, loading, error, refresh }
}

export function useComments(gameId: string | null) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!gameId) return
    setLoading(true)
    try {
      const data = await api.getComments(gameId)
      const normalized = (data as unknown as Comment[]).map((c) => ({
        ...c,
        gameId: c.game_id,
        createdAt: new Date(c.created_at).getTime(),
      }))
      setComments(normalized)
    } catch (e) {
      console.warn("[useComments] 加载失败，保留旧数据:", e)
      // 不清空！保留旧数据防止"假丢数据"
    } finally {
      setLoading(false)
    }
  }, [gameId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { comments, loading, refresh }
}
