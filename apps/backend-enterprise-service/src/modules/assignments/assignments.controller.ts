import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { TenantContext, TenantContextData } from '../../decorators/tenant-context.decorator';
import { AssignProviderDto, AssignmentResponseDto } from '../../dto/assignments';
import { ErrorResponseDto } from '../../dto/common';

@ApiTags('Provider-Clinic Assignments')
@ApiBearerAuth()
@Controller('enterprise')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post('providers/:staffId/assign')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Assign provider to clinic',
    description: `
Assigns a healthcare provider (dentist, hygienist, etc.) to work at a specific clinic.

**Requirements:**
- Valid staff member ID (provider must exist)
- Valid clinic ID
- Organization ID in request context
- At least one role must be assigned

**Business Rules:**
- Provider can be assigned to multiple clinics
- Only one clinic can be marked as primary
- Working hours can be customized per clinic
- Assignment triggers permission updates
- Notifications sent to provider and clinic manager

**Use Cases:**
- New provider onboarding
- Multi-clinic staffing
- Cross-clinic coverage
- Temporary assignments
    `,
  })
  @ApiParam({
    name: 'staffId',
    type: String,
    description: 'Staff member UUID (provider to assign)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: AssignProviderDto,
    description: 'Assignment details',
    examples: {
      primary: {
        summary: 'Assign to Primary Clinic',
        value: {
          clinicId: '550e8400-e29b-41d4-a716-446655440001',
          roles: ['DENTIST'],
          isPrimaryClinic: true,
          workingHoursOverride: {
            monday: { start: '08:00', end: '17:00' },
            tuesday: { start: '08:00', end: '17:00' },
            wednesday: { start: '08:00', end: '17:00' },
            thursday: { start: '08:00', end: '17:00' },
            friday: { start: '08:00', end: '14:00' },
          },
        },
      },
      partTime: {
        summary: 'Part-Time Assignment',
        value: {
          clinicId: '550e8400-e29b-41d4-a716-446655440002',
          roles: ['DENTIST', 'CONSULTANT'],
          isPrimaryClinic: false,
          workingHoursOverride: {
            tuesday: { start: '13:00', end: '18:00' },
            thursday: { start: '13:00', end: '18:00' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Provider assigned successfully',
    type: AssignmentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data - missing organization ID or invalid roles',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Provider or clinic not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - provider already assigned to this clinic',
    type: ErrorResponseDto,
  })
  async assignProvider(
    @Param('staffId') staffId: string,
    @Body() dto: AssignProviderDto,
    @TenantContext() context: TenantContextData,
  ) {
    // Ensure organizationId is provided for provider assignments
    if (!context.organizationId) {
      throw new Error('Organization ID is required for provider assignments');
    }
    return this.assignmentsService.assignProvider(staffId, dto, {
      userId: context.userId,
      organizationId: context.organizationId,
    });
  }

  @Get('providers/:staffId/clinics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List provider clinics',
    description: `
Retrieves all clinics where a provider is assigned to work.

**Returned Data:**
- Clinic basic information (ID, name)
- Provider roles at each clinic
- Primary clinic indicator
- Working hours override (if any)
- Assignment status and dates

**Use Cases:**
- Provider dashboard (my clinics)
- Schedule coordination
- Multi-clinic management
- Administrative oversight
    `,
  })
  @ApiParam({
    name: 'staffId',
    type: String,
    description: 'Staff member UUID (provider)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'List of clinics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        staffId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
        clinics: {
          type: 'array',
          items: { $ref: '#/components/schemas/ProviderClinicDto' },
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
    description: 'Provider not found',
    type: ErrorResponseDto,
  })
  async getProviderClinics(@Param('staffId') staffId: string) {
    return this.assignmentsService.getProviderClinics(staffId);
  }

  @Get('clinics/:clinicId/staff')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List clinic staff',
    description: `
Retrieves all staff members (providers) assigned to a specific clinic.

**Returned Data:**
- Staff member basic information
- Roles at the clinic
- Primary clinic indicator
- Working hours
- Assignment status

**Filtering:**
- Can filter by role (future enhancement)
- Can filter by active/inactive status (future enhancement)

**Use Cases:**
- Clinic staff directory
- Schedule planning
- Resource allocation
- Administrative management
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
    description: 'List of staff members retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        clinicId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
        staff: {
          type: 'array',
          items: { $ref: '#/components/schemas/ClinicStaffMemberDto' },
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
  async getClinicStaff(@Param('clinicId') clinicId: string) {
    return this.assignmentsService.getClinicStaff(clinicId);
  }
}
