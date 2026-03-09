---
id: R02_multi_source_synthesis
name: Multi-Source Data Synthesis
category: reasoning
grading_type: hybrid
tier: reasoning
timeout_seconds: 300
optimal_tool_calls: 5
inject_date: true
workspace_files:
  - path: "reports/sales_q4.csv"
    content: |
      month,region,revenue,units
      October,North,125000,450
      October,South,98000,320
      October,West,143000,510
      November,North,132000,480
      November,South,87000,290
      November,West,156000,560
      December,North,198000,720
      December,South,145000,520
      December,West,210000,780
  - path: "reports/customer_feedback.md"
    content: |
      # Q4 Customer Feedback Summary

      ## Positive Trends
      - Product quality consistently praised (87% satisfaction)
      - New mobile app received 4.2/5 stars
      - Customer support response time improved to <2 hours

      ## Concerns
      - Shipping delays in South region (avg 5.2 days vs 2.1 days elsewhere)
      - Price sensitivity increasing — 34% mentioned considering alternatives
      - Feature request: bulk ordering for enterprise customers

      ## Notable Quotes
      - "Best product in the category, but delivery is killing us" — Enterprise client, South
      - "The mobile app changed how we order. Revolutionary." — SMB client, West
      - "Price went up 15% but quality stayed the same. Reconsidering." — Mid-market, North
  - path: "reports/competitor_intel.txt"
    content: |
      Competitor Analysis - Q4 Update

      CompetitorA: Launched aggressive pricing campaign in November.
      Cut prices by 20% across all regions. Gained estimated 5% market share
      in North region. Product quality rated lower (3.1/5 vs our 4.2/5).

      CompetitorB: Announced new enterprise bulk ordering feature.
      Expected launch in Q1. Has been hiring heavily in logistics —
      likely improving delivery capabilities. Currently weak in West region.

      CompetitorC: No significant changes. Maintaining steady market
      position. Strong in South region with 3-day delivery guarantee.
---

# Task: Multi-Source Data Synthesis

## Prompt

I have three reports in the `reports/` directory: sales data (CSV), customer feedback, and competitor intelligence. Read all three and write an executive summary to `executive_summary.md` that:

1. Identifies our strongest and weakest region with data
2. Highlights the biggest risk to our business based on cross-referencing the three sources
3. Recommends ONE specific action to take next quarter

The summary should be under 300 words and data-driven — cite specific numbers.

## Expected Behavior

The agent should:

1. Read all three files from `reports/`
2. Cross-reference data:
   - West is strongest (highest revenue, positive app feedback)
   - South is weakest (lowest revenue, shipping complaints, competitor threat)
   - The biggest risk is the INTERSECTION of: price sensitivity (feedback) + competitor price cuts (intel) + South's delivery issues creating churn
3. Recommend a specific, defensible action (e.g., fix South logistics, counter pricing, or double down on West)
4. Write a tight executive summary with actual numbers
5. Save to `executive_summary.md`

Key insight test: Can the agent connect dots ACROSS sources? A weak model summarizes each file separately. A strong model identifies the South region crisis by combining: shipping delays (feedback) + CompetitorC's 3-day guarantee (intel) + South's revenue drop Nov→Dec ratio is weakest.

## Grading Criteria

- [ ] All three files read
- [ ] Strongest region identified with data (West: $509K total, 1850 units)
- [ ] Weakest region identified with data (South: $330K total, 1130 units)
- [ ] Risk identified by cross-referencing multiple sources (not just one file)
- [ ] Recommendation is specific and actionable (not generic)
- [ ] Summary cites actual numbers from the data
- [ ] Under 300 words
- [ ] Saved to executive_summary.md

## Automated Checks

```python
def grade(transcript: list, workspace_path: str, meta: dict) -> dict:
    from pathlib import Path
    import re

    scores = {}
    workspace = Path(workspace_path)
    summary_file = workspace / "executive_summary.md"

    if not summary_file.exists():
        return {k: 0.0 for k in [
            "file_created", "identifies_strongest", "identifies_weakest",
            "cites_numbers", "under_300_words"
        ]}

    scores["file_created"] = 1.0
    content = summary_file.read_text()
    content_lower = content.lower()

    # Check strongest region (West)
    if "west" in content_lower and any(x in content for x in ["509", "510", "156", "210", "780"]):
        scores["identifies_strongest"] = 1.0
    elif "west" in content_lower:
        scores["identifies_strongest"] = 0.5
    else:
        scores["identifies_strongest"] = 0.0

    # Check weakest region (South)
    if "south" in content_lower and any(x in content for x in ["330", "320", "290", "520", "87"]):
        scores["identifies_weakest"] = 1.0
    elif "south" in content_lower:
        scores["identifies_weakest"] = 0.5
    else:
        scores["identifies_weakest"] = 0.0

    # Check for cross-referenced numbers (from multiple sources)
    has_sales_number = bool(re.search(r'\d{3,6}', content))
    has_feedback_ref = any(x in content_lower for x in ["87%", "4.2", "5.2 day", "34%", "15%"])
    has_competitor_ref = any(x in content_lower for x in ["20%", "3.1", "competitora", "competitorb", "competitorc", "3-day"])
    cross_ref_count = sum([has_sales_number, has_feedback_ref, has_competitor_ref])
    scores["cites_numbers"] = cross_ref_count / 3.0

    # Word count
    word_count = len(content.split())
    if word_count <= 300:
        scores["under_300_words"] = 1.0
    elif word_count <= 400:
        scores["under_300_words"] = 0.5
    else:
        scores["under_300_words"] = 0.0

    return scores
```

## LLM Judge Rubric

### Criterion 1: Cross-Source Reasoning (Weight: 40%)

**Score 1.0**: Agent connects insights across all three sources to identify a compound risk (e.g., South region is weakest because shipping delays + competitor delivery advantage + price sensitivity = churn risk). Reasoning shows genuine synthesis, not just file-by-file summary.
**Score 0.75**: Good cross-referencing between 2 sources. Identifies a valid compound risk but misses one dimension.
**Score 0.5**: References multiple sources but treats them independently. Summary reads like three mini-summaries concatenated.
**Score 0.25**: Heavily relies on one source. Minimal cross-referencing.
**Score 0.0**: Only uses one source or completely misreads the data.

### Criterion 2: Recommendation Quality (Weight: 35%)

**Score 1.0**: Recommendation is specific, actionable, and directly supported by the data synthesis. Example: "Prioritize fixing South region logistics to <3 day delivery to counter CompetitorC's guarantee and retain the 34% price-sensitive customers." Shows strategic thinking.
**Score 0.75**: Good recommendation with data backing but slightly generic or missing one supporting detail.
**Score 0.5**: Recommendation is reasonable but generic ("improve customer satisfaction") or not clearly tied to the data.
**Score 0.25**: Recommendation is vague or contradicted by the data.
**Score 0.0**: No recommendation or completely unrelated to the analysis.

### Criterion 3: Executive Communication (Weight: 25%)

**Score 1.0**: Reads like a real executive summary — concise, data-dense, clear hierarchy of information. A CEO could read it in 90 seconds and make a decision.
**Score 0.75**: Clear and professional but slightly verbose or with minor structural issues.
**Score 0.5**: Contains the right information but poorly organized or too detailed for an executive audience.
**Score 0.25**: Reads like a raw data dump or an academic paper, not an executive summary.
**Score 0.0**: Unreadable or missing.

## Efficiency Baseline

- **Optimal tool calls**: 5
- **Rationale**: 3 reads + 1 write + 1 optional verification = 5
