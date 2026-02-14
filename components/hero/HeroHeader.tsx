"use client";

import { motion } from "framer-motion";
import { Map as MapIcon } from "lucide-react";

interface HeroHeaderProps {
    step: "input" | "selection";
}

export const HeroHeader = ({ step }: HeroHeaderProps) => {
    return (
        <motion.div
            layout
            className={`absolute top-12 left-0 right-0 flex flex-col items-center justify-center z-50 pointer-events-none transition-opacity duration-500 ${step === 'selection' ? 'opacity-60' : 'opacity-100'}`}
        >
            <span className="text-6xl font-bold tracking-tighter text-neutral-900 flex items-center gap-3">
                <MapIcon size={48} strokeWidth={1.5} /> Susmap
            </span>
            <p className="text-neutral-400 mt-2 font-light tracking-wide text-lg">Google Maps for living , not navigating</p>
        </motion.div>
    );
};
