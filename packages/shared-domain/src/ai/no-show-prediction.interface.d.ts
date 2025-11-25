export interface NoShowPrediction {
    appointmentId: string;
    patientId: string;
    probabilityNoShow: number;
    confidence: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    factors: PredictionFactor[];
    recommendations: string[];
    calculatedAt: Date;
}
export interface PredictionFactor {
    factor: string;
    weight: number;
    description: string;
}
