# Tenant Routing Configuration

This directory contains mode-specific tenant routing configurations that define how tenants and collections are routed to different Weaviate instances.

## Files

| File | Mode | Description |
|------|------|-------------|
| `home.yaml` | HOME | Mac + Spark mode - full functionality |
| `travel.yaml` | TRAVEL | Mac only - offline mode |
| `ooo.yaml` | OOO | Out-of-Office - remote access via tunnels |
| `remote.yaml` | REMOTE | Remote development via Cloudflare tunnel |

## Structure

Each file defines:

- `mode` - The mode name
- `defaults` - Default routing behavior
- `weaviate_instances` - Available Weaviate instances and their URLs
- `tenants` - Per-tenant routing overrides
- `collection_routing` - Per-collection routing overrides

## Usage

pom-core's tenant routing service loads these configurations based on `POMSPARK_MODE` environment variable.

## Migration from PomSpark

These configs were migrated from `PomSpark/configs/tenant-config*.json` to provide centralized, version-controlled tenant routing across all Pom ecosystem apps.
