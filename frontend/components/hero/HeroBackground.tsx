import React from 'react';

export const HeroBackground = () => {
    return (
        <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none flex items-center justify-center overflow-hidden">
            {/* Abstract Map Pattern SVG */}
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse">
                    <path d="M 4 0 L 0 0 0 4" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
        </div>
    );
};
