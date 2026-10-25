import React, { useState } from 'react';
import { motion } from 'motion/react';
import { StoryId } from '../types';
import { STORIES } from '../data/stories';
import { Search, Globe, BookOpen, Compass, X, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';
import { playGentleClick } from '../utils/audio';

interface DualSearchModalProps {
  onClose: () => void;
  onFocusPlayableStory: (storyId: StoryId) => void;
}

interface ExternalFolkloreEntry {
  title: string;
  culture: string;
  region: string;
  motifs: string[];
  summary: string;
  parallelWithPlayable: string;
}

const EXTERNAL_FOLKLORE_ARCHIVE: ExternalFolkloreEntry[] = [
  {
    title: 'The Epic of Gilgamesh',
    culture: 'Ancient Mesopotamian (Sumerian / Akkadian)',
    region: 'Middle East',
    motifs: ['Separation & Grief', 'Plant of Immortality', 'Serpent Theft'],
    summary: 'King Gilgamesh of Uruk seeks eternal life following the death of Enkidu, finding a prickly plant of youth beneath deep waters, only for a snake to shed its skin and steal it away.',
    parallelWithPlayable: 'Parallels the water loss and memory themes in Urashima Taro and Shakuntala.'
  },
  {
    title: 'Sun Wukong (The Monkey King)',
    culture: 'Journey to the West (Ming Dynasty China)',
    region: 'East Asia',
    motifs: ['Trickster Hero', 'Magical Transformation', 'Underworld Rebellion'],
    summary: 'Born from a cosmic celestial stone egg, Sun Wukong masters 72 earthbound transformations and somersault cloud travel, defying heaven and the underworld.',
    parallelWithPlayable: 'Parallels the animal trickster intelligence in Anansi and Popol Vuh Twins.'
  },
  {
    title: 'The Legend of the Selkie (Seal Maiden)',
    culture: 'Celtic / Scottish & Irish Coastal Folklore',
    region: 'North Atlantic',
    motifs: ['Animal Spouse', 'Stolen Seal Skin Token', 'Separation & Ocean Longing'],
    summary: 'A mortal fisherman hides a sea maiden’s discarded sealskin, compelling her into human marriage until her children discover the hidden pelt in the hearth.',
    parallelWithPlayable: 'Echoes the animal-spouse and sea-transformation archetypes of The Golden Crab and Sedna.'
  },
  {
    title: 'Hua Mulan (Ballad of Mulan)',
    culture: 'Northern Wei Dynasty Folk Poem (Yuefu)',
    region: 'East Asia',
    motifs: ['Disguise of Gender', 'Filial Piety', 'Recognition by Comrades'],
    summary: 'A maiden takes her ailing father’s place in the imperial army for twelve years, recognized as a woman only when returning home to put on her lavender rouge and combs.',
    parallelWithPlayable: 'Shares the love and duty (filial devotion) and transformation motifs of Shakuntala and Momotaro.'
  },
  {
    title: 'Finn MacCool and the Salmon of Knowledge',
    culture: 'Ancient Gaelic / Fenian Cycle (Ireland)',
    region: 'Western Europe',
    motifs: ['Supernatural Wisdom', 'Accidental Consumption', 'Heroic Ordeal'],
    summary: 'While cooking the fabled Salmon of Knowledge for the poet Finnegas, young Demne burns his thumb on the hot fish skin, sucking his finger and receiving all wisdom of past and future.',
    parallelWithPlayable: 'Complements the aquatic wisdom and animal assistance motifs of Ye Xian and Kongjwi.'
  },
  {
    title: 'Maui and the Great Fish of Polynesia',
    culture: 'Maori / Polynesian Oral Tradition',
    region: 'Oceania',
    motifs: ['Trickster Demigod', 'Magic Fishhook Token', 'Cosmic Land Creation'],
    summary: 'Using a magic hook carved from his grandmother’s jawbone, clever Maui casts his flax line into the deep sea, hauling up the colossal fish that becomes the North Island of Aotearoa.',
    parallelWithPlayable: 'Mirrors the cosmic aquatic creation and magical bone relic in Ye Xian and Sedna.'
  }
];

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

  const filteredArchive = EXTERNAL_FOLKLORE_ARCHIVE.filter((e) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      e.title.toLowerCase().includes(q) ||
      e.culture.toLowerCase().includes(q) ||
      e.region.toLowerCase().includes(q) ||
      e.summary.toLowerCase().includes(q) ||
      e.motifs.some((m) => m.toLowerCase().includes(q))
    );
  });

  const handleSelectPlayable = (storyId: StoryId) => {
    playGentleClick();
    onFocusPlayableStory(storyId);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md pointer-events-auto select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        className="relative w-full max-w-[700px] rounded-2xl bg-[#0E1726] border-2 border-[#D6B36B] p-5 sm:p-7 text-[#F1E5CC] shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col max-h-[85vh] overflow-hidden"
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
                : 'Search global folklore archive by myth, region, or motif...'
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
            <span>Explore More (Scholarly Archive)</span>
          </button>
        </div>

        {/* Tab Content List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          {activeTab === 'playable' ? (
            /* TAB 1: 15 PLAYABLE STORIES */
            filteredPlayable.length > 0 ? (
              filteredPlayable.map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleSelectPlayable(s.id)}
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
                    <Compass className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Focus on Globe</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs font-serif text-[#F1E5CC]/60">
                No matching playable fairytale found in the 15-story atlas.
              </div>
            )
          ) : (
            /* TAB 2: SCHOLARLY ARCHIVE (EXPLORE ONLY) */
            <>
              <div className="p-2.5 rounded-lg bg-[#D6B36B]/15 border border-[#D6B36B]/40 text-[11px] font-sans text-[#F1E5CC] flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#D6B36B] shrink-0" />
                <span>
                  <strong>Folklore Archive (Explore Only):</strong> Reference entries for cross-cultural research. These tales enrich scholarly discovery without altering the 15 interactive atlas markers.
                </span>
              </div>

              {filteredArchive.length > 0 ? (
                filteredArchive.map((e, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#142033]/70 border border-[#D6B36B]/25"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-bold text-sm sm:text-base text-[#FFF7E8]">
                        {e.title}
                      </h4>
                      <span className="text-[10px] font-sans text-[#D6B36B]">
                        {e.region} · {e.culture}
                      </span>
                    </div>
                    <p className="text-xs font-serif text-[#F1E5CC]/85 mt-1.5 leading-relaxed">
                      {e.summary}
                    </p>
                    <div className="mt-2 pt-2 border-t border-[#D6B36B]/20 text-[11px] font-sans text-[#D6B36B] italic">
                      ✦ {e.parallelWithPlayable}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs font-serif text-[#F1E5CC]/60">
                  No matching folklore archive entry found.
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Note */}
        <div className="pt-3 border-t border-[#D6B36B]/30 mt-2 flex items-center justify-between text-[11px] text-[#D6B36B]/80 font-serif">
          <span>
            {activeTab === 'playable'
              ? 'Selecting a story rotates the globe and illuminates the marker without auto-opening the book.'
              : 'Scholarly folklore archive compiled for comparative mythological analysis.'}
          </span>
        </div>
      </motion.div>
    </div>
  );
};
