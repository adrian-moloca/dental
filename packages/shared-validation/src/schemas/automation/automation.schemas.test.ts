/**
 * Automation schemas validation tests
 * @module shared-validation/schemas/automation/tests
 */

import { describe, it, expect } from '@jest/globals';
import {
  // Workflow schemas
  WorkflowStatusSchema,
  CreateWorkflowDtoSchema,
  UpdateWorkflowDtoSchema,
  QueryWorkflowsDtoSchema,
  // Trigger schemas
  TriggerTypeSchema,
  TriggerDtoSchema,
  EventTriggerConfigSchema,
  ScheduleTriggerConfigSchema,
  ManualTriggerConfigSchema,
  CronExpressionSchema,
  FixedIntervalSchema,
  // Condition schemas
  ConditionOperatorSchema,
  LogicalOperatorSchema,
  ConditionDtoSchema,
  ConditionGroupDtoSchema,
  ConditionFieldSchema,
  // Action schemas
  ActionTypeSchema,
  ActionDtoSchema,
  EmailActionConfigSchema,
  SmsActionConfigSchema,
  TaskActionConfigSchema,
  AppointmentActionConfigSchema,
  LoyaltyActionConfigSchema,
  DiscountActionConfigSchema,
  WebhookActionConfigSchema,
  EventActionConfigSchema,
  // Error handling schemas
  RetryPolicySchema,
  OnFailureActionSchema,
  ErrorHandlingConfigSchema,
  // Execution schemas
  TriggerWorkflowManuallyDtoSchema,
  QueryWorkflowRunsDtoSchema,
  WorkflowRunStatusSchema,
  // Types
  type CreateWorkflowDto,
  type TriggerDto,
  type ActionDto,
} from './automation.schemas';

