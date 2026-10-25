import React, { useState } from 'react';
import { GoldenThreadConnection, StoryId } from '../types';
import { STORIES } from '../data/stories';
import { MOTIFS_CATALOG } from '../data/motifs';
import { COMPARISONS, getComparison, classificationLabel, totalThreads } from '../data/comparisons';
import { X, BookMarked, Sparkles, Scroll, ArrowRightLeft } from 'lucide-react';
import { playGentleClick, playParchmentRustle } from '../utils/audio';

interface JournalModalProps {
  connections: GoldenThreadConnection[];
  onClose: () => void;
  onSelectStoryFromJournal: (storyId: StoryId) => void;
}

export const JournalModal: React.FC<JournalModalProps> = ({
  connections,
  onClose,
  onSelectStoryFromJournal
}) => {
  const [activeTab, setActiveTab] = useState<'threads' | 'codex' | 'motifs'>('threads');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1424]/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative max-w-3xl w-full p-6 md:p-8 rounded-xl parchment-card border border-[#D6B36B]/60 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D6B36B]/40">
          <div className="flex items-center gap-2.5">
            <BookMarked className="w-5 h-5 text-[#A98336]" />
            <div>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-[#19372F]">
                The Storykeeper’s Journal
              </h2>
              <div className="text-xs font-sans text-[#19372F]/70">
                Archived threads, cultural codices, and comparative folkloristics
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              playGentleClick();
              onClose();
            }}
            className="p-1 rounded-md hover:bg-[#D6B36B]/30 text-[#19372F] transition-colors cursor-pointer"
            aria-label="Close journal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 my-4 p-1 bg-[#DBCBB0]/60 rounded-lg">
          <button
            onClick={() => {
              playGentleClick();
              setActiveTab('threads');
            }}
            className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'threads'
                ? 'bg-[#F1E5CC] text-[#19372F] shadow-xs font-semibold'
                : 'text-[#19372F]/70 hover:text-[#19372F]'
            }`}
          >
            Woven Threads ({connections.length})
          </button>
          <button
            onClick={() => {
              playGentleClick();
              setActiveTab('codex');
            }}
            className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'codex'
                ? 'bg-[#F1E5CC] text-[#19372F] shadow-xs font-semibold'
                : 'text-[#19372F]/70 hover:text-[#19372F]'
            }`}
          >
            World Codex (4 Traditions)
          </button>
          <button
            onClick={() => {
              playGentleClick();
              setActiveTab('motifs');
            }}
            className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'motifs'
                ? 'bg-[#F1E5CC] text-[#19372F] shadow-xs font-semibold'
                : 'text-[#19372F]/70 hover:text-[#19372F]'
            }`}
          >
            Narrative Motifs
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {activeTab === 'threads' && (
            <div className="space-y-4">
              {connections.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-[#D6B36B]/40 rounded-xl bg-[#FAF5EA]/50">
                  <Scroll className="w-8 h-8 text-[#A98336] mx-auto mb-3 opacity-60" />
                  <div className="font-serif font-bold text-lg text-[#19372F] mb-1">
                    No Golden Threads Woven Yet
                  </div>
                  <p className="text-xs font-sans text-[#19372F]/70 max-w-md mx-auto">
                    Select a story on the celestial globe, solve its narrative motif challenge, and click
                    the illuminated destination to weave your first Golden Thread.
                  </p>
                </div>
              ) : (
                connections.map((conn) => {
                  const storyA = STORIES.find((s) => s.id === conn.storyA);
                  const storyB = STORIES.find((s) => s.id === conn.storyB);
                  const detail = getComparison(conn.storyA, conn.storyB, conn.motif);
                  const motif = MOTIFS_CATALOG[conn.motif];

                  if (!storyA || !storyB || !detail) return null;

                  return (
                    <div
                      key={conn.id}
                      className="p-5 rounded-xl bg-[#FAF5EA] border border-[#D6B36B]/40 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-serif font-bold text-base text-[#19372F]">
                          <span>{storyA.title}</span>
                          <ArrowRightLeft className="w-3.5 h-3.5 text-[#A98336]" />
                          <span>{storyB.title}</span>
                        </div>
                        <span className="text-[11px] font-sans text-[#19372F]/60">
                          {storyA.country} ✦ {storyB.country}
                        </span>
                      </div>

                      <div className="text-xs font-sans text-[#19372F]/80">
                        <span className="font-semibold text-[#19372F]">Connecting Motif: </span>
                        {motif?.name}
                      </div>

                      <div className="p-3 rounded-lg bg-[#EAE0C7]/50 text-xs font-sans text-[#19372F]/90 leading-relaxed border border-[#D6B36B]/30">
                        <span className="font-semibold block mb-0.5 text-[#19372F]">
                          Cultural & Narrative Distinction:
                        </span>
                        {detail.culturalDifference}
                      </div>

                      <div className="text-[11px] font-sans text-[#19372F]/70 italic">
                        ✦ {classificationLabel(detail)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'codex' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {STORIES.map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-xl bg-[#FAF5EA] border border-[#D6B36B]/40 space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-sans uppercase tracking-wider text-[#A98336] font-semibold">
                        {s.country}
                      </span>
                      <span className="text-[11px] font-sans text-[#19372F]/60">
                        {s.narrativeTraditionType}
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-lg text-[#19372F]">
                      {s.title}
                    </h4>
                    <p className="text-xs font-sans text-[#19372F]/80 mt-1 line-clamp-3 leading-relaxed">
                      {s.summary}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#D6B36B]/20 flex items-center justify-between">
                    <span className="text-[11px] font-sans text-[#19372F]/60">
                      {s.motifs.length} Motifs Documented
                    </span>
                    <button
                      onClick={() => {
                        playParchmentRustle();
                        onSelectStoryFromJournal(s.id);
                        onClose();
                      }}
                      className="text-xs font-serif font-semibold text-[#19372F] hover:text-[#A98336] underline cursor-pointer"
                    >
                      Inspect in Atlas →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'motifs' && (
            <div className="space-y-3">
              {Object.values(MOTIFS_CATALOG).map((m) => (
                <div key={m.id} className="p-4 rounded-lg bg-[#FAF5EA] border border-[#D6B36B]/30">
                  <div className="font-serif font-bold text-base text-[#19372F] mb-1">
                    {m.name}
                  </div>
                  <p className="text-xs font-sans text-[#19372F]/85 leading-relaxed mb-2">
                    {m.shortDescription}
                  </p>
                  <div className="text-[11px] font-sans text-[#19372F]/70 italic border-t border-[#D6B36B]/20 pt-1.5">
                    {m.storySignificance}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#D6B36B]/40 flex items-center justify-between text-xs font-sans text-[#19372F]/60">
          <span>The Golden Thread Archival Record · HackTX 2026</span>
          <span>{connections.length} of {totalThreads()} threads collected</span>
        </div>
      </div>
    </div>
  );
};
