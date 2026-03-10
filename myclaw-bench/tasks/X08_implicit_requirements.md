---
id: X08_implicit_requirements
name: Implicit Requirements Discovery
category: reasoning
grading_type: llm_judge
tier: frontier
timeout_seconds: 240
optimal_tool_calls: 2
inject_date: false
workspace_files:
  - path: "ticket.md"
    content: |
      # Feature Request: Add CSV Export

      **Reporter:** Sales Team Lead
      **Priority:** High
      **Description:**

      We need a CSV export button on the customer list page. When clicked, it should download a CSV of all customers.

      Thanks!
---

# Task: Implicit Requirements Discovery

## Prompt

Read the feature request in `ticket.md`. Before implementing anything, write a technical spec to `spec.md` that covers what the ticket SAYS and what it DOESN'T SAY but should have. Identify every implicit requirement and hidden decision that needs to be made.

## Expected Behavior

The ticket is deliberately sparse — a 2-sentence feature request. A strong model recognizes that a seemingly simple request hides at least 10-15 implicit decisions:

**What the ticket doesn't say (but must be decided):**

1. **Which columns?** The customer table might have 20+ columns. Export all? Configurable?
2. **Filters applied?** If the user has filters active, does the export respect them or export ALL customers?
3. **Pagination?** If showing page 2 of 50, does it export just that page or everything?
4. **Data format:** Date formats? Number formatting? Encoding (UTF-8 with BOM for Excel compatibility)?
5. **PII handling:** Customer emails, phone numbers, addresses — should these be included? GDPR/compliance implications?
6. **Permission model:** Can every user export, or only admins? Is there an audit trail?
7. **Row limit:** What if there are 500K customers? Memory, timeout, file size issues.
8. **File naming:** `customers.csv`? `customers_2024-01-15.csv`? `customers_filtered_by_region.csv`?
9. **Real-time vs snapshot:** Does the export reflect the exact moment of click, or could it be stale?
10. **Progress indication:** For large exports, show a loading spinner? Email the file? Background job?
11. **Error handling:** What if the export fails halfway through?
12. **i18n:** Column headers in user's language or English?
13. **Rate limiting:** Prevent abuse (someone clicking export 100 times)?
14. **Existing patterns:** Does the app already have export elsewhere? Should this match that UX?

**Why this tests top-tier models:**
- Weak models take the ticket at face value and write a trivial spec ("add button, generate CSV")
- Medium models find 3-5 implicit requirements
- Strong models find 8+ and organize them by priority/risk
- Strong models will also prioritize which decisions to make now vs. defer, and suggest sensible defaults

## Grading Criteria

- [ ] spec.md created
- [ ] Identifies column selection as an open question
- [ ] Identifies filter/pagination behavior
- [ ] Addresses PII/permission concerns
- [ ] Addresses large dataset handling (scale)
- [ ] Identifies 8+ implicit requirements total
- [ ] Proposes sensible defaults (not just a list of questions)
- [ ] Organized by priority or category

## LLM Judge Rubric

### Criterion 1: Requirement Discovery Depth (Weight: 40%)

**Score 1.0**: Identifies 10+ implicit requirements across multiple dimensions: data scope (columns, filters, pagination), security (PII, permissions, audit), performance (row limits, async), UX (naming, progress, errors), and compliance. Shows systematic thinking — not random brainstorming.
**Score 0.75**: 7-9 requirements across 3+ dimensions. Good coverage with minor gaps.
**Score 0.5**: 4-6 requirements, mostly obvious ones (columns, permissions). Misses performance and UX implications.
**Score 0.25**: 2-3 requirements. Takes the ticket mostly at face value.
**Score 0.0**: No implicit requirements identified. Just restates the ticket.

### Criterion 2: Prioritization & Decision-Making (Weight: 35%)

**Score 1.0**: Doesn't just list questions — proposes sensible defaults ("export respects active filters by default, with option for full export"), identifies which decisions are blocking vs. deferrable, and flags the highest-risk items (PII, scale). Shows product thinking, not just engineering thinking.
**Score 0.75**: Good defaults proposed for most items, minor gaps in prioritization.
**Score 0.5**: Lists questions but doesn't propose answers or prioritize.
**Score 0.25**: Random list without structure or prioritization.
**Score 0.0**: No decision-making evident.

### Criterion 3: Spec Quality (Weight: 25%)

**Score 1.0**: Spec is structured like a real technical document — sections, clear decisions, implementation notes, and open questions separated from decided items. A developer could start implementing from this.
**Score 0.75**: Good structure, minor gaps.
**Score 0.5**: Content is there but poorly organized.
**Score 0.25**: More like a brainstorm than a spec.
**Score 0.0**: Not a usable document.

## Efficiency Baseline

- **Optimal tool calls**: 2
- **Rationale**: 1 read + 1 write = 2
