/**
 * Map style preferences — basemap, colors, 3D, interactivity.
 * Used by MapPreferences UI and MapboxMap to apply Mapbox style overrides.
 */

export type BasemapTheme = "standard" | "light" | "dark" | "dusk";

export type MapStyleState = {
  // Basemap & color theme
  basemapTheme: BasemapTheme;
  // Typography / atmosphere (darker = more 3D feel)
  skyIntensity: number; // 0–10, lower = darker sky
  // 3D buildings & models
  show3DBuildings: boolean;
  buildingColor: string;
  // Land & water
  waterColor: string;
  landColor: string;
  greenspaceColor: string;
  // Roads
  motorwaysColor: string;
  trunkRoadsColor: string;
  otherRoadsColor: string;
  // Places & boundaries
  placeLabelsColor: string;
  adminBoundariesColor: string;
  // Road labels
  roadLabelsColor: string;
  // POI
  poiLabelsColor: string;
  poiDensity: number; // 0–10
  // Interactivity (for future use)
  highlightColor: string;
  selectColor: string;
};

export const DEFAULT_MAP_STYLE: MapStyleState = {
  basemapTheme: "dark",
  skyIntensity: 3,
  show3DBuildings: true,
  buildingColor: "#2d3748",
  waterColor: "#1e3a5f",
  landColor: "#1a202c",
  greenspaceColor: "#22543d",
  motorwaysColor: "#4a5568",
  trunkRoadsColor: "#4a5568",
  otherRoadsColor: "#718096",
  placeLabelsColor: "#e2e8f0",
  adminBoundariesColor: "#4a5568",
  roadLabelsColor: "#cbd5e1",
  poiLabelsColor: "#a0aec0",
  poiDensity: 5,
  highlightColor: "#48bb78",
  selectColor: "#38a169",
};

const STYLE_URLS: Record<BasemapTheme, string> = {
  standard: "mapbox://styles/akarsh158/cm9qwk86600hv01s5cuq5fftg",
  light: "mapbox://styles/akarsh158/cm9qwk86600hv01s5cuq5fftg",
  dark: "mapbox://styles/akarsh158/cm9qwk86600hv01s5cuq5fftg",
  dusk: "mapbox://styles/akarsh158/cm9qwk86600hv01s5cuq5fftg",
};

export function getStyleUrl(theme: BasemapTheme): string {
  return STYLE_URLS[theme];
}
