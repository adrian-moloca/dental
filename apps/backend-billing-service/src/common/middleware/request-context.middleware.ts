import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export interface RequestWithContext extends Request {
  context: {
    correlationId: string;
    organizationId?: string;
    clinicId?: string;
    userId?: string;
    timestamp: Date;
  };
}

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const request = req as RequestWithContext;

    const correlationId =
      req.get('x-correlation-id') || req.get('X-Correlation-ID') || this.generateCorrelationId();

    const organizationId = req.get('x-organization-id') || req.get('X-Organization-ID');
    const clinicId = req.get('x-clinic-id') || req.get('X-Clinic-ID');

    const userId =
      (req as Request & { user?: { id?: string; userId?: string } }).user?.id ||
      (req as Request & { user?: { id?: string; userId?: string } }).user?.userId;

    request.context = {
      correlationId,
      organizationId: organizationId || undefined,
      clinicId: clinicId || undefined,
      userId: userId || undefined,
      timestamp: new Date(),
    };

    res.setHeader('X-Correlation-ID', correlationId);

    next();
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}
