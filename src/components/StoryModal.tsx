import React, { useState } from 'react';
import { StoryData, MotifId } from '../types';
import { MotifGuesser } from './MotifGuesser';
import { X, BookOpen, Scroll, BookmarkCheck, ArrowRight, Compass } from 'lucide-react';
import { playGentleClick, playParchmentRustle } from '../utils/audio';

interface StoryModalProps {
  story: StoryData;
  onClose: () => void;
  onMotifSolved: (motif: MotifId, relatedStories: StoryData[]) => void;
  activeMotif: MotifId | null;
  highlightedStoryCount: number;
  onViewGlobeHighlights: () => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({
  story,
  onClose,
  onMotifSolved,
  activeMotif,
  highlightedStoryCount,
  onViewGlobeHighlights
}) => {
  const [activeTab, setActiveTab] = useState<'retelling' | 'sources' | 'elements'>('retelling');

  const handleClose = () => {
    playParchmentRustle();
    playGentleClick();
    onClose();
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-xl flex flex-col parchment-card shadow-2xl border-l border-[#D6B36B]/60 animate-in slide-in-from-right duration-300 overflow-hidden">
      {/* Antique Header Banner */}
      <div className="p-6 pb-4 border-b border-[#D6B36B]/40 bg-[#E8DCBF]/50">
        <div className="flex items-center justify-between gap-4 mb-2">
          {/* Metadata: Unboxed text with · separators */}
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-sans font-semibold text-[#19372F]/70">
            <span>{story.country}</span>
            <span aria-hidden="true">·</span>
            <span>{story.narrativeTraditionType}</span>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-md hover:bg-[#D6B36B]/30 text-[#19372F] transition-colors cursor-pointer"
            aria-label="Close story panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#19372F] leading-tight">
          {story.title}
        </h2>
        <div className="text-xs font-serif italic text-[#19372F]/80 mt-0.5">
          {story.originalOrAlternateTitle}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] font-sans text-[#19372F]/75">
          {story.earliestRecordedDate && <span>Earliest record: {story.earliestRecordedDate} (not the origin)</span>}
        </div>

        {/* Tab Navigation Controls (Interactive Filter Segmented Buttons) */}
        <div className="flex items-center gap-1 mt-4 p-1 bg-[#DBCBB0]/60 rounded-lg">
          <button
            onClick={() => {
              playGentleClick();
              setActiveTab('retelling');
            }}
            className={`flex-1 py-1 px-3 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'retelling'
                ? 'bg-[#F1E5CC] text-[#19372F] shadow-xs font-semibold'
                : 'text-[#19372F]/70 hover:text-[#19372F]'
            }`}
          >
            Retelling
          </button>
          <button
            onClick={() => {
              playGentleClick();
              setActiveTab('elements');
            }}
            className={`flex-1 py-1 px-3 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'elements'
                ? 'bg-[#F1E5CC] text-[#19372F] shadow-xs font-semibold'
                : 'text-[#19372F]/70 hover:text-[#19372F]'
            }`}
          >
            Key Elements
          </button>
          <button
            onClick={() => {
              playGentleClick();
              setActiveTab('sources');
            }}
            className={`flex-1 py-1 px-3 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'sources'
                ? 'bg-[#F1E5CC] text-[#19372F] shadow-xs font-semibold'
                : 'text-[#19372F]/70 hover:text-[#19372F]'
            }`}
          >
            Historical Source
          </button>
        </div>
      </div>

      {/* Scrollable Story Content */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {/* Retelling Tab */}
        {activeTab === 'retelling' && (
          <div className="space-y-4">
            {/* Story Quote if present */}
            {story.quote && (
              <blockquote className="p-3 bg-[#EADBBD]/40 border-y border-[#D6B36B]/30 font-serif italic text-sm text-[#19372F]/85 text-center">
                “{story.quote}”
              </blockquote>
            )}

            {/* Retelling Paragraphs */}
            <div className="text-sm md:text-[15px] font-sans leading-relaxed text-[#19372F]/90 space-y-3.5">
              {story.fullRetelling.map((para, i) => (
                <p
                  key={i}
                  className={
                    i === 0
                      ? 'first-letter:text-4xl first-letter:font-serif first-letter:font-bold first-letter:text-[#A98336] first-letter:float-left first-letter:mr-2.5 first-letter:leading-none'
                      : ''
                  }
                >
                  {para}
                </p>
              ))}
            </div>

            {/* Distinctive Feature Banner */}
            <div className="p-3.5 rounded-lg bg-[#E2D4B7]/60 border border-[#D6B36B]/40 text-xs font-sans text-[#19372F]/85">
              <span className="font-semibold text-[#19372F] block mb-1">About this record:</span>
              {story.distinctiveFeatures}
              {story.sensitivity && <p className="mt-2 italic text-[#19372F]/75">{story.sensitivity}</p>}
            </div>

            {/* The Motif Guesser Challenge */}
            <MotifGuesser
              story={story}
              alreadySolvedMotif={activeMotif}
              onCorrectGuess={onMotifSolved}
            />
          </div>
        )}

        {/* Key Elements Tab */}
        {activeTab === 'elements' && (
          <div className="space-y-4">
            <h4 className="text-sm font-serif font-bold text-[#19372F] uppercase tracking-wider">
              Defining Narrative Elements
            </h4>
            <div className="space-y-2.5">
              {story.keyElements.map((el, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-3 rounded-lg bg-[#F9F3E6] border border-[#D6B36B]/30 text-xs md:text-sm text-[#19372F]"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#A98336] mt-2 shrink-0" />
                  <span>{el}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg bg-[#E2D4B7]/50 border border-[#D6B36B]/40">
              <h5 className="font-serif font-bold text-sm text-[#19372F] mb-1">
                Folkloric Classification
              </h5>
              <p className="text-xs font-sans text-[#19372F]/80 leading-relaxed">
                {story.culturalTradition}
              </p>
            </div>
          </div>
        )}

        {/* Historical Source Tab */}
        {activeTab === 'sources' && (
          <div className="space-y-4">
            <h4 className="text-sm font-serif font-bold text-[#19372F] uppercase tracking-wider">
              Primary Historical Attribution
            </h4>
            {story.sources.map((src, i) => (
              <div key={i} className="p-4 rounded-lg bg-[#F9F3E6] border border-[#D6B36B]/40 space-y-2">
                <div className="font-serif font-bold text-base text-[#19372F]">
                  {src.url ? (
                    <a href={src.url} target="_blank" rel="noopener noreferrer" className="underline decoration-[#D6B36B]/60 hover:text-[#8A6726]">
                      {src.title}
                    </a>
                  ) : (
                    src.title
                  )}
                </div>
                <div className="text-xs font-sans text-[#19372F]/75 space-y-1">
                  <div>
                    <span className="font-medium text-[#19372F]">Attribution:</span> {src.authorOrAttribution}
                  </div>
                  <div>
                    <span className="font-medium text-[#19372F]">Date / Era:</span> {src.dateOrEra}
                  </div>
                </div>
                <p className="text-xs font-sans text-[#19372F]/85 leading-relaxed pt-2 border-t border-[#D6B36B]/20">
                  {src.context}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Banner when connections are illuminated */}
      {highlightedStoryCount > 0 && (
        <div className="p-4 border-t border-[#D6B36B]/40 bg-[#E8DCBF] flex items-center justify-between gap-3">
          <div className="text-xs font-sans text-[#19372F]">
            <span className="font-bold text-[#19372F] block">
              ✦ {highlightedStoryCount} {highlightedStoryCount === 1 ? 'Location' : 'Locations'} Illuminated
            </span>
            <span>Click glowing markers on the globe to inspect.</span>
          </div>
          <button
            onClick={() => {
              playGentleClick();
              onViewGlobeHighlights();
            }}
            className="px-4 py-2 rounded-lg bg-[#19372F] hover:bg-[#234A3F] text-[#FFF7E8] font-serif font-medium text-xs tracking-wider transition-all shadow-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Compass className="w-3.5 h-3.5 text-[#D6B36B]" />
            <span>Inspect Globe</span>
          </button>
        </div>
      )}
    </div>
  );
};
