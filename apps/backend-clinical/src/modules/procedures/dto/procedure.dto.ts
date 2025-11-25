import { IsString, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MaterialUsedDto {
  @ApiProperty() @IsString() itemId!: string;
  @ApiProperty() @IsNumber() quantity!: number;
}

export class CreateProcedureDto {
  @ApiPropertyOptional() @IsOptional() @IsString() appointmentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() treatmentPlanId?: string;
  @ApiProperty() @IsString() procedureCode!: string;
  @ApiProperty() @IsString() description!: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() toothNumber?: number;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) surfaces?: string[];
}

export class ProcedurePricingDto {
  @ApiProperty() @IsNumber() amount!: number;
  @ApiProperty() @IsString() currency!: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() insuranceCoverage?: number;
}

export class CompleteProcedureDto {
  @ApiPropertyOptional({ type: [MaterialUsedDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialUsedDto)
  materials?: MaterialUsedDto[];

  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) assistedBy?: string[];

  @ApiPropertyOptional({ type: ProcedurePricingDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProcedurePricingDto)
  pricing?: ProcedurePricingDto;
}
