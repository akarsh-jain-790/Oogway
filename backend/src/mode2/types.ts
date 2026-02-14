export interface AnalyzeRequest {
  origin: string;
  destination: string;
  departure_time: string;
  transport_mode?: string;
}

export interface TripSummary {
  distance_km: number;
  duration_minutes: number;
  duration_in_traffic_minutes: number;
}
