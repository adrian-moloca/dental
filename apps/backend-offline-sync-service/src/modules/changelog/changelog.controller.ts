import { Controller, Get, Query, Headers } from '@nestjs/common';
import { ChangeLogService } from './changelog.service';
import { GetChangesQueryDto, GetChangesQuerySchema } from './dto/get-changes.dto';
import { OfflineChange } from '@dentalos/shared-domain';
import { ZodValidationPipe } from '@dentalos/shared-validation';

@Controller('sync/changes')
export class ChangeLogController {
  constructor(private readonly changeLogService: ChangeLogService) {}

  @Get()
  async getChanges(
    @Query(new ZodValidationPipe(GetChangesQuerySchema)) query: GetChangesQueryDto,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-organization-id') organizationId: string,
    @Headers('x-clinic-id') clinicId: string | undefined,
  ): Promise<{ changes: OfflineChange[]; currentSequence: number; hasMore: boolean }> {
    const changes = await this.changeLogService.getChangesSince(
      tenantId,
      organizationId,
      clinicId,
      query.sinceSequence,
      query.limit,
      query.entityType,
    );

    const currentSequence = await this.changeLogService.getCurrentSequence(tenantId);

    return {
      changes,
      currentSequence,
      hasMore: changes.length === query.limit,
    };
  }
}
