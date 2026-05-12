# Source API Reference

Detailed API patterns for each supported source. The agent reads this when executing
the fetch step to get exact endpoints, parameters, and parsing patterns.

## Hacker News (Algolia API)

**Endpoint**: `https://hn.algolia.com/api/v1/search`

No authentication required. No rate limits for reasonable use.

### Fetch front page stories

```bash
curl -s "https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=30"
```

Parse JSON with python3 (jq may not be available):
```bash
curl -s "https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=30" \
  | python3 -c "
import sys, json
d = json.load(sys.stdin)
for h in d['hits']:
    print(json.dumps({
        'title': h['title'],
        'url': h.get('url', f\"https://news.ycombinator.com/item?id={h['objectID']}\"),
        'score': h['points'],
        'comments': h['num_comments'],
        'id': h['objectID'],
        'author': h['author'],
        'created': h['created_at']
    }))
"
```

### Fetch by minimum score

```bash
curl -s "https://hn.algolia.com/api/v1/search?tags=story&numericFilters=points>100&hitsPerPage=30" \
  | python3 -c "
import sys, json
d = json.load(sys.stdin)
for h in d['hits']:
    print(json.dumps({
        'title': h['title'],
        'url': h.get('url', ''),
        'score': h['points'],
        'comments': h['num_comments'],
        'id': h['objectID']
    }))
"
```

### Fetch story comments (for enrichment)

Use `web_fetch` on the discussion page for top items:
```
web_fetch https://news.ycombinator.com/item?id={objectID}
```

This returns rendered markdown with the top comments visible.

### Time filtering

The `created_at` field is ISO 8601. Filter in jq:
```
select(.created_at > "YYYY-MM-DDT00:00:00Z")
```

Or use numeric filter: `numericFilters=created_at_i>{unix_timestamp}`

---

## RSS / Atom Feeds

**Method**: `web_fetch` in markdown mode

No authentication. No rate limits (polite fetching).

### Fetch a feed

```
web_fetch {feed_url}
```

`web_fetch` extracts readable content. For RSS/Atom XML, it will render the feed
entries as readable markdown with titles and links.

### Common feed patterns

Most feeds expose: title, link, published date, summary/description.

If `web_fetch` doesn't parse the feed well, fall back to raw curl:
```bash
curl -s "{feed_url}" | head -200
```

Then parse XML manually — look for `<item>` or `<entry>` blocks with `<title>`,
`<link>`, `<pubDate>` / `<published>`.

### Popular tech RSS feeds

| Feed | URL |
|------|-----|
| Simon Willison | `https://simonwillison.net/atom/everything/` |
| The Verge | `https://www.theverge.com/rss/index.xml` |
| Ars Technica | `https://feeds.arstechnica.com/arstechnica/index` |
| TechCrunch | `https://techcrunch.com/feed/` |
| Hacker News (RSS) | `https://hnrss.org/frontpage?points=100` |
| LWN.net | `https://lwn.net/headlines/rss` |
| Benedict Evans | `https://www.ben-evans.com/benedictevans?format=rss` |
| Stratechery | `https://stratechery.com/feed/` |

---

## Reddit

**Primary method**: `web_fetch` on the subreddit page (rendered HTML).

Reddit's JSON API blocks most server IPs (403). Use `web_fetch` instead:

### Fetch hot posts from a subreddit

```
web_fetch https://old.reddit.com/r/{subreddit}/top/?t=day
```

This returns rendered page content with post titles, scores, comment counts,
and links. Extract the relevant items from the markdown output.

Alternative — RSS feed (more reliable, no auth):
```
web_fetch https://www.reddit.com/r/{subreddit}/top/.rss?t=day&limit=20
```

### If JSON API works (some environments)

Some networks allow Reddit JSON. Try first:
```bash
curl -s -H "User-Agent: Mozilla/5.0 OpenClaw-Signal/1.0" \
  "https://www.reddit.com/r/{subreddit}/hot.json?limit=20"
```
If 403, fall back to `web_fetch` on rendered HTML.

