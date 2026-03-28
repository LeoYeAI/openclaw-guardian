# openclaw-slides

[![Powered by MyClaw.ai](https://img.shields.io/badge/Powered%20by-MyClaw.ai-gold?style=flat-square)](https://myclaw.ai)
[![OpenClaw Skill](https://img.shields.io/badge/OpenClaw-Skill-blue?style=flat-square)](https://github.com/openclaw/openclaw)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

> **[MyClaw.ai](https://myclaw.ai)** — Your AI personal assistant with full server control. Every MyClaw instance runs on a dedicated server with complete code access, networking, and tool capabilities. This skill is part of the [MyClaw open skills ecosystem](https://myclaw.ai/skills).

**Create stunning, animation-rich HTML presentations — from scratch or by converting PowerPoint files.**

An OpenClaw agent skill that helps anyone build beautiful web slide decks with zero dependencies. Single HTML files with inline CSS/JS — no npm, no build tools, no frameworks. Works offline, renders forever.

---

🌐 **Languages:** [中文](README.zh-CN.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [日本語](README.ja.md) · [Italiano](README.it.md) · [Español](README.es.md)

---

## ✨ Features

- **Zero Dependencies** — Single HTML files with inline CSS/JS. No npm, no build tools, no frameworks.
- **12 Curated Styles** — Bold Signal, Neon Cyber, Dark Botanical, Swiss Modern, Paper & Ink, and 7 more. No generic AI aesthetics.
- **PPT Conversion** — Convert existing PowerPoint files to web, preserving all images and content.
- **Visual Style Discovery** — Can't articulate design preferences? Generate 3 previews and pick what you like.
- **Production Quality** — Keyboard navigation, touch/swipe, scroll-triggered animations, responsive design, reduced-motion support.
- **Inline Editing** — Optional in-browser text editing with localStorage auto-save.

## 🎨 Style Presets

| Preset | Vibe | Best For |
|--------|------|----------|
| Bold Signal | Confident, high-impact | Pitch decks, keynotes |
| Electric Studio | Clean, professional | Agency presentations |
| Creative Voltage | Energetic, retro-modern | Creative pitches |
| Dark Botanical | Elegant, sophisticated | Premium brands |
| Notebook Tabs | Editorial, organized | Reports, reviews |
| Pastel Geometry | Friendly, approachable | Product overviews |
| Split Pastel | Playful, modern | Creative agencies |
| Vintage Editorial | Witty, personality-driven | Personal brands |
| Neon Cyber | Futuristic, techy | Tech startups |
| Terminal Green | Developer-focused | Dev tools, APIs |
| Swiss Modern | Minimal, precise | Corporate, data |
| Paper & Ink | Literary, thoughtful | Storytelling |

## 🚀 Installation

```bash
clawhub install openclaw-slides
```

Or manually copy to your OpenClaw workspace skills directory:

```bash
cp -r openclaw-slides/ ~/.openclaw/workspace/skills/
```

## 💬 Usage

Just tell your OpenClaw agent what you want:

> "Create a pitch deck for my AI startup"

> "Convert my presentation.pptx to a web slideshow"

> "Make a 10-slide tech talk about distributed systems"

The agent will:
1. Ask about your content and style preferences
2. Generate 3 visual style previews for you to compare
3. Build the full presentation in your chosen style
4. Open it in your browser

## 📁 Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Main skill instructions for OpenClaw agents |
| `references/STYLE_PRESETS.md` | Full specs for all 12 visual style presets |

## 🛠 Requirements

- [OpenClaw](https://github.com/openclaw/openclaw) with an AI agent
- For PPT conversion: Python with `python-pptx` (`pip install python-pptx`)
- For image processing: Python with `Pillow` (`pip install Pillow`)

## 📄 License

MIT — Use it, modify it, share it.

---

*Adapted for OpenClaw from [zarazhangrui/openclaw-slides](https://github.com/zarazhangrui/openclaw-slides). Powered by [MyClaw.ai](https://myclaw.ai).*
