export interface TreatmentRecommendation {
    patientId: string;
    recommendedProcedures: RecommendedProcedure[];
    clinicalReasoning: string;
    contraindications?: string[];
    urgencyLevel: 'ROUTINE' | 'SOON' | 'URGENT' | 'EMERGENCY';
    estimatedCost?: number;
    alternativeTreatments?: string[];
    generatedAt: Date;
}
export interface RecommendedProcedure {
    procedureCode: string;
    procedureName: string;
    reasoning: string;
    priority: number;
    toothNumber?: string;
    estimatedDuration?: number;
}
