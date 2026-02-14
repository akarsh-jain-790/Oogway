
import axios from 'axios';
import { GOOGLE_MAPS_KEY } from './maps-client';

export interface AmenityData {
    hospitals: number;
    schools: number;
    restaurants: number;
    parks: number;
}

export async function findAmenities(lat: number, lng: number, radiusMs: number = 2000): Promise<AmenityData> {
    try {
        const [hospitals, schools, restaurants, parks] = await Promise.all([
            countPlaceTypeNew(lat, lng, radiusMs, 'hospital'),
            countPlaceTypeNew(lat, lng, radiusMs, 'school'),
            countPlaceTypeNew(lat, lng, radiusMs, 'restaurant'),
            countPlaceTypeNew(lat, lng, radiusMs, 'park')
        ]);

        return {
            hospitals,
            schools,
            restaurants,
            parks
        };

    } catch (error) {
        console.error("Amenity Check Error:", error);
        return { hospitals: 0, schools: 0, restaurants: 0, parks: 0 };
    }
}

async function countPlaceTypeNew(lat: number, lng: number, radius: number, type: string): Promise<number> {
    try {
        // Using "Places API (New)" endpoint
        // https://developers.google.com/maps/documentation/places/web-service/search-nearby
        const url = 'https://places.googleapis.com/v1/places:searchNearby';

        const data = {
            includedTypes: [type],
            maxResultCount: 20, // Max allowed per page
            locationRestriction: {
                circle: {
                    center: {
                        latitude: lat,
                        longitude: lng
                    },
                    radius: radius
                }
            }
        };

        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GOOGLE_MAPS_KEY,
                // Only ask for 'name' to verify existence - saves response size/cost
                'X-Goog-FieldMask': 'places.name'
            }
        });

        if (response.data && response.data.places) {
            return response.data.places.length;
        }
        return 0;

    } catch (error: any) {
        // Log detailed error if axios fails (e.g. 403, 400)
        if (error.response) {
            console.error(`Places API New Error (${type}):`, error.response.status, error.response.data);
        } else {
            console.error(`Places API New Error (${type}):`, error.message);
        }
        return 0;
    }
}
