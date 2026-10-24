import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Compass, BookOpen, RotateCcw, Award } from 'lucide-react';
import { playGoldenThreadResonance, playGentleClick } from '../utils/audio';

interface CompletionModalProps {
  onClose: () => void;
  onOpenJournal: () => void;
  onResetGame: () => void;
  connectionsCount: number;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  onClose,
  onOpenJournal,
  onResetGame,
  connectionsCount
}) => {
  useEffect(() => {
    playGoldenThreadResonance();

    // Trigger subtle golden stardust confetti
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D6B36B', '#FFF7E8', '#E7CCA0', '#19372F']
      });
    } catch {
      // Ignore if canvas-confetti fails in restricted environments
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1424]/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative max-w-xl w-full p-8 md:p-10 rounded-xl parchment-card border border-[#D6B36B]/60 shadow-2xl text-center space-y-6">
        {/* Emblem */}
        <div className="w-14 h-14 mx-auto rounded-full bg-[#19372F] border-2 border-[#D6B36B] flex items-center justify-center shadow-lg">
          <Award className="w-7 h-7 text-[#D6B36B]" />
        </div>

        {/* Title & Prompt Quoted Reflection */}
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-[0.25em] font-sans font-semibold text-[#A98336]">
            The Golden Tapestry Unveiled
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#19372F] leading-tight">
            “Different lands. Familiar stories. Countless ways to tell them.”
          </h2>
        </div>

        {/* Synthesis Prose */}
        <div className="text-sm font-sans text-[#19372F]/85 leading-relaxed space-y-3">
          <p>
            You have successfully woven {connectionsCount} Golden Threads across France, Korea, China, and India.
          </p>
          <p className="text-xs md:text-sm text-[#19372F]/75">
            You have observed how human imaginations independently converged upon motifs of unjust treatment,
            divine aids, and fateful lost tokens—while honoring each story’s sovereign history, philosophical
            foundations, and distinctive cultural voice.
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-[#D6B36B]/30 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              playGentleClick();
              onOpenJournal();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#19372F] hover:bg-[#234A3F] text-[#FFF7E8] font-serif font-semibold text-sm tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#D6B36B]" />
            <span>Review Storykeeper’s Journal</span>
          </button>

          <button
            onClick={() => {
              playGentleClick();
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-[#19372F]/30 hover:bg-[#EAE0C7] text-[#19372F] font-serif font-semibold text-sm tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-[#A98336]" />
            <span>Continue Free Exploration</span>
          </button>
        </div>

        {/* Reset option */}
        <div className="pt-2">
          <button
            onClick={() => {
              playGentleClick();
              onResetGame();
            }}
            className="text-xs font-sans text-[#19372F]/60 hover:text-[#19372F] underline transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Journey & Clear Threads</span>
          </button>
        </div>
      </div>
    </div>
  );
};