### Sort options

- `/hot/` — Trending now
- `/top/?t=day` — Top of the day
- `/new/` — Latest
- `/rising/` — Gaining momentum

### Fetch post comments (for enrichment)

```
web_fetch https://old.reddit.com/r/{subreddit}/comments/{post_id}/
```

### Fallback: skip silently

If both methods fail (403 or empty), skip Reddit for this run and note in state.json

### Popular tech subreddits

| Subreddit | Focus |
|-----------|-------|
| r/MachineLearning | ML research & industry |
| r/LocalLLaMA | Local LLM deployment |
| r/programming | General programming |
| r/technology | Tech news |
| r/selfhosted | Self-hosting (OpenClaw adjacent) |
| r/artificial | AI general |
| r/ExperiencedDevs | Senior dev discussions |
| r/startups | Startup ecosystem |

---

## GitHub Releases API

**Base URL**: `https://api.github.com`

No auth required for public repos. Rate limit: 60 req/hr (unauthenticated).
With `GITHUB_TOKEN`: 5000 req/hr.

### Fetch recent releases

```bash
curl -s -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/{owner}/{repo}/releases?per_page=5"
```

Parse JSON:
```bash
curl -s -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/{owner}/{repo}/releases?per_page=5" \
  | python3 -c "
import sys, json
for r in json.load(sys.stdin):
    print(json.dumps({
        'name': r.get('name') or r['tag_name'],
        'tag': r['tag_name'],
        'url': r['html_url'],
        'body': (r.get('body') or '')[:300],
        'published': r['published_at'],
        'author': r['author']['login'],
        'prerelease': r['prerelease']
    }))
"
```

### With authentication (higher rate limit)

If `GITHUB_TOKEN` env var is set:
```bash
curl -s -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/{owner}/{repo}/releases?per_page=5"
```

### Fetch user events (activity feed)

```bash
curl -s -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/users/{username}/events/public?per_page=30" \
  | python3 -c "
import sys, json
for e in json.load(sys.stdin):
    if e['type'] in ('ReleaseEvent', 'CreateEvent', 'PushEvent'):
        print(json.dumps({
            'type': e['type'],
            'repo': e['repo']['name'],
            'created': e['created_at'],
            'action': e.get('payload', {}).get('action', '')
        }))
"
```

### Time filtering

Filter by `published_at` date string comparison:
```
select(.published_at > "YYYY-MM-DDT00:00:00Z")
```

### Notable repos to watch

| Repo | What |
|------|------|
| astral-sh/uv | Python package manager |
| openai/codex | OpenAI Codex CLI |
| anthropics/claude-code | Claude CLI |
| langchain-ai/langchain | LLM framework |
| huggingface/transformers | ML models |
| vercel/next.js | React framework |
| denoland/deno | JS/TS runtime |

---

## Telegram Public Channels

**Method**: `web_fetch` on `https://t.me/s/{channel_name}`

No authentication. The `/s/` prefix serves a static preview page.

```
web_fetch https://t.me/s/{channel_name}
```

This returns the latest messages from the channel in readable format.
Extract message text, links, and timestamps from the rendered output.

### Note

Not all channels have public web previews enabled. If `web_fetch` returns
empty or error, skip the channel silently.

---

## General Tips

### Parallel fetching

When fetching from multiple sources, batch independent `exec` calls where possible.
Each source is independent — HN, Reddit, RSS, and GitHub can all be fetched in the
same turn.

### Error resilience

Always wrap source fetches in try/catch logic:
- Network errors → skip source, log in state
- Parse errors → skip source, log in state
- Rate limits → back off or skip, note in briefing footer
- Empty results → not an error, just a quiet source

### Time window calculation

Default: 24 hours. Calculate the cutoff:
```bash
date -u -d "24 hours ago" +%Y-%m-%dT%H:%M:%SZ
```

Or in the fetch commands, use numeric unix timestamp:
```bash
echo $(($(date +%s) - 86400))
```
