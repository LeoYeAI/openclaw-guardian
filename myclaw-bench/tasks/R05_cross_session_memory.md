---
id: R05_cross_session_memory
name: Cross-Session Memory Persistence
category: memory
grading_type: hybrid
tier: reasoning
timeout_seconds: 300
optimal_tool_calls: 4
inject_date: false
multi_session: true
sessions:
  - id: store
    prompt: |
      Remember this information for me by saving it to `memory/notes.md`:
      - My project is called "Helios" — it's a solar panel optimization platform
      - Launch date: April 15, 2025
      - Lead investor: Sequoia Capital, $4.2M Series A
      - Tech stack: Rust backend, React frontend, deployed on Fly.io
      - Team password for staging: "aurora-borealis-42"
      Confirm when saved.
  - id: same_session_recall
    prompt: |
      What's my project called and who's the lead investor?
  - id: new_session_recall
    new_session: true
    prompt: |
      I previously saved some project information to `memory/notes.md`. Read it and answer:
      1. What's the project name?
      2. What's the launch date?
      3. Who's the lead investor and how much?
      4. What's the tech stack?
      5. What's the staging password?
workspace_files: []
---

# Task: Cross-Session Memory Persistence

## Prompt

See multi-session prompts above.

## Expected Behavior

Session 1: Save all info to `memory/notes.md`
Session 2: Recall project name (Helios) and investor (Sequoia, $4.2M) from context or file
Session 3 (new session): Read the file and answer all 5 questions accurately

## Grading Criteria

- [ ] File memory/notes.md created with all information
- [ ] Same-session recall correct (project + investor)
- [ ] New session reads the file
- [ ] All 5 facts recalled correctly in new session

## Automated Checks

```python
def grade(transcript: list, workspace_path: str, meta: dict) -> dict:
    from pathlib import Path

    scores = {}
    workspace = Path(workspace_path)

    # Check if memory file was created
    memory_file = workspace / "memory" / "notes.md"
    alt_paths = [workspace / "memory/notes.md", workspace / "notes.md"]

    found_file = None
    for p in [memory_file] + alt_paths:
        if p.exists():
            found_file = p
            break

    if found_file:
        scores["file_created"] = 1.0
        content = found_file.read_text().lower()

        facts = {
            "helios": "helios" in content,
            "april_15": "april" in content and "15" in content and "2025" in content,
            "sequoia": "sequoia" in content and "4.2" in content,
            "rust_react": "rust" in content and "react" in content,
            "password": "aurora-borealis-42" in content or "aurora" in content,
        }

        scores["facts_stored"] = sum(facts.values()) / len(facts)
    else:
        scores["file_created"] = 0.0
        scores["facts_stored"] = 0.0

    return scores
```

## LLM Judge Rubric

### Criterion 1: Storage Quality (Weight: 25%)

**Score 1.0**: All 5 facts stored in a well-organized file. Easy to parse later.
**Score 0.5**: Facts stored but poorly organized or some missing.
**Score 0.0**: No file created or empty.

### Criterion 2: Same-Session Recall (Weight: 25%)

**Score 1.0**: Correctly answers both questions without re-reading file.
**Score 0.5**: Answers one correctly.
**Score 0.0**: Wrong or no answer.

### Criterion 3: Cross-Session Recall (Weight: 50%)

**Score 1.0**: Reads file in new session, all 5 facts correct.
**Score 0.8**: 4/5 correct.
**Score 0.6**: 3/5 correct.
**Score 0.4**: 2/5 correct.
**Score 0.0**: Doesn't read file or all wrong.

## Efficiency Baseline

- **Optimal tool calls**: 4
- **Rationale**: Session 1: mkdir + write = 2. Session 2: 0 (from context). Session 3: 1 read + 1 response = 2. Total ≈ 4.
