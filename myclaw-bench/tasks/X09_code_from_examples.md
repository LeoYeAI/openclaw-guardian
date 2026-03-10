---
id: X09_code_from_examples
name: Code Generation from Examples Only
category: coding
grading_type: automated
tier: frontier
timeout_seconds: 300
optimal_tool_calls: 2
inject_date: false
workspace_files:
  - path: "examples.md"
    content: |
      # Data Transformer

      I need a Python function `transform(data)` that processes data according to these input/output examples. Figure out the transformation rules from the examples alone.

      ## Examples

      ```
      Input:  {"users": [{"name": "Alice", "age": 30}, {"name": "Bob", "age": 25}]}
      Output: {"Alice": {"age_group": "adult", "index": 0}, "Bob": {"age_group": "young_adult", "index": 1}}
      ```

      ```
      Input:  {"users": [{"name": "Charlie", "age": 12}, {"name": "Diana", "age": 67}]}
      Output: {"Charlie": {"age_group": "child", "index": 0}, "Diana": {"age_group": "senior", "index": 1}}
      ```

      ```
      Input:  {"users": [{"name": "Eve", "age": 18}]}
      Output: {"Eve": {"age_group": "young_adult", "index": 0}}
      ```

      ```
      Input:  {"users": []}
      Output: {}
      ```

      ```
      Input:  {"users": [{"name": "Frank", "age": 45}, {"name": "Grace", "age": 8}, {"name": "Hank", "age": 19}]}
      Output: {"Frank": {"age_group": "adult", "index": 0}, "Grace": {"age_group": "child", "index": 1}, "Hank": {"age_group": "young_adult", "index": 2}}
      ```

      Save your implementation to `transformer.py`. Include the `transform` function and a `if __name__ == "__main__"` block that tests all the examples above.
---

# Task: Code Generation from Examples Only

## Prompt

Read `examples.md` and implement the `transform` function by inferring the rules from the examples. Save to `transformer.py` with tests.

## Expected Behavior

The model must INFER the transformation rules from examples alone:

1. **Structure**: `users` array → dict keyed by name
2. **Index**: Position in the original array becomes `index`
3. **Age groups** (must be inferred from examples):
   - child: age < 18 (Charlie=12, Grace=8 → child)
   - young_adult: 18 ≤ age < 30 (Bob=25, Eve=18, Hank=19 → young_adult)
   - adult: 30 ≤ age < 65 (Alice=30, Frank=45 → adult)
   - senior: age ≥ 65 (Diana=67 → senior)
4. **Empty array** → empty dict

The tricky part: the age boundaries must be INFERRED, not stated.
- Bob (25) is young_adult, Alice (30) is adult → boundary at 30
- Eve (18) is young_adult, Charlie (12) is child → boundary at 18
- Diana (67) is senior, Frank (45) is adult → boundary somewhere between 45 and 67 (65 is conventional)

A strong model will:
1. Identify all 4 age groups
2. Correctly infer boundaries (18, 30, 65)
3. Handle edge cases (empty list)
4. Write clean, correct code
5. Test against ALL examples

A weak model will:
- Get the boundaries wrong (e.g., use 20 instead of 18)
- Miss one age group
- Not handle empty array

## Grading Criteria

- [ ] transformer.py created
- [ ] Valid Python syntax
- [ ] transform function exists
- [ ] Passes all 5 example test cases
- [ ] Has test/main block

## Automated Checks

```python
def grade(transcript: list, workspace_path: str, meta: dict) -> dict:
    from pathlib import Path
    import ast
    import json
    import subprocess

    scores = {}
    workspace = Path(workspace_path)
    tf = workspace / "transformer.py"

    if not tf.exists():
        return {k: 0.0 for k in ["file_created", "valid_python", "has_function", "passes_tests", "has_main"]}

    scores["file_created"] = 1.0
    content = tf.read_text()

    try:
        ast.parse(content)
        scores["valid_python"] = 1.0
    except SyntaxError:
        return {**scores, "valid_python": 0.0, "has_function": 0.0, "passes_tests": 0.0, "has_main": 0.0}

    scores["has_function"] = 1.0 if "def transform" in content else 0.0
    scores["has_main"] = 1.0 if "__main__" in content else 0.0

    # Actually run the tests
    test_cases = [
        (
            {"users": [{"name": "Alice", "age": 30}, {"name": "Bob", "age": 25}]},
            {"Alice": {"age_group": "adult", "index": 0}, "Bob": {"age_group": "young_adult", "index": 1}}
        ),
        (
            {"users": [{"name": "Charlie", "age": 12}, {"name": "Diana", "age": 67}]},
            {"Charlie": {"age_group": "child", "index": 0}, "Diana": {"age_group": "senior", "index": 1}}
        ),
        (
            {"users": [{"name": "Eve", "age": 18}]},
            {"Eve": {"age_group": "young_adult", "index": 0}}
        ),
        (
            {"users": []},
            {}
        ),
        (
            {"users": [{"name": "Frank", "age": 45}, {"name": "Grace", "age": 8}, {"name": "Hank", "age": 19}]},
            {"Frank": {"age_group": "adult", "index": 0}, "Grace": {"age_group": "child", "index": 1}, "Hank": {"age_group": "young_adult", "index": 2}}
        ),
    ]

    # Write a test runner
    test_script = '''
import json
import sys
sys.path.insert(0, ".")
from transformer import transform

test_cases = ''' + json.dumps([(tc[0], tc[1]) for tc in test_cases]) + '''

passed = 0
for inp, expected in test_cases:
    try:
        result = transform(inp)
        if result == expected:
            passed += 1
    except Exception:
        pass
print(passed)
'''

    test_runner = workspace / "_test_runner.py"
    test_runner.write_text(test_script)

    try:
        result = subprocess.run(
            ["python3", str(test_runner)],
            capture_output=True, text=True, timeout=10, cwd=str(workspace)
        )
        passed = int(result.stdout.strip()) if result.stdout.strip().isdigit() else 0
        scores["passes_tests"] = passed / 5.0
    except (subprocess.TimeoutExpired, ValueError, Exception):
        scores["passes_tests"] = 0.0
    finally:
        test_runner.unlink(missing_ok=True)

    return scores
```

## Efficiency Baseline

- **Optimal tool calls**: 2
- **Rationale**: 1 read + 1 write. Strong models infer rules in one pass.

## Notes

- This tests INDUCTIVE REASONING — learning rules from examples, not following instructions
- The age boundaries are the critical test — they must be inferred, not guessed
- Weak models often use wrong boundaries (e.g., young_adult cutoff at 20 instead of 18)
- The automated check RUNS the code against all examples — no partial credit for "close" code
