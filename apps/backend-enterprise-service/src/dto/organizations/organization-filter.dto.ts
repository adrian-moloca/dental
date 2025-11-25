import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../common';
import { OrganizationStatus } from './update-organization.dto';
import { SubscriptionTier } from './create-organization.dto';

/**
 * DTO for filtering and paginating organization lists
 */
export class OrganizationFilterDto extends PaginationDto {
  @ApiProperty({
    description: 'Filter by organization status',
    enum: OrganizationStatus,
    example: OrganizationStatus.ACTIVE,
    enumName: 'OrganizationStatus',
    required: false,
  })
  @IsOptional()
  @IsEnum(OrganizationStatus)
  status?: OrganizationStatus;

  @ApiProperty({
    description: 'Filter by subscription tier',
    enum: SubscriptionTier,
    example: SubscriptionTier.PRO,
    enumName: 'SubscriptionTier',
    required: false,
  })
  @IsOptional()
  @IsEnum(SubscriptionTier)
  subscriptionTier?: SubscriptionTier;
}
