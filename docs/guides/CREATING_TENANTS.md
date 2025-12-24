# Creating Tenants

**Guide to defining research organizations with TenantConfig**

Tenants define **who** is doing the research - the organization, their collection routing, and any tenant-specific analysis guidance.

---

## Table of Contents

1. [Overview](#overview)
2. [File Structure](#file-structure)
3. [Required Fields](#required-fields)
4. [Optional Fields](#optional-fields)
5. [Collection Routing](#collection-routing)
6. [Complete Example](#complete-example)
7. [Pydantic Model Reference](#pydantic-model-reference)
8. [Validation](#validation)

---

## Overview

### What is a Tenant?

A tenant represents:
- **An organization** doing research (e.g., Prismatic, Internet Brands)
- **Data isolation** - each tenant's data is separate
- **Collection routing** - where data is stored (cloud, spark, local)
- **Analysis guidance** - tenant-specific research parameters

### Relationship to Tenant Groups

```
┌─────────────────────────────────────────────────────────────────────┐
│  Tenant: prismatic                                                  │
│  ├── tenant_group: corporate  ──────────────▶  TenantGroupConfig   │
│  ├── collections: {...}                        (researchers, etc.) │
│  └── analysis_config: {...}                                        │
└─────────────────────────────────────────────────────────────────────┘
```

The tenant **belongs to** a tenant_group, which determines:
- Which researchers run
- What schemas are used
- How entities are structured

---

## File Structure

Tenant files are located in:

```
pom-config/
└── tenants/
    ├── prismatic.yaml
    ├── internet_brands.yaml
    ├── fortune_1000.yaml
    ├── classifier.yaml
    └── README.md
```

**Naming convention:** `{tenant_id}.yaml`

---

## Required Fields

### Minimal Configuration

```yaml
id: influencer_intel
name: Influencer Intelligence
type: tenant
tenant_group: influencer
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (used in API calls, data isolation) |
| `name` | string | Human-readable name |
| `type` | string | Always `tenant` |
| `tenant_group` | string | Links to tenant_group (e.g., `corporate`, `influencer`) |

---

## Optional Fields

### Description

```yaml
description: Influencer intelligence platform for brand partnership analysis
```

### Entity Collection

Primary entity collection for CLI tools:

```yaml
entity_collection: Domain
```

### Groups

Collection access permissions:

```yaml
groups: ["research", "url"]
```

### Classifier Tenant

Separate tenant for Vec classification seeds:

```yaml
classifier_tenant: classifier
```

### User Information

Contact/persona information:

```yaml
user:
  name: Sarah
  role: Brand Partnerships Manager
  email: sarah@influencer-intel.com
```

### Analysis Configuration

Tenant-specific research guidance:

```yaml
analysis_config:
  mission: "Find emerging influencers with 10K-100K engaged followers in lifestyle and tech niches"
  
  industry_focus: ["lifestyle", "tech", "gaming", "beauty", "fitness"]
  
  researcher_guidance:
    audience:
      key_indicators: ["Engagement rate", "Follower growth", "Audience demographics"]
      critical_fields: ["followerCount", "engagementRate", "audienceDemographics"]
    
    content:
      focus: "Identify content themes, posting frequency, and platform preferences"
      critical_fields: ["contentCategories", "postingFrequency", "platformMix"]
```

### Data Sources

File paths for uploads and data:

```yaml
data_sources:
  data_dir: "Data/uploads/tenants/influencer_intel"
  upload_dir: "Data/uploads/tenants/influencer_intel"
```

---

## Collection Routing

The `collections` field maps collection names to Weaviate instances:

```yaml
collections:
  # Research collections - on Cloud for production
  Research_audience: "cloud"
  Research_content: "cloud"
  Research_brand: "cloud"
  Research_engagement: "cloud"
  Research_platform: "cloud"
  Research_competitor: "cloud"
  Research_journalist: "cloud"
  
  # Entity source - on Cloud
  Domain: "cloud"
  
  # Page collections - GPU-accelerated on Spark
  Page_facts: "spark"
  Page_intelligence: "spark"
  Page_content: "spark"
  
  # Knowledge base - on Spark
  Knowledge_base: "spark"
```

### Available Instances

| Instance | Description | Use Case |
|----------|-------------|----------|
| `cloud` | Weaviate Cloud | Production data, research output |
| `spark` | Spark server (CUDA) | GPU-accelerated embeddings, page processing |
| `local` | Local Weaviate | Development, testing |
| `mac` | Mac Weaviate | Mac development environment |

### Routing Strategy

- **Research_* collections** → `cloud` (production, persistent)
- **Page_* collections** → `spark` (GPU-accelerated embeddings)
- **Domain** → `cloud` (entity source)
- **Knowledge_base** → `spark` (vector search)

---

## Complete Example

Here's a complete tenant for influencer research:

```yaml
# pom-config/tenants/influencer_intel.yaml

id: influencer_intel
name: Influencer Intelligence
type: tenant
description: Influencer intelligence platform for brand partnership analysis

# Link to tenant group (defines researchers)
tenant_group: influencer

# Primary entity collection
entity_collection: Domain

# Collection access groups
groups: ["research", "url"]

# Use global classifier for Vec classification
classifier_tenant: classifier

# User/persona information
user:
  name: Sarah
  role: Brand Partnerships Manager
  email: sarah@influencer-intel.com

# Analysis configuration
analysis_config:
  mission: "Find emerging influencers with 10K-100K engaged followers in lifestyle and tech niches"
  
  industry_focus:
    - lifestyle
    - tech
    - gaming
    - beauty
    - fitness
    - travel
  
  researcher_guidance:
    audience:
      key_indicators:
        - "Engagement rate (likes, comments, shares)"
        - "Follower growth trends"
        - "Audience demographics (age, location)"
        - "Authenticity indicators"
      critical_fields:
        - followerCount
        - engagementRate
        - audienceDemographics
        - growthRate
    
    content:
      focus: "Identify content themes, posting frequency, and cross-platform presence"
      critical_fields:
        - contentCategories
        - postingFrequency
        - platformMix
        - contentStyle
    
    brand:
      key_indicators:
        - "Past brand partnerships"
        - "Sponsorship disclosure patterns"
        - "Brand fit indicators"
      critical_fields:
        - brandPartnerships
        - sponsorshipHistory
        - brandCategories

# Data sources
data_sources:
  data_dir: "Data/uploads/tenants/influencer_intel"
  upload_dir: "Data/uploads/tenants/influencer_intel"

# Collection routing
collections:
  # Research collections - Cloud for production
  Research_audience: "cloud"
  Research_content: "cloud"
  Research_brand: "cloud"
  Research_engagement: "cloud"
  Research_platform: "cloud"
  Research_competitor: "cloud"
  Research_journalist: "cloud"
  
  # Entity source - Cloud
  Domain: "cloud"
  
  # Page collections - Spark for GPU acceleration
  Page_facts: "spark"
  Page_intelligence: "spark"
  Page_content: "spark"
  Page_researcher: "spark"
  Page_source: "spark"
  
  # Knowledge base - Spark
  Knowledge_base: "spark"
  
  # Fact base - Spark
  Fact_base: "spark"
  
  # API cache - Spark
  API_intelligence: "spark"
```

---

## Pydantic Model Reference

The complete Pydantic model is in `pom_core/models/tenant_model.py`:

### TenantConfig

```python
class TenantConfig(BaseModel):
    id: str = Field(..., description="Unique tenant identifier")
    name: str = Field(..., description="Human-readable tenant name")
    type: str = Field(default="tenant", description="Object type")
    description: str | None = Field(None, description="Tenant description")
    
    # Tenant Group link
    tenant_group: str | None = Field(
        None,
        description="TenantGroup this tenant belongs to (e.g., 'corporate', 'influencer')"
    )
    
    # Collection access
    groups: list[str] | None = Field(None, description="Collection groups")
    
    # User information
    user: dict[str, Any] | None = Field(None, description="User/persona information")
    
    # Analysis configuration
    analysis_config: dict[str, Any] | None = Field(None)
    
    # Data sources
    data_sources: dict[str, Any] | None = Field(None)
    
    # Classifier tenant for Vec classification
    classifier_tenant: str | None = Field(
        None,
        description="Tenant to use for Vec classification seed data"
    )
    
    # Collection routing
    collections: dict[str, str] | None = Field(
        None,
        description="Collection routing: maps collection name to Weaviate instance"
    )
    
    class Config:
        extra = "allow"  # Allow extra fields for flexibility
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
config = service.get_object('tenant', 'influencer_intel')
print(f'Loaded: {config.id}')
print(f'Tenant Group: {config.tenant_group}')
print(f'Collections: {list(config.collections.keys())[:5]}...')
"
```

### Common Validation Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `id: Field required` | Missing `id` field | Add `id: your_id` |
| `name: Field required` | Missing name | Add `name: "Your Tenant"` |
| `tenant_group not found` | Invalid tenant_group reference | Create tenant_group first |

---

## Entity Model vs Legacy Model

### Entity Model (Recommended)

All new tenants should use the Entity Model:

```yaml
tenant_group: corporate  # or influencer, travel, etc.
# Source: Domain
# Output: Research_* collections
```

### Legacy Model (Deprecated)

Older tenants may use the Company model:

```yaml
tenant_group: company
# Source: Company_source
# Output: Company_research_* collections
```

---

## Next Steps

After creating a tenant:

1. **Ensure tenant_group exists** with required researchers
2. **Create researcher_ai configs** for each researcher
3. **Create schemas** for Research_* collections
4. **Test collection routing** with a sample entity

---

## Related Documentation

- [Creating Tenant Groups](CREATING_TENANT_GROUPS.md)
- [Creating Researchers](CREATING_RESEARCHERS.md)
- [Complete Example: Influencer Domain](../examples/NEW_RESEARCH_DOMAIN.md)
