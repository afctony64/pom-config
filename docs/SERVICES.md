# Pom Ecosystem Services Reference

> **Single Source of Truth** for all services, ports, and startup behavior.

## Quick Reference

### Frontends

| Service | Port | Container | Auto-Start | URL |
|---------|------|-----------|------------|-----|
| Pomothy Admin UI | **5174** | `pomothy-frontend` | ✅ Yes | http://localhost:5174 |
| PomAI Dev Tools | **5173** | `pomai-frontend` | ✅ Yes | http://localhost:5173 |
| Report Dashboard | **8886** | `mac-report-server` | ✅ Yes | http://localhost:8886 |
| Grafana (Spark) | **3002** | `grafana` | ✅ Yes | http://spark-65d6.local:3002 |

### Backends

| Service | Port | Container | Auto-Start | Health Endpoint |
|---------|------|-----------|------------|-----------------|
| Pomothy Backend | **8001** | `pomothy-backend` | ✅ Yes | `/health/ready` |
| PomAI Backend (Mac) | - | `pomai-backend-mac` | Travel only | - |
| PomAI Backend (Spark) | - | `pomai-backend-spark` | ✅ Yes | - |
| LLM Proxy (Mac) | **4001** | `pom-llm-proxy` | ✅ Yes | `/health` |
| pom-core Dev | - | `pom-core-dev` | ✅ Yes | - |

### Databases

| Service | Port | Container | Auto-Start | Health Endpoint |
|---------|------|-----------|------------|-----------------|
| Weaviate (Mac) | **8080** | `mac-weaviate` | ✅ Yes | `/v1/.well-known/ready` |
| Weaviate (Spark) | **8080** | `spark-weaviate` | ✅ Yes | `/v1/.well-known/ready` |
| Redis (Mac) | **6379** | `mac-redis` | ✅ Yes | `redis-cli ping` |
| Redis (Spark) | **6379** | `spark-redis` | ✅ Yes | `redis-cli ping` |

### AI Services

| Service | Port | Container/Process | Auto-Start | Notes |
|---------|------|-------------------|------------|-------|
| Ollama LB | **11430** | `ollama-lb` | ✅ Yes | Routes to Spark GPU |
| Ollama (Mac Native) | **11435** | Native process | ❌ Manual | `./scripts/mac-ollama-metal.sh` |
| Ollama (Spark GPU) | **11434** | `spark-ollama` | ✅ Yes | CUDA GPU, 32 parallel |
| Transformers (Mac Native) | **8093** | Native process | ❌ Manual | `./scripts/mac-transformers-metal.sh` |
| Transformers LB (Spark) | **80** | `spark-transformers-lb` | ✅ Yes | GPU cluster |

### Observability

| Service | Port | Container | Auto-Start | URL |
|---------|------|-----------|------------|-----|
| Loki | **3102** | `mac-loki` | ✅ Yes | - |
| Tempo | **3200** | `mac-tempo` | ✅ Yes | - |
| Jaeger UI | **16686** | `mac-jaeger` | ✅ Yes | http://localhost:16686 |
| Prometheus (Spark) | **9095** | `prometheus` | ✅ Yes | http://spark-65d6.local:9095 |
| Grafana (Spark) | **3002** | `grafana` | ✅ Yes | http://spark-65d6.local:3002 |

### Dev Tools

| Service | Port | Container | Auto-Start | URL |
|---------|------|-----------|------------|-----|
| Redis Insight | **5540** | `mac-redis-insight` | ✅ Yes | http://localhost:5540 |
| MinIO (S3 API) | **9000** | `mac-minio` | ✅ Yes | - |
| MinIO Console | **9001** | `mac-minio` | ✅ Yes | http://localhost:9001 |
| MailHog UI | **8025** | `mac-mailhog` | ✅ Yes | http://localhost:8025 |

### Supabase (Local Auth)

| Service | Port | Container | Auto-Start | URL |
|---------|------|-----------|------------|-----|
| Supabase Studio | **3100** | `mac-supabase-studio` | ✅ Yes | http://localhost:3100 |
| Supabase Kong | **8100** | `mac-supabase-kong` | ✅ Yes | http://localhost:8100 |
| PostgreSQL | **5432** | `mac-supabase-db` | ✅ Yes | - |
| GoTrue Auth | **9999** | `mac-supabase-auth` | ✅ Yes | - |

---

## Reserved Ports (DO NOT USE)

