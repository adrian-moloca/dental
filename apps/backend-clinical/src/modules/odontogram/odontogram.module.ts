/**
 * Odontogram Module
 *
 * NestJS module for tooth charting (odontogram) functionality.
 * Implements FDI numbering system with comprehensive clinical features.
 *
 * Features:
 * - Complete tooth chart management
 * - Surface-specific condition tracking
 * - Audit trail for all changes
 * - Domain event emission for downstream services
 * - Multi-tenant isolation
 *
 * @module odontogram
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OdontogramController } from './odontogram.controller';
import { OdontogramService } from './odontogram.service';
import { OdontogramRepository } from './odontogram.repository';
import {
  Odontogram,
  OdontogramSchema,
  OdontogramHistory,
  OdontogramHistorySchema,
} from './entities/odontogram.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Odontogram.name, schema: OdontogramSchema },
      { name: OdontogramHistory.name, schema: OdontogramHistorySchema },
    ]),
    AuthModule,
  ],
  controllers: [OdontogramController],
  providers: [OdontogramService, OdontogramRepository],
  exports: [OdontogramService],
})
export class OdontogramModule {}
