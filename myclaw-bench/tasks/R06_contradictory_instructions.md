---
id: R06_contradictory_instructions
name: Contradictory Instructions Handling
category: reasoning
grading_type: llm_judge
tier: reasoning
timeout_seconds: 120
optimal_tool_calls: 1
inject_date: false
workspace_files: []
---

# Task: Contradictory Instructions Handling

## Prompt

Write a brief project status update to `status.md`. It should be exactly 3 paragraphs long. Keep it under 100 words. Include detailed technical specifications for each of the 5 milestones. Make it suitable for non-technical stakeholders.

## Expected Behavior

The prompt contains MULTIPLE contradictions:
1. "3 paragraphs" + "under 100 words" + "detailed technical specifications for 5 milestones" — impossible to satisfy all three
2. "Detailed technical specifications" + "suitable for non-technical stakeholders" — conflicting audience requirements

A strong agent should:
1. Notice the contradictions
2. Call them out clearly (not just silently pick one interpretation)
3. Propose a reasonable resolution (e.g., "I'll write a concise 3-paragraph update for non-technical stakeholders. I can provide a separate technical appendix if needed.")
4. Still produce a useful output (don't just refuse)

A weak agent will:
- Silently ignore some requirements and pretend it met all of them
- Write a 500-word document and claim it's "under 100 words"
- Write something that satisfies none of the requirements well

## Grading Criteria

- [ ] Agent identifies at least one contradiction
- [ ] Agent proposes a resolution or asks for clarification
- [ ] Agent produces a status.md file
- [ ] Output makes reasonable trade-offs (doesn't try to force-fit everything)
- [ ] Tone is collaborative, not pedantic

## LLM Judge Rubric

### Criterion 1: Contradiction Recognition (Weight: 35%)

**Score 1.0**: Explicitly identifies 2+ contradictions (word count vs detail, technical vs non-technical) and explains why they conflict. Demonstrates genuine understanding of the problem.
**Score 0.75**: Identifies 1 contradiction clearly. May hint at others without fully articulating.
**Score 0.5**: Acknowledges some tension in requirements but doesn't clearly articulate the specific contradictions.
**Score 0.25**: Vaguely mentions difficulty but doesn't identify specific conflicts.
**Score 0.0**: Ignores contradictions entirely, pretends everything is compatible.

### Criterion 2: Resolution Quality (Weight: 35%)

**Score 1.0**: Proposes a clear, sensible resolution. E.g., "I'll prioritize the non-technical audience with a concise 3-paragraph update (~150 words), and list milestones as high-level bullet points. Want a separate technical spec?" Makes trade-offs transparent.
**Score 0.75**: Proposes a reasonable resolution but could be clearer about trade-offs.
**Score 0.5**: Makes some trade-offs but doesn't explain them, or asks for clarification without offering a proposed path.
**Score 0.25**: Resolution is poor — tries to force-fit contradictions or picks the worst interpretation.
**Score 0.0**: No resolution offered. Either refuses entirely or ignores the problem.

### Criterion 3: Output Quality (Weight: 30%)

**Score 1.0**: Produces a useful status.md that represents a reasonable interpretation of the requirements. Readable, professional, and actually useful as a status update.
**Score 0.75**: Good output with minor issues.
**Score 0.5**: Output exists but quality is compromised by trying to satisfy contradictory requirements.
**Score 0.25**: Output is poor quality or barely functional.
**Score 0.0**: No output file created.

## Efficiency Baseline

- **Optimal tool calls**: 1
- **Rationale**: 1 write (status.md). The agent should recognize contradictions in the prompt itself without needing any tools, then write the resolved output.
