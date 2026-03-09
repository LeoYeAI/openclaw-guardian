---
id: M07_api_design
name: API Design from Spec
category: coding
grading_type: hybrid
tier: mastery
timeout_seconds: 360
optimal_tool_calls: 3
inject_date: false
workspace_files:
  - path: "requirements.md"
    content: |
      # Task Management API Requirements

      ## Entities
      - **Task**: id, title, description, status (todo/in_progress/done), priority (low/medium/high), assignee_email, created_at, updated_at
      - **User**: id, name, email

      ## Endpoints Required
      1. GET /tasks — list all tasks (support ?status= and ?priority= filters)
      2. POST /tasks — create a task (title required, default status=todo, default priority=medium)
      3. GET /tasks/:id — get single task
      4. PATCH /tasks/:id — update task fields
      5. DELETE /tasks/:id — soft delete (mark as deleted, don't remove)
      6. GET /tasks/:id/history — return change history for a task

      ## Business Rules
      - Tasks cannot go backwards in status (done → in_progress is invalid)
      - High priority tasks cannot be deleted
      - Assignee email must be a valid registered user
      - All mutations must log to change history with timestamp and changed_by

      ## Non-functional
      - Input validation with clear error messages
      - Consistent JSON response format: { "data": ..., "error": null } or { "data": null, "error": { "code": "...", "message": "..." } }
---

# Task: API Design from Spec

## Prompt

Read `requirements.md` and implement the Task Management API as a Python Flask (or FastAPI) application. Create:

1. `app.py` — the API implementation with all endpoints and business rules
2. `models.py` — data models/schemas
3. `tests/test_api.py` — at least 5 tests covering happy paths and business rule enforcement

## Expected Behavior

This tests the ability to translate a detailed spec into working code with correct business logic. Key challenges:
- Status transition validation (no backwards moves)
- Soft delete with high-priority protection
- Change history tracking
- Consistent error response format
- Input validation

## Grading Criteria

- [ ] app.py created with valid Python
- [ ] All 6 endpoints implemented
- [ ] Status transition rule enforced
- [ ] High priority deletion blocked
- [ ] Consistent response format
- [ ] models.py with proper schemas
- [ ] 5+ tests covering business rules

## Automated Checks

```python
def grade(transcript: list, workspace_path: str, meta: dict) -> dict:
    from pathlib import Path
    import ast
    import re

    scores = {}
    workspace = Path(workspace_path)

    # app.py
    app_file = workspace / "app.py"
    if app_file.exists():
        content = app_file.read_text()
        try:
            ast.parse(content)
            scores["app_valid"] = 1.0
        except SyntaxError:
            scores["app_valid"] = 0.0
            return {**scores, **{k: 0.0 for k in ["endpoints", "status_rule", "delete_rule", "response_format", "models", "tests"]}}

        # Check endpoints
        endpoints = ["/tasks", "tasks/<", "POST", "GET", "PATCH", "DELETE"]
        # Also check FastAPI style
        alt_endpoints = ["@app.get", "@app.post", "@app.patch", "@app.delete", "@router.get"]
        found = sum(1 for ep in endpoints if ep.lower() in content.lower())
        found_alt = sum(1 for ep in alt_endpoints if ep in content)
        scores["endpoints"] = min(1.0, max(found, found_alt) / 4.0)

        # Check status transition rule
        status_keywords = ["backward", "invalid", "cannot", "transition", "todo", "in_progress", "done"]
        scores["status_rule"] = 1.0 if sum(1 for k in status_keywords if k in content.lower()) >= 3 else 0.0

        # Check delete protection
        delete_keywords = ["high", "priority", "cannot", "delete", "protect"]
        scores["delete_rule"] = 1.0 if sum(1 for k in delete_keywords if k in content.lower()) >= 2 else 0.0

        # Check response format
        scores["response_format"] = 1.0 if '"data"' in content and '"error"' in content else 0.0
    else:
        for k in ["app_valid", "endpoints", "status_rule", "delete_rule", "response_format"]:
            scores[k] = 0.0

    # models.py
    models = workspace / "models.py"
    scores["models"] = 1.0 if models.exists() and len(models.read_text().strip()) > 50 else 0.0

    # tests
    test_paths = [workspace / "tests" / "test_api.py", workspace / "test_api.py"]
    test_file = None
    for tp in test_paths:
        if tp.exists():
            test_file = tp
            break

    if test_file:
        content = test_file.read_text()
        test_count = len(re.findall(r'def test_', content))
        scores["tests"] = min(1.0, test_count / 5.0)
    else:
        scores["tests"] = 0.0

    return scores
```

## LLM Judge Rubric

### Criterion 1: Architecture Quality (Weight: 35%)

**Score 1.0**: Clean separation of concerns. Routes, models, and business logic are well-organized. Error handling is consistent. Code follows framework best practices (Flask/FastAPI).
**Score 0.75**: Good architecture with minor issues.
**Score 0.5**: Functional but messy. Business logic mixed with routing.
**Score 0.25**: Poorly organized, hard to follow.
**Score 0.0**: Non-functional.

### Criterion 2: Business Rule Implementation (Weight: 40%)

**Score 1.0**: All 4 business rules correctly implemented: status transitions, delete protection, assignee validation, change history logging. Edge cases handled.
**Score 0.75**: 3/4 rules correct.
**Score 0.5**: 2/4 rules correct.
**Score 0.25**: 1/4 rules.
**Score 0.0**: No business rules implemented.

### Criterion 3: Test Coverage (Weight: 25%)

**Score 1.0**: 5+ tests covering both happy paths AND business rule violations (e.g., test that backward status transition returns error). Tests are meaningful.
**Score 0.75**: 5 tests but only happy paths.
**Score 0.5**: 3-4 tests.
**Score 0.25**: 1-2 tests.
**Score 0.0**: No tests.

## Efficiency Baseline

- **Optimal tool calls**: 3
- **Rationale**: 1 read (requirements) + 3 writes (app, models, tests) = 4. Could be 3 if models are inline.
