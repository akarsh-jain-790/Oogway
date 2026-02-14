"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PlanPage() {
    const [place, setPlace] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const storedPlace = sessionStorage.getItem("selectedPlace");
        if (storedPlace) {
            setPlace(JSON.parse(storedPlace));
        } else {
            router.push("/");
        }
    }, [router]);

    if (!place) return null;

    return (
        <div className="min-h-screen bg-white p-6 md:p-12 text-black">
            <Link href="/" className="mb-8 inline-flex items-center gap-2 text-neutral-500 hover:text-black transition-colors">
                <ArrowLeft size={20} /> Back to Search
            </Link>

            <div className="max-w-4xl mx-auto">
                <div className="flex items-start justify-between">
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

                <div className="mt-12">
                    <h2 className="text-2xl font-semibold mb-4">Itinerary Data</h2>
                    <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100 overflow-auto">
                        <pre className="text-sm font-mono text-neutral-600">
                            {JSON.stringify(place, null, 2)}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}
