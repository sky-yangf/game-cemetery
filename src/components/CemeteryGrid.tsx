// 墓园网格 - 回车触发搜索

import { useState } from "react"
import { GameCard } from "./GameCard"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import type { Game } from "@/types/game"

interface CemeteryGridProps {
  games: Game[]
  search: string
  highlightKeyword?: string
  onSearchChange: (v: string) => void
  onCardClick: (g: Game) => void
  onPlayedClick: (g: Game) => void
  onDetailClick: (g: Game) => void
  isLoggedIn: boolean
}

export function CemeteryGrid({
  games, search, highlightKeyword, onSearchChange,
  onCardClick, onPlayedClick, onDetailClick, isLoggedIn,
}: CemeteryGridProps) {
  const [input, setInput] = useState(search)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearchChange(input.trim())
    }
  }

  const handleSearchClick = () => {
    onSearchChange(input.trim())
  }

  if (games.length === 0) {
    return (
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="flex items-center gap-4 mb-6">
          <Input
            placeholder="搜索游戏…按回车"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="max-w-xs border-2 border-[#0a0a0a] rounded-none text-sm text-left"
          />
        </div>
        <p className="text-[#5a5a5a] text-center py-12">没有找到匹配的游戏</p>
      </section>
    )
  }

  return (
    <section className="max-w-6xl mx-auto px-6 pb-20">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2
          className="text-2xl font-black text-[#0a0a0a]"
          style={{ fontFamily: '"Playfair Display", "Noto Serif SC", serif' }}
        >
          墓园 · 按热度排 ({games.length})
        </h2>
        <div className="flex items-center gap-2">
          <Input
            placeholder="搜索游戏…按回车"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-56 border-2 border-[#0a0a0a] rounded-none h-9 text-sm text-left"
          />
          <button
            onClick={handleSearchClick}
            className="border-2 border-[#0a0a0a] h-9 px-3 bg-white hover:bg-[#e8e8e8] transition-colors"
          >
            <Search className="h-4 w-4 text-[#0a0a0a]" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {games.map((g, i) => {
          const isLarge = i === 0 || i === 4
          return (
            <GameCard
              key={g.id}
              game={g}
              size={isLarge ? "large" : "small"}
              rotateDeg={isLarge ? (i === 0 ? -1.5 : 1.5) : (g.id.charCodeAt(0) % 2 === 0 ? -1.5 : 1.5)}
              onClick={() => onCardClick(g)}
              onPlayedClick={isLarge ? (e) => { e.stopPropagation(); onPlayedClick(g) } : undefined}
              onDetailClick={isLarge ? () => onDetailClick(g) : undefined}
              isLoggedIn={isLoggedIn}
              highlightKeyword={highlightKeyword}
            />
          )
        })}
      </div>
    </section>
  )
}
