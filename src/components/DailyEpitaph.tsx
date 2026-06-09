// 今日墓志铭 Banner - 独立 section，在筛选墓碑上方

import type { Game } from "@/types/game"

interface DailyEpitaphProps {
  game: Game
}

export function DailyEpitaph({ game }: DailyEpitaphProps) {
  return (
    <section className="max-w-6xl mx-auto px-6 pb-4">
      <div
        className="bg-[#0a0a0a] text-[#fafafa] border-2 border-[#0a0a0a] p-6"
        style={{ boxShadow: "4px 4px 0 #0a0a0a" }}
      >
        <p className="text-xs uppercase tracking-[0.3em] text-[#a0a0a0] font-mono">
          ⚰ 今日墓志铭 · DAILY EPITAPH
        </p>
        <p
          className="text-xl py-6 text-[#fafafa] font-black"
          style={{ fontFamily: '"Playfair Display", "Noto Serif SC", serif' }}
        >
          「{game.epitaph}」
        </p>
        <p className="text-sm text-[#a0a0a0] font-mono">
          — {game.name} · {game.lifespan}
        </p>
      </div>
    </section>
  )
}
