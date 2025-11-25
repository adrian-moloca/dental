/**
 * Automation workflow examples
 * Practical examples of common automation workflows
 * @module shared-validation/schemas/automation/examples
 */

import type { CreateWorkflowDto } from './automation.schemas';

/**
 * Example 1: Appointment Reminder Workflow
 * Sends email and SMS reminders 24 hours before appointments
 */
export const appointmentReminderWorkflow: CreateWorkflowDto = {
  name: 'Appointment Reminder - 24 Hours Before',
  description: 'Automatically send email and SMS reminders to patients 24 hours before their scheduled appointments',
  trigger: {
    type: 'SCHEDULE_TRIGGER',
    config: {
      cronExpression: '0 0 9 * * *', // Daily at 9 AM
      timezone: 'America/New_York',
    },
  },
  conditions: [
    {
      field: 'appointment.status',
      operator: 'EQUALS',
      value: 'SCHEDULED',
      logicalOperator: 'AND',
    },
    {
      field: 'patient.email',
      operator: 'IS_NOT_NULL',
      logicalOperator: 'AND',
    },
  ],
  actions: [
    {
      type: 'SEND_EMAIL',
      order: 1,
      enabled: true,
      continueOnError: true,
      config: {
        templateId: 'appointment-reminder-24h',
        recipientField: 'patient.email',
        variables: {
          patientName: 'patient.fullName',
          appointmentDate: 'appointment.startTime',
          providerName: 'appointment.provider.name',
          clinicAddress: 'clinic.address',
        },
        ccRecipients: [],
      },
    },
    {
      type: 'SEND_SMS',
      order: 2,
      enabled: true,
      continueOnError: true,
      config: {
        message: 'Reminder: Appointment tomorrow at {{time}} with Dr. {{provider}}. Reply CANCEL to cancel.',
        recipientField: 'patient.phone',
        variables: {
          time: 'appointment.startTime',
          provider: 'appointment.provider.lastName',
        },
      },
    },
  ],
  errorHandling: {
    retryPolicy: {
      maxRetries: 3,
      backoffStrategy: 'EXPONENTIAL',
      backoffMultiplier: 2,
      initialBackoffMs: 1000,
    },
    onFailureAction: 'SEND_ALERT',
    alertRecipients: ['admin@clinic.com'],
  },
  tags: ['appointments', 'reminders', 'patient-engagement'],
  enabled: true,
};

/**
 * Example 2: Payment Overdue Workflow
 * Escalating reminders for overdue invoices
 */
export const paymentOverdueWorkflow: CreateWorkflowDto = {
  name: 'Payment Overdue Reminder Escalation',
  description: 'Send escalating reminders for overdue invoices: gentle reminder, then urgent notice',
  trigger: {
    type: 'EVENT_TRIGGER',
    config: {
      eventType: 'invoice.overdue',
      sourceService: 'BILLING',
      filters: [
        {
          field: 'invoice.status',
          operator: 'EQUALS',
          value: 'OVERDUE',
          logicalOperator: 'AND',
        },
      ],
    },
  },
  conditions: [
    {
      field: 'invoice.totalAmount',
      operator: 'GREATER_THAN',
      value: 50,
      logicalOperator: 'AND',
    },
    {
      field: 'patient.email',
      operator: 'IS_NOT_NULL',
      logicalOperator: 'AND',
    },
  ],
  actions: [
    {
      type: 'SEND_EMAIL',
      order: 1,
      enabled: true,
      continueOnError: false,
      config: {
        templateId: 'payment-reminder-gentle',
        recipientField: 'patient.email',
        variables: {
          patientName: 'patient.fullName',
          invoiceAmount: 'invoice.totalAmount',
          dueDate: 'invoice.dueDate',
          invoiceNumber: 'invoice.number',
        },
      },
    },
    {
      type: 'CREATE_TASK',
      order: 2,
      enabled: true,
      continueOnError: true,
      config: {
        title: 'Follow up on overdue invoice',
        description: 'Contact patient regarding overdue invoice payment',
        assigneeField: 'invoice.billingManager.id',
        priority: 'MEDIUM',
        dueDateField: 'invoice.dueDate',
      },
    },
  ],
  errorHandling: {
    onFailureAction: 'CONTINUE_NEXT_ACTION',
  },
  tags: ['billing', 'payments', 'overdue'],
  enabled: true,
};

