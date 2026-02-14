"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ArrowLeft, Search, Sliders, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { discoverZones, Mode1Response, UserPreferences, Anchor } from "@/lib/api";

const DEFAULT_PREFERENCES: UserPreferences = {
    commutePriority: 8,
    deliveryImportance: 5,
    quietVsNightlife: 5, // Balanced
    festivalTolerance: 5,
    schoolsImportance: 5,
    hospitalsImportance: 5,
    culturalProximity: 5
};

export default function PlanPage() {
    const [place, setPlace] = useState<any>(null);
    const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
    const [results, setResults] = useState<Mode1Response | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const storedPlace = sessionStorage.getItem("selectedPlace");
        if (storedPlace) {
            setPlace(JSON.parse(storedPlace));
        } else {
            router.push("/");
        }
    }, [router]);

    const handleDiscover = async () => {
        if (!place) return;
        setLoading(true);
        setError(null);

        const anchor: Anchor = {
            type: "Work", // Defaulting to Work anchor for now
            name: place.properties.name,
            latitude: place.geometry.coordinates[1],
            longitude: place.geometry.coordinates[0],
        };

        try {
            const data = await discoverZones([anchor], preferences);
            setResults(data);
        } catch (err: any) {
            setError(err.message || "Failed to discover zones");
        } finally {
            setLoading(false);
        }
    };

    const updatePreference = (key: keyof UserPreferences, value: number) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
    };

    if (!place) return null;

    return (
        <div className="min-h-screen bg-white p-6 md:p-12 text-black">
            <Link href="/" className="mb-8 inline-flex items-center gap-2 text-neutral-500 hover:text-black transition-colors">
                <ArrowLeft size={20} /> Back to Search
            </Link>

            <div className="max-w-4xl mx-auto">
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2 text-orange-600">Planning trip to {place.properties.name}</h1>
                        <p className="text-xl text-neutral-500 flex items-center gap-2">
                            <MapPin size={20} />
                            {[place.properties.city, place.properties.state, place.properties.country].filter(Boolean).join(", ")}
                        </p>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-2xl text-right text-orange-900">
                        <p className="text-sm text-orange-400 font-medium uppercase tracking-wider">Coordinates</p>
                        <p className="font-mono text-lg">{place.geometry.coordinates[1].toFixed(4)}° N, {place.geometry.coordinates[0].toFixed(4)}° E</p>
                    </div>
                </div>

                {/* Preferences Section */}
                <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100 mb-8">
                    <div className="flex items-center gap-2 mb-6">
                        <Sliders className="text-orange-600" />
                        <h2 className="text-xl font-bold">Your Preferences</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Commute Priority ({preferences.commutePriority})</label>
                            <input
                                type="range" min="1" max="10"
                                value={preferences.commutePriority}
                                onChange={(e) => updatePreference('commutePriority', parseInt(e.target.value))}
                                className="w-full accent-orange-600"
                            />
                            <div className="flex justify-between text-xs text-neutral-400 mt-1">
                                <span>Low</span><span>Critical</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Vibe: Quiet vs Nightlife ({preferences.quietVsNightlife})</label>
                            <input
                                type="range" min="1" max="10"
                                value={preferences.quietVsNightlife}
                                onChange={(e) => updatePreference('quietVsNightlife', parseInt(e.target.value))}
                                className="w-full accent-orange-600"
                            />
                            <div className="flex justify-between text-xs text-neutral-400 mt-1">
                                <span>Silence</span><span>Party</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Cultural Proximity ({preferences.culturalProximity})</label>
                            <input
                                type="range" min="1" max="10"
                                value={preferences.culturalProximity}
                                onChange={(e) => updatePreference('culturalProximity', parseInt(e.target.value))}
                                className="w-full accent-orange-600"
                            />
                            <div className="flex justify-between text-xs text-neutral-400 mt-1">
                                <span>Irrelevant</span><span>Must-have</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleDiscover}
                            disabled={loading}
                            className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <Search size={20} />}
                            {loading ? "Discovering..." : "Find Best Zones"}
                        </button>
                    </div>
                    {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
                </div>

                {/* Results Section */}
                {results && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Top Recommendations</h2>
                        <div className="grid gap-6">
                            {results.topChoices.map((zone) => (
                                <div key={zone.id} className="border border-neutral-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-2xl font-bold text-neutral-900">{zone.name}</h3>
                                            <div className="flex gap-2 mt-1">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${zone.deliveryReliability === 'High' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    Delivery: {zone.deliveryReliability}
                                                </span>
                                                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">
                                                    Match Score: {zone.score.toFixed(0)}/100
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-neutral-500">Infrastructure</div>
                                            <div className="font-semibold">{(zone.infrastructureDensity * 100).toFixed(0)}%</div>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4 bg-neutral-50 rounded-xl p-4 mb-4">
                                        <div className="flex gap-3 items-start">
                                            <CheckCircle className="text-green-600 shrink-0 mt-0.5" size={18} />
                                            <div>
                                                <p className="font-medium text-sm">Why it matches</p>
                                                <p className="text-sm text-neutral-600">{zone.matchDetails.lifestyleMatch}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 items-start">
                                            <AlertTriangle className="text-orange-600 shrink-0 mt-0.5" size={18} />
                                            <div>
                                                <p className="font-medium text-sm">Things to note</p>
                                                <p className="text-sm text-neutral-600">{zone.matchDetails.commute}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {zone.matchDetails.warning && (
                                        <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                                            ⚠️ {zone.matchDetails.warning}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
