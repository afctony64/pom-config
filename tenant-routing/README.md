# Tenant Routing Configuration

**DEPRECATED**: This directory is no longer used.

## New Architecture

Mode-specific routing is now defined directly in each tenant's YAML file using a `modes:` section.

Example from `tenants/prismatic.yaml`:

```yaml
collections:
  # Default routing (HOME mode)
  Page_facts: "spark"
  Page_intelligence: "spark"
  API_intelligence: "spark"

# Mode overrides - JUST THE CHANGES from default (HOME) routing
modes:
  travel:
    Page_facts: "mac"
    Page_intelligence: "mac"
    API_intelligence: "mac"
  ooo:
    Page_facts: "mac"
    Page_intelligence: "mac"
    API_intelligence: "mac"
```

## How It Works

1. `collections:` defines default routing (HOME mode)
2. `modes:` defines overrides for other modes (only the changes)
3. pom-core reads `POMSPARK_MODE` and applies the appropriate overrides

This is declarative - one source of truth per tenant, no duplication.
