# Runtime Configuration Guide

> **Centralized configuration for mode and workload profile management.**

## Overview

The Pom ecosystem uses a centralized configuration system to ensure all services run with consistent mode and workload profile settings. This prevents configuration drift where individual services might have different settings.

### Key Principles

1. **Defaults on Startup**: Fresh startup defaults to `home` mode + `data_pipeline` profile
2. **Manual Switching**: Mode and profile switches are explicit commands
3. **Automatic Validation**: Every switch runs validation to confirm consistency
4. **Centralized Config**: All settings defined in `pom-config/runtime.yaml`

---

## Quick Reference

### Check Current State

```bash
./scripts/dev.sh status     # Show mode and services
./scripts/workload.sh status   # Show profile and resources
./scripts/dev.sh validate     # Full configuration validation
```

### Switch Mode

```bash
./scripts/dev.sh home      # Mac + Spark GPU (DEFAULT - always returns here)
./scripts/dev.sh travel    # Mac only (EXCEPTIONAL - requires confirmation)
./scripts/dev.sh ooo       # Spark via tunnel (EXCEPTIONAL - requires confirmation)
```

> ⚠️ **Note**: `travel` and `ooo` are **exceptional modes** that require explicit confirmation.
> All automatic recovery and default behaviors return to `home` mode.

### Switch Profile

```bash
./scripts/workload.sh data_pipeline  # Heavy embeddings (DEFAULT)
./scripts/workload.sh ai             # Heavy LLM
./scripts/workload.sh balanced       # Mixed workloads
./scripts/workload.sh query_only     # Search only
```

---

## Defaults

Defaults are defined in `pom-config/shared-config.env`:

| Setting | Default | Description |
|---------|---------|-------------|
| `DEFAULT_MODE` | `home` | Mode on fresh startup |
| `DEFAULT_WORKLOAD_PROFILE` | `data_pipeline` | Profile on fresh startup |
| `VALIDATE_ON_SWITCH` | `true` | Run validation after switch |
| `REQUIRE_VALIDATION` | `true` | Fail switch if validation fails |

### Why These Defaults?

- **home mode**: Most development happens with full access to Mac + Spark
- **data_pipeline profile**: Data processing (Domain/Page/Facts) is the most common workflow

---

## Modes

### home (Default) ✅

Full development environment with Mac + Spark GPU. **This is the normal operating mode.**

| Component | Configuration |
|-----------|--------------|
| Weaviate | Spark (primary), Mac (backup) |
| Ollama | Spark GPU (32 parallel threads) |
| Transformers | Spark GPU (5 instances) |
| PomAI | Runs on Spark |
| Frontends | All running on Mac |

**When to use**: Normal development at home/office with Spark server available.

**All automatic recovery, restart, and default behaviors return to HOME mode.**

---

### travel ⚠️ EXCEPTIONAL

> **This is an exceptional mode requiring explicit confirmation.**

Mac-only mode for offline work.

| Component | Configuration |
|-----------|--------------|
| Weaviate | Mac only |
| Ollama | Mac Metal (native) |
| Transformers | Mac Metal (native) |
| PomAI | Runs on Mac |
| Cloud | Disabled |

**When to use**: Working without network access to Spark (e.g., on a plane, no internet).

**Limitations**:
- Slower LLM processing (Mac Metal vs Spark GPU)
- Limited resources for heavy workloads
- Data changes need syncing when back online

**To return to normal**: `./scripts/dev.sh home`

---

### ooo (Out of Office) ⚠️ EXCEPTIONAL

> **This is an exceptional mode requiring explicit confirmation.**

Remote mode with Spark GPU access via Cloudflare tunnel.

| Component | Configuration |
|-----------|--------------|
| Weaviate | Cloud Weaviate |
| Ollama | Spark via tunnel |
| Transformers | Mac Metal (local) |

**When to use**: Working remotely but need Spark GPU power.

**Limitations**:
- Requires Cloudflare tunnel running on Spark
- Network-dependent (may be slow or unstable)
- Not recommended for heavy workloads

**To return to normal**: `./scripts/dev.sh home`

---

## Workload Profiles

### data_pipeline (Default)

Optimized for Domain → Page → Facts processing.

| Resource | Allocation | Notes |
|----------|------------|-------|
| Spark Ollama | 16 GB | Minimal - 7B models only |
| Spark Weaviate | 40 GB | Good buffer for indexes |
| PomAI Backend | 56 GB | **Priority** - page processing |
| Transformers | 5 instances | Maximum throughput |
| Browser Pool | 25 contexts | Heavy scraping |

**Best for**: Crawling domains, extracting page content, building fact bases.

### ai

Optimized for researcher prompts and LLM extraction.

| Resource | Allocation | Notes |
|----------|------------|-------|
| Spark Ollama | 80 GB | **Priority** - large models |
| Spark Weaviate | 32 GB | Reduced but functional |
| PomAI Backend | 24 GB | Reduced but functional |
| Transformers | 3 instances | Reduced but functional |
| Browser Pool | 10 contexts | Minimal |

