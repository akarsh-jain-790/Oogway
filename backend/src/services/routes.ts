
import axios from 'axios';
import { GOOGLE_MAPS_KEY } from './maps-client';

export interface TrafficPrediction {
    originLat: number;
    originLng: number;
    destLat: number;
    destLng: number;
    durationInTraffic: number; // seconds
    duration: number; // seconds
    trafficDelay: number; // additional seconds due to traffic
    trafficCondition: 'heavy' | 'moderate' | 'light' | 'unknown';
}

/**
 * Get traffic predictions using Routes API (REST endpoint)
 * Returns travel times considering current traffic conditions
 */
export async function getTrafficPrediction(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
): Promise<TrafficPrediction | null> {
    try {
        const url = 'https://routes.googleapis.com/v1:computeRoutes';

        const data = {
            origin: {
                location: {
                    latLng: {
                        latitude: origin.lat,
                        longitude: origin.lng
                    }
                }
            },
            destination: {
                location: {
                    latLng: {
                        latitude: destination.lat,
                        longitude: destination.lng
                    }
                }
            },
            routingPreference: 'TRAFFIC_AWARE',
            travelMode: 'DRIVE',
            departureTime: new Date().toISOString(),
            computeBestOrder: false,
            // Request duration in traffic
            routesStrategy: 'DISTANCE'
        };

        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GOOGLE_MAPS_KEY,
                'X-Goog-FieldMask': 'routes.duration,routes.durationInTraffic,routes.distanceMeters'
            }
        });

        if (response.data.routes && response.data.routes.length > 0) {
            const route = response.data.routes[0];

            // Parse duration strings (e.g., "1230s" -> 1230)
            const parseDuration = (dur: string): number => {
                if (!dur) return 0;
                const match = dur.match(/^(\d+)s?$/);
                return match ? parseInt(match[1]) : 0;
            };

            const durationSec = parseDuration(route.duration);
            const trafficSec = parseDuration(route.durationInTraffic);
            const trafficDelay = Math.max(0, trafficSec - durationSec);

            // Classify traffic condition
            let trafficCondition: 'heavy' | 'moderate' | 'light' | 'unknown' = 'unknown';
            if (trafficDelay > 600) { // > 10 min delay
                trafficCondition = 'heavy';
            } else if (trafficDelay > 180) { // > 3 min delay
                trafficCondition = 'moderate';
            } else if (trafficDelay > 0) {
                trafficCondition = 'light';
            }

            return {
                originLat: origin.lat,
                originLng: origin.lng,
                destLat: destination.lat,
                destLng: destination.lng,
                durationInTraffic: trafficSec,
                duration: durationSec,
                trafficDelay,
                trafficCondition
            };
        }

        return null;
    } catch (error: any) {
        if (error.response) {
            console.error("Routes API Error:", error.response.status, error.response.data);
        } else {
            console.error("Routes API Error:", error.message);
        }
        return null;
    }
}

/**
 * Get traffic predictions for multiple origin-destination pairs
 * Uses batch processing for efficiency
 */
export async function getBatchTrafficPredictions(
    origins: { lat: number; lng: number }[],
    destinations: { lat: number; lng: number }[]
): Promise<TrafficPrediction[]> {
    const results: TrafficPrediction[] = [];

    // Process in batches to avoid rate limiting
    const batchSize = 5;

    for (let i = 0; i < origins.length; i += batchSize) {
        const originBatch = origins.slice(i, i + batchSize);

        for (const origin of originBatch) {
            for (const dest of destinations) {
                const prediction = await getTrafficPrediction(origin, dest);
                if (prediction) {
                    results.push(prediction);
                }
                // Small delay to respect rate limits
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
    }

    return results;
}
