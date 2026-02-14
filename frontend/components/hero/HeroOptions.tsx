"use client";

import { motion } from "framer-motion";
import { ArrowRight, Navigation, Home as HomeIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface SelectedPlace {
  properties: { name?: string; city?: string; state?: string; country?: string };
}

interface HeroOptionsProps {
  selectedPlace: SelectedPlace | null;
}

export const HeroOptions = ({ selectedPlace }: HeroOptionsProps) => {
  const router = useRouter();

  const handleOptionClick = (mode: "live" | "go") => {
    if (selectedPlace) {
      sessionStorage.setItem("selectedPlace", JSON.stringify(selectedPlace));
      const props = selectedPlace.properties;
      const search = [props.name, props.city, props.state, props.country]
        .filter(Boolean)
        .join(", ");
      const params = new URLSearchParams();
      if (search?.trim()) params.set("search", search.trim());
      params.set("mode", mode);
      router.push(`/map?${params.toString()}`);
    }
  };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mt-8 grid grid-cols-2 gap-4"
        >

            <div
                onClick={() => handleOptionClick("live")}
                className="group w-full bg-white/10 backdrop-blur-md hover:bg-blue-50/20 border-2 border-blue-200 hover:border-blue-500 rounded-full p-4 px-8 transition-all duration-300 flex flex-col md:flex-row items-center md:justify-between cursor-pointer gap-4"
            >
                <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100/20 text-blue-600 flex items-center justify-center shrink-0">
                        <HomeIcon size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-neutral-900 group-hover:text-blue-700 transition-colors">Live Here</h3>
                        <p className="text-neutral-500 text-sm font-medium mt-1">Long-term. Commute & community.</p>
                    </div>
                </div>
                <ArrowRight className="text-neutral-300 group-hover:text-blue-600 transition-colors -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0" size={24} />
            </div>

            <div
                onClick={() => handleOptionClick("go")}
                className="group w-full bg-white/10 backdrop-blur-md hover:bg-orange-50/20 border-2 border-orange-200 hover:border-orange-500 rounded-full p-4 px-8 transition-all duration-300 flex flex-col md:flex-row items-center md:justify-between cursor-pointer gap-4"
            >
                <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-4">
                    <div className="h-12 w-12 rounded-full bg-orange-100/20 text-orange-600 flex items-center justify-center shrink-0">
                        <Navigation size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-neutral-900 group-hover:text-orange-700 transition-colors">Go Here</h3>
                        <p className="text-neutral-500 text-sm font-medium mt-1">Short-term. Traffic & events.</p>
                    </div>
                </div>
                <ArrowRight className="text-neutral-300 group-hover:text-orange-600 transition-colors -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0" size={24} />
            </div>

        </motion.div>
    );
};
