# Diagnostic Tools Developer Guide

> **Complete guide to prompt debugging, capture, reporting, and review tools**

This guide covers the diagnostic toolkit for developing and debugging the Pom Research prompt system.

---

## Tool Overview

| Tool | Purpose | Key Flags |
|------|---------|-----------|
| `prompt_preview_cli` | Preview rendered prompts | `--dry-run`, `--no-dry-run`, `--output` |
| `pomflow_cli` | Execute prompts | `--capture`, `--report`, `--capture-only` |
| `benchmark_cli` | Compare models/prompts | `--capture`, `--report`, `--flex` |
| `prompt_review.py` | Configuration review | `--tenant-id`, `--output` |

---

## 1. Prompt Preview (`prompt_preview_cli`)

**Purpose:** Render and inspect the complete prompt before LLM execution.

### Basic Usage

```bash
# Quick preview (dry-run, placeholder data)
docker exec pomai-backend-spark python -m pom_core.cli.prompt_preview_cli \
  --prompt entity/entity_researcher \
  --tenant-id prismatic \
  --researcher-id product \
  --domain example.com

# Full preview with actual data injection
docker exec pomai-backend-spark python -m pom_core.cli.prompt_preview_cli \
  --prompt entity/entity_researcher \
  --tenant-id prismatic \
  --researcher-id product \
  --domain prismatic.io \
  --no-dry-run

# Save to file
docker exec pomai-backend-spark python -m pom_core.cli.prompt_preview_cli \
  --prompt entity/entity_researcher \
  --researcher-id product \
  --tenant-id prismatic \
  --domain example.com \
  --output /app/PomAI/reports/preview.md
```

### Output Sections

| Section | Contents |
|---------|----------|
| **Metadata** | Token estimate, character/word count |
| **Model Configuration** | Type, model name, max_output_tokens |
| **JSON Schema** | Full schema with field descriptions |
| **Data Requirements** | Injector configuration |
| **Context Summary** | Tenant, researcher, tenant_group |
| **Rendered System Prompt** | The actual prompt text |

### Batch Preview (All Researchers)

```bash
for researcher in product industry competitor customer leadership financial social partner journalist risk; do
  docker exec pomai-backend-spark python -m pom_core.cli.prompt_preview_cli \
    --prompt entity/entity_researcher \
    --tenant-id prismatic \
    --researcher-id $researcher \
    --domain example.com \
    --dry-run \
    --output /app/PomAI/Docs/guides/prompt_previews/${researcher}_researcher.md \
    --quiet
done
```

---

## 2. Capture Mode (`pomflow_cli --capture`)

**Purpose:** Save complete execution details for debugging and comparison.

### Basic Usage

```bash
# Execute with capture
docker exec pomai-backend-spark python -m pom_core.cli.pomflow_cli \
  --prompt entity_researcher \
  --researcher-id product \
  --tenant-id prismatic \
  --domain example.com \
  --capture

# Capture without database writes (dry-run)
docker exec pomai-backend-spark python -m pom_core.cli.pomflow_cli \
  --prompt entity_researcher \
  --researcher-id product \
  --tenant-id prismatic \
  --domain example.com \
  --capture-only
```

### Capture Output

Generates JSON files with:
- Full rendered prompt
- LLM request/response
- Token usage
- Execution timing
- Tool calls (if any)
- Final structured output

### Use Cases

| Scenario | Command |
|----------|---------|
| Debug LLM output issues | `--capture-only` |
| Compare before/after changes | Capture both, diff |
| Benchmark data collection | `--capture` with `benchmark_cli` |
| Test prompt changes | `--capture-only --dry-run` |

---

## 3. Report Mode (`pomflow_cli --report`)

**Purpose:** Generate human-readable markdown reports from executions.

### Basic Usage

```bash
# Execute with report generation
docker exec pomai-backend-spark python -m pom_core.cli.pomflow_cli \
  --prompt entity_researcher \
  --researcher-id industry \
  --tenant-id prismatic \
  --domain example.com \
  --report

# Multiple output formats
docker exec pomai-backend-spark python -m pom_core.cli.pomflow_cli \
  --prompt entity_researcher \
  --researcher-id product \
  --tenant-id prismatic \
  --domain example.com \
  --report \
  --output-format pdf
```

### Report Contents

- Execution summary
- Input data overview
- LLM response analysis
- Field-by-field output
- Token usage breakdown
- Recommendations (if applicable)

---

## 4. Configuration Review (`prompt_review.py`)

**Purpose:** Automated review of prompt configurations across all 4 levels.

### Basic Usage

```bash
# Run review
python3 scripts/diagnostics/prompt_review.py --tenant-id prismatic

# Save report
python3 scripts/diagnostics/prompt_review.py \
  --tenant-id prismatic \
  --output reports/prompt_review.md
```

### What It Checks

