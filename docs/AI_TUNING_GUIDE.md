# 🎛️ AI Research Configuration Tuning Guide

> **For AI Agents Building & Tuning Research Systems**

This guide explains how to configure and tune the Pom Research System at each configuration level. Use this to understand where changes should be made and how configurations compose to create the final prompt.

## 📐 Configuration Architecture

The Pom Research System uses a **four-layer configuration hierarchy**:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           FINAL RENDERED PROMPT                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────────────┐ │
│  │  TEMPLATE   │ + │ RESEARCHER  │ + │   TENANT    │ + │   SCHEMA (Fields)   │ │
│  │   (Global)  │   │  (Identity) │   │  (Context)  │   │   (Output Shape)    │ │
│  └─────────────┘   └─────────────┘   └─────────────┘   └─────────────────────┘ │
│                                                                                  │
│  entity_researcher  researcher_ai/   tenants/          schemas/                 │
│  .prompty           {id}_ai.yaml     {id}.yaml         Research_{type}.yaml     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Decision Matrix: Where Should This Change Go?

| Change Type | Layer | File Pattern | Example |
|-------------|-------|--------------|---------|
| **Output format rules** | Template | `prompts/*.prompty` | JSON schema enforcement, data type rules |
| **Analysis methodology** | Template | `prompts/*.prompty` | How to cite sources, confidence levels |
| **Researcher identity** | Researcher | `researcher_ai/{id}_ai.yaml` | Title, mission, core competencies |
| **Search behavior** | Researcher | `researcher_ai/{id}_ai.yaml` | `search_queries`, `tools`, `tool_guidance` |
| **Focus areas** | Researcher | `researcher_ai/{id}_ai.yaml` | What specific topics to prioritize |
| **Business context** | Tenant | `tenants/{id}.yaml` | Company mission, industry focus |
| **Collection routing** | Tenant | `tenants/{id}.yaml` | Where data is stored (cloud, spark) |
| **Field definitions** | Schema | `schemas/Research_{type}.yaml` | Data types, descriptions, sets/tags |
| **Field guidance** | Schema | `schemas/Research_{type}.yaml` | How to populate each field |
| **Classification options** | Schema | `schemas/Research_{type}.yaml` | `enum` values for EnumCat fields |
| **Post-processing** | Researcher/Template | Both | `post_execution_tools` list |

---

## 🔧 Layer 1: Template Level (Global)

**File:** `prompts/entity/entity_researcher.prompty`

The template defines the **global structure and methodology** for all researchers. Changes here affect **all researchers across all tenants**.

### What Template Controls

```yaml
# YAML Frontmatter - Configuration
defaults:
  max_content_chars: 2500    # Token budget per page

inputs:                       # Required/optional parameters
  record: { type: object }    # The entity being analyzed
  researcher_id: { type: string }
  
data_requirements:            # Data injection configuration
  injectors:
    - injector_template: page_facts_vector
      template_vars:
        limit: 100
        alpha: 0.3            # BM25/vector balance

model:                        # LLM configuration
  configuration:
    type: pom-llm-proxy
    model: gpt-5-mini
  parameters:
    max_output_tokens: 8000
    response_format:
      type: json_schema       # Structured output

processing_config:            # Pipeline settings
  compression_strategy: balanced
  max_turns: 15

post_execution_tools:         # Post-processing
  - classify_all              # Fills Cat fields
```

### Template Sections (Jinja2)

```jinja2
## 🎯 RESEARCHER IDENTITY
{{ researcher_ai.researcher_identity.title }}
{{ researcher_ai.researcher_identity.mission }}

## 🏢 TENANT CONTEXT  
{{ tenant.name }} - {{ tenant.description }}

## 📄 PRIMARY SOURCE: PAGE CONTENT
{% for page in pageData %}...{% endfor %}

## 🔧 GUIDANCE (from researcher_ai.tool_guidance)
{{ tool_guidance sections }}

## 🚨 CRITICAL OUTPUT REQUIREMENTS
- Strict schema compliance rules
- Data type instructions
- Field pattern guidance
```

### When to Modify Template

✅ **DO modify template for:**
- Output format rules (JSON structure, strict mode)
- Universal methodology (how to cite, confidence levels)
- Global data injection patterns
- Post-processing that applies to ALL researchers

