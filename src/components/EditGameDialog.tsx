// Admin 编辑墓碑 —— 全字段编辑（除评论/蜡烛/玩过）
// 复用 SubmitObituaryDialog 结构，预填现有数据

import { useState, useEffect, useRef } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X, Upload } from "lucide-react"
import type { Game, Reason } from "@/types/game"

interface EditGameDialogProps {
  game: Game | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (updates: Partial<Game>) => void
}

const REASONS: Reason[] = ["运营停滞", "全球停服", "运营暴死", "代理更换", "代理到期", "代理决裂"]
const EMOJI_MAP: Record<Reason, string> = {
  "运营停滞": "⏰", "全球停服": "💀", "运营暴死": "💥",
  "代理更换": "🔄", "代理到期": "🔄", "代理决裂": "💔",
}
const ICONS = ["🎮", "🕹️", "👾", "🪦", "⚰️", "💀", "👻", "🎯", "🔮", "🗡️", "🔫", "💃", "🎵", "🍁", "⚔️", "🦸", "🎯", "🐧", "🎻", "🔥", "🦅", "🌙", "⭐", "🃏", "⚽", "🏀", "🏎️", "🥊", "💨", "👑", "🌈", "⛵", "🐉", "🧙", "🐒", "✨", "⚡", "🏆"]

export function EditGameDialog({ game, open, onOpenChange, onSave }: EditGameDialogProps) {
  const [icon, setIcon] = useState(game?.icon ?? "🎮")
  const [name, setName] = useState(game?.name ?? "")
  const [publisher, setPublisher] = useState(game?.publisher ?? "")
  const [type, setType] = useState(game?.type ?? "网游")
  const [release, setRelease] = useState(game?.release ?? "")
  const [death, setDeath] = useState(game?.death ?? "")
  const [reason, setReason] = useState<Reason>((game?.reason as Reason) ?? "运营停滞")
  const [epitaph, setEpitaph] = useState(game?.epitaph ?? "")
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

  // 每次 game 变化时重置表单（关闭时通过 game=null 触发重置）
  useEffect(() => {
    if (game) {
      setIcon(game.icon)
      setName(game.name)
      setPublisher(game.publisher)
      setType(game.type)
      setRelease(game.release)
      setDeath(game.death)
      setReason(game.reason as Reason)
      setEpitaph(game.epitaph ?? "")
      setError("")
    } else {
      // 关闭时清空
      setName("")
      setPublisher("")
      setRelease("")
      setDeath("")
      setEpitaph("")
      setError("")
    }
  }, [game])

  const handleSave = () => {
    if (!name.trim()) { setError("请输入游戏名"); return }
    if (!publisher.trim()) { setError("请输入发行商"); return }
    if (!release) { setError("请选择运营起始日期"); return }
    if (!death) { setError("请选择停服日期"); return }
    if (death <= release) { setError("停服日期必须晚于运营起始日期"); return }

    const reasonEmoji = EMOJI_MAP[reason] as Game["reasonEmoji"]

    onSave({
      icon, name: name.trim(), publisher: publisher.trim(), type,
      release, death, reason, reason_emoji: reasonEmoji, epitaph: epitaph.trim(),
    })
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
            ✏️ 编辑墓碑
          </DialogTitle>
          <p className="text-xs text-[#5a5a5a] font-mono">
            正在编辑：{game?.name}
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
              {ICONS.map((em) => (
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
                <button onClick={() => setIcon(game?.icon ?? "🎮")} className="text-xs text-[#5a5a5a] hover:text-[#0a0a0a]">✕ 恢复原图标</button>
              </div>
            )}
          </div>

          <Input placeholder="游戏名 *" value={name} onChange={(e) => { setName(e.target.value.slice(0, 30)); setError("") }}
            className="border-2 border-[#0a0a0a] rounded-none focus-visible:ring-0" />
          <Input placeholder="发行商 *" value={publisher} onChange={(e) => { setPublisher(e.target.value.slice(0, 20)); setError("") }}
            className="border-2 border-[#0a0a0a] rounded-none focus-visible:ring-0" />

          {/* 类型切换 */}
          <div className="flex gap-2">
            {(["网游", "手游"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-1.5 text-sm font-black border-2 border-[#0a0a0a] ${
                  type === t ? "bg-[#0a0a0a] text-[#fafafa]" : "bg-white text-[#0a0a0a] hover:bg-[#e8e8e8]"
                }`}
              >
                {t === "手游" ? "📱 手游" : "🖥️ 网游"}
              </button>
            ))}
          </div>

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

          <Textarea placeholder="墓志铭" value={epitaph}
            onChange={(e) => setEpitaph(e.target.value.slice(0, 100))}
            className="border-2 border-[#0a0a0a] rounded-none text-sm resize-none focus-visible:ring-0" rows={2} />

          <Button onClick={handleSave}
            className="w-full bg-[#0a0a0a] text-[#fafafa] border-2 border-[#0a0a0a] rounded-none font-black hover:bg-[#fafafa] hover:text-[#0a0a0a] transition-colors">
            ✏️ 保存修改
          </Button>
        </div>

        <DialogClose className="absolute top-4 right-4 rounded-none bg-[#0a0a0a] text-[#fafafa] w-8 h-8 flex items-center justify-center border-2 border-[#0a0a0a] hover:bg-[#fafafa] hover:text-[#0a0a0a] transition-colors">
          <X className="h-4 w-4" />
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}
