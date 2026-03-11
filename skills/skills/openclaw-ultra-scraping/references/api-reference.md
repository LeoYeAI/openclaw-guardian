# Scrapling API Reference

## Fetchers

### Fetcher (HTTP)
Fast HTTP requests with TLS fingerprint impersonation.
```python
from scrapling.fetchers import Fetcher, FetcherSession
page = Fetcher.get(url, impersonate='chrome', stealthy_headers=True, timeout=30)
# Session-based
with FetcherSession(impersonate='chrome') as session:
    page = session.get(url)
```

### StealthyFetcher (Anti-bot bypass)
Headless browser with advanced stealth. Bypasses Cloudflare Turnstile/Interstitial.
```python
from scrapling.fetchers import StealthyFetcher, StealthySession
page = StealthyFetcher.fetch(url, headless=True, solve_cloudflare=True, network_idle=True)
# Session-based
with StealthySession(headless=True, solve_cloudflare=True) as session:
    page = session.fetch(url)
```

### DynamicFetcher (Full browser)
Full Playwright-based browser automation.
```python
from scrapling.fetchers import DynamicFetcher, DynamicSession
page = DynamicFetcher.fetch(url, headless=True, network_idle=True, disable_resources=False)
# Session-based
with DynamicSession(headless=True) as session:
    page = session.fetch(url)
```

### Async Variants
```python
from scrapling.fetchers import AsyncFetcher, AsyncStealthySession, AsyncDynamicSession
# All support same APIs with async/await
```

## Selectors

```python
# CSS
elements = page.css('.class')
texts = page.css('.class::text').getall()
single = page.css('.class::text').get()

# XPath
elements = page.xpath('//div[@class="quote"]')

# BeautifulSoup-style
elements = page.find_all('div', class_='quote')
element = page.find('div', {'id': 'main'})

# Text search
elements = page.find_by_text('keyword', tag='div')

# Chained
page.css('.quote').css('.text::text').getall()
```

## Element Navigation
```python
el.parent                    # Parent element
el.children                  # Direct children
el.next_sibling             # Next sibling
el.previous_sibling         # Previous sibling
el.find_similar()           # Elements similar to this one
el.below_elements()         # Elements below this one
el.attrib                   # Dict of attributes
el.text                     # Text content
el.html                     # HTML content
```

## Adaptive Scraping (Smart Tracking)
```python
# Save element fingerprints
products = page.css('.product', auto_save=True)
# Later, if site changes:
products = page.css('.product', adaptive=True)
```

## Spider Framework
```python
from scrapling.spiders import Spider, Request, Response

class MySpider(Spider):
    name = "my_spider"
    start_urls = ["https://example.com/"]
    concurrent_requests = 10

    async def parse(self, response: Response):
        for item in response.css('.item'):
            yield {"title": item.css('h2::text').get()}
        next_page = response.css('.next a::attr(href)').get()
        if next_page:
            yield response.follow(next_page)

result = MySpider().start()
result.items.to_json("output.json")
result.items.to_jsonl("output.jsonl")
```

### Multi-session Spider
```python
def configure_sessions(self, manager):
    manager.add("fast", FetcherSession(impersonate="chrome"))
    manager.add("stealth", AsyncStealthySession(headless=True), lazy=True)
```

### Pause & Resume
```python
MySpider(crawldir="./crawl_data").start()  # Ctrl+C to pause, re-run to resume
```

## Proxy Rotation
```python
from scrapling.fetchers import ProxyRotator
rotator = ProxyRotator(["http://proxy1:8080", "socks5://proxy2:1080"])
page = Fetcher.get(url, proxy=rotator.next())
```

## CLI
```bash
scrapling shell                              # Interactive shell
scrapling extract get URL output.md          # Extract to markdown
scrapling extract get URL output.txt --css-selector '.content'
scrapling extract stealthy-fetch URL out.html --solve-cloudflare
```