| Level | Checks |
|-------|--------|
| **Template** | Cat mentions, duplicate instructions, OUTPUT REQUIREMENTS |
| **Researcher** | Duplicate sections, template overlap, verbose configs |
| **Tenant** | Collection routing, researcher_guidance |
| **Schema** | Brief descriptions, missing citations |

### Sample Output

```
📊 Review Complete: 9 issues found
   Template: 0
   Researcher: 9
   Schema: 0

## Level: Researcher
### 🔵 Contains structured_output section (now in template) (industry)
**Fix:** Remove - OUTPUT REQUIREMENTS in template handles this
```

---

## 5. Benchmark Comparison (`benchmark_cli`)

**Purpose:** Compare models, prompts, or tools systematically.

### Flex Modes

```bash
# Compare models on same prompt
docker exec pomai-backend-spark python -m pom_core.cli.benchmark_cli \
  --flex model \
  --models gpt-5-mini gpt-5-nano \
  --prompt entity_researcher \
  --researcher-id product \
  --tenant-id prismatic \
  --domain example.com

# Compare prompts with same model
docker exec pomai-backend-spark python -m pom_core.cli.benchmark_cli \
  --flex prompt \
  --prompts entity_researcher domain_researcher \
  --tenant-id prismatic \
  --domain example.com

# Compare context strategies
docker exec pomai-backend-spark python -m pom_core.cli.benchmark_cli \
  --flex tool \
  --tools balanced aggressive comprehensive \
  --prompt entity_researcher \
  --researcher-id industry \
  --tenant-id prismatic
```

---

## Integrated Workflow: Full Diagnostic Suite

### Step 1: Preview Configuration

```bash
# Generate all previews
for r in product industry competitor customer leadership financial social partner journalist risk; do
  docker exec pomai-backend-spark python -m pom_core.cli.prompt_preview_cli \
    --prompt entity/entity_researcher \
    --researcher-id $r \
    --tenant-id prismatic \
    --domain example.com \
    --dry-run \
    --output /app/PomAI/reports/previews/${r}.md \
    --quiet
done
```

### Step 2: Review Configuration

```bash
# Run automated review
python3 scripts/diagnostics/prompt_review.py \
  --tenant-id prismatic \
  --output reports/config_review.md
```

### Step 3: Test Execution

```bash
# Capture execution for debugging
docker exec pomai-backend-spark python -m pom_core.cli.pomflow_cli \
  --prompt entity_researcher \
  --researcher-id product \
  --tenant-id prismatic \
  --domain example.com \
  --capture-only
```

### Step 4: Generate Reports

```bash
# Full execution with report
docker exec pomai-backend-spark python -m pom_core.cli.pomflow_cli \
  --prompt entity_researcher \
  --researcher-id product \
  --tenant-id prismatic \
  --domain example.com \
  --report \
  --output-format md
```

### Step 5: Benchmark Comparisons

```bash
# Compare before/after model changes
docker exec pomai-backend-spark python -m pom_core.cli.benchmark_cli \
  --flex model \
  --models gpt-5-mini gpt-5-nano \
  --prompt entity_researcher \
  --researcher-id product \
  --tenant-id prismatic \
  --domain example.com \
  --capture
```

---

## Quick Reference

### Common Flag Combinations

| Goal | Flags |
|------|-------|
| Quick debug | `prompt_preview --dry-run` |
| Full prompt inspection | `prompt_preview --no-dry-run` |
| Test without DB writes | `pomflow --capture-only` |
| Production run with logging | `pomflow --capture --report` |
| Model comparison | `benchmark --flex model --models A B` |
| Config audit | `prompt_review.py --tenant-id X` |

### Output Locations

| Tool | Default Output |
|------|----------------|
| prompt_preview | stdout or `--output PATH` |
| pomflow --capture | `captures/` directory |
| pomflow --report | `reports/` directory |
| prompt_review.py | stdout or `--output PATH` |
| benchmark | `reports/benchmarks/` |

---

## Future Integration (pom-core#482)

Proposed unified CLI:

```bash
# All-in-one diagnostic command
docker exec pomai-backend-spark python -m pom_core.cli.diagnostic_cli \
  --tenant-id prismatic \
  --mode full \
  --output reports/diagnostic_suite/

# Would run:
# 1. prompt_review (config audit)
# 2. prompt_preview (all researchers)
# 3. sample execution with capture
# 4. generate summary report
```

---

## Related Documentation

- [PROMPT_REVIEW_PROCESS.md](PROMPT_REVIEW_PROCESS.md) - Step-by-step review methodology
- [AI_TUNING_GUIDE.md](AI_TUNING_GUIDE.md) - Configuration hierarchy guide
- [pom-core#482](https://github.com/afctony64/pom-core/issues/482) - CLI integration issue

---

*Last updated: 2026-01-02*
