import { Schema } from 'mongoose';

/**
 * Audit trail plugin that tracks all changes to documents
 *
 * Features:
 * - Tracks field-level changes
 * - Stores change history
 * - Emits events for audit logging
 *
 * @param schema - Mongoose schema to enhance
 * @param options - Plugin configuration options
 */
export interface AuditTrailPluginOptions {
  /** Fields to exclude from audit trail */
  excludeFields?: string[];
  /** Emit events for external audit systems */
  emitEvents?: boolean;
}

export function auditTrailPlugin(schema: Schema, options: AuditTrailPluginOptions = {}) {
  const { excludeFields = ['__v', 'updatedAt'], emitEvents = false } = options;

  // Add audit history subdocument
  schema.add({
    auditHistory: {
      type: [
        {
          action: {
            type: String,
            enum: ['CREATE', 'UPDATE', 'DELETE', 'RESTORE'],
            required: true,
          },
          timestamp: {
            type: Date,
            required: true,
            default: Date.now,
          },
          userId: {
            type: String,
            required: true,
          },
          changes: {
            type: Schema.Types.Mixed,
          },
          metadata: {
            type: Schema.Types.Mixed,
          },
        },
      ],
      default: [],
      select: false, // Don't include by default in queries
    },
  });

  // Pre-save hook to track changes
  schema.pre('save', function (this: any, next: any) {
    if (this.isNew) {
      // Record creation
      const auditEntry = {
        action: 'CREATE',
        timestamp: new Date(),
        userId: this.get('createdBy') || 'system',
        changes: {},
        metadata: {
          isNew: true,
        },
      };

      if (!this.auditHistory) {
        this.auditHistory = [];
      }
      this.auditHistory.push(auditEntry);
    } else if (this.isModified()) {
      // Record update
      const modifiedPaths = this.modifiedPaths();
      const changes: Record<string, { old: unknown; new: unknown }> = {};

      modifiedPaths.forEach((path: string) => {
        if (!excludeFields.includes(path) && path !== 'auditHistory') {
          const oldValue = this.get(path, null, { getters: false });
          const newValue = this.get(path);

          changes[path] = {
            old: oldValue,
            new: newValue,
          };
        }
      });

      if (Object.keys(changes).length > 0) {
        const auditEntry = {
          action: 'UPDATE',
          timestamp: new Date(),
          userId: this.get('updatedBy') || 'system',
          changes,
          metadata: {
            modifiedPaths,
          },
        };

        if (!this.auditHistory) {
          this.auditHistory = [];
        }
        this.auditHistory.push(auditEntry);

        // Emit event if enabled
        if (emitEvents && this.emit) {
          this.emit('audit:update', {
            documentId: this._id,
            collectionName: (this.constructor as any).modelName,
            changes,
            userId: this.get('updatedBy'),
            timestamp: new Date(),
          });
        }
      }
    }

    next();
  });

  // Post-save hook for event emission
  schema.post('save', function (this: any, doc: any) {
    if (emitEvents && doc.isNew && doc.emit) {
      doc.emit('audit:create', {
        documentId: doc._id,
        collectionName: (doc.constructor as any).modelName,
        userId: doc.get('createdBy'),
        timestamp: new Date(),
      });
    }
  });

  // Pre-remove hook
  schema.pre('deleteOne', function (this: any, next: any) {
    const auditEntry = {
      action: 'DELETE',
      timestamp: new Date(),
      userId: this.get?.('deletedBy') || 'system',
      changes: {},
      metadata: {
        hardDelete: true,
      },
    };

    if (this.auditHistory) {
      this.auditHistory.push(auditEntry);
    }

    next();
  });

  // Add method to get audit history
  schema.methods.getAuditHistory = function () {
    return this.auditHistory || [];
  };

  // Add method to get last change
  schema.methods.getLastChange = function () {
    const history = this.auditHistory || [];
    return history.length > 0 ? history[history.length - 1] : null;
  };
}
