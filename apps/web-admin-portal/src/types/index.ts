// Organization = a company registered in Romania (can have multiple cabinets)
export interface Organization {
  id: string;
  name: string;
  legalName: string;
  taxId: string; // CUI
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  status: 'active' | 'trial' | 'suspended' | 'inactive';
  createdAt: string;
  cabinetsCount: number;
  usersCount: number;
}

// Cabinet = a single dental clinic/location (connected to one subscription)
export interface Cabinet {
  id: string;
  organizationId: string;
  organizationName: string;
  name: string;
  code: string; // e.g., "BUC-001"
  address: string;
  city: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  subscriptionId: string | null;
  subscriptionPlan: string | null;
  usersCount: number;
  createdAt: string;
}

// Subscription = connects a cabinet to a plan
export interface Subscription {
  id: string;
  cabinetId: string;
  cabinetName: string;
  organizationId: string;
  organizationName: string;
  planId: string;
  planName: string;
  status: 'active' | 'trial' | 'past_due' | 'cancelled' | 'suspended';
  startDate: string;
  endDate: string | null;
  trialEndsAt: string | null;
  monthlyPrice: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  autoRenew: boolean;
}

// Plan = a combination of modules with a price, defined by admin
export interface Plan {
  id: string;
  name: string;
  code: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  isActive: boolean;
  isDefault: boolean;
  trialDays: number;
  features: string[];
  includedModules: string[]; // Module IDs
  maxUsers: number | null;
  maxCabinets: number | null;
  subscribersCount: number;
  createdAt: string;
}

// Module = a big feature like notifications, inventory, AI, etc.
export interface Module {
  id: string;
  code: string;
  name: string;
  description: string;
  category: 'core' | 'clinical' | 'management' | 'marketing' | 'ai' | 'integration';
  isCore: boolean; // Core modules are always included
  basePrice: number;
  currency: string;
  icon: string;
  color: string;
  status: 'active' | 'inactive' | 'coming_soon';
  functionalities: ModuleFunctionality[];
  benefits: string[];
  plansCount: number;
}

// Functionality = specific feature within a module
export interface ModuleFunctionality {
  id: string;
  name: string;
  description: string;
  isIncluded: boolean;
  isPremium: boolean;
}

// User types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT' | 'CLINIC_ADMIN' | 'PROVIDER' | 'STAFF';
  status: 'active' | 'suspended' | 'pending' | 'inactive';
  organizationId: string | null;
  organizationName: string | null;
  cabinetId: string | null;
  cabinetName: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

// Filter types
export interface FilterState {
  organizationId: string | null;
  cabinetId: string | null;
  status: string | null;
  search: string;
}

// Status type helpers
export type OrganizationStatus = Organization['status'];
export type CabinetStatus = Cabinet['status'];
export type SubscriptionStatus = Subscription['status'];
export type PlanStatus = 'active' | 'inactive';
export type ModuleStatus = Module['status'];
export type ModuleCategory = Module['category'];
export type UserRole = User['role'];
export type UserStatus = User['status'];
export type BillingCycle = Subscription['billingCycle'];

// Utility types for forms and API responses
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Summary/Stats types for dashboard
export interface DashboardStats {
  totalOrganizations: number;
  activeOrganizations: number;
  totalCabinets: number;
  activeCabinets: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  trialConversions: number;
  churnRate: number;
}

export interface RevenueByPlan {
  planId: string;
  planName: string;
  revenue: number;
  subscribersCount: number;
  percentage: number;
}

export interface SubscriptionTrend {
  date: string;
  newSubscriptions: number;
  cancelledSubscriptions: number;
  netGrowth: number;
}
