import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Image as ImageIcon, Upload, CheckCircle2, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { STORIES } from '../data/stories';
import { StoryId } from '../types';
import { playGentleClick, playCelestialChime } from '../utils/audio';

interface IllustrationAuditModalProps {
  onClose: () => void;
  onSelectStory?: (id: StoryId) => void;
}

export interface StoryAssetStatus {
  storyId: StoryId;
  title: string;
  country: string;
  path: string;
  fileExists: boolean;
  type: 'Real Masterpiece' | 'Dedicated Slot';
  recommendedPrompt: string;
}

export const AUDIT_DATA: StoryAssetStatus[] = [
  {
    storyId: 'cinderella',
    title: 'Cinderella',
    country: 'France',
    path: '/assets/images/stories/cinderella.jpg',
    fileExists: true,
    type: 'Real Masterpiece',
    recommendedPrompt: 'Vintage illuminated fairytale book illustration of Cinderella in Parisian courtly waltz...'
  },
  {
    storyId: 'kongjwi',
    title: 'Kongjwi and Patjwi',
    country: 'Korea',
    path: '/assets/images/stories/kongjwi.jpg',
    fileExists: true,
    type: 'Real Masterpiece',
    recommendedPrompt: 'Traditional Korean fairytale illustration of Kongjwi with silk shoe and black ox...'
  },
  {
    storyId: 'yexian',
    title: 'Ye Xian',
    country: 'China',
    path: '/assets/images/stories/yexian.jpg',
    fileExists: true,
    type: 'Real Masterpiece',
    recommendedPrompt: 'Tang Dynasty illuminated manuscript of Ye Xian beside lotus pond feeding radiant spirit carp...'
  },
  {
    storyId: 'shakuntala',
    title: 'The Recognition of Shakuntala',
    country: 'India',
    path: '/assets/images/stories/shakuntala.jpg',
    fileExists: true,
    type: 'Real Masterpiece',
    recommendedPrompt: 'Classical Sanskrit hermitage scene of Shakuntala with royal signet ring and Malini river...'
  },
  {
    storyId: 'vasilisa',
    title: 'Vasilisa the Beautiful',
    country: 'Russia',
    path: '/assets/images/stories/vasilisa.jpg',
    fileExists: false,
    type: 'Dedicated Slot',
    recommendedPrompt: 'Illuminated fairytale illustration of Vasilisa holding glowing skull lantern in dark birch forest, Ivan Bilibin style'
  },
  {
    storyId: 'anansi',
    title: 'Anansi and the Box of Stories',
    country: 'Ghana',
    path: '/assets/images/stories/anansi.jpg',
    fileExists: false,
    type: 'Dedicated Slot',
    recommendedPrompt: 'Rich West African folklore illustration of Anansi spinning golden web threads beneath the Golden Stool of Nyame'
  },
  {
    storyId: 'momotaro',
    title: 'Momotaro, the Peach Boy',
    country: 'Japan',
    path: '/assets/images/stories/momotaro.jpg',
    fileExists: false,
    type: 'Dedicated Slot',
    recommendedPrompt: 'Edo woodblock-inspired fairytale illustration of Momotaro in samurai armor with loyal dog, monkey, and pheasant'
  },
  {
    storyId: 'golden-crab',
    title: 'The Golden Crab',
    country: 'Greece',
    path: '/assets/images/stories/golden-crab.jpg',
    fileExists: false,
    type: 'Dedicated Slot',
    recommendedPrompt: 'Mythological Mediterranean fairytale illustration of enchanted prince as golden crab casting off crustacean shell'
  },
  {
    storyId: 'urashima-taro',
    title: 'Urashima Taro and the Dragon Palace',
    country: 'Japan',
    path: '/assets/images/stories/urashima-taro.jpg',
    fileExists: false,
    type: 'Dedicated Slot',
    recommendedPrompt: 'Underwater Dragon Palace of Ryugu-jo with Princess Otohime presenting glowing lacquered Tamatebako box'
  },
  {
    storyId: 'sedna',
    title: 'Sedna, Mistress of the Ocean Deep',
    country: 'Canada / Greenland',
    path: '/assets/images/stories/sedna.jpg',
    fileExists: false,
    type: 'Dedicated Slot',
    recommendedPrompt: 'Inuit cosmological legend of Sedna submerged beneath Arctic pack ice with marine creatures swimming in hair'
  },
  {
    storyId: 'rhodopis',
    title: 'Rhodopis and the Rose-Red Slipper',
    country: 'Egypt',
    path: '/assets/images/stories/rhodopis.jpg',
    fileExists: false,
    type: 'Dedicated Slot',
    recommendedPrompt: 'Ancient Egyptian Greco-Egyptian illustration of royal eagle of Horus carrying rose-red gilded sandal to Pharaoh'
  },
  {
    storyId: 'one-hand-girl',
    title: 'The Maiden Without Hands',
    country: 'Tanzania',
    path: '/assets/images/stories/one-hand-girl.jpg',
    fileExists: false,
    type: 'Dedicated Slot',
    recommendedPrompt: 'East African folklore illustration of Binti Ali sheltered inside hollow sacred baobab tree with silver signet amulet'
  },
  {
    storyId: 'mufaro',
    title: 'Mufaro’s Beautiful Daughters',
    country: 'Zimbabwe',
    path: '/assets/images/stories/mufaro.jpg',
    fileExists: false,
    type: 'Dedicated Slot',
    recommendedPrompt: 'Great Zimbabwe stone citadel sunrise with Nyasha feeding sweet millet bread to friendly green garden serpent'
  },
  {
    storyId: 'popol-vuh-twins',
    title: 'The Hero Twins and the Lords of Xibalba',
    country: 'Guatemala',
    path: '/assets/images/stories/popol-vuh-twins.jpg',
    fileExists: false,
    type: 'Dedicated Slot',
    recommendedPrompt: 'Ancient Highland Maya codex illustration of Hunahpu and Xbalanque with rubber ball and enchanted glowing torch'
  },
  {
    storyId: 'baba-abdalla',
    title: 'The Story of Blind Baba Abdalla',
    country: 'Iraq',
    path: '/assets/images/stories/baba-abdalla.jpg',
    fileExists: false,
    type: 'Dedicated Slot',
    recommendedPrompt: 'One Thousand and One Nights manuscript illustration of dervish holding enchanted ointment jar in Baghdad market'
  }
];

