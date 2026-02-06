# pom-config

Shared YAML configuration files for the Pom ecosystem.

## Branch Protection

Updates to `main` must go through a pull request with at least one approval.
Administrator bypass is disabled, so direct pushes to `main` are blocked.

## Overview

This repository contains shared configuration files used across PomAI, Pomothy, and PomSpark.
Configuration validation is performed using Pydantic models from `pom-core`.

## 📚 Documentation

**This repo:** Shared configuration repository and validation guidance
**Architecture reference:** [Config Architecture](docs/CONFIG_ARCHITECTURE.md)
**System-wide:** [pom-docs](https://github.com/afctony64/pom-docs)
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

### Infrastructure Diagram

See [Config Architecture](docs/CONFIG_ARCHITECTURE.md) for the full deep-dive.

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
├── profiles/         # Mode-specific environment configs
├── frontend/         # Shared frontend test utilities (TypeScript)
├── docs/             # Developer documentation
└── scripts/          # Validation scripts
```

## Frontend Test Utilities

**New in v1.6.82:** Shared frontend testing utilities for React apps.

```
frontend/
└── test/
    ├── index.ts                 # Barrel export
    ├── mocks/
    │   ├── TenantContextMock.ts
    │   ├── AuthContextMock.ts
    │   └── GlobalDataMock.ts
    └── helpers/
        └── renderWithProviders.tsx
```

**Why in pom-config (not pom-core)?**
- pom-core is Python; frontend tests are TypeScript
- pom-config already handles multi-format assets (YAML, Jinja2, Env)
- Same sync mechanism: `./scripts/pom_config.sh update`
- See [ADR: Frontend Test Utilities](https://github.com/afctony64/pom-docs/blob/main/docs/architecture/FRONTEND_TEST_UTILITIES_ADR.md)

See [frontend/README.md](frontend/README.md) for usage.

## Testing Philosophy

**pom-config does NOT have unit tests for configuration files.** Here's why:

| Concern | Where Tested | Why |
|---------|--------------|-----|
| YAML syntax | Apps + Validation scripts | pom-core Pydantic models validate on load |
| Schema correctness | Pomothy/PomAI acceptance tests | Real database operations prove validity |
| Frontend mocks | App test suites | Mocks validated by component tests that use them |
| Prompts | Benchmark tests in apps | LLM output quality tests |

### Repo Guardrails

- Root markdown files are restricted to a small allowlist.
- Hook: `scripts/hooks/block_root_markdown.py`
- Run tests: `python scripts/hooks/tests/test_block_root_markdown.py`

**pom-config is configuration, not code.** Testing configuration means testing it in context - when apps consume it.

**What pom-config DOES have:**
- `scripts/validate_all_configs.py` - Syntax/structure validation
- CI linting for YAML format
- TypeScript compilation check for frontend utilities

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

## Versioning and Releases

pom-config uses SemVer and tracks releases with `VERSION` and `CHANGELOG.md`.

Release checklist:
- Update `VERSION` (e.g., `v1.7.0`)
- Add release notes to `CHANGELOG.md`
- Commit with a `feat:`/`fix:`/`update:` prefix
- Tag and publish the release:
  - `git tag vX.Y.Z`
  - `git push origin main --tags`
  - `gh release create vX.Y.Z --title "vX.Y.Z" --notes "See CHANGELOG"`

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
