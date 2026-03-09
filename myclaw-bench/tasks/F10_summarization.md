---
id: F10_summarization
name: Document Summarization
category: comprehension
grading_type: llm_judge
tier: foundation
timeout_seconds: 240
optimal_tool_calls: 2
inject_date: false
workspace_files:
  - path: "article.txt"
    content: |
      The Rise of Artificial Intelligence in Modern Healthcare

      Artificial intelligence (AI) has emerged as a transformative force in healthcare, revolutionizing how medical professionals diagnose diseases, develop treatment plans, and manage patient care. Over the past decade, machine learning algorithms have demonstrated remarkable capabilities in analyzing medical imaging, predicting patient outcomes, and identifying patterns that might escape human observation.

      One of the most significant applications of AI in healthcare is in medical imaging analysis. Deep learning models can now detect cancerous tumors, identify fractures, and diagnose conditions like diabetic retinopathy with accuracy rates that match or exceed those of experienced radiologists. For instance, Google's DeepMind has developed AI systems that can detect over 50 eye diseases from retinal scans with 94% accuracy.

      Beyond imaging, AI is making strides in drug discovery and development. Traditional drug development is a lengthy and expensive process, often taking over a decade and costing billions of dollars. AI algorithms can analyze vast databases of molecular structures, predict how different compounds will interact with disease targets, and identify promising drug candidates much faster than traditional methods.

      Predictive analytics represents another frontier where AI is proving invaluable. By analyzing electronic health records, genetic information, and lifestyle factors, AI systems can predict which patients are at high risk for conditions like heart disease, diabetes, or hospital readmission. This enables healthcare providers to intervene earlier with preventive care.

      However, the integration of AI in healthcare is not without challenges. Privacy concerns are paramount, as these systems require access to sensitive patient data. There are also questions about algorithmic bias, as AI systems trained on non-diverse datasets may perform poorly for underrepresented populations. The "black box" nature of some AI algorithms makes it difficult for doctors to understand how the system reached a conclusion.

      Despite these challenges, the future of AI in healthcare looks promising. The key to successful AI integration lies in viewing these systems as tools to augment, rather than replace, human medical expertise.
---

# Task: Document Summarization

## Prompt

Read `article.txt` and write a concise 3-paragraph summary to `summary.txt`. Capture: (1) main topic, (2) key applications, (3) challenges and outlook.

## Expected Behavior

Read, comprehend, and produce a tight 3-paragraph summary that captures all major themes.

## Grading Criteria

- [ ] File created
- [ ] Has 3 paragraphs
- [ ] Captures main topic (AI in healthcare)
- [ ] Mentions key applications (imaging, drug discovery, predictive analytics)
- [ ] Addresses challenges (privacy, bias)
- [ ] Concise (150-300 words)
- [ ] No factual errors

## LLM Judge Rubric

### Criterion 1: Accuracy & Completeness (Weight: 40%)

**Score 1.0**: Captures all major themes — imaging, drug discovery, predictive analytics, challenges (privacy, bias, black box), future outlook. No factual errors.
**Score 0.75**: Most themes covered, one area underrepresented.
**Score 0.5**: Some themes captured, notable omissions.
**Score 0.25**: Misses multiple themes or has factual errors.
**Score 0.0**: Inaccurate, off-topic, or missing.

### Criterion 2: Conciseness (Weight: 30%)

**Score 1.0**: 150-250 words. High information density.
**Score 0.75**: 250-350 words. Good but slightly verbose.
**Score 0.5**: 350-450 words or under 100. Imbalanced.
**Score 0.25**: Over 450 or under 75.
**Score 0.0**: Completely inappropriate length or missing.

### Criterion 3: Structure & Clarity (Weight: 30%)

**Score 1.0**: Exactly 3 well-organized paragraphs. Clear flow: overview → applications → challenges/future.
**Score 0.75**: 3 paragraphs, minor flow issues.
**Score 0.5**: Wrong paragraph count or poor organization.
**Score 0.25**: Badly structured.
**Score 0.0**: No structure.

## Efficiency Baseline

- **Optimal tool calls**: 2
- **Rationale**: 1 read + 1 write = 2
