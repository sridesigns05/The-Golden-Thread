import React, { useState, useEffect, useCallback } from 'react';
import {
  StoryId,
  MotifId,
  GameMode,
  GoldenThreadConnection,
  ComparisonDetail,
  SoloQuestState,
  SharedJourneyData
} from './types';
import { STORIES } from './data/stories';
import { getComparison, getRelatedStoriesForMotif } from './data/comparisons';
import {
  findShortestPath,
  getReachableDestinationForSolo,
  getNextStepHint
} from './utils/graphPathfinding';
import {
  setSoundMuted,
  getSoundMuted,
  setMusicEnabled,
  getMusicEnabled,
  setMasterVolume,
  getMasterVolume,
  switchStoryMusic,
  getCurrentAtmosphereName,
  enableAudioByUserGesture,
  subscribeAudioState,
  playGoldenThreadResonance,
  playGentleClick,
  playCelestialChime
} from './utils/audio';
import { RotateCcw, Target, Heart, Compass, Music } from 'lucide-react';

// Core Components
import { GlobeView } from './components/GlobeView';
import { StorybookOnboarding } from './components/StorybookOnboarding';
import { HeaderNav } from './components/HeaderNav';
import { BottomDock } from './components/BottomDock';
import { StoryBookSpread } from './components/StoryBookSpread';
import { ComparisonBookSpread } from './components/ComparisonBookSpread';
import { JournalModal } from './components/JournalModal';
import { CompletionModal } from './components/CompletionModal';
import { AboutModal } from './components/AboutModal';
import { TraditionsModal } from './components/TraditionsModal';
import { IllustrationAuditModal } from './components/IllustrationAuditModal';

// Game Mode & Search Components
import { ModeSelectModal } from './components/ModeSelectModal';
import { DestinationRevealModal } from './components/DestinationRevealModal';
import { SoloQuestHUD } from './components/SoloQuestHUD';
import { SoloQuestCompletionModal } from './components/SoloQuestCompletionModal';
import { SharedJourneyModal } from './components/SharedJourneyModal';
import { SharedJourneyReflectionModal } from './components/SharedJourneyReflectionModal';
import { DualSearchModal } from './components/DualSearchModal';

const STORAGE_KEY_CONNECTIONS = 'golden_thread_connections_v2';
const STORAGE_KEY_JOURNEYS = 'golden_thread_local_journeys_v2';

