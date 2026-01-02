# Prompt Review Process

> **Systematic review of entity_researcher prompt configuration across all 4 levels**

This document captures the review methodology used to optimize the Pom Research prompt system. Use this process periodically or when adding new researchers.

---

## Overview

The prompt system has **4 configuration levels**, each reviewed independently:

```
┌─────────────────────────────────────────────────────────────────┐
│  Level 1: TEMPLATE (entity_researcher.prompty)                  │
│  └── Global methodology, output requirements                    │
├─────────────────────────────────────────────────────────────────┤
│  Level 2: RESEARCHER (researcher_ai/*.yaml)                     │
│  └── Identity, search queries, tool guidance                    │
├─────────────────────────────────────────────────────────────────┤
│  Level 3: TENANT (tenants/*.yaml)                               │
│  └── Business context, collection routing                       │
├─────────────────────────────────────────────────────────────────┤
│  Level 4: SCHEMA (schemas/Research_*.yaml)                      │
│  └── Field definitions, descriptions, sets/tags                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Review Commands

### Generate All Previews

```bash
# Generate previews for all researchers
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

### Quick Health Check

```bash
# Token estimates and schema field counts
for researcher in product industry competitor customer leadership financial social partner journalist risk; do
  echo "=== $researcher ===" 
  docker exec pomai-backend-spark python -m pom_core.cli.prompt_preview_cli \
    --prompt entity/entity_researcher \
    --tenant-id prismatic \
    --researcher-id $researcher \
    --domain example.com \
    --dry-run 2>&1 | grep -E "Token Estimate|properties in schema"
done
```

---

## Level 1: Template Review

**File:** `prompts/entity/entity_researcher.prompty`

### Checks

| Check | Command | Look For |
|-------|---------|----------|
| Duplicate instructions | `grep -c "LLM" entity_researcher.prompty` | Multiple mentions of same concept |
| Redundant sections | Visual review | Points that overlap or repeat |
| Token efficiency | Preview token estimate | Unexpectedly high token counts |
| Cat field mentions | `grep "Cat" entity_researcher.prompty` | Should be ZERO (handled by post-processing) |

### Common Issues

| Issue | Fix |
|-------|-----|
| Duplicate field instructions | Merge into single point |
| Cat field guidance | Remove (post-processing handles it) |
| Verbose schema enforcement | Simplify - strict mode handles it |
| Missing citation guidance | Add explicit citations instruction |

---

## Level 2: Researcher AI Review

**Files:** `researcher_ai/*.yaml`

### Checks

```bash
# Find duplicate sections
for f in researcher_ai/*.yaml; do
  echo "=== $f ===" 
  grep -c "citation_format:" $f
  grep -c "tool_guidance:" $f
done

# Find verbose tool_guidance (>50 lines)
wc -l researcher_ai/*.yaml | sort -n
```

### Common Issues

| Issue | Fix |
|-------|-----|
| Duplicate `citation_format` sections | Remove duplicates |
| `structured_output` guidance | Remove (now in template) |
| `array_requirements` guidance | Remove (now in template) |
| Verbose search instructions | Consolidate to essential queries |

---

## Level 3: Tenant Review

**Files:** `tenants/*.yaml`

### Checks

```bash
# List tenant configs
ls -la tenants/*.yaml

# Check for researcher_guidance usage
grep -l "researcher_guidance:" tenants/*.yaml
```

### Common Issues

| Issue | Fix |
|-------|-----|
| Unused researcher_guidance | Remove or document |
| Missing collection routing | Add required collections |

---

## Level 4: Schema Review

**Files:** `schemas/Research_*.yaml`

### Checks

```bash
# Find brief LLM field descriptions (<50 chars)
for schema in schemas/Research_*_schema.yaml; do
  grep -A3 "name:.*LLM$" $schema | grep "description:" | while read line; do
    desc=$(echo "$line" | sed 's/.*description: //')
    if [ ${#desc} -lt 50 ]; then
      echo "$schema: $desc"
    fi
  done
done

# Verify citations field exists
for schema in schemas/Research_*_schema.yaml; do
  if grep -q "name: citations" $schema; then
    echo "✅ $schema"
  else
    echo "❌ $schema - MISSING citations"
  fi
done
```

### Common Issues

| Issue | Fix |
|-------|-----|
| Brief LLM descriptions | Expand with word count and element guidance |
| Missing citations field | Add to schema |
| Inconsistent sets/tags | Standardize across schemas |

---

## Improvement Checklist

### Before Making Changes

- [ ] Generate baseline previews for all researchers
- [ ] Note current token estimates
- [ ] Document any errors or warnings

### Level 1 (Template)

- [ ] No Cat field mentions
- [ ] No duplicate instructions
- [ ] OUTPUT REQUIREMENTS ≤ 5 points
- [ ] Explicit CITATIONS guidance
- [ ] PARALLEL ARRAYS instruction

### Level 2 (Researcher AI)

- [ ] No duplicate sections in any config
- [ ] Tool guidance is researcher-specific only
- [ ] No redundant template overlap

### Level 3 (Tenant)

- [ ] Collection routing complete
- [ ] researcher_guidance used appropriately

### Level 4 (Schema)

- [ ] All LLM fields have detailed descriptions
- [ ] All schemas have citations field
- [ ] sets/tags are consistent

### After Making Changes

- [ ] Regenerate all previews
- [ ] Compare token estimates (should decrease or stay same)
- [ ] Verify no rendering errors
- [ ] Commit to pom-config
- [ ] Update PomAI with `./scripts/pom_config.sh update latest`

---

## Automated Review (Future)

A CLI tool to automate this review is planned:

```bash
# Proposed CLI interface
docker exec pomai-backend-spark python -m pom_core.cli.prompt_review_cli \
  --tenant-id prismatic \
  --output /app/PomAI/reports/prompt_review.md
```

**Features:**
- Generate all previews automatically
- Detect duplicate sections
- Find brief descriptions
- Calculate token budgets
- Generate recommendations report

See: [pom-core#482](https://github.com/afctony64/pom-core/issues/482)

---

*Last reviewed: 2026-01-02*
