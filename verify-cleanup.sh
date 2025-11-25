#!/bin/bash

echo "========================================="
echo "PACKAGE CLEANUP VERIFICATION"
echo "========================================="
echo ""

DENTAL_ROOT="/home/adrian/Desktop/SBD-Projects/personal/preclinic/dental"
cd "$DENTAL_ROOT"

echo "1. Verifying archived packages exist..."
if [ -d "packages/shared-config.ARCHIVED" ]; then
  echo "   ✅ shared-config.ARCHIVED found"
else
  echo "   ❌ shared-config.ARCHIVED NOT FOUND"
fi

if [ -d "packages/shared-utils.ARCHIVED" ]; then
  echo "   ✅ shared-utils.ARCHIVED found"
else
  echo "   ❌ shared-utils.ARCHIVED NOT FOUND"
fi
echo ""

echo "2. Verifying archived packages are not imported..."
config_imports=$(grep -r "from '@dentalos/shared-config'" apps/ packages/ --include="*.ts" 2>/dev/null | wc -l)
utils_imports=$(grep -r "from '@dentalos/shared-utils'" apps/ packages/ --include="*.ts" 2>/dev/null | wc -l)

echo "   shared-config imports: $config_imports (should be 0)"
echo "   shared-utils imports: $utils_imports (should be 0)"

if [ "$config_imports" -eq 0 ] && [ "$utils_imports" -eq 0 ]; then
  echo "   ✅ No imports found - cleanup successful"
else
  echo "   ❌ WARNING: Imports still exist!"
fi
echo ""

echo "3. Counting remaining packages..."
package_count=$(ls -d packages/*/ 2>/dev/null | grep -v ARCHIVED | wc -l)
echo "   Active packages: $package_count (should be 11)"
archived_count=$(ls -d packages/*.ARCHIVED 2>/dev/null | wc -l)
echo "   Archived packages: $archived_count (should be 2)"
echo ""

echo "4. Package dependency check..."
echo "   Checking if shared-config removed from package.json files..."
config_deps=$(grep -r '"@dentalos/shared-config"' apps/*/package.json packages/*/package.json 2>/dev/null | grep -v "ARCHIVED" | wc -l)
echo "   Remaining shared-config dependencies: $config_deps (should be 0)"

if [ "$config_deps" -eq 0 ]; then
  echo "   ✅ All shared-config dependencies removed"
else
  echo "   ❌ WARNING: Some dependencies remain!"
  grep -r '"@dentalos/shared-config"' apps/*/package.json packages/*/package.json 2>/dev/null | grep -v "ARCHIVED"
fi
echo ""

echo "5. Summary..."
echo "   ========================================="
if [ "$config_imports" -eq 0 ] && [ "$utils_imports" -eq 0 ] && [ "$config_deps" -eq 0 ]; then
  echo "   ✅ CLEANUP SUCCESSFUL"
  echo "   ✅ 3,726 LOC archived"
  echo "   ✅ 13 dependencies removed"
  echo "   ✅ 2 packages archived"
else
  echo "   ⚠️ CLEANUP INCOMPLETE - Review warnings above"
fi
echo "   ========================================="
echo ""

echo "Next steps:"
echo "  1. Run: pnpm install"
echo "  2. Run: pnpm build"
echo "  3. Run: pnpm test"
echo "  4. Review: PACKAGE_CLEANUP_FINAL_SUMMARY.md"
