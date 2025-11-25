import { Controller, Post, Get, Body, Query, Headers, UsePipes } from '@nestjs/common';
import { SyncService } from './sync.service';
import { UploadChangesDto } from './dto/upload-changes.dto';
import { GetChangesQueryDto, GetChangesQuerySchema } from '../changelog/dto/get-changes.dto';
import { SyncResult } from './dto/sync-result.dto';
import { OfflineChange } from '@dentalos/shared-domain';
import { ZodValidationPipe } from '@dentalos/shared-validation';
import { SyncBatchSchema } from '@dentalos/shared-validation';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('upload')
  @UsePipes(new ZodValidationPipe(SyncBatchSchema))
  async uploadChanges(
    @Body() uploadChangesDto: UploadChangesDto,
    @Headers('x-device-id') deviceId: string,
  ): Promise<SyncResult> {
    return this.syncService.uploadChanges(uploadChangesDto, deviceId);
  }

  @Get('download')
  async downloadChanges(
    @Query(new ZodValidationPipe(GetChangesQuerySchema)) query: GetChangesQueryDto,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-organization-id') organizationId: string,
    @Headers('x-clinic-id') clinicId: string | undefined,
  ): Promise<{ changes: OfflineChange[]; currentSequence: number; hasMore: boolean }> {
    return this.syncService.downloadChanges(
      tenantId,
      organizationId,
      clinicId,
      query.sinceSequence,
      query.limit,
      query.entityType,
    );
  }
}
