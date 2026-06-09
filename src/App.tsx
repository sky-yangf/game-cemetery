// 数字墓园 - 主页面
// 讣告风格：黑白 + 衬线 + 撕边 + 硬投影 + 旋转
// 数据：后端 API（任务 6）+ 管理员提交/编辑/删除墓碑

import { useState, useCallback } from "react"
import { Header } from "@/components/Header"
import { Hero } from "@/components/Hero"
import { FilterPanel } from "@/components/FilterPanel"
import { CemeteryGrid } from "@/components/CemeteryGrid"
import { GameDialog } from "@/components/GameDialog"
import { ColdStartHint } from "@/components/ColdStartHint"
import { LoginDialog } from "@/components/LoginDialog"
import { SubmitObituaryDialog } from "@/components/SubmitObituaryDialog"
import { EditGameDialog } from "@/components/EditGameDialog"
import { DailyEpitaph } from "@/components/DailyEpitaph"
import { useGames, useComments } from "@/hooks/useApiData"
import { api, type Game } from "@/lib/api"
import { useGameFilter } from "@/hooks/useGameFilter"
import { useQuoteRotation } from "@/hooks/useQuoteRotation"
import type { FilterState } from "@/types/game"
import { MIN_YEAR, MAX_YEAR } from "@/types/game"
import { PUBLISHERS, REASONS } from "@/data/games"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import { Toaster, toast } from "sonner"

