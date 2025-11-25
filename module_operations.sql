-- ============================================================================
-- Module Operations Helper Script
-- Common SQL operations for module management
-- ============================================================================

-- ============================================================================
-- QUERY OPERATIONS
-- ============================================================================

-- 1. Get all active modules for a cabinet
SELECT
    c.name as cabinet_name,
    sm.module_code,
    sm.module_name,
    sm.is_active,
    sm.is_core,
    sm.price,
    sm.billing_cycle,
    s.status as subscription_status
FROM subscription_modules sm
JOIN subscriptions s ON sm.subscription_id = s.id
JOIN cabinets c ON s.cabinet_id = c.id
WHERE s.cabinet_id = '650e8400-e29b-41d4-a716-446655440001'
ORDER BY sm.is_core DESC, sm.module_code;

-- 2. Get module codes array for JWT (by cabinet)
SELECT get_active_module_codes_by_cabinet('650e8400-e29b-41d4-a716-446655440001');

-- 3. Get module codes array for JWT (by organization)
SELECT get_active_module_codes('550e8400-e29b-41d4-a716-446655440001');

-- 4. Check if cabinet has specific module
SELECT EXISTS (
    SELECT 1
    FROM subscription_modules sm
    JOIN subscriptions s ON sm.subscription_id = s.id
    WHERE s.cabinet_id = '650e8400-e29b-41d4-a716-446655440001'
      AND sm.module_code = 'inventory'
      AND sm.is_active = true
      AND s.status IN ('ACTIVE', 'TRIAL')
) AS has_inventory_module;

-- 5. List all available modules
SELECT
    module_code,
    module_name,
    description,
    is_core,
    default_price,
    is_active
FROM modules
ORDER BY display_order;

-- 6. Get all cabinets with a specific module
SELECT
    c.id as cabinet_id,
    c.name as cabinet_name,
    sm.is_active,
    sm.price,
    sm.activated_at
FROM subscription_modules sm
JOIN subscriptions s ON sm.subscription_id = s.id
JOIN cabinets c ON s.cabinet_id = c.id
WHERE sm.module_code = 'inventory'
ORDER BY c.name;

-- 7. Get subscription summary by cabinet
SELECT
    c.id as cabinet_id,
    c.name as cabinet_name,
    s.status as subscription_status,
    COUNT(sm.id) as total_modules,
    COUNT(CASE WHEN sm.is_active THEN 1 END) as active_modules,
    COUNT(CASE WHEN sm.is_core THEN 1 END) as core_modules,
    SUM(CASE WHEN sm.is_active THEN sm.price ELSE 0 END) as monthly_cost
FROM cabinets c
LEFT JOIN subscriptions s ON c.id = s.cabinet_id AND s.deleted_at IS NULL
LEFT JOIN subscription_modules sm ON s.id = sm.subscription_id
GROUP BY c.id, c.name, s.status
ORDER BY c.name;

-- ============================================================================
-- ACTIVATION OPERATIONS
-- ============================================================================

-- 8. Activate a module for a cabinet
-- Replace: <CABINET_ID>, <MODULE_CODE>
DO $$
DECLARE
    v_cabinet_id UUID := '<CABINET_ID>'; -- e.g., '650e8400-e29b-41d4-a716-446655440001'
    v_module_code VARCHAR(50) := '<MODULE_CODE>'; -- e.g., 'inventory'
BEGIN
    INSERT INTO subscription_modules (
        organization_id, subscription_id, module_id, module_code, module_name,
        is_active, price, billing_cycle, currency, activated_at, is_core
    )
    SELECT
        s.organization_id,
        s.id,
        m.id,
        m.module_code,
        m.module_name,
        true,
        m.default_price,
        s.billing_cycle,
        s.currency,
        NOW(),
        m.is_core
    FROM subscriptions s
    CROSS JOIN modules m
    WHERE s.cabinet_id = v_cabinet_id
      AND m.module_code = v_module_code
      AND s.deleted_at IS NULL
    ON CONFLICT (subscription_id, module_id)
    DO UPDATE SET
        is_active = true,
        module_code = EXCLUDED.module_code,
        module_name = EXCLUDED.module_name,
        deactivated_at = NULL,
        deactivation_reason = NULL,
        updated_at = NOW();

    RAISE NOTICE 'Module % activated for cabinet %', v_module_code, v_cabinet_id;
END $$;

-- 9. Deactivate a module for a cabinet
-- Replace: <CABINET_ID>, <MODULE_CODE>, <USER_ID>, <REASON>
DO $$
DECLARE
    v_cabinet_id UUID := '<CABINET_ID>'; -- e.g., '650e8400-e29b-41d4-a716-446655440001'
    v_module_code VARCHAR(50) := '<MODULE_CODE>'; -- e.g., 'analytics'
    v_user_id UUID := '<USER_ID>'; -- e.g., 'user-uuid-here'
    v_reason TEXT := '<REASON>'; -- e.g., 'Customer requested cancellation'
    v_rows_updated INTEGER;
