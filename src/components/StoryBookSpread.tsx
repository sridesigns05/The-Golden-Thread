import React, { useState } from 'react';
import { motion } from 'motion/react';
import { StoryData, MotifId, StoryId } from '../types';
import { STORIES } from '../data/stories';
import { MOTIFS_CATALOG } from '../data/motifs';
import { StoryIllustration } from './StoryIllustrations';
import { X, ChevronLeft, ChevronRight, Sparkles, Check, ChevronDown, ChevronUp, Compass } from 'lucide-react';
import { playGentleClick, playParchmentRustle, playGoldenThreadResonance } from '../utils/audio';

interface StoryBookSpreadProps {
  story: StoryData;
  onClose: () => void;
  onSelectStory?: (id: StoryId) => void;
  onSelectMotifLens: (motif: MotifId) => void;
  activeMotif: MotifId | null;
  onMinimizeToGlobe: () => void;
}

interface MotifChipInfo {
  id: MotifId;
  title: string;
  subtitle: string;
  glyph: string;
}

// Glyphs associated with motifs for antique manuscript styling
const MOTIF_GLYPHS: Record<MotifId, string> = {
  'unjust-treatment': '◈',
  'supernatural-assistance': '✦',
  'lost-object-recognition': '❖',
  'transformation': '✧',
  'reversal-of-fortune': '⚖',
  'separation-and-reunion': '⚭',
  'memory-and-forgetting': '⏳',
  'love-and-duty': '⚔'
};

function getChipsForStory(story: StoryData): MotifChipInfo[] {
  return story.motifs.slice(0, 3).map((mId) => {
    const meta = MOTIFS_CATALOG[mId];
    const manifestation = story.motifManifestations[mId] || meta?.shortDescription || '';
    const shortSubtitle =
      manifestation.split('. ')[0]?.slice(0, 52).trim() || meta?.shortDescription || 'Narrative thread';

    return {
      id: mId,
      title: meta?.name.split('&')[0].trim() || mId,
      subtitle: shortSubtitle,
      glyph: MOTIF_GLYPHS[mId] || '✦'
    };
  });
}

