# 🛡️ OpenClaw Guardian

<div align="center">

<a href="https://myclaw.ai">
  <img src="https://img.shields.io/badge/Powered%20by-MyClaw.ai-blue?style=for-the-badge" alt="Powered by MyClaw.ai" />
</a>

**Языки:**
[English](README.md) · [中文](README.zh-CN.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [日本語](README.ja.md) · [Italiano](README.it.md) · [Español](README.es.md)

</div>

---

## 🤖 На базе [MyClaw.ai](https://myclaw.ai)

**[MyClaw.ai](https://myclaw.ai)** — платформа персонального ИИ-ассистента, предоставляющая каждому пользователю полнофункционального ИИ-агента на выделенном сервере с полным контролем кода, доступом в интернет и интеграцией инструментов.

OpenClaw Guardian рождён из производственной инфраструктуры MyClaw.ai и открыт для всех.

> 🌐 **Попробуйте MyClaw.ai**: [https://myclaw.ai](https://myclaw.ai)

---

## Возможности

- **Автоматический мониторинг** — проверяет состояние Gateway каждые 30 секунд
- **Автоматическое восстановление** — запускает `openclaw doctor --fix` при сбое (до 3 попыток)
- **Автоматический откат** — сбрасывает рабочую область до последнего стабильного коммита
- **Ежедневные снимки** — автоматическое резервное копирование через Git
- **Уведомления Discord** — опциональные webhook-уведомления

## ⚡ Развёртывание в одну фразу (Пользователи OpenClaw)

Уже используете OpenClaw? Просто скажите своему ИИ-ассистенту:

> **«Установи openclaw-guardian, чтобы защитить мой gateway»**

Агент сделает всё автоматически — git init, установка скрипта, автозапуск. Терминал не нужен.

---

## Быстрый старт

```bash
# 1. Инициализация Git-репозитория
cd ~/.openclaw/workspace
git init && git add -A && git commit -m "initial"

# 2. Установка
cp scripts/guardian.sh ~/.openclaw/guardian.sh
chmod +x ~/.openclaw/guardian.sh

# 3. Запуск
nohup ~/.openclaw/guardian.sh >> /tmp/openclaw-guardian.log 2>&1 &
```

## Установить как OpenClaw Skill

```bash
clawhub install openclaw-guardian
```

## Лицензия

MIT © [MyClaw.ai](https://myclaw.ai)
