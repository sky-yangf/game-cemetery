// 游戏卡片 - 讣告风格（支持大/小两种尺寸）
// hover 动效：旋转归零 + 缩放 + 投影加深 + 撕边抖动 + 标题下沉

import { Button } from "@/components/ui/button"
import type { Game } from "@/types/game"
import { HighlightText } from "./HighlightText"

type CardSize = "large" | "small"

interface GameCardProps {
  game: Game
  size?: CardSize
  rotateDeg?: number
  onClick?: () => void
  onPlayedClick?: (e: React.MouseEvent) => void
  onDetailClick?: () => void
  isLoggedIn?: boolean
  candleCount?: number
  highlightKeyword?: string
}

export function GameCard({
  game,
  size = "small",
  rotateDeg = 0,
  onClick,
  onPlayedClick,
  onDetailClick,
  isLoggedIn = false,
  candleCount,
  highlightKeyword,
}: GameCardProps) {
  const isLarge = size === "large"

  // 撕边 clip-path + 硬投影 + 旋转（讣告风核心）
  // hover 时：旋转归零、轻微缩放、阴影加深、过渡平滑
  const baseStyle = {
    clipPath:
      "polygon(0 0, 100% 0, 100% 86%, 96% 90%, 100% 94%, 96% 100%, 90% 96%, 84% 100%, 0 100%, 0 96%, 4% 100%)",
    boxShadow: "3px 3px 0 #0a0a0a",
    transform: `rotate(${rotateDeg}deg)`,
    transitionProperty: "transform, box-shadow",
    transitionDuration: "300ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
  }

  const hoverStyle = {
    transform: "rotate(0deg) scale(1.03)",
    boxShadow: "6px 6px 0 #0a0a0a",
  }

  // 小卡片用虚线边，柔和点
  if (!isLarge) {
    return (
      <div
        className="group bg-white border-2 border-[#0a0a0a] rounded-none p-4 cursor-pointer col-span-1 hover:bg-[#fefefe]"
        style={baseStyle}
        onClick={onClick}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, hoverStyle)}
        onMouseLeave={(e) => Object.assign(e.currentTarget.style, baseStyle)}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 border-2 border-[#0a0a0a] bg-white flex items-center justify-center text-lg rotate-[-8deg] shrink-0 transition-transform duration-300 group-hover:rotate-[-15deg] group-hover:scale-110">
            {game.icon.startsWith("/game-icons/") || game.icon.startsWith("data:") ? (
              <img src={game.icon} alt="" className="w-6 h-6 object-contain" />
            ) : (
              game.icon
            )}
          </div>
          <h3 className="text-base font-black text-[#0a0a0a] truncate transition-colors duration-300 group-hover:underline decoration-2 decoration-[#0a0a0a] underline-offset-4">
            <HighlightText text={game.name} keyword={highlightKeyword} />
          </h3>
        </div>
        <p className="text-xs text-[#5a5a5a] mt-1 font-mono">
          {game.release} — {game.death} · {game.lifespan}
        </p>
        <p className="text-xs mt-1 text-[#0a0a0a]">
          <span className="inline-block transition-transform duration-300 group-hover:scale-125">{game.reasonEmoji}</span> {game.reason}
        </p>
        <p className="text-xs text-[#5a5a5a] mt-1 line-clamp-1 italic">
          「{game.comment || game.epitaph}」
        </p>
        <div className="flex justify-end mt-2 gap-3">
          <span className="text-xs text-[#5a5a5a] font-mono transition-colors duration-300 group-hover:text-[#0a0a0a]">👋 {game.played}</span>
          <span className="text-xs text-[#5a5a5a] font-mono transition-colors duration-300 group-hover:text-[#0a0a0a]">🕯️ {game.candles}</span>
        </div>
        {/* hover 时显示的扫描线装饰 */}
        <div className="h-0.5 bg-[#0a0a0a] mt-2 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
      </div>
    )
  }

  // 大卡片
  return (
    <div
      className="group bg-white border-2 border-[#0a0a0a] rounded-none p-6 cursor-pointer col-span-1 md:col-span-3 lg:col-span-2 hover:bg-[#fefefe]"
      style={baseStyle}
      onClick={onClick}
      onMouseEnter={(e) => Object.assign(e.currentTarget.style, hoverStyle)}
      onMouseLeave={(e) => Object.assign(e.currentTarget.style, baseStyle)}
    >
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 border-2 border-[#0a0a0a] bg-white flex items-center justify-center text-4xl rotate-[-8deg] shrink-0 transition-transform duration-300 group-hover:rotate-[-15deg] group-hover:scale-110">
          {game.icon.startsWith("/game-icons/") || game.icon.startsWith("data:") ? (
            <img src={game.icon} alt="" className="w-12 h-12 object-contain" />
          ) : (
            game.icon
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-[#a0a0a0] font-mono">
            DECEASED · 2026
          </p>
          <h3
            className="text-2xl font-black text-[#0a0a0a] mt-1 transition-transform duration-300 group-hover:translate-x-1"
            style={{ fontFamily: '"Playfair Display", "Noto Serif SC", serif' }}
          >
            <HighlightText text={game.name} keyword={highlightKeyword} />
          </h3>
          <p className="text-sm text-[#5a5a5a] mt-1 font-mono">
            {game.release} — {game.death} · {game.lifespan}
          </p>
        </div>
      </div>
      <p className="text-base text-[#0a0a0a] mt-4 line-clamp-2 leading-relaxed">
        「<HighlightText text={game.epitaph} keyword={highlightKeyword} />」
      </p>
      <div className="flex items-center justify-between mt-4 pt-4 border-t-2 border-[#0a0a0a]">
        <div className="flex gap-3">
          <span className="text-sm text-[#5a5a5a] font-mono transition-colors duration-300 group-hover:text-[#0a0a0a]">👋 {game.played}</span>
          <span className="text-sm text-[#5a5a5a] font-mono transition-colors duration-300 group-hover:text-[#0a0a0a]">🕯️ {game.candles}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8 border-2 border-[#0a0a0a] rounded-none bg-white text-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-[#fafafa] transition-all duration-200 hover:scale-105"
            onClick={onPlayedClick}
          >
            👋 我玩过
          </Button>
          <button
            className="text-sm font-black text-[#0a0a0a] hover:underline transition-transform duration-200 hover:translate-x-1 inline-block"
            onClick={onDetailClick}
          >
            查看详情 →
          </button>
        </div>
      </div>
      {/* hover 时显示的扫描线装饰 */}
      <div className="h-0.5 bg-[#0a0a0a] mt-3 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out" />
    </div>
  )
}
