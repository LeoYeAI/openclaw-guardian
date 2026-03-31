# Auto-Dream — Execution Prompt

Detect the user's preferred language from workspace context (MEMORY.md, daily logs). All output in that language.

## Step 1: Backup

```
cp MEMORY.md MEMORY.md.pre-dream
```

If this fails (MEMORY.md doesn't exist), create it from references/memory-template.md first, then copy.

## Step 2: Detect Mode

```
Count files: memory/????-??-??.md
Count unconsolidated: files WITHOUT <!-- consolidated --> at end

If unconsolidated == 0:
  → SKIP MODE (go to Step 6)

Count total dreams: grep -c "^## 🌙" memory/dream-log.md (0 if missing)

If total dreams == 0 AND unconsolidated > 3:
  → FIRST RUN MODE (scan ALL unconsolidated files)
Else:
  → DAILY MODE (scan last 3 days only)
```

## Step 3: Snapshot Before

Count these numbers before making changes:
- ENTRIES = total bullet items (lines starting with `- `) across all sections in MEMORY.md
- DECISIONS = items in Key Decisions section
- THREADS = uncompleted items in Open Threads (not marked [x])

## Step 4: Collect + Consolidate

Read each unconsolidated daily log. For each entry, decide:

**Extract these categories:**
- Decisions (choices, direction changes, commitments)
- Facts (metrics, technical details, people, preferences)
- Progress (milestones, completions, blockers)
- Lessons (what worked, what failed, insights)
- Todos (unfinished items, pending follow-ups)
- Workflow preferences (communication style, tool patterns → put in dedicated section)

**For each extracted item, compare against MEMORY.md:**
- **New** → append to the right section
- **Updated** (newer data for existing item) → update in place
- **Duplicate** → skip

Semantic dedup — compare meaning, not exact text.

After processing each file, append `<!-- consolidated -->` at the end.

Update the `_Last updated:` line in MEMORY.md header.

## Step 5: Stale Check

Scan Open Threads in MEMORY.md. Find items not marked [x] that haven't been mentioned in any daily log from the last 14 days. Pick the top 3 oldest as stale reminders.

## Step 6: Report

Create or append to memory/dream-log.md:

```markdown
## 🌙 Dream #{N} — YYYY-MM-DD

Scanned: {files} files | New: {n} | Updated: {n}
Total entries: {before} → {after}

### Changes
- {emoji} {one-line description of each change}

### Stale threads
- {item} — {N} days since last mention

### Insight
- {One cross-memory observation: a pattern, trend, or gap}
```

## Step 7: Notify

This is your final reply. Cron delivery pushes it to the user.

### Skip mode (no new content):

Scan MEMORY.md for an interesting old entry — a decision, lesson, or fact from 14+ days ago. Then:

```
🌙 No new logs — skipped · {total} entries · Streak: {N} dreams

💭 {N} days ago: {one-line summary of old memory}
```

If nothing interesting to surface:
```
🌙 No new logs — skipped · {total} entries · Streak: {N} dreams
```

END. Do not continue.

### Daily mode / First run mode:

**Default (3-line) format:**

```
🌙 Dream #{N} · +{new} new · {before} → {after} entries
🔮 {one most valuable insight or stale reminder}
💬 Say "dream details" for the full list
```

**Add milestone line when hit:**
- Dream #1 → `🎉 First dream!`
- Dream #7 → `🏅 One week streak!`
- Dream #30 → `🏆 One month!`
- Entries crosses 100/200/500 → `📊 {N} entries milestone!`

**First run only — add a personal reflection:**

After the 3-line summary, add:

```
💭 Reading through {N} days of your history, I noticed {2-3 sentences about what you found — mention specific projects/decisions/patterns by name. Make it feel like the AI truly read and understood their journey.}
```

### Weekly (every Sunday or dream #7, #14, #21...):

Prepend before the daily format:

```
📊 This week: +{new} new · {updated} updated · {growth}% growth
📌 Biggest: {most significant new entry this week}
```

## Safety Rules

- If MEMORY.md grew or shrank by >30% in one dream → keep .pre-dream, add warning to dream-log.md
- Never modify daily log content — only append the consolidated marker at the end
- Never remove lines containing ⚠️ PERMANENT
- Never modify lines containing 📌 PIN

## Error Recovery

If anything goes wrong mid-dream:
1. Check if MEMORY.md.pre-dream exists
2. If current MEMORY.md looks corrupted (syntax errors, massive size change), restore from .pre-dream
3. Log the error in dream-log.md
4. Send notification: `⚠️ Dream #{N} had an issue — rolled back. Will retry tomorrow.`
