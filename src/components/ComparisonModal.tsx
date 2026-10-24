import React from 'react';
import { ComparisonDetail, StoryData } from '../types';
import { MOTIFS_CATALOG } from '../data/motifs';
import { X, Sparkles, Compass, Check, Bookmark, ArrowRightLeft } from 'lucide-react';
import { playGoldenThreadResonance, playGentleClick, playParchmentRustle } from '../utils/audio';

interface ComparisonModalProps {
  comparison: ComparisonDetail;
  storyA: StoryData;
  storyB: StoryData;
  onClose: () => void;
  onThreadCollected: () => void;
  isAlreadyCollected: boolean;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1424]/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative max-w-2xl w-full p-6 md:p-8 rounded-xl parchment-card border border-[#D6B36B]/60 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D6B36B]/40">
          <div className="flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-[#19372F]/70 font-semibold">
            <span>Golden Thread Synthesis</span>
            <span aria-hidden="true">·</span>
            <span>Comparative Folkloristics</span>
          </div>

          <button
            onClick={() => {
              playGentleClick();
              onClose();
            }}
            className="p-1 rounded-md hover:bg-[#D6B36B]/30 text-[#19372F] transition-colors cursor-pointer"
            aria-label="Close comparison dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Comparison Content */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6">
          {/* Dual Story Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 text-lg md:text-xl font-serif font-bold text-[#19372F]">
              <span>{storyA.title}</span>
              <ArrowRightLeft className="w-4 h-4 text-[#A98336]" />
              <span>{storyB.title}</span>
            </div>
            <div className="text-xs font-sans text-[#19372F]/70 mt-1">
              {storyA.country} ({storyA.culturalTradition.split('(')[0].trim()}) &nbsp;✦&nbsp;{' '}
              {storyB.country} ({storyB.culturalTradition.split('(')[0].trim()})
            </div>
          </div>

          {/* Shared Motif Box */}
          <div className="p-4 rounded-lg bg-[#EAE0C7]/60 border border-[#D6B36B]/40">
            <div className="text-xs font-sans uppercase tracking-widest text-[#A98336] font-semibold mb-1">
              Shared Narrative Motif
            </div>
            <div className="font-serif font-bold text-lg text-[#19372F]">
              {motif.name}
            </div>
            <div className="text-xs font-sans text-[#19372F]/80 mt-1 leading-relaxed">
              {motif.storySignificance}
            </div>
          </div>

          {/* Side-by-Side Manifestation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-[#FAF5EA] border border-[#D6B36B]/30">
              <div className="text-xs font-serif font-bold text-[#19372F] mb-1.5 flex items-center justify-between">
                <span>In {storyA.title}</span>
                <span className="text-[11px] font-sans font-normal text-[#19372F]/60">{storyA.country}</span>
              </div>
              <p className="text-xs font-sans text-[#19372F]/85 leading-relaxed">
                {comparison.appearanceInA}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#FAF5EA] border border-[#D6B36B]/30">
              <div className="text-xs font-serif font-bold text-[#19372F] mb-1.5 flex items-center justify-between">
                <span>In {storyB.title}</span>
                <span className="text-[11px] font-sans font-normal text-[#19372F]/60">{storyB.country}</span>
              </div>
              <p className="text-xs font-sans text-[#19372F]/85 leading-relaxed">
                {comparison.appearanceInB}
              </p>
            </div>
          </div>

          {/* Cultural Distinction Section */}
          <div className="p-4 rounded-lg bg-[#E2D4B7]/60 border border-[#D6B36B]/50 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#A98336]" />
              <span className="text-xs font-sans font-bold uppercase tracking-wider text-[#19372F]">
                Crucial Cultural & Narrative Difference
              </span>
            </div>
            <p className="text-xs font-sans text-[#19372F]/90 leading-relaxed">
              {comparison.culturalDifference}
            </p>
          </div>

          {/* Connection Classification Banner */}
          <div
            className={`p-4 rounded-lg border text-xs font-sans leading-relaxed ${
              comparison.classification === 'cinderella-parallel'
                ? 'bg-[#19372F]/10 border-[#19372F]/30 text-[#19372F]'
                : 'bg-amber-100/70 border-amber-400/50 text-[#19372F]'
            }`}
          >
            <div className="font-serif font-bold text-sm mb-1 flex items-center gap-2">
              <span>
                Classification:{' '}
                {comparison.classification === 'cinderella-parallel'
                  ? 'Cinderella-Type Parallel (ATU 510A Cycle)'
                  : 'Broader Thematic Parallel (Literary Token Recognition)'}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#19372F]/85">
              {comparison.scholarlyNote}
            </p>
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-4 border-t border-[#D6B36B]/40 flex items-center justify-between gap-4">
          <div className="text-xs font-sans text-[#19372F]/70">
            {isAlreadyCollected
              ? '✦ Thread already woven into your Storykeeper’s Journal.'
              : '✦ Connect these stories to preserve the Golden Thread.'}
          </div>

          <button
            onClick={handleCollect}
            className="px-6 py-2.5 rounded-lg bg-[#19372F] hover:bg-[#234A3F] text-[#FFF7E8] font-serif font-semibold text-sm tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-4 h-4 text-[#D6B36B]" />
            <span>{isAlreadyCollected ? 'Close Comparison' : 'Weave Golden Thread'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