export default function App() {
  // Navigation & Game State
  const [hasOpenedAtlas, setHasOpenedAtlas] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('free-exploration');
  const [isModeSelectOpen, setIsModeSelectOpen] = useState(false);

  // Story Selection & Modal State
  const [selectedStoryId, setSelectedStoryId] = useState<StoryId | null>(null);
  const [focusedStoryId, setFocusedStoryId] = useState<StoryId | null>(null);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [focusedSearchNotice, setFocusedSearchNotice] = useState<string | null>(null);

  // Active Motif & Revealed Connections
  const [activeMotif, setActiveMotif] = useState<MotifId | null>(null);
  const [highlightedStoryIds, setHighlightedStoryIds] = useState<StoryId[]>([]);
  const [activeConnectionArc, setActiveConnectionArc] = useState<{ from: StoryId; to: StoryId } | null>(null);

  // Current Comparison Modal
  const [currentComparison, setCurrentComparison] = useState<{
    detail: ComparisonDetail;
    storyAId: StoryId;
    storyBId: StoryId;
  } | null>(null);

  // Saved Connections in Journal
  const [connections, setConnections] = useState<GoldenThreadConnection[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONNECTIONS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return [];
  });

  // Destination Reveal State (Shown BEFORE starting storybook opens)
  const [destinationRevealData, setDestinationRevealData] = useState<{
    mode: 'solo-quest' | 'shared-journey';
    startStoryId: StoryId;
    targetStoryId: StoryId;
    friendName?: string;
    friendMessage?: string;
    journey?: SharedJourneyData;
  } | null>(null);

  // Solo Quest Game State
  const [questState, setQuestState] = useState<SoloQuestState>({
    isActive: false,
    startStoryId: 'cinderella',
    targetStoryId: 'kongjwi',
    currentStoryId: 'cinderella',
    visitedStoryIds: ['cinderella'],
    movesTaken: 0,
    minHops: 2,
    nonProgressMoves: 0,
    activeHint: null,
    isComplete: false
  });
  const [isSoloQuestVictoryOpen, setIsSoloQuestVictoryOpen] = useState(false);

  // Multiplayer Shared Journey State
  const [activeSharedJourney, setActiveSharedJourney] = useState<SharedJourneyData | null>(null);
  const [sharedJourneyMoves, setSharedJourneyMoves] = useState(0);
  const [isSharedJourneyModalOpen, setIsSharedJourneyModalOpen] = useState(false);
  const [isSharedReflectionOpen, setIsSharedReflectionOpen] = useState(false);

  // Modal Overlays
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isCompletionOpen, setIsCompletionOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isTraditionsOpen, setIsTraditionsOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hasShownCompletionOnce, setHasShownCompletionOnce] = useState(false);

  // Global Audio Manager State (defaults to 25% volume)
  const [isMuted, setIsMutedState] = useState(getSoundMuted());
  const [isMusicEnabled, setIsMusicEnabledState] = useState(getMusicEnabled());
  const [musicVolume, setMusicVolumeState] = useState(getMasterVolume());

  // Subscribe to Global Audio Manager
  useEffect(() => {
    return subscribeAudioState((state) => {
      setIsMutedState(state.isMuted);
      setIsMusicEnabledState(state.isAudioEnabled);
      setMusicVolumeState(state.volume);
    });
  }, []);

  // Check URL params on initial load for Shared Journey invitation links (`?journey=<id>`)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const journeyId = params.get('journey');
    if (journeyId) {
      fetch(`/api/journeys/${journeyId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data: SharedJourneyData | null) => {
          if (data) {
            setActiveSharedJourney(data);
            setIsSharedJourneyModalOpen(true);
            setHasOpenedAtlas(true);
          }
        })
        .catch(() => {
          try {
            const raw = localStorage.getItem(STORAGE_KEY_JOURNEYS);
            if (raw) {
              const list: SharedJourneyData[] = JSON.parse(raw);
              const found = list.find((j) => j.id === journeyId);
              if (found) {
                setActiveSharedJourney(found);
                setIsSharedJourneyModalOpen(true);
                setHasOpenedAtlas(true);
              }
            }
          } catch {
            // Ignore
          }
        });
    }
  }, []);

  // Save connections in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONNECTIONS, JSON.stringify(connections));
    } catch {
      // Ignore
    }
  }, [connections]);

  // Sync atmospheric story soundscape when selected story changes
  useEffect(() => {
    if (isStoryModalOpen && selectedStoryId) {
      switchStoryMusic(selectedStoryId);
    } else {
      switchStoryMusic(null);
    }
  }, [selectedStoryId, isStoryModalOpen]);

  // Check completion trigger (when 3 unique connections are collected in Free Exploration)
  useEffect(() => {
    if (
      gameMode === 'free-exploration' &&
      connections.length >= 3 &&
      !hasShownCompletionOnce &&
      !currentComparison
    ) {
      setIsCompletionOpen(true);
      setHasShownCompletionOnce(true);
    }
  }, [connections.length, hasShownCompletionOnce, currentComparison, gameMode]);

  // Audio Handlers
  const handleToggleMute = useCallback(() => {
    const nextVal = !isMuted;
    setIsMutedState(nextVal);
    setSoundMuted(nextVal);
  }, [isMuted]);

  const handleToggleMusic = useCallback(() => {
    const nextVal = !isMusicEnabled;
    setIsMusicEnabledState(nextVal);
    setMusicEnabled(nextVal);
  }, [isMusicEnabled]);

  const handleChangeVolume = useCallback((val: number) => {
    setMusicVolumeState(val);
    setMasterVolume(val);
  }, []);

  // 1. Solo Quest: Prepare Destination Reveal BEFORE opening storybook
  const handlePrepareSoloQuest = useCallback((startId: StoryId) => {
    playCelestialChime();
    const targetId = getReachableDestinationForSolo(startId);

    setIsModeSelectOpen(false);
    setDestinationRevealData({
      mode: 'solo-quest',
      startStoryId: startId,
      targetStoryId: targetId
    });
  }, []);

  // 2. Solo Quest: User clicks "Begin Your Journey" on Destination Reveal screen
  const handleBeginSoloQuest = useCallback(() => {
    if (!destinationRevealData) return;
    const { startStoryId, targetStoryId } = destinationRevealData;
    const shortest = findShortestPath(startStoryId, targetStoryId);

    setGameMode('solo-quest');
    setQuestState({
      isActive: true,
      startStoryId,
      targetStoryId,
      currentStoryId: startStoryId,
      visitedStoryIds: [startStoryId],
      movesTaken: 0,
      minHops: shortest?.hops || 2,
      nonProgressMoves: 0,
      activeHint: null,
      isComplete: false
    });

    setDestinationRevealData(null);
    setSelectedStoryId(startStoryId);
    setFocusedStoryId(startStoryId);
    setIsStoryModalOpen(true); // Opens starting storybook NOW!
    setActiveMotif(null);
    setHighlightedStoryIds([]);
    setActiveConnectionArc(null);
    setCurrentComparison(null);
  }, [destinationRevealData]);

  // Request Oracle Hint for Solo Quest
  const handleRequestSoloHint = useCallback(() => {
    if (!questState.isActive) return;
    const hint = getNextStepHint(questState.currentStoryId, questState.targetStoryId);
    if (hint) {
      setQuestState((prev) => ({
        ...prev,
        activeHint: hint.scholarlyHint
      }));
    }
  }, [questState.currentStoryId, questState.targetStoryId, questState.isActive]);

  // 3. Shared Journey: Prepare Destination Reveal for Player B
  const handlePrepareSharedJourney = useCallback(
    (journey: SharedJourneyData, startStoryId: StoryId) => {
      setIsSharedJourneyModalOpen(false);
      setDestinationRevealData({
        mode: 'shared-journey',
        startStoryId,
        targetStoryId: journey.creatorStoryId,
        friendName: journey.creatorName,
        friendMessage: journey.creatorNote,
        journey
      });
    },
    []
  );

  // 4. Shared Journey: User clicks "Begin Your Journey" on Destination Reveal screen
  const handleBeginSharedJourney = useCallback(() => {
    if (!destinationRevealData || !destinationRevealData.journey) return;
    const { startStoryId, journey } = destinationRevealData;

    setGameMode('shared-journey');
    setActiveSharedJourney({
      ...journey,
      joinerStoryId: startStoryId,
      pathTaken: [startStoryId]
    });
    setSharedJourneyMoves(0);

    setDestinationRevealData(null);
    setSelectedStoryId(startStoryId);
    setFocusedStoryId(startStoryId);
    setIsStoryModalOpen(true); // Opens starting storybook NOW!
    setActiveMotif(null);
    setHighlightedStoryIds([]);
    setActiveConnectionArc(null);
    setCurrentComparison(null);
  }, [destinationRevealData]);

  // Save Created Journey locally & open share view
  const handleSaveCreatedJourney = useCallback((journey: SharedJourneyData) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_JOURNEYS);
      const list: SharedJourneyData[] = raw ? JSON.parse(raw) : [];
      list.push(journey);
      localStorage.setItem(STORAGE_KEY_JOURNEYS, JSON.stringify(list));
    } catch {
      // Ignore
    }
  }, []);

  // Complete Shared Journey Reflection
  const handleCompleteSharedReflection = useCallback(
    async (reflectionText: string, joinerName: string) => {
      if (!activeSharedJourney) return;
      const completed: SharedJourneyData = {
        ...activeSharedJourney,
        joinerReflection: reflectionText,
        joinerName,
        isComplete: true,
        completedAt: Date.now()
      };

      try {
        await fetch(`/api/journeys/${activeSharedJourney.id}/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(completed)
        });
      } catch {
        // Fallback local
      }

      setActiveSharedJourney(completed);
    },
    [activeSharedJourney]
  );

  // When a story marker or quick selector is clicked
  const handleSelectStory = useCallback(
    (storyId: StoryId) => {
      // If there are highlighted stories from a motif lens, and user clicks an illuminated story,
      // weave the Golden Thread!
      if (selectedStoryId && selectedStoryId !== storyId && highlightedStoryIds.includes(storyId)) {
        playGoldenThreadResonance();
        const comp = getComparison(selectedStoryId, storyId, activeMotif || undefined);
        if (comp) {
          setActiveConnectionArc({ from: selectedStoryId, to: storyId });

          const connectionId = `${selectedStoryId}-${storyId}`;
          const reverseId = `${storyId}-${selectedStoryId}`;
          const alreadyExists = connections.some((c) => c.id === connectionId || c.id === reverseId);

          if (!alreadyExists) {
            const newConn: GoldenThreadConnection = {
              id: connectionId,
              storyA: selectedStoryId,
              storyB: storyId,
              motif: comp.sharedMotif,
              unlockedAt: Date.now()
            };
            setConnections((prev) => [...prev, newConn]);
          }

          // Progress Tracking in Solo Quest Mode
          if (gameMode === 'solo-quest' && questState.isActive) {
            const currentDist = findShortestPath(questState.currentStoryId, questState.targetStoryId)?.hops || 1;
            const newDist = findShortestPath(storyId, questState.targetStoryId)?.hops || 1;
            const madeProgress = newDist < currentDist;

            const nextMoves = questState.movesTaken + 1;
            const nextNonProgress = madeProgress ? 0 : questState.nonProgressMoves + 1;
            const isDestinationReached = storyId === questState.targetStoryId;

            setQuestState((prev) => ({
              ...prev,
              currentStoryId: storyId,
              visitedStoryIds: [...prev.visitedStoryIds, storyId],
              movesTaken: nextMoves,
              nonProgressMoves: nextNonProgress,
              isComplete: isDestinationReached
            }));

            if (isDestinationReached) {
              setTimeout(() => {
                setIsSoloQuestVictoryOpen(true);
              }, 800);
            }
          }

          // Progress Tracking in Shared Journey Mode (Player B reaches Player A's story)
          if (gameMode === 'shared-journey' && activeSharedJourney) {
            setSharedJourneyMoves((m) => m + 1);
            const isDestinationReached = storyId === activeSharedJourney.creatorStoryId;
            if (isDestinationReached) {
              setTimeout(() => {
                setIsSharedReflectionOpen(true);
              }, 800);
            }
          }

          // Open concise side-by-side comparison
          setCurrentComparison({
            detail: comp,
            storyAId: selectedStoryId,
            storyBId: storyId
          });
          setIsStoryModalOpen(false);
          setFocusedSearchNotice(null);
          return;
        }
      }

      // Otherwise, open the illustrated storybook spread for this story
      setSelectedStoryId(storyId);
      setFocusedStoryId(storyId);
      setIsStoryModalOpen(true);
      setActiveMotif(null);
      setHighlightedStoryIds([]);
      setActiveConnectionArc(null);
      setCurrentComparison(null);
      setFocusedSearchNotice(null);
    },
    [
      selectedStoryId,
      highlightedStoryIds,
      activeMotif,
      connections,
      gameMode,
      questState,
      activeSharedJourney
    ]
  );

  // When a motif lens is chosen in the StoryBookSpread
  const handleSelectMotifLens = useCallback(
    (motif: MotifId) => {
      if (!selectedStoryId) return;
      setActiveMotif(motif);
      const relatedIds = getRelatedStoriesForMotif(selectedStoryId, motif);
      setHighlightedStoryIds(relatedIds);
    },
    [selectedStoryId]
  );

  // Clear Motif Lens and restore all markers
  const handleClearLens = useCallback(() => {
    playGentleClick();
    setActiveMotif(null);
    setHighlightedStoryIds([]);
    setActiveConnectionArc(null);
  }, []);

  // When a connection is confirmed and collected
  const handleCollectThread = useCallback(() => {
    if (!currentComparison) return;
    const { storyAId, storyBId, detail } = currentComparison;

    const connectionId = `${storyAId}-${storyBId}`;
    const reverseId = `${storyBId}-${storyAId}`;

    const alreadyExists = connections.some((c) => c.id === connectionId || c.id === reverseId);

    if (!alreadyExists) {
      const newConn: GoldenThreadConnection = {
        id: connectionId,
        storyA: storyAId,
        storyB: storyBId,
        motif: detail.sharedMotif,
        unlockedAt: Date.now()
      };
      setConnections((prev) => [...prev, newConn]);
    }

    setCurrentComparison(null);
    setActiveConnectionArc(null);
  }, [currentComparison, connections]);

  // Handle focus from Search Playable Stories (rotates globe, does NOT auto-open book!)
  const handleFocusPlayableStory = useCallback((storyId: StoryId) => {
    setFocusedStoryId(storyId);
    setSelectedStoryId(null);
    setIsStoryModalOpen(false);
    setActiveMotif(null);
    setHighlightedStoryIds([storyId]);
    const story = STORIES.find((s) => s.id === storyId);
    setFocusedSearchNotice(`Focused on ${story?.title} (${story?.country}). Tap the glowing beacon to open.`);
    setTimeout(() => {
      setFocusedSearchNotice(null);
    }, 6000);
  }, []);

  // Reset entire journey
  const handleResetGame = useCallback(() => {
    playGentleClick();
    setConnections([]);
    setSelectedStoryId(null);
    setFocusedStoryId(null);
    setIsStoryModalOpen(false);
    setActiveMotif(null);
    setHighlightedStoryIds([]);
    setActiveConnectionArc(null);
    setCurrentComparison(null);
    setIsCompletionOpen(false);
    setHasShownCompletionOnce(false);
    setIsSoloQuestVictoryOpen(false);
    setGameMode('free-exploration');
    setQuestState({
      isActive: false,
      startStoryId: 'cinderella',
      targetStoryId: 'kongjwi',
      currentStoryId: 'cinderella',
      visitedStoryIds: ['cinderella'],
      movesTaken: 0,
      minHops: 2,
      nonProgressMoves: 0,
      activeHint: null,
      isComplete: false
    });
    setDestinationRevealData(null);
    try {
      localStorage.removeItem(STORAGE_KEY_CONNECTIONS);
    } catch {
      // Ignore
    }
  }, []);

  const currentSelectedStory = STORIES.find((s) => s.id === selectedStoryId) || null;
  const compStoryA = currentComparison ? STORIES.find((s) => s.id === currentComparison.storyAId) : null;
  const compStoryB = currentComparison ? STORIES.find((s) => s.id === currentComparison.storyBId) : null;

  // Guidance status text for bottom dock
  const getGuidanceText = () => {
    if (activeMotif && highlightedStoryIds.length > 0) {
      const illuminatedTitles = STORIES.filter((s) => highlightedStoryIds.includes(s.id))
        .map((s) => `${s.title} (${s.country})`)
        .slice(0, 3)
        .join(', ');
      return `Follow the golden thread: click illuminated location (${illuminatedTitles}...) to weave parallel.`;
    }
    if (gameMode === 'solo-quest' && questState.isActive) {
      const target = STORIES.find((s) => s.id === questState.targetStoryId);
      return `Solo Quest: Navigate through shared motifs to reach ${target?.title} (${target?.country}).`;
    }
    if (gameMode === 'shared-journey' && activeSharedJourney) {
      const target = STORIES.find((s) => s.id === activeSharedJourney.creatorStoryId);
      return `Shared Journey: Travel across the globe to reach ${target?.title} (${target?.country}).`;
    }
    if (selectedStoryId && !isStoryModalOpen) {
      return `Inspecting ${currentSelectedStory?.title}. Choose a thread to follow or select another location.`;
    }
    if (!selectedStoryId) {
      return 'Choose a glowing location to discover its story.';
    }
    return undefined;
  };

  return (
    <div className="relative w-screen h-screen bg-[#070C16] text-[#F1E5CC] overflow-hidden select-none font-sans">
      {/* 3-Zone Top Bar with Working Audio & Volume Controls */}
      <HeaderNav
        onOpenJournal={() => setIsJournalOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenTraditions={() => setIsTraditionsOpen(true)}
        onOpenAudit={() => setIsAuditOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenModeSelect={() => setIsModeSelectOpen(true)}
        onFocusAtlas={() => {
          setSelectedStoryId(null);
          setIsStoryModalOpen(false);
          setCurrentComparison(null);
          setFocusedSearchNotice(null);
        }}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isMusicEnabled={isMusicEnabled}
        onToggleMusic={handleToggleMusic}
        musicVolume={musicVolume}
        onChangeVolume={handleChangeVolume}
        currentAtmosphere={getCurrentAtmosphereName()}
        connectionsCount={connections.length}
        gameMode={gameMode}
      />

      {/* Solo Quest Persistent Compact HUD */}
      {gameMode === 'solo-quest' && questState.isActive && !isSoloQuestVictoryOpen && (
        <SoloQuestHUD
          questState={questState}
          onOpenStory={(id) => handleSelectStory(id)}
          onRequestHint={handleRequestSoloHint}
          onAbortQuest={() => {
            setGameMode('free-exploration');
            setQuestState((prev) => ({ ...prev, isActive: false }));
          }}
        />
      )}

      {/* Shared Journey Persistent Compact HUD */}
      {gameMode === 'shared-journey' && activeSharedJourney && !isSharedReflectionOpen && (
        <div className="fixed top-18 sm:top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto w-full max-w-[92vw] sm:max-w-[720px]">
          <div className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-[#0B1424]/95 border border-[#D6B36B] shadow-[0_4px_30px_rgba(214,179,107,0.35)] backdrop-blur-md flex items-center justify-between gap-2 sm:gap-4 text-xs font-sans">
            {/* Destination Goal */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#D6B36B]/20 border border-[#D6B36B] flex items-center justify-center text-[#D6B36B] shrink-0">
                <Heart className="w-3.5 h-3.5 fill-[#D6B36B] text-[#D6B36B]" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-semibold text-[#D6B36B] tracking-wider truncate">
                  Destination
                </div>
                <div className="font-serif font-bold text-xs sm:text-sm text-[#FFF7E8] truncate">
                  {STORIES.find((s) => s.id === activeSharedJourney.creatorStoryId)?.title}{' '}
                  <span className="text-[#D6B36B]/80 font-sans text-[11px]">
                    ({STORIES.find((s) => s.id === activeSharedJourney.creatorStoryId)?.country})
                  </span>
                </div>
              </div>
            </div>

            {/* Current Story Location */}
            <div className="flex items-center gap-2 min-w-0 border-l border-[#D6B36B]/30 pl-2 sm:pl-3">
              <div className="w-7 h-7 rounded-full bg-[#19372F] border border-[#D6B36B]/50 flex items-center justify-center text-[#D6B36B] shrink-0">
                <Compass className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-semibold text-[#D6B36B]/90 tracking-wider truncate">
                  Current Story
                </div>
                <button
                  onClick={() => selectedStoryId && handleSelectStory(selectedStoryId)}
                  className="font-serif font-bold text-xs sm:text-sm text-[#FFF7E8] hover:text-[#D6B36B] transition-colors truncate flex items-center gap-1 cursor-pointer text-left"
                  title="Inspect current storybook"
                >
                  <span className="truncate">
                    {STORIES.find((s) => s.id === (selectedStoryId || activeSharedJourney.joinerStoryId))?.title}
                  </span>
                  <span className="text-[#D6B36B]/80 font-sans text-[11px] hidden sm:inline">
                    ({STORIES.find((s) => s.id === (selectedStoryId || activeSharedJourney.joinerStoryId))?.country})
                  </span>
                </button>
              </div>
            </div>

            {/* Moves & Actions */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 border-l border-[#D6B36B]/30 pl-2 sm:pl-3">
              <div className="text-center">
                <div className="text-[10px] text-[#F1E5CC]/70 uppercase font-medium">Moves</div>
                <div className="font-serif font-bold text-xs sm:text-sm text-[#D6B36B]">
                  {sharedJourneyMoves}
                </div>
              </div>
              <button
                onClick={() => setIsSharedJourneyModalOpen(true)}
                className="px-2.5 py-1 rounded bg-[#D6B36B]/20 hover:bg-[#D6B36B]/40 text-[#D6B36B] text-[11px] font-sans font-semibold cursor-pointer border border-[#D6B36B]/40"
              >
                Lore Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Exploration Prompt for Free Globe Exploration */}
      {hasOpenedAtlas &&
        gameMode === 'free-exploration' &&
        !selectedStoryId &&
        !isStoryModalOpen &&
        !activeMotif &&
        !focusedSearchNotice && (
          <div className="fixed top-18 sm:top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-all duration-300">
            <div className="px-4 py-2 rounded-full bg-[#0B1424]/90 border border-[#D6B36B]/60 shadow-[0_4px_25px_rgba(0,0,0,0.6)] backdrop-blur-md flex items-center gap-2 text-xs sm:text-sm font-serif text-[#F1E5CC] tracking-wide">
              <span className="text-[#D6B36B] text-sm animate-pulse">✦</span>
              <span>Choose a glowing location to discover its story.</span>
            </div>
          </div>
        )}

      {/* Focused Search Notice (When a story is searched, rotates without auto-opening) */}
      {focusedSearchNotice && !isStoryModalOpen && (
        <div className="fixed top-18 sm:top-20 left-1/2 -translate-x-1/2 z-20 transition-all duration-300 pointer-events-auto">
          <div className="px-4 py-2 rounded-full bg-[#142033]/95 border-2 border-[#D6B36B] shadow-[0_4px_30px_rgba(214,179,107,0.45)] backdrop-blur-md flex items-center gap-2.5 text-xs sm:text-sm font-serif text-[#FFF7E8]">
            <span className="text-[#D6B36B] text-sm animate-pulse">📍</span>
            <span>{focusedSearchNotice}</span>
            <button
              onClick={() => setFocusedSearchNotice(null)}
              className="text-[#D6B36B]/70 hover:text-[#FFF7E8] ml-1 text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Floating "Follow the golden thread." Banner with Clear Lens Button when Motif Lens is Active */}
      {activeMotif && highlightedStoryIds.length > 0 && !isStoryModalOpen && !currentComparison && (
        <div className="fixed top-18 sm:top-20 left-1/2 -translate-x-1/2 z-20 transition-all duration-300">
          <div className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#0B1424]/95 border-2 border-[#D6B36B] shadow-[0_4px_30px_rgba(214,179,107,0.45)] backdrop-blur-md flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm font-serif text-[#F1E5CC] tracking-wide">
            <span className="text-[#D6B36B] text-base animate-pulse">✦</span>
            <span className="font-semibold text-[#FFF7E8]">Follow the golden thread.</span>
            <span className="text-[#D6B36B]/80 hidden md:inline text-xs">
              Click an illuminated beacon to weave the thread.
            </span>
            <button
              onClick={handleClearLens}
              className="ml-1 sm:ml-2 px-2.5 py-1 rounded-full bg-[#D6B36B]/20 hover:bg-[#D6B36B]/40 text-[#D6B36B] hover:text-[#FFF7E8] text-[11px] font-sans font-medium border border-[#D6B36B]/50 transition-all cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Lens</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Visible "Enable Music" Button (Unlocks AudioContext & Starts Atmospheric Soundscape at 25%) */}
      {!isMusicEnabled && hasOpenedAtlas && (
        <div className="fixed bottom-24 sm:bottom-20 right-4 sm:right-6 z-40 animate-bounce duration-1000">
          <button
            onClick={() => {
              enableAudioByUserGesture();
            }}
            className="px-4 py-2.5 rounded-full bg-[#D6B36B] hover:bg-[#E7CCA0] text-[#0B1424] font-serif font-bold text-xs sm:text-sm shadow-[0_0_25px_rgba(214,179,107,0.7)] flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 border border-[#FFF7E8]"
            title="Enable Fairytale Soundscape (25% Volume)"
          >
            <Music className="w-4 h-4 animate-spin-slow text-[#0B1424]" />
            <span>Enable Atmospheric Music (25%)</span>
          </button>
        </div>
      )}

      {/* 3D Interactive Celestial Globe */}
      <main className="w-full h-full">
        <GlobeView
          selectedStoryId={selectedStoryId}
          focusedStoryId={focusedStoryId}
          onSelectStory={handleSelectStory}
          highlightedStoryIds={highlightedStoryIds}
          activeConnection={activeConnectionArc}
          completedConnections={connections}
          isStoryPanelOpen={isStoryModalOpen || !!currentComparison}
        />
      </main>

      {/* Collapsible Ergonomic Bottom Dock */}
      <BottomDock
        selectedStoryId={selectedStoryId}
        onSelectStory={handleSelectStory}
        connectionsCount={connections.length}
        onOpenJournal={() => setIsJournalOpen(true)}
        onReset={handleResetGame}
        guidanceText={getGuidanceText()}
        highlightedStoryIds={highlightedStoryIds}
        onClearLens={handleClearLens}
      />

      {/* 1. Cinematic Storybook Onboarding (Floating 3D Leather Book Opening & Map Zoom Dive) */}
      {!hasOpenedAtlas && (
        <StorybookOnboarding
          onComplete={() => {
            setHasOpenedAtlas(true);
            setSelectedStoryId(null);
            setIsStoryModalOpen(false);
            // Present Mode Selection Overlay seamlessly after onboarding
            setIsModeSelectOpen(true);
          }}
        />
      )}

      {/* Mode Selection Modal ("Where will your story take you?") */}
      {isModeSelectOpen && (
        <ModeSelectModal
          currentMode={gameMode}
          onSelectMode={(mode, startId) => {
            if (mode === 'solo-quest' && startId) {
              handlePrepareSoloQuest(startId);
            } else if (mode === 'shared-journey') {
              setGameMode('shared-journey');
              setIsModeSelectOpen(false);
              setIsSharedJourneyModalOpen(true);
            } else {
              setGameMode('free-exploration');
              setIsModeSelectOpen(false);
            }
          }}
          onClose={() => setIsModeSelectOpen(false)}
        />
      )}

      {/* Destination Reveal Modal (Appears BEFORE starting storybook opens!) */}
      {destinationRevealData && (
        <DestinationRevealModal
          mode={destinationRevealData.mode}
          startStory={STORIES.find((s) => s.id === destinationRevealData.startStoryId)!}
          destinationStory={STORIES.find((s) => s.id === destinationRevealData.targetStoryId)!}
          friendName={destinationRevealData.friendName}
          friendMessage={destinationRevealData.friendMessage}
          onBeginJourney={() => {
            if (destinationRevealData.mode === 'solo-quest') {
              handleBeginSoloQuest();
            } else {
              handleBeginSharedJourney();
            }
          }}
        />
      )}

      {/* Solo Quest Completion Screen (Reveals actual vs shortest moves) */}
      {isSoloQuestVictoryOpen && (
        <SoloQuestCompletionModal
          questState={questState}
          onPlayAgain={() => {
            setIsSoloQuestVictoryOpen(false);
            setIsModeSelectOpen(true);
          }}
          onExploreFreely={() => {
            setIsSoloQuestVictoryOpen(false);
            setGameMode('free-exploration');
          }}
          onOpenJournal={() => {
            setIsSoloQuestVictoryOpen(false);
            setIsJournalOpen(true);
          }}
        />
      )}

      {/* Multiplayer Shared Journey Modal */}
      {isSharedJourneyModalOpen && (
        <SharedJourneyModal
          initialJourneyData={activeSharedJourney}
          onClose={() => setIsSharedJourneyModalOpen(false)}
          onStartAsJoiner={handlePrepareSharedJourney}
          onSaveCreatedJourney={handleSaveCreatedJourney}
        />
      )}

      {/* Shared Journey Reflection Modal */}
      {isSharedReflectionOpen && activeSharedJourney && (
        <SharedJourneyReflectionModal
          journey={activeSharedJourney}
          onCompleteReflection={handleCompleteSharedReflection}
          onClose={() => {
            setIsSharedReflectionOpen(false);
            setGameMode('free-exploration');
          }}
        />
      )}

      {/* Dual Discovery Search Modal */}
      {isSearchOpen && (
        <DualSearchModal
          onClose={() => setIsSearchOpen(false)}
          onFocusPlayableStory={handleFocusPlayableStory}
        />
      )}

      {/* Centered Illustrated Story Book Spread */}
      {isStoryModalOpen && currentSelectedStory && (
        <StoryBookSpread
          story={currentSelectedStory}
          onClose={() => setIsStoryModalOpen(false)}
          onSelectStory={handleSelectStory}
          onSelectMotifLens={handleSelectMotifLens}
          activeMotif={activeMotif}
          onMinimizeToGlobe={() => setIsStoryModalOpen(false)}
        />
      )}

      {/* Centered Side-by-Side Comparison Book Spread */}
      {currentComparison && compStoryA && compStoryB && (
        <ComparisonBookSpread
          comparison={currentComparison.detail}
          storyA={compStoryA}
          storyB={compStoryB}
          onClose={() => {
            setCurrentComparison(null);
            setActiveConnectionArc(null);
          }}
          onThreadCollected={handleCollectThread}
          isAlreadyCollected={connections.some(
            (c) =>
              (c.storyA === compStoryA.id && c.storyB === compStoryB.id) ||
              (c.storyA === compStoryB.id && c.storyB === compStoryA.id)
          )}
        />
      )}

      {/* Storykeeper’s Journal */}
      {isJournalOpen && (
        <JournalModal
          connections={connections}
          onClose={() => setIsJournalOpen(false)}
          onSelectStoryFromJournal={(storyId) => {
            handleSelectStory(storyId);
          }}
        />
      )}

      {/* Completion Modal */}
      {isCompletionOpen && (
        <CompletionModal
          onClose={() => setIsCompletionOpen(false)}
          onOpenJournal={() => {
            setIsCompletionOpen(false);
            setIsJournalOpen(true);
          }}
          onResetGame={handleResetGame}
          connectionsCount={connections.length}
        />
      )}

      {/* Traditions Catalog Modal (All 15 World Cultural Traditions) */}
      {isTraditionsOpen && (
        <TraditionsModal
          onClose={() => setIsTraditionsOpen(false)}
          onSelectStory={(storyId) => {
            handleSelectStory(storyId);
          }}
        />
      )}

      {/* About & Methodology Modal */}
      {isAboutOpen && <AboutModal onClose={() => setIsAboutOpen(false)} />}

      {/* Fairytale Illustration Asset Audit Modal */}
      {isAuditOpen && (
        <IllustrationAuditModal
          onClose={() => setIsAuditOpen(false)}
          onSelectStory={(storyId) => handleSelectStory(storyId)}
        />
      )}
    </div>
  );
}
