import React, { useState } from 'react';
import { SoloQuestState, StoryId } from '../types';
import { STORIES } from '../data/stories';
import { Target, Compass, Footprints, Sparkles, HelpCircle, X, ChevronRight } from 'lucide-react';
import { playGentleClick, playCelestialChime } from '../utils/audio';
import { findShortestPath } from '../utils/graphPathfinding';

interface SoloQuestHUDProps {
  questState: SoloQuestState;
  onOpenStory: (id: StoryId) => void;
  onRequestHint: () => void;
  onAbortQuest: () => void;
  guide: { step: 1 | 2 | 3 | 4; text: string };
}

export const SoloQuestHUD: React.FC<SoloQuestHUDProps> = ({
  questState,
  onOpenStory,
  onRequestHint,
  onAbortQuest,
  guide
}) => {
  const [showHintModal, setShowHintModal] = useState(false);

  const startStory = STORIES.find((s) => s.id === questState.startStoryId);
  const targetStory = STORIES.find((s) => s.id === questState.targetStoryId);
  const currentStory = STORIES.find((s) => s.id === questState.currentStoryId);

  const isStuck = questState.nonProgressMoves >= 3;

  // How far along the way the player is: distance left now, against the distance at the start. It shows
  // whether a move helped, and names no story on the route.
  const hopsLeft = (id: StoryId) => findShortestPath(id, questState.targetStoryId)?.hops ?? 0;
  const startHops = Math.max(1, findShortestPath(questState.startStoryId, questState.targetStoryId)?.hops ?? questState.minHops);
  const nowHops = questState.isComplete ? 0 : hopsLeft(questState.currentStoryId);
  const progress = Math.max(0, Math.min(1, 1 - nowHops / startHops));
  const visited = questState.visitedStoryIds;
  const lastHelped = visited.length >= 2 ? hopsLeft(visited[visited.length - 1]) < hopsLeft(visited[visited.length - 2]) : null;
  const progressNote =
    questState.isComplete
      ? 'You arrived'
      : lastHelped === null
      ? 'Your journey begins'
      : nowHops <= 1
      ? 'Almost there'
      : lastHelped
      ? 'Getting closer'
      : 'A detour: try another thread';

  const handleHintClick = () => {
    playCelestialChime();
    onRequestHint();
    setShowHintModal(true);
  };

  return (
    <>
      {/* Floating HUD at top center */}
      <div className="fixed top-18 sm:top-20 left-1/2 -translate-x-1/2 z-30 w-full max-w-[92vw] sm:max-w-[700px] pointer-events-auto">
        <div className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-[#0B1424]/95 border border-[#D6B36B]/60 shadow-[0_8px_32px_rgba(0,0,0,0.85)] backdrop-blur-md flex flex-wrap sm:flex-nowrap items-center justify-between gap-x-2 gap-y-2 sm:gap-4 text-xs font-sans">
          {/* Destination Goal */}
          <div className="flex items-center gap-2 flex-1 basis-0 min-w-[42%] sm:min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#D6B36B]/20 border border-[#D6B36B] flex items-center justify-center text-[#D6B36B] shrink-0">
              <Target className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase font-semibold text-[#D6B36B] tracking-wider truncate">
                Destination
              </div>
              <div className="font-serif font-bold text-xs sm:text-sm text-[#FFF7E8] leading-tight line-clamp-2" title={targetStory?.title}>
                {targetStory?.title}
              </div>
              <div className="text-[#D6B36B]/80 font-sans text-[11px] truncate">{targetStory?.country}</div>
            </div>
          </div>

          {/* Current Story Location */}
          <div className="flex items-center gap-2 flex-1 basis-0 min-w-[42%] sm:min-w-0 border-l border-[#D6B36B]/30 pl-2 sm:pl-3">
            <div className="w-7 h-7 rounded-full bg-[#19372F] border border-[#D6B36B]/50 flex items-center justify-center text-[#D6B36B] shrink-0">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase font-semibold text-[#D6B36B]/90 tracking-wider truncate">
                Current Story
              </div>
              <button
                onClick={() => currentStory && onOpenStory(currentStory.id)}
                className="block w-full font-serif font-bold text-xs sm:text-sm text-[#FFF7E8] hover:text-[#D6B36B] transition-colors leading-tight line-clamp-2 cursor-pointer text-left"
                title={currentStory ? `Inspect ${currentStory.title}` : 'Inspect current storybook'}
              >
                {currentStory?.title}
              </button>
              <div className="text-[#D6B36B]/80 font-sans text-[11px] truncate">{currentStory?.country}</div>
            </div>
          </div>

          {/* Moves Taken */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 border-l border-[#D6B36B]/30 pl-2 sm:pl-3">
            <div className="text-center">
              <div className="text-[10px] text-[#F1E5CC]/70 uppercase font-medium">Moves</div>
              <div className="font-serif font-bold text-xs sm:text-sm text-[#D6B36B]">
                {questState.movesTaken}
              </div>
            </div>
          </div>

          {/* Hint & Abort Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleHintClick}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                isStuck
                  ? 'bg-[#D6B36B] text-[#0B1424] border-[#FFF7E8] shadow-[0_0_15px_rgba(214,179,107,0.7)] animate-pulse'
                  : 'bg-[#D6B36B]/15 text-[#D6B36B] hover:bg-[#D6B36B]/30 border-[#D6B36B]/40'
              }`}
              title="Request Oracle Hint"
            >
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline">Seek Guidance</span>
              <span className="sm:hidden">Hint</span>
            </button>

            <button
              onClick={onAbortQuest}
              className="p-1 rounded-full text-[#F1E5CC]/60 hover:text-[#FFF7E8] hover:bg-white/10 transition-all cursor-pointer"
              title="Exit Quest"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress toward the destination */}
        <div className="mt-2 mx-auto w-full max-w-[460px] px-3 py-2 rounded-xl bg-[#0B1424]/90 border border-[#D6B36B]/30 backdrop-blur-md">
          <div className="flex items-center justify-between text-[10px] font-sans uppercase tracking-wider mb-1.5">
            <span className="text-[#D6B36B] font-semibold">Journey progress</span>
            <span className="text-[#F1E5CC]/80 normal-case tracking-normal text-[11px]">{progressNote}</span>
          </div>
          <div
            className="h-2 rounded-full bg-[#D6B36B]/15 overflow-hidden"
            role="progressbar"
            aria-label="Journey progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#B8902F] to-[#F1D98E] transition-all duration-700"
              style={{ width: `${Math.max(progress * 100, 4)}%` }}
            />
          </div>
        </div>

        {/* What to do next. Says how to play, never where to go. */}
        <div className="mt-2 mx-auto w-fit max-w-full px-4 py-2 rounded-full bg-[#142033]/95 border border-[#D6B36B]/50 shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-md flex items-center gap-2.5 text-xs sm:text-sm font-serif text-[#FFF7E8]">
          <span className="flex items-center gap-1 shrink-0" aria-label={`Step ${guide.step} of 4`}>
            {[1, 2, 3, 4].map((n) => (
              <span
                key={n}
                className={`w-2 h-2 rounded-full ${n === guide.step ? 'bg-[#D6B36B] shadow-[0_0_8px_#D6B36B]' : n < guide.step ? 'bg-[#D6B36B]/60' : 'bg-[#D6B36B]/20'}`}
              />
            ))}
          </span>
          <span>{guide.text}</span>
        </div>
      </div>

      {/* Oracle Hint Modal */}
      {showHintModal && questState.activeHint && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto"
          onClick={() => setShowHintModal(false)}
        >
          <div
            className="w-full max-w-[480px] rounded-xl bg-[#0E1726] border-2 border-[#D6B36B] p-5 text-[#F1E5CC] shadow-[0_20px_60px_rgba(0,0,0,0.9)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 border-b border-[#D6B36B]/30 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D6B36B]" />
                <h4 className="font-serif font-bold text-base text-[#FFF7E8]">
                  The Storyteller’s Oracle
                </h4>
              </div>
              <button
                onClick={() => setShowHintModal(false)}
                className="text-[#D6B36B]/70 hover:text-[#FFF7E8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="font-serif text-sm text-[#F1E5CC] leading-relaxed mb-4">
              {questState.activeHint}
            </p>

            <div className="text-right">
              <button
                onClick={() => setShowHintModal(false)}
                className="btn btn-gold"
              >
                Follow the Thread
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
