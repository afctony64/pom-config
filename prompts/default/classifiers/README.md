# Classifiers

Classifiers are prompts that categorize values into predefined enum categories. They run as part of post-processing (via `classify_all` tool) to convert LLM-generated values into standardized enum categories.

---

## Available Classifiers

| Classifier | Purpose | Status |
|------------|---------|--------|
| `enum_classifier.prompty` | Classify values into enum categories (`*LLM` → `*Cat` fields) | ✅ Active |

---

## What is a Classifier?

Classifiers are prompts that:
- **Take input values** and classify them into predefined categories
- **Used for enum classification** (`*LLM` fields → `*Cat` fields)
- **Run as part of post-processing** (via `classify_all` tool)
- **Schema-aware:** Automatically extracts enum fields, values, and descriptions

### Example Use Case

```python
# Input (from LLM):
{
  "customerSizeLLM": "Large Enterprise"
}

# Output (after enum_classifier):
{
  "customerSizeLLM": "Large Enterprise",
  "customerSizeCat": "Enterprise"  # ← Classified into enum
}
```

---

## Classifiers vs Post-Tools

| Type | Purpose | Location | Example |
|------|---------|----------|---------|
| **Classifiers** | Categorize values into enums | `default/classifiers/` | `enum_classifier.prompty` |
| **Post-Tools** | Enrich/transform data after LLM response | `default/post_tools/` | `parallel_array_enricher.prompty` |

### Key Differences

**Classifiers:**
- Focus on **categorization** (enum selection)
- Input: LLM-generated text values
- Output: Standardized enum categories
- Used by `classify_all` tool

**Post-Tools:**
- Focus on **enrichment** (adding new data)
- Input: LLM response + source record
- Output: Additional fields (e.g., domains, evidence)
- Used by `post_execution_tools` in prompts

---

## Recent Cleanup

**2025-01-05:** Removed `parallel_array_enricher.prompty` from this directory.

- **Reason:** It's a post-tool (enriches data), not a classifier (categorizes values)
- **New Location:** `default/post_tools/parallel_array_enricher.prompty`
- **Result:** Only `enum_classifier.prompty` remains in this directory

---

## Adding New Classifiers

### 1. Create the Classifier Prompt

```bash
# Copy from existing classifier as template
cp default/classifiers/enum_classifier.prompty default/classifiers/my_new_classifier.prompty
```

### 2. Required Fields

```yaml
---
name: My New Classifier
id: my_new_classifier
description: "Classifies values into my categories"

stage: post_execution
category: classify  # ← Important: marks as classifier

classification:
  task_type: instruction
  complexity: simple
  context_size: small
  priority: speed

version: 1.0.0
```

### 3. Validate

```bash
docker exec pom-core-dev python scripts/prompt_validator.py prompts/default/classifiers/my_new_classifier.prompty
```

### 4. Register in classify_all Tool

If needed, register the classifier in the `classify_all` tool implementation:
- Location: `pom_core/services/prompt/tools/classify_all.py`
- Add to classifier registry

### 5. Test

```bash
# Test with sample enum values
docker exec pom-core-dev python -m pytest tests/unit/test_classify_all.py -k my_new_classifier
```

---

## Testing Requirements

All classifiers must:
- ✅ Handle single-value enum fields (e.g., `customerSizeCat`)
- ✅ Handle parallel array enum fields (e.g., `keyCustomerSizeCat`)
- ✅ Use field descriptions for context
- ✅ Return standardized enum values (not free-form text)
- ✅ Have unit tests in `tests/unit/test_classify_all.py`

---

## Related Documentation

- **Post-Tools:** `default/post_tools/README.md`
- **Architecture:** pom-core `docs/architecture/POST_TOOL_ARCHITECTURE.md`
- **Inventory:** pom-core `docs/PROMPT_INVENTORY_ANALYSIS.md`

---

**Last Updated:** 2025-01-05
