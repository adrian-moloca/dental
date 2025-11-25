/**
 * HTTP Module
 *
 * Provides HTTP clients for making requests to microservices.
 *
 * @module common/http/http-module
 */

import { Module, Global } from '@nestjs/common';
import { HttpModule as NestHttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { HttpMicroserviceClient } from './http-microservice.client';
import { AuthServiceClient } from './clients/auth-service.client';
import { PatientServiceClient } from './clients/patient-service.client';
import { SchedulingServiceClient } from './clients/scheduling-service.client';
import { ClinicalServiceClient } from './clients/clinical-service.client';
import { ImagingServiceClient } from './clients/imaging-service.client';
import { BillingServiceClient } from './clients/billing-service.client';
import { MarketingServiceClient } from './clients/marketing-service.client';

@Global()
@Module({
  imports: [
    NestHttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ConfigModule,
  ],
  providers: [
    HttpMicroserviceClient,
    AuthServiceClient,
    PatientServiceClient,
    SchedulingServiceClient,
    ClinicalServiceClient,
    ImagingServiceClient,
    BillingServiceClient,
    MarketingServiceClient,
  ],
  exports: [
    HttpMicroserviceClient,
    AuthServiceClient,
    PatientServiceClient,
    SchedulingServiceClient,
    ClinicalServiceClient,
    ImagingServiceClient,
    BillingServiceClient,
    MarketingServiceClient,
  ],
})
export class HttpClientModule {}
