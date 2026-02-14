/**
 * City areas shown on the map based on search query.
 * Each area has a polygon, name, label tag, and color.
 */

export type MapArea = {
  id: string;
  name: string;
  label: string; // e.g. "Bachelor friendly", "Family friendly"
  color: string;
  center: [number, number];
  zoom: number; // zoom level when clicking (to show 3D buildings)
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
};

type FeatureCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    id: string;
    properties: Record<string, unknown>;
    geometry: MapArea["geometry"];
  }>;
};

const OFFSET = 0.035; // ~3.5km — prevents overlap while still visible

function box(
  id: string,
  name: string,
  label: string,
  color: string,
  center: [number, number],
  zoom = 15.5
): MapArea {
  const [lng, lat] = center;
  const d = OFFSET / 2;
  return {
    id,
    name,
    label,
    color,
    center,
    zoom,
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [lng - d, lat - d],
          [lng + d, lat - d],
          [lng + d, lat + d],
          [lng - d, lat + d],
          [lng - d, lat - d],
        ],
      ],
    },
  };
}

const DELHI_AREAS: MapArea[] = [
  box(
    "delhi-1",
    "Connaught Place",
    "Bachelor friendly",
    "#22c55e",
    [77.216, 28.632],
    15.2
  ),
  box(
    "delhi-2",
    "Hauz Khas",
    "Vibrant · Cafes",
    "#3b82f6",
    [77.208, 28.548],
    15.5
  ),
  box(
    "delhi-3",
    "Dwarka",
    "Family friendly",
    "#8b5cf6",
    [77.043, 28.592],
    15
  ),
  box(
    "delhi-4",
    "Karol Bagh",
    "Affordable · Central",
    "#f59e0b",
    [77.191, 28.651],
    15.3
  ),
  box(
    "delhi-5",
    "Saket",
    "Quiet · Green",
    "#06b6d4",
    [77.208, 28.524],
    15.2
  ),
];

const BANGALORE_AREAS: MapArea[] = [
  // North cluster
  box(
    "blr-1",
    "Indiranagar",
    "Bachelor friendly · Nightlife",
    "#22c55e",
    [77.6408, 12.9784],
    15.3
  ),
  box(
    "blr-2",
    "Whitefield",
    "IT Hub · Modern",
    "#3b82f6",
    [77.7499, 12.9698],
    15.2
  ),
  // Central cluster
  box(
    "blr-3",
    "Koramangala",
    "Bachelor friendly · Cafes",
    "#8b5cf6",
    [77.6175, 12.9352],
    15.3
  ),
  box(
    "blr-4",
    "BTM Layout",
    "Affordable · Central",
    "#f59e0b",
    [77.6102, 12.9166],
    15.2
  ),
  // South cluster
  box(
    "blr-5",
    "HSR Layout",
    "Family friendly",
    "#ec4899",
    [77.6389, 12.9080],
    15.2
  ),
  box(
    "blr-6",
    "Jayanagar",
    "Traditional · Quiet",
    "#06b6d4",
    [77.5837, 12.9250],
    15.3
  ),
  box(
    "blr-7",
    "Electronic City",
    "Tech Parks · Budget",
    "#eab308",
    [77.6648, 12.8456],
    15
  ),
  // West
  box(
    "blr-8",
    "Malleshwaram",
    "Residential · Peaceful",
    "#10b981",
    [77.5704, 13.0029],
    15.2
  ),
];

export const DEFAULT_AREAS = DELHI_AREAS;

export function getCityAreas(cityName?: string): MapArea[] {
  if (!cityName) return DELHI_AREAS;
  const city = cityName.toLowerCase();
  if (city.includes("bangalore") || city.includes("bengaluru")) {
    return BANGALORE_AREAS;
  }
  if (city.includes("delhi") || city.includes("new delhi")) {
    return DELHI_AREAS;
  }
  return DELHI_AREAS; // Default fallback
}

export function getAreasGeoJSON(areas: MapArea[]): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: areas.map((area) => ({
      type: "Feature" as const,
      id: area.id,
      properties: {
        name: area.name,
        label: area.label,
        color: area.color,
        center: area.center,
        zoom: area.zoom,
      },
      geometry: area.geometry,
    })),
  };
}

export function getAreasLabelsGeoJSON(areas: MapArea[]): {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    id: string;
    properties: { name: string; label: string; center: [number, number]; zoom: number };
    geometry: { type: "Point"; coordinates: [number, number] };
  }>;
} {
  return {
    type: "FeatureCollection",
    features: areas.map((area) => ({
      type: "Feature" as const,
      id: `${area.id}-label`,
      properties: {
        name: area.name,
        label: area.label,
        center: area.center,
        zoom: area.zoom,
      },
      geometry: {
        type: "Point",
        coordinates: area.center,
      },
    })),
  };
}

export function getDefaultAreasGeoJSON(): FeatureCollection {
  return getAreasGeoJSON(DEFAULT_AREAS);
}

export function getDefaultAreasLabelsGeoJSON() {
  return getAreasLabelsGeoJSON(DEFAULT_AREAS);
}

/** Boundary of each area as a LineString (for road-style boundary, no fill) */
export function getAreasBoundariesGeoJSON(areas: MapArea[]): {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    id: string;
    properties: {
      name: string;
      label: string;
      color: string;
      center: [number, number];
      zoom: number;
    };
    geometry: { type: "LineString"; coordinates: number[][] };
  }>;
} {
  return {
    type: "FeatureCollection",
    features: areas.map((area) => {
      const ring = area.geometry.coordinates[0];
      return {
        type: "Feature" as const,
        id: `${area.id}-boundary`,
        properties: {
          name: area.name,
          label: area.label,
          color: area.color,
          center: area.center,
          zoom: area.zoom,
        },
        geometry: {
          type: "LineString",
          coordinates: ring,
        },
      };
    }),
  };
}

export function getDefaultAreasBoundariesGeoJSON() {
  return getAreasBoundariesGeoJSON(DEFAULT_AREAS);
}
