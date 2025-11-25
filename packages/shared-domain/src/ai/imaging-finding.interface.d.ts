export interface ImagingFinding {
    studyId: string;
    patientId: string;
    findings: Finding[];
    summary: string;
    abnormalities: Abnormality[];
    recommendations: string[];
    confidence: number;
    requiresReview: boolean;
    generatedAt: Date;
}
export interface Finding {
    region: string;
    description: string;
    severity: 'NORMAL' | 'MILD' | 'MODERATE' | 'SEVERE';
    confidence: number;
    coordinates?: {
        x: number;
        y: number;
        width?: number;
        height?: number;
    };
}
export interface Abnormality {
    type: string;
    location: string;
    description: string;
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}
