#!/usr/bin/env python3
"""
MyClaw 竞争情报日报收集器
每日抓取多个信息源，生成结构化简报
"""

import json
import os
import sys
import time
import re
import subprocess
from datetime import datetime, timedelta, timezone
from pathlib import Path

import feedparser
import requests
from bs4 import BeautifulSoup

REPORT_DIR = Path(os.path.expanduser("~/.openclaw/workspace/intel"))
REPORT_DIR.mkdir(parents=True, exist_ok=True)

# 监控关键词
KEYWORDS_PRIMARY = [
    "openclaw", "myclaw", "open claw", "my claw",
]
KEYWORDS_COMPETITORS = [
    "manus ai", "lovable", "bolt.new", "replit agent", "cursor agent",
    "devin ai", "cognition ai", "codex cli", "claude code",
    "windsurf", "codeium", "aider",
]
KEYWORDS_TRENDS = [
    "ai agent platform", "ai personal assistant", "ai agent framework",
    "mcp server", "model context protocol",
    "ai agent startup", "ai agent funding",
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; IntelBot/1.0)"
}

def safe_request(url, timeout=15):
    """Safe HTTP GET with error handling"""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=timeout)
        resp.raise_for_status()
        return resp
    except Exception as e:
        print(f"  ⚠ Failed to fetch {url}: {e}", file=sys.stderr)
        return None


# ─── Hacker News ───

def fetch_hackernews():
    """Fetch recent HN stories matching our keywords"""
    print("📡 Fetching Hacker News...")
    results = []
    
    # Search HN via Algolia API
    all_keywords = KEYWORDS_PRIMARY + KEYWORDS_COMPETITORS + KEYWORDS_TRENDS
    seen_ids = set()
    
    for kw in all_keywords:
        url = f"https://hn.algolia.com/api/v1/search_by_date?query={kw}&tags=story&hitsPerPage=5"
        resp = safe_request(url)
        if not resp:
            continue
        data = resp.json()
        for hit in data.get("hits", []):
            if hit["objectID"] in seen_ids:
                continue
            seen_ids.add(hit["objectID"])
            
            created = hit.get("created_at", "")
            # Only last 48 hours
            try:
                dt = datetime.fromisoformat(created.replace("Z", "+00:00"))
                if dt < datetime.now(timezone.utc) - timedelta(hours=48):
                    continue
            except:
                pass
            
            results.append({
                "source": "HackerNews",
                "title": hit.get("title", ""),
                "url": hit.get("url") or f"https://news.ycombinator.com/item?id={hit['objectID']}",
                "points": hit.get("points", 0),
                "comments": hit.get("num_comments", 0),
                "time": created,
                "keyword": kw,
            })
    
    # Sort by points
    results.sort(key=lambda x: x.get("points", 0), reverse=True)
    print(f"  ✓ {len(results)} stories found")
    return results


# ─── GitHub ───

def fetch_github():
    """Search GitHub for relevant repos and activity"""
    print("📡 Fetching GitHub...")
    results = []
    
    # Search repos created/updated recently
    queries = [
        "openclaw",
        "ai+agent+platform",
        "ai+personal+assistant+framework",
        "mcp+server",
    ]
    
    seen_repos = set()
    for q in queries:
        url = f"https://api.github.com/search/repositories?q={q}+pushed:>{(datetime.now(timezone.utc) - timedelta(days=7)).strftime('%Y-%m-%d')}&sort=updated&per_page=10"
        gh_headers = {**HEADERS, "Accept": "application/vnd.github.v3+json"}
        
        # Use token if available
        token = os.environ.get("GITHUB_TOKEN", "")
        if token:
            gh_headers["Authorization"] = f"token {token}"
        
        resp = safe_request(url)
        if not resp:
            continue
        
        data = resp.json()
        for repo in data.get("items", []):
            full_name = repo["full_name"]
            if full_name in seen_repos:
                continue
            seen_repos.add(full_name)
            
            results.append({
                "source": "GitHub",
                "name": full_name,
                "description": repo.get("description", ""),
                "url": repo["html_url"],
                "stars": repo["stargazers_count"],
                "forks": repo["forks_count"],
                "language": repo.get("language", ""),
                "updated": repo["updated_at"],
                "keyword": q,
            })
        
        time.sleep(1)  # Rate limit
    
    results.sort(key=lambda x: x.get("stars", 0), reverse=True)
    print(f"  ✓ {len(results)} repos found")
    return results


# ─── TechCrunch RSS ───

