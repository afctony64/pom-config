# Entity Research Prompts

Entity research prompts for the Self-Assembling Research System. These prompts are entity-agnostic and work with any TenantGroup (corporate, travel, recipes, etc.).

---

## Current Standard

### ✅ `entity_researcher.prompty` - CURRENT STANDARD

**Purpose:** Universal entity researcher template for the Self-Assembling Research System.

**Status:** ✅ **CURRENT STANDARD** - Use this for all new entity research work.

**Key Features:**
- Entity-agnostic: works with any TenantGroup
- Source: Domain (the URL IS the entity)
- Output: Research_* collections
- Uses Page_facts for evidence (vectorized semantic search)
- Requires `researcher_ai` config (fail-fast if missing)

**Usage:**
```python
prompt_name = "entity/entity_researcher"
researcher_id = "competitor"  # or industry, financial, etc.
```

---

## Available Entity Prompts

| Prompt | Purpose | Status |
|--------|---------|--------|
| `entity_researcher.prompty` | Universal entity researcher template | ✅ **CURRENT STANDARD** |
| `entity_gap_filler.prompty` | Fill gaps in entity data | ✅ Active |
| `entity_deep_dive_intelligence.prompty` | Deep dive analysis | ✅ Active |
| `competitor_domain.prompty` | Competitor domain research | ✅ Active |
| `domain.prompty` | Domain validation | ✅ Active |

---

## ⚠️ Deprecation Notice

### `researchers/researcher.prompty` - DEPRECATED

**Status:** ⚠️ **DEPRECATED** - Do not use for new work.

**Migration:**
- **Old:** `prompt_name="researchers/researcher"`
- **New:** `prompt_name="entity/entity_researcher"`

**Why:** `entity_researcher.prompty` is the current standard with better architecture and entity-agnostic design.

---

## When to Use entity/ vs company/

### Use `entity/` prompts when:
- ✅ Entity-agnostic research (works with any TenantGroup)
- ✅ Universal research patterns
- ✅ Domain-based entity research
- ✅ Generic entity intelligence

### Use `company/` prompts when:
- ✅ Company-specific research workflows
- ✅ Domain research and validation
- ✅ Company deep dive intelligence
- ✅ Sales brief generation

**Key Difference:** `entity/` is TenantGroup-agnostic, `company/` is company-specific.

---

## Creating New Entity Prompts

1. **Determine if it belongs in entity/:**
   - Is it entity-agnostic? → `entity/`
   - Is it company-specific? → `company/`

2. **Create the prompt file:**
   ```bash
   # Copy from existing entity prompt as template
   cp entity/entity_researcher.prompty entity/my_new_prompt.prompty
   ```

3. **Required fields:**
   - `name`: Prompt name
   - `id`: Unique identifier
   - `version`: Semantic version (e.g., 1.0.0)
   - `classification`: task_type, complexity, context_size, priority

4. **Test:**
   ```bash
   docker exec pom-core-dev python scripts/prompt_validator.py prompts/entity/my_new_prompt.prompty
   ```

---

## Related Documentation

- **Architecture:** `docs/architecture/PROMPT_ARCHITECTURE.md`
- **Organization:** `docs/guides/PROMPT_ORGANIZATION_AND_DOCUMENTATION.md`
- **Ownership:** `docs/guides/PROMPT_OWNERSHIP.md`
- **Inventory:** pom-core `docs/PROMPT_INVENTORY_ANALYSIS.md`

---

**Last Updated:** 2025-01-05
