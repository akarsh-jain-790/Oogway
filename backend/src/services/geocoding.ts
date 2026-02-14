
import { mapsClient, GOOGLE_MAPS_KEY } from './maps-client';

export interface GeoCoordinates {
    lat: number;
    lng: number;
}

export async function geocodeAddress(address: string): Promise<GeoCoordinates | null> {
    try {
        const response = await mapsClient.geocode({
            params: {
                address: address,
                key: GOOGLE_MAPS_KEY,
            },
        });

        if (response.data.status === 'OK' && response.data.results.length > 0) {
            const location = response.data.results[0].geometry.location;
            return {
                lat: location.lat,
                lng: location.lng
            };
        }

        console.warn(`Geocoding failed for address: ${address}`, response.data.status);
        return null;

    } catch (error) {
        console.error("Geocoding API Error:", error);
        return null;
    }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
        const response = await mapsClient.reverseGeocode({
            params: {
                latlng: { lat, lng },
                key: GOOGLE_MAPS_KEY
            }
        });

        if (response.data.status === 'OK' && response.data.results.length > 0) {
            return response.data.results[0].formatted_address;
        }

        return null;

    } catch (error) {
        console.error("Reverse Geocoding API Error:", error);
        return null;
    }
}
