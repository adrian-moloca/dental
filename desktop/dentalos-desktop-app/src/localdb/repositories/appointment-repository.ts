import { getDatabase } from '../indexeddb';
import { AppointmentRecord } from '../schema';

export class AppointmentRepository {
  async create(appointment: AppointmentRecord): Promise<void> {
    const db = getDatabase();
    await db.appointments.add(appointment);
  }

  async update(appointmentId: string, updates: Partial<AppointmentRecord>): Promise<void> {
    const db = getDatabase();
    await db.appointments.update(appointmentId, { ...updates, updatedAt: new Date() });
  }

  async delete(appointmentId: string): Promise<void> {
    const db = getDatabase();
    await db.appointments.delete(appointmentId);
  }

  async findById(appointmentId: string): Promise<AppointmentRecord | undefined> {
    const db = getDatabase();
    return db.appointments.get(appointmentId);
  }

  async findByDateRange(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AppointmentRecord[]> {
    const db = getDatabase();
    return db.appointments
      .where('[tenantId+startTime]')
      .between([tenantId, startDate], [tenantId, endDate], true, true)
      .toArray();
  }

  async findByPatient(patientId: string, limit: number = 50): Promise<AppointmentRecord[]> {
    const db = getDatabase();
    return db.appointments
      .where('patientId')
      .equals(patientId)
      .reverse()
      .limit(limit)
      .toArray();
  }

  async findByClinic(clinicId: string, date: Date): Promise<AppointmentRecord[]> {
    const db = getDatabase();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return db.appointments
      .where('clinicId')
      .equals(clinicId)
      .and(apt => apt.startTime >= startOfDay && apt.startTime <= endOfDay)
      .toArray();
  }
}
