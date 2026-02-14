"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Preferences, PreferenceLevel } from "@/components/MapPreferences";
import {
  NEARBY_PLACE_OPTIONS,
  PLACE_FIND_OPTIONS,
} from "@/components/MapPreferences";
import type { MapArea } from "@/lib/defaultAreas";
import {
  Clock,
  MapPin,
  UtensilsCrossed,
  Moon,
  PartyPopper,
  School,
  Dumbbell,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const COMMUTE_SUMMARY: Record<PreferenceLevel, { short: string; detail: string }> = {
  low: {
    short: "Flexible",
    detail: "No strict commute limit — you're open to distance.",
  },
  medium: {
    short: "~20–35 min",
    detail: "Moderate commute — balance of location and affordability.",
  },
  high: {
    short: "~15–25 min",
    detail: "Short commute is a priority — closer to work or transit.",
  },
};

const FOOD_LABELS: Record<PreferenceLevel, string> = {
  low: "Not important",
  medium: "Nice to have",
  high: "Essential",
};

const QUIET_LABELS: Record<PreferenceLevel, string> = {
  low: "Quiet",
  medium: "Balanced",
  high: "Vibrant",
};

const FESTIVAL_LABELS: Record<PreferenceLevel, string> = {
  low: "Avoid crowds",
  medium: "Neutral",
  high: "Love events",
};

const SCHOOLS_LABELS: Record<PreferenceLevel, string> = {
  low: "Not needed",
  medium: "Nice to have",
  high: "Very important",
};

type MapResultsProps = {
  preferences: Preferences;
  areas: MapArea[];
};

function ResultRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/50 px-3 py-2.5">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/80">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-xs font-medium">{label}</p>
        <p className="text-foreground text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export function MapResults({ preferences, areas }: MapResultsProps) {
  const isLivingMode = preferences.purpose === "place_to_stay";
  const isPlaceFindMode =
    preferences.purpose === "work" ||
    preferences.purpose === "frequently_visited";

  const selectedAreas = isLivingMode
    ? areas.filter((a) => preferences.preferredAreaIds.includes(a.id))
    : [];

  const nearbyLabels =
    preferences.nearbyPlaceTypes.length > 0
      ? preferences.nearbyPlaceTypes
          .map(
            (id) => NEARBY_PLACE_OPTIONS.find((o) => o.id === id)?.label ?? id
          )
          .join(", ")
      : null;

  const placeFindLabels =
    preferences.placeFindTypes.length > 0
      ? preferences.placeFindTypes
          .map(
            (id) => PLACE_FIND_OPTIONS.find((o) => o.id === id)?.label ?? id
          )
          .join(", ")
      : null;

  const commute = COMMUTE_SUMMARY[preferences.commutePriority];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
          <Sparkles className="size-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Your results
          </h2>
          <p className="text-muted-foreground text-sm">
            Summary based on your preferences — we&apos;ll refine this when data is connected.
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Commute highlight */}
        <Card className="overflow-hidden border-border bg-card shadow-sm sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="size-4 text-primary" />
              Commute
            </CardTitle>
            <CardDescription className="text-sm">
              {commute.detail}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight text-foreground">
              {commute.short}
            </p>
          </CardContent>
        </Card>

        {/* Preferred areas (living mode) */}
        {isLivingMode && (
          <Card className="overflow-hidden border-border bg-card shadow-sm sm:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="size-4 text-primary" />
                Preferred areas
              </CardTitle>
              <CardDescription className="text-sm">
                {selectedAreas.length > 0
                  ? "Areas that match your choices"
                  : "Select preferred areas above to see them here."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedAreas.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedAreas.map((area) => (
                    <div
                      key={area.id}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-3 py-2 shadow-sm transition-shadow hover:shadow",
                        "border-border/80 bg-background"
                      )}
                      style={{
                        borderLeftWidth: 4,
                        borderLeftColor: area.color,
                      }}
                    >
                      <span className="font-medium text-foreground">
                        {area.name}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {area.label}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm italic">
                  No areas selected yet.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Nearby / Looking for */}
        {(nearbyLabels || placeFindLabels) && (
          <Card className="overflow-hidden border-border bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Dumbbell className="size-4 text-primary" />
                {isLivingMode ? "Nearby" : "Looking for"}
              </CardTitle>
              <CardDescription className="text-sm">
                {isLivingMode
                  ? "Places you want close by"
                  : "Types of places you need"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-foreground text-sm font-medium">
                {nearbyLabels ?? placeFindLabels}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Lifestyle preferences grid */}
        <Card className="overflow-hidden border-border bg-card shadow-sm sm:col-span-2 lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Lifestyle fit</CardTitle>
            <CardDescription className="text-sm">
              How your preferences translate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ResultRow
                icon={UtensilsCrossed}
                label="Food & delivery"
                value={FOOD_LABELS[preferences.foodConvenience]}
              />
              <ResultRow
                icon={Moon}
                label="Quiet vs nightlife"
                value={QUIET_LABELS[preferences.quietVsNightlife]}
              />
              <ResultRow
                icon={PartyPopper}
                label="Festival / crowds"
                value={FESTIVAL_LABELS[preferences.festivalTolerance]}
              />
              <ResultRow
                icon={School}
                label="Schools / hospitals"
                value={SCHOOLS_LABELS[preferences.schoolsHospitals]}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
