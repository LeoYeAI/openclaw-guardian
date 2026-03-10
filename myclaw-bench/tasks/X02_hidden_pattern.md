---
id: X02_hidden_pattern
name: Hidden Pattern Discovery
category: reasoning
grading_type: automated
tier: frontier
timeout_seconds: 240
optimal_tool_calls: 2
inject_date: false
workspace_files:
  - path: "data.md"
    content: |
      # Server Performance Log — Last 30 Days

      | Day | Requests | Errors | Avg Latency (ms) | Deploy? | Team On-Call |
      |-----|----------|--------|-------------------|---------|-------------|
      | 1   | 45200    | 12     | 142               | No      | Alpha       |
      | 2   | 47800    | 15     | 138               | No      | Alpha       |
      | 3   | 52100    | 8      | 145               | Yes     | Alpha       |
      | 4   | 48900    | 210    | 387               | No      | Alpha       |
      | 5   | 51200    | 45     | 198               | No      | Beta        |
      | 6   | 49800    | 11     | 141               | No      | Beta        |
      | 7   | 46300    | 9      | 139               | No      | Beta        |
      | 8   | 53400    | 14     | 144               | Yes     | Beta        |
      | 9   | 50200    | 198    | 412               | No      | Beta        |
      | 10  | 48700    | 32     | 187               | No      | Alpha       |
      | 11  | 47100    | 10     | 140               | No      | Alpha       |
      | 12  | 49500    | 13     | 143               | No      | Alpha       |
      | 13  | 55200    | 7      | 136               | Yes     | Alpha       |
      | 14  | 52800    | 245    | 445               | No      | Alpha       |
      | 15  | 51400    | 38     | 192               | No      | Beta        |
      | 16  | 48900    | 11     | 141               | No      | Beta        |
      | 17  | 47200    | 9      | 138               | No      | Beta        |
      | 18  | 50100    | 12     | 142               | Yes     | Beta        |
      | 19  | 49300    | 187    | 398               | No      | Beta        |
      | 20  | 51800    | 29     | 176               | No      | Alpha       |
      | 21  | 48400    | 10     | 140               | No      | Alpha       |
      | 22  | 47600    | 14     | 144               | No      | Alpha       |
      | 23  | 54100    | 9      | 137               | Yes     | Alpha       |
      | 24  | 51900    | 223    | 432               | No      | Alpha       |
      | 25  | 50300    | 41     | 195               | No      | Beta        |
      | 26  | 49100    | 12     | 141               | No      | Beta        |
      | 27  | 47800    | 8      | 139               | No      | Beta        |
      | 28  | 52700    | 11     | 143               | Yes     | Beta        |
      | 29  | 50400    | 201    | 405               | No      | Beta        |
      | 30  | 48200    | 33     | 184               | No      | Alpha       |
---

# Task: Hidden Pattern Discovery

## Prompt

Analyze the server performance data in `data.md`. Find the root cause of the error spikes and latency issues. Write your analysis to `analysis.md` including:

1. The pattern you found
2. Evidence supporting your conclusion
3. A specific recommendation to fix it

## Expected Behavior

The hidden pattern: **Every error spike happens exactly 1 day AFTER a deployment.**

Evidence:
- Day 3: Deploy → Day 4: 210 errors, 387ms latency
- Day 8: Deploy → Day 9: 198 errors, 412ms latency
- Day 13: Deploy → Day 14: 245 errors, 445ms latency
- Day 18: Deploy → Day 19: 187 errors, 398ms latency
- Day 23: Deploy → Day 24: 223 errors, 432ms latency
- Day 28: Deploy → Day 29: 201 errors, 405ms latency

This happens regardless of which team is on-call (Alpha or Beta), ruling out a team skill issue. The deployments themselves don't cause errors on deploy day — the problem manifests the NEXT day.

Possible root cause: a cache warming issue, a cron job that runs daily and hits new code paths, or a config that takes effect on the next restart cycle.

A weak model will:
- Notice error spikes but attribute them to traffic volume (wrong — requests are similar)
- Blame a specific team
- Notice deploys but not the 1-day lag

## Grading Criteria

- [ ] analysis.md created
- [ ] Identifies deploy → next-day error correlation
- [ ] Notes the 1-day delay (not same-day)
- [ ] Shows evidence (specific days/numbers)
- [ ] Provides actionable recommendation
- [ ] Rules out irrelevant factors (traffic, team)

## Automated Checks

```python
def grade(transcript: list, workspace_path: str, meta: dict) -> dict:
    from pathlib import Path

    scores = {}
    workspace = Path(workspace_path)
    analysis = workspace / "analysis.md"

    if not analysis.exists():
        return {k: 0.0 for k in ["file_created", "deploy_correlation", "day_delay", "evidence", "recommendation"]}

    scores["file_created"] = 1.0
    content = analysis.read_text().lower()

    # Core insight: deploy causes errors
    deploy_words = ["deploy", "deployment", "release", "push", "ship"]
    error_words = ["error", "spike", "incident", "failure", "issue"]
    scores["deploy_correlation"] = 1.0 if (any(d in content for d in deploy_words) and any(e in content for e in error_words)) else 0.0

    # Key insight: it's the NEXT day, not the same day
    delay_words = ["next day", "day after", "following day", "one day later", "1 day", "delayed", "lag", "subsequent day", "day later"]
    scores["day_delay"] = 1.0 if any(d in content for d in delay_words) else 0.0

    # Evidence: mentions specific day numbers
    import re
    day_refs = len(re.findall(r'day\s*\d+', content))
    scores["evidence"] = 1.0 if day_refs >= 3 else (0.5 if day_refs >= 1 else 0.0)

    # Recommendation
    rec_words = ["recommend", "suggest", "should", "fix", "solution", "prevent", "mitigat", "canary", "rollback", "monitoring", "test", "staging"]
    scores["recommendation"] = 1.0 if sum(1 for r in rec_words if r in content) >= 2 else 0.0

    return scores
```

## Efficiency Baseline

- **Optimal tool calls**: 2
- **Rationale**: 1 read + 1 write. The challenge is purely analytical.

## Notes

- This is the #1 differentiator between strong and weak models
- Weak models see the error numbers but miss the temporal pattern
- Medium models notice deploys correlate with errors but don't catch the 1-day lag
- Only strong models identify the exact pattern: deploy on day N → errors on day N+1
- The on-call team alternates to create a red herring — weak models may blame a team
