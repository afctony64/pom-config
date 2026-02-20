#!/usr/bin/env python3
"""
Update Field Sets in Research_* Schemas

This script updates field set assignments according to the approved policy:
- Cat fields → standard
- LLM fields → standard
- Evidence fields → extended
- Research fields → extended

Run from pom-config root:
    python scripts/update_field_sets.py
"""
from pathlib import Path
import yaml


# Use block style for lists, flow style for short values
class CustomDumper(yaml.SafeDumper):
    pass


def str_representer(dumper, data):
    if "\n" in data:
        return dumper.represent_scalar("tag:yaml.org,2002:str", data, style="|")
    return dumper.represent_scalar("tag:yaml.org,2002:str", data)


CustomDumper.add_representer(str, str_representer)


def update_schema_field_sets(schema_path: Path) -> dict[str, list[str]]:
    """Update field sets in a single schema file."""

    with open(schema_path) as f:
        schema = yaml.safe_load(f)

    changes = {
        "promoted_to_standard": [],
        "moved_to_extended": [],
        "already_correct": [],
    }

    properties = schema.get("properties", [])

    for prop in properties:
        name = prop.get("name", "")
        tags = prop.get("tags", [])
        sets = prop.get("sets", [])

        # Skip system fields
        if "system" in sets or "identity" in tags:
            continue

        # Determine field type
        is_cat = "Cat" in tags or name.endswith("Cat")
        is_llm = "LLM" in tags or name.endswith("LLM")
        is_evidence = (
            "evidence" in tags
            or name.lower().endswith("evidence")
            or "citation" in name.lower()
            or "reasoning" in name.lower()
        )

        # Determine correct set
        if is_cat or is_llm:
            correct_set = "standard"
        elif is_evidence:
            correct_set = "extended"
        else:
            correct_set = "extended"  # All other research fields

        # Check current state
        current_set = (
            "standard"
            if "standard" in sets
            else ("extended" if "extended" in sets else None)
        )

        if current_set == correct_set:
            changes["already_correct"].append(name)
            continue

        # Update the sets
        new_sets = [s for s in sets if s not in ("standard", "extended")]
        new_sets.append(correct_set)
        prop["sets"] = new_sets

        if correct_set == "standard":
            changes["promoted_to_standard"].append(name)
        else:
            changes["moved_to_extended"].append(name)

    # Write back
    with open(schema_path, "w") as f:
        yaml.dump(
            schema,
            f,
            Dumper=CustomDumper,
            default_flow_style=False,
            sort_keys=False,
            allow_unicode=True,
        )

    return changes


def main():
    schema_dir = Path(__file__).parent.parent / "schemas"

    print("📊 UPDATING FIELD SETS IN RESEARCH_* SCHEMAS")
    print("=" * 70)
    print()
    print("Policy:")
    print("  - Cat fields    → standard (classification)")
    print("  - LLM fields    → standard (insights)")
    print("  - Evidence      → extended (detailed citations)")
    print("  - Research      → extended (supplementary data)")
    print()

    total_promoted = 0
    total_moved = 0
    total_correct = 0

    for schema_file in sorted(schema_dir.glob("Research_*_schema.yaml")):
        if "base" in schema_file.stem:
            continue

        researcher = schema_file.stem.replace("Research_", "").replace("_schema", "")
        changes = update_schema_field_sets(schema_file)

        promoted = len(changes["promoted_to_standard"])
        moved = len(changes["moved_to_extended"])
        correct = len(changes["already_correct"])

        total_promoted += promoted
        total_moved += moved
        total_correct += correct

        if promoted or moved:
            print(f"📝 {researcher.upper()}")
            if promoted:
                print(
                    f"   ⬆️  Promoted to standard: {', '.join(changes['promoted_to_standard'][:5])}"
                )
                if len(changes["promoted_to_standard"]) > 5:
                    print(
                        f"      ... and {len(changes['promoted_to_standard']) - 5} more"
                    )
            if moved:
                print(
                    f"   ⬇️  Moved to extended: {', '.join(changes['moved_to_extended'][:5])}"
                )
                if len(changes["moved_to_extended"]) > 5:
                    print(f"      ... and {len(changes['moved_to_extended']) - 5} more")
            print()

    print("=" * 70)
    print("✅ SUMMARY:")
    print(f"   ⬆️  Promoted to standard: {total_promoted} fields")
    print(f"   ⬇️  Moved to extended: {total_moved} fields")
    print(f"   ✓  Already correct: {total_correct} fields")
    print()
    print("Next steps:")
    print("  1. Review changes: git diff schemas/")
    print(
        "  2. Commit: git add -A && git commit -m 'feat: update field sets - LLM to standard'"
    )
    print("  3. Tag: git tag v1.6.0")
    print("  4. Push: git push && git push --tags")


if __name__ == "__main__":
    main()