export default function App() {
  // 数据
  const { games, loading, error, refresh: refreshGames } = useGames()

  // 当前用户
  const [username, setUsername] = useState<string | null>(
    () => localStorage.getItem("cemetery-username")
  )

  // 筛选
  const [filter, setFilter] = useState<FilterState>({
    search: "",
    publishers: [],
    reasons: [],
    types: [],
    yearFrom: MIN_YEAR,
    yearTo: MAX_YEAR,
  })

  // 选中
  const [selected, setSelected] = useState<Game | null>(null)

  // 弹窗
  const [showLogin, setShowLogin] = useState(false)
  const [showSubmit, setShowSubmit] = useState(false)
  const [editGame, setEditGame] = useState<Game | null>(null)

  // 留言（按当前选中的 gameId 加载）
  const { comments: currentComments, refresh: refreshComments } = useComments(
    selected?.id ?? null
  )

  // 墓志铭轮播
  const quoteIdx = useQuoteRotation(games.length)

  // 过滤后的游戏
  const filtered = useGameFilter(games, filter)

  // 登录
  const handleLogin = useCallback((u: string) => {
    setUsername(u)
    localStorage.setItem("cemetery-username", u)
  }, [])

  const handleLogout = useCallback(() => {
    setUsername(null)
    localStorage.removeItem("cemetery-username")
  }, [])

  // 点蜡烛
  const handleCandle = useCallback(async (game: Game) => {
    const before = game.candles
    try {
      const res = await api.addCandle(game.id)
      // 立即更新详情弹窗的蜡烛数（不等 refreshGames）
      setSelected((prev) => prev && prev.id === game.id ? { ...prev, candles: res.total_candles } : prev)
      await refreshGames()
      if (res.total_candles > before) {
        toast.success("🕯️ 已点亮蜡烛", {
          description: `感谢 ${game.name} 留下的记忆`,
        })
      } else {
        toast.info("你今天已经点过蜡烛了", {
          description: "24 小时后才能再点一根",
        })
      }
    } catch (e) {
      toast.error(`点蜡烛失败：${e instanceof Error ? e.message : "未知错误"}`)
    }
  }, [refreshGames, games])

  // 玩过
  const handlePlayed = useCallback(async (game: Game) => {
    try {
      const res = await api.markPlayed(game.id)
      await refreshGames()
      const updated = games.find(g => g.id === game.id)
      if (updated) setSelected(updated)
      if (res.already_marked) {
        toast.info(`你之前已标记过「我玩过」${game.name}`, {
          description: "每个账户每款游戏只能标记一次",
        })
      } else {
        toast.success(`👋 已标记「我玩过」`, {
          description: `致敬 ${game.name} 的玩家岁月`,
        })
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "未知错误"
      toast.error(`标记失败：${msg}`)
    }
  }, [refreshGames, games])

  // 提交新墓碑
  const handleSubmitObituary = useCallback(async (game: Game) => {
    try {
      await api.createGame({
        icon: game.icon,
        name: game.name,
        publisher: game.publisher,
        type: game.type,
        release: game.release,
        death: game.death,
        reason: game.reason,
        reason_emoji: game.reasonEmoji,
        epitaph: game.epitaph,
      })
      await refreshGames()
      toast.success("🪦 墓碑已立", {
        description: `${game.name} 已加入墓园（待审核）`,
      })
    } catch (e) {
      toast.error(`提交失败：${e instanceof Error ? e.message : "未知错误"}`)
    }
  }, [refreshGames])

  // Admin 编辑保存
  const handleSaveEdit = useCallback(async (updates: Partial<Game>) => {
    if (!editGame) return
    try {
      await api.updateGame(editGame.id, {
        icon: updates.icon,
        name: updates.name,
        publisher: updates.publisher,
        type: updates.type,
        release: updates.release,
        death: updates.death,
        reason: updates.reason,
        reason_emoji: updates.reasonEmoji,
        epitaph: updates.epitaph,
      })
      await refreshGames()
      setEditGame(null)
      toast.success("✏️ 墓碑已更新")
    } catch (e) {
      toast.error(`保存失败：${e instanceof Error ? e.message : "未知错误"}`)
    }
  }, [editGame, refreshGames])

  // Admin 删除墓碑
  const handleDeleteGame = useCallback(async () => {
    if (!selected) return
    if (!confirm(`确定删除「${selected.name}」？\n\n此操作不可撤销（仅限用户提交的墓碑）`)) return
    try {
      await api.deleteGame(selected.id)
      setSelected(null)
      await refreshGames()
      toast.success("🗑️ 墓碑已删除", {
        description: selected.name,
      })
    } catch (e) {
      toast.error(`删除失败：${e instanceof Error ? e.message : "未知错误"}`)
    }
  }, [selected, refreshGames])

  // Admin 删除评论
  const handleDeleteComment = useCallback(async (commentId: string) => {
    if (!selected) return
    if (!confirm("确定删除这条留言？\n\n此操作不可撤销")) return
    try {
      await api.deleteComment(selected.id, commentId)
      await refreshComments()
      toast.success("🗑️ 留言已删除")
    } catch (e) {
      toast.error(`删除失败：${e instanceof Error ? e.message : "未知错误"}`)
    }
  }, [selected, refreshComments])

  // 留言
  const handleAddComment = useCallback(async (author: string, content: string, image?: string) => {
    if (!selected) return
    try {
      await api.createComment(selected.id, { author, content, image })
      await refreshComments()
      toast.success("💬 留言已发表", {
        description: image ? "（含图片）" : undefined,
      })
    } catch (e) {
      toast.error(`留言失败：${e instanceof Error ? e.message : "未知错误"}`)
    }
  }, [selected, refreshComments])

  // 统计
  const totalCandles = games.reduce((sum, g) => sum + g.candles, 0)
  const totalPlayed = games.reduce((sum, g) => sum + g.played, 0)

  return (
    <div className="min-h-screen bg-[var(--page-bg)] font-serif text-[#0a0a0a]">
      <Header
        username={username}
        onLoginClick={() => setShowLogin(true)}
        onLogout={handleLogout}
      />

      <main className="max-w-6xl mx-auto px-6">
        <Hero
          totalGames={games.length}
          totalCandles={totalCandles}
          totalPlayed={totalPlayed}
          isLoggedIn={!!username}
          onLoginRequest={() => setShowLogin(true)}
          onSubmitClick={username ? () => setShowSubmit(true) : () => setShowLogin(true)}
        />

        {games.length > 0 && <DailyEpitaph game={games[quoteIdx]} />}

        <FilterPanel
          filter={filter}
          onFilterChange={(partial) => setFilter((prev) => ({ ...prev, ...partial }))}
          publishers={PUBLISHERS}
          reasons={REASONS}
          yearFrom={MIN_YEAR}
          yearTo={MAX_YEAR}
        />

        {/* 错误提示 - 仅在没有任何数据时显示 */}
        {error && games.length === 0 && (
          <div className="border-2 border-[#0a0a0a] bg-[#fff8dc] p-3 my-4 flex items-center justify-between">
            <span className="text-sm font-mono">⚠️ 后端连接失败：{error}</span>
            <Button onClick={refreshGames} className="bg-[#0a0a0a] text-[#fafafa] rounded-none border-2 border-[#0a0a0a] text-xs font-mono">
              <RotateCcw className="h-3 w-3 mr-1" />重试
            </Button>
          </div>
        )}

        {loading && games.length === 0 ? (
          <div className="text-center my-12">
            <p className="text-[#5a5a5a] font-mono">加载中...</p>
            <ColdStartHint />
          </div>
        ) : (
          <CemeteryGrid
            games={filtered}
            search={filter.search}
            highlightKeyword={filter.search}
            onSearchChange={(v) => setFilter((f) => ({ ...f, search: v }))}
            onCardClick={setSelected}
            onPlayedClick={handlePlayed}
            onDetailClick={(g) => setSelected(g)}
            isLoggedIn={!!username}
          />
        )}
      </main>

      <GameDialog
        game={selected}
        comments={currentComments}
        candleCount={selected ? (selected.candles ?? 0) : 0}
        highlightKeyword={filter.search}
        onOpenChange={(o) => !o && setSelected(null)}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        onCandleClick={() => selected && handleCandle(selected)}
        onPlayedClick={() => selected && handlePlayed(selected)}
        isLoggedIn={!!username}
        isAdmin={username === "admin"}
        onLoginRequest={() => setShowLogin(true)}
        onEditGame={username === "admin" && selected ? () => setEditGame(selected) : undefined}
        onDeleteGame={username === "admin" && selected?.is_user_submitted ? handleDeleteGame : undefined}
      />

      <LoginDialog open={showLogin} onOpenChange={setShowLogin} onLogin={handleLogin} />
      <SubmitObituaryDialog
        open={showSubmit}
        onOpenChange={setShowSubmit}
        onSubmit={handleSubmitObituary}
      />
      <EditGameDialog
        game={editGame}
        open={!!editGame}
        onOpenChange={(o) => !o && setEditGame(null)}
        onSave={handleSaveEdit}
      />

      <footer className="max-w-6xl mx-auto px-6 py-8 mt-12 border-t-2 border-[#0a0a0a] text-center">
        <p className="text-sm text-[#5a5a5a] font-mono">
          R.I.P. · REST IN PIXELS · 已停服名录
        </p>
      </footer>

      <Toaster
        position="bottom-center"
        richColors
        toastOptions={{
          style: {
            background: "#fafafa",
            color: "#0a0a0a",
            border: "2px solid #0a0a0a",
            borderRadius: 0,
            fontFamily: '"Playfair Display", "Noto Serif SC", serif',
          },
        }}
      />
    </div>
  )
}