❌ **DON'T modify template for:**
- Researcher-specific instructions → Use `researcher_ai/*.yaml`
- Tenant-specific context → Use `tenants/*.yaml`
- Field-specific guidance → Use `schemas/*.yaml` descriptions

### Current Improvement Opportunity

The template still contains Cat field instructions that are now handled by post-processing:

```markdown
6. **LLM + Cat FIELD PATTERN**:
   - `*LLM` fields: **Text arrays** with analytical content
   - `*Cat` fields: Will be auto-populated by classify_all post-processor - skip these
```

**Recommendation:** Simplify to focus only on fields the LLM must generate:

```markdown
6. **LLM FIELD PATTERN**:
   - Fields ending in `LLM` return descriptive text arrays (1-3 items, 100-200 words each)
   - See schema descriptions for specific field requirements
```

---

## 🧑‍🔬 Layer 2: Researcher Level (Identity)

**Files:** `researcher_ai/{researcher_id}_ai.yaml`

Each researcher has a unique configuration that defines:
- **WHO** they are (identity, mission, competencies)
- **HOW** they search (queries, tools, guidance)
- **WHAT** they focus on (specific areas of analysis)

### Available Researchers

| ID | Collection | Focus |
|----|------------|-------|
| `product` | Research_product | Product portfolios, technology stacks, features |
| `industry` | Research_industry | Business models, market segments, NAICS codes |
| `competitor` | Research_competitor | Competitive analysis, market position, threats |
| `customer` | Research_customer | Customer profiles, use cases, success stories |
| `leadership` | Research_leadership | Executives, founders, organizational structure |
| `financial` | Research_financial | Funding, revenue, financial health |
| `social` | Research_social | Social presence, engagement, community |
| `partner` | Research_partner | Partnerships, integrations, ecosystem |
| `journalist` | Research_journalist | Media coverage, press, industry voices |
| `risk` | Research_risk | Risk factors, compliance, vulnerabilities |

### Researcher Config Structure

```yaml
id: product
type: researcher_ai
researcher_type: product
collection_schema_id: Research_product  # Links to schema
name: Research Product

# WHO: Researcher identity (injected as researcher_ai.researcher_identity)
researcher_identity:
  title: Product & Technology Intelligence Analyst
  mission: Analyze product portfolios, technology stacks, and technical capabilities
  ecosystem_role: Product-focused researcher delivering structured technology intelligence
  core_competencies:
    - 'Product Analysis: Portfolio mapping, product categories, maturity assessment'
    - 'Technology Stack: Technical capabilities, API documentation'
    - 'Feature Research: Specifications, capabilities, competitive positioning'

# HOW: Search behavior (used by page_facts_vector injector)
search_queries:
  - "What are the main products and features offered?"
  - "What capabilities does the platform provide?"
  - "What is the technology stack and platform integrations?"

# HOW: Tool configuration
tools:
  - brave_search

tool_guidance:
  brave_search:
    priority: medium
    max_calls: 1
    when_to_use: |
      🔍 SEARCH ONLY IF page content lacks product details
      
      **SEARCH (IF NEEDED): Product announcements**
      → "{company} product feature announcement"
      
      **DON'T SEARCH FOR:**
      - Basic product info (on website)
      - Feature lists (check docs)

# WHAT: Focus areas (optional)
focus_areas:
  - Core product identification
  - Technology stack analysis
  - Integration capabilities

# WHAT: Fact types to extract (optional)
fact_types:
  - product_name
  - feature_description
  - technology_stack

# POST: Researcher-specific post-processing
post_execution_tools:
  - classify_all  # Standard
```

### Creating a New Researcher

1. **Create YAML file:** `researcher_ai/{id}_ai.yaml`
2. **Define identity:** Title, mission, competencies
3. **Set search queries:** What content should be retrieved
4. **Configure tools:** What external tools can be used
5. **Link schema:** `collection_schema_id: Research_{type}`

**Template:**

