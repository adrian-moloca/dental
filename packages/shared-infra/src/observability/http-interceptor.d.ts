import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrometheusMetricsService } from './prometheus-metrics';
export declare class HttpLoggingInterceptor implements NestInterceptor {
    private readonly metricsService?;
    constructor(metricsService?: PrometheusMetricsService | undefined);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private getRoutePath;
}
export declare class AuditInterceptor implements NestInterceptor {
    private readonly logger;
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
