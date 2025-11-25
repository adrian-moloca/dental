"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBusError = void 0;
class EventBusError extends Error {
    constructor(message, eventType, cause) {
        super(message);
        this.eventType = eventType;
        this.cause = cause;
        this.name = 'EventBusError';
        Object.setPrototypeOf(this, EventBusError.prototype);
    }
}
exports.EventBusError = EventBusError;
//# sourceMappingURL=domain-event-bus.interface.js.map