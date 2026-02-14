import math
from typing import List
from .models import Anchor, UserPreferences, Zone, ScoredZone, MatchDetails

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371  # Earth radius in km
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def calculate_scores(zones: List[Zone], anchors: List[Anchor], prefs: UserPreferences) -> List[ScoredZone]:
    scored_zones = []

    for zone in zones:
        total_score = 0
        details = MatchDetails(commute="", lifestyleMatch="", festivalImpact="")

        # 1. Commute Score
        total_distance = 0
        if anchors:
            for anchor in anchors:
                total_distance += haversine_distance(
                    zone.latitude, zone.longitude,
                    anchor.latitude, anchor.longitude
                )
            avg_distance = total_distance / len(anchors)
        else:
            avg_distance = 0
        
        # Max score 10 for 0 dist, decay by 0.5 per km
        commute_score = max(0, 10 - (avg_distance * 0.5))
        total_score += commute_score * prefs.commutePriority
        details.commute = f"{avg_distance:.1f} km avg"

        # 2. Lifestyle Match
        noise_match = 10 - abs(prefs.quietVsNightlife - zone.noiseProfile)
        total_score += noise_match * 1.5
        details.lifestyleMatch = f"Noise Match: {noise_match}/10"

        # 3. Festival Impact
        festival_penalty = zone.festivalDisruption * (10 - prefs.festivalTolerance) * 2
        total_score -= festival_penalty
        details.festivalImpact = f"Penalty: -{festival_penalty:.1f}"

        # 4. Infrastructure Warning
        if (zone.infrastructureDensity * 10) < prefs.schoolsImportance:
            total_score -= 5
            details.warning = "Low Infrastructure for requirements"

        scored_zones.append(ScoredZone(
            **zone.model_dump(),
            score=round(total_score, 2),
            matchDetails=details
        ))

    # Sort descending
    scored_zones.sort(key=lambda x: x.score, reverse=True)
    return scored_zones
