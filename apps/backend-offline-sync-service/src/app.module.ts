import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import {
  serverConfig,
  mongoConfig,
  rabbitmqConfig,
  jwtConfig,
  deviceConfig,
  encryptionConfig,
  corsConfig,
} from './config/configuration';
import { DeviceRegistryModule } from './modules/device-registry/device-registry.module';
import { ChangeLogModule } from './modules/changelog/changelog.module';
import { SyncModule } from './modules/sync/sync.module';
import { EventConsumerModule } from './modules/event-consumer/event-consumer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        serverConfig,
        mongoConfig,
        rabbitmqConfig,
        jwtConfig,
        deviceConfig,
        encryptionConfig,
        corsConfig,
      ],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('mongo.uri'),
      }),
    }),
    EventEmitterModule.forRoot(),
    DeviceRegistryModule,
    ChangeLogModule,
    SyncModule,
    EventConsumerModule,
  ],
})
export class AppModule {}
