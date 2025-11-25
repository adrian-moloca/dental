import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

/**
 * Update Product DTO - all fields optional except those omitted
 */
export class UpdateProductDto extends PartialType(OmitType(CreateProductDto, ['sku'] as const)) {}
