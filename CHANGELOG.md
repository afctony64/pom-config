# Changelog

All notable changes to pom-config will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
