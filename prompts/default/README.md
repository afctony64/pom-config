# Core Default Prompts

**Purpose:** Core prompts available to all applications as defaults.

---

## ⚠️ DEPRECATION NOTICE (December 2024)

**Most prompts in this directory are DEPRECATED.**

Only the following should remain in pom-core:
- `classifiers/` - Shared utility classifiers

All other prompts are deprecated and should use their canonical versions in PomAI or Pomothy.

See the parent [README.md](../README.md) for full deprecation details.

---

## 📁 Structure

```
default/
├── classifiers/     # ✅ KEEP - Shared utility classifiers
├── benchmark/       # ⚠️ DEPRECATED - Use PomAI version
├── company/         # ⚠️ DEPRECATED - Use PomAI/Pomothy version
├── researchers/     # ⚠️ DEPRECATED - Use PomAI version
└── utility/         # ⚠️ DEPRECATED - Use PomAI version
```

---

## ✅ Prompts That Belong Here

### Shared Classifiers
These are correctly in pom-core because they're used by multiple applications:

| Prompt | Purpose |
|--------|---------|
| `classifiers/enum_classifier.prompty` | Universal enum classification |
| `classifiers/parallel_array_enricher.prompty` | Parallel array processing |

---

## 🎯 Usage

### In pom-core (testing):
```python
from pom_core.services.core_prompty_service import CorePromptyService

service = CorePromptyService()
# Finds: pom_core/config/prompts/default/classifiers/enum_classifier.prompty
template = service.get_template("default/classifiers/enum_classifier")
```

### In Apps (PomAI/Pomothy):
```python
# Search order:
# 1. App prompts: core/config/prompts/classifiers/enum_classifier.prompty (if exists)
# 2. pom-core defaults: pom_core/config/prompts/default/classifiers/enum_classifier.prompty (fallback)

service = CorePromptyService()
# Uses app-specific first, falls back to pom-core default
template = service.get_template("classifiers/enum_classifier")
```

---

## ✅ Benefits

1. **Single Source of Truth** - Shared classifiers in pom-core
2. **No Duplication** - Apps don't need to copy shared classifiers
3. **Easy Override** - Apps can override with app-specific versions
4. **Clear Ownership** - App-specific prompts stay in apps

---

## 📝 Adding Prompts

When adding a new prompt:

1. **Is it a shared classifier/utility?** - Used by multiple apps?
   - ✅ Yes → Add to `default/classifiers/`
   - ❌ No → Add to the owning app (PomAI or Pomothy)

2. **Is it app-specific research/chat?**
   - Research prompts → Add to **PomAI**
   - Chat prompts → Add to **Pomothy**
   - ❌ Do NOT add app-specific prompts to pom-core

---

**Related:** Issue #269 - Deprecate duplicate prompts

**Status:** Deprecated prompts remain for backward compatibility but should not be used for new development.
