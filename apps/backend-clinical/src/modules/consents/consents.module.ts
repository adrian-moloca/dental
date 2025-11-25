import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConsentsController } from './consents.controller';
import { ConsentsService } from './consents.service';
import { Consent, ConsentSchema } from './entities/consent.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Consent.name, schema: ConsentSchema }]), AuthModule],
  controllers: [ConsentsController],
  providers: [ConsentsService],
})
export class ConsentsModule {}
