---
id: F02_file_structure
name: File Structure Creation
category: file_ops
grading_type: automated
tier: foundation
timeout_seconds: 120
optimal_tool_calls: 5
inject_date: false
workspace_files: []
---

# Task: File Structure Creation

## Prompt

Create a Python project structure for a library called "datautils":

1. `src/datautils/` package directory with `__init__.py`
2. `tests/` directory with `test_datautils.py` containing a placeholder test
3. `pyproject.toml` with project name "datautils", version "0.1.0"
4. `README.md` with project title and one-line description

## Expected Behavior

The agent should create all directories and files with meaningful content — not empty placeholders.

## Grading Criteria

- [ ] src/datautils/ directory exists
- [ ] __init__.py created
- [ ] tests/ directory with test file
- [ ] pyproject.toml with correct metadata
- [ ] README.md with title

## Automated Checks

```python
def grade(transcript: list, workspace_path: str, meta: dict) -> dict:
    from pathlib import Path

    scores = {}
    workspace = Path(workspace_path)

    scores["src_dir"] = 1.0 if (workspace / "src" / "datautils").is_dir() else 0.0
    scores["init_file"] = 1.0 if (workspace / "src" / "datautils" / "__init__.py").exists() else 0.0
    scores["tests_dir"] = 1.0 if (workspace / "tests").is_dir() else 0.0

    test_file = workspace / "tests" / "test_datautils.py"
    if test_file.exists():
        content = test_file.read_text()
        scores["test_file"] = 1.0 if ("def test_" in content or "assert" in content) else 0.5
    else:
        scores["test_file"] = 0.0

    pyproject = workspace / "pyproject.toml"
    if pyproject.exists():
        content = pyproject.read_text().lower()
        has_name = "datautils" in content
        has_version = "0.1.0" in content
        scores["pyproject"] = 1.0 if (has_name and has_version) else 0.5 if has_name else 0.0
    else:
        scores["pyproject"] = 0.0

    readme = workspace / "README.md"
    if readme.exists():
        content = readme.read_text()
        scores["readme"] = 1.0 if len(content.strip()) > 10 else 0.5
    else:
        scores["readme"] = 0.0

    return scores
```

## Efficiency Baseline

- **Optimal tool calls**: 5
- **Rationale**: 5 writes (init, test, pyproject, readme, plus mkdir or combined). Could be fewer if tool creates dirs automatically.
