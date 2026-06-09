// 5 秒轮播墓志铭

import { useEffect, useState } from "react"

export function useQuoteRotation(length: number, intervalMs = 5000): number {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (length === 0) return
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % length)
    }, intervalMs)
    return () => clearInterval(id)
  }, [length, intervalMs])

  return idx
}
