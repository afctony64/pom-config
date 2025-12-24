# Configuration Architecture

**Technical Deep-Dive: How pom-core Uses pom-config**

This document explains the technical architecture of the configuration system, including how `CoreModelService` loads, validates, and caches configurations.

---

## Table of Contents

1. [Overview](#overview)
2. [CoreModelService](#coremodelservice)
3. [Pydantic Validation](#pydantic-validation)
4. [Configuration Loading Priority](#configuration-loading-priority)
5. [Caching Architecture](#caching-architecture)
6. [Type Registry](#type-registry)

---

## Overview

The configuration system follows these principles:

1. **pom-config is the Single Source of Truth** - All shared configurations live here
2. **Pydantic-First** - Every config has a Pydantic model for validation
3. **Fail-Fast** - Invalid configs raise errors immediately
4. **Cached Loading** - Redis caching for performance

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Application Layer                            │
│                    (PomAI, Pomothy, PomSpark)                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ uses
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      CoreModelService                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │   Loader    │  │  Validator  │  │    Cache    │                 │
│  │   (YAML)    │  │  (Pydantic) │  │   (Redis)   │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ loads from
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         pom-config                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ schemas/ │ │ tenants/ │ │tenant_   │ │researcher│ │ prompts/ │  │
│  │          │ │          │ │groups/   │ │_ai/      │ │          │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## CoreModelService

`CoreModelService` is the central access layer for all configuration. It:

1. Loads YAML files from pom-config
2. Validates against Pydantic models
3. Caches results in Redis
4. Provides a unified API for all config types

### Location

```
pom-core/pom_core/services/core_model_service.py
```

### Key Methods

```python
from pom_core.services.core_model_service import get_core_model_service

service = get_core_model_service()

# List all objects of a type
tenant_groups = service.list_objects("tenant_group")
# Returns: ["corporate", "travel", "gaming", "recipe"]

# Get a specific object (validated Pydantic model)
config = service.get_object("tenant_group", "corporate")
# Returns: TenantGroupConfig instance

# Get LLM model card
model = service.get_llm_model("qwen3-8b")
# Returns: LLMModelCard instance

# Get prompt template
template = service.get_template("entity/entity_researcher")
# Returns: PromptyTemplate instance
```

### Initialization

When `CoreModelService` initializes, it:

1. **Requires pom-config** - Raises `RuntimeError` if `POM_CONFIG_ROOT` not set
2. **Sets up file watching** - Automatic cache invalidation on file changes
3. **Initializes Redis caching** - Persistent cache across restarts

```python
# From pom_core/services/core_model_service.py

if not SHARED_CONFIG_ROOT or not SHARED_CONFIG_ROOT.exists():
    raise RuntimeError(
        "pom-config not found! Set POM_CONFIG_ROOT environment variable."
    )
```

---

## Pydantic Validation

Every configuration type maps to a Pydantic model. When you call `get_object()`, the YAML is parsed and validated.

### Model Mapping

| Type | Pydantic Model | Location |
|------|----------------|----------|
| `tenant_group` | `TenantGroupConfig` | `models/tenant_group_models.py` |
| `tenant` | `TenantConfig` | `models/tenant_model.py` |
| `researcher_ai` | `ResearcherAIConfig` | `models/ai_config_models.py` |
| `schema` | `WeaviateClassConfig` | `models/weaviate_config_model.py` |
| `data_card` | `DataCardConfig` | `models/data_model.py` |
| `prompty` | `PromptyTemplate` | `models/prompt_model.py` |
| `llm_model` | `LLMModelCard` | `models/config_models.py` |
| `tool` | `ToolCard` | `models/config_models.py` |

### Validation Example

```python
# YAML file: tenant_groups/corporate.yaml
# id: corporate
# display_name: "Corporate Research"
# researchers: [industry, financial, product]

# When loaded:
from pom_core.models.tenant_group_models import TenantGroupConfig

config = TenantGroupConfig(
    id="corporate",
    display_name="Corporate Research",
    researchers=["industry", "financial", "product"]
)
# Validation happens automatically
# Missing required fields → ValidationError
# Wrong types → ValidationError
```

### Key Pydantic Models

#### TenantGroupConfig

```python
class TenantGroupConfig(BaseModel):
    id: str                                    # Required: unique identifier
    type: str | None = "tenant_group"          # Type marker
    display_name: str                          # Required: human-readable name
    description: str | None = None             # Optional description
    
    # Core configuration
    researchers: list[str]                     # Required: list of researcher IDs
    
    # Entity configuration
    entity: EntitySchemaConfig | None = None   # Source/output schema config
    
    # Self-assembly
    assembly: AssemblyConfig | None = None     # URL discovery config
    
    # Display names for templates
    display_names: dict[str, str] | None = None
```

#### TenantConfig

```python
class TenantConfig(BaseModel):
    id: str                                    # Required: unique identifier
    name: str                                  # Required: human-readable name
    type: str = "tenant"                       # Type marker
    
    tenant_group: str | None = None            # Links to TenantGroupConfig
    
    collections: dict[str, str] | None = None  # Weaviate routing
    # Example: {"Research_product": "cloud", "Page_facts": "spark"}
    
    analysis_config: dict[str, Any] | None = None  # Research guidance
    classifier_tenant: str | None = None       # Vec classification tenant
```

#### ResearcherAIConfig

```python
class ResearcherAIConfig(BaseModel):
    id: str | None = None                      # For CoreModelService lookup
    researcher_type: str                       # Required: researcher identifier
    display_name: str | None = None            # Human-readable name
    
    # Identity for prompt injection
    researcher_identity: ResearcherIdentityConfig | None = None
    
    # Data retrieval
    search_query: str                          # Required: keywords for page search
    page_categories: list[str] | None = None   # Page types of interest
    
    # Tool usage
    tool_guidance: dict[str, ToolGuidanceConfig] | None = None
    
    # Output formatting
    output_preferences: OutputPreferencesConfig | None = None
```

---

## Configuration Loading Priority

pom-config is the **single source of truth** for shared configs. There is no fallback.

```
┌─────────────────────────────────────────────────────────────────────┐
│  Environment: POM_CONFIG_ROOT                                       │
│  Points to: ~/.pom_config_pkg or /app/shared_config                │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  pom-config Repository                                              │
│  - schemas/                                                         │
│  - tenant_groups/                                                   │
│  - tenants/                                                         │
│  - researcher_ai/                                                   │
│  - prompts/                                                         │
│  - data_cards/                                                      │
│  - llm_models/                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Environment Setup

```bash
# Local development
export POM_CONFIG_ROOT=~/.pom_config_pkg

# Docker
volumes:
  - .pom_config_pkg:/app/shared_config:ro
environment:
  - POM_CONFIG_ROOT=/app/shared_config
```

### No Fallback Policy

CoreModelService **does not** fall back to:
- Bundled configs in pom-core
- App-specific configs
- Default values

If pom-config is not found, it raises `RuntimeError` immediately.

---

## Caching Architecture

### Redis Caching

All loaded configs are cached in Redis for performance:

```python
# First load: reads YAML, validates, caches
config = service.get_object("tenant_group", "corporate")  # ~50ms

# Subsequent loads: from Redis
config = service.get_object("tenant_group", "corporate")  # ~1ms
```

### Cache Key Format

```
pom:config:{type}:{name}
# Example: pom:config:tenant_group:corporate
```

### Cache Invalidation

Automatic invalidation via file watching:

1. **File watcher** monitors pom-config directory
2. **On file change** → invalidates Redis cache for that file
3. **Next request** → reloads from YAML

Manual invalidation:

```python
service._cache_service.invalidate("tenant_group", "corporate")
```

---

## Type Registry

CoreModelService uses a type registry to map config types to:
- Directory paths
- Pydantic models
- File patterns

### Registry Definition

```python
# From CoreModelServiceConfig

TYPE_CONFIGS = {
    "tenant_group": {
        "path": "tenant_groups",
        "model": TenantGroupConfig,
        "pattern": "*.yaml"
    },
    "tenant": {
        "path": "tenants",
        "model": TenantConfig,
        "pattern": "*.yaml"
    },
    "researcher_ai": {
        "path": "researcher_ai",
        "model": ResearcherAIConfig,
        "pattern": "*_ai.yaml"
    },
    "schema": {
        "path": "schemas",
        "model": WeaviateClassConfig,
        "pattern": "*_schema.yaml"
    },
    # ... more types
}
```

### Adding New Types

To add a new config type:

1. Create Pydantic model in `pom_core/models/`
2. Add directory in `pom-config/`
3. Register in `CoreModelServiceConfig`

---

## Best Practices

### 1. Always Validate Locally

```bash
python scripts/validate_all_configs.py
```

### 2. Use Type Hints

```python
from pom_core.models.tenant_group_models import TenantGroupConfig

def process_tenant_group(config: TenantGroupConfig) -> None:
    # IDE autocomplete works!
    researchers = config.researchers
```

### 3. Handle Missing Configs

```python
config = service.get_object("tenant_group", "maybe_exists")
if config is None:
    # Handle missing config
    pass
```

### 4. Use get_core_model_service()

```python
# Preferred: singleton pattern
from pom_core.services.core_model_service import get_core_model_service
service = get_core_model_service()

# Not: creating new instances
# service = CoreModelService()  # Don't do this
```

---

## Debugging

### Check if config loads

```python
from pom_core.services.core_model_service import get_core_model_service

service = get_core_model_service()
config = service.get_object("tenant_group", "corporate")
print(config.model_dump_json(indent=2))
```

### List available configs

```python
print(service.list_objects("tenant_group"))
print(service.list_objects("researcher_ai"))
print(service.list_objects("schema"))
```

### Check Pydantic validation errors

```python
from pom_core.models.tenant_group_models import TenantGroupConfig
import yaml

with open("tenant_groups/my_config.yaml") as f:
    data = yaml.safe_load(f)

try:
    config = TenantGroupConfig(**data)
except ValidationError as e:
    print(e.json())  # Detailed error info
```

---

## Related Documentation

- [Developer Guide](DEVELOPER_GUIDE.md) - Main entry point
- [Creating Tenant Groups](guides/CREATING_TENANT_GROUPS.md)
- [pom-core .cursorrules](../../pom-core/.cursorrules) - Development rules
