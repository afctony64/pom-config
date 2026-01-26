# Tenant Configurations

Central repository for production tenant configurations.

## Structure

Each tenant has a YAML file defining:
- **tenant_group**: Which research domain (corporate, travel, gaming, recipe)
- **collections**: Weaviate routing (cloud/spark/local)
- **analysis_config**: Tenant-specific research guidance
- **user**: Contact information

## Loading Priority

1. **pom-config/tenants/** (this folder) - Production configs
2. **pom-core/config/tenants/** - Test configs and fallback

## Production Tenants

| Tenant | Tenant Group | Description |
|--------|--------------|-------------|
| `prismatic` | corporate | B2B SaaS integration platform |
| `prismatic_corporate` | corporate | Prismatic with explicit corporate config |
| `internet_brands` | corporate | Professional services research |
| `central_reach` | corporate | Healthcare marketing |
| `fortune_1000` | corporate | Enterprise research |
| `classifier` | - | Global classifier (seeds) |
| `knowledge` | - | Knowledge base tenant |

## Test Tenants (in pom-core)

Test tenants remain in `pom-core/config/tenants/`:
- `test_db`, `test_db_secondary`
- `pomai_test_db`, `pomothy_test_db`
- `isolation-tenant-*`
- `stress-test-tenant`
- `*_test.yaml`

## Entity Model vs Legacy Model

**Entity Model** (all new tenants):
- `tenant_group: corporate` (or travel, gaming, recipe)
- Source: `Domain`
- Output: `Research_*` collections

**Legacy Model** (deprecated):
- `tenant_group: company`
- Source: `Source`
- Output: `Company_research_*` collections

## Example

```yaml
id: my_tenant
name: My Tenant
type: tenant
tenant_group: corporate  # Entity Model

collections:
  Research_competitor: "cloud"
  Research_customer: "cloud"
  Domain: "cloud"
  Page_facts: "spark"
```
