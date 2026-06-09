// 顶部导航 - 讣告风格
// 左边 logo，右边登录/用户名

interface HeaderProps {
  username: string | null
  onLoginClick: () => void
  onLogout: () => void
}

export function Header({ username, onLoginClick, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b-2 border-[#0a0a0a] flex items-center px-6">
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="text-2xl font-black tracking-tight text-[#0a0a0a]"
            style={{ fontFamily: '"Playfair Display", "Noto Serif SC", serif' }}
          >
            数字墓园 · DIGITAL CEMETERY
          </span>
        </div>
        <div className="flex items-center gap-3">
          {username ? (
            <>
              <span className="text-sm text-[#5a5a5a] font-mono">
                ⚰ {username}
              </span>
              <button
                onClick={onLogout}
                className="text-xs font-mono text-[#5a5a5a] border-2 border-[#0a0a0a] px-3 py-1 hover:bg-[#0a0a0a] hover:text-[#fafafa] transition-colors"
              >
                登出
              </button>
            </>
          ) : (
            <button
              onClick={onLoginClick}
              className="text-sm font-black text-[#0a0a0a] border-2 border-[#0a0a0a] px-4 py-1.5 hover:bg-[#0a0a0a] hover:text-[#fafafa] transition-colors"
            >
              登录
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
