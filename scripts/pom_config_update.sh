#!/usr/bin/env bash
# =============================================================================
# pom-config Update Script
# =============================================================================
# Usage (from app repo root):
#   ./scripts/pom_config.sh update v1.0.0
#   ./scripts/pom_config.sh update latest
#
# This script downloads a specific version of pom-config and extracts it
# to .pom_config_pkg/ for use by the app.
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="$(dirname "$SCRIPT_DIR")"
CONFIG_PKG_DIR="$APP_ROOT/.pom_config_pkg"

REPO_OWNER="afctony64"
REPO_NAME="pom-config"

usage() {
    echo "Usage: $0 update <version>"
    echo "       $0 update latest"
    echo ""
    echo "Examples:"
    echo "  $0 update v1.0.0"
    echo "  $0 update latest"
    exit 1
}

update_config() {
    local version="$1"

    echo "📦 Updating pom-config to $version..."

    # Create temp directory
    local tmp_dir=$(mktemp -d)
    trap "rm -rf $tmp_dir" EXIT

    if [ "$version" = "latest" ]; then
        # Get latest release tag
        version=$(curl -s "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/releases/latest" | grep '"tag_name"' | cut -d'"' -f4)
        echo "   Latest version: $version"
    fi

    # Download release tarball
    local tarball_url="https://github.com/$REPO_OWNER/$REPO_NAME/archive/refs/tags/$version.tar.gz"
    echo "   Downloading from $tarball_url..."

    curl -sL "$tarball_url" -o "$tmp_dir/pom-config.tar.gz"

    # Extract
    tar -xzf "$tmp_dir/pom-config.tar.gz" -C "$tmp_dir"

    # Remove old config
    rm -rf "$CONFIG_PKG_DIR"

    # Move new config into place
    mv "$tmp_dir/$REPO_NAME-${version#v}" "$CONFIG_PKG_DIR"

    # Write version file
    echo "$version" > "$CONFIG_PKG_DIR/.version"

    echo "✅ pom-config updated to $version"
    echo "   Location: $CONFIG_PKG_DIR"

    # Clear pom-core config caches to avoid stale schema warnings
    echo ""
    echo "🧹 Clearing pom-core config caches..."
    if command -v docker &> /dev/null && docker ps --format '{{.Names}}' | grep -q pom-core-dev; then
        docker exec pom-core-dev python scripts/clear_config_cache.py 2>/dev/null || echo "   ⚠️ Cache clear skipped (script not found or error)"
    elif [ -f "$APP_ROOT/../pom-core/scripts/clear_config_cache.py" ]; then
        python "$APP_ROOT/../pom-core/scripts/clear_config_cache.py" 2>/dev/null || echo "   ⚠️ Cache clear skipped (error)"
    else
        echo "   ℹ️ Run 'python scripts/clear_config_cache.py' in pom-core to clear caches"
    fi
}

# Main
case "${1:-}" in
    update)
        [ -z "${2:-}" ] && usage
        update_config "$2"
        ;;
    *)
        usage
        ;;
esac
