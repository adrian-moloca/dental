import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BiologicalIndicatorResult } from '@dentalos/shared-domain';

export class CompleteCycleDto {
  @ApiProperty({
    description: 'Whether the cycle passed successfully',
    example: true,
  })
  @IsBoolean()
  passed!: boolean;

  @ApiPropertyOptional({
    description: 'Result of biological indicator test',
    enum: BiologicalIndicatorResult,
    example: BiologicalIndicatorResult.PASS,
  })
  @IsOptional()
  @IsEnum(BiologicalIndicatorResult)
  biologicalIndicatorResult?: BiologicalIndicatorResult;

  @ApiPropertyOptional({
    description: 'Reason for failure (required if passed=false)',
    example: 'Temperature not maintained',
  })
  @IsOptional()
  @IsString()
  failureReason?: string;

  @ApiPropertyOptional({
    description: 'Notes about the completion',
    example: 'All instruments sterilized successfully',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
