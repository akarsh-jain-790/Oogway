import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// --- Mode 1 Types ---

export interface Anchor {
    id?: string;
    type: string; // 'Work', 'Gym', 'Partner', 'Family'
    name?: string;
    latitude: number;
    longitude: number;
}

export interface UserPreferences {
    commutePriority: number;      // 1-10
    deliveryImportance: number;   // 1-10
    quietVsNightlife: number;     // 1=Quiet, 10=Nightlife
    festivalTolerance: number;    // 1-10
    schoolsImportance: number;    // 1-10
    hospitalsImportance: number;  // 1-10
    culturalProximity: number;    // 1-10
}

export interface Zone {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    festivalDisruption: number;    // 0.0 - 1.0
    infrastructureDensity: number; // 0.0 - 1.0
    serviceReliability: number;    // 0.0 - 1.0
    monsoonRisk: number;           // 0.0 - 1.0
    noiseProfile: number;          // 1-10
    deliveryReliability: 'High' | 'Medium' | 'Low';
}

export interface MatchDetails {
    commute: string;
    lifestyleMatch: string;
    festivalImpact: string;
    warning?: string;
}

export interface ScoredZone extends Zone {
    score: number;
    matchDetails: MatchDetails;
}

export interface Mode1Response {
    topChoices: ScoredZone[];
    allScores: { name: string; score: number }[];
    meta: {
        anchorsProcessed: number;
        prefsApplied: UserPreferences;
    };
}

// --- Mode 2 Types ---

export interface TripSummary {
    distance_km: number;
    duration_minutes: number;
    duration_in_traffic_minutes: number;
    traffic_delay_minutes: number;
}

export interface RidePricing {
    uber_estimate: number;
    ola_estimate: number;
    namma_estimate: number;
}

export interface RiskAnalysis {
    risk_level: string;
    reasoning: string;
    recommended_departure_adjustment_minutes: number;
}

export interface AlternativeAnalysis {
    departure_time_plus_30min: string;
    duration_in_traffic_minutes: number;
    traffic_delay_minutes: number;
}

export interface Mode2Response {
    trip_summary: TripSummary;
    ride_pricing: RidePricing;
    risk_analysis: RiskAnalysis;
    alternative_departure_analysis: AlternativeAnalysis;
}

// --- API Functions ---

export async function discoverZones(anchors: Anchor[], preferences: UserPreferences): Promise<Mode1Response> {
    const response = await fetch(`${API_BASE_URL}/mode1`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anchors, preferences }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Mode 1 API Error Details:", errorText);
        throw new Error(`Mode 1 API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
}

export async function analyzeTrip(origin: string, destination: string, departure_time: string): Promise<Mode2Response> {
    const response = await fetch(`${API_BASE_URL}/mode2/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, destination, departure_time }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Mode 2 API Error Details:", errorText);
        throw new Error(`Mode 2 API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
}