export const StoryBookSpread: React.FC<StoryBookSpreadProps> = ({
  story,
  onClose,
  onSelectStory,
  onSelectMotifLens,
  activeMotif,
  onMinimizeToGlobe
}) => {
  const [selectedLens, setSelectedLens] = useState<MotifId | null>(activeMotif);
  const [showFullManuscript, setShowFullManuscript] = useState(false);
  const [discoveredTokenText, setDiscoveredTokenText] = useState<string | null>(null);

  const currentIndex = STORIES.findIndex((s) => s.id === story.id);
  const prevStory = STORIES[(currentIndex - 1 + STORIES.length) % STORIES.length];
  const nextStory = STORIES[(currentIndex + 1) % STORIES.length];

  const motifChips = getChipsForStory(story);

  const handleSelectMotif = (motifId: MotifId) => {
    playGoldenThreadResonance();
    setSelectedLens(motifId);
    onSelectMotifLens(motifId);

    // Minimize storybook smoothly to reveal illuminated locations on the globe
    setTimeout(() => {
      onMinimizeToGlobe();
    }, 450);
  };

  const handleFlipPage = (targetStory: StoryData) => {
    playParchmentRustle();
    if (onSelectStory) {
      onSelectStory(targetStory.id);
    }
  };

  const isShakuntala = story.id === 'shakuntala';

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/75 backdrop-blur-md pointer-events-auto select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        className="relative w-full max-w-[min(1100px,92vw)] max-h-[88dvh] rounded-2xl bg-[#23140C] border-2 border-[#D6B36B]/80 shadow-[0_25px_80px_rgba(0,0,0,0.95)] p-2 sm:p-3 md:p-4 flex flex-col justify-between overflow-hidden"
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Leather grain backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#301A10] via-[#201109] to-[#140A05] opacity-95 pointer-events-none" />

        {/* Realistic Two-Page Parchment Spread */}
        <div className="relative w-full h-full rounded-xl bg-[#F4ECD8] flex flex-col md:flex-row overflow-y-auto md:overflow-hidden shadow-inner border border-[#C5A566]">
          {/* Subtle Page Curvature and Depth Gradients */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10 pointer-events-none" />

          {/* ================= LEFT PAGE: 50% Large Illustrated Scene ================= */}
          <div className="relative w-full md:w-1/2 p-5 sm:p-6 md:p-7 flex flex-col justify-between border-b md:border-b-0 md:border-r-2 border-[#D6B36B]/40 bg-gradient-to-br from-[#F6EFDC] via-[#F2E7D0] to-[#EBDDC3] shrink-0 md:shrink md:shadow-[inset_-12px_0_24px_rgba(0,0,0,0.06)]">
            {/* Header: Title, Origin, and Classification */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs sm:text-[14px] uppercase tracking-[0.25em] font-sans font-bold text-[#8A6726]">
                  {story.country} · {story.culturalTradition.split('(')[0].trim()}
                </span>
                <span className="text-xs font-serif italic text-[#8A6726] md:hidden">
                  Folio {currentIndex + 1} of {STORIES.length}
                </span>
              </div>
              {/* Story Title: 36–44px on desktop */}
              <h2 className="text-2xl sm:text-3xl md:text-[38px] font-serif font-bold text-[#19372F] leading-tight">
                {story.title}
              </h2>

              {/* Shakuntala Distinction Banner: Broader thematic parallel */}
              {isShakuntala && (
                <div className="mt-2 px-3 py-1.5 rounded bg-[#E8DCBF] border border-[#D6B36B]/60 text-xs sm:text-[13px] font-sans text-[#7A571B] font-semibold flex items-center gap-1.5">
                  <span className="text-[#A98336] font-bold">✦</span>
                  <span>Broader Thematic Parallel · Classical Sanskrit Drama (Not a Cinderella variant)</span>
                </div>
              )}
            </div>

            {/* Prominent Illustrated Scene with object-fit: contain to prevent clipping */}
            <div className="relative flex-1 min-h-[240px] max-h-[70%] my-auto py-2">
              <StoryIllustration
                storyId={story.id}
                fitMode="contain"
                onObjectDiscovered={(name, lore) => {
                  setDiscoveredTokenText(`${name}: ${lore}`);
                }}
              />
            </div>

            {/* Discovered clue / caption */}
            <div className="text-xs sm:text-[14px] font-sans text-[#19372F]/80 italic truncate mt-1">
              {discoveredTokenText ? (
                <span className="text-[#8A6726] font-semibold not-italic">{discoveredTokenText}</span>
              ) : (
                story.originalOrAlternateTitle && (
                  <span className="opacity-85">Original Title: {story.originalOrAlternateTitle}</span>
                )
              )}
            </div>
          </div>

          {/* ================= GILDED CENTER SPINE (Desktop only) ================= */}
          <div className="hidden md:block w-3 bg-gradient-to-r from-black/10 via-[#D6B36B]/20 to-black/10 shrink-0 border-x border-[#C5A566]/40 pointer-events-none" />

          {/* ================= RIGHT PAGE: Narrative & The Motif Lens ================= */}
          <div className="relative w-full md:w-1/2 p-5 sm:p-6 md:p-7 flex flex-col justify-between bg-gradient-to-bl from-[#F6EFDC] via-[#F4ECD8] to-[#EDE0C8] overflow-y-auto md:shadow-[inset_12px_0_24px_rgba(0,0,0,0.06)]">
            {/* Top Close & Page Count */}
            <div className="flex items-center justify-between pb-2 border-b border-[#D6B36B]/30 mb-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-[#8A6726] font-serif">
                <span className="font-bold">Folio {currentIndex + 1}</span>
                <span>of {STORIES.length} in Atlas</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-[#8A6726] hover:text-[#19372F] hover:bg-[#D6B36B]/20 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#8A6726]"
                title="Close Storybook"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Story Text: Short Retelling with Drop Cap (18-20px font, line-height 1.6) */}
            <div className="flex-1 pr-1 overflow-y-auto">
              <div className="text-base sm:text-lg md:text-[19px] font-serif text-[#19372F] leading-[1.62] text-justify">
                <span className="float-left text-4xl sm:text-5xl leading-none font-bold text-[#8A6726] pr-2.5 font-serif">
                  {story.shortRetelling.charAt(0)}
                </span>
                {story.shortRetelling.slice(1)}
              </div>

              {/* Expandable Full Folklore Narrative */}
              <div className="mt-4">
                <button
                  onClick={() => setShowFullManuscript(!showFullManuscript)}
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-sans font-bold text-[#8A6726] hover:text-[#19372F] transition-all cursor-pointer"
                >
                  <span>{showFullManuscript ? 'Fold Full Manuscript' : 'Read Full Folklore Narrative'}</span>
                  {showFullManuscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showFullManuscript && (
                  <div className="mt-3 p-3.5 rounded-xl bg-[#EAE0C8]/70 border border-[#D6B36B]/40 text-xs sm:text-sm font-serif text-[#19372F]/90 space-y-2.5 leading-relaxed">
                    {story.fullRetelling.map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                    {story.quote && (
                      <blockquote className="italic border-l-2 border-[#8A6726] pl-3 text-[#7A571B] mt-2 font-serif text-xs sm:text-sm">
                        “{story.quote}”
                      </blockquote>
                    )}
                  </div>
                )}
              </div>

              {/* ================= SECTION: THE MOTIF LENS ================= */}
              <div className="mt-5 pt-4 border-t-2 border-[#D6B36B]/40">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    {/* Section Heading: 24–28px on desktop */}
                    <h3 className="text-lg sm:text-xl md:text-[24px] font-serif font-bold text-[#19372F] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#8A6726]" />
                      <span>THE MOTIF LENS</span>
                    </h3>
                    <p className="text-xs sm:text-sm font-serif italic text-[#8A6726] mt-0.5">
                      Choose a thread to follow.
                    </p>
                  </div>
                </div>

                {/* 3 Selectable Motif Chips */}
                <div className="space-y-2 mt-2.5">
                  {motifChips.map((chip) => {
                    const isSelected = selectedLens === chip.id;
                    return (
                      <button
                        key={chip.id}
                        onClick={() => handleSelectMotif(chip.id)}
                        className={`w-full text-left p-2.5 sm:p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between group focus-visible:ring-2 focus-visible:ring-[#8A6726] ${
                          isSelected
                            ? 'bg-[#E3C67C] border-[#8A6726] shadow-[0_3px_12px_rgba(138,103,38,0.3)] text-[#19372F]'
                            : 'bg-[#F2E7CF] hover:bg-[#EBDDC3] border-[#D6B36B]/60 text-[#19372F]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`text-sm ${isSelected ? 'text-[#8A6726]' : 'text-[#8A6726]/70'}`}>
                            {chip.glyph}
                          </span>
                          <div>
                            <div className="text-sm sm:text-base font-serif font-bold leading-tight flex items-center gap-1.5">
                              <span>{chip.title}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#8A6726]" />}
                            </div>
                            <div className="text-xs sm:text-[13px] font-sans text-[#19372F]/80 leading-tight truncate max-w-[280px] sm:max-w-[340px] mt-0.5">
                              {chip.subtitle}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm font-sans font-semibold text-[#8A6726] group-hover:translate-x-1 transition-transform flex items-center gap-1 shrink-0 ml-2">
                          Weave Thread →
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Book Navigation & Folio Pagination */}
            <div className="mt-4 pt-3 border-t border-[#D6B36B]/30 flex items-center justify-between text-xs sm:text-sm text-[#8A6726]">
              <button
                onClick={() => handleFlipPage(prevStory)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded hover:bg-[#D6B36B]/20 transition-all font-serif font-semibold cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{prevStory.title}</span>
                <span className="sm:hidden">Prev</span>
              </button>

              <button
                onClick={onMinimizeToGlobe}
                className="px-3.5 py-1.5 rounded-full bg-[#19372F] text-[#F1E5CC] hover:bg-[#22483D] transition-all text-xs sm:text-sm font-sans font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Compass className="w-3.5 h-3.5 text-[#D6B36B]" />
                <span>View on Globe</span>
              </button>

              <button
                onClick={() => handleFlipPage(nextStory)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded hover:bg-[#D6B36B]/20 transition-all font-serif font-semibold cursor-pointer"
              >
                <span className="hidden sm:inline">{nextStory.title}</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
