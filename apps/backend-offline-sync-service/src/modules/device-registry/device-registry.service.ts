import { Injectable, ConflictException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { DeviceRegistryDoc, DeviceRegistryDocument } from './schemas/device-registry.schema';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { DeviceLoginResponse } from './dto/device-login-response.dto';
import { DeviceStatus } from '@dentalos/shared-domain';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DeviceRegisteredEvent } from '@dentalos/shared-events';

@Injectable()
export class DeviceRegistryService {
  private readonly logger = new Logger(DeviceRegistryService.name);

  constructor(
    @InjectModel(DeviceRegistryDoc.name)
    private readonly deviceModel: Model<DeviceRegistryDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async registerDevice(dto: RegisterDeviceDto): Promise<DeviceLoginResponse> {
    const deviceId = uuidv4();

    // Check for existing device with same hardware hash
    const existingDevice = await this.deviceModel.findOne({
      tenantId: dto.tenantId,
      organizationId: dto.organizationId,
      'metadata.hardwareHash': dto.metadata.hardwareHash,
      status: { $ne: DeviceStatus.REVOKED },
    });

    if (existingDevice) {
      this.logger.warn(
        `Device with hardwareHash ${dto.metadata.hardwareHash} already exists for tenant ${dto.tenantId}`,
      );
      throw new ConflictException('Device with this hardware signature is already registered');
    }

    // Generate device access token
    const tokenSecret = this.configService.get<string>('device.tokenSecret');
    const tokenExpiresIn = this.configService.get<string>('device.tokenExpiresIn', '90d');

    const deviceAccessToken = this.jwtService.sign(
      {
        sub: deviceId,
        deviceId,
        tenantId: dto.tenantId,
        organizationId: dto.organizationId,
        clinicId: dto.clinicId,
        userId: dto.userId,
        type: 'device',
      },
      {
        secret: tokenSecret,
        expiresIn: tokenExpiresIn as any,
      },
    );

    // Create device registration
    const device = new this.deviceModel({
      deviceId,
      deviceName: dto.deviceName,
      tenantId: dto.tenantId,
      organizationId: dto.organizationId,
      clinicId: dto.clinicId,
      userId: dto.userId,
      metadata: dto.metadata,
      status: DeviceStatus.ACTIVE,
      deviceAccessToken,
      lastSeenAt: new Date(),
    });

    await device.save();

    // Emit device registered event
    const event: DeviceRegisteredEvent = {
      eventType: 'offline-sync.device.registered',
      deviceId,
      deviceName: dto.deviceName,
      tenantId: dto.tenantId,
      organizationId: dto.organizationId,
      clinicId: dto.clinicId,
      userId: dto.userId,
      metadata: dto.metadata as any,
      registeredAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      correlationId: uuidv4(),
    };

    this.eventEmitter.emit('offline-sync.device.registered', event);

    this.logger.log(`Device ${deviceId} registered successfully for tenant ${dto.tenantId}`);

    return {
      deviceId,
      deviceAccessToken,
      expiresIn: tokenExpiresIn,
      registeredAt: new Date(),
    };
  }

  async updateLastSeen(deviceId: string, tenantId: string): Promise<void> {
    await this.deviceModel.updateOne(
      { deviceId, tenantId, status: DeviceStatus.ACTIVE },
      { lastSeenAt: new Date() },
    );
  }

  async revokeDevice(deviceId: string, tenantId: string): Promise<void> {
    const result = await this.deviceModel.updateOne(
      { deviceId, tenantId, status: { $ne: DeviceStatus.REVOKED } },
      {
        status: DeviceStatus.REVOKED,
        revokedAt: new Date(),
      },
    );

    if (result.matchedCount === 0) {
      throw new UnauthorizedException('Device not found or already revoked');
    }

    this.logger.log(`Device ${deviceId} revoked for tenant ${tenantId}`);
  }

  async getActiveDevicesByUser(userId: string, tenantId: string): Promise<DeviceRegistryDocument[]> {
    return this.deviceModel
      .find({
        userId,
        tenantId,
        status: DeviceStatus.ACTIVE,
      })
      .sort({ lastSeenAt: -1 })
      .exec();
  }

  async verifyDeviceToken(deviceId: string, tenantId: string): Promise<DeviceRegistryDocument | null> {
    const device = await this.deviceModel.findOne({
      deviceId,
      tenantId,
      status: DeviceStatus.ACTIVE,
    });

    if (!device) {
      return null;
    }

    // Update last seen
    await this.updateLastSeen(deviceId, tenantId);

    return device;
  }
}
