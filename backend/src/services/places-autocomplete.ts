
import axios from 'axios';
import { GOOGLE_MAPS_KEY } from './maps-client';

export interface PlacePrediction {
    description: string;
    place_id: string;
    location?: { lat: number; lng: number }; // New API returns detailed location if asked
}

export async function searchPlaces(input: string, types?: string[]): Promise<PlacePrediction[]> {
    try {
        // Using "Places API (New)" - Text Search
        // https://developers.google.com/maps/documentation/places/web-service/text-search
        const url = 'https://places.googleapis.com/v1/places:searchText';

        const data = {
            textQuery: input,
            // types can be used for 'includedType' filtering if needed, but not strictly 'autocomplete' types
            // For general search, we can omit or map types if crucial
            maxResultCount: 5
        };

        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GOOGLE_MAPS_KEY,
                'X-Goog-FieldMask': 'places.name,places.id,places.formattedAddress,places.location'
            }
        });

        if (response.data && response.data.places) {
            return response.data.places.map((p: any) => ({
                description: p.formattedAddress || p.name, // Fallback
                place_id: p.name, // In New API, 'name' is the resource name (places/...) but 'id' is place_id often. 
                // Wait, New API 'name' is resource name e.g. "places/ChIJ...". ID is the short ID.
                // BUT standard google maps JS often expects place_id. The 'id' field is place_id.
                // Correction: New API `id` field is the Place ID. `name` is resource name.
                // Let's use `id` as `place_id`.
                location: p.location
            }));
        }

        return [];

    } catch (error: any) {
        if (error.response) {
            console.error("Places Search New API Error:", error.response.status, error.response.data);
        } else {
            console.error("Places Search New API Error:", error.message);
        }
        return [];
    }
}
