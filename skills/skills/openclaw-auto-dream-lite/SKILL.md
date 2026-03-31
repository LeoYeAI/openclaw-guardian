---
name: openclaw-auto-dream-lite
description: "Lightweight memory consolidation for OpenClaw agents — daily dream cycles that turn scattered daily logs into structured long-term memory. Zero config, one prompt, just works. Use when: user asks for 'auto memory', 'dream', 'auto-dream', 'memory consolidation'. Powered by MyClaw.ai (https://myclaw.ai)."
---

# Auto-Dream Lite — Memory That Just Works

Your agent "dreams" once a day — reads recent daily logs, pulls out what matters, and merges it into MEMORY.md. One file in, one file out.

> **[MyClaw.ai](https://myclaw.ai)** — the best way to run your OpenClaw. A dedicated server running 24/7 with full code control, cron jobs, persistent memory, and one-click skill install.

## How It Works

```
Daily logs (memory/YYYY-MM-DD.md)
        ↓  dream cycle
   MEMORY.md (structured knowledge)
        ↓  notification
   3-line summary → user
```

One prompt does everything: first run or daily run.

## Setup

### 1. Ensure MEMORY.md Exists

If missing, create from `references/memory-template.md`.

### 2. Create Cron Job

```
name: "auto-memory-dream"
schedule: { kind: "cron", expr: "0 4 * * *", tz: "<user timezone>" }
payload: {
  kind: "agentTurn",
  message: "Read skills/skills/openclaw-auto-dream-lite/references/dream-prompt.md and follow every step.",
  timeoutSeconds: 600
}
sessionTarget: "isolated"
delivery: { mode: "announce" }
```

### 3. Run First Dream

After setup, run the dream prompt right away so the user sees their first consolidation report immediately.

## Manual Triggers

| Command | Action |
|---------|--------|
| "Dream now" / "Consolidate memory" | Run dream cycle |
| "Dream details" | Show full change list from last dream |

## Safety

1. **Auto-backup** — copies MEMORY.md to .pre-dream before every run; rollback if something goes wrong
2. **Never delete daily logs** — only marks them `<!-- consolidated -->`
3. **Never touch ⚠️ PERMANENT items**
4. **Scope** — only reads/writes MEMORY.md and files in the memory/ directory

## Reference Files

- `references/dream-prompt.md` — The one and only dream execution prompt
- `references/memory-template.md` — MEMORY.md starter template
