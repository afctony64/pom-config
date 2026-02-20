# Creating Researchers

**Guide to defining AI research analysts with ResearcherAIConfig**

Researcher AI configs define the identity, focus, and behavior of each independent AI analyst in your research pipeline.

---

## Table of Contents

1. [Overview](#overview)
2. [File Structure](#file-structure)
3. [Required Fields](#required-fields)
4. [Optional Fields](#optional-fields)
5. [Complete Example](#complete-example)
6. [Pydantic Model Reference](#pydantic-model-reference)
7. [Integration with Prompts](#integration-with-prompts)
8. [Validation](#validation)

---

## Overview

### What is a Researcher AI Config?

A researcher_ai config defines:
- **Identity** - Who is this researcher (title, mission, competencies)
- **Focus** - What to look for (search query, page categories)
- **Behavior** - How to use tools, format output
- **Output** - Which schema to populate

### The Researcher Pool

Researchers are **independent agents** in a shared pool. Tenant groups **select** which researchers they need:

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Researcher Pool                                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │audience │ │ content │ │  brand  │ │platform │ │ engage- │       │
│  │   _ai   │ │   _ai   │ │   _ai   │ │   _ai   │ │ ment_ai │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
└─────────────────────────────────────────────────────────────────────┘
                    │                         │
         ┌──────────┴──────────┐    ┌────────┴────────┐
         ▼                     ▼    ▼                 ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ TenantGroup:    │   │ TenantGroup:    │   │ TenantGroup:    │
│ influencer      │   │ corporate       │   │ gaming          │
│ selects:        │   │ selects:        │   │ selects:        │
│ [audience,      │   │ [product,       │   │ [content,       │
│  content,       │   │  financial,     │   │  platform,      │
│  brand]         │   │  industry]      │   │  engagement]    │
└─────────────────┘   └─────────────────┘   └─────────────────┘
```

---

## File Structure

Researcher AI files are located in:

```
pom-config/
└── researcher_ai/
    ├── competitor_ai.yaml
    ├── customer_ai.yaml
    ├── financial_ai.yaml
    ├── industry_ai.yaml
    ├── journalist_ai.yaml
    ├── leadership_ai.yaml
    ├── partner_ai.yaml
    ├── product_ai.yaml
    ├── risk_ai.yaml
    └── social_ai.yaml
```

**Naming convention:** `{researcher_type}_ai.yaml`

---

## Required Fields

### Minimal Configuration

```yaml
id: audience
type: researcher_ai
researcher_type: audience
collection_schema_id: Research_audience
name: Research Audience

researcher_identity:
  title: Audience Demographics Analyst
  mission: Analyze follower demographics, engagement patterns, and audience segments

search_query: |
  Who are the followers and audience?
  What demographics and engagement patterns exist?
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (e.g., `audience`, `content`) |
| `type` | string | Always `researcher_ai` |
| `researcher_type` | string | Same as id (used for prompt injection) |
| `collection_schema_id` | string | Output schema (e.g., `Research_audience`) |
| `researcher_identity` | object | Title and mission for AI persona |
| `search_query` | string | Keywords for page discovery (hybrid search) |

---

## Optional Fields

### Core Competencies

Skills and expertise for this researcher:

```yaml
researcher_identity:
  title: Audience Demographics Analyst
  mission: Analyze follower demographics, engagement patterns, and audience segments
  core_competencies:
    - "Demographics Analysis: Age, gender, location distribution"
    - "Engagement Patterns: Like/comment ratios, peak activity times"
    - "Audience Segmentation: Identify distinct follower groups"
    - "Growth Tracking: Follower growth trends, churn indicators"
```

### Tool Guidance

Instructions for how tools should be used:

```yaml
tool_guidance:
  brave_search:
    priority: high
    max_calls: 2
    when_to_use: |
      Search for external data not available on the entity's website
```

> **Note:** `page_categories_of_interest` was previously planned but is NOT implemented in pom-core.
> Page selection is currently handled by `search_query` for semantic matching.

### Focus Areas

Key areas this researcher analyzes:

```yaml
focus_areas:
  - Follower count and growth rate
  - Engagement rate (likes, comments, shares)
  - Audience demographics and geography
  - Content consumption patterns
  - Peak activity times
```

### Fact Types to Extract

Types of information to identify:

```yaml
fact_types:
  - follower_count
  - engagement_rate
  - audience_demographics
  - geographic_distribution
  - growth_trajectory
```

### Tool Guidance

Instructions for using external tools:

```yaml
tool_guidance:
  brave_search:
    priority: high
    max_calls: 3
    when_to_use: |
      **SEARCH #1**: Follower demographics
      → "{influencer_name} audience demographics followers"

      **SEARCH #2**: Engagement metrics
      → "{influencer_name} engagement rate statistics"
    recommended_searches:
      demographics: "{name} audience demographics age gender"
      engagement: "{name} engagement rate likes comments"
      growth: "{name} follower growth history"
```

### Avoid List

Things the researcher should not do:

```yaml
avoid:
  - Speculating on private metrics without evidence
  - Using outdated engagement statistics
  - Assuming demographics without data
  - Confusing total reach with engaged followers
```

### Output Preferences

How to format results:

```yaml
output_preferences:
  detail_level: comprehensive
  include_confidence: true
  citation_style: inline
  prioritize_fields:
    - followerCount
    - engagementRate
    - audienceDemographics
```

---

## Complete Example

Here's a complete researcher_ai config for audience analysis:

```yaml
# pom-config/researcher_ai/audience_ai.yaml

id: audience
type: researcher_ai
researcher_type: audience
collection_schema_id: Research_audience
name: Research Audience

# Researcher identity for prompt injection
researcher_identity:
  title: Audience Demographics & Engagement Analyst
  mission: Analyze follower demographics, engagement patterns, audience segments, and growth trajectories
  ecosystem_role: Audience-focused researcher delivering structured demographic and engagement intelligence
  core_competencies:
    - "Demographics Analysis: Age, gender, location, interest distributions"
    - "Engagement Metrics: Like/comment ratios, share rates, save rates"
    - "Audience Segmentation: Identify distinct follower groups and personas"
    - "Growth Analysis: Follower growth trends, churn indicators, viral moments"
    - "Platform Comparison: Cross-platform audience overlap and differences"

# Semantic search query for page selection
search_query: |
  Who are the followers and audience?
  What are the audience demographics, age, gender, location?
  What is the engagement rate and follower interaction patterns?
  What audience segments and personas exist?

# Note: page_categories_of_interest is NOT implemented - use search_query instead

# Focus areas for analysis
focus_areas:
  - Total follower count across platforms
  - Engagement rate (likes, comments, shares, saves)
  - Audience demographics (age, gender, location)
  - Audience interests and affinities
  - Growth rate and trajectory
  - Authenticity indicators (real vs fake followers)
  - Peak engagement times and patterns

# Fact types to extract
fact_types:
  - follower_count
  - engagement_rate
  - audience_demographics
  - audience_interests
  - geographic_distribution
  - growth_rate
  - authenticity_score

# Tool usage guidance
tool_guidance:
  brave_search:
    priority: high
    max_calls: 3
    when_to_use: |
      **SEARCH #1**: Audience demographics
      → "{name} audience demographics followers age gender"

      **SEARCH #2**: Engagement statistics
      → "{name} engagement rate statistics analytics"

      **SEARCH #3**: Growth and reach
      → "{name} follower growth history reach impressions"
    recommended_searches:
      demographics: "{name} audience demographics age gender location"
      engagement: "{name} engagement rate likes comments"
      growth: "{name} follower growth 2024"
      authenticity: "{name} real followers fake followers audit"

# Things to avoid
avoid:
  - Speculating on private analytics data
  - Using engagement metrics from unverified sources
  - Assuming demographics without evidence
  - Confusing followers with engaged audience
  - Treating vanity metrics as engagement indicators

# Output formatting
output_preferences:
  detail_level: comprehensive
  include_confidence: true
  citation_style: inline
  prioritize_fields:
    - followerCount
    - engagementRate
    - audienceDemographics
    - growthRate
    - authenticityScore
```

---

## Pydantic Model Reference

The complete Pydantic model is in `pom_core/models/ai_config_models.py`:

### ResearcherAIConfig

```python
class ResearcherAIConfig(BaseModel):
    # Identity
    id: str | None = Field(None, description="For CoreModelService lookup")
    researcher_type: str = Field(..., description="Researcher identifier")
    display_name: str | None = Field(None, description="Human-readable name")

    # Researcher identity for prompt injection
    researcher_identity: ResearcherIdentityConfig | None = Field(None)

    # Data retrieval
    search_query: str = Field(..., description="Keywords for page search")
    page_categories: list[str] | None = Field(None)
    fact_types: list[str] | None = Field(None)

    # Tool guidance
    tool_guidance: dict[str, ToolGuidanceConfig] | None = Field(None)

    # Analysis focus
    focus_areas: list[str] | None = Field(None)
    avoid: list[str] | None = Field(None)

    # Output formatting
    output_preferences: OutputPreferencesConfig | None = Field(None)

    class Config:
        extra = "allow"
```

### ResearcherIdentityConfig

```python
class ResearcherIdentityConfig(BaseModel):
    title: str = Field(..., description="Role title")
    mission: str = Field(..., description="One-line mission statement")
    core_competencies: list[str] | None = Field(None)
    persona_traits: list[str] | None = Field(None)
```

### ToolGuidanceConfig

```python
class ToolGuidanceConfig(BaseModel):
    priority: str | None = Field(None)  # 'critical', 'high', 'medium', 'low'
    max_calls: int | None = Field(None)
    when_to_use: str | None = Field(None)
    recommended_searches: dict[str, str] | None = Field(None)
    tool_choice: str | None = Field(None)  # 'required', 'auto', 'none'
```

---

## Integration with Prompts

Researcher AI configs are injected into prompts via `{{ researcher_ai }}`:

```jinja2
{# In entity_researcher.prompty #}

## RESEARCHER IDENTITY

{% if researcher_ai and researcher_ai.researcher_identity %}
**Title**: {{ researcher_ai.researcher_identity.title }}
**Mission**: {{ researcher_ai.researcher_identity.mission }}

{% for competency in researcher_ai.researcher_identity.core_competencies %}
- {{ competency }}
{% endfor %}
{% endif %}

## DATA RETRIEVAL

Search Query: {{ researcher_ai.search_query }}

{% if researcher_ai.tool_guidance.brave_search %}
## TOOL GUIDANCE
{{ researcher_ai.tool_guidance.brave_search.when_to_use }}
{% endif %}
```

### How Injection Works

1. **Prompt specifies `researcher_id` input**
2. **CoreModelService loads `researcher_ai/{id}_ai.yaml`**
3. **Config injected as `researcher_ai` object**
4. **Jinja2 template accesses fields**

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
config = service.get_object('researcher_ai', 'audience')
print(f'Loaded: {config.researcher_type}')
print(f'Title: {config.researcher_identity.title}')
print(f'Search: {config.search_query[:50]}...')
"
```

### Common Validation Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `researcher_type: Field required` | Missing researcher_type | Add `researcher_type: your_type` |
| `search_query: Field required` | Missing search query | Add semantic search keywords |
| `researcher_identity.title: Field required` | Missing title | Add title in researcher_identity |

---

## Best Practices

### 1. Write Natural Search Queries

```yaml
# Good - natural language questions
search_query: |
  Who are the followers and audience?
  What are the audience demographics?

# Bad - keyword stuffing
search_query: "followers audience demographics engagement metrics"
```

### 2. Define Clear Core Competencies

```yaml
core_competencies:
  - "Demographics Analysis: Age, gender, location distributions"  # Specific
  - "Engagement Metrics: Like/comment ratios, share rates"         # Measurable
  - "Growth Tracking: Follower growth trends"                      # Actionable
```

### 3. Provide Tool Guidance

```yaml
tool_guidance:
  brave_search:
    priority: high
    when_to_use: |
      **SEARCH #1**: Primary focus
      → "specific query template"
```

---

## Next Steps

After creating a researcher:

1. **Create the output schema** (e.g., `Research_audience_schema.yaml`)
2. **Add researcher to tenant_group** if not already listed
3. **Test with sample entity**

---

## Related Documentation

- [Creating Schemas](CREATING_SCHEMAS.md)
- [Creating Tenant Groups](CREATING_TENANT_GROUPS.md)
- [Creating Prompts](CREATING_PROMPTS.md)
- [Complete Example: Influencer Domain](../examples/NEW_RESEARCH_DOMAIN.md)
