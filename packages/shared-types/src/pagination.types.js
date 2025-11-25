"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAGINATION_DEFAULTS = exports.PaginationStrategy = void 0;
exports.isOffsetPagination = isOffsetPagination;
exports.isCursorPagination = isCursorPagination;
exports.isOffsetPaginationMeta = isOffsetPaginationMeta;
exports.isCursorPaginationMeta = isCursorPaginationMeta;
var PaginationStrategy;
(function (PaginationStrategy) {
    PaginationStrategy["OFFSET"] = "OFFSET";
    PaginationStrategy["CURSOR"] = "CURSOR";
})(PaginationStrategy || (exports.PaginationStrategy = PaginationStrategy = {}));
exports.PAGINATION_DEFAULTS = {
    DEFAULT_PAGE_SIZE: 20,
    DEFAULT_LIMIT: 20,
    MAX_PAGE_SIZE: 100,
    MAX_LIMIT: 100,
    DEFAULT_PAGE: 1,
};
function isOffsetPagination(params) {
    return params.strategy === PaginationStrategy.OFFSET;
}
function isCursorPagination(params) {
    return params.strategy === PaginationStrategy.CURSOR;
}
function isOffsetPaginationMeta(meta) {
    return meta.strategy === PaginationStrategy.OFFSET;
}
function isCursorPaginationMeta(meta) {
    return meta.strategy === PaginationStrategy.CURSOR;
}
//# sourceMappingURL=pagination.types.js.map