# Audit Prompts

Shared data quality audit prompts for analyzing research completeness and gaps.

## Prompts

| Prompt | Purpose |
|--------|---------|
| `product_data_audit.prompty` | Analyze product research data quality and provide recommendations |
| `research_quality_audit.prompty` | Identify research gaps and provide fix commands |

## Usage

```python
from pom_core.services.core_prompty_service import CorePromptyService

service = CorePromptyService()
template = service.get_template("default/audit/research_quality_audit")
```

## Ownership

- **Source**: Migrated from Pomothy (December 2024)
- **Scope**: Shared across all Pom applications
