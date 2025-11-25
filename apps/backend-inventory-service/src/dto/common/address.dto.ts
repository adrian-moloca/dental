import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

/**
 * Address DTO used across inventory service entities
 */
export class AddressDto {
  @ApiProperty({
    description: 'Street address including building number and street name',
    example: '123 Main Street, Suite 200',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  street!: string;

  @ApiProperty({
    description: 'City name',
    example: 'San Francisco',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city!: string;

  @ApiProperty({
    description: 'State or province',
    example: 'CA',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  state!: string;

  @ApiProperty({
    description: 'Postal or ZIP code',
    example: '94102',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  postalCode!: string;

  @ApiProperty({
    description: 'Country name or ISO code',
    example: 'United States',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  country!: string;
}
