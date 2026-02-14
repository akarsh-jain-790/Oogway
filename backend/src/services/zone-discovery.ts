
import { Anchor, Zone } from '../mode1/models';
import axios from 'axios';
import { GOOGLE_MAPS_KEY } from './maps-client';

export interface DiscoveredZone extends Zone {
    placeId: string;
}

export async function discoverZones(anchors: Anchor[], radiusKm: number = 3): Promise<DiscoveredZone[]> {
    if (anchors.length === 0) return [];

    const center = anchors[0];
    const radiusMeters = radiusKm * 1000;

    try {
        // Using "Places API (New)" - Text Search
        // Query: "neighborhoods/sublocalities" with location bias

        const url = 'https://places.googleapis.com/v1/places:searchText';

        const data = {
            textQuery: 'residential areas',
            maxResultCount: 10,
            locationBias: {
                circle: {
                    center: {
                        latitude: center.latitude,
                        longitude: center.longitude
                    },
                    radius: radiusMeters
                }
            }
        };

        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GOOGLE_MAPS_KEY,
                'X-Goog-FieldMask': 'places.name,places.id,places.formattedAddress,places.location,places.displayName'
            }
        });

        if (response.data && response.data.places) {
            return response.data.places.map((p: any) => ({
                id: p.id,
                name: p.displayName?.text || p.formattedAddress,
                latitude: p.location.latitude,
                longitude: p.location.longitude,
                placeId: p.id,
                festivalDisruption: 0.5,
                infrastructureDensity: 0.5,
                serviceReliability: 0.5,
                monsoonRisk: 0.2,
                noiseProfile: 5,
                deliveryReliability: 'Medium'
            }));
        }

        return [];

    } catch (error: any) {
        if (error.response) {
            console.error("Zone Discovery Error:", error.response.status, error.response.data);
        } else {
            console.error("Zone Discovery Error:", error.message);
        }
        return [];
    }
}
