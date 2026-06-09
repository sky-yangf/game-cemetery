// 提交讣告表单 - 讣告风格

import { useState, useRef } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X, Upload } from "lucide-react"
import type { Game, Reason } from "@/types/game"

interface SubmitObituaryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (game: Game) => void
}

const REASONS: Reason[] = ["运营停滞", "全球停服", "运营暴死", "代理更换", "代理到期", "代理决裂"]
const EMOJI_MAP: Record<Reason, string> = {
  "运营停滞": "⏰", "全球停服": "💀", "运营暴死": "💥",
  "代理更换": "🔄", "代理到期": "🔄", "代理决裂": "💔",
}
const DEFAULT_ICONS = ["🎮", "🕹️", "👾", "🪦", "⚰️", "💀", "👻", "🎯", "🔮", "🗡️"]

function uuid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export function SubmitObituaryDialog({ open, onOpenChange, onSubmit }: SubmitObituaryDialogProps) {
  const [name, setName] = useState("")
  const [icon, setIcon] = useState(DEFAULT_ICONS[0])
  const [publisher, setPublisher] = useState("")
  const [release, setRelease] = useState("")
  const [death, setDeath] = useState("")
  const [reason, setReason] = useState<Reason>("运营停滞")
  const [epitaph, setEpitaph] = useState("")
  const [comment, setComment] = useState("")
  const [error, setError] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 512 * 1024) { setError("图标最大 512KB"); return }
    const reader = new FileReader()
    reader.onload = () => setIcon(reader.result as string)
    reader.readAsDataURL(file)
  }

  const reset = () => {
    setName("")
    setIcon(DEFAULT_ICONS[0])
    setPublisher("")
    setRelease("")
    setDeath("")
    setReason("运营停滞")
    setEpitaph("")
    setComment("")
    setError("")
  }

  const handleSubmit = () => {
    if (!name.trim()) { setError("请输入游戏名"); return }
    if (!publisher.trim()) { setError("请输入发行商"); return }
    if (!release) { setError("请选择运营起始日期"); return }
    if (!death) { setError("请选择停服日期"); return }
    if (death <= release) { setError("停服日期必须晚于运营起始日期"); return }

    const rDate = new Date(release)
    const dDate = new Date(death)
    const monthsDiff = (dDate.getFullYear() - rDate.getFullYear()) * 12 + dDate.getMonth() - rDate.getMonth()
    const lifespan = monthsDiff < 12
      ? `${monthsDiff}个月`
      : monthsDiff < 24
        ? `${(monthsDiff / 12).toFixed(1)}年`
        : `${Math.floor(monthsDiff / 12)}年`

    const releaseFmt = release // YYYY-MM
    const deathFmt = death

    const game: Game = {
      id: uuid(),
      icon,
      name: name.trim(),
      publisher: publisher.trim(),
      type: "网游", // 默认
      release: releaseFmt,
      death: deathFmt,
      reason,
      reasonEmoji: EMOJI_MAP[reason] as Game["reasonEmoji"],
      lifespan,
      epitaph: epitaph.trim() || `${name.trim()} 已停服`,
      comment: comment.trim() || "玩家提交",
      candles: 0,
      played: 0,
    }

    onSubmit(game)
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md bg-white border-2 border-[#0a0a0a] rounded-none"
        style={{ boxShadow: "5px 5px 0 #0a0a0a" }}
      >
        <DialogHeader>
          <DialogTitle
            className="text-lg font-black text-[#0a0a0a]"
            style={{ fontFamily: '"Playfair Display", "Noto Serif SC", serif' }}
          >
            ⚰ 提交讣告
          </DialogTitle>
          <p className="text-xs text-[#5a5a5a] font-mono">
            为逝去的游戏立一座墓碑
          </p>
        </DialogHeader>

        <div className="space-y-3">
          {error && (
            <p className="text-xs text-red-600 font-mono border-2 border-red-600 bg-red-50 p-2">{error}</p>
          )}

          {/* 图标选择 */}
          <div>
            <p className="text-xs text-[#5a5a5a] font-mono mb-1">图标</p>
            <div className="flex flex-wrap gap-1 mb-2">
              {DEFAULT_ICONS.map((em) => (
                <button
                  key={em}
                  onClick={() => setIcon(em)}
                  className={`w-9 h-9 border-2 border-[#0a0a0a] text-lg flex items-center justify-center ${
                    icon === em ? "bg-[#0a0a0a] text-[#fafafa]" : "bg-white hover:bg-[#e8e8e8]"
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
            <label className="cursor-pointer inline-flex items-center gap-1 text-xs text-[#5a5a5a] hover:text-[#0a0a0a] font-mono border-2 border-dashed border-[#0a0a0a] px-3 py-1.5">
              <Upload className="h-3.5 w-3.5" />
              上传自定义图标
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleIconUpload}
                className="hidden"
              />
            </label>
            {icon.startsWith("data:") && (
              <div className="mt-2 flex items-center gap-2">
                <img src={icon} alt="预览" className="w-9 h-9 border-2 border-[#0a0a0a] object-contain" />
                <button onClick={() => setIcon(DEFAULT_ICONS[0])} className="text-xs text-[#5a5a5a] hover:text-[#0a0a0a]">✕ 清除</button>
              </div>
            )}
          </div>

          <Input placeholder="游戏名 *" value={name} onChange={(e) => { setName(e.target.value.slice(0, 30)); setError("") }}
            className="border-2 border-[#0a0a0a] rounded-none focus-visible:ring-0" />
          <Input placeholder="发行商 *" value={publisher} onChange={(e) => { setPublisher(e.target.value.slice(0, 20)); setError("") }}
            className="border-2 border-[#0a0a0a] rounded-none focus-visible:ring-0" />

          <div className="flex gap-3">
            <div className="flex-1">
              <p className="text-xs text-[#5a5a5a] font-mono mb-1">运营起 *</p>
              <Input type="month" value={release} onChange={(e) => { setRelease(e.target.value); setError("") }}
                className="border-2 border-[#0a0a0a] rounded-none focus-visible:ring-0" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-[#5a5a5a] font-mono mb-1">停服日 *</p>
              <Input type="month" value={death} onChange={(e) => { setDeath(e.target.value); setError("") }}
                className="border-2 border-[#0a0a0a] rounded-none focus-visible:ring-0" />
            </div>
          </div>

          {/* 死因选择 */}
          <div>
            <p className="text-xs text-[#5a5a5a] font-mono mb-1">死因</p>
            <div className="flex flex-wrap gap-1">
              {REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`text-xs px-2 py-1 border-2 border-[#0a0a0a] font-bold ${
                    reason === r ? "bg-[#0a0a0a] text-[#fafafa]" : "bg-white text-[#0a0a0a] hover:bg-[#e8e8e8]"
                  }`}
                >
                  {EMOJI_MAP[r]} {r}
                </button>
              ))}
            </div>
          </div>

          <Textarea placeholder="墓志铭（可选，不填则默认「已停服」）" value={epitaph}
            onChange={(e) => setEpitaph(e.target.value.slice(0, 50))}
            className="border-2 border-[#0a0a0a] rounded-none text-sm resize-none focus-visible:ring-0" rows={2} />
          <Textarea placeholder="玩家评论（可选）" value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 200))}
            className="border-2 border-[#0a0a0a] rounded-none text-sm resize-none focus-visible:ring-0" rows={2} />

          <Button onClick={handleSubmit}
            className="w-full bg-[#0a0a0a] text-[#fafafa] border-2 border-[#0a0a0a] rounded-none font-black hover:bg-[#fafafa] hover:text-[#0a0a0a] transition-colors">
            ⚰ 立碑
          </Button>
        </div>

        <DialogClose className="absolute top-4 right-4 rounded-none bg-[#0a0a0a] text-[#fafafa] w-8 h-8 flex items-center justify-center border-2 border-[#0a0a0a] hover:bg-[#fafafa] hover:text-[#0a0a0a] transition-colors">
          <X className="h-4 w-4" />
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}
