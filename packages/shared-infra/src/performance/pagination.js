"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationRequestSchema = void 0;
exports.createPaginatedResponse = createPaginatedResponse;
exports.calculatePaginationParams = calculatePaginationParams;
exports.createCursorPaginatedResponse = createCursorPaginatedResponse;
exports.decodeCursor = decodeCursor;
const zod_1 = require("zod");
exports.PaginationRequestSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
function createPaginatedResponse(data, total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    };
}
function calculatePaginationParams(request) {
    const skip = (request.page - 1) * request.limit;
    return { skip, limit: request.limit };
}
function createCursorPaginatedResponse(data, limit) {
    const hasNextPage = data.length > limit;
    const items = hasNextPage ? data.slice(0, limit) : data;
    let nextCursor;
    if (hasNextPage && items.length > 0) {
        const lastItem = items[items.length - 1];
        nextCursor = Buffer.from(lastItem._id.toString()).toString('base64');
    }
    return {
        data: items,
        pagination: {
            limit,
            nextCursor,
            hasNextPage,
        },
    };
}
function decodeCursor(cursor) {
    return Buffer.from(cursor, 'base64').toString('utf-8');
}
//# sourceMappingURL=pagination.js.map