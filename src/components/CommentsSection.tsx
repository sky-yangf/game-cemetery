// 留言区 - 讣告风格 + 图片上传 + 折叠/高亮

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Image as ImageIcon, X, ChevronDown, ChevronUp } from "lucide-react"
import type { Comment } from "@/types/game"
import { HighlightText } from "./HighlightText"

interface CommentsSectionProps {
  gameId: string
  comments: Comment[]
  onAddComment: (author: string, content: string, image?: string) => void
  onDeleteComment: (commentId: string) => void
  isLoggedIn: boolean
  isAdmin: boolean
  onLoginRequest: () => void
  highlightKeyword?: string  // 搜索关键字高亮
}

const COLLAPSE_THRESHOLD = 3

function formatTime(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function CommentsSection({
  gameId: _gameId,
  comments,
  onAddComment,
  onDeleteComment,
  isLoggedIn,
  isAdmin,
  onLoginRequest,
  highlightKeyword,
}: CommentsSectionProps) {
  const [author, setAuthor] = useState("")
  const [content, setContent] = useState("")
  const [image, setImage] = useState<string | null>(null)   // base64 data URL
  const [expanded, setExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const trimmed = content.trim()
  const canSubmit = (trimmed.length > 0 && trimmed.length <= 200) || image !== null

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert("图片最大 2MB")
      return
    }
    const reader = new FileReader()
    reader.onload = () => setImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  const clearImage = () => {
    setImage(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  const handleSubmit = () => {
    if (!canSubmit) return
    onAddComment(author.trim() || "匿名玩家", trimmed || "[图片]", image ?? undefined)
    setContent("")
    setImage(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  const needCollapse = comments.length > COLLAPSE_THRESHOLD
  const visibleComments = expanded ? comments : comments.slice(0, COLLAPSE_THRESHOLD)
  const hiddenCount = comments.length - COLLAPSE_THRESHOLD

  return (
    <div className="space-y-4">
      {/* 顶部统计 */}
      <div className="flex items-center justify-between border-b-2 border-[#0a0a0a] pb-2">
        <p className="text-xs uppercase tracking-[0.3em] text-[#5a5a5a] font-mono">
          💬 玩家留言 · {comments.length} 条
        </p>
      </div>

      {/* 留言列表 */}
      {comments.length === 0 ? (
        <p className="text-[#5a5a5a] text-center py-8 font-mono text-sm">
          还没有人留言，来做第一个
        </p>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {visibleComments.map((c) => (
            <div
              key={c.id}
              className="border-2 border-[#0a0a0a] bg-white p-3 transition-shadow hover:shadow-[3px_3px_0_#0a0a0a]"
              style={{ boxShadow: "2px 2px 0 #0a0a0a" }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-[#0a0a0a]">
                    <HighlightText text={c.author} keyword={highlightKeyword} />
                  </span>
                  <span className="text-[10px] text-[#5a5a5a] font-mono">
                    {formatTime(c.createdAt)}
                  </span>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => onDeleteComment(c.id)}
                    className="text-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-[#fafafa] transition-colors p-0.5"
                    title="删除留言"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              {c.content && c.content !== "[图片]" && (
                <p className="text-sm text-[#0a0a0a] leading-relaxed break-words">
                  <HighlightText text={c.content} keyword={highlightKeyword} />
                </p>
              )}
              {c.image && (
                <img
                  src={c.image}
                  alt="留言图片"
                  className="mt-2 max-w-full max-h-48 border border-[#0a0a0a]"
                />
              )}
            </div>
          ))}

          {/* 折叠/展开按钮 */}
          {needCollapse && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full py-2 border-2 border-dashed border-[#0a0a0a] text-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-[#fafafa] transition-colors font-mono text-xs flex items-center justify-center gap-1"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  收起
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  展开剩余 {hiddenCount} 条留言
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* 输入区 - 未登录隐藏 */}
      {!isLoggedIn ? (
        <div className="border-2 border-dashed border-[#0a0a0a] p-4 text-center bg-[#fafafa]">
          <p className="text-xs text-[#5a5a5a] font-mono mb-2">
            💬 留言需要先 <button
              onClick={onLoginRequest}
              className="text-[#0a0a0a] font-black underline hover:no-underline"
            >
              登录
            </button>
          </p>
        </div>
      ) : (
        <div className="border-2 border-[#0a0a0a] bg-white p-3 space-y-2">
          <Input
            placeholder="署名（留空则匿名玩家）"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="border-2 border-[#0a0a0a] rounded-none bg-white text-sm h-8 focus-visible:ring-0 focus-visible:ring-offset-0"
            maxLength={20}
          />
          <Textarea
            placeholder="说点什么（最多 200 字）"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border-2 border-[#0a0a0a] rounded-none bg-white text-sm min-h-[60px] focus-visible:ring-0 focus-visible:ring-offset-0"
            maxLength={200}
          />
          {image && (
            <div className="relative inline-block">
              <img src={image} alt="预览" className="max-h-20 border border-[#0a0a0a]" />
              <button
                onClick={clearImage}
                className="absolute -top-2 -right-2 bg-[#0a0a0a] text-[#fafafa] rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          <div className="flex justify-between items-center pt-1">
            <label className="cursor-pointer text-xs text-[#5a5a5a] hover:text-[#0a0a0a] font-mono inline-flex items-center gap-1">
              <ImageIcon className="h-3.5 w-3.5" />
              {image ? "换图" : "传图"}
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleImagePick}
                className="hidden"
              />
            </label>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="bg-[#0a0a0a] text-[#fafafa] rounded-none border-2 border-[#0a0a0a] text-xs font-mono disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✏️ 发表
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
