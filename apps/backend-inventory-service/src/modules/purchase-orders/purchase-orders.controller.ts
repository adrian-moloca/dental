import { Controller, Get, Post, Body, Param, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { RequiresModule, ModuleCode } from '@dentalos/shared-auth';
import { LicenseGuard } from '@dentalos/shared-security';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { PurchaseOrderStatus } from './schemas/purchase-order.schema';

/**
 * Purchase Orders Controller
 * Manages purchase order lifecycle including creation, approval, and tracking
 *
 * @security LicenseGuard - Enforces INVENTORY module subscription
 * @premium All purchase order endpoints require INVENTORY module
 */
@ApiTags('Purchase Orders')
@Controller('purchase-orders')
@ApiBearerAuth()
@UseGuards(LicenseGuard)
@RequiresModule(ModuleCode.INVENTORY)
export class PurchaseOrdersController {
  constructor(private readonly poService: PurchaseOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new purchase order' })
  @ApiResponse({ status: 201, description: 'Purchase order created successfully' })
  @ApiResponse({ status: 403, description: 'INVENTORY module not included in subscription' })
  create(@Body() dto: CreatePurchaseOrderDto) {
    return this.poService.create(dto, 'tenant-001', 'org-001', 'clinic-001', 'user-001');
  }

  @Get()
  @ApiOperation({ summary: 'Get all purchase orders' })
  @ApiResponse({ status: 200, description: 'Purchase orders retrieved successfully' })
  @ApiResponse({ status: 403, description: 'INVENTORY module not included in subscription' })
  findAll(@Query('status') status?: PurchaseOrderStatus) {
    return this.poService.findAll('tenant-001', 'clinic-001', status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a purchase order by ID' })
  @ApiResponse({ status: 200, description: 'Purchase order retrieved successfully' })
  @ApiResponse({ status: 403, description: 'INVENTORY module not included in subscription' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  findOne(@Param('id') id: string) {
    return this.poService.findById(id, 'tenant-001');
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'Approve a purchase order' })
  @ApiResponse({ status: 200, description: 'Purchase order approved successfully' })
  @ApiResponse({ status: 403, description: 'INVENTORY module not included in subscription' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  approve(@Param('id') id: string) {
    return this.poService.approve(id, 'tenant-001', 'user-001');
  }
}
