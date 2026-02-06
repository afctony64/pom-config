#!/usr/bin/env python3
"""Validate all pom-config YAML files against pom-core Pydantic models."""

import sys
from pathlib import Path

import yaml

# Add pom-core to path for model imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "pom-core"))

from pom_core.models.ai_config_models import ResearcherAIConfig  # noqa: E402
from pom_core.models.config_models import LLMModelCard, ToolCard  # noqa: E402
from pom_core.models.data_model import DataCardConfig  # noqa: E402
from pom_core.models.tenant_group_models import TenantGroupConfig  # noqa: E402
from pom_core.models.ux_config_model import UXConfig  # noqa: E402
from pom_core.models.weaviate_config_model import WeaviateClassConfig  # noqa: E402
from pom_core.services.core_prompty_service import CorePromptyService  # noqa: E402

CONFIG_ROOT = Path(__file__).parent.parent

YAML_VALIDATORS = [
    ("schemas", WeaviateClassConfig, "schema"),
    ("data_cards", DataCardConfig, "data_card"),
    ("llm_models", LLMModelCard, "llm_model"),
    ("tools", ToolCard, "tool"),
    ("tenant_groups", TenantGroupConfig, None),
    ("researcher_ai", ResearcherAIConfig, "researcher_ai"),
    ("ux_configs", UXConfig, "ux_config"),
]


def validate_directory(
    dir_name: str, model_class: type, type_value: str | None = None
) -> list[str]:
    """Validate all YAML files in a directory."""
    errors = []
    config_dir = CONFIG_ROOT / dir_name

    if not config_dir.exists():
        return []

    for yaml_file in config_dir.rglob("*.yaml"):
        if yaml_file.name.startswith("_"):
            continue  # Skip templates

        try:
            with open(yaml_file) as f:
                data = yaml.safe_load(f)

            if data and (type_value is None or data.get("type") == type_value):
                model_class.model_validate(data)
                print(f"  ✓ {yaml_file.name}")
        except Exception as e:
            errors.append(f"{yaml_file.name}: {e}")
            print(f"  ✗ {yaml_file.name}: {e}")

    return errors


def _has_archived_parent(path: Path) -> bool:
    """Return True if any parent directory starts with '_'."""
    return any(part.startswith("_") for part in path.parts)


def _extract_frontmatter(content: str) -> dict | None:
    """Extract YAML frontmatter from prompty content."""
    if not content.startswith("---"):
        return None
    parts = content.split("---", 2)
    if len(parts) < 3:
        return None
    yaml_content = parts[1]
    return yaml.safe_load(yaml_content) if yaml_content else None


def validate_prompts() -> list[str]:
    """Validate prompty files with pom-core PromptyTemplate."""
    errors = []
    prompty_dir = CONFIG_ROOT / "prompts"
    if not prompty_dir.exists():
        return []

    prompty_service = CorePromptyService(base_path=str(prompty_dir))

    for prompty_file in prompty_dir.rglob("*.prompty"):
        if prompty_file.name.startswith("_") or _has_archived_parent(prompty_file):
            continue

        try:
            content = prompty_file.read_text(encoding="utf-8")
            template = prompty_service._parse_template(content, prompty_file.stem)
            if template is None:
                raise ValueError("PromptyTemplate parsing failed")

            frontmatter = _extract_frontmatter(content) or {}
            schema_ref = frontmatter.get("$schema")
            if schema_ref:
                schema_path = (prompty_file.parent / schema_ref).resolve()
                if not schema_path.exists():
                    raise FileNotFoundError(f"Schema reference not found: {schema_ref}")

            print(f"  ✓ {prompty_file.name}")
        except Exception as e:
            errors.append(f"{prompty_file.name}: {e}")
            print(f"  ✗ {prompty_file.name}: {e}")

    return errors


def main():
    """Run validation on all config directories."""
    all_errors = []

    for dir_name, model_class, type_value in YAML_VALIDATORS:
        print(f"\n📁 Validating {dir_name}/")
        errors = validate_directory(dir_name, model_class, type_value)
        all_errors.extend(errors)

    print("\n📁 Validating prompts/")
    all_errors.extend(validate_prompts())

    if all_errors:
        print(f"\n❌ {len(all_errors)} validation errors found")
        sys.exit(1)
    else:
        print("\n✅ All configs validated successfully")
        sys.exit(0)


if __name__ == "__main__":
    main()
