# Post-Execution Tools

Post-execution tools are prompty templates that run **after** the main LLM response to enrich, classify, or transform the output.

## Overview

Post-tools process the `ai_response` from main prompts and add additional fields or perform transformations. They follow a standard interface and are reusable across different researchers.

## Available Tools

| Tool | Prompty File | Purpose | Priority |
|------|--------------|---------|----------|
| `parallel_array_enricher` | `parallel_array_enricher.prompty` | Enriches parallel array post fields using web search + page_facts | 10 |

## How Post-Tools Are Used

### 1. Declared in Main Prompts

Post-tools are declared in the main research prompt's `post_execution_tools` field:

```yaml
# researchers/researcher.prompty
post_execution_tools:
  - parallel_array_enricher
  - entity_spawn
  - enum_cat
```

### 2. Declared in Researcher Config

They can also be declared in `researcher_ai/*.yaml` configs for researcher-specific tools:

```yaml
# researcher_ai/competitor_ai.yaml
post_execution_tools:
  - parallel_array_enricher  # Researcher-specific
```

### 3. Automatic Merging

Tools from both sources are automatically merged and executed in priority order.

## Tool Details

### parallel_array_enricher

**Purpose:** Enriches parallel array elements with additional context from web search and page_facts.

**When Used:** 
- Main prompt outputs parallel arrays (e.g., `keyCompetitors`, `keyExecutives`)
- Schema has `post` fields that need enrichment (e.g., `competitorDomain`, `competitorEvidence`)

**What It Does:**
1. Detects parallel array groups with `post` fields
2. For each element in the anchor array:
   - Runs `parallel_array_enricher.prompty` with web search + page_facts
   - Extracts field values for `post` fields
3. Returns enriched arrays matching anchor length

**Inputs:**
- `element`: The anchor element (e.g., "Boomi")
- `anchor_field`: Anchor field name (e.g., "keyCompetitors")
- `row_context`: Other parallel field values for this row
- `post_fields`: Fields to fill (from schema)
- `source_context`: Source entity context (domain, title, industry)

**Outputs:**
- Dict with field names as keys (e.g., `{"competitorDomain": "boomi.com"}`)

**See Also:**
- `docs/architecture/POST_TOOL_ARCHITECTURE.md` - Complete architecture guide
- `pom_core/services/prompt/tools/parallel_array_enricher.py` - Implementation

## Finding What Post-Tools Are Used

### For a Specific Prompt

```bash
# Check prompty file
grep -A 5 "post_execution_tools" prompts/researchers/researcher.prompty

# Check researcher config
grep -A 5 "post_execution_tools" researcher_ai/competitor_ai.yaml
```

### For All Prompts

```bash
# List all prompts with post-execution tools
grep -l "post_execution_tools" prompts/**/*.prompty

# See what tools each uses
grep -B 2 -A 5 "post_execution_tools" prompts/**/*.prompty
```

### Programmatically

```python
from pom_core.services.core_prompty_service import get_core_prompty_service

service = get_core_prompty_service()
template = service.get_template("researchers/researcher")

# Get post-execution tools from template
config = template.config if hasattr(template, 'config') else {}
post_tools = config.get('post_execution_tools', [])
print(f"Post tools: {post_tools}")
```

## Standard Interface

All post-tools follow this signature:

```python
async def run_<tool_name>(
    record: dict[str, Any],          # Source record
    ai_response: dict[str, Any],     # LLM output from main prompt
    schema_id: str,                  # Target schema
    tenant_id: str,                  # Tenant identifier
    source_context: dict[str, Any],  # Context from source record
    **kwargs,                        # Additional config
) -> dict[str, Any]:
    """
    Returns:
        {
            "success": bool,
            "fields": dict,      # Fields to merge into record
            "metadata": dict,    # Diagnostics/stats
            "error": str | None
        }
    """
```

## Organization

Post-tool prompty files are organized in:
- `prompts/default/post_tools/` - Shared post-tools (pom-config)
- `prompts/post_tools/` - App-specific post-tools (if any)

**Note:** Post-tools are different from:
- **Runtime tools** (`tools:` in prompty) - Called by LLM during execution
- **Data injectors** (`data_requirements.injectors`) - Run before LLM call

## Documentation

- **Architecture:** `docs/architecture/POST_TOOL_ARCHITECTURE.md`
- **Usage Guide:** `docs/guides/POST_EXECUTION_TOOLS_USAGE.md`
- **Prompt System:** `docs/architecture/PROMPT_ARCHITECTURE.md`
