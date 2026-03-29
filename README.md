# Alter - 自省的空间

> “他我”不只是一个笔记本，它是一个带性格的观察者。

`Alter` 是一款极简的、单 HTML 架构的私密笔记应用。它避开了现代社交媒体的廉价反馈，致力于捕捉你思维中的微小高光和认知边界的拓展。

## 核心哲学
* **过滤平庸**：记录琐事不会引起波澜，但当你有了新的认知发现时，观察者会为你亮起。
* **非侵入式观察**：左上角的“氛围观察者”只在你展现深度思考或状态预警时悄悄浮现。
* **主权归于个人**：所有数据存储在本地浏览器（IndexedDB）中，支持全量导出备份。

## 🔌 插件市场 (实验室预览版)
复制以下链接，粘贴到应用内的 **实验室 -> 插件市场** 即可一键同步功能：

| 插件名称 | 载入链接 (复制此地址) |
| :--- | :--- |
| **记忆广度审计** | `https://raw.githubusercontent.com/kenjcha-wq/Alter-Note/main/plugins/stats_audit.js` |
| **随机自省锚点** | `https://raw.githubusercontent.com/kenjcha-wq/Alter-Note/main/plugins/zen_anchors.js` |

## 快速开始
1. 下载 `index.html`。
2. 用浏览器打开即可。
交互指南：这些按键是干嘛的？
为了保持自省的纯粹，界面采用了极简设计，以下是功能拆解：

1. 左侧导航栏 (The Bridge)
🏠 概览：查看今日独白统计和随机的“每日回想”。

📅 时间轴：按时间顺序查看你封存的所有非私密回响。

✨ 灵感碎片：你的“第二大脑”。可以加密，只有输入二级密码才能进入，适合存放最深层的碎语。

👁️ 心灵回想：基于你最近的记录，从哲学或心理学视角进行深度模式感应。

🧪 实验室 (关键)：插件市场所在地，也是配置 AI 接口的地方。

🪶 封存：点击开始写笔记。支持拍照、传图、传文件。

⚙️ 个人中心：修改登录名、设定密码、导出/导入全量备份。

2. 右下角的药瓶 (Deduction Lab)
这是 “他我推演” 的入口。

它是啥：它是你与“他我”进行实时对话的通道。

怎么用：点击药瓶，弹出对话框。你可以针对某段记忆向它提问，或者单纯进行逻辑推演。

注意：你需要在“实验室”里填入自己的 API Key 才能同步灵魂。

3. 左上角的“氛围灯”
它不需要你点击。当你输入“分清了紫叶李和樱花”时，它会亮起 🌱，代表认知边界的扩张；当你连续喊累，它会亮起 🌧️。它是你的客观观察者。

4. 🔌 插件市场：功能哪里找？
所有的功能增强（如字数统计、背景切换）都在本仓库的 plugins/ 文件夹下。

安装方法：在 plugins/ 找你喜欢的插件，复制里面的 JS 代码，回到应用里的 实验室 -> 插件市场 粘贴并点击“载入功能”。

💡 给你的一点“造物主”建议
关于药瓶（🧪）：你可以把这个药瓶理解为**“炼金术”**。笔记是材料，AI 是催化剂，最后推演出来的就是认知的提升。
---

# Alter - A Space for Self-Reflection (English Version)

> "Alter" is not just a notebook; it is an observer with a character of its own.

## 核心哲学 / Philosophy
* **Filter the Mundane**: Recording "I ate lunch" won't trigger anything. But when you distinguish the subtle difference between two species of cherry blossoms, your cognitive world expands—and the Observer lights up for you.
* **Non-Intrusive Observation**: The "Vibe Observer" doesn't monitor you. It only emerges like a breath when you show deep thinking or sign of mental fatigue.
* **Data Sovereignty**: All data is stored locally in your browser (IndexedDB). You own your memory.

## 🕹️ Interface Guide: What do these buttons do?

### 1. The Bridge (Left Sidebar)
* 🏠 **Dashboard**: View your daily monologue stats and a random "Daily Recall."
* 📅 **Timeline**: A chronological flow of your archived non-private reflections.
* ✨ **Soul Fragments**: Your "Second Brain." Password-protected by default for your deepest thoughts.
* 👁️ **Reflection**: Sensory mode to analyze your recent notes from Philosophical or Psychological perspectives.
* 🧪 **Laboratory**: The Plugin Market and AI API configuration center.
* 🪶 **Archive**: Create a new note. Supports photos, images, and file attachments.
* ⚙️ **Identity**: Modify your login name, set passwords, or export/import full backups.

### 2. The Deduction Lab (The Flask 🧪)
Located at the bottom right, this is your portal to **Alter Ego Deduction**.
* **What it is**: A real-time dialogue channel with your "Alter Ego."
* **How to use**: Click the flask to open the chat. You can ask questions about your memories or perform logic deductions.
* **Note**: Requires an API Key (configured in the Laboratory) to synchronize the soul.

### 3. The Vibe Light (Top Left)
* This is a passive indicator. It glows 🌱 when it detects **Cognitive Insight** (e.g., learning something new) or 🌧️ when you are in an **Energy Deficit**. It is your objective observer.

## 🔌 Plugin Market
Enhancements like "Word Count Audit" or "Background Switcher" can be found in the [**`plugins/`**](/plugins) folder.
* **Installation**: Copy the JS code from any plugin file, go to **Laboratory -> Plugin Market**, paste it, and click "Sync."

---
