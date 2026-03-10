---
id: X03_strategic_reasoning
name: Strategic Reasoning Under Uncertainty
category: reasoning
grading_type: llm_judge
tier: frontier
timeout_seconds: 300
optimal_tool_calls: 2
inject_date: false
workspace_files:
  - path: "scenario.md"
    content: |
      # Strategic Decision: Market Entry

      You are advising a SaaS startup (ARR $5M, 40 employees) considering entering the Japanese market. Here is the information available:

      ## What We Know
      - Our product is a B2B project management tool (like Asana/Monday.com)
      - Current markets: US (70%), UK (20%), Germany (10%)
      - Japan is the 3rd largest SaaS market globally ($12B in 2024)
      - Our product has no Japanese localization yet
      - Two competitors entered Japan last year: CompA localized fully and has 200 customers; CompB used English-only and has 15 customers
      - Japanese enterprise sales cycles average 6-9 months (vs 2-3 months in US)
      - A local partner (TechBridge Inc.) has offered a distribution deal: they handle sales/support for 30% revenue share
      - We would need to hire 3 people minimum for Japan: 1 PM, 1 engineer, 1 support. Estimated cost: $450K/year
      - Our current runway: 18 months at current burn rate

      ## What We Don't Know
      - Whether our product's workflow fits Japanese business culture
      - TechBridge's actual track record (they claim 50 enterprise clients)
      - If the $12B market figure includes our product category or adjacent ones
      - Whether regulatory requirements (data residency, etc.) apply
      - Our competitors' Japan revenue numbers

      ## The Question
      Should we enter Japan? If yes, how? If no, why not, and what would change your mind?

      CEO wants your recommendation in a 1-page memo.
---

# Task: Strategic Reasoning Under Uncertainty

## Prompt

Read `scenario.md` and write a strategic recommendation memo to `recommendation.md`. The CEO wants a clear yes/no/conditional recommendation with reasoning. You MUST address:

1. Your recommendation and confidence level
2. The 3 most important unknowns and how to resolve each
3. What would make you change your recommendation
4. If yes: phased entry plan. If no: trigger conditions for revisiting.

Keep it under 500 words.

## Expected Behavior

This tests strategic thinking under genuine uncertainty — NOT just summarizing the data.

A strong analysis should:
- Give a CONDITIONAL recommendation (not a flat yes/no — too much is unknown)
- Identify that the CompA vs CompB comparison is the strongest signal (localization matters)
- Flag runway risk: $450K/year is 25% of remaining runway at current rate
- Question TechBridge: 30% rev share is steep, but verify their 50 clients first
- Propose a validation-first approach: resolve the unknowns BEFORE committing $450K
- Suggest concrete next steps: visit Japan, talk to CompA's customers, verify TechBridge, test localization with 5 pilot customers
- Identify what would kill the plan: if Japanese workflow culture is fundamentally incompatible (e.g., they need nemawashi/ringi-style approval flows our tool doesn't support)

A weak analysis will:
- Just list pros and cons without making a decision
- Recommend "yes" because "Japan is a big market" (ignoring unknowns)
- Ignore the runway constraint entirely
- Not address the cultural fit question
- Give generic advice ("do market research") without specifics

## Grading Criteria

- [ ] recommendation.md created
- [ ] Clear recommendation with stated confidence level
- [ ] Addresses unknowns with specific resolution steps
- [ ] Considers runway/financial risk
- [ ] Addresses cultural fit question
- [ ] Under 500 words
- [ ] Actionable next steps

## LLM Judge Rubric

### Criterion 1: Quality of Reasoning Under Uncertainty (Weight: 40%)

**Score 1.0**: Demonstrates sophisticated reasoning: distinguishes known from unknown, identifies which unknowns are decision-critical vs. nice-to-know, suggests low-cost ways to resolve unknowns before committing. Shows awareness that a $5M ARR company can't afford a wrong $450K bet. The CompA/CompB comparison is used as evidence, not just mentioned. Cultural fit is treated as a make-or-break factor, not a checkbox.
**Score 0.75**: Good reasoning, addresses most factors but misses one critical dimension (e.g., runway risk or cultural fit).
**Score 0.5**: Lists pros/cons adequately but reasoning stays surface level. Treats all unknowns as equal.
**Score 0.25**: Basic SWOT-style analysis without genuine strategic thinking.
**Score 0.0**: No meaningful analysis.

### Criterion 2: Decision Quality (Weight: 30%)

**Score 1.0**: Makes a defensible recommendation (likely conditional: "Yes, but validate first" or "Not yet — resolve X, Y, Z then revisit"). States confidence level honestly. Provides specific trigger conditions for changing the recommendation. Not a hedge — commits to a position while being honest about uncertainty.
**Score 0.75**: Good recommendation but slightly hedged or missing reversibility conditions.
**Score 0.5**: Makes a recommendation but it's weakly supported or too hedged to be useful.
**Score 0.25**: Refuses to commit or gives contradictory advice.
**Score 0.0**: No recommendation.

### Criterion 3: Actionability (Weight: 30%)

**Score 1.0**: CEO could literally forward this memo and say "do this." Next steps are specific, time-bound, and resource-aware. Includes who does what and what the decision milestones are.
**Score 0.75**: Mostly actionable, minor gaps in specificity.
**Score 0.5**: Contains recommendations but they're too vague to execute.
**Score 0.25**: Generic advice.
**Score 0.0**: Not actionable.

## Efficiency Baseline

- **Optimal tool calls**: 2
- **Rationale**: 1 read + 1 write.
