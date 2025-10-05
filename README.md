# Mental Math Arena

React 18 + TypeScript 打造的心算闯关小游戏。题库沿用原始设计，提供超过 60 种题型与渐进难度关卡，通过 Web Audio 提供即时反馈，使用 Context API + LocalStorage 持久化玩家档案。

## 技术栈

- ⚛️ [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- 🧭 [React Router v6](https://reactrouter.com/) 路由系统
- 🎧 Web Audio API 成功/失败音效
- 💾 Context API + LocalStorage 状态管理
- ⚙️ [Vite](https://vitejs.dev/) 构建工具
- 🎨 原生 CSS 渐变 & 动画（CSS Modules + 全局样式）

## 开发与运行

```bash
npm install
npm run dev    # 本地开发，默认端口 5173
npm run build  # 生产构建
npm run preview
```

浏览器数据全部存储于 `localStorage`，战斗结果会额外缓存一份在 `sessionStorage` 方便结果页展示。

## 目录结构

```
├── index.html          # Vite 入口
├── src
│   ├── App.tsx         # 路由定义
│   ├── main.tsx        # 应用入口
│   ├── context         # GameContext（状态/持久化）
│   ├── lib             # 题目生成、引擎、数据、工具
│   ├── routes          # 各页面（首页/关卡/对战/统计/设置/结果）
│   └── styles          # CSS Modules & 全局样式
└── README.md
```

## 设计亮点

- 🎮 **战斗式出题体验**：HP 条、时间条、连击反馈强化沉浸感。
- 🧠 **题库完整迁移**：沿用原版 60+ 题型生成器，保证题目质量与随机性。
- 📊 **数据面板**：统计页展示累计积分、正确率、最佳关卡等核心指标。
- 🔊 **即时音效**：正确/错误反馈使用 Web Audio API 生成合成音。
- 🌈 **霓虹玻璃 UI**：多层渐变与微动画，兼顾桌面与移动端响应式体验。
