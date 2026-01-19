# Changelog

All notable changes to pom-config will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.7.5] - 2026-01-19

### Added
- **sourceQuality field**: Added `sourceQuality` to all 10 Research_* schemas with `prompt` set
  - Defines explicit criteria: high (5+ pages), medium (2-4 pages), low (1-2 pages), minimal (no relevant pages)
  - Previously the LLM was outputting this field without schema definition or guidance
  - Now properly defined with clear assessment criteria

### Changed
- **entity_researcher.prompty**: Added "QUALITY METADATA FIELDS" section with explicit guidance for:
  - `sourceQuality`: Page availability and content relevance assessment
  - `analysisConfidence`: Evidence quality-based confidence levels
  - `reviewFlag`: Human review signaling criteria

### Schema Updates
All 10 Research schemas updated:
- Research_competitor, Research_customer, Research_financial, Research_industry
- Research_journalist, Research_leadership, Research_partner, Research_product
- Research_risk, Research_social

## [1.7.0] - 2026-01-16

### Added
- Page_intelligence scrape diagnostics: `status_code`, `fetch_method`, `error_category`, `routing_recommendation`, `last_error`, `error_count`

### Changed
- `scrape_status` now documents the full set of scrape states (pending, success, partial, failed, skipped, error)

## [1.6.98] - 2026-01-09

### Added
- **CIT Citation Fields**: 33 new `*CIT` fields across all 10 Research_* schemas for field-level source tracking
  - Enables tracing which source URLs support which specific LLM analysis
  - Complete Cat/LLM/CIT triad pattern for structured research output
- **CIT Tag**: New `CIT` and `provenance` tags for filtering citation fields

### Changed
- **LLM Field Descriptions**: Updated all 33 LLM fields with "FACTS ONLY - no inline citations" guidance
- **entity_researcher.prompty**: Enhanced Citations section with CIT field instructions
- **researcher_ai configs**: Added `citation_format` guidance to all 10 researcher configs
- **SCHEMA_FIELD_SETS.md**: Added CIT pattern documentation

### Schema Updates by Collection
| Collection | CIT Fields Added |
|------------|-----------------|
| Research_product | productTypeCIT, technologyStackCIT, pricingModelCIT, integrationProfileCIT, productMaturityCIT, goToMarketCIT |
| Research_industry | businessModelCIT, deliveryModelCIT, industrySegmentCIT |
| Research_customer | useCaseCIT, customerIndustrySegmentCIT, keyCustomerIndustrySegmentCIT |
| Research_financial | fundingStageCIT, revenueSizeCIT, growthVelocityCIT, profitabilityProfileCIT |
| Research_competitor | competitorAnalysisCIT, marketPositionCIT |
| Research_leadership | founderProfileCIT, executiveExperienceCIT, leadershipStyleCIT |
| Research_partner | partnerTypeCIT, integrationCIT, revenueImpactCIT |
| Research_risk | securityPostureCIT, complianceCertificationCIT, regulatoryEnvironmentCIT |
| Research_journalist | mediaTypeCIT, coverageLevelCIT, mediaSentimentCIT |
| Research_social | platformPresenceCIT, socialContentCIT, communityEngagementCIT |

### Migration Notes
- No data migration needed - CIT fields will be empty for existing records
- Weaviate schema update required after deployment
- Backward compatible - empty CIT arrays won't break existing queries

## [1.6.82] - 2025-01-07

### Added
- `frontend/` directory with shared frontend testing utilities:
  - `frontend/test/mocks/TenantContextMock.ts` - Mock TenantContext for unit tests
  - `frontend/test/mocks/AuthContextMock.ts` - Mock AuthContext for unit tests
  - `frontend/test/mocks/GlobalDataMock.ts` - Mock UnifiedGlobalDataProvider for unit tests
  - `frontend/test/helpers/renderWithProviders.tsx` - Custom render with all providers
  - `frontend/test/index.ts` - Barrel export for all test utilities
  - `frontend/README.md` - Usage documentation

### Changed
- Frontend testing now follows same shared pattern as schemas, data_cards, prompts
- All Pom apps can import consistent mocks via `@pom-config/frontend/test`

### Related
- Pomothy issue: Frontend test coverage review
- pom-docs: `docs/web/FRONTEND_TESTING_STANDARDS.md`

## [1.6.81] - 2025-01-03

### Added
- `profiles/` directory with mode-specific configurations:
  - `profiles/home.env` - Mac + Spark configuration
  - `profiles/travel.env` - Mac-only configuration
  - `profiles/ooo.env` - Spark unattended configuration
  - `profiles/README.md` - Usage documentation