/**
 * Example 3: Loyalty Points Reward Workflow
 * Award loyalty points after successful appointment completion
 */
export const loyaltyPointsRewardWorkflow: CreateWorkflowDto = {
  name: 'Award Loyalty Points - Appointment Completion',
  description: 'Automatically award loyalty points when patients complete appointments',
  trigger: {
    type: 'EVENT_TRIGGER',
    config: {
      eventType: 'appointment.completed',
      sourceService: 'SCHEDULING',
    },
  },
  conditions: [
    {
      field: 'appointment.status',
      operator: 'EQUALS',
      value: 'COMPLETED',
      logicalOperator: 'AND',
    },
    {
      field: 'patient.loyaltyProgram.enrolled',
      operator: 'EQUALS',
      value: true,
      logicalOperator: 'AND',
    },
  ],
  actions: [
    {
      type: 'UPDATE_LOYALTY_POINTS',
      order: 1,
      enabled: true,
      continueOnError: false,
      config: {
        pointsAmount: 50,
        source: 'AUTOMATION',
        description: 'Loyalty points for completing appointment',
      },
    },
    {
      type: 'SEND_EMAIL',
      order: 2,
      enabled: true,
      continueOnError: true,
      config: {
        templateId: 'loyalty-points-earned',
        recipientField: 'patient.email',
        variables: {
          patientName: 'patient.fullName',
          pointsEarned: '50',
          totalPoints: 'patient.loyalty.totalPoints',
        },
      },
    },
  ],
  tags: ['loyalty', 'rewards', 'patient-engagement'],
  enabled: true,
};

/**
 * Example 4: Birthday Discount Workflow
 * Send birthday greetings with special discount code
 */
export const birthdayDiscountWorkflow: CreateWorkflowDto = {
  name: 'Birthday Discount Campaign',
  description: 'Send birthday greetings with a special 20% discount code to patients',
  trigger: {
    type: 'SCHEDULE_TRIGGER',
    config: {
      cronExpression: '0 0 8 * * *', // Daily at 8 AM
      timezone: 'UTC',
    },
  },
  conditions: [
    {
      field: 'patient.birthday',
      operator: 'EQUALS',
      value: 'today',
      logicalOperator: 'AND',
    },
    {
      field: 'patient.email',
      operator: 'IS_NOT_NULL',
      logicalOperator: 'AND',
    },
  ],
  actions: [
    {
      type: 'APPLY_DISCOUNT',
      order: 1,
      enabled: true,
      continueOnError: false,
      config: {
        discountType: 'PERCENTAGE',
        amount: 20,
        targetField: 'patient.id',
        code: 'BDAY20',
        expiryDate: '2025-12-31T23:59:59Z',
      },
    },
    {
      type: 'SEND_EMAIL',
      order: 2,
      enabled: true,
      continueOnError: true,
      config: {
        templateId: 'birthday-greeting-discount',
        recipientField: 'patient.email',
        variables: {
          patientName: 'patient.firstName',
          discountCode: 'BDAY20',
          discountPercent: '20',
        },
      },
    },
    {
      type: 'UPDATE_LOYALTY_POINTS',
      order: 3,
      enabled: true,
      continueOnError: true,
      config: {
        pointsAmount: 100,
        source: 'BONUS',
        description: 'Birthday bonus points',
      },
    },
  ],
  tags: ['birthday', 'discounts', 'patient-engagement', 'loyalty'],
  enabled: true,
};

/**
 * Example 5: Treatment Plan Follow-up Workflow
 * Follow up with patients who have pending treatment plans
 */
