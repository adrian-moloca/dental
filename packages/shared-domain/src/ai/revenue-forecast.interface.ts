export interface RevenueForecast {
  clinicId?: string;
  organizationId: string;
  forecastedRevenue: ForecastedRevenuePeriod[];
  totalForecastedRevenue: number;
  confidence: number;
  factors: RevenueFactor[];
  recommendations: string[];
  generatedAt: Date;
  forecastHorizonDays: number;
}

export interface ForecastedRevenuePeriod {
  period: string;
  startDate: Date;
  endDate: Date;
  predictedRevenue: number;
  confidence: number;
  breakdown?: {
    appointments?: number;
    procedures?: number;
    products?: number;
  };
}

export interface RevenueFactor {
  factor: string;
  impact: number;
  description: string;
}
