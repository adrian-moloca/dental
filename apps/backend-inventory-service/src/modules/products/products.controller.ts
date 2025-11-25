import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RequiresModule, ModuleCode } from '@dentalos/shared-auth';
import { LicenseGuard } from '@dentalos/shared-security';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

/**
 * Products Controller
 * Handles all product catalog HTTP endpoints
 *
 * @security LicenseGuard - Enforces INVENTORY module subscription
 * @premium All product catalog endpoints require INVENTORY module
 */
@ApiTags('Products')
@Controller('products')
@ApiBearerAuth()
@UseGuards(LicenseGuard)
@RequiresModule(ModuleCode.INVENTORY)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or duplicate SKU' })
  @ApiResponse({ status: 403, description: 'INVENTORY module not included in subscription' })
  async create(@Body() createProductDto: CreateProductDto) {
    // TODO: Extract from JWT token
    const tenantId = 'tenant-001';
    const organizationId = 'org-001';
    const userId = 'user-001';

    return this.productsService.create(createProductDto, tenantId, organizationId, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  @ApiResponse({ status: 403, description: 'INVENTORY module not included in subscription' })
  async findAll(@Query() query: ProductQueryDto) {
    // TODO: Extract from JWT token
    const tenantId = 'tenant-001';
    const organizationId = 'org-001';

    return this.productsService.findAll(query, tenantId, organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 403, description: 'INVENTORY module not included in subscription' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string) {
    // TODO: Extract from JWT token
    const tenantId = 'tenant-001';

    return this.productsService.findById(id, tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 403, description: 'INVENTORY module not included in subscription' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    // TODO: Extract from JWT token
    const tenantId = 'tenant-001';
    const userId = 'user-001';

    return this.productsService.update(id, updateProductDto, tenantId, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a product' })
  @ApiResponse({ status: 204, description: 'Product deleted successfully' })
  @ApiResponse({ status: 403, description: 'INVENTORY module not included in subscription' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Param('id') id: string) {
    // TODO: Extract from JWT token
    const tenantId = 'tenant-001';
    const userId = 'user-001';

    await this.productsService.remove(id, tenantId, userId);
  }
}
