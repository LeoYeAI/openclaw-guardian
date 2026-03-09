---
id: F05_python_script
name: Write a Python Script (Weather)
category: coding
grading_type: automated
tier: foundation
timeout_seconds: 180
optimal_tool_calls: 1
inject_date: false
workspace_files: []
---

# Task: Write a Python Script

## Prompt

Create a Python script called `weather.py` that fetches weather data for San Francisco using the wttr.in API (`https://wttr.in/San_Francisco?format=j1`) and prints a summary including temperature and conditions. Include error handling for network failures.

## Expected Behavior

Write a functional Python script that makes an HTTP request, parses the response, and prints weather info with try/except.

## Grading Criteria

- [ ] File weather.py created
- [ ] Valid Python syntax
- [ ] Contains HTTP request code
- [ ] References San Francisco
- [ ] Has error handling (try/except)
- [ ] Has print output
- [ ] Has proper structure (function or main block)

## Automated Checks

```python
def grade(transcript: list, workspace_path: str, meta: dict) -> dict:
    from pathlib import Path
    import re
    import ast

    scores = {}
    workspace = Path(workspace_path)
    script = workspace / "weather.py"

    if not script.exists():
        return {k: 0.0 for k in ["file_created", "valid_python", "has_http", "has_location", "has_error_handling", "has_output", "has_structure"]}

    scores["file_created"] = 1.0
    content = script.read_text()

    try:
        ast.parse(content)
        scores["valid_python"] = 1.0
    except SyntaxError:
        return {**scores, **{k: 0.0 for k in ["valid_python", "has_http", "has_location", "has_error_handling", "has_output", "has_structure"]}}

    http_patterns = [r'import\s+requests', r'from\s+requests', r'import\s+urllib', r'from\s+urllib',
                     r'import\s+http', r'requests\.get', r'urllib\.request', r'urlopen', r'import\s+httpx', r'httpx\.']
    scores["has_http"] = 1.0 if any(re.search(p, content) for p in http_patterns) else 0.0

    scores["has_location"] = 1.0 if re.search(r'[Ss]an.?[Ff]rancisco', content) else 0.0

    scores["has_error_handling"] = 1.0 if re.search(r'try\s*:', content) and re.search(r'except', content) else 0.0

    scores["has_output"] = 1.0 if re.search(r'print\s*\(', content) else 0.0

    has_func = bool(re.search(r'def\s+\w+\s*\(', content))
    has_main = bool(re.search(r'if\s+__name__\s*==\s*["\']__main__["\']', content))
    scores["has_structure"] = 1.0 if (has_func or has_main) else 0.5

    return scores
```

## Efficiency Baseline

- **Optimal tool calls**: 1
- **Rationale**: 1 write. All logic is in the prompt.
