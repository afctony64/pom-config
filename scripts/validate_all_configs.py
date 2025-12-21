#!/usr/bin/env python3
"""Validate all pom-config YAML files against pom-core Pydantic models."""

import sys
from pathlib import Path

import yaml

# Add pom-core to path for model imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "pom-core"))

from pom_core.models.config_models import LLMModelCard, ToolCard
from pom_core.models.data_model import DataCardConfig
from pom_core.models.tenant_group_models import TenantGroupConfig
from pom_core.models.weaviate_config_model import WeaviateClassConfig

CONFIG_ROOT = Path(__file__).parent.parent

VALIDATORS = {
    "schemas": WeaviateClassConfig,
    "data_cards": DataCardConfig,
    "llm_models": LLMModelCard,
    "tools": ToolCard,
    "tenant_groups": TenantGroupConfig,
}


def validate_directory(dir_name: str, model_class: type) -> list[str]:
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
            
            if data:
                model_class.model_validate(data)
                print(f"  ✓ {yaml_file.name}")
        except Exception as e:
            errors.append(f"{yaml_file.name}: {e}")
            print(f"  ✗ {yaml_file.name}: {e}")
    
    return errors


def main():
    """Run validation on all config directories."""
    all_errors = []
    
    for dir_name, model_class in VALIDATORS.items():
        print(f"\n📁 Validating {dir_name}/")
        errors = validate_directory(dir_name, model_class)
        all_errors.extend(errors)
    
    if all_errors:
        print(f"\n❌ {len(all_errors)} validation errors found")
        sys.exit(1)
    else:
        print("\n✅ All configs validated successfully")
        sys.exit(0)


if __name__ == "__main__":
    main()
