---
id: C03_visual_comprehension
name: Visual UI Comprehension
category: computer_use
grading_type: automated
tier: frontier
timeout_seconds: 240
optimal_tool_calls: 4
inject_date: false
workspace_files:
  - path: "dashboard.html"
    content: |
      <!DOCTYPE html>
      <html>
      <head><title>Sales Dashboard</title>
      <style>
        body { font-family: -apple-system, sans-serif; margin: 0; background: #f5f5f5; }
        .header { background: #1a1a2e; color: white; padding: 20px 40px; }
        .header h1 { margin: 0; font-size: 24px; }
        .header .subtitle { color: #a0a0b0; font-size: 14px; }
        .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; padding: 20px 40px; }
        .card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .card .label { color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
        .card .value { font-size: 32px; font-weight: 700; margin: 8px 0; }
        .card .change { font-size: 14px; }
        .card .change.up { color: #10b981; }
        .card .change.down { color: #ef4444; }
        .table-section { padding: 0 40px 40px; }
        table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        th { background: #f8f9fa; padding: 14px 20px; text-align: left; font-size: 13px; color: #666; text-transform: uppercase; }
        td { padding: 14px 20px; border-top: 1px solid #eee; }
        .status { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .status.closed { background: #dcfce7; color: #166534; }
        .status.pending { background: #fef3c7; color: #92400e; }
        .status.lost { background: #fee2e2; color: #991b1b; }
        .alert-bar { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 40px; margin: 0 40px 20px; border-radius: 8px; font-size: 14px; }
      </style>
      </head>
      <body>
        <div class="header">
          <h1>Sales Dashboard — Q4 2024</h1>
          <div class="subtitle">Last updated: December 31, 2024 at 11:45 PM</div>
        </div>

        <div class="alert-bar">
          ⚠️ <strong>Action Required:</strong> 3 deals worth $127,000 are pending approval and will expire in 48 hours.
        </div>

        <div class="grid">
          <div class="card">
            <div class="label">Total Revenue</div>
            <div class="value">$2.84M</div>
            <div class="change up">↑ 23% vs Q3</div>
          </div>
          <div class="card">
            <div class="label">Deals Closed</div>
            <div class="value">47</div>
            <div class="change up">↑ 12% vs Q3</div>
          </div>
          <div class="card">
            <div class="label">Win Rate</div>
            <div class="value">34%</div>
            <div class="change down">↓ 5% vs Q3</div>
          </div>
          <div class="card">
            <div class="label">Avg Deal Size</div>
            <div class="value">$60.4K</div>
            <div class="change up">↑ 8% vs Q3</div>
          </div>
        </div>

        <div class="table-section">
          <h2 style="padding: 20px 0 10px; color: #333;">Recent Deals</h2>
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Deal Value</th>
                <th>Rep</th>
                <th>Stage</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Acme Corp</td><td>$85,000</td><td>Sarah K.</td><td>Negotiation</td><td><span class="status pending">Pending</span></td></tr>
              <tr><td>TechVenture</td><td>$120,000</td><td>Mike R.</td><td>Closed</td><td><span class="status closed">Closed Won</span></td></tr>
              <tr><td>GlobalSync</td><td>$22,000</td><td>Sarah K.</td><td>Proposal</td><td><span class="status pending">Pending</span></td></tr>
              <tr><td>DataFlow Inc</td><td>$45,000</td><td>Lisa T.</td><td>Discovery</td><td><span class="status lost">Lost</span></td></tr>
              <tr><td>NexGen Labs</td><td>$200,000</td><td>Mike R.</td><td>Closed</td><td><span class="status closed">Closed Won</span></td></tr>
              <tr><td>CloudFirst</td><td>$20,000</td><td>Sarah K.</td><td>Negotiation</td><td><span class="status pending">Pending</span></td></tr>
              <tr><td>SmartOps</td><td>$67,000</td><td>Lisa T.</td><td>Closed</td><td><span class="status closed">Closed Won</span></td></tr>
            </tbody>
          </table>
        </div>
      </body>
      </html>
---

# Task: Visual UI Comprehension

## Prompt

Open `dashboard.html` in the browser and answer these questions. Save answers to `dashboard_analysis.md`:

1. What is the total revenue and how does it compare to last quarter?
2. Which metric went DOWN compared to Q3?
3. What is the urgent alert about? What's the dollar amount at risk?
4. Who is the top-performing sales rep based on closed deal value?
5. What is the total value of all pending deals?

## Expected Behavior

The agent must visually comprehend a rendered dashboard — not just parse HTML source. This tests whether the model can:

1. Read KPI cards with values and trend indicators
2. Identify the alert bar and extract the urgency
3. Read a data table and perform calculations
4. Cross-reference data across visual elements

**Correct answers:**
1. $2.84M, up 23% vs Q3
2. Win Rate (34%, down 5%)
3. 3 deals worth $127,000 pending approval, expiring in 48 hours
4. Mike R. — closed TechVenture ($120K) + NexGen Labs ($200K) = $320K
5. Pending deals: Acme ($85K) + GlobalSync ($22K) + CloudFirst ($20K) = $127K

Key insight: The $127K in the alert bar MATCHES the sum of pending deals in the table. A strong model notices this connection.

## Grading Criteria

- [ ] Browser opened and rendered the dashboard
- [ ] dashboard_analysis.md created
- [ ] Revenue correctly identified ($2.84M, +23%)
- [ ] Win Rate identified as the declining metric
- [ ] Alert correctly described ($127K, 48 hours)
- [ ] Top rep identified (Mike R., $320K closed)
- [ ] Pending total calculated ($127K)

## Automated Checks

```python
def grade(transcript: list, workspace_path: str, meta: dict) -> dict:
    from pathlib import Path
    import re

    scores = {}
    workspace = Path(workspace_path)

    # Check browser usage
    browser_used = False
    for event in transcript:
        if event.get("type") != "message":
            continue
        msg = event.get("message", {})
        if msg.get("role") == "assistant":
            for item in msg.get("content", []):
                if item.get("type") == "toolCall" and item.get("name", "") in ["browser", "computer"]:
                    browser_used = True
    scores["browser_used"] = 1.0 if browser_used else 0.0

    analysis = workspace / "dashboard_analysis.md"
    if not analysis.exists():
        return {**scores, **{k: 0.0 for k in ["file_created", "revenue", "declining_metric", "alert", "top_rep", "pending_total"]}}

    scores["file_created"] = 1.0
    content = analysis.read_text().lower()

    # Revenue
    scores["revenue"] = 1.0 if ("2.84" in content or "2,840" in content or "2840" in content) and "23" in content else 0.0

    # Declining metric
    scores["declining_metric"] = 1.0 if "win rate" in content and ("down" in content or "declin" in content or "decreas" in content or "↓" in content or "drop" in content) else 0.0

    # Alert
    scores["alert"] = 1.0 if "127" in content and ("48" in content or "expir" in content or "urgent" in content) else 0.0

    # Top rep (Mike R. with $320K)
    scores["top_rep"] = 1.0 if "mike" in content and ("320" in content or ("120" in content and "200" in content)) else 0.0

    # Pending total ($127K)
    scores["pending_total"] = 1.0 if "127" in content and ("pending" in content or "total" in content) else 0.0

    return scores
```

## Efficiency Baseline

- **Optimal tool calls**: 4
- **Rationale**: 1 open + 1-2 snapshots (may need scroll) + 1 write = 4

## Notes

- The dashboard is rendered HTML, not plaintext — the agent MUST use the browser
- Reading raw HTML source is partial credit at best (it works but misses the "visual comprehension" test)
- The $127K connection between alert and table sum is the differentiator between good and excellent
