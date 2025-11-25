import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { RequiresModule, ModuleCode } from '@dentalos/shared-auth';
import { LicenseGuard } from '@dentalos/shared-security';
import { GoodsReceiptsService } from './goods-receipts.service';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';

/**
 * Goods Receipts Controller
 * Manages receiving of purchased inventory and stock updates
 *
 * @security LicenseGuard - Enforces INVENTORY module subscription
 * @premium All goods receipt endpoints require INVENTORY module
 */
@ApiTags('Goods Receipts')
@Controller('goods-receipts')
@ApiBearerAuth()
@UseGuards(LicenseGuard)
@RequiresModule(ModuleCode.INVENTORY)
export class GoodsReceiptsController {
  constructor(private readonly grService: GoodsReceiptsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a goods receipt and update stock' })
  @ApiResponse({ status: 201, description: 'Goods receipt created and stock updated successfully' })
  @ApiResponse({ status: 403, description: 'INVENTORY module not included in subscription' })
  create(@Body() dto: CreateGoodsReceiptDto) {
    return this.grService.create(
      dto,
      'tenant-001',
      'org-001',
      'clinic-001',
      'user-001',
      'Test User',
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all goods receipts' })
  @ApiResponse({ status: 200, description: 'Goods receipts retrieved successfully' })
  @ApiResponse({ status: 403, description: 'INVENTORY module not included in subscription' })
  findAll() {
    return this.grService.findAll('tenant-001', 'clinic-001');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a goods receipt by ID' })
  @ApiResponse({ status: 200, description: 'Goods receipt retrieved successfully' })
  @ApiResponse({ status: 403, description: 'INVENTORY module not included in subscription' })
  @ApiResponse({ status: 404, description: 'Goods receipt not found' })
  findOne(@Param('id') id: string) {
    return this.grService.findById(id, 'tenant-001');
  }
}
