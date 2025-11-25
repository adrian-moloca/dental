import { getDatabase } from '../indexeddb';
import { PatientRecord } from '../schema';

export class PatientRepository {
  async create(patient: PatientRecord): Promise<void> {
    const db = getDatabase();
    await db.patients.add(patient);
  }

  async update(patientId: string, updates: Partial<PatientRecord>): Promise<void> {
    const db = getDatabase();
    await db.patients.update(patientId, { ...updates, updatedAt: new Date() });
  }

  async delete(patientId: string): Promise<void> {
    const db = getDatabase();
    await db.patients.delete(patientId);
  }

  async findById(patientId: string): Promise<PatientRecord | undefined> {
    const db = getDatabase();
    return db.patients.get(patientId);
  }

  async findByTenant(tenantId: string, limit: number = 100, offset: number = 0): Promise<PatientRecord[]> {
    const db = getDatabase();
    return db.patients
      .where('tenantId')
      .equals(tenantId)
      .offset(offset)
      .limit(limit)
      .toArray();
  }

  async search(tenantId: string, query: string, limit: number = 50): Promise<PatientRecord[]> {
    const db = getDatabase();
    const lowerQuery = query.toLowerCase();

    return db.patients
      .where('tenantId')
      .equals(tenantId)
      .filter(patient => {
        const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
        const email = patient.email?.toLowerCase() || '';
        const phone = patient.phone || '';

        return fullName.includes(lowerQuery) ||
               email.includes(lowerQuery) ||
               phone.includes(query);
      })
      .limit(limit)
      .toArray();
  }

  async count(tenantId: string): Promise<number> {
    const db = getDatabase();
    return db.patients.where('tenantId').equals(tenantId).count();
  }
}
