// API 客户端 - 调用 FastAPI 后端

// 优先相对路径（同源），vite proxy 会把 /api 转发到后端
const API = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "/api" : "http://localhost:8002")

function getUserId(): string {
  // 优先用登录用户名（这样 admin 删评论时 header 是 "admin"）
  const username = localStorage.getItem("cemetery-username")
  if (username === "admin") return "admin"

  let id = localStorage.getItem("cemetery-user-id")
  if (!id) {
    // 用 crypto.randomUUID 兜底，不可用时退到时间戳+随机数
    id = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem("cemetery-user-id", id)
  }
  return id
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": getUserId(),
      ...(options.headers ?? {}),
    },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`API ${res.status}: ${body}`)
  }
  return res.json()
}

export const api = {
  // Games
  getGames: (params?: { publisher?: string; reason?: string; type?: string; q?: string }) => {
    const qs = new URLSearchParams()
    if (params?.publisher) qs.set("publisher", params.publisher)
    if (params?.reason) qs.set("reason", params.reason)
    if (params?.type) qs.set("type", params.type)
    if (params?.q) qs.set("q", params.q)
    const q = qs.toString()
    return request<Game[]>(`/api/games${q ? `?${q}` : ""}`)
  },

  getGame: (id: string) => request<Game>(`/api/games/${id}`),

  createGame: (body: GameCreate) =>
    request<Game>(`/api/games`, { method: "POST", body: JSON.stringify(body) }),

  updateGame: (id: string, body: GameUpdate) =>
    request<Game>(`/api/games/${id}`, { method: "PATCH", body: JSON.stringify(body) }),

  deleteGame: (id: string) =>
    request<{ ok: boolean }>(`/api/games/${id}`, { method: "DELETE" }),

  // Candle
  addCandle: (gameId: string) =>
    request<CandleOut>(`/api/games/${gameId}/candle`, { method: "POST", body: "{}" }),

  // Played
  markPlayed: (gameId: string) =>
    request<PlayedOut>(`/api/games/${gameId}/played`, { method: "POST", body: "{}" }),

  // Comments
  getComments: (gameId: string) => request<Comment[]>(`/api/games/${gameId}/comments`),

  createComment: (gameId: string, body: CommentCreate) =>
    request<Comment>(`/api/games/${gameId}/comments`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  deleteComment: (gameId: string, commentId: string) =>
    request<{ ok: boolean }>(`/api/games/${gameId}/comments/${commentId}`, {
      method: "DELETE",
    }),
}

export interface Game {
  id: string
  icon: string
  name: string
  publisher: string
  type: string
  release: string
  death: string
  reason: string
  reason_emoji: string
  lifespan: string
  epitaph: string | null
  comment: string | null
  candles: number
  played: number
  is_user_submitted: boolean
  submitted_by: string | null
  updated_by: string | null
  updated_at: string | null
}

export interface GameCreate {
  icon: string
  name: string
  publisher: string
  type: string
  release: string
  death: string
  reason: string
  reason_emoji: string
  epitaph?: string
}

export type GameUpdate = Partial<GameCreate>

export interface CandleOut {
  game_id: string
  total_candles: number
}

export interface PlayedOut {
  game_id: string
  played: boolean
  already_marked: boolean
}

export interface ApiComment {
  id: string
  game_id: string
  author: string
  content: string
  image: string | null
  created_at: string
}

export interface CommentCreate {
  author: string
  content: string
  image?: string
}

export type { Game as ApiGame }

// Local Comment type matching api response (snake_case from backend)
export interface Comment {
  id: string
  game_id: string
  author: string
  content: string
  image: string | null
  created_at: string
}
