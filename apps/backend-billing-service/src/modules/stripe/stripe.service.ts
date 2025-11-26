import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Stripe from 'stripe';
import { StripeConfigType } from './config/stripe.config';
import {
  TenantContext,
  CreatePaymentIntentInput,
  PaymentIntentResult,
  RefundInput,
  RefundResult,
  StripeCustomerInput,
  StripeCustomerResult,
  SetupIntentInput,
  SetupIntentResult,
  PaymentMethodResult,
  StripeWebhookPayload,
} from './interfaces/stripe.interface';

@Injectable()
export class StripeService implements OnModuleInit {
  private readonly logger = new Logger(StripeService.name);
  private stripe!: Stripe;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit(): Promise<void> {
    const config = this.getConfig();

    this.stripe = new Stripe(config.secretKey, {
      apiVersion: '2024-11-20.acacia' as Stripe.LatestApiVersion,
      maxNetworkRetries: config.maxRetries,
      typescript: true,
    });

    this.logger.log('Stripe service initialized');
  }

  private getConfig(): StripeConfigType {
    return this.configService.get<StripeConfigType>('stripe')!;
  }

  /**
   * Create a Payment Intent for an invoice payment
   */
  async createPaymentIntent(
    input: CreatePaymentIntentInput,
    context: TenantContext,
  ): Promise<PaymentIntentResult> {
    const config = this.getConfig();

    this.logger.log(
      `Creating payment intent for invoice ${input.invoiceId}, amount: ${input.amount}`,
    );

    const params: Stripe.PaymentIntentCreateParams = {
      amount: input.amount,
      currency: (input.currency || config.currency).toLowerCase(),
      payment_method_types: config.paymentMethodTypes,
      capture_method: config.captureMethod,
      statement_descriptor: config.statementDescriptor,
      metadata: {
        invoiceId: input.invoiceId,
        patientId: input.patientId,
        tenantId: context.tenantId,
        organizationId: context.organizationId,
        clinicId: context.clinicId,
        ...(input.metadata || {}),
      },
    };

    if (input.patientEmail) {
      params.receipt_email = input.patientEmail;
    }

    const options: Stripe.RequestOptions = {};
    if (input.idempotencyKey) {
      options.idempotencyKey = input.idempotencyKey;
    }

    const paymentIntent = await this.stripe.paymentIntents.create(params, options);

    this.logger.log(`Payment intent created: ${paymentIntent.id}`);

    this.eventEmitter.emit('stripe.payment_intent.created', {
      paymentIntentId: paymentIntent.id,
      invoiceId: input.invoiceId,
      patientId: input.patientId,
      amount: input.amount,
      ...context,
    });

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret!,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    };
  }

  /**
   * Retrieve a Payment Intent by ID
   */
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  /**
   * Confirm a Payment Intent (server-side confirmation)
   */
  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId?: string,
  ): Promise<PaymentIntentResult> {
    const params: Stripe.PaymentIntentConfirmParams = {};

    if (paymentMethodId) {
      params.payment_method = paymentMethodId;
    }

    const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, params);

    this.logger.log(
      `Payment intent confirmed: ${paymentIntentId}, status: ${paymentIntent.status}`,
    );

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret!,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    };
  }

  /**
   * Cancel a Payment Intent
   */
  async cancelPaymentIntent(paymentIntentId: string): Promise<PaymentIntentResult> {
    const paymentIntent = await this.stripe.paymentIntents.cancel(paymentIntentId);

    this.logger.log(`Payment intent cancelled: ${paymentIntentId}`);

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret || '',
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    };
  }

  /**
   * Capture a Payment Intent (for manual capture mode)
   */
  async capturePaymentIntent(
    paymentIntentId: string,
    amountToCapture?: number,
  ): Promise<PaymentIntentResult> {
    const params: Stripe.PaymentIntentCaptureParams = {};

    if (amountToCapture !== undefined) {
      params.amount_to_capture = amountToCapture;
    }

    const paymentIntent = await this.stripe.paymentIntents.capture(paymentIntentId, params);

    this.logger.log(`Payment intent captured: ${paymentIntentId}`);

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret || '',
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    };
  }

  /**
   * Create a refund
   */
  async createRefund(input: RefundInput, context: TenantContext): Promise<RefundResult> {
    this.logger.log(`Creating refund for payment intent ${input.paymentIntentId}`);

    const params: Stripe.RefundCreateParams = {
      payment_intent: input.paymentIntentId,
      metadata: {
        tenantId: context.tenantId,
        organizationId: context.organizationId,
        clinicId: context.clinicId,
        refundedBy: context.userId || 'system',
        ...(input.metadata || {}),
      },
    };

    if (input.amount !== undefined) {
      params.amount = input.amount;
    }

    if (input.reason) {
      params.reason = input.reason;
    }

    const refund = await this.stripe.refunds.create(params);

    this.logger.log(`Refund created: ${refund.id}`);

    this.eventEmitter.emit('stripe.refund.created', {
      refundId: refund.id,
      paymentIntentId: input.paymentIntentId,
      amount: refund.amount,
      ...context,
    });

    return {
      refundId: refund.id,
      status: refund.status!,
      amount: refund.amount,
      currency: refund.currency,
    };
  }

  /**
   * Retrieve a refund
   */
  async getRefund(refundId: string): Promise<Stripe.Refund> {
    return this.stripe.refunds.retrieve(refundId);
  }

  /**
   * Create or retrieve a Stripe Customer
   */
  async createOrGetCustomer(
    input: StripeCustomerInput,
    context: TenantContext,
  ): Promise<StripeCustomerResult> {
    // First, try to find existing customer
    const existingCustomers = await this.stripe.customers.list({
      email: input.email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      const existing = existingCustomers.data[0];
      this.logger.debug(`Found existing Stripe customer: ${existing.id}`);
      return {
        customerId: existing.id,
        email: existing.email!,
      };
    }

    // Create new customer
    const customer = await this.stripe.customers.create({
      email: input.email,
      name: input.name,
      phone: input.phone,
      metadata: {
        tenantId: context.tenantId,
        organizationId: context.organizationId,
        ...(input.metadata || {}),
      },
    });

    this.logger.log(`Created Stripe customer: ${customer.id}`);

    return {
      customerId: customer.id,
      email: customer.email!,
    };
  }

  /**
   * Create a Setup Intent for saving payment methods
   */
  async createSetupIntent(
    input: SetupIntentInput,
    context: TenantContext,
  ): Promise<SetupIntentResult> {
    const setupIntent = await this.stripe.setupIntents.create({
      customer: input.customerId,
      payment_method_types: ['card'],
      metadata: {
        tenantId: context.tenantId,
        organizationId: context.organizationId,
        clinicId: context.clinicId,
        ...(input.metadata || {}),
      },
    });

    this.logger.log(`Created setup intent: ${setupIntent.id}`);

    return {
      setupIntentId: setupIntent.id,
      clientSecret: setupIntent.client_secret!,
      status: setupIntent.status,
    };
  }

  /**
   * List saved payment methods for a customer
   */
  async listPaymentMethods(customerId: string): Promise<PaymentMethodResult[]> {
    const paymentMethods = await this.stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return paymentMethods.data.map((pm) => ({
      paymentMethodId: pm.id,
      type: pm.type,
      card: pm.card
        ? {
            brand: pm.card.brand,
            last4: pm.card.last4,
            expMonth: pm.card.exp_month,
            expYear: pm.card.exp_year,
          }
        : undefined,
    }));
  }

  /**
   * Detach a payment method from a customer
   */
  async detachPaymentMethod(paymentMethodId: string): Promise<void> {
    await this.stripe.paymentMethods.detach(paymentMethodId);
    this.logger.log(`Detached payment method: ${paymentMethodId}`);
  }

  /**
   * Verify webhook signature and construct event
   */
  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    const config = this.getConfig();
    return this.stripe.webhooks.constructEvent(payload, signature, config.webhookSecret);
  }

  /**
   * Process webhook event and emit internal events
   */
  async processWebhookEvent(event: Stripe.Event): Promise<StripeWebhookPayload> {
    this.logger.log(`Processing webhook event: ${event.type}`);

    const data = event.data.object as Stripe.PaymentIntent | Stripe.Charge | Stripe.Refund;

    let payload: StripeWebhookPayload = {
      status: 'status' in data ? data.status || 'unknown' : 'unknown',
    };

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = data as Stripe.PaymentIntent;
        payload = {
          paymentIntentId: pi.id,
          status: pi.status,
          amount: pi.amount,
          invoiceId: pi.metadata?.invoiceId,
          patientId: pi.metadata?.patientId,
          tenantId: pi.metadata?.tenantId,
          organizationId: pi.metadata?.organizationId,
          clinicId: pi.metadata?.clinicId,
        };
        this.eventEmitter.emit('stripe.payment.succeeded', payload);
        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = data as Stripe.PaymentIntent;
        const lastError = pi.last_payment_error;
        payload = {
          paymentIntentId: pi.id,
          status: pi.status,
          amount: pi.amount,
          invoiceId: pi.metadata?.invoiceId,
          patientId: pi.metadata?.patientId,
          tenantId: pi.metadata?.tenantId,
          organizationId: pi.metadata?.organizationId,
          clinicId: pi.metadata?.clinicId,
          failureCode: lastError?.code,
          failureMessage: lastError?.message,
        };
        this.eventEmitter.emit('stripe.payment.failed', payload);
        break;
      }

      case 'charge.refunded': {
        const charge = data as Stripe.Charge;
        payload = {
          chargeId: charge.id,
          paymentIntentId:
            typeof charge.payment_intent === 'string'
              ? charge.payment_intent
              : charge.payment_intent?.id,
          status: charge.status,
          amount: charge.amount_refunded,
          invoiceId: charge.metadata?.invoiceId,
          patientId: charge.metadata?.patientId,
          tenantId: charge.metadata?.tenantId,
          organizationId: charge.metadata?.organizationId,
          clinicId: charge.metadata?.clinicId,
        };
        this.eventEmitter.emit('stripe.charge.refunded', payload);
        break;
      }

      case 'charge.dispute.created': {
        const charge = data as Stripe.Charge;
        payload = {
          chargeId: charge.id,
          paymentIntentId:
            typeof charge.payment_intent === 'string'
              ? charge.payment_intent
              : charge.payment_intent?.id,
          status: 'disputed',
          amount: charge.amount,
          invoiceId: charge.metadata?.invoiceId,
          patientId: charge.metadata?.patientId,
          tenantId: charge.metadata?.tenantId,
          organizationId: charge.metadata?.organizationId,
          clinicId: charge.metadata?.clinicId,
        };
        this.eventEmitter.emit('stripe.dispute.created', payload);
        break;
      }

      default:
        this.logger.debug(`Unhandled webhook event type: ${event.type}`);
    }

    return payload;
  }

  /**
   * Get balance for a Stripe account
   */
  async getBalance(): Promise<Stripe.Balance> {
    return this.stripe.balance.retrieve();
  }

  /**
   * Get Stripe dashboard link for a payment intent
   */
  getPaymentDashboardUrl(paymentIntentId: string): string {
    const config = this.getConfig();
    const isTest = config.secretKey.startsWith('sk_test_');
    const baseUrl = isTest ? 'https://dashboard.stripe.com/test' : 'https://dashboard.stripe.com';
    return `${baseUrl}/payments/${paymentIntentId}`;
  }
}
