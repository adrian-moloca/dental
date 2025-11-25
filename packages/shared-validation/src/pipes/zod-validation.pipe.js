"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodValidationPipe = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
let ZodValidationPipe = class ZodValidationPipe {
    constructor(schema) {
        this.schema = schema;
    }
    transform(value, _metadata) {
        try {
            const parsedValue = this.schema.parse(value);
            return parsedValue;
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                throw new common_1.BadRequestException({
                    message: 'Validation failed',
                    errors: error.errors.map((err) => ({
                        path: err.path.join('.'),
                        message: err.message,
                    })),
                });
            }
            throw new common_1.BadRequestException('Validation failed');
        }
    }
};
exports.ZodValidationPipe = ZodValidationPipe;
exports.ZodValidationPipe = ZodValidationPipe = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [zod_1.ZodSchema])
], ZodValidationPipe);
//# sourceMappingURL=zod-validation.pipe.js.map