import React from 'react';
import { X, Globe, Sparkles } from 'lucide-react';
import { STORIES } from '../data/stories';
import { StoryId } from '../types';
import { playGentleClick, playParchmentRustle } from '../utils/audio';

interface TraditionsModalProps {
  onClose: () => void;
  onSelectStory: (id: StoryId) => void;
}

export const TraditionsModal: React.FC<TraditionsModalProps> = ({ onClose, onSelectStory }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1424]/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative max-w-4xl w-full p-6 md:p-8 rounded-xl parchment-card border border-[#D6B36B]/60 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D6B36B]/40">
          <div>
            <div className="text-xs font-sans uppercase tracking-widest text-[#19372F]/70 font-semibold">
              Comparative Atlas Catalog
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#19372F]">
              The Four Cultural Traditions
            </h2>
          </div>

          <button
            onClick={() => {
              playGentleClick();
              onClose();
            }}
            className="p-1 rounded-md hover:bg-[#D6B36B]/30 text-[#19372F] transition-colors cursor-pointer"
            aria-label="Close traditions catalog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Cards Grid */}
        <div className="flex-1 overflow-y-auto py-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {STORIES.map((s) => (
            <div
              key={s.id}
              className="p-5 rounded-xl bg-[#FAF5EA] border border-[#D6B36B]/40 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-sans text-[#19372F]/70 mb-1">
                  <span className="font-semibold uppercase tracking-wider text-[#A98336]">{s.country}</span>
                  <span>{s.narrativeTraditionType}</span>
                </div>

                <h3 className="font-serif font-bold text-xl text-[#19372F]">
                  {s.title}
                </h3>
                <div className="text-xs font-serif italic text-[#19372F]/75 mb-2">
                  {s.originalOrAlternateTitle}
                </div>

                <p className="text-xs font-sans text-[#19372F]/85 leading-relaxed mb-3">
                  {s.summary}
                </p>

                <div className="p-2.5 rounded-lg bg-[#EAE0C7]/60 text-[11px] font-sans text-[#19372F]/90 leading-relaxed border border-[#D6B36B]/30">
                  <span className="font-semibold block text-[#19372F] mb-0.5">Distinctive Element:</span>
                  {s.distinctiveFeatures}
                </div>
              </div>

              <div className="pt-3 border-t border-[#D6B36B]/20 flex items-center justify-between">
                <span className="text-xs font-sans text-[#19372F]/60">
                  {s.sources[0]?.dateOrEra}
                </span>

                <button
                  onClick={() => {
                    playParchmentRustle();
                    onSelectStory(s.id);
                    onClose();
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#19372F] text-[#FFF7E8] font-serif font-medium text-xs hover:bg-[#234A3F] transition-all cursor-pointer"
                >
                  Inspect in 3D Atlas →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#D6B36B]/40 flex justify-between items-center text-xs font-sans text-[#19372F]/70">
          <span>Explore each tradition’s nuances on the 3D globe</span>
          <button
            onClick={() => {
              playGentleClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-md border border-[#19372F]/30 hover:bg-[#EAE0C7] text-[#19372F] font-medium cursor-pointer"
          >
            Close Catalog
          </button>
        </div>
      </div>
    </div>
  );
};
