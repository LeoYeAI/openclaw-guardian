---
id: M08_project_planning
name: Project Planning & Estimation
category: reasoning
grading_type: llm_judge
tier: mastery
timeout_seconds: 240
optimal_tool_calls: 2
inject_date: true
workspace_files:
  - path: "brief.md"
    content: |
      # Project Brief: Internal Dashboard Rebuild

      ## Context
      We have an internal analytics dashboard built 3 years ago with jQuery and PHP. It's slow, buggy, and hard to maintain. We want to rebuild it.

      ## Requirements
      - Modern React frontend with TypeScript
      - REST API backend (Python FastAPI or Node Express)
      - PostgreSQL database (already exists, schema stays)
      - Charts: revenue, user growth, churn, cohort analysis
      - Real-time updates (WebSocket for live metrics)
      - Role-based access: admin, analyst, viewer
      - Export to CSV/PDF
      - Mobile-responsive

      ## Constraints
      - Team: 2 frontend devs, 1 backend dev, 1 part-time designer
      - Budget: None additional (using existing team)
      - Must maintain old dashboard until cutover
      - Users: ~50 internal employees
      - Current pain point: dashboard takes 12 seconds to load

      ## Questions from stakeholders
      - "How long will this take?"
      - "Can we do it in phases?"
      - "What's the riskiest part?"
---

# Task: Project Planning & Estimation

## Prompt

Read `brief.md` and create a project plan in `project_plan.md` that answers the stakeholders' three questions. Include:

1. Timeline estimate with phases and milestones
2. Phase breakdown (what ships when)
3. Risk assessment with mitigations
4. Resource allocation across the team

Be realistic — don't promise what a team of 3.5 can't deliver.

## Expected Behavior

This tests realistic project planning judgment. The agent should:

- Estimate 10-16 weeks total (not 4 weeks, not 6 months)
- Recommend phases: (1) Core dashboard + charts, (2) Real-time + roles, (3) Export + polish
- Identify key risks: WebSocket complexity with small team, parallel maintenance of old system, part-time designer bottleneck
- Allocate team realistically (2 FE on React, 1 BE on API, designer on component library first)
- NOT overcommit or underestimate

## Grading Criteria

- [ ] project_plan.md created
- [ ] Realistic timeline (8-20 weeks)
- [ ] Phased approach recommended
- [ ] Risks identified with mitigations
- [ ] Team allocation addressed
- [ ] Answers all 3 stakeholder questions

## LLM Judge Rubric

### Criterion 1: Estimation Realism (Weight: 35%)

**Score 1.0**: Timeline is realistic for a 3.5-person team (10-16 weeks). Phases are logical and deliverables per phase are achievable. Shows understanding of engineering velocity. Acknowledges uncertainty.
**Score 0.75**: Reasonable but slightly optimistic or pessimistic. Phases make sense.
**Score 0.5**: Timeline is unrealistic (under 6 weeks or over 6 months) but phases are logical.
**Score 0.25**: Both timeline and phases are unrealistic.
**Score 0.0**: No timeline or completely disconnected from reality.

### Criterion 2: Risk Assessment (Weight: 30%)

**Score 1.0**: Identifies 3+ real risks specific to THIS project (WebSocket with small team, dual maintenance, designer bottleneck, scope creep from "mobile-responsive" + "real-time"). Each risk has a concrete mitigation. Risks are not generic.
**Score 0.75**: 2-3 good risks with mitigations.
**Score 0.5**: Generic risks ("scope creep", "delays") without project-specific reasoning.
**Score 0.25**: 1 risk or very generic.
**Score 0.0**: No risk assessment.

### Criterion 3: Practical Usefulness (Weight: 35%)

**Score 1.0**: Plan could be presented to stakeholders as-is. Answers all 3 questions directly. Resource allocation is specific. Phases have clear deliverables. A PM could use this to create a Jira board.
**Score 0.75**: Useful but needs some refinement before presenting.
**Score 0.5**: Contains good information but poorly organized or too academic.
**Score 0.25**: Not useful for actual planning.
**Score 0.0**: Missing or useless.

## Efficiency Baseline

- **Optimal tool calls**: 2
- **Rationale**: 1 read + 1 write = 2
