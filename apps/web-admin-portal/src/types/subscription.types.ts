export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired';
export type BillingCycle = 'monthly' | 'yearly';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  features: string[];
  limits: {
    maxUsers: number;
    maxClinics: number;
    maxPatients: number;
    maxStorageGB: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  organizationId: string;
  organizationName: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  amount: number;
  currency: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  code: string;
  name: string;
  description: string;
  icon?: string;
  category: 'core' | 'clinical' | 'management' | 'marketing' | 'ai' | 'integration';
  isCore: boolean;
  basePrice: number;
  currency: string;
  isActive: boolean;
  dependencies?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationModule {
  organizationId: string;
  moduleId: string;
  moduleName: string;
  moduleCode: string;
  isEnabled: boolean;
  enabledAt?: string;
  expiresAt?: string;
}

export interface CreateSubscriptionDto {
  organizationId: string;
  planId: string;
  billingCycle: BillingCycle;
}

export interface UpdateSubscriptionDto {
  planId?: string;
  billingCycle?: BillingCycle;
  cancelAtPeriodEnd?: boolean;
}
