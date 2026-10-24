import React from 'react';
import { Compass, BookOpen, Sparkles, Globe } from 'lucide-react';
import { playGentleClick, playParchmentRustle } from '../utils/audio';

interface LandingHeroProps {
  onOpenAtlas: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onOpenAtlas }) => {
  const handleStart = () => {
    playParchmentRustle();
    playGentleClick();
    onOpenAtlas();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1424]/90 backdrop-blur-md">
      {/* Decorative Antique Corner Flourishes */}
      <div className="relative max-w-2xl w-full p-8 md:p-12 rounded-xl dark-parchment-card text-center border border-[#D6B36B]/40 shadow-2xl">
        {/* Subtle illuminated manuscript header ornament */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#D6B36B]/60" />
          <div className="w-2 h-2 rotate-45 border border-[#D6B36B] bg-[#19372F]" />
          <span className="text-xs uppercase tracking-[0.25em] font-sans text-[#D6B36B]/90 font-medium">
            Celestial Folklore Atlas · HackTX 2026
          </span>
          <div className="w-2 h-2 rotate-45 border border-[#D6B36B] bg-[#19372F]" />
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#D6B36B]/60" />
        </div>

        {/* Main Title */}
        <h1 className="text-4xl md:text-6xl font-serif font-normal tracking-wide text-[#FFF7E8] mb-3 leading-tight">
          THE GOLDEN THREAD
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl font-serif italic text-[#D6B36B] mb-6">
          “Every story begins somewhere. Few stay there.”
        </p>

        {/* Editorial Narrative Deck */}
        <div className="max-w-xl mx-auto text-sm md:text-base font-sans text-[#F1E5CC]/80 leading-relaxed mb-8">
          Across oceans and mountain ranges, human communities have woven the same timeless narrative patterns.
          Rotate the celestial globe, discover four celebrated tales from France, Korea, China, and India, and
          uncover the glowing motifs that connect world folklore while honoring each culture’s sovereign voice.
        </div>

        {/* 3 Pillars of Discovery (Unboxed, Zero-Pill) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-left border-y border-[#D6B36B]/20 py-4">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-[#D6B36B] font-medium mb-1">
              01 · Explore
            </span>
            <span className="text-xs text-[#F1E5CC]/75 leading-normal">
              Rotate the 3D globe and inspect story locations around the world.
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-[#D6B36B] font-medium mb-1">
              02 · Deduce
            </span>
            <span className="text-xs text-[#F1E5CC]/75 leading-normal">
              Identify the hidden motif connecting traditions across continents.
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-[#D6B36B] font-medium mb-1">
              03 · Weave
            </span>
            <span className="text-xs text-[#F1E5CC]/75 leading-normal">
              Cast glowing Golden Threads and uncover deep cultural distinctions.
            </span>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleStart}
            className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-[#D6B36B] hover:bg-[#E7CCA0] text-[#0B1424] font-serif font-semibold text-lg tracking-wider transition-all duration-200 shadow-lg hover:shadow-[#D6B36B]/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Compass className="w-5 h-5 text-[#0B1424]" />
            <span>Open the Atlas</span>
          </button>
        </div>

        {/* Quiet footnote metadata */}
        <div className="mt-6 text-[11px] font-sans text-[#F1E5CC]/50">
          Curated folklore research · Distinctive comparative folkloristics · No telemetry
        </div>
      </div>
    </div>
  );
};
