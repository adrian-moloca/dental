/**
 * Data Mapper Service
 *
 * Fetches and maps data from various sources (Patient Service, Scheduling, etc.)
 * to the format required by document templates.
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import {
  DocumentGenerationData,
  ClinicData,
  PatientData,
  ProviderData,
  AppointmentData,
  ProcedureData,
  TreatmentPlanData,
  PrescriptionData,
} from './interfaces/template-data.interface';

@Injectable()
export class DataMapperService {
  private readonly logger = new Logger(DataMapperService.name);

  private readonly patientServiceUrl: string;
  private readonly schedulingServiceUrl: string;
  private readonly enterpriseServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.patientServiceUrl =
      this.configService.get<string>('PATIENT_SERVICE_URL') ||
      'http://backend-patient-service:3303';
    this.schedulingServiceUrl =
      this.configService.get<string>('SCHEDULING_SERVICE_URL') || 'http://backend-scheduling:3302';
    this.enterpriseServiceUrl =
      this.configService.get<string>('ENTERPRISE_SERVICE_URL') ||
      'http://backend-enterprise-service:3307';
  }

  /**
   * Fetch and map all required data for document generation
   *
   * @param patientId - Patient ID (required)
   * @param tenantId - Tenant ID (required)
   * @param clinicId - Clinic ID (required)
   * @param appointmentId - Appointment ID (optional)
   * @param treatmentPlanId - Treatment Plan ID (optional)
   * @param procedureId - Procedure ID (optional)
   * @param customData - Additional custom data (optional)
   * @returns Complete document generation data
   */
  async mapDocumentData(params: {
    patientId: string;
    tenantId: string;
    clinicId: string;
    providerId?: string;
    appointmentId?: string;
    treatmentPlanId?: string;
    procedureId?: string;
    customData?: Record<string, any>;
  }): Promise<DocumentGenerationData> {
    this.logger.log(`Mapping document data for patient: ${params.patientId}`);

    const [clinicData, patientData, providerData, appointmentData] = await Promise.all([
      this.fetchClinicData(params.clinicId, params.tenantId),
      this.fetchPatientData(params.patientId, params.tenantId),
      params.providerId
        ? this.fetchProviderData(params.providerId, params.tenantId)
        : this.getDefaultProviderData(),
      params.appointmentId
        ? this.fetchAppointmentData(params.appointmentId, params.tenantId)
        : Promise.resolve(undefined),
    ]);

    // Fetch optional data
    let treatmentPlanData: TreatmentPlanData | undefined;
    let procedureData: ProcedureData | undefined;
    let prescriptionData: PrescriptionData | undefined;

    if (params.treatmentPlanId) {
      treatmentPlanData = await this.fetchTreatmentPlanData(
        params.treatmentPlanId,
        params.tenantId,
      );
    }

    if (params.procedureId) {
      procedureData = await this.fetchProcedureData(params.procedureId, params.tenantId);
    }

    // Generate metadata
    const now = new Date();
    const metadata = {
      issueDate: this.formatDate(now),
      completionDate: this.formatDate(now),
      signatureDate: this.formatDate(now),
      generationDate: this.formatDateTime(now),
    };

    return {
      clinic: clinicData,
      patient: patientData,
      provider: providerData,
      appointment: appointmentData,
      treatmentPlan: treatmentPlanData,
      procedure: procedureData,
      prescription: prescriptionData,
      ...metadata,
      ...params.customData,
    };
  }

  /**
   * Fetch clinic data from Enterprise Service
   */
  private async fetchClinicData(clinicId: string, tenantId: string): Promise<ClinicData> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.enterpriseServiceUrl}/api/v1/clinics/${clinicId}`, {
          headers: { 'X-Tenant-ID': tenantId },
        }),
      );

      const clinic = response.data;

      return {
        clinicName: clinic.name || 'Cabinet Stomatologic',
        clinicCUI: clinic.taxId || 'RO12345678',
        clinicAddress: clinic.address?.street || 'Str. Exemplu, Nr. 1, București',
        clinicPhone: clinic.phone || '+40 21 123 4567',
        clinicEmail: clinic.email || 'contact@cabinet.ro',
        clinicLogo: clinic.logoUrl,
        clinicWebsite: clinic.website,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.warn(`Failed to fetch clinic data: ${err.message}. Using defaults.`);
      return this.getDefaultClinicData();
    }
  }

  /**
   * Fetch patient data from Patient Service
   */
  private async fetchPatientData(patientId: string, tenantId: string): Promise<PatientData> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.patientServiceUrl}/api/v1/patients/${patientId}`, {
          headers: { 'X-Tenant-ID': tenantId },
        }),
      );

      const patient = response.data;

      // Format address
      const addressParts = [];
      if (patient.contacts?.addresses?.[0]) {
        const addr = patient.contacts.addresses[0];
        if (addr.street) addressParts.push(addr.street);
        if (addr.street2) addressParts.push(addr.street2);
      }

      return {
        patientId: patient.id,
        patientName: `${patient.person?.firstName || ''} ${patient.person?.lastName || ''}`.trim(),
        patientNumber: patient.patientNumber,
        cnp: patient.person?.nationalId?.lastFour
          ? `***********${patient.person.nationalId.lastFour}`
          : 'N/A',
        dateOfBirth: patient.person?.dateOfBirth
          ? this.formatDate(new Date(patient.person.dateOfBirth))
          : 'N/A',
        age: patient.person?.dateOfBirth
          ? this.calculateAge(new Date(patient.person.dateOfBirth))
          : undefined,
        gender: this.formatGender(patient.person?.gender),
        address: addressParts.join(', ') || 'Adresă necunoscută',
        city: patient.contacts?.addresses?.[0]?.city,
        county: patient.contacts?.addresses?.[0]?.state,
        postalCode: patient.contacts?.addresses?.[0]?.postalCode,
        phone: patient.contacts?.phones?.[0]?.number || 'N/A',
        email: patient.contacts?.emails?.[0]?.address,
        occupation: patient.demographics?.occupation,
        workplace: 'N/A', // Not in current schema

        // Medical alerts (simplified from structured data)
        allergies: this.formatAllergies(patient.medicalAlerts?.allergies),
        chronicDiseases: this.formatConditions(patient.medicalAlerts?.conditions),
        currentMedications: this.formatMedications(patient.medicalAlerts?.medications),
        previousSurgeries: 'A completa',

        // Insurance
        insuranceProvider: patient.insurancePolicies?.[0]?.provider?.name,
        insurancePolicyNumber: patient.insurancePolicies?.[0]?.policyNumber,
        insuranceValidFrom: patient.insurancePolicies?.[0]?.effectiveDate
          ? this.formatDate(new Date(patient.insurancePolicies[0].effectiveDate))
          : undefined,
        insuranceValidUntil: patient.insurancePolicies?.[0]?.expirationDate
          ? this.formatDate(new Date(patient.insurancePolicies[0].expirationDate))
          : undefined,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to fetch patient data: ${err.message}`, err.stack);
      throw new NotFoundException(`Patient not found: ${patientId}`);
    }
  }

  /**
   * Fetch provider (dentist) data
   */
  private async fetchProviderData(providerId: string, _tenantId: string): Promise<ProviderData> {
    try {
      // Assuming provider data comes from Auth service or separate Provider service
      return {
        providerId,
        providerName: 'Dr. [Nume Medic]',
        providerSpecialization: 'Medic Dentist',
        providerCNASCode: '123456',
      };
    } catch (error) {
      const err = error as Error;
      this.logger.warn(`Failed to fetch provider data: ${err.message}`);
      return this.getDefaultProviderData();
    }
  }

  /**
   * Fetch appointment data from Scheduling Service
   */
  private async fetchAppointmentData(
    appointmentId: string,
    tenantId: string,
  ): Promise<AppointmentData | undefined> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.schedulingServiceUrl}/api/v1/appointments/${appointmentId}`, {
          headers: { 'X-Tenant-ID': tenantId },
        }),
      );

      const appointment = response.data;

      return {
        appointmentId: appointment.id,
        appointmentDate: appointment.start ? this.formatDate(new Date(appointment.start)) : 'N/A',
        appointmentTime: appointment.start ? this.formatTime(new Date(appointment.start)) : 'N/A',
        appointmentType: appointment.serviceCode || 'Consultație',
        estimatedDuration: appointment.end
          ? `${Math.round((new Date(appointment.end).getTime() - new Date(appointment.start).getTime()) / 60000)} minute`
          : 'N/A',
      };
    } catch (error) {
      const err = error as Error;
      this.logger.warn(`Failed to fetch appointment data: ${err.message}`);
      return undefined;
    }
  }

  /**
   * Fetch treatment plan data
   */
  private async fetchTreatmentPlanData(
    _treatmentPlanId: string,
    _tenantId: string,
  ): Promise<TreatmentPlanData> {
    // Placeholder - implement when treatment plan service is available
    return {
      planNumber: `PLAN-${Date.now()}`,
      diagnosticSummary: 'Diagnostic sumar - a completa',
      phases: [],
      subtotal: 0,
      discountTotal: 0,
      discountPercent: 0,
      taxTotal: 0,
      grandTotal: 0,
      validityPeriod: 90,
    };
  }

  /**
   * Fetch procedure data
   */
  private async fetchProcedureData(
    _procedureId: string,
    _tenantId: string,
  ): Promise<ProcedureData> {
    // Placeholder - implement when procedure catalog is available
    return {
      procedureName: 'Nume Procedură',
      procedureCode: 'D0000',
      procedureDescription: 'Descriere procedură',
    };
  }

  // Helper methods for formatting

  private formatDate(date: Date): string {
    return format(date, 'dd.MM.yyyy', { locale: ro });
  }

  private formatDateTime(date: Date): string {
    return format(date, 'dd.MM.yyyy HH:mm', { locale: ro });
  }

  private formatTime(date: Date): string {
    return format(date, 'HH:mm', { locale: ro });
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  private formatGender(gender?: string): string {
    const map: Record<string, string> = {
      male: 'Masculin',
      female: 'Feminin',
      other: 'Altul',
      prefer_not_to_say: 'Neprecizat',
    };
    return gender ? map[gender] || gender : 'Neprecizat';
  }

  private formatAllergies(allergies?: any[]): string {
    if (!allergies || allergies.length === 0) return 'Fără alergii cunoscute';
    return allergies.map((a) => `${a.allergen} (${a.severity})`).join(', ');
  }

  private formatConditions(conditions?: any[]): string {
    if (!conditions || conditions.length === 0) return 'Fără boli cronice cunoscute';
    return conditions.map((c) => c.name).join(', ');
  }

  private formatMedications(medications?: any[]): string {
    if (!medications || medications.length === 0) return 'Fără medicamente în curs';
    return medications.map((m) => `${m.name} (${m.dosage}, ${m.frequency})`).join('; ');
  }

  // Default data methods

  private getDefaultClinicData(): ClinicData {
    return {
      clinicName: 'Cabinet Stomatologic',
      clinicCUI: 'RO12345678',
      clinicAddress: 'București, România',
      clinicPhone: '+40 21 123 4567',
      clinicEmail: 'contact@cabinet.ro',
    };
  }

  private getDefaultProviderData(): ProviderData {
    return {
      providerId: 'default',
      providerName: 'Dr. [Nume Medic]',
      providerSpecialization: 'Medic Dentist',
    };
  }
}
