// 详情弹窗 - 讣告风格
// 包含 2 个 tab：详情（墓志铭+4 字段）/ 留言（CommentsSection）

import { useState } from "react"
import { X } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CommentsSection } from "./CommentsSection"
import type { Game, Comment } from "@/types/game"

interface GameDialogProps {
  game: Game | null
  comments: Comment[]
  candleCount: number
  highlightKeyword?: string
  onOpenChange: (open: boolean) => void
  onAddComment: (author: string, content: string, image?: string) => void
  onDeleteComment: (commentId: string) => void
  onCandleClick: () => void
  onPlayedClick: () => void
  isLoggedIn: boolean
  isAdmin: boolean
  onLoginRequest: () => void
  onEditGame?: () => void
  onDeleteGame?: () => void
}

export function GameDialog({
  game,
  comments,
  candleCount,
  highlightKeyword,
  onOpenChange,
  onAddComment,
  onDeleteComment,
  onCandleClick,
  onPlayedClick,
  isLoggedIn,
  isAdmin,
  onLoginRequest,
  onEditGame,
  onDeleteGame,
}: GameDialogProps) {
  // 弹窗内每次打开重置到"详情" tab
  const [tab, setTab] = useState("detail")
  const open = !!game

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md bg-white border-2 border-[#0a0a0a] rounded-none"
        style={{ boxShadow: "5px 5px 0 #0a0a0a" }}
        onOpenAutoFocus={() => setTab("detail")}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 border-2 border-[#0a0a0a] bg-white flex items-center justify-center text-4xl rotate-[-8deg] shrink-0">
              {game?.icon?.startsWith("/game-icons/") || game?.icon?.startsWith("data:") ? (
                <img src={game.icon} alt="" className="w-12 h-12 object-contain" />
              ) : (
                game?.icon
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#a0a0a0] font-mono">
                OBITUARY · 已停服
              </p>
              <DialogTitle
                className="text-xl font-black text-[#0a0a0a] inline-flex items-center gap-2"
                style={{ fontFamily: '"Playfair Display", "Noto Serif SC", serif' }}
              >
                {game?.name}
                {isAdmin && (
                  <span className="flex items-center gap-1 ml-2">
                    {onEditGame && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onEditGame() }}
                        className="text-xs border-2 border-[#0a0a0a] px-2 py-0.5 font-mono bg-white hover:bg-[#e8e8e8]"
                        title="编辑墓碑"
                      >
                        ✏️
                      </button>
                    )}
                    {onDeleteGame && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteGame() }}
                        className="text-xs border-2 border-[#0a0a0a] px-2 py-0.5 font-mono bg-white hover:bg-[#e8e8e8]"
                        title="删除墓碑"
                      >
                        🗑️
                      </button>
                    )}
                  </span>
                )}
              </DialogTitle>
              <p className="text-sm text-[#5a5a5a] mt-0.5 font-mono">
                {game?.release} — {game?.death} · {game?.lifespan}
              </p>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          {/* 讣告风格 tab list：黑边 + 选中 = 黑底白字 */}
          <TabsList className="w-full bg-transparent border-2 border-[#0a0a0a] rounded-none p-0 h-auto">
            <TabsTrigger
              value="detail"
              className="flex-1 rounded-none border-0 border-r-2 border-[#0a0a0a] py-2 text-sm font-black data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-[#fafafa] text-[#0a0a0a] hover:bg-[#e8e8e8] data-[state=active]:hover:bg-[#0a0a0a] data-[state=inactive]:shadow-none"
            >
              ⚰ 详情
            </TabsTrigger>
            <TabsTrigger
              value="comments"
              className="flex-1 rounded-none border-0 py-2 text-sm font-black data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-[#fafafa] text-[#0a0a0a] hover:bg-[#e8e8e8] data-[state=active]:hover:bg-[#0a0a0a] data-[state=inactive]:shadow-none"
            >
              💬 留言 {comments.length > 0 && `(${comments.length})`}
            </TabsTrigger>
          </TabsList>

          {/* 详情 tab */}
          <TabsContent value="detail" className="mt-4">
            <div className="space-y-4">
              {/* 顶部双线墓志铭 */}
              <div className="border-t-2 border-b-2 border-[#0a0a0a] py-3">
                <p
                  className="text-base text-[#0a0a0a] text-center font-black"
                  style={{ fontFamily: '"Playfair Display", "Noto Serif SC", serif' }}
                >
                  「{game?.epitaph}」
                </p>
              </div>
              {/* 4 个字段框 */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-[#f0f0f0] border-2 border-[#0a0a0a] rounded-none p-3">
                  <p className="text-[#5a5a5a] text-xs uppercase tracking-wider font-mono">发行商</p>
                  <p className="font-black mt-0.5 text-[#0a0a0a]">{game?.publisher}</p>
                </div>
                <div className="bg-[#f0f0f0] border-2 border-[#0a0a0a] rounded-none p-3">
                  <p className="text-[#5a5a5a] text-xs uppercase tracking-wider font-mono">死因</p>
                  <p className="font-black mt-0.5 text-[#0a0a0a]">{game?.reasonEmoji} {game?.reason}</p>
                </div>
                <div className="bg-[#f0f0f0] border-2 border-[#0a0a0a] rounded-none p-3">
                  <p className="text-[#5a5a5a] text-xs uppercase tracking-wider font-mono">生命周期</p>
                  <p className="font-black mt-0.5 text-[#0a0a0a] font-mono">{game?.lifespan}</p>
                </div>
                <div className="bg-[#f0f0f0] border-2 border-[#0a0a0a] rounded-none p-3">
                  <p className="text-[#5a5a5a] text-xs uppercase tracking-wider font-mono">蜡烛</p>
                  <p className="font-black mt-0.5 text-[#0a0a0a] font-mono">🕯️ {candleCount}</p>
                </div>
              </div>
              <p className="text-sm text-[#5a5a5a] border-t-2 border-[#0a0a0a] pt-3 font-mono">
                💬 {game?.comment}
              </p>
            </div>
          </TabsContent>

          {/* 留言 tab */}
          <TabsContent value="comments" className="mt-4">
            <CommentsSection
              gameId={game?.id ?? ""}
              comments={comments}
              onAddComment={onAddComment}
              onDeleteComment={onDeleteComment}
              isLoggedIn={isLoggedIn}
              isAdmin={isAdmin}
              onLoginRequest={onLoginRequest}
              highlightKeyword={highlightKeyword}
            />
          </TabsContent>
        </Tabs>

        {/* 底部按钮（详情/留言 都可见） */}
        <div className="flex gap-2 mt-2">
          <Button
            className="flex-1 bg-[#0a0a0a] text-[#fafafa] border-2 border-[#0a0a0a] rounded-none font-black tracking-wider hover:bg-[#fafafa] hover:text-[#0a0a0a] transition-colors"
            onClick={onCandleClick}
          >
            🕯️ 点蜡烛
          </Button>
          <Button
            variant="outline"
            className={`flex-1 border-2 border-[#0a0a0a] rounded-none bg-white font-black transition-colors ${
              isLoggedIn
                ? "text-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-[#fafafa]"
                : "text-[#a0a0a0] cursor-not-allowed"
            }`}
            onClick={isLoggedIn ? onPlayedClick : onLoginRequest}
            title={isLoggedIn ? undefined : "请先登录"}
          >
            👋 我玩过
          </Button>
        </div>

        <DialogClose className="absolute top-4 right-4 rounded-none bg-[#0a0a0a] text-[#fafafa] w-8 h-8 flex items-center justify-center border-2 border-[#0a0a0a] hover:bg-[#fafafa] hover:text-[#0a0a0a] transition-colors">
          <X className="h-4 w-4" />
          <span className="sr-only">关闭</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}
