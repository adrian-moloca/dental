import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConsentDto {
  @ApiProperty()
  @IsEnum(['TREATMENT', 'ANESTHESIA', 'PHOTOGRAPHY', 'DATA_SHARING', 'CUSTOM'])
  consentType!: string;
  @ApiProperty() @IsString() title!: string;
  @ApiProperty() @IsString() content!: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() expiresAt?: string;
}

export class SignConsentDto {
  @ApiProperty() @IsString() signatureData!: string;
}