BEGIN
    UPDATE subscription_modules sm
    SET
        is_active = false,
        deactivated_at = NOW(),
        deactivated_by = v_user_id,
        deactivation_reason = v_reason,
        updated_at = NOW()
    FROM subscriptions s
    WHERE sm.subscription_id = s.id
      AND s.cabinet_id = v_cabinet_id
      AND sm.module_code = v_module_code
      AND s.deleted_at IS NULL;

    GET DIAGNOSTICS v_rows_updated = ROW_COUNT;

    IF v_rows_updated > 0 THEN
        RAISE NOTICE 'Module % deactivated for cabinet %', v_module_code, v_cabinet_id;
    ELSE
        RAISE WARNING 'No active module % found for cabinet %', v_module_code, v_cabinet_id;
    END IF;
END $$;

-- 10. Activate multiple modules at once
-- Replace: <CABINET_ID>, array of module codes
DO $$
DECLARE
    v_cabinet_id UUID := '<CABINET_ID>'; -- e.g., '650e8400-e29b-41d4-a716-446655440001'
    v_module_codes TEXT[] := ARRAY['inventory', 'imaging', 'billing']; -- List of modules to activate
    v_module_code TEXT;
BEGIN
    FOREACH v_module_code IN ARRAY v_module_codes
    LOOP
        INSERT INTO subscription_modules (
            organization_id, subscription_id, module_id, module_code, module_name,
            is_active, price, billing_cycle, currency, activated_at, is_core
        )
        SELECT
            s.organization_id,
            s.id,
            m.id,
            m.module_code,
            m.module_name,
            true,
            m.default_price,
            s.billing_cycle,
            s.currency,
            NOW(),
            m.is_core
        FROM subscriptions s
        CROSS JOIN modules m
        WHERE s.cabinet_id = v_cabinet_id
          AND m.module_code = v_module_code
          AND s.deleted_at IS NULL
        ON CONFLICT (subscription_id, module_id)
        DO UPDATE SET
            is_active = true,
            module_code = EXCLUDED.module_code,
            module_name = EXCLUDED.module_name,
            deactivated_at = NULL,
            updated_at = NOW();

        RAISE NOTICE 'Module % activated', v_module_code;
    END LOOP;

    RAISE NOTICE 'All modules activated for cabinet %', v_cabinet_id;
END $$;

-- ============================================================================
-- MODULE DEFINITION MANAGEMENT
-- ============================================================================

-- 11. Add a new module definition
-- Replace: <CODE>, <NAME>, <DESCRIPTION>, <IS_CORE>, <PRICE>, <ORDER>
INSERT INTO modules (
    id,
    module_code,
    module_name,
    description,
    is_core,
    default_price,
    display_order,
    is_active
)
VALUES (
    uuid_generate_v4(),
    '<CODE>', -- e.g., 'lab_integration'
    '<NAME>', -- e.g., 'Lab Integration'
    '<DESCRIPTION>', -- e.g., 'Integration with dental laboratories'
    false, -- <IS_CORE> true/false
    99.00, -- <PRICE>
    7, -- <ORDER>
    true
)
ON CONFLICT (module_code) DO NOTHING;

-- 12. Update module pricing
-- Replace: <MODULE_CODE>, <NEW_PRICE>
UPDATE modules
SET
    default_price = <NEW_PRICE>, -- e.g., 149.99
    updated_at = NOW()
WHERE module_code = '<MODULE_CODE>'; -- e.g., 'analytics'

-- 13. Deactivate a module definition (make unavailable for new subscriptions)
-- Replace: <MODULE_CODE>
UPDATE modules
SET
    is_active = false,
    updated_at = NOW()
WHERE module_code = '<MODULE_CODE>'; -- e.g., 'old_module'

-- ============================================================================
-- REPORTING QUERIES
-- ============================================================================

-- 14. Module adoption report
SELECT
    m.module_code,
    m.module_name,
    COUNT(DISTINCT sm.subscription_id) as active_subscriptions,
    COUNT(DISTINCT s.cabinet_id) as active_cabinets,
    SUM(sm.price) as total_monthly_revenue,
    AVG(sm.price) as avg_price_per_subscription
FROM modules m
LEFT JOIN subscription_modules sm ON m.id = sm.module_id AND sm.is_active = true
LEFT JOIN subscriptions s ON sm.subscription_id = s.id AND s.status IN ('ACTIVE', 'TRIAL')
GROUP BY m.module_code, m.module_name
ORDER BY active_subscriptions DESC;

-- 15. Revenue by module
SELECT
    module_code,
    module_name,
    COUNT(*) as active_subscriptions,
    SUM(price) as monthly_revenue,
    AVG(price) as avg_price
FROM subscription_modules
WHERE is_active = true
GROUP BY module_code, module_name
ORDER BY monthly_revenue DESC;

