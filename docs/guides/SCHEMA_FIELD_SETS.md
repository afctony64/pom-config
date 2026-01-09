# Schema Field Sets & Tags: Complete Reference

**Defining and Using Field Classification in Pom Schemas**

This guide provides a complete reference for field sets and tags in pom-config schemas, including how they're used by data cards, prompts, database operations, and reporting.

---

## Table of Contents

1. [Overview](#overview)
2. [Field Sets](#field-sets)
   - [Standard Sets](#standard-field-sets)
   - [Functional Sets](#functional-field-sets)
   - [Classification Sets](#classification-field-sets)
   - [Operational Sets](#operational-field-sets)
3. [Field Tags](#field-tags)
   - [Processing Tags](#processing-tags)
   - [Domain Tags](#domain-tags)
4. [Usage by Component](#usage-by-component)
   - [Data Cards](#data-cards)
   - [Prompts & LLM](#prompts--llm)
   - [Database Operations](#database-operations)
   - [Reporting](#reporting)
5. [How to Add New Sets/Tags](#how-to-add-new-setstags)
6. [Best Practices](#best-practices)

---

## Overview

### What Are Field Sets?

**Field sets** are semantic groupings of schema properties that control:
- **Which fields to return** in queries (via data cards)
- **Which fields LLMs should populate** (via prompts)
- **Which fields can be updated** (via upsert validation)
- **Which fields to include in reports** (via reporting tools)

### What Are Field Tags?

**Field tags** are metadata labels on individual fields that:
- **Categorize fields** by purpose (e.g., `LLM`, `Cat`, `research`)
- **Enable filtering** (e.g., "get all LLM-tagged fields")
- **Drive processing** (e.g., `EnumCat` triggers enum classification)

### Sets vs Tags

| Aspect | Field Sets | Field Tags |
|--------|------------|------------|
| Purpose | Control field inclusion in queries | Categorize/filter fields |
| Query Logic | OR (field in ANY set) | OR (field has ANY tag) |
| Combined Logic | AND with tags | AND with sets |
| Example | `field_set: [extended, array]` | `field_tags: ['LLM', 'Cat']` |

---

## Field Sets

### Standard Field Sets

These are the core field sets used across all collections:

| Set | Purpose | Includes | Usage |
|-----|---------|----------|-------|
| `standard` | Basic fields for default views | Core identity and summary fields | Default data card queries |
| `extended` | Additional context fields | Standard + detailed analysis | Detailed views, research output |
| `system` | Metadata/internal fields | uuid, created_at, updated_at, tenant | Audit, system operations |
| `all` | Every field in collection | All properties | Export, debugging |

#### Hierarchy

```
all
 └── extended
      └── standard
           └── (minimal)

system (independent - always included)
```

**Note:** `extended` includes all `standard` fields. `all` includes everything.

### Functional Field Sets

Sets that group fields by data type or function:

| Set | Purpose | Fields Included | Usage |
|-----|---------|-----------------|-------|
| `array` | Array/list fields | `text[]`, `number[]`, multi-value | Data cards needing arrays |
| `prompt` | LLM-populated fields | Fields set by AI prompts | Prompt schema injection |
| `spawn` | Spawning source fields | Arrays that spawn child records | Entity spawning pipelines |
| `identifier` | Identity fields | domain, url, entity keys | Deduplication, lookups |
| `metadata` | Metadata fields | source, timestamps, flags | Audit trails |

#### Array Fields Critical Note

**⚠️ Arrays are NOT in `standard` or `extended`!**

To include array fields, you MUST explicitly request them:

```yaml
# ✅ Correct - includes arrays
field_set: [extended, array]

# ❌ Wrong - arrays excluded
field_set: extended
```

### Classification Field Sets

Sets used by the classification system:

| Set | Purpose | Processing | Usage |
|-----|---------|------------|-------|
| `EnumCat` | Enum-based classification | Classifiers select from enum values | Category fields |
| `VecCat` | Vector similarity classification | Classifiers use vector matching | Semantic category fields |

**Example Schema:**

```yaml
- name: competitorThreatLevelCat
  dataType:
    - text
  description: "Threat level: [high, medium, low]"
  enum:
    - high
    - medium
    - low
  sets:
    - extended
    - EnumCat  # ← Triggers enum classification
  tags:
    - Cat
    - classification
```

### Operational Field Sets

Sets that control runtime behavior:

| Set | Purpose | Used By | Example Fields |
|-----|---------|---------|----------------|
| `status_update` | Status-only updates | `upsert.py` validation | page_count, page_processing_status |
| `url_discovery` | URL discovery data | `upsert.py` validation | discovered_sitemaps, all_sitemap_urls |
| `drill_down` | Drill-down views | DataFactory | Key summary fields |

#### status_update Set

Fields in `status_update` can be updated without URL discovery data (for Domain collection):

```yaml
# Domain schema - status_update fields
- name: page_count
  sets:
    - standard
    - status_update  # ← Can be updated independently
```

**Usage in upsert.py:**

```python
# Schema-driven validation
status_fields = _get_schema_field_set("Domain", "status_update")
is_status_only = all(key in status_fields for key in props.keys())
```

---

## Field Tags

### Processing Tags

Tags that drive processing behavior:

| Tag | Purpose | Processing | Example |
|-----|---------|------------|---------|
| `LLM` | AI-populated field | Included in LLM prompts | researchSummaryLLM |
| `Cat` | Classification field | Classification pipeline | competitorThreatLevelCat |
| `research` | Research output | Research queries | All researcher outputs |
| `processing` | Processing metadata | Pipeline tracking | page_processing_status |
| `temporal` | Time-based field | Time filtering | created_at, updated_at |

### Domain Tags

Tags that categorize by business domain:

| Tag | Domain | Example Fields |
|-----|--------|----------------|
| `identity` | Core identification | domain, url, name |
| `web` | Web presence | siteReadable, contentType |
| `financial` | Financial data | revenue, fundingTotal |
| `social` | Social media | socialFollowers, engagement |
| `industry` | Industry classification | naicsCode, sicCode |
| `metrics` | Numeric metrics | page_count, url_intelligence_count |
| `intelligence` | Analysis output | All research findings |
| `security` | Security assessment | securityScore, vulnerabilities |

---

## Usage by Component

### Data Cards

Data cards use `field_set` and `field_tags` to control query scope:

```yaml
# pom-config/data_cards/entity_research.yaml
id: entity_research
collection: Domain

parameters:
  relationship_traversal: true
  field_tags: ['Cat', 'LLM', 'research']  # Filter by tags

collections:
  - collection: Domain
    field_set: extended

  - collection: Research_competitor
    field_set: [extended, array]  # Include arrays!

  - collection: Research_customer
    field_set: [extended, array]
```

**Query Logic:**

1. Get fields matching `field_set` (OR logic within set list)
2. Filter to fields with ANY of `field_tags` (AND with sets, OR within tags)

**Example Result:** Fields in `extended` OR `array` sets that have `Cat`, `LLM`, OR `research` tags.

### Prompts & LLM

Prompts use sets and tags to control schema injection:

#### Which Fields LLMs See

```python
# pom_core/services/prompt/flat_schema_generator.py

def _filter_prompt_fields(self, schema_fields):
    """Filter to fields researchers should populate."""
    for field in schema_fields:
        # Skip system fields
        if "system" in field_sets:
            continue

        # Skip classification fields (handled by classifiers)
        if "EnumCat" in field_sets or "VecCat" in field_sets:
            continue

        # Include prompt fields
        prompt_fields.append(field)
```

**Rules:**
- ✅ Include: Fields with `prompt` set or `LLM` tag
- ❌ Exclude: Fields with `system` set only
- ❌ Exclude: Fields with `EnumCat` or `VecCat` sets (handled by classifiers)

#### Classification Processing

```python
# pom_core/services/prompt/tools/prompt_tool_executor.py

def _extract_schema_context(schema_id):
    """Extract classification field configuration."""
    for prop in schema.get("properties", []):
        sets = prop.get("sets", [])

        # EnumCat: enum-based classification
        if "EnumCat" in sets:
            enum_fields[name] = {
                "enum_values": prop.get("enum", []),
                "source_field": name.replace("Cat", "LLM"),
            }

        # VecCat: vector similarity classification
        if "VecCat" in sets:
            vec_fields[name] = {"description": description}
```

### Database Operations

#### Upsert Validation (Domain)

```python
# pom_core/database/weaviate/modules/data/upsert.py

if schema_id.lower() == "domain":
    # Get fields from schema (not hardcoded!)
    status_fields = _get_schema_field_set("Domain", "status_update")
    url_discovery_fields = _get_schema_field_set("Domain", "url_discovery")

    # Status-only updates allowed without URL discovery
    is_status_only = all(key in status_fields for key in props.keys())

    if not is_status_only:
        # Require URL discovery data for content updates
        has_url_data = any(key in props for key in url_discovery_fields)
        if not has_url_data:
            return False, record, "No URL discovery data"
```

#### Field Resolution

```python
# CoreModelService field resolution

# Get fields by set
fields = service.get_collection_fields("Domain", "status_update")
# Returns: ['page_count', 'page_processing_status', ...]

# Get fields by tags
fields = service.get_collection_fields_by_tags("Research_product", ["LLM", "research"])
# Returns: ['productSummaryLLM', 'keyFeaturesLLM', ...]
```

### Reporting

Reports can use field sets to control output:

```python
# Example: Export only standard fields
fields = service.get_collection_fields("Domain", "standard")
export_data(records, fields)

# Example: Export everything
fields = service.get_collection_fields("Domain", "all")
export_data(records, fields)

# Example: Export only metrics
fields = service.get_collection_fields_by_tags("Domain", ["metrics"])
report_metrics(records, fields)
```

---

## How to Add New Sets/Tags

### Adding a New Field Set

1. **Identify fields** that belong together
2. **Add set to each field** in schema:

```yaml
# pom-config/schemas/your_schema.yaml
- name: your_field
  dataType:
    - text
  sets:
    - standard
    - your_new_set  # ← Add here
```

3. **Commit and push pom-config:**

```bash
cd ~/Projects/pom-config
git add schemas/
git commit -m "feat: Add your_new_set to schema fields"
git push origin main
```

4. **Use in pom-core via CoreModelService:**

```python
from pom_core.services.core_model_service import get_model_service

service = get_model_service()
fields = service.get_collection_fields("Your_collection", "your_new_set")
```

### Adding a New Field Tag

1. **Add tag to relevant fields:**

```yaml
- name: your_field
  tags:
    - existing_tag
    - your_new_tag  # ← Add here
```

2. **Use via CoreModelService:**

```python
fields = service.get_collection_fields_by_tags("Collection", ["your_new_tag"])
```

---

## Best Practices

### 1. Use Sets for Grouping, Tags for Filtering

```yaml
# ✅ Good: Set for group, tag for category
sets:
  - extended
  - array
tags:
  - LLM
  - research

# ❌ Bad: Mixing concerns
sets:
  - LLM  # Should be a tag
tags:
  - extended  # Should be a set
```

### 2. Always Include `standard` or `extended` with `array`

```yaml
# ✅ Correct: Combined sets
field_set: [extended, array]

# ❌ Incomplete: Only arrays, no context
field_set: array
```

### 3. Use Schema-Driven Approach in Code

```python
# ✅ Good: Schema-driven
fields = service.get_collection_fields("Domain", "status_update")

# ❌ Bad: Hardcoded
status_fields = {"page_count", "page_processing_status", ...}
```

### 4. Document New Sets/Tags

When adding new sets or tags:
- Update this guide
- Add to schema descriptions
- Update pom-core docs if code changes needed

---

## Complete Set/Tag Reference

### All Standard Sets

| Set | Purpose | Collections |
|-----|---------|-------------|
| `standard` | Basic fields | All |
| `extended` | Detailed fields | All |
| `system` | Metadata | All |
| `all` | Everything | All |
| `array` | Array fields | Research_*, Page_* |
| `prompt` | LLM fields | Research_* |
| `spawn` | Spawning sources | Research_* |
| `EnumCat` | Enum classification | Research_* |
| `VecCat` | Vector classification | Research_* |
| `identifier` | Identity fields | All |
| `metadata` | Metadata fields | All |
| `drill_down` | Summary view | Research_* |
| `status_update` | Status updates | Domain |
| `url_discovery` | URL discovery | Domain |

### All Standard Tags

| Tag | Purpose | Example Fields |
|-----|---------|----------------|
| `LLM` | AI-populated | *LLM fields |
| `Cat` | Classification | *Cat fields |
| `CIT` | Citation field | *CIT fields |
| `provenance` | Source tracking | citations, *CIT fields |
| `research` | Research output | All researcher fields |
| `identity` | Core identity | domain, url, name |
| `web` | Web presence | siteReadable, contentType |
| `metrics` | Numeric metrics | page_count, score fields |
| `temporal` | Time fields | created_at, updated_at |
| `processing` | Pipeline state | page_processing_status |
| `financial` | Financial data | revenue, funding |
| `social` | Social media | followers, engagement |
| `industry` | Industry codes | naics, sic |
| `intelligence` | Analysis output | Research findings |
| `security` | Security data | Security scores |
| `classification` | Category fields | All Cat fields |
| `audit` | Audit trail | Source, timestamps |

---

## CIT (Citation) Fields

The Cat/LLM/CIT triad pattern enables field-level source tracking for AI-generated content:

| Field Type | Suffix | Purpose | Example |
|------------|--------|---------|---------|
| Cat | `*Cat` | Classification from enum/vector | `pricingModelCat` |
| LLM | `*LLM` | AI-generated analysis text | `pricingModelLLM` |
| CIT | `*CIT` | Source URLs for that analysis | `pricingModelCIT` |

### CIT Field Pattern

Each CIT field follows this structure:

```yaml
- name: {topic}CIT
  dataType:
    - text[]
  description: "Source URLs supporting the {topic}LLM analysis. Cite page URLs from pageData or web_search."
  moduleConfig:
    text2vec-weaviate:
      skip: true
  tags:
    - CIT
    - provenance
  sets:
    - prompt
  metadata:
    source_llm: {topic}LLM
    order: {llm_order + 1}
```

### Usage Rules

- **LLM fields**: Contain FACTS ONLY (no inline URLs)
- **CIT fields**: Contain source URLs that support the specific LLM analysis
- **Global `citations` field**: Contains ALL URLs used anywhere in the record
- A URL can appear in both a CIT field AND the global `citations` array

### Example

```yaml
# Input from LLM:
pricingModelLLM: "Offers tiered enterprise pricing with custom contracts for large deployments"
pricingModelCIT: ["https://example.com/pricing", "https://example.com/enterprise"]
citations: ["https://example.com/pricing", "https://example.com/enterprise", "https://example.com/about"]
```

---

## Related Documentation

- **pom-core:** `docs/SCHEMA_FIELD_SETS.md` - Using field sets in code
- **pom-docs:** `guides/development/SCHEMA_FIELD_SETS.md` - Cross-repo reference
- **Data Cards:** `docs/guides/DATA_CARD_QUERYING_COMPLETE_GUIDE.md`
- **CoreModelService:** `pom-core/docs/README_COREMODELSERVICE.md`
