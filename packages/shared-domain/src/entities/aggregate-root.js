"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregateRoot = void 0;
const base_entity_1 = require("./base-entity");
class AggregateRoot extends base_entity_1.BaseEntity {
    constructor(id, organizationId, clinicId, createdAt, updatedAt) {
        super(id, organizationId, clinicId, createdAt, updatedAt);
        this._domainEvents = [];
    }
    getDomainEvents() {
        return [...this._domainEvents];
    }
    addDomainEvent(event) {
        if (!event) {
            throw new Error('Domain event cannot be null or undefined');
        }
        if (event.aggregateId !== this.id) {
            throw new Error(`Event aggregate ID (${event.aggregateId}) does not match this aggregate (${this.id})`);
        }
        this._domainEvents.push(event);
    }
    clearDomainEvents() {
        this._domainEvents.length = 0;
    }
    hasDomainEvents() {
        return this._domainEvents.length > 0;
    }
    getDomainEventCount() {
        return this._domainEvents.length;
    }
    getEventsByType(eventType) {
        return this._domainEvents.filter((event) => event.eventType === eventType);
    }
}
exports.AggregateRoot = AggregateRoot;
//# sourceMappingURL=aggregate-root.js.map