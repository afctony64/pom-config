# Complete Example: Creating an Influencer Research Domain

**End-to-end walkthrough for building a new research pipeline**

This example walks through creating a complete "Influencer" research domain from scratch, including all configuration files needed.

---

## Table of Contents

1. [Overview](#overview)
2. [Step 1: Create Tenant Group](#step-1-create-tenant-group)
3. [Step 2: Create Tenant](#step-2-create-tenant)
4. [Step 3: Create Researcher AI Configs](#step-3-create-researcher-ai-configs)
5. [Step 4: Create Schemas](#step-4-create-schemas)
6. [Step 5: Validate and Test](#step-5-validate-and-test)
7. [Summary](#summary)

---

## Overview

### What We're Building

An **Influencer Research Domain** that analyzes social media influencers and content creators:

| Researcher | Focus | Output Schema |
|------------|-------|---------------|
| `audience` | Follower demographics, engagement | Research_audience |
| `content` | Content types, posting patterns | Research_content |
| `brand` | Brand partnerships, sponsorships | Research_brand |
| `engagement` | Engagement metrics, growth | Research_engagement |
| `platform` | Platform presence, cross-platform | Research_platform |

### File Structure

```
pom-config/
├── tenant_groups/
│   └── influencer.yaml              # New
├── tenants/
│   └── influencer_intel.yaml        # New
├── researcher_ai/
│   ├── audience_ai.yaml             # New
│   ├── content_ai.yaml              # New
│   ├── brand_ai.yaml                # New
│   ├── engagement_ai.yaml           # New
│   └── platform_ai.yaml             # New
└── schemas/
    ├── Research_audience_schema.yaml # New
    ├── Research_content_schema.yaml  # New
    ├── Research_brand_schema.yaml    # New
    ├── Research_engagement_schema.yaml # New
    └── Research_platform_schema.yaml # New
```

---

## Step 1: Create Tenant Group

The tenant group defines which researchers run for this domain.

**File:** `pom-config/tenant_groups/influencer.yaml`

```yaml
# Influencer Research Tenant Group
# For analyzing social media influencers and content creators

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
  - Brand collaboration history and fit

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

# Researchers for this domain
researchers:
  - audience       # Follower demographics, engagement
  - content        # Content types, posting patterns
  - brand          # Brand partnerships, sponsorships
  - engagement     # Engagement metrics, growth
  - platform       # Platform presence, cross-platform

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
      - /bio

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
    - instagram.com
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
```

---

## Step 2: Create Tenant

The tenant defines who is doing the research.

**File:** `pom-config/tenants/influencer_intel.yaml`

```yaml
# Influencer Intelligence Tenant

id: influencer_intel
name: Influencer Intelligence
type: tenant
description: Influencer intelligence platform for brand partnership analysis

# Link to tenant group
tenant_group: influencer

# Primary entity collection
entity_collection: Domain

# Collection access groups
groups: ["research", "url"]

# Use global classifier
classifier_tenant: classifier

# User information
user:
  name: Brand Manager
  role: Partnerships Lead
  email: partnerships@influencer-intel.com

# Analysis configuration
analysis_config:
  mission: "Find emerging influencers with engaged audiences for brand partnerships"

  industry_focus:
    - lifestyle
    - tech
    - gaming
    - beauty
    - fitness
    - travel
    - food

  researcher_guidance:
    audience:
      key_indicators:
        - "Engagement rate (likes, comments, shares)"
        - "Follower growth trends"
        - "Audience demographics (age, location)"
      critical_fields:
        - followerCount
        - engagementRate
        - audienceDemographics

    content:
      focus: "Identify content themes, posting frequency, and content quality"
      critical_fields:
        - contentCategories
        - postingFrequency
        - contentStyle

    brand:
      key_indicators:
        - "Past brand partnerships"
        - "Sponsorship disclosure patterns"
        - "Brand fit indicators"
      critical_fields:
        - brandPartnerships
        - sponsorshipHistory

# Data sources
data_sources:
  data_dir: "Data/uploads/tenants/influencer_intel"
  upload_dir: "Data/uploads/tenants/influencer_intel"

# Collection routing
collections:
  # Research collections - Cloud
  Research_audience: "cloud"
  Research_content: "cloud"
  Research_brand: "cloud"
  Research_engagement: "cloud"
  Research_platform: "cloud"

  # Entity source - Cloud
  Domain: "cloud"

  # Page collections - Spark (GPU)
  Page_facts: "spark"
  Page_intelligence: "spark"
  Page_content: "spark"

  # Knowledge base - Spark
  Knowledge_base: "spark"
```

---

## Step 3: Create Researcher AI Configs

Create a config for each researcher. Here are two examples:

### Audience Researcher

**File:** `pom-config/researcher_ai/audience_ai.yaml`

```yaml
id: audience
type: researcher_ai
researcher_type: audience
collection_schema_id: Research_audience
name: Research Audience

researcher_identity:
  title: Audience Demographics & Engagement Analyst
  mission: Analyze follower demographics, engagement patterns, and audience quality
  ecosystem_role: Audience-focused researcher delivering demographic intelligence
  core_competencies:
    - "Demographics Analysis: Age, gender, location distributions"
    - "Engagement Metrics: Like/comment ratios, share rates"
    - "Audience Segmentation: Identify distinct follower groups"
    - "Growth Analysis: Follower growth trends, viral moments"
    - "Authenticity Assessment: Real vs fake follower indicators"

search_query: |
  Who are the followers and audience?
  What are the audience demographics, age, gender, location?
  What is the engagement rate and follower interaction patterns?
  How authentic is the audience?

# Note: page_categories_of_interest is NOT implemented in pom-core

focus_areas:
  - Total follower count across platforms
  - Engagement rate (likes, comments, shares)
  - Audience demographics (age, gender, location)
  - Growth rate and trajectory
  - Authenticity indicators

fact_types:
  - follower_count
  - engagement_rate
  - audience_demographics
  - geographic_distribution
  - growth_rate

tool_guidance:
  brave_search:
    priority: high
    max_calls: 3
    when_to_use: |
      **SEARCH #1**: Audience demographics
      → "{name} audience demographics followers"

      **SEARCH #2**: Engagement statistics
      → "{name} engagement rate analytics"

avoid:
  - Speculating on private analytics
  - Using unverified metrics
  - Assuming demographics without evidence
```

### Content Researcher

**File:** `pom-config/researcher_ai/content_ai.yaml`

```yaml
id: content
type: researcher_ai
researcher_type: content
collection_schema_id: Research_content
name: Research Content

researcher_identity:
  title: Content Strategy & Performance Analyst
  mission: Analyze content types, themes, quality, and performance patterns
  ecosystem_role: Content-focused researcher delivering creative intelligence
  core_competencies:
    - "Content Categorization: Themes, formats, styles"
    - "Posting Patterns: Frequency, timing, consistency"
    - "Performance Analysis: Top-performing content types"
    - "Platform Optimization: Platform-specific content strategies"
    - "Trend Identification: Content trends and viral patterns"

search_query: |
  What type of content do they create?
  What are their content themes, formats, and style?
  How often do they post and when?
  What content performs best?

# Note: page_categories_of_interest is NOT implemented in pom-core

focus_areas:
  - Primary content categories/niches
  - Content formats (video, photos, stories)
  - Posting frequency and schedule
  - Content quality and production value
  - Top-performing content themes
  - Platform-specific strategies

fact_types:
  - content_categories
  - content_format
  - posting_frequency
  - content_style
  - performance_patterns

tool_guidance:
  brave_search:
    priority: medium
    max_calls: 2
    when_to_use: |
      **SEARCH #1**: Content themes
      → "{name} content creator niche topics"

      **SEARCH #2**: Content style
      → "{name} content style format type"

avoid:
  - Guessing content without evidence
  - Speculating on posting schedules
  - Making assumptions about performance
```

---

## Step 4: Create Schemas

Create output schemas for each researcher. Here's an example:

### Audience Schema

**File:** `pom-config/schemas/Research_audience_schema.yaml`

```yaml
type: research
class: Research_audience
id: Research_audience
name: Research Audience
description: |
  Audience Demographics & Engagement Intelligence

  RESEARCHER: Audience Demographics Analyst

  CONTENTS:
  - Follower counts and growth metrics
  - Audience demographics
  - Engagement patterns
  - Authenticity indicators

invertedIndexConfig:
  bm25:
    b: 0.75
    k1: 1.2
  indexNullState: true
  stopwords:
    preset: en

vectorizer: none

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

multiTenancyConfig:
  autoTenantActivation: true
  autoTenantCreation: true
  enabled: true

properties:
  # Identity
  - name: entityName
    dataType: [text]
    description: Influencer/creator name
    sets: [extended, system]
    tags: [identity]

  - name: domain
    dataType: [text]
    description: Website domain
    sets: [extended, system]
    tags: [identity]
    moduleConfig:
      text2vec-weaviate:
        skip: true

  # Follower Metrics
  - name: followerCount
    dataType: [number]
    description: Total follower count
    tags: [metrics, research]
    sets: [standard, prompt]

  - name: engagementRate
    dataType: [number]
    description: Average engagement rate
    tags: [metrics, research]
    sets: [standard, prompt]

  # Audience Size Classification
  - name: audienceSizeLLM
    dataType: [text]
    description: Analysis of audience size and reach
    tags: [LLM]
    sets: [prompt]

  - name: audienceSizeCat
    dataType: [text]
    description: Audience size category
    enum: [Nano, Micro, Mid-Tier, Macro, Mega, Unknown]
    tags: [Cat]
    sets: [standard, EnumCat]
    metadata:
      source_llm: audienceSizeLLM

  # Demographics
  - name: audienceDemographicsLLM
    dataType: [text]
    description: Detailed demographics analysis
    tags: [LLM]
    sets: [prompt]

  - name: audienceInterestsLLM
    dataType: [text]
    description: Audience interests and affinities
    tags: [LLM]
    sets: [prompt]

  - name: primaryAgeGroup
    dataType: [text]
    description: Primary audience age group
    enum: [Gen-Z, Millennial, Gen-X, Boomer, Mixed, Unknown]
    tags: [Cat]
    sets: [standard, EnumCat]

  # Growth
  - name: growthRate
    dataType: [number]
    description: Monthly follower growth rate
    tags: [metrics]
    sets: [extended]

  # Authenticity
  - name: authenticityScore
    dataType: [number]
    description: Estimated authenticity score (0-100)
    tags: [metrics]
    sets: [extended]

  # Metadata
  - name: processedDate
    dataType: [text]
    description: Analysis date
    sets: [system, metadata]

  - name: analysisConfidence
    dataType: [text]
    description: Confidence level
    sets: [system, metadata]
    moduleConfig:
      text2vec-weaviate:
        skip: true

references:
  - name: domainBeacon
    target_collection: Domain
    uuid_source_field: uuid
    description: Reference to Domain record

group: research
weaviate_instance: cloud
collection_name: Research_audience

uuid_strategy:
  fields:
    - field: domain
      namespace: URL

reverse_references:
  - target_collection: Domain
    target_property: audience
    use_my_uuid: true
```

---

## Step 5: Validate and Test

### 1. Validate All Configs

```bash
cd ~/Projects/pom-config
python scripts/validate_all_configs.py
```

### 2. Test Loading via CoreModelService

```bash
docker exec pom-core-dev python -c "
from pom_core.services.core_model_service import get_core_model_service

service = get_core_model_service()

# Test tenant group
tg = service.get_object('tenant_group', 'influencer')
print(f'Tenant Group: {tg.id}')
print(f'Researchers: {tg.researchers}')

# Test tenant
tenant = service.get_object('tenant', 'influencer_intel')
print(f'Tenant: {tenant.id}')
print(f'Tenant Group: {tenant.tenant_group}')

# Test researcher_ai
researcher = service.get_object('researcher_ai', 'audience')
print(f'Researcher: {researcher.researcher_type}')
print(f'Title: {researcher.researcher_identity.title}')

# Test schema
schema = service.get_object('schema', 'Research_audience')
print(f'Schema: {schema.class_}')
print(f'Properties: {len(schema.properties)}')
"
```

### 3. Test Research Pipeline

```bash
# Run a test entity through the pipeline
docker exec pom-core-dev python -c "
# This would run the actual research pipeline
# Example: pomflow domain 'MrBeast' --tenant influencer_intel
print('Pipeline test would run here')
"
```

---

## Summary

### Files Created

| File | Purpose |
|------|---------|
| `tenant_groups/influencer.yaml` | Define researchers and domain |
| `tenants/influencer_intel.yaml` | Define tenant and routing |
| `researcher_ai/audience_ai.yaml` | Audience researcher config |
| `researcher_ai/content_ai.yaml` | Content researcher config |
| `schemas/Research_audience_schema.yaml` | Audience output schema |

### Key Relationships

```
┌─────────────────────────────────────────────────────────────────────┐
│  influencer_intel (tenant)                                          │
│  └── tenant_group: influencer                                       │
│      └── researchers: [audience, content, brand, engagement, ...]   │
│          └── audience_ai.yaml                                       │
│              └── collection_schema_id: Research_audience            │
│                  └── Research_audience_schema.yaml                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Using the Existing entity_researcher.prompty

You don't need a new prompt! The existing `entity_researcher.prompty`:

1. Accepts `researcher_id` input
2. Loads `researcher_ai/{id}_ai.yaml` automatically
3. Injects researcher identity and search query
4. Outputs to the appropriate Research_* schema

Just create the researcher_ai and schema configs, and the prompt handles the rest.

---

## Next Steps

1. Create remaining researcher configs (brand, engagement, platform)
2. Create remaining schemas
3. Test with sample influencers
4. Tune search queries and page categories based on results
5. Adjust schema fields based on what the AI extracts

---

## Related Documentation

- [Creating Tenant Groups](../guides/CREATING_TENANT_GROUPS.md)
- [Creating Tenants](../guides/CREATING_TENANTS.md)
- [Creating Researchers](../guides/CREATING_RESEARCHERS.md)
- [Creating Schemas](../guides/CREATING_SCHEMAS.md)
- [Creating Prompts](../guides/CREATING_PROMPTS.md)