```yaml
id: {researcher_id}
type: researcher_ai
researcher_type: {researcher_id}
collection_schema_id: Research_{researcher_id}
name: Research {Title}

researcher_identity:
  title: {Descriptive Title} Analyst
  mission: {One-sentence mission statement}
  core_competencies:
    - 'Area 1: Specific skills'
    - 'Area 2: Specific skills'

search_queries:
  - "Primary question about this research domain?"
  - "Secondary question for comprehensive coverage?"

tools:
  - brave_search

tool_guidance:
  brave_search:
    priority: low
    max_calls: 1
    when_to_use: |
      Search only if page content is insufficient
```

---

## 🏢 Layer 3: Tenant Level (Context)

**Files:** `tenants/{tenant_id}.yaml`

Tenants provide **business context** that shapes how researchers interpret data. Different tenants may have different:
- Industry focus
- Analysis priorities
- Data source configurations

### Tenant Config Structure

```yaml
id: prismatic
name: Prismatic
type: tenant
description: Prismatic - embedded iPaaS platform for B2B SaaS companies

# Determines which researchers are available
tenant_group: corporate

# Primary entity collection
entity_collection: Domain

# Analysis configuration (injected as tenant.analysis_config)
analysis_config:
  mission: "Find B2B SaaS with APIs, 100+ customers asking for integrations"
  
  industry_focus: 
    - b2b_saas
    - fintech
    - ecommerce_platforms
  
  # Researcher-specific guidance (supplements researcher_ai)
  researcher_guidance:
    product:
      key_indicators: ["API documentation", "Integration marketplace"]
      tech_stack_emphasis: "Extract from engineering blog, job posts"
      critical_fields: ["technologyStack", "coreProducts"]
    
    industry:
      naics_focus: ["518210", "511210"]
      market_signals: ["SaaS metrics", "API subdomain patterns"]

# Collection routing (where data is stored)
collections:
  Research_product: "cloud"
  Research_industry: "cloud"
  Page_facts: "spark"
```

### When to Use Tenant Config

| Need | Tenant Config Section |
|------|----------------------|
| Different industry focus | `analysis_config.industry_focus` |
| Researcher-specific hints | `analysis_config.researcher_guidance.{researcher_id}` |
| Different data sources | `collections` routing |
| Business mission context | `analysis_config.mission` |

---

## 📊 Layer 4: Schema Level (Field Definitions)

**Files:** `schemas/Research_{type}_schema.yaml`

Schemas define the **output structure** - what fields the LLM must populate and how. Field descriptions are **injected into the JSON schema** and serve as the primary guidance for each field.

### Schema Property Structure

```yaml
properties:
  - name: productTypeLLM
    dataType:
      - text[]
    description: >
      Product type description - detailed narrative explaining the product's 
      nature, capabilities, and how it delivers value. Single-element array 
      containing one comprehensive description paragraph.
    sets:
      - prompt      # ← Included in LLM JSON schema
      - standard
    tags:
      - LLM
      - product
    metadata:
      order: 122
```

### Understanding Sets

| Set | Meaning | Effect |
|-----|---------|--------|
| `prompt` | Include in LLM schema | Field appears in JSON schema for LLM |
| `EnumCat` | Enum classification | Post-processed by `enum_cat`, NOT in LLM schema |
| `VecCat` | Vector classification | Post-processed by `vec_cat`, NOT in LLM schema |
| `system` | System-managed | Never shown to LLM |
| `standard` | Standard output | Included in API responses |
| `extended` | Extended output | Included when verbose mode |

### Field Patterns

| Pattern | Description | Schema Config |
|---------|-------------|---------------|
| `*LLM` | LLM generates text | `sets: [prompt]`, `dataType: text[]` |
| `*Cat` | Post-processor classifies | `sets: [EnumCat]` or `[VecCat]` |
| `*Score` | Numeric assessment | `sets: [prompt]`, `dataType: number[]` |
| `*Evidence` | Parallel enrichment | `sets: [post]`, `parallel_to: keyField` |

### Writing Effective Field Descriptions

Field descriptions are **the primary guidance** for the LLM. They should be:

1. **Specific:** What exactly should this field contain?
2. **Actionable:** How should the LLM find/generate this?
3. **Constrained:** What format is required?

**Good Example:**

```yaml
- name: technologyStackLLM
  description: >
    Technology Stack Description - detailed descriptions for each classified 
    technology stack. Array supports multi-stack classification (ordered by 
    similarity score, [0] is primary). Include: frameworks, languages, 
    infrastructure, deployment model. 100-200 words per element.
```

