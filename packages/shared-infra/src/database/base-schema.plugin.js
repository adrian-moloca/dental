"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseSchemaPlugin = baseSchemaPlugin;
function baseSchemaPlugin(schema, options = {}) {
    const { softDelete = false, versioning = true, multiTenant = true, audit = true, } = options;
    if (multiTenant) {
        schema.add({
            tenantId: {
                type: String,
                required: true,
                index: true,
                immutable: true,
            },
        });
    }
    if (audit) {
        schema.add({
            createdBy: {
                type: String,
                required: true,
                immutable: true,
            },
            updatedBy: {
                type: String,
                required: true,
            },
        });
    }
    if (softDelete) {
        schema.add({
            isDeleted: {
                type: Boolean,
                required: true,
                default: false,
                index: true,
            },
            deletedAt: {
                type: Date,
                default: null,
            },
            deletedBy: {
                type: String,
                default: null,
            },
        });
        schema.pre(/^find/, function (next) {
            if (!this.getOptions().showDeleted) {
                this.where({ isDeleted: { $ne: true } });
            }
            next();
        });
        schema.methods.softDelete = function (deletedBy) {
            this.isDeleted = true;
            this.deletedAt = new Date();
            this.deletedBy = deletedBy;
            return this.save();
        };
        schema.methods.restore = function () {
            this.isDeleted = false;
            this.deletedAt = null;
            this.deletedBy = null;
            return this.save();
        };
    }
    if (versioning) {
        schema.add({
            __v: {
                type: Number,
                select: false,
            },
        });
    }
    if (!schema.get('timestamps')) {
        schema.set('timestamps', true);
    }
    if (multiTenant && audit) {
        schema.index({ tenantId: 1, createdAt: -1 });
    }
    schema.set('toJSON', {
        virtuals: true,
        versionKey: false,
        transform: (_doc, ret) => {
            ret.id = ret._id?.toString();
            delete ret._id;
            if (ret.__v !== undefined) {
                delete ret.__v;
            }
            if (softDelete && !ret.isDeleted) {
                delete ret.isDeleted;
                delete ret.deletedAt;
                delete ret.deletedBy;
            }
            return ret;
        },
    });
    schema.set('toObject', {
        virtuals: true,
        versionKey: false,
    });
}
//# sourceMappingURL=base-schema.plugin.js.map