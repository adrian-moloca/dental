"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventEmitterPlugin = eventEmitterPlugin;
function eventEmitterPlugin(schema, options) {
    const { eventPrefix, payloadTransformer, enabled = true } = options;
    if (!enabled) {
        return;
    }
    let eventEmitter = null;
    schema.statics.setEventEmitter = function (emitter) {
        eventEmitter = emitter;
    };
    const defaultPayloadTransformer = (doc, eventType) => {
        const payload = {
            id: doc._id.toString(),
            eventType,
            timestamp: new Date().toISOString(),
        };
        if (doc.tenantId) {
            payload.tenantId = doc.tenantId;
        }
        if (doc.organizationId) {
            payload.organizationId = doc.organizationId;
        }
        if (doc.clinicId) {
            payload.clinicId = doc.clinicId;
        }
        if (eventType === 'created' && doc.createdBy) {
            payload.createdBy = doc.createdBy;
        }
        if (eventType === 'updated' && doc.updatedBy) {
            payload.updatedBy = doc.updatedBy;
        }
        if (eventType === 'deleted' && doc.deletedBy) {
            payload.deletedBy = doc.deletedBy;
        }
        return payload;
    };
    const transformer = payloadTransformer || defaultPayloadTransformer;
    schema.post('save', function (doc, next) {
        if (!eventEmitter) {
            return next();
        }
        try {
            if (doc.isNew) {
                const eventName = `${eventPrefix}.created`;
                const payload = transformer(doc, 'created');
                eventEmitter.emit(eventName, payload);
            }
            else {
                const eventName = `${eventPrefix}.updated`;
                const payload = transformer(doc, 'updated');
                eventEmitter.emit(eventName, payload);
            }
        }
        catch (error) {
            console.error('Error emitting event:', error);
        }
        next();
    });
    schema.post('deleteOne', function (doc, next) {
        if (!eventEmitter) {
            return next();
        }
        try {
            const eventName = `${eventPrefix}.deleted`;
            const payload = transformer(doc, 'deleted');
            eventEmitter.emit(eventName, payload);
        }
        catch (error) {
            console.error('Error emitting event:', error);
        }
        next();
    });
    schema.post('findOneAndUpdate', function (doc, next) {
        if (!eventEmitter || !doc) {
            return next();
        }
        try {
            const eventName = `${eventPrefix}.updated`;
            const payload = transformer(doc, 'updated');
            eventEmitter.emit(eventName, payload);
        }
        catch (error) {
            console.error('Error emitting event:', error);
        }
        next();
    });
    schema.post('findOneAndDelete', function (doc, next) {
        if (!eventEmitter || !doc) {
            return next();
        }
        try {
            const eventName = `${eventPrefix}.deleted`;
            const payload = transformer(doc, 'deleted');
            eventEmitter.emit(eventName, payload);
        }
        catch (error) {
            console.error('Error emitting event:', error);
        }
        next();
    });
    schema.methods.emitDomainEvent = function (eventName, payload) {
        if (!eventEmitter) {
            return;
        }
        try {
            const fullEventName = `${eventPrefix}.${eventName}`;
            const defaultPayload = transformer(this, eventName);
            const finalPayload = payload ? { ...defaultPayload, ...payload } : defaultPayload;
            eventEmitter.emit(fullEventName, finalPayload);
        }
        catch (error) {
            console.error('Error emitting custom event:', error);
        }
    };
}
//# sourceMappingURL=event-emitter.plugin.js.map