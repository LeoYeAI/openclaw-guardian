---
id: X01_constraint_satisfaction
name: Constraint Satisfaction Puzzle
category: reasoning
grading_type: automated
tier: frontier
timeout_seconds: 240
optimal_tool_calls: 2
inject_date: false
workspace_files:
  - path: "puzzle.md"
    content: |
      # Office Assignment Puzzle

      A company is assigning 5 people (Alice, Bob, Carol, David, Eve) to 5 offices numbered 1-5 (1 is ground floor, 5 is top floor). Each person gets exactly one office.

      Constraints:
      1. Bob is on a higher floor than Alice.
      2. Carol is on floor 3.
      3. David is not adjacent to Carol (not on floor 2 or 4).
      4. Eve is on a higher floor than David.
      5. Alice is not on floor 1.
      6. Bob is not on the top floor.

      Determine who is in each office. Save your answer to `solution.md` with the assignment AND your step-by-step reasoning showing how you eliminated possibilities.
---

# Task: Constraint Satisfaction Puzzle

## Prompt

Read `puzzle.md` and solve the office assignment puzzle. Save the complete solution with step-by-step reasoning to `solution.md`.

## Expected Behavior

Step-by-step deduction:

1. Carol = Floor 3 (clue 2, direct)
2. David ≠ Floor 2 or 4 (clue 3, adjacent to 3). So David ∈ {1, 5}
3. Eve > David (clue 4). If David = 5, Eve must be > 5, impossible. So David = 1.
4. Eve > David(1), so Eve ∈ {2, 4, 5}. Carol = 3, so Eve ∈ {2, 4, 5}.
5. Alice ≠ Floor 1 (clue 5). David = 1, so this is consistent. Alice ∈ {2, 4, 5}.
6. Bob > Alice (clue 1). Remaining floors for Alice, Bob, Eve: {2, 4, 5}.
7. If Alice = 5, Bob must be > 5, impossible. So Alice ∈ {2, 4}.
8. If Alice = 4, Bob ∈ {5}. Eve gets floor 2. Check: Eve(2) > David(1) ✓. Bob(5) > Alice(4) ✓. All constraints met.
9. If Alice = 2, Bob ∈ {4, 5}. Eve gets the remaining one from {4, 5}.
   - Alice=2, Bob=4, Eve=5: All constraints met.
   - Alice=2, Bob=5, Eve=4: All constraints met.

Three valid solutions:
- **Solution A**: David=1, Alice=2, Carol=3, Bob=4, Eve=5
- **Solution B**: David=1, Alice=2, Carol=3, Eve=4, Bob=5
- **Solution C**: David=1, Eve=2, Carol=3, Alice=4, Bob=5

Wait — the puzzle should have a unique solution. Let me add one more constraint to make it unique.

Actually, all three satisfy all 5 constraints. I need to tighten. Adding constraint 6:

6. Bob is not on floor 5.

With constraint 6:
- Solution A: Bob=4 ✓ → David=1, Alice=2, Carol=3, Bob=4, Eve=5 ✓
- Solution B: Bob=5 ✗
- Solution C: Bob=5 ✗

**Unique solution: David=1, Alice=2, Carol=3, Bob=4, Eve=5**

## Grading Criteria

- [ ] solution.md created
- [ ] Correct assignment: David=1, Alice=2, Carol=3, Bob=4, Eve=5
- [ ] Step-by-step reasoning shown
- [ ] All constraints verified

## Automated Checks

```python
def grade(transcript: list, workspace_path: str, meta: dict) -> dict:
    from pathlib import Path
    import re

    scores = {}
    workspace = Path(workspace_path)
    solution = workspace / "solution.md"

    if not solution.exists():
        return {"file_created": 0.0, "correct_solution": 0.0, "reasoning_shown": 0.0, "constraints_verified": 0.0}

    scores["file_created"] = 1.0
    content = solution.read_text().lower()

    # Check correct assignments
    correct = {
        "david": "1", "alice": "2", "carol": "3", "bob": "4", "eve": "5"
    }
    correct_count = 0
    for person, floor in correct.items():
        # Look for patterns like "David = 1", "David: Floor 1", "1. David", "Floor 1: David"
        patterns = [
            rf'{person}.*(?:floor|office|room)?\s*{floor}',
            rf'{floor}.*{person}',
            rf'{person}.*\b{floor}\b',
        ]
        if any(re.search(p, content) for p in patterns):
            correct_count += 1

    scores["correct_solution"] = correct_count / 5.0

    # Check for reasoning (substantial text)
    word_count = len(content.split())
    scores["reasoning_shown"] = 1.0 if word_count > 100 else (0.5 if word_count > 30 else 0.0)

    # Check if constraints are referenced in reasoning
    constraint_refs = sum(1 for kw in ["constraint", "clue", "rule", "because", "therefore", "since", "adjacent", "higher"] if kw in content)
    scores["constraints_verified"] = min(1.0, constraint_refs / 3.0)

    return scores
```

## Efficiency Baseline

- **Optimal tool calls**: 2
- **Rationale**: 1 read + 1 write. Pure reasoning — no tools needed beyond file I/O.

## Notes

- This puzzle has a UNIQUE solution, verified by enumeration
- The key challenge is systematic constraint propagation, not guessing
- Weak models will try random assignments or make logical errors in the chain
- Strong models will show clean deductive reasoning from constraints to unique solution
