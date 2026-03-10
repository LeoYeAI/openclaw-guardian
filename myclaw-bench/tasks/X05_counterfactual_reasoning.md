---
id: X05_counterfactual_reasoning
name: Counterfactual Business Reasoning
category: reasoning
grading_type: llm_judge
tier: frontier
timeout_seconds: 240
optimal_tool_calls: 2
inject_date: false
workspace_files:
  - path: "postmortem.md"
    content: |
      # Product Launch Postmortem — "ProSync" Mobile App

      ## Timeline
      - **Month 1-3**: Built iOS app. Team of 4 engineers.
      - **Month 4**: CEO insisted on adding Android before iOS launch. 2 engineers moved to Android.
      - **Month 5**: iOS quality dropped. 43 open bugs. Launch pushed back.
      - **Month 6**: Competitor ("FlowTask") launched mobile app. Got TechCrunch coverage.
      - **Month 7**: We launched iOS + Android simultaneously. Both had issues.
      - **Month 8**: App Store rating: 2.8 stars. Android: 2.3 stars.
      - **Month 9**: 60% of early users churned within 30 days.
      - **Month 10**: Board meeting. Discussion about shutting down mobile.

      ## Metrics at Launch
      - 5,200 downloads first week (target was 15,000)
      - 23% Day-1 retention (industry avg: 25%)
      - 8% Day-7 retention (industry avg: 12%)
      - 142 1-star reviews mentioning crashes
      - Support tickets: 340 in first week

      ## Team Feedback
      - iOS lead: "We needed 2 more months for iOS. Splitting the team killed quality."
      - Android lead: "We shipped an MVP that wasn't ready. Users judged us on v0.5."
      - Designer: "The Android version looked like a bad iOS port. We didn't adapt for Material Design."
      - CEO: "We had to ship both at once. Launching iOS-only would have looked weak."
      - VP Sales: "Three enterprise deals ($380K total) fell through because the app was buggy."

      ## Current State
      - App store ratings recovering slowly (3.2 iOS, 2.9 Android)
      - Mobile team reduced to 3 engineers (1 quit citing burnout)
      - $180K spent on mobile to date
      - Board considering: (A) double down on mobile, (B) sunset and focus on web
---

# Task: Counterfactual Business Reasoning

## Prompt

Read `postmortem.md` and write `counterfactual_analysis.md` answering:

1. **The counterfactual**: If the CEO had NOT insisted on adding Android (Month 4), what would likely have happened? Trace the alternate timeline step by step.
2. **The real mistake**: Was the decision to add Android the root cause, or a symptom of a deeper problem? What's the ACTUAL root cause?
3. **Board recommendation**: Given where they are NOW (Month 10), should they choose Option A or B? This is NOT the same question as "what should they have done."
4. **The $380K question**: Were those enterprise deals really lost because of the app, or is that a convenient narrative? What evidence supports or undermines this claim?

## Expected Behavior

This tests the ability to reason counterfactually — not just analyze what happened, but reason about what WOULD have happened under different conditions.

**Strong analysis should include:**

1. **Counterfactual timeline**:
   - Without Android split: 4 engineers stay on iOS → likely launch Month 5 or 6 with fewer bugs → BEFORE FlowTask (Month 6) → would have gotten first-mover coverage → higher quality = better ratings → better retention
   - But: still would have faced "iOS only" perception risk the CEO worried about
   - Net: probably significantly better outcome, but not guaranteed success

2. **Root cause is deeper than the Android decision**:
   - The CEO's reasoning ("launching iOS-only would look weak") reveals a competitive-reaction mindset rather than a quality-first mindset
   - The team was 4 engineers — too small for multi-platform from the start
   - The real root cause: attempting a mobile launch with insufficient resources, compounded by a decision-maker who prioritized optics over quality

3. **Board recommendation (NOW, not in hindsight)**:
   - This is the hardest part. The sunk cost ($180K) is irrelevant.
   - What matters: is the mobile product fixable with 3 engineers? At what cost and timeline?
   - Ratings recovering (3.2) is a positive signal
   - But: 60% churn, 1 engineer quit, team demoralized
   - Likely answer: conditional — invest 3 more months, set a clear quality bar (4.0+ rating), if not met by Month 13, sunset

4. **The $380K narrative**:
   - VP Sales' claim is self-serving (shifts blame from sales to product)
   - The deals may have fallen through for other reasons (pricing, competition, timing)
   - But the app ratings are publicly visible — enterprise buyers DO check
   - Verdict: app quality was likely A factor, but probably not THE factor

## Grading Criteria

- [ ] counterfactual_analysis.md created
- [ ] Counterfactual timeline constructed step-by-step
- [ ] Root cause analysis goes deeper than "the CEO was wrong"
- [ ] Board recommendation addresses current reality, not hindsight
- [ ] $380K claim critically examined
- [ ] Analysis shows genuine reasoning, not just summarizing

## LLM Judge Rubric

### Criterion 1: Counterfactual Quality (Weight: 30%)

**Score 1.0**: Constructs a plausible alternate timeline with specific milestones. Acknowledges both what would have improved AND what risks remained. Shows understanding of path-dependent outcomes. Considers the CEO's concern as legitimate even if the decision was wrong.
**Score 0.75**: Good counterfactual but doesn't acknowledge remaining risks in the alternate path.
**Score 0.5**: Basic "if they hadn't split, things would be better" without specifics.
**Score 0.25**: Doesn't construct a real counterfactual.
**Score 0.0**: Missing.

### Criterion 2: Root Cause Depth (Weight: 25%)

**Score 1.0**: Identifies that the Android decision was a SYMPTOM of deeper issues: undersized team, reactive decision-making, optics-over-quality culture. Connects the CEO's reasoning pattern to the organizational failure.
**Score 0.75**: Goes one level deeper than "CEO was wrong" but doesn't reach organizational root.
**Score 0.5**: Just blames the CEO's decision without deeper analysis.
**Score 0.25**: Surface-level.
**Score 0.0**: Missing.

### Criterion 3: Forward-Looking Decision Quality (Weight: 25%)

**Score 1.0**: Board recommendation is grounded in CURRENT reality (Month 10), not hindsight. Acknowledges sunk cost fallacy. Sets measurable criteria and timeline for go/no-go. Considers team morale and capacity realistically.
**Score 0.75**: Good recommendation but slightly disconnected from current state.
**Score 0.5**: Generic recommendation ("invest more" or "shut it down") without nuance.
**Score 0.25**: Based on hindsight, not current state.
**Score 0.0**: No recommendation.

### Criterion 4: Critical Thinking on Evidence (Weight: 20%)

**Score 1.0**: Critically examines the $380K claim — identifies VP Sales' potential bias, considers alternative explanations, weighs the evidence for and against. Shows ability to question narratives rather than accept them.
**Score 0.75**: Some critical examination but doesn't fully explore alternative explanations.
**Score 0.5**: Accepts or rejects the claim without nuanced reasoning.
**Score 0.25**: Doesn't address the claim's reliability.
**Score 0.0**: Missing.

## Efficiency Baseline

- **Optimal tool calls**: 2
- **Rationale**: 1 read + 1 write.
