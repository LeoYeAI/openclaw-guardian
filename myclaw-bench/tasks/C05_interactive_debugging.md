---
id: C05_interactive_debugging
name: Interactive Browser Debugging
category: computer_use
grading_type: automated
tier: frontier
timeout_seconds: 360
optimal_tool_calls: 10
inject_date: false
workspace_files:
  - path: "buggy_app.html"
    content: |
      <!DOCTYPE html>
      <html>
      <head><title>Todo App</title>
      <style>
        body { font-family: sans-serif; max-width: 500px; margin: 40px auto; padding: 20px; }
        h1 { color: #333; }
        .input-row { display: flex; gap: 10px; margin-bottom: 20px; }
        .input-row input { flex: 1; padding: 10px; font-size: 16px; border: 2px solid #ddd; border-radius: 6px; }
        .input-row button { padding: 10px 20px; font-size: 16px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; }
        .todo-list { list-style: none; padding: 0; }
        .todo-item { display: flex; align-items: center; padding: 12px; border-bottom: 1px solid #eee; }
        .todo-item input[type="checkbox"] { margin-right: 12px; width: 20px; height: 20px; }
        .todo-item.done span { text-decoration: line-through; color: #999; }
        .todo-item .delete { margin-left: auto; color: #ef4444; cursor: pointer; font-size: 18px; border: none; background: none; }
        .stats { margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; }
        .error-msg { color: red; font-size: 14px; margin-top: 5px; display: none; }
      </style>
      </head>
      <body>
        <h1>📝 Todo App</h1>
        <div class="input-row">
          <input type="text" id="todoInput" placeholder="Add a new task...">
          <button onclick="addTodo()">Add</button>
        </div>
        <div class="error-msg" id="errorMsg">Task cannot be empty!</div>
        <ul class="todo-list" id="todoList"></ul>
        <div class="stats" id="stats">No tasks yet.</div>

        <script>
        let todos = [];

        function addTodo() {
          const input = document.getElementById('todoInput');
          const text = input.value;  // BUG 1: Missing .trim(), allows whitespace-only todos

          if (text === '') {  // BUG 2: Only checks empty string, not whitespace
            document.getElementById('errorMsg').style.display = 'block';
            return;
          }

          document.getElementById('errorMsg').style.display = 'none';

          todos.push({ text: text, done: false, id: Date.now() });
          input.value = '';
          renderTodos();
        }

        function toggleTodo(id) {
          const todo = todos.find(t => t.id == id);  // BUG 3: == instead of === (type coercion)
          if (todo) {
            todo.done = !todo.done;
          }
          renderTodos();
        }

        function deleteTodo(id) {
          todos = todos.filter(t => t.id != id);  // BUG 4: Same type coercion issue
          renderTodos();
        }

        function renderTodos() {
          const list = document.getElementById('todoList');
          list.innerHTML = '';

          todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = 'todo-item' + (todo.done ? ' done' : '');
            li.innerHTML = `
              <input type="checkbox" ${todo.done ? 'checked' : ''} onchange="toggleTodo(${todo.id})">
              <span>${todo.text}</span>
              <button class="delete" onclick="deleteTodo(${todo.id})">✕</button>
            `;
            list.appendChild(li);
          });

          updateStats();
        }

        function updateStats() {
          const total = todos.length;
          const done = todos.filter(t => t.done === true).length;
          const remaining = total - done;  // This is correct

          const stats = document.getElementById('stats');
          if (total === 0) {
            stats.textContent = 'No tasks yet.';
          } else {
            // BUG 5: Shows wrong count — says "done" but displays "remaining" count
            stats.textContent = `${total} tasks: ${remaining} completed, ${done} remaining`;
          }
        }

        // BUG 6: Enter key doesn't work to add todos
        // Missing: document.getElementById('todoInput').addEventListener('keypress', ...)
        </script>
      </body>
      </html>
---

# Task: Interactive Browser Debugging

## Prompt

Open `buggy_app.html` in the browser. This is a todo app with several bugs. Your job:

1. Open the app and try using it — add some todos, check them off, delete one
2. Identify ALL the bugs you encounter through interaction
3. Fix the bugs in the HTML file
4. Verify your fixes by opening the fixed version and testing again
5. Write a bug report to `bug_report.md` listing each bug found, how you discovered it, and how you fixed it

## Expected Behavior

The app has 6 intentional bugs:

1. **Whitespace todo**: Can add todos that are just spaces (missing .trim())
2. **Empty check incomplete**: Only checks `=== ''`, not whitespace-only strings
3. **Type coercion in toggle**: Uses `==` instead of `===` (works but is a latent bug)
4. **Type coercion in delete**: Same issue
5. **Stats display swapped**: Says "X completed, Y remaining" but the numbers are backwards — shows `remaining` as completed and `done` as remaining
6. **Enter key doesn't work**: No keypress event listener on the input

A strong model should find bugs 1, 5, and 6 through interaction (they're user-visible). Bugs 3 and 4 require code inspection (they work but are incorrect). Bug 2 is related to bug 1.

The key differentiator: **Bug 5 (swapped stats) can only be found by USING the app** — the model must add a todo, complete it, and notice the stats are wrong. This requires the model to actually understand what it's seeing in the browser, not just read code.

## Grading Criteria

- [ ] Browser opened and app interacted with
- [ ] Bug report created
- [ ] Whitespace bug found (#1 or #2)
- [ ] Stats swap bug found (#5) — requires visual interaction
- [ ] Enter key bug found (#6) — requires trying it
- [ ] Bugs fixed in the HTML file
- [ ] Fixed version verified via browser

## Automated Checks

```python
def grade(transcript: list, workspace_path: str, meta: dict) -> dict:
    from pathlib import Path
    import re

    scores = {}
    workspace = Path(workspace_path)

    # Check browser interaction
    browser_calls = 0
    for event in transcript:
        if event.get("type") != "message":
            continue
        msg = event.get("message", {})
        if msg.get("role") == "assistant":
            for item in msg.get("content", []):
                if item.get("type") == "toolCall" and item.get("name", "") in ["browser", "computer"]:
                    browser_calls += 1
    scores["browser_interaction"] = 1.0 if browser_calls >= 3 else (browser_calls / 3.0)

    # Check bug report
    report = workspace / "bug_report.md"
    if not report.exists():
        return {**scores, **{k: 0.0 for k in ["report_created", "whitespace_bug", "stats_bug", "enter_bug", "code_fixed", "bugs_total"]}}

    scores["report_created"] = 1.0
    content = report.read_text().lower()

    # Check specific bugs found
    scores["whitespace_bug"] = 1.0 if any(w in content for w in ["whitespace", "trim", "empty space", "blank", "spaces"]) else 0.0
    scores["stats_bug"] = 1.0 if any(w in content for w in ["swap", "reversed", "wrong count", "stats", "completed.*remaining", "remaining.*completed", "mixed up", "backward"]) else 0.0
    scores["enter_bug"] = 1.0 if any(w in content for w in ["enter", "keypress", "key press", "keyboard", "return key"]) else 0.0

    # Count total bugs found
    bug_indicators = ["bug", "issue", "problem", "fix", "error", "defect"]
    # Count numbered items or bullet points that describe bugs
    bug_count = len(re.findall(r'(?:^|\n)\s*(?:\d+[\.\)]|[-*])\s+.*(?:bug|issue|fix|problem)', content))
    if bug_count == 0:
        bug_count = sum(1 for b in bug_indicators if b in content)
    scores["bugs_total"] = min(1.0, bug_count / 4.0)  # Finding 4+ bugs is excellent

    # Check if code was fixed
    html_file = workspace / "buggy_app.html"
    if html_file.exists():
        html_content = html_file.read_text()
        has_trim = ".trim()" in html_content
        has_stats_fix = "done" in html_content.split("stats.textContent")[1] if "stats.textContent" in html_content else False
        has_enter = "keypress" in html_content or "keydown" in html_content or "addEventListener" in html_content
        fix_count = sum([has_trim, has_enter])
        scores["code_fixed"] = min(1.0, fix_count / 2.0)
    else:
        scores["code_fixed"] = 0.0

    return scores
```

## Efficiency Baseline

- **Optimal tool calls**: 10
- **Rationale**: Open app + interact (3-4 actions) + read code + edit code + reopen fixed version + verify + write report ≈ 10

## Notes

- Bug #5 (stats swap) is THE key test — it can only be found through visual interaction
- A model that only reads the code might find bugs 1-4 and 6 but miss #5 unless it runs the app
- A model that only uses the browser might find #1, #5, #6 but miss #3, #4
- The best score comes from combining both: visual interaction + code review
