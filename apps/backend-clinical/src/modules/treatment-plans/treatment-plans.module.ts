import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TreatmentPlansController } from './treatment-plans.controller';
import { TreatmentPlansService } from './treatment-plans.service';
import { TreatmentPlan, TreatmentPlanSchema } from './entities/treatment-plan.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TreatmentPlan.name, schema: TreatmentPlanSchema }]),
    AuthModule,
  ],
  controllers: [TreatmentPlansController],
  providers: [TreatmentPlansService],
})
export class TreatmentPlansModule {}
