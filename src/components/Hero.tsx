// Hero 标题区 - 讣告风格（双线分割 + 上下小字）

import { Button } from "@/components/ui/button"

interface HeroProps {
  totalGames: number
  totalCandles: number
  totalPlayed: number
  isLoggedIn: boolean
  onLoginRequest: () => void
  onSubmitClick: () => void
}

export function Hero({ totalGames, totalCandles, totalPlayed, isLoggedIn, onLoginRequest, onSubmitClick }: HeroProps) {
  return (
    <section className="py-20 px-6 text-center max-w-4xl mx-auto">
      {/* 顶部双线 */}
      <div className="border-t-2 border-b-2 border-[#0a0a0a] py-4">
        <p className="text-xs uppercase tracking-[0.3em] text-[#5a5a5a] font-mono">
          VOL.01 · 2026 · OBITUARY ARCHIVE
        </p>
      </div>

      <h1
        className="text-6xl md:text-7xl font-black tracking-tight text-[#0a0a0a] mt-12 mb-4"
        style={{ fontFamily: '"Playfair Display", "Bodoni Moda", "Noto Serif SC", serif' }}
      >
        这里长眠着 {totalGames}+ 款中国游戏
      </h1>
      <p
        className="text-lg text-[#5a5a5a] mt-4"
        style={{ fontFamily: '"Noto Serif SC", "Songti SC", serif' }}
      >
        每一座墓碑背后，都有一段被遗忘的玩家记忆
      </p>

      {/* 统计行（monospace）—— 综合热度 = 蜡烛 + 玩过*2 */}
      <div className="flex items-center justify-center gap-4 text-sm text-[#5a5a5a] mt-6 font-mono">
        <span>🪦 {totalGames} 座墓碑</span>
        <span>·</span>
        <span>🕯️ {totalCandles.toLocaleString()} 根蜡烛</span>
        <span>·</span>
        <span>👋 {totalPlayed.toLocaleString()} 人玩过</span>
      </div>

      {/* 提交讣告按钮 */}
      <Button
        className="mt-8 bg-[#0a0a0a] text-[#fafafa] border-2 border-[#0a0a0a] rounded-none font-black tracking-wider hover:bg-[#fafafa] hover:text-[#0a0a0a] transition-colors"
        style={{ fontFamily: '"Playfair Display", "Noto Serif SC", serif' }}
        onClick={onSubmitClick}
      >
        + 提交讣告
      </Button>

      {/* 底部双线 */}
      <div className="border-t-2 border-b-2 border-[#0a0a0a] py-4 mt-12">
        <p className="text-xs uppercase tracking-[0.3em] text-[#5a5a5a] font-mono">
          R.I.P. · REST IN PIXELS · 已停服名录
        </p>
      </div>
    </section>
  )
}
