import { Controller, Get, Post, Body, Param, Query, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SterilizationCycleStatus, InstrumentStatus } from '@dentalos/shared-domain';

import { SterilizationService, TenantContext } from '../services';
import { CreateSterilizationCycleDto, CompleteCycleDto, CreateInstrumentDto } from '../dto';

@ApiTags('Sterilization')
@ApiBearerAuth()
@Controller('sterilization')
export class SterilizationController {
  constructor(private readonly sterilizationService: SterilizationService) {}

  // ==================== Sterilization Cycles ====================

  @Post('cycles')
  @ApiOperation({ summary: 'Create a new sterilization cycle' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Sterilization cycle created successfully',
  })
  async createCycle(@Body() dto: CreateSterilizationCycleDto) {
    // TODO: Extract from JWT token via guard
    const context: TenantContext = this.getMockContext();
    return this.sterilizationService.createCycle(dto, context);
  }

  @Post('cycles/:cycleId/start')
  @ApiOperation({ summary: 'Start a sterilization cycle' })
  @ApiParam({ name: 'cycleId', description: 'ID of the cycle to start' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sterilization cycle started',
  })
  async startCycle(@Param('cycleId') cycleId: string) {
    const context: TenantContext = this.getMockContext();
    return this.sterilizationService.startCycle(cycleId, context);
  }

  @Post('cycles/:cycleId/complete')
  @ApiOperation({ summary: 'Complete a sterilization cycle' })
  @ApiParam({ name: 'cycleId', description: 'ID of the cycle to complete' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sterilization cycle completed',
  })
  async completeCycle(@Param('cycleId') cycleId: string, @Body() dto: CompleteCycleDto) {
    const context: TenantContext = this.getMockContext();
    return this.sterilizationService.completeCycle(cycleId, dto, context);
  }

  @Post('cycles/:cycleId/cancel')
  @ApiOperation({ summary: 'Cancel a sterilization cycle' })
  @ApiParam({ name: 'cycleId', description: 'ID of the cycle to cancel' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sterilization cycle cancelled',
  })
  async cancelCycle(@Param('cycleId') cycleId: string) {
    const context: TenantContext = this.getMockContext();
    return this.sterilizationService.cancelCycle(cycleId, context);
  }

  @Get('cycles/:cycleId')
  @ApiOperation({ summary: 'Get a sterilization cycle by ID' })
  @ApiParam({ name: 'cycleId', description: 'ID of the cycle' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sterilization cycle details',
  })
  async getCycle(@Param('cycleId') cycleId: string) {
    const context: TenantContext = this.getMockContext();
    return this.sterilizationService.getCycleById(cycleId, context);
  }

  @Get('cycles')
  @ApiOperation({ summary: 'List sterilization cycles' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: SterilizationCycleStatus,
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of sterilization cycles',
  })
  async listCycles(
    @Query('status') status?: SterilizationCycleStatus,
    @Query('limit') limit?: number,
    @Query('skip') skip?: number,
  ) {
    const context: TenantContext = this.getMockContext();
    return this.sterilizationService.listCycles(context, {
      status,
      limit: limit ? Number(limit) : undefined,
      skip: skip ? Number(skip) : undefined,
    });
  }

  // ==================== Instruments ====================

  @Post('instruments')
  @ApiOperation({ summary: 'Create a new instrument' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Instrument created successfully',
  })
  async createInstrument(@Body() dto: CreateInstrumentDto) {
    const context: TenantContext = this.getMockContext();
    return this.sterilizationService.createInstrument(dto, context);
  }

  @Get('instruments/:instrumentId')
  @ApiOperation({ summary: 'Get an instrument by ID' })
  @ApiParam({ name: 'instrumentId', description: 'ID of the instrument' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Instrument details',
  })
  async getInstrument(@Param('instrumentId') instrumentId: string) {
    const context: TenantContext = this.getMockContext();
    return this.sterilizationService.getInstrumentById(instrumentId, context);
  }

  @Get('instruments')
  @ApiOperation({ summary: 'List instruments' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: InstrumentStatus,
  })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'needsSterilization', required: false, type: Boolean })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of instruments',
  })
  async listInstruments(
    @Query('status') status?: InstrumentStatus,
    @Query('type') type?: string,
    @Query('needsSterilization') needsSterilization?: string,
    @Query('limit') limit?: number,
    @Query('skip') skip?: number,
  ) {
    const context: TenantContext = this.getMockContext();
    return this.sterilizationService.listInstruments(context, {
      status,
      type,
      needsSterilization: needsSterilization === 'true',
      limit: limit ? Number(limit) : undefined,
      skip: skip ? Number(skip) : undefined,
    });
  }

  @Post('instruments/:instrumentId/retire')
  @ApiOperation({ summary: 'Retire an instrument' })
  @ApiParam({ name: 'instrumentId', description: 'ID of the instrument' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Instrument retired successfully',
  })
  async retireInstrument(
    @Param('instrumentId') instrumentId: string,
    @Body('reason') reason: string,
  ) {
    const context: TenantContext = this.getMockContext();
    return this.sterilizationService.retireInstrument(instrumentId, reason, context);
  }

  @Get('instruments/:instrumentId/history')
  @ApiOperation({ summary: 'Get sterilization history for an instrument' })
  @ApiParam({ name: 'instrumentId', description: 'ID of the instrument' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sterilization history for the instrument',
  })
  async getInstrumentHistory(@Param('instrumentId') instrumentId: string) {
    const context: TenantContext = this.getMockContext();
    return this.sterilizationService.getInstrumentHistory(instrumentId, context);
  }

  // ==================== Statistics ====================

  @Get('statistics')
  @ApiOperation({ summary: 'Get sterilization statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sterilization statistics',
  })
  async getStatistics() {
    const context: TenantContext = this.getMockContext();
    return this.sterilizationService.getStatistics(context);
  }

  // TODO: Replace with actual JWT guard extraction
  private getMockContext(): TenantContext {
    return {
      tenantId: 'default-tenant',
      organizationId: 'default-org',
      clinicId: 'default-clinic',
      userId: 'system',
    };
  }
}
