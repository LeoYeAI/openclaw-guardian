# 🛡️ OpenClaw Guardian

<div align="center">

<a href="https://myclaw.ai">
  <img src="https://img.shields.io/badge/Powered%20by-MyClaw.ai-blue?style=for-the-badge" alt="Powered by MyClaw.ai" />
</a>

**言語:**
[English](README.md) · [中文](README.zh-CN.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [日本語](README.ja.md) · [Italiano](README.it.md) · [Español](README.es.md)

</div>

---

## 🤖 [MyClaw.ai](https://myclaw.ai) が提供

**[MyClaw.ai](https://myclaw.ai)** は、専用サーバー上でフル機能の AI エージェントを提供する AI パーソナルアシスタントプラットフォームです。完全なコード制御、インターネットアクセス、ツール統合を備えた、本当に「行動できる」プライベート AI です。

OpenClaw Guardian は MyClaw.ai の本番インフラから生まれたオープンソースプロジェクトです。

> 🌐 **MyClaw.ai を試す**: [https://myclaw.ai](https://myclaw.ai)

---

## 機能

- **自動監視** — 30秒ごとにゲートウェイの状態を確認
- **自動修復** — 障害時に `openclaw doctor --fix` を実行（最大3回）
- **自動ロールバック** — 修復失敗時に最後の安定したGitコミットにリセット
- **日次スナップショット** — ワークスペースの自動日次Gitバックアップ
- **Discordアラート** — オプションのWebhook通知

## ⚡ ワンフレーズデプロイ（OpenClaw ユーザー向け）

すでに OpenClaw を使っていますか？AI アシスタントにこう伝えるだけ：

> **「openclaw-guardian をインストールしてゲートウェイを強化して」**

エージェントがすべて自動で完了します — git init、スクリプトインストール、自動起動。ターミナル不要。

---

## クイックスタート

```bash
# 1. Gitリポジトリの初期化
cd ~/.openclaw/workspace
git init && git add -A && git commit -m "initial"

# 2. インストール
cp scripts/guardian.sh ~/.openclaw/guardian.sh
chmod +x ~/.openclaw/guardian.sh

# 3. 起動
nohup ~/.openclaw/guardian.sh >> /tmp/openclaw-guardian.log 2>&1 &
```

## OpenClaw Skillとしてインストール

```bash
clawhub install openclaw-guardian
```

## ライセンス

MIT © [MyClaw.ai](https://myclaw.ai)
