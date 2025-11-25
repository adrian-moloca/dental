"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionManager = void 0;
const common_1 = require("@nestjs/common");
class TransactionManager {
    constructor(connection) {
        this.connection = connection;
        this.logger = new common_1.Logger(TransactionManager.name);
    }
    async execute(callback, options = {}) {
        const session = await this.connection.startSession();
        const transactionOptions = {
            readConcern: { level: options.readConcern || 'majority' },
            writeConcern: options.writeConcern || { w: 'majority' },
            readPreference: options.readPreference || 'primary',
            maxCommitTimeMS: options.maxCommitTimeMS,
        };
        try {
            session.startTransaction(transactionOptions);
            this.logger.debug('Transaction started');
            const result = await callback(session);
            await session.commitTransaction();
            this.logger.debug('Transaction committed successfully');
            return result;
        }
        catch (error) {
            this.logger.error('Transaction failed, aborting', error);
            if (session.inTransaction()) {
                await session.abortTransaction();
                this.logger.debug('Transaction aborted');
            }
            throw error;
        }
        finally {
            await session.endSession();
            this.logger.debug('Transaction session ended');
        }
    }
    async executeWithRetry(callback, options = {}, maxRetries = 3) {
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await this.execute(callback, options);
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                const isRetryable = this.isRetryableError(lastError);
                if (!isRetryable || attempt === maxRetries) {
                    this.logger.error(`Transaction failed after ${attempt} attempt(s)`, lastError);
                    throw lastError;
                }
                this.logger.warn(`Transaction attempt ${attempt} failed with retryable error, retrying...`, lastError.message);
                await this.delay(100 * Math.pow(2, attempt - 1));
            }
        }
        throw lastError;
    }
    isRetryableError(error) {
        const retryableErrorCodes = [
            112,
            117,
            251,
            262,
        ];
        const retryableLabels = ['TransientTransactionError', 'UnknownTransactionCommitResult'];
        const mongoError = error;
        if (mongoError.code && retryableErrorCodes.includes(mongoError.code)) {
            return true;
        }
        if (mongoError.errorLabels) {
            return mongoError.errorLabels.some((label) => retryableLabels.includes(label));
        }
        return false;
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    async createSession() {
        return this.connection.startSession();
    }
    async executeParallel(callbacks, options = {}) {
        return this.execute(async (session) => {
            return Promise.all(callbacks.map((callback) => callback(session)));
        }, options);
    }
    async executeSequential(callbacks, options = {}) {
        return this.execute(async (session) => {
            const results = [];
            for (const callback of callbacks) {
                const result = await callback(session);
                results.push(result);
            }
            return results;
        }, options);
    }
}
exports.TransactionManager = TransactionManager;
//# sourceMappingURL=transaction.manager.js.map