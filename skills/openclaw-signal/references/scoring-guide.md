# Scoring Guide & Output Formats

## Scoring Criteria

### Score Scale

| Score | Level | Criteria |
|-------|-------|----------|
| 9-10 | Groundbreaking | Major breakthroughs, paradigm shifts. New major releases of widely-used tech. Significant research milestones. Industry-changing announcements. |
| 7-8 | High Value | Important developments worth immediate attention. Technical deep-dives with novel insights. Valuable new tools/libraries. Insightful analysis or commentary. |
| 5-6 | Interesting | Worth knowing but not urgent. Incremental improvements. Useful tutorials. Moderate community interest. |
| 3-4 | Low Priority | Generic or routine content. Minor updates. Common knowledge. Promotional. |
| 0-2 | Noise | Spam, off-topic, trivial updates, pure promotion. |

### Scoring Factors (Priority Order)

1. **User interests match** — Does this align with configured `scoring.interests`? +1-2 points
2. **Novelty** — Is this genuinely new? Rehashed news gets -1-2
3. **Impact breadth** — Affects thousands of devs > niche audience
4. **Technical depth** — Substance over hype, data over opinion
5. **Community validation** — HN 200+ points, Reddit 100+ upvotes = signal
6. **Source authority** — Known expert > random blog
7. **Boost keywords** — Terms from `scoring.boost_keywords` add +0.5
8. **Penalty keywords** — Terms from `scoring.penalty_keywords` subtract -1

### Community Signal Weighting

| Signal | Interpretation |
|--------|---------------|
| HN score > 300 | Strong community interest, likely important |
| HN score 100-300 | Moderate interest, worth considering |
| Reddit score > 200 | Popular discussion topic |
| Reddit comments > 50 | Active debate, higher value |
| GitHub stars > 1000/week | Trending project |

## Output Formats

### Full Briefing (Markdown)

For file archival and long-form delivery:

```markdown
🌅 **Signal Daily — 2026-05-12**
> From 127 items, 12 important pieces selected

---

**1. [Claude 4 Released with Native Tool Use](https://anthropic.com/claude-4)** ⭐️ 9/10
Anthropic releases Claude 4 with native computer use, 200K context, and 3x faster inference.
📡 Hacker News · dang · May 12, 08:30
🏷️ `#AI` `#LLM` `#Anthropic` `#release`

> 💡 **Why it matters**: First foundation model with production-grade native tool use.
> Shifts the Agent landscape from "wrapper" architectures to native capabilities.
> 📚 **Background**: Claude 3.5 Sonnet introduced limited tool use in 2024. Claude 4
> extends this to full computer use with safety guardrails built into the model layer.
> 💬 **Discussion**: HN commenters are split — excitement about capabilities vs.
> concerns about Anthropic's recent security track record. Top comment questions
> whether native tool use eliminates the need for frameworks like LangChain.

---

**2. [Title](url)** ⭐️ 8/10
...
```

### Compact Format (for messaging)

For Telegram/Discord delivery where space is limited:

```
🌅 Signal Daily — 2026-05-12
12 items from 127 sources

1. 🔴 Claude 4 Released (9/10)
   anthropic.com — #AI #release

2. 🟡 uv 0.7 Ships (8/10)
   github.com — #python #tools

3. 🟡 YC W26 Recap (7/10)
   ycombinator.com — #startup

Full briefing: signal/briefings/2026-05-12.md
```

Score indicators: 🔴 9-10 | 🟡 7-8 | 🔵 5-6

### Chinese Format (zh)

```markdown
🌅 **Signal 每日速递 — 2026-05-12**
> 从 127 条内容中筛选出 12 条重要资讯

---

**1. [Claude 4 发布：原生工具调用能力](https://anthropic.com/claude-4)** ⭐️ 9/10
Anthropic 发布 Claude 4，支持原生计算机使用、200K 上下文、推理速度提升 3 倍。
📡 Hacker News · dang · 5月12日 08:30
🏷️ `#AI` `#LLM` `#Anthropic` `#发布`

> 💡 **重要性**: 首个具备生产级原生工具调用能力的基础模型……
> 📚 **背景**: Claude 3.5 Sonnet 在 2024 年引入了有限的工具调用……
> 💬 **社区讨论**: HN 评论两极分化——对能力兴奋 vs 对安全记录的担忧……
```

### Bilingual Format (both)

When `output.language` is `"both"`, generate two separate files:
- `{date}-en.md` — English version
- `{date}-zh.md` — Chinese version

Deliver the version matching USER.md language preference via message,
save both to the briefings folder.

## Enrichment Template

For top items, structure the enrichment as:

```json
{
  "whats_new": "1-2 sentences on what happened",
  "why_it_matters": "1-2 sentences on significance and impact",
  "key_details": "1-2 sentences of notable technical details or caveats",
  "background": "2-3 sentences of context (skip if self-explanatory)",
  "community_discussion": "1-3 sentences summarizing comment sentiment"
}
```

Rules:
- Base enrichment on actual fetched content — do not fabricate
- Only explain concepts actually mentioned in the item
- Background should help a non-expert understand the news
- Community discussion only when comments were fetched (HN/Reddit)
- Empty string for fields that don't apply

## Deduplication Rules

Two items are duplicates if they cover the **exact same event**:
- Same product release, same incident, same announcement
- Different takes on the same event count as duplicates
- Same product but different events are NOT duplicates

When merging duplicates:
1. Keep the item with highest score + most comments
2. Merge engagement signals (add scores, take max comments)
3. Note merged sources in metadata
4. If one has a direct article URL and another has a discussion URL, keep both
