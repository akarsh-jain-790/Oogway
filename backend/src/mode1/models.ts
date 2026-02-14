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

export interface Mode1Request {
    anchors: Anchor[];
    preferences: UserPreferences;
}

export interface MatchDetails {
    commute: string;
    lifestyleMatch: string;
    festivalImpact: string;
    warning?: string;
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
    noiseProfile: number;          // 1-10 (1=Quiet, 10=LOUD)
    deliveryReliability: 'High' | 'Medium' | 'Low';
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
