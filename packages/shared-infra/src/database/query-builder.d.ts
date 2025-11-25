import { PipelineStage, SortOrder } from 'mongoose';
import type { FilterQuery } from 'mongoose';
export declare class QueryBuilder<T> {
    private filter;
    private projection;
    private sortOrder;
    private limitValue?;
    private skipValue?;
    private populateFields;
    private leanMode;
    where(field: keyof T | string, value: unknown): this;
    whereIn(field: keyof T | string, values: unknown[]): this;
    whereNotIn(field: keyof T | string, values: unknown[]): this;
    whereGreaterThan(field: keyof T | string, value: unknown): this;
    whereGreaterThanOrEqual(field: keyof T | string, value: unknown): this;
    whereLessThan(field: keyof T | string, value: unknown): this;
    whereLessThanOrEqual(field: keyof T | string, value: unknown): this;
    whereBetween(field: keyof T | string, min: unknown, max: unknown): this;
    whereNotNull(field: keyof T | string): this;
    whereNull(field: keyof T | string): this;
    whereRegex(field: keyof T | string, pattern: string, options?: string): this;
    whereText(searchText: string): this;
    whereDateBetween(field: keyof T | string, startDate: Date, endDate: Date): this;
    whereOr(conditions: FilterQuery<T>[]): this;
    whereAnd(conditions: FilterQuery<T>[]): this;
    whereRaw(filter: FilterQuery<T>): this;
    select(fields: (keyof T | string)[]): this;
    exclude(fields: (keyof T | string)[]): this;
    sort(field: keyof T | string, order?: 'asc' | 'desc' | 1 | -1): this;
    sortBy(sorts: Record<string, 'asc' | 'desc' | 1 | -1>): this;
    limit(value: number): this;
    skip(value: number): this;
    paginate(page: number, pageSize: number): this;
    populate(field: string): this;
    lean(): this;
    getFilter(): FilterQuery<T>;
    getProjection(): Record<string, 0 | 1> | undefined;
    getSort(): Record<string, SortOrder> | undefined;
    getLimit(): number | undefined;
    getSkip(): number | undefined;
    getPopulate(): string[];
    isLean(): boolean;
    build(): {
        filter: FilterQuery<T>;
        options: {
            projection?: Record<string, 0 | 1>;
            sort?: Record<string, SortOrder>;
            limit?: number;
            skip?: number;
            populate?: string[];
            lean?: boolean;
        };
    };
}
export declare class AggregationBuilder<T> {
    private pipeline;
    match(filter: FilterQuery<T>): this;
    group(groupBy: Record<string, unknown>): this;
    sort(sort: Record<string, 1 | -1>): this;
    limit(value: number): this;
    skip(value: number): this;
    project(projection: Record<string, unknown>): this;
    lookup(options: {
        from: string;
        localField: string;
        foreignField: string;
        as: string;
    }): this;
    unwind(path: string, preserveNullAndEmptyArrays?: boolean): this;
    addFields(fields: Record<string, unknown>): this;
    facet(facets: Record<string, PipelineStage[]>): this;
    addStage(stage: PipelineStage): this;
    build(): PipelineStage[];
}
