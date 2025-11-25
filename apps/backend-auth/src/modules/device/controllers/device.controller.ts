import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DeviceService } from '../services/device.service';
import { DeviceLoginDto, DeviceAuthResponseDto } from '../dto';
import { Public } from '../../../decorators/public.decorator';
import { AuthThrottle } from '../../../decorators/auth-throttle.decorator';

@ApiTags('Device Authentication')
@Controller('auth/device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Public()
  @AuthThrottle()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate device with device access token',
    description:
      'Exchange a device access token from offline-sync-service for standard JWT access and refresh tokens.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Device authenticated successfully',
    type: DeviceAuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error - invalid UUID format or missing required fields',
    schema: {
      example: {
        statusCode: 400,
        message: ['deviceId must be a UUID', 'deviceAccessToken is required'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid device access token or token mismatch',
    schema: {
      examples: {
        invalidToken: {
          summary: 'Invalid device access token',
          value: {
            statusCode: 401,
            message: 'Invalid device access token',
            error: 'Unauthorized',
          },
        },
        tokenMismatch: {
          summary: 'Device token does not match request parameters',
          value: {
            statusCode: 401,
            message: 'Device token does not match request parameters',
            error: 'Unauthorized',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Rate limit exceeded (10 requests per minute)',
    schema: {
      example: {
        statusCode: 429,
        message: 'Too many requests',
        error: 'Too Many Requests',
      },
    },
  })
  async deviceLogin(@Body() dto: DeviceLoginDto): Promise<DeviceAuthResponseDto> {
    return this.deviceService.deviceLogin(dto);
  }
}
