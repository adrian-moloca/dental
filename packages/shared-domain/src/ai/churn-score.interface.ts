export interface ChurnScore {
  patientId: string;
  score: number;
  confidence: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: ChurnFactor[];
  recommendations: string[];
  calculatedAt: Date;
  validUntil: Date;
}

export interface ChurnFactor {
  factor: string;
  impact: number;
  description: string;
}
