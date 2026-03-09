---
id: F06_calendar_event
name: Calendar Event Creation (ICS)
category: productivity
grading_type: automated
tier: foundation
timeout_seconds: 120
optimal_tool_calls: 1
inject_date: true
workspace_files: []
---

# Task: Calendar Event Creation

## Prompt

Create an ICS calendar file for a meeting with these details:
- Title: "Q1 Planning Session"
- Date: next Wednesday
- Time: 2:00 PM to 3:30 PM
- Attendees: alice@example.com, bob@example.com
- Location: Conference Room B
- Description: "Review Q1 goals and assign workstreams"

Save it as `planning_session.ics`.

## Expected Behavior

The agent should create a valid ICS file with all specified fields. The `inject_date: true` flag means the harness prepends "Today is [date, day]." to the prompt, so "next Wednesday" is unambiguous.

## Grading Criteria

- [ ] File planning_session.ics created
- [ ] Valid ICS structure (BEGIN:VCALENDAR, BEGIN:VEVENT, etc.)
- [ ] Correct date (next Wednesday from injected date)
- [ ] Correct time (14:00 to 15:30)
- [ ] Both attendees included
- [ ] Location present
- [ ] Summary/title matches
- [ ] Description present

## Automated Checks

```python
def grade(transcript: list, workspace_path: str, meta: dict) -> dict:
    from pathlib import Path
    from datetime import datetime, timedelta
    import re

    scores = {}
    workspace = Path(workspace_path)
    ics_file = workspace / "planning_session.ics"

    if not ics_file.exists():
        return {k: 0.0 for k in [
            "file_created", "valid_ics", "date_correct", "time_correct",
            "attendees_present", "location_present", "title_correct", "description_present"
        ]}

    scores["file_created"] = 1.0
    content = ics_file.read_text()

    # Valid ICS structure
    has_vcalendar = "BEGIN:VCALENDAR" in content and "END:VCALENDAR" in content
    has_vevent = "BEGIN:VEVENT" in content and "END:VEVENT" in content
    scores["valid_ics"] = 1.0 if (has_vcalendar and has_vevent) else 0.0

    # Date check using injected date (not datetime.now!)
    injected = meta.get("injected_date", "")
    if injected:
        try:
            # Parse the injected date to find next Wednesday
            today = datetime.strptime(injected.split(",")[0].strip(), "%Y-%m-%d")
            days_ahead = (2 - today.weekday()) % 7  # Wednesday = 2
            if days_ahead == 0:
                days_ahead = 7
            next_wed = today + timedelta(days=days_ahead)
            expected_date = next_wed.strftime("%Y%m%d")
            scores["date_correct"] = 1.0 if expected_date in content else 0.0
        except (ValueError, IndexError):
            scores["date_correct"] = 0.0
    else:
        # Fallback: at least check for a date-like pattern
        scores["date_correct"] = 0.5 if re.search(r'DTSTART.*\d{8}', content) else 0.0

    # Time check: 14:00 start, 15:30 end
    has_start = bool(re.search(r'DTSTART.*T1400', content))
    has_end = bool(re.search(r'DTEND.*T1530', content))
    scores["time_correct"] = 1.0 if (has_start and has_end) else (0.5 if has_start else 0.0)

    # Attendees
    has_alice = bool(re.search(r'ATTENDEE.*alice@example\.com', content, re.IGNORECASE))
    has_bob = bool(re.search(r'ATTENDEE.*bob@example\.com', content, re.IGNORECASE))
    scores["attendees_present"] = 1.0 if (has_alice and has_bob) else (0.5 if (has_alice or has_bob) else 0.0)

    # Location
    scores["location_present"] = 1.0 if re.search(r'LOCATION.*Conference Room B', content, re.IGNORECASE) else 0.0

    # Title
    scores["title_correct"] = 1.0 if re.search(r'SUMMARY.*Q1 Planning Session', content, re.IGNORECASE) else 0.0

    # Description
    scores["description_present"] = 1.0 if re.search(r'DESCRIPTION.*', content) and len(re.findall(r'DESCRIPTION.*', content)[0]) > 15 else 0.0

    return scores
```

## Efficiency Baseline

- **Optimal tool calls**: 1
- **Rationale**: 1 write (the ICS file). All information is in the prompt.
