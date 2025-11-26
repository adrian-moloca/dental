import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Headers,
  Req,
  Res,
  HttpStatus,
  Logger,
  BadRequestException,
  RawBodyRequest,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import {
  CreatePaymentIntentDto,
  ConfirmPaymentDto,
  CreateRefundDto,
  CreateCustomerDto,
  CreateSetupIntentDto,
  PaymentIntentResponseDto,
  RefundResponseDto,
  CustomerResponseDto,
  SetupIntentResponseDto,
  PaymentMethodResponseDto,
} from './dto/stripe.dto';
import { TenantContext } from './interfaces/stripe.interface';

function getTenantContext(req: Request): TenantContext {
  const user = (req as Request & { user?: Record<string, string> }).user;
  return {
    tenantId: user?.tenantId || 'default-tenant',
    organizationId: user?.organizationId || 'default-org',
    clinicId: user?.clinicId || 'default-clinic',
    userId: user?.userId,
  };
}

@ApiTags('Stripe Payments')
@ApiBearerAuth()
@Controller('stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(private readonly stripeService: StripeService) {}

  /**
   * Create a Payment Intent for invoice payment
   */
  @Post('payment-intents')
  @ApiOperation({
    summary: 'Create a payment intent',
    description: 'Creates a Stripe Payment Intent for collecting payment on an invoice',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment intent created',
    type: PaymentIntentResponseDto,
  })
  async createPaymentIntent(
    @Body() dto: CreatePaymentIntentDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PaymentIntentResponseDto> {
    const context = getTenantContext(req);

    this.logger.log(`Creating payment intent for invoice ${dto.invoiceId}`);

    const result = await this.stripeService.createPaymentIntent(
      {
        invoiceId: dto.invoiceId,
        amount: dto.amount,
        currency: dto.currency,
        patientId: dto.patientId,
        patientEmail: dto.patientEmail,
        patientName: dto.patientName,
        metadata: dto.metadata,
        idempotencyKey: dto.idempotencyKey,
      },
      context,
    );

    res.status(HttpStatus.CREATED);

    return {
      paymentIntentId: result.paymentIntentId,
      clientSecret: result.clientSecret,
      status: result.status,
      amount: result.amount,
      currency: result.currency,
    };
  }

  /**
   * Retrieve a Payment Intent
   */
  @Get('payment-intents/:paymentIntentId')
  @ApiOperation({
    summary: 'Get payment intent details',
    description: 'Retrieves the current status and details of a Payment Intent',
  })
  @ApiParam({ name: 'paymentIntentId', description: 'Stripe Payment Intent ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment intent details',
    type: PaymentIntentResponseDto,
  })
  async getPaymentIntent(
    @Param('paymentIntentId') paymentIntentId: string,
  ): Promise<PaymentIntentResponseDto> {
    const paymentIntent = await this.stripeService.getPaymentIntent(paymentIntentId);

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret || '',
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    };
  }

  /**
   * Confirm a Payment Intent (server-side)
   */
  @Post('payment-intents/:paymentIntentId/confirm')
  @ApiOperation({
    summary: 'Confirm a payment intent',
    description: 'Server-side confirmation of a Payment Intent (alternative to client-side)',
  })
  @ApiParam({ name: 'paymentIntentId', description: 'Stripe Payment Intent ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment intent confirmed',
    type: PaymentIntentResponseDto,
  })
  async confirmPaymentIntent(
    @Param('paymentIntentId') paymentIntentId: string,
    @Body() dto: ConfirmPaymentDto,
  ): Promise<PaymentIntentResponseDto> {
    const result = await this.stripeService.confirmPaymentIntent(
      paymentIntentId,
      dto.paymentMethodId,
    );

    return {
      paymentIntentId: result.paymentIntentId,
      clientSecret: result.clientSecret,
      status: result.status,
      amount: result.amount,
      currency: result.currency,
    };
  }

  /**
   * Cancel a Payment Intent
   */
  @Post('payment-intents/:paymentIntentId/cancel')
  @ApiOperation({
    summary: 'Cancel a payment intent',
    description: 'Cancels an uncaptured Payment Intent',
  })
  @ApiParam({ name: 'paymentIntentId', description: 'Stripe Payment Intent ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment intent cancelled',
    type: PaymentIntentResponseDto,
  })
  async cancelPaymentIntent(
    @Param('paymentIntentId') paymentIntentId: string,
  ): Promise<PaymentIntentResponseDto> {
    const result = await this.stripeService.cancelPaymentIntent(paymentIntentId);

    return {
      paymentIntentId: result.paymentIntentId,
      clientSecret: result.clientSecret,
      status: result.status,
      amount: result.amount,
      currency: result.currency,
    };
  }

  /**
   * Capture a Payment Intent (for manual capture mode)
   */
  @Post('payment-intents/:paymentIntentId/capture')
  @ApiOperation({
    summary: 'Capture a payment intent',
    description: 'Captures an authorized Payment Intent (for manual capture mode)',
  })
  @ApiParam({ name: 'paymentIntentId', description: 'Stripe Payment Intent ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment intent captured',
    type: PaymentIntentResponseDto,
  })
  async capturePaymentIntent(
    @Param('paymentIntentId') paymentIntentId: string,
    @Body() body: { amount?: number },
  ): Promise<PaymentIntentResponseDto> {
    const result = await this.stripeService.capturePaymentIntent(paymentIntentId, body.amount);

    return {
      paymentIntentId: result.paymentIntentId,
      clientSecret: result.clientSecret,
      status: result.status,
      amount: result.amount,
      currency: result.currency,
    };
  }

  /**
   * Create a refund
   */
  @Post('refunds')
  @ApiOperation({
    summary: 'Create a refund',
    description: 'Creates a refund for a successful payment',
  })
  @ApiResponse({
    status: 201,
    description: 'Refund created',
    type: RefundResponseDto,
  })
  async createRefund(
    @Body() dto: CreateRefundDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RefundResponseDto> {
    const context = getTenantContext(req);

    this.logger.log(`Creating refund for payment intent ${dto.paymentIntentId}`);

    const result = await this.stripeService.createRefund(
      {
        paymentIntentId: dto.paymentIntentId,
        amount: dto.amount,
        reason: dto.reason,
        metadata: dto.internalReason ? { internalReason: dto.internalReason } : undefined,
      },
      context,
    );

    res.status(HttpStatus.CREATED);

    return {
      refundId: result.refundId,
      status: result.status,
      amount: result.amount,
      currency: result.currency,
    };
  }

  /**
   * Create or retrieve a Stripe Customer
   */
  @Post('customers')
  @ApiOperation({
    summary: 'Create or get customer',
    description: 'Creates a new Stripe customer or retrieves existing by email',
  })
  @ApiResponse({
    status: 201,
    description: 'Customer created or retrieved',
    type: CustomerResponseDto,
  })
  async createCustomer(
    @Body() dto: CreateCustomerDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CustomerResponseDto> {
    const context = getTenantContext(req);

    const result = await this.stripeService.createOrGetCustomer(
      {
        email: dto.email,
        name: dto.name,
        phone: dto.phone,
        metadata: { patientId: dto.patientId },
      },
      context,
    );

    res.status(HttpStatus.CREATED);

    return {
      customerId: result.customerId,
      email: result.email,
    };
  }

  /**
   * Create a Setup Intent for saving payment methods
   */
  @Post('setup-intents')
  @ApiOperation({
    summary: 'Create a setup intent',
    description: 'Creates a Setup Intent for saving a payment method without charging',
  })
  @ApiResponse({
    status: 201,
    description: 'Setup intent created',
    type: SetupIntentResponseDto,
  })
  async createSetupIntent(
    @Body() dto: CreateSetupIntentDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SetupIntentResponseDto> {
    const context = getTenantContext(req);

    const result = await this.stripeService.createSetupIntent(
      { customerId: dto.customerId },
      context,
    );

    res.status(HttpStatus.CREATED);

    return {
      setupIntentId: result.setupIntentId,
      clientSecret: result.clientSecret,
      status: result.status,
    };
  }

  /**
   * List saved payment methods for a customer
   */
  @Get('customers/:customerId/payment-methods')
  @ApiOperation({
    summary: 'List payment methods',
    description: 'Lists saved payment methods for a Stripe customer',
  })
  @ApiParam({ name: 'customerId', description: 'Stripe Customer ID' })
  @ApiResponse({
    status: 200,
    description: 'List of payment methods',
    type: [PaymentMethodResponseDto],
  })
  async listPaymentMethods(
    @Param('customerId') customerId: string,
  ): Promise<PaymentMethodResponseDto[]> {
    return this.stripeService.listPaymentMethods(customerId);
  }

  /**
   * Detach a payment method
   */
  @Post('payment-methods/:paymentMethodId/detach')
  @ApiOperation({
    summary: 'Detach payment method',
    description: 'Removes a saved payment method from a customer',
  })
  @ApiParam({ name: 'paymentMethodId', description: 'Stripe Payment Method ID' })
  @ApiResponse({ status: 200, description: 'Payment method detached' })
  async detachPaymentMethod(
    @Param('paymentMethodId') paymentMethodId: string,
  ): Promise<{ success: boolean }> {
    await this.stripeService.detachPaymentMethod(paymentMethodId);
    return { success: true };
  }

  /**
   * Webhook endpoint for Stripe events
   */
  @Post('webhook')
  @ApiOperation({
    summary: 'Stripe webhook',
    description: 'Receives webhook events from Stripe',
  })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
  ): Promise<void> {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Missing raw body');
    }

    try {
      const event = this.stripeService.constructWebhookEvent(rawBody, signature);

      this.logger.log(`Received Stripe webhook: ${event.type}`);

      await this.stripeService.processWebhookEvent(event);

      res.status(HttpStatus.OK).json({ received: true });
    } catch (error) {
      this.logger.error(`Webhook error: ${(error as Error).message}`);
      throw new BadRequestException(`Webhook Error: ${(error as Error).message}`);
    }
  }
}
