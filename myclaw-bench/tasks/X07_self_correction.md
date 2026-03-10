---
id: X07_self_correction
name: Self-Correction & Metacognition
category: reasoning
grading_type: hybrid
tier: frontier
timeout_seconds: 300
optimal_tool_calls: 3
inject_date: false
workspace_files:
  - path: "problem.md"
    content: |
      # Math Problem

      A farmer has a field that is 120 meters long and 80 meters wide. He wants to build a fence around the entire field, plus a fence dividing the field into two equal halves lengthwise (parallel to the 120m side). Fence posts must be placed every 4 meters along every fence line, including at corners and endpoints.

      How many fence posts does he need in total?

      Save your complete solution with step-by-step work to `solution.md`.
---

# Task: Self-Correction & Metacognition

## Prompt

Read `problem.md` and solve the math problem. Show ALL your work step by step. After solving, VERIFY your answer by checking it with a different method. If your verification reveals an error, correct it. Save everything to `solution.md`.

## Expected Behavior

This tests whether the model can:
1. Solve a multi-step geometry/counting problem
2. **Catch its own mistakes** by verifying with an alternative method
3. Show metacognitive awareness

**The correct solution:**

Fence layout:
- Perimeter: 120 + 80 + 120 + 80 = 400 meters
- Dividing fence: 80 meters (parallel to the 80m side, dividing lengthwise)
  - Wait — "dividing into two halves lengthwise, parallel to the 120m side" means the divider runs ALONG the 120m direction, so it's 120m? No — "parallel to the 120m side" means the divider IS parallel to the long sides, so it runs 120m? Actually: "dividing lengthwise parallel to the 120m side" — the divider is parallel to the 120m sides and splits the 80m width in half. So the divider is 120m long, running through the middle.
  
  Actually let me re-read: "dividing the field into two equal halves lengthwise (parallel to the 120m side)." Lengthwise = along the length = the divider runs parallel to the 120m side. If the field is 120m × 80m, a divider parallel to the 120m side runs the length of the field = 120m, splitting the 80m width into 40m + 40m.

Total fence: 400m (perimeter) + 120m (divider) = 520m

Fence posts every 4 meters:
- The two 120m sides: 120/4 = 30 intervals = 31 posts each = 62 posts
- The two 80m sides: 80/4 = 20 intervals = 21 posts each = 42 posts  
- The dividing fence: 120/4 = 30 intervals = 31 posts

BUT posts are shared at corners and where the divider meets the perimeter:
- 4 corner posts are shared between adjacent sides (already counted in both)
  - Each corner is counted in two sides, so subtract 4
- The divider's 2 endpoints touch the 80m sides — those posts are already counted
  - Subtract 2

Total naive: 62 + 42 + 31 = 135
Minus shared corners: 135 - 4 = 131
Minus divider endpoints shared with perimeter: 131 - 2 = 129

**Answer: 129 fence posts**

The KEY test: most models get tripped up on the shared posts (double-counting at corners and where the divider meets the perimeter). A strong model will either:
1. Get it right on the first pass, OR
2. Get it wrong, verify, catch the error, and correct it

A weak model will get it wrong and not notice.

## Grading Criteria

- [ ] solution.md created
- [ ] Shows step-by-step work
- [ ] Correctly identifies perimeter length (400m)
- [ ] Correctly identifies divider length (120m)
- [ ] Accounts for shared/overlapping posts
- [ ] Reaches correct answer (129) — OR shows self-correction
- [ ] Includes verification step
- [ ] If error found in verification, corrects it

## Automated Checks

```python
def grade(transcript: list, workspace_path: str, meta: dict) -> dict:
    from pathlib import Path
    import re

    scores = {}
    workspace = Path(workspace_path)
    solution = workspace / "solution.md"

    if not solution.exists():
        return {k: 0.0 for k in ["file_created", "shows_work", "correct_perimeter",
                "correct_divider", "handles_sharing", "correct_answer", "has_verification", "self_correction"]}

    scores["file_created"] = 1.0
    content = solution.read_text()
    content_lower = content.lower()

    # Shows work
    scores["shows_work"] = 1.0 if len(content) > 300 else (0.5 if len(content) > 100 else 0.0)

    # Perimeter = 400
    scores["correct_perimeter"] = 1.0 if "400" in content else 0.0

    # Divider = 120m
    # Check that they identified the divider as 120m (not 80m — common mistake)
    scores["correct_divider"] = 1.0 if re.search(r'divid.*120|120.*divid|middle.*120|120.*middle', content_lower) else 0.0

    # Handles shared posts
    sharing_words = ["shared", "overlap", "corner", "double.count", "already counted", "subtract", "intersection", "common", "meet"]
    scores["handles_sharing"] = 1.0 if sum(1 for w in sharing_words if w in content_lower) >= 2 else 0.0

    # Correct answer: 129
    # Also accept 131 (forgot divider endpoint sharing) with partial credit
    if "129" in content:
        scores["correct_answer"] = 1.0
    elif "131" in content:
        scores["correct_answer"] = 0.7  # Got corner sharing but not divider endpoints
    elif "135" in content:
        scores["correct_answer"] = 0.3  # Got the raw count but no sharing adjustment
    else:
        scores["correct_answer"] = 0.0

    # Has verification
    verify_words = ["verify", "verif", "check", "double.check", "alternative", "let me confirm",
                    "cross.check", "make sure", "validate", "second method"]
    scores["has_verification"] = 1.0 if any(re.search(w, content_lower) for w in verify_words) else 0.0

    # Self-correction (bonus): did they find and fix their own error?
    correction_words = ["actually", "wait", "correction", "i made an error", "mistake",
                       "let me recalculate", "revise", "that's wrong", "reconsider",
                       "i need to correct", "upon reflection", "re-examining"]
    scores["self_correction"] = 1.0 if any(w in content_lower for w in correction_words) else 0.0

    return scores
```

## LLM Judge Rubric

### Criterion 1: Mathematical Reasoning (Weight: 50%)

**Score 1.0**: Correct answer (129) with clear, logical work shown. Correctly identifies all fence segments, calculates posts per segment, and accounts for all shared posts at corners and divider junctions.
**Score 0.75**: Answer is 129 or within 2, with minor work gaps. Or answer is wrong but self-corrected.
**Score 0.5**: Shows understanding of the problem but makes a counting error. Partial shared-post handling.
**Score 0.25**: Gets perimeter right but fails on divider or shared posts.
**Score 0.0**: Completely wrong or no meaningful attempt.

### Criterion 2: Metacognitive Quality (Weight: 50%)

**Score 1.0**: Genuinely verifies using a different method (not just restating the same calculation). If verification reveals a discrepancy, correctly identifies and fixes the error. Shows awareness of where mistakes are likely (e.g., "posts are easy to double-count at corners").
**Score 0.75**: Includes verification but it's the same method restated, or verification is perfunctory.
**Score 0.5**: Mentions checking but doesn't actually do it meaningfully.
**Score 0.25**: No verification despite being asked.
**Score 0.0**: No metacognitive awareness.

## Efficiency Baseline

- **Optimal tool calls**: 3
- **Rationale**: 1 read + 1 write + optional exec (calculator) = 2-3

## Notes

- The problem is designed to have a common error path (forgetting shared posts)
- The REAL test is: does the model catch this error through verification?
- Self-correction is REWARDED, not penalized — a model that gets it wrong then fixes it scores higher than one that gets it wrong and doesn't notice
- This tests a model's metacognitive capabilities — the ability to evaluate and revise its own reasoning
