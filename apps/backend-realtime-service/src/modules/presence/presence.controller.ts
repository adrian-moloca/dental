import { Controller, Get, Query, Param } from '@nestjs/common';
import { PresenceService } from './presence.service';

@Controller('presence')
export class PresenceController {
  constructor(private presenceService: PresenceService) {}

  @Get('users')
  async getUsersOnline(@Query('tenantId') tenantId: string) {
    if (!tenantId) {
      return { error: 'tenantId query parameter required' };
    }

    const users = await this.presenceService.getUsersOnline(tenantId);
    return { users, count: users.length };
  }

  @Get('resource/:type/:id')
  async getUsersViewingResource(
    @Param('type') resourceType: string,
    @Param('id') resourceId: string,
    @Query('tenantId') tenantId: string,
  ) {
    if (!tenantId) {
      return { error: 'tenantId query parameter required' };
    }

    const users = await this.presenceService.getUsersViewingResource(
      tenantId,
      resourceType,
      resourceId,
    );
    return { users, count: users.length, resourceType, resourceId };
  }
}
