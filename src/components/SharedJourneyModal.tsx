import React, { useState } from 'react';
import { motion } from 'motion/react';
import { StoryId, SharedJourneyData } from '../types';
import { STORIES } from '../data/stories';
import { findShortestPath } from '../utils/graphPathfinding';
import { Users, Link2, Copy, Check, ArrowRight, X, Heart, MessageSquare, Sparkles } from 'lucide-react';
import { playGentleClick, playCelestialChime } from '../utils/audio';

interface SharedJourneyModalProps {
  initialJourneyData?: SharedJourneyData | null;
  onClose: () => void;
  onStartAsJoiner: (journey: SharedJourneyData, startStoryId: StoryId) => void;
  onSaveCreatedJourney: (journey: SharedJourneyData) => void;
}

export const SharedJourneyModal: React.FC<SharedJourneyModalProps> = ({
  initialJourneyData,
  onClose,
  onStartAsJoiner,
  onSaveCreatedJourney
}) => {
  // If initialJourneyData exists and is not yet completed by joiner, show Joiner Accept Flow
  const isJoinerFlow = !!initialJourneyData && !initialJourneyData.isComplete;

  // Creator state
  const [creatorStoryId, setCreatorStoryId] = useState<StoryId>('cinderella');
  const [creatorName, setCreatorName] = useState('');
  const [creatorNote, setCreatorNote] = useState('');
  const [createdJourney, setCreatedJourney] = useState<SharedJourneyData | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  // Joiner state
  const [joinerStoryId, setJoinerStoryId] = useState<StoryId>('kongjwi');
  const [reachabilityError, setReachabilityError] = useState<string | null>(null);

  const handleCreateJourney = async () => {
    playCelestialChime();
    const journeyId = `thread_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const newJourney: SharedJourneyData = {
      id: journeyId,
      creatorStoryId,
      creatorName: creatorName.trim() || 'A Fellow Traveler',
      creatorNote: creatorNote.trim() || 'I invite you to weave a golden thread across cultures to meet my tale.',
      createdAt: Date.now()
    };

    // Save to local & API
    try {
      await fetch('/api/journeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJourney)
      });
    } catch {
      // Local fallback
    }

    setCreatedJourney(newJourney);
    onSaveCreatedJourney(newJourney);
  };

  const getShareUrl = (id: string) => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}${window.location.pathname}?journey=${id}`;
  };

  const handleCopyLink = () => {
    if (!createdJourney) return;
    const url = getShareUrl(createdJourney.id);
    navigator.clipboard.writeText(url);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2500);
  };

  const handleConfirmJoinerStart = () => {
    if (!initialJourneyData) return;
    if (joinerStoryId === initialJourneyData.creatorStoryId) {
      setReachabilityError('You chose the same tale as your friend! Please select a different origin tale to weave a thread across regions.');
      return;
    }

    const path = findShortestPath(joinerStoryId, initialJourneyData.creatorStoryId);
    if (!path) {
      setReachabilityError('No known path connects these two tales in the current atlas. Try another origin story.');
      return;
    }

    playCelestialChime();
    onStartAsJoiner(initialJourneyData, joinerStoryId);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md pointer-events-auto select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        className="relative w-full max-w-[620px] rounded-2xl bg-[#0E1726] border-2 border-[#D6B36B] p-5 sm:p-7 text-[#F1E5CC] shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden"
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 15 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#D6B36B]/70 hover:text-[#FFF7E8] hover:bg-[#D6B36B]/20 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isJoinerFlow ? (
          /* ================= PLAYER B: JOINING A SHARED JOURNEY ================= */
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-5 h-5 text-[#D6B36B]" />
              <span className="text-[11px] uppercase tracking-[0.2em] font-sans font-semibold text-[#D6B36B]">
                Shared Journey Invitation
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#FFF7E8]">
              Connect Your Fairytale with {initialJourneyData.creatorName || 'a Friend'}
            </h2>

            {/* Friend's Invitation Card */}
            <div className="my-4 p-4 rounded-xl bg-[#142033] border border-[#D6B36B]/40">
              <div className="flex items-center gap-2 text-xs font-serif text-[#D6B36B] mb-1">
                <Heart className="w-3.5 h-3.5 fill-[#D6B36B]" />
                <span>Destination Story Chosen for You:</span>
              </div>
              <div className="text-lg font-serif font-bold text-[#FFF7E8]">
                {STORIES.find((s) => s.id === initialJourneyData.creatorStoryId)?.title}
                <span className="text-xs font-sans text-[#D6B36B]/80 ml-1.5">
                  ({STORIES.find((s) => s.id === initialJourneyData.creatorStoryId)?.country})
                </span>
              </div>
              {initialJourneyData.creatorNote && (
                <div className="mt-2.5 pt-2 border-t border-[#D6B36B]/20 text-xs italic font-serif text-[#F1E5CC]/90">
                  “{initialJourneyData.creatorNote}”
                </div>
              )}
            </div>

            {/* Choose Player B Starting Story */}
            <div className="mb-3">
              <label className="block text-xs font-serif font-bold text-[#FFF7E8] mb-1.5">
                Choose Your Origin Fairytale:
              </label>
              <select
                value={joinerStoryId}
                onChange={(e) => {
                  setJoinerStoryId(e.target.value as StoryId);
                  setReachabilityError(null);
                }}
                className="w-full p-2.5 rounded-lg bg-[#0B1424] border border-[#D6B36B]/60 text-xs sm:text-sm font-serif text-[#FFF7E8] focus:outline-none focus:border-[#D6B36B]"
              >
                {STORIES.filter((s) => s.id !== initialJourneyData.creatorStoryId).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.country})
                  </option>
                ))}
              </select>
            </div>

            {reachabilityError && (
              <div className="p-2.5 rounded bg-red-950/60 border border-red-500/50 text-red-200 text-xs font-sans mb-3">
                {reachabilityError}
              </div>
            )}

            <button
              onClick={handleConfirmJoinerStart}
              className="w-full mt-3 py-2.5 rounded-full bg-[#D6B36B] hover:bg-[#E7CCA0] text-[#0B1424] font-serif font-bold text-sm transition-all shadow-[0_0_20px_rgba(214,179,107,0.4)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Begin Your Journey Toward {STORIES.find((s) => s.id === initialJourneyData.creatorStoryId)?.title}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : createdJourney ? (
          /* ================= CREATED SHARE LINK ================= */
          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-full bg-[#D6B36B]/20 border border-[#D6B36B] flex items-center justify-center text-[#D6B36B] mx-auto mb-3 shadow-[0_0_25px_rgba(214,179,107,0.3)]">
              <Sparkles className="w-7 h-7" />
            </div>

            <span className="text-[11px] uppercase tracking-[0.2em] font-sans font-semibold text-[#D6B36B]">
              Journey Invitation Created
            </span>

            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#FFF7E8] mt-1">
              Your Thread is Waiting
            </h3>

            <p className="text-xs sm:text-sm font-serif text-[#F1E5CC]/80 mt-1 max-w-md mx-auto">
              Share this link with a friend. They will pick their own story and travel across the globe to reach your tale of{' '}
              <strong className="text-[#FFF7E8]">{STORIES.find((s) => s.id === createdJourney.creatorStoryId)?.title}</strong>.
            </p>

            <div className="my-5 p-3 rounded-xl bg-[#0B1424] border border-[#D6B36B]/50 flex items-center gap-2 text-left">
              <input
                type="text"
                readOnly
                value={getShareUrl(createdJourney.id)}
                className="w-full bg-transparent text-xs text-[#FFF7E8] font-mono outline-none truncate"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-md bg-[#D6B36B] hover:bg-[#E7CCA0] text-[#0B1424] text-xs font-sans font-bold flex items-center gap-1 shrink-0 cursor-pointer transition-all"
              >
                {hasCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{hasCopied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-full bg-[#142033] hover:bg-[#1C2C47] text-[#FFF7E8] font-sans text-xs border border-[#D6B36B]/50 transition-all cursor-pointer"
              >
                Return to Atlas
              </button>
            </div>
          </div>
        ) : (
          /* ================= PLAYER A: CREATING A NEW JOURNEY ================= */
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-5 h-5 text-[#D6B36B]" />
              <span className="text-[11px] uppercase tracking-[0.2em] font-sans font-semibold text-[#D6B36B]">
                Multiplayer Shared Journey
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#FFF7E8]">
              Invite a Traveler Across the Globe
            </h2>

            <p className="text-xs text-[#F1E5CC]/80 font-serif mt-1">
              Select a fairytale that speaks to you, write an optional personal message, and generate a shareable link.
            </p>

            {/* Choose Destination Story */}
            <div className="mt-4">
              <label className="block text-xs font-serif font-bold text-[#FFF7E8] mb-1">
                Your Chosen Fairytale (Destination):
              </label>
              <select
                value={creatorStoryId}
                onChange={(e) => setCreatorStoryId(e.target.value as StoryId)}
                className="w-full p-2 rounded-lg bg-[#0B1424] border border-[#D6B36B]/60 text-xs sm:text-sm font-serif text-[#FFF7E8] focus:outline-none focus:border-[#D6B36B]"
              >
                {STORIES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.country})
                  </option>
                ))}
              </select>
            </div>

            {/* Your Name */}
            <div className="mt-3">
              <label className="block text-xs font-serif font-bold text-[#FFF7E8] mb-1">
                Your Name / Traveler Alias:
              </label>
              <input
                type="text"
                placeholder="e.g. Storykeeper Elena"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#0B1424] border border-[#D6B36B]/60 text-xs sm:text-sm font-sans text-[#FFF7E8] focus:outline-none focus:border-[#D6B36B]"
              />
            </div>

            {/* Personal Message */}
            <div className="mt-3">
              <label className="block text-xs font-serif font-bold text-[#FFF7E8] mb-1">
                Personal Message or Bedtime Lore (Optional):
              </label>
              <textarea
                rows={3}
                placeholder="e.g. This story was read to me by my grandmother. Can you find your way here from your favorite tale?"
                value={creatorNote}
                onChange={(e) => setCreatorNote(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#0B1424] border border-[#D6B36B]/60 text-xs sm:text-sm font-serif text-[#FFF7E8] focus:outline-none focus:border-[#D6B36B] resize-none"
              />
            </div>

            <button
              onClick={handleCreateJourney}
              className="w-full mt-5 py-2.5 rounded-full bg-[#D6B36B] hover:bg-[#E7CCA0] text-[#0B1424] font-serif font-bold text-sm transition-all shadow-[0_0_20px_rgba(214,179,107,0.4)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Link2 className="w-4 h-4" />
              <span>Create Shareable Journey Link</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
