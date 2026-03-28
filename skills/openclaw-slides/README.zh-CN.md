# openclaw-slides

[![Powered by MyClaw.ai](https://img.shields.io/badge/Powered%20by-MyClaw.ai-gold?style=flat-square)](https://myclaw.ai)
[![OpenClaw Skill](https://img.shields.io/badge/OpenClaw-Skill-blue?style=flat-square)](https://github.com/openclaw/openclaw)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

> **[MyClaw.ai](https://myclaw.ai)** — 你的 AI 个人助理，拥有完整服务器控制权。每个 MyClaw 实例运行在独立服务器上，具备完整的代码访问、网络和工具能力。本 skill 是 [MyClaw 开放技能生态](https://myclaw.ai/skills) 的一部分。

**制作精美的动画 HTML 演示文稿——从零开始，或将 PowerPoint 文件转为网页幻灯片。**

这是一个 OpenClaw Agent Skill，帮助任何人构建精美的网页幻灯片。零依赖，单个 HTML 文件内联 CSS/JS，无需 npm、构建工具或框架。离线可用，永久有效。

---

🌐 **语言：** [English](README.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [日本語](README.ja.md) · [Italiano](README.it.md) · [Español](README.es.md)

---

## ✨ 功能特性

- **零依赖** — 单个 HTML 文件，内联 CSS/JS。无 npm、无构建工具、无框架。
- **12 种精选风格** — Bold Signal、Neon Cyber、Dark Botanical、Swiss Modern、Paper & Ink 等，拒绝通用 AI 审美。
- **PPT 转换** — 将现有 PowerPoint 文件转为网页，保留所有图片和内容。
- **视觉风格探索** — 不知道自己喜欢什么风格？生成 3 个预览，选你喜欢的。
- **生产级质量** — 键盘导航、触控滑动、滚动触发动画、响应式设计、减少动效支持。
- **内联编辑** — 可选的浏览器内文字编辑，自动保存到 localStorage。

## 🎨 风格预设

| 风格 | 氛围 | 适用场景 |
|------|------|----------|
| Bold Signal | 自信、高冲击力 | 融资路演、主题演讲 |
| Electric Studio | 简洁、专业 | 品牌提案 |
| Creative Voltage | 活力、复古现代 | 创意提案 |
| Dark Botanical | 优雅、精致 | 高端品牌 |
| Notebook Tabs | 编辑风、有条理 | 报告、述职 |
| Pastel Geometry | 友好、亲切 | 产品介绍 |
| Split Pastel | 活泼、现代 | 创意机构 |
| Vintage Editorial | 个性、幽默 | 个人品牌 |
| Neon Cyber | 未来感、科技感 | 科技创业 |
| Terminal Green | 极客、黑客风 | 开发工具、API |
| Swiss Modern | 极简、精准 | 企业、数据 |
| Paper & Ink | 文学感、深思熟虑 | 叙事内容 |

## 🚀 安装

```bash
clawhub install openclaw-slides
```

或手动复制到 OpenClaw workspace skills 目录：

```bash
cp -r openclaw-slides/ ~/.openclaw/workspace/skills/
```

## 💬 使用方式

直接告诉你的 OpenClaw Agent 你想要什么：

> "帮我做一个 AI 创业公司的融资 PPT"

> "把我的 presentation.pptx 转成网页幻灯片"

> "做一个关于分布式系统的 10 页技术演讲"

Agent 会：
1. 询问内容和风格偏好
2. 生成 3 个视觉风格预览供你选择
3. 用你选择的风格构建完整演示文稿
4. 在浏览器中打开

## 🛠 依赖要求

- [OpenClaw](https://github.com/openclaw/openclaw) + AI Agent
- PPT 转换：Python + `python-pptx`（`pip install python-pptx`）
- 图片处理：Python + `Pillow`（`pip install Pillow`）

## 📄 许可证

MIT — 自由使用、修改、分发。

---

*基于 [zarazhangrui/openclaw-slides](https://github.com/zarazhangrui/openclaw-slides) 适配 OpenClaw。由 [MyClaw.ai](https://myclaw.ai) 提供支持。*
