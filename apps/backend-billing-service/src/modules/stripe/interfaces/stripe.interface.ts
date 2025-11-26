import Stripe from 'stripe';

export interface TenantContext {
  tenantId: string;
  organizationId: string;
  clinicId: string;
  userId?: string;
}

export interface CreatePaymentIntentInput {
  invoiceId: string;
  amount: number;
  currency?: string;
  patientId: string;
  patientEmail?: string;
  patientName?: string;
  metadata?: Record<string, string>;
  idempotencyKey?: string;
}

export interface PaymentIntentResult {
  paymentIntentId: string;
  clientSecret: string;
  status: Stripe.PaymentIntent.Status;
  amount: number;
  currency: string;
}

export interface ConfirmPaymentInput {
  paymentIntentId: string;
  paymentMethodId?: string;
}

export interface RefundInput {
  paymentIntentId: string;
  amount?: number;
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
  metadata?: Record<string, string>;
}

export interface RefundResult {
  refundId: string;
  status: string;
  amount: number;
  currency: string;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: {
    object: Stripe.PaymentIntent | Stripe.Refund | Stripe.Charge;
  };
}

export interface StripeCustomerInput {
  email: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, string>;
}

export interface StripeCustomerResult {
  customerId: string;
  email: string;
}

export interface SetupIntentInput {
  customerId: string;
  metadata?: Record<string, string>;
}

export interface SetupIntentResult {
  setupIntentId: string;
  clientSecret: string;
  status: Stripe.SetupIntent.Status;
}

export interface PaymentMethodResult {
  paymentMethodId: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
}

export interface StripeWebhookPayload {
  paymentIntentId?: string;
  chargeId?: string;
  refundId?: string;
  status: string;
  amount?: number;
  invoiceId?: string;
  patientId?: string;
  tenantId?: string;
  organizationId?: string;
  clinicId?: string;
  failureCode?: string;
  failureMessage?: string;
}
