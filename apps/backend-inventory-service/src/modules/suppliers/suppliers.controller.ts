import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { RequiresModule, ModuleCode } from '@dentalos/shared-auth';
import { LicenseGuard } from '@dentalos/shared-security';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';

/**
 * Suppliers Controller
 * Manages supplier database for procurement operations
 *
 * @security LicenseGuard - Enforces INVENTORY module subscription
 * @premium All supplier management endpoints require INVENTORY module
 */
@ApiTags('Suppliers')
@Controller('suppliers')
@ApiBearerAuth()
@UseGuards(LicenseGuard)
@RequiresModule(ModuleCode.INVENTORY)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiResponse({ status: 201, description: 'Supplier created successfully' })
  @ApiResponse({ status: 403, description: 'INVENTORY module not included in subscription' })
  create(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(dto, 'tenant-001', 'org-001', 'user-001');
  }

  @Get()
  @ApiOperation({ summary: 'Get all suppliers' })
  @ApiResponse({ status: 200, description: 'Suppliers retrieved successfully' })
  @ApiResponse({ status: 403, description: 'INVENTORY module not included in subscription' })
  findAll() {
    return this.suppliersService.findAll('tenant-001');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a supplier by ID' })
  @ApiResponse({ status: 200, description: 'Supplier retrieved successfully' })
  @ApiResponse({ status: 403, description: 'INVENTORY module not included in subscription' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  findOne(@Param('id') id: string) {
    return this.suppliersService.findById(id, 'tenant-001');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a supplier' })
  @ApiResponse({ status: 200, description: 'Supplier updated successfully' })
  @ApiResponse({ status: 403, description: 'INVENTORY module not included in subscription' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateSupplierDto>) {
    return this.suppliersService.update(id, dto, 'tenant-001', 'user-001');
  }
}
