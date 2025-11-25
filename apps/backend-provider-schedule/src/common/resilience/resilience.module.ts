import { Module, Global } from '@nestjs/common';
import { CircuitBreakerService } from './circuit-breaker.service';
import { GracefulDegradationService } from './graceful-degradation.service';

@Global()
@Module({
  providers: [CircuitBreakerService, GracefulDegradationService],
  exports: [CircuitBreakerService, GracefulDegradationService],
})
export class ResilienceModule {}
