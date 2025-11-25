import { ClientSession, Connection } from 'mongoose';
import { Logger } from '@nestjs/common';

/**
 * Transaction options
 */
export interface TransactionOptions {
  /** Read concern level */
  readConcern?: 'local' | 'majority' | 'linearizable' | 'available';
  /** Write concern */
  writeConcern?: {
    w?: number | 'majority';
    j?: boolean;
    wtimeout?: number;
  };
  /** Read preference */
  readPreference?: 'primary' | 'primaryPreferred' | 'secondary' | 'secondaryPreferred' | 'nearest';
  /** Maximum time to wait for transaction to commit (ms) */
  maxCommitTimeMS?: number;
}

/**
 * Transaction callback function
 */
export type TransactionCallback<T> = (session: ClientSession) => Promise<T>;

/**
 * Transaction manager for MongoDB
 *
 * Features:
 * - ACID transaction support
 * - Automatic retry on transient errors
 * - Proper error handling and rollback
 * - Transaction isolation and consistency
 *
 * Usage:
 * ```typescript
 * const result = await transactionManager.execute(async (session) => {
 *   const org = await orgRepo.create(data, context, { session });
 *   const clinic = await clinicRepo.create(clinicData, context, { session });
 *   return { org, clinic };
 * });
 * ```
 */
export class TransactionManager {
  private readonly logger = new Logger(TransactionManager.name);

  constructor(private readonly connection: Connection) {}

  /**
   * Execute a function within a transaction
   *
   * @param callback - Function to execute within transaction
   * @param options - Transaction options
   * @returns Result of callback
   */
  async execute<T>(
    callback: TransactionCallback<T>,
    options: TransactionOptions = {},
  ): Promise<T> {
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
    } catch (error) {
      this.logger.error('Transaction failed, aborting', error);

      if (session.inTransaction()) {
        await session.abortTransaction();
        this.logger.debug('Transaction aborted');
      }

      throw error;
    } finally {
      await session.endSession();
      this.logger.debug('Transaction session ended');
    }
  }

  /**
   * Execute a function within a transaction with automatic retry
   *
   * Retries the transaction on transient errors (e.g., write conflicts)
   *
   * @param callback - Function to execute within transaction
   * @param options - Transaction options
   * @param maxRetries - Maximum number of retry attempts (default: 3)
   * @returns Result of callback
   */
  async executeWithRetry<T>(
    callback: TransactionCallback<T>,
    options: TransactionOptions = {},
    maxRetries = 3,
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.execute(callback, options);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Check if error is retryable
        const isRetryable = this.isRetryableError(lastError);

        if (!isRetryable || attempt === maxRetries) {
          this.logger.error(
            `Transaction failed after ${attempt} attempt(s)`,
            lastError,
          );
          throw lastError;
        }

        this.logger.warn(
          `Transaction attempt ${attempt} failed with retryable error, retrying...`,
          lastError.message,
        );

        // Exponential backoff: 100ms, 200ms, 400ms
        await this.delay(100 * Math.pow(2, attempt - 1));
      }
    }

    throw lastError;
  }

  /**
   * Check if an error is retryable
   *
   * @param error - Error to check
   * @returns true if error is retryable
   */
  private isRetryableError(error: Error): boolean {
    const retryableErrorCodes = [
      112, // WriteConflict
      117, // TransactionTooLargeForCache
      251, // NoSuchTransaction
      262, // TransactionAborted
    ];

    const retryableLabels = ['TransientTransactionError', 'UnknownTransactionCommitResult'];

    // Check for MongoDB error codes
    const mongoError = error as any;
    if (mongoError.code && retryableErrorCodes.includes(mongoError.code)) {
      return true;
    }

    // Check for error labels
    if (mongoError.errorLabels) {
      return mongoError.errorLabels.some((label: string) =>
        retryableLabels.includes(label),
      );
    }

    return false;
  }

  /**
   * Delay execution
   *
   * @param ms - Milliseconds to delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Create a new session without starting a transaction
   *
   * Useful for operations that need a session but not a transaction
   *
   * @returns MongoDB client session
   */
  async createSession(): Promise<ClientSession> {
    return this.connection.startSession();
  }

  /**
   * Execute multiple operations in parallel within a single transaction
   *
   * @param callbacks - Array of functions to execute
   * @param options - Transaction options
   * @returns Array of results
   */
  async executeParallel<T>(
    callbacks: TransactionCallback<T>[],
    options: TransactionOptions = {},
  ): Promise<T[]> {
    return this.execute(async (session) => {
      return Promise.all(callbacks.map((callback) => callback(session)));
    }, options);
  }

  /**
   * Execute operations sequentially within a single transaction
   *
   * Useful when later operations depend on earlier ones
   *
   * @param callbacks - Array of functions to execute
   * @param options - Transaction options
   * @returns Array of results
   */
  async executeSequential<T>(
    callbacks: TransactionCallback<T>[],
    options: TransactionOptions = {},
  ): Promise<T[]> {
    return this.execute(async (session) => {
      const results: T[] = [];

      for (const callback of callbacks) {
        const result = await callback(session);
        results.push(result);
      }

      return results;
    }, options);
  }
}
