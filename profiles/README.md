# Mode Profiles

This directory contains environment configuration profiles for different operational modes.

## Available Profiles

| Profile | File | Use When |
|---------|------|----------|
| **Home** | `home.env` | Mac + Spark server both available |
| **Travel** | `travel.env` | Only Mac available (remote work) |
| **OOO** | `ooo.env` | Unattended Spark operation |
| **Spark Test** | `spark_test.env` | Spark-only test runs (DMZ-safe) |

## How to Use

### Option 1: Copy to shared-config.env (Recommended)

```bash
# For home mode
cp profiles/home.env shared-config.env
git add shared-config.env && git commit -m "Switch to home mode"
```

### Option 2: Reference in shared-config.env

Add to `shared-config.env`:
```bash
# Source the current mode profile
# Currently using: home mode
# To switch modes, change this line and copy relevant values
```

### Option 3: PomSpark Mode Switching

Use PomSpark's dev.sh to switch modes (updates local environment):

```bash
cd ~/Projects/PomSpark
./scripts/dev.sh home    # Switch to home mode
./scripts/dev.sh travel  # Switch to travel mode
./scripts/dev.sh ooo     # Switch to OOO mode
```

## Profile Comparison

| Setting | Home | Travel | OOO |
|---------|------|--------|-----|
| **Ollama** | Spark GPU | Mac Metal | Spark GPU |
| **Transformers** | Spark GPU cluster | Mac Metal | Spark GPU cluster |
| **Weaviate** | Spark local | Mac local | Spark local |
| **Mac Required** | Yes | Yes | No |
| **Spark Required** | Yes | No | Yes |

## Spark Test Mode

Spark Test mirrors OOO (Spark-only) but sets test flags:
- `POMSPARK_MODE=test`
- `ENVIRONMENT=test`
- `PYTEST_RUNNING=true`
- Uses Spark-local service hostnames (e.g., `spark-weaviate`)

## Adding New Settings

When adding a new setting:

1. Add to ALL profile files with appropriate values
2. Document the setting with comments
3. Update this README if it's a significant setting
4. Update VERSION and CHANGELOG in parent directory
