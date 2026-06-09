# V0.dev Prompt 模板（墓园项目）

> 复制下面整段到 https://v0.dev/ ，会自动生成 React + Tailwind 代码

---

## Prompt 1：墓园主页

```
Build a Chinese game digital cemetery memorial website. 

The aesthetic is inspired by Plants vs Zombies 2D hand-painted art style.

Layout (top to bottom):
- Fixed top bar (height 56px): 
  - Logo "🪦 数字墓园" in orange bold serif font
  - Two dropdown selects: "游戏发行商" (publisher) and "死亡年份" (death year)
  - A search input "🔍 搜索游戏..."
  - Three theme switcher pills on the right: "🌅 黄昏" (active orange gradient), "🌙 暗夜", "☀️ 淡雅"

- Main area: full-screen cemetery scene
  - Background: gradient sky transitioning from purple at top to orange near horizon
  - A glowing sun on the right side
  - 3 layers of distant mountain silhouettes (purple → dark purple → black)
  - A line of dark tree silhouettes at the horizon
  - Green grass field in the foreground
  
  - Foreground: a broken iron fence with stone base, spikes, and creeping vines
  - 40-50 tombstones scattered organically in the cemetery (NOT in a grid)
  - Each tombstone has:
    * Random tilt rotation (-15° to +15°)
    * Random scale (0.7-1.2)
    * One of 4 shapes: arched, flat-top, obelisk, or cross
    * Cracks and moss growing on the stone (older = more damage)
    * Game name written on it in small text
    * Stone has light/dark/shadow sides for 3D feel
  
  - 10-15 yellow fireflies floating in the air
  - 3-5 bird silhouettes flying across the sky

Interactions:
- Mouse wheel: zoom in/out (centered on mouse position)
- Click and drag: pan the view
- Hover on a tombstone: orange glow + tooltip showing game name
- Click on a tombstone: open detail modal

Modal:
- Centered popup
- Shows: game icon (emoji), game name, release date — death date, publisher
- "📜 墓志铭" section with epitaph text
- "💀 评语" section with italic orange comment
- Two buttons: "🕯️ 点蜡烛" (orange filled) and "💬 留言" (outlined)
- Close button (×) in top-right

Style requirements:
- Use Tailwind CSS
- Cartoon 2D painted look, NOT realistic 3D
- Bold dark outlines on all cemetery elements
- Rich color palette: warm oranges, deep purples, mossy greens, stone grays
- No neon colors
- No glass/metal modern UI
- Game UI quality, not a simple webpage

Use shadcn/ui components for the modal, selects, and buttons.
```

---

## Prompt 2：登录/注册弹窗（生成主页后再用）

```
Add an auth modal popup for the game cemetery site.

The modal has two modes (toggle with "登录" / "注册" link at bottom):

Login mode:
- Title "登录"
- Email input
- Password input
- Orange filled submit button "登录"
- Link: "还没有账号？注册"

Register mode:
- Title "注册"
- Display name input
- Email input
- Password input (6+ chars)
- Orange filled submit button "注册"
- Link: "已有账号？登录"

Style: same PvZ 2D painted aesthetic, dark cemetery-themed background
```

---

## Prompt 3：详情页扩展（生成后用）

```
For the tombstone detail modal, add a "留言板" (comment board) section:

After the existing sections, add:
- A heading "💬 留言板"
- A list of comments (each: user name in orange, comment text, date)
- If logged in: a text input + submit button at the bottom
- If not logged in: show "登录后可以发表留言" with a login link

Also add a "📤 提交墓碑" button at the bottom of the modal that opens a submission form with:
- Game name, publisher, release date, death date, death reason, icon emoji, epitaph, comment
- Submit button shows "需审核" hint
```

---

## 怎么用

1. 打开 https://v0.dev/
2. 用 GitHub 账号登录（免费）
3. 点 "New Project" 或 "New Chat"
4. 粘贴 Prompt 1 → 等 30-90 秒
5. 它会生成 React + Tailwind + shadcn/ui 代码
6. **点右上角 "Code" 或 "Open in v0"** → 复制代码 / 导出到 GitHub
7. 把代码贴回给我

如果 v0 生成得不够满意：
- 点 "Refine" 让它改
- 加新 prompt 描述哪里要改
- 比如："墓碑再多一些" / "围墙再破一点" / "黄昏主题颜色更暖"

---

## 注意事项

- V0 免费额度有限（每月 200 次生成），别浪费
- 第一次生成后**先看效果再决定要不要 refine**，不满意就 rephrase prompt
- V0 生成的代码是 React + Next.js，你给我，我帮你在本地 Vite 里跑起来
