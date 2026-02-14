
import axios from 'axios';
import { GOOGLE_MAPS_KEY } from './maps-client';

export interface AirQualityData {
    latitude: number;
    longitude: number;
    aqi: number; // Air Quality Index (0-500)
    category: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
    primaryPollutant: string;
    pm25?: number;
    pm10?: number;
    o3?: number;
    no2?: number;
    so2?: number;
    co?: number;
}

/**
 * Get air quality data for a location
 * Uses the Air Quality API (Part of Google Maps APIs)
 */
export async function getAirQuality(
    latitude: number,
    longitude: number
): Promise<AirQualityData | null> {
    try {
        const url = `https://airquality.googleapis.com/v1/current:lookup?key=${GOOGLE_MAPS_KEY}`;

        const data = {
            location: {
                latitude: latitude,
                longitude: longitude
            }
        };

        const response = await axios.post(url, data);

        if (response.data && response.data.indexes && response.data.indexes.length > 0) {
            const aqiData = response.data.indexes[0];

            // Get pollutant info if available
            const pollutants = response.data.pollutants || [];
            const getPollutant = (code: string) => {
                const p = pollutants.find((poll: any) => poll.code === code);
                return p ? p.concentration?.value : undefined;
            };

            return {
                latitude,
                longitude,
                aqi: aqiData.aqi || 0,
                category: categorizeAQI(aqiData.aqi || 0),
                primaryPollutant: aqiData.dominantPollutant || 'N/A',
                pm25: getPollutant('pm25'),
                pm10: getPollutant('pm10'),
                o3: getPollutant('o3'),
                no2: getPollutant('no2'),
                so2: getPollutant('so2'),
                co: getPollutant('co')
            };
        }

        return null;
    } catch (error: any) {
        if (error.response) {
            console.error("Air Quality API Error:", error.response.status, error.response.data);
        } else {
            console.error("Air Quality API Error:", error.message);
        }
        return null;
    }
}

/**
 * Get air quality for multiple locations
 */
export async function getBatchAirQuality(
    locations: { lat: number; lng: number }[]
): Promise<Map<string, AirQualityData>> {
    const results = new Map<string, AirQualityData>();

    for (const loc of locations) {
        const key = `${loc.lat},${loc.lng}`;
        const aqi = await getAirQuality(loc.lat, loc.lng);
        if (aqi) {
            results.set(key, aqi);
        }
        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
}

/**
 * Categorize AQI value
 */
function categorizeAQI(aqi: number): AirQualityData['category'] {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
}
