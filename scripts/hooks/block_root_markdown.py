#!/usr/bin/env python3
import sys


ROOT_ALLOWLIST = {
    "README.md",
    "CHANGELOG.md",
    "DATA_CARD_COMPLIANCE_REPORT.md",
}


def is_blocked(path: str) -> bool:
    return "/" not in path and path.endswith(".md") and path not in ROOT_ALLOWLIST


def main(argv: list[str]) -> int:
    blocked = [path for path in argv if is_blocked(path)]
    if not blocked:
        return 0

    blocked_list = "\n".join(f"  - {path}" for path in blocked)
    allowlist = ", ".join(sorted(ROOT_ALLOWLIST))
    message = (
        "Blocked root markdown edits in pom-config. Move docs into docs/.\n"
        "Blocked paths:\n"
        f"{blocked_list}\n"
        f"Allowed root markdown: {allowlist}\n"
        "If you need an exception, update the hook in "
        "scripts/hooks/block_root_markdown.py."
    )
    print(message, file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
