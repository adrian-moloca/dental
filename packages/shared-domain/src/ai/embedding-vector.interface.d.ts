export interface EmbeddingVector {
    id: string;
    entityType: string;
    entityId: string;
    tenantId: string;
    vector: number[];
    dimensions: number;
    model: string;
    metadata?: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}
