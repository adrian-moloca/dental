/**
 * Invoice Number Generator Service
 *
 * Generates unique sequential invoice numbers per series (clinic).
 * Uses Redis for atomic increment to ensure uniqueness across distributed instances.
 *
 * Format: INV-{SERIES}-{YEAR}-{SEQUENCE}
 * Example: INV-BUC01-2025-00123
 *
 * Business Rules:
 * - Invoice numbers must be unique within a tenant
 * - Numbers are sequential within each series
 * - Series typically corresponds to a clinic
 * - Year resets sequence at the start of each fiscal year (configurable)
 * - Supports Romanian fiscal requirements for invoice numbering
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { Invoice } from '../entities/invoice.entity';

interface TenantContext {
  tenantId: string;
  organizationId: string;
  clinicId: string;
}

interface InvoiceNumberResult {
  invoiceNumber: string;
  series: string;
  sequenceNumber: number;
  year: number;
}

@Injectable()
export class InvoiceNumberGeneratorService implements OnModuleInit {
  private readonly logger = new Logger(InvoiceNumberGeneratorService.name);
  private readonly PREFIX = 'INV';
  private readonly SEQUENCE_KEY_PREFIX = 'billing:invoice:sequence';
  private readonly SEQUENCE_PADDING = 5; // 00001 to 99999

  constructor(
    @InjectModel(Invoice.name)
    private invoiceModel: Model<Invoice>,
    @InjectRedis()
    private readonly redis: Redis,
  ) {}

  /**
   * Initialize Redis sequences from database on module startup
   * This ensures we don't reuse numbers after a restart
   */
  async onModuleInit(): Promise<void> {
    this.logger.log('Initializing invoice number generator...');
    // Sequences are initialized on-demand per series
  }

  /**
   * Generate the next invoice number for a given series
   *
   * @param series - The invoice series (typically clinic code)
   * @param context - Tenant context for isolation
   * @returns Invoice number details including the formatted number and sequence
   */
  async generateNextNumber(series: string, context: TenantContext): Promise<InvoiceNumberResult> {
    const year = new Date().getFullYear();
    const redisKey = this.buildRedisKey(context.tenantId, series, year);

    // Try to get and increment atomically from Redis
    let sequenceNumber = await this.incrementRedisSequence(redisKey);

    // If this is the first invoice for this series/year, initialize from database
    if (sequenceNumber === 1) {
      const dbMaxSequence = await this.getMaxSequenceFromDb(series, year, context);
      if (dbMaxSequence > 0) {
        // Database has existing invoices, sync Redis
        await this.redis.set(redisKey, dbMaxSequence.toString());
        sequenceNumber = await this.incrementRedisSequence(redisKey);
      }
    }

    const invoiceNumber = this.formatInvoiceNumber(series, year, sequenceNumber);

    this.logger.log(
      `Generated invoice number: ${invoiceNumber} (series=${series}, year=${year}, seq=${sequenceNumber})`,
    );

    return {
      invoiceNumber,
      series,
      sequenceNumber,
      year,
    };
  }

  /**
   * Generate invoice number using clinic code as series
   *
   * @param clinicCode - Clinic code to use as series
   * @param context - Tenant context
   * @returns Invoice number details
   */
  async generateFromClinic(
    clinicCode: string,
    context: TenantContext,
  ): Promise<InvoiceNumberResult> {
    const series = this.sanitizeSeries(clinicCode);
    return this.generateNextNumber(series, context);
  }

  /**
   * Generate invoice number using clinic ID to lookup series
   * Falls back to a default series if clinic config not found
   *
   * @param context - Tenant context (includes clinicId)
   * @returns Invoice number details
   */
  async generateForContext(context: TenantContext): Promise<InvoiceNumberResult> {
    // Default series based on clinic ID (first 6 chars)
    const defaultSeries = context.clinicId.substring(0, 6).toUpperCase();
    return this.generateNextNumber(defaultSeries, context);
  }

  /**
   * Reserve a range of invoice numbers for batch operations
   * Useful for importing historical invoices or batch invoice generation
   *
   * @param series - Invoice series
   * @param count - Number of invoice numbers to reserve
   * @param context - Tenant context
   * @returns Array of reserved invoice number details
   */
  async reserveRange(
    series: string,
    count: number,
    context: TenantContext,
  ): Promise<InvoiceNumberResult[]> {
    if (count <= 0 || count > 1000) {
      throw new Error('Count must be between 1 and 1000');
    }

    const year = new Date().getFullYear();
    const redisKey = this.buildRedisKey(context.tenantId, series, year);

    // Atomically increment by count and get the end value
    const endSequence = await this.redis.incrby(redisKey, count);
    const startSequence = endSequence - count + 1;

    const results: InvoiceNumberResult[] = [];
    for (let seq = startSequence; seq <= endSequence; seq++) {
      results.push({
        invoiceNumber: this.formatInvoiceNumber(series, year, seq),
        series,
        sequenceNumber: seq,
        year,
      });
    }

    this.logger.log(
      `Reserved ${count} invoice numbers: ${results[0].invoiceNumber} to ${results[results.length - 1].invoiceNumber}`,
    );

    return results;
  }

  /**
   * Get the current sequence number for a series without incrementing
   *
   * @param series - Invoice series
   * @param context - Tenant context
   * @returns Current sequence number or 0 if none exists
   */
  async getCurrentSequence(series: string, context: TenantContext): Promise<number> {
    const year = new Date().getFullYear();
    const redisKey = this.buildRedisKey(context.tenantId, series, year);

    const value = await this.redis.get(redisKey);
    if (value) {
      return parseInt(value, 10);
    }

    // Fall back to database
    return this.getMaxSequenceFromDb(series, year, context);
  }

  /**
   * Validate that an invoice number follows the expected format
   *
   * @param invoiceNumber - Invoice number to validate
   * @returns True if valid format
   */
  validateFormat(invoiceNumber: string): boolean {
    const pattern = /^INV-[A-Z0-9]+-\d{4}-\d{5}$/;
    return pattern.test(invoiceNumber);
  }

  /**
   * Parse an invoice number into its components
   *
   * @param invoiceNumber - Invoice number to parse
   * @returns Parsed components or null if invalid
   */
  parseInvoiceNumber(
    invoiceNumber: string,
  ): { series: string; year: number; sequence: number } | null {
    const match = invoiceNumber.match(/^INV-([A-Z0-9]+)-(\d{4})-(\d{5})$/);
    if (!match) {
      return null;
    }

    return {
      series: match[1],
      year: parseInt(match[2], 10),
      sequence: parseInt(match[3], 10),
    };
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  /**
   * Build Redis key for sequence storage
   */
  private buildRedisKey(tenantId: string, series: string, year: number): string {
    return `${this.SEQUENCE_KEY_PREFIX}:${tenantId}:${series}:${year}`;
  }

  /**
   * Atomically increment Redis sequence
   */
  private async incrementRedisSequence(key: string): Promise<number> {
    const newValue = await this.redis.incr(key);
    // Set TTL of 2 years to auto-cleanup old sequences
    await this.redis.expire(key, 63072000); // 2 years in seconds
    return newValue;
  }

  /**
   * Get max sequence number from database for recovery
   */
  private async getMaxSequenceFromDb(
    series: string,
    year: number,
    context: TenantContext,
  ): Promise<number> {
    const pattern = `${this.PREFIX}-${series}-${year}-`;
    const lastInvoice = await this.invoiceModel
      .findOne({
        tenantId: context.tenantId,
        invoiceNumber: new RegExp(`^${pattern}`),
      })
      .sort({ sequenceNumber: -1 })
      .select('sequenceNumber')
      .lean();

    return lastInvoice?.sequenceNumber || 0;
  }

  /**
   * Format invoice number from components
   */
  private formatInvoiceNumber(series: string, year: number, sequence: number): string {
    const paddedSequence = sequence.toString().padStart(this.SEQUENCE_PADDING, '0');
    return `${this.PREFIX}-${series}-${year}-${paddedSequence}`;
  }

  /**
   * Sanitize series string for use in invoice numbers
   */
  private sanitizeSeries(input: string): string {
    return input
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 10);
  }
}