def fetch_techcrunch():
    """Fetch TechCrunch AI-related articles"""
    print("📡 Fetching TechCrunch...")
    results = []
    
    feed = feedparser.parse("https://techcrunch.com/category/artificial-intelligence/feed/")
    cutoff = datetime.now(timezone.utc) - timedelta(hours=48)
    
    for entry in feed.entries[:20]:
        title = entry.get("title", "").lower()
        summary = entry.get("summary", "").lower()
        combined = title + " " + summary
        
        # Check if relevant to our keywords
        relevant_kw = None
        all_kw = KEYWORDS_PRIMARY + KEYWORDS_COMPETITORS + ["ai agent", "personal assistant", "ai startup", "agent platform"]
        for kw in all_kw:
            if kw.lower() in combined:
                relevant_kw = kw
                break
        
        if not relevant_kw:
            continue
        
        results.append({
            "source": "TechCrunch",
            "title": entry.get("title", ""),
            "url": entry.get("link", ""),
            "published": entry.get("published", ""),
            "keyword": relevant_kw,
            "summary": entry.get("summary", "")[:200],
        })
    
    print(f"  ✓ {len(results)} articles found")
    return results


# ─── The Verge / Ars Technica RSS ───

def fetch_tech_news_rss():
    """Fetch tech news from RSS feeds"""
    print("📡 Fetching tech news RSS...")
    results = []
    
    feeds = [
        ("TheVerge", "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml"),
        ("ArsTechnica", "https://feeds.arstechnica.com/arstechnica/technology-lab"),
    ]
    
    for source_name, feed_url in feeds:
        feed = feedparser.parse(feed_url)
        for entry in feed.entries[:15]:
            title = entry.get("title", "").lower()
            summary = entry.get("summary", "").lower()
            combined = title + " " + summary
            
            relevant_kw = None
            check_kw = KEYWORDS_PRIMARY + KEYWORDS_COMPETITORS + ["ai agent", "personal assistant", "agent platform", "coding agent"]
            for kw in check_kw:
                if kw.lower() in combined:
                    relevant_kw = kw
                    break
            
            if not relevant_kw:
                continue
            
            results.append({
                "source": source_name,
                "title": entry.get("title", ""),
                "url": entry.get("link", ""),
                "published": entry.get("published", ""),
                "keyword": relevant_kw,
            })
    
    print(f"  ✓ {len(results)} articles found")
    return results


# ─── Product Hunt ───

def fetch_producthunt():
    """Check Product Hunt for AI agent products"""
    print("📡 Fetching Product Hunt...")
    results = []
    
    # PH doesn't have a great public API without auth, use RSS
    feed = feedparser.parse("https://www.producthunt.com/feed")
    
    for entry in feed.entries[:30]:
        title = entry.get("title", "").lower()
        summary = entry.get("summary", "").lower()
        combined = title + " " + summary
        
        relevant_kw = None
        check_kw = KEYWORDS_PRIMARY + ["ai agent", "ai assistant", "ai personal", "coding agent", "ai automation"]
        for kw in check_kw:
            if kw.lower() in combined:
                relevant_kw = kw
                break
        
        if not relevant_kw:
            continue
        
        results.append({
            "source": "ProductHunt",
            "title": entry.get("title", ""),
            "url": entry.get("link", ""),
            "published": entry.get("published", ""),
            "keyword": relevant_kw,
        })
    
    print(f"  ✓ {len(results)} products found")
    return results


# ─── Reddit ───

def fetch_reddit():
    """Fetch relevant Reddit posts"""
    print("📡 Fetching Reddit...")
    results = []
    
    subreddits = ["artificial", "selfhosted", "LocalLLaMA", "ChatGPT", "MachineLearning"]
    
    for sub in subreddits:
        url = f"https://www.reddit.com/r/{sub}/new.json?limit=25"
        reddit_headers = {**HEADERS, "User-Agent": "IntelBot/1.0 (by /u/intelbot)"}
        
        try:
            resp = requests.get(url, headers=reddit_headers, timeout=15)
            if resp.status_code != 200:
                continue
            data = resp.json()
        except:
            continue
        
        for post in data.get("data", {}).get("children", []):
            pd = post["data"]
            title = pd.get("title", "").lower()
            selftext = pd.get("selftext", "").lower()
            combined = title + " " + selftext
            
            relevant_kw = None
            check_kw = KEYWORDS_PRIMARY + KEYWORDS_COMPETITORS + ["ai agent platform", "personal ai assistant"]
            for kw in check_kw:
                if kw.lower() in combined:
                    relevant_kw = kw
                    break
            
            if not relevant_kw:
                continue
            
            created = datetime.fromtimestamp(pd.get("created_utc", 0), tz=timezone.utc)
            if created < datetime.now(timezone.utc) - timedelta(hours=48):
                continue
            
            results.append({
                "source": f"Reddit/r/{sub}",
                "title": pd.get("title", ""),
                "url": f"https://reddit.com{pd.get('permalink', '')}",
                "score": pd.get("score", 0),
                "comments": pd.get("num_comments", 0),
                "time": created.isoformat(),
                "keyword": relevant_kw,
            })
        
        time.sleep(1)
    
    results.sort(key=lambda x: x.get("score", 0), reverse=True)
    print(f"  ✓ {len(results)} posts found")
    return results


