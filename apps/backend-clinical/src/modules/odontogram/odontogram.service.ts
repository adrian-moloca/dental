/**
 * Odontogram Service
 * Business logic for odontogram operations
 */

import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OdontogramRepository } from './odontogram.repository';
import { UpdateOdontogramDto, UpdateToothDto } from './dto/update-odontogram.dto';
import { OdontogramDocument, Tooth } from './entities/odontogram.schema';

interface TenantContext {
  tenantId: string;
  organizationId: string;
  clinicId: string;
}

@Injectable()
export class OdontogramService {
  private readonly logger = new Logger(OdontogramService.name);

  constructor(
    private readonly repository: OdontogramRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Gets odontogram for patient (creates if not exists)
   */
  async getOdontogram(
    patientId: string,
    tenantContext: TenantContext,
    userId: string,
  ): Promise<OdontogramDocument> {
    const startTime = Date.now();

    const odontogram = await this.repository.findOrCreate(patientId, tenantContext, userId);

    const duration = Date.now() - startTime;
    this.logger.log(`Retrieved odontogram for patient ${patientId} in ${duration}ms`);

    // Performance budget check
    if (duration > 150) {
      this.logger.warn(`Odontogram retrieval exceeded performance budget: ${duration}ms > 150ms`);
    }

    return odontogram;
  }

  /**
   * Updates odontogram with new tooth data
   */
  async updateOdontogram(
    patientId: string,
    tenantContext: TenantContext,
    updateDto: UpdateOdontogramDto,
    userId: string,
  ): Promise<OdontogramDocument> {
    // Convert DTO to Map<number, Tooth>
    const teethUpdates = new Map<number, Tooth>();

    updateDto.teeth.forEach((toothDto: UpdateToothDto) => {
      const tooth: Tooth = {
        toothNumber: toothDto.toothNumber,
        status: toothDto.status as any,
        buccal: toothDto.buccal,
        lingual: toothDto.lingual,
        mesial: toothDto.mesial,
        distal: toothDto.distal,
        occlusal: toothDto.occlusal,
        notes: toothDto.notes,
      };

      teethUpdates.set(toothDto.toothNumber, tooth);
    });

    // Update odontogram
    const odontogram = await this.repository.update(patientId, tenantContext, teethUpdates, userId);

    // Emit domain events for each tooth status change
    updateDto.teeth.forEach((toothDto) => {
      this.eventEmitter.emit('tooth.status.updated', {
        patientId,
        toothNumber: toothDto.toothNumber,
        status: toothDto.status,
        updatedBy: userId,
        tenantId: tenantContext.tenantId,
        timestamp: new Date(),
      });
    });

    this.logger.log(`Updated odontogram for patient ${patientId}, version ${odontogram.version}`);

    return odontogram;
  }
}
