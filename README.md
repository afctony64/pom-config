# pom-config

Shared YAML configuration files for the Pom ecosystem.

## Overview

This repository contains shared configuration files used across PomAI, Pomothy, and PomSpark. 
Configuration validation is performed using Pydantic models from `pom-core`.

## Documentation

**New to pom-config?** Start with the [Developer Guide](docs/DEVELOPER_GUIDE.md).

| Guide | Description |
|-------|-------------|
| [Developer Guide](docs/DEVELOPER_GUIDE.md) | Main entry point - architecture overview |
| [Config Architecture](docs/CONFIG_ARCHITECTURE.md) | How CoreModelService loads and validates configs |
| [Creating Tenant Groups](docs/guides/CREATING_TENANT_GROUPS.md) | Define research domains |
| [Creating Tenants](docs/guides/CREATING_TENANTS.md) | Define research organizations |
| [Creating Researchers](docs/guides/CREATING_RESEARCHERS.md) | Define AI research analysts |
| [Creating Schemas](docs/guides/CREATING_SCHEMAS.md) | Define output structures |
| [Creating Prompts](docs/guides/CREATING_PROMPTS.md) | Define AI instructions |
| [Example: Influencer Domain](docs/examples/NEW_RESEARCH_DOMAIN.md) | Complete walkthrough |

## Structure

```
pom-config/
├── schemas/          # Weaviate class definitions
├── data_cards/       # Data card definitions
├── tools/            # Tool definitions
├── tenant_groups/    # Domain selectors (research methodologies)
├── tenants/          # Tenant configurations (organizations)
├── researcher_ai/    # Researcher AI configurations
├── llm_models/       # LLM model cards
├── prompts/          # Shared prompt templates
├── docs/             # Developer documentation
└── scripts/          # Validation scripts
```

## Quick Start

### Creating a New Research Domain

1. **Create tenant_group** - Define researchers: `tenant_groups/my_domain.yaml`
2. **Create tenant** - Define organization: `tenants/my_tenant.yaml`
3. **Create researcher_ai configs** - Define each researcher: `researcher_ai/my_researcher_ai.yaml`
4. **Create schemas** - Define output: `schemas/Research_my_researcher_schema.yaml`
5. **Validate** - Run `python scripts/validate_all_configs.py`

See [Complete Example: Influencer Domain](docs/examples/NEW_RESEARCH_DOMAIN.md) for a full walkthrough.

## Usage

Apps mount pom-config via a versioned package directory:

```bash
./scripts/pom_config.sh update v1.2.0
```

### Environment Variable

Set `POM_CONFIG_ROOT` to point to pom-config:

```bash
export POM_CONFIG_ROOT=~/.pom_config_pkg
```

## Config Promotion

App configs can be promoted to pom-config when useful across multiple apps.
See [Promotion Guide](docs/PROMOTION_GUIDE.md).

### Criteria
1. Multi-app utility - Two or more apps need it
2. Stable - Been stable for 2+ releases
3. Generic - Not app-specific UI/UX
4. Validated - Has Pydantic model in pom-core
