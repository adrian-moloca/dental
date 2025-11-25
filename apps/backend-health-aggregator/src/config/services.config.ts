/**
 * Service Registry Configuration
 *
 * Defines all microservices in the DentalOS ecosystem for health monitoring.
 * Each service includes its health endpoint URL and criticality level.
 *
 * Critical services: Services whose failure blocks core business operations
 * Non-critical services: Services that can temporarily be down without major impact
 *
 * @module config/services
 */

export interface ServiceDefinition {
  /**
   * Service identifier (unique name)
   */
  name: string;

  /**
   * Display name for dashboards
   */
  displayName: string;

  /**
   * Health check endpoint URL
   */
  url: string;

  /**
   * Whether this service is critical for business operations
   * Critical services trigger immediate alerts when down
   */
  critical: boolean;

  /**
   * Service category for grouping in dashboards
   */
  category: 'backend' | 'frontend' | 'gateway' | 'infrastructure';

  /**
   * Expected port number
   */
  port: number;

  /**
   * Description of service purpose
   */
  description: string;

  /**
   * Health check timeout in milliseconds
   */
  timeout?: number;
}

/**
 * Complete service registry for DentalOS platform
 *
 * Services are organized by category:
 * - Backend: Core business logic microservices
 * - Frontend: Web applications
 * - Gateway: API gateways and proxies
 * - Infrastructure: Supporting services
 */
export const SERVICE_REGISTRY: ServiceDefinition[] = [
  // Core Backend Services (Critical)
  {
    name: 'auth',
    displayName: 'Authentication Service',
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:3301/health/detailed',
    critical: true,
    category: 'backend',
    port: 3301,
    description: 'User authentication, JWT tokens, role management',
    timeout: 5000,
  },
  {
    name: 'subscription',
    displayName: 'Subscription Service',
    url: process.env.SUBSCRIPTION_SERVICE_URL || 'http://localhost:3311/health/detailed',
    critical: true,
    category: 'backend',
    port: 3311,
    description: 'Subscription plans, billing cycles, cabinet management',
    timeout: 5000,
  },
  {
    name: 'billing',
    displayName: 'Billing Service',
    url: process.env.BILLING_SERVICE_URL || 'http://localhost:3310/health/detailed',
    critical: true,
    category: 'backend',
    port: 3310,
    description: 'Payment processing, invoices, financial transactions',
    timeout: 5000,
  },
  {
    name: 'patient',
    displayName: 'Patient Service',
    url: process.env.PATIENT_SERVICE_URL || 'http://localhost:3004/health/detailed',
    critical: true,
    category: 'backend',
    port: 3004,
    description: 'Patient records, demographics, medical history',
    timeout: 5000,
  },

  // Clinical & Operational Services
  {
    name: 'clinical',
    displayName: 'Clinical Service',
    url: process.env.CLINICAL_SERVICE_URL || 'http://localhost:3305/health/detailed',
    critical: false,
    category: 'backend',
    port: 3305,
    description: 'Clinical notes, treatment plans, diagnoses',
    timeout: 5000,
  },
  {
    name: 'scheduling',
    displayName: 'Scheduling Service',
    url: process.env.SCHEDULING_SERVICE_URL || 'http://localhost:3302/health/detailed',
    critical: false,
    category: 'backend',
    port: 3302,
    description: 'Appointment scheduling, calendar management',
    timeout: 5000,
  },
  {
    name: 'inventory',
    displayName: 'Inventory Service',
    url: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3308/health/detailed',
    critical: false,
    category: 'backend',
    port: 3308,
    description: 'Inventory tracking, supply management, stock levels',
    timeout: 5000,
  },
  {
    name: 'provider-schedule',
    displayName: 'Provider Schedule Service',
    url: process.env.PROVIDER_SCHEDULE_URL || 'http://localhost:3303/health/detailed',
    critical: false,
    category: 'backend',
    port: 3303,
    description: 'Provider availability, working hours, shift management',
    timeout: 5000,
  },

  // Enterprise & HR Services
  {
    name: 'enterprise',
    displayName: 'Enterprise Service',
    url: process.env.ENTERPRISE_SERVICE_URL || 'http://localhost:3317/health/detailed',
    critical: false,
    category: 'backend',
    port: 3317,
    description: 'Multi-location management, organizational hierarchy',
    timeout: 5000,
  },
  {
    name: 'hr-workforce',
    displayName: 'HR & Workforce Service',
    url: process.env.HR_WORKFORCE_URL || 'http://localhost:3013/health/detailed',
    critical: false,
    category: 'backend',
    port: 3013,
    description: 'Employee management, payroll, attendance tracking',
    timeout: 5000,
  },

  // Imaging & Diagnostics Services
  {
    name: 'imaging',
    displayName: 'Imaging Service',
    url: process.env.IMAGING_SERVICE_URL || 'http://localhost:3007/health/detailed',
    critical: false,
    category: 'backend',
    port: 3007,
    description: 'X-ray, CBCT, intraoral image storage and retrieval',
    timeout: 5000,
  },
  {
    name: 'imaging-gateway',
    displayName: 'Imaging Gateway',
    url: process.env.IMAGING_GATEWAY_URL || 'http://localhost:3008/health/detailed',
    critical: false,
    category: 'gateway',
    port: 3008,
    description: 'DICOM integration, imaging device connectivity',
    timeout: 5000,
  },

  // Communication & Marketing Services
  {
    name: 'marketing',
    displayName: 'Marketing Service',
    url: process.env.MARKETING_SERVICE_URL || 'http://localhost:3014/health/detailed',
    critical: false,
    category: 'backend',
    port: 3014,
    description: 'Email campaigns, SMS notifications, patient outreach',
    timeout: 5000,
  },
  {
    name: 'realtime',
    displayName: 'Real-time Service',
    url: process.env.REALTIME_SERVICE_URL || 'http://localhost:3015/health/detailed',
    critical: false,
    category: 'backend',
    port: 3015,
    description: 'WebSocket connections, live updates, notifications',
    timeout: 5000,
  },

  // Integration & Automation Services
  {
    name: 'integrations',
    displayName: 'Integrations Service',
    url: process.env.INTEGRATIONS_SERVICE_URL || 'http://localhost:3016/health/detailed',
    critical: false,
    category: 'backend',
    port: 3016,
    description: 'Third-party integrations, API connectors, webhooks',
    timeout: 5000,
  },
  {
    name: 'automation',
    displayName: 'Automation Service',
    url: process.env.AUTOMATION_SERVICE_URL || 'http://localhost:3017/health/detailed',
    critical: false,
    category: 'backend',
    port: 3017,
    description: 'Workflow automation, scheduled tasks, batch jobs',
    timeout: 5000,
  },

  // Supporting Services
  {
    name: 'ai-engine',
    displayName: 'AI Engine',
    url: process.env.AI_ENGINE_URL || 'http://localhost:3018/health/detailed',
    critical: false,
    category: 'backend',
    port: 3018,
    description: 'AI-powered diagnostics, predictive analytics, ML models',
    timeout: 10000,
  },
  {
    name: 'offline-sync',
    displayName: 'Offline Sync Service',
    url: process.env.OFFLINE_SYNC_URL || 'http://localhost:3019/health/detailed',
    critical: false,
    category: 'backend',
    port: 3019,
    description: 'Offline data synchronization, conflict resolution',
    timeout: 5000,
  },
  {
    name: 'sterilization',
    displayName: 'Sterilization Service',
    url: process.env.STERILIZATION_URL || 'http://localhost:3020/health/detailed',
    critical: false,
    category: 'backend',
    port: 3020,
    description: 'Sterilization tracking, compliance monitoring',
    timeout: 5000,
  },
  {
    name: 'update',
    displayName: 'Update Service',
    url: process.env.UPDATE_SERVICE_URL || 'http://localhost:3021/health/detailed',
    critical: false,
    category: 'backend',
    port: 3021,
    description: 'Software updates, version management, deployment',
    timeout: 5000,
  },

  // Gateway Services
  {
    name: 'patient-portal-gateway',
    displayName: 'Patient Portal Gateway',
    url: process.env.PATIENT_PORTAL_GATEWAY_URL || 'http://localhost:3022/health/detailed',
    critical: false,
    category: 'gateway',
    port: 3022,
    description: 'Patient-facing API gateway, authentication proxy',
    timeout: 5000,
  },

  // Frontend Services
  {
    name: 'web-clinic-portal',
    displayName: 'Web Clinic Portal',
    url: process.env.WEB_CLINIC_PORTAL_URL || 'http://localhost:4001/health',
    critical: false,
    category: 'frontend',
    port: 4001,
    description: 'Main clinic management web application',
    timeout: 5000,
  },
];

