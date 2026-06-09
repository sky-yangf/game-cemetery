// 登录/注册弹窗 - 讣告风格

import { useState } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLogin: (username: string) => void
}

export function LoginDialog({ open, onOpenChange, onLogin }: LoginDialogProps) {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")

  const reset = () => {
    setUsername("")
    setPassword("")
    setConfirm("")
    setError("")
  }

  const switchMode = (m: "login" | "register") => {
    setMode(m)
    reset()
  }

  const handleSubmit = () => {
    const name = username.trim()
    if (!name) {
      setError("请输入用户名")
      return
    }
    if (password.length < 4) {
      setError("密码至少 4 位")
      return
    }

    if (mode === "register") {
      if (password !== confirm) {
        setError("两次密码不一致")
        return
      }
      // 检查是否已注册
      const stored = localStorage.getItem(`cemetery-user-${name}`)
      if (stored) {
        setError("用户名已被注册")
        return
      }
      // 注册：存密码（明文，MVP 阶段）
      localStorage.setItem(`cemetery-user-${name}`, password)
    } else {
      // 登录：验证密码
      const stored = localStorage.getItem(`cemetery-user-${name}`)
      if (stored !== null && stored !== password) {
        setError("密码错误")
        return
      }
    }

    onLogin(name)
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-sm bg-white border-2 border-[#0a0a0a] rounded-none"
        style={{ boxShadow: "5px 5px 0 #0a0a0a" }}
      >
        <DialogHeader>
          <DialogTitle
            className="text-lg font-black text-[#0a0a0a]"
            style={{ fontFamily: '"Playfair Display", "Noto Serif SC", serif' }}
          >
            ⚰ {mode === "login" ? "墓园登录" : "墓园注册"}
          </DialogTitle>
          <p className="text-xs text-[#5a5a5a] font-mono">
            {mode === "login" ? "登录后可留言、标记「我玩过」、提交讣告" : "注册后可留言、标记「我玩过」、提交讣告"}
          </p>
        </DialogHeader>

        {/* 登录/注册 切换 tab */}
        <div className="flex border-2 border-[#0a0a0a]">
          <button
            onClick={() => switchMode("login")}
            className={`flex-1 py-2 text-sm font-black border-r-2 border-[#0a0a0a] transition-colors ${
              mode === "login"
                ? "bg-[#0a0a0a] text-[#fafafa]"
                : "bg-white text-[#0a0a0a] hover:bg-[#e8e8e8]"
            }`}
          >
            登录
          </button>
          <button
            onClick={() => switchMode("register")}
            className={`flex-1 py-2 text-sm font-black transition-colors ${
              mode === "register"
                ? "bg-[#0a0a0a] text-[#fafafa]"
                : "bg-white text-[#0a0a0a] hover:bg-[#e8e8e8]"
            }`}
          >
            注册
          </button>
        </div>

        <div className="space-y-3">
          {error && (
            <p className="text-xs text-red-600 font-mono border-2 border-red-600 bg-red-50 p-2">
              {error}
            </p>
          )}
          <Input
            placeholder="用户名"
            value={username}
            onChange={(e) => { setUsername(e.target.value.slice(0, 20)); setError("") }}
            maxLength={20}
            className="border-2 border-[#0a0a0a] rounded-none focus-visible:ring-0"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <Input
            type="password"
            placeholder="密码（至少 4 位）"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError("") }}
            className="border-2 border-[#0a0a0a] rounded-none focus-visible:ring-0"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          {mode === "register" && (
            <Input
              type="password"
              placeholder="确认密码"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setError("") }}
              className="border-2 border-[#0a0a0a] rounded-none focus-visible:ring-0"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          )}
          <Button
            onClick={handleSubmit}
            className="w-full bg-[#0a0a0a] text-[#fafafa] border-2 border-[#0a0a0a] rounded-none font-black hover:bg-[#fafafa] hover:text-[#0a0a0a] transition-colors"
          >
            {mode === "login" ? "登录" : "注册"}
          </Button>
        </div>

        <DialogClose className="absolute top-4 right-4 rounded-none bg-[#0a0a0a] text-[#fafafa] w-8 h-8 flex items-center justify-center border-2 border-[#0a0a0a] hover:bg-[#fafafa] hover:text-[#0a0a0a] transition-colors">
          <X className="h-4 w-4" />
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}
