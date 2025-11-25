"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeSchemas = mergeSchemas;
exports.extendSchema = extendSchema;
exports.makePartial = makePartial;
exports.makeOptional = makeOptional;
exports.makeRequired = makeRequired;
exports.pickFields = pickFields;
exports.omitFields = omitFields;
exports.makeDeepPartial = makeDeepPartial;
exports.allowAdditionalProperties = allowAdditionalProperties;
exports.makeStrict = makeStrict;
const zod_1 = require("zod");
function mergeSchemas(...schemas) {
    if (schemas.length === 0) {
        throw new Error('At least one schema must be provided');
    }
    let result = schemas[0];
    for (let i = 1; i < schemas.length; i++) {
        result = result.merge(schemas[i]);
    }
    return result;
}
function extendSchema(baseSchema, extensionSchema) {
    return baseSchema.merge(extensionSchema);
}
function makePartial(schema) {
    return schema.partial();
}
function makeOptional(schema, fields) {
    const shape = schema.shape;
    const newShape = { ...shape };
    for (const field of fields) {
        if (field in shape) {
            newShape[field] = shape[field].optional();
        }
    }
    return zod_1.z.object(newShape);
}
function makeRequired(schema, fields) {
    const shape = schema.shape;
    const newShape = { ...shape };
    for (const field of fields) {
        if (field in shape) {
            const fieldSchema = shape[field];
            if (fieldSchema instanceof zod_1.z.ZodOptional) {
                newShape[field] = fieldSchema.unwrap();
            }
        }
    }
    return zod_1.z.object(newShape);
}
function pickFields(schema, fields) {
    const fieldsObject = Object.fromEntries(fields.map((field) => [field, true]));
    return schema.pick(fieldsObject);
}
function omitFields(schema, fields) {
    const fieldsObject = Object.fromEntries(fields.map((field) => [field, true]));
    return schema.omit(fieldsObject);
}
function makeDeepPartial(schema) {
    return schema.deepPartial();
}
function allowAdditionalProperties(schema) {
    return schema.passthrough();
}
function makeStrict(schema) {
    return schema.strict();
}
//# sourceMappingURL=schema-composer.js.map