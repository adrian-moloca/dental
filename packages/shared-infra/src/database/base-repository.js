"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const common_1 = require("@nestjs/common");
class BaseRepository {
    constructor(model, modelName) {
        this.model = model;
        this.modelName = modelName;
        this.logger = new common_1.Logger(`${modelName}Repository`);
    }
    async create(data, context, options = {}) {
        const document = new this.model({
            ...data,
            tenantId: context.tenantId,
            createdBy: context.userId,
            updatedBy: context.userId,
        });
        await document.save({ session: options.session });
        this.logger.log(`Created ${this.modelName} ${document._id}`);
        return document;
    }
    async createMany(dataArray, context, options = {}) {
        const documents = dataArray.map((data) => ({
            ...data,
            tenantId: context.tenantId,
            createdBy: context.userId,
            updatedBy: context.userId,
        }));
        const created = await this.model.insertMany(documents, { session: options.session });
        this.logger.log(`Created ${created.length} ${this.modelName} documents`);
        return created;
    }
    async findById(id, tenantId, options = {}) {
        let query = this.model.findOne({ _id: id, tenantId });
        query = this.applyQueryOptions(query, options);
        return query.exec();
    }
    async findOne(filter, tenantId, options = {}) {
        const scopedFilter = { ...filter, tenantId };
        let query = this.model.findOne(scopedFilter);
        query = this.applyQueryOptions(query, options);
        return query.exec();
    }
    async findMany(filter, tenantId, pagination = {}, options = {}) {
        const scopedFilter = { ...filter, tenantId };
        const limit = pagination.limit || 20;
        const page = pagination.page || 1;
        const offset = pagination.offset ?? (page - 1) * limit;
        const sort = pagination.sort || { createdAt: -1 };
        let dataQuery = this.model.find(scopedFilter).limit(limit).skip(offset).sort(sort);
        dataQuery = this.applyQueryOptions(dataQuery, options);
        const [data, total] = await Promise.all([
            dataQuery.exec(),
            this.model.countDocuments(scopedFilter).exec(),
        ]);
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage,
                hasPreviousPage,
            },
        };
    }
    async findAll(filter, tenantId, options = {}) {
        const scopedFilter = { ...filter, tenantId };
        let query = this.model.find(scopedFilter);
        query = this.applyQueryOptions(query, options);
        return query.exec();
    }
    async updateById(id, update, context, options = {}) {
        const updateData = {
            ...update,
            updatedBy: context.userId,
        };
        const queryOptions = {
            new: true,
            runValidators: true,
            session: options.session,
        };
        const document = await this.model
            .findOneAndUpdate({ _id: id, tenantId: context.tenantId }, updateData, queryOptions)
            .exec();
        if (document) {
            this.logger.log(`Updated ${this.modelName} ${id}`);
        }
        return document;
    }
    async updateOne(filter, update, context, options = {}) {
        const scopedFilter = { ...filter, tenantId: context.tenantId };
        const updateData = {
            ...update,
            updatedBy: context.userId,
        };
        const queryOptions = {
            new: true,
            runValidators: true,
            session: options.session,
        };
        const document = await this.model
            .findOneAndUpdate(scopedFilter, updateData, queryOptions)
            .exec();
        if (document) {
            this.logger.log(`Updated ${this.modelName} ${document._id}`);
        }
        return document;
    }
    async updateMany(filter, update, context, options = {}) {
        const scopedFilter = { ...filter, tenantId: context.tenantId };
        const updateData = {
            ...update,
            updatedBy: context.userId,
        };
        const result = await this.model
            .updateMany(scopedFilter, updateData, { session: options.session })
            .exec();
        this.logger.log(`Updated ${result.modifiedCount} ${this.modelName} documents`);
        return result.modifiedCount;
    }
    async softDeleteById(id, context, options = {}) {
        const updateData = {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: context.userId,
            updatedBy: context.userId,
        };
        const document = await this.model
            .findOneAndUpdate({ _id: id, tenantId: context.tenantId }, updateData, { new: true, session: options.session })
            .exec();
        if (document) {
            this.logger.log(`Soft deleted ${this.modelName} ${id}`);
        }
        return document;
    }
    async deleteById(id, tenantId, options = {}) {
        const document = await this.model
            .findOneAndDelete({ _id: id, tenantId }, {
            session: options.session,
        })
            .exec();
        if (document) {
            this.logger.log(`Hard deleted ${this.modelName} ${id}`);
        }
        return document;
    }
    async count(filter, tenantId) {
        const scopedFilter = { ...filter, tenantId };
        return this.model.countDocuments(scopedFilter).exec();
    }
    async exists(filter, tenantId) {
        const scopedFilter = { ...filter, tenantId };
        const count = await this.model.countDocuments(scopedFilter).limit(1).exec();
        return count > 0;
    }
    applyQueryOptions(query, options) {
        if (options.select) {
            query = query.select(options.select);
        }
        if (options.lean) {
            query = query.lean();
        }
        if (options.populate) {
            query = query.populate(options.populate);
        }
        if (options.session) {
            query = query.session(options.session);
        }
        if (options.showDeleted !== undefined) {
            query = query.setOptions({ showDeleted: options.showDeleted });
        }
        return query;
    }
    async withTransaction(callback) {
        const session = await this.model.db.startSession();
        session.startTransaction();
        try {
            const result = await callback(session);
            await session.commitTransaction();
            return result;
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
}
exports.BaseRepository = BaseRepository;
//# sourceMappingURL=base-repository.js.map