#!/bin/bash

DENTAL_ROOT="/home/adrian/Desktop/SBD-Projects/personal/preclinic/dental"
cd "$DENTAL_ROOT"

check_export_usage() {
  local pkg=$1
  local export_name=$2

  # Check if this export is actually used in apps or other packages
  # Exclude the package's own directory
  local usage=$(grep -r "\\b$export_name\\b" apps/ packages/ --include="*.ts" --include="*.tsx" 2>/dev/null | \
                grep -v "packages/$pkg/" | \
                grep -v "\.d\.ts:" | \
                wc -l)

  echo "$usage"
}

analyze_package() {
  local pkg=$1
  local index_file="packages/$pkg/src/index.ts"

  if [ ! -f "$index_file" ]; then
    echo "  No index.ts"
    return
  fi

  echo "  Analyzing exports..."

  # Extract all exported identifiers
  local exports=$(grep -E "^export " "$index_file" | \
    perl -pe 's/export\s+\{([^}]+)\}/\n$1\n/g' | \
    perl -pe 's/export\s+(type|interface|const|function|class|enum)\s+(\w+)/\n$2\n/g' | \
    grep -v "^export" | \
    tr ',' '\n' | \
    sed 's/^[[:space:]]*//' | \
    sed 's/[[:space:]]*$//' | \
    sed 's/\s+as\s+.*//' | \
    grep -v '^$' | \
    grep -v '^export' | \
    grep -v '^from' | \
    grep -v '^\*' | \
    sort | uniq)

  local total=0
  local unused=0
  local unused_list=""

  while IFS= read -r export_name; do
    if [ -n "$export_name" ] && [ "$export_name" != "}" ]; then
      total=$((total + 1))
      local usage=$(check_export_usage "$pkg" "$export_name")

      if [ "$usage" -eq 0 ]; then
        unused=$((unused + 1))
        unused_list="$unused_list    - $export_name\n"
      fi
    fi
  done <<< "$exports"

  echo "  Total exports: $total"
  echo "  Unused exports: $unused"

  if [ $unused -gt 0 ]; then
    echo "  Unused:"
    echo -e "$unused_list" | head -20
  fi
}

echo "UNUSED EXPORT ANALYSIS"
echo "====================="
echo ""

for pkg in shared-auth shared-config shared-domain shared-errors shared-events shared-infra shared-security shared-testing shared-tracing shared-types shared-utils shared-validation ui-kit; do
  echo "=== $pkg ==="
  analyze_package "$pkg"
  echo ""
done
