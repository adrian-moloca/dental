import { IsString, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SOAPNoteDto {
  @ApiProperty() @IsString() subjective!: string;
  @ApiProperty() @IsString() objective!: string;
  @ApiProperty() @IsString() assessment!: string;
  @ApiProperty() @IsString() plan!: string;
}

export class CreateNoteDto {
  @ApiPropertyOptional() @IsOptional() @IsString() appointmentId?: string;
  @ApiProperty() @IsEnum(['SOAP', 'PROGRESS', 'CONSULT', 'EMERGENCY']) noteType!: string;
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => SOAPNoteDto)
  soap?: SOAPNoteDto;
  @ApiProperty() @IsString() content!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() chiefComplaint?: string;
  @ApiPropertyOptional() @IsOptional() @IsString({ each: true }) diagnosis?: string[];
}
