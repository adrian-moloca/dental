import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProceduresController } from './procedures.controller';
import { ProceduresService } from './procedures.service';
import { Procedure, ProcedureSchema } from './entities/procedure.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Procedure.name, schema: ProcedureSchema }]),
    AuthModule,
  ],
  controllers: [ProceduresController],
  providers: [ProceduresService],
})
export class ProceduresModule {}
