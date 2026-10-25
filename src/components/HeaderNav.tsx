import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Music,
  Compass,
  Search,
  Sparkles,
  Users,
  Sliders,
  X
} from 'lucide-react';
import { GameMode } from '../types';
import { playGentleClick } from '../utils/audio';

interface HeaderNavProps {
  onOpenJournal: () => void;
  onOpenAbout: () => void;
  onOpenTraditions: () => void;
  onOpenAudit: () => void;
  onOpenSearch: () => void;
  onOpenModeSelect: () => void;
  onFocusAtlas: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isMusicEnabled: boolean;
  onToggleMusic: () => void;
  musicVolume: number;
  onChangeVolume: (vol: number) => void;
  currentAtmosphere: string;
  connectionsCount: number;
  gameMode: GameMode;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  onOpenJournal,
  onOpenAbout,
  onOpenTraditions,
  onOpenAudit,
  onOpenSearch,
  onOpenModeSelect,
  onFocusAtlas,
  isMuted,
  onToggleMute,
  isMusicEnabled,
  onToggleMusic,
  musicVolume,
  onChangeVolume,
  currentAtmosphere,
  connectionsCount,
  gameMode
}) => {
  const [showAudioControls, setShowAudioControls] = useState(false);

  const getModeLabel = () => {
    switch (gameMode) {
      case 'solo-quest':
        return 'Solo Quest';
      case 'shared-journey':
        return 'Shared Journey';
      case 'free-exploration':
      default:
        return 'Explore Freely';
    }
  };

  const getModeIcon = () => {
    switch (gameMode) {
      case 'solo-quest':
        return <Compass className="w-3.5 h-3.5 text-[#D6B36B]" />;
      case 'shared-journey':
        return <Users className="w-3.5 h-3.5 text-[#D6B36B]" />;
      case 'free-exploration':
      default:
        return <Sparkles className="w-3.5 h-3.5 text-[#D6B36B]" />;
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between gap-4 px-4 sm:px-6 py-3 bg-[#0B1424]/90 border-b border-[#D6B36B]/25 backdrop-blur-md">
      {/* Zone 1: Wordmark */}
      <button
        onClick={() => {
          playGentleClick();
          onFocusAtlas();
        }}
        className="text-base sm:text-lg md:text-xl font-serif font-bold tracking-wider text-[#FFF7E8] hover:text-[#D6B36B] transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-[#D6B36B]"
      >
        <span>THE GOLDEN THREAD</span>
      </button>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-sans font-medium text-[#F1E5CC]/85">
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
          Atlas Folios (15)
        </button>

        <button
          onClick={() => {
            playGentleClick();
            onOpenAudit();
          }}
          className="hover:text-[#FFF7E8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Artwork Audit (15)
        </button>

        <button
          onClick={() => {
            playGentleClick();
            onOpenJournal();
          }}
          className="hover:text-[#FFF7E8] transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
        >
          <span>Storykeeper’s Journal</span>
          <span className="text-[11px] text-[#D6B36B] font-mono tabular-nums font-bold">
            ({connectionsCount})
          </span>
        </button>

        <button
          onClick={() => {
            playGentleClick();
            onOpenAbout();
          }}
          className="hover:text-[#FFF7E8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          HackTX 2026 Lore
        </button>
      </nav>

      {/* Zone 3: Interactive Controls */}
      <div className="relative flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mode Switcher Button */}
        <button
          onClick={() => {
            playGentleClick();
            onOpenModeSelect();
          }}
          className="px-2.5 sm:px-3 py-1.5 rounded-full bg-[#142033] hover:bg-[#1A2A42] border border-[#D6B36B]/50 text-xs sm:text-sm font-sans text-[#FFF7E8] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs focus-visible:ring-2 focus-visible:ring-[#D6B36B]"
          title="Change Game Mode"
        >
          {getModeIcon()}
          <span className="hidden sm:inline font-semibold">{getModeLabel()}</span>
        </button>

        {/* Discovery Search Button */}
        <button
          onClick={() => {
            playGentleClick();
            onOpenSearch();
          }}
          className="h-11 px-5 sm:px-6 rounded-full bg-[#D6B36B] hover:bg-[#E7CCA0] text-[#0B1424] border-2 border-[#FFF7E8]/60 shadow-[0_0_22px_rgba(214,179,107,0.65)] text-sm sm:text-base font-sans font-bold transition-all cursor-pointer flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-[#FFF7E8]"
          title="Search 15 Playable Tales & Folklore Archive"
          aria-label="Search Tales"
        >
          <Search className="w-5 h-5" />
          <span>Search</span>
        </button>

        {/* Audio & Music Control Button */}
        <button
          onClick={() => setShowAudioControls(!showAudioControls)}
          className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#D6B36B] ${
            isMusicEnabled && !isMuted
              ? 'bg-[#D6B36B]/20 border-[#D6B36B] text-[#FFF7E8]'
              : 'bg-[#101D33] border-[#D6B36B]/30 text-[#D6B36B] hover:bg-[#192C4D]'
          }`}
          title="Music & Atmospheric Audio Controls"
          aria-label="Audio Controls"
        >
          <Music className={`w-4 h-4 ${isMusicEnabled && !isMuted ? 'animate-pulse text-[#D6B36B]' : ''}`} />
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-[#D6B36B]" />}
        </button>

        {/* Audio Controls Popover */}
        {showAudioControls && (
          <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-[#0E1726] border-2 border-[#D6B36B] p-4 text-[#F1E5CC] shadow-[0_15px_50px_rgba(0,0,0,0.9)] z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#D6B36B]/30 mb-3">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-[#D6B36B]" />
                <h4 className="font-serif font-bold text-sm text-[#FFF7E8]">Audio & Soundtrack</h4>
              </div>
              <button
                onClick={() => setShowAudioControls(false)}
                className="text-[#D6B36B]/70 hover:text-[#FFF7E8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Soundtrack Atmosphere */}
            <div className="mb-3.5 p-2 rounded-lg bg-[#142033] border border-[#D6B36B]/25">
              <div className="text-[10px] uppercase font-sans font-semibold text-[#D6B36B] tracking-wider">
                Active Soundscape
              </div>
              <div className="text-xs font-serif font-bold text-[#FFF7E8] truncate mt-0.5">
                {currentAtmosphere}
              </div>
            </div>

            {/* Music Toggle */}
            <div className="flex items-center justify-between py-1.5 mb-2">
              <span className="text-xs font-sans font-medium">Ambient Music</span>
              <button
                onClick={() => {
                  playGentleClick();
                  onToggleMusic();
                }}
                className={`px-3 py-1 rounded-full text-xs font-sans font-bold transition-all cursor-pointer ${
                  isMusicEnabled
                    ? 'bg-[#D6B36B] text-[#0B1424] shadow-[0_0_10px_rgba(214,179,107,0.4)]'
                    : 'bg-[#142033] text-[#F1E5CC]/60 hover:text-[#FFF7E8] border border-[#D6B36B]/30'
                }`}
              >
                {isMusicEnabled ? 'Playing' : 'Paused'}
              </button>
            </div>

            {/* Volume Slider */}
            <div className="py-1 mb-2">
              <div className="flex items-center justify-between text-xs font-sans mb-1 text-[#F1E5CC]/80">
                <span>Soundtrack Volume</span>
                <span className="font-mono text-[#D6B36B]">{Math.round(musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={musicVolume}
                onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#142033] rounded-lg appearance-none cursor-pointer accent-[#D6B36B]"
              />
            </div>

            {/* SFX Mute Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-[#D6B36B]/20">
              <span className="text-xs font-sans font-medium">Master Sound</span>
              <button
                onClick={() => {
                  playGentleClick();
                  onToggleMute();
                }}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 text-xs font-sans ${
                  isMuted
                    ? 'bg-red-950/60 border-red-500/50 text-red-200'
                    : 'bg-[#142033] border-[#D6B36B]/40 text-[#D6B36B]'
                }`}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isMuted ? 'Muted' : 'Sound On'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Open Journal Button */}
        <button
          onClick={() => {
            playGentleClick();
            onOpenJournal();
          }}
          className="px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-serif font-bold text-[#0B1424] bg-[#D6B36B] hover:bg-[#E7CCA0] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-[#D6B36B]"
        >
          Journal
        </button>
      </div>
    </header>
  );
};