-- 16. Cabinet module upgrade opportunities
-- Cabinets with ACTIVE subscriptions that don't have premium modules
SELECT
    c.id as cabinet_id,
    c.name as cabinet_name,
    s.status,
    get_active_module_codes_by_cabinet(c.id) as current_modules,
    ARRAY(
        SELECT m.module_code
        FROM modules m
        WHERE m.is_core = false
          AND m.is_active = true
          AND m.module_code NOT IN (
              SELECT sm2.module_code
              FROM subscription_modules sm2
              WHERE sm2.subscription_id = s.id AND sm2.is_active = true
          )
    ) as available_upgrades
FROM cabinets c
JOIN subscriptions s ON c.id = s.cabinet_id
WHERE s.status IN ('ACTIVE', 'TRIAL')
  AND s.deleted_at IS NULL
ORDER BY c.name;

-- 17. Recently deactivated modules (last 30 days)
SELECT
    c.name as cabinet_name,
    sm.module_code,
    sm.module_name,
    sm.deactivated_at,
    u.email as deactivated_by_user,
    sm.deactivation_reason
FROM subscription_modules sm
JOIN subscriptions s ON sm.subscription_id = s.id
JOIN cabinets c ON s.cabinet_id = c.id
LEFT JOIN users u ON sm.deactivated_by = u.id
WHERE sm.deactivated_at > NOW() - INTERVAL '30 days'
ORDER BY sm.deactivated_at DESC;

-- ============================================================================
-- BULK OPERATIONS
-- ============================================================================

-- 18. Activate core modules for all ACTIVE subscriptions without them
INSERT INTO subscription_modules (
    organization_id, subscription_id, module_id, module_code, module_name,
    is_active, price, billing_cycle, currency, activated_at, is_core
)
SELECT
    s.organization_id,
    s.id,
    m.id,
    m.module_code,
    m.module_name,
    true,
    m.default_price,
    s.billing_cycle,
    s.currency,
    NOW(),
    m.is_core
FROM subscriptions s
CROSS JOIN modules m
WHERE s.status IN ('ACTIVE', 'TRIAL')
  AND s.deleted_at IS NULL
  AND m.is_core = true
  AND m.is_active = true
  AND NOT EXISTS (
      SELECT 1
      FROM subscription_modules sm2
      WHERE sm2.subscription_id = s.id
        AND sm2.module_id = m.id
  )
ON CONFLICT (subscription_id, module_id) DO NOTHING;

-- 19. Sync module_code and module_name from modules table
-- (Run this if module definitions change)
UPDATE subscription_modules sm
SET
    module_code = m.module_code,
    module_name = m.module_name,
    updated_at = NOW()
FROM modules m
WHERE sm.module_id = m.id
  AND (sm.module_code != m.module_code OR sm.module_name != m.module_name);

-- ============================================================================
-- VALIDATION QUERIES
-- ============================================================================

-- 20. Find subscription_modules with NULL module codes
SELECT
    sm.id,
    sm.organization_id,
    sm.subscription_id,
    sm.module_id,
    sm.module_code
FROM subscription_modules sm
WHERE sm.module_code IS NULL;

-- 21. Find orphaned subscription_modules (module_id not in modules table)
SELECT sm.*
FROM subscription_modules sm
LEFT JOIN modules m ON sm.module_id = m.id
WHERE m.id IS NULL;

-- 22. Find duplicate module assignments
SELECT
    subscription_id,
    module_id,
    COUNT(*) as duplicate_count
FROM subscription_modules
GROUP BY subscription_id, module_id
HAVING COUNT(*) > 1;

-- 23. Verify all active subscriptions have core modules
SELECT
    c.id as cabinet_id,
    c.name as cabinet_name,
    s.id as subscription_id,
    s.status,
    ARRAY_AGG(sm.module_code) FILTER (WHERE sm.is_core) as core_modules_assigned,
    ARRAY(SELECT module_code FROM modules WHERE is_core = true AND is_active = true) as core_modules_required
FROM cabinets c
JOIN subscriptions s ON c.id = s.cabinet_id
LEFT JOIN subscription_modules sm ON s.id = sm.subscription_id AND sm.is_active = true
WHERE s.status IN ('ACTIVE', 'TRIAL')
  AND s.deleted_at IS NULL
GROUP BY c.id, c.name, s.id, s.status
ORDER BY c.name;

-- ============================================================================
-- CLEANUP OPERATIONS
-- ============================================================================

-- 24. Remove soft-deleted subscription modules (if needed)
-- CAUTION: This permanently deletes data
-- DELETE FROM subscription_modules
-- WHERE deactivated_at < NOW() - INTERVAL '1 year'
--   AND is_active = false;

-- 25. Archive old deactivation records to audit table (example)
-- CREATE TABLE subscription_modules_archive AS
-- SELECT * FROM subscription_modules WHERE 1=0;
--
-- INSERT INTO subscription_modules_archive
-- SELECT * FROM subscription_modules
-- WHERE deactivated_at < NOW() - INTERVAL '2 years'
--   AND is_active = false;
