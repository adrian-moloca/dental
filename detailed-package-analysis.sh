#!/bin/bash

DENTAL_ROOT="/home/adrian/Desktop/SBD-Projects/personal/preclinic/dental"
cd "$DENTAL_ROOT"

# Function to extract exported symbols from index.ts
extract_exports() {
  local package_name=$1
  local index_file="packages/$package_name/src/index.ts"

  if [ ! -f "$index_file" ]; then
    echo "No index.ts found"
    return
  fi

  # Extract named exports from "export { ... }" statements
  grep -oP 'export\s+\{\s*\K[^}]+' "$index_file" | tr ',' '\n' | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//' | grep -v '^$' | sort | uniq

  # Extract "export const/function/class/interface/type" statements
  grep -oP 'export\s+(const|function|class|interface|type|enum)\s+\K\w+' "$index_file" | sort | uniq
}

# Function to check usage of a symbol
check_symbol_usage() {
  local package_name=$1
  local symbol=$2

  # Count occurrences in apps and other packages
  local count=$(grep -r "\\b$symbol\\b" apps/ packages/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "packages/$package_name/" | wc -l)
  echo "$count"
}

echo "DETAILED PACKAGE EXPORT ANALYSIS"
echo "================================="
echo ""

for pkg in shared-auth shared-config shared-domain shared-errors shared-events shared-infra shared-security shared-testing shared-tracing shared-types shared-utils shared-validation ui-kit; do

  echo "=== $pkg ==="
  echo ""

  # Get stats
  files=$(find "packages/$pkg" -name "*.ts" -not -name "*.spec.ts" -not -name "*.d.ts" -not -path "*/node_modules/*" 2>/dev/null | wc -l)
  loc=$(find "packages/$pkg" -name "*.ts" -not -name "*.spec.ts" -not -name "*.d.ts" -not -path "*/node_modules/*" 2>/dev/null | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
  imports=$(grep -r "from '@dentalos/$pkg" apps/ packages/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)

  echo "Files: $files"
  echo "LOC: $loc"
  echo "Import statements: $imports"
  echo ""

  # Check for package.json dependencies
  echo "Package dependencies:"
  if [ -f "packages/$pkg/package.json" ]; then
    grep -A 50 '"dependencies"' "packages/$pkg/package.json" | grep '@dentalos' | head -10 || echo "  None"
  fi
  echo ""

  echo "---"
  echo ""
done
