#!/usr/bin/env python3
"""Ensure Pom-built Python images expose both `python` and `python3`.

This hook intentionally checks Dockerfiles only. Shell aliases are not reliable for:
- Docker HEALTHCHECK
- JSON-array CMD/ENTRYPOINT
- docker exec (non-interactive)
"""

from __future__ import annotations

import re
import sys
from pathlib import Path


PY_BASE_RE = re.compile(r"^\s*FROM\s+.*python(?::|@)", re.IGNORECASE | re.MULTILINE)
PY_INSTALL_RE = re.compile(
    r"\b(apt-get|apk|yum|dnf)\b.*\binstall\b.*\bpython3\b",
    re.IGNORECASE | re.DOTALL,
)
PY_COMMAND_USAGE_RE = re.compile(
    r"^\s*(HEALTHCHECK|CMD|ENTRYPOINT)\b.*\bpython3?\b",
    re.IGNORECASE | re.MULTILINE,
)


def _needs_shim(text: str) -> bool:
    return bool(
        PY_BASE_RE.search(text)
        or PY_INSTALL_RE.search(text)
        or PY_COMMAND_USAGE_RE.search(text)
    )


def _has_shim(text: str) -> bool:
    # Accept the standardized shim snippet.
    if re.search(r"command\s+-v\s+python3\b", text) and re.search(
        r"command\s+-v\s+python\b", text
    ):
        return True

    # Accept common alternative approaches.
    if "python-is-python3" in text:
        return True
    if re.search(r"update-alternatives\b.*\bpython\b", text, re.IGNORECASE):
        return True
    if re.search(r"ln\s+-s[f]?\s+.*\bpython3\b.*\bpython\b", text, re.IGNORECASE):
        return True
    if re.search(r"ln\s+-s[f]?\s+.*\bpython\b.*\bpython3\b", text, re.IGNORECASE):
        return True

    return False


def main(argv: list[str]) -> int:
    # pre-commit passes filenames; if none, do nothing.
    paths = [Path(p) for p in argv if p and not p.startswith("-")]
    if not paths:
        return 0

    failures: list[str] = []
    for path in paths:
        if not path.exists() or path.is_dir():
            continue

        # Defensive: the hook should only run on Dockerfiles, but don't assume config.
        if path.name != "Dockerfile" and not path.name.startswith("Dockerfile."):
            continue

        text = path.read_text(encoding="utf-8", errors="replace")
        if _needs_shim(text) and not _has_shim(text):
            failures.append(str(path))

    if not failures:
        return 0

    sys.stderr.write(
        "Dockerfiles that use Python must ensure both `python` and `python3` exist as real executables.\n"
        "See: pom-docs/docs/infrastructure/PYTHON_COMMAND_STANDARD.md\n"
        "Missing requirement in:\n"
    )
    for f in failures:
        sys.stderr.write(f"  - {f}\n")
    return 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
