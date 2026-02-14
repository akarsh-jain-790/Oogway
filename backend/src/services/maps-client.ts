
import { Client, TravelMode } from '@googlemaps/google-maps-services-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const apiKey = process.env.GOOGLE_MAPS_API_KEY;

if (!apiKey) {
    console.warn("⚠️ GOOGLE_MAPS_API_KEY is not set. Maps services will fail.");
}

export const mapsClient = new Client({});
export const GOOGLE_MAPS_KEY = apiKey || '';
export { TravelMode };
