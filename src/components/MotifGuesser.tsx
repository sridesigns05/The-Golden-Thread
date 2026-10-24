import React, { useState } from 'react';
import { StoryData, MotifId } from '../types';
import { MOTIFS_CATALOG } from '../data/motifs';
import { getRelatedStoriesForMotif } from '../data/comparisons';
import { STORIES } from '../data/stories';
import { Sparkles, HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { playCelestialChime, playGentleClick } from '../utils/audio';

interface MotifGuesserProps {
  story: StoryData;
  onCorrectGuess: (motif: MotifId, relatedStoryIds: StoryData[]) => void;
  alreadySolvedMotif?: MotifId | null;
}

export const MotifGuesser: React.FC<MotifGuesserProps> = ({
  story,
  onCorrectGuess,
  alreadySolvedMotif
}) => {
  const [selectedOption, setSelectedOption] = useState<MotifId | null>(alreadySolvedMotif || null);
  const [feedback, setFeedback] = useState<{ status: 'idle' | 'correct' | 'incorrect'; message: string }>({
    status: alreadySolvedMotif ? 'correct' : 'idle',
    message: alreadySolvedMotif ? 'Golden connection revealed across the celestial atlas.' : ''
  });

  // Curate 3 options for the challenge:
  // Must include valid cross-story motifs for this story, plus a distractor or unique motif
  const getCuratedOptions = (storyId: string): MotifId[] => {
    switch (storyId) {
      case 'cinderella':
        return ['supernatural-assistance', 'lost-object-recognition', 'memory-and-forgetting'];
      case 'kongjwi':
        return ['lost-object-recognition', 'supernatural-assistance', 'love-and-duty'];
      case 'yexian':
        return ['lost-object-recognition', 'supernatural-assistance', 'separation-and-reunion'];
      case 'shakuntala':
        return ['lost-object-recognition', 'transformation', 'unjust-treatment'];
      default:
        return ['lost-object-recognition', 'supernatural-assistance', 'unjust-treatment'];
    }
  };

  const options = getCuratedOptions(story.id);

  const handleSelectOption = (motifId: MotifId) => {
    playGentleClick();
    setSelectedOption(motifId);

    // Check if this motif is genuinely present in this story AND has related stories in our atlas
    const hasMotifInStory = story.motifs.includes(motifId);
    const relatedIds = getRelatedStoriesForMotif(story.id, motifId);

    if (hasMotifInStory && relatedIds.length > 0) {
      playCelestialChime();
      const matchedStories = STORIES.filter((s) => relatedIds.includes(s.id));
      setFeedback({
        status: 'correct',
        message: `✦ Radiant connection found! This motif illuminates ${matchedStories
          .map((s) => `${s.title} (${s.country})`)
          .join(' and ')} on the globe.`
      });
      onCorrectGuess(motifId, matchedStories);
    } else if (hasMotifInStory && relatedIds.length === 0) {
      setFeedback({
        status: 'incorrect',
        message:
          'While this motif is present in this tale, it does not connect to other stories in this current atlas quartet. Try another motif!'
      });
    } else {
      setFeedback({
        status: 'incorrect',
        message: 'This motif is not characteristic of this story’s primary structure. Re-read the retelling and try again.'
      });
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-[#D6B36B]/30">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-[#A98336]" />
        <span className="text-xs uppercase tracking-widest font-sans font-semibold text-[#19372F]">
          The Golden Thread Challenge
        </span>
      </div>

      <h4 className="text-lg font-serif font-semibold text-[#19372F] mb-1">
        Which hidden motif connects this tale to another part of the world?
      </h4>
      <p className="text-xs font-sans text-[#19372F]/70 mb-4">
        Select the narrative pattern that echoes across continents.
      </p>

      {/* Motif Options */}
      <div className="space-y-2.5">
        {options.map((optionId) => {
          const info = MOTIFS_CATALOG[optionId];
          const isSelected = selectedOption === optionId;
          const isCurrentCorrect = isSelected && feedback.status === 'correct';
          const isCurrentIncorrect = isSelected && feedback.status === 'incorrect';

          return (
            <button
              key={optionId}
              onClick={() => handleSelectOption(optionId)}
              className={`w-full text-left p-3.5 rounded-lg border transition-all duration-150 cursor-pointer ${
                isCurrentCorrect
                  ? 'bg-[#19372F] border-[#D6B36B] text-[#FFF7E8] shadow-md'
                  : isCurrentIncorrect
                  ? 'bg-[#EBDDC4] border-red-300 text-[#19372F]'
                  : 'bg-[#F9F3E6] hover:bg-[#FFF7E8] border-[#D6B36B]/40 text-[#19372F]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-serif font-medium text-base leading-snug">
                    {info.name}
                  </div>
                  <div
                    className={`text-xs mt-1 leading-relaxed ${
                      isCurrentCorrect ? 'text-[#E7CCA0]' : 'text-[#19372F]/75'
                    }`}
                  >
                    {info.shortDescription}
                  </div>
                </div>

                <div className="shrink-0 mt-0.5">
                  {isCurrentCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-[#D6B36B]" />
                  ) : isCurrentIncorrect ? (
                    <AlertCircle className="w-5 h-5 text-amber-700" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-[#D6B36B]/60" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Feedback Alert */}
      {feedback.status !== 'idle' && (
        <div
          className={`mt-4 p-3 rounded-lg text-xs font-sans leading-relaxed flex items-start gap-2.5 ${
            feedback.status === 'correct'
              ? 'bg-[#19372F]/10 border border-[#19372F]/30 text-[#19372F] font-medium'
              : 'bg-amber-100/60 border border-amber-300/60 text-amber-900'
          }`}
        >
          {feedback.status === 'correct' ? (
            <Sparkles className="w-4 h-4 text-[#A98336] shrink-0 mt-0.5" />
          ) : (
            <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          )}
          <div>{feedback.message}</div>
        </div>
      )}
    </div>
  );
};
