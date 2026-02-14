import axios from "axios";

export async function getDirections(
  origin: string,
  destination: string,
  departureTime: string
) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  const departureTimestamp = Math.floor(
    new Date(departureTime).getTime() / 1000
  );

  const url = `https://maps.googleapis.com/maps/api/directions/json`;

  const response = await axios.get(url, {
    params: {
      origin,
      destination,
      departure_time: departureTimestamp,
      traffic_model: "best_guess",
      key: apiKey
    }
  });

  const data = response.data;

  if (!data.routes.length) {
    console.error("Google Maps API Error: No routes found.");
    console.error("API Response Status:", data.status);
    console.error("API Error Message:", data.error_message);
    throw new Error(`No routes found (Status: ${data.status})`);
  }

  const leg = data.routes[0].legs[0];

  return {
    distance_km: leg.distance.value / 1000,
    duration_minutes: leg.duration.value / 60,
    duration_in_traffic_minutes: leg.duration_in_traffic
      ? leg.duration_in_traffic.value / 60
      : leg.duration.value / 60
  };
}
