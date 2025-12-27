# Data Card Compliance Report

**Date:** 2025-12-26  
**Version:** v4.0.3  
**Purpose:** Verify data cards comply with new field_set/field_tags rules

---

## ✅ Fully Compliant

### `entity_research`
**Status:** ✅ **FULLY COMPLIANT**

All Research_* collections have `field_set: [extended, array]`:
- ✅ Research_industry
- ✅ Research_financial
- ✅ Research_product
- ✅ Research_customer
- ✅ Research_leadership
- ✅ Research_competitor
- ✅ Research_partner
- ✅ Research_risk
- ✅ Research_journalist
- ✅ Research_social

**Result:** Arrays are correctly included (verified working with yoco.com test).

---

## ⚠️ Needs Review

### `research_search`
**Status:** ⚠️ **REVIEW NEEDED**

**Current State:**
- 10 Research_* collections listed
- No `field_set` specified (defaults to 'standard')
- Arrays will be **excluded**

**Analysis:**
- Purpose: "Semantic/keyword search across Research_* collections"
- Description says: "Searches ALL searchable text properties"
- Field tags: `['Cat', 'LLM', 'research']` (all tags)

**Recommendation:**
- **If search results should include arrays:** Add `field_set: [extended, array]` to each Research_* collection
- **If search results don't need arrays:** Current default is acceptable (search typically focuses on text fields)

**Decision Needed:** Does search need to return array fields like `keyCompetitors`, `keyCustomers`, etc.?

---

### `research_by_researcher_id`
**Status:** ⚠️ **REVIEW NEEDED**

**Current State:**
- 1 Research_* collection (Research_product as default)
- No `field_set` specified (defaults to 'standard')
- Arrays will be **excluded**

**Analysis:**
- Purpose: "Query a specific Research_* collection by researcher_id"
- Description says: "Supports all field types (Cat, LLM, research)"
- Field tags: `['Cat', 'LLM', 'research']` (all tags)

**Recommendation:**
- **SHOULD include arrays:** Description says "all field types" which implies arrays should be included
- **Fix:** Add `field_set: [extended, array]` to Research_product collection

**Example Fix:**
```yaml
collections:
  - collection: Research_product
    field_set: [extended, array]  # ✅ Add this
    required: true
```

---

## 📊 Summary

| Card | Status | Research Collections | Arrays Included? | Action Needed |
|------|--------|---------------------|------------------|---------------|
| `entity_research` | ✅ Compliant | 10 | ✅ Yes | None |
| `research_search` | ⚠️ Review | 10 | ❌ No | Decision: Include arrays? |
| `research_by_researcher_id` | ⚠️ Review | 1 | ❌ No | **Fix: Add `[extended, array]`** |

---

## 🔧 Recommended Fixes

### Fix 1: `research_by_researcher_id`

**File:** `data_cards/research_by_researcher_id.yaml`

**Change:**
```yaml
collections:
  - collection: Research_product
    field_set: [extended, array]  # Add this line
    required: true
```

**Reason:** Description says "all field types" which should include arrays.

---

### Fix 2: `research_search` (Optional)

**File:** `data_cards/research_search.yaml`

**Decision:** Does search need arrays?

**If YES (recommended for completeness):**
```yaml
collections:
  - collection: Research_industry
    field_set: [extended, array]
  - collection: Research_financial
    field_set: [extended, array]
  # ... repeat for all 10 collections
```

**If NO (current is fine):**
- Keep as-is if search results don't need array fields
- Arrays are typically not searchable text, so exclusion may be intentional

---

## 📝 Compliance Checklist

For each data card with Research_* collections:

- [ ] Does it need arrays? (e.g., `keyCompetitors`, `keyCustomers`, `products`, etc.)
- [ ] If YES: Does it have `field_set: [extended, array]` or `field_set: array`?
- [ ] If NO: Is the exclusion intentional? (document why)

---

## 🎯 Best Practices

1. **Always specify `field_set`** for Research_* collections (don't rely on default 'standard')
2. **Use `[extended, array]`** if you need both scalar and array fields
3. **Use `array`** if you only need arrays
4. **Document intentional exclusions** in card description

---

**Last Updated:** 2025-12-26  
**Checked By:** pom-core compliance checker
