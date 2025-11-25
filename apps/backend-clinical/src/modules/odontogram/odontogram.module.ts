/**
 * Odontogram Module
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OdontogramController } from './odontogram.controller';
import { OdontogramService } from './odontogram.service';
import { OdontogramRepository } from './odontogram.repository';
import { Odontogram, OdontogramSchema } from './entities/odontogram.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Odontogram.name, schema: OdontogramSchema }]),
    AuthModule,
  ],
  controllers: [OdontogramController],
  providers: [OdontogramService, OdontogramRepository],
  exports: [OdontogramService],
})
export class OdontogramModule {}
