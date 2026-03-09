---
id: R07_long_chain
name: Long-Chain 8-Step Task
category: complex
grading_type: hybrid
tier: reasoning
timeout_seconds: 480
optimal_tool_calls: 12
inject_date: true
workspace_files:
  - path: "raw_data/users.json"
    content: |
      [
        {"id": 1, "name": "Alice Chen", "email": "alice@startup.io", "role": "engineer", "joined": "2024-03-15", "active": true},
        {"id": 2, "name": "Bob Martinez", "email": "bob@startup.io", "role": "designer", "joined": "2024-01-10", "active": true},
        {"id": 3, "name": "Carol Davis", "email": "carol@oldcorp.com", "role": "engineer", "joined": "2023-06-01", "active": false},
        {"id": 4, "name": "David Kim", "email": "david@startup.io", "role": "pm", "joined": "2024-07-22", "active": true},
        {"id": 5, "name": "Eve Wilson", "email": "eve@contractor.net", "role": "engineer", "joined": "2024-11-01", "active": true},
        {"id": 6, "name": "Frank Brown", "email": "frank@startup.io", "role": "engineer", "joined": "2023-09-15", "active": false},
        {"id": 7, "name": "Grace Lee", "email": "grace@startup.io", "role": "designer", "joined": "2024-05-20", "active": true}
      ]
---

# Task: Long-Chain 8-Step Task

## Prompt

I need you to process our team data. Here are the steps — do them all in order:

1. Read `raw_data/users.json`
2. Filter to only active users
3. Sort them by join date (earliest first)
4. Create a directory called `output/`
5. Save the filtered+sorted list as `output/active_team.json`
6. Create `output/team_summary.md` with: team size, role breakdown, earliest and latest join date
7. Create `output/email_list.txt` with just the emails, one per line
8. Write a final `output/DONE.md` with a one-line confirmation that includes the total count

## Expected Behavior

The agent must execute all 8 steps in order. The key challenge is maintaining context and correctness across a long chain of dependent operations.

Expected outputs:
- **active_team.json**: 5 users (Alice, Bob, David, Eve, Grace), sorted by joined date: Bob (Jan 10) → Alice (Mar 15) → Grace (May 20) → David (Jul 22) → Eve (Nov 1)
- **team_summary.md**: 5 active members, 2 engineers, 2 designers, 1 PM, earliest: 2024-01-10, latest: 2024-11-01
- **email_list.txt**: 5 emails, one per line
- **DONE.md**: Confirmation with count of 5

## Grading Criteria

- [ ] Read the input file
- [ ] Correctly filtered to active users (5 users, excluded Carol and Frank)
- [ ] Correctly sorted by join date
- [ ] Created output/ directory
- [ ] active_team.json has correct content
- [ ] team_summary.md has correct stats
- [ ] email_list.txt has correct emails
- [ ] DONE.md exists with correct count

## Automated Checks

```python
def grade(transcript: list, workspace_path: str, meta: dict) -> dict:
    from pathlib import Path
    import json

    scores = {}
    workspace = Path(workspace_path)
    output = workspace / "output"

    # Step 4: output directory exists
    scores["output_dir"] = 1.0 if output.exists() and output.is_dir() else 0.0

    # Step 5: active_team.json
    active_file = output / "active_team.json"
    if active_file.exists():
        try:
            data = json.loads(active_file.read_text())
            names = [u.get("name", "") for u in data]
            ids = [u.get("id", 0) for u in data]

            # Check filter: should have exactly 5 active users
            correct_ids = {1, 2, 4, 5, 7}
            actual_ids = set(ids)
            if actual_ids == correct_ids:
                scores["filter_correct"] = 1.0
            elif correct_ids.issubset(actual_ids):
                scores["filter_correct"] = 0.5  # Has all active but also includes inactive
            else:
                scores["filter_correct"] = len(actual_ids & correct_ids) / 5.0

            # Check sort: Bob, Alice, Grace, David, Eve
            expected_order = ["Bob Martinez", "Alice Chen", "Grace Lee", "David Kim", "Eve Wilson"]
            if names == expected_order:
                scores["sort_correct"] = 1.0
            elif set(names) == set(expected_order):
                scores["sort_correct"] = 0.5  # Right people, wrong order
            else:
                scores["sort_correct"] = 0.0

        except (json.JSONDecodeError, TypeError, KeyError):
            scores["filter_correct"] = 0.0
            scores["sort_correct"] = 0.0
    else:
        scores["filter_correct"] = 0.0
        scores["sort_correct"] = 0.0

    # Step 6: team_summary.md
    summary_file = output / "team_summary.md"
    if summary_file.exists():
        content = summary_file.read_text().lower()
        has_count = "5" in content
        has_roles = ("engineer" in content and "designer" in content and "pm" in content)
        has_dates = ("2024" in content)

        role_score = 0.0
        if has_count:
            role_score += 0.4
        if has_roles:
            role_score += 0.4
        if has_dates:
            role_score += 0.2
        scores["summary_correct"] = role_score
    else:
        scores["summary_correct"] = 0.0

    # Step 7: email_list.txt
    email_file = output / "email_list.txt"
    if email_file.exists():
        emails = [line.strip() for line in email_file.read_text().strip().split("\n") if line.strip()]
        expected_emails = {
            "alice@startup.io", "bob@startup.io", "david@startup.io",
            "eve@contractor.net", "grace@startup.io"
        }
        actual_emails = set(emails)
        if actual_emails == expected_emails:
            scores["emails_correct"] = 1.0
        else:
            overlap = len(actual_emails & expected_emails)
            scores["emails_correct"] = overlap / 5.0
    else:
        scores["emails_correct"] = 0.0

    # Step 8: DONE.md
    done_file = output / "DONE.md"
    if done_file.exists():
        content = done_file.read_text()
        scores["done_file"] = 1.0 if "5" in content else 0.5
    else:
        scores["done_file"] = 0.0

    return scores
```

## LLM Judge Rubric

### Criterion 1: Step Completeness (Weight: 50%)

**Score 1.0**: All 8 steps executed in order with correct outputs. No steps skipped or combined incorrectly.
**Score 0.75**: 7 of 8 steps completed correctly. One minor step missed.
**Score 0.5**: 5-6 steps completed. Notable gaps in the chain.
**Score 0.25**: Fewer than 5 steps completed or major errors in execution order.
**Score 0.0**: Fewer than 3 steps completed or fundamental misunderstanding of the task.

### Criterion 2: Data Accuracy (Weight: 50%)

**Score 1.0**: All data transformations correct — filtering excluded exactly Carol and Frank, sorting is chronological, counts are accurate, emails are complete.
**Score 0.75**: Minor data error (e.g., one email wrong, count off by one).
**Score 0.5**: One major data error (e.g., wrong sort order, missed a filtered user).
**Score 0.25**: Multiple data errors across different steps.
**Score 0.0**: Data is largely incorrect or fabricated.

## Efficiency Baseline

- **Optimal tool calls**: 12
- **Rationale**: 1 read + some processing + 4 writes (4 files) + mkdir + verification ≈ 12
