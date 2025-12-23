# Analysis Prompts

Shared analysis prompts for extracting insights from data.

## Prompts

| Prompt | Purpose |
|--------|---------|
| `analyze_table_component.prompty` | Extract key insights from markdown tables for report sections |

## Usage

```python
from pom_core.services.core_prompty_service import CorePromptyService

service = CorePromptyService()
template = service.get_template("default/analysis/analyze_table_component")
```

## Ownership

- **Source**: Migrated from Pomothy (December 2024)
- **Scope**: Shared across all Pom applications
