import { Schema } from 'mongoose';

/**
 * Event emitter plugin for domain event publishing
 *
 * Features:
 * - Emits domain events after save operations
 * - Supports custom event payload transformation
 * - Integrates with EventEmitter2 for event-driven architecture
 *
 * @param schema - Mongoose schema to enhance
 * @param options - Plugin configuration options
 */
export interface EventEmitterPluginOptions {
  /** Event name prefix (e.g., 'enterprise.organization') */
  eventPrefix: string;
  /** Custom event payload transformer */
  payloadTransformer?: (doc: any, eventType: string) => Record<string, unknown>;
  /** Enable event emission (can be disabled for testing) */
  enabled?: boolean;
}

export function eventEmitterPlugin(schema: Schema, options: EventEmitterPluginOptions) {
  const { eventPrefix, payloadTransformer, enabled = true } = options;

  if (!enabled) {
    return;
  }

  // Store the event emitter on the schema
  let eventEmitter: any = null;

  schema.statics.setEventEmitter = function (emitter: any) {
    eventEmitter = emitter;
  };

  // Default payload transformer
  const defaultPayloadTransformer = (doc: any, eventType: string) => {
    const payload: Record<string, unknown> = {
      id: doc._id.toString(),
      eventType,
      timestamp: new Date().toISOString(),
    };

    // Add tenant context
    if (doc.tenantId) {
      payload.tenantId = doc.tenantId;
    }
    if (doc.organizationId) {
      payload.organizationId = doc.organizationId;
    }
    if (doc.clinicId) {
      payload.clinicId = doc.clinicId;
    }

    // Add audit context
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

  // Post-save hook for create events
  schema.post('save', function (doc, next) {
    if (!eventEmitter) {
      return next();
    }

    try {
      if (doc.isNew) {
        const eventName = `${eventPrefix}.created`;
        const payload = transformer(doc, 'created');
        eventEmitter.emit(eventName, payload);
      } else {
        const eventName = `${eventPrefix}.updated`;
        const payload = transformer(doc, 'updated');
        eventEmitter.emit(eventName, payload);
      }
    } catch (error) {
      // Log but don't fail the operation
      console.error('Error emitting event:', error);
    }

    next();
  });

  // Post-deleteOne hook for delete events
  schema.post('deleteOne', function (doc: any, next: any) {
    if (!eventEmitter) {
      return next();
    }

    try {
      const eventName = `${eventPrefix}.deleted`;
      const payload = transformer(doc, 'deleted');
      eventEmitter.emit(eventName, payload);
    } catch (error) {
      // Log but don't fail the operation
      console.error('Error emitting event:', error);
    }

    next();
  });

  // Post-findOneAndUpdate hook for update events
  schema.post('findOneAndUpdate', function (doc, next) {
    if (!eventEmitter || !doc) {
      return next();
    }

    try {
      const eventName = `${eventPrefix}.updated`;
      const payload = transformer(doc, 'updated');
      eventEmitter.emit(eventName, payload);
    } catch (error) {
      // Log but don't fail the operation
      console.error('Error emitting event:', error);
    }

    next();
  });

  // Post-findOneAndDelete hook for delete events
  schema.post('findOneAndDelete', function (doc, next) {
    if (!eventEmitter || !doc) {
      return next();
    }

    try {
      const eventName = `${eventPrefix}.deleted`;
      const payload = transformer(doc, 'deleted');
      eventEmitter.emit(eventName, payload);
    } catch (error) {
      // Log but don't fail the operation
      console.error('Error emitting event:', error);
    }

    next();
  });

  // Add custom event emission method
  schema.methods.emitDomainEvent = function (eventName: string, payload?: Record<string, unknown>) {
    if (!eventEmitter) {
      return;
    }

    try {
      const fullEventName = `${eventPrefix}.${eventName}`;
      const defaultPayload = transformer(this, eventName);
      const finalPayload = payload ? { ...defaultPayload, ...payload } : defaultPayload;
      eventEmitter.emit(fullEventName, finalPayload);
    } catch (error) {
      console.error('Error emitting custom event:', error);
    }
  };
}
