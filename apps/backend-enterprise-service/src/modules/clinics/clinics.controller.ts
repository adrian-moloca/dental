import { Controller, Get, Post, Patch, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ClinicsService } from './clinics.service';
import { TenantContext, TenantContextData } from '../../decorators/tenant-context.decorator';
import {
  CreateClinicDto,
  UpdateClinicDto,
  UpdateClinicSettingsDto,
  CreateClinicLocationDto,
  ClinicResponseDto,
  UpdateClinicFiscalSettingsDto,
  ClinicFiscalSettingsResponseDto,
} from '../../dto/clinics';
import { ErrorResponseDto } from '../../dto/common';

@ApiTags('Clinics')
@ApiBearerAuth()
@Controller('enterprise')
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) {}

  @Post('organizations/:orgId/clinics')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create clinic for organization',
    description: `
Creates a new clinic within an organization.

**Requirements:**
- Valid organization ID
- Unique clinic code
- Organization must not exceed maxClinics limit
- Valid address and contact information

**Business Rules:**
- Clinic starts in PENDING_SETUP status
- Clinic inherits some settings from organization
- Default manager is assigned if provided
- Operating hours can be customized per clinic

**Use Cases:**
- Opening new clinic location
- Branch expansion
- Multi-location practice setup
    `,
  })
  @ApiParam({
    name: 'orgId',
    type: String,
    description: 'Organization UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: CreateClinicDto,
    description: 'Clinic creation details',
    examples: {
      basic: {
        summary: 'Basic Clinic',
        value: {
          name: 'Smile Dental - Downtown',
          code: 'SDG-DT-001',
          address: {
            street: '123 Main Street',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94102',
            country: 'United States',
          },
          phone: '+1-415-555-1000',
          email: 'downtown@smiledental.com',
          timezone: 'America/Los_Angeles',
          locale: 'en-US',
        },
      },
      full: {
        summary: 'Complete Clinic Setup',
        value: {
          name: 'Smile Dental - Uptown',
          code: 'SDG-UT-001',
          address: {
            street: '456 Healthcare Plaza, Suite 300',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94103',
            country: 'United States',
          },
          phone: '+1-415-555-2000',
          email: 'uptown@smiledental.com',
          website: 'https://uptown.smiledental.com',
          managerUserId: '550e8400-e29b-41d4-a716-446655440001',
          managerName: 'Dr. Emily Rodriguez',
          managerEmail: 'emily.rodriguez@smiledental.com',
          timezone: 'America/Los_Angeles',
          locale: 'en-US',
          operatingHours: {
            monday: { open: '09:00', close: '17:00' },
            tuesday: { open: '09:00', close: '17:00' },
            wednesday: { open: '09:00', close: '17:00' },
            thursday: { open: '09:00', close: '17:00' },
            friday: { open: '09:00', close: '17:00' },
          },
          licenseNumber: 'DL-CA-123456',
          accreditationDetails: 'ADA Accredited',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Clinic created successfully',
    type: ClinicResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data or validation error',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - organization has reached max clinics limit',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Organization not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - clinic code already exists',
    type: ErrorResponseDto,
  })
  async create(
    @Param('orgId') orgId: string,
    @Body() dto: CreateClinicDto,
    @TenantContext() context: TenantContextData,
  ) {
    return this.clinicsService.create(orgId, dto as any, context);
  }

  @Get('organizations/:orgId/clinics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all clinics for organization',
    description: `
Retrieves a list of all clinics belonging to a specific organization.

**Returned Data:**
- Clinic details (name, code, address)
- Status and manager information
- Contact information
- Operating hours

**Use Cases:**
- Organization clinic directory
- Multi-location management
- Clinic selection in UI
    `,
  })
  @ApiParam({
    name: 'orgId',
    type: String,
    description: 'Organization UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'List of clinics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/ClinicResponseDto' },
        },
        total: { type: 'number', example: 5 },
        limit: { type: 'number', example: 100 },
        offset: { type: 'number', example: 0 },
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
  async findAllForOrg(@Param('orgId') orgId: string) {
    return this.clinicsService.findAll({ organizationId: orgId, limit: 100, offset: 0 });
  }

  @Get('clinics/:clinicId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get clinic by ID',
    description: `
Retrieves detailed information about a specific clinic.

**Returned Data:**
- Complete clinic profile
- Contact and address information
- Manager details
- Operating hours and settings
- License and accreditation info

**Use Cases:**
- Clinic profile page
- Clinic management dashboard
- Administrative view
    `,
  })
  @ApiParam({
    name: 'clinicId',
    type: String,
    description: 'Clinic UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Clinic found and returned successfully',
    type: ClinicResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Clinic not found',
    type: ErrorResponseDto,
  })
  async findOne(@Param('clinicId') clinicId: string) {
    return this.clinicsService.findOne(clinicId);
  }

  @Patch('clinics/:clinicId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update clinic details',
    description: `
Updates clinic profile information.

**Updatable Fields:**
- Basic information (name, code)
- Address and contact details
- Manager assignment
- Operating hours
- License and accreditation
- Status (with permissions)

**Business Rules:**
- Code changes must maintain uniqueness
- Status changes may trigger notifications
- Manager changes update permissions

**Use Cases:**
- Clinic profile updates
- Relocation or rebranding
- Manager assignment
- License renewal
    `,
  })
  @ApiParam({
    name: 'clinicId',
    type: String,
    description: 'Clinic UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: UpdateClinicDto,
    description: 'Fields to update (all optional)',
    examples: {
      basic: {
        summary: 'Update Basic Info',
        value: {
          name: 'Smile Dental - Downtown (Renovated)',
          phone: '+1-415-555-3000',
          email: 'downtown-new@smiledental.com',
        },
      },
      statusChange: {
        summary: 'Activate Clinic',
        value: {
          status: 'ACTIVE',
          managerUserId: '550e8400-e29b-41d4-a716-446655440001',
          managerName: 'Dr. Sarah Chen',
          managerEmail: 'sarah.chen@smiledental.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Clinic updated successfully',
    type: ClinicResponseDto,
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
    description: 'Clinic not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - code already in use',
    type: ErrorResponseDto,
  })
  async update(
    @Param('clinicId') clinicId: string,
    @Body() dto: UpdateClinicDto,
    @TenantContext() context: TenantContextData,
  ) {
    return this.clinicsService.update(clinicId, dto, context);
  }

  @Patch('clinics/:clinicId/settings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update clinic settings',
    description: `
Updates clinic-specific operational settings.

**Setting Categories:**
- Scheduling (appointments, booking, cancellation)
- Billing (currency, payment methods, invoicing)
- Clinical (EHR, consent, documentation)
- Inventory (tracking, auto-reorder, thresholds)
- Sterilization (tracking, compliance)
- Marketing (loyalty, referrals)
- Notifications (reminders, follow-ups)

**Business Rules:**
- Some features require organization-level enablement
- Setting changes may affect existing workflows
- Compliance settings require audit logging

**Use Cases:**
- Clinic configuration
- Operational customization
- Feature activation per clinic
- Workflow optimization
    `,
  })
  @ApiParam({
    name: 'clinicId',
    type: String,
    description: 'Clinic UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: UpdateClinicSettingsDto,
    description: 'Settings to update (all optional)',
    examples: {
      scheduling: {
        summary: 'Configure Scheduling',
        value: {
          defaultAppointmentDurationMinutes: 30,
          allowOnlineBooking: true,
          requireDepositForBooking: true,
          depositPercentage: 20,
          cancellationPolicyHours: 24,
        },
      },
      billing: {
        summary: 'Configure Billing',
        value: {
          defaultCurrency: 'USD',
          acceptedPaymentMethods: ['CASH', 'CREDIT_CARD', 'INSURANCE'],
          invoicePrefix: 'SDG-DT',
          taxRate: 8.5,
          sendAutomaticReminders: true,
        },
      },
      features: {
        summary: 'Enable Features',
        value: {
          enableInventoryTracking: true,
          enableSterilizationTracking: true,
          enableLoyaltyProgram: true,
          loyaltyPointsPerDollar: 1.5,
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
        message: { type: 'string', example: 'Clinic settings updated successfully' },
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
    description: 'Forbidden - feature not available for organization tier',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Clinic not found',
    type: ErrorResponseDto,
  })
  async updateSettings(
    @Param('clinicId') clinicId: string,
    @Body() dto: UpdateClinicSettingsDto,
    @TenantContext() context: TenantContextData,
  ) {
    return this.clinicsService.updateSettings(clinicId, dto, context);
  }

  // ============================================
  // Fiscal Settings (E-Factura Romania)
  // ============================================

  @Get('clinics/:clinicId/fiscal-settings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get clinic fiscal settings',
    description: `
Retrieves the Romanian fiscal settings for a clinic.

**Used For:**
- E-Factura electronic invoicing to ANAF
- Invoice generation with proper seller information
- VAT and tax configuration

**Returned Data:**
- CUI (Cod Unic de Identificare)
- Legal name and trade name
- Registration number (Registrul Comerțului)
- VAT payer status
- Bank account (IBAN)
- Fiscal address
- E-Factura configuration status

**Use Cases:**
- Viewing fiscal configuration before invoicing
- Checking E-Factura readiness
- Administrative settings review
    `,
  })
  @ApiParam({
    name: 'clinicId',
    type: String,
    description: 'Clinic UUID or MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Fiscal settings retrieved successfully',
    type: ClinicFiscalSettingsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Clinic not found',
    type: ErrorResponseDto,
  })
  async getFiscalSettings(@Param('clinicId') clinicId: string) {
    return this.clinicsService.getFiscalSettings(clinicId);
  }

  @Patch('clinics/:clinicId/fiscal-settings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update clinic fiscal settings',
    description: `
Updates the Romanian fiscal settings for a clinic.

**Required for E-Factura:**
- CUI (tax identification number)
- Legal name (as registered)
- Fiscal address (street, city, country)

**Optional but Recommended:**
- Trade name
- Registration number (Nr. Reg. Com.)
- IBAN and bank name
- Fiscal contact information

**Business Rules:**
- CUI format is validated (RO followed by 2-10 digits)
- Registration number format is validated (J##/####/YYYY)
- IBAN format is validated
- Changes are audited for compliance

**Use Cases:**
- Initial fiscal setup for new clinic
- Updating bank account information
- Enabling E-Factura for the clinic
- Address correction for invoicing
    `,
  })
  @ApiParam({
    name: 'clinicId',
    type: String,
    description: 'Clinic UUID or MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: UpdateClinicFiscalSettingsDto,
    description: 'Fiscal settings to update (all fields optional)',
    examples: {
      minimal: {
        summary: 'Minimal E-Factura Setup',
        value: {
          cui: 'RO12345678',
          legalName: 'Clinica Dentară Smile SRL',
          fiscalAddress: {
            streetName: 'Strada Victoriei 123',
            city: 'București',
            countryCode: 'RO',
          },
        },
      },
      complete: {
        summary: 'Complete Fiscal Setup',
        value: {
          cui: 'RO12345678',
          legalName: 'Clinica Dentară Smile SRL',
          tradeName: 'Smile Dental',
          regCom: 'J40/1234/2020',
          isVatPayer: true,
          defaultVatRate: 0.19,
          iban: 'RO49AAAA1B31007593840000',
          bankName: 'Banca Transilvania',
          invoiceSeries: 'DENT',
          invoiceStartNumber: 1,
          eFacturaEnabled: true,
          fiscalAddress: {
            streetName: 'Strada Victoriei 123',
            additionalStreetName: 'Bloc A, Etaj 2',
            city: 'București',
            county: 'Sector 1',
            postalCode: '010101',
            countryCode: 'RO',
          },
          fiscalContact: {
            name: 'Ion Popescu',
            phone: '+40212345678',
            email: 'contabilitate@smiledental.ro',
          },
        },
      },
      vatExempt: {
        summary: 'VAT Exempt Clinic (Medical Services)',
        value: {
          cui: 'RO87654321',
          legalName: 'Cabinet Medical Individual Dr. Ionescu',
          isVatPayer: false,
          defaultVatRate: 0,
          fiscalAddress: {
            streetName: 'Bulevardul Unirii 45',
            city: 'Cluj-Napoca',
            county: 'Cluj',
            countryCode: 'RO',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Fiscal settings updated successfully',
    type: ClinicFiscalSettingsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid fiscal data (CUI format, IBAN, etc.)',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Clinic not found',
    type: ErrorResponseDto,
  })
  async updateFiscalSettings(
    @Param('clinicId') clinicId: string,
    @Body() dto: UpdateClinicFiscalSettingsDto,
    @TenantContext() context: TenantContextData,
  ) {
    return this.clinicsService.updateFiscalSettings(clinicId, dto, context);
  }

  @Get('clinics/:clinicId/efactura-seller-info')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get E-Factura seller info',
    description: `
Retrieves the seller information in the format needed for E-Factura XML generation.

**Internal API:** Used by billing-service to generate UBL 2.1 invoices.

**Returns:**
- CUI with RO prefix
- Legal name
- Formatted address for UBL
- Bank account information
- Contact details

**Throws 404 if:**
- Clinic not found
- Fiscal settings not configured
- Required fields missing (CUI, legalName, address)
    `,
  })
  @ApiParam({
    name: 'clinicId',
    type: String,
    description: 'Clinic UUID or MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Seller info for E-Factura returned successfully',
    schema: {
      type: 'object',
      properties: {
        cui: { type: 'string', example: 'RO12345678' },
        legalName: { type: 'string', example: 'Clinica Dentară Smile SRL' },
        tradeName: { type: 'string', example: 'Smile Dental' },
        regCom: { type: 'string', example: 'J40/1234/2020' },
        iban: { type: 'string', example: 'RO49AAAA1B31007593840000' },
        bankName: { type: 'string', example: 'Banca Transilvania' },
        address: {
          type: 'object',
          properties: {
            streetName: { type: 'string', example: 'Strada Victoriei 123' },
            additionalStreetName: { type: 'string', example: 'Bloc A, Etaj 2' },
            city: { type: 'string', example: 'București' },
            county: { type: 'string', example: 'Sector 1' },
            postalCode: { type: 'string', example: '010101' },
            countryCode: { type: 'string', example: 'RO' },
          },
        },
        contact: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Ion Popescu' },
            phone: { type: 'string', example: '+40212345678' },
            email: { type: 'string', example: 'contabilitate@smiledental.ro' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Clinic not found or fiscal settings incomplete',
    type: ErrorResponseDto,
  })
  async getSellerInfoForEFactura(@Param('clinicId') clinicId: string) {
    return this.clinicsService.getSellerInfoForEFactura(clinicId);
  }

  // ============================================
  // Locations
  // ============================================

  @Get('clinics/:clinicId/locations')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List clinic locations',
    description: `
Retrieves all physical locations/areas within a clinic.

**Location Types:**
- Treatment rooms
- Consultation rooms
- X-ray rooms
- Sterilization rooms
- Waiting areas
- Reception
- Labs
- Storage areas
- Offices

**Use Cases:**
- Room assignment for appointments
- Equipment tracking
- Facility management
- Sterilization workflow
    `,
  })
  @ApiParam({
    name: 'clinicId',
    type: String,
    description: 'Clinic UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'List of locations retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440001' },
          type: { type: 'string', example: 'TREATMENT_ROOM' },
          name: { type: 'string', example: 'Treatment Room 1' },
          code: { type: 'string', example: 'TR-01' },
          floor: { type: 'number', example: 2 },
          capacity: { type: 'number', example: 1 },
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
    description: 'Clinic not found',
    type: ErrorResponseDto,
  })
  async getLocations(@Param('clinicId') clinicId: string) {
    return this.clinicsService.getLocations(clinicId);
  }

  @Post('clinics/:clinicId/locations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create clinic location',
    description: `
Creates a new physical location/area within a clinic.

**Requirements:**
- Valid location type
- Unique location code within clinic
- Optional parent location for hierarchy

**Business Rules:**
- Location code must be unique within clinic
- Equipment and staff can be pre-assigned
- Supports hierarchical organization (floors, wings, rooms)

**Use Cases:**
- New treatment room setup
- Facility expansion
- Equipment assignment
- Staff assignment to areas
    `,
  })
  @ApiParam({
    name: 'clinicId',
    type: String,
    description: 'Clinic UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: CreateClinicLocationDto,
    description: 'Location details',
    examples: {
      treatmentRoom: {
        summary: 'Treatment Room',
        value: {
          type: 'TREATMENT_ROOM',
          name: 'Treatment Room 1',
          code: 'TR-01',
          floor: 2,
          area: 'West Wing',
          capacity: 1,
          notes: 'Equipped with digital X-ray',
          equipmentIds: ['550e8400-e29b-41d4-a716-446655440001'],
        },
      },
      xrayRoom: {
        summary: 'X-Ray Room',
        value: {
          type: 'XRAY_ROOM',
          name: 'X-Ray Room A',
          code: 'XR-01',
          floor: 1,
          capacity: 2,
          notes: 'CBCT and panoramic systems',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Location created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440002' },
        clinicId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
        type: { type: 'string', example: 'TREATMENT_ROOM' },
        name: { type: 'string', example: 'Treatment Room 1' },
        code: { type: 'string', example: 'TR-01' },
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
    status: 404,
    description: 'Clinic not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Location code already exists',
    type: ErrorResponseDto,
  })
  async createLocation(
    @Param('clinicId') clinicId: string,
    @Body() dto: CreateClinicLocationDto,
    @TenantContext() context: TenantContextData,
  ) {
    return this.clinicsService.createLocation(clinicId, dto as any, context);
  }
}
