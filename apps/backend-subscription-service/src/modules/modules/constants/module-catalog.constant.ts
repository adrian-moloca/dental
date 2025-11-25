/**
 * Module Catalog Constants
 * Comprehensive catalog of all available modules in the DentalOS platform
 *
 * This catalog defines:
 * - Module codes, names, and descriptions
 * - Feature lists for each module
 * - Permission mappings
 * - Pricing configurations
 * - Module dependencies
 *
 * @module backend-subscription-service/modules/constants
 */

import {
  ModuleCode,
  ModuleType,
  type ModuleDependency,
  type ModulePricing,
} from '../entities/module.entity';

/**
 * Module definition interface for catalog
 */
export interface ModuleDefinition {
  code: ModuleCode;
  name: string;
  description: string;
  type: ModuleType;
  features: string[];
  permissions: string[];
  pricing: ModulePricing;
  dependencies: ModuleDependency[];
  displayOrder: number;
  category: string;
  icon?: string;
  marketingDescription?: string;
}

/**
 * Complete Module Catalog
 * All available modules in the DentalOS platform
 */
export const MODULE_CATALOG: ModuleDefinition[] = [
  // ============================================================================
  // CORE MODULES (Included in base subscription)
  // ============================================================================

  {
    code: ModuleCode.SCHEDULING,
    name: 'Appointment Scheduling',
    description: 'Complete appointment management with calendar, reminders, and waitlist',
    type: ModuleType.CORE,
    category: 'Operations',
    icon: 'calendar',
    displayOrder: 1,
    features: [
      'Multi-provider calendar view',
      'Drag-and-drop appointment scheduling',
      'Online patient booking portal',
      'Automated appointment reminders (SMS/Email)',
      'Waitlist management',
      'Recurring appointments',
      'Color-coded appointment types',
      'Appointment conflict detection',
      'No-show tracking',
      'Emergency appointment prioritization',
      'Appointment history and analytics',
      'Block scheduling for time off',
      'Treatment duration templates',
      'Custom appointment statuses',
    ],
    permissions: [
      'scheduling.appointment.create',
      'scheduling.appointment.read',
      'scheduling.appointment.update',
      'scheduling.appointment.delete',
      'scheduling.appointment.confirm',
      'scheduling.appointment.cancel',
      'scheduling.appointment.reschedule',
      'scheduling.calendar.view',
      'scheduling.availability.manage',
      'scheduling.waitlist.view',
      'scheduling.waitlist.manage',
      'scheduling.block.create',
      'scheduling.block.manage',
      'scheduling.reminder.configure',
      'scheduling.online-booking.configure',
    ],
    pricing: {
      monthlyPrice: 0, // Core module - included in base
      yearlyPrice: 0,
      trialPeriodDays: 0,
    },
    dependencies: [],
    marketingDescription:
      'Streamline your practice operations with intelligent appointment scheduling. Reduce no-shows by up to 40% with automated reminders and maximize chair time with smart waitlist management.',
  },

  {
    code: ModuleCode.PATIENT_MANAGEMENT,
    name: 'Patient Management (Patient360)',
    description: 'Comprehensive patient profiles, demographics, and relationship management',
    type: ModuleType.CORE,
    category: 'Patient Care',
    icon: 'users',
    displayOrder: 2,
    features: [
      'Complete patient demographics',
      'Medical history tracking',
      'Allergy and medication tracking',
      'Insurance information management',
      'Emergency contact management',
      'Guardian/dependent relationships',
      'Patient consent management',
      'Preferred provider assignment',
      'Communication preferences',
      'Patient document uploads',
      'Patient tags and segmentation',
      'Referral source tracking',
      'Patient lifetime value tracking',
      'Advanced patient search and filters',
      'Duplicate patient detection',
      'Patient merge capabilities',
    ],
    permissions: [
      'patient.profile.create',
      'patient.profile.read',
      'patient.profile.update',
      'patient.profile.delete',
      'patient.medical-history.read',
      'patient.medical-history.update',
      'patient.insurance.read',
      'patient.insurance.update',
      'patient.documents.upload',
      'patient.documents.view',
      'patient.documents.delete',
      'patient.relationships.manage',
      'patient.consent.manage',
      'patient.search',
      'patient.merge',
      'patient.communications.view',
      'patient.tags.manage',
    ],
    pricing: {
      monthlyPrice: 0,
      yearlyPrice: 0,
      trialPeriodDays: 0,
    },
    dependencies: [],
    marketingDescription:
      'Build stronger patient relationships with 360-degree patient profiles. Access complete patient history, preferences, and interactions in one unified view.',
  },

  {
    code: ModuleCode.CLINICAL_BASIC,
    name: 'Clinical Documentation (Basic)',
    description: 'Essential clinical notes, treatment plans, and dental charting',
    type: ModuleType.CORE,
    category: 'Clinical',
    icon: 'clipboard-medical',
    displayOrder: 3,
    features: [
      'Digital dental charting (Odontogram)',
      'Clinical notes and SOAP notes',
      'Treatment plan creation',
      'Procedure code library',
      'Treatment history tracking',
      'Tooth-level charting',
      'Perio charting (basic)',
      'Treatment status tracking',
      'Clinical alerts and flags',
      'Diagnosis recording',
      'Chief complaint documentation',
      'Clinical templates',
      'Treatment acceptance tracking',
      'Pre-operative instructions',
      'Post-operative instructions',
    ],
    permissions: [
      'clinical.chart.read',
      'clinical.chart.update',
      'clinical.notes.create',
      'clinical.notes.read',
      'clinical.notes.update',
      'clinical.treatment-plan.create',
      'clinical.treatment-plan.read',
      'clinical.treatment-plan.update',
      'clinical.treatment-plan.present',
      'clinical.treatment-plan.accept',
      'clinical.procedure.record',
      'clinical.diagnosis.create',
      'clinical.alerts.manage',
      'clinical.templates.use',
    ],
    pricing: {
      monthlyPrice: 0,
      yearlyPrice: 0,
      trialPeriodDays: 0,
    },
    dependencies: [
      {
        moduleCode: ModuleCode.PATIENT_MANAGEMENT,
        optional: false,
        reason: 'Clinical documentation requires patient profiles',
      },
    ],
    marketingDescription:
      'Deliver superior patient care with intuitive clinical documentation. Digital charting, treatment planning, and clinical notes designed for modern dental practices.',
  },

  {
    code: ModuleCode.BILLING_BASIC,
    name: 'Billing & Payments (Basic)',
    description: 'Essential billing, invoicing, and payment processing',
    type: ModuleType.CORE,
    category: 'Financial',
    icon: 'dollar-sign',
    displayOrder: 4,
    features: [
      'Invoice generation',
      'Payment processing (card, cash, check)',
      'Payment plans and installments',
      'Account statements',
      'Outstanding balance tracking',
      'Payment receipts',
      'Refund processing',
      'Discount and adjustment tracking',
      'Write-off management',
      'Basic financial reports',
      'Tax calculation',
      'Multiple payment methods',
      'Partial payment support',
      'Payment reminders',
    ],
    permissions: [
      'billing.invoice.create',
      'billing.invoice.read',
      'billing.invoice.send',
      'billing.payment.process',
      'billing.payment.record',
      'billing.payment.refund',
      'billing.payment-plan.create',
      'billing.payment-plan.manage',
      'billing.statement.generate',
      'billing.adjustment.apply',
      'billing.discount.apply',
      'billing.write-off.process',
      'billing.reports.basic',
    ],
    pricing: {
      monthlyPrice: 0,
      yearlyPrice: 0,
      trialPeriodDays: 0,
    },
    dependencies: [
      {
        moduleCode: ModuleCode.PATIENT_MANAGEMENT,
        optional: false,
        reason: 'Billing requires patient profiles',
      },
    ],
    marketingDescription:
      'Streamline your practice revenue cycle with easy-to-use billing and payment processing. Accept payments, create payment plans, and track outstanding balances effortlessly.',
  },

  // ============================================================================
  // PREMIUM MODULES (Add-on modules)
  // ============================================================================

  {
    code: ModuleCode.CLINICAL_ADVANCED,
    name: 'Advanced Clinical Features',
    description:
      'Advanced perio charting, implant planning, treatment simulation, and clinical analytics',
    type: ModuleType.PREMIUM,
    category: 'Clinical',
    icon: 'microscope',
    displayOrder: 10,
    features: [
      'Advanced periodontal charting',
      'Implant planning and tracking',
      'Orthodontic treatment tracking',
      'Endodontic charting',
      'Treatment simulation and visualization',
      'Clinical decision support',
      'Risk assessment tools',
      'Clinical quality metrics',
      'Outcome tracking and analytics',
      'Evidence-based treatment protocols',
      'Clinical pathways',
      'Multi-specialty support',
      'Advanced clinical templates',
      'Clinical benchmarking',
      'Peer review tools',
    ],
    permissions: [
      'clinical.advanced.perio-chart',
      'clinical.advanced.implant-planning',
      'clinical.advanced.orthodontic-tracking',
      'clinical.advanced.endodontic-chart',
      'clinical.advanced.treatment-simulation',
      'clinical.advanced.decision-support',
      'clinical.advanced.risk-assessment',
      'clinical.advanced.quality-metrics',
      'clinical.advanced.outcomes-tracking',
      'clinical.advanced.protocols',
      'clinical.advanced.benchmarking',
    ],
    pricing: {
      monthlyPrice: 7900, // $79/month
      yearlyPrice: 79000, // $790/year (~10 months)
      trialPeriodDays: 14,
    },
    dependencies: [
      {
        moduleCode: ModuleCode.CLINICAL_BASIC,
        optional: false,
        reason: 'Advanced clinical features require basic clinical documentation',
      },
    ],
    marketingDescription:
      'Elevate your clinical practice with advanced specialty tools and analytics. Perfect for multi-specialty practices and clinicians who want evidence-based treatment planning.',
  },

  {
    code: ModuleCode.IMAGING,
    name: 'Imaging & Radiology',
    description: 'Digital imaging, X-rays, CBCT, intraoral cameras, and DICOM integration',
    type: ModuleType.PREMIUM,
    category: 'Clinical',
    icon: 'x-ray',
    displayOrder: 11,
    features: [
      'Digital X-ray integration',
      'Intraoral camera integration',
      'CBCT/3D imaging support',
      'Image capture and storage',
      'Image annotation and markup',
      'Image comparison (side-by-side)',
      'Image enhancement tools',
      'Tooth-level image attachment',
      'DICOM viewer',
      'Image sharing with patients',
      'Image export and printing',
      'Imaging protocols',
      'Radiation dose tracking',
      'QA/QC tools for imaging',
      'Integration with imaging sensors',
      'Cloud-based image storage',
    ],
    permissions: [
      'imaging.capture',
      'imaging.view',
      'imaging.annotate',
      'imaging.compare',
      'imaging.enhance',
      'imaging.attach-to-chart',
      'imaging.share',
      'imaging.export',
      'imaging.delete',
      'imaging.dicom.view',
      'imaging.dicom.import',
      'imaging.protocols.configure',
      'imaging.dose.track',
      'imaging.qc.perform',
    ],
    pricing: {
      monthlyPrice: 9900, // $99/month
      yearlyPrice: 99000, // $990/year
      trialPeriodDays: 14,
    },
    dependencies: [
      {
        moduleCode: ModuleCode.CLINICAL_BASIC,
        optional: false,
        reason: 'Imaging must be attached to clinical records',
      },
      {
        moduleCode: ModuleCode.PATIENT_MANAGEMENT,
        optional: false,
        reason: 'Images are associated with patient records',
      },
    ],
    marketingDescription:
      'Go fully digital with comprehensive imaging and radiology tools. Seamlessly integrate with digital sensors, enhance diagnostics, and improve patient communication with visual aids.',
  },

  {
    code: ModuleCode.INVENTORY,
    name: 'Inventory Management',
    description: 'Comprehensive inventory tracking, ordering, and supplier management',
    type: ModuleType.PREMIUM,
    category: 'Operations',
    icon: 'boxes',
    displayOrder: 12,
    features: [
      'Product catalog management',
      'Real-time stock tracking',
      'Low stock alerts and notifications',
      'Automatic reorder points',
      'Purchase order management',
      'Supplier management',
      'Goods receipt and verification',
      'Expiration date tracking',
      'Batch/lot tracking',
      'Multi-location inventory',
      'Inventory transfers',
      'Stock adjustments',
      'Usage tracking per procedure',
      'Cost tracking and COGS',
      'Inventory valuation',
      'Supplier performance analytics',
      'Order history',
    ],
    permissions: [
      'inventory.product.create',
      'inventory.product.read',
      'inventory.product.update',
      'inventory.product.delete',
      'inventory.stock.view',
      'inventory.stock.adjust',
      'inventory.stock.transfer',
      'inventory.purchase-order.create',
      'inventory.purchase-order.approve',
      'inventory.purchase-order.receive',
      'inventory.supplier.manage',
      'inventory.alerts.configure',
      'inventory.reports.view',
      'inventory.usage.track',
    ],
    pricing: {
      monthlyPrice: 6900, // $69/month
      yearlyPrice: 69000, // $690/year
      trialPeriodDays: 14,
    },
    dependencies: [],
    marketingDescription:
      'Never run out of critical supplies. Automate inventory management with smart reordering, supplier tracking, and real-time stock visibility across locations.',
  },

  {
    code: ModuleCode.MARKETING,
    name: 'Marketing & Patient Engagement',
    description: 'Marketing campaigns, patient recalls, newsletters, and engagement automation',
    type: ModuleType.PREMIUM,
    category: 'Growth',
    icon: 'megaphone',
    displayOrder: 13,
    features: [
      'Automated recall campaigns',
      'Birthday and anniversary campaigns',
      'Reactivation campaigns',
      'Email marketing',
      'SMS marketing',
      'Newsletter builder and distribution',
      'Campaign templates',
      'Patient segmentation',
      'Campaign scheduling',
      'A/B testing',
      'Campaign analytics and ROI',
      'Referral program management',
      'Online review requests',
      'Social media integration',
      'Landing page builder',
      'Lead capture forms',
      'Marketing attribution',
    ],
    permissions: [
      'marketing.campaign.create',
      'marketing.campaign.manage',
      'marketing.campaign.send',
      'marketing.campaign.analytics',
      'marketing.recall.configure',
      'marketing.recall.send',
      'marketing.newsletter.create',
      'marketing.newsletter.send',
      'marketing.segment.create',
      'marketing.segment.manage',
      'marketing.referral.manage',
      'marketing.review-request.send',
      'marketing.landing-page.create',
      'marketing.lead.manage',
    ],
    pricing: {
      monthlyPrice: 8900, // $89/month
      yearlyPrice: 89000, // $890/year
      trialPeriodDays: 14,
      usageBased: true, // May charge for SMS/email volume
    },
    dependencies: [
      {
        moduleCode: ModuleCode.PATIENT_MANAGEMENT,
        optional: false,
        reason: 'Marketing campaigns target patient records',
      },
    ],
    marketingDescription:
      'Grow your practice with intelligent marketing automation. Re-engage dormant patients, automate recalls, and drive new patient acquisition with data-driven campaigns.',
  },

  {
    code: ModuleCode.INSURANCE,
    name: 'Insurance & Claims Management',
    description:
      'Insurance verification, claims submission, ERA/EOB processing, and eligibility checks',
    type: ModuleType.PREMIUM,
    category: 'Financial',
    icon: 'shield-check',
    displayOrder: 14,
    features: [
      'Real-time insurance eligibility verification',
      'Electronic claims submission (ADA 2019)',
      'ERA (Electronic Remittance Advice) processing',
      'EOB (Explanation of Benefits) management',
      'Claim status tracking',
      'Pre-authorization management',
      'Secondary insurance billing',
      'COB (Coordination of Benefits)',
      'Insurance plan management',
      'Fee schedule management by plan',
      'Estimated patient portion calculation',
      'Claim attachments (narratives, X-rays)',
      'Claim rejection management',
      'Insurance aging reports',
      'Clearinghouse integration',
      'Insurance carrier directory',
    ],
    permissions: [
      'insurance.eligibility.check',
      'insurance.claim.create',
      'insurance.claim.submit',
      'insurance.claim.track',
      'insurance.claim.resubmit',
      'insurance.era.process',
      'insurance.eob.view',
      'insurance.pre-auth.create',
      'insurance.pre-auth.track',
      'insurance.plan.manage',
      'insurance.fee-schedule.manage',
      'insurance.estimate.calculate',
      'insurance.attachment.add',
      'insurance.reports.view',
    ],
    pricing: {
      monthlyPrice: 12900, // $129/month
      yearlyPrice: 129000, // $1,290/year
      trialPeriodDays: 14,
    },
    dependencies: [
      {
        moduleCode: ModuleCode.BILLING_BASIC,
        optional: false,
        reason: 'Insurance claims are part of the billing workflow',
      },
      {
        moduleCode: ModuleCode.PATIENT_MANAGEMENT,
        optional: false,
        reason: 'Insurance information is stored with patient profiles',
      },
    ],
    marketingDescription:
      'Maximize insurance reimbursements and reduce claim denials. Streamline the entire insurance workflow from eligibility checks to ERA processing.',
  },

  {
    code: ModuleCode.TELEDENTISTRY,
    name: 'Teledentistry',
    description: 'Virtual consultations, remote patient monitoring, and secure video conferencing',
    type: ModuleType.PREMIUM,
    category: 'Patient Care',
    icon: 'video',
    displayOrder: 15,
    features: [
      'HIPAA-compliant video conferencing',
      'Virtual waiting room',
      'Screen sharing',
      'In-call chat messaging',
      'Session recording (with consent)',
      'Virtual consultation scheduling',
      'Remote patient monitoring',
      'Patient-submitted photos/videos',
      'Digital consent forms',
      'Telehealth billing codes',
      'Multi-participant calls',
      'Mobile app support',
      'Consultation notes integration',
      'Follow-up scheduling from virtual visits',
      'Prescription writing integration',
    ],
    permissions: [
      'teledentistry.session.create',
      'teledentistry.session.join',
      'teledentistry.session.record',
      'teledentistry.monitoring.view',
      'teledentistry.monitoring.configure',
      'teledentistry.patient-content.view',
      'teledentistry.consent.obtain',
      'teledentistry.prescription.write',
      'teledentistry.notes.create',
      'teledentistry.billing.code',
    ],
    pricing: {
      monthlyPrice: 5900, // $59/month
      yearlyPrice: 59000, // $590/year
      trialPeriodDays: 14,
      usageBased: true, // May charge per session or per minute
    },
    dependencies: [
      {
        moduleCode: ModuleCode.SCHEDULING,
        optional: false,
        reason: 'Virtual appointments must be scheduled',
      },
      {
        moduleCode: ModuleCode.PATIENT_MANAGEMENT,
        optional: false,
        reason: 'Virtual consultations are associated with patient records',
      },
      {
        moduleCode: ModuleCode.CLINICAL_BASIC,
        optional: true,
        reason: 'Virtual consultation notes should integrate with clinical charts',
      },
    ],
    marketingDescription:
      'Expand your reach with HIPAA-compliant teledentistry. Offer convenient virtual consultations, triage emergencies remotely, and increase patient access to care.',
  },

  {
    code: ModuleCode.ANALYTICS_ADVANCED,
    name: 'Advanced Analytics & Reporting',
    description: 'Business intelligence, custom reports, dashboards, and predictive analytics',
    type: ModuleType.PREMIUM,
    category: 'Insights',
    icon: 'chart-line',
    displayOrder: 16,
    features: [
      'Customizable dashboards',
      'Advanced business intelligence',
      'Production and collection reports',
      'Provider performance analytics',
      'Treatment acceptance rate tracking',
      'Patient retention analytics',
      'Revenue cycle analytics',
      'Appointment utilization metrics',
      'Case acceptance tracking',
      'Referral source ROI',
      'Procedure profitability analysis',
      'Predictive analytics',
      'Forecasting and trending',
      'Custom report builder',
      'Scheduled report delivery',
      'KPI tracking and alerts',
      'Benchmarking against industry standards',
      'Export to Excel/PDF',
    ],
    permissions: [
      'analytics.dashboard.view',
      'analytics.dashboard.create',
      'analytics.dashboard.customize',
      'analytics.report.run',
      'analytics.report.create',
      'analytics.report.schedule',
      'analytics.report.export',
      'analytics.production.view',
      'analytics.collections.view',
      'analytics.provider-performance.view',
      'analytics.patient-retention.view',
      'analytics.treatment-acceptance.view',
      'analytics.predictive.view',
      'analytics.benchmarking.view',
      'analytics.kpi.configure',
    ],
    pricing: {
      monthlyPrice: 9900, // $99/month
      yearlyPrice: 99000, // $990/year
      trialPeriodDays: 14,
    },
    dependencies: [],
    marketingDescription:
      'Make data-driven decisions with powerful analytics and insights. Track KPIs, identify trends, and optimize practice performance with advanced business intelligence.',
  },

  {
    code: ModuleCode.MULTI_LOCATION,
    name: 'Multi-Location Management',
    description: 'Enterprise features for managing multiple practice locations',
    type: ModuleType.PREMIUM,
    category: 'Enterprise',
    icon: 'building',
    displayOrder: 17,
    features: [
      'Centralized multi-location view',
      'Cross-location scheduling',
      'Patient access across locations',
      'Location-level permissions',
      'Centralized reporting across locations',
      'Provider schedule across locations',
      'Inter-location transfers',
      'Location-specific billing',
      'Consolidated financial reporting',
      'Location performance comparison',
      'Shared inventory across locations',
      'Location-specific branding',
      'Cross-location patient referrals',
      'Central patient database',
      'Location hierarchy management',
      'Enterprise-wide analytics',
    ],
    permissions: [
      'multi-location.view-all',
      'multi-location.switch-location',
      'multi-location.location.create',
      'multi-location.location.manage',
      'multi-location.cross-location-schedule',
      'multi-location.transfer-patient',
      'multi-location.reporting.consolidated',
      'multi-location.inventory.transfer',
      'multi-location.analytics.enterprise',
      'multi-location.permissions.configure',
    ],
    pricing: {
      monthlyPrice: 19900, // $199/month
      yearlyPrice: 199000, // $1,990/year
      trialPeriodDays: 14,
    },
    dependencies: [],
    marketingDescription:
      'Scale your dental group with enterprise-grade multi-location management. Maintain consistency across locations while preserving local autonomy.',
  },
];

