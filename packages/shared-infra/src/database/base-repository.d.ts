import { Model, Document, UpdateQuery, ClientSession } from 'mongoose';
import type { FilterQuery } from 'mongoose';
import { Logger } from '@nestjs/common';
export interface PaginationOptions {
    page?: number;
    limit?: number;
    offset?: number;
    sort?: Record<string, 1 | -1>;
}
export interface PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}
export interface RepositoryQueryOptions {
    session?: ClientSession;
    select?: string | Record<string, 0 | 1>;
    lean?: boolean;
    populate?: string | string[] | Record<string, unknown>;
    showDeleted?: boolean;
}
export declare abstract class BaseRepository<T extends Document> {
    protected readonly model: Model<T>;
    protected readonly modelName: string;
    protected readonly logger: Logger;
    constructor(model: Model<T>, modelName: string);
    create(data: Partial<T>, context: {
        userId: string;
        tenantId: string;
    }, options?: RepositoryQueryOptions): Promise<T>;
    createMany(dataArray: Partial<T>[], context: {
        userId: string;
        tenantId: string;
    }, options?: RepositoryQueryOptions): Promise<T[]>;
    findById(id: string, tenantId: string, options?: RepositoryQueryOptions): Promise<T | null>;
    findOne(filter: FilterQuery<T>, tenantId: string, options?: RepositoryQueryOptions): Promise<T | null>;
    findMany(filter: FilterQuery<T>, tenantId: string, pagination?: PaginationOptions, options?: RepositoryQueryOptions): Promise<PaginatedResult<T>>;
    findAll(filter: FilterQuery<T>, tenantId: string, options?: RepositoryQueryOptions): Promise<T[]>;
    updateById(id: string, update: UpdateQuery<T>, context: {
        userId: string;
        tenantId: string;
    }, options?: RepositoryQueryOptions): Promise<T | null>;
    updateOne(filter: FilterQuery<T>, update: UpdateQuery<T>, context: {
        userId: string;
        tenantId: string;
    }, options?: RepositoryQueryOptions): Promise<T | null>;
    updateMany(filter: FilterQuery<T>, update: UpdateQuery<T>, context: {
        userId: string;
        tenantId: string;
    }, options?: RepositoryQueryOptions): Promise<number>;
    softDeleteById(id: string, context: {
        userId: string;
        tenantId: string;
    }, options?: RepositoryQueryOptions): Promise<T | null>;
    deleteById(id: string, tenantId: string, options?: RepositoryQueryOptions): Promise<T | null>;
    count(filter: FilterQuery<T>, tenantId: string): Promise<number>;
    exists(filter: FilterQuery<T>, tenantId: string): Promise<boolean>;
    protected applyQueryOptions(query: any, options: RepositoryQueryOptions): any;
    withTransaction<R>(callback: (session: ClientSession) => Promise<R>): Promise<R>;
}
