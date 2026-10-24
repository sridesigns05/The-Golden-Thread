import React, { useState, useEffect, useCallback } from 'react';
import { StoryId, MotifId, GoldenThreadConnection, ComparisonDetail } from './types';
import { STORIES } from './data/stories';
import { getComparison, getRelatedStoriesForMotif } from './data/comparisons';
import { setSoundMuted, getSoundMuted, playGoldenThreadResonance, playGentleClick, playParchmentRustle } from './utils/audio';

// Components
import { GlobeView } from './components/GlobeView';
import { LandingHero } from './components/LandingHero';
import { HeaderNav } from './components/HeaderNav';
import { BottomDock } from './components/BottomDock';
import { StoryModal } from './components/StoryModal';
import { ComparisonModal } from './components/ComparisonModal';
import { JournalModal } from './components/JournalModal';
import { CompletionModal } from './components/CompletionModal';
import { AboutModal } from './components/AboutModal';
import { TraditionsModal } from './components/TraditionsModal';

const STORAGE_KEY_CONNECTIONS = 'golden_thread_connections_v1';
const STORAGE_KEY_VISITED = 'golden_thread_visited_v1';
const STORAGE_KEY_MUTED = 'golden_thread_muted_v1';

export default function App() {
  // Navigation & Game State
  const [hasOpenedAtlas, setHasOpenedAtlas] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState<StoryId | null>(null);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);

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

  // Woven Threads (Saved in localStorage)
  const [connections, setConnections] = useState<GoldenThreadConnection[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONNECTIONS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore localStorage errors
    }
    return [];
  });

  // Modal Overlays
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isCompletionOpen, setIsCompletionOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isTraditionsOpen, setIsTraditionsOpen] = useState(false);
  const [hasShownCompletionOnce, setHasShownCompletionOnce] = useState(false);

  // Sound Mute State
  const [isMuted, setIsMutedState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MUTED);
      if (saved !== null) {
        const val = JSON.parse(saved);
        setSoundMuted(val);
        return val;
      }
    } catch {
      // Ignore
    }
    return false;
  });

  // Save connections in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONNECTIONS, JSON.stringify(connections));
    } catch {
      // Ignore
    }
  }, [connections]);

  // Check completion trigger (when 3 unique connections are collected)
  useEffect(() => {
    if (connections.length >= 3 && !hasShownCompletionOnce && !currentComparison) {
      setIsCompletionOpen(true);
      setHasShownCompletionOnce(true);
    }
  }, [connections.length, hasShownCompletionOnce, currentComparison]);

  const handleToggleMute = useCallback(() => {
    const nextVal = !isMuted;
    setIsMutedState(nextVal);
    setSoundMuted(nextVal);
    try {
      localStorage.setItem(STORAGE_KEY_MUTED, JSON.stringify(nextVal));
    } catch {
      // Ignore
    }
  }, [isMuted]);

  // When a story marker or quick selector is clicked
  const handleSelectStory = useCallback(
    (storyId: StoryId) => {
      // If there are highlighted stories from a solved motif, and the user clicked an illuminated story,
      // trigger the Golden Thread connection!
      if (selectedStoryId && selectedStoryId !== storyId && highlightedStoryIds.includes(storyId)) {
        const comp = getComparison(selectedStoryId, storyId, activeMotif || undefined);
        if (comp) {
          // Animate golden arc on globe
          setActiveConnectionArc({ from: selectedStoryId, to: storyId });
          // Open comparison dialog
          setCurrentComparison({
            detail: comp,
            storyAId: selectedStoryId,
            storyBId: storyId
          });
          setIsStoryModalOpen(false);
          return;
        }
      }

      // Otherwise, open the story view for this story
      setSelectedStoryId(storyId);
      setIsStoryModalOpen(true);
      // Reset transient highlighted stories until user solves or has solved a motif
      setActiveMotif(null);
      setHighlightedStoryIds([]);
      setActiveConnectionArc(null);
    },
    [selectedStoryId, highlightedStoryIds, activeMotif]
  );

  // When a motif is guessed correctly in the StoryModal
  const handleMotifSolved = useCallback(
    (motif: MotifId) => {
      if (!selectedStoryId) return;
      setActiveMotif(motif);
      const relatedIds = getRelatedStoriesForMotif(selectedStoryId, motif);
      setHighlightedStoryIds(relatedIds);
    },
    [selectedStoryId]
  );

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
    // Keep the active arc visible as completed
    setActiveConnectionArc(null);
  }, [currentComparison, connections]);

  // Reset entire journey
  const handleResetGame = useCallback(() => {
    playGentleClick();
    setConnections([]);
    setSelectedStoryId(null);
    setIsStoryModalOpen(false);
    setActiveMotif(null);
    setHighlightedStoryIds([]);
    setActiveConnectionArc(null);
    setCurrentComparison(null);
    setIsCompletionOpen(false);
    setHasShownCompletionOnce(false);
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
    if (highlightedStoryIds.length > 0) {
      const illuminatedTitles = STORIES.filter((s) => highlightedStoryIds.includes(s.id))
        .map((s) => `${s.title} (${s.country})`)
        .join(', ');
      return `Motif confirmed! Click illuminated beacon (${illuminatedTitles}) to weave the thread.`;
    }
    if (selectedStoryId && !isStoryModalOpen) {
      return `Inspecting ${currentSelectedStory?.title}. Click anywhere or click story button to open story parchment.`;
    }
    if (!selectedStoryId) {
      return 'Rotate the globe and click any glowing story beacon to begin exploring.';
    }
    return undefined;
  };

  return (
    <div className="relative w-screen h-screen bg-[#0B1424] text-[#F1E5CC] overflow-hidden select-none font-sans">
      {/* 3-Zone Top Bar */}
      <HeaderNav
        onOpenJournal={() => setIsJournalOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenTraditions={() => setIsTraditionsOpen(true)}
        onFocusAtlas={() => {
          setSelectedStoryId(null);
          setIsStoryModalOpen(false);
        }}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        connectionsCount={connections.length}
      />

      {/* 3D Interactive Celestial Globe */}
      <main className="w-full h-full">
        <GlobeView
          selectedStoryId={selectedStoryId}
          onSelectStory={handleSelectStory}
          highlightedStoryIds={highlightedStoryIds}
          activeConnection={activeConnectionArc}
          completedConnections={connections}
          isStoryPanelOpen={isStoryModalOpen || isJournalOpen || !!currentComparison}
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
      />

      {/* Step 1: Landing Hero (Shows on first visit until user clicks "Open the Atlas") */}
      {!hasOpenedAtlas && (
        <LandingHero
          onOpenAtlas={() => {
            setHasOpenedAtlas(true);
            // Default focus to France / Cinderella as an inviting starting point
            handleSelectStory('cinderella');
          }}
        />
      )}

      {/* Step 2 & 3: Story Parchment Modal & Motif Guesser */}
      {isStoryModalOpen && currentSelectedStory && (
        <StoryModal
          story={currentSelectedStory}
          onClose={() => setIsStoryModalOpen(false)}
          onMotifSolved={handleMotifSolved}
          activeMotif={activeMotif}
          highlightedStoryCount={highlightedStoryIds.length}
          onViewGlobeHighlights={() => setIsStoryModalOpen(false)}
        />
      )}

      {/* Step 5: Cultural Comparison Dialog */}
      {currentComparison && compStoryA && compStoryB && (
        <ComparisonModal
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

      {/* Step 6: Storykeeper’s Journal */}
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

      {/* Traditions Catalog Modal */}
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
    </div>
  );
}