/**
 * Get service definition by name
 */
export function getServiceByName(name: string): ServiceDefinition | undefined {
  return SERVICE_REGISTRY.find((service) => service.name === name);
}

/**
 * Get all critical services
 */
export function getCriticalServices(): ServiceDefinition[] {
  return SERVICE_REGISTRY.filter((service) => service.critical);
}

/**
 * Get services by category
 */
export function getServicesByCategory(
  category: ServiceDefinition['category'],
): ServiceDefinition[] {
  return SERVICE_REGISTRY.filter((service) => service.category === category);
}

/**
 * Get total number of services
 */
export function getTotalServicesCount(): number {
  return SERVICE_REGISTRY.length;
}

/**
 * Service dependency map
 * Defines which services depend on which other services
 */
export const SERVICE_DEPENDENCIES: Record<string, string[]> = {
  auth: ['subscription'],
  billing: ['clinical', 'patient'],
  scheduling: ['patient', 'provider-schedule'],
  clinical: ['inventory', 'patient', 'imaging'],
  'imaging-gateway': ['imaging'],
  marketing: ['patient'],
  automation: ['patient', 'scheduling'],
  'patient-portal-gateway': ['auth', 'patient', 'scheduling'],
};

/**
 * Get dependencies for a service
 */
export function getServiceDependencies(serviceName: string): string[] {
  return SERVICE_DEPENDENCIES[serviceName] || [];
}
