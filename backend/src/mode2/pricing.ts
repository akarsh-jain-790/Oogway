export function estimatePricing(
  distance_km: number,
  duration_in_traffic_minutes: number
) {
  const peak = duration_in_traffic_minutes > 40 ? 1.4 : 1.0;

  return {
    uber_estimate: Math.round(50 + distance_km * 14 * peak),
    ola_estimate: Math.round(45 + distance_km * 13 * peak),
    namma_estimate: Math.round(35 + distance_km * 11 * peak)
  };
}
