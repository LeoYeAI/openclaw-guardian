---
id: task_XXXX
name: Task Display Name
category: category_name
grading_type: automated | llm_judge | hybrid
tier: foundation | reasoning | mastery
timeout_seconds: 120
workspace_files: []
optimal_tool_calls: 3          # Baseline for efficiency scoring
inject_date: true              # Whether to inject current date into prompt
multi_session: false           # Whether task spans multiple sessions
---

# Task: [Task Display Name]

## Prompt

{The exact message sent to the agent. If `inject_date: true`, the harness
automatically prepends "Today is [YYYY-MM-DD, DayOfWeek]." to the prompt.}

## Expected Behavior

{Description of what the agent should do. Include:
- Primary approach(es)
- Acceptable alternative solutions
- Key decisions the agent must make
- Any expected tool usage}

## Grading Criteria

{Checklist of success criteria.}

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Automated Checks

```python
def grade(transcript: list, workspace_path: str, meta: dict) -> dict:
    """
    Grade the task.

    Args:
        transcript: Parsed JSONL transcript as list of dicts.
        workspace_path: Path to the task's isolated workspace directory.
        meta: Dict with runtime context:
            - task_start_time (float): Unix timestamp when task started
            - injected_date (str): The date string injected into prompt
            - session_count (int): Number of sessions in multi-session tasks
            - tool_call_count (int): Total tool calls made by agent

    Returns:
        Dict mapping criterion names to scores (0.0 to 1.0).

    GRADING RULES:
        1. NEVER hardcode tool names. Use file access time or workspace state.
        2. NEVER use datetime.now() for time-sensitive checks. Use meta['injected_date'].
        3. Use proper parsing libraries (json, yaml, icalendar, ast), not regex for structure.
        4. Handle alternative valid approaches — grade the outcome, not the method.
        5. Return partial credit (0.0-1.0) where appropriate.
    """
    scores = {}
    # Implementation here
    return scores
```

## LLM Judge Rubric

{Required if grading_type is llm_judge or hybrid.}

### Criterion 1: [Name] (Weight: X%)

**Score 1.0**: [Perfect]
**Score 0.75**: [Good with minor issues]
**Score 0.5**: [Acceptable with notable gaps]
**Score 0.25**: [Poor with major issues]
**Score 0.0**: [Failure]

## Efficiency Baseline

- **Optimal tool calls**: {number}
- **Rationale**: {Why this is the minimum reasonable number}

## Notes

{Optional: edge cases, rationale, known limitations.}
