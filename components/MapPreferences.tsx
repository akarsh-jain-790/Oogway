"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export type Purpose = "place_to_stay" | "work" | "frequently_visited";

export type PreferenceLevel = "low" | "medium" | "high";

/** For living mode: types of places you want nearby (gym, etc.) */
export const NEARBY_PLACE_OPTIONS: { id: string; label: string }[] = [
  { id: "gym", label: "Gym" },
  { id: "supermarket", label: "Supermarket" },
  { id: "park", label: "Park" },
  { id: "cafe", label: "Cafe" },
  { id: "pharmacy", label: "Pharmacy" },
  { id: "hospital", label: "Hospital" },
];

/** For place-find mode: what kind of place you're looking for */
export const PLACE_FIND_OPTIONS: { id: string; label: string }[] = [
  { id: "gym", label: "Gym" },
  { id: "office", label: "Office" },
  { id: "cafe", label: "Cafe" },
  { id: "coworking", label: "Co-working" },
  { id: "restaurant", label: "Restaurant" },
  { id: "shopping", label: "Shopping" },
];

export type Preferences = {
  purpose: Purpose;
  /** Living mode: preferred area ids from the city's areas */
  preferredAreaIds: string[];
  /** Living mode: nearby place types (gym, supermarket, etc.) */
  nearbyPlaceTypes: string[];
  /** Place-find mode: what you're looking for (gym, office, cafe, etc.) */
  placeFindTypes: string[];
  commutePriority: PreferenceLevel;
  foodConvenience: PreferenceLevel;
  quietVsNightlife: PreferenceLevel;
  festivalTolerance: PreferenceLevel;
  schoolsHospitals: PreferenceLevel;
};

const PURPOSE_OPTIONS: { value: Purpose; label: string }[] = [
  { value: "place_to_stay", label: "Place to stay" },
  { value: "work", label: "Work" },
  { value: "frequently_visited", label: "Frequently visited" },
];

