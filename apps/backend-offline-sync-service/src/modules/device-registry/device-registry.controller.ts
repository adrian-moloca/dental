import { Controller, Post, Body, Headers, HttpCode, HttpStatus, UsePipes } from '@nestjs/common';
import { DeviceRegistryService } from './device-registry.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { DeviceLoginResponse } from './dto/device-login-response.dto';
import { ZodValidationPipe } from '@dentalos/shared-validation';
import { RegisterDeviceSchema } from '@dentalos/shared-validation';

@Controller('devices')
export class DeviceRegistryController {
  constructor(private readonly deviceRegistryService: DeviceRegistryService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(RegisterDeviceSchema))
  async registerDevice(
    @Body() registerDeviceDto: RegisterDeviceDto,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-organization-id') organizationId: string,
    @Headers('x-clinic-id') clinicId: string | undefined,
  ): Promise<DeviceLoginResponse> {
    // Override tenant context from headers if provided
    const dto: RegisterDeviceDto = {
      ...registerDeviceDto,
      tenantId: tenantId || registerDeviceDto.tenantId,
      organizationId: organizationId || registerDeviceDto.organizationId,
      clinicId: clinicId || registerDeviceDto.clinicId,
    };

    return this.deviceRegistryService.registerDevice(dto);
  }
}
