# Creating Schemas

**Guide to defining Weaviate collection schemas with WeaviateClassConfig**

Schemas define the structure of research output - what fields exist, their types, and how they're vectorized for semantic search.

---

## Table of Contents

1. [Overview](#overview)
2. [File Structure](#file-structure)
3. [Required Fields](#required-fields)
4. [Property Definitions](#property-definitions)
5. [Named Vectors](#named-vectors)
6. [Field Tags and Sets](#field-tags-and-sets)
7. [Complete Example](#complete-example)
8. [Pydantic Model Reference](#pydantic-model-reference)
9. [Validation](#validation)

---

## Overview

### What is a Schema?

A schema defines:
- **Collection structure** - Name and configuration
- **Properties** - Fields with types and descriptions
- **Named vectors** - Semantic search configurations
- **Multi-tenancy** - Data isolation settings
- **References** - Links to other collections

### Schema Hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│  Schema: Research_audience                                          │
│  ├── Properties: [followerCount, engagementRate, demographics...]  │
│  ├── Named Vectors: [audienceVector, engagementVector]             │
│  ├── Multi-tenancy: enabled                                        │
│  └── References: [domainBeacon → Domain]                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## File Structure

Schema files are located in:

```
pom-config/
└── schemas/
    ├── Research_product_schema.yaml
    ├── Research_competitor_schema.yaml
    ├── Research_customer_schema.yaml
    ├── domain_schema.yaml
    ├── Page_facts_schema.yaml
    └── README.md
```

**Naming convention:** `{CollectionName}_schema.yaml`

---

## Required Fields

### Minimal Configuration

```yaml
type: research
class: Research_audience
id: Research_audience
name: Research Audience
description: |
  Audience demographics and engagement intelligence.
  
vectorizer: none
multiTenancyConfig:
  enabled: true
  autoTenantCreation: true
  autoTenantActivation: true

properties:
  - name: entityName
    dataType: [text]
    description: Entity name
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Collection type (`research`, `source`, `page`) |
| `class` | string | Weaviate class name |
| `id` | string | Same as class (for CoreModelService) |
| `name` | string | Human-readable name |
| `description` | string | What this collection stores |
| `vectorizer` | string | Default vectorizer (`none` for research) |
| `multiTenancyConfig` | object | Tenant isolation settings |
| `properties` | list | Field definitions |

---

## Property Definitions

### Basic Property

```yaml
properties:
  - name: followerCount
    dataType: [number]
    description: Total follower count across platforms
```

### Property with Tags and Sets

```yaml
properties:
  - name: audienceDemographicsLLM
    dataType: [text]
    description: Detailed audience demographics analysis from AI
    tags:
      - LLM
      - research
    sets:
      - prompt
      - extended
```

### Available Data Types

| Type | Description | Example |
|------|-------------|---------|
| `text` | String | Name, description |
| `text[]` | String array | List of tags |
| `number` | Numeric | Count, score |
| `number[]` | Number array | Array of scores |
| `boolean` | True/false | Flag |
| `date` | ISO date | Timestamp |
| `uuid` | UUID | Reference ID |
| `uuid[]` | UUID array | Multiple references |
| `object` | Nested object | Complex structure |

### Property Modifiers

```yaml
- name: followerCount
  dataType: [number]
  description: Total follower count
  
  # Skip vectorization for this field
  moduleConfig:
    text2vec-weaviate:
      skip: true
  
  # Field categorization
  tags:
    - research
    - metrics
  sets:
    - standard
    - prompt
  
  # Enum values (for Cat fields)
  enum:
    - Micro
    - Mid-Tier
    - Macro
    - Mega
```

---

## Named Vectors

Named vectors enable semantic search on specific field combinations:

```yaml
namedVectors:
  audienceVector:
    vectorizer: text2vec-weaviate
    sourceProperties:
      - audienceDemographicsLLM
      - audienceInterestsLLM
    moduleConfig:
      text2vec-weaviate:
        model: Snowflake/snowflake-arctic-embed-l-v2.0
        dimensions: 1024
        vectorizeClassName: false
  
  engagementVector:
    vectorizer: text2vec-weaviate
    sourceProperties:
      - engagementPatternLLM
      - contentPreferencesLLM
    moduleConfig:
      text2vec-weaviate:
        model: Snowflake/snowflake-arctic-embed-l-v2.0
        dimensions: 1024
        vectorizeClassName: false
```

### Vector Configuration

| Field | Description |
|-------|-------------|
| `vectorizer` | Vectorizer module (`text2vec-weaviate`) |
| `sourceProperties` | Which text fields to vectorize |
| `model` | Embedding model |
| `dimensions` | Vector dimensions (1024 for arctic-embed) |
| `vectorizeClassName` | Include class name in embedding |

---

## Field Tags and Sets

### Tags

Tags categorize fields for filtering and processing:

| Tag | Description |
|-----|-------------|
| `LLM` | AI-generated narrative field |
| `Cat` | Categorical/classification field |
| `research` | Research output field |
| `identity` | Entity identification field |
| `metrics` | Numeric metrics |
| `metadata` | Processing metadata |

### Sets

Sets group fields for data retrieval:

| Set | Description |
|-----|-------------|
| `standard` | Default field set |
| `extended` | Standard + additional fields |
| `prompt` | Fields for prompt injection |
| `system` | System/metadata fields |
| `VecCat` | Vec classification fields |
| `EnumCat` | Enum classification fields |

### LLM + Cat Field Pattern

A common pattern pairs AI narrative fields with categorical fields:

```yaml
# LLM field - detailed AI analysis
- name: audienceSizeLLM
  dataType: [text]
  description: Detailed analysis of audience size and reach
  tags: [LLM]
  sets: [prompt]

# Cat field - category classification (auto-populated)
- name: audienceSizeCat
  dataType: [text]
  description: Audience size category
  enum: [Micro, Mid-Tier, Macro, Mega, Unknown]
  tags: [Cat]
  sets: [standard, EnumCat]
  metadata:
    source_llm: audienceSizeLLM
```

---

## Complete Example

Here's a complete schema for audience research:

```yaml
# pom-config/schemas/Research_audience_schema.yaml

type: research
class: Research_audience
id: Research_audience
name: Research Audience
description: |
  Audience Demographics & Engagement Intelligence Repository
  
  RESEARCHER: Audience Demographics Analyst
  KNOWLEDGE TYPE: Entity-specific audience analysis
  
  REPOSITORY CONTENTS:
  - Follower counts and growth metrics
  - Audience demographics (age, gender, location)
  - Engagement patterns and rates
  - Audience interests and affinities
  - Platform distribution
  - Authenticity indicators

# BM25 text search configuration
invertedIndexConfig:
  bm25:
    b: 0.75
    k1: 1.2
  cleanupIntervalSeconds: 60
  indexNullState: true
  stopwords:
    preset: en

# No default vectorizer (use named vectors)
vectorizer: none

# Named vectors for semantic search
namedVectors:
  audienceVector:
    vectorizer: text2vec-weaviate
    sourceProperties:
      - audienceDemographicsLLM
      - audienceInterestsLLM
    moduleConfig:
      text2vec-weaviate:
        model: Snowflake/snowflake-arctic-embed-l-v2.0
        dimensions: 1024
        vectorizeClassName: false
  
  engagementVector:
    vectorizer: text2vec-weaviate
    sourceProperties:
      - engagementPatternLLM
      - growthAnalysisLLM
    moduleConfig:
      text2vec-weaviate:
        model: Snowflake/snowflake-arctic-embed-l-v2.0
        dimensions: 1024
        vectorizeClassName: false

# Multi-tenancy for data isolation
multiTenancyConfig:
  autoTenantActivation: true
  autoTenantCreation: true
  enabled: true

# Properties (fields)
properties:
  # === Identity Fields ===
  - name: entityName
    dataType: [text]
    description: Entity name (influencer/creator name)
    sets: [extended, system]
    tags: [identity]
  
  - name: domain
    dataType: [text]
    description: Entity domain (website URL)
    sets: [extended, system, identifier]
    tags: [identity, web]
    moduleConfig:
      text2vec-weaviate:
        skip: true

  # === Follower Metrics ===
  - name: followerCount
    dataType: [number]
    description: Total follower count across all platforms
    tags: [metrics, research]
    sets: [standard, prompt]
  
  - name: followersByPlatform
    dataType: [object]
    description: Follower breakdown by platform
    sets: [extended]
    nestedProperties:
      - name: instagram
        dataType: [number]
      - name: tiktok
        dataType: [number]
      - name: youtube
        dataType: [number]
      - name: twitter
        dataType: [number]

  # === Audience Size Classification ===
  - name: audienceSizeLLM
    dataType: [text]
    description: Detailed analysis of audience size and reach
    tags: [LLM]
    sets: [prompt]
  
  - name: audienceSizeCat
    dataType: [text]
    description: Audience size category based on total followers
    enum:
      - Nano          # < 10K
      - Micro         # 10K - 100K
      - Mid-Tier      # 100K - 500K
      - Macro         # 500K - 1M
      - Mega          # 1M+
      - Unknown
    tags: [Cat]
    sets: [standard, EnumCat]
    metadata:
      source_llm: audienceSizeLLM

  # === Engagement Metrics ===
  - name: engagementRate
    dataType: [number]
    description: Average engagement rate (likes + comments / followers)
    tags: [metrics, research]
    sets: [standard, prompt]
  
  - name: engagementPatternLLM
    dataType: [text]
    description: Analysis of engagement patterns and quality
    tags: [LLM]
    sets: [prompt]

  # === Demographics ===
  - name: audienceDemographicsLLM
    dataType: [text]
    description: Detailed audience demographics analysis
    tags: [LLM]
    sets: [prompt]
  
  - name: primaryAgeGroup
    dataType: [text]
    description: Primary audience age group
    enum:
      - Gen-Z
      - Millennial
      - Gen-X
      - Boomer
      - Mixed
      - Unknown
    tags: [Cat]
    sets: [standard, EnumCat]
  
  - name: audienceInterestsLLM
    dataType: [text]
    description: Analysis of audience interests and affinities
    tags: [LLM]
    sets: [prompt]
  
  - name: geographicReach
    dataType: [text[]]
    description: Primary geographic regions of audience
    tags: [research]
    sets: [extended]

  # === Growth ===
  - name: growthRate
    dataType: [number]
    description: Monthly follower growth rate (percentage)
    tags: [metrics]
    sets: [extended]
  
  - name: growthAnalysisLLM
    dataType: [text]
    description: Analysis of growth trajectory and trends
    tags: [LLM]
    sets: [prompt]

  # === Authenticity ===
  - name: authenticityScore
    dataType: [number]
    description: Estimated audience authenticity score (0-100)
    tags: [metrics]
    sets: [extended]
  
  - name: authenticityIndicators
    dataType: [text[]]
    description: Indicators of audience authenticity
    tags: [research]
    sets: [extended]

  # === Metadata ===
  - name: processedDate
    dataType: [text]
    description: Date when analysis was processed
    sets: [system, metadata]
  
  - name: sourceQuality
    dataType: [text]
    description: Quality rating of source data [high, medium, low, minimal]
    sets: [system, metadata]
    moduleConfig:
      text2vec-weaviate:
        skip: true
  
  - name: analysisConfidence
    dataType: [text]
    description: Confidence level [high, web_verified, medium, low, inferred]
    sets: [system, metadata, prompt]
    moduleConfig:
      text2vec-weaviate:
        skip: true
  
  - name: citations
    dataType: [text[]]
    description: URLs of sources used for analysis
    sets: [system, metadata]
    moduleConfig:
      text2vec-weaviate:
        skip: true

# References to other collections
references:
  - name: domainBeacon
    target_collection: Domain
    uuid_source_field: uuid
    auto_flatten: false
    description: Reference to source Domain record

# Collection metadata
group: research
weaviate_instance: cloud
collection_name: Research_audience

# UUID generation strategy
uuid_strategy:
  fields:
    - field: domain
      namespace: URL
      description: Primary strategy using domain for deterministic UUIDs

# Reverse references (auto-populate Domain.audience)
reverse_references:
  - target_collection: Domain
    target_property: audience
    use_my_uuid: true
    description: When created, add UUID to Domain.audience
```

---

## Pydantic Model Reference

The complete Pydantic model is in `pom_core/models/weaviate_config_model.py`:

### WeaviateClassConfig

```python
class WeaviateClassConfig(BaseModel):
    type: str | None = None
    class_: str = Field(..., alias="class")
    id: str | None = None
    name: str | None = None
    description: str | None = None
    
    # Vectorizer configuration
    vectorizer: str = "none"
    namedVectors: dict[str, NamedVectorConfig] | None = None
    
    # Index configuration
    invertedIndexConfig: InvertedIndexConfig | None = None
    
    # Multi-tenancy
    multiTenancyConfig: MultiTenancyConfig | None = None
    
    # Properties
    properties: list[PropertyConfig] = Field(default_factory=list)
    
    # References
    references: list[ReferenceConfig] | None = None
    reverse_references: list[ReverseReferenceConfig] | None = None
```

### PropertyConfig

```python
class PropertyConfig(BaseModel):
    name: str
    dataType: list[str]
    description: str | None = None
    
    # Field organization
    tags: list[str] | None = None
    sets: list[str] | None = None
    
    # Enum values
    enum: list[str] | None = None
    
    # Nested properties (for object type)
    nestedProperties: list[PropertyConfig] | None = None
    
    # Module configuration
    moduleConfig: dict[str, Any] | None = None
    
    # Metadata
    metadata: dict[str, Any] | None = None
```

---

## Validation

### Validate the schema file

```bash
# Run validation script
python scripts/validate_all_configs.py

# Or test specific file
docker exec pom-core-dev python -c "
from pom_core.services.core_model_service import get_core_model_service
service = get_core_model_service()
schema = service.get_object('schema', 'Research_audience')
print(f'Class: {schema.class_}')
print(f'Properties: {len(schema.properties)}')
for prop in schema.properties[:5]:
    print(f'  - {prop.name}: {prop.dataType}')
"
```

---

## Best Practices

### 1. Use LLM + Cat Pattern

```yaml
- name: audienceSizeLLM
  dataType: [text]
  tags: [LLM]

- name: audienceSizeCat
  dataType: [text]
  enum: [Nano, Micro, Mid-Tier, Macro, Mega, Unknown]
  tags: [Cat]
  metadata:
    source_llm: audienceSizeLLM
```

### 2. Skip Vectorization for Metadata

```yaml
- name: processedDate
  moduleConfig:
    text2vec-weaviate:
      skip: true
```

### 3. Use Meaningful Named Vectors

```yaml
namedVectors:
  audienceVector:
    sourceProperties:
      - audienceDemographicsLLM
      - audienceInterestsLLM
```

---

## Related Documentation

- [Creating Researchers](CREATING_RESEARCHERS.md)
- [Creating Tenant Groups](CREATING_TENANT_GROUPS.md)
- [Complete Example: Influencer Domain](../examples/NEW_RESEARCH_DOMAIN.md)
