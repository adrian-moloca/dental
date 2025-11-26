/**
 * Procedure Catalog Types
 */

export interface ProcedureCatalogItem {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  defaultPrice: number;
  estimatedDuration?: number;
  requiresAuth?: boolean;
}

export interface SelectedProcedure {
  procedureId: string;
  code: string;
  name: string;
  price: number;
  quantity: number;
  tooth?: string;
  surfaces?: string[];
}

export interface CompleteAppointmentPayload {
  procedures: Array<{
    procedureId: string;
    quantity: number;
    price: number;
    tooth?: string;
    surfaces?: string[];
  }>;
}

export interface CompleteAppointmentResponse {
  appointment: {
    id: string;
    status: string;
    completedAt: string;
  };
  invoice: {
    id: string;
    invoiceNumber: string;
    status: string;
    total: number;
  };
}
