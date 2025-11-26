#!/bin/bash

# Final Cleanup Script for web-clinic-portal
# Run this after reviewing the cleanup report

BASE_DIR="/home/adrian/Desktop/SBD-Projects/personal/preclinic/dental/apps/web-clinic-portal"
cd "$BASE_DIR"

echo "=== Web Clinic Portal - Final Cleanup ==="
echo ""

# Ask for confirmation
read -p "This will remove orphaned files and unused dependencies. Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cleanup cancelled."
    exit 1
fi

echo "Creating backup..."
git add -A
git stash push -m "Backup before cleanup - $(date +%Y%m%d_%H%M%S)"

echo ""
echo "=== Step 1: Removing Orphaned Files ==="

# Remove orphaned components
rm -v src/components/a11y/VisuallyHidden.tsx
rm -v src/components/appointments/ReceptionQueueCard.tsx
rm -v src/components/appointments/ReceptionQueueFilters.tsx
rm -v src/components/command/AdvancedCommandPalette.tsx
rm -v src/components/data/AdvancedTable.tsx
rm -v src/components/data/CalendarPlaceholder.tsx
rm -v src/components/data/DocumentList.tsx
rm -v src/components/data/ScheduleBoard.tsx
rm -v src/components/data/Timeline.tsx
rm -v src/components/layout/SidebarNav.tsx
rm -v src/components/layout/Topbar.tsx
rm -v src/components/patients/AlertBanner.tsx
rm -v src/components/patients/BalanceCard.tsx
rm -v src/components/patients/VisitHistory.tsx
rm -v src/components/ui/Breadcrumb.tsx
rm -v src/components/ui/Pagination.tsx
rm -v src/components/ui/Tabs.tsx
rm -v src/components/ui/Tooltip.tsx

# Remove orphaned hooks
rm -v src/hooks/useImaging.ts
rm -v src/hooks/useProviders.ts

echo ""
echo "=== Step 2: Removing Unused Dependencies ==="

# Remove unused dependencies
npm uninstall apexcharts react-apexcharts dayjs react-bootstrap react-select simplebar-react

echo ""
echo "=== Step 3: Running Tests ==="

# Type check
echo "Running TypeScript type check..."
npm run typecheck

# Lint check
echo "Running ESLint..."
npm run lint -- --max-warnings=200

# Try to build
echo "Attempting build..."
npm run build

echo ""
echo "=== Cleanup Complete ==="
echo ""
echo "Summary:"
echo "  - Removed 20 orphaned files"
echo "  - Removed 6 unused npm dependencies"
echo "  - Cleaned up unused imports and variables"
echo ""
echo "Next steps:"
echo "  1. Review the changes"
echo "  2. Test the application manually"
echo "  3. If everything works: git add -A && git commit -m 'chore: cleanup unused code and dependencies'"
echo "  4. If there are issues: git stash pop (to restore backup)"
echo ""
echo "See /tmp/CLEANUP_REPORT.md for full details"