**Poor Example:**

```yaml
- name: technologyStackLLM
  description: Technology stack information
```

### Adding New Fields

1. **Add to schema:** `schemas/Research_{type}_schema.yaml`
2. **Set appropriate `sets`:** `[prompt]` for LLM, `[EnumCat/VecCat]` for classification
3. **Write detailed description:** This is the field guidance
4. **Set `dataType`:** text, text[], number, number[], boolean
5. **Add `tags`:** For filtering and grouping

---

## 🔄 Post-Execution Tools

Post-execution tools run **after** the main LLM call to enhance or classify output.

### Available Tools

| Tool | Purpose | Triggered By |
|------|---------|--------------|
| `classify_all` | Fill all Cat fields | Template-level default |
| `enum_cat` | Fill EnumCat fields only | Researcher-specific |
| `vec_cat` | Fill VecCat fields only | Researcher-specific |
| `parallel_array_enricher` | Enrich parallel arrays | Researcher-specific |
| `entity_spawn` | Create new Domain records | Researcher-specific |

### Tool Priority

Post-execution tools run in order. Define in researcher_ai:

```yaml
post_execution_tools:
  - parallel_array_enricher  # Priority 10: Fill evidence fields
  - entity_spawn             # Priority 20: Create Domain records
  - enum_cat                 # Priority 30: Classify EnumCat
  - vec_cat                  # Priority 40: Classify VecCat
```

---

## 🔍 Previewing Configurations

Use the prompt preview CLI to see how configurations compose:

```bash
# Dry-run preview (no data injection)
docker exec pomai-backend-spark python -m pom_core.cli.prompt_preview_cli \
  --prompt entity/entity_researcher \
  --tenant-id prismatic \
  --researcher-id product \
  --domain example.com \
  --dry-run

# Full preview with data
docker exec pomai-backend-spark python -m pom_core.cli.prompt_preview_cli \
  --prompt entity/entity_researcher \
  --tenant-id prismatic \
  --researcher-id product \
  --domain prismatic.io \
  --no-dry-run
```

### Preview Output Includes

- **Model Configuration:** Type, model, max_tokens
- **JSON Schema:** All fields with descriptions (from schema)
- **Data Requirements:** Injector configuration
- **Context Summary:** Tenant, researcher, tenant_group
- **Rendered System Prompt:** The actual prompt text

---

## 📝 Configuration Checklist

When creating a new research domain:

### 1. Schema First
- [ ] Create `schemas/Research_{type}_schema.yaml`
- [ ] Define all properties with `dataType`, `description`, `sets`, `tags`
- [ ] Mark LLM fields with `sets: [prompt]`
- [ ] Mark classification fields with `sets: [EnumCat]` or `[VecCat]`
- [ ] Add enum values for EnumCat fields
- [ ] Write detailed descriptions (this IS the field guidance)

### 2. Researcher Config
- [ ] Create `researcher_ai/{type}_ai.yaml`
- [ ] Define researcher identity (title, mission, competencies)
- [ ] Set collection_schema_id to match schema
- [ ] Configure search_queries for page retrieval
- [ ] Add tool_guidance if tools are needed
- [ ] Configure post_execution_tools if needed

### 3. Tenant Integration
- [ ] Add collection routing to tenant config
- [ ] Add researcher to tenant_group if applicable
- [ ] Configure researcher_guidance if tenant needs custom hints

### 4. Validation
- [ ] Preview prompt with `prompt_preview_cli`
- [ ] Verify schema injection shows expected fields
- [ ] Verify researcher identity renders correctly
- [ ] Test with real domain data

---

## 🎯 Summary: Where Changes Belong

| If you want to... | Modify this layer |
|-------------------|-------------------|
| Change how ALL researchers work | Template (prompty) |
| Change ONE researcher's identity | Researcher AI config |
| Change ONE researcher's search behavior | Researcher AI config |
| Change ONE tenant's business context | Tenant config |
| Add/modify output fields | Schema |
| Change field descriptions/guidance | Schema |
| Add classification options | Schema (enum values) |
| Add post-processing for a researcher | Researcher AI config |
| Add post-processing for ALL researchers | Template (prompty) |

---

*This guide is part of pom-config - the configuration heart of the Pom Research System.*
