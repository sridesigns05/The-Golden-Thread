import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { SoloQuestState } from '../types';
import { STORIES } from '../data/stories';
import confetti from 'canvas-confetti';
import { Trophy, Compass, RotateCcw, BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { playCelestialChime } from '../utils/audio';

interface SoloQuestCompletionModalProps {
  questState: SoloQuestState;
  onPlayAgain: () => void;
  onExploreFreely: () => void;
  onOpenJournal: () => void;
}

export const SoloQuestCompletionModal: React.FC<SoloQuestCompletionModalProps> = ({
  questState,
  onPlayAgain,
  onExploreFreely,
  onOpenJournal
}) => {
  const startStory = STORIES.find((s) => s.id === questState.startStoryId);
  const targetStory = STORIES.find((s) => s.id === questState.targetStoryId);

  useEffect(() => {
    playCelestialChime();
    // Fire festive golden stardust confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D6B36B', '#FFF7E8', '#E7CCA0', '#19372F']
      });
    } catch {
      // Ignore
    }
  }, []);

  const isOptimal = questState.movesTaken <= questState.minHops;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md pointer-events-auto select-none">
      <motion.div
        className="relative w-full max-w-[640px] rounded-2xl bg-[#0E1726] border-2 border-[#D6B36B] p-6 sm:p-8 text-[#F1E5CC] shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden text-center"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-[radial-gradient(ellipse_at_top,rgba(214,179,107,0.25),transparent_70%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Trophy Emblem */}
          <div className="w-16 h-16 rounded-full bg-[#D6B36B]/20 border-2 border-[#D6B36B] flex items-center justify-center text-[#D6B36B] mb-4 shadow-[0_0_30px_rgba(214,179,107,0.4)]">
            <Trophy className="w-8 h-8 animate-bounce" />
          </div>

          <span className="text-[11px] uppercase tracking-[0.25em] font-sans font-semibold text-[#D6B36B]">
            Solo Quest Victorious
          </span>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#FFF7E8] mt-1">
            The Golden Thread is Woven!
          </h2>

          <p className="text-xs sm:text-sm font-serif text-[#F1E5CC]/85 mt-2 max-w-md">
            You successfully navigated from <strong className="text-[#FFF7E8]">{startStory?.title}</strong> ({startStory?.country}) across cultural traditions to reach <strong className="text-[#FFF7E8]">{targetStory?.title}</strong> ({targetStory?.country}).
          </p>

          {/* Statistics Card */}
          <div className="w-full grid grid-cols-2 gap-3 my-5">
            <div className="p-3 rounded-xl bg-[#142033] border border-[#D6B36B]/30">
              <div className="text-[10px] uppercase font-sans text-[#F1E5CC]/70">Your Transitions</div>
              <div className="text-xl sm:text-2xl font-serif font-bold text-[#D6B36B]">
                {questState.movesTaken} {questState.movesTaken === 1 ? 'Move' : 'Moves'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#142033] border border-[#D6B36B]/30">
              <div className="text-[10px] uppercase font-sans text-[#F1E5CC]/70">Shortest Possible Path</div>
              <div className="text-xl sm:text-2xl font-serif font-bold text-[#FFF7E8]">
                {questState.minHops} {questState.minHops === 1 ? 'Move' : 'Moves'}
              </div>
            </div>
          </div>

          {/* Performance Callout */}
          <div className="w-full p-3 rounded-lg bg-[#D6B36B]/15 border border-[#D6B36B]/50 text-xs font-serif text-[#F1E5CC] mb-6 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D6B36B] shrink-0" />
            <span>
              {isOptimal
                ? 'Masterful navigation! You discovered the optimal mythic path connecting these continents.'
                : `A poetic journey! You wove a unique route across world folklore in ${questState.movesTaken} moves.`}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <button
              onClick={onPlayAgain}
              className="px-5 py-2.5 rounded-full bg-[#D6B36B] hover:bg-[#E7CCA0] text-[#0B1424] font-serif font-bold text-sm transition-all shadow-[0_0_20px_rgba(214,179,107,0.4)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Embark on New Quest</span>
            </button>

            <button
              onClick={onExploreFreely}
              className="px-5 py-2.5 rounded-full bg-[#142033] hover:bg-[#1C2C47] text-[#FFF7E8] font-sans text-xs border border-[#D6B36B]/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#D6B36B]" />
              <span>Explore Atlas Freely</span>
            </button>

            <button
              onClick={onOpenJournal}
              className="px-5 py-2.5 rounded-full bg-[#142033] hover:bg-[#1C2C47] text-[#FFF7E8] font-sans text-xs border border-[#D6B36B]/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#D6B36B]" />
              <span>Open Journal</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
