# Creating Tenant Groups

**Guide to defining research domains with TenantGroupConfig**

Tenant groups define **how** entities are researched - which researchers to run, what schemas to use, and how to handle entity discovery.

---

## Table of Contents

1. [Overview](#overview)
2. [File Structure](#file-structure)
3. [Required Fields](#required-fields)
4. [Optional Fields](#optional-fields)
5. [Complete Example](#complete-example)
6. [Pydantic Model Reference](#pydantic-model-reference)
7. [Validation](#validation)

---

## Overview

### What is a Tenant Group?

A tenant group defines:
- **Which researchers** analyze entities
- **How entities are structured** (source collection, output schemas)
- **Domain context** for analysis
- **Self-assembly** configuration for URL discovery

### Key Concepts

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Tenant Group                                │
│                                                                     │
│  "I am the 'corporate' research domain. When a tenant belongs      │
│   to me, I tell them to run these 10 researchers and output        │
│   to Research_* collections."                                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
          ▼                       ▼                       ▼
   ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
   │  Tenant:    │         │  Tenant:    │         │  Tenant:    │
   │  prismatic  │         │  internet_  │         │  fortune_   │
   │             │         │  brands     │         │  1000       │
   └─────────────┘         └─────────────┘         └─────────────┘
```

---

## File Structure

Tenant group files are located in:

```
pom-config/
└── tenant_groups/
    ├── corporate.yaml    # Corporate/company research
    ├── travel.yaml       # Travel destination research
    ├── gaming.yaml       # Gaming entity research
    └── recipe.yaml       # Recipe/food research
```

**Naming convention:** `{domain_name}.yaml`

---

## Required Fields

### Minimal Configuration

```yaml
id: influencer
type: tenant_group
display_name: "Influencer Research"
researchers:
  - audience
  - content
  - brand
  - engagement
  - platform
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (e.g., `corporate`, `influencer`) |
| `type` | string | Always `tenant_group` |
| `display_name` | string | Human-readable name |
| `researchers` | list[string] | List of researcher IDs to run |

---

## Optional Fields

### Domain Context

Provides business context for all researchers in this domain:

```yaml
domain_context: |
  Influencer and creator intelligence research.
  Tenants in this group are experts at researching:
  - Social media influencers and content creators
  - Brand partnerships and sponsorships
  - Audience demographics and engagement patterns
  - Platform presence across TikTok, YouTube, Instagram
```

### Description

```yaml
description: |
  Influencer research domain for analyzing content creators,
  their audiences, brand partnerships, and platform performance.
```

### Target Domains

What this tenant group specializes in researching:

```yaml
target_domains:
  primary:
    - Content Creators
    - Social Media Influencers
    - Brand Ambassadors
  secondary:
    - Digital Marketing
    - Creator Economy
```

### Display Names

Custom terminology for UI and reports:

```yaml
display_names:
  entity: Creator           # "Entity Dossier" → "Creator Dossier"
  entity_plural: Creators
  customer: Follower
  customer_plural: Followers
```

### Entity Configuration

Defines source collection and output schema patterns:

```yaml
entity:
  entity_type: Influencer
  source_collection: Domain           # Where entities come FROM
  research_schema_prefix: ""          # Output: Research_* (no prefix)
  domain_schema: Domain
  
  page_research:
    page_intelligence_schema: Page_intelligence
    page_facts_schema: Page_facts
    priority_paths:
      - /about
      - /links
      - /collab
      - /press
```

### Schema Pattern

Pattern for generating output schema names:

```yaml
schema_pattern: "Research_{researcher}"
# With researcher=audience → Research_audience
```

### Assembly Configuration

Self-assembly for URL discovery:

```yaml
assembly:
  search_tool: brave_search
  max_url_candidates: 3
  exclude_domains:
    - linkedin.com
    - facebook.com
    - twitter.com
    - wikipedia.org
  
  suitability:
    min_content_quality: 0.3
    require_readable: true
    reject_blacklisted: true
  
  auto_page_discovery: true
  auto_page_facts: true
  auto_researchers: true
```

### Entity Spawn Sources

Which research collections can spawn new entities:

```yaml
entity_spawn_sources:
  - researcher: competitor
    collection: Research_competitor
    enabled: true
    auto_spawn: false
```

---

## Complete Example

Here's a complete tenant group for influencer research:

```yaml
# pom-config/tenant_groups/influencer.yaml

id: influencer
type: tenant_group
display_name: "Influencer Research"
description: |
  Influencer and content creator research domain.
  Analyzes social media presence, audience demographics,
  brand partnerships, and content performance.

# Domain context for all researchers
domain_context: |
  Social media influencer and content creator intelligence.
  Tenants in this group are experts at researching:
  - Social media influencers and content creators
  - Brand partnerships and sponsorships
  - Audience demographics and engagement patterns
  - Platform presence across TikTok, YouTube, Instagram
  
  Key analysis dimensions:
  - Follower demographics and geographic reach
  - Content categories and posting patterns
  - Engagement rates and growth trends
  - Brand collaboration history

# Target domains
target_domains:
  primary:
    - Content Creators
    - Social Media Influencers
    - Brand Ambassadors
  secondary:
    - Digital Marketing
    - Creator Economy
    - Social Commerce

# Independent agents selected for this domain
researchers:
  - audience       # Follower demographics, engagement
  - content        # Content types, posting patterns
  - brand          # Brand partnerships, sponsorships
  - engagement     # Engagement metrics, growth
  - platform       # Platform presence, cross-platform
  - competitor     # Competing creators in niche
  - journalist     # Press coverage, media mentions

# Display names for UI
display_names:
  entity: Creator
  entity_plural: Creators
  customer: Follower
  customer_plural: Followers

# Entity model configuration
entity:
  entity_type: Influencer
  source_collection: Domain
  research_schema_prefix: ""
  domain_schema: Domain
  
  page_research:
    page_intelligence_schema: Page_intelligence
    page_facts_schema: Page_facts
    priority_paths:
      - /about
      - /links
      - /linktree
      - /collab
      - /press
      - /contact

# Schema pattern
schema_pattern: "Research_{researcher}"

# Self-assembly configuration
assembly:
  search_tool: brave_search
  max_url_candidates: 3
  exclude_domains:
    - linkedin.com
    - facebook.com
    - twitter.com
    - instagram.com   # Search for their website, not social profiles
    - tiktok.com
    - youtube.com
    - wikipedia.org
  
  suitability:
    min_content_quality: 0.3
    require_readable: true
    reject_blacklisted: true
  
  auto_page_discovery: true
  auto_page_facts: true
  auto_researchers: true

# Entity spawn - competitors can spawn new research subjects
entity_spawn_sources:
  - researcher: competitor
    collection: Research_competitor
    enabled: true
    auto_spawn: false
```

---

## Pydantic Model Reference

The complete Pydantic model is in `pom_core/models/tenant_group_models.py`:

### TenantGroupConfig

```python
class TenantGroupConfig(BaseModel):
    id: str = Field(..., description="Unique identifier (company, travel, gaming)")
    type: str | None = Field("tenant_group", description="Type identifier")
    display_name: str = Field(..., description="Human-readable name")
    description: str | None = Field(None, description="Description of this domain")
    
    # Domain context
    domain_context: str | None = Field(None, description="Domain expertise context")
    industry_focus: dict[str, list[str]] | None = Field(None)
    
    # Researchers - THE KEY FIELD
    researchers: list[str] = Field(..., description="List of researcher IDs")
    researcher_mappings: list[ResearcherMapping] | None = Field(None)
    
    # Entity configuration
    entity: EntitySchemaConfig | None = Field(None)
    schema_pattern: str | None = Field(None)
    
    # Self-assembly
    assembly: AssemblyConfig | None = Field(None)
    entity_spawn_sources: list[EntitySpawnSource] | None = Field(None)
    
    # Display names
    display_names: dict[str, str] | None = Field(None)
```

### EntitySchemaConfig

```python
class EntitySchemaConfig(BaseModel):
    entity_type: str = Field(..., description="Type name (Company, Influencer, etc.)")
    source_collection: str = Field(default="Domain")
    research_schema_prefix: str = Field(default="")
    domain_schema: str = Field(default="Domain")
    page_research: PageResearchConfig | None = Field(None)
```

### AssemblyConfig

```python
class AssemblyConfig(BaseModel):
    search_tool: str = Field(default="brave_search")
    max_url_candidates: int = Field(default=3)
    exclude_domains: list[str] | None = Field(default=[...])
    suitability: SuitabilityCriteria = Field(default_factory=SuitabilityCriteria)
    auto_page_discovery: bool = Field(default=True)
    auto_page_facts: bool = Field(default=True)
    auto_researchers: bool = Field(default=True)
```

---

## Validation

### Validate the config file

```bash
# Run validation script
python scripts/validate_all_configs.py

# Or test specific file
docker exec pom-core-dev python -c "
from pom_core.services.core_model_service import get_core_model_service
service = get_core_model_service()
config = service.get_object('tenant_group', 'influencer')
print(f'Loaded: {config.id}')
print(f'Researchers: {config.researchers}')
"
```

### Common Validation Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `id: Field required` | Missing `id` field | Add `id: your_id` |
| `display_name: Field required` | Missing display name | Add `display_name: "Your Name"` |
| `researchers: Field required` | Missing researchers list | Add `researchers: [...]` |
| `Invalid YAML` | Syntax error | Check indentation, quotes |

---

## Next Steps

After creating a tenant group:

1. **Create researcher_ai configs** for each researcher listed
2. **Create schemas** for each Research_* collection
3. **Create a tenant** that uses this tenant group
4. **Test** the complete pipeline

---

## Related Documentation

- [Creating Tenants](CREATING_TENANTS.md)
- [Creating Researchers](CREATING_RESEARCHERS.md)
- [Creating Schemas](CREATING_SCHEMAS.md)
- [Complete Example: Influencer Domain](../examples/NEW_RESEARCH_DOMAIN.md)
