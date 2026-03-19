---
name: ask-lenny
description: "Product & growth wisdom from 289+ real founder conversations. Search and query Lenny Rachitsky's Podcast and Newsletter archive for product, growth, GTM, pricing, AI product, and leadership insights. Triggers on @lenny, 'ask lenny', 'lenny podcast', 'what does lenny think', 'lenny archive', or whenever the user wants product/growth advice grounded in real practitioner experience. Also triggers when the user says 'setup lenny' or 'initialize ask-lenny'."
---

# ask-lenny

Product & growth wisdom from 289+ real founder conversations — powered by Lenny Rachitsky's Podcast and Newsletter archive.
Zero external dependencies. Pure Python stdlib, local TF-IDF index.

## Setup (first time)

Run once to download data and build the index:

```bash
bash {baseDir}/scripts/setup.sh
```

Takes ~15 seconds. Creates `{baseDir}/data/` with search index + chunks.

If the index is missing, prompt the user to run setup first.

## Answering Questions

### Step 1 — Search

```bash
python3 {baseDir}/scripts/search.py "<query>" --top 5
```

Options:
- `--top N` — return N chunks (default 5; use 8 for broad questions)
- `--guest "Name"` — filter to a specific guest
- `--full` — return full chunk text instead of 2000-char preview
- `--data <path>` — custom data directory

Output: JSON array of chunks with `guest`, `title`, `date`, `score`, `text`.

### Step 2 — Synthesize

Read the returned chunks. For each relevant passage:
- Note the guest name and quote the key insight verbatim
- Synthesize across multiple guests when they cover the same topic
- Be honest when the archive doesn't have a good answer

### Response Format

```
🎙️ **Ask Lenny**

**[Guest Name] ([Year]):**
> "[Direct quote from transcript]"

**[Guest Name] ([Year]):**
> "[Direct quote]"

**综合洞察 / Synthesis:**
[Your synthesis grounded in the quotes above]

📎 来源 / Sources: `guest-name.md`, `newsletter-title.md`
```

Always include at least one direct quote. Never fabricate quotes.
When answering in Chinese, keep guest names and direct quotes in English.

## Common Query Patterns

| User says | Search query to use |
|---|---|
| 用户不活跃 / activation | `"user activation onboarding aha moment retention"` |
| 定价 / pricing | `"pricing strategy AI outcomes value metric"` |
| PLG / 增长 | `"product led growth PLG viral loop acquisition"` |
| AI 产品 / building with AI | `"AI product building agent LLM"` |
| GTM / 销售 | `"go to market enterprise sales GTM"` |
| 团队 / leadership | `"team leadership hiring management"` |
| 增长停滞 | `"growth stagnation plateau reaccelerate"` |

## Guest Coverage

See `references/guest-index.md` for full guest list with topics.
Key guests by topic:
- **定价/Pricing**: Madhavan Ramanujam
- **PLG/Growth**: Elena Verna, Brian Halligan, Jason Cohen
- **AI产品**: Bret Taylor, Scott Wu, Chip Huyen, Boris Cherny
- **GTM/Sales**: Jason Lemkin, Jeanne Grosser, Jen Abel
- **Leadership**: Ben Horowitz, Molly Graham, Matt LeMay
- **Onboarding/Retention**: Eoghan McCabe, Albert Cheng, Howie Liu

## Upgrading to Full Archive

The free starter pack has 50 podcasts + 10 newsletters.
Full archive (289 podcasts + 349 newsletters) available at https://lennysdata.com

To upgrade: replace `{baseDir}/data/source/` with the full archive and re-run:
```bash
python3 {baseDir}/scripts/build_index.py {baseDir}/data/source {baseDir}/data
```
