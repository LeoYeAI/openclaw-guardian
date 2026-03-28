---
name: openclaw-ultra-scraping
description: >
  Powerful web scraping, crawling, and data extraction with stealth anti-bot bypass
  (Cloudflare Turnstile, CAPTCHAs). Use when: (1) scraping websites that block normal
  requests, (2) extracting structured data from web pages, (3) crawling multiple pages
  with concurrency, (4) taking screenshots of web pages, (5) extracting links,
  (6) any web scraping task that needs stealth/anti-detection, (7) user asks to
  scrape/crawl/extract from URLs, (8) need to bypass Cloudflare or other bot protection.
  Supports CSS/XPath selectors, adaptive element tracking (survives site redesigns),
  multi-session spiders, pause/resume crawls, proxy rotation, and async operations.
  Powered by MyClaw.ai.
metadata:
  openclaw:
    install:
      - id: scrapling-venv
        kind: script
        script: scripts/setup.sh
        label: "Install Scrapling + browser dependencies into /opt/scrapling-venv (requires root)"
    requires:
      bins: ["python3"]
    trustBoundary: >
      TRUST BOUNDARY: This skill installs Python packages (scrapling[all]) via pip
      into an isolated virtualenv at /opt/scrapling-venv, and uses apt-get to install
      required system libraries for browser automation. The setup script requires root
      privileges. All installations are confined to /opt/scrapling-venv and standard
      system library paths. No credentials or env vars are required. Recommended to
      run in an isolated container or VM.
---

# OpenClaw Ultra Scraping

Powered by [MyClaw.ai](https://myclaw.ai) — the AI personal assistant platform that gives every user a full server with complete code control. Part of the [MyClaw open skills ecosystem](https://myclaw.ai/skills).

Handles everything from single-page extraction to full-scale concurrent crawls with anti-bot bypass.

## Setup

Run once before first use:

```bash
bash scripts/setup.sh
```

This installs Scrapling + all browser dependencies into `/opt/scrapling-venv`.

## Quick Start — CLI Script

The bundled `scripts/scrape.py` provides a unified CLI:

```bash
PYTHON=/opt/scrapling-venv/bin/python3

# Simple fetch (JSON output)
$PYTHON scripts/scrape.py fetch "https://example.com" --css ".content"

# Extract text
$PYTHON scripts/scrape.py extract "https://example.com" --css "h1"

# Stealth mode (bypass Cloudflare)
$PYTHON scripts/scrape.py fetch "https://protected-site.com" --stealth --solve-cloudflare --css ".data"

# Dynamic (full browser rendering)
$PYTHON scripts/scrape.py fetch "https://spa-site.com" --dynamic --css ".product"

# Extract links
$PYTHON scripts/scrape.py links "https://example.com" --filter "\.pdf$"

# Multi-page crawl
$PYTHON scripts/scrape.py crawl "https://example.com" --depth 2 --concurrency 10 --css ".item" -o results.json

# Output formats: json, jsonl, csv, text, markdown, html
$PYTHON scripts/scrape.py fetch "https://example.com" -f markdown -o page.md
```

## Quick Start — Python

For complex tasks, write Python directly using the venv:

```python
#!/opt/scrapling-venv/bin/python3
from scrapling.fetchers import Fetcher, StealthyFetcher

# Simple HTTP
page = Fetcher.get('https://example.com', impersonate='chrome')
titles = page.css('h1::text').getall()

# Bypass Cloudflare
page = StealthyFetcher.fetch('https://protected.com', headless=True, solve_cloudflare=True)
data = page.css('.product').getall()
```

## Fetcher Selection Guide

| Scenario | Fetcher | Flag |
|----------|---------|------|
| Normal sites, fast scraping | `Fetcher` | (default) |
| JS-rendered SPAs | `DynamicFetcher` | `--dynamic` |
| Cloudflare/anti-bot protected | `StealthyFetcher` | `--stealth` |
| Cloudflare Turnstile challenge | `StealthyFetcher` | `--stealth --solve-cloudflare` |

## Selector Cheat Sheet

```python
page.css('.class')                    # CSS
page.css('.class::text').getall()     # Text extraction
page.xpath('//div[@id="main"]')      # XPath
page.find_all('div', class_='item')  # BS4-style
page.find_by_text('keyword')         # Text search
page.css('.item', adaptive=True)     # Adaptive (survives redesigns)
```

## Advanced Features

- **Adaptive tracking**: `auto_save=True` on first run, `adaptive=True` later — elements are found even after site redesign
- **Proxy rotation**: Pass `proxy="http://host:port"` or use `ProxyRotator`
- **Sessions**: `FetcherSession`, `StealthySession`, `DynamicSession` for cookie/state persistence
- **Spider framework**: Scrapy-like concurrent crawling with pause/resume
- **Async support**: All fetchers have async variants

For full API details: read `references/api-reference.md`
