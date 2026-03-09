---
id: F04_read_answer
name: Read & Answer from Document
category: comprehension
grading_type: automated
tier: foundation
timeout_seconds: 120
optimal_tool_calls: 2
inject_date: false
workspace_files:
  - path: "company_handbook.md"
    content: |
      # Acme Corp Employee Handbook

      ## PTO Policy
      - Full-time employees receive 20 days of PTO per year
      - PTO accrues at 1.67 days per month
      - Maximum carryover: 5 days into the next calendar year
      - PTO requests must be submitted 2 weeks in advance for 3+ days

      ## Remote Work
      - All employees may work remotely up to 3 days per week
      - Core hours: 10 AM - 3 PM in your local timezone
      - Equipment stipend: $1,500 one-time for home office setup

      ## Benefits
      - Health insurance: 100% premium covered for employee, 75% for dependents
      - 401(k) match: 4% of salary
      - Annual learning budget: $2,000 per employee
      - Parental leave: 16 weeks paid for all parents

      ## Engineering On-Call
      - Rotation: 1 week every 6 weeks
      - On-call compensation: $500/week flat rate
      - Escalation path: Engineer → Team Lead → VP Engineering → CTO
      - SLA: P0 response within 15 minutes, P1 within 1 hour
---

# Task: Read & Answer from Document

## Prompt

Read `company_handbook.md` and answer these questions. Save your answers to `answers.md`:

1. How many PTO days do employees get per year?
2. What's the maximum number of days you can carry over?
3. How much is the home office equipment stipend?
4. What percentage of 401(k) does the company match?
5. What's the P0 incident response SLA?

## Expected Behavior

Read the document, extract specific facts, write concise answers.

## Grading Criteria

- [ ] answers.md created
- [ ] PTO: 20 days
- [ ] Carryover: 5 days
- [ ] Stipend: $1,500
- [ ] 401(k): 4%
- [ ] P0 SLA: 15 minutes

## Automated Checks

```python
def grade(transcript: list, workspace_path: str, meta: dict) -> dict:
    from pathlib import Path

    scores = {}
    workspace = Path(workspace_path)
    answers = workspace / "answers.md"

    if not answers.exists():
        return {k: 0.0 for k in ["file_created", "pto", "carryover", "stipend", "match_401k", "sla"]}

    scores["file_created"] = 1.0
    content = answers.read_text().lower()

    scores["pto"] = 1.0 if "20" in content else 0.0
    scores["carryover"] = 1.0 if "5" in content and ("carry" in content or "carryover" in content or "maximum" in content or "max" in content) else (1.0 if "5 day" in content else 0.0)
    scores["stipend"] = 1.0 if "1,500" in content or "1500" in content else 0.0
    scores["match_401k"] = 1.0 if "4%" in content or "4 percent" in content else 0.0
    scores["sla"] = 1.0 if "15 min" in content or "15min" in content or "fifteen min" in content else 0.0

    return scores
```

## Efficiency Baseline

- **Optimal tool calls**: 2
- **Rationale**: 1 read + 1 write = 2
