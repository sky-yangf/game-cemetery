import { useEffect, useState } from "react"

// Render Free Web Service 冷启动约 30-60s，首次/闲置 15min 后会触发
// 给用户一个明确提示，避免以为页面坏了
export function ColdStartHint() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 8000)
    return () => clearTimeout(t)
  }, [])

  if (!show) return null
  return (
    <p className="text-xs text-[#5a5a5a] font-mono mt-2 opacity-70">
      首次加载较慢？后端服务在冷启动中（约 30-60s），请稍候…
    </p>
  )
}
