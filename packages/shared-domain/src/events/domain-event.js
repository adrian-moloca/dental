"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainEvent = void 0;
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
class DomainEvent {
    constructor(eventType, aggregateId, version, metadata = {}, eventId, timestamp) {
        this.validateEventType(eventType);
        this.validateAggregateId(aggregateId);
        this.validateVersion(version);
        this._eventId = eventId || generateUUID();
        this._eventType = eventType;
        this._aggregateId = aggregateId;
        this._timestamp = timestamp || new Date().toISOString();
        this._version = version;
        this._metadata = Object.freeze({ ...metadata });
        Object.freeze(this);
    }
    get eventId() {
        return this._eventId;
    }
    get eventType() {
        return this._eventType;
    }
    get aggregateId() {
        return this._aggregateId;
    }
    get timestamp() {
        return this._timestamp;
    }
    get version() {
        return this._version;
    }
    get metadata() {
        return this._metadata;
    }
    getMetadata(key) {
        return this._metadata[key];
    }
    hasMetadata(key) {
        return key in this._metadata;
    }
    toJSON() {
        return {
            eventId: this._eventId,
            eventType: this._eventType,
            aggregateId: this._aggregateId,
            timestamp: this._timestamp,
            version: this._version,
            metadata: { ...this._metadata },
            payload: this.getEventPayload(),
        };
    }
    getEventPayload() {
        const payload = {};
        Object.keys(this).forEach((key) => {
            if (!key.startsWith('_')) {
                payload[key] = this[key];
            }
        });
        return payload;
    }
    validateEventType(eventType) {
        if (!eventType || typeof eventType !== 'string') {
            throw new Error('Event type must be a non-empty string');
        }
        if (eventType.trim().length === 0) {
            throw new Error('Event type cannot be empty or whitespace');
        }
    }
    validateAggregateId(aggregateId) {
        if (!aggregateId || typeof aggregateId !== 'string') {
            throw new Error('Aggregate ID must be a non-empty string');
        }
    }
    validateVersion(version) {
        if (typeof version !== 'number' || !Number.isInteger(version)) {
            throw new Error('Version must be an integer');
        }
        if (version < 1) {
            throw new Error('Version must be at least 1');
        }
    }
}
exports.DomainEvent = DomainEvent;
//# sourceMappingURL=domain-event.js.map