const LEVEL_OPTIONS: { value: PreferenceLevel; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const COMMUTE_LABELS: Record<PreferenceLevel, string> = {
  low: "Flexible",
  medium: "Moderate",
  high: "Critical",
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

export type AreaOption = { id: string; name: string };

type MapPreferencesProps = {
  preferences: Preferences;
  onChange: (preferences: Preferences) => void;
  /** Areas for the current city (for preferred-areas combobox in living mode) */
  areaOptions?: AreaOption[];
};

function OptionButtons<T extends string>({
  value,
  onChange,
  options,
  getLabel,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: readonly T[];
  getLabel: (v: T) => string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {options.map((opt) => (
        <Button
          key={opt}
          type="button"
          variant={value === opt ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(opt)}
          className="text-xs"
        >
          {getLabel(opt)}
        </Button>
      ))}
    </div>
  );
}

function MultiSelectChips({
  selectedIds,
  options,
  onToggle,
  className,
}: {
  selectedIds: string[];
  options: { id: string; label: string }[];
  onToggle: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {options.map((opt) => {
        const selected = selectedIds.includes(opt.id);
        return (
          <Button
            key={opt.id}
            type="button"
            variant={selected ? "default" : "outline"}
            size="sm"
            onClick={() => onToggle(opt.id)}
            className="text-xs"
          >
            {opt.label}
          </Button>
        );
      })}
    </div>
  );
}

export const DEFAULT_PREFERENCES: Preferences = {
  purpose: "place_to_stay",
  preferredAreaIds: [],
  nearbyPlaceTypes: [],
  placeFindTypes: [],
  commutePriority: "medium",
  foodConvenience: "medium",
  quietVsNightlife: "medium",
  festivalTolerance: "medium",
  schoolsHospitals: "medium",
};

export function MapPreferences({
  preferences,
  onChange,
  areaOptions = [],
}: MapPreferencesProps) {
  const update = <K extends keyof Preferences>(
    key: K,
    value: Preferences[K]
  ) => onChange({ ...preferences, [key]: value });

  const isLivingMode = preferences.purpose === "place_to_stay";
  const isPlaceFindMode =
    preferences.purpose === "work" || preferences.purpose === "frequently_visited";

  const togglePreferredArea = (id: string) => {
    const next = preferences.preferredAreaIds.includes(id)
      ? preferences.preferredAreaIds.filter((x) => x !== id)
      : [...preferences.preferredAreaIds, id];
    update("preferredAreaIds", next);
  };

  const toggleNearbyPlace = (id: string) => {
    const next = preferences.nearbyPlaceTypes.includes(id)
      ? preferences.nearbyPlaceTypes.filter((x) => x !== id)
      : [...preferences.nearbyPlaceTypes, id];
    update("nearbyPlaceTypes", next);
  };

  const togglePlaceFind = (id: string) => {
    const next = preferences.placeFindTypes.includes(id)
      ? preferences.placeFindTypes.filter((x) => x !== id)
      : [...preferences.placeFindTypes, id];
    update("placeFindTypes", next);
  };

  const preferredLabel =
    preferences.preferredAreaIds.length === 0
      ? "Select preferred areas..."
      : preferences.preferredAreaIds.length === 1
        ? areaOptions.find((a) => a.id === preferences.preferredAreaIds[0])
            ?.name ?? "1 area"
        : `${preferences.preferredAreaIds.length} areas`;

  return (
    <div className="flex flex-col gap-4 bg-white">
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Preferences</CardTitle>
          <CardDescription className="text-sm">
            Default areas are shown. We&apos;ll filter by your choices when
            backend is ready.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs font-medium">
              What are you looking for?
            </Label>
            <Select
              value={preferences.purpose}
              onValueChange={(v) => update("purpose", v as Purpose)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PURPOSE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLivingMode && (
            <>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs font-medium">
                  Preferred areas
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between text-left font-normal"
                    >
                      <span className="truncate">{preferredLabel}</span>
                      <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-(--radix-popover-trigger-width) p-2" align="start">
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {areaOptions.length === 0 ? (
                        <p className="text-muted-foreground text-sm py-2 px-2">
                          Search for a city to see areas.
                        </p>
                      ) : (
                        areaOptions.map((area) => (
                          <label
                            key={area.id}
                            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
                          >
                            <Checkbox
                              checked={preferences.preferredAreaIds.includes(
                                area.id
                              )}
                              onCheckedChange={() =>
                                togglePreferredArea(area.id)
                              }
                            />
                            {area.name}
                          </label>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs font-medium">
                  Places you want nearby (e.g. gym, cafe)
                </Label>
                <MultiSelectChips
                  selectedIds={preferences.nearbyPlaceTypes}
                  options={NEARBY_PLACE_OPTIONS}
                  onToggle={toggleNearbyPlace}
                />
              </div>
            </>
          )}

          {isPlaceFindMode && (
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs font-medium">
                What are you looking for?
              </Label>
              <MultiSelectChips
                selectedIds={preferences.placeFindTypes}
                options={PLACE_FIND_OPTIONS}
                onToggle={togglePlaceFind}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs font-medium">
              Commute priority
            </Label>
            <OptionButtons
              value={preferences.commutePriority}
              onChange={(v) => update("commutePriority", v)}
              options={["low", "medium", "high"] as const}
              getLabel={(v) => COMMUTE_LABELS[v]}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs font-medium">
              Food & delivery
            </Label>
            <OptionButtons
              value={preferences.foodConvenience}
              onChange={(v) => update("foodConvenience", v)}
              options={["low", "medium", "high"] as const}
              getLabel={(v) => FOOD_LABELS[v]}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs font-medium">
              Quiet vs nightlife
            </Label>
            <OptionButtons
              value={preferences.quietVsNightlife}
              onChange={(v) => update("quietVsNightlife", v)}
              options={["low", "medium", "high"] as const}
              getLabel={(v) => QUIET_LABELS[v]}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs font-medium">
              Festival / crowd tolerance
            </Label>
            <OptionButtons
              value={preferences.festivalTolerance}
              onChange={(v) => update("festivalTolerance", v)}
              options={["low", "medium", "high"] as const}
              getLabel={(v) => FESTIVAL_LABELS[v]}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs font-medium">
              Schools / hospitals
            </Label>
            <OptionButtons
              value={preferences.schoolsHospitals}
              onChange={(v) => update("schoolsHospitals", v)}
              options={["low", "medium", "high"] as const}
              getLabel={(v) => SCHOOLS_LABELS[v]}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
