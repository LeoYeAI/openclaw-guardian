#!/usr/bin/env python3
"""OpenClaw Ultra Scraping — unified CLI for Scrapling-powered web scraping.

Usage:
  scrape.py fetch <url> [--css SELECTOR] [--xpath SELECTOR] [--output FILE] [--format FORMAT] [--stealth] [--dynamic] [--solve-cloudflare] [--headless] [--impersonate BROWSER] [--timeout SECONDS]
  scrape.py extract <url> [--css SELECTOR] [--xpath SELECTOR] [--output FILE] [--format FORMAT] [--stealth] [--dynamic] [--solve-cloudflare] [--headless] [--impersonate BROWSER] [--timeout SECONDS]
  scrape.py screenshot <url> [--output FILE] [--stealth] [--dynamic] [--fullpage] [--headless]
  scrape.py links <url> [--stealth] [--dynamic] [--filter PATTERN]
  scrape.py crawl <url> [--depth DEPTH] [--concurrency N] [--output FILE] [--css SELECTOR] [--format FORMAT]

Formats: json (default), jsonl, csv, text, markdown, html
"""

import sys
import os
import json
import re
import argparse

# Ensure the scrapling venv is available
VENV_PYTHON = "/opt/scrapling-venv/bin/python3"
VENV_SITE = "/opt/scrapling-venv/lib/python3.12/site-packages"

if VENV_SITE not in sys.path:
    sys.path.insert(0, VENV_SITE)

def get_fetcher(args):
    """Return the appropriate fetcher based on flags."""
    if getattr(args, 'stealth', False):
        from scrapling.fetchers import StealthyFetcher
        return StealthyFetcher, {
            'headless': getattr(args, 'headless', True),
            'solve_cloudflare': getattr(args, 'solve_cloudflare', False),
        }
    elif getattr(args, 'dynamic', False):
        from scrapling.fetchers import DynamicFetcher
        return DynamicFetcher, {
            'headless': getattr(args, 'headless', True),
            'network_idle': True,
        }
    else:
        from scrapling.fetchers import Fetcher
        kwargs = {}
        if getattr(args, 'impersonate', None):
            kwargs['impersonate'] = args.impersonate
        return Fetcher, kwargs


def fetch_page(args):
    """Fetch a page and return the Scrapling response."""
    fetcher_cls, kwargs = get_fetcher(args)
    timeout = getattr(args, 'timeout', None)
    if timeout:
        kwargs['timeout'] = int(timeout)

    if hasattr(fetcher_cls, 'fetch'):
        page = fetcher_cls.fetch(args.url, **kwargs)
    else:
        page = fetcher_cls.get(args.url, **kwargs)
    return page


def select_elements(page, args):
    """Select elements from page based on CSS/XPath selectors."""
    css = getattr(args, 'css', None)
    xpath = getattr(args, 'xpath', None)

    if css:
        return page.css(css)
    elif xpath:
        return page.xpath(xpath)
    else:
        return None


