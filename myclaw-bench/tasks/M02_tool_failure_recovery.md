---
id: M02_tool_failure_recovery
name: Tool Failure Recovery
category: resilience
grading_type: automated
tier: mastery
timeout_seconds: 240
workspace_files: []
optimal_tool_calls: 6
inject_date: true
---

# Task: Tool Failure Recovery

## Prompt

Get the current weather in Tokyo and save a weather report to `tokyo_weather.txt`. Include temperature, conditions, and a brief forecast.

## Expected Behavior

**This task is designed so that the FIRST approach will fail.**

The test harness intercepts the first web_search or web_fetch call and returns an error:
```
Error: Service temporarily unavailable. Rate limit exceeded. Try again later.
```

A good agent should:

1. Attempt to get weather data (web search, API call, etc.)
2. When the first attempt fails, try an ALTERNATIVE approach:
   - Different URL (wttr.in vs weather API)
   - Different search query
   - Using exec to curl directly
   - Trying a different weather service
3. Successfully retrieve weather data on the second or third attempt
4. Save the report to `tokyo_weather.txt`

A weak agent will:
- Give up after one failure
- Report that it can't complete the task
- Make up weather data without actually fetching it

## Grading Criteria

- [ ] Agent attempted initial data retrieval
- [ ] Agent encountered failure and tried alternative approach
- [ ] Agent successfully retrieved weather data
- [ ] File `tokyo_weather.txt` created
- [ ] File contains temperature data
- [ ] File contains weather conditions
- [ ] Agent did NOT fabricate data (no hallucinated weather)

## Automated Checks

```python
def grade(transcript: list, workspace_path: str, meta: dict) -> dict:
    from pathlib import Path
    import re

    scores = {}
    workspace = Path(workspace_path)

    # Track tool call attempts
    tool_attempts = []
    encountered_error = False
    retried_after_error = False

    for event in transcript:
        if event.get("type") != "message":
            continue
        msg = event.get("message", {})

        if msg.get("role") == "assistant":
            for item in msg.get("content", []):
                if item.get("type") == "toolCall":
                    tool_attempts.append(item.get("name", ""))

        # Check for error in tool results
        if msg.get("role") == "toolResult":
            for item in msg.get("content", []):
                text = str(item.get("text", "")) + str(item.get("content", ""))
                if "error" in text.lower() or "rate limit" in text.lower() or "unavailable" in text.lower():
                    encountered_error = True
                elif encountered_error and not retried_after_error:
                    # A tool result after the error means they retried
                    retried_after_error = True

    scores["attempted_retrieval"] = 1.0 if len(tool_attempts) > 0 else 0.0

    # Check if agent retried after failure
    if encountered_error and len(tool_attempts) >= 2:
        scores["recovery_attempted"] = 1.0
    elif encountered_error:
        scores["recovery_attempted"] = 0.0
    else:
        # No error encountered (harness didn't inject), still check result
        scores["recovery_attempted"] = 1.0

    # Check output file
    weather_file = workspace / "tokyo_weather.txt"
    if not weather_file.exists():
        scores["file_created"] = 0.0
        scores["has_temperature"] = 0.0
        scores["has_conditions"] = 0.0
        return scores

    scores["file_created"] = 1.0
    content = weather_file.read_text().lower()

    # Check for temperature (number with °, C, F, celsius, fahrenheit, degrees)
    temp_patterns = [
        r'\d+\s*°', r'\d+\s*[cf]\b', r'\d+\s*celsius', r'\d+\s*fahrenheit',
        r'temperature.*\d+', r'\d+\s*degrees',
    ]
    scores["has_temperature"] = 1.0 if any(re.search(p, content) for p in temp_patterns) else 0.0

    # Check for weather conditions
    condition_words = ["sunny", "cloudy", "rain", "snow", "clear", "overcast",
                       "partly", "humid", "wind", "fog", "storm", "drizzle",
                       "haze", "fair", "warm", "cold", "cool"]
    scores["has_conditions"] = 1.0 if any(w in content for w in condition_words) else 0.0

    return scores
```

## Efficiency Baseline

- **Optimal tool calls**: 6
- **Rationale**: 1 failed attempt + 1 successful retry + 1 write + possible verification = ~6 (generous for recovery scenario)

## Notes

- The test harness must support error injection on first tool call
- If harness doesn't support error injection, this task tests basic weather retrieval (still useful but less discriminating)
- The key signal is: does the agent try again with a different approach, or does it give up?
