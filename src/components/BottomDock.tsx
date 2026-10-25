import React, { useState } from 'react';
import { StoryId } from '../types';
import { totalThreads } from '../data/comparisons';
import { STORIES } from '../data/stories';
import { ChevronDown, ChevronUp, Sparkles, BookMarked, RotateCcw, HelpCircle } from 'lucide-react';
import { playGentleClick } from '../utils/audio';

interface BottomDockProps {
  selectedStoryId: StoryId | null;
  onSelectStory: (id: StoryId) => void;
  connectionsCount: number;
  onOpenJournal: () => void;
  onReset: () => void;
  guidanceText?: string;
  highlightedStoryIds?: StoryId[];
  onClearLens?: () => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  selectedStoryId,
  onSelectStory,
  connectionsCount,
  onOpenJournal,
  onReset,
  guidanceText,
  highlightedStoryIds = [],
  onClearLens
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 w-full max-w-4xl px-4 pointer-events-none">
      {/* Collapse / Expand Toggle Button */}
      <div className="flex justify-center mb-1">
        <button
          onClick={() => {
            playGentleClick();
            setIsCollapsed(!isCollapsed);
          }}
          className="pointer-events-auto px-3 py-1 rounded-t-lg bg-[#0F1D33]/90 hover:bg-[#192C4D] text-[#D6B36B] text-[11px] font-sans font-medium border-t border-x border-[#D6B36B]/30 flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Show Atlas Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Cinema Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Main Dock Container */}
      {!isCollapsed && (
        <div className="pointer-events-auto p-3.5 md:p-4 rounded-xl dark-parchment-card border border-[#D6B36B]/30 shadow-2xl transition-all duration-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
            {/* Story Quick-Selector Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
              {STORIES.map((story) => {
                const isSelected = story.id === selectedStoryId;
                const isHighlighted = highlightedStoryIds.includes(story.id);

                return (
                  <button
                    key={story.id}
                    onClick={() => {
                      playGentleClick();
                      onSelectStory(story.id);
                    }}
                    className={`px-3 py-2 rounded-lg text-left transition-all duration-150 whitespace-nowrap shrink-0 border cursor-pointer ${
                      isHighlighted
                        ? 'bg-gradient-to-r from-[#D6B36B] to-[#F1E5CC] text-[#19372F] border-2 border-[#FFF7E8] shadow-[0_0_15px_rgba(214,179,107,0.7)] animate-pulse font-bold'
                        : isSelected
                        ? 'bg-[#19372F] border-[#D6B36B] text-[#FFF7E8] shadow-sm'
                        : 'bg-[#101D33]/80 hover:bg-[#162744] border-[#D6B36B]/20 text-[#F1E5CC]'
                    }`}
                  >
                    <div className={`text-[10px] uppercase tracking-wider font-sans ${isHighlighted ? 'text-[#19372F] font-bold' : 'text-[#D6B36B]'}`}>
                      {isHighlighted ? '✦ Weave Thread' : story.country}
                    </div>
                    <div className="text-xs font-serif font-semibold">
                      {story.title}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Status & Progress Ribbon */}
            <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-[#D6B36B]/20">
              {/* Progress Count */}
              <div className="flex items-center gap-2 text-xs font-sans text-[#F1E5CC]/80 whitespace-nowrap">
                <Sparkles className="w-3.5 h-3.5 text-[#D6B36B]" />
                <span>
                  <strong className="text-[#D6B36B] font-mono tabular-nums">
                    {connectionsCount} / {totalThreads()}
                  </strong>{' '}
                  Threads Woven
                </span>
              </div>

              {/* Journal Shortcut */}
              <button
                onClick={() => {
                  playGentleClick();
                  onOpenJournal();
                }}
                className="px-3 py-1.5 rounded-lg bg-[#D6B36B]/20 hover:bg-[#D6B36B]/30 text-[#FFF7E8] border border-[#D6B36B]/40 text-xs font-serif font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <BookMarked className="w-3.5 h-3.5 text-[#D6B36B]" />
                <span className="hidden sm:inline">Journal</span>
              </button>
            </div>
          </div>

          {/* Contextual Guidance Line */}
          {guidanceText && (
            <div className="mt-2.5 pt-2 border-t border-[#D6B36B]/15 text-[11px] font-sans text-[#F1E5CC]/75 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 truncate">
                <span className="text-[#D6B36B]">✦</span>
                <span className="truncate">{guidanceText}</span>
              </div>
              {highlightedStoryIds.length > 0 && onClearLens && (
                <button
                  onClick={() => {
                    playGentleClick();
                    onClearLens();
                  }}
                  className="shrink-0 px-2.5 py-0.5 rounded-full bg-[#D6B36B]/25 hover:bg-[#D6B36B]/40 text-[#D6B36B] hover:text-[#FFF7E8] text-[10px] font-sans font-medium border border-[#D6B36B]/40 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Clear Lens</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
