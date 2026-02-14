"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
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

function getInitialPurpose(mode: string | null): Purpose {
  if (mode === "go") return "frequently_visited";
  return "place_to_stay"; // "live" or default
}

function MapContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || undefined;
  const mode = searchParams.get("mode");
  const [preferences, setPreferences] = useState<Preferences>(() => ({
    ...DEFAULT_PREFERENCES,
    purpose: getInitialPurpose(mode),
  }));

  const areas = useMemo(() => getCityAreas(searchQuery), [searchQuery]);
  const areaOptions: AreaOption[] = useMemo(
    () => areas.map((a) => ({ id: a.id, name: a.name })),
    [areas]
  );

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
          {mode === "go" ? "Go Here" : "Live Here"}
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
          <MapResults preferences={preferences} areas={areas} />
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
