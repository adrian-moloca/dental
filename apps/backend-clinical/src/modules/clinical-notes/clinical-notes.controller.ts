import { Get, Post, Param, Body, Query, UseGuards, Controller } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ClinicalNotesService } from './clinical-notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { JwtAuthGuard, PermissionsGuard, TenantIsolationGuard } from '../auth/guards';
import { GetCurrentUser, RequirePermissions } from '../auth/decorators';
import { CurrentUser } from '@dentalos/shared-auth';

@ApiTags('Clinical - Notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantIsolationGuard, PermissionsGuard)
@Controller()
export class ClinicalNotesController {
  constructor(private readonly service: ClinicalNotesService) {}

  @Post('api/v1/clinical/patients/:patientId/notes')
  @RequirePermissions('clinical:notes')
  create(
    @Param('patientId') pid: string,
    @Body() dto: CreateNoteDto,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.service.create(
      pid,
      dto,
      { tenantId: user.tenantId, organizationId: user.organizationId, clinicId: user.clinicId },
      user.userId,
    );
  }

  @Get('api/v1/clinical/patients/:patientId/notes')
  @RequirePermissions('clinical:read')
  findAll(
    @Param('patientId') pid: string,
    @Query() query: any,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.service.findByPatient(pid, { tenantId: user.tenantId }, query);
  }

  @Get('api/v1/clinical/notes/:noteId')
  @RequirePermissions('clinical:read')
  findOne(@Param('noteId') id: string, @GetCurrentUser() user: CurrentUser) {
    return this.service.findById(id, { tenantId: user.tenantId });
  }
}
