import {
  IsDateString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SiteDto {
  @ApiProperty() @IsNumber() @Min(1) @Max(6) siteNumber!: number;
  @ApiProperty() @IsNumber() @Min(0) @Max(20) probingDepth!: number;
  @ApiProperty() @IsNumber() @Min(-10) @Max(10) recession!: number;
  @ApiProperty() @IsBoolean() bleeding!: boolean;
  @ApiProperty() @IsNumber() @Min(0) @Max(3) mobility!: number;
}

export class ToothPerioDataDto {
  @ApiProperty() @IsNumber() @Min(1) @Max(32) toothNumber!: number;
  @ApiProperty({ type: [SiteDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SiteDto)
  sites!: SiteDto[];
}

export class CreatePerioChartDto {
  @ApiProperty() @IsDateString() recordedDate!: string;
  @ApiProperty({ type: [ToothPerioDataDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ToothPerioDataDto)
  teeth!: ToothPerioDataDto[];
}
