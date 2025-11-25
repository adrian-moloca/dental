import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DeviceRegistryController } from './device-registry.controller';
import { DeviceRegistryService } from './device-registry.service';
import { DeviceRegistryDoc, DeviceRegistrySchema } from './schemas/device-registry.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeviceRegistryDoc.name, schema: DeviceRegistrySchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('device.tokenSecret'),
        signOptions: {
          expiresIn: configService.get<string>('device.tokenExpiresIn', '90d') as any,
        },
      }),
    }),
    EventEmitterModule.forRoot(),
  ],
  controllers: [DeviceRegistryController],
  providers: [DeviceRegistryService],
  exports: [DeviceRegistryService],
})
export class DeviceRegistryModule {}
