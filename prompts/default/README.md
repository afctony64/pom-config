# Default Prompts

> **Status:** Only shared classifiers remain active

---

## ✅ Active Prompts (Shared Classifiers)

Only these prompts should be used from `default/`:

```
default/
└── classifiers/
    ├── enum_classifier.prompty         # Universal enum classification
    └── parallel_array_enricher.prompty # Parallel array processing
```

These are **shared utilities** used by multiple applications and are intentionally kept here.

---

## ⚠️ Deprecated Content Moved to Archive

All other prompts that were in `default/` have been **moved to `_archive/`**.

| Old Location | Status | Canonical Location |
|--------------|--------|--------------------|
| `default/researchers/` | 🗄️ Archived | `researchers/` |
| `default/company/` | 🗄️ Archived | `company/` |
| `default/utility/` | 🗄️ Archived | `utility/` and `seed/` |
| `default/benchmark/` | 🗄️ Archived | `benchmarks/` |

**See:** `prompts/_archive/README.md` for full mapping.

---

## Usage

### Accessing Classifiers

```python
from pom_core.services.core_model_service import get_core_model_service

service = get_core_model_service()

# Access shared classifiers (both paths work)
template = service.get_template("default/classifiers/enum_classifier")
# OR
template = service.get_template("classifiers/enum_classifier")
```

### For Other Prompts

Use the canonical locations without `default/` prefix:

```python
# ✅ CORRECT - Use canonical paths
template = service.get_template("researchers/researcher")
template = service.get_template("company/company_deep_dive_intelligence")

# ❌ WRONG - These are archived
# template = service.get_template("default/researchers/researcher")
```

---

## Why Only Classifiers?

Classifiers are:
1. **Truly shared** - Used identically by all Pom applications
2. **Infrastructure-level** - Not app-specific business logic
3. **Stable** - Rarely change once defined

All other prompts (researchers, company, etc.) are **application-level** and belong
in their canonical locations where they can be versioned and evolved appropriately.

---

*Last updated: December 2024*