/**
 * Get module definition by code
 */
export function getModuleDefinition(code: ModuleCode): ModuleDefinition | undefined {
  return MODULE_CATALOG.find((module) => module.code === code);
}

/**
 * Get all core modules
 */
export function getCoreModules(): ModuleDefinition[] {
  return MODULE_CATALOG.filter((module) => module.type === ModuleType.CORE);
}

/**
 * Get all premium modules
 */
export function getPremiumModules(): ModuleDefinition[] {
  return MODULE_CATALOG.filter((module) => module.type === ModuleType.PREMIUM);
}

/**
 * Get modules by category
 */
export function getModulesByCategory(category: string): ModuleDefinition[] {
  return MODULE_CATALOG.filter((module) => module.category === category);
}

/**
 * Get all unique categories
 */
export function getModuleCategories(): string[] {
  return Array.from(new Set(MODULE_CATALOG.map((module) => module.category)));
}

/**
 * Calculate total price for a set of modules
 */
export function calculateModulesPrice(
  moduleCodes: ModuleCode[],
  billingCycle: 'monthly' | 'yearly',
): number {
  return moduleCodes.reduce((total, code) => {
    const module = getModuleDefinition(code);
    if (!module) return total;

    const price =
      billingCycle === 'monthly' ? module.pricing.monthlyPrice : module.pricing.yearlyPrice;

    return total + price;
  }, 0);
}

