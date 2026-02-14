import { Zone, Anchor, UserPreferences, ScoredZone } from './models';

function toRad(value: number): number {
    return (value * Math.PI) / 180;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export function rankZones(zones: Zone[], anchors: Anchor[], prefs: UserPreferences): ScoredZone[] {
    return zones.map((zone) => {
        let totalScore = 0;
        const details = {
            commute: '',
            lifestyleMatch: '',
            festivalImpact: '',
            warning: undefined as string | undefined,
        };

        // 1. Commute Score
        let totalDistance = 0;
        if (anchors.length > 0) {
            anchors.forEach((anchor) => {
                totalDistance += calculateDistance(
                    zone.latitude,
                    zone.longitude,
                    anchor.latitude,
                    anchor.longitude
                );
            });
            const avgDistance = totalDistance / anchors.length;
            // Max score 10 for 0 dist, decay by 0.5 per km
            const commuteScore = Math.max(0, 10 - avgDistance * 0.5);
            totalScore += commuteScore * prefs.commutePriority;
            details.commute = `${avgDistance.toFixed(1)} km avg`;
        } else {
            details.commute = 'N/A';
        }

        // 2. Lifestyle Match
        const noiseMatch = 10 - Math.abs(prefs.quietVsNightlife - zone.noiseProfile);
        totalScore += noiseMatch * 1.5;
        details.lifestyleMatch = `Noise Match: ${noiseMatch}/10`;

        // 3. Festival Impact
        const festivalPenalty = zone.festivalDisruption * (10 - prefs.festivalTolerance) * 2;
        totalScore -= festivalPenalty;
        details.festivalImpact = `Penalty: -${festivalPenalty.toFixed(1)}`;

        // 4. Infrastructure Warning
        if (zone.infrastructureDensity * 10 < prefs.schoolsImportance) {
            totalScore -= 5;
            details.warning = 'Low Infrastructure for requirements';
        }

        return {
            ...zone,
            score: Number(totalScore.toFixed(2)),
            matchDetails: details,
        };
    }).sort((a, b) => b.score - a.score);
}
