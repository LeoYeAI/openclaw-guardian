---
id: X06_instruction_precision
name: Ultra-Precise Instruction Following
category: precision
grading_type: automated
tier: frontier
timeout_seconds: 180
optimal_tool_calls: 1
inject_date: false
workspace_files: []
---

# Task: Ultra-Precise Instruction Following

## Prompt

Write a short story to `story.md` following ALL of these constraints simultaneously:

1. Exactly 5 paragraphs
2. Each paragraph has exactly 3 sentences
3. The first word of each paragraph must start with the letters M, Y, C, L, A (in that order)
4. The story must be about a lighthouse keeper
5. Include exactly one question mark in the entire story (no more, no less)
6. The final sentence must contain the word "horizon"
7. Do not use the word "the" anywhere in the story
8. Every paragraph must contain at least one color word (red, blue, green, gold, silver, etc.)

## Expected Behavior

This tests precise constraint satisfaction — holding 8 constraints in working memory simultaneously while generating creative text. This is where top-tier models dramatically outperform weaker ones.

Key challenges:
- Constraint 3 (acrostic MYCLA) + Constraint 7 (no "the") combine to make natural writing very hard
- Constraint 5 (exactly one question mark) requires global awareness across the whole text
- Constraint 8 (color in every paragraph) is easy individually but hard to track while managing everything else
- Weak models will satisfy 4-5 constraints but violate 2-3 — strong models satisfy all 8

## Grading Criteria

- [ ] File story.md created
- [ ] Exactly 5 paragraphs
- [ ] Each paragraph has exactly 3 sentences
- [ ] First letters spell M-Y-C-L-A
- [ ] Story is about a lighthouse keeper
- [ ] Exactly one question mark
- [ ] No instance of "the" (case-insensitive word match)
- [ ] Each paragraph contains a color word

## Automated Checks

```python
def grade(transcript: list, workspace_path: str, meta: dict) -> dict:
    from pathlib import Path
    import re

    scores = {}
    workspace = Path(workspace_path)
    story = workspace / "story.md"

    if not story.exists():
        return {k: 0.0 for k in ["file_created", "para_count", "sentence_count",
                "acrostic", "topic", "question_marks", "no_the", "colors"]}

    scores["file_created"] = 1.0
    content = story.read_text().strip()

    # Split into paragraphs (non-empty blocks separated by blank lines)
    paragraphs = [p.strip() for p in re.split(r'\n\s*\n', content) if p.strip()]

    # Constraint 1: Exactly 5 paragraphs
    scores["para_count"] = 1.0 if len(paragraphs) == 5 else 0.0

    # Constraint 2: Each paragraph has exactly 3 sentences
    if len(paragraphs) == 5:
        sentence_correct = 0
        for para in paragraphs:
            # Count sentences by splitting on sentence-ending punctuation
            sentences = re.split(r'(?<=[.!?])\s+', para.strip())
            sentences = [s for s in sentences if s.strip()]
            if len(sentences) == 3:
                sentence_correct += 1
        scores["sentence_count"] = sentence_correct / 5.0
    else:
        scores["sentence_count"] = 0.0

    # Constraint 3: Acrostic M-Y-C-L-A
    if len(paragraphs) >= 5:
        expected = ['m', 'y', 'c', 'l', 'a']
        acrostic_correct = 0
        for i, para in enumerate(paragraphs[:5]):
            first_word = para.strip().split()[0] if para.strip() else ""
            if first_word and first_word[0].lower() == expected[i]:
                acrostic_correct += 1
        scores["acrostic"] = acrostic_correct / 5.0
    else:
        scores["acrostic"] = 0.0

    # Constraint 4: About a lighthouse keeper
    content_lower = content.lower()
    lighthouse_words = ["lighthouse", "light house", "keeper", "beacon", "lamp", "tower"]
    scores["topic"] = 1.0 if sum(1 for w in lighthouse_words if w in content_lower) >= 2 else 0.0

    # Constraint 5: Exactly one question mark
    qmark_count = content.count('?')
    scores["question_marks"] = 1.0 if qmark_count == 1 else 0.0

    # Constraint 6: Final sentence contains "horizon" (checked but not scored separately — part of topic/quality)
    # Included in overall quality

    # Constraint 7: No "the" (as a word, not part of other words like "there" or "then")
    the_matches = re.findall(r'\bthe\b', content, re.IGNORECASE)
    scores["no_the"] = 1.0 if len(the_matches) == 0 else 0.0

    # Constraint 8: Color word in each paragraph
    color_words = ["red", "blue", "green", "gold", "golden", "silver", "white", "black",
                   "orange", "purple", "yellow", "crimson", "scarlet", "azure", "indigo",
                   "violet", "amber", "grey", "gray", "ivory", "copper", "bronze", "pink"]
    if len(paragraphs) >= 5:
        color_count = 0
        for para in paragraphs[:5]:
            para_lower = para.lower()
            if any(re.search(r'\b' + c + r'\b', para_lower) for c in color_words):
                color_count += 1
        scores["colors"] = color_count / 5.0
    else:
        scores["colors"] = 0.0

    return scores
```

## Efficiency Baseline

- **Optimal tool calls**: 1
- **Rationale**: 1 write. Pure generation task.

## Notes

- This is designed to be VERY hard for weaker models
- The "no the" constraint combined with natural storytelling is extremely challenging
- The acrostic + sentence count + color tracking requires high simultaneous constraint capacity
- Models with stronger working memory will significantly outperform here
