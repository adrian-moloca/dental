/**
 * Clinical Data Adapter
 *
 * Transforms internal clinical DTOs to patient-friendly formats.
 * Converts medical terminology to readable summaries.
 *
 * @module common/adapters/clinical-data-adapter
 */

import { Injectable } from '@nestjs/common';

export interface PatientFriendlyVisit {
  visitId: string;
  date: string;
  provider: string;
  reason: string;
  summary: string;
  proceduresPerformed: string[];
}

export interface PatientFriendlyTreatmentPlan {
  treatmentPlanId: string;
  title: string;
  description: string;
  status: string;
  statusLabel: string;
  createdDate: string;
  estimatedTotal: number;
  items: Array<{
    itemId: string;
    treatment: string;
    tooth?: string;
    priority: string;
    priorityLabel: string;
    estimatedCost: number;
    status: string;
    statusLabel: string;
  }>;
}

@Injectable()
export class ClinicalDataAdapter {
  /**
   * Transform visit to patient-friendly format
   */
  transformVisit(visit: any): PatientFriendlyVisit {
    return {
      visitId: visit.visitId,
      date: this.formatDate(visit.visitDate),
      provider: `Dr. ${visit.provider.firstName} ${visit.provider.lastName}`,
      reason: visit.chiefComplaint || 'Routine visit',
      summary: this.sanitizeClinicalNote(visit.treatmentSummary),
      proceduresPerformed: visit.procedures.map((p: any) => this.formatProcedure(p)),
    };
  }

  /**
   * Transform treatment plan to patient-friendly format
   */
  transformTreatmentPlan(plan: any): PatientFriendlyTreatmentPlan {
    const estimatedTotal = plan.items.reduce(
      (sum: number, item: any) => sum + (item.estimatedCost || 0),
      0,
    );

    return {
      treatmentPlanId: plan.treatmentPlanId,
      title: plan.title,
      description: plan.description,
      status: plan.status,
      statusLabel: this.getStatusLabel(plan.status),
      createdDate: this.formatDate(plan.createdAt),
      estimatedTotal,
      items: plan.items.map((item: any) => ({
        itemId: item.itemId,
        treatment: item.procedureName,
        tooth: item.toothNumber ? `Tooth #${item.toothNumber}` : undefined,
        priority: item.priority,
        priorityLabel: this.getPriorityLabel(item.priority),
        estimatedCost: item.estimatedCost,
        status: item.status,
        statusLabel: this.getStatusLabel(item.status),
      })),
    };
  }

  /**
   * Format procedure for display
   */
  private formatProcedure(procedure: any): string {
    const parts = [procedure.description];
    if (procedure.toothNumber) {
      parts.push(`(Tooth #${procedure.toothNumber})`);
    }
    return parts.join(' ');
  }

  /**
   * Sanitize clinical notes to remove overly technical terminology
   */
  private sanitizeClinicalNote(note: string): string {
    if (!note) return 'No summary available';

    // Remove excessive medical jargon while keeping the note informative
    // In production, this could use NLP to simplify terminology
    return note;
  }

  /**
   * Format date to readable format
   */
  private formatDate(date: string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Get human-readable status label
   */
  private getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pending',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      proposed: 'Proposed',
      accepted: 'Accepted',
      declined: 'Declined',
      active: 'Active',
      inactive: 'Inactive',
    };
    return labels[status] || status;
  }

  /**
   * Get human-readable priority label
   */
  private getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      urgent: 'Urgent',
      high: 'High Priority',
      medium: 'Medium Priority',
      low: 'Low Priority',
      elective: 'Elective',
    };
    return labels[priority] || priority;
  }
}
