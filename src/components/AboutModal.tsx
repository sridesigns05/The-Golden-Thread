import React from 'react';
import { X, Sparkles, BookOpen, Compass, Award } from 'lucide-react';
import { playGentleClick } from '../utils/audio';
import { CATALOG_META } from '../data/catalogMeta';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1424]/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative max-w-2xl w-full p-6 md:p-8 rounded-xl parchment-card border border-[#D6B36B]/60 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D6B36B]/40">
          <div>
            <div className="text-xs font-sans uppercase tracking-widest text-[#19372F]/70 font-semibold">
              HackTX 2026 Project
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#19372F]">
              About The Golden Thread
            </h2>
          </div>

          <button
            onClick={() => {
              playGentleClick();
              onClose();
            }}
            className="p-1 rounded-md hover:bg-[#D6B36B]/30 text-[#19372F] transition-colors cursor-pointer"
            aria-label="Close about modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5 text-xs md:text-sm font-sans text-[#19372F]/85 leading-relaxed">
          <p>
            <strong>The Golden Thread</strong> is an interactive 3D fairytale exploration atlas developed
            for HackTX 2026. It invites players to explore shared narrative motifs across traditional stories
            from different cultures, visualizing how human storytellers throughout history arrived at parallel
            structures of hope, justice, and recognition.
          </p>

          <div className="p-4 rounded-lg bg-[#FAF5EA] border border-[#D6B36B]/40 space-y-2">
            <h3 className="font-serif font-bold text-base text-[#19372F]">
              The Core Folkloric Thesis
            </h3>
            <p>
              Stories from different cultures frequently share profound structural patterns—such as the
              persecuted innocent, supernatural aid from nature, or recognition through a lost token—while
              preserving their sovereign cultural histories, religious philosophies, and distinctive meanings.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#E2D4B7]/60 border border-[#D6B36B]/50 space-y-2">
            <h3 className="font-serif font-bold text-base text-[#19372F]">
              Scholarly Accuracy & Critical Distinction Rule
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-[#19372F]/90">
              <li>
                <strong>Cinderella-type tales:</strong> Perrault’s <em>Cendrillon</em> (France) is classed as
                ATU 510A. <em>Kongjwi and Patjwi</em> (Korea), <em>Ye Xian</em> (China) and <em>Tam and Cam</em>
                (Vietnam) are often grouped with it, but this atlas has not yet confirmed their tale-type numbers
                in a scholarly index, so those pairings are marked unconfirmed. <em>Rhodopis</em> (Strabo) is an
                ancient analogue and is not treated as the same tale type here.
              </li>
              <li>
                <strong>Classical Sanskrit Drama:</strong> Kalidasa’s <em>Abhijñānaśākuntalam</em> (India) is a
                classical literary drama (<em>nāṭaka</em>) rooted in the epic Mahabharata. It shares the narrative
                device of recognition through a lost token (the royal signet ring), but is <strong>not</strong> a
                Cinderella variant.
              </li>
              <li>
                <strong>No Monogenesis Assumption:</strong> Identifying a shared motif does not assume direct
                historical influence or linear borrowing; narrative motifs reflect enduring archetypes of the
                human condition.
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-[#FAF5EA] border border-[#D6B36B]/40 space-y-2">
            <h3 className="font-serif font-bold text-base text-[#19372F]">Limits of this atlas</h3>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-[#19372F]/90">
              <li>{CATALOG_META.dateRule}</li>
              <li>{CATALOG_META.similarityRule}</li>
              <li>Coverage is uneven and skews toward traditions with more published scholarship in English.</li>
              {CATALOG_META.limitations.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            {CATALOG_META.libraryAttribution && (
              <p className="text-[11px] text-[#19372F]/70 pt-1">{CATALOG_META.libraryAttribution}</p>
            )}
          </div>

          <div className="text-xs font-sans text-[#19372F]/70 border-t border-[#D6B36B]/20 pt-4 flex items-center justify-between">
            <span>Built with React, Three.js, FastAPI and SerpApi</span>
            <span>
              Data: {CATALOG_META.dataSource === 'backend' ? 'live from the backend' : 'bundled snapshot (backend not reached)'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#D6B36B]/40 flex justify-end">
          <button
            onClick={() => {
              playGentleClick();
              onClose();
            }}
            className="px-5 py-2 rounded-lg bg-[#19372F] text-[#FFF7E8] font-serif font-semibold text-xs tracking-wider hover:bg-[#234A3F] transition-all cursor-pointer"
          >
            Return to Atlas
          </button>
        </div>
      </div>
    </div>
  );
};
