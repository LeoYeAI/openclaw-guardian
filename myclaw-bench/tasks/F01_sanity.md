---
id: F01_sanity
name: Sanity Check
category: basic
grading_type: automated
tier: foundation
timeout_seconds: 60
optimal_tool_calls: 0
inject_date: false
workspace_files: []
---

# Task: Sanity Check

## Prompt

Respond with "Hello, I'm ready!" to confirm you can respond.

## Expected Behavior

The agent should respond with any greeting or confirmation. This validates the benchmarking harness is working.

## Grading Criteria

- [ ] Agent responded successfully

## Automated Checks

```python
def grade(transcript: list, workspace_path: str, meta: dict) -> dict:
    for event in transcript:
        if event.get("type") != "message":
            continue
        msg = event.get("message", {})
        if msg.get("role") == "assistant":
            content = msg.get("content", [])
            if content and len(content) > 0:
                return {"agent_responded": 1.0}
    return {"agent_responded": 0.0}
```

## Efficiency Baseline

- **Optimal tool calls**: 0
- **Rationale**: Pure text response, no tools needed.
