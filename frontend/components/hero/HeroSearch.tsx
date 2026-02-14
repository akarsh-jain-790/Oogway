"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, MapPin, X, Loader2 } from "lucide-react";

interface PhotonFeature {
    properties: {
        name: string;
        city?: string;
        country?: string;
        state?: string;
        [key: string]: any;
    };
    geometry: {
        coordinates: [number, number];
        type: string;
    };
}

interface HeroSearchProps {
    onLocationSelect: (feature: PhotonFeature | null) => void;
    onNext: () => void;
    step: "input" | "selection";
    onBack: () => void;
}

export const HeroSearch = ({ onLocationSelect, onNext, step, onBack }: HeroSearchProps) => {
    const [location, setLocation] = useState("");
    const [suggestions, setSuggestions] = useState<PhotonFeature[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState<PhotonFeature | null>(null);

    const timeoutRef = useRef<NodeJS.Timeout>(null);

    const fetchSuggestions = async (query: string) => {
        if (query.length < 3) {
            setSuggestions([]);
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`/api/places?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            setSuggestions(data.features || []);
            setShowSuggestions(true);
        } catch (error) {
            console.error("Error fetching places:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLocation(val);
        setSelectedPlace(null);
        onLocationSelect(null);
        setIsLoading(true);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            fetchSuggestions(val);
        }, 300);
    };

    const handleSelectSuggestion = (feature: PhotonFeature) => {
        const props = feature.properties;
        const name = props.name;
        const context = [props.city, props.state, props.country].filter(Boolean).join(", ");
        const fullName = `${name}${context ? `, ${context}` : ""}`;

        setLocation(fullName);
        setSelectedPlace(feature);
        onLocationSelect(feature);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleNextClick = () => {
        if (selectedPlace) {
            onNext();
            setShowSuggestions(false);
        }
    };

    return (
        <motion.div
            layout
            initial={false}
            animate={{
                y: step === "input" ? 0 : -80,
                scale: step === "input" ? 1 : 0.95,
            }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            className="w-full relative"
        >
            <div className="relative group">
                <input
                    autoFocus
                    type="text"
                    value={location}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === "Enter" && handleNextClick()}
                    onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                    placeholder="Enter a city, neighborhood..."
                    className="w-full bg-white border-2 border-neutral-200 focus:border-black rounded-full py-8 pl-8 pr-20 text-xl font-medium outline-none transition-all duration-300 shadow-lg shadow-neutral-100/50 placeholder:text-neutral-400 pointer-events-auto"
                    readOnly={step === "selection"}
                />

                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute right-6 top-1/2 -translate-y-1/2"
                        >
                            <Loader2 className="animate-spin text-neutral-400" size={24} />
                        </motion.div>
                    ) : step === 'selection' ? (
                        <motion.button
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            onClick={onBack}
                            className="absolute right-6 top-1/2 -translate-y-1/2 h-12 w-12 bg-neutral-100 hover:bg-neutral-200 text-black rounded-full flex items-center justify-center transition-colors pointer-events-auto"
                        >
                            <X size={24} />
                        </motion.button>
                    ) : selectedPlace && (
                        <motion.button
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleNextClick}
                            className="absolute right-6 top-1/2 -translate-y-1/2 h-12 w-12 bg-black text-white rounded-full flex items-center justify-center pointer-events-auto"
                        >
                            <ArrowRight size={24} />
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Suggestions Dropdown */}
                <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && step === 'input' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, y: 10, height: 0 }}
                            className="absolute top-full left-0 right-0 mt-4 bg-white rounded-2xl shadow-2xl shadow-neutral-200/50 border border-neutral-100 overflow-hidden z-30"
                        >
                            <ul>
                                {suggestions.map((place, index) => (
                                    <li
                                        key={index}
                                        onClick={() => handleSelectSuggestion(place)}
                                        className="px-6 py-4 hover:bg-neutral-50 cursor-pointer border-b border-neutral-50 last:border-none flex items-center gap-4 transition-colors group/item"
                                    >
                                        <div className="bg-neutral-100 p-2 rounded-lg text-neutral-500 group-hover/item:bg-neutral-200 group-hover/item:text-black transition-colors">
                                            <MapPin size={16} />
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className="font-medium text-neutral-900">{place.properties.name}</span>
                                            <span className="text-xs text-neutral-400 font-medium">
                                                {[place.properties.city, place.properties.state, place.properties.country].filter(Boolean).join(", ")}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
