---
id: F08_email_draft
name: Professional Email Draft
category: writing
grading_type: llm_judge
tier: foundation
timeout_seconds: 180
optimal_tool_calls: 1
inject_date: false
workspace_files: []
---

# Task: Professional Email Draft

## Prompt

Write a professional email declining a meeting request due to a schedule conflict. Offer to reschedule for the following week. Save it to `email_draft.txt`.

## Expected Behavior

Create a well-structured email with greeting, clear decline with reason, reschedule offer, and professional closing. Concise — 50-150 words.

## Grading Criteria

- [ ] File created
- [ ] Has proper email structure (greeting, body, closing)
- [ ] Clearly declines the meeting
- [ ] Mentions schedule conflict
- [ ] Offers to reschedule
- [ ] Professional and polite tone
- [ ] Appropriate length

## LLM Judge Rubric

### Criterion 1: Tone & Professionalism (Weight: 30%)

**Score 1.0**: Consistently professional, polite, courteous. Natural — not stiff, not casual. Expresses appropriate regret.
**Score 0.75**: Generally professional, minor tone issues.
**Score 0.5**: Adequate but slightly off — too abrupt or too apologetic.
**Score 0.25**: Poor tone — rude, overly casual, or inappropriately formal.
**Score 0.0**: Completely unprofessional or missing.

### Criterion 2: Completeness (Weight: 30%)

**Score 1.0**: Clearly declines, gives reason, offers specific reschedule (next week). Unambiguous.
**Score 0.75**: Declines with reason, reschedule offer is vague but present.
**Score 0.5**: Declines but missing reason or reschedule offer.
**Score 0.25**: Unclear about declining or missing multiple elements.
**Score 0.0**: Fails to decline or completely unclear.

### Criterion 3: Structure & Format (Weight: 20%)

**Score 1.0**: Perfect email structure — greeting, body, closing with name. Clean formatting.
**Score 0.75**: Good structure, minor issues.
**Score 0.5**: Basic structure, missing greeting or closing.
**Score 0.25**: Poor structure.
**Score 0.0**: No email structure.

### Criterion 4: Conciseness (Weight: 20%)

**Score 1.0**: 50-150 words. Every sentence earns its place.
**Score 0.75**: 150-200 words. Slightly verbose but still effective.
**Score 0.5**: Over 200 words or under 30. Functional but not optimal.
**Score 0.25**: Way too long (300+) or too short (1-2 sentences).
**Score 0.0**: Missing or unusable.

## Efficiency Baseline

- **Optimal tool calls**: 1
- **Rationale**: 1 write. All content from the model's generation.
