import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import {
  ReminderConfig,
  ReminderConfigDocument,
  ReminderRule,
  QuietHours,
} from '../entities/reminder-config.schema';
import {
  MessageTemplate,
  MessageTemplateDocument,
  MessageChannel,
  Language,
} from '../entities/message-template.schema';

/**
 * DTOs for API
 */
class CreateReminderConfigDto {
  tenantId!: string;
  clinicId!: string;
  smsEnabled?: boolean;
  whatsappEnabled?: boolean;
  emailEnabled?: boolean;
  pushEnabled?: boolean;
  reminders?: ReminderRule[];
  quietHours?: QuietHours;
  respectOptOut?: boolean;
  allowConfirmationReply?: boolean;
  confirmationKeywords?: string[];
  cancellationKeywords?: string[];
}

class CreateMessageTemplateDto {
  tenantId!: string;
  name!: string;
  channel!: MessageChannel;
  language!: Language;
  subject?: string;
  content!: string;
  whatsappTemplateId?: string;
  type?: string;
}

/**
 * Reminder Configuration Controller
 *
 * Manages reminder configurations and message templates.
 */
@ApiTags('Reminder Configuration')
@Controller('reminder-config')
export class ReminderConfigController {
  private readonly logger = new Logger(ReminderConfigController.name);

  constructor(
    @InjectModel(ReminderConfig.name)
    private readonly reminderConfigModel: Model<ReminderConfigDocument>,
    @InjectModel(MessageTemplate.name)
    private readonly messageTemplateModel: Model<MessageTemplateDocument>,
  ) {}

  // ==================== Configuration Endpoints ====================

  @Get('clinics/:clinicId')
  @ApiOperation({ summary: 'Get reminder configuration for a clinic' })
  @ApiParam({ name: 'clinicId', description: 'Clinic ID' })
  @ApiResponse({ status: 200, description: 'Reminder configuration' })
  @ApiResponse({ status: 404, description: 'Configuration not found' })
  async getConfig(@Param('clinicId') clinicId: string): Promise<ReminderConfig | null> {
    return this.reminderConfigModel.findOne({ clinicId }).exec();
  }

  @Put('clinics/:clinicId')
  @ApiOperation({ summary: 'Create or update reminder configuration for a clinic' })
  @ApiParam({ name: 'clinicId', description: 'Clinic ID' })
  @ApiResponse({ status: 200, description: 'Configuration saved' })
  async saveConfig(
    @Param('clinicId') paramClinicId: string,
    @Body() dto: CreateReminderConfigDto,
  ): Promise<ReminderConfig> {
    const clinicId = dto.clinicId || paramClinicId;
    const existing = await this.reminderConfigModel.findOne({ clinicId });

    if (existing) {
      // Update existing
      Object.assign(existing, dto);
      return existing.save();
    } else {
      // Create new
      const config = new this.reminderConfigModel({
        id: uuidv4(),
        ...dto,
        clinicId,
        quietHours: dto.quietHours || {
          enabled: true,
          startTime: '21:00',
          endTime: '08:00',
          timezone: 'Europe/Bucharest',
        },
      });
      return config.save();
    }
  }

