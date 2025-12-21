# pom-config

Shared YAML configuration files for the Pom ecosystem.

## Overview

This repository contains shared configuration files used across PomAI, Pomothy, and PomSpark. 
Configuration validation is performed using Pydantic models from `pom-core`.

## Structure

```
pom-config/
├── schemas/          # Weaviate class definitions
├── data_cards/       # Data card definitions
├── llm_models/       # LLM model cards
├── tools/            # Tool definitions
├── tenant_groups/    # Domain selectors
├── prompts/          # Shared prompt templates
└── scripts/          # Validation scripts
```

## Usage

Apps mount pom-config via a versioned package directory:

```bash
./scripts/pom_config.sh update v1.2.0
```

## Config Promotion

App configs can be promoted to pom-config when useful across multiple apps.

### Criteria
1. Multi-app utility - Two or more apps need it
2. Stable - Been stable for 2+ releases
3. Generic - Not app-specific UI/UX
4. Validated - Has Pydantic model in pom-core
