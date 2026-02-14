"use client";

import { useState } from "react";
import { HeroBackground } from "@/components/hero/HeroBackground";
import { HeroHeader } from "@/components/hero/HeroHeader";
import { HeroSearch } from "@/components/hero/HeroSearch";
import { HeroOptions } from "@/components/hero/HeroOptions";
import { AnimatePresence } from "framer-motion";

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

export default function Home() {
  const [step, setStep] = useState<"input" | "selection">("input");
  const [selectedPlace, setSelectedPlace] = useState<PhotonFeature | null>(
    null,
  );

  const handleNext = () => {
    if (selectedPlace) {
      setStep("selection");
    }
  };

  const handleBack = () => {
    setStep("input");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white text-black font-sans selection:bg-black selection:text-white overflow-hidden p-6 relative">
      <HeroBackground />
      <HeroHeader step={step} />

      <div className="w-full max-w-3xl relative z-10 mt-20">
        <HeroSearch
          onLocationSelect={setSelectedPlace}
          onNext={handleNext}
          step={step}
          onBack={handleBack}
        />

        <AnimatePresence>
          {step === "selection" && selectedPlace && (
            <HeroOptions selectedPlace={selectedPlace} />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