# ─── YouTube ───

def fetch_youtube():
    """Search YouTube for relevant videos using yt-dlp"""
    print("📡 Fetching YouTube...")
    results = []
    
    search_queries = [
        "openclaw",
        "myclaw",
        "ai agent platform 2026",
        "ai personal assistant setup",
        "manus ai agent",
        "devin ai",
        "claude code",
    ]
    
    seen_ids = set()
    cutoff = datetime.now(timezone.utc) - timedelta(hours=72)  # 3 days for YT (slower cycle)
    
    for query in search_queries:
        try:
            cmd = [
                "yt-dlp",
                f"ytsearch10:{query}",
                "--flat-playlist",
                "--dump-json",
                "--no-warnings",
                "--socket-timeout", "15",
            ]
            proc = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            
            if proc.returncode != 0:
                print(f"  ⚠ yt-dlp failed for '{query}': {proc.stderr[:100]}", file=sys.stderr)
                continue
            
            for line in proc.stdout.strip().split("\n"):
                if not line.strip():
                    continue
                try:
                    video = json.loads(line)
                except json.JSONDecodeError:
                    continue
                
                vid = video.get("id", "")
                if not vid or vid in seen_ids:
                    continue
                seen_ids.add(vid)
                
                title = video.get("title", "")
                # Filter: upload_date check (YYYYMMDD format)
                upload_date = video.get("upload_date", "")
                if upload_date:
                    try:
                        vdt = datetime.strptime(upload_date, "%Y%m%d").replace(tzinfo=timezone.utc)
                        if vdt < cutoff:
                            continue
                    except:
                        pass
                
                # Relevance check
                title_lower = title.lower()
                desc_lower = (video.get("description") or "")[:500].lower()
                combined = title_lower + " " + desc_lower
                
                relevant_kw = None
                all_kw = KEYWORDS_PRIMARY + KEYWORDS_COMPETITORS + [
                    "ai agent", "ai personal assistant", "ai automation platform",
                    "mcp server", "model context protocol"
                ]
                for kw in all_kw:
                    if kw.lower() in combined:
                        relevant_kw = kw
                        break
                
                if not relevant_kw:
                    continue
                
                results.append({
                    "source": "YouTube",
                    "title": title,
                    "url": f"https://www.youtube.com/watch?v={vid}",
                    "channel": video.get("channel", video.get("uploader", "")),
                    "views": video.get("view_count", 0),
                    "upload_date": upload_date,
                    "keyword": relevant_kw,
                    "duration": video.get("duration", 0),
                })
        except subprocess.TimeoutExpired:
            print(f"  ⚠ yt-dlp timeout for '{query}'", file=sys.stderr)
        except Exception as e:
            print(f"  ⚠ YouTube error for '{query}': {e}", file=sys.stderr)
        
        time.sleep(1)  # Rate limit
    
    results.sort(key=lambda x: x.get("views", 0), reverse=True)
    print(f"  ✓ {len(results)} videos found")
    return results


# ─── Report Generation ───

def classify_threat(item):
    """Classify threat level based on content"""
    title = (item.get("title", "") + " " + item.get("description", "")).lower()
    
    # Direct mention of us
    for kw in KEYWORDS_PRIMARY:
        if kw in title:
            return "🔴 直接相关"
    
    # Competitor activity
    for kw in KEYWORDS_COMPETITORS:
        if kw in title:
            return "🟡 竞品动态"
    
    return "🔵 行业趋势"


