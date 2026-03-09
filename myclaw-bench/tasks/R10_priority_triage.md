---
id: R10_priority_triage
name: Priority Triage (3 Competing Tasks)
category: complex
grading_type: llm_judge
tier: reasoning
timeout_seconds: 300
optimal_tool_calls: 6
inject_date: true
workspace_files:
  - path: "inbox.md"
    content: |
      ## Message 1 (received 9:01 AM)
      From: CEO
      Subject: Board deck
      "Can you put together 3-4 slides summarizing our Q4 performance? Board meeting is tomorrow at 2pm. Use the data in q4_data.csv."

      ## Message 2 (received 9:15 AM)
      From: Engineering Lead
      Subject: Production incident
      "URGENT: The payment processing endpoint is returning 500 errors. ~15% of transactions failing since 8:30 AM. Need to investigate logs and identify the root cause ASAP. Log file attached at prod_errors.log."

      ## Message 3 (received 9:20 AM)
      From: Marketing
      Subject: Blog post review
      "Hey, can you review the draft blog post in blog_draft.md and give feedback? We'd like to publish this week."
  - path: "q4_data.csv"
    content: |
      metric,Q3,Q4,change
      Revenue,$2.1M,$2.8M,+33%
      Users,12000,18500,+54%
      Churn,5.2%,3.8%,-1.4pp
      NPS,42,58,+16
  - path: "prod_errors.log"
    content: |
      2024-12-15T08:32:14Z ERROR PaymentService: Connection timeout to stripe-api.internal:443
      2024-12-15T08:32:15Z ERROR PaymentService: Retry 1/3 failed - Connection timeout
      2024-12-15T08:32:16Z ERROR PaymentService: Retry 2/3 failed - Connection timeout
      2024-12-15T08:32:17Z ERROR PaymentService: Retry 3/3 failed - Connection timeout
      2024-12-15T08:32:17Z FATAL PaymentService: Circuit breaker OPEN for stripe-api.internal
      2024-12-15T08:35:22Z ERROR PaymentService: Connection timeout to stripe-api.internal:443
      2024-12-15T08:40:33Z INFO  DNSResolver: stripe-api.internal resolved to 10.0.3.47 (cached TTL: 3600s)
      2024-12-15T08:40:33Z WARN  NetworkMonitor: Host 10.0.3.47 unreachable, last successful ping 08:30:01Z
      2024-12-15T08:45:00Z ERROR PaymentService: 47 failed transactions in last 15 minutes
  - path: "blog_draft.md"
    content: |
      # Why We Rebuilt Our Analytics Pipeline

      In today's fast-paced world of data engineering, building a robust analytics pipeline is crucial. We recently undertook a major rebuild of our data infrastructure, and the results have been remarkable.

      Our old pipeline processed data in batch jobs every 6 hours. The new system handles events in real-time, reducing our analytics latency from 6 hours to under 30 seconds.

      Key improvements: 40x faster processing, 60% cost reduction, real-time dashboards.
---

# Task: Priority Triage (3 Competing Tasks)

## Prompt

I just got three messages in my inbox (see `inbox.md`). I only have 2 hours. Help me handle all three in the right order. For each one, either do the work directly or tell me what to do.

## Expected Behavior

The agent should demonstrate prioritization judgment:

**Priority 1 — Production Incident (Message 2)**: This is the highest priority. Revenue is being lost RIGHT NOW. The agent should:
- Read prod_errors.log immediately
- Identify the root cause: DNS is resolving stripe-api.internal to 10.0.3.47, which became unreachable at 08:30. The DNS cache TTL of 3600s means it won't re-resolve for an hour.
- Recommend: flush DNS cache or update the DNS record, then reset the circuit breaker

**Priority 2 — Board Deck (Message 1)**: Time-sensitive (tomorrow 2pm) but not losing money right now. The agent should:
- Read q4_data.csv
- Create a quick outline or draft for 3-4 slides

**Priority 3 — Blog Review (Message 3)**: Lowest urgency ("this week"). The agent should:
- Quick review of blog_draft.md OR defer it to after the first two are handled

A weak agent will:
- Handle them in inbox order (1, 2, 3) instead of priority order
- Spend equal time on all three
- Miss the root cause in the logs

## Grading Criteria

- [ ] Agent identifies production incident as highest priority
- [ ] Agent addresses production incident first
- [ ] Agent correctly diagnoses the root cause from logs (DNS/network issue)
- [ ] Agent handles board deck as second priority
- [ ] Agent appropriately defers or quickly handles blog review
- [ ] Prioritization reasoning is explained

## LLM Judge Rubric

### Criterion 1: Prioritization Judgment (Weight: 35%)

**Score 1.0**: Immediately identifies production incident as #1 priority with clear reasoning (revenue impact, active failures). Handles board deck second (time-sensitive). Defers or quickly handles blog (low urgency). Explains prioritization logic.
**Score 0.75**: Correct priority order but reasoning is implicit or briefly stated.
**Score 0.5**: Gets the general idea but spends disproportionate time on lower-priority items, or handles in wrong order but acknowledges urgency.
**Score 0.25**: Handles in inbox order or doesn't differentiate urgency levels.
**Score 0.0**: Starts with blog review or completely ignores the production incident.

### Criterion 2: Incident Diagnosis (Weight: 35%)

**Score 1.0**: Correctly identifies the root cause chain: stripe-api.internal DNS resolves to 10.0.3.47 → host became unreachable at 08:30 → DNS cache (TTL 3600s) prevents re-resolution → circuit breaker opened → transactions failing. Recommends DNS flush + circuit breaker reset.
**Score 0.75**: Identifies the network/DNS issue but misses one element (e.g., TTL detail or circuit breaker).
**Score 0.5**: Identifies "connection timeout" as the problem but doesn't trace to root cause. Generic recommendations.
**Score 0.25**: Reads the logs but only surface-level observation ("there are errors").
**Score 0.0**: Doesn't read the logs or completely misdiagnoses.

### Criterion 3: Completeness (Weight: 30%)

**Score 1.0**: All three tasks addressed appropriately — deep work on incident, useful output for board deck (at least an outline with real Q4 numbers), and reasonable handling of blog (quick review or explicit deferral).
**Score 0.75**: Two tasks handled well, third acknowledged but minimal.
**Score 0.5**: Only one task fully handled, others superficially addressed.
**Score 0.25**: Only one task addressed, others ignored.
**Score 0.0**: No meaningful work on any task.

## Efficiency Baseline

- **Optimal tool calls**: 6
- **Rationale**: 1 read (inbox) + 1 read (logs) + 1 read (q4 data) + 1 read (blog) + 1-2 writes (outputs) = ~6
