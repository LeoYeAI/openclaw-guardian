# 🛡️ OpenClaw Guardian

<div align="center">

<a href="https://myclaw.ai">
  <img src="https://img.shields.io/badge/Powered%20by-MyClaw.ai-blue?style=for-the-badge" alt="Powered by MyClaw.ai" />
</a>

**Langues :**
[English](README.md) · [中文](README.zh-CN.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [日本語](README.ja.md) · [Italiano](README.it.md) · [Español](README.es.md)

</div>

---

## 🤖 Propulsé par [MyClaw.ai](https://myclaw.ai)

**[MyClaw.ai](https://myclaw.ai)** est une plateforme d'assistant personnel IA qui offre à chaque utilisateur un agent IA complet sur un serveur dédié — avec contrôle total du code, accès internet et intégrations d'outils. Un vrai assistant privé qui *agit*, pas seulement qui répond.

OpenClaw Guardian est né de l'infrastructure de production de MyClaw.ai. Nous faisons tourner des milliers d'instances d'agents IA 24h/24, et Guardian est la couche de protection qui les maintient en vie.

> 🌐 **Essayez MyClaw.ai** : [https://myclaw.ai](https://myclaw.ai)

---

## Fonctionnalités

- **Surveillance automatique** — vérifie l'état du Gateway toutes les 30 secondes
- **Réparation automatique** — exécute `openclaw doctor --fix` en cas de panne (jusqu'à 3 tentatives)
- **Retour arrière automatique** — restaure le workspace au dernier commit Git stable
- **Instantanés quotidiens** — sauvegarde Git automatique quotidienne
- **Alertes Discord** — notifications webhook optionnelles

## Démarrage rapide

```bash
# 1. Initialiser le dépôt Git
cd ~/.openclaw/workspace
git init && git add -A && git commit -m "initial"

# 2. Installer
cp scripts/guardian.sh ~/.openclaw/guardian.sh
chmod +x ~/.openclaw/guardian.sh

# 3. Démarrer
nohup ~/.openclaw/guardian.sh >> /tmp/openclaw-guardian.log 2>&1 &
```

## Installer en tant que Skill OpenClaw

```bash
clawhub install openclaw-guardian
```

## Licence

MIT © [MyClaw.ai](https://myclaw.ai)
