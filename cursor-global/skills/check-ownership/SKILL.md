---
name: check-ownership
description: Verify file ownership before modifying pom-config or pom-docs. MUST be used before any write to shared repositories. Use when modifying files in pom-config/, pom-docs/, or when crossing repository boundaries.
---

# Check Ownership Before Writing

## CRITICAL: When This Skill Applies

This skill is **MANDATORY** before modifying:
- Any file in `pom-config/`
- Any file in `pom-docs/`
- Any cross-repository modification

## Step 1: Identify Yourself

Determine which AI agent you are by checking your workspace:

| Workspace | You Are |
|-----------|---------|
| PomSpark | `PomSpark` |
| pom-core | `pom-core` |
| PomAI | `PomAI` |
| Pomothy | `Pomothy` |
| pom-config | Context-dependent (check who opened you) |
| pom-docs | Context-dependent (check who opened you) |

## Step 2: Check Ownership File

Before modifying a file in pom-config or pom-docs:

```bash
# For pom-config
cat /Users/tonyeales/Projects/pom-config/OWNERSHIP.yaml

# For pom-docs  
cat /Users/tonyeales/Projects/pom-docs/OWNERSHIP.yaml
```

## Step 3: Verify Your Access

Find your agent in the OWNERSHIP.yaml and check:

1. **Is the path in your `can_write` list?** → Proceed with modification
2. **Is the path in your `read_only` list?** → STOP. Do not modify.
3. **Is the path not listed?** → Default to READ-ONLY. Do not modify.

## Step 4: If You Don't Have Access

If you need to modify a path you don't own:

1. **File an issue** in the owning repo:
   ```bash
   gh issue create --repo afctony64/<owner-repo> \
     --title "Request: Modify <path>" \
     --body "I need to modify <path> because..."
   ```

2. **Or ask the human**: "I need to modify `<path>` but it's owned by `<owner>`. Should I proceed?"

## Quick Reference: Common Paths

### pom-config

| Path | Owner | Others Can Write? |
|------|-------|-------------------|
| `profiles/` | PomSpark | No |
| `schemas/` | pom-core | No |
| `llm_models/` | pom-core | No |
| `prompts/` | PomAI | Pomothy |
| `ux_configs/` | Pomothy | No |
| `researcher_ai/` | PomAI | No |
| `data_cards/` | PomAI | No |
| `tools/` | pom-core | No |

### pom-docs

| Path | Owner | Others Can Write? |
|------|-------|-------------------|
| `docs/infrastructure/` | PomSpark | No |
| `docs/modes/` | PomSpark | No |
| `docs/api/` | pom-core | No |
| `docs/development/` | pom-core | No |
| `docs/architecture/` | Shared | All agents |
| `docs/workflows/` | Shared | All agents |

## Enforcement

```
⛔ VIOLATION: Modifying a path in your read_only list
✅ ALLOWED: Modifying a path in your can_write list
⚠️ ASK HUMAN: If uncertain about access
```