/**
 * Validate module dependencies
 * Returns array of missing dependencies
 */
export function validateModuleDependencies(
  enabledModules: ModuleCode[],
  moduleToAdd: ModuleCode,
): ModuleCode[] {
  const module = getModuleDefinition(moduleToAdd);
  if (!module) return [];

  const missingDependencies: ModuleCode[] = [];

  for (const dependency of module.dependencies) {
    if (!dependency.optional && !enabledModules.includes(dependency.moduleCode)) {
      missingDependencies.push(dependency.moduleCode);
    }
  }

  return missingDependencies;
}

/**
 * Get all required modules for a given module (recursive)
 */
export function getAllRequiredModules(moduleCode: ModuleCode): ModuleCode[] {
  const module = getModuleDefinition(moduleCode);
  if (!module) return [];

  const required: Set<ModuleCode> = new Set([moduleCode]);

  function addDependencies(code: ModuleCode) {
    const mod = getModuleDefinition(code);
    if (!mod) return;

    for (const dep of mod.dependencies) {
      if (!dep.optional && !required.has(dep.moduleCode)) {
        required.add(dep.moduleCode);
        addDependencies(dep.moduleCode);
      }
    }
  }

  addDependencies(moduleCode);
  return Array.from(required);
}

/**
 * Get permissions for a set of modules
 */
export function getModulePermissions(moduleCodes: ModuleCode[]): string[] {
  const permissions = new Set<string>();

  for (const code of moduleCodes) {
    const module = getModuleDefinition(code);
    if (module) {
      module.permissions.forEach((perm) => permissions.add(perm));
    }
  }

  return Array.from(permissions);
}