describe('Automation Schemas', () => {
  // ============================================================================
  // WORKFLOW STATUS & ENUM TESTS
  // ============================================================================

  describe('WorkflowStatusSchema', () => {
    it('should validate valid workflow statuses', () => {
      expect(WorkflowStatusSchema.parse('DRAFT')).toBe('DRAFT');
      expect(WorkflowStatusSchema.parse('ACTIVE')).toBe('ACTIVE');
      expect(WorkflowStatusSchema.parse('INACTIVE')).toBe('INACTIVE');
      expect(WorkflowStatusSchema.parse('ARCHIVED')).toBe('ARCHIVED');
    });

    it('should reject invalid workflow statuses', () => {
      expect(() => WorkflowStatusSchema.parse('INVALID')).toThrow();
      expect(() => WorkflowStatusSchema.parse('')).toThrow();
    });
  });

  describe('WorkflowRunStatusSchema', () => {
    it('should validate valid workflow run statuses', () => {
      expect(WorkflowRunStatusSchema.parse('PENDING')).toBe('PENDING');
      expect(WorkflowRunStatusSchema.parse('RUNNING')).toBe('RUNNING');
      expect(WorkflowRunStatusSchema.parse('SUCCEEDED')).toBe('SUCCEEDED');
      expect(WorkflowRunStatusSchema.parse('FAILED')).toBe('FAILED');
      expect(WorkflowRunStatusSchema.parse('CANCELLED')).toBe('CANCELLED');
      expect(WorkflowRunStatusSchema.parse('TIMEOUT')).toBe('TIMEOUT');
    });
  });

  // ============================================================================
  // TRIGGER SCHEMA TESTS
  // ============================================================================

  describe('CronExpressionSchema', () => {
    it('should validate valid CRON expressions', () => {
      expect(CronExpressionSchema.parse('0 0 9 * * *')).toBe('0 0 9 * * *'); // Every day at 9 AM
      expect(CronExpressionSchema.parse('0 30 8 * * 1-5')).toBe('0 30 8 * * 1-5'); // Weekdays at 8:30 AM
      expect(CronExpressionSchema.parse('0 */15 * * * *')).toBe('0 */15 * * * *'); // Every 15 minutes
    });

    it('should reject invalid CRON expressions', () => {
      expect(() => CronExpressionSchema.parse('invalid')).toThrow();
      expect(() => CronExpressionSchema.parse('')).toThrow();
      expect(() => CronExpressionSchema.parse('0 0')).toThrow(); // Too short
    });
  });

  describe('FixedIntervalSchema', () => {
    it('should validate valid fixed intervals', () => {
      expect(FixedIntervalSchema.parse(60000)).toBe(60000); // 1 minute
      expect(FixedIntervalSchema.parse(3600000)).toBe(3600000); // 1 hour
      expect(FixedIntervalSchema.parse(86400000)).toBe(86400000); // 1 day
    });

    it('should reject invalid fixed intervals', () => {
      expect(() => FixedIntervalSchema.parse(30000)).toThrow(); // Too short (< 1 minute)
      expect(() => FixedIntervalSchema.parse(86400001)).toThrow(); // Too long (> 1 day)
      expect(() => FixedIntervalSchema.parse(60000.5)).toThrow(); // Not an integer
    });
  });

  describe('EventTriggerConfigSchema', () => {
    it('should validate valid event trigger config', () => {
      const valid = {
        eventType: 'appointment.created',
        sourceService: 'SCHEDULING',
      };
      expect(EventTriggerConfigSchema.parse(valid)).toEqual(valid);
    });

    it('should validate event trigger with filters', () => {
      const valid = {
        eventType: 'invoice.overdue',
        sourceService: 'BILLING',
        filters: [
          {
            field: 'invoice.amount',
            operator: 'GREATER_THAN',
            value: 500,
            logicalOperator: 'AND',
          },
        ],
      };
      expect(EventTriggerConfigSchema.parse(valid)).toEqual(valid);
    });

    it('should reject invalid source service', () => {
      const invalid = {
        eventType: 'test.event',
        sourceService: 'INVALID_SERVICE',
      };
      expect(() => EventTriggerConfigSchema.parse(invalid)).toThrow();
    });
  });

  describe('ScheduleTriggerConfigSchema', () => {
    it('should validate CRON-based schedule trigger', () => {
      const valid = {
        cronExpression: '0 0 9 * * 1-5',
        timezone: 'America/New_York',
      };
      expect(ScheduleTriggerConfigSchema.parse(valid)).toEqual(valid);
    });

    it('should validate fixed interval schedule trigger', () => {
      const valid = {
        fixedIntervalMs: 3600000, // 1 hour
      };
      expect(ScheduleTriggerConfigSchema.parse(valid)).toEqual(valid);
    });

    it('should reject schedule with both CRON and fixed interval', () => {
      const invalid = {
        cronExpression: '0 0 9 * * *',
        fixedIntervalMs: 3600000,
      };
      expect(() => ScheduleTriggerConfigSchema.parse(invalid)).toThrow();
    });

    it('should reject schedule with neither CRON nor fixed interval', () => {
      const invalid = {
        timezone: 'UTC',
      };
      expect(() => ScheduleTriggerConfigSchema.parse(invalid)).toThrow();
    });

    it('should validate date range constraints', () => {
      const valid = {
        fixedIntervalMs: 3600000,
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-12-31T23:59:59Z',
      };
      expect(ScheduleTriggerConfigSchema.parse(valid)).toEqual(valid);
    });

    it('should reject invalid date range (end before start)', () => {
      const invalid = {
        fixedIntervalMs: 3600000,
        startDate: '2025-12-31T23:59:59Z',
        endDate: '2025-01-01T00:00:00Z',
      };
      expect(() => ScheduleTriggerConfigSchema.parse(invalid)).toThrow();
    });
  });

  describe('ManualTriggerConfigSchema', () => {
    it('should validate manual trigger config', () => {
      const valid = {
        requiredRole: 'ADMIN',
        approvalNeeded: false,
      };
      expect(ManualTriggerConfigSchema.parse(valid)).toEqual(valid);
    });

    it('should validate manual trigger with approval', () => {
      const valid = {
        requiredRole: 'STAFF',
        approvalNeeded: true,
        approvalRole: 'MANAGER',
      };
      expect(ManualTriggerConfigSchema.parse(valid)).toEqual(valid);
    });
  });

  describe('TriggerDtoSchema', () => {
    it('should validate event trigger', () => {
      const valid: TriggerDto = {
        type: 'EVENT_TRIGGER',
        config: {
          eventType: 'appointment.cancelled',
          sourceService: 'SCHEDULING',
        },
      };
      expect(TriggerDtoSchema.parse(valid)).toEqual(valid);
    });

    it('should validate schedule trigger', () => {
      const valid: TriggerDto = {
        type: 'SCHEDULE_TRIGGER',
        config: {
          cronExpression: '0 0 9 * * *',
          timezone: 'UTC',
        },
      };
      expect(TriggerDtoSchema.parse(valid)).toEqual(valid);
    });

    it('should validate manual trigger', () => {
      const valid: TriggerDto = {
        type: 'MANUAL_TRIGGER',
        config: {
          requiredRole: 'ADMIN',
          approvalNeeded: false,
        },
      };
      expect(TriggerDtoSchema.parse(valid)).toEqual(valid);
    });
  });

  // ============================================================================
  // CONDITION SCHEMA TESTS
  // ============================================================================

  describe('ConditionFieldSchema', () => {
    it('should validate valid field paths', () => {
      expect(ConditionFieldSchema.parse('patient.email')).toBe('patient.email');
      expect(ConditionFieldSchema.parse('invoice.totalAmount')).toBe('invoice.totalAmount');
      expect(ConditionFieldSchema.parse('appointment.provider.id')).toBe('appointment.provider.id');
    });

    it('should reject invalid field paths', () => {
      expect(() => ConditionFieldSchema.parse('123invalid')).toThrow(); // Starts with number
      expect(() => ConditionFieldSchema.parse('field-name')).toThrow(); // Contains dash
      expect(() => ConditionFieldSchema.parse('field..name')).toThrow(); // Double dot
    });
  });

  describe('ConditionDtoSchema', () => {
    it('should validate simple condition', () => {
      const valid = {
        field: 'patient.email',
        operator: 'EQUALS',
        value: 'test@example.com',
        logicalOperator: 'AND',
      };
      expect(ConditionDtoSchema.parse(valid)).toEqual(valid);
    });

    it('should validate numeric comparison condition', () => {
      const valid = {
        field: 'invoice.amount',
        operator: 'GREATER_THAN',
        value: 1000,
        logicalOperator: 'AND',
      };
      expect(ConditionDtoSchema.parse(valid)).toEqual(valid);
    });

    it('should validate null check condition', () => {
      const valid = {
        field: 'patient.phone',
        operator: 'IS_NOT_NULL',
        logicalOperator: 'AND',
      };
      expect(ConditionDtoSchema.parse(valid)).toEqual(valid);
    });
  });

  describe('ConditionGroupDtoSchema', () => {
    it('should validate condition group', () => {
      const valid = {
        conditions: [
          {
            field: 'patient.age',
            operator: 'GREATER_THAN',
            value: 18,
            logicalOperator: 'AND',
          },
          {
            field: 'patient.email',
            operator: 'IS_NOT_NULL',
            logicalOperator: 'AND',
          },
        ],
        logicalOperator: 'AND',
      };
      expect(ConditionGroupDtoSchema.parse(valid)).toEqual(valid);
    });

    it('should reject empty condition group', () => {
      const invalid = {
        conditions: [],
        logicalOperator: 'AND',
      };
      expect(() => ConditionGroupDtoSchema.parse(invalid)).toThrow();
    });
  });

  // ============================================================================
  // ACTION SCHEMA TESTS
  // ============================================================================

  describe('EmailActionConfigSchema', () => {
    it('should validate email action config', () => {
      const valid = {
        templateId: '550e8400-e29b-41d4-a716-446655440000',
        recipientField: 'patient.email',
        variables: {
          firstName: 'patient.firstName',
          appointmentDate: 'appointment.startTime',
        },
      };
      expect(EmailActionConfigSchema.parse(valid)).toEqual(valid);
    });

    it('should validate email with CC recipients', () => {
      const valid = {
        templateId: 'appointment-reminder',
        recipientField: 'patient.email',
        ccRecipients: ['admin@clinic.com', 'manager@clinic.com'],
      };
      expect(EmailActionConfigSchema.parse(valid)).toEqual(valid);
    });

    it('should reject invalid CC email', () => {
      const invalid = {
        templateId: 'test-template',
        recipientField: 'patient.email',
        ccRecipients: ['invalid-email'],
      };
      expect(() => EmailActionConfigSchema.parse(invalid)).toThrow();
    });
  });

  describe('SmsActionConfigSchema', () => {
    it('should validate SMS action config', () => {
      const valid = {
        message: 'Your appointment is tomorrow at {{appointmentTime}}',
        recipientField: 'patient.phone',
      };
      expect(SmsActionConfigSchema.parse(valid)).toEqual(valid);
    });

    it('should reject SMS message exceeding 160 characters', () => {
      const invalid = {
        message: 'a'.repeat(161),
        recipientField: 'patient.phone',
      };
      expect(() => SmsActionConfigSchema.parse(invalid)).toThrow();
    });
  });

  describe('TaskActionConfigSchema', () => {
    it('should validate task action config', () => {
      const valid = {
        title: 'Follow up with patient',
        description: 'Call patient to schedule next appointment',
        assigneeField: 'appointment.providerId',
        priority: 'MEDIUM',
      };
      expect(TaskActionConfigSchema.parse(valid)).toEqual(valid);
    });

    it('should reject short task title', () => {
      const invalid = {
        title: 'ab', // Less than 3 characters
        assigneeField: 'user.id',
      };
      expect(() => TaskActionConfigSchema.parse(invalid)).toThrow();
    });
  });

  describe('LoyaltyActionConfigSchema', () => {
    it('should validate loyalty action with fixed points', () => {
      const valid = {
        pointsAmount: 100,
        source: 'AUTOMATION',
        description: 'Bonus points for appointment completion',
      };
      expect(LoyaltyActionConfigSchema.parse(valid)).toEqual(valid);
    });

    it('should validate loyalty action with dynamic points field', () => {
      const valid = {
        pointsField: 'invoice.totalAmount',
        source: 'PROMOTION',
      };
      expect(LoyaltyActionConfigSchema.parse(valid)).toEqual(valid);
    });

    it('should reject loyalty action with both points amount and field', () => {
      const invalid = {
        pointsAmount: 100,
        pointsField: 'invoice.totalAmount',
        source: 'AUTOMATION',
      };
      expect(() => LoyaltyActionConfigSchema.parse(invalid)).toThrow();
    });

    it('should reject loyalty action with neither points amount nor field', () => {
      const invalid = {
        source: 'AUTOMATION',
      };
      expect(() => LoyaltyActionConfigSchema.parse(invalid)).toThrow();
    });
  });

  describe('DiscountActionConfigSchema', () => {
    it('should validate percentage discount', () => {
      const valid = {
        discountType: 'PERCENTAGE',
        amount: 15.5,
        targetField: 'invoice.id',
        code: 'SAVE15',
      };
      expect(DiscountActionConfigSchema.parse(valid)).toEqual(valid);
    });

    it('should validate fixed amount discount', () => {
      const valid = {
        discountType: 'FIXED_AMOUNT',
        amount: 50,
        targetField: 'invoice.id',
        expiryDate: '2025-12-31T23:59:59Z',
      };
      expect(DiscountActionConfigSchema.parse(valid)).toEqual(valid);
    });

    it('should reject invalid discount code', () => {
      const invalid = {
        discountType: 'PERCENTAGE',
        amount: 10,
        targetField: 'invoice.id',
        code: 'invalid-code', // Contains lowercase and dash
      };
      expect(() => DiscountActionConfigSchema.parse(invalid)).toThrow();
    });
  });

  describe('WebhookActionConfigSchema', () => {
    it('should validate webhook action config', () => {
      const valid = {
        url: 'https://api.example.com/webhook',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token123',
        },
        bodyTemplate: '{"event": "{{eventType}}"}',
        timeoutMs: 5000,
      };
      expect(WebhookActionConfigSchema.parse(valid)).toEqual(valid);
    });

    it('should use default values', () => {
      const minimal = {
        url: 'https://api.example.com/webhook',
      };
      const parsed = WebhookActionConfigSchema.parse(minimal);
      expect(parsed.method).toBe('POST');
      expect(parsed.timeoutMs).toBe(5000);
    });
  });

  describe('ActionDtoSchema', () => {
    it('should validate email action', () => {
      const valid: ActionDto = {
        type: 'SEND_EMAIL',
        order: 1,
        enabled: true,
        continueOnError: false,
        config: {
          templateId: 'template-123',
          recipientField: 'patient.email',
        },
      };
      expect(ActionDtoSchema.parse(valid)).toEqual(valid);
    });

    it('should validate SMS action', () => {
      const valid: ActionDto = {
        type: 'SEND_SMS',
        order: 2,
        enabled: true,
        continueOnError: false,
        config: {
          message: 'Your appointment is tomorrow',
          recipientField: 'patient.phone',
        },
      };
      expect(ActionDtoSchema.parse(valid)).toEqual(valid);
    });

    it('should validate webhook action', () => {
      const valid: ActionDto = {
        type: 'SEND_WEBHOOK',
        order: 1,
        enabled: true,
        continueOnError: true,
        config: {
          url: 'https://api.example.com/webhook',
          method: 'POST',
        },
      };
      expect(ActionDtoSchema.parse(valid)).toEqual(valid);
    });
  });

  // ============================================================================
  // ERROR HANDLING SCHEMA TESTS
  // ============================================================================

  describe('RetryPolicySchema', () => {
    it('should validate retry policy with defaults', () => {
      const minimal = {};
      const parsed = RetryPolicySchema.parse(minimal);
      expect(parsed.maxRetries).toBe(3);
      expect(parsed.backoffStrategy).toBe('EXPONENTIAL');
      expect(parsed.backoffMultiplier).toBe(2);
      expect(parsed.initialBackoffMs).toBe(1000);
    });

    it('should validate custom retry policy', () => {
      const valid = {
        maxRetries: 5,
        backoffStrategy: 'LINEAR',
        backoffMultiplier: 1.5,
        initialBackoffMs: 2000,
      };
      expect(RetryPolicySchema.parse(valid)).toEqual(valid);
    });

    it('should reject invalid max retries', () => {
      const invalid = {
        maxRetries: 11, // Exceeds max of 10
      };
      expect(() => RetryPolicySchema.parse(invalid)).toThrow();
    });
  });

  describe('ErrorHandlingConfigSchema', () => {
    it('should validate error handling config', () => {
      const valid = {
        retryPolicy: {
          maxRetries: 3,
          backoffStrategy: 'EXPONENTIAL',
          backoffMultiplier: 2,
          initialBackoffMs: 1000,
        },
        onFailureAction: 'SEND_ALERT',
        alertRecipients: ['admin@clinic.com'],
      };
      expect(ErrorHandlingConfigSchema.parse(valid)).toEqual(valid);
    });

    it('should use default on failure action', () => {
      const minimal = {};
      const parsed = ErrorHandlingConfigSchema.parse(minimal);
      expect(parsed.onFailureAction).toBe('STOP_WORKFLOW');
    });
  });

  // ============================================================================
  // WORKFLOW SCHEMA TESTS
  // ============================================================================

  describe('CreateWorkflowDtoSchema', () => {
    it('should validate complete workflow with event trigger', () => {
      const valid: CreateWorkflowDto = {
        name: 'Appointment Reminder Workflow',
        description: 'Send reminder emails 24 hours before appointments',
        trigger: {
          type: 'EVENT_TRIGGER',
          config: {
            eventType: 'appointment.created',
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
        ],
        actions: [
          {
            type: 'SEND_EMAIL',
            order: 1,
            enabled: true,
            continueOnError: false,
            config: {
              templateId: 'appointment-reminder',
              recipientField: 'patient.email',
            },
          },
          {
            type: 'SEND_SMS',
            order: 2,
            enabled: true,
            continueOnError: true,
            config: {
              message: 'Appointment reminder: Tomorrow at {{time}}',
              recipientField: 'patient.phone',
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
        tags: ['appointments', 'reminders'],
        enabled: true,
      };

      expect(CreateWorkflowDtoSchema.parse(valid)).toEqual(valid);
    });

    it('should validate workflow with schedule trigger', () => {
      const valid: CreateWorkflowDto = {
        name: 'Daily Patient Outreach',
        trigger: {
          type: 'SCHEDULE_TRIGGER',
          config: {
            cronExpression: '0 0 9 * * 1-5',
            timezone: 'America/New_York',
          },
        },
        actions: [
          {
            type: 'SEND_EMAIL',
            order: 1,
            enabled: true,
            continueOnError: false,
            config: {
              templateId: 'daily-outreach',
              recipientField: 'patient.email',
            },
          },
        ],
        enabled: true,
      };

      expect(CreateWorkflowDtoSchema.parse(valid)).toEqual(valid);
    });

    it('should reject workflow with non-sequential action order', () => {
      const invalid = {
        name: 'Test Workflow',
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
            continueOnError: false,
            config: {
              templateId: 'test',
              recipientField: 'patient.email',
            },
          },
          {
            type: 'SEND_SMS',
            order: 3, // Should be 2
            enabled: true,
            continueOnError: false,
            config: {
              message: 'Test',
              recipientField: 'patient.phone',
            },
          },
        ],
        enabled: true,
      };

      expect(() => CreateWorkflowDtoSchema.parse(invalid)).toThrow();
    });

    it('should reject workflow with duplicate action orders', () => {
      const invalid = {
        name: 'Test Workflow',
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
            continueOnError: false,
            config: {
              templateId: 'test',
              recipientField: 'patient.email',
            },
          },
          {
            type: 'SEND_SMS',
            order: 1, // Duplicate
            enabled: true,
            continueOnError: false,
            config: {
              message: 'Test',
              recipientField: 'patient.phone',
            },
          },
        ],
        enabled: true,
      };

      expect(() => CreateWorkflowDtoSchema.parse(invalid)).toThrow();
    });

    it('should reject workflow without fallbackWorkflowId when required', () => {
      const invalid = {
        name: 'Test Workflow',
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
            continueOnError: false,
            config: {
              templateId: 'test',
              recipientField: 'patient.email',
            },
          },
        ],
        errorHandling: {
          onFailureAction: 'RUN_FALLBACK_WORKFLOW',
          // Missing fallbackWorkflowId
        },
        enabled: true,
      };

      expect(() => CreateWorkflowDtoSchema.parse(invalid)).toThrow();
    });

    it('should reject workflow without alert recipients when required', () => {
      const invalid = {
        name: 'Test Workflow',
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
            continueOnError: false,
            config: {
              templateId: 'test',
              recipientField: 'patient.email',
            },
          },
        ],
        errorHandling: {
          onFailureAction: 'SEND_ALERT',
          // Missing alertRecipients
        },
        enabled: true,
      };

      expect(() => CreateWorkflowDtoSchema.parse(invalid)).toThrow();
    });
  });

  describe('UpdateWorkflowDtoSchema', () => {
    it('should validate partial workflow update', () => {
      const valid = {
        name: 'Updated Workflow Name',
        enabled: false,
      };
      expect(UpdateWorkflowDtoSchema.parse(valid)).toEqual(valid);
    });

    it('should validate complete workflow update', () => {
      const valid = {
        name: 'Updated Workflow',
        description: 'New description',
        enabled: true,
        tags: ['updated', 'test'],
      };
      expect(UpdateWorkflowDtoSchema.parse(valid)).toEqual(valid);
    });

    it('should allow empty update', () => {
      const valid = {};
      expect(UpdateWorkflowDtoSchema.parse(valid)).toEqual(valid);
    });
  });

  describe('QueryWorkflowsDtoSchema', () => {
    it('should validate query with defaults', () => {
      const minimal = {};
      const parsed = QueryWorkflowsDtoSchema.parse(minimal);
      expect(parsed.page).toBe(1);
      expect(parsed.pageSize).toBe(20);
      expect(parsed.sortBy).toBe('createdAt');
      expect(parsed.sortOrder).toBe('desc');
    });

    it('should validate query with filters', () => {
      const valid = {
        status: 'ACTIVE',
        triggerType: 'SCHEDULE_TRIGGER',
        enabled: true,
        search: 'appointment',
        page: 2,
        pageSize: 50,
        sortBy: 'name',
        sortOrder: 'asc',
      };
      expect(QueryWorkflowsDtoSchema.parse(valid)).toEqual(valid);
    });

    it('should reject invalid page size', () => {
      const invalid = {
        pageSize: 101, // Exceeds max of 100
      };
      expect(() => QueryWorkflowsDtoSchema.parse(invalid)).toThrow();
    });
  });

  // ============================================================================
  // EXECUTION SCHEMA TESTS
  // ============================================================================

  describe('TriggerWorkflowManuallyDtoSchema', () => {
    it('should validate manual trigger with defaults', () => {
      const minimal = {};
      const parsed = TriggerWorkflowManuallyDtoSchema.parse(minimal);
      expect(parsed.dryRun).toBe(false);
    });

    it('should validate manual trigger with payload', () => {
      const valid = {
        payload: {
          patientId: '550e8400-e29b-41d4-a716-446655440000',
          appointmentId: '550e8400-e29b-41d4-a716-446655440001',
        },
        dryRun: true,
        userId: '550e8400-e29b-41d4-a716-446655440002',
      };
      expect(TriggerWorkflowManuallyDtoSchema.parse(valid)).toEqual(valid);
    });
  });

  describe('QueryWorkflowRunsDtoSchema', () => {
    it('should validate query with defaults', () => {
      const minimal = {};
      const parsed = QueryWorkflowRunsDtoSchema.parse(minimal);
      expect(parsed.page).toBe(1);
      expect(parsed.pageSize).toBe(20);
      expect(parsed.sortBy).toBe('startedAt');
      expect(parsed.sortOrder).toBe('desc');
    });

    it('should validate query with all filters', () => {
      const valid = {
        workflowId: '550e8400-e29b-41d4-a716-446655440000',
        status: 'SUCCEEDED',
        dateFrom: '2025-01-01T00:00:00Z',
        dateTo: '2025-12-31T23:59:59Z',
        triggeredBy: '550e8400-e29b-41d4-a716-446655440001',
        page: 3,
        pageSize: 50,
        sortBy: 'duration',
        sortOrder: 'asc',
      };
      expect(QueryWorkflowRunsDtoSchema.parse(valid)).toEqual(valid);
    });
  });
});
