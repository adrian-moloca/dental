import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PerioChartController } from './perio-chart.controller';
import { PerioChartService } from './perio-chart.service';
import { PerioChart, PerioChartSchema } from './entities/perio-chart.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PerioChart.name, schema: PerioChartSchema }]),
    AuthModule,
  ],
  controllers: [PerioChartController],
  providers: [PerioChartService],
})
export class PerioChartModule {}
