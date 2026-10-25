import React, { useEffect, useState } from 'react';
import { Sparkles, Compass, BookOpen, RotateCcw, Award } from 'lucide-react';
import { playGoldenThreadResonance, playGentleClick } from '../utils/audio';

interface CompletionModalProps {
  onClose: () => void;
  onOpenJournal: () => void;
  onResetGame: () => void;
  connectionsCount: number;
}

interface Particle {
  id: number;
  left: string;
  delay: string;
  duration: string;
  size: number;
  color: string;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  onClose,
  onOpenJournal,
  onResetGame,
  connectionsCount
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    playGoldenThreadResonance();

    // Create 35 procedural golden stardust particles (zero external canvas dependencies)
    const colors = ['#D6B36B', '#FFF7E8', '#E7CCA0', '#FFD97D', '#F1E5CC'];
    const generated: Particle[] = Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 94 + 3}%`,
      delay: `${(Math.random() * 1.5).toFixed(2)}s`,
      duration: `${(Math.random() * 2 + 2.5).toFixed(2)}s`,
      size: Math.floor(Math.random() * 4 + 4),
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1424]/90 backdrop-blur-md animate-in fade-in duration-300 overflow-hidden">
      {/* Floating Golden Stardust Burst Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute bottom-0 rounded-full animate-pulse"
            style={{
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              boxShadow: `0 0 10px ${p.color}`,
              animation: `floatUp ${p.duration} ease-out ${p.delay} infinite`
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(0.6) rotate(0deg);
            opacity: 0;
          }
          20% {
            opacity: 0.9;
          }
          80% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-90vh) scale(1.2) rotate(180deg);
            opacity: 0;
          }
        }
      `}</style>

      <div className="relative max-w-xl w-full p-8 md:p-10 rounded-xl parchment-card border border-[#D6B36B]/60 shadow-2xl text-center space-y-6 z-10">
        {/* Emblem */}
        <div className="w-14 h-14 mx-auto rounded-full bg-[#19372F] border-2 border-[#D6B36B] flex items-center justify-center shadow-lg">
          <Award className="w-7 h-7 text-[#D6B36B]" />
        </div>

        {/* Title & Prompt Quoted Reflection */}
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-[0.25em] font-sans font-semibold text-[#A98336]">
            The Golden Tapestry Unveiled
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#19372F] leading-tight">
            “Different lands. Familiar stories. Countless ways to tell them.”
          </h2>
        </div>

        {/* Synthesis Prose */}
        <div className="text-sm font-sans text-[#19372F]/85 leading-relaxed space-y-3">
          <p>
            You have successfully woven {connectionsCount} Golden Threads across France, Korea, China, and India.
          </p>
          <p className="text-xs md:text-sm text-[#19372F]/75">
            You have observed how human imaginations independently converged upon motifs of unjust treatment,
            divine aids, and fateful lost tokens—while honoring each story’s sovereign history, philosophical
            foundations, and distinctive cultural voice.
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-[#D6B36B]/30 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              playGentleClick();
              onOpenJournal();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#19372F] hover:bg-[#234A3F] text-[#FFF7E8] font-serif font-semibold text-sm tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#D6B36B]" />
            <span>Review Storykeeper’s Journal</span>
          </button>

          <button
            onClick={() => {
              playGentleClick();
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-[#19372F]/30 hover:bg-[#EAE0C7] text-[#19372F] font-serif font-semibold text-sm tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-[#A98336]" />
            <span>Continue Free Exploration</span>
          </button>
        </div>

        {/* Reset option */}
        <div className="pt-2">
          <button
            onClick={() => {
              playGentleClick();
              onResetGame();
            }}
            className="text-xs font-sans text-[#19372F]/60 hover:text-[#19372F] underline transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Journey & Clear Threads</span>
          </button>
        </div>
      </div>
    </div>
  );
};
