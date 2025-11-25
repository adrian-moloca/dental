import { Module } from '@nestjs/common';
import { LamportClockService } from './lamport-clock.service';
import { CRDTResolverService } from './crdt-resolver.service';

@Module({
  providers: [LamportClockService, CRDTResolverService],
  exports: [LamportClockService, CRDTResolverService],
})
export class CrdtModule {}
