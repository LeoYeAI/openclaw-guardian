---
id: C01_browser_data_extraction
name: Browser Data Extraction
category: computer_use
grading_type: automated
tier: frontier
timeout_seconds: 300
optimal_tool_calls: 6
inject_date: true
workspace_files: []
requires: browser
---

# Task: Browser Data Extraction

## Prompt

Use the browser to go to `https://news.ycombinator.com` and extract the top 10 stories. Save them to `hn_top10.md` with: rank, title, URL, and point count for each story.

## Expected Behavior

The agent should:

1. Open the browser and navigate to Hacker News
2. Read the page content (via snapshot or screenshot)
3. Extract structured data from the rendered page
4. Handle the DOM structure — titles are in `.titleline`, scores in `.score`
5. Save a clean, formatted markdown file
6. Not hallucinate stories — the data must match what's actually on the page

This tests:
- Browser tool invocation (navigate, snapshot)
- Visual/DOM comprehension from rendered web pages
- Structured data extraction from unstructured visual content
- Accuracy — no hallucinated content

A weak model will:
- Refuse to use the browser and try web_fetch instead (partial credit)
- Hallucinate story titles from training data
- Extract fewer than 10 stories
- Get URLs wrong

## Grading Criteria

- [ ] Browser was used (navigate + snapshot/screenshot)
- [ ] hn_top10.md created
- [ ] Contains 10 entries
- [ ] Each entry has rank, title, URL
- [ ] Point counts are included
- [ ] Data appears to be from live page (not hallucinated)

## Automated Checks

```python
def grade(transcript: list, workspace_path: str, meta: dict) -> dict:
    from pathlib import Path
    import re

    scores = {}
    workspace = Path(workspace_path)

    # Check if browser was used
    browser_used = False
    for event in transcript:
        if event.get("type") != "message":
            continue
        msg = event.get("message", {})
        if msg.get("role") == "assistant":
            for item in msg.get("content", []):
                if item.get("type") == "toolCall":
                    name = item.get("name", "")
                    if name in ["browser", "browser_navigate", "browser_snapshot", "browser_screenshot", "computer"]:
                        browser_used = True

    scores["browser_used"] = 1.0 if browser_used else 0.0

    # Check output file
    output = workspace / "hn_top10.md"
    if not output.exists():
        return {**scores, **{k: 0.0 for k in ["file_created", "has_10_entries", "has_titles", "has_urls", "has_points"]}}

    scores["file_created"] = 1.0
    content = output.read_text()

    # Count entries (look for numbered items or consistent patterns)
    # Various formats: "1.", "1)", "#1", "**1**", etc.
    entry_patterns = [
        r'^\s*\d+[\.\)]\s',     # "1. " or "1) "
        r'^\s*#+\s*\d+',        # "## 1" or "# 1"
        r'^\s*\*\*\d+',         # "**1**"
        r'^\|\s*\d+\s*\|',      # "| 1 |" (table)
    ]
    lines = content.split('\n')
    entry_count = 0
    for line in lines:
        if any(re.match(p, line) for p in entry_patterns):
            entry_count += 1

    # Fallback: count lines with URLs
    if entry_count < 5:
        entry_count = len(re.findall(r'https?://\S+', content))

    scores["has_10_entries"] = 1.0 if entry_count >= 10 else (entry_count / 10.0)

    # Check for URLs
    urls = re.findall(r'https?://\S+', content)
    scores["has_urls"] = 1.0 if len(urls) >= 8 else (len(urls) / 10.0)

    # Check for titles (at least 10 lines with 4+ words that aren't URLs)
    title_lines = [l for l in lines if len(l.split()) >= 4 and 'http' not in l and l.strip()]
    scores["has_titles"] = 1.0 if len(title_lines) >= 8 else (len(title_lines) / 10.0)

    # Check for point counts
    point_patterns = re.findall(r'\d+\s*(?:point|pts|↑|upvote|score)', content, re.IGNORECASE)
    if not point_patterns:
        point_patterns = re.findall(r'(?:point|pts|score)[s]?\s*[:=]\s*\d+', content, re.IGNORECASE)
    if not point_patterns:
        # Look for standalone numbers that could be points (3+ digits)
        point_patterns = re.findall(r'\b\d{2,4}\b', content)
    scores["has_points"] = 1.0 if len(point_patterns) >= 5 else (len(point_patterns) / 10.0)

    return scores
```

## Efficiency Baseline

- **Optimal tool calls**: 6
- **Rationale**: 1 browser open/navigate + 1-2 snapshots + 1 possible scroll + 1 write + verification ≈ 6
