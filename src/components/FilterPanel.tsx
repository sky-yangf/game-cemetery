// 筛选墓碑 - 标签云卡框（多选发行商 / 多选死因 / 时间区间）
// 讣告风格：黑底白字 = 选中，白底黑边 = 未选

import { PUBLISHERS, REASONS, GAMES } from "@/data/games"
import type { FilterState } from "@/types/game"

interface FilterPanelProps {
  filter: FilterState
  onFilterChange: (next: Partial<FilterState>) => void
}

// 时间区间：基于全部游戏 release 年份
const ALL_YEARS = GAMES.map((g) => Number(g.release.slice(0, 4)))
const MIN_YEAR = Math.min(...ALL_YEARS) // 2001
const MAX_YEAR = Math.max(...ALL_YEARS) // 2024

export function FilterPanel({ filter, onFilterChange }: FilterPanelProps) {
  // 发行商（去掉"全部"）
  const publishers = PUBLISHERS.filter((p) => p !== "全部")
  // 死因
  const reasons = REASONS.filter((r) => r !== "全部")

  const togglePublisher = (p: string) => {
    const next = new Set(filter.publishers)
    if (next.has(p)) next.delete(p)
    else next.add(p)
    onFilterChange({ publishers: Array.from(next) })
  }

  const toggleReason = (r: string) => {
    const next = new Set(filter.reasons)
    if (next.has(r)) next.delete(r)
    else next.add(r)
    onFilterChange({ reasons: Array.from(next) })
  }

  const resetAll = () => {
    onFilterChange({ publishers: [], reasons: [], types: [], yearFrom: MIN_YEAR, yearTo: MAX_YEAR })
  }

  const hasAnyFilter =
    filter.publishers.length > 0 ||
    filter.reasons.length > 0 ||
    filter.types.length > 0 ||
    filter.yearFrom !== MIN_YEAR ||
    filter.yearTo !== MAX_YEAR

  return (
    <section className="max-w-6xl mx-auto px-6 pb-8">
      <div
        className="border-2 border-[#0a0a0a] bg-white p-6"
        style={{ boxShadow: "4px 4px 0 #0a0a0a" }}
      >
        {/* 标题区 */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#5a5a5a] font-mono">
              ⚰ 筛选墓碑 · FILTER
            </p>
            <h2
              className="text-xl font-black text-[#0a0a0a] mt-1"
              style={{ fontFamily: '"Playfair Display", "Noto Serif SC", serif' }}
            >
              缩小范围，找到你玩过的那座
            </h2>
          </div>
          {hasAnyFilter && (
            <button
              onClick={resetAll}
              className="text-xs font-mono uppercase tracking-wider text-[#0a0a0a] border-2 border-[#0a0a0a] px-3 py-1 hover:bg-[#0a0a0a] hover:text-[#fafafa] transition-colors"
            >
              ✕ 清除全部
            </button>
          )}
        </div>

        {/* 类型 + 时间 同一排 */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 时间 */}
           <div>
            <p className="text-xs uppercase tracking-wider text-[#5a5a5a] font-mono mb-2">
              运营时间 · YEARS ({MIN_YEAR} — {MAX_YEAR})
            </p>
            <div className="flex items-center gap-2 font-mono flex-wrap">
              <label className="flex items-center gap-1">
                <span className="text-xs text-[#5a5a5a]">起</span>
                <input
                  type="number"
                  min={MIN_YEAR}
                  max={MAX_YEAR}
                  value={filter.yearFrom}
                  onChange={(e) =>
                    onFilterChange({ yearFrom: Math.max(MIN_YEAR, Math.min(MAX_YEAR, Number(e.target.value) || MIN_YEAR)) })
                  }
                  className="w-16 border-2 border-[#0a0a0a] px-2 py-1 text-sm font-bold text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]"
                />
              </label>
              <span className="text-[#0a0a0a]">—</span>
              <label className="flex items-center gap-1">
                <span className="text-xs text-[#5a5a5a]">止</span>
                <input
                  type="number"
                  min={MIN_YEAR}
                  max={MAX_YEAR}
                  value={filter.yearTo}
                  onChange={(e) =>
                    onFilterChange({ yearTo: Math.max(MIN_YEAR, Math.min(MAX_YEAR, Number(e.target.value) || MAX_YEAR)) })
                  }
                  className="w-16 border-2 border-[#0a0a0a] px-2 py-1 text-sm font-bold text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]"
                />
              </label>
              <span className="text-xs text-[#5a5a5a] ml-1">
                {filter.yearFrom} — {filter.yearTo}
              </span>
            </div>
          </div>
          {/* 类型 */}
          <div>
            <p className="text-xs uppercase tracking-wider text-[#5a5a5a] font-mono mb-2">
              类型 · TYPE
            </p>
            <div className="flex flex-wrap gap-2">
              {(["手游", "网游"] as const).map((t) => {
                const active = filter.types.includes(t)
                return (
                  <button
                    key={t}
                    onClick={() => {
                      const next = filter.types.includes(t)
                        ? filter.types.filter((x) => x !== t)
                        : [...filter.types, t]
                      onFilterChange({ types: next })
                    }}
                    className={`text-sm font-bold px-3 py-1.5 border-2 border-[#0a0a0a] transition-colors ${
                      active
                        ? "bg-[#0a0a0a] text-[#fafafa]"
                        : "bg-white text-[#0a0a0a] hover:bg-[#e8e8e8]"
                    }`}
                  >
                    {t === "手游" ? "📱" : "🖥️"} {t}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

       {/* 发行商标签 */}
        <div className="mb-4">
          <p className="text-xs uppercase tracking-wider text-[#5a5a5a] font-mono mb-2">
            发行商 · PUBLISHER
          </p>
          <div className="flex flex-wrap gap-2">
            {publishers.map((p) => {
              const active = filter.publishers.includes(p)
              return (
                <button
                  key={p}
                  onClick={() => togglePublisher(p)}
                  className={`text-sm font-bold px-3 py-1.5 border-2 border-[#0a0a0a] transition-colors ${
                    active
                      ? "bg-[#0a0a0a] text-[#fafafa]"
                      : "bg-white text-[#0a0a0a] hover:bg-[#e8e8e8]"
                  }`}
                >
                  {p}
                </button>
              )
            })}
          </div>
        </div>

        {/* 死因标签 */}
        <div className="mb-4">
          <p className="text-xs uppercase tracking-wider text-[#5a5a5a] font-mono mb-2">
            死因 · REASON
          </p>
          <div className="flex flex-wrap gap-2">
            {reasons.map((r) => {
              const active = filter.reasons.includes(r)
              return (
                <button
                  key={r}
                  onClick={() => toggleReason(r)}
                  className={`text-sm font-bold px-3 py-1.5 border-2 border-[#0a0a0a] transition-colors ${
                    active
                      ? "bg-[#0a0a0a] text-[#fafafa]"
                      : "bg-white text-[#0a0a0a] hover:bg-[#e8e8e8]"
                  }`}
                >
                  {r}
                </button>
              )
            })}
          </div>
        </div>

      </div>
    </section>
  )
}
