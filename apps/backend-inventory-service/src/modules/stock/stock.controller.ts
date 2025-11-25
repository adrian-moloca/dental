import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { RequiresModule, ModuleCode } from '@dentalos/shared-auth';
import { LicenseGuard } from '@dentalos/shared-security';
import { StockService } from './stock.service';
import { DeductStockDto, DeductStockResponseDto } from './dto/deduct-stock.dto';
import { RestockDto } from './dto/restock.dto';
import { StockQueryDto } from './dto/stock-query.dto';

/**
 * Stock Controller
 * Handles all inventory stock operations including FEFO deduction
 *
 * @security LicenseGuard - Enforces INVENTORY module subscription
 * @premium All stock management endpoints require INVENTORY module
 */
@ApiTags('Stock')
@Controller('stock')
@ApiBearerAuth()
@UseGuards(LicenseGuard)
@RequiresModule(ModuleCode.INVENTORY)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post('deduct')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Deduct stock using FEFO logic',
    description:
      'Deducts stock from available inventory using First-Expired-First-Out (FEFO) logic. ' +
      'Supports multi-item deduction for procedures. Creates immutable audit trail.',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock deducted successfully',
    type: DeductStockResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Insufficient stock or invalid input' })
  @ApiResponse({ status: 403, description: 'INVENTORY module not included in subscription' })
  @ApiResponse({ status: 404, description: 'Product or location not found' })
  async deductStock(@Body() deductStockDto: DeductStockDto): Promise<DeductStockResponseDto> {
    // TODO: Extract from JWT token
    const tenantId = 'tenant-001';
    const organizationId = 'org-001';
    const clinicId = 'clinic-001';
    const userId = 'user-001';

    return this.stockService.deductStock(
      deductStockDto,
      tenantId,
      organizationId,
      clinicId,
      userId,
    );
  }

  @Post('restock')
  @ApiOperation({ summary: 'Restock inventory' })
  @ApiResponse({ status: 201, description: 'Stock restocked successfully' })
  @ApiResponse({ status: 403, description: 'INVENTORY module not included in subscription' })
  @ApiResponse({ status: 404, description: 'Product or location not found' })
  async restock(@Body() restockDto: RestockDto) {
    // TODO: Extract from JWT token
    const tenantId = 'tenant-001';
    const organizationId = 'org-001';
    const clinicId = 'clinic-001';
    const userId = 'user-001';

    return this.stockService.restock(restockDto, tenantId, organizationId, clinicId, userId);
  }

  @Get('locations/:locationId')
  @ApiOperation({ summary: 'Get stock levels at a location' })
  @ApiParam({ name: 'locationId', description: 'Stock location ID' })
  @ApiResponse({ status: 200, description: 'Stock levels retrieved successfully' })
  @ApiResponse({ status: 403, description: 'INVENTORY module not included in subscription' })
  async getStockByLocation(@Param('locationId') locationId: string, @Query() query: StockQueryDto) {
    // TODO: Extract from JWT token
    const tenantId = 'tenant-001';
    const clinicId = 'clinic-001';

    return this.stockService.getStockByLocation(locationId, tenantId, clinicId, query);
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Get items expiring soon' })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Number of days to check (default: 30)',
    type: Number,
  })
  @ApiResponse({ status: 200, description: 'Expiring items retrieved successfully' })
  @ApiResponse({ status: 403, description: 'INVENTORY module not included in subscription' })
  async getExpiringItems(@Query('days') days: string = '30') {
    // TODO: Extract from JWT token
    const tenantId = 'tenant-001';
    const clinicId = 'clinic-001';

    return this.stockService.getExpiringItems(parseInt(days, 10), tenantId, clinicId);
  }
}
