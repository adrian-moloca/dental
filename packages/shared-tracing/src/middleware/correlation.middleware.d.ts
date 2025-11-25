import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export interface CorrelationMiddlewareConfig {
    serviceName: string;
    serviceVersion: string;
    enableLogging?: boolean;
    includeInResponse?: boolean;
}
export declare class CorrelationMiddleware implements NestMiddleware {
    private readonly logger;
    private config;
    constructor(config?: CorrelationMiddlewareConfig);
    use(req: Request, res: Response, next: NextFunction): void;
}
export declare function createCorrelationMiddleware(config?: CorrelationMiddlewareConfig): CorrelationMiddleware;