export const treatmentPlanFollowupWorkflow: CreateWorkflowDto = {
  name: 'Treatment Plan Follow-up',
  description: 'Follow up with patients who have approved but not scheduled treatment plans',
  trigger: {
    type: 'SCHEDULE_TRIGGER',
    config: {
      fixedIntervalMs: 86400000, // Daily (24 hours)
    },
  },
  conditions: [
    {
      field: 'treatmentPlan.status',
      operator: 'EQUALS',
      value: 'APPROVED',
      logicalOperator: 'AND',
    },
    {
      field: 'treatmentPlan.scheduledAppointments',
      operator: 'EQUALS',
      value: 0,
      logicalOperator: 'AND',
    },
    {
      field: 'treatmentPlan.approvedDate',
      operator: 'LESS_THAN',
      value: 'now-7days',
      logicalOperator: 'AND',
    },
  ],
  actions: [
    {
      type: 'CREATE_TASK',
      order: 1,
      enabled: true,
      continueOnError: false,
      config: {
        title: 'Follow up on treatment plan scheduling',
        description: 'Contact patient to schedule treatment plan procedures',
        assigneeField: 'treatmentPlan.provider.id',
        priority: 'HIGH',
      },
    },
    {
      type: 'SEND_EMAIL',
      order: 2,
      enabled: true,
      continueOnError: true,
      config: {
        templateId: 'treatment-plan-followup',
        recipientField: 'patient.email',
        variables: {
          patientName: 'patient.fullName',
          treatmentPlanName: 'treatmentPlan.name',
          providerName: 'treatmentPlan.provider.name',
        },
      },
    },
  ],
  tags: ['treatment-plans', 'follow-up', 'clinical'],
  enabled: true,
};

/**
 * Example 6: No-Show Prevention Workflow
 * Send multiple reminders to reduce no-shows
 */
export const noShowPreventionWorkflow: CreateWorkflowDto = {
  name: 'No-Show Prevention - Multiple Reminders',
  description: 'Send multiple reminders to reduce appointment no-shows',
  trigger: {
    type: 'EVENT_TRIGGER',
    config: {
      eventType: 'appointment.scheduled',
      sourceService: 'SCHEDULING',
    },
  },
  conditions: [
    {
      field: 'appointment.status',
      operator: 'EQUALS',
      value: 'SCHEDULED',
      logicalOperator: 'AND',
    },
    {
      field: 'patient.noShowHistory',
      operator: 'GREATER_THAN',
      value: 0,
      logicalOperator: 'AND',
    },
  ],
  actions: [
    {
      type: 'SEND_EMAIL',
      order: 1,
      enabled: true,
      continueOnError: true,
      config: {
        templateId: 'appointment-confirmation',
        recipientField: 'patient.email',
        variables: {
          patientName: 'patient.fullName',
          appointmentDate: 'appointment.startTime',
          providerName: 'appointment.provider.name',
        },
      },
    },
    {
      type: 'SEND_SMS',
      order: 2,
      enabled: true,
      continueOnError: true,
      config: {
        message: 'Your appointment is confirmed for {{date}}. Reply CONFIRM to confirm or CANCEL to cancel.',
        recipientField: 'patient.phone',
        variables: {
          date: 'appointment.startTime',
        },
      },
    },
    {
      type: 'CREATE_TASK',
      order: 3,
      enabled: true,
      continueOnError: true,
      config: {
        title: 'Call to confirm appointment',
        description: 'Patient has no-show history. Call to confirm attendance.',
        assigneeField: 'appointment.provider.id',
        priority: 'MEDIUM',
        dueDateField: 'appointment.startTime',
      },
    },
  ],
  errorHandling: {
    retryPolicy: {
      maxRetries: 2,
      backoffStrategy: 'LINEAR',
      backoffMultiplier: 1,
      initialBackoffMs: 5000,
    },
    onFailureAction: 'CONTINUE_NEXT_ACTION',
  },
  tags: ['appointments', 'no-show-prevention', 'reminders'],
  enabled: true,
};

/**
 * Example 7: Invoice Generation on Treatment Completion
 * Automatically create invoice when treatment is completed
 */