  @Post('clinics/:clinicId/test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a test reminder to verify configuration' })
  @ApiParam({ name: 'clinicId', description: 'Clinic ID' })
  @ApiResponse({ status: 200, description: 'Test reminder sent' })
  async sendTestReminder(
    @Param('clinicId') _clinicId: string,
    @Body() body: { phoneNumber: string; channel: MessageChannel },
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Sending test reminder to ${body.phoneNumber} via ${body.channel}`);

    // TODO: Implement actual test sending
    return {
      success: true,
      message: `Test reminder would be sent to ${body.phoneNumber} via ${body.channel}`,
    };
  }

  // ==================== Message Template Endpoints ====================

  @Get('templates')
  @ApiOperation({ summary: 'List all message templates' })
  @ApiResponse({ status: 200, description: 'List of templates' })
  async listTemplates(
    @Query('tenantId') tenantId?: string,
    @Query('channel') channel?: MessageChannel,
    @Query('language') language?: Language,
  ): Promise<MessageTemplate[]> {
    const filter: any = {};

    if (tenantId) filter.tenantId = tenantId;
    if (channel) filter.channel = channel;
    if (language) filter.language = language;

    return this.messageTemplateModel.find(filter).exec();
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get a message template by ID' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 200, description: 'Message template' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async getTemplate(@Param('id') id: string): Promise<MessageTemplate | null> {
    return this.messageTemplateModel.findOne({ id }).exec();
  }

  @Post('templates')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new message template' })
  @ApiResponse({ status: 201, description: 'Template created' })
  async createTemplate(@Body() dto: CreateMessageTemplateDto): Promise<MessageTemplate> {
    const template = new this.messageTemplateModel({
      id: uuidv4(),
      ...dto,
      variables: this.extractVariables(dto.content),
      isActive: true,
      isSystem: false,
    });

    return template.save();
  }

  @Put('templates/:id')
  @ApiOperation({ summary: 'Update a message template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 200, description: 'Template updated' })
  async updateTemplate(
    @Param('id') id: string,
    @Body() dto: Partial<CreateMessageTemplateDto>,
  ): Promise<MessageTemplate | null> {
    const template = await this.messageTemplateModel.findOne({ id });

    if (!template) {
      return null;
    }

    // Don't allow updating system templates
    if (template.isSystem) {
      throw new Error('Cannot update system template');
    }

    Object.assign(template, dto);

    if (dto.content) {
      template.variables = this.extractVariables(dto.content);
    }

    return template.save();
  }

  @Delete('templates/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a message template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 204, description: 'Template deleted' })
  async deleteTemplate(@Param('id') id: string): Promise<void> {
    const template = await this.messageTemplateModel.findOne({ id });

    if (!template) {
      return;
    }

    // Don't allow deleting system templates
    if (template.isSystem) {
      throw new Error('Cannot delete system template');
    }

    await this.messageTemplateModel.deleteOne({ id });
  }

  @Post('templates/:id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate a message template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 200, description: 'Template activated' })
  async activateTemplate(@Param('id') id: string): Promise<MessageTemplate | null> {
    const template = await this.messageTemplateModel.findOne({ id });

    if (!template) {
      return null;
    }

    template.isActive = true;
    return template.save();
  }

  @Post('templates/:id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate a message template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 200, description: 'Template deactivated' })
  async deactivateTemplate(@Param('id') id: string): Promise<MessageTemplate | null> {
    const template = await this.messageTemplateModel.findOne({ id });

    if (!template) {
      return null;
    }

    template.isActive = false;
    return template.save();
  }

  // ==================== Default Templates ====================

  @Post('templates/seed-defaults')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Seed default Romanian and English templates' })
  @ApiResponse({ status: 201, description: 'Default templates created' })
  async seedDefaultTemplates(@Body() body: { tenantId: string }): Promise<MessageTemplate[]> {
    const templates: MessageTemplate[] = [];

    // Romanian SMS - 24h reminder
    templates.push(
      await this.createDefaultTemplate(
        body.tenantId,
        '24h Reminder - Romanian SMS',
        'sms',
        'ro',
        'Buna ziua, {{patientName}}! Va reamintim programarea la {{clinicName}} maine, {{appointmentDate}} ora {{appointmentTime}}. Raspundeti DA pentru confirmare sau NU pentru anulare. Tel: {{clinicPhone}}',
        'reminder',
      ),
    );

    // Romanian WhatsApp - 24h reminder
    templates.push(
      await this.createDefaultTemplate(
        body.tenantId,
        '24h Reminder - Romanian WhatsApp',
        'whatsapp',
        'ro',
        `Buna ziua {{patientName}}!

Aveti o programare la *{{clinicName}}*:
📅 {{appointmentDate}}
🕐 {{appointmentTime}}
👨‍⚕️ Dr. {{providerName}}

Raspundeti:
✅ DA - pentru a confirma
❌ NU - pentru a anula

Va multumim!`,
        'reminder',
      ),
    );

    // Romanian SMS - 1h reminder
    templates.push(
      await this.createDefaultTemplate(
        body.tenantId,
        '1h Reminder - Romanian SMS',
        'sms',
        'ro',
        '{{patientName}}, programarea dvs. la {{clinicName}} incepe in 1 ora ({{appointmentTime}}). Va asteptam!',
        'reminder',
      ),
    );

    // English SMS - 24h reminder
    templates.push(
      await this.createDefaultTemplate(
        body.tenantId,
        '24h Reminder - English SMS',
        'sms',
        'en',
        'Hello {{patientName}}! Reminder: Your appointment at {{clinicName}} is tomorrow, {{appointmentDate}} at {{appointmentTime}}. Reply YES to confirm or NO to cancel. Tel: {{clinicPhone}}',
        'reminder',
      ),
    );

    return templates;
  }

  /**
   * Helper: Create default template
   */
  private async createDefaultTemplate(
    tenantId: string,
    name: string,
    channel: MessageChannel,
    language: Language,
    content: string,
    type: string,
  ): Promise<MessageTemplate> {
    const template = new this.messageTemplateModel({
      id: uuidv4(),
      tenantId,
      name,
      channel,
      language,
      content,
      variables: this.extractVariables(content),
      isActive: true,
      isSystem: true, // Mark as system template
      type,
    });

    return template.save();
  }

  /**
   * Helper: Extract variables from template content
   */
  private extractVariables(content: string): string[] {
    const regex = /\{\{(\w+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables;
  }
}
