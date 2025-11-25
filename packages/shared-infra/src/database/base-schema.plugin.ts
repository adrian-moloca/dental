import { Schema } from 'mongoose';

/**
 * Base schema plugin that adds common fields and behaviors to all schemas
 *
 * Features:
 * - Audit fields (createdBy, updatedBy)
 * - Soft delete support (isDeleted, deletedAt, deletedBy)
 * - Optimistic locking (version)
 * - Multi-tenancy (tenantId)
 *
 * @param schema - Mongoose schema to enhance
 * @param options - Plugin configuration options
 */
export interface BaseSchemaPluginOptions {
  /** Enable soft delete support (default: false) */
  softDelete?: boolean;
  /** Enable optimistic locking with version field (default: true) */
  versioning?: boolean;
  /** Enable tenant scoping (default: true) */
  multiTenant?: boolean;
  /** Enable audit fields (default: true) */
  audit?: boolean;
}

export function baseSchemaPlugin(schema: Schema, options: BaseSchemaPluginOptions = {}) {
  const {
    softDelete = false,
    versioning = true,
    multiTenant = true,
    audit = true,
  } = options;

  // Add multi-tenant fields
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

  // Add audit fields
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

  // Add soft delete fields
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

    // Add query middleware to exclude soft-deleted documents by default
    schema.pre(/^find/, function (this: any, next: any) {
      // Allow opting into showing deleted documents
      if (!this.getOptions().showDeleted) {
        this.where({ isDeleted: { $ne: true } });
      }
      next();
    });

    // Add method for soft delete
    schema.methods.softDelete = function (deletedBy: string) {
      this.isDeleted = true;
      this.deletedAt = new Date();
      this.deletedBy = deletedBy;
      return this.save();
    };

    // Add method for restore
    schema.methods.restore = function () {
      this.isDeleted = false;
      this.deletedAt = null;
      this.deletedBy = null;
      return this.save();
    };
  }

  // Add optimistic locking
  if (versioning) {
    schema.add({
      __v: {
        type: Number,
        select: false,
      },
    });
  }

  // Add timestamps if not already present
  if (!schema.get('timestamps')) {
    schema.set('timestamps', true);
  }

  // Add common indexes
  if (multiTenant && audit) {
    schema.index({ tenantId: 1, createdAt: -1 });
  }

  // Add toJSON transform to remove sensitive fields
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc: any, ret: any) => {
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
