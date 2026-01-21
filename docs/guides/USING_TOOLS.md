# Using Tools in Prompts

This guide explains how the pom-core tool system works and how to use tools in your `.prompty` files.

## Overview

**Tools** are pre-built capabilities that extend what your prompts can do. They're implemented in pom-core and available to all prompts.

```
┌─────────────────────────────────────────────────────────────┐
│                     Your .prompty File                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Prompt    │  │    Model    │  │       Tools         │  │
│  │   Content   │  │   Config    │  │  (what to use)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   pom-core Execution Engine                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Injection  │  │  LLM Call   │  │  Post-Processing    │  │
│  │   Tools     │→ │  + Tools    │→ │      Tools          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Tool Timing

Tools run at different phases of prompt execution:

| Phase | When | Purpose | Example Tools |
|-------|------|---------|---------------|
| **Injection** | Before LLM | Gather data for context | `page_researcher`, `brave_search`, `domain_data_injector` |
| **Function Calling** | During LLM | LLM requests additional data | `google_search`, `find_records`, `edgar_company_facts` |
| **Post-Processing** | After LLM | Transform/classify output | `auto_cat`, `classify_all`, `pricing_normalizer` |
| **Post-Execution** | After save | Reports, diagnostics | `markdown_report_saver`, `model_judge` |

## Using Tools in Prompts

### 1. Declare Tools in Frontmatter

```yaml
---
name: product_researcher
description: Research company products
model:
  api: chat
  configuration:
    type: openai_chat  # Direct adapter: openai_chat, ollama, anthropic, google
tools:
  - brave_search        # Available for function calling
  - page_researcher     # Injection tool
  - auto_cat            # Post-processing
inputs:
  record:
    type: object
---
```

> **Note:** Apps use direct LLM adapters (`openai_chat`, `ollama`, `anthropic`, `google`) for model routing.
>
> **Available Models:** See [llm_models/](../../llm_models/) for the full list of models and their capabilities.

### 2. Reference Injected Data

Injection tools populate template variables before the LLM runs:

```jinja2
## Company Website Analysis

The following pages were analyzed from {{ record.domain }}:

{% for page in pageData %}
### {{ page.title }} ({{ page.page_type }})
Relevance: {{ page.researcher_score }}

{{ page.content[:2000] }}
{% endfor %}
```

### 3. Let LLM Call Tools

For function-calling tools, just declare them - the LLM decides when to use them:

```yaml
tools:
  - brave_search      # LLM can search web if needed
  - google_search     # Alternative search
  - find_records      # Query database
```

The LLM sees tool descriptions and parameters, then calls them during reasoning.

### 4. Post-Processing Happens Automatically

Classification tools like `auto_cat` and `classify_all` run automatically when:
- The schema has Cat fields (enum or vec)
- The AI response contains LLM fields to classify

No explicit configuration needed - just ensure your schema has the right field types.

## Tool Categories

### 🔍 Search & Web

| Tool | Purpose | Timing |
|------|---------|--------|
| `brave_search` | Privacy-focused web search | Injection, Function Calling |
| `google_search` | Google Custom Search API | Injection, Function Calling |
| `page_researcher` | Inject analyzed website pages | Injection |
| `get_domain_snapshot` | Extract tech stack, social accounts | Injection, Function Calling |

### 💾 Data & Database

| Tool | Purpose | Timing |
|------|---------|--------|
| `find_records` | Query database with filters | Function Calling |
| `create_record` | Create new database records | Function Calling |
| `advanced_fetch` | Complex database queries | Injection, Function Calling |
| `data_query_injector` | Generic query with Jinja2 filters | Injection |
| `researcher_collection_injector` | Aggregate multi-researcher data | Injection |
| `domain_data_injector` | Inject enriched domain data | Injection |

### 📊 Financial (SEC EDGAR)

| Tool | Purpose | Timing |
|------|---------|--------|
| `edgar_company_filings` | Search SEC filings (10-K, 10-Q, 8-K) | Injection, Function Calling |
| `edgar_company_facts` | Get financial facts/metrics | Injection, Function Calling |
| `edgar_filing_sections` | Extract filing sections | Injection, Function Calling |

### 🏷️ Classification

| Tool | Purpose | Timing |
|------|---------|--------|
| `auto_cat` | Vector similarity classification | Post-Processing |
| `enum_classifier` | LLM-based enum classification | Post-Processing |
| `classify_all` | Unified classification (enum + vec) | Post-Processing |

### 📝 Reporting

| Tool | Purpose | Timing |
|------|---------|--------|
| `markdown_report_saver` | Save as markdown file | Post-Execution |
| `html_report_saver` | Save as styled HTML | Post-Execution |
| `pdf_report_saver` | Save as PDF document | Post-Execution |

### 🔧 Data Transformation

| Tool | Purpose | Timing |
|------|---------|--------|
| `pricing_normalizer` | Normalize pricing models | Post-Processing |
| `array_id_generator` | Generate UUIDs for array items | Post-Processing |
| `jinja2_processor` | Process Jinja2 templates | Injection |

## Getting Current Tool Information

**The tool registry is maintained in pom-core** at `pom_core/config/ai_tools_registry.yaml`.

When you need to know:
- What tools are available
- What parameters a tool accepts
- When to use a specific tool

**Ask your AI assistant.** They have access to the live registry and can provide current, accurate information about any tool.

Example questions:
- "What tools can search the web?"
- "What parameters does brave_search accept?"
- "How do I use the EDGAR tools for financial research?"
- "What classification tools are available?"

## Example: Complete Research Prompt

Here's how tools come together in a real prompt:

```yaml
---
name: company_product_researcher
description: Research company products and services
model:
  api: chat
  configuration:
    type: openai_chat
    model: gpt-5-mini
tools:
  - page_researcher       # Injects website pages
  - brave_search          # LLM can search if needed
  - auto_cat              # Classifies output
inputs:
  record:
    type: object
outputs:
  productOverviewLLM:
    type: string
  productMaturityCat:
    type: string
---
system:
You are a product research analyst.

## Available Data

### Website Pages
{% for page in pageData %}
**{{ page.title }}** ({{ page.page_type }}, relevance: {{ page.researcher_score }})
{{ page.content[:1500] }}
---
{% endfor %}

user:
Analyze {{ record.accountName }}'s products and services.

If the website data is insufficient, use brave_search to find additional information.

Provide:
- productOverviewLLM: Comprehensive product description
- productMaturityCat: Will be classified automatically
```

## Key Principles

1. **Injection tools gather context** - They run before the LLM to populate template variables
2. **Function-calling tools are optional** - Declare them, LLM decides when to use
3. **Classification is automatic** - Based on schema field types
4. **Reports save output** - Configure in researcher_ai for automatic saving

## Related Documentation

- [Creating Prompts](CREATING_PROMPTS.md) - Full prompt creation guide
- [Creating Schemas](CREATING_SCHEMAS.md) - Define Cat fields for classification
- [Creating Researchers](CREATING_RESEARCHERS.md) - Wire prompts with tools

---

*Tools are library features of pom-core. For the latest tool options and parameters, ask your AI assistant - they have access to the current registry.*
