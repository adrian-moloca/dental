-- ============================================================================
-- Migration: Add Module Code Support to Subscription System
-- Date: 2025-11-23
-- Description: Creates modules reference table and updates subscription_modules
--              to support module codes for LicenseGuard integration
-- ============================================================================

-- Enable UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- STEP 1: Create modules reference table
-- ============================================================================

CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_code VARCHAR(50) NOT NULL UNIQUE,
    module_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_core BOOLEAN NOT NULL DEFAULT false,
    default_price NUMERIC(10,2),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_modules_code ON modules(module_code);
CREATE INDEX IF NOT EXISTS idx_modules_active ON modules(is_active);
CREATE INDEX IF NOT EXISTS idx_modules_display_order ON modules(display_order, is_active);

COMMENT ON TABLE modules IS 'Reference table for all available system modules';
COMMENT ON COLUMN modules.module_code IS 'Unique code used in JWT tokens and LicenseGuard (e.g., inventory, imaging)';
COMMENT ON COLUMN modules.module_name IS 'Human-readable module name';
COMMENT ON COLUMN modules.is_core IS 'Whether this module is included in core subscription';
COMMENT ON COLUMN modules.default_price IS 'Default monthly price for this module';
COMMENT ON COLUMN modules.display_order IS 'Order for UI display';

-- ============================================================================
-- STEP 2: Insert standard module definitions
-- ============================================================================

INSERT INTO modules (id, module_code, module_name, description, is_core, default_price, display_order, is_active)
VALUES
    -- Core modules (included in base subscription)
    ('850e8400-e29b-41d4-a716-446655440003', 'scheduling', 'Appointment Scheduling',
     'Manage patient appointments, schedules, and calendars', true, 50.00, 1, true),

    ('850e8400-e29b-41d4-a716-446655440004', 'clinical', 'Clinical EHR',
     'Electronic health records, patient charts, and clinical notes', true, 74.99, 2, true),

    -- Premium add-on modules
    ('850e8400-e29b-41d4-a716-446655440001', 'inventory', 'Inventory Management',
     'Track dental supplies, equipment, and stock levels', false, 75.00, 3, true),

    ('850e8400-e29b-41d4-a716-446655440002', 'imaging', 'Imaging & DICOM',
     'Manage dental imaging, X-rays, and DICOM integration', false, 100.00, 4, true),

    -- Future modules (can be activated later)
    ('850e8400-e29b-41d4-a716-446655440005', 'billing', 'Billing & Finance',
     'Invoicing, payments, insurance claims, and financial reporting', false, 125.00, 5, true),

    ('850e8400-e29b-41d4-a716-446655440006', 'analytics', 'Analytics & Reporting',
     'Advanced analytics, business intelligence, and custom reports', false, 99.00, 6, true)
ON CONFLICT (id) DO UPDATE SET
    module_code = EXCLUDED.module_code,
    module_name = EXCLUDED.module_name,
    description = EXCLUDED.description,
    is_core = EXCLUDED.is_core,
    default_price = EXCLUDED.default_price,
    display_order = EXCLUDED.display_order,
    updated_at = NOW();

-- ============================================================================
-- STEP 3: Add module_code and module_name to subscription_modules
-- ============================================================================

-- Add columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'subscription_modules'
                   AND column_name = 'module_code') THEN
        ALTER TABLE subscription_modules
        ADD COLUMN module_code VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'subscription_modules'
                   AND column_name = 'module_name') THEN
        ALTER TABLE subscription_modules
        ADD COLUMN module_name VARCHAR(100);
    END IF;
END $$;

-- Create index on module_code for fast lookups
CREATE INDEX IF NOT EXISTS idx_subscription_modules_code ON subscription_modules(module_code);
CREATE INDEX IF NOT EXISTS idx_subscription_modules_org_code ON subscription_modules(organization_id, module_code, is_active);

COMMENT ON COLUMN subscription_modules.module_code IS 'Denormalized module code for fast JWT token generation';
COMMENT ON COLUMN subscription_modules.module_name IS 'Denormalized module name for display purposes';

-- ============================================================================
-- STEP 4: Update existing subscription_modules with module codes
-- ============================================================================

-- Update existing records by joining with modules table
UPDATE subscription_modules sm
SET
    module_code = m.module_code,
    module_name = m.module_name,
    updated_at = NOW()
FROM modules m
WHERE sm.module_id = m.id
  AND (sm.module_code IS NULL OR sm.module_code != m.module_code);