def format_output(elements, page, fmt='json'):
    """Format selected elements or full page content."""
    if fmt == 'text':
        if elements:
            if hasattr(elements, 'getall'):
                return '\n'.join(elements.getall())
            return '\n'.join(e.text or '' for e in elements)
        return page.get_all_text() if hasattr(page, 'get_all_text') else page.body.text if hasattr(page, 'body') else str(page)

    elif fmt == 'markdown':
        try:
            from markdownify import markdownify as md
            if elements:
                parts = []
                for e in elements:
                    html_str = e.html if hasattr(e, 'html') else str(e)
                    parts.append(md(html_str))
                return '\n\n---\n\n'.join(parts)
            html_content = page.body.html if hasattr(page, 'body') else str(page)
            return md(html_content)
        except ImportError:
            if elements:
                return '\n'.join(e.text or '' for e in elements)
            return str(page)

    elif fmt == 'html':
        if elements:
            return '\n'.join(e.html if hasattr(e, 'html') else str(e) for e in elements)
        return page.body.html if hasattr(page, 'body') else str(page)

    elif fmt == 'csv':
        import csv
        import io
        buf = io.StringIO()
        writer = csv.writer(buf)
        if elements:
            for e in elements:
                text = e.text if hasattr(e, 'text') else str(e)
                href = e.attrib.get('href', '') if hasattr(e, 'attrib') else ''
                writer.writerow([text.strip() if text else '', href])
        return buf.getvalue()

    elif fmt == 'jsonl':
        lines = []
        if elements:
            for e in elements:
                obj = {
                    'text': (e.text or '').strip() if hasattr(e, 'text') else str(e),
                    'html': e.html if hasattr(e, 'html') else str(e),
                }
                if hasattr(e, 'attrib'):
                    obj['attributes'] = dict(e.attrib)
                lines.append(json.dumps(obj, ensure_ascii=False))
        return '\n'.join(lines)

    else:  # json
        if elements:
            data = []
            for e in elements:
                obj = {
                    'text': (e.text or '').strip() if hasattr(e, 'text') else str(e),
                    'html': e.html if hasattr(e, 'html') else str(e),
                }
                if hasattr(e, 'attrib'):
                    obj['attributes'] = dict(e.attrib)
                data.append(obj)
            return json.dumps(data, ensure_ascii=False, indent=2)
        return json.dumps({'url': str(getattr(page, 'url', '')), 'status': getattr(page, 'status', 0)}, indent=2)


def write_output(content, output_file=None):
    """Write to file or stdout."""
    if output_file:
        os.makedirs(os.path.dirname(output_file) or '.', exist_ok=True)
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Output written to: {output_file}", file=sys.stderr)
    else:
        print(content)


def cmd_fetch(args):
    """Fetch and extract data from a URL."""
    page = fetch_page(args)
    elements = select_elements(page, args)
    fmt = getattr(args, 'format', 'json') or 'json'
    output = format_output(elements, page, fmt)
    write_output(output, getattr(args, 'output', None))


def cmd_extract(args):
    """Alias for fetch with default text format."""
    if not args.format:
        args.format = 'text'
    cmd_fetch(args)


def cmd_screenshot(args):
    """Take a screenshot of a URL."""
    from scrapling.fetchers import StealthyFetcher, DynamicFetcher

    output_file = getattr(args, 'output', None) or 'screenshot.png'
    headless = getattr(args, 'headless', True)

    if getattr(args, 'stealth', False):
        page = StealthyFetcher.fetch(args.url, headless=headless)
    else:
        page = DynamicFetcher.fetch(args.url, headless=headless, network_idle=True)

    if hasattr(page, 'screenshot'):
        page.screenshot(path=output_file, full_page=getattr(args, 'fullpage', False))
        print(f"Screenshot saved: {output_file}", file=sys.stderr)
    else:
        print("Error: Screenshot not supported with this fetcher type. Use --dynamic or --stealth.", file=sys.stderr)
        sys.exit(1)


def cmd_links(args):
    """Extract all links from a URL."""
    page = fetch_page(args)
    links = page.css('a')
    pattern = getattr(args, 'filter', None)

    results = []
    for link in links:
        href = link.attrib.get('href', '')
        text = (link.text or '').strip()
        if pattern and not re.search(pattern, href):
            continue
        results.append({'text': text, 'href': href})

    print(json.dumps(results, ensure_ascii=False, indent=2))


def cmd_crawl(args):
    """Simple crawl using Scrapling Spider."""
    import asyncio
    from scrapling.spiders import Spider, Response

    depth = int(getattr(args, 'depth', 1) or 1)
    concurrency = int(getattr(args, 'concurrency', 5) or 5)
    css = getattr(args, 'css', None)
    fmt = getattr(args, 'format', 'json') or 'json'
    output_file = getattr(args, 'output', None)

    items_collected = []

    class CrawlSpider(Spider):
        name = "ultra_scraper"
        start_urls = [args.url]
        concurrent_requests = concurrency
        max_depth = depth

        async def parse(self, response: Response):
            if css:
                for el in response.css(css):
                    item = {
                        'url': str(response.url),
                        'text': (el.text or '').strip() if hasattr(el, 'text') else str(el),
                        'html': el.html if hasattr(el, 'html') else str(el),
                    }
                    yield item
            else:
                yield {
                    'url': str(response.url),
                    'title': response.css('title::text').get() or '',
                    'text_length': len(response.css('body').get() or ''),
                }

            if self.max_depth > 0:
                for link in response.css('a::attr(href)').getall()[:20]:
                    if link.startswith('http'):
                        yield Response.follow(link)

    result = CrawlSpider().start()

    if output_file:
        if fmt == 'jsonl':
            result.items.to_jsonl(output_file)
        else:
            result.items.to_json(output_file)
        print(f"Crawled {len(result.items)} items → {output_file}", file=sys.stderr)
    else:
        print(json.dumps(list(result.items), ensure_ascii=False, indent=2))


