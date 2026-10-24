import React from 'react';
import { Volume2, VolumeX, BookOpen, Compass } from 'lucide-react';
import { playGentleClick } from '../utils/audio';

interface HeaderNavProps {
  onOpenJournal: () => void;
  onOpenAbout: () => void;
  onOpenTraditions: () => void;
  onFocusAtlas: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  connectionsCount: number;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  onOpenJournal,
  onOpenAbout,
  onOpenTraditions,
  onFocusAtlas,
  isMuted,
  onToggleMute,
  connectionsCount
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-[#0B1424]/85 border-b border-[#D6B36B]/20 backdrop-blur-md">
      {/* Zone 1: Single text element wordmark */}
      <button
        onClick={() => {
          playGentleClick();
          onFocusAtlas();
        }}
        className="text-lg md:text-xl font-serif font-semibold tracking-wider text-[#FFF7E8] hover:text-[#D6B36B] transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2"
      >
        <span>THE GOLDEN THREAD</span>
      </button>

      {/* Zone 2: 4 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-sans font-medium text-[#F1E5CC]/80">
        <button
          onClick={() => {
            playGentleClick();
            onFocusAtlas();
          }}
          className="hover:text-[#FFF7E8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Celestial Atlas
        </button>
        <button
          onClick={() => {
            playGentleClick();
            onOpenTraditions();
          }}
          className="hover:text-[#FFF7E8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Four Traditions
        </button>
        <button
          onClick={() => {
            playGentleClick();
            onOpenJournal();
          }}
          className="hover:text-[#FFF7E8] transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
        >
          <span>Storykeeper’s Journal</span>
          <span className="text-[10px] text-[#D6B36B] font-mono tabular-nums">
            ({connectionsCount}/3)
          </span>
        </button>
        <button
          onClick={() => {
            playGentleClick();
            onOpenAbout();
          }}
          className="hover:text-[#FFF7E8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          About HackTX 2026
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleMute}
          className="p-2 rounded-lg bg-[#101D33] hover:bg-[#192C4D] text-[#D6B36B] border border-[#D6B36B]/20 transition-colors cursor-pointer"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button
          onClick={() => {
            playGentleClick();
            onOpenJournal();
          }}
          className="px-4 py-2 text-xs font-serif font-semibold text-[#0B1424] bg-[#D6B36B] hover:bg-[#E7CCA0] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
        >
          Open Journal
        </button>
      </div>
    </header>
  );
};
