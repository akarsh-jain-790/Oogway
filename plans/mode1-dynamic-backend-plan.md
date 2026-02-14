# Plan: Make Mode 1 Backend Dynamic with Google Maps APIs

## Overview
Transform the hardcoded zone data in [`backend/src/mode1/data.ts`](backend/src/mode1/data.ts) into a dynamic system that uses Google Maps APIs and other services to discover zones, calculate commute times, analyze amenities, and generate insights.

## Architecture Overview

```mermaid
flowchart TD
    A[User Input: Anchors + Preferences] --> B[Zone Discovery Service]
    B --> C[Geocoding API<br/>Convert addresses to lat/lng]
    C --> D[Find Candidate Zones<br/>Near anchors]
    D --> E[Parallel API Calls]
    E --> F1[Distance Matrix API<br/>Commute times]
    E --> F2[Routes API<br/>Traffic predictions]
    E --> F3[Places API<br/>Amenities]
    E --> F4[Air Quality API<br/>Pollution levels]
    F1 --> G[Zone Scoring Service]
    F2 --> G
    F3 --> G
    F4 --> G
    G --> H[Gemini API<br/>Generate insights]
    H --> I[Ranked Results]
```

## Detailed Implementation Plan

### Phase 1: Core API Services

#### 1. API Client Wrapper ([`backend/src/services/maps-client.ts`](backend/src/services/maps-client.ts))
- Create centralized Google Maps API client
- Handle API key from environment
- Add retry logic and error handling
- Implement request rate limiting

#### 2. Places Autocomplete Service ([`backend/src/services/places-autocomplete.ts`](backend/src/services/places-autocomplete.ts))
- Function: `searchPlaces(query: string, types?: string[]): Promise<PlacePrediction[]>`
- Used for Step 2 (Anchor Collection) - user searches for workplace, gym, etc.
- Returns place predictions with place_id

#### 3. Geocoding Service ([`backend/src/services/geocoding.ts`](backend/src/services/geocoding.ts))
- Function: `geocodeAddress(address: string): Promise<GeoCoordinates>`
- Function: `reverseGeocode(lat: number, lng: number): Promise<string>`
- Convert user-selected places to lat/lng coordinates

#### 4. Distance Matrix Service ([`backend/src/services/distance-matrix.ts`](backend/src/services/distance-matrix.ts))
- Function: `getCommuteTimes(origins: Coordinate[], destinations: Coordinate[]): Promise<CommuteResult[]>`
- Calculate travel times and distances from anchors to candidate zones
- Support multiple transport modes (driving, transit, walking)

#### 5. Routes API Service ([`backend/src/services/routes.ts`](backend/src/services/routes.ts))
- Function: `getTrafficPrediction(origin: Coordinate, destination: Coordinate): Promise<TrafficInfo>`
- Get detailed traffic predictions for peak hours
- Calculate additional travel time during rush hours

#### 6. Places Amenity Service ([`backend/src/services/places-amenity.ts`](backend/src/services/places-amenity.ts))
- Function: `findAmenities(lat: number, lng: number, radius: number): Promise<AmenityData>`
- Count hospitals, schools, restaurants in each zone
- Use Places API with type filters

#### 7. Air Quality Service ([`backend/src/services/air-quality.ts`](backend/src/services/air-quality.ts))
- Function: `getAirQuality(lat: number, lng: number): Promise<AirQualityData>`
- Get AQI and pollution levels per zone

#### 8. Zone Discovery Service ([`backend/src/services/zone-discovery.ts`](backend/src/services/zone-discovery.ts))
- Function: `discoverZones(anchors: Anchor[], radiusKm: number): Promise<Zone[]>`
- Find candidate residential zones near user anchors
- Use Places API to search for neighborhoods/areas
- Return zones with lat/lng coordinates

### Phase 2: Scoring & Intelligence

#### 9. Zone Scoring Service ([`backend/src/services/zone-scoring.ts`](backend/src/services/zone-scoring.ts))
- Function: `scoreZones(zones: Zone[], anchors: Anchor[], prefs: UserPreferences): Promise<ScoredZone[]>`
- Aggregate all API data:
  - Distance Matrix → commute scores
  - Routes API → traffic adjustments
  - Places API → infrastructure density
  - Air Quality → health factor
- Apply user preference weights
- Generate match details

#### 10. Gemini Insights Service ([`backend/src/services/gemini.ts`](backend/src/services/gemini.ts))
- Function: `generateZoneInsights(zone: Zone, anchors: Anchor[]): Promise<string>`
- Function: `generateFestivalImpact(zone: Zone): Promise<string>`
- Generate natural language summaries for each zone
- Analyze festival impact and seasonal patterns

### Phase 3: Integration

#### 11. Refactor data.ts ([`backend/src/mode1/data.ts`](backend/src/mode1/data.ts))
- Replace hardcoded zones with dynamic zone discovery
- New function: `getZonesDynamic(anchors: Anchor[]): Promise<Zone[]>`
- Cache discovered zones for performance

#### 12. Update Routes ([`backend/src/mode1/routes.ts`](backend/src/mode1/routes.ts))
- Modify POST `/` to orchestrate the full API workflow
- Support Step 6 (Interactive Refinement) with cached data
- Add endpoint for zone comparison

#### 13. Caching Layer ([`backend/src/services/cache.ts`](backend/src/services/cache.ts))

**Cache Strategy Overview:**

```mermaid
flowchart LR
    A[API Request] --> B{Cache Hit?}
    B -->|Yes| C[Return Cached Data]
    B -->|No| D[Fetch from API]
    D --> E[Store in Cache]
    E --> C
```

**Cache Types:**

