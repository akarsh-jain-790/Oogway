"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { MapboxMap } from "@/components/MapboxMap";
import {
  MapPreferences,
  DEFAULT_PREFERENCES,
  type Preferences,
  type AreaOption,
  type Purpose,
} from "@/components/MapPreferences";
import { MapResults } from "@/components/MapResults";
import { getCityAreas } from "@/lib/defaultAreas";
import { analyzeTrip, discoverZones, Mode1Response, Mode2Response, Anchor, UserPreferences } from "@/lib/api";

function getInitialPurpose(mode: string | null): Purpose {
  if (mode === "go") return "frequently_visited"; // Corresponds to Mode 2 (Live/Trip)
  return "place_to_stay"; // Corresponds to Mode 1 (Plan/Live Here)
}

function MapContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || undefined;
  const mode = searchParams.get("mode");
  const originQuery = searchParams.get("origin"); // Get origin from URL

  const [preferences, setPreferences] = useState<Preferences>(() => ({
    ...DEFAULT_PREFERENCES,
    purpose: getInitialPurpose(mode),
  }));

  const [mode1Results, setMode1Results] = useState<Mode1Response | null>(null);
  const [mode2Results, setMode2Results] = useState<Mode2Response | null>(null);
  const [loading, setLoading] = useState(false);

  const areas = useMemo(() => getCityAreas(searchQuery), [searchQuery]);
  const areaOptions: AreaOption[] = useMemo(
    () => areas.map((a) => ({ id: a.id, name: a.name })),
    [areas]
  );

  // --- DATA FETCHING LOGIC ---
  useEffect(() => {
    async function fetchData() {
      if (!searchQuery) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setMode1Results(null);
      setMode2Results(null);

      try {
        if (mode === 'live' || mode === 'go') {
          // MODE 2: TRIP ANALYSIS
          const origin = originQuery || "Bangalore"; // Default to Bangalore if no origin
          const destination = searchQuery;

          // Only call if we have valid strings
          if (origin && destination) {
            const data = await analyzeTrip(origin, destination, new Date().toISOString());
            setMode2Results(data);
          }
        } else {
          // MODE 1: ZONE DISCOVERY (Plan/Live Here)

          // 1. Try to find lat/lng from our default areas to capture the user's intent better
          const foundArea = areas.find(a =>
            a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            searchQuery.toLowerCase().includes(a.name.toLowerCase())
          );

          // 2. Construct Anchor
          const latitude = foundArea ? foundArea.center[1] : 12.9716;
          const longitude = foundArea ? foundArea.center[0] : 77.5946;

          const anchor: Anchor = {
            type: "Work", // Keep default type for now, or infer/ask user later
            name: searchQuery,
            latitude,
            longitude,
          };

          const apiPrefs: UserPreferences = {
            commutePriority: preferences.commutePriority === 'high' ? 8 : preferences.commutePriority === 'medium' ? 5 : 2,
            deliveryImportance: preferences.foodConvenience === 'high' ? 9 : preferences.foodConvenience === 'medium' ? 5 : 2,
            quietVsNightlife: preferences.quietVsNightlife === 'high' ? 8 : preferences.quietVsNightlife === 'medium' ? 5 : 2,
            festivalTolerance: preferences.festivalTolerance === 'high' ? 8 : preferences.festivalTolerance === 'medium' ? 5 : 2,
            schoolsImportance: preferences.schoolsHospitals === 'high' ? 9 : preferences.schoolsHospitals === 'medium' ? 5 : 2,
            hospitalsImportance: preferences.schoolsHospitals === 'high' ? 9 : preferences.schoolsHospitals === 'medium' ? 5 : 2,
            culturalProximity: 5 // Default value
          };

          const data = await discoverZones([anchor], apiPrefs);
          setMode1Results(data);
        }
      } catch (error) {
        console.error("Failed to fetch map data", error);
        // Optional: Set some error state to show in UI
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [searchQuery, mode, originQuery, preferences, areas]);


  return (
    <div data-page="map" className="flex min-h-screen flex-col overflow-y-auto bg-white text-zinc-900">
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-zinc-900 hover:opacity-80"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Oogway
        </Link>
        <h1 className="text-lg font-semibold text-zinc-900">
          {(mode === "go" || mode === "live") ? "Go Here (Live Trip)" : "Live Here (Plan)"}
        </h1>
        <div className="w-20" />
      </header>

      <div className="flex shrink-0 min-h-[70vh]">
        <div className="flex-1 p-4">
          <MapboxMap searchQuery={searchQuery} />
        </div>
        <aside className="w-80 shrink-0 overflow-y-auto border-l border-zinc-200 bg-white p-4 text-zinc-900">
          <MapPreferences
            preferences={preferences}
            onChange={setPreferences}
            areaOptions={areaOptions}
          />
        </aside>
      </div>

      <section className="shrink-0 border-t border-zinc-200 bg-zinc-50 px-4 py-6 text-zinc-900">
        <div className="mx-auto max-w-4xl">
          <MapResults
            preferences={preferences}
            areas={areas}
            mode1Results={mode1Results}
            mode2Results={mode2Results}
            loading={loading}
          />
        </div>
      </section>
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      }
    >
      <MapContent />
    </Suspense>
  );
}
