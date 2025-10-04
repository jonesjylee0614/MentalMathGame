# MentalMathGame

纯前端的口算闯关小游戏，遵循 `/docs/设计文档.md` 中的设计要求实现。

## 使用方式

1. 克隆仓库或下载源码。
2. 直接双击 `index.html`，或在项目根目录开启任意静态服务器访问（例如 `python -m http.server`）。
3. 所有关卡、玩家数据、统计与设置均存储在浏览器 `localStorage` 中。

## 主要文件

| 文件 | 说明 |
| --- | --- |
| `index.html` | 单页应用入口 |
| `app.css` | 全局样式与动画 |
| `app.js` | 路由、视图渲染与交互逻辑 |
| `levels.js` | 关卡模板定义 |
| `generators.js` | 各类题目出题器实现 |
| `engine.js` | 战斗/计时/评分引擎 |
| `store.js` | `localStorage` 数据管理 |
| `audio.js` | 成功/失败音效 |
| `utils.js` | 常用工具函数 |

## 开发提示

* 题目随机但同一局内去重，生成失败会抛出错误提醒。
* `localStorage` 键值已版本化，如需升级结构可在此基础上扩展迁移逻辑。
* 关卡列表可通过搜索筛选，统计页展示最佳成绩与累积数据。
