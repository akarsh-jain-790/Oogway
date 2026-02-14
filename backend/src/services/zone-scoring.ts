import { Zone, Anchor, UserPreferences, ScoredZone } from '../mode1/models';
import { getCommuteTimes } from './distance-matrix';
import { findAmenities } from './places-amenity';
import { getZoneVibe, getBatchZoneVibes, ZoneVibe } from './gemini';
import { APICache } from './cache';

// Initialize Cache (3 days for vibe checks)
const vibeCache = new APICache<ZoneVibe>(3 * 24 * 60 * 60 * 1000);

export async function scoreZones(zones: Zone[], anchors: Anchor[], prefs: UserPreferences): Promise<ScoredZone[]> {
    if (zones.length === 0) return [];

    console.log(`Scoring ${zones.length} zones with Gemini Intelligence...`);
    // Add small delay to avoid burst limits if multiple requests come fast
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 1. Commute Matrix (Batch)
    const zoneCoords = zones.map(z => ({ lat: z.latitude, lng: z.longitude }));
    const anchorCoords = anchors.map(a => ({ lat: a.latitude, lng: a.longitude }));

    let commuteResults: any[] = [];
    try {
        commuteResults = await getCommuteTimes(zoneCoords, anchorCoords);
    } catch (e) {
        console.error("Commute Err", e);
    }

    // --- Pre-fetch Gemini Vibes in Batch ---
    const uncachedZones = zones.filter(z => !vibeCache.get(`vibe_${z.name.replace(/\s/g, '_')}`));
    if (uncachedZones.length > 0) {
        console.log(`🤖 Batch fetching vibes for ${uncachedZones.length} zones...`);
        const batchResults = await getBatchZoneVibes(uncachedZones.map(z => z.name), "Bangalore");
        Object.entries(batchResults).forEach(([name, vibe]) => {
            vibeCache.set(`vibe_${name.replace(/\s/g, '_')}`, vibe);
        });
    }

    // 2. Score Each Zone
    const scoredZones: ScoredZone[] = await Promise.all(zones.map(async (zone, zoneIdx) => {
        let totalScore = 0;
        const details = {
            commute: '',
            lifestyleMatch: '',
            festivalImpact: '',
            deliveryReliability: '',
            noiseProfile: '',
            monsoonRisk: '',
            warning: undefined as string | undefined,
        };

        // --- Commute Score ---
        const zoneCommutes = commuteResults.filter(r => r.originIndex === zoneIdx && r.status === 'OK');
        let avgCommute = 0;
        if (zoneCommutes.length > 0) {
            const totalMins = zoneCommutes.reduce((sum, r) => sum + (r.durationValue / 60), 0);
            avgCommute = totalMins / zoneCommutes.length;
            const commuteScore = Math.max(0, 10 - Math.max(0, avgCommute - 10) * 0.2);
            totalScore += commuteScore * (prefs.commutePriority / 10);
            details.commute = `${avgCommute.toFixed(0)} min avg`;
        } else {
            details.commute = 'N/A';
        }

        // --- Amenities (Maps) ---
        const amenities = await findAmenities(zone.latitude, zone.longitude, 1000);
        let amenityScore = 0;
        if (prefs.schoolsImportance > 1) amenityScore += Math.min(10, amenities.schools * 2) * (prefs.schoolsImportance / 10);
        if (prefs.hospitalsImportance > 1) amenityScore += Math.min(10, amenities.hospitals * 3) * (prefs.hospitalsImportance / 10);
        totalScore += amenityScore;
        details.lifestyleMatch = `${amenities.schools} Schools, ${amenities.hospitals} Hospitals`;

        // --- Vibe Check (Cached) ---
        const cacheKey = `vibe_${zone.name.replace(/\s/g, '_')}`;
        let vibe = vibeCache.get(cacheKey);

        if (!vibe) {
            // Fallback to individual if batch missed it
            vibe = await getZoneVibe(zone.name, "Bangalore");
            vibeCache.set(cacheKey, vibe);
        }

        const festivalPenaltyBase = vibe.festival_impact === 'High' ? 8 : (vibe.festival_impact === 'Moderate' ? 4 : 0);
        const festivalPenalty = Math.max(0, festivalPenaltyBase * (1 - (prefs.festivalTolerance / 10)));
        totalScore -= festivalPenalty;
        details.festivalImpact = `${vibe.festival_impact} Impact`;

        const isQuietZone = vibe.noise_profile.toLowerCase().includes('quiet') || vibe.noise_profile.toLowerCase().includes('residential');
        const isBusyZone = vibe.noise_profile.toLowerCase().includes('busy') || vibe.noise_profile.toLowerCase().includes('market') || vibe.noise_profile.toLowerCase().includes('active');

        let noiseScore = 5;
        if (isQuietZone && prefs.quietVsNightlife < 5) noiseScore = 10;
        if (isBusyZone && prefs.quietVsNightlife > 5) noiseScore = 10;
        if (isQuietZone && prefs.quietVsNightlife > 8) noiseScore = 2;
        if (isBusyZone && prefs.quietVsNightlife < 3) noiseScore = 2;

        totalScore += noiseScore;
        details.noiseProfile = vibe.noise_profile;

        if (vibe.monsoon_risk === 'High') {
            totalScore -= 5;
            details.monsoonRisk = 'High';
        } else {
            details.monsoonRisk = vibe.monsoon_risk;
        }

        if (prefs.deliveryImportance > 7 && vibe.delivery_reliability === 'Low') {
            totalScore -= 5;
        }
        details.deliveryReliability = vibe.delivery_reliability;

        return {
            ...zone,
            score: Number(totalScore.toFixed(2)),
            matchDetails: details,
            festivalDisruption: vibe.festival_impact === 'High' ? 0.9 : 0.5,
            infrastructureDensity: 0.8,
            serviceReliability: vibe.delivery_reliability === 'High' ? 0.9 : 0.5,
            monsoonRisk: vibe.monsoon_risk === 'High' ? 0.8 : 0.2,
            noiseProfile: isQuietZone ? 2 : 8,
            deliveryReliability: vibe.delivery_reliability
        };
    }));

    return scoredZones.sort((a, b) => b.score - a.score);
}
