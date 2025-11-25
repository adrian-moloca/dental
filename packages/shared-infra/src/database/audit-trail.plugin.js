"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditTrailPlugin = auditTrailPlugin;
const mongoose_1 = require("mongoose");
function auditTrailPlugin(schema, options = {}) {
    const { excludeFields = ['__v', 'updatedAt'], emitEvents = false } = options;
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
                        type: mongoose_1.Schema.Types.Mixed,
                    },
                    metadata: {
                        type: mongoose_1.Schema.Types.Mixed,
                    },
                },
            ],
            default: [],
            select: false,
        },
    });
    schema.pre('save', function (next) {
        if (this.isNew) {
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
        }
        else if (this.isModified()) {
            const modifiedPaths = this.modifiedPaths();
            const changes = {};
            modifiedPaths.forEach((path) => {
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
                if (emitEvents && this.emit) {
                    this.emit('audit:update', {
                        documentId: this._id,
                        collectionName: this.constructor.modelName,
                        changes,
                        userId: this.get('updatedBy'),
                        timestamp: new Date(),
                    });
                }
            }
        }
        next();
    });
    schema.post('save', function (doc) {
        if (emitEvents && doc.isNew && doc.emit) {
            doc.emit('audit:create', {
                documentId: doc._id,
                collectionName: doc.constructor.modelName,
                userId: doc.get('createdBy'),
                timestamp: new Date(),
            });
        }
    });
    schema.pre('deleteOne', function (next) {
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
    schema.methods.getAuditHistory = function () {
        return this.auditHistory || [];
    };
    schema.methods.getLastChange = function () {
        const history = this.auditHistory || [];
        return history.length > 0 ? history[history.length - 1] : null;
    };
}
//# sourceMappingURL=audit-trail.plugin.js.map