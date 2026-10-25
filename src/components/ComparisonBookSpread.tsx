import React from 'react';
import { motion } from 'motion/react';
import { ComparisonDetail, StoryData } from '../types';
import { MOTIFS_CATALOG } from '../data/motifs';
import { classificationLabel } from '../data/comparisons';
import { EvidencePanel } from './EvidencePanel';
import { StoryIllustration } from './StoryIllustrations';
import { X, Sparkles, BookMarked, Check } from 'lucide-react';
import { playGoldenThreadResonance, playGentleClick } from '../utils/audio';

interface ComparisonBookSpreadProps {
  comparison: ComparisonDetail;
  storyA: StoryData;
  storyB: StoryData;
  onClose: () => void;
  onThreadCollected: () => void;
  isAlreadyCollected: boolean;
}

export const ComparisonBookSpread: React.FC<ComparisonBookSpreadProps> = ({
  comparison,
  storyA,
  storyB,
  onClose,
  onThreadCollected,
  isAlreadyCollected
}) => {
  const motif = MOTIFS_CATALOG[comparison.sharedMotif];

  const handleCollect = () => {
    if (!isAlreadyCollected) {
      playGoldenThreadResonance();
      onThreadCollected();
    } else {
      playGentleClick();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/75 backdrop-blur-md pointer-events-auto select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        className="relative w-full max-w-[min(1100px,92vw)] max-h-[88dvh] rounded-2xl bg-[#28160E] border-2 border-[#D6B36B]/80 shadow-[0_25px_80px_rgba(0,0,0,0.95)] p-2 sm:p-3 md:p-4 flex flex-col justify-between overflow-hidden"
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#381F14] via-[#24130B] to-[#170B06] opacity-90 pointer-events-none" />

        {/* Two-Page Parchment Spread */}
        <div className="relative w-full h-full rounded-xl bg-[#F4ECD8] flex flex-col md:flex-row overflow-y-auto md:overflow-hidden shadow-inner border border-[#C5A566]">
          {/* Close button */}
          <button
            onClick={() => {
              playGentleClick();
              onClose();
            }}
            className="absolute top-3 right-3 z-30 p-2 rounded-full text-[#19372F]/75 hover:text-[#19372F] hover:bg-[#D6B36B]/20 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#8A6726]"
            aria-label="Close comparison"
          >
            <X className="w-5 h-5" />
          </button>

          {/* LEFT PAGE: Story A Details & Shared Parallel */}
          <div className="relative w-full md:w-1/2 p-5 sm:p-6 md:p-7 flex flex-col justify-between border-b md:border-b-0 md:border-r-2 border-[#D6B36B]/40 bg-gradient-to-br from-[#F5EEDA] via-[#F1E5CC] to-[#E9DDC2] overflow-y-auto md:shadow-[inset_-12px_0_24px_rgba(0,0,0,0.06)]">
            <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#D6B36B] pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#D6B36B] pointer-events-none" />

            <div>
              {/* Header Ribbon */}
              <div className="text-xs sm:text-[14px] uppercase tracking-[0.25em] font-sans font-bold text-[#8A6726] mb-1">
                Shared Narrative Motif
              </div>
              <h3 className="text-xl sm:text-2xl md:text-[26px] font-serif font-bold text-[#19372F] leading-tight mb-3">
                {motif?.name || 'Shared Archetype'}
              </h3>

              {/* Story A Spotlight */}
              <div className="p-3.5 rounded-xl bg-[#EADFCA]/80 border border-[#D6B36B]/40 space-y-2 mb-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-base sm:text-lg text-[#19372F]">{storyA.title}</span>
                  <span className="text-xs font-sans text-[#8A6726] uppercase font-bold">{storyA.country}</span>
                </div>
                <div className="w-full aspect-[16/9] rounded-lg overflow-hidden border border-[#D6B36B]/30">
                  <StoryIllustration storyId={storyA.id} fitMode="contain" />
                </div>
              </div>

              {/* Concise Similarity Box */}
              <div className="p-3.5 rounded-xl bg-[#FAF5EA] border border-[#D6B36B]/50 space-y-1">
                <div className="text-xs font-sans uppercase font-bold text-[#8A6726] tracking-wider">
                  Shared Narrative Parallel
                </div>
                <p className="text-sm sm:text-base font-serif text-[#19372F] leading-relaxed">
                  {comparison.similarity}
                </p>
              </div>
            </div>

            <div className="text-xs font-sans text-[#19372F]/65 pt-3 border-t border-[#D6B36B]/30 mt-3">
              Comparative Folkloristics · HackTX 2026
            </div>
          </div>

          {/* GILDED CENTER SPINE */}
          <div className="hidden md:block w-3 bg-gradient-to-r from-black/10 via-[#D6B36B]/20 to-black/10 shrink-0 border-x border-[#C5A566]/40 pointer-events-none" />

          {/* RIGHT PAGE: Story B Details, Cultural Difference & Collect CTA */}
          <div className="relative w-full md:w-1/2 p-5 sm:p-6 md:p-7 flex flex-col justify-between bg-gradient-to-bl from-[#F5EEDA] via-[#F1E5CC] to-[#E9DDC2] overflow-y-auto md:shadow-[inset_12px_0_24px_rgba(0,0,0,0.06)]">
            <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#D6B36B] pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#D6B36B] pointer-events-none" />

            <div>
              {/* Classification Tag */}
              <div className="mb-3">
                <span className="text-xs sm:text-[13px] uppercase tracking-wider font-sans font-bold text-[#8A6726] px-2.5 py-1 rounded bg-[#E8DCBF] border border-[#D6B36B]/50 inline-block">
                  ✦ {classificationLabel(comparison)}
                </span>
              </div>

              {/* Story B Spotlight */}
              <div className="p-3.5 rounded-xl bg-[#EADFCA]/80 border border-[#D6B36B]/40 space-y-2 mb-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-base sm:text-lg text-[#19372F]">{storyB.title}</span>
                  <span className="text-xs font-sans text-[#8A6726] uppercase font-bold">{storyB.country}</span>
                </div>
                <div className="w-full aspect-[16/9] rounded-lg overflow-hidden border border-[#D6B36B]/30">
                  <StoryIllustration storyId={storyB.id} fitMode="contain" />
                </div>
              </div>

              {/* Concise Cultural Difference */}
              <div className="p-3.5 rounded-xl bg-[#FAF5EA] border border-[#D6B36B]/50 space-y-1 mb-3">
                <div className="text-xs font-sans uppercase font-bold text-[#8A6726] tracking-wider">
                  Difference
                </div>
                <p className="text-sm sm:text-base font-serif text-[#19372F] leading-relaxed">
                  {comparison.culturalDifference}
                </p>
              </div>

              {/* Scholarly Classification Note */}
              <div className="p-2.5 rounded-lg bg-[#E2D4B7]/70 text-xs sm:text-[13px] font-sans text-[#19372F]/85 leading-relaxed border border-[#D6B36B]/40">
                {comparison.scholarlyNote}
              </div>

              <div className="mt-3">
                <EvidencePanel storyA={storyA.id} storyB={storyB.id} motif={comparison.sharedMotif} />
              </div>
            </div>

            {/* Weave Golden Thread CTA */}
            <div className="pt-4 border-t border-[#D6B36B]/40 mt-4">
              <button
                onClick={handleCollect}
                className="btn btn-forest"
              >
                <Sparkles className="w-5 h-5 text-[#D6B36B]" />
                <span>{isAlreadyCollected ? 'Thread Preserved in Journal' : 'Weave Golden Thread'}</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