def generate_report(hn, github, tc, tech_rss, ph, reddit, youtube=None):
    """Generate markdown report"""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    report = f"""# 🔍 MyClaw 竞争情报日报
**日期：{today}**
**生成时间：{datetime.now(timezone.utc).strftime("%H:%M UTC")}**

---

"""
    
    # === Direct mentions ===
    direct = []
    all_sources = [hn, github, tc, tech_rss, ph, reddit, youtube or []]
    for items in all_sources:
        for item in items:
            kw = item.get("keyword", "").lower()
            if any(k in kw for k in ["openclaw", "myclaw", "open claw", "my claw"]):
                direct.append(item)
    
    report += f"## 🔴 直接相关（OpenClaw/MyClaw 提及）\n\n"
    if direct:
        for item in direct:
            report += f"- **[{item.get('source')}]** [{item.get('title', item.get('name', 'N/A'))}]({item.get('url', '')})\n"
            if item.get("points"):
                report += f"  ↑{item['points']} points, {item.get('comments', 0)} comments\n"
            if item.get("stars"):
                report += f"  ⭐{item['stars']} stars\n"
    else:
        report += "_今日无直接提及_\n"
    
    report += "\n---\n\n"
    
    # === Competitor activity ===
    competitors = []
    for items in all_sources:
        for item in items:
            kw = item.get("keyword", "").lower()
            if any(k in kw for k in [c.lower() for c in KEYWORDS_COMPETITORS]):
                competitors.append(item)
    
    report += f"## 🟡 竞品动态\n\n"
    if competitors:
        for item in competitors[:15]:  # Cap at 15
            report += f"- **[{item.get('source')}]** [{item.get('title', item.get('name', 'N/A'))}]({item.get('url', '')})\n"
            if item.get("points"):
                report += f"  ↑{item['points']} pts | "
            if item.get("stars"):
                report += f"  ⭐{item['stars']} | "
            report += f"  关键词: `{item.get('keyword', '')}`\n"
    else:
        report += "_今日无竞品动态_\n"
    
    report += "\n---\n\n"
    
    # === Industry trends ===
    trends = []
    for items in [hn, tc, tech_rss, ph, reddit, youtube or []]:
        for item in items:
            if item not in direct and item not in competitors:
                trends.append(item)
    
    report += f"## 🔵 行业趋势\n\n"
    if trends:
        for item in trends[:15]:
            report += f"- **[{item.get('source')}]** [{item.get('title', item.get('name', 'N/A'))}]({item.get('url', '')})\n"
    else:
        report += "_今日无相关行业趋势_\n"
    
    report += "\n---\n\n"
    
    # === GitHub hot repos ===
    report += f"## ⭐ GitHub 热门相关 Repo（7日内活跃）\n\n"
    top_repos = sorted(github, key=lambda x: x.get("stars", 0), reverse=True)[:10]
    if top_repos:
        for repo in top_repos:
            report += f"- **[{repo['name']}]({repo['url']})** — ⭐{repo['stars']} | {repo.get('language', 'N/A')}\n"
            if repo.get("description"):
                report += f"  {repo['description'][:100]}\n"
    else:
        report += "_无数据_\n"
    
    report += "\n---\n\n"
    
    # === YouTube ===
    yt = youtube or []
    report += f"## 🎬 YouTube 相关视频（72h 内）\n\n"
    if yt:
        for v in yt[:20]:
            views = v.get("views", 0)
            views_str = f"{views:,}" if views else "N/A"
            ch = v.get("channel", "Unknown")
            dur = int(v.get("duration", 0) or 0)
            dur_str = f"{dur // 60}:{dur % 60:02d}" if dur else ""
            report += f"- **[{ch}]** [{v.get('title', 'N/A')}]({v.get('url', '')})\n"
            report += f"  👁 {views_str} views"
            if dur_str:
                report += f" | ⏱ {dur_str}"
            report += f" | 关键词: `{v.get('keyword', '')}`\n"
    else:
        report += "_今日无相关视频_\n"
    
    report += "\n---\n\n"
    
    # === Stats ===
    yt_count = len(yt)
    total = len(hn)+len(github)+len(tc)+len(tech_rss)+len(ph)+len(reddit)+yt_count
    report += f"""## 📊 采集统计

| 信息源 | 命中数 |
|--------|--------|
| Hacker News | {len(hn)} |
| GitHub | {len(github)} |
| TechCrunch | {len(tc)} |
| Tech RSS | {len(tech_rss)} |
| Product Hunt | {len(ph)} |
| Reddit | {len(reddit)} |
| YouTube | {yt_count} |
| **合计** | **{total}** |

---
_由 The Doctor 🌀 自动生成 | MyClaw 竞争情报系统 v1_
"""
    
    return report


def main():
    print("=" * 50)
    print("🔍 MyClaw 竞争情报收集 启动")
    print("=" * 50)
    
    hn = fetch_hackernews()
    github = fetch_github()
    tc = fetch_techcrunch()
    tech_rss = fetch_tech_news_rss()
    ph = fetch_producthunt()
    reddit = fetch_reddit()
    youtube = fetch_youtube()
    
    report = generate_report(hn, github, tc, tech_rss, ph, reddit, youtube)
    
    # Save report
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    report_path = REPORT_DIR / f"report-{today}.md"
    report_path.write_text(report, encoding="utf-8")
    print(f"\n✅ Report saved to {report_path}")
    
    # Also save raw data
    raw_data = {
        "date": today,
        "hackernews": hn,
        "github": github,
        "techcrunch": tc,
        "tech_rss": tech_rss,
        "producthunt": ph,
        "reddit": reddit,
        "youtube": youtube,
    }
    raw_path = REPORT_DIR / f"raw-{today}.json"
    raw_path.write_text(json.dumps(raw_data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"✅ Raw data saved to {raw_path}")
    
    # Print report to stdout for cron job to capture
    print("\n" + report)


if __name__ == "__main__":
    main()
