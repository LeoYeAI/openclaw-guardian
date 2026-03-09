---
id: R03_tradeoff_analysis
name: Trade-off Analysis & Recommendation
category: reasoning
grading_type: llm_judge
tier: reasoning
timeout_seconds: 240
optimal_tool_calls: 2
inject_date: false
workspace_files:
  - path: "options.md"
    content: |
      # Infrastructure Migration Options

      We need to migrate our database. Budget: $5,000/month max. Current: self-hosted PostgreSQL on a $800/month server, 500GB data, 99.2% uptime last year.

      ## Option A: AWS RDS
      - Cost: $3,200/month (db.r5.2xlarge + storage)
      - Managed service, auto-backups, auto-failover
      - 99.95% SLA uptime
      - Migration estimate: 2 weeks, requires 4-hour maintenance window
      - Vendor lock-in risk: medium (PostgreSQL compatible, but Aurora features are proprietary)

      ## Option B: PlanetScale (MySQL-compatible)
      - Cost: $1,900/month (Scaler Pro plan)
      - Serverless, auto-scaling, zero-downtime schema changes
      - 99.999% SLA uptime
      - Migration estimate: 6 weeks (requires PostgreSQL → MySQL schema conversion)
      - Vendor lock-in risk: high (MySQL-only, proprietary branching)
      - Risk: schema conversion may break 3 stored procedures

      ## Option C: Upgrade Self-Hosted
      - Cost: $1,400/month (better server + monitoring tools)
      - Full control, no vendor lock-in
      - Uptime depends on team (currently 99.2%, could improve with monitoring)
      - Migration estimate: 1 week (horizontal scaling, add replicas)
      - Risk: requires hiring a DBA ($120K/year) or team upskilling

      ## Team Context
      - 3 backend engineers, no dedicated DBA
      - Primary app is a B2B SaaS with 200 customers
      - Currently losing ~$15K/month in revenue due to downtime incidents
      - CTO wants "boring, reliable infrastructure"
---

# Task: Trade-off Analysis & Recommendation

## Prompt

Read `options.md` and write a decision memo to `decision.md`. Analyze the three options against our constraints and recommend ONE. Your memo should:

1. State the recommended option and why (1-2 sentences)
2. Show the trade-off matrix (cost, risk, effort, uptime)
3. Explain what you'd lose by NOT choosing the other two options
4. Identify the single biggest risk of your recommendation and how to mitigate it

Keep it under 400 words.

## Expected Behavior

This task tests structured reasoning under real-world constraints. There is no single "right" answer — what matters is the quality of reasoning.

Strong analysis should notice:
- The $15K/month downtime cost dwarfs all option costs — reliability is the #1 priority
- Option C is cheapest but doesn't solve the reliability problem (and hiring a DBA adds $10K/month)
- Option B has the best uptime SLA but migration risk is highest (6 weeks + schema conversion)
- Option A is the "boring, reliable" choice the CTO wants — managed PostgreSQL, good uptime, moderate cost
- Total cost should include migration risk, not just monthly fee

A weak analysis will:
- Just compare monthly costs
- Ignore the $15K/month downtime context
- Make a recommendation without addressing trade-offs
- Miss the CTO's stated preference

## Grading Criteria

- [ ] Clear recommendation stated upfront
- [ ] Trade-off matrix covers all 3 options
- [ ] Analysis considers total cost (including downtime losses)
- [ ] Explains opportunity cost of rejected options
- [ ] Identifies biggest risk + mitigation
- [ ] Under 400 words
- [ ] Reasoning is logical and well-structured

## LLM Judge Rubric

### Criterion 1: Reasoning Quality (Weight: 40%)

**Score 1.0**: Analysis goes beyond surface-level comparison. Connects the $15K/month downtime cost to the urgency of the decision. Weighs migration risk against ongoing losses. Notes CTO preference. Considers hidden costs (DBA hiring, vendor lock-in, schema conversion risk). Reasoning chain is clear and logical.
**Score 0.75**: Good analysis with most key insights. Misses one important factor (e.g., doesn't factor in downtime revenue loss, or ignores CTO preference).
**Score 0.5**: Compares options adequately but reasoning is superficial. Focuses mainly on listed costs without deeper analysis.
**Score 0.25**: Basic comparison with weak reasoning. Doesn't connect the data points.
**Score 0.0**: No meaningful analysis or recommendation contradicts the evidence.

### Criterion 2: Decision Structure (Weight: 30%)

**Score 1.0**: Follows the requested structure exactly — recommendation first, trade-off matrix, opportunity costs of rejected options, biggest risk + mitigation. Easy to follow.
**Score 0.75**: Has most structural elements but one is weak or missing.
**Score 0.5**: Partial structure. Reads more like a discussion than a decision memo.
**Score 0.25**: Poor structure. Key elements missing.
**Score 0.0**: No discernible structure.

### Criterion 3: Practical Usefulness (Weight: 30%)

**Score 1.0**: A real CTO could read this and make a decision. Recommendation is defensible, risks are honest, and mitigations are actionable. Doesn't hedge excessively or refuse to commit.
**Score 0.75**: Useful but slightly academic or hedging.
**Score 0.5**: Contains good analysis but doesn't commit to a clear recommendation, or recommendation is weakly supported.
**Score 0.25**: Not useful for decision-making. Too vague or too much hedging.
**Score 0.0**: Would not help a decision-maker in any way.

## Efficiency Baseline

- **Optimal tool calls**: 2
- **Rationale**: 1 read (options.md) + 1 write (decision.md) = 2
