"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublisherError = void 0;
class PublisherError extends Error {
    constructor(message, eventId, eventType, cause) {
        super(message);
        this.eventId = eventId;
        this.eventType = eventType;
        this.cause = cause;
        this.name = 'PublisherError';
        Object.setPrototypeOf(this, PublisherError.prototype);
    }
}
exports.PublisherError = PublisherError;
//# sourceMappingURL=event-publisher.interface.js.map