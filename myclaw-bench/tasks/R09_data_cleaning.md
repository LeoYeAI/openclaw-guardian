---
id: R09_data_cleaning
name: Data Cleaning & Transformation
category: coding
grading_type: hybrid
tier: reasoning
timeout_seconds: 240
optimal_tool_calls: 3
inject_date: false
workspace_files:
  - path: "raw_sales.csv"
    content: |
      date,product,amount,currency,customer_email
      2024-01-15,Widget A,$1250.00,USD,alice@example.com
      2024-01-15,Widget B,"2,100.50",USD,bob@example.com
      01/20/2024,Widget A,$890.00,USD,carol@example.com
      2024-01-22,Widget C,€1500.00,EUR,david@example.de
      2024-01-25,Widget A,$0.00,USD,eve@example.com
      2024-01-25,Widget B,$-50.00,USD,frank@example.com
      Jan 28, 2024,Widget A,$1100.00,USD,grace@example.com
      2024-02-01,Widget A,$950,USD,ALICE@EXAMPLE.COM
      2024-02-03,,850.00,USD,henry@example.com
      2024-02-05,Widget B,$1300.00,USD,
---

# Task: Data Cleaning & Transformation

## Prompt

Clean the messy sales data in `raw_sales.csv` and save a cleaned version to `clean_sales.csv`. Specifically:

1. Normalize all dates to YYYY-MM-DD format
2. Remove currency symbols and commas from amounts, make all amounts plain numbers
3. Remove rows with zero or negative amounts
4. Remove rows with missing product or missing email
5. Deduplicate customers by email (case-insensitive) — keep the latest entry
6. Save cleaned data with the same columns

Also create `cleaning_report.md` documenting what you fixed and how many rows survived.

## Expected Behavior

The agent should handle:
- Three different date formats (YYYY-MM-DD, MM/DD/YYYY, Mon DD, YYYY)
- Currency symbols ($, €) and comma-formatted numbers
- Zero/negative amounts (rows 6, 7)
- Missing fields (row 9: no product, row 10: no email)
- Case-insensitive email dedup (Alice appears twice — keep row 8, the later one)

Expected clean output: 5-6 rows (depending on how EUR conversion is handled — acceptable to keep or remove the EUR row).

## Grading Criteria

- [ ] clean_sales.csv created
- [ ] Dates normalized to YYYY-MM-DD
- [ ] Currency symbols removed, amounts are plain numbers
- [ ] Zero/negative amount rows removed
- [ ] Missing field rows removed
- [ ] Email deduplication applied
- [ ] cleaning_report.md created with stats

## Automated Checks

```python
def grade(transcript: list, workspace_path: str, meta: dict) -> dict:
    from pathlib import Path
    import re
    import csv

    scores = {}
    workspace = Path(workspace_path)
    clean_file = workspace / "clean_sales.csv"

    if not clean_file.exists():
        return {k: 0.0 for k in ["file_created", "dates_clean", "amounts_clean", "bad_rows_removed", "dedup_applied", "report_created"]}

    scores["file_created"] = 1.0
    content = clean_file.read_text()
    lines = [l.strip() for l in content.strip().split('\n') if l.strip()]

    # Parse CSV
    try:
        reader = csv.DictReader(lines[:1] + lines[1:])  # Handle header
        rows = list(csv.reader(lines[1:]))  # Skip header
        header = lines[0].lower()
    except Exception:
        rows = []
        header = ""

    # Check date format (all should be YYYY-MM-DD)
    date_ok = True
    for row in rows:
        if row and row[0]:
            if not re.match(r'^\d{4}-\d{2}-\d{2}$', row[0].strip()):
                date_ok = False
                break
    scores["dates_clean"] = 1.0 if date_ok and rows else 0.0

    # Check amounts (no $, €, commas — just numbers)
    amounts_ok = True
    for row in rows:
        if len(row) >= 3 and row[2]:
            amt = row[2].strip()
            if '$' in amt or '€' in amt or ',' in amt:
                amounts_ok = False
                break
    scores["amounts_clean"] = 1.0 if amounts_ok and rows else 0.0

    # Check bad rows removed (zero, negative, missing product, missing email)
    # Should not have $0.00, negative, empty product, or empty email
    bad_found = False
    for row in rows:
        if len(row) >= 3:
            try:
                amt = float(row[2].strip())
                if amt <= 0:
                    bad_found = True
            except ValueError:
                pass
        if len(row) >= 2 and not row[1].strip():
            bad_found = True
        if len(row) >= 5 and not row[4].strip():
            bad_found = True
    scores["bad_rows_removed"] = 0.0 if bad_found else 1.0

    # Check dedup (should not have alice@example.com twice in any case)
    emails = []
    for row in rows:
        if len(row) >= 5 and row[4].strip():
            emails.append(row[4].strip().lower())
    scores["dedup_applied"] = 1.0 if len(emails) == len(set(emails)) else 0.0

    # Check report
    report = workspace / "cleaning_report.md"
    scores["report_created"] = 1.0 if report.exists() and len(report.read_text().strip()) > 20 else 0.0

    return scores
```

## LLM Judge Rubric

### Criterion 1: Cleaning Thoroughness (Weight: 50%)

**Score 1.0**: All 6 cleaning operations performed correctly. Every edge case handled. Output CSV is clean and ready for analysis.
**Score 0.75**: 5/6 operations correct. One minor issue.
**Score 0.5**: 3-4 operations correct. Some messy data remains.
**Score 0.25**: 1-2 operations attempted. Significant issues remain.
**Score 0.0**: Data not meaningfully cleaned.

### Criterion 2: Report Quality (Weight: 50%)

**Score 1.0**: Report clearly documents each cleaning step, number of rows removed per reason, and final row count. Useful for audit trail.
**Score 0.5**: Basic report with some stats.
**Score 0.0**: No report or useless content.

## Efficiency Baseline

- **Optimal tool calls**: 3
- **Rationale**: 1 read + 2 writes (clean CSV + report) = 3. Could also write a script and exec it = 4-5.
