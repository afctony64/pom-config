#!/usr/bin/env bash
# Sync base cursor rules from pom-docs into .cursorrules

set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

REPO_ROOT="$(pwd)"
while [[ ! -d "$REPO_ROOT/.git" && "$REPO_ROOT" != "/" ]]; do
  REPO_ROOT="$(dirname "$REPO_ROOT")"
done

if [[ "$REPO_ROOT" == "/" ]]; then
  echo -e "${YELLOW}⚠️  Could not find repo root${NC}"
  exit 1
fi

cd "$REPO_ROOT"
REPO_NAME="$(basename "$REPO_ROOT")"

REPO_SPECIFIC_MARKER="# REPO-SPECIFIC CUSTOMIZATION"

find_base_rules() {
  local candidates=(
    "${POM_DOCS_ROOT:-}/docs/standards/.cursorrules.base"
    "$REPO_ROOT/pom-docs/docs/standards/.cursorrules.base"
    "$REPO_ROOT/../pom-docs/docs/standards/.cursorrules.base"
    "$HOME/Projects/pom-docs/docs/standards/.cursorrules.base"
  )

  for path in "${candidates[@]}"; do
    if [[ -n "${path}" && -f "${path}" ]]; then
      echo "${path}"
      return 0
    fi
  done

  return 1
}

BASE_RULES="$(find_base_rules || true)"
if [[ -z "${BASE_RULES}" ]]; then
  echo -e "${YELLOW}⚠️  Base rules not found (pom-docs/docs/standards/.cursorrules.base)${NC}"
  echo "   Set POM_DOCS_ROOT or ensure pom-docs is available locally."
  exit 0
fi

echo -e "${BLUE}🔄 Syncing cursor rules from pom-docs...${NC}"

REPO_SPECIFIC=""
if [[ -f ".cursorrules" ]]; then
  if grep -q "${REPO_SPECIFIC_MARKER}" ".cursorrules"; then
    REPO_SPECIFIC="$(sed -n "/${REPO_SPECIFIC_MARKER}/,\$p" .cursorrules | tail -n +2 || true)"
  else
    REPO_SPECIFIC="$(cat .cursorrules)"
    echo -e "${YELLOW}⚠️  No repo-specific marker found; preserving current rules${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  No existing .cursorrules found; creating new file${NC}"
fi

{
  echo "# AI ASSISTANT RULES FOR ${REPO_NAME}"
  echo "#"
  echo "# BASE RULES: Synced from pom-docs/docs/standards/.cursorrules.base"
  echo "# Last synced: $(date +%Y-%m-%d)"
  echo "#"
  echo "# To update base rules:"
  echo "#   1. Edit pom-docs/docs/standards/.cursorrules.base"
  echo "#   2. Run this script in each repo: ./scripts/sync_rules_from_pom_docs.sh"
  echo "#"
  echo "# ================================================"
  echo ""
  cat "${BASE_RULES}"
  echo ""
  echo "# ================================================"
  echo "${REPO_SPECIFIC_MARKER}"
  echo "${REPO_SPECIFIC}"
} > .cursorrules.new

if [[ -f ".cursorrules" ]]; then
  cp .cursorrules .cursorrules.backup
fi

mv .cursorrules.new .cursorrules

echo -e "${GREEN}✅ Synced .cursorrules from pom-docs${NC}"
echo -e "${BLUE}   Base rules: $(wc -l < "${BASE_RULES}") lines${NC}"
if [[ -n "${REPO_SPECIFIC}" ]]; then
  echo -e "${BLUE}   Repo-specific: $(echo "${REPO_SPECIFIC}" | wc -l) lines${NC}"
fi
echo -e "${BLUE}   Total: $(wc -l < .cursorrules) lines${NC}"

if [[ -f ".cursorrules.backup" ]]; then
  echo -e "${BLUE}   Backup saved: .cursorrules.backup${NC}"
fi
