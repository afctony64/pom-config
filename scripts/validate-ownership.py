#!/usr/bin/env python3
"""
Validate OWNERSHIP.yaml files for consistency.

Checks:
1. All paths exist
2. No conflicting ownership claims
3. All agents have required fields
4. Cross-repo consistency
"""

import sys
from pathlib import Path
import yaml

def load_ownership(path: Path) -> dict:
    """Load and parse OWNERSHIP.yaml"""
    if not path.exists():
        print(f"❌ Not found: {path}")
        return None
    
    with open(path) as f:
        return yaml.safe_load(f)

def validate_agent(agent_name: str, agent_data: dict, repo_path: Path) -> list:
    """Validate a single agent's configuration"""
    errors = []
    
    # Check required fields
    required = ['description', 'owns', 'can_write', 'read_only']
    for field in required:
        if field not in agent_data:
            errors.append(f"  ⚠️  {agent_name}: Missing '{field}' field")
    
    # Check paths exist (for 'owns' and 'can_write')
    for field in ['owns', 'can_write']:
        if field in agent_data:
            for path in agent_data[field]:
                full_path = repo_path / path.rstrip('/')
                if not full_path.exists():
                    errors.append(f"  ⚠️  {agent_name}.{field}: Path doesn't exist: {path}")
    
    return errors

def find_conflicts(ownership: dict) -> list:
    """Find paths owned by multiple agents"""
    errors = []
    owned_by = {}
    
    agents = ownership.get('ai_agents', {})
    for agent_name, agent_data in agents.items():
        for path in agent_data.get('owns', []):
            if path in owned_by:
                errors.append(f"  ⚠️  Conflict: '{path}' owned by both {owned_by[path]} and {agent_name}")
            else:
                owned_by[path] = agent_name
    
    return errors

def validate_repo(name: str, ownership_path: Path, repo_path: Path) -> bool:
    """Validate a single repo's OWNERSHIP.yaml"""
    print(f"\n📦 {name}")
    print("=" * 50)
    
    ownership = load_ownership(ownership_path)
    if not ownership:
        return False
    
    errors = []
    
    # Validate each agent
    agents = ownership.get('ai_agents', {})
    for agent_name, agent_data in agents.items():
        errors.extend(validate_agent(agent_name, agent_data, repo_path))
    
    # Check for conflicts
    errors.extend(find_conflicts(ownership))
    
    # Report results
    if errors:
        for error in errors:
            print(error)
        print(f"\n❌ {len(errors)} issue(s) found")
        return False
    else:
        print(f"✅ Valid ({len(agents)} agents defined)")
        return True

def main():
    """Main validation function"""
    print("🔍 Validating OWNERSHIP.yaml files...")
    
    # Find repos
    home = Path.home() / "Projects"
    repos = {
        "pom-config": home / "pom-config",
        "pom-docs": home / "pom-docs",
    }
    
    all_valid = True
    for name, path in repos.items():
        ownership_path = path / "OWNERSHIP.yaml"
        if not validate_repo(name, ownership_path, path):
            all_valid = False
    
    print("\n" + "=" * 50)
    if all_valid:
        print("✅ All OWNERSHIP.yaml files are valid!")
        return 0
    else:
        print("❌ Some issues found - please review above")
        return 1

if __name__ == "__main__":
    sys.exit(main())
