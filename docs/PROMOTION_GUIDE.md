# Config Promotion Guide

How to promote app-specific configs to pom-config for shared use.

## When to Promote

Promote a config when:
1. **Multi-app utility** - Two or more apps need the same config
2. **Stable** - Config has been stable for 2+ releases
3. **Generic** - Not tied to app-specific UI/UX concerns
4. **Validated** - Has corresponding Pydantic model in pom-core

## Promotion Process

### 1. Prepare the Config

```bash
# In your app repo, identify the config to promote
cat core/config/researcher_ai/industry_ai.yaml
```

### 2. Create PR to pom-config

```bash
cd ~/Projects/pom-config
git checkout -b promote/industry-ai-config

# Copy the config
cp ~/Projects/PomAI/core/config/researcher_ai/industry_ai.yaml \
   researcher_ai/industry_ai.yaml

# Validate
python scripts/validate_all_configs.py

git add -A && git commit -m "Promote industry_ai config from PomAI"
```

### 3. After Merge - Remove from Source App

```bash
cd ~/Projects/PomAI
rm core/config/researcher_ai/industry_ai.yaml
git commit -m "Remove industry_ai - now in pom-config"
```

## Three-Layer Loading

```
1. App configs     (core/config/)           - Highest priority
2. Shared configs  (.pom_config_pkg/)       - pom-config
3. Core configs    (pom_core/config/)       - Fallback
```

## Environment Variables

| Variable | Purpose |
|----------|---------|
| POM_CONFIG_ROOT | Override shared config location |
| POM_CORE_CONFIG_ROOT | Override core config location |
