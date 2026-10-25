import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GameMode, StoryId } from '../types';
import { STORIES } from '../data/stories';
import { Compass, Users, Sparkles, X, ArrowRight } from 'lucide-react';
import { playGentleClick, playCelestialChime } from '../utils/audio';

interface ModeSelectModalProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode, startStoryId?: StoryId) => void;
  onClose: () => void;
}

export const ModeSelectModal: React.FC<ModeSelectModalProps> = ({
  currentMode,
  onSelectMode,
  onClose
}) => {
  // No card is highlighted by default
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [startStoryId, setStartStoryId] = useState<StoryId>('cinderella');
  const [step, setStep] = useState<'mode-choice' | 'choose-start'>('mode-choice');

  const handleModeCardClick = (mode: GameMode) => {
    playGentleClick();
    setSelectedMode(mode);
    if (mode === 'solo-quest') {
      setStep('choose-start');
    } else {
      onSelectMode(mode);
    }
  };

  const handleConfirmSoloQuest = () => {
    playCelestialChime();
    onSelectMode('solo-quest', startStoryId);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md pointer-events-auto select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        className="relative w-full max-w-[760px] rounded-2xl bg-[#0E1726] border-2 border-[#D6B36B]/60 shadow-[0_25px_80px_rgba(0,0,0,0.95)] p-6 sm:p-9 text-[#F1E5CC] overflow-hidden"
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Background celestial ornament */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[radial-gradient(ellipse_at_top_right,rgba(214,179,107,0.12),transparent_70%)] pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#D6B36B]/70 hover:text-[#FFF7E8] hover:bg-[#D6B36B]/20 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D6B36B] focus-visible:outline-none"
          title="Close Mode Selection"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'mode-choice' ? (
          <div>
            {/* Header */}
            <div className="text-center mb-7">
              <span className="text-xs uppercase tracking-[0.28em] font-sans font-bold text-[#D6B36B] block mb-1">
                HackTX 2026 Adventure
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#FFF7E8]">
                Where will your story take you?
              </h2>
              <p className="text-sm sm:text-base text-[#F1E5CC]/85 font-serif mt-2 max-w-lg mx-auto leading-relaxed">
                Embark on an interconnected voyage across the world’s fairytales through the threads of universal motifs.
              </p>
            </div>

            {/* Mode Cards: Identical default state, independent hover, no default glow */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Solo Quest */}
              <button
                type="button"
                onClick={() => handleModeCardClick('solo-quest')}
                className={`p-5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#D6B36B] focus-visible:outline-none ${
                  selectedMode === 'solo-quest'
                    ? 'bg-[#18263D] border-[#D6B36B] shadow-[0_0_20px_rgba(214,179,107,0.3)]'
                    : 'bg-[#111C2E]/70 border-[#D6B36B]/25 hover:border-[#D6B36B] hover:bg-[#16253B] hover:shadow-[0_4px_25px_rgba(214,179,107,0.18)]'
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#D6B36B]/15 border border-[#D6B36B]/30 flex items-center justify-center text-[#D6B36B] mb-3.5 group-hover:scale-105 transition-transform group-hover:border-[#D6B36B]/60">
                    <Compass className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-[#FFF7E8] group-hover:text-[#FFF7E8]">
                    Solo Quest
                  </h3>
                  <p className="text-xs sm:text-sm font-sans text-[#F1E5CC]/80 mt-2 leading-relaxed">
                    Pick a starting tale, receive an assigned destination, and navigate via motifs in the fewest moves.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#D6B36B]/20 flex items-center justify-between text-xs sm:text-sm font-sans text-[#D6B36B] font-semibold">
                  <span>Start Quest</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Shared Journey */}
              <button
                type="button"
                onClick={() => handleModeCardClick('shared-journey')}
                className={`p-5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#D6B36B] focus-visible:outline-none ${
                  selectedMode === 'shared-journey'
                    ? 'bg-[#18263D] border-[#D6B36B] shadow-[0_0_20px_rgba(214,179,107,0.3)]'
                    : 'bg-[#111C2E]/70 border-[#D6B36B]/25 hover:border-[#D6B36B] hover:bg-[#16253B] hover:shadow-[0_4px_25px_rgba(214,179,107,0.18)]'
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#D6B36B]/15 border border-[#D6B36B]/30 flex items-center justify-center text-[#D6B36B] mb-3.5 group-hover:scale-105 transition-transform group-hover:border-[#D6B36B]/60">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-[#FFF7E8] group-hover:text-[#FFF7E8]">
                    Shared Journey
                  </h3>
                  <p className="text-xs sm:text-sm font-sans text-[#F1E5CC]/80 mt-2 leading-relaxed">
                    Send an invitation link with a personal note. A friend travels from their story to reach yours.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#D6B36B]/20 flex items-center justify-between text-xs sm:text-sm font-sans text-[#D6B36B] font-semibold">
                  <span>Invite Traveler</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Explore Freely */}
              <button
                type="button"
                onClick={() => handleModeCardClick('free-exploration')}
                className={`p-5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#D6B36B] focus-visible:outline-none ${
                  selectedMode === 'free-exploration'
                    ? 'bg-[#18263D] border-[#D6B36B] shadow-[0_0_20px_rgba(214,179,107,0.3)]'
                    : 'bg-[#111C2E]/70 border-[#D6B36B]/25 hover:border-[#D6B36B] hover:bg-[#16253B] hover:shadow-[0_4px_25px_rgba(214,179,107,0.18)]'
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#D6B36B]/15 border border-[#D6B36B]/30 flex items-center justify-center text-[#D6B36B] mb-3.5 group-hover:scale-105 transition-transform group-hover:border-[#D6B36B]/60">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-[#FFF7E8] group-hover:text-[#FFF7E8]">
                    Explore Freely
                  </h3>
                  <p className="text-xs sm:text-sm font-sans text-[#F1E5CC]/80 mt-2 leading-relaxed">
                    Freely rotate the globe, read authentic manuscripts, test motif parallels, and collect threads.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#D6B36B]/20 flex items-center justify-between text-xs sm:text-sm font-sans text-[#D6B36B] font-semibold">
                  <span>Open Atlas</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Solo Quest Setup: Choose Origin Story */}
            <div className="mb-5">
              <button
                onClick={() => setStep('mode-choice')}
                className="text-xs sm:text-sm font-sans font-medium text-[#D6B36B] hover:underline mb-2 cursor-pointer flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-[#D6B36B] focus-visible:outline-none"
              >
                ← Back to Mode Selection
              </button>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#FFF7E8]">
                Select Your Starting Fairytale
              </h2>
              <p className="text-xs sm:text-sm text-[#F1E5CC]/85 font-serif mt-1.5 leading-relaxed">
                Choose the story where your journey begins. Your destination will be revealed before you embark.
              </p>
            </div>

            {/* List of 15 Stories */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
              {STORIES.map((s) => {
                const isSelected = startStoryId === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setStartStoryId(s.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between focus-visible:ring-2 focus-visible:ring-[#D6B36B] focus-visible:outline-none ${
                      isSelected
                        ? 'bg-[#D6B36B]/25 border-[#D6B36B] text-[#FFF7E8] shadow-[0_0_15px_rgba(214,179,107,0.25)]'
                        : 'bg-[#111C2E]/60 border-[#D6B36B]/25 hover:border-[#D6B36B]/60 text-[#F1E5CC]'
                    }`}
                  >
                    <div>
                      <div className="font-serif font-bold text-sm sm:text-base leading-tight">{s.title}</div>
                      <div className="text-[11px] font-sans text-[#D6B36B] mt-0.5">{s.country}</div>
                    </div>
                    {isSelected && (
                      <span className="text-xs font-sans font-bold text-[#D6B36B] px-2 py-0.5 rounded bg-[#D6B36B]/20 border border-[#D6B36B]/40">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-[#D6B36B]/30 flex items-center justify-between">
              <span className="text-xs font-serif italic text-[#D6B36B]/80">
                15 authentic world traditions in atlas
              </span>
              <button
                onClick={handleConfirmSoloQuest}
                className="px-6 py-2.5 rounded-full bg-[#D6B36B] hover:bg-[#E7CCA0] text-[#0B1424] font-serif font-bold text-sm sm:text-base transition-all shadow-[0_0_20px_rgba(214,179,107,0.4)] flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
