"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEntity = void 0;
class BaseEntity {
    constructor(id, organizationId, clinicId, createdAt, updatedAt) {
        this.validateId(id);
        this.validateOrganizationId(organizationId);
        if (clinicId !== undefined) {
            this.validateClinicId(clinicId);
        }
        this._id = id;
        this._organizationId = organizationId;
        this._clinicId = clinicId;
        this._tenantId = (clinicId || organizationId);
        const now = new Date().toISOString();
        this._createdAt = createdAt || now;
        this._updatedAt = updatedAt || now;
        if (new Date(this._updatedAt) < new Date(this._createdAt)) {
            throw new Error('updatedAt cannot be earlier than createdAt');
        }
    }
    get id() {
        return this._id;
    }
    get organizationId() {
        return this._organizationId;
    }
    get clinicId() {
        return this._clinicId;
    }
    get tenantId() {
        return this._tenantId;
    }
    get createdAt() {
        return this._createdAt;
    }
    get updatedAt() {
        return this._updatedAt;
    }
    touch() {
        this._updatedAt = new Date().toISOString();
    }
    equals(other) {
        if (other === null || other === undefined) {
            return false;
        }
        if (!(other instanceof BaseEntity)) {
            return false;
        }
        return this._id === other._id;
    }
    belongsToOrganization(organizationId) {
        return this._organizationId === organizationId;
    }
    belongsToClinic(clinicId) {
        return this._clinicId === clinicId;
    }
    isInTenantScope(organizationId, clinicId) {
        if (!this.belongsToOrganization(organizationId)) {
            return false;
        }
        if (clinicId !== undefined) {
            return this._clinicId === undefined || this.belongsToClinic(clinicId);
        }
        return true;
    }
    validateId(id) {
        if (!id || typeof id !== 'string') {
            throw new Error('Entity ID must be a non-empty string');
        }
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            throw new Error(`Invalid UUID format: ${id}`);
        }
    }
    validateOrganizationId(organizationId) {
        if (!organizationId || typeof organizationId !== 'string') {
            throw new Error('Organization ID must be a non-empty string');
        }
    }
    validateClinicId(clinicId) {
        if (!clinicId || typeof clinicId !== 'string') {
            throw new Error('Clinic ID must be a non-empty string');
        }
    }
}
exports.BaseEntity = BaseEntity;
//# sourceMappingURL=base-entity.js.map