-- Verify the update
DO $$
DECLARE
    null_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO null_count
    FROM subscription_modules
    WHERE module_code IS NULL;

    IF null_count > 0 THEN
        RAISE WARNING 'Warning: % subscription_modules records still have NULL module_code', null_count;
    ELSE
        RAISE NOTICE 'Success: All subscription_modules records have module_code assigned';
    END IF;
END $$;

-- ============================================================================
-- STEP 5: Add foreign key constraint (optional but recommended)
-- ============================================================================

-- Add FK constraint to ensure referential integrity
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_subscription_modules_module_id'
        AND table_name = 'subscription_modules'
    ) THEN
        ALTER TABLE subscription_modules
        ADD CONSTRAINT fk_subscription_modules_module_id
        FOREIGN KEY (module_id) REFERENCES modules(id);
    END IF;
END $$;

-- ============================================================================
-- STEP 6: Ensure test cabinet has required modules
-- ============================================================================

-- Get the subscription ID for test cabinet
DO $$
DECLARE
    test_cabinet_id UUID := '650e8400-e29b-41d4-a716-446655440001';
    test_subscription_id UUID;
    test_org_id UUID;
    inventory_module_id UUID := '850e8400-e29b-41d4-a716-446655440001';
    imaging_module_id UUID := '850e8400-e29b-41d4-a716-446655440002';
    scheduling_module_id UUID := '850e8400-e29b-41d4-a716-446655440003';
    clinical_module_id UUID := '850e8400-e29b-41d4-a716-446655440004';
    existing_count INTEGER;
BEGIN
    -- Get subscription and organization ID for test cabinet
    SELECT id, organization_id INTO test_subscription_id, test_org_id
    FROM subscriptions
    WHERE cabinet_id = test_cabinet_id
    LIMIT 1;

    IF test_subscription_id IS NULL THEN
        RAISE WARNING 'Test cabinet % does not have a subscription', test_cabinet_id;
        RETURN;
    END IF;

    RAISE NOTICE 'Configuring modules for test cabinet % (subscription: %, org: %)',
                 test_cabinet_id, test_subscription_id, test_org_id;

    -- Insert or update inventory module
    INSERT INTO subscription_modules (
        organization_id, subscription_id, module_id, module_code, module_name,
        is_active, price, billing_cycle, currency, activated_at, is_core
    )
    SELECT
        test_org_id, test_subscription_id, inventory_module_id,
        m.module_code, m.module_name, true, 75.00, 'MONTHLY', 'USD', NOW(), false
    FROM modules m
    WHERE m.id = inventory_module_id
    ON CONFLICT (subscription_id, module_id)
    DO UPDATE SET
        is_active = true,
        module_code = EXCLUDED.module_code,
        module_name = EXCLUDED.module_name,
        deactivated_at = NULL,
        updated_at = NOW();

    -- Insert or update imaging module
    INSERT INTO subscription_modules (
        organization_id, subscription_id, module_id, module_code, module_name,
        is_active, price, billing_cycle, currency, activated_at, is_core
    )
    SELECT
        test_org_id, test_subscription_id, imaging_module_id,
        m.module_code, m.module_name, true, 100.00, 'MONTHLY', 'USD', NOW(), false
    FROM modules m
    WHERE m.id = imaging_module_id
    ON CONFLICT (subscription_id, module_id)
    DO UPDATE SET
        is_active = true,
        module_code = EXCLUDED.module_code,
        module_name = EXCLUDED.module_name,
        deactivated_at = NULL,
        updated_at = NOW();

    -- Insert or update scheduling module (core)
    INSERT INTO subscription_modules (
        organization_id, subscription_id, module_id, module_code, module_name,
        is_active, price, billing_cycle, currency, activated_at, is_core
    )
    SELECT
        test_org_id, test_subscription_id, scheduling_module_id,
        m.module_code, m.module_name, true, 50.00, 'MONTHLY', 'USD', NOW(), true
    FROM modules m
    WHERE m.id = scheduling_module_id
    ON CONFLICT (subscription_id, module_id)
    DO UPDATE SET
        is_active = true,
        module_code = EXCLUDED.module_code,
        module_name = EXCLUDED.module_name,
        deactivated_at = NULL,
        updated_at = NOW();

    -- Insert or update clinical module (core)
    INSERT INTO subscription_modules (
        organization_id, subscription_id, module_id, module_code, module_name,
        is_active, price, billing_cycle, currency, activated_at, is_core
    )
    SELECT
        test_org_id, test_subscription_id, clinical_module_id,
        m.module_code, m.module_name, true, 74.99, 'MONTHLY', 'USD', NOW(), true
    FROM modules m
    WHERE m.id = clinical_module_id
    ON CONFLICT (subscription_id, module_id)
    DO UPDATE SET
        is_active = true,
        module_code = EXCLUDED.module_code,
        module_name = EXCLUDED.module_name,
        deactivated_at = NULL,
        updated_at = NOW();

    -- Verify module count
    SELECT COUNT(*) INTO existing_count
    FROM subscription_modules
    WHERE subscription_id = test_subscription_id
      AND is_active = true;

    RAISE NOTICE 'Test cabinet now has % active modules', existing_count;