export const IllustrationAuditModal: React.FC<IllustrationAuditModalProps> = ({ onClose, onSelectStory }) => {
  const [customArt, setCustomArt] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load custom artwork from localStorage
    const stored: Record<string, string> = {};
    STORIES.forEach((s) => {
      const val = localStorage.getItem(`custom_illustration_${s.id}`);
      if (val) stored[s.id] = val;
    });
    setCustomArt(stored);
  }, []);

  const handleFileUpload = (storyId: StoryId, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        localStorage.setItem(`custom_illustration_${storyId}`, dataUrl);
        setCustomArt((prev) => ({ ...prev, [storyId]: dataUrl }));
        window.dispatchEvent(new Event('golden_thread_illustration_updated'));
        playCelestialChime();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustom = (storyId: StoryId) => {
    localStorage.removeItem(`custom_illustration_${storyId}`);
    setCustomArt((prev) => {
      const next = { ...prev };
      delete next[storyId];
      return next;
    });
    window.dispatchEvent(new Event('golden_thread_illustration_updated'));
    playGentleClick();
  };

  const workingCount = AUDIT_DATA.filter((item) => item.fileExists || !!customArt[item.storyId]).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md pointer-events-auto select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        className="relative w-full max-w-[850px] max-h-[90vh] rounded-2xl bg-[#0E1726] border-2 border-[#D6B36B] p-5 sm:p-7 text-[#F1E5CC] shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col justify-between overflow-hidden"
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#D6B36B]/30 mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D6B36B]/20 border border-[#D6B36B] flex items-center justify-center text-[#D6B36B]">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-[#FFF7E8]">
                Fairytale Illustration Asset Audit
              </h3>
              <p className="text-xs font-sans text-[#D6B36B]/80">
                15 Playable Tales · {workingCount} Active Illustrations · {15 - workingCount} Awaiting Supply
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#D6B36B]/70 hover:text-[#FFF7E8] hover:bg-[#D6B36B]/20 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audit Table */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 my-2">
          {AUDIT_DATA.map((item) => {
            const hasCustom = !!customArt[item.storyId];
            const isReady = item.fileExists || hasCustom;

            return (
              <div
                key={item.storyId}
                className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isReady
                    ? 'bg-[#142033]/90 border-[#D6B36B]/50'
                    : 'bg-[#121622]/80 border-dashed border-[#D6B36B]/30'
                }`}
              >
                {/* Story Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-[#D6B36B]/40 bg-black/40 flex items-center justify-center">
                    {hasCustom ? (
                      <img src={customArt[item.storyId]} alt={item.title} className="w-full h-full object-cover" />
                    ) : item.fileExists ? (
                      <img src={item.path} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-[#D6B36B]/40" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="font-serif font-bold text-sm sm:text-base text-[#FFF7E8] flex items-center gap-2 truncate">
                      <span>{item.title}</span>
                      <span className="text-[11px] font-sans font-normal text-[#D6B36B]/80">({item.country})</span>
                    </div>
                    <div className="text-[11px] font-mono text-[#F1E5CC]/60 truncate">
                      {hasCustom ? 'Loaded from user upload (persisted)' : item.path}
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                  {isReady ? (
                    <span className="flex items-center gap-1 text-xs font-sans font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{hasCustom ? 'Custom Art' : 'Masterpiece'}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-sans font-semibold text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2.5 py-1 rounded-full">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Dedicated Slot</span>
                    </span>
                  )}

                  {/* Supply Artwork Button / File Input */}
                  <label className="px-3 py-1 rounded-full bg-[#D6B36B]/20 hover:bg-[#D6B36B]/40 text-[#D6B36B] hover:text-[#FFF7E8] border border-[#D6B36B]/50 text-xs font-sans font-semibold transition-all cursor-pointer flex items-center gap-1.5">
                    <Upload className="w-3 h-3" />
                    <span>{hasCustom ? 'Replace' : 'Supply Art'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(item.storyId, file);
                      }}
                    />
                  </label>

                  {hasCustom && (
                    <button
                      onClick={() => handleRemoveCustom(item.storyId)}
                      className="text-xs text-red-400 hover:text-red-300 p-1 cursor-pointer"
                      title="Reset to default slot"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="pt-3 border-t border-[#D6B36B]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-sans text-[#F1E5CC]/70 shrink-0">
          <span>
            Artwork slot specifications: 4:3 aspect ratio, 1024×768 resolution, illuminated manuscript style.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-full bg-[#D6B36B] hover:bg-[#E7CCA0] text-[#0B1424] font-serif font-bold text-xs transition-all cursor-pointer"
          >
            Close Audit
          </button>
        </div>
      </motion.div>
    </div>
  );
};
