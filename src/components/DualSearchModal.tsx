import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { StoryId } from '../types';
import { STORIES } from '../data/stories';
import { Search, Globe, BookOpen, Compass, X, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';
import { playGentleClick } from '../utils/audio';
import { MOTIFS_CATALOG } from '../data/motifs';
import { searchLibrary } from '../api/client';
import type { LibraryHit } from '../types/catalog';
import { MythCard } from './MythCard';

interface DualSearchModalProps {
  onClose: () => void;
  onFocusPlayableStory: (storyId: StoryId) => void;
}

export const DualSearchModal: React.FC<DualSearchModalProps> = ({
  onClose,
  onFocusPlayableStory
}) => {
  const [activeTab, setActiveTab] = useState<'playable' | 'archive'>('playable');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlayable = STORIES.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.title.toLowerCase().includes(q) ||
      s.country.toLowerCase().includes(q) ||
      s.culturalTradition.toLowerCase().includes(q) ||
      s.summary.toLowerCase().includes(q) ||
      s.motifs.some((m) => m.toLowerCase().includes(q))
    );
  });

  // Library tales (metadata only) come from the backend's search; nothing is hardcoded here.
  const [libraryHits, setLibraryHits] = useState<LibraryHit[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryDown, setLibraryDown] = useState(false);

  useEffect(() => {
    // The library is searched from either tab, so a library tale is found wherever the player is typing
    if (!searchQuery.trim()) {
      setLibraryHits([]);
      setLibraryLoading(false);
      setLibraryDown(false);
      return;
    }
    let cancelled = false;
    setLibraryLoading(true);
    const timer = setTimeout(() => {
      searchLibrary(searchQuery).then((hits) => {
        if (!cancelled) {
          setLibraryDown(hits === null);
          setLibraryHits(hits ?? []);
          setLibraryLoading(false);
        }
      });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // The tale whose card is open (curated story or library tale)
  type OpenCard = { id: string; title: string; playable: boolean };
  // Cards opened from inside a card stack up, so Back returns to the previous tale
  const [cardTrail, setCardTrail] = useState<OpenCard[]>([]);
  const openCard = cardTrail[cardTrail.length - 1] ?? null;

  const handleSelectPlayable = (storyId: StoryId) => {
    playGentleClick();
    onFocusPlayableStory(storyId);
    onClose();
  };

  const renderLibraryRow = ({ tale }: LibraryHit) => (
    <div
      key={tale.id}
      onClick={() => {
        playGentleClick();
        setCardTrail([{ id: tale.id, title: tale.title, playable: false }]);
      }}
      className="p-3.5 rounded-xl bg-[#142033]/70 hover:bg-[#1A2A42] border border-[#D6B36B]/25 hover:border-[#D6B36B] transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-serif font-bold text-sm sm:text-base text-[#FFF7E8]">{tale.title}</h4>
        <span className="text-[10px] font-sans text-[#D6B36B] shrink-0">{tale.provenance ?? 'Place not given'}</span>
      </div>
      <p className="text-xs font-serif text-[#F1E5CC]/85 mt-1.5 leading-relaxed">
        Tale type ATU {tale.atuType}
        {tale.atuName ? ` (${tale.atuName})` : ''} in Ashliman’s Folktexts.
      </p>
      {tale.motifs.length > 0 && (
        <div className="mt-2 pt-2 border-t border-[#D6B36B]/20 text-[11px] font-sans text-[#D6B36B] italic">
          ✦ Linked through its tale type to: {tale.motifs.map((m) => MOTIFS_CATALOG[m as keyof typeof MOTIFS_CATALOG]?.name ?? m).join(' · ')}
        </div>
      )}
    </div>
  );

  const libraryStatus = libraryLoading ? (
    <div className="text-center py-6 text-xs font-serif text-[#F1E5CC]/60">Searching the library…</div>
  ) : libraryDown ? (
    <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/40 text-xs font-sans text-red-200 leading-relaxed">
      The folktale library is searched by the backend, which is not reachable. Start it with <strong>npm run dev:all</strong>{' '}
      (or <strong>npm run backend</strong>, which listens on port 8000) and try again. If it is already running, check its
      terminal for an error.
    </div>
  ) : libraryHits.length === 0 ? (
    <div className="text-center py-6 text-xs font-serif text-[#F1E5CC]/60">No matching library tale found.</div>
  ) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md pointer-events-auto select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        className={`relative w-full max-w-[700px] rounded-2xl bg-[#0E1726] border-2 border-[#D6B36B] p-5 sm:p-7 text-[#F1E5CC] shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col max-h-[85vh] overflow-hidden ${openCard ? 'h-[85vh]' : ''}`}
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Top Header & Close */}
        <div className="flex items-center justify-between pb-3 border-b border-[#D6B36B]/30 mb-3">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-[#D6B36B]" />
            <h3 className="font-serif font-bold text-lg text-[#FFF7E8]">
              Storyteller’s Discovery Search
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#D6B36B]/70 hover:text-[#FFF7E8] hover:bg-[#D6B36B]/20 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder={
              activeTab === 'playable'
                ? 'Search 15 atlas fairytales by title, country, or motif...'
                : 'Search the folktale library by title, place, or tale type...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0B1424] border border-[#D6B36B]/60 text-xs sm:text-sm font-sans text-[#FFF7E8] placeholder:text-[#F1E5CC]/50 focus:outline-none focus:border-[#D6B36B]"
            autoFocus
          />
          <Search className="w-4 h-4 text-[#D6B36B]/70 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Tab Toggle: Playable Stories vs Explore More Archive */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => {
              playGentleClick();
              setActiveTab('playable');
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'playable'
                ? 'bg-[#D6B36B] text-[#0B1424] font-bold shadow-[0_0_15px_rgba(214,179,107,0.3)]'
                : 'bg-[#142033] text-[#F1E5CC]/80 hover:bg-[#1A2A42]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Playable Stories (15 in Atlas)</span>
          </button>

          <button
            onClick={() => {
              playGentleClick();
              setActiveTab('archive');
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'archive'
                ? 'bg-[#D6B36B] text-[#0B1424] font-bold shadow-[0_0_15px_rgba(214,179,107,0.3)]'
                : 'bg-[#142033] text-[#F1E5CC]/80 hover:bg-[#1A2A42]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Explore More (Folktale Library)</span>
          </button>
        </div>

        {/* Tab Content List */}
        <div className="relative flex-1 min-h-0 flex flex-col">
        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          {activeTab === 'playable' ? (
            <>
            {/* TAB 1: 15 PLAYABLE STORIES */}
            {filteredPlayable.length > 0 ? (
              filteredPlayable.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    playGentleClick();
                    setCardTrail([{ id: s.id, title: s.title, playable: true }]);
                  }}
                  className="p-3 rounded-xl bg-[#142033]/80 hover:bg-[#1A2A42] border border-[#D6B36B]/30 hover:border-[#D6B36B] transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-bold text-sm sm:text-base text-[#FFF7E8] group-hover:text-[#D6B36B] transition-colors truncate">
                        {s.title}
                      </h4>
                      <span className="text-[10px] uppercase font-sans font-semibold px-2 py-0.5 rounded bg-[#D6B36B]/20 text-[#D6B36B] border border-[#D6B36B]/40 shrink-0">
                        {s.country}
                      </span>
                    </div>
                    <p className="text-[11px] font-sans text-[#F1E5CC]/75 line-clamp-1 mt-1">
                      {s.summary}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#D6B36B]/80 font-serif">
                      <span>Motifs:</span>
                      <span className="truncate">{s.motifs.join(' · ')}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1 text-xs font-sans text-[#D6B36B] font-medium group-hover:translate-x-1 transition-transform">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Open card</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs font-serif text-[#F1E5CC]/60">
                No matching story in the 15-story atlas.
              </div>
            )}

            {searchQuery.trim() && (
              <div className="pt-1">
                <div className="text-[11px] uppercase tracking-wider font-sans font-semibold text-[#D6B36B] mb-2">
                  From the folktale library
                </div>
                <div className="space-y-2">
                  {libraryHits.slice(0, 5).map(renderLibraryRow)}
                  {libraryStatus}
                  {libraryHits.length > 5 && (
                    <button
                      onClick={() => setActiveTab('archive')}
                      className="text-xs font-sans font-semibold text-[#D6B36B] hover:text-[#FFF7E8] underline underline-offset-4 cursor-pointer"
                    >
                      See all {libraryHits.length} library matches
                    </button>
                  )}
                </div>
              </div>
            )}
            </>
          ) : (
            /* TAB 2: SCHOLARLY ARCHIVE (EXPLORE ONLY) */
            <>
              <div className="p-2.5 rounded-lg bg-[#D6B36B]/15 border border-[#D6B36B]/40 text-[11px] font-sans text-[#F1E5CC] flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#D6B36B] shrink-0" />
                <span>
                  <strong>Folktale Library (Explore Only):</strong> About 1,500 tales from Ashliman’s Folktexts, listed by
                  title, place and tale type. They hold no tale text and never appear on the globe. Motif links come from the
                  tale type, not from the tale itself.
                </span>
              </div>

              {!searchQuery.trim() ? (
                <div className="text-center py-8 text-xs font-serif text-[#F1E5CC]/60">
                  Type a title, a place or a tale type, for example “Grimm” or “510A”.
                </div>
              ) : libraryHits.length > 0 ? (
                libraryHits.map(renderLibraryRow)
              ) : (
                libraryStatus
              )}
            </>
          )}
        </div>

        {openCard && (
          <MythCard
            key={openCard.id}
            taleId={openCard.id}
            title={openCard.title}
            backLabel={cardTrail.length > 1 ? 'Back' : 'Back to results'}
            onBack={() => setCardTrail((t) => t.slice(0, -1))}
            onOpenTale={(t) => {
              playGentleClick();
              setCardTrail((trail) => [...trail, { id: t.id, title: t.title, playable: STORIES.some((s) => s.id === t.id) }]);
            }}
            onFocusOnGlobe={openCard.playable ? () => handleSelectPlayable(openCard.id as StoryId) : undefined}
          />
        )}
        </div>

        {/* Footer Note */}
        <div className="pt-3 border-t border-[#D6B36B]/30 mt-2 flex items-center justify-between text-[11px] text-[#D6B36B]/80 font-serif">
          <span>
            {activeTab === 'playable'
              ? 'Select a story to open its card, then focus it on the globe.'
              : 'Select a tale to open its card. Library tales are metadata only and never appear on the globe.'}
          </span>
        </div>
      </motion.div>
    </div>
  );
};
