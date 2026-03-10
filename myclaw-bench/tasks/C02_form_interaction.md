---
id: C02_form_interaction
name: Browser Form Interaction
category: computer_use
grading_type: automated
tier: frontier
timeout_seconds: 300
optimal_tool_calls: 10
inject_date: false
workspace_files:
  - path: "form_test.html"
    content: |
      <!DOCTYPE html>
      <html>
      <head><title>Employee Registration</title>
      <style>
        body { font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; }
        label { display: block; margin-top: 15px; font-weight: bold; }
        input, select, textarea { width: 100%; padding: 8px; margin-top: 5px; box-sizing: border-box; }
        button { margin-top: 20px; padding: 12px 24px; background: #2563eb; color: white; border: none; cursor: pointer; font-size: 16px; }
        .required::after { content: " *"; color: red; }
        #result { margin-top: 20px; padding: 15px; background: #f0f9ff; border: 1px solid #bae6fd; display: none; }
        .error { border-color: red !important; }
      </style>
      </head>
      <body>
        <h1>Employee Registration Form</h1>
        <form id="regForm" onsubmit="return handleSubmit(event)">
          <label class="required" for="fullName">Full Name</label>
          <input type="text" id="fullName" name="fullName" required placeholder="John Smith">

          <label class="required" for="email">Email</label>
          <input type="email" id="email" name="email" required placeholder="john@company.com">

          <label class="required" for="department">Department</label>
          <select id="department" name="department" required>
            <option value="">Select department...</option>
            <option value="engineering">Engineering</option>
            <option value="marketing">Marketing</option>
            <option value="sales">Sales</option>
            <option value="hr">Human Resources</option>
            <option value="finance">Finance</option>
          </select>

          <label for="startDate">Start Date</label>
          <input type="date" id="startDate" name="startDate">

          <label class="required" for="role">Role/Title</label>
          <input type="text" id="role" name="role" required placeholder="Software Engineer">

          <label for="notes">Additional Notes</label>
          <textarea id="notes" name="notes" rows="3" placeholder="Any special requirements..."></textarea>

          <button type="submit">Register Employee</button>
        </form>

        <div id="result"></div>

        <script>
        function handleSubmit(e) {
          e.preventDefault();
          const form = document.getElementById('regForm');
          const data = new FormData(form);
          const result = {};
          data.forEach((v, k) => result[k] = v);

          // Write result to a hidden element for grading
          const resultDiv = document.getElementById('result');
          resultDiv.style.display = 'block';
          resultDiv.innerHTML = '<h3>✅ Registration Successful!</h3><pre id="formData">' + JSON.stringify(result, null, 2) + '</pre>';

          // Also write to a file via creating a downloadable blob
          const blob = new Blob([JSON.stringify(result, null, 2)], {type: 'application/json'});
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'registration_result.json';
          a.id = 'downloadLink';
          document.body.appendChild(a);

          return false;
        }
        </script>
      </body>
      </html>
---

# Task: Browser Form Interaction

## Prompt

Open the HTML form at `form_test.html` in the browser and fill it out with this information:

- Name: Sarah Chen
- Email: sarah.chen@techcorp.com
- Department: Engineering
- Start Date: 2025-03-15
- Role: Senior Software Engineer
- Notes: Remote worker, needs VPN access

Submit the form, then take a screenshot to confirm it was submitted successfully. Save the confirmation details to `submission_result.md`.

## Expected Behavior

The agent must:

1. Open the local HTML file in the browser
2. Navigate the form visually (identify fields by label)
3. Fill in each field with the correct data
4. Select "Engineering" from the dropdown
5. Click the Submit button
6. Verify the success message appeared
7. Save the result

This tests:
- Browser navigation to local files
- Form field identification and interaction
- Dropdown/select element handling
- Button clicking
- Visual verification of submission success
- Multi-step browser interaction sequence

## Grading Criteria

- [ ] Browser opened the HTML file
- [ ] Name field filled correctly
- [ ] Email field filled correctly
- [ ] Department dropdown selected correctly
- [ ] Role field filled correctly
- [ ] Form submitted (submit button clicked)
- [ ] Success confirmation captured
- [ ] submission_result.md created

## Automated Checks

```python
def grade(transcript: list, workspace_path: str, meta: dict) -> dict:
    from pathlib import Path
    import json

    scores = {}
    workspace = Path(workspace_path)

    # Check if browser was used
    browser_actions = []
    for event in transcript:
        if event.get("type") != "message":
            continue
        msg = event.get("message", {})
        if msg.get("role") == "assistant":
            for item in msg.get("content", []):
                if item.get("type") == "toolCall":
                    name = item.get("name", "")
                    if name in ["browser", "computer"]:
                        browser_actions.append(item.get("params", {}))

    scores["browser_used"] = 1.0 if len(browser_actions) >= 3 else (len(browser_actions) / 3.0 if browser_actions else 0.0)

    # Check submission result file
    result_file = workspace / "submission_result.md"
    if result_file.exists():
        scores["result_saved"] = 1.0
        content = result_file.read_text().lower()

        # Check if correct data is captured
        scores["name_correct"] = 1.0 if "sarah" in content and "chen" in content else 0.0
        scores["email_correct"] = 1.0 if "sarah.chen@techcorp.com" in content else 0.0
        scores["dept_correct"] = 1.0 if "engineering" in content else 0.0
        scores["role_correct"] = 1.0 if "senior software engineer" in content else 0.0
        scores["submitted"] = 1.0 if any(w in content for w in ["success", "submitted", "registered", "confirmed", "✅"]) else 0.0
    else:
        for k in ["result_saved", "name_correct", "email_correct", "dept_correct", "role_correct", "submitted"]:
            scores[k] = 0.0

    return scores
```

## Efficiency Baseline

- **Optimal tool calls**: 10
- **Rationale**: 1 open + 6 field fills (name, email, dept, date, role, notes) + 1 submit + 1 screenshot/verify + 1 write ≈ 10

## Notes

- The HTML file is self-contained — no external dependencies
- The form has client-side validation (required fields)
- The success message displays the submitted data as JSON
- This tests the full loop: see form → fill fields → submit → verify → report
