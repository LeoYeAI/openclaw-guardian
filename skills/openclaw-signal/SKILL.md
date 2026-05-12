---
name: openclaw-signal
description: >
  AI-powered daily news briefing skill — your personal Signal from the noise.
  Fetches content from Hacker News, RSS feeds, Reddit, and GitHub; scores,
  deduplicates, enriches, and delivers a personalized daily briefing — all using
  OpenClaw native tools with zero external dependencies. Use when: user wants
  automated daily news digests, tech news monitoring, information aggregation,
  personalized news radar, or asks for "daily briefing", "news summary",
  "what happened today in tech", "signal", "run signal", "news radar".
  NOT for: real-time alerts (use webhooks), historical research, or single-URL
  content extraction (use web_fetch directly).
---

# Signal

**Your AI news radar. From noise to signal.**

Zero-dependency daily news briefing powered by OpenClaw's native tools.
Inspired by [Horizon](https://github.com/Thysrael/Horizon).

## Overview

Fetch → Score → Deduplicate → Enrich → Deliver.

The agent itself acts as the AI evaluator — no separate API calls needed.
Scheduling via `cron`, delivery via `message`, fetching via `exec` + `web_fetch`.

## Quick Start

1. Create config: `signal/config.json` in workspace (see Config section)
2. Run manually: user says "run signal" or "signal"
3. Schedule: set up cron for daily automated runs (see Scheduling section)

## Config

Store at `{workspace}/signal/config.json`. Create `signal/` dir if needed.

```json
{
  "sources": {
    "hackernews": { "enabled": true, "min_score": 100, "limit": 30 },
    "rss": [
      { "name": "Simon Willison", "url": "https://simonwillison.net/atom/everything/" },
      { "name": "The Verge", "url": "https://www.theverge.com/rss/index.xml" }
    ],
    "reddit": [
      { "subreddit": "MachineLearning", "sort": "hot", "limit": 20, "min_score": 50 },
      { "subreddit": "LocalLLaMA", "sort": "hot", "limit": 15, "min_score": 30 }
    ],
    "github_releases": [
      { "owner": "astral-sh", "repo": "uv" },
      { "owner": "openai", "repo": "codex" }
    ]
  },
  "scoring": {
    "threshold": 7,
    "interests": ["AI/ML", "LLM", "startup", "open source", "developer tools"],
    "boost_keywords": ["breakthrough", "launch", "funding", "acquisition", "vulnerability"],
    "penalty_keywords": ["listicle", "sponsored"]
  },
  "output": {
    "language": "zh",
    "max_items": 15,
    "save_to": "signal/briefings"
  },
  "schedule": {
    "cron": "0 8 * * *",
    "timezone": "Asia/Shanghai"
  }
}
```

### Config Fields

- `sources` — What to fetch. Each source type can be enabled/disabled independently.
- `scoring.threshold` — 0-10 cutoff. Items below this are dropped. Default: 7.
- `scoring.interests` — Topics that get a scoring boost. Personalize this.
- `output.language` — Briefing language: `"en"`, `"zh"`, or `"both"`.
- `output.max_items` — Cap on items in final briefing. Default: 15.
- `schedule.cron` — Cron expression for automated daily runs.

If no config exists, use sensible defaults: HN top 30 + threshold 7 + language from USER.md.

## Trigger

User says any of: "run signal", "signal", "daily briefing", "news summary", "what's new today".

## Workflow

Execute these steps in order. Read `references/source-apis.md` for API details.

### Step 1: Fetch

Fetch from each enabled source concurrently when possible.

**Hacker News** — Use `exec` with curl against Algolia API:
```bash
curl -s "https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=30" | python3 -c "import sys,json; d=json.load(sys.stdin); [print(json.dumps(h)) for h in [{'title':h['title'],'url':h.get('url',''),'score':h['points'],'comments':h['num_comments'],'id':h['objectID']} for h in d['hits']]]"
```
Alternatively parse the JSON output directly — it contains `hits[]` with `title`, `url`, `points`, `num_comments`, `objectID`, `author`, `created_at`.

**RSS Feeds** — Use `web_fetch` in markdown mode for each feed URL. Extract titles, links, and dates from the rendered output.

**Reddit** — Reddit blocks most server IPs. Use `web_fetch` on old.reddit.com:
```
web_fetch https://old.reddit.com/r/{subreddit}/top/?t=day
```
Or Reddit RSS: `web_fetch https://www.reddit.com/r/{subreddit}/top/.rss?t=day`

**GitHub Releases** — Use `exec` with curl for GitHub API:
```bash
curl -s -H "Accept: application/vnd.github.v3+json" "https://api.github.com/repos/{owner}/{repo}/releases?per_page=5"
```
Parse the JSON for `name`, `tag_name`, `html_url`, `body`, `published_at`.

Collect all items into a unified list. For each item, capture: title, url, source, score/engagement, author, date.

Filter by time window (default: last 24 hours).

### Step 2: Score

Present ALL fetched items to yourself in a single batch. For each item, assign a 0-10 score based on:

**9-10 Groundbreaking**: Major breakthroughs, paradigm shifts, significant announcements.
**7-8 High Value**: Important developments, novel approaches, insightful analysis.
**5-6 Interesting**: Worth knowing but not urgent. Incremental improvements.
**3-4 Low Priority**: Generic, routine, promotional.
**0-2 Noise**: Spam, off-topic, trivial.

Scoring factors (in priority order):
1. **User interests** — Match against `scoring.interests` from config
2. **Novelty** — Is this genuinely new information?
3. **Impact** — How many people does this affect?
4. **Technical depth** — Substance over hype
5. **Community signal** — High scores + many comments = community-validated
6. **Boost/penalty keywords** — Apply from config

Also assign: one-line summary, 3-5 tags.

Drop everything below `scoring.threshold`.

### Step 3: Deduplicate

From the scored items, identify duplicates covering the same event across sources.
Keep the version with the richest metadata (highest score, most comments, best URL).
Merge engagement signals from duplicates into the primary.

### Step 4: Enrich (Top Items Only)

For the top 5-8 items (by score), use `web_fetch` to load the actual article/page content.
For each, produce:
- **What's new** — 1-2 sentences on what happened
- **Why it matters** — 1-2 sentences on significance
- **Background** — 2-3 sentences of context for non-experts (skip if self-explanatory)
- **Community discussion** — Summarize sentiment from comments if available (for HN/Reddit items)

For HN items with high comment counts, optionally fetch the discussion page:
```
web_fetch https://news.ycombinator.com/item?id={id}
```

### Step 5: Format & Deliver

#### Briefing Format

Use the language from `output.language` (or USER.md if not specified).

```markdown
📡 **Signal — {YYYY-MM-DD}**
> From {total} items, {count} important pieces selected

---

**1. [{title}]({url})** ⭐️ {score}/10
{summary}
📡 {source} · {author} · {date}
🏷️ {tags}

> 💡 **Why it matters**: {why_it_matters}
> 📚 **Background**: {background}
> 💬 **Discussion**: {community_discussion}

---

**2. [{title}]({url})** ⭐️ {score}/10
...
```

Non-enriched items (ranked below top 5-8) get a compact format: title + score + summary + tags only.

#### Delivery

1. **Save to file**: Write to `{workspace}/signal/briefings/{YYYY-MM-DD}.md`
2. **Send via message**: Use the `message` tool to push briefing to the user's primary channel
3. For long briefings, split into: overview message (TOC with scores) + detailed items

If the briefing is too long for a single message (>4000 chars), split:
- Message 1: Overview with numbered list of items + scores
- Messages 2-N: 3-4 items per message with full enrichment

### Step 6: Archive

After delivery, update `signal/state.json`:
```json
{
  "last_run": "2026-05-12T08:00:00Z",
  "items_fetched": 127,
  "items_selected": 12,
  "sources_status": {
    "hackernews": "ok",
    "rss": "ok",
    "reddit": "rate_limited"
  }
}
```

## Scheduling

Set up automated daily runs via cron:

```
cron add --schedule "0 8 * * *" --payload "Run signal" --delivery channel
```

Adjust the cron expression and timezone per user preference. The cron job triggers the skill workflow automatically.

## First Run Setup

If user says "set up signal" or "configure my news radar":

1. Ask about their interests (3-5 topics)
2. Ask about preferred sources (suggest HN + 2-3 RSS + 1-2 subreddits)
3. Ask about preferred language and delivery time
4. Generate `signal/config.json`
5. Do a first run immediately to show results
6. Set up cron for daily delivery

## Error Handling

- If a source fails to fetch, log it in `state.json` and continue with others
- If Reddit returns 429 (rate limit), skip Reddit for this run and note in briefing footer
- If fewer than 3 items pass the threshold, lower threshold by 1 and re-evaluate
- If zero items after lowering: report "quiet day" with a note on which sources were checked

## Maintenance

- `signal/config.json` — User edits to change sources/interests
- `signal/briefings/` — Archive of past briefings (auto-created)
- `signal/state.json` — Run state tracking
- Clean up briefings older than 30 days periodically

## Tips

- Start with fewer sources and add more over time
- Threshold 7 is good for daily digests; lower to 5-6 for comprehensive coverage
- RSS feeds are the most reliable source (no rate limits, no auth)
- Combine with the user's MEMORY.md interests for better scoring context
- For bilingual output (`"both"`), generate two separate briefings