| Port | Reason | Severity |
|------|--------|----------|
| **4000** | Cursor MCP Server | 🔴 Critical |
| **5000** | macOS ControlCenter / AirPlay | 🔴 Critical |
| **3000** | Common dev server default | ⚠️ Warning |

---

## Startup Commands

### Start Everything (HOME Mode)

```bash
cd ~/Projects/PomSpark
./scripts/dev.sh home
```

This starts:
- All Mac Docker containers (including both frontends)
- Spark containers via SSH
- Smart proxies (Ollama LB)
- Test containers

### Start Specific Components

```bash
# Mac Metal services (native, for embeddings/LLM)
./scripts/mac-transformers-metal.sh start
./scripts/mac-ollama-metal.sh start

# Port validation
./scripts/test-ports.sh

# Frontend-only test
./scripts/test-ports.sh frontends
```

### Switch Modes

```bash
./scripts/dev.sh home    # Mac + Spark (full power)
./scripts/dev.sh travel  # Mac only (offline capable)
./scripts/dev.sh ooo     # Spark only (unattended)
```

---

## Configuration Files

| File | Purpose |
|------|---------|
| `pom-config/services.yaml` | Full service definitions (YAML) |
| `pom-config/shared-config.env` | Environment variables with ports |
| `PomSpark/configs/docker-compose.mac.yml` | Mac Docker services |
| `PomSpark/configs/docker-compose.spark.yml` | Spark Docker services |
| `PomSpark/configs/docker-compose.llm-proxy.yml` | LLM Proxy service |

---

## Port Validation

The port test script reads from `pom-config/shared-config.env`:

```bash
# Run all port tests
./scripts/test-ports.sh

# Check frontend services only
./scripts/test-ports.sh frontends

# Check for Cursor conflicts
./scripts/test-ports.sh cursor

# Check port availability only
./scripts/test-ports.sh availability
```

---

## Environment Variables

All port assignments are defined in `pom-config/shared-config.env`:

```bash
# Frontends
POMOTHY_FRONTEND_PORT=5174
POMAI_FRONTEND_PORT=5173
REPORT_SERVER_PORT=8886

# Backends
POMOTHY_BACKEND_PORT=8001
LLM_PROXY_EXTERNAL_PORT=4001

# Databases
WEAVIATE_PORT=8080
REDIS_PORT=6379

# AI Services
OLLAMA_LB_PORT=11430
MAC_TRANSFORMERS_NATIVE_PORT=8093
```

Docker Compose files reference these variables:

```yaml
ports:
  - "${POMOTHY_FRONTEND_PORT:-5174}:5174"
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FRONTENDS (Browser)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  Pomothy Admin UI     PomAI Dev Tools      Report Dashboard                 │
│  :5174                :5173                :8886                            │
└────────────────────────────┬────────────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────────────┐
│                          BACKENDS (API)                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  Pomothy Backend      LLM Proxy           PomAI Backend (Spark)             │
│  :8001                :4001               (internal only)                   │
└────────────────────────────┬────────────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────────────┐
│                          AI SERVICES                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  Ollama LB → Spark Ollama    Mac Transformers → Spark Transformers LB       │
│  :11430    → :11434           :8093            → :80                        │
└────────────────────────────┬────────────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────────────┐
│                          DATABASES                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  Mac Weaviate         Spark Weaviate       Redis                            │
│  :8080                :8080                :6379                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### Port Conflict with Cursor

If you see errors on port 4000:
1. This is expected - Cursor uses port 4000 for MCP
2. LLM Proxy is configured on port 4001 to avoid this
3. Run `./scripts/test-ports.sh cursor` to verify

### Service Not Starting

1. Check port availability: `./scripts/test-ports.sh availability`
2. Check Docker logs: `docker logs <container-name>`
3. Verify configuration in `pom-config/shared-config.env`

### Frontend Not Accessible

1. Check container is running: `docker ps | grep frontend`
2. Verify port mapping: `docker port <container-name>`
3. Test health: `curl http://localhost:<port>`

---

## Related Documentation

- [PomSpark DEVOPS.md](../../PomSpark/DEVOPS.md) - Infrastructure management
- [PomSpark PORT_REFERENCE.md](../../PomSpark/docs/PORT_REFERENCE.md) - Detailed port reference
- [PomSpark CURSOR_PORT_CONFLICTS.md](../../PomSpark/docs/CURSOR_PORT_CONFLICTS.md) - Cursor conflict details
