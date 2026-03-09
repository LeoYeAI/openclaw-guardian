---
id: M05_large_context
name: Large Context Window Utilization
category: comprehension
grading_type: hybrid
tier: mastery
timeout_seconds: 300
optimal_tool_calls: 2
inject_date: false
workspace_files:
  - path: "meeting_transcript.md"
    content: |
      # Product Strategy Meeting — 2024-12-10

      **Attendees**: Sarah (CEO), Mike (CTO), Lisa (VP Product), Tom (VP Sales), Raj (Head of Data)

      ## Opening (Sarah)
      Thanks everyone for coming. We have three big topics today: pricing changes, the enterprise roadmap, and the data platform migration. Let's try to make decisions, not just discuss.

      ## Topic 1: Pricing Changes

      **Tom**: Our current pricing is $49/mo starter, $149/mo pro, $499/mo enterprise. I'm seeing two problems. First, the gap between pro and enterprise is too big — we're losing mid-market deals. Second, competitors are undercutting our starter tier.

      **Lisa**: What if we add a "Business" tier at $249/mo? Fill the gap.

      **Tom**: That could work. But I also want to raise enterprise to $599. We're leaving money on the table.

      **Sarah**: Mike, what's the engineering cost of supporting a 4th tier?

      **Mike**: Minimal — maybe 2 weeks. The billing system already supports it. The real cost is in documentation and support training.

      **Sarah**: Let's do it. Business tier at $249, enterprise at $599. Lisa, own the rollout. Target: February 1st launch. Tom, prepare sales team by January 15th.

      **DECISION**: Add Business tier ($249/mo), raise Enterprise to $599/mo. Launch Feb 1. Lisa owns rollout, Tom owns sales prep by Jan 15.

      ## Topic 2: Enterprise Roadmap

      **Lisa**: Enterprise customers keep asking for three things: SSO/SAML, audit logs, and custom SLAs. We promised SSO by Q1 but we're behind.

      **Mike**: SSO is 80% done. We hit a snag with Okta integration — their docs are wrong in three places and I had to reverse-engineer the token exchange. Should be ready by end of January.

      **Lisa**: Audit logs?

      **Mike**: That's a bigger project. We need to instrument 47 endpoints. I'd say Q2 realistic, maybe late March if we prioritize it.

      **Raj**: I can help with the audit log pipeline. My team already has the event streaming infrastructure from the analytics work. We could reuse 60% of it.

      **Mike**: That would cut it to 6 weeks instead of 10. Let's do it.

      **Sarah**: Good. Mike and Raj co-own audit logs. Target: end of March. Lisa, keep selling it as "Q1" but caveat it as late Q1.

      **Tom**: What about custom SLAs? I have 3 deals worth $180K ARR combined that are blocked on this.

      **Sarah**: How complex is custom SLA support?

      **Mike**: The SLA monitoring is easy — 1 week. The contractual/legal side is the bottleneck. We need legal templates.

      **Sarah**: Tom, work with legal to get templates by January 20th. Mike implements the monitoring. Let's unblock those deals.

      **DECISION**: SSO by end of Jan (Mike). Audit logs by end of March (Mike + Raj). Custom SLA templates by Jan 20 (Tom + Legal), monitoring by Feb (Mike). $180K ARR to unblock.

      ## Topic 3: Data Platform Migration

      **Raj**: We're currently on Redshift and it's killing us. Query costs are $12K/month and growing 20% quarterly. I want to migrate to ClickHouse.

      **Sarah**: Cost savings?

      **Raj**: Estimated $8K/month savings once migrated. But the migration itself is a 3-month project and we'll need $15K in one-time setup costs.

      **Mike**: I'm worried about the risk. We have 23 dashboards, 8 scheduled reports, and 4 downstream APIs that depend on Redshift. If any break during migration, customers will notice.

      **Raj**: I propose a parallel-run approach. Keep Redshift alive during migration, run ClickHouse alongside, validate data parity, then switch over. Adds 1 month but eliminates risk.

      **Sarah**: How much does the parallel run cost?

      **Raj**: Extra $12K for the overlap month. So total investment: $27K, ROI payback in 3.4 months.

      **Mike**: I'm comfortable with that. The parallel-run approach is the right call.

      **Sarah**: Approved. Raj, start January. 4-month timeline with parallel run. Report progress every 2 weeks at leadership sync.

      **DECISION**: Migrate Redshift → ClickHouse. 4-month timeline starting January. Parallel-run approach. $27K investment, $8K/mo savings. Raj owns, biweekly updates.

      ## Action Items Summary

      1. Lisa: Price tier rollout plan by Jan 10
      2. Tom: Sales team pricing training by Jan 15
      3. Tom + Legal: Custom SLA templates by Jan 20
      4. Mike: SSO/SAML completion by end of January
      5. Mike: Custom SLA monitoring by mid-February
      6. Mike + Raj: Audit logs by end of March
      7. Raj: ClickHouse migration start January, complete by April
      8. Raj: Biweekly migration updates at leadership sync
      9. Sarah: Communicate pricing changes to board

      ## Next Meeting: January 7, 2025
