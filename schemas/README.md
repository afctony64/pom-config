# Generic Research Schemas

## Design Principles

### 1. Common Base, Specialized Extensions

```
Research_base (template)
    │
    ├── Research_industry    (sector, business model)
    ├── Research_financial   (economic, value)
    ├── Research_risk        (vulnerabilities, mitigation)
    ├── Research_product     (features, capabilities)
    └── Research_social      (presence, reputation)
```

### 2. Field Pattern: `{subject}LLM` + `{subject}Cat`

```yaml
# LLM = Free-form AI analysis (vectorized for semantic search)
- name: sectorLLM
  dataType: [text]
  description: "Broad sector analysis..."
  tags: [LLM, research]

# Cat = Categorized (enum for filtering)
- name: sectorCat
  dataType: ["text[]"]
  enum: [Technology, Healthcare, Tourism-Hospitality, ...]
  tags: [Cat, EnumCat]

# VecCat = Vector-based categories (similarity to seed data)
- name: segmentVecCat
  dataType: ["text[]"]
  tags: [Cat, VecCat, benchmark]
```

### 3. Pure to Subject, Customizable by Tenant

Each researcher is **pure to their subject** (industry, financial, risk) but the **tenant perspective** shapes interpretation:

```yaml
# Same Research_industry schema, different tenant context:

Company (tenant_group: company):
  sectorLLM: "Enterprise software in the integration space..."
  sectorCat: [Technology]

Destination (tenant_group: travel):
  sectorLLM: "Southeast Asian tourism with cultural focus..."
  sectorCat: [Tourism-Hospitality]

Recipe (tenant_group: recipe):
  sectorLLM: "Northern Italian cuisine with rustic traditions..."
  sectorCat: [Food-Beverage]
```

## Base Fields (All Researchers)

```yaml
# ENTITY IDENTITY
- entityId          # Unique identifier
- entityType        # Company, Destination, Character, Recipe
- entityName        # Display name

# RESEARCH CONTEXT
- tenantGroup       # company, travel, gaming, recipe
- researcherId      # industry, financial, risk, etc.

# SOURCE TRACKING
- primaryDomain     # Primary URL
- dataSource        # ai_analysis, web_scrape, api
- seed              # Training data flag

# QUALITY METADATA
- processedAt       # Analysis timestamp
- updatedAt         # Update timestamp
- sourceQuality     # high, medium, low, minimal
- analysisConfidence # high, medium, low, inferred
- reviewFlag        # none, for_review, verified

# AI PROVENANCE
- citations         # Source URLs
- reasoning         # AI reasoning steps

# REFERENCE CACHE
- references        # UUID links to entity, domain
```

## Specialized Researchers

### Research_industry
**Focus**: Market positioning, sector classification, business models

| Field | Type | Description |
|-------|------|-------------|
| `sectorLLM` | text | Broad sector analysis |
| `sectorCat` | enum[] | Sector category |
| `industryLLM` | text | Industry classification |
| `industryCat` | enum[] | Industry category |
| `segmentLLM` | text | Granular segment (100-150 words) |
| `segmentVecCat` | vec[] | Segment via vector similarity |
| `businessModelLLM` | text | Operating model analysis |
| `businessModelCat` | enum[] | Business model category |
| `deliveryModelLLM` | text | Value delivery analysis |
| `deliveryModelCat` | enum[] | Delivery model category |
| `positioningLLM` | text | Market positioning synthesis |

### Research_financial
**Focus**: Economic analysis, value assessment, financial health

| Field | Type | Description |
|-------|------|-------------|
| `financialSummaryLLM` | text | Comprehensive financial analysis |
| `economicContextLLM` | text | Broader economic factors |
| `healthCat` | enum | Financial health category |
| `valueCat` | enum | Value assessment category |
| `primaryMetric` | number | Primary financial metric |
| `secondaryMetric` | number | Secondary financial metric |
| `trendLLM` | text | Financial trend analysis |
| `trendCat` | enum | Trend direction |
| `financialRisksLLM` | text | Financial risk factors |
| `financialOpportunitiesLLM` | text | Financial opportunities |

### Research_risk
**Focus**: Risk identification, vulnerability assessment, mitigation

| Field | Type | Description |
|-------|------|-------------|
| `riskSummaryLLM` | text | Comprehensive risk analysis |
| `overallRiskCat` | enum | Overall risk level |
| `riskScore` | number | Calculated risk score (0-100) |
| `riskTypeCat` | enum[] | Types of risks identified |
| `mitigationLLM` | text | Mitigation strategies |
| `mitigationActions` | text[] | Actionable mitigation steps |
| `identifiedRisks` | object[] | Structured risk list |
| `urgencyCat` | enum | Risk urgency level |
| `riskTags` | text[] | Domain-specific filter tags |

## Entity-Agnostic Interpretations

### Research_industry.sectorLLM

| Entity | Interpretation |
|--------|---------------|
| Company | "Enterprise software in the integration space..." |
| Destination | "Southeast Asian tourism with cultural focus..." |
| Recipe | "Northern Italian cuisine with rustic traditions..." |
| Character | "Tank class in the MMORPG archetype system..." |

### Research_risk.riskSummaryLLM

| Entity | Interpretation |
|--------|---------------|
| Company | "Business risks include vendor lock-in and compliance..." |
| Destination | "Travel advisories include monsoon season flooding..." |
| Recipe | "Contains tree nuts, gluten, and dairy allergens..." |
| Character | "Weak against burst damage and crowd control..." |

## Usage

```python
from pom_core.services.core_model_service import get_model_service

service = get_model_service()

# Load tenant group (defines which researchers to use)
tenant_group = service.get_object("tenant_group", "company")

# Load researcher config (defines search_query, tool_guidance)
researcher = service.get_object("researcher_ai", "industry")

# Output goes to generic Research_* collection
output_schema = tenant_group.get_output_schema("industry")
# → "Research_industry"

# Tenant = entity_id (not hard-coded company)
# Same schema works for Company, Destination, Character, Recipe
```

## Vector Configurations

Each researcher has semantic search vectors:

```yaml
# Research_industry
namedVectors:
  segmentVector: [segmentLLM, sectorLLM, industryLLM]
  businessModelVector: [businessModelLLM, deliveryModelLLM]

# Research_financial
namedVectors:
  financialVector: [financialSummaryLLM, economicContextLLM]

# Research_risk
namedVectors:
  riskVector: [riskSummaryLLM, mitigationLLM]
```
