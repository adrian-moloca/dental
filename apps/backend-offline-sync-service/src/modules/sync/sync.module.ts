import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { ChangeLogModule } from '../changelog/changelog.module';
import { DeviceRegistryModule } from '../device-registry/device-registry.module';

@Module({
  imports: [ChangeLogModule, DeviceRegistryModule],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
