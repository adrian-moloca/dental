import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';

// Feature modules
import { ProductsModule } from './modules/products/products.module';
import { StockModule } from './modules/stock/stock.module';
import { PurchaseOrdersModule } from './modules/purchase-orders/purchase-orders.module';
import { GoodsReceiptsModule } from './modules/goods-receipts/goods-receipts.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { ClinicalIntegrationModule } from './modules/clinical-integration/clinical-integration.module';
import { SterilizationModule } from './modules/sterilization/sterilization.module';

// Standard modules
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),

    // MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('mongodb.uri'),
        retryWrites: true,
        w: 'majority',
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        monitorCommands: true,
      }),
      inject: [ConfigService],
    }),

    // Event Emitter for domain events
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),

    // Scheduler for background tasks (e.g., expiration checks)
    ScheduleModule.forRoot(),

    // Standard modules
    HealthModule,
    MetricsModule,

    // Feature modules
    ProductsModule,
    StockModule,
    PurchaseOrdersModule,
    GoodsReceiptsModule,
    SuppliersModule,
    ClinicalIntegrationModule,
    SterilizationModule,
  ],
})
export class AppModule {}
