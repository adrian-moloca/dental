"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregationBuilder = exports.QueryBuilder = void 0;
class QueryBuilder {
    constructor() {
        this.filter = {};
        this.projection = {};
        this.sortOrder = {};
        this.populateFields = [];
        this.leanMode = false;
    }
    where(field, value) {
        this.filter[field] = value;
        return this;
    }
    whereIn(field, values) {
        this.filter[field] = { $in: values };
        return this;
    }
    whereNotIn(field, values) {
        this.filter[field] = { $nin: values };
        return this;
    }
    whereGreaterThan(field, value) {
        this.filter[field] = { $gt: value };
        return this;
    }
    whereGreaterThanOrEqual(field, value) {
        this.filter[field] = { $gte: value };
        return this;
    }
    whereLessThan(field, value) {
        this.filter[field] = { $lt: value };
        return this;
    }
    whereLessThanOrEqual(field, value) {
        this.filter[field] = { $lte: value };
        return this;
    }
    whereBetween(field, min, max) {
        this.filter[field] = { $gte: min, $lte: max };
        return this;
    }
    whereNotNull(field) {
        this.filter[field] = { $ne: null, $exists: true };
        return this;
    }
    whereNull(field) {
        this.filter[field] = { $eq: null };
        return this;
    }
    whereRegex(field, pattern, options = 'i') {
        this.filter[field] = { $regex: pattern, $options: options };
        return this;
    }
    whereText(searchText) {
        this.filter.$text = { $search: searchText };
        return this;
    }
    whereDateBetween(field, startDate, endDate) {
        this.filter[field] = { $gte: startDate, $lte: endDate };
        return this;
    }
    whereOr(conditions) {
        this.filter.$or = conditions;
        return this;
    }
    whereAnd(conditions) {
        this.filter.$and = conditions;
        return this;
    }
    whereRaw(filter) {
        this.filter = { ...this.filter, ...filter };
        return this;
    }
    select(fields) {
        fields.forEach((field) => {
            this.projection[field] = 1;
        });
        return this;
    }
    exclude(fields) {
        fields.forEach((field) => {
            this.projection[field] = 0;
        });
        return this;
    }
    sort(field, order = 'asc') {
        const sortValue = order === 'asc' || order === 1 ? 1 : -1;
        this.sortOrder[field] = sortValue;
        return this;
    }
    sortBy(sorts) {
        Object.entries(sorts).forEach(([field, order]) => {
            this.sort(field, order);
        });
        return this;
    }
    limit(value) {
        this.limitValue = value;
        return this;
    }
    skip(value) {
        this.skipValue = value;
        return this;
    }
    paginate(page, pageSize) {
        this.limitValue = pageSize;
        this.skipValue = (page - 1) * pageSize;
        return this;
    }
    populate(field) {
        this.populateFields.push(field);
        return this;
    }
    lean() {
        this.leanMode = true;
        return this;
    }
    getFilter() {
        return this.filter;
    }
    getProjection() {
        return Object.keys(this.projection).length > 0 ? this.projection : undefined;
    }
    getSort() {
        return Object.keys(this.sortOrder).length > 0 ? this.sortOrder : undefined;
    }
    getLimit() {
        return this.limitValue;
    }
    getSkip() {
        return this.skipValue;
    }
    getPopulate() {
        return this.populateFields;
    }
    isLean() {
        return this.leanMode;
    }
    build() {
        return {
            filter: this.filter,
            options: {
                projection: this.getProjection(),
                sort: this.getSort(),
                limit: this.limitValue,
                skip: this.skipValue,
                populate: this.populateFields.length > 0 ? this.populateFields : undefined,
                lean: this.leanMode,
            },
        };
    }
}
exports.QueryBuilder = QueryBuilder;
class AggregationBuilder {
    constructor() {
        this.pipeline = [];
    }
    match(filter) {
        this.pipeline.push({ $match: filter });
        return this;
    }
    group(groupBy) {
        this.pipeline.push({ $group: groupBy });
        return this;
    }
    sort(sort) {
        this.pipeline.push({ $sort: sort });
        return this;
    }
    limit(value) {
        this.pipeline.push({ $limit: value });
        return this;
    }
    skip(value) {
        this.pipeline.push({ $skip: value });
        return this;
    }
    project(projection) {
        this.pipeline.push({ $project: projection });
        return this;
    }
    lookup(options) {
        this.pipeline.push({ $lookup: options });
        return this;
    }
    unwind(path, preserveNullAndEmptyArrays = false) {
        this.pipeline.push({
            $unwind: {
                path,
                preserveNullAndEmptyArrays,
            },
        });
        return this;
    }
    addFields(fields) {
        this.pipeline.push({ $addFields: fields });
        return this;
    }
    facet(facets) {
        this.pipeline.push({ $facet: facets });
        return this;
    }
    addStage(stage) {
        this.pipeline.push(stage);
        return this;
    }
    build() {
        return this.pipeline;
    }
}
exports.AggregationBuilder = AggregationBuilder;
//# sourceMappingURL=query-builder.js.map