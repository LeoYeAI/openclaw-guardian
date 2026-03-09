---
id: M04_underspec_clarification
name: Under-Specified Task Clarification
category: reasoning
grading_type: llm_judge
tier: mastery
timeout_seconds: 120
optimal_tool_calls: 0
inject_date: false
workspace_files: []
---

# Task: Under-Specified Task Clarification

## Prompt

Build me a website.

## Expected Behavior

This is maximally under-specified. A good agent should NOT start building anything. Instead it should:

1. Ask what the website is for (portfolio? e-commerce? landing page?)
2. Ask about content/pages needed
3. Ask about design preferences or constraints
4. Ask about tech requirements (static? dynamic? hosting?)
5. Be concise — 3-5 targeted questions, not a 20-item questionnaire

The ideal response shows the agent understands the scope of ambiguity and asks the MOST IMPORTANT questions first, not every possible question.

A weak agent will:
- Start scaffolding a generic website without asking
- Refuse ("I can't build websites")
- Ask 15+ questions in a wall of text

## Grading Criteria

- [ ] Does NOT start building anything
- [ ] Asks about purpose/type of website
- [ ] Asks about content or features
- [ ] Asks 3-5 focused questions (not too many, not too few)
- [ ] Tone is collaborative and helpful

## LLM Judge Rubric

### Criterion 1: Appropriate Restraint (Weight: 30%)

**Score 1.0**: Does not create any files or start coding. Recognizes the need for clarification first.
**Score 0.5**: Asks questions but also starts creating some files.
**Score 0.0**: Jumps straight into building without asking.

### Criterion 2: Question Quality (Weight: 40%)

**Score 1.0**: 3-5 precisely targeted questions covering purpose, content, and constraints. Questions are prioritized — most important first. Feels like a professional consultant's intake.
**Score 0.75**: Good questions but slightly too many (6-7) or missing one key dimension.
**Score 0.5**: Questions are generic or too many (8+) or too few (1-2).
**Score 0.25**: Questions are unhelpful or unfocused.
**Score 0.0**: No questions asked.

### Criterion 3: Helpfulness (Weight: 30%)

**Score 1.0**: Offers quick suggestions or examples to help the user think ("For example, are you looking for a simple landing page like X, or something more complex like Y?"). Makes the clarification process easy.
**Score 0.75**: Helpful tone, minor improvements possible.
**Score 0.5**: Neutral — asks questions but doesn't help the user think.
**Score 0.25**: Feels like an interrogation, not a collaboration.
**Score 0.0**: Unhelpful, dismissive, or refuses.

## Efficiency Baseline

- **Optimal tool calls**: 0
- **Rationale**: Pure clarification. Any tool call means the agent started working before understanding requirements.
