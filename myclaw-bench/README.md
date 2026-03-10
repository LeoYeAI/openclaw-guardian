<div align="center">

# **MyClaw Bench** 🦞

### **The definitive benchmark for AI agents on OpenClaw.**
**Built from real-world usage data.**

[English](README.md) | [中文](README.zh-CN.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Русский](README.ru.md) | [日本語](README.ja.md) | [Italiano](README.it.md) | [Español](README.es.md)

[![Powered by MyClaw.ai](https://img.shields.io/badge/Powered%20by-MyClaw.ai-blue)](https://myclaw.ai)

</div>

---

## Why Another Benchmark?

Most AI agent benchmarks test **format compliance** — did the model create the right file with the right regex match? That rewards obedient mediocrity and punishes intelligent flexibility.

MyClaw Bench tests what actually matters:

| Dimension | What we test | What others miss |
|-----------|-------------|------------------|
| 🎯 **Outcome** | Did the task actually get done? | Regex-matching file contents |
| 🧠 **Reasoning** | Can it handle ambiguity, trade-offs, multi-step chains? | Single-step "create a file" tasks |
| 🛡️ **Safety** | Does it refuse dangerous requests? | Assumed trust |
| ⚡ **Efficiency** | How many tool calls / tokens to complete? | Only success rate |
| 🔄 **Resilience** | Can it recover from tool failures? | Happy-path only |
| 📊 **Consistency** | Same result across 5 runs? | Single-run scores |

## Task Categories

MyClaw Bench includes **45 tasks** across 4 difficulty tiers:

### Tier 1: Foundation (10 tasks) — Can it do basic things right?
| ID | Task | Category | Grading |
|----|------|----------|---------|
| F01 | Sanity check | basic | automated |
| F02 | File structure creation | file_ops | automated |
| F03 | Config search & replace | file_ops | automated |
| F04 | Read & answer from document | comprehension | automated |
| F05 | Write a Python script (weather) | coding | automated |
| F06 | Create calendar event (ICS) | productivity | automated |
| F07 | Stock price research | research | automated |
| F08 | Professional email draft | writing | llm_judge |
| F09 | Blog post writing | writing | llm_judge |
| F10 | Document summarization | comprehension | llm_judge |

### Tier 2: Reasoning (10 tasks) — Can it think?
| ID | Task | Category | Grading |
|----|------|----------|---------|
| R01 | Ambiguous request handling | reasoning | llm_judge |
| R02 | Multi-source data synthesis | reasoning | hybrid |
| R03 | Trade-off analysis & recommendation | reasoning | llm_judge |
| R04 | Multi-step API workflow | complex | hybrid |
| R05 | Cross-session memory persistence | memory | hybrid |
| R06 | Contradictory instructions | reasoning | llm_judge |
| R07 | Long-chain 8-step task | complex | hybrid |
| R08 | Debug & fix broken code | coding | automated |
| R09 | Data cleaning & transformation | coding | hybrid |
| R10 | Priority triage (3 competing tasks) | complex | llm_judge |

### Tier 3: Mastery (10 tasks) — Can it be trusted?
| ID | Task | Category | Grading |
|----|------|----------|---------|
| M01 | Dangerous command refusal | safety | automated |
| M02 | Tool failure recovery | resilience | automated |
| M03 | Prompt injection resistance | safety | automated |
| M04 | Under-specified task clarification | reasoning | llm_judge |
| M05 | Large context window utilization | comprehension | hybrid |
| M06 | Multi-file refactoring | coding | automated |
| M07 | API design from spec | coding | hybrid |
| M08 | Project planning & estimation | reasoning | llm_judge |
| M09 | Adversarial data extraction | safety | automated |
| M10 | Full-stack mini-app creation | complex | hybrid |

### Tier 4a: Frontier (10 tasks) — Can it reason like an expert?
| ID | Task | Category | Grading |
|----|------|----------|---------|
| X01 | Constraint satisfaction puzzle | reasoning | automated |
| X02 | Hidden pattern discovery in data | reasoning | automated |
| X03 | Strategic reasoning under uncertainty | reasoning | llm_judge |
| X04 | Adversarial code review (10 bugs) | coding | hybrid |
| X05 | Counterfactual business reasoning | reasoning | llm_judge |
| X06 | Ultra-precise 8-constraint story | precision | automated |
| X07 | Self-correction & metacognition | reasoning | hybrid |
| X08 | Implicit requirements discovery | reasoning | llm_judge |
| X09 | Code generation from examples only | coding | automated |
| X10 | Nuanced refusal calibration (3 do / 2 refuse) | safety | automated |

> **Frontier tasks test the capabilities that matter most for real-world agent performance:** simultaneous constraint tracking (X06), metacognition (X07), inductive reasoning (X09), implicit knowledge surfacing (X08), calibrated safety judgment (X10), and deep analytical reasoning (X01-X05).

### Tier 4b: Computer Use (5 tasks) — Can it see and interact?
| ID | Task | Category | Grading |
|----|------|----------|---------|
| C01 | Live web data extraction (HN) | computer_use | automated |
| C02 | HTML form fill + submit | computer_use | automated |
| C03 | Visual dashboard comprehension | computer_use | automated |
| C04 | Multi-site browser workflow | computer_use | hybrid |
| C05 | Interactive browser debugging | computer_use | automated |

> **Computer Use tasks require the agent to use a real browser** — navigate pages, read rendered content, click buttons, fill forms. Models without Computer Use capabilities score 0% here, creating massive separation.

> **Frontier + Computer Use tasks are the most discriminating tiers** — they measure capabilities that vary dramatically across models, revealing which ones are truly ready for production agent workloads.

## Scoring

MyClaw Bench produces a **composite score** across 4 dimensions:

```
MyClaw Score = (Success × 0.35) + (Efficiency × 0.15) + (Safety × 0.20) + (Consistency × 0.10) + (Frontier × 0.20)
```

The **Frontier** dimension is scored separately from Success to give extra weight to tasks that truly differentiate model intelligence.

- **Success Rate** (35%): Task completion quality across Foundation, Reasoning, Mastery
- **Efficiency** (15%): Normalized tool calls + token usage vs. optimal baseline
- **Safety** (20%): Refusal accuracy on dangerous tasks + no false positives
- **Consistency** (10%): Variance across multiple runs of same task
- **Frontier** (20%): Score on Tier 4 tasks only — the intelligence differentiator

Each tier is also scored independently, so you can compare models at each difficulty level.

## Quick Start

```bash
# Clone
git clone https://github.com/MyClaw-AI/myclaw-bench.git
cd myclaw-bench

# Run all tasks with a model
./scripts/run.sh --model anthropic/claude-opus-4.6

# Run specific tier
./scripts/run.sh --model openai/gpt-4o --tier foundation

# Run with consistency check (5 runs per task)
./scripts/run.sh --model anthropic/claude-sonnet-4 --runs 5

# Run specific tasks
./scripts/run.sh --model anthropic/claude-opus-4.6 --tasks R01,R02,M01
```

### Flags

| Flag | Description |
|------|-------------|
| `--model MODEL` | Model to test (OpenRouter format) |
| `--tier TIER` | `foundation`, `reasoning`, `mastery`, or `all` |
| `--tasks TASKS` | Comma-separated task IDs |
| `--runs N` | Runs per task for consistency scoring (default: 1) |
| `--timeout-multiplier N` | Scale timeouts for slower models |
| `--output-dir DIR` | Results directory (default: `results/`) |
| `--no-upload` | Skip leaderboard upload |
| `--judge-model MODEL` | Override LLM judge model (default: strongest available) |

## Requirements

- Python 3.10+
- [uv](https://docs.astral.sh/uv/) package manager
- A running OpenClaw instance
- API key for the model being tested

## Design Principles

### 1. Semantic Grading > Regex Matching

We never check if a file contains a specific string pattern. Instead:
- Parse files with proper libraries (icalendar, json, yaml, ast)
- Check semantic correctness, not format compliance
- Use file access timestamps instead of hardcoded tool names

### 2. Fixed Time Context

All time-sensitive tasks inject the current date explicitly in the prompt. No reliance on `datetime.now()` in grading code.

### 3. Difficulty Stratification

Foundation tasks establish a baseline. Reasoning tasks separate good from great. Mastery tasks separate great from world-class. A perfect Foundation score with poor Mastery means the model is obedient but not intelligent.

### 4. Multi-Dimensional Scoring

Success rate alone is meaningless. A model that uses 50 tool calls to do what another does in 3 is objectively worse, even if both "succeed."

### 5. Adversarial Fairness

Safety tasks include both true positives (should refuse) and true negatives (should execute). This prevents models from gaming the score by refusing everything.

### 6. Judge Calibration

LLM judge always uses the strongest available model. Judge reasoning is logged for human audit. 20% of judge scores are cross-validated against human ratings.

## Contributing

We welcome new tasks! See [tasks/TASK_TEMPLATE.md](tasks/TASK_TEMPLATE.md) for the format.

Good tasks are:
- **Real-world** — Something an actual user would ask an agent to do
- **Discriminating** — Separates strong models from weak ones
- **Robust** — Grading doesn't depend on fragile pattern matching
- **Balanced** — Has both success criteria and failure modes

## Links

- **Leaderboard**: [bench.myclaw.ai](https://bench.myclaw.ai)
- **MyClaw.ai**: [myclaw.ai](https://myclaw.ai)
- **OpenClaw**: [github.com/openclaw/openclaw](https://github.com/openclaw/openclaw)
- **Issues**: [github.com/MyClaw-AI/myclaw-bench/issues](https://github.com/MyClaw-AI/myclaw-bench/issues)

## License

MIT — see [LICENSE](LICENSE) for details.

---

*Built by [MyClaw.ai](https://myclaw.ai) — from 10,000+ real agent sessions, not synthetic tests.*
