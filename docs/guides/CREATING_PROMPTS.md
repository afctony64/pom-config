# Creating Prompts

**Guide to defining AI instruction templates with PromptyTemplate**

Prompts define how AI models analyze entities - what inputs they receive, what data is injected, and what output is expected.

---

## Table of Contents

1. [Overview](#overview)
2. [File Structure](#file-structure)
3. [Prompty Format](#prompty-format)
4. [Configuration Sections](#configuration-sections)
5. [Template Variables](#template-variables)
6. [Data Injection](#data-injection)
7. [Complete Example](#complete-example)
8. [Validation](#validation)

---

## Overview

### What is a Prompt?

A prompt defines:
- **Inputs** - What data the prompt needs
- **Data requirements** - What data to inject (pages, MCP tools)
- **Model configuration** - Which LLM to use
- **System prompt** - Instructions for the AI
- **Processing config** - Where to write output

### Prompt Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  Execution Engine                                                   │
│                                                                     │
│  1. Load prompt template                                            │
│  2. Inject context (tenant, tenant_group, researcher_ai)            │
│  3. Execute data injectors (page_facts, MCP tools)                  │
│  4. Render Jinja2 template with all data                            │
│  5. Send to LLM                                                     │
│  6. Parse JSON response                                             │
│  7. Write to target collection (if processing_config)               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## File Structure

Prompts are located in:

```
pom-config/
└── prompts/
    ├── entity/
    │   ├── entity_researcher.prompty    # Main researcher template
    │   ├── domain.prompty
    │   └── competitor_domain.prompty
    ├── researchers/
    │   ├── researcher.prompty
    │   └── fact_extractor.prompty
    ├── company/
    │   └── company_deep_dive.prompty
    ├── pomothy/
    │   └── reports/
    │       ├── research_synopsis.prompty
    │       └── researcher_synopsis.prompty
    └── default/
        ├── analysis/
        └── classifiers/
```

**Naming convention:** `{purpose}.prompty`

---

## Prompty Format

A `.prompty` file has two sections:

1. **YAML Front Matter** - Configuration (between `---` markers)
2. **Template Content** - Jinja2 template for the prompt

```yaml
---
name: Prompt Name
description: What this prompt does

inputs:
  # Input definitions

model:
  # LLM configuration

processing_config:
  # Output routing
---
# Jinja2 Template Content

system:
## Your System Prompt

{{ variable }}
```

---

## Configuration Sections

### Name and Description

```yaml
---
name: Entity Researcher
description: |
  Universal entity researcher template.
  Works with any TenantGroup (corporate, influencer, etc.)
```

### Defaults

Safe default values:

```yaml
defaults:
  max_content_chars: 2500
```

### Inputs

Define required and optional inputs:

```yaml
inputs:
  # Required inputs
  record:
    description: Domain record data to analyze
    type: object
  researcher_id:
    description: Dynamic researcher ID (industry, audience, etc.)
    type: string

  # Context injection (automatic)
  tenant:
    description: TenantConfig object
    type: object
    default: null
  tenant_group:
    description: TenantGroupConfig object
    type: object
    default: null
  researcher_ai:
    description: ResearcherAIConfig
    type: object
    required: true  # Fail if missing

  # Data injection
  pageData:
    description: Injected page content from Page_facts
    type: array
    default: null
```

### Data Requirements

Define how data is injected:

```yaml
data_requirements:
  injectors:
    # Page facts injection (semantic search)
    - injector_template: page_facts_vector
      template_vars:
        domain: "{{ record.domain }}"
        researcher_type: "{{ record._researcher_id }}"
        search_query: "{{ researcher_ai.search_query }}"
        min_certainty: 0.15
        limit: 100
        inject_as: pageData

    # Optional MCP tool injection
    - injector_template: mcp
      template_vars:
        tool: edgar_company_facts
        params:
          cik: "{{ record.stockSymbol }}"
        inject_as: edgarData
      optional: true
```

### Model Configuration

```yaml
model:
  api: chat  # or 'responses' for reasoning models
  configuration:
    type: openai_chat  # Direct adapter: openai_chat, ollama, anthropic, google
    model: gpt-5-mini
  parameters:
    max_output_tokens: 8000
    response_format:
      type: json_schema
      json_schema:
        name: researcher_output
        strict: true
        schema:
          type: object
          properties: {}  # Dynamic from schema
```

### Processing Config

```yaml
processing_config:
  source_collection: Domain
  target_collections:
    - Research_industry
  required_processing_flags:
    researcher_processing_status: null
  max_turns: 15
  iteration_parameter: researcher_id
  iteration_values: "TENANT_GROUP_RESEARCHERS"
  compression_strategy: balanced

post_execution_tools:
  - classify_all
```

---

## Template Variables

### Available Variables

| Variable | Type | Description |
|----------|------|-------------|
| `record` | object | Entity record being analyzed |
| `tenant` | TenantConfig | Tenant configuration |
| `tenant_group` | TenantGroupConfig | Tenant group configuration |
| `researcher_ai` | ResearcherAIConfig | Researcher configuration |
| `pageData` | array | Injected page content |
| `defaults` | object | Default values from config |

### Accessing Nested Properties

```jinja2
{# Get property from record #}
{% set props = record.get('properties') or record %}
{{ props.get('domain') }}

{# Researcher identity #}
{{ researcher_ai.researcher_identity.title }}
{{ researcher_ai.researcher_identity.mission }}

{# Tenant group #}
{{ tenant_group.id }}
{{ tenant_group.domain_context }}
```

### Using Macros

```jinja2
{# Define a macro #}
{% macro get_prop(record, key, default='') -%}
{{ (record.get('properties') or record).get(key, default) or default }}
{%- endmacro %}

{# Use the macro #}
Entity: {{ get_prop(record, 'domainName') }}
```

---

## Data Injection

### Page Facts Injection

Injects relevant pages via semantic search:

```yaml
- injector_template: page_facts_vector
  template_vars:
    domain: "{{ record.domain }}"
    researcher_type: "{{ researcher_id }}"
    search_query: "{{ researcher_ai.search_query }}"
    min_certainty: 0.15
    limit: 100
    inject_as: pageData
```

In the template:

```jinja2
{% if pageData and pageData|length > 0 %}
## PAGE CONTENT

{% for page in pageData %}
### Page {{ loop.index }}: {{ page.get('title') }}
**URL**: {{ page.get('url') }}
**Relevance**: {{ (page.get('similarity_score') * 100)|round(1) }}%

{{ page.get('content')[:2500] }}
{% endfor %}
{% endif %}
```

### MCP Tool Injection

Inject data from MCP tools:

```yaml
- injector_template: mcp
  template_vars:
    tool: brave_search
    params:
      query: "{{ record.domainName }} demographics"
    inject_as: searchResults
  optional: true
```

---

## Complete Example

Here's a simplified researcher prompt:

```yaml
# pom-config/prompts/entity/simple_researcher.prompty

---
name: Simple Researcher
description: Simplified researcher template for documentation

defaults:
  max_content_chars: 2500

inputs:
  record:
    description: Entity record to analyze
    type: object
  researcher_id:
    description: Researcher type
    type: string

  # Injected context
  tenant:
    type: object
    default: null
  researcher_ai:
    type: object
    required: true

  # Injected data
  pageData:
    type: array
    default: null

data_requirements:
  injectors:
    - injector_template: page_facts_vector
      template_vars:
        domain: "{{ record.domain }}"
        search_query: "{{ researcher_ai.search_query }}"
        limit: 50
        inject_as: pageData

model:
  api: chat  # or 'responses' for reasoning models
  configuration:
    type: openai_chat  # Direct adapter: openai_chat, ollama, anthropic, google
    model: gpt-5-mini
  parameters:
    max_output_tokens: 8000
    response_format:
      type: json_schema
      json_schema:
        name: researcher_output
        strict: true
        schema:
          type: object
          properties: {}

processing_config:
  source_collection: Domain
  target_collections:
    - Research_{{ researcher_id }}
---
{# === JINJA2 MACROS === #}
{% macro get_prop(record, key, default='') -%}
{{ (record.get('properties') or record).get(key, default) or default }}
{%- endmacro %}

{# === SYSTEM PROMPT === #}
system:
## RESEARCHER IDENTITY

{% if researcher_ai and researcher_ai.researcher_identity %}
**Title**: {{ researcher_ai.researcher_identity.title }}
**Mission**: {{ researcher_ai.researcher_identity.mission }}

{% if researcher_ai.researcher_identity.core_competencies %}
**Core Competencies**:
{% for competency in researcher_ai.researcher_identity.core_competencies %}
- {{ competency }}
{% endfor %}
{% endif %}
{% else %}
**ERROR: researcher_ai config is missing.**
{% endif %}

## ENTITY CONTEXT

{% if record %}
{% set props = record.get('properties') or record %}
- **Name**: {{ props.get('domainName') or props.get('domain') or 'Unknown' }}
- **Domain**: {{ props.get('domain') or 'Not provided' }}
{% endif %}

## PAGE CONTENT

{% if pageData and pageData|length > 0 %}
You have access to **{{ pageData|length }} relevant pages** from the entity's website.

{% for page in pageData %}
### Page {{ loop.index }}: {{ page.get('title', 'Unknown') }}
**URL**: {{ page.get('url', 'N/A') }}
{% if page.get('similarity_score') %}
**Relevance**: {{ (page.get('similarity_score') * 100)|round(1) }}%
{% endif %}

{{ page.get('content', '')[:defaults.max_content_chars] }}
{% if page.get('content', '')|length > defaults.max_content_chars %}... [truncated]{% endif %}

---
{% endfor %}
{% else %}
No page content available. Use your training knowledge.
{% endif %}

## ANALYSIS TASK

Analyze the entity using the page content provided.

**Output Requirements:**
1. Use exact field names from the JSON schema
2. Populate all fields (use null if unavailable)
3. Return flat JSON structure
```

---

## Validation

### Test prompt loading

```bash
docker exec pom-core-dev python -c "
from pom_core.services.core_prompty_service import CorePromptyService

service = CorePromptyService()
template = service.get_template('entity/entity_researcher')
print(f'Name: {template.name}')
print(f'Inputs: {list(template.inputs.keys())[:5]}...')
"
```

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Template not found | Wrong path | Check file exists in prompts/ |
| Missing variable | Typo in variable name | Match variable to inputs |
| Jinja2 error | Syntax error | Check Jinja2 syntax |
| No data injected | Injector config wrong | Check template_vars |

---

## Best Practices

### 1. Always Check for Data

```jinja2
{% if pageData and pageData|length > 0 %}
  {# Use page data #}
{% else %}
  {# Fallback #}
{% endif %}
```

### 2. Require Critical Context

```yaml
inputs:
  researcher_ai:
    required: true  # Fail-fast if missing
```

### 3. Truncate Large Content

```jinja2
{{ page.get('content')[:2500] }}
{% if page.get('content')|length > 2500 %}... [truncated]{% endif %}
```

### 4. Document Output Requirements

```jinja2
## OUTPUT REQUIREMENTS

1. Use EXACT field names from schema
2. Return flat JSON (no nesting unless schema requires it)
3. Use null for unavailable data (not empty arrays)
```

---

## Reusing the Entity Researcher

Most research use cases can reuse the existing `entity_researcher.prompty`:

1. **Create researcher_ai config** with identity and search_query
2. **Create output schema** with required fields
3. **Add researcher to tenant_group**

The entity_researcher prompt:
- Injects researcher_ai automatically
- Uses search_query for page discovery
- Outputs to the appropriate Research_* collection

No new prompt needed!

---

## Related Documentation

- [Creating Researchers](CREATING_RESEARCHERS.md)
- [Creating Schemas](CREATING_SCHEMAS.md)
- [Complete Example: Influencer Domain](../examples/NEW_RESEARCH_DOMAIN.md)
