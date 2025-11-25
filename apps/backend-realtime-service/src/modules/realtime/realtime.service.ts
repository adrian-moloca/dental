import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { PublishEventDto } from './dto/publish-event.dto';

@Injectable()
export class RealtimeService {
  private server!: Server;

  setServer(server: Server) {
    this.server = server;
  }

  async publishEvent(dto: PublishEventDto): Promise<{ eventId: string; delivered: number }> {
    if (!this.server) {
      throw new Error('Socket.IO server not initialized');
    }

    const eventId = uuidv4();
    const event = {
      eventId,
      eventType: dto.eventType,
      tenantId: dto.tenantId,
      organizationId: dto.organizationId,
      clinicId: dto.clinicId,
      payload: dto.payload,
      timestamp: new Date(),
    };

    let delivered = 0;

    for (const channel of dto.channels) {
      const roomClients = await this.server.in(channel).fetchSockets();

      const filteredClients = roomClients.filter((socket: any) => {
        return (
          socket.data.user?.tenantId === dto.tenantId &&
          socket.data.user?.organizationId === dto.organizationId &&
          (!dto.clinicId || socket.data.user?.clinicId === dto.clinicId)
        );
      });

      if (filteredClients.length > 0) {
        this.server.to(channel).emit('realtime:event', event);
        delivered += filteredClients.length;
      }
    }

    return { eventId, delivered };
  }

  buildTenantRoom(tenantId: string): string {
    return `tenant:${tenantId}`;
  }

  buildOrganizationRoom(organizationId: string): string {
    return `org:${organizationId}`;
  }

  buildClinicRoom(clinicId: string): string {
    return `clinic:${clinicId}`;
  }

  buildResourceRoom(resourceType: string, resourceId: string): string {
    return `resource:${resourceType}:${resourceId}`;
  }

  buildPatientRoom(patientId: string): string {
    return `patient:${patientId}`;
  }
}
