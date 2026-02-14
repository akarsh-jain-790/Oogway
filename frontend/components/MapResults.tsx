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
  Car,
  AlertTriangle,
  Shield,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Mode1Response, Mode2Response } from "@/lib/api";

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
  mode1Results?: Mode1Response | null;
  mode2Results?: Mode2Response | null;
  loading?: boolean;
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

export function MapResults({ preferences, areas, mode1Results, mode2Results, loading }: MapResultsProps) {
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
            {loading ? "Analyzing..." : "Your results"}
          </h2>
          <p className="text-muted-foreground text-sm">
            {loading ? "Fetching live data from our AI engine..." : "Summary based on your preferences & live analysis."}
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

        {/* --- MODE 2: TRIP ANALYSIS RESULTS --- */}
        {mode2Results && (
          <>
            {/* Risk Card */}
            <Card className={`overflow-hidden border shadow-sm ${mode2Results.risk_analysis.risk_level === 'Low' ? 'bg-green-50 border-green-200' :
                mode2Results.risk_analysis.risk_level === 'Medium' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-red-50 border-red-200'
              }`}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className={
                    mode2Results.risk_analysis.risk_level === 'Low' ? 'text-green-600' :
                      mode2Results.risk_analysis.risk_level === 'Medium' ? 'text-yellow-600' :
                        'text-red-600'
                  } size={18} />
                  Risk Analysis: {mode2Results.risk_analysis.risk_level}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/80 mb-2">{mode2Results.risk_analysis.reasoning}</p>
                {mode2Results.risk_analysis.recommended_departure_adjustment_minutes !== 0 && (
                  <div className="text-xs font-semibold bg-white/60 p-2 rounded">
                    Suggestion: Adjust departure by {mode2Results.risk_analysis.recommended_departure_adjustment_minutes} mins
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trip Details */}
            <Card className="overflow-hidden border-border bg-card shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Car className="text-primary" size={18} />
                  Trip Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-mono font-medium">{mode2Results.trip_summary.duration_in_traffic_minutes} mins</span>
                </div>
                <div className="flex justify-between text-sm text-yellow-600">
                  <span className="flex items-center gap-1"><AlertTriangle size={12} /> Traffic Delay</span>
                  <span className="font-mono">+{mode2Results.trip_summary.traffic_delay_minutes} mins</span>
                </div>
                <div className="pt-2 border-t border-border/50 mt-2">
                  <div className="flex justify-between text-sm">
                    <span>Uber Estimate</span>
                    <span className="font-bold">₹{mode2Results.ride_pricing.uber_estimate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* --- MODE 1: ZONE DISCOVERY RESULTS --- */}
        {mode1Results && (
          <div className="sm:col-span-2 lg:col-span-3 grid gap-4">
            <h3 className="text-lg font-semibold">Top Recommended Zones</h3>
            {mode1Results.topChoices.map(zone => (
              <Card key={zone.id} className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-base">{zone.name}</CardTitle>
                    <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded">
                      Score: {zone.score.toFixed(0)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="text-sm text-muted-foreground">
                      <div className="flex gap-2 items-start text-foreground/90">
                        <CheckCircle size={14} className="mt-0.5 text-green-500" />
                        {zone.matchDetails.lifestyleMatch}
                      </div>
                      <div className="flex gap-2 items-start mt-2">
                        <Clock size={14} className="mt-0.5" />
                        {zone.matchDetails.commute}
                      </div>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Infrastructure</span>
                        <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${zone.infrastructureDensity * 100}%` }}></div>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery</span>
                        <span className={zone.deliveryReliability === 'High' ? 'text-green-600' : 'text-yellow-600'}>
                          {zone.deliveryReliability}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Commute highlight (Generic) - Only show if no dynamic mode 2 results override it */}
        {!mode2Results && (
          <Card className="overflow-hidden border-border bg-card shadow-sm sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="size-4 text-primary" />
                Commute Preference
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
        )}

        {/* Preferred areas (living mode) - Static */}
        {isLivingMode && !mode1Results && (
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

        {/* Lifestyle preferences grid - Always show as summary of inputs */}
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
