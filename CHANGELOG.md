# Changelog

All notable changes to pom-config will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
