import React from 'react';
import { motion } from 'motion/react';
import { StoryData } from '../types';
import { Target, Compass, Sparkles, ArrowRight, Heart } from 'lucide-react';
import { playCelestialChime } from '../utils/audio';

interface DestinationRevealModalProps {
  mode: 'solo-quest' | 'shared-journey';
  startStory: StoryData;
  destinationStory: StoryData;
  friendName?: string;
  friendMessage?: string;
  onBeginJourney: () => void;
}

export const DestinationRevealModal: React.FC<DestinationRevealModalProps> = ({
  mode,
  startStory,
  destinationStory,
  friendName,
  friendMessage,
  onBeginJourney
}) => {
  const isSolo = mode === 'solo-quest';

  const handleBegin = () => {
    playCelestialChime();
    onBeginJourney();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md pointer-events-auto select-none">
      <motion.div
        className="relative w-full max-w-[680px] rounded-2xl bg-[#0E1726] border-2 border-[#D6B36B] p-6 sm:p-9 text-[#F1E5CC] shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden text-center"
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Subtle radial celestial aura */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-[radial-gradient(ellipse_at_top,rgba(214,179,107,0.22),transparent_70%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Top Emblem */}
          <div className="w-14 h-14 rounded-full bg-[#D6B36B]/20 border-2 border-[#D6B36B] flex items-center justify-center text-[#D6B36B] mb-4 shadow-[0_0_25px_rgba(214,179,107,0.4)]">
            {isSolo ? (
              <Target className="w-7 h-7 animate-pulse text-[#D6B36B]" />
            ) : (
              <Heart className="w-7 h-7 fill-[#D6B36B] text-[#D6B36B]" />
            )}
          </div>

          {/* Heading Tag */}
          <span className="text-xs sm:text-sm uppercase tracking-[0.28em] font-sans font-bold text-[#D6B36B] mb-1">
            {isSolo ? 'YOUR QUEST' : 'A STORY AWAITS YOU'}
          </span>

          {/* Main Title */}
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#FFF7E8] leading-tight mt-1">
            Find your way to {destinationStory.title}
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-base font-serif text-[#F1E5CC]/85 mt-2.5 max-w-lg leading-relaxed">
            {isSolo
              ? 'Travel through connected fairytales and reach your destination in the fewest moves.'
              : 'Follow the golden threads to discover the story your friend chose for you.'}
          </p>

          {/* Optional Message from Player A */}
          {!isSolo && friendMessage && (
            <div className="w-full my-4 p-3.5 rounded-xl bg-[#142033] border border-[#D6B36B]/40 text-left">
              <div className="text-[11px] uppercase font-sans font-semibold text-[#D6B36B] tracking-wider mb-1">
                Message from {friendName || 'Your Friend'}:
              </div>
              <p className="text-xs sm:text-sm font-serif italic text-[#FFF7E8] leading-relaxed">
                “{friendMessage}”
              </p>
            </div>
          )}

          {/* Origin & Destination Display with Subtle Golden Route Indicator */}
          <div className="w-full my-6 p-4 sm:p-5 rounded-xl bg-[#142033]/90 border border-[#D6B36B]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Origin Card */}
            <div className="flex-1 text-left w-full sm:w-auto">
              <span className="text-[11px] uppercase font-sans font-semibold text-[#D6B36B] tracking-wider block">
                Starting Fairytale
              </span>
              <div className="font-serif font-bold text-base sm:text-lg text-[#FFF7E8] mt-0.5">
                {startStory.title}
              </div>
              <div className="text-xs font-sans text-[#F1E5CC]/70">{startStory.country}</div>
            </div>

            {/* Subtle Golden Route Indicator without revealing the intermediate path */}
            <div className="flex flex-col items-center justify-center px-2 py-1 shrink-0 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 w-full sm:w-36 justify-center">
                <span className="w-2 h-2 rounded-full bg-[#D6B36B] shadow-[0_0_8px_#D6B36B]" />
                <div className="flex-1 h-0.5 border-t border-dashed border-[#D6B36B] opacity-80" />
                <Sparkles className="w-4 h-4 text-[#D6B36B] animate-spin-slow" />
                <div className="flex-1 h-0.5 border-t border-dashed border-[#D6B36B] opacity-80" />
                <span className="w-2.5 h-2.5 rounded-full border border-[#FFF7E8] bg-[#D6B36B] shadow-[0_0_12px_#D6B36B]" />
              </div>
              <span className="text-[10px] font-sans text-[#D6B36B]/80 mt-1 uppercase tracking-wider">
                Uncharted Golden Thread
              </span>
            </div>

            {/* Destination Card */}
            <div className="flex-1 text-right w-full sm:w-auto">
              <span className="text-[11px] uppercase font-sans font-semibold text-[#D6B36B] tracking-wider block">
                Destination Goal
              </span>
              <div className="font-serif font-bold text-base sm:text-lg text-[#FFF7E8] mt-0.5">
                {destinationStory.title}
              </div>
              <div className="text-xs font-sans text-[#F1E5CC]/70">{destinationStory.country}</div>
            </div>
          </div>

          {/* Primary CTA */}
          <button
            onClick={handleBegin}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#D6B36B] hover:bg-[#E7CCA0] text-[#0B1424] font-serif font-bold text-base sm:text-lg transition-all shadow-[0_0_25px_rgba(214,179,107,0.45)] flex items-center justify-center gap-2.5 cursor-pointer hover:scale-[1.02]"
          >
            <span>Begin Your Journey</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
