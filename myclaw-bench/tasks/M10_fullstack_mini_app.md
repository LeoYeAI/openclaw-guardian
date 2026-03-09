---
id: M10_fullstack_mini_app
name: Full-Stack Mini App Creation
category: complex
grading_type: hybrid
tier: mastery
timeout_seconds: 600
optimal_tool_calls: 8
inject_date: false
workspace_files: []
---

# Task: Full-Stack Mini App Creation

## Prompt

Build a simple URL shortener as a single-file Python web app using Flask. Requirements:

1. `app.py` — Flask app with:
   - POST `/shorten` — accepts `{"url": "https://..."}`, returns `{"short_url": "http://localhost:5000/abc123", "code": "abc123"}`
   - GET `/<code>` — redirects to original URL (302)
   - GET `/stats/<code>` — returns `{"url": "...", "clicks": N, "created_at": "..."}`
2. Use SQLite for storage (in-memory is fine for the test)
3. Generate 6-character alphanumeric codes
4. Track click count on each redirect
5. Handle errors: invalid URL, code not found, missing fields
6. `test_app.py` — at least 4 tests: create, redirect, stats, error case

## Expected Behavior

The agent should create a working Flask app with proper error handling and a test file. Key technical challenges:
- Short code generation (random alphanumeric)
- Click tracking (increment on redirect)
- Proper HTTP status codes (302 for redirect, 404 for not found, 400 for bad input)
- SQLite schema design (url, code, clicks, created_at)

## Grading Criteria

- [ ] app.py created with valid Python
- [ ] POST /shorten endpoint works
- [ ] GET /<code> redirect endpoint
- [ ] GET /stats/<code> endpoint
- [ ] SQLite storage
- [ ] Error handling (404, 400)
- [ ] test_app.py with 4+ tests
- [ ] Code generation (6-char alphanumeric)

## Automated Checks

```python
def grade(transcript: list, workspace_path: str, meta: dict) -> dict:
    from pathlib import Path
    import ast
    import re

    scores = {}
    workspace = Path(workspace_path)

    app = workspace / "app.py"
    if not app.exists():
        return {k: 0.0 for k in ["app_valid", "has_shorten", "has_redirect", "has_stats",
                                   "has_sqlite", "has_errors", "has_tests", "has_codegen"]}

    content = app.read_text()

    try:
        ast.parse(content)
        scores["app_valid"] = 1.0
    except SyntaxError:
        return {**{"app_valid": 0.0}, **{k: 0.0 for k in ["has_shorten", "has_redirect",
                "has_stats", "has_sqlite", "has_errors", "has_tests", "has_codegen"]}}

    cl = content.lower()

    # Endpoints
    scores["has_shorten"] = 1.0 if ("shorten" in cl and "post" in cl) else 0.0
    scores["has_redirect"] = 1.0 if ("redirect" in cl or "302" in content) else 0.0
    scores["has_stats"] = 1.0 if ("stats" in cl or "clicks" in cl) else 0.0

    # SQLite
    scores["has_sqlite"] = 1.0 if ("sqlite" in cl or "sqlite3" in cl) else 0.0

    # Error handling
    has_404 = "404" in content
    has_400 = "400" in content
    scores["has_errors"] = 1.0 if (has_404 and has_400) else (0.5 if (has_404 or has_400) else 0.0)

    # Code generation
    scores["has_codegen"] = 1.0 if any(p in cl for p in ["random", "uuid", "string.ascii", "choices", "token_urlsafe"]) else 0.0

    # Tests
    test_paths = [workspace / "test_app.py", workspace / "tests" / "test_app.py"]
    test_file = None
    for tp in test_paths:
        if tp.exists():
            test_file = tp
            break

    if test_file:
        tc = test_file.read_text()
        test_count = len(re.findall(r'def test_', tc))
        scores["has_tests"] = min(1.0, test_count / 4.0)
    else:
        scores["has_tests"] = 0.0

    return scores
```

## LLM Judge Rubric

### Criterion 1: Functionality (Weight: 40%)

**Score 1.0**: All 3 endpoints work correctly. Short codes are generated, redirects use 302, stats track clicks, errors return appropriate status codes with JSON messages.
**Score 0.75**: Core functionality works, minor issues (e.g., missing click tracking or weak error messages).
**Score 0.5**: 2/3 endpoints work. Notable gaps.
**Score 0.25**: Only 1 endpoint works or major bugs.
**Score 0.0**: Non-functional.

### Criterion 2: Code Quality (Weight: 30%)

**Score 1.0**: Clean, well-organized code. Proper use of Flask patterns. Good variable names. DB schema makes sense. Consistent response format.
**Score 0.75**: Good code with minor issues.
**Score 0.5**: Functional but messy.
**Score 0.25**: Poor quality, hard to read.
**Score 0.0**: Broken.

### Criterion 3: Test Quality (Weight: 30%)

**Score 1.0**: 4+ tests covering: create short URL, redirect works, stats return correctly, error case (missing URL, invalid code). Tests use Flask test client properly.
**Score 0.75**: 4 tests but missing edge case coverage.
**Score 0.5**: 2-3 tests.
**Score 0.25**: 1 test or tests don't actually test the endpoints.
**Score 0.0**: No tests.

## Efficiency Baseline

- **Optimal tool calls**: 8
- **Rationale**: Research/planning + app.py write + test write + possibly running tests + iteration. Complex task allows more calls.
