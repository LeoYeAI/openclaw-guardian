---
id: C04_multi_step_browser_workflow
name: Multi-Step Browser Workflow
category: computer_use
grading_type: hybrid
tier: frontier
timeout_seconds: 420
optimal_tool_calls: 12
inject_date: true
workspace_files: []
requires: browser
---

# Task: Multi-Step Browser Workflow

## Prompt

I need competitive intelligence. Use the browser to:

1. Go to `https://github.com/trending` and find the top 3 trending repositories today
2. For each repo, get: name, description, language, and star count
3. Then go to `https://news.ycombinator.com` and check if any of those 3 repos are being discussed on the front page
4. Write a competitive intel report to `trending_report.md` with:
   - The 3 trending repos with details
   - Whether any appear on HN (and if so, what the discussion says)
   - Your assessment of which repo is most significant and why

## Expected Behavior

This tests multi-step browser navigation with cross-referencing:

1. Navigate to GitHub Trending → extract structured data from the page
2. Navigate to Hacker News → search for the repo names
3. Cross-reference information from two different sites
4. Write an analytical report combining both sources

Key challenges:
- Two separate sites that must be navigated
- Data from Site A must be used to search/verify on Site B
- The assessment requires judgment, not just data extraction
- GitHub Trending and HN pages have different DOM structures

## Grading Criteria

- [ ] Browser navigated to GitHub Trending
- [ ] 3 repos extracted with name, description, language, stars
- [ ] Browser navigated to Hacker News
- [ ] Cross-reference attempted (searched for repos on HN)
- [ ] trending_report.md created
- [ ] Report includes assessment/analysis

## Automated Checks

```python
def grade(transcript: list, workspace_path: str, meta: dict) -> dict:
    from pathlib import Path
    import re

    scores = {}
    workspace = Path(workspace_path)

    # Check browser usage — should have navigated to both sites
    browser_calls = []
    navigated_github = False
    navigated_hn = False

    for event in transcript:
        if event.get("type") != "message":
            continue
        msg = event.get("message", {})
        if msg.get("role") == "assistant":
            for item in msg.get("content", []):
                if item.get("type") == "toolCall" and item.get("name", "") in ["browser", "computer"]:
                    params = item.get("params", {})
                    url = str(params.get("url", ""))
                    if "github" in url.lower():
                        navigated_github = True
                    if "ycombinator" in url.lower() or "news.yc" in url.lower():
                        navigated_hn = True
                    browser_calls.append(params)

    scores["navigated_github"] = 1.0 if navigated_github else 0.0
    scores["navigated_hn"] = 1.0 if navigated_hn else 0.0

    # Check report
    report = workspace / "trending_report.md"
    if not report.exists():
        return {**scores, **{k: 0.0 for k in ["report_created", "has_3_repos", "has_repo_details", "has_cross_ref", "has_assessment"]}}

    scores["report_created"] = 1.0
    content = report.read_text()
    content_lower = content.lower()

    # Check for 3 repos (look for GitHub-style repo names: owner/name)
    repo_patterns = re.findall(r'[\w-]+/[\w-]+', content)
    scores["has_3_repos"] = 1.0 if len(repo_patterns) >= 3 else (len(repo_patterns) / 3.0)

    # Check for repo details (stars, language, description indicators)
    detail_indicators = ["star", "⭐", "language", "python", "typescript", "rust", "javascript", "go", "java", "description"]
    detail_count = sum(1 for d in detail_indicators if d in content_lower)
    scores["has_repo_details"] = min(1.0, detail_count / 3.0)

    # Check for cross-reference with HN
    hn_refs = ["hacker news", "hn", "ycombinator", "front page", "discussion", "comment"]
    scores["has_cross_ref"] = 1.0 if sum(1 for h in hn_refs if h in content_lower) >= 2 else 0.0

    # Check for assessment
    assessment_words = ["significant", "notable", "important", "assessment", "analysis", "because", "impact", "potential", "trend", "recommend"]
    scores["has_assessment"] = 1.0 if sum(1 for a in assessment_words if a in content_lower) >= 2 else 0.0

    return scores
```

## LLM Judge Rubric

### Criterion 1: Data Accuracy (Weight: 40%)

**Score 1.0**: All 3 repos are real, currently trending repos with accurate details. Cross-reference with HN is genuine (correctly identifies presence or absence). No hallucinated data.
**Score 0.75**: 3 repos with mostly accurate details. Minor errors in star counts or descriptions.
**Score 0.5**: Some real data but mixed with hallucinated or outdated information.
**Score 0.25**: Mostly hallucinated data.
**Score 0.0**: Entirely fabricated.

### Criterion 2: Assessment Quality (Weight: 30%)

**Score 1.0**: Assessment shows genuine understanding of why a repo matters — considers technology trends, community adoption signals, problem domain significance. Not just "this has the most stars."
**Score 0.5**: Basic assessment without depth.
**Score 0.0**: No assessment or trivially obvious.

### Criterion 3: Workflow Execution (Weight: 30%)

**Score 1.0**: Smoothly navigated both sites, extracted data efficiently, produced well-formatted report. Shows competent browser use.
**Score 0.5**: Completed the task but with significant inefficiency or difficulties.
**Score 0.0**: Failed to navigate sites or produce report.

## Efficiency Baseline

- **Optimal tool calls**: 12
- **Rationale**: GitHub (navigate + 2 snapshots) + HN (navigate + 2 snapshots) + write + verification ≈ 12