END $$;

-- ============================================================================
-- STEP 7: Create helpful views for module access
-- ============================================================================

-- View for active modules by organization
CREATE OR REPLACE VIEW v_organization_modules AS
SELECT
    sm.organization_id,
    sm.subscription_id,
    s.cabinet_id,
    c.name as cabinet_name,
    sm.module_id,
    sm.module_code,
    sm.module_name,
    m.description as module_description,
    sm.is_active,
    sm.is_core,
    sm.price,
    sm.billing_cycle,
    sm.activated_at,
    sm.deactivated_at,
    s.status as subscription_status
FROM subscription_modules sm
JOIN subscriptions s ON sm.subscription_id = s.id
JOIN cabinets c ON s.cabinet_id = c.id
LEFT JOIN modules m ON sm.module_id = m.id
WHERE s.deleted_at IS NULL;

COMMENT ON VIEW v_organization_modules IS 'View showing all module assignments with subscription and cabinet details';

-- View for active modules only (for JWT token generation)
CREATE OR REPLACE VIEW v_active_organization_modules AS
SELECT
    organization_id,
    cabinet_id,
    subscription_id,
    array_agg(module_code ORDER BY module_code) as module_codes,
    array_agg(module_name ORDER BY module_code) as module_names,
    COUNT(*) as active_module_count
FROM v_organization_modules
WHERE is_active = true
  AND subscription_status IN ('ACTIVE', 'TRIAL')
GROUP BY organization_id, cabinet_id, subscription_id;

COMMENT ON VIEW v_active_organization_modules IS 'Aggregated view of active module codes by organization for fast JWT generation';

-- ============================================================================
-- STEP 8: Create helper function for JWT token module codes
-- ============================================================================

CREATE OR REPLACE FUNCTION get_active_module_codes(p_organization_id UUID)
RETURNS TEXT[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT DISTINCT module_code
        FROM subscription_modules sm
        JOIN subscriptions s ON sm.subscription_id = s.id
        WHERE sm.organization_id = p_organization_id
          AND sm.is_active = true
          AND s.status IN ('ACTIVE', 'TRIAL')
          AND s.deleted_at IS NULL
        ORDER BY module_code
    );
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_active_module_codes IS 'Returns array of active module codes for an organization (for JWT tokens)';

-- Alternative function by cabinet_id
CREATE OR REPLACE FUNCTION get_active_module_codes_by_cabinet(p_cabinet_id UUID)
RETURNS TEXT[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT DISTINCT sm.module_code
        FROM subscription_modules sm
        JOIN subscriptions s ON sm.subscription_id = s.id
        WHERE s.cabinet_id = p_cabinet_id
          AND sm.is_active = true
          AND s.status IN ('ACTIVE', 'TRIAL')
          AND s.deleted_at IS NULL
        ORDER BY sm.module_code
    );
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_active_module_codes_by_cabinet IS 'Returns array of active module codes for a cabinet (for JWT tokens)';

-- ============================================================================
-- STEP 9: Validation queries
-- ============================================================================

-- Display migration results
DO $$
DECLARE
    total_modules INTEGER;
    total_subscriptions INTEGER;
    test_cabinet_modules TEXT[];
BEGIN
    SELECT COUNT(*) INTO total_modules FROM modules WHERE is_active = true;
    SELECT COUNT(*) INTO total_subscriptions FROM subscription_modules;
    SELECT get_active_module_codes_by_cabinet('650e8400-e29b-41d4-a716-446655440001')
           INTO test_cabinet_modules;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'Migration Completed Successfully';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total active modules defined: %', total_modules;
    RAISE NOTICE 'Total subscription_modules records: %', total_subscriptions;
    RAISE NOTICE 'Test cabinet active modules: %', array_to_string(test_cabinet_modules, ', ');
    RAISE NOTICE '========================================';
END $$;

-- Final validation: Show test cabinet configuration
SELECT
    sm.module_code,
    sm.module_name,
    sm.is_active,
    sm.is_core,
    sm.price,
    sm.billing_cycle
FROM subscription_modules sm
JOIN subscriptions s ON sm.subscription_id = s.id
WHERE s.cabinet_id = '650e8400-e29b-41d4-a716-446655440001'
ORDER BY sm.is_core DESC, sm.module_code;
