
import { mapsClient, GOOGLE_MAPS_KEY, TravelMode } from './maps-client';

export interface Coordinate {
    lat: number;
    lng: number;
}

export interface CommuteResult {
    originIndex: number;
    destinationIndex: number;
    distanceText: string;
    distanceValue: number; // meters
    durationText: string;
    durationValue: number; // seconds
    status: string;
}

export async function getCommuteTimes(origins: Coordinate[], destinations: Coordinate[]): Promise<CommuteResult[]> {
    if (origins.length === 0 || destinations.length === 0) return [];

    try {
        const response = await mapsClient.distancematrix({
            params: {
                origins: origins,
                destinations: destinations,
                mode: TravelMode.driving, // Corrected to use enum
                key: GOOGLE_MAPS_KEY
            }
        });

        const results: CommuteResult[] = [];

        if (response.data.status === 'OK') {
            response.data.rows.forEach((row, originIdx) => {
                row.elements.forEach((element, destIdx) => {
                    results.push({
                        originIndex: originIdx,
                        destinationIndex: destIdx,
                        distanceText: element.distance.text,
                        distanceValue: element.distance.value,
                        durationText: element.duration.text,
                        durationValue: element.duration.value,
                        status: element.status
                    });
                });
            });
        }

        return results;

    } catch (error) {
        console.error("Distance Matrix API Error:", error);
        return [];
    }
}
