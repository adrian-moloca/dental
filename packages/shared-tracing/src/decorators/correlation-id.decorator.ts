/**
 * NestJS Parameter Decorators for Correlation Context
 *
 * Provides convenient decorators to inject correlation metadata
 * into controller methods and event handlers.
 *
 * @module shared-tracing/decorators
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getCorrelationContext, getCorrelationId, getCausationId } from '../correlation-id';

/**
 * Decorator to inject correlation ID into controller methods
 *
 * Usage:
 * ```typescript
 * @Get('/patients/:id')
 * async getPatient(
 *   @Param('id') id: string,
 *   @CorrelationId() correlationId: string
 * ) {
 *   this.logger.info('Fetching patient', { correlationId, patientId: id });
 *   // ...
 * }
 * ```
 */
export const CorrelationId = createParamDecorator(
  (_data: unknown, _ctx: ExecutionContext): string | undefined => {
    return getCorrelationId();
  }
);

/**
 * Decorator to inject causation ID into controller methods
 *
 * Usage:
 * ```typescript
 * @Post('/procedures/:id/complete')
 * async completeProcedure(
 *   @Param('id') id: string,
 *   @CausationId() causationId: string
 * ) {
 *   // Use causation ID to link to the event that triggered this
 * }
 * ```
 */
export const CausationId = createParamDecorator(
  (_data: unknown, _ctx: ExecutionContext): string | undefined => {
    return getCausationId();
  }
);

/**
 * Decorator to inject full correlation context
 *
 * Usage:
 * ```typescript
 * @Post('/invoices')
 * async createInvoice(
 *   @Body() data: CreateInvoiceDto,
 *   @CorrelationContextParam() context: CorrelationContext
 * ) {
 *   this.logger.info('Creating invoice', {
 *     correlationId: context.correlationId,
 *     source: context.source,
 *   });
 * }
 * ```
 */
export const CorrelationContextParam = createParamDecorator(
  (_data: unknown, _ctx: ExecutionContext) => {
    return getCorrelationContext();
  }
);