export const invoiceGenerationWorkflow: CreateWorkflowDto = {
  name: 'Auto-Generate Invoice - Treatment Completion',
  description: 'Automatically generate invoice when treatment/procedure is marked as completed',
  trigger: {
    type: 'EVENT_TRIGGER',
    config: {
      eventType: 'procedure.completed',
      sourceService: 'CLINICAL',
    },
  },
  conditions: [
    {
      field: 'procedure.status',
      operator: 'EQUALS',
      value: 'COMPLETED',
      logicalOperator: 'AND',
    },
    {
      field: 'procedure.invoice.id',
      operator: 'IS_NULL',
      logicalOperator: 'AND',
    },
  ],
  actions: [
    {
      type: 'CREATE_INVOICE',
      order: 1,
      enabled: true,
      continueOnError: false,
      config: {
        patientIdField: 'procedure.patient.id',
        items: [
          {
            description: 'Dental procedure',
            amount: 150.00,
            quantity: 1,
          },
        ],
        dueDate: 'now+30days',
        notes: 'Invoice generated automatically for completed procedure',
      },
    },
    {
      type: 'SEND_EMAIL',
      order: 2,
      enabled: true,
      continueOnError: true,
      config: {
        templateId: 'invoice-created',
        recipientField: 'patient.email',
        variables: {
          patientName: 'patient.fullName',
          invoiceAmount: 'procedure.cost',
          procedureName: 'procedure.name',
        },
      },
    },
    {
      type: 'EMIT_EVENT',
      order: 3,
      enabled: true,
      continueOnError: true,
      config: {
        eventType: 'invoice.created',
        targetService: 'BILLING',
        payloadTemplate: {
          invoiceId: 'invoice.id',
          patientId: 'patient.id',
          procedureId: 'procedure.id',
          amount: 'procedure.cost',
        },
      },
    },
  ],
  tags: ['billing', 'invoices', 'clinical', 'automation'],
  enabled: true,
};

/**
 * Example 8: Referral Program Workflow
 * Reward patients for successful referrals
 */
export const referralRewardWorkflow: CreateWorkflowDto = {
  name: 'Referral Reward Program',
  description: 'Reward both referrer and referred patient when a referral converts',
  trigger: {
    type: 'EVENT_TRIGGER',
    config: {
      eventType: 'patient.firstAppointmentCompleted',
      sourceService: 'SCHEDULING',
    },
  },
  conditions: [
    {
      field: 'patient.referredBy',
      operator: 'IS_NOT_NULL',
      logicalOperator: 'AND',
    },
  ],
  actions: [
    {
      type: 'UPDATE_LOYALTY_POINTS',
      order: 1,
      enabled: true,
      continueOnError: false,
      config: {
        pointsAmount: 500,
        source: 'PROMOTION',
        description: 'Referral bonus - referrer reward',
      },
    },
    {
      type: 'APPLY_DISCOUNT',
      order: 2,
      enabled: true,
      continueOnError: false,
      config: {
        discountType: 'FIXED_AMOUNT',
        amount: 50,
        targetField: 'patient.id',
        code: 'REFERRAL50',
        expiryDate: '2025-12-31T23:59:59Z',
      },
    },
    {
      type: 'SEND_EMAIL',
      order: 3,
      enabled: true,
      continueOnError: true,
      config: {
        templateId: 'referral-thank-you',
        recipientField: 'patient.referredBy.email',
        variables: {
          referrerName: 'patient.referredBy.fullName',
          referredName: 'patient.fullName',
          pointsEarned: '500',
        },
      },
    },
    {
      type: 'SEND_EMAIL',
      order: 4,
      enabled: true,
      continueOnError: true,
      config: {
        templateId: 'referral-welcome-discount',
        recipientField: 'patient.email',
        variables: {
          patientName: 'patient.fullName',
          discountCode: 'REFERRAL50',
          discountAmount: '50',
        },
      },
    },
  ],
  tags: ['referrals', 'loyalty', 'discounts', 'patient-acquisition'],
  enabled: true,
};

/**
 * Example 9: Recall Workflow for Regular Checkups
 * Remind patients due for regular checkup/cleaning
 */