def main():
    parser = argparse.ArgumentParser(
        description='OpenClaw Ultra Scraping — Scrapling-powered web scraping',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    subparsers = parser.add_subparsers(dest='command', help='Command to run')

    # Common arguments
    def add_common_args(p):
        p.add_argument('url', help='Target URL')
        p.add_argument('--css', help='CSS selector')
        p.add_argument('--xpath', help='XPath selector')
        p.add_argument('--output', '-o', help='Output file path')
        p.add_argument('--format', '-f', choices=['json', 'jsonl', 'csv', 'text', 'markdown', 'html'], default=None)
        p.add_argument('--stealth', action='store_true', help='Use StealthyFetcher (anti-bot bypass)')
        p.add_argument('--dynamic', action='store_true', help='Use DynamicFetcher (full browser)')
        p.add_argument('--solve-cloudflare', action='store_true', help='Solve Cloudflare challenges')
        p.add_argument('--headless', action='store_true', default=True, help='Run browser headless')
        p.add_argument('--impersonate', help='Browser to impersonate (e.g., chrome, firefox135)')
        p.add_argument('--timeout', type=int, help='Request timeout in seconds')

    # fetch
    p_fetch = subparsers.add_parser('fetch', help='Fetch and extract data')
    add_common_args(p_fetch)

    # extract
    p_extract = subparsers.add_parser('extract', help='Extract text content (default: text format)')
    add_common_args(p_extract)

    # screenshot
    p_ss = subparsers.add_parser('screenshot', help='Take a screenshot')
    p_ss.add_argument('url', help='Target URL')
    p_ss.add_argument('--output', '-o', default='screenshot.png', help='Output file')
    p_ss.add_argument('--stealth', action='store_true')
    p_ss.add_argument('--dynamic', action='store_true', default=True)
    p_ss.add_argument('--fullpage', action='store_true', help='Full page screenshot')
    p_ss.add_argument('--headless', action='store_true', default=True)

    # links
    p_links = subparsers.add_parser('links', help='Extract all links')
    p_links.add_argument('url', help='Target URL')
    p_links.add_argument('--stealth', action='store_true')
    p_links.add_argument('--dynamic', action='store_true')
    p_links.add_argument('--headless', action='store_true', default=True)
    p_links.add_argument('--filter', help='Regex filter for link URLs')
    p_links.add_argument('--impersonate', help='Browser to impersonate')
    p_links.add_argument('--timeout', type=int)

    # crawl
    p_crawl = subparsers.add_parser('crawl', help='Crawl with Spider')
    p_crawl.add_argument('url', help='Start URL')
    p_crawl.add_argument('--depth', type=int, default=1, help='Max crawl depth')
    p_crawl.add_argument('--concurrency', '-c', type=int, default=5, help='Concurrent requests')
    p_crawl.add_argument('--output', '-o', help='Output file')
    p_crawl.add_argument('--css', help='CSS selector for items')
    p_crawl.add_argument('--format', '-f', choices=['json', 'jsonl'], default='json')

    args = parser.parse_args()
    if not args.command:
        parser.print_help()
        sys.exit(1)

    commands = {
        'fetch': cmd_fetch,
        'extract': cmd_extract,
        'screenshot': cmd_screenshot,
        'links': cmd_links,
        'crawl': cmd_crawl,
    }
    commands[args.command](args)


if __name__ == '__main__':
    main()
