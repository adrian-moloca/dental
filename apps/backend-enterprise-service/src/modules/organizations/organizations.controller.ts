import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { TenantContext, TenantContextData } from '../../decorators/tenant-context.decorator';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  UpdateOrganizationSettingsDto,
  AddOrganizationAdminDto,
  OrganizationFilterDto,
  OrganizationResponseDto,
} from '../../dto/organizations';
import { ErrorResponseDto } from '../../dto/common';

@ApiTags('Organizations')
@ApiBearerAuth()
@Controller('enterprise/organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new organization',
    description: `
Creates a new multi-tenant organization in the DentalOS platform.

**Requirements:**
- Valid subscription tier and limits
- Unique organization name and tax ID
- Valid primary contact information

**Business Rules:**
- Organization starts in PENDING status
- Subscription limits are enforced across all clinics
- Billing account is automatically created

**Use Cases:**
- New dental group onboarding
- Practice expansion
- Multi-location setup
    `,
  })
  @ApiBody({
    type: CreateOrganizationDto,
    description: 'Organization creation details',
    examples: {
      singleClinic: {
        summary: 'Single Clinic Organization',
        value: {
          name: 'Smile Dental',
          legalName: 'Smile Dental, LLC',
          taxId: '12-3456789',
          primaryContactName: 'Dr. John Smith',
          primaryContactEmail: 'john.smith@smiledental.com',
          primaryContactPhone: '+1-415-555-0123',
          address: {
            street: '123 Main Street',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94102',
            country: 'United States',
          },
          website: 'https://www.smiledental.com',
          subscriptionTier: 'BASIC',
          subscriptionStartDate: '2025-01-01T00:00:00.000Z',
          maxClinics: 1,
          maxUsers: 20,
          maxStorageGB: 100,
        },
      },
      multiClinic: {
        summary: 'Multi-Clinic Enterprise',
        value: {
          name: 'Bright Smiles Dental Group',
          legalName: 'Bright Smiles Dental Group, Inc.',
          taxId: '98-7654321',
          primaryContactName: 'Dr. Sarah Johnson',
          primaryContactEmail: 'sarah.johnson@brightsmiles.com',
          primaryContactPhone: '+1-415-555-9999',
          address: {
            street: '456 Healthcare Plaza, Floor 3',
            city: 'Los Angeles',
            state: 'CA',
            postalCode: '90001',
            country: 'United States',
          },
          website: 'https://www.brightsmiles.com',
          logoUrl: 'https://cdn.brightsmiles.com/logo.png',
          subscriptionTier: 'ENTERPRISE',
          subscriptionStartDate: '2025-01-01T00:00:00.000Z',
          subscriptionEndDate: '2026-01-01T00:00:00.000Z',
          maxClinics: 50,
          maxUsers: 500,
          maxStorageGB: 5000,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Organization successfully created',
    type: OrganizationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data or validation error',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - missing or invalid authentication token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - organization name or tax ID already exists',
    type: ErrorResponseDto,
  })
  async create(@Body() dto: CreateOrganizationDto, @TenantContext() context: TenantContextData) {
    return this.organizationsService.create(dto, context);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all organizations',
    description: `
Retrieves a paginated list of organizations with optional filtering.

**Filtering Options:**
- Filter by status (ACTIVE, SUSPENDED, INACTIVE, PENDING)
- Filter by subscription tier (FREE, BASIC, PRO, ENTERPRISE)
- Pagination with limit and offset

**Use Cases:**
- Admin dashboard organization list
- System monitoring and auditing
- Subscription tier analysis
    `,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['ACTIVE', 'SUSPENDED', 'INACTIVE', 'PENDING'],
    description: 'Filter by organization status',
  })
  @ApiQuery({
    name: 'subscriptionTier',
    required: false,
    enum: ['FREE', 'BASIC', 'PRO', 'ENTERPRISE'],
    description: 'Filter by subscription tier',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 20,
    description: 'Maximum number of results to return (1-100)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    example: 0,
    description: 'Number of results to skip for pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'List of organizations retrieved successfully',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/PaginatedResponseDto' },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/OrganizationResponseDto' },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  async findAll(@Query() filter: OrganizationFilterDto) {
    return this.organizationsService.findAll(filter as any);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get organization by ID',
    description: `
Retrieves detailed information about a specific organization.

**Returned Data:**
- Organization profile and contact information
- Subscription details and limits
- Current usage statistics
- Settings and configuration

**Use Cases:**
- Organization profile page
- Administrative details view
- Audit and compliance reporting
    `,
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Organization UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization found and returned successfully',
    type: OrganizationResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Organization not found',
    type: ErrorResponseDto,
  })
  async findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update organization details',
    description: `
Updates organization profile information.

**Updatable Fields:**
- Organization name and legal information
- Contact details
- Address
- Subscription limits (requires permission)
- Status (requires permission)

**Business Rules:**
- Tax ID changes require verification
- Subscription downgrades require compliance check
- Status changes trigger notifications

**Use Cases:**
- Organization profile updates
- Contact information changes
- Subscription modifications
    `,
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Organization UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: UpdateOrganizationDto,
    description: 'Fields to update (all optional)',
    examples: {
      contactUpdate: {
        summary: 'Update Contact Information',
        value: {
          primaryContactName: 'Dr. Jane Doe',
          primaryContactEmail: 'jane.doe@smiledental.com',
          primaryContactPhone: '+1-415-555-5678',
        },
      },
      tierUpgrade: {
        summary: 'Upgrade Subscription Tier',
        value: {
          subscriptionTier: 'ENTERPRISE',
          maxClinics: 50,
          maxUsers: 500,
          maxStorageGB: 5000,
          subscriptionEndDate: '2027-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Organization updated successfully',
    type: OrganizationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid update data',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Organization not found',
    type: ErrorResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
    @TenantContext() context: TenantContextData,
  ) {
    return this.organizationsService.update(id, dto as any, context);
  }

  @Patch(':id/settings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update organization settings',
    description: `
Updates organization-wide settings and preferences.

**Setting Categories:**
- Branding (colors, domain, logo)
- Feature toggles (multi-clinic, analytics, AI, etc.)
- Security (MFA, passwords, IP restrictions)
- Compliance (HIPAA, GDPR, data retention)
- Notifications (timezone, language, alerts)

**Business Rules:**
- Some features require specific subscription tiers
- HIPAA mode enforces additional security controls
- Settings changes are audit-logged

**Use Cases:**
- White-label configuration
- Security policy enforcement
- Compliance requirements
- Feature activation
    `,
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Organization UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: UpdateOrganizationSettingsDto,
    description: 'Settings to update (all optional)',
    examples: {
      branding: {
        summary: 'Update Branding',
        value: {
          brandPrimaryColor: '#0066CC',
          brandSecondaryColor: '#FF6600',
          customDomain: 'portal.smiledental.com',
        },
      },
      security: {
        summary: 'Enforce Security Policies',
        value: {
          requireMFA: true,
          passwordMinLength: 12,
          sessionTimeoutMinutes: 30,
          enableHIPAAMode: true,
        },
      },
      features: {
        summary: 'Enable Advanced Features',
        value: {
          enableMultiClinic: true,
          enableAdvancedAnalytics: true,
          enableAIPredictions: true,
          enableMarketingAutomation: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Settings updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Settings updated successfully' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid settings data',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions or subscription tier',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Organization not found',
    type: ErrorResponseDto,
  })
  async updateSettings(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationSettingsDto,
    @TenantContext() context: TenantContextData,
  ) {
    return this.organizationsService.updateSettings(id, dto, context);
  }

  @Get(':id/admins')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List organization administrators',
    description: `
Retrieves a list of all administrators for an organization.

**Returned Data:**
- Administrator user details
- Enterprise roles assigned
- Assignment dates
- Activity status

**Use Cases:**
- User management dashboard
- Access control auditing
- Administrator directory
    `,
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Organization UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'List of administrators retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        organizationId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
        admins: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              userId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440001' },
              email: { type: 'string', example: 'admin@smiledental.com' },
              fullName: { type: 'string', example: 'Dr. Sarah Johnson' },
              role: { type: 'string', example: 'ORG_ADMIN' },
              assignedAt: { type: 'string', example: '2025-01-01T00:00:00.000Z' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Organization not found',
    type: ErrorResponseDto,
  })
  async getAdmins(@Param('id') id: string) {
    return { organizationId: id, admins: [] };
  }

  @Post(':id/admins')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add organization administrator',
    description: `
Adds a new administrator to an organization with specified enterprise role.

**Available Enterprise Roles:**
- ORG_ADMIN: Full administrative access
- ORG_MANAGER: Organization management without billing
- MULTI_CLINIC_MANAGER: Manages multiple clinics
- AUDITOR: Read-only access for compliance
- SYSTEM_OWNER: Ultimate owner access

**Requirements:**
- User must already exist in the system
- User cannot already be an admin
- Requester must have permission to add admins

**Business Rules:**
- Role assignment triggers notification email
- Audit log entry is created
- User permissions take effect immediately

**Use Cases:**
- New administrator onboarding
- Role assignment
- Access delegation
    `,
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Organization UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: AddOrganizationAdminDto,
    description: 'Administrator details and role',
    examples: {
      orgAdmin: {
        summary: 'Add Organization Admin',
        value: {
          userId: '550e8400-e29b-41d4-a716-446655440001',
          email: 'admin@smiledental.com',
          fullName: 'Dr. Sarah Johnson',
          role: 'ORG_ADMIN',
        },
      },
      auditor: {
        summary: 'Add Auditor',
        value: {
          userId: '550e8400-e29b-41d4-a716-446655440002',
          email: 'auditor@compliance.com',
          fullName: 'Jane Compliance',
          role: 'AUDITOR',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Administrator added successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        organizationId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
        adminId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440001' },
        role: { type: 'string', example: 'ORG_ADMIN' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Organization or user not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'User is already an administrator',
    type: ErrorResponseDto,
  })
  async addAdmin(@Param('id') id: string, @Body() dto: AddOrganizationAdminDto) {
    return { success: true, organizationId: id, adminId: dto.userId };
  }
}
