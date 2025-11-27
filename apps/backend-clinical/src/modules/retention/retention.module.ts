import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { RetentionService } from './retention.service';
import { RetentionMetadata, RetentionMetadataSchema } from './retention.schema';

/**
 * Retention Module
 *
 * Manages medical records retention for Romanian legal compliance.
 * Enforces 10-year retention period as required by Romanian law.
 *
 * Features:
 * - Automatic retention tracking for clinical records
 * - Deletion prevention within retention period
 * - Legal hold support for litigation
 * - Expiry notifications
 * - Automated archival after grace period
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: RetentionMetadata.name, schema: RetentionMetadataSchema }]),
    ScheduleModule.forRoot(),
  ],
  providers: [RetentionService],
  exports: [RetentionService],
})
export class RetentionModule {}
