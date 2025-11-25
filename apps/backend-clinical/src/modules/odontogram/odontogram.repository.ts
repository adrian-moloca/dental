/**
 * Odontogram Repository
 * Handles data access for odontogram operations with tenant isolation
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Odontogram, OdontogramDocument, Tooth } from './entities/odontogram.schema';

interface TenantContext {
  tenantId: string;
  organizationId: string;
  clinicId: string;
}

@Injectable()
export class OdontogramRepository {
  constructor(
    @InjectModel(Odontogram.name)
    private odontogramModel: Model<OdontogramDocument>,
  ) {}

  /**
   * Finds odontogram for a patient with tenant isolation
   */
  async findByPatientId(
    patientId: string,
    tenantContext: TenantContext,
  ): Promise<OdontogramDocument | null> {
    return this.odontogramModel
      .findOne({
        patientId,
        tenantId: tenantContext.tenantId,
        organizationId: tenantContext.organizationId,
      })
      .exec();
  }

  /**
   * Creates new odontogram with all 32 teeth initialized
   */
  async create(
    patientId: string,
    tenantContext: TenantContext,
    updatedBy: string,
  ): Promise<OdontogramDocument> {
    // Initialize all 32 teeth with 'present' status
    const teeth = new Map<number, Tooth>();
    for (let i = 1; i <= 32; i++) {
      teeth.set(i, {
        toothNumber: i,
        status: 'present',
        buccal: { conditions: [], procedures: [] },
        lingual: { conditions: [], procedures: [] },
        mesial: { conditions: [], procedures: [] },
        distal: { conditions: [], procedures: [] },
        occlusal: { conditions: [], procedures: [] },
      });
    }

    const odontogram = new this.odontogramModel({
      patientId,
      tenantId: tenantContext.tenantId,
      organizationId: tenantContext.organizationId,
      clinicId: tenantContext.clinicId,
      teeth,
      updatedBy,
      version: 1,
    });

    return odontogram.save();
  }

  /**
   * Updates odontogram teeth data
   */
  async update(
    patientId: string,
    tenantContext: TenantContext,
    teethUpdates: Map<number, Tooth>,
    updatedBy: string,
  ): Promise<OdontogramDocument> {
    const odontogram = await this.findByPatientId(patientId, tenantContext);

    if (!odontogram) {
      throw new NotFoundException(`Odontogram not found for patient ${patientId}`);
    }

    // Merge updates into existing teeth
    teethUpdates.forEach((toothData, toothNumber) => {
      odontogram.teeth.set(toothNumber, toothData);
    });

    odontogram.updatedBy = updatedBy;
    odontogram.version += 1;
    odontogram.markModified('teeth');

    return odontogram.save();
  }

  /**
   * Gets or creates odontogram for a patient
   */
  async findOrCreate(
    patientId: string,
    tenantContext: TenantContext,
    userId: string,
  ): Promise<OdontogramDocument> {
    let odontogram = await this.findByPatientId(patientId, tenantContext);

    if (!odontogram) {
      odontogram = await this.create(patientId, tenantContext, userId);
    }

    return odontogram;
  }
}
