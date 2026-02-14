export function estimatePricing(
  distance_km: number,
  duration_in_traffic_minutes: number,
  traffic_delay_minutes: number,
  isRaining: boolean
) {
  let surgeMultiplier = 1;

  if (traffic_delay_minutes > 8) surgeMultiplier += 0.2;
  if (isRaining) surgeMultiplier += 0.1;

  return {
    uber_estimate: Math.round(50 + distance_km * 14 * surgeMultiplier),
    ola_estimate: Math.round(45 + distance_km * 13 * surgeMultiplier),
    namma_estimate: Math.round(35 + distance_km * 11)
  };
}
