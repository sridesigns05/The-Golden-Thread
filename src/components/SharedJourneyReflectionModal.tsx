import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SharedJourneyData } from '../types';
import { STORIES } from '../data/stories';
import confetti from 'canvas-confetti';
import { Sparkles, Heart, MessageSquare, ArrowRight, Share2, Check } from 'lucide-react';
import { playCelestialChime } from '../utils/audio';

interface SharedJourneyReflectionModalProps {
  journey: SharedJourneyData;
  onCompleteReflection: (reflectionText: string, joinerName: string) => void;
  onClose: () => void;
}

export const SharedJourneyReflectionModal: React.FC<SharedJourneyReflectionModalProps> = ({
  journey,
  onCompleteReflection,
  onClose
}) => {
  const [reflectionText, setReflectionText] = useState('');
  const [joinerName, setJoinerName] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const startStory = STORIES.find((s) => s.id === journey.joinerStoryId);
  const targetStory = STORIES.find((s) => s.id === journey.creatorStoryId);

  React.useEffect(() => {
    playCelestialChime();
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#D6B36B', '#FFF7E8', '#E7CCA0', '#FF7B54']
      });
    } catch {
      // Ignore
    }
  }, []);

  const handleSubmit = () => {
    playCelestialChime();
    setIsSaved(true);
    onCompleteReflection(
      reflectionText.trim() || 'Two faraway traditions united through the ancient golden thread.',
      joinerName.trim() || 'A Fellow Traveler'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md pointer-events-auto select-none">
      <motion.div
        className="relative w-full max-w-[620px] rounded-2xl bg-[#0E1726] border-2 border-[#D6B36B] p-6 sm:p-8 text-[#F1E5CC] shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-[#D6B36B]/20 border-2 border-[#D6B36B] flex items-center justify-center text-[#D6B36B] mx-auto mb-3 shadow-[0_0_25px_rgba(214,179,107,0.4)]">
            <Heart className="w-7 h-7 fill-[#D6B36B]" />
          </div>

          <span className="text-[11px] uppercase tracking-[0.25em] font-sans font-semibold text-[#D6B36B]">
            Shared Journey Fulfilled
          </span>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#FFF7E8] mt-1">
            You Have Met Across the Globe!
          </h2>

          <p className="text-xs sm:text-sm font-serif text-[#F1E5CC]/85 mt-2 max-w-md mx-auto">
            You traveled from <strong className="text-[#FFF7E8]">{startStory?.title}</strong> ({startStory?.country}) and successfully reached <strong className="text-[#FFF7E8]">{targetStory?.title}</strong> ({targetStory?.country}), answering the call of {journey.creatorName || 'your friend'}.
          </p>

          {/* Friend's Original Note */}
          {journey.creatorNote && (
            <div className="my-4 p-3.5 rounded-xl bg-[#142033] border border-[#D6B36B]/30 text-left text-xs font-serif italic text-[#F1E5CC]">
              <div className="text-[10px] uppercase font-sans font-semibold text-[#D6B36B] not-italic mb-1">
                {journey.creatorName}’s Invitation Note:
              </div>
              “{journey.creatorNote}”
            </div>
          )}

          {!isSaved ? (
            <div className="mt-4 text-left">
              <label className="block text-xs font-serif font-bold text-[#FFF7E8] mb-1">
                Your Reflection / Note Back:
              </label>
              <textarea
                rows={3}
                placeholder="What did you feel weaving these two worlds together? e.g. We both discovered that virtue shines even when surrounded by hardship..."
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-[#0B1424] border border-[#D6B36B]/60 text-xs sm:text-sm font-serif text-[#FFF7E8] focus:outline-none focus:border-[#D6B36B] resize-none mb-3"
              />

              <div className="mb-4">
                <label className="block text-xs font-serif font-bold text-[#FFF7E8] mb-1">
                  Your Traveler Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Storykeeper Maya"
                  value={joinerName}
                  onChange={(e) => setJoinerName(e.target.value)}
                  className="w-full p-2 rounded-lg bg-[#0B1424] border border-[#D6B36B]/60 text-xs sm:text-sm font-sans text-[#FFF7E8] focus:outline-none focus:border-[#D6B36B]"
                />
              </div>

              <button
                onClick={handleSubmit}
                className="w-full py-2.5 rounded-full bg-[#D6B36B] hover:bg-[#E7CCA0] text-[#0B1424] font-serif font-bold text-sm transition-all shadow-[0_0_20px_rgba(214,179,107,0.4)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Save Joint Storykeeper Plaque</span>
              </button>
            </div>
          ) : (
            <div className="mt-5 p-4 rounded-xl bg-[#142033] border border-[#D6B36B] text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#D6B36B] mb-2 font-serif">
                <Check className="w-4 h-4" />
                <span>Joint Journey Plaque Sealed</span>
              </div>
              <p className="text-xs font-serif text-[#F1E5CC] italic mb-4">
                “{reflectionText || 'Two faraway traditions united through the ancient golden thread.'}”
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-full bg-[#D6B36B] text-[#0B1424] font-serif font-bold text-xs cursor-pointer hover:bg-[#E7CCA0] transition-all"
              >
                Close & Explore Atlas
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