- Extended `shared-config.env` with complete service URLs:
  - Weaviate URLs (MAC_WEAVIATE_URL, SPARK_WEAVIATE_URL, WEAVIATE_GRPC_URL)
  - Ollama URLs (OLLAMA_URL, MAC_OLLAMA_URL, SPARK_OLLAMA_URL)
  - Transformers URLs (MAC_TRANSFORMERS_URL, SPARK_TRANSFORMERS_URL)
  - Other services (LLM_PROXY_URL, REDIS_URL)

### Changed
- `shared-config.env` now references profiles for mode switching

## [1.6.80] - 2025-01-03

### Added
- `shared-config.env` - Centralized non-secret configuration file
  - System paths: RESEARCHER_SEED_OUTPUT_DIR, SHARED_REPORTS_PATH, POM_CONFIG_ROOT
  - System behavior: POMSPARK_MODE, WEAVIATE_MODE, LOG_LEVEL
  - Service URLs: MAC_OLLAMA_URL, SPARK_OLLAMA_URL, TRANSFORMERS_URL
- This follows the same pattern as other pom-config files (schemas, data_cards, etc.)
- Loaded by pom-core via `pom_core/config/settings/env.py`

### Changed
- Non-secret shared configuration now uses pom-config instead of `~/.shared-config.env`
- Same update workflow: `./scripts/pom_config.sh update`

See: pom-core #547, pom-docs/docs/infrastructure/SHARED_CONFIG_GUIDE.md

## [1.6.16] - 2024-12-28

### Fixed
- Financial researcher query configuration fix

## [1.6.15] - 2024-12-28

### Added
- `tool_choice` parameter to researcher_ai configs

## [1.6.14] - 2024-12-28

### Changed
- Stable release with all previous 1.6.x improvements
- First release with proper GitHub release (not just git tag)

## [1.6.0] - 2024-12-28

### Added
- Collection configurations
- UX configs directory
- Enhanced researcher_ai capabilities

## [1.5.2] - 2024-12-28

### Added
- Multiple search queries support

## [1.5.1] - 2024-12-24

### Added
- Tools guide documentation

## [1.5.0] - 2024-12-24

### Added
- Extended tool definitions
- Additional benchmark prompts

## [1.4.0] - 2024-12-23

### Added
- Tenant configurations
- Extended schema definitions

## [1.3.0] - 2024-12-23

### Added
- Additional data cards
- Enhanced llm_models configuration

## [1.2.0] - 2025-01-23

### Added
- **Researcher AI configurations**: Added `researcher_ai/` directory with 10 researcher definitions
  - `competitor_ai.yaml` - Competitor intelligence researcher
  - `customer_ai.yaml` - Customer intelligence researcher
  - `financial_ai.yaml` - Financial intelligence researcher
  - `industry_ai.yaml` - Industry intelligence researcher
  - `journalist_ai.yaml` - Journalist intelligence researcher
  - `leadership_ai.yaml` - Leadership intelligence researcher
  - `partner_ai.yaml` - Partner intelligence researcher
  - `product_ai.yaml` - Product & technology intelligence researcher
  - `risk_ai.yaml` - Risk intelligence researcher
  - `social_ai.yaml` - Social intelligence researcher

### Changed
- Researcher definitions are now shared across all Pom applications
- Enables consistent researcher identities and capabilities across apps

### Related
- PomAI migration: Researcher AI configs moved from PomAI to pom-config

## [1.1.0] - 2025-01-23

### Added
- **Prompts directory**: Added `prompts/` directory with all PomAI prompts migrated for cross-app collaboration
  - `prompts/researchers/` - Core researcher templates (9 prompts)
  - `prompts/entity/` - Entity-agnostic research (3 prompts)
  - `prompts/company/` - Company intelligence (4 prompts)
  - `prompts/benchmarks/` - Benchmark variants (17 prompts)
  - `prompts/utility/` - Utility prompts (3 prompts)
  - `prompts/seed/` - Seed generation (2 prompts)
  - `prompts/apps/pomothy/` - App-specific prompts (1 prompt)

### Changed
- Prompts are now shared across all Pom applications via pom-config
- Three-layer loading: app overrides > pom-config shared > pom-core fallback

### Related
- PomAI migration: Prompts moved from PomAI to pom-config
- pom-core issue: [#322](https://github.com/afctony64/pom-core/issues/322) - Deprecate duplicate prompts

## [1.0.0] - 2024-12-21

### Added
- Initial release with schemas, data_cards, llm_models, tools, and tenant_groups
