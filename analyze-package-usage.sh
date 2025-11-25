#!/bin/bash

# Script to analyze package usage across the monorepo
PACKAGE_NAME=$1
DENTAL_ROOT="/home/adrian/Desktop/SBD-Projects/personal/preclinic/dental"

if [ -z "$PACKAGE_NAME" ]; then
  echo "Usage: $0 <package-name>"
  exit 1
fi

echo "=== Analyzing $PACKAGE_NAME ==="
echo ""

# Get all exports from the package index
PACKAGE_DIR="$DENTAL_ROOT/packages/$PACKAGE_NAME"
INDEX_FILE="$PACKAGE_DIR/src/index.ts"

if [ ! -f "$INDEX_FILE" ]; then
  echo "ERROR: Index file not found at $INDEX_FILE"
  exit 1
fi

# Extract all exported symbols
echo "Exported symbols from $PACKAGE_NAME:"
grep -E "^export \{|^export \*|^export (type|interface|class|function|const)" "$INDEX_FILE" | head -20
echo ""

# Find usage in apps and packages
echo "Usage count in apps and packages:"
IMPORT_PATTERN="from ['\"]@dentalos/$PACKAGE_NAME"
grep -r "$IMPORT_PATTERN" "$DENTAL_ROOT/apps" "$DENTAL_ROOT/packages" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l
echo ""

echo "Files importing this package:"
grep -rl "$IMPORT_PATTERN" "$DENTAL_ROOT/apps" "$DENTAL_ROOT/packages" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l
