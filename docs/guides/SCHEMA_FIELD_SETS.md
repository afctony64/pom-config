# Defining Schema Field Sets

**How to Add Field Sets to Schema Properties in pom-config**

This guide explains how to define field sets in schema YAML files so they can be queried at runtime by `CoreModelService` in pom-core.

---

## What Are Field Sets?

Field sets are semantic classifications for schema properties. By adding a field to a set, you're declaring that the field belongs to that category, which can then be queried programmatically.

### Example

```yaml
properties:
  - name: page_count
    dataType:
      - int
    description: Actual Page_intelligence records created
    sets:
      - standard        # Returned in standard queries
      - status_update   # Can be updated without URL discovery data
    tags:
      - metrics
      - processing
```

---

## Standard Field Sets

### Universal Sets (Use These)

| Set | When to Add | Fields Typically Included |
|-----|-------------|--------------------------|
| `standard` | Basic fields for common queries | Primary identifiers, key metrics |
| `extended` | Additional detail fields | Secondary metrics, references |
| `full` | All available data | Everything except calculated |
| `system` | System/metadata fields | `created_at`, `updated_at`, `uuid` |

### Collection-Specific Sets

| Set | Collection | Purpose |
|-----|------------|---------|
| `status_update` | Domain | Fields updatable without URL discovery |
| `url_discovery` | Domain | Fields indicating URL discovery exists |
| `LLM` | Research_* | Fields populated by LLM during research |
| `EnumCat` | Research_* | Enum classification fields |
| `VecCat` | Research_* | Vector classification fields |
| `Cat` | Research_* | All classification fields (EnumCat + VecCat) |

---

## Adding Fields to Sets

### Syntax

```yaml
properties:
  - name: field_name
    dataType:
      - text
    description: Field description
    sets:           # List of set names
      - standard
      - your_set
```

### Multiple Sets

A field can belong to multiple sets:

```yaml
- name: page_count
  sets:
    - standard       # Returned in default queries
    - extended       # Also in extended queries
    - status_update  # Can be updated without URL discovery
```

---

## Creating New Field Sets

### Step 1: Decide on Set Name

- Use `snake_case` for set names
- Be descriptive: `status_update` not `su`
- Check if an existing set fits your use case

### Step 2: Add to Relevant Properties

```yaml
# schemas/domain_schema.yaml
properties:
  - name: field_one
    sets:
      - standard
      - your_new_set   # Add to all relevant fields

  - name: field_two
    sets:
      - extended
      - your_new_set   # Add to all relevant fields
```

### Step 3: Document the Set

Update this file with your new set in the appropriate table above.

### Step 4: Test Loading

```bash
docker exec pom-core-dev python -c "
from pom_core.services.core_model_service import get_model_service
service = get_model_service()
fields = service.get_collection_fields('Domain', 'your_new_set')
print('Fields in your_new_set:', fields)
"
```

---

## Use Case Examples

### Use Case 1: Status Update Fields (Domain)

**Problem:** Domain updates should allow status-only updates (page_count, processing flags) without requiring URL discovery data.

**Solution:** Create `status_update` set for fields that can be updated independently:

```yaml
# Fields that can be updated without URL discovery data
- name: page_count
  sets: [standard, status_update]

- name: page_processing_status
  sets: [standard, status_update]

- name: page_intelligence   # CLI completion flag
  sets: [standard, status_update]
```

### Use Case 2: LLM-Populated Fields (Research)

**Problem:** Need to identify which fields are populated by LLM vs calculated.

**Solution:** Use `LLM` set:

```yaml
- name: company_summary_LLM
  sets: [standard, LLM]
  
- name: target_customer_LLM
  sets: [standard, LLM]
```

### Use Case 3: Classification Fields

**Problem:** Need to identify enum classification fields for validation.

**Solution:** Use `EnumCat` set:

```yaml
- name: industry_classification
  sets: [standard, EnumCat]
  enum: [Technology, Finance, Healthcare, ...]
```

---

## Batch Updates

Use the provided script to add a set to multiple fields:

```bash
cd ~/Projects/pom-config
python scripts/update_field_sets.py \
  --schema domain_schema.yaml \
  --fields page_count,page_processing_status,updated_at \
  --add-set status_update
```

---

## Validation

Validate your changes before committing:

```bash
python scripts/validate_all_configs.py
```

---

## Related Documentation

- **pom-core Usage:** `pom-core/docs/SCHEMA_FIELD_SETS.md`
- **pom-docs Cross-Ref:** `pom-docs/guides/development/SCHEMA_FIELD_SETS.md`
- **Creating Schemas:** `docs/guides/CREATING_SCHEMAS.md`
