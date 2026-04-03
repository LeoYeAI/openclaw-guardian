# buddy-claw 🐣

Virtual pet companion plugin for [OpenClaw](https://github.com/openclaw/openclaw) — ASCII art pets that live in your Telegram chat.

Ported from Claude Code's internal buddy module, adapted for the OpenClaw plugin system.

## Features

- **18 species**: duck, goose, cat, dragon, octopus, owl, penguin, capybara, robot, and more
- **Deterministic generation**: same user always gets the same pet (species, eyes, hat, stats)
- **5 rarity tiers**: common (60%) → uncommon (25%) → rare (10%) → epic (4%) → legendary (1%)
- **ASCII art sprites**: 3-frame animations rendered in Telegram code blocks
- **Growth system**: XP, levels, affection, mood
- **Conversation reactions**: your pet comments on conversations
- **Interactive commands**: pet, feed, rename, mute

## Commands

| Command | Description |
|---|---|
| `/buddy` | View your companion status card |
| `/buddy pet` | Pet your companion (+affection, +2 XP) |
| `/buddy feed` | Feed your companion (+3 XP, mood → happy) |
| `/buddy name <name>` | Rename your companion |
| `/buddy mute` | Toggle companion reactions |
| `/buddy help` | Show command list |

## Configuration

In `openclaw.json`:

```json
{
  "extensions": {
    "buddy-claw": {
      "enabled": true,
      "reactChance": 0.3,
      "silentReactions": true,
      "dbPath": "~/.openclaw/buddy.db"
    }
  }
}
```

| Option | Default | Description |
|---|---|---|
| `enabled` | `true` | Enable/disable the plugin |
| `reactChance` | `0.3` | Probability of reaction per turn (0.0–1.0) |
| `silentReactions` | `true` | Send reactions without notification sound |
| `dbPath` | `~/.openclaw/buddy.db` | SQLite database path |

## Rarity System

Each user's companion is generated deterministically from their userId hash:

| Rarity | Chance | Base Stats | Hat |
|---|---|---|---|
| ⚪ Common | 60% | 5+ | None |
| 🟢 Uncommon | 25% | 15+ | Random |
| 🔵 Rare | 10% | 25+ | Random |
| 🟣 Epic | 4% | 35+ | Random |
| 🟡 Legendary | 1% | 50+ | Random |

1% chance of **SHINY** ✨ variant (purely cosmetic).

## Stats

Each companion has 5 stats that affect their personality and reactions:

- **DEBUGGING** — technical aptitude
- **PATIENCE** — how calm they stay
- **CHAOS** — randomness and unpredictability
- **WISDOM** — insightful observations
- **SNARK** — sarcasm level

## Growth

- **XP sources**: chatting (+1), petting (+2), feeding (+3)
- **Level formula**: `10 × level × (1 + level × 0.3)` XP per level
- **Affection**: accumulated through petting and feeding (max 1000)
- **Mood**: changes based on interactions (happy/neutral/sleepy/excited)

## Architecture

```
buddy-claw/
├── index.ts              # Plugin entry point (OpenClaw integration)
├── openclaw.plugin.json  # Plugin metadata
├── src/
│   ├── types.ts          # Type definitions (18 species, rarities, stats)
│   ├── companion.ts      # Deterministic companion generation (PRNG)
│   ├── sprites.ts        # ASCII art sprite definitions
│   ├── render.ts         # Telegram message rendering
│   ├── observer.ts       # Conversation reaction generation
│   └── store.ts          # SQLite persistence (growth, interactions)
```

## Credits

Original buddy system by [Anthropic](https://anthropic.com) (Claude Code v2.1.87).
Adapted for OpenClaw as an independent plugin.

## License

MIT
