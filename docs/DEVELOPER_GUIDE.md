# pom-config Developer Guide

**Building Entity Research Systems with the Pom Configuration Architecture**

This guide explains how to use the pom-config system to create new research domains, researchers, and entity intelligence pipelines. Whether you're building research for companies, influencers, restaurants, or any other entity type, this guide will help you understand the configuration architecture.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Quick Start](#quick-start)
4. [Configuration Types](#configuration-types)
5. [Detailed Guides](#detailed-guides)
6. [Examples](#examples)

---

## Overview

The Pom configuration system enables you to define complete entity research pipelines using YAML configuration files. These files are validated by Pydantic models in `pom-core` and loaded by `CoreModelService`.

### Key Concepts

| Concept | Definition | Example |
|---------|------------|---------|
| **Entity** | The subject being researched | A company, influencer, restaurant, film |
| **Tenant** | The organization doing the research | Prismatic, Internet Brands |
| **Tenant Group** | The research domain/methodology | Corporate, Influencer, Travel |
| **Researcher** | An independent AI analyst | Product, Financial, Audience, Content |
| **Schema** | The output structure for research | Research_product, Research_audience |
| **Prompt** | The AI instruction template | entity_researcher.prompty |

### The Research Pipeline

```
Seed Input (entity name/URL)
         │
         ▼
┌─────────────────┐
│     Tenant      │  ← Who is researching (isolation context)
│  (prismatic)    │
└────────┬────────┘
         │ belongs to
         ▼
┌─────────────────┐
│  Tenant Group   │  ← How to research (selects researchers)
│  (corporate)    │
└────────┬────────┘
         │ selects
         ▼
┌─────────────────┐     ┌─────────────────┐
│   Researchers   │────▶│    Schemas      │
│ [product,       │     │ [Research_      │
│  financial,     │     │  product,       │
│  competitor]    │     │  Research_      │
└────────┬────────┘     │  financial]     │
         │              └─────────────────┘
         │ uses
         ▼
┌─────────────────┐
│    Prompts      │  ← AI instructions
│ (entity_        │
│  researcher)    │
└────────┬────────┘
         │
         ▼
    Research Output
    (stored in Weaviate)
```

---

## Architecture

### How Configuration Loading Works

```
                          ┌─────────────────────────────────────────┐
                          │           CoreModelService              │
                          │  (pom-core: loads, validates, caches)   │
                          └─────────────────────────────────────────┘
                                           │
                                           │ loads from
                                           ▼
                          ┌─────────────────────────────────────────┐
                          │              pom-config                 │
                          │    (Single Source of Truth for all     │
                          │     shared configurations)              │
                          └─────────────────────────────────────────┘
                                           │
           ┌───────────────────────────────┼───────────────────────────────┐
           │                               │                               │
           ▼                               ▼                               ▼
  ┌─────────────────┐           ┌─────────────────┐           ┌─────────────────┐
  │  tenant_groups/ │           │    tenants/     │           │ researcher_ai/  │
  │                 │           │                 │           │                 │
  │ corporate.yaml  │◀──────────│ prismatic.yaml  │──────────▶│ product_ai.yaml │
  │ (TenantGroup    │  assigns  │ (TenantConfig)  │  selects  │ (ResearcherAI   │
  │  Config)        │           │                 │           │  Config)        │
  └─────────────────┘           └─────────────────┘           └─────────────────┘
           │                                                           │
           │ selects researchers                                       │ links to
           ▼                                                           ▼
  ┌─────────────────┐                                       ┌─────────────────┐
  │    prompts/     │                                       │    schemas/     │
  │                 │                                       │                 │
  │ entity_         │──────────────────────────────────────▶│ Research_       │
  │ researcher.     │  outputs to                           │ product_schema  │
  │ prompty         │                                       │ .yaml           │
  └─────────────────┘                                       └─────────────────┘
```

### Pydantic Validation

Every configuration file is validated against a Pydantic model in `pom-core`:

| Config Type | YAML Location | Pydantic Model | pom-core File |
|-------------|---------------|----------------|---------------|
| Tenant Group | `tenant_groups/*.yaml` | `TenantGroupConfig` | `models/tenant_group_models.py` |
| Tenant | `tenants/*.yaml` | `TenantConfig` | `models/tenant_model.py` |
| Researcher AI | `researcher_ai/*.yaml` | `ResearcherAIConfig` | `models/ai_config_models.py` |
| Schema | `schemas/*.yaml` | `WeaviateClassConfig` | `models/weaviate_config_model.py` |
| Data Card | `data_cards/*.yaml` | `DataCardConfig` | `models/data_model.py` |
| Prompt | `prompts/**/*.prompty` | `PromptyTemplate` | `models/prompt_model.py` |

---

## Quick Start

### Creating a New Research Domain (5-Minute Overview)

To create a new research domain (e.g., "influencers"), you need:

1. **Tenant Group** - Define which researchers to use
2. **Tenant** - Define who is doing the research
3. **Researcher AI configs** - Define each researcher's identity and focus
4. **Schemas** - Define output structure for each researcher
5. **Prompts** - (Usually reuse existing `entity_researcher.prompty`)

```yaml
# 1. tenant_groups/influencer.yaml
id: influencer
display_name: "Influencer Research"
researchers:
  - audience      # Who follows them
  - content       # What they create
  - brand         # Brand partnerships
  - engagement    # Engagement metrics
  - platform      # Platform presence
```

```yaml
# 2. tenants/influencer_intel.yaml
id: influencer_intel
name: Influencer Intelligence
tenant_group: influencer  # Links to tenant_groups/influencer.yaml
collections:
  Research_audience: "cloud"
  Research_content: "cloud"
  Domain: "cloud"
```

```yaml
# 3. researcher_ai/audience_ai.yaml
id: audience
researcher_type: audience
researcher_identity:
  title: "Audience Demographics Analyst"
  mission: "Analyze follower demographics, engagement patterns, and audience segments"
search_query: "followers demographics audience engagement community"
collection_schema_id: Research_audience
```

See [Creating a New Research Domain](examples/NEW_RESEARCH_DOMAIN.md) for the complete walkthrough.

---

## Configuration Types

### 1. Tenant Groups (`tenant_groups/`)

Define research domains and which researchers they use.

**Key Fields:**
- `id` - Unique identifier (e.g., `corporate`, `influencer`)
- `researchers` - List of researcher IDs to run
- `entity` - Entity configuration (source collection, schema prefix)
- `assembly` - Self-assembly configuration for URL discovery

**Example:** [tenant_groups/corporate.yaml](../tenant_groups/corporate.yaml)

**Guide:** [Creating Tenant Groups](guides/CREATING_TENANT_GROUPS.md)

---

### 2. Tenants (`tenants/`)

Define who is doing the research and collection routing.

**Key Fields:**
- `id` - Unique identifier
- `tenant_group` - Which tenant group this belongs to
- `collections` - Weaviate routing (cloud/spark/local)
- `analysis_config` - Tenant-specific research guidance

**Example:** [tenants/prismatic.yaml](../tenants/prismatic.yaml)

**Guide:** [Creating Tenants](guides/CREATING_TENANTS.md)

---

### 3. Researcher AI (`researcher_ai/`)

Define each researcher's identity, focus, and behavior.

**Key Fields:**
- `id` / `researcher_type` - Researcher identifier
- `researcher_identity` - Title, mission, core competencies
- `search_query` - Keywords for page discovery
- `collection_schema_id` - Output schema
- `tool_guidance` - Instructions for tool usage (brave_search, etc.)

**Example:** [researcher_ai/product_ai.yaml](../researcher_ai/product_ai.yaml)

**Guide:** [Creating Researchers](guides/CREATING_RESEARCHERS.md)

---

### 4. Schemas (`schemas/`)

Define Weaviate collection structure for research output.

**Key Fields:**
- `class` - Collection name
- `properties` - Field definitions with types, tags, sets
- `namedVectors` - Vector configurations for semantic search
- `multiTenancyConfig` - Tenant isolation settings

**Example:** [schemas/Research_product_schema.yaml](../schemas/Research_product_schema.yaml)

**Guide:** [Creating Schemas](guides/CREATING_SCHEMAS.md)

---

### 5. Prompts (`prompts/`)

Define AI instruction templates using Prompty format.

**Key Sections:**
- `inputs` - Required and optional inputs
- `data_requirements` - Data injectors (page facts, MCP tools)
- `model` - LLM configuration
- `processing_config` - Output collection routing

**Example:** [prompts/entity/entity_researcher.prompty](../prompts/entity/entity_researcher.prompty)

**Guide:** [Creating Prompts](guides/CREATING_PROMPTS.md)

---

### 6. Data Cards (`data_cards/`)

Define data access patterns for querying research.

**Key Fields:**
- `id` - Unique identifier
- `collection` - Primary collection
- `fields` / `field_tags` - Which fields to return
- `collections` - Multi-collection queries

**Example:** [data_cards/entity_research.yaml](../data_cards/entity_research.yaml)

---

## Detailed Guides

| Guide | Description |
|-------|-------------|
| [CONFIG_ARCHITECTURE.md](CONFIG_ARCHITECTURE.md) | Technical deep-dive on CoreModelService |
| [Creating Tenant Groups](guides/CREATING_TENANT_GROUPS.md) | TenantGroupConfig complete guide |
| [Creating Tenants](guides/CREATING_TENANTS.md) | TenantConfig complete guide |
| [Creating Researchers](guides/CREATING_RESEARCHERS.md) | ResearcherAIConfig complete guide |
| [Creating Schemas](guides/CREATING_SCHEMAS.md) | WeaviateClassConfig complete guide |
| [Creating Prompts](guides/CREATING_PROMPTS.md) | PromptyTemplate complete guide |
| [Using Tools](guides/USING_TOOLS.md) | Tool system concepts and usage |
| [Schema Field Sets](guides/SCHEMA_FIELD_SETS.md) | Define field sets for runtime queries |

---

## Examples

| Example | Description |
|---------|-------------|
| [New Research Domain: Influencers](examples/NEW_RESEARCH_DOMAIN.md) | Complete walkthrough creating an influencer research domain |

---

## Validation

Always validate your configurations before deploying:

```bash
# Validate all configs
python scripts/validate_all_configs.py

# Test loading via CoreModelService
docker exec pom-core-dev python -c "
from pom_core.services.core_model_service import get_core_model_service
service = get_core_model_service()
# Test your config loads correctly
config = service.get_object('tenant_group', 'your_tenant_group')
print(config)
"
```

---

## Related Documentation

- **pom-core Rules:** See `.cursorrules` for development guidelines
- **Promotion Guide:** [PROMOTION_GUIDE.md](PROMOTION_GUIDE.md) - Moving app configs to pom-config
- **pom-docs:** System-wide documentation at `~/Projects/pom-docs`

---

## Getting Help

- Check existing examples in this repository
- Review Pydantic model definitions in `pom-core/pom_core/models/`
- Ask in the team Slack channel