export const recallCheckupWorkflow: CreateWorkflowDto = {
  name: 'Regular Checkup Recall - 6 Months',
  description: 'Send recall reminders to patients due for regular checkup',
  trigger: {
    type: 'SCHEDULE_TRIGGER',
    config: {
      cronExpression: '0 0 10 1 * *', // First day of each month at 10 AM
      timezone: 'America/New_York',
    },
  },
  conditions: [
    {
      field: 'patient.lastCheckup',
      operator: 'LESS_THAN',
      value: 'now-6months',
      logicalOperator: 'AND',
    },
    {
      field: 'patient.email',
      operator: 'IS_NOT_NULL',
      logicalOperator: 'AND',
    },
  ],
  actions: [
    {
      type: 'SEND_EMAIL',
      order: 1,
      enabled: true,
      continueOnError: true,
      config: {
        templateId: 'checkup-recall',
        recipientField: 'patient.email',
        variables: {
          patientName: 'patient.fullName',
          lastCheckupDate: 'patient.lastCheckup',
        },
      },
    },
    {
      type: 'SEND_SMS',
      order: 2,
      enabled: true,
      continueOnError: true,
      config: {
        message: 'Time for your regular checkup! Call us to schedule: {{phone}}',
        recipientField: 'patient.phone',
        variables: {
          phone: 'clinic.phone',
        },
      },
    },
    {
      type: 'CREATE_TASK',
      order: 3,
      enabled: true,
      continueOnError: true,
      config: {
        title: 'Follow up on recall reminder',
        description: 'Follow up with patient if they do not schedule within 2 weeks',
        assigneeField: 'patient.primaryProvider.id',
        priority: 'LOW',
      },
    },
  ],
  tags: ['recall', 'checkups', 'patient-retention', 'preventive-care'],
  enabled: true,
};

/**
 * Example 10: Manual Emergency Notification Workflow
 * Send emergency notifications to staff (manual trigger only)
 */
export const emergencyNotificationWorkflow: CreateWorkflowDto = {
  name: 'Emergency Staff Notification',
  description: 'Manually trigger emergency notifications to all available staff',
  trigger: {
    type: 'MANUAL_TRIGGER',
    config: {
      requiredRole: 'ADMIN',
      approvalNeeded: false,
    },
  },
  actions: [
    {
      type: 'SEND_EMAIL',
      order: 1,
      enabled: true,
      continueOnError: true,
      config: {
        templateId: 'emergency-alert-staff',
        recipientField: 'staff.email',
        variables: {
          emergencyType: 'emergency.type',
          emergencyDetails: 'emergency.details',
        },
      },
    },
    {
      type: 'SEND_SMS',
      order: 2,
      enabled: true,
      continueOnError: true,
      config: {
        message: 'EMERGENCY ALERT: {{type}} - {{details}}. Check email for full details.',
        recipientField: 'staff.phone',
        variables: {
          type: 'emergency.type',
          details: 'emergency.details',
        },
      },
    },
    {
      type: 'SEND_WEBHOOK',
      order: 3,
      enabled: true,
      continueOnError: true,
      config: {
        url: 'https://api.alerting-service.com/emergency',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer {{apiKey}}',
        },
        bodyTemplate: JSON.stringify({
          type: 'emergency.type',
          severity: 'CRITICAL',
          timestamp: 'now',
          details: 'emergency.details',
        }),
        timeoutMs: 10000,
      },
    },
  ],
  errorHandling: {
    retryPolicy: {
      maxRetries: 5,
      backoffStrategy: 'FIXED',
      backoffMultiplier: 1,
      initialBackoffMs: 500,
    },
    onFailureAction: 'SEND_ALERT',
    alertRecipients: ['emergency@clinic.com', 'admin@clinic.com'],
  },
  tags: ['emergency', 'staff', 'alerts', 'manual'],
  enabled: true,
};

/**
 * Export all example workflows
 */
export const exampleWorkflows = {
  appointmentReminderWorkflow,
  paymentOverdueWorkflow,
  loyaltyPointsRewardWorkflow,
  birthdayDiscountWorkflow,
  treatmentPlanFollowupWorkflow,
  noShowPreventionWorkflow,
  invoiceGenerationWorkflow,
  referralRewardWorkflow,
  recallCheckupWorkflow,
  emergencyNotificationWorkflow,
};
