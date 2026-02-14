"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
const MAP_STYLE = "mapbox://styles/akarsh158/cm9qwk86600hv01s5cuq5fftg";

type MapboxMapProps = {
  searchQuery?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
  pitch?: number;
  bearing?: number;
  terrainExaggeration?: number;
  className?: string;
};

export function MapboxMap({
  searchQuery,
  initialCenter = [77.209, 28.6139],
  initialZoom = 11,
  pitch = 60,
  bearing = 0,
  terrainExaggeration = 1.5,
  className = "",
}: MapboxMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!MAPBOX_TOKEN || !mapContainerRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE,
      center: initialCenter,
      zoom: initialZoom,
      pitch,
      bearing,
    });

    mapRef.current = map;

    map.on("load", () => {
      try {
        map.setConfigProperty("basemap", "lightPreset", "dusk");
      } catch {
        // Config may not be supported by this style
      }
      try {
        if (!map.getSource("mapbox-dem")) {
          map.addSource("mapbox-dem", {
            type: "raster-dem",
            url: "mapbox://mapbox.mapbox-terrain-dem-v1",
            tileSize: 512,
            maxzoom: 14,
          });
        }
        map.setTerrain({
          source: "mapbox-dem",
          exaggeration: terrainExaggeration,
        });
      } catch {
        // Terrain may already exist
      }

      try {
        if (!map.getLayer("sky")) {
          map.addLayer({
            id: "sky",
            type: "sky",
            paint: {
              "sky-type": "atmosphere",
              // Dusk: sun in the west at horizon (azimuth 270°, polar 90° = horizon)
              "sky-atmosphere-sun": [270, 90],
              "sky-atmosphere-sun-intensity": 2.5,
              "sky-atmosphere-color": "rgb(255, 180, 140)",
              "sky-atmosphere-halo-color": "rgb(255, 200, 150)",
            },
          });
        }
      } catch {
        // Sky may already exist
      }

      setIsLoading(false);
    });

    map.on("error", () => {
      setIsLoading(false);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const dem = map.getSource("mapbox-dem");
    if (dem) {
      map.setTerrain({
        source: "mapbox-dem",
        exaggeration: terrainExaggeration,
      });
    }
  }, [terrainExaggeration]);

  useEffect(() => {
    if (!searchQuery?.trim() || !mapRef.current || !MAPBOX_TOKEN) return;

    const controller = new AbortController();
    fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${MAPBOX_TOKEN}&limit=1`,
      { signal: controller.signal }
    )
      .then((res) => res.json())
      .then((data) => {
        const feature = data.features?.[0];
        if (feature?.center) {
          const [lng, lat] = feature.center;
          mapRef.current?.flyTo({
            center: [lng, lat],
            zoom: 13,
            pitch: 60,
            duration: 2000,
          });
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [searchQuery]);

  if (!MAPBOX_TOKEN) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl bg-amber-50 p-8 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200 ${className}`}
      >
        <div className="text-center">
          <p className="font-medium">
            Mapbox access token is missing. Add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to .env.local
          </p>
          <p className="mt-2 text-sm">
            Get a free token at{" "}
            <a
              href="https://account.mapbox.com/access-tokens/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              mapbox.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full ${className}`}>
      <div ref={mapContainerRef} className="h-full w-full rounded-xl" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-zinc-100/80 dark:bg-zinc-900/80">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Loading 3D map...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
