#!/bin/bash

DENTAL_ROOT="/home/adrian/Desktop/SBD-Projects/personal/preclinic/dental"
cd "$DENTAL_ROOT"

echo "PACKAGE USAGE ANALYSIS"
echo "====================="
echo ""

for pkg_dir in packages/*/; do
  pkg_name=$(basename "$pkg_dir")

  echo "=== $pkg_name ==="

  # Count files
  file_count=$(find "$pkg_dir" -name "*.ts" -not -name "*.spec.ts" -not -name "*.d.ts" -not -path "*/node_modules/*" 2>/dev/null | wc -l)
  echo "TypeScript files: $file_count"

  # Count lines of code
  loc=$(find "$pkg_dir" -name "*.ts" -not -name "*.spec.ts" -not -name "*.d.ts" -not -path "*/node_modules/*" 2>/dev/null | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
  echo "Total LOC: $loc"

  # Count imports
  import_count=$(grep -r "from '@dentalos/$pkg_name" apps/ packages/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
  echo "Import statements: $import_count"

  # Count files that import
  file_import_count=$(grep -rl "from '@dentalos/$pkg_name" apps/ packages/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
  echo "Files importing: $file_import_count"

  echo ""
done
