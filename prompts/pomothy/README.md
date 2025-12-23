# Pomothy Prompts

Prompts owned by the Pomothy application for report generation and UI interactions.

## Directory Structure

```
pomothy/
└── reports/
    ├── research_synopsis.prompty      # Executive summary synthesis
    └── researcher_synopsis.prompty    # Individual researcher synopsis
```

## Reports Prompts

| Prompt | Purpose |
|--------|---------|
| `research_synopsis.prompty` | Synthesize research from multiple analysts into executive summary |
| `researcher_synopsis.prompty` | Generate strategic synopsis from individual researcher data |

## Usage

```python
from pom_core.services.core_prompty_service import CorePromptyService

service = CorePromptyService()
# Pomothy-specific prompts use pomothy/ namespace
template = service.get_template("pomothy/reports/research_synopsis")
```

## Ownership

- **Owner**: Pomothy team
- **Source**: Migrated from Pomothy core/config/prompts/ (December 2024)
- **Scope**: Pomothy application only

## Related

- Report cards: Define how these prompts are executed within reports
- Data cards: Define data sources used by these prompts
