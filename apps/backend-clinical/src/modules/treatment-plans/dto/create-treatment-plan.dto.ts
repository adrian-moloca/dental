import { IsString, IsNumber, IsArray, ValidateNested, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ProcedureItemDto {
  @ApiProperty() @IsString() procedureCode!: string;
  @ApiProperty() @IsOptional() @IsNumber() toothNumber?: number;
  @ApiProperty() @IsString() description!: string;
  @ApiProperty() @IsNumber() @Min(0) estimatedCost!: number;
  @ApiProperty() @IsNumber() @Min(1) phase!: number;
}

export class TreatmentOptionDto {
  @ApiProperty() @IsString() optionName!: string;
  @ApiProperty() @IsString() description!: string;
  @ApiProperty({ type: [ProcedureItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProcedureItemDto)
  procedures!: ProcedureItemDto[];
}

export class CreateTreatmentPlanDto {
  @ApiProperty({ type: [TreatmentOptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TreatmentOptionDto)
  options!: TreatmentOptionDto[];
}
