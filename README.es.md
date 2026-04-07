# 🛡️ OpenClaw Guardian

<div align="center">

<a href="https://myclaw.ai">
  <img src="https://img.shields.io/badge/Powered%20by-MyClaw.ai-blue?style=for-the-badge" alt="Powered by MyClaw.ai" />
</a>

**Idiomas:**
[English](README.md) · [中文](README.zh-CN.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [日本語](README.ja.md) · [Italiano](README.it.md) · [Español](README.es.md)

</div>

---

## 🤖 Impulsado por [MyClaw.ai](https://myclaw.ai)

**[MyClaw.ai](https://myclaw.ai)** es una plataforma de asistente personal con IA que ofrece a cada usuario un agente de IA completo en un servidor dedicado — con control total del código, acceso a internet e integraciones de herramientas.

OpenClaw Guardian nació de la infraestructura de producción de MyClaw.ai y ahora se publica como proyecto open source.

> 🌐 **Prueba MyClaw.ai**: [https://myclaw.ai](https://myclaw.ai)

---

## Características

- **Monitoreo automático** — comprueba el estado del gateway cada 30 segundos
- **Reparación automática** — ejecuta `openclaw doctor --fix` en caso de fallo (hasta 3 intentos)
- **Reversión automática** — restaura el workspace al último commit Git estable
- **Instantáneas diarias** — copia de seguridad Git automática diaria
- **Alertas de Discord** — notificaciones webhook opcionales

## ⚡ Despliegue en una frase (Usuarios de OpenClaw)

¿Ya usas OpenClaw? Solo dile a tu asistente IA:

> **«Instala openclaw-guardian para proteger mi gateway»**

El agente lo gestiona todo automáticamente — git init, instalación del script, arranque automático. Sin necesidad de terminal.

---

## Inicio rápido

```bash
# 1. Inicializar repositorio Git
cd ~/.openclaw/workspace
git init && git add -A && git commit -m "initial"

# 2. Instalar
cp scripts/guardian.sh ~/.openclaw/guardian.sh
chmod +x ~/.openclaw/guardian.sh

# 3. Iniciar
nohup ~/.openclaw/guardian.sh >> /tmp/openclaw-guardian.log 2>&1 &
```

## Instalar como OpenClaw Skill

```bash
clawhub install openclaw-guardian
```

## Licencia

MIT © [MyClaw.ai](https://myclaw.ai)
