# 🛡️ OpenClaw Guardian

<div align="center">

<a href="https://myclaw.ai">
  <img src="https://img.shields.io/badge/Powered%20by-MyClaw.ai-blue?style=for-the-badge" alt="Powered by MyClaw.ai" />
</a>

**Lingue:**
[English](README.md) · [中文](README.zh-CN.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [日本語](README.ja.md) · [Italiano](README.it.md) · [Español](README.es.md)

</div>

---

## 🤖 Powered by [MyClaw.ai](https://myclaw.ai)

**[MyClaw.ai](https://myclaw.ai)** è una piattaforma di assistente personale IA che offre a ogni utente un agente IA completo su un server dedicato — con controllo totale del codice, accesso internet e integrazioni di strumenti.

OpenClaw Guardian è nato dall'infrastruttura di produzione di MyClaw.ai e viene ora rilasciato come progetto open source.

> 🌐 **Prova MyClaw.ai**: [https://myclaw.ai](https://myclaw.ai)

---

## Funzionalità

- **Monitoraggio automatico** — controlla lo stato del gateway ogni 30 secondi
- **Riparazione automatica** — esegue `openclaw doctor --fix` in caso di guasto (fino a 3 tentativi)
- **Rollback automatico** — ripristina il workspace all'ultimo commit Git stabile
- **Snapshot giornalieri** — backup Git automatico giornaliero
- **Avvisi Discord** — notifiche webhook opzionali

## ⚡ Deploy in una frase (Utenti OpenClaw)

Stai già usando OpenClaw? Di' semplicemente al tuo assistente IA:

> **«Installa openclaw-guardian per proteggere il mio gateway»**

L'agente gestisce tutto automaticamente — git init, installazione dello script, avvio automatico. Nessun terminale necessario.

---

## Avvio rapido

```bash
# 1. Inizializza il repository Git
cd ~/.openclaw/workspace
git init && git add -A && git commit -m "initial"

# 2. Installa
cp scripts/guardian.sh ~/.openclaw/guardian.sh
chmod +x ~/.openclaw/guardian.sh

# 3. Avvia
nohup ~/.openclaw/guardian.sh >> /tmp/openclaw-guardian.log 2>&1 &
```

## Installa come OpenClaw Skill

```bash
clawhub install openclaw-guardian
```

## Licenza

MIT © [MyClaw.ai](https://myclaw.ai)
