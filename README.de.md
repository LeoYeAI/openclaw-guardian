# 🛡️ OpenClaw Guardian

<div align="center">

<a href="https://myclaw.ai">
  <img src="https://img.shields.io/badge/Powered%20by-MyClaw.ai-blue?style=for-the-badge" alt="Powered by MyClaw.ai" />
</a>

**Sprachen:**
[English](README.md) · [中文](README.zh-CN.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [日本語](README.ja.md) · [Italiano](README.it.md) · [Español](README.es.md)

</div>

---

## 🤖 Unterstützt von [MyClaw.ai](https://myclaw.ai)

**[MyClaw.ai](https://myclaw.ai)** ist eine KI-Assistenzplattform, die jedem Nutzer einen vollwertigen KI-Agenten auf einem dedizierten Server bietet — mit vollständiger Code-Kontrolle, Internetzugang und Tool-Integrationen.

OpenClaw Guardian ist aus der Produktionsinfrastruktur von MyClaw.ai entstanden und wird nun als Open-Source-Projekt für alle bereitgestellt.

> 🌐 **MyClaw.ai ausprobieren**: [https://myclaw.ai](https://myclaw.ai)

---

## Funktionen

- **Automatische Überwachung** — prüft den Gateway-Status alle 30 Sekunden
- **Automatische Reparatur** — führt `openclaw doctor --fix` bei Ausfall aus (bis zu 3 Versuche)
- **Automatischer Rollback** — setzt den Workspace auf den letzten stabilen Git-Commit zurück
- **Tägliche Snapshots** — automatisches tägliches Git-Backup
- **Discord-Benachrichtigungen** — optionale Webhook-Benachrichtigungen

## ⚡ Ein-Zeilen-Deployment (OpenClaw-Nutzer)

Nutzen Sie bereits OpenClaw? Sagen Sie Ihrem KI-Assistenten einfach:

> **„Installiere openclaw-guardian, um meinen Gateway abzusichern"**

Der Agent erledigt alles automatisch — git init, Script-Installation, Autostart. Kein Terminal nötig.

---

## Schnellstart

```bash
# 1. Git-Repository initialisieren
cd ~/.openclaw/workspace
git init && git add -A && git commit -m "initial"

# 2. Installieren
cp scripts/guardian.sh ~/.openclaw/guardian.sh
chmod +x ~/.openclaw/guardian.sh

# 3. Starten
nohup ~/.openclaw/guardian.sh >> /tmp/openclaw-guardian.log 2>&1 &
```

## Als OpenClaw Skill installieren

```bash
clawhub install openclaw-guardian
```

## Lizenz

MIT © [MyClaw.ai](https://myclaw.ai)
