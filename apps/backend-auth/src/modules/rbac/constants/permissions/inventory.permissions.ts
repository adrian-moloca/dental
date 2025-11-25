/**
 * Inventory Module Permissions
 * Covers: items, stock levels, purchase orders, vendor management
 *
 * DESIGN PRINCIPLES:
 * - Granular control over supply chain operations
 * - Approval workflows for financial authorization
 * - Stock accuracy through permission-based adjustments
 */

/**
 * Supply chain and stock management permissions
 */
export const INVENTORY_PERMISSIONS = {
  ITEM: {
    /**
     * Create inventory items
     * Grants: Add new items to catalog
     * Used by: clinic_manager, tenant_admin
     */
    CREATE: 'inventory.item.create',

    /**
     * View inventory item details
     * Grants: Read item information, pricing, suppliers
     * Used by: All staff (for procedure planning)
     */
    READ: 'inventory.item.read',

    /**
     * Update inventory item information
     * Grants: Modify item details, reorder points, pricing
     * Used by: clinic_manager
     */
    UPDATE: 'inventory.item.update',

    /**
     * Delete inventory items
     * Grants: Remove items from catalog (soft delete)
     * Used by: clinic_manager, tenant_admin
     */
    DELETE: 'inventory.item.delete',

    /**
     * View inventory catalog
     * Grants: List and search inventory items
     * Used by: All staff
     */
    LIST: 'inventory.item.list',
  },

  STOCK: {
    /**
     * Adjust stock levels
     * Grants: Manual stock adjustments (receives, usage, waste)
     * Used by: clinic_manager, assigned staff
     */
    ADJUST: 'inventory.stock.adjust',

    /**
     * View current stock levels
     * Grants: Read inventory quantities and alerts
     * Used by: All staff (to check availability)
     */
    VIEW: 'inventory.stock.view',
  },

  ORDER: {
    /**
     * Create purchase orders
     * Grants: Order supplies from vendors
     * Used by: clinic_manager
     */
    CREATE: 'inventory.order.create',

    /**
     * Approve purchase orders
     * Grants: Authorize orders for fulfillment
     * Used by: tenant_admin (financial approval)
     */
    APPROVE: 'inventory.order.approve',

    /**
     * View purchase order history
     * Grants: Access to order tracking and history
     * Used by: clinic_manager, tenant_admin
     */
    VIEW: 'inventory.order.view',
  },

  VENDOR: {
    /**
     * Manage supplier information
     * Grants: Add, update, or remove vendors
     * Used by: clinic_manager, tenant_admin
     */
    MANAGE: 'inventory.vendor.manage',
  },
} as const;

/**
 * Flatten inventory permissions into array for validation and iteration
 */
export const INVENTORY_PERMISSION_LIST = Object.values(INVENTORY_PERMISSIONS).flatMap((category) =>
  Object.values(category)
);

/**
 * Permission count for this module
 */
export const INVENTORY_PERMISSION_COUNT = INVENTORY_PERMISSION_LIST.length;
