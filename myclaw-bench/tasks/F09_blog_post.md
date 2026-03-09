---
id: F09_blog_post
name: Blog Post Writing
category: writing
grading_type: llm_judge
tier: foundation
timeout_seconds: 300
optimal_tool_calls: 1
inject_date: false
workspace_files: []
---

# Task: Blog Post Writing

## Prompt

Write a 500-word blog post about the benefits of remote work for software developers. Save it to `blog_post.md` with proper markdown formatting (headings, paragraphs).

## Expected Behavior

Create a well-structured, engaging blog post with intro, body sections covering multiple benefits, and conclusion. Approximately 500 words (400-600 acceptable).

## Grading Criteria

- [ ] File created
- [ ] Approximately 500 words (400-600)
- [ ] Clear structure (intro, body, conclusion)
- [ ] Focuses on software developer benefits specifically
- [ ] Uses markdown formatting
- [ ] Covers 3+ distinct benefits
- [ ] Engaging and professional writing

## LLM Judge Rubric

### Criterion 1: Content Quality (Weight: 35%)

**Score 1.0**: Highly relevant to software developers, 4+ distinct benefits with reasoning/examples. Insightful, not generic.
**Score 0.75**: 3-4 benefits, good reasoning. Minor gaps in depth.
**Score 0.5**: 2-3 benefits, somewhat generic. Lacks developer specificity.
**Score 0.25**: 1-2 superficial benefits. Generic "remote work is good" content.
**Score 0.0**: Off-topic or missing.

### Criterion 2: Structure (Weight: 25%)

**Score 1.0**: Clear intro, well-organized body sections, strong conclusion. Logical flow. Good use of markdown headings.
**Score 0.75**: Good structure, minor issues.
**Score 0.5**: Basic structure but weak transitions or organization.
**Score 0.25**: Poor structure, missing key sections.
**Score 0.0**: No structure.

### Criterion 3: Writing Quality (Weight: 25%)

**Score 1.0**: Engaging, clear prose. Professional tone. No grammar errors. Varied sentence structure.
**Score 0.75**: Good writing, minor issues.
**Score 0.5**: Adequate but notable clarity or grammar issues.
**Score 0.25**: Poor writing quality.
**Score 0.0**: Incomprehensible.

### Criterion 4: Word Count (Weight: 15%)

**Score 1.0**: 450-550 words.
**Score 0.75**: 400-600 words.
**Score 0.5**: 300-400 or 600-700.
**Score 0.25**: 200-300 or 700-800.
**Score 0.0**: Under 200 or over 800.

## Efficiency Baseline

- **Optimal tool calls**: 1
- **Rationale**: 1 write.
