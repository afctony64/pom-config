# 🗄️ Archived Prompts (DEPRECATED)

> **⚠️ WARNING: These prompts are DEPRECATED and should NOT be used!**

**Archived:** December 2024  
**Reason:** Migrated to canonical locations in pom-config

---

## Why This Archive Exists

These prompts were previously in `prompts/default/` as legacy copies from pom-core.
They have been superseded by canonical versions in the proper pom-config directories.

**DO NOT USE prompts from this archive.** Use the canonical versions instead.

---

## Canonical Locations

| Archived Prompt | Use This Instead |
|-----------------|------------------|
| `_archive/researchers/researcher.prompty` | `researchers/researcher.prompty` |
| `_archive/company/company_deep_dive_intelligence.prompty` | `company/company_deep_dive_intelligence.prompty` |
| `_archive/company/company_sales_brief_intelligence.prompty` | `company/company_sales_brief_intelligence.prompty` |
| `_archive/company/domain_research.prompty` | `company/domain_research.prompty` |
| `_archive/company/url_to_source_reverse_engineer.prompty` | `company/url_to_source_reverse_engineer.prompty` |
| `_archive/company/company_accounts_chat.prompty` | `apps/pomothy/company_accounts_chat.prompty` |
| `_archive/company/company_domain.prompty` | `entity/domain.prompty` |
| `_archive/utility/llm_gap_filler.prompty` | `utility/llm_gap_filler.prompty` |
| `_archive/utility/product_seed_generator.prompty` | `utility/product_seed_generator.prompty` |
| `_archive/utility/product_type_llm_synthesizer.prompty` | `utility/product_type_llm_synthesizer.prompty` |
| `_archive/utility/seed_generator.prompty` | `seed/seed_generator.prompty` |
| `_archive/benchmark/benchmark_fact_summary.prompty` | `benchmarks/benchmark_fact_summary.prompty` |

---

## What Still Works

The **classifiers** remain active in `default/classifiers/`:

```
prompts/default/classifiers/
├── enum_classifier.prompty         # ✅ ACTIVE - Shared classifier
└── parallel_array_enricher.prompty # ✅ ACTIVE - Shared enricher
```

These are intentionally shared utilities used by multiple applications.

---

## For Code Maintainers

If you see code referencing prompts like:
- `default/researchers/researcher`
- `default/company/company_deep_dive_intelligence`

**This is a bug!** Update to use the canonical paths without `default/` prefix:
- `researchers/researcher`
- `company/company_deep_dive_intelligence`

---

## Archive Contents

```
_archive/
├── benchmark/
│   ├── __init__.py
│   └── benchmark_fact_summary.prompty
├── company/
│   ├── company_accounts_chat.prompty
│   ├── company_deep_dive_intelligence.prompty
│   ├── company_domain.prompty
│   ├── company_sales_brief_intelligence.prompty
│   ├── domain_research.prompty
│   └── url_to_source_reverse_engineer.prompty
├── researchers/
│   └── researcher.prompty
├── utility/
│   ├── llm_gap_filler.prompty
│   ├── product_seed_generator.prompty
│   ├── product_type_llm_synthesizer.prompty
│   └── seed_generator.prompty
└── README.md (this file)
```

---

## Deletion Schedule

These archived prompts may be permanently deleted in a future release once all
applications have been verified to use the canonical locations.

**Target deletion:** v2.0.0 or later

---

*Archived by: PomAI Team, December 2024*
