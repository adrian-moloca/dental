export interface InventoryForecast {
    itemId: string;
    itemName: string;
    currentStock: number;
    forecastedUsage: ForecastedPeriod[];
    recommendedReorderPoint: number;
    recommendedOrderQuantity: number;
    predictedStockoutDate?: Date;
    confidence: number;
    factors: string[];
    generatedAt: Date;
    forecastHorizonDays: number;
}
export interface ForecastedPeriod {
    period: string;
    startDate: Date;
    endDate: Date;
    predictedUsage: number;
    confidence: number;
}
