// 关键字高亮组件 - 黄色背景，黑字加粗
// 用于搜索结果高亮

import type { ReactNode } from "react"

interface HighlightTextProps {
  text: string
  keyword?: string
  className?: string
}

export function HighlightText({ text, keyword, className = "" }: HighlightTextProps) {
  if (!keyword || !keyword.trim()) return <span className={className}>{text}</span>

  const kw = keyword.trim()
  // 转义正则特殊字符
  const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const regex = new RegExp(`(${escaped})`, "gi")
  const segments = text.split(regex)

  const nodes: ReactNode[] = segments.map((seg, i) => {
    if (i % 2 === 1) {
      return (
        <mark
          key={i}
          className={`bg-[#fff8a3] text-[#0a0a0a] font-black px-0.5 ${className}`}
        >
          {seg}
        </mark>
      )
    }
    return <span key={i}>{seg}</span>
  })

  return <>{nodes}</>
}