**Best for**: Running researchers, fact extraction with LLMs, complex prompts.

### balanced

General development with mixed workloads.

| Resource | Allocation | Notes |
|----------|------------|-------|
| Spark Ollama | 48 GB | Moderate |
| Spark Weaviate | 40 GB | Moderate |
| PomAI Backend | 32 GB | Moderate |
| Transformers | 3 instances | Moderate |
| Browser Pool | 25 contexts | Full |

**Best for**: General development, mixed tasks.

### query_only

Minimal resources for search and exploration.

| Resource | Allocation | Notes |
|----------|------------|-------|
| Spark Ollama | Stopped | Not needed |
| Spark Weaviate | 48 GB | **Priority** - search |
| PomAI Backend | Stopped | Not needed |
| Transformers | 1 instance | Minimal |

**Best for**: Exploring data, running queries, not processing.

---

## Validation

Validation ensures all services have consistent configuration.

### What Gets Validated

1. **Mode Files**: `.env` and `tenant-config.json` exist and match
2. **Profile Files**: `.current-workload-profile` exists and is valid
3. **Container Consistency**: All containers have same `POMSPARK_MODE`
4. **Service Health**: Required services are running and healthy
5. **Incompatible Combinations**: Mode + Profile combinations that don't work

### Running Validation

```bash
# Full validation (all checks)
./scripts/dev.sh validate

# Quick validation (no health checks)
./scripts/validate-runtime.sh quick

# Mode validation only
./scripts/validate-runtime.sh mode

# Profile validation only
./scripts/validate-runtime.sh profile

# Service health only
./scripts/validate-runtime.sh services
```

### Validation Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📁 MODE CONFIGURATION FILES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ️  Current mode: home
✅ .env file exists
✅ tenant-config.json exists
✅ Mode 'home' is valid

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📊 VALIDATION SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current Configuration:
  Mode:    home (default: home)
  Profile: data_pipeline (default: data_pipeline)

Results:
  ✅ Passed:   15
  ⚠️  Warnings: 2
  ❌ Failed:   0
  🚨 Critical: 0

✅ All validations PASSED - environment is correctly configured
```

---

## Incompatible Combinations

Some mode + profile combinations are incompatible:

| Mode | Profile | Reason |
|------|---------|--------|
| travel | ai | No Spark GPU for heavy LLM workloads |
| travel | data_pipeline | Limited resources for full pipeline |
| ooo | data_pipeline | Tunnel too slow for heavy embeddings |

Validation will warn if you're using an incompatible combination.

---

## Typical Workflows

### Daily Development

```bash
# Start of day (defaults to home + data_pipeline)
./scripts/dev.sh home

# Check everything is running
./scripts/dev.sh status

# Work on data pipeline
# ... run page_facts, domain processing ...

# Switch to AI work
./scripts/workload.sh ai
# ... run researchers ...

# End of day - return to default
./scripts/workload.sh data_pipeline
```

### Going Offline (Travel)

```bash
# Before leaving
./scripts/dev.sh travel

# Verify offline capability
./scripts/dev.sh validate

# Work offline...

# Back online
./scripts/dev.sh home
```

### Profile Switching

```bash
# Heavy embedding work
./scripts/workload.sh data_pipeline
./run.sh page_facts --tenant-id prismatic

# Switch to LLM work
./scripts/workload.sh ai
./run.sh pomflow --domain example.com --researcher-id product

# Back to default
./scripts/workload.sh data_pipeline
```

---

## Configuration Files

| File | Purpose |
|------|---------|
| `pom-config/runtime.yaml` | Full configuration definitions |
| `pom-config/shared-config.env` | Environment variables with defaults |
| `PomSpark/configs/.env` | Current mode configuration |
| `PomSpark/configs/.current-workload-profile` | Current profile marker |
| `PomSpark/configs/.last-validation-result.json` | Last validation results |

---

## Troubleshooting

### Mode Not Switching

1. Check that `.env` file was updated:
   ```bash
   grep POMSPARK_MODE configs/.env
   ```

2. Restart containers to pick up new config:
   ```bash
   docker compose -f configs/docker-compose.mac.yml up -d --force-recreate
   ```

### Profile Not Applying

1. Check profile file exists:
   ```bash
   cat configs/.current-workload-profile
   ```

2. Verify Spark containers were recreated:
   ```bash
   ssh spark-65d6.local docker ps
   ```

### Validation Failing

1. Run full validation with verbose output:
   ```bash
   ./scripts/validate-runtime.sh full
   ```

2. Check specific component:
   ```bash
   ./scripts/validate-runtime.sh services  # Health checks
   ./scripts/validate-runtime.sh consistency  # Container env
   ```

3. Reset to defaults:
   ```bash
   ./scripts/dev.sh home
   ./scripts/workload.sh data_pipeline
   ```

---

## Related Documentation

- [SERVICES.md](./SERVICES.md) - All services and ports
- [PomSpark DEVOPS.md](../../PomSpark/DEVOPS.md) - Infrastructure management
- [PomSpark scripts/workload.sh](../../PomSpark/scripts/workload.sh) - Profile switching
