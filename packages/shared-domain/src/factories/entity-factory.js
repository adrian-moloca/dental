"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityFactory = void 0;
const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};
class EntityFactory {
    static generateId() {
        return generateUUID();
    }
    static getCurrentTimestamp() {
        return new Date().toISOString();
    }
    static createBaseFields(tenantContext, options = {}) {
        EntityFactory.validateTenantContext(tenantContext);
        const id = options.id || EntityFactory.generateId();
        const now = EntityFactory.getCurrentTimestamp();
        const createdAt = options.createdAt || now;
        const updatedAt = options.updatedAt || now;
        if (new Date(updatedAt) < new Date(createdAt)) {
            throw new Error('updatedAt cannot be earlier than createdAt');
        }
        return {
            id,
            organizationId: tenantContext.organizationId,
            clinicId: tenantContext.clinicId,
            createdAt,
            updatedAt,
        };
    }
    static createNewEntity(tenantContext, id) {
        const now = EntityFactory.getCurrentTimestamp();
        return EntityFactory.createBaseFields(tenantContext, {
            id,
            createdAt: now,
            updatedAt: now,
        });
    }
    static createExistingEntity(id, tenantContext, createdAt, updatedAt) {
        return EntityFactory.createBaseFields(tenantContext, {
            id,
            createdAt,
            updatedAt,
        });
    }
    static validateTenantContext(context) {
        if (!context) {
            throw new Error('Tenant context is required');
        }
        if (!context.organizationId) {
            throw new Error('Organization ID is required in tenant context');
        }
        if (typeof context.organizationId !== 'string') {
            throw new Error('Organization ID must be a string');
        }
        if (context.clinicId !== undefined &&
            typeof context.clinicId !== 'string') {
            throw new Error('Clinic ID must be a string if provided');
        }
    }
    static validateUUID(id, paramName = 'id') {
        if (!id || typeof id !== 'string') {
            throw new Error(`${paramName} must be a non-empty string`);
        }
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            throw new Error(`${paramName} must be a valid UUID v4: ${id}`);
        }
    }
    static validateISODateString(date, paramName = 'date') {
        if (!date || typeof date !== 'string') {
            throw new Error(`${paramName} must be a non-empty string`);
        }
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            throw new Error(`${paramName} must be a valid ISO date string: ${date}`);
        }
        if (parsedDate.toISOString() !== date) {
            throw new Error(`${paramName} must be in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ): ${date}`);
        }
    }
}
exports.EntityFactory = EntityFactory;
//# sourceMappingURL=entity-factory.js.map