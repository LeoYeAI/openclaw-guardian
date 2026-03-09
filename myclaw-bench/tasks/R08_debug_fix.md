---
id: R08_debug_fix
name: Debug & Fix Broken Code
category: coding
grading_type: automated
tier: reasoning
timeout_seconds: 240
optimal_tool_calls: 4
inject_date: false
workspace_files:
  - path: "app.py"
    content: |
      import json
      from pathlib import Path

      def load_config(path):
          """Load configuration from JSON file."""
          with open(path 'r') as f:
              data = json.load(f)
          return data

      def get_users(config):
          """Extract active users from config."""
          users = config.get("users", [])
          active = []
          for user in users:
              if user["status"] == "active":
                  active.apped(user)
          return active

      def format_report(users):
          """Create a formatted report string."""
          report = "Active Users Report\n"
          report += "=" * 30 + "\n"
          for i, user in enumerate(users):
              report += f"{i+1}. {user['name']} ({user['email']})\n"
              report += f"   Role: {user['role']}\n"
              report += f"   Joined: {user['joined']}\n"
          report += f"\nTotal: {len(user)} active users\n"
          return report

      def main():
          config = load_config("config.json")
          users = get_users(config)
          report = format_report(users)
          Path("report.txt").write_text(report)
          print("Report generated successfully!")

      if __name__ == "__main__":
          main()
  - path: "config.json"
    content: |
      {
        "users": [
          {"name": "Alice", "email": "alice@co.com", "role": "engineer", "status": "active", "joined": "2024-01-15"},
          {"name": "Bob", "email": "bob@co.com", "role": "designer", "status": "inactive", "joined": "2023-06-01"},
          {"name": "Carol", "email": "carol@co.com", "role": "pm", "status": "active", "joined": "2024-03-20"},
          {"name": "David", "email": "david@co.com", "role": "engineer", "status": "active", "joined": "2024-07-10"}
        ]
      }
---

# Task: Debug & Fix Broken Code

## Prompt

The file `app.py` has several bugs. Find and fix ALL of them, then run the script to verify it works. The script should generate a `report.txt` file when run correctly.

## Expected Behavior

The agent should find and fix these bugs:

1. **Line 7**: `open(path 'r')` → missing comma → `open(path, 'r')`
2. **Line 15**: `active.apped(user)` → typo → `active.append(user)`
3. **Line 25**: `len(user)` → wrong variable → `len(users)` (should be the list, not the loop variable)

After fixing, the agent should run the script and verify that `report.txt` is created with the correct content (3 active users: Alice, Carol, David).

## Grading Criteria

- [ ] Bug 1 fixed (missing comma in open())
- [ ] Bug 2 fixed (apped → append)
- [ ] Bug 3 fixed (len(user) → len(users))
- [ ] Script runs without errors
- [ ] report.txt is generated
- [ ] report.txt contains correct data (3 active users)

## Automated Checks

```python
def grade(transcript: list, workspace_path: str, meta: dict) -> dict:
    from pathlib import Path
    import ast

    scores = {}
    workspace = Path(workspace_path)

    # Check app.py was fixed
    app_file = workspace / "app.py"
    if not app_file.exists():
        return {k: 0.0 for k in ["syntax_fixed", "append_fixed", "len_fixed", "script_runs", "report_created", "report_correct"]}

    content = app_file.read_text()

    # Bug 1: Check syntax is valid (the comma fix)
    try:
        ast.parse(content)
        scores["syntax_fixed"] = 1.0
    except SyntaxError:
        scores["syntax_fixed"] = 0.0
        # Can't check further if syntax is broken
        scores["append_fixed"] = 0.0
        scores["len_fixed"] = 0.0
        scores["script_runs"] = 0.0
        scores["report_created"] = 0.0
        scores["report_correct"] = 0.0
        return scores

    # Bug 2: Check append is fixed
    scores["append_fixed"] = 1.0 if ".append(" in content and ".apped(" not in content else 0.0

    # Bug 3: Check len(users) is fixed
    scores["len_fixed"] = 1.0 if "len(users)" in content and "len(user)" not in content.replace("len(users)", "") else 0.0

    # Check if report.txt was generated
    report_file = workspace / "report.txt"
    if report_file.exists():
        scores["report_created"] = 1.0
        report_content = report_file.read_text()

        # Check report content
        has_alice = "Alice" in report_content
        has_carol = "Carol" in report_content
        has_david = "David" in report_content
        no_bob = "Bob" not in report_content  # Bob is inactive
        has_total_3 = "Total: 3" in report_content

        correct_count = sum([has_alice, has_carol, has_david, no_bob, has_total_3])
        scores["report_correct"] = correct_count / 5.0
        scores["script_runs"] = 1.0
    else:
        scores["report_created"] = 0.0
        scores["report_correct"] = 0.0
        # Check if they at least tried to run it
        scores["script_runs"] = 0.0

    return scores
```

## Efficiency Baseline

- **Optimal tool calls**: 4
- **Rationale**: 1 read (app.py) + 1 edit (fix bugs) + 1 exec (run script) + 1 read/verify (report.txt) = 4

## Notes

- The bugs are at different levels: syntax error, typo, logic error
- A strong model finds all 3 in one pass. A weak model fixes one, runs, finds the next, iterates.
- Efficiency scoring will reward models that diagnose all bugs before editing.
