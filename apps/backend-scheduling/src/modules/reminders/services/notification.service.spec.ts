import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';

import { NotificationService, TenantContext, PatientInfo } from './notification.service';
import { PatientNotification } from '../entities/patient-notification.schema';
import { MessageTemplate } from '../entities/message-template.schema';
import { SmsService } from './sms.service';
import { WhatsAppService } from './whatsapp.service';
import { TemplateRendererService } from './template-renderer.service';
import { SendNotificationDto, NotificationChannel } from '../dto/send-notification.dto';

describe('NotificationService', () => {
  let service: NotificationService;
  let notificationModel: Model<PatientNotification>;
  let templateModel: Model<MessageTemplate>;
  let smsService: SmsService;
  let whatsAppService: WhatsAppService;
  let templateRenderer: TemplateRendererService;
  let eventEmitter: EventEmitter2;

  const mockTenantContext: TenantContext = {
    tenantId: 'tenant-123',
    clinicId: 'clinic-123',
    userId: 'user-123',
    userName: 'Dr. Test',
  };

  const mockPatient: PatientInfo = {
    id: 'patient-123',
    firstName: 'Ion',
    lastName: 'Popescu',
    primaryPhone: '+40721234567',
    primaryEmail: 'ion@example.com',
    canSms: true,
    canWhatsApp: true,
    canEmail: true,
    marketingConsent: {
      sms: true,
      whatsapp: true,
      email: true,
    },
  };

  const mockTemplate = {
    id: 'template-123',
    tenantId: 'tenant-123',
    name: 'Test Template',
    channel: 'sms',
    language: 'ro',
    content: 'Hello {{patientName}}!',
    variables: ['patientName'],
    isActive: true,
    type: 'custom_message',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getModelToken(PatientNotification.name),
          useValue: {
            new: jest.fn(),
            constructor: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            countDocuments: jest.fn(),
            exec: jest.fn(),
          },
        },
        {
          provide: getModelToken(MessageTemplate.name),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: SmsService,
          useValue: {
            sendSms: jest.fn(),
          },
        },
        {
          provide: WhatsAppService,
          useValue: {
            sendMessage: jest.fn(),
          },
        },
        {
          provide: TemplateRendererService,
          useValue: {
            render: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    notificationModel = module.get<Model<PatientNotification>>(
      getModelToken(PatientNotification.name),
    );
    templateModel = module.get<Model<MessageTemplate>>(getModelToken(MessageTemplate.name));
    smsService = module.get<SmsService>(SmsService);
    whatsAppService = module.get<WhatsAppService>(WhatsAppService);
    templateRenderer = module.get<TemplateRendererService>(TemplateRendererService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendNotification', () => {
    it('should throw BadRequestException if both templateId and customMessage are missing', async () => {
      const dto: SendNotificationDto = {
        channel: NotificationChannel.SMS,
      };

      await expect(
        service.sendNotification('patient-123', dto, mockTenantContext),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if both templateId and customMessage are provided', async () => {
      const dto: SendNotificationDto = {
        channel: NotificationChannel.SMS,
        templateId: 'template-123',
        customMessage: 'Hello',
      };

      await expect(
        service.sendNotification('patient-123', dto, mockTenantContext),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if subject is missing for email', async () => {
      const dto: SendNotificationDto = {
        channel: NotificationChannel.EMAIL,
        customMessage: 'Hello',
      };

      await expect(
        service.sendNotification('patient-123', dto, mockTenantContext),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully send SMS with custom message', async () => {
      const dto: SendNotificationDto = {
        channel: NotificationChannel.SMS,
        customMessage: 'Test message',
      };

      // Mock getPatientInfo
      jest.spyOn(service as any, 'getPatientInfo').mockResolvedValue(mockPatient);

      // Mock checkConsent
      jest.spyOn(service as any, 'checkConsent').mockResolvedValue(undefined);

      // Mock checkRateLimits
      jest.spyOn(service as any, 'checkRateLimits').mockResolvedValue(undefined);

      // Mock createNotificationRecord
      const mockNotification = {
        id: 'notification-123',
        status: 'queued',
        channel: 'sms',
        queuedAt: new Date(),
        save: jest.fn().mockResolvedValue(undefined),
      };
      jest
        .spyOn(service as any, 'createNotificationRecord')
        .mockResolvedValue(mockNotification);

      // Mock sendNotificationNow
      jest.spyOn(service as any, 'sendNotificationNow').mockResolvedValue(undefined);

      const result = await service.sendNotification('patient-123', dto, mockTenantContext);

      expect(result).toHaveProperty('id', 'notification-123');
      expect(result).toHaveProperty('status', 'queued');
      expect(result).toHaveProperty('channel', 'sms');
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'notification.queued',
        expect.any(Object),
      );
    });

    it('should successfully send notification with template', async () => {
      const dto: SendNotificationDto = {
        channel: NotificationChannel.SMS,
        templateId: 'template-123',
        variables: { patientName: 'Ion Popescu' },
      };

      jest.spyOn(service as any, 'getPatientInfo').mockResolvedValue(mockPatient);
      jest.spyOn(service as any, 'checkConsent').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'checkRateLimits').mockResolvedValue(undefined);

      // Mock getTemplate
      jest.spyOn(service as any, 'getTemplate').mockResolvedValue(mockTemplate);

      // Mock prepareVariables
      jest.spyOn(service as any, 'prepareVariables').mockResolvedValue({
        patientName: 'Ion Popescu',
      });

      // Mock template renderer
      jest.spyOn(templateRenderer, 'render').mockReturnValue('Hello Ion Popescu!');

      const mockNotification = {
        id: 'notification-123',
        status: 'queued',
        channel: 'sms',
        queuedAt: new Date(),
        save: jest.fn(),
      };
      jest
        .spyOn(service as any, 'createNotificationRecord')
        .mockResolvedValue(mockNotification);
      jest.spyOn(service as any, 'sendNotificationNow').mockResolvedValue(undefined);

      const result = await service.sendNotification('patient-123', dto, mockTenantContext);

      expect(result.id).toBe('notification-123');
      expect(templateRenderer.render).toHaveBeenCalledWith(
        mockTemplate.content,
        expect.any(Object),
      );
    });
  });

  describe('sendBulkNotifications', () => {
    it('should throw BadRequestException if both patientIds and patientFilter are missing', async () => {
      const dto: any = {
        channel: NotificationChannel.SMS,
        templateId: 'template-123',
      };

      await expect(service.sendBulkNotifications(dto, mockTenantContext)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if both patientIds and patientFilter are provided', async () => {
      const dto: any = {
        patientIds: ['patient-1'],
        patientFilter: { status: ['active'] },
        channel: NotificationChannel.SMS,
        templateId: 'template-123',
      };

      await expect(service.sendBulkNotifications(dto, mockTenantContext)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should successfully send bulk notifications to multiple patients', async () => {
      const dto: any = {
        patientIds: ['patient-1', 'patient-2'],
        channel: NotificationChannel.SMS,
        templateId: 'template-123',
      };

      const mockPatients = [
        { ...mockPatient, id: 'patient-1' },
        { ...mockPatient, id: 'patient-2' },
      ];

      jest.spyOn(service as any, 'getPatientsByIds').mockResolvedValue(mockPatients);
      jest.spyOn(service as any, 'getTemplate').mockResolvedValue(mockTemplate);
      jest.spyOn(service as any, 'checkConsent').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'checkRateLimits').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'prepareVariables').mockResolvedValue({});
      jest.spyOn(templateRenderer, 'render').mockReturnValue('Test message');

      const mockNotification = {
        id: 'notification-123',
        status: 'queued',
        save: jest.fn(),
      };
      jest
        .spyOn(service as any, 'createNotificationRecord')
        .mockResolvedValue(mockNotification);
      jest.spyOn(service as any, 'sendNotificationNow').mockResolvedValue(undefined);

      const result = await service.sendBulkNotifications(dto, mockTenantContext);

      expect(result.notificationsCreated).toBe(2);
      expect(result.failedCount).toBe(0);
      expect(result.notificationIds).toHaveLength(2);
    });
  });

  describe('consent checking', () => {
    it('should throw BadRequestException if patient opted out of SMS', async () => {
      const patientNoSms = { ...mockPatient, canSms: false };

      await expect(
        (service as any).checkConsent(patientNoSms, NotificationChannel.SMS, 'custom_message'),
      ).rejects.toThrow('Patient has opted out of SMS notifications');
    });

    it('should throw BadRequestException if no marketing consent for marketing messages', async () => {
      const patientNoMarketing = {
        ...mockPatient,
        marketingConsent: { sms: false, whatsapp: true, email: true },
      };

      await expect(
        (service as any).checkConsent(patientNoMarketing, NotificationChannel.SMS, 'marketing_campaign'),
      ).rejects.toThrow('Patient has not consented to marketing messages via sms');
    });

    it('should pass consent check for transactional messages', async () => {
      await expect(
        (service as any).checkConsent(mockPatient, NotificationChannel.SMS, 'appointment_reminder'),
      ).resolves.not.toThrow();
    });
  });

  describe('rate limiting', () => {
    it('should throw BadRequestException if daily limit exceeded', async () => {
      // Mock countDocuments to return limit + 1
      jest.spyOn(notificationModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValue(6), // Daily limit is 5 for SMS
      } as any);

      await expect(
        (service as any).checkRateLimits('patient-123', NotificationChannel.SMS, 'tenant-123'),
      ).rejects.toThrow('Daily sms limit exceeded');
    });

    it('should pass rate limit check if under limit', async () => {
      jest.spyOn(notificationModel, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValue(2),
      } as any);

      await expect(
        (service as any).checkRateLimits('patient-123', NotificationChannel.SMS, 'tenant-123'),
      ).resolves.not.toThrow();
    });
  });

  describe('quick send methods', () => {
    it('should send quick SMS', async () => {
      const dto = { message: 'Quick SMS test' };

      jest.spyOn(service as any, 'getPatientInfo').mockResolvedValue(mockPatient);
      jest.spyOn(service as any, 'checkConsent').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'checkRateLimits').mockResolvedValue(undefined);

      const mockNotification = {
        id: 'notification-123',
        status: 'queued',
        channel: 'sms',
        queuedAt: new Date(),
        save: jest.fn(),
      };
      jest
        .spyOn(service as any, 'createNotificationRecord')
        .mockResolvedValue(mockNotification);
      jest.spyOn(service as any, 'sendNotificationNow').mockResolvedValue(undefined);

      const result = await service.sendQuickSms('patient-123', dto, mockTenantContext);

      expect(result.channel).toBe('sms');
    });

    it('should send quick WhatsApp', async () => {
      const dto = { message: 'Quick WhatsApp test' };

      jest.spyOn(service as any, 'getPatientInfo').mockResolvedValue(mockPatient);
      jest.spyOn(service as any, 'checkConsent').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'checkRateLimits').mockResolvedValue(undefined);

      const mockNotification = {
        id: 'notification-123',
        status: 'queued',
        channel: 'whatsapp',
        queuedAt: new Date(),
        save: jest.fn(),
      };
      jest
        .spyOn(service as any, 'createNotificationRecord')
        .mockResolvedValue(mockNotification);
      jest.spyOn(service as any, 'sendNotificationNow').mockResolvedValue(undefined);

      const result = await service.sendQuickWhatsApp('patient-123', dto, mockTenantContext);

      expect(result.channel).toBe('whatsapp');
    });
  });

  describe('previewNotification', () => {
    it('should generate notification preview with variables', async () => {
      const dto = {
        patientId: 'patient-123',
        templateId: 'template-123',
        variables: { appointmentDate: '25 Jan 2025' },
      };

      jest.spyOn(service as any, 'getPatientInfo').mockResolvedValue(mockPatient);
      jest.spyOn(service as any, 'getTemplate').mockResolvedValue(mockTemplate);
      jest.spyOn(service as any, 'prepareVariables').mockResolvedValue({
        patientName: 'Ion Popescu',
        appointmentDate: '25 Jan 2025',
      });
      jest.spyOn(templateRenderer, 'render').mockReturnValue('Hello Ion Popescu!');

      const result = await service.previewNotification(dto, mockTenantContext);

      expect(result.content).toBe('Hello Ion Popescu!');
      expect(result.channel).toBe('sms');
      expect(result.characterCount).toBeGreaterThan(0);
      expect(result.variables).toHaveProperty('patientName');
    });
  });

  describe('getPatientNotifications', () => {
    it('should retrieve patient notification history', async () => {
      const mockNotifications = [
        { id: 'notif-1', channel: 'sms' },
        { id: 'notif-2', channel: 'whatsapp' },
      ];

      jest.spyOn(notificationModel, 'find').mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockNotifications),
      } as any);

      const result = await service.getPatientNotifications(
        'patient-123',
        'tenant-123',
        50,
        0,
      );

      expect(result).toHaveLength(2);
      expect(notificationModel.find).toHaveBeenCalledWith({
        tenantId: 'tenant-123',
        patientId: 'patient-123',
      });
    });
  });

  describe('getNotificationById', () => {
    it('should retrieve notification by ID', async () => {
      const mockNotification = { id: 'notif-123', channel: 'sms' };

      jest.spyOn(notificationModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockNotification),
      } as any);

      const result = await service.getNotificationById('notif-123', 'tenant-123');

      expect(result).toEqual(mockNotification);
    });

    it('should throw NotFoundException if notification not found', async () => {
      jest.spyOn(notificationModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        service.getNotificationById('notif-123', 'tenant-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
