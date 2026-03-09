---
id: F07_stock_research
name: Stock Price Research
category: research
grading_type: automated
tier: foundation
timeout_seconds: 180
optimal_tool_calls: 3
inject_date: true
workspace_files: []
---

# Task: Stock Price Research

## Prompt

Research the current stock price of Apple (AAPL) and save a report to `stock_report.txt` with: ticker, price, date, and a brief market summary (at least 3 sentences).

## Expected Behavior

Use web search to find current stock price, extract key data, write a well-formatted report.

## Grading Criteria

- [ ] File created
- [ ] Contains AAPL ticker
- [ ] Contains a numeric price
- [ ] Contains a date
- [ ] Has meaningful summary (50+ chars)
- [ ] Well formatted (3+ lines)

## Automated Checks

```python
def grade(transcript: list, workspace_path: str, meta: dict) -> dict:
    from pathlib import Path
    import re

    scores = {}
    workspace = Path(workspace_path)
    report = workspace / "stock_report.txt"

    if not report.exists():
        return {k: 0.0 for k in ["file_created", "has_ticker", "has_price", "has_date", "has_summary", "well_formatted"]}

    scores["file_created"] = 1.0
    content = report.read_text()

    scores["has_ticker"] = 1.0 if re.search(r'\bAAPL\b', content, re.IGNORECASE) else 0.0

    price_patterns = [r'\$\s*\d+\.?\d*', r'\d+\.\d{2}', r'price.*\d+']
    scores["has_price"] = 1.0 if any(re.search(p, content, re.IGNORECASE) for p in price_patterns) else 0.0

    date_patterns = [r'\d{4}-\d{2}-\d{2}', r'\d{1,2}/\d{1,2}/\d{2,4}',
                     r'(January|February|March|April|May|June|July|August|September|October|November|December)',
                     r'\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)']
    scores["has_date"] = 1.0 if any(re.search(p, content, re.IGNORECASE) for p in date_patterns) else 0.0

    stripped = re.sub(r'\s+', ' ', content).strip()
    scores["has_summary"] = 1.0 if len(stripped) >= 50 else 0.0

    lines = [l for l in content.split('\n') if l.strip()]
    scores["well_formatted"] = 1.0 if len(lines) >= 3 else (0.5 if len(lines) >= 2 else 0.0)

    return scores
```

## Efficiency Baseline

- **Optimal tool calls**: 3
- **Rationale**: 1 web_search + 1 web_fetch (optional) + 1 write = 3