| Data Type | TTL | Invalidation |
|-----------|-----|--------------|
| Zone Discovery | 24 hours | Manual trigger |
| Distance Matrix | 1 hour | On anchor change |
| Traffic Predictions | 15 min | Time-based |
| Amenity Counts | 6 hours | Manual trigger |
| Air Quality | 1 hour | Time-based |
| Gemini Insights | 7 days | Manual trigger |

**Cache Implementation:**

```typescript
interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

class APICache {
    private memoryCache: Map<string, CacheEntry<any>>;
    
    get<T>(key: string): T | null;
    set<T>(key: string, data: T, ttl: number): void;
    invalidate(pattern: string): void;
    invalidateAll(): void;
}
```

**Cache Keys:**
- `zones:{lat},{lng},{radius}` - Zone discovery results
- `distances:{originLat},{originLng}:{destLat},{destLng}` - Distance matrix
- `traffic:{originLat},{originLng}:{destLat},{destLng}` - Traffic predictions
- `amenities:{lat},{lng},{radius}` - Place amenity data
- `aqi:{lat},{lng}` - Air quality data
- `insight:{zoneId}` - Gemini insights

**Optimizations:**
1. **Batch Caching**: Cache distance matrix for all zone pairs in one call
2. **Stale-While-Revalidate**: Return stale cache while fetching fresh data
3. **Redis Support**: Optional Redis for multi-instance deployments

#### 14. Update Models ([`backend/src/mode1/models.ts`](backend/src/mode1/models.ts))
- Add new types:
  - `PlacePrediction`, `GeoCoordinates`, `CommuteResult`
  - `TrafficInfo`, `AmenityData`, `AirQualityData`
  - `CachedZoneData`

## API Endpoints Required

| Endpoint | Purpose | Step Used |
|----------|---------|-----------|
| Places Autocomplete | Anchor search | Step 2 |
| Geocoding API | Address → coordinates | Step 2 |
| Distance Matrix API | Commute calculations | Step 4 |
| Routes API | Traffic predictions | Step 4 |
| Places API (New) | Amenity discovery | Step 4 |
| Air Quality API | Pollution data | Step 4 |
| Time Zone API | Time calculations | Step 4 |
| Gemini API | Insights generation | Step 4, 5 |
| Street View Static API | Preview images | Step 5 |

## Data Flow by Step

### Step 2: Anchor Collection
```
User types "Koramangala" 
→ Places Autocomplete API 
→ User selects place 
→ Geocoding API → (12.9352, 77.6245)
```

### Step 4: System Processing
```
For each candidate zone:
→ Distance Matrix API → commute time
→ Routes API → peak hour traffic
→ Places API → hospitals count, schools count, restaurants count
→ Air Quality API → AQI
→ Gemini API → festival impact analysis
```

### Step 5: Results
```
Top 3 zones with:
→ Map visualization (Maps SDK)
→ Street View images
→ Gemini-generated summaries
```

## File Structure

```
backend/src/
├── mode1/
│   ├── data.ts              # Updated: dynamic zone discovery
│   ├── routes.ts            # Updated: new workflow
│   ├── models.ts            # Updated: new types
│   └── scoring.ts           # Keep: preference weighting
├── services/
│   ├── maps-client.ts       # NEW: API client wrapper
│   ├── places-autocomplete.ts
│   ├── geocoding.ts
│   ├── distance-matrix.ts
│   ├── routes.ts
│   ├── places-amenity.ts
│   ├── air-quality.ts
│   ├── zone-discovery.ts
│   ├── zone-scoring.ts
│   ├── gemini.ts
│   └── cache.ts
```

## Environment Variables Required

```env
GOOGLE_MAPS_API_KEY=AIzaSyAKTrtZaoZOP8Q4BQUSQc6QCIxdA7Kg9SU
GEMINI_API_KEY=your-gemini-key
```

## Implementation Priority

1. **Phase 1** (Core Services): Maps client, Geocoding, Places Autocomplete
2. **Phase 2** (Data Gathering): Distance Matrix, Routes, Places Amenity, Air Quality
3. **Phase 3** (Intelligence): Zone Discovery, Zone Scoring, Gemini
4. **Phase 4** (Integration): Refactor data.ts, routes, add caching

---

## ⚠️ Security Best Practices for API Keys

**IMMEDIATE ACTION REQUIRED:**

The current API keys in `backend/.env` are exposed and should be revoked immediately. Create new keys in Google Cloud Console.

### Google Maps API Key Restrictions

| Restriction Type | Configuration |
|-----------------|----------------|
| Application restrictions | HTTP referrers (for web) or IP addresses (for server) |
| API restrictions | Enable only required APIs:
  - Places API
  - Geocoding API
  - Distance Matrix API
  - Routes API
  - Air Quality API |

### Key Security Implementation

```typescript
// backend/src/services/maps-client.ts

class MapsAPIClient {
    private apiKey: string;
    
    constructor() {
        this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!this.apiKey) {
            throw new Error('GOOGLE_MAPS_API_KEY is not configured');
        }
    }
    
    // Add API key to request (server-side only)
    getAuthParams(): string {
        return `key=${this.apiKey}`;
    }
}
```

### Best Practices Checklist

- [ ] Revoke exposed API keys immediately
- [ ] Create new API keys with restrictions
- [ ] Add HTTP referrer restrictions for web requests
- [ ] Add IP restrictions for server-side calls
- [ ] Enable only required APIs in Google Cloud Console
- [ ] Set quota limits to prevent abuse
- [ ] Monitor API usage for anomalies
- [ ] Use environment variables (not hardcoded keys)
- [ ] Never expose keys in client-side code
- [ ] Add `.env` to `.gitignore` (already done)
