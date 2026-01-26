#!/bin/bash
# =============================================================================
# Sync Global Cursor Rules and Skills
# =============================================================================
# Copies version-controlled global rules/skills from pom-config to ~/.cursor/
#
# Usage: ./scripts/sync-cursor-global.sh
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="${SCRIPT_DIR}/../cursor-global"
TARGET_DIR="${HOME}/.cursor"

echo "🔄 Syncing global Cursor rules and skills..."

# Create target directories
mkdir -p "${TARGET_DIR}/rules"
mkdir -p "${TARGET_DIR}/skills"

# Sync rules
if [ -d "${SOURCE_DIR}/rules" ]; then
    echo "📋 Syncing rules..."
    cp -r "${SOURCE_DIR}/rules/"* "${TARGET_DIR}/rules/"
    echo "   ✅ Rules synced to ~/.cursor/rules/"
fi

# Sync skills
if [ -d "${SOURCE_DIR}/skills" ]; then
    echo "🛠️  Syncing skills..."
    cp -r "${SOURCE_DIR}/skills/"* "${TARGET_DIR}/skills/"
    echo "   ✅ Skills synced to ~/.cursor/skills/"
fi

echo ""
echo "✅ Global Cursor config synced!"
echo ""
echo "Installed:"
ls -la "${TARGET_DIR}/rules/" 2>/dev/null | grep -v "^total" | grep -v "^d" || echo "   (no rules)"
ls -la "${TARGET_DIR}/skills/" 2>/dev/null | grep -v "^total" || echo "   (no skills)"