---

# Task: Large Context Window Utilization

## Prompt

Read `meeting_transcript.md` carefully. Then answer these questions and save to `analysis.md`:

1. What is the total additional ARR expected from all decisions combined?
2. What is the net financial impact in the first 12 months? (costs vs. savings)
3. Who has the most action items and is there a risk of overload?
4. What is the single biggest risk across all three topics?
5. Which decision has the weakest justification and why?

## Expected Behavior

This tests deep comprehension and analytical reasoning over a long document. The agent must:

1. **ARR calculation**: $180K from unblocked SLA deals + revenue from new Business tier + Enterprise price increase. The first is explicit; the latter two require estimation or noting they're not quantified.
2. **Financial impact**: ClickHouse migration costs $27K but saves $8K/mo = $96K/year savings - $27K = $69K net first year. Plus pricing increases. Minus engineering time opportunity cost.
3. **Overload risk**: Mike has 3 action items (SSO, SLA monitoring, audit logs) spanning Jan-March. He's the bottleneck.
4. **Biggest risk**: Probably the ClickHouse migration (customer-facing dashboards could break) or Mike being a bottleneck.
5. **Weakest justification**: The Business tier — added based on Tom's anecdotal observation ("losing mid-market deals") without data on how many deals or conversion impact.

## Grading Criteria

- [ ] File analysis.md created
- [ ] ARR question addressed with specific numbers
- [ ] Financial impact calculated with reasoning
- [ ] Correctly identifies Mike as overloaded (3 items)
- [ ] Identifies a credible biggest risk with reasoning
- [ ] Identifies weakest decision with reasoning
- [ ] Analysis goes beyond surface-level reading

## LLM Judge Rubric

### Criterion 1: Analytical Depth (Weight: 50%)

**Score 1.0**: All 5 questions answered with genuine analytical insight. Connects information across sections. Identifies non-obvious patterns (Mike bottleneck, missing data for pricing decision). Shows thinking that goes beyond what's explicitly stated.
**Score 0.75**: 4/5 questions answered well. Good analysis with minor gaps.
**Score 0.5**: Questions answered but analysis stays surface-level. Mostly restates what's in the doc.
**Score 0.25**: 2-3 questions answered, shallow analysis.
**Score 0.0**: Missing or trivially answered.

### Criterion 2: Numerical Reasoning (Weight: 30%)

**Score 1.0**: Correctly calculates or estimates financial impact. Shows work: $180K ARR from SLA deals, $96K/yr ClickHouse savings - $27K cost, plus pricing impact. Acknowledges what can't be calculated.
**Score 0.75**: Mostly correct numbers, minor errors or omissions.
**Score 0.5**: Some numbers referenced but calculation is incomplete or wrong.
**Score 0.25**: Numbers mentioned without analysis.
**Score 0.0**: No numerical reasoning.

### Criterion 3: Strategic Insight (Weight: 20%)

**Score 1.0**: Identifies non-obvious risks (Mike as single point of failure, pricing tier added without data, migration risk to customer dashboards). Shows ability to think like a VP or board member reviewing these decisions.
**Score 0.75**: Good insights, misses one important angle.
**Score 0.5**: Basic observations without strategic depth.
**Score 0.25**: Superficial or generic.
**Score 0.0**: No strategic insight.

## Efficiency Baseline

- **Optimal tool calls**: 2
- **Rationale**: 1 read + 1 write = 2
