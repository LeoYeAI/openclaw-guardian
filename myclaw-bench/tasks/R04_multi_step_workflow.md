---
id: R04_multi_step_workflow
name: Multi-Step API Workflow
category: complex
grading_type: hybrid
tier: reasoning
timeout_seconds: 300
optimal_tool_calls: 4
inject_date: false
workspace_files:
  - path: "spec.json"
    content: |
      {
        "api": {
          "base_url": "https://api.example.com/v2",
          "endpoints": {
            "users": "/users",
            "orders": "/orders",
            "products": "/products"
          },
          "auth": {
            "type": "bearer",
            "header": "Authorization"
          },
          "rate_limit": "100 requests/minute"
        },
        "project": {
          "name": "ShopSync",
          "version": "2.1.0"
        }
      }
---

# Task: Multi-Step API Workflow

## Prompt

Read `spec.json`, then:
1. Create a Python client library `client.py` that wraps the API (base URL, all 3 endpoints, auth header setup)
2. Create `README.md` documenting how to use the client with code examples
3. Create `tests/test_client.py` with at least 3 unit tests (mock the HTTP calls)

## Expected Behavior

The agent must read the spec, then generate three interconnected files. The client should use the exact endpoints and auth config from the spec. The README should reference the client. The tests should test the client.

## Grading Criteria

- [ ] Read spec.json
- [ ] client.py created with valid Python
- [ ] client.py references all 3 endpoints from spec
- [ ] client.py handles bearer auth
- [ ] README.md created with usage examples
- [ ] tests/test_client.py created with 3+ tests

## Automated Checks

```python
def grade(transcript: list, workspace_path: str, meta: dict) -> dict:
    from pathlib import Path
    import ast
    import re

    scores = {}
    workspace = Path(workspace_path)

    # client.py
    client = workspace / "client.py"
    if client.exists():
        content = client.read_text()
        try:
            ast.parse(content)
            scores["client_valid"] = 1.0
        except SyntaxError:
            scores["client_valid"] = 0.0

        endpoints = ["users", "orders", "products"]
        found = sum(1 for ep in endpoints if ep in content.lower())
        scores["client_endpoints"] = found / 3.0

        scores["client_auth"] = 1.0 if ("bearer" in content.lower() or "authorization" in content.lower()) else 0.0
    else:
        scores["client_valid"] = 0.0
        scores["client_endpoints"] = 0.0
        scores["client_auth"] = 0.0

    # README
    readme = workspace / "README.md"
    if readme.exists():
        content = readme.read_text()
        has_code = "```" in content
        has_import = "import" in content.lower() or "from" in content.lower()
        scores["readme_created"] = 1.0 if (has_code or has_import) else 0.5
    else:
        scores["readme_created"] = 0.0

    # Tests
    test_file = workspace / "tests" / "test_client.py"
    if not test_file.exists():
        # Try alternate path
        for alt in [workspace / "test_client.py", workspace / "tests/test_client.py"]:
            if alt.exists():
                test_file = alt
                break

    if test_file.exists():
        content = test_file.read_text()
        try:
            ast.parse(content)
            test_count = len(re.findall(r'def test_', content))
            scores["tests_created"] = min(1.0, test_count / 3.0)
        except SyntaxError:
            scores["tests_created"] = 0.0
    else:
        scores["tests_created"] = 0.0

    return scores
```

## LLM Judge Rubric

### Criterion 1: Code Quality (Weight: 40%)

**Score 1.0**: Client is well-structured (class-based or functional), uses spec values correctly, has proper error handling, clean code.
**Score 0.75**: Functional with minor issues.
**Score 0.5**: Basic but works, notable code quality issues.
**Score 0.25**: Barely functional.
**Score 0.0**: Broken or missing.

### Criterion 2: Documentation (Weight: 30%)

**Score 1.0**: README has install instructions, usage examples with code blocks, explains auth setup. Professional quality.
**Score 0.75**: Good docs, minor gaps.
**Score 0.5**: Basic docs, missing examples or auth explanation.
**Score 0.25**: Minimal docs.
**Score 0.0**: No docs.

### Criterion 3: Test Quality (Weight: 30%)

**Score 1.0**: 3+ tests covering different endpoints, uses mocking properly, tests edge cases.
**Score 0.75**: 3 tests, basic but correct.
**Score 0.5**: 1-2 tests or tests don't mock properly.
**Score 0.25**: Tests exist but are trivial or broken.
**Score 0.0**: No tests.

## Efficiency Baseline

- **Optimal tool calls**: 4
- **Rationale**: 1 read (spec) + 3 writes (client, readme, test) = 4
