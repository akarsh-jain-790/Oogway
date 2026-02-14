"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ArrowLeft, AlertTriangle, Car, Clock, Shield } from "lucide-react";
import Link from "next/link";
import { analyzeTrip, Mode2Response } from "@/lib/api";

export default function LivePage() {
    const [place, setPlace] = useState<any>(null);
    const [analysis, setAnalysis] = useState<Mode2Response | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [origin, setOrigin] = useState("Indiranagar, Bangalore"); // Default origin
    const router = useRouter();

    useEffect(() => {
        const storedPlace = sessionStorage.getItem("selectedPlace");
        if (storedPlace) {
            setPlace(JSON.parse(storedPlace));
        } else {
            router.push("/");
        }
    }, [router]);

    const handleAnalyze = async () => {
        if (!place) return;
        setLoading(true);
        setError(null);
        try {
            const result = await analyzeTrip(
                origin,
                place.properties.name + ", " + (place.properties.city || ""),
                new Date().toISOString()
            );
            setAnalysis(result);
        } catch (err: any) {
            setError(err.message || "Failed to analyze trip");
        } finally {
            setLoading(false);
        }
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
                        <h1 className="text-4xl font-bold tracking-tight mb-2">{place.properties.name}</h1>
                        <p className="text-xl text-neutral-500 flex items-center gap-2">
                            <MapPin size={20} />
                            {[place.properties.city, place.properties.state, place.properties.country].filter(Boolean).join(", ")}
                        </p>
                    </div>

                    <div className="bg-neutral-100 p-4 rounded-2xl text-right">
                        <p className="text-sm text-neutral-500 font-medium uppercase tracking-wider">Coordinates</p>
                        <p className="font-mono text-lg">{place.geometry.coordinates[1].toFixed(4)}° N, {place.geometry.coordinates[0].toFixed(4)}° E</p>
                    </div>
                </div>

                {/* Analysis Controls */}
                <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100 mb-8">
                    <h2 className="text-lg font-semibold mb-4">Trip Analysis</h2>
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Starting From</label>
                            <input
                                type="text"
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:outline-none"
                            />
                        </div>
                        <button
                            onClick={handleAnalyze}
                            disabled={loading}
                            className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed h-[42px]"
                        >
                            {loading ? "Analyzing..." : "Analyze Route"}
                        </button>
                    </div>
                    {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
                </div>

                {/* Results */}
                {analysis && (
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Risk Card */}
                        <div className={`p-6 rounded-2xl border ${analysis.risk_analysis.risk_level === 'Low' ? 'bg-green-50 border-green-100' :
                                analysis.risk_analysis.risk_level === 'Medium' ? 'bg-yellow-50 border-yellow-100' :
                                    'bg-red-50 border-red-100'
                            }`}>
                            <div className="flex items-center gap-2 mb-4">
                                <Shield size={24} className={
                                    analysis.risk_analysis.risk_level === 'Low' ? 'text-green-600' :
                                        analysis.risk_analysis.risk_level === 'Medium' ? 'text-yellow-600' :
                                            'text-red-600'
                                } />
                                <h3 className="text-xl font-bold">Risk Level: {analysis.risk_analysis.risk_level}</h3>
                            </div>
                            <p className="text-neutral-700 mb-4">{analysis.risk_analysis.reasoning}</p>
                            {analysis.risk_analysis.recommended_departure_adjustment_minutes !== 0 && (
                                <div className="flex items-center gap-2 text-sm font-medium p-3 bg-white/50 rounded-lg">
                                    <Clock size={16} />
                                    <span>Recommended Adjustment: {analysis.risk_analysis.recommended_departure_adjustment_minutes} mins</span>
                                </div>
                            )}
                        </div>

                        {/* Trip Details Card */}
                        <div className="p-6 rounded-2xl border border-neutral-100 bg-white shadow-sm">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Car size={24} /> Trip Summary
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-neutral-500">Distance</span>
                                    <span className="font-mono">{analysis.trip_summary.distance_km.toFixed(1)} km</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-500">Duration</span>
                                    <span className="font-mono">{analysis.trip_summary.duration_in_traffic_minutes} mins</span>
                                </div>
                                <div className="flex justify-between text-yellow-600">
                                    <span className="flex items-center gap-1"><AlertTriangle size={14} /> Traffic Delay</span>
                                    <span className="font-mono">+{analysis.trip_summary.traffic_delay_minutes} mins</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-neutral-100">
                                <h4 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">Price Estimates</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Uber</span>
                                        <span className="font-bold">₹{analysis.ride_pricing.uber_estimate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Ola</span>
                                        <span className="font-bold">₹{analysis.ride_pricing.ola_estimate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Namma Yatri</span>
                                        <span className="font-bold">₹{analysis.ride_pricing.namma_estimate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
