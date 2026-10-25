import React, { useState, useEffect } from 'react';
import { StoryId } from '../types';
import { Sparkles } from 'lucide-react';
import { playGentleClick, playCelestialChime } from '../utils/audio';

// Existing authentic high-fidelity fairytale book illustrations generated in vintage illuminated manuscript style
import cinderellaImg from '../assets/images/cinderella_fairytale_book_1792884202608.jpg';
import kongjwiImg from '../assets/images/kongjwi_fairytale_book_1792884203956.jpg';
import yexianImg from '../assets/images/yexian_fairytale_book_1792884204870.jpg';
import shakuntalaImg from '../assets/images/shakuntala_fairytale_book_1792884204960.jpg';

interface StoryIllustrationProps {
  storyId: StoryId;
  className?: string;
  fitMode?: 'cover' | 'contain';
  onObjectDiscovered?: (objectName: string, lore: string) => void;
}

interface StoryVisualMeta {
  src?: string;
  alt: string;
  symbol: string;
  bannerTitle: string;
  colorScheme: {
    bg: string;
    border: string;
    accent: string;
    gradient: string;
  };
  object: {
    name: string;
    lore: string;
    x: string;
    y: string;
  };
}

const STORY_VISUALS: Record<StoryId, StoryVisualMeta> = {
  cinderella: {
    src: cinderellaImg,
    alt: 'Cinderella outside midnight palace with glowing golden carriage and glass slipper',
    symbol: '👠',
    bannerTitle: 'La Pantoufle de Verre',
    colorScheme: {
      bg: '#141829',
      border: '#D6B36B',
      accent: '#6BA4D6',
      gradient: 'from-[#141829] via-[#1E2745] to-[#0D101C]'
    },
    object: {
      name: 'The Glass Slipper',
      lore: 'An unyielding token of crystalline truth that no counterfeit foot could bear.',
      x: '52%',
      y: '72%'
    }
  },
  kongjwi: {
    src: kongjwiImg,
    alt: 'Kongjwi at traditional Korean village pavilion with black ox, toad, and embroidered silk shoe',
    symbol: '🥿',
    bannerTitle: 'Kkotshin (꽃신)',
    colorScheme: {
      bg: '#251D14',
      border: '#C5A566',
      accent: '#D6896B',
      gradient: 'from-[#251D14] via-[#382B1C] to-[#1A140E]'
    },
    object: {
      name: 'The Embroidered Silk Shoe (Kkotshin)',
      lore: 'Dropped into the rushing stream, carrying Kongjwi’s virtue to the magistrate.',
      x: '78%',
      y: '72%'
    }
  },
  yexian: {
    src: yexianImg,
    alt: 'Ye Xian beside lotus pond feeding the radiant spirit fish with woven golden shoe',
    symbol: '🐟',
    bannerTitle: 'Jinlüxie & Spirit Carp',
    colorScheme: {
      bg: '#112220',
      border: '#C9A354',
      accent: '#4FD1C5',
      gradient: 'from-[#112220] via-[#1B3633] to-[#0A1715]'
    },
    object: {
      name: 'The Golden Shoe & Spirit Fish',
      lore: 'Woven of gold filigree, light as water, born of the venerated fish-bone relics.',
      x: '76%',
      y: '79%'
    }
  },
  shakuntala: {
    src: shakuntalaImg,
    alt: 'Shakuntala in sacred hermitage forest with deer, lotus pool, and royal signet ring',
    symbol: '💍',
    bannerTitle: 'The Signet Ring (Abhijñāna)',
    colorScheme: {
      bg: '#231826',
      border: '#D6A86B',
      accent: '#D66BA4',
      gradient: 'from-[#231826] via-[#36223B] to-[#150D17]'
    },
    object: {
      name: 'The Royal Signet Ring (Abhijñāna)',
      lore: 'Engraved with Dushyanta’s name, destined to awaken memory and break Durvasa’s curse.',
      x: '64%',
      y: '80%'
    }
  },
  vasilisa: {
    alt: 'Vasilisa in the dark Russian taiga before Baba Yaga’s hut holding the glowing skull lantern',
    symbol: '🔥',
    bannerTitle: 'The Glowing Skull & Wooden Doll',
    colorScheme: {
      bg: '#1B1512',
      border: '#D69B6B',
      accent: '#FF7B54',
      gradient: 'from-[#211612] via-[#331E18] to-[#120B08]'
    },
    object: {
      name: 'The Enchanted Pocket Doll',
      lore: 'Blessed by her mother’s dying breath, fed with breadcrumbs to perform miraculous tasks.',
      x: '50%',
      y: '68%'
    }
  },
  anansi: {
    alt: 'Anansi spinning golden web threads beneath the golden stool of Nyame the Sky God',
    symbol: '🕷️',
    bannerTitle: 'Nyame’s Golden Story Chest',
    colorScheme: {
      bg: '#241E10',
      border: '#E5B84B',
      accent: '#F6AD55',
      gradient: 'from-[#241E10] via-[#382E17] to-[#141008]'
    },
    object: {
      name: 'The Golden Chest of Stories',
      lore: 'Won from the Sky God through wit and spun silk, releasing all world tales to mortals.',
      x: '50%',
      y: '65%'
    }
  },
  momotaro: {
    alt: 'Momotaro with faithful dog, monkey, and pheasant advancing on Ogre Island with millet dumplings',
    symbol: '🍑',
    bannerTitle: 'Kibi Dango & Peach Champion',
    colorScheme: {
      bg: '#251318',
      border: '#E8A370',
      accent: '#F687B3',
      gradient: 'from-[#251318] via-[#3B1F27] to-[#170B0E]'
    },
    object: {
      name: 'The Sacred Kibi Dango',
      lore: 'Sweet millet cakes offered in fellowship that forged an invincible brotherhood of creatures.',
      x: '52%',
      y: '70%'
    }
  },
  'golden-crab': {
    alt: 'The golden crab casting off its enchanted shell beside the Aegean Sea with cosmological tokens',
    symbol: '🦀',
    bannerTitle: 'The Golden Spindle & Shell',
    colorScheme: {
      bg: '#0F1E29',
      border: '#D6B36B',
      accent: '#63B3ED',
      gradient: 'from-[#0F1E29] via-[#1A2E3D] to-[#081117]'
    },
    object: {
      name: 'The Golden Spinning Wheel',
      lore: 'Gift from the Mother of the Sun used to ransom her enchanted husband from captivity.',
      x: '50%',
      y: '68%'
    }
  },
  'urashima-taro': {
    alt: 'Urashima Taro riding the giant turtle to the underwater Dragon Palace holding the jeweled box',
    symbol: '🐢',
    bannerTitle: 'The Tamatebako (Jeweled Box)',
    colorScheme: {
      bg: '#0D2124',
      border: '#70D6C8',
      accent: '#4FD1C5',
      gradient: 'from-[#0D2124] via-[#143236] to-[#071314]'
    },
    object: {
      name: 'The Tamatebako',
      lore: 'Princess Otohime’s jeweled casket containing three hundred years of compressed mortal time.',
      x: '50%',
      y: '66%'
    }
  },
  sedna: {
    alt: 'Sedna beneath the Arctic pack ice with seals and whales swimming through her flowing hair',
    symbol: '🐋',
    bannerTitle: 'Adlivun & The Sacred Comb',
    colorScheme: {
      bg: '#0C1B2B',
      border: '#8BC5E8',
      accent: '#90CDF4',
      gradient: 'from-[#0C1B2B] via-[#142A42] to-[#060E17]'
    },
    object: {
      name: 'The Shaman’s Bone Comb',
      lore: 'Used by the angakkuq in deep trance to disentangle Sedna’s hair and release marine life.',
      x: '50%',
      y: '68%'
    }
  },
  rhodopis: {
    alt: 'The royal eagle of Horus carrying the rose-red gilded sandal over ancient Memphis to Pharaoh Amasis',
    symbol: '🦅',
    bannerTitle: 'The Rose-Red Gilded Sandal',
    colorScheme: {
      bg: '#261C14',
      border: '#E2B167',
      accent: '#ED8936',
      gradient: 'from-[#261C14] via-[#3B2C20] to-[#17100B]'
    },
    object: {
      name: 'The Rose-Red Gilded Slipper',
      lore: 'Snatched by Horus’s eagle and dropped in Pharaoh’s lap, crowning the maiden Queen of Egypt.',
      x: '50%',
      y: '65%'
    }
  },
  'one-hand-girl': {
    alt: 'Binti Ali sheltered inside the sacred baobab tree with wild doves and the Sultan’s silver hand',
    symbol: '🌳',
    bannerTitle: 'The Healing Baobab & Silver Ring',
    colorScheme: {
      bg: '#211B14',
      border: '#D4AF37',
      accent: '#ECC94B',
      gradient: 'from-[#211B14] via-[#332A1F] to-[#14100C]'
    },
    object: {
      name: 'The Sultan’s Signet Ring',
      lore: 'Preserved through exile in a silver amulet, proving her identity and steadfast innocence.',
      x: '50%',
      y: '68%'
    }
  },
  mufaro: {
    alt: 'Nyasha tending her garden beside Nyoka the green snake against the stone walls of Great Zimbabwe',
    symbol: '🐍',
    bannerTitle: 'Nyoka & The King of Zimbabwe',
    colorScheme: {
      bg: '#1C2417',
      border: '#B3C86B',
      accent: '#68D391',
      gradient: 'from-[#1C2417] via-[#2A3822] to-[#0E130B]'
    },
    object: {
      name: 'Nyoka the Garden Snake',
      lore: 'Tended with daily bread crumbs, revealed to be the shape-shifting King testing her heart.',
      x: '50%',
      y: '67%'
    }
  },
  'popol-vuh-twins': {
    alt: 'Hunahpu and Xbalanque holding the celestial rubber ball before the lords of Xibalba',
    symbol: '☀️',
    bannerTitle: 'The Rubber Ball & Celestial Torch',
    colorScheme: {
      bg: '#241416',
      border: '#E87D65',
      accent: '#FC8181',
      gradient: 'from-[#241416] via-[#3B2023] to-[#140A0B]'
    },
    object: {
      name: 'The Firefly Torch',
      lore: 'Enchanted by insect allies to glow without burning out, passing the deadly dark chamber of Xibalba.',
      x: '50%',
      y: '67%'
    }
  },
  'baba-abdalla': {
    alt: 'The mystical dervish handing the small wooden ointment jar to Baba Abdalla in Baghdad',
    symbol: '👁️',
    bannerTitle: 'The Dervish’s Ointment Jar',
    colorScheme: {
      bg: '#1A1826',
      border: '#C79D55',
      accent: '#B794F4',
      gradient: 'from-[#1A1826] via-[#29263C] to-[#0D0C13]'
    },
    object: {
      name: 'The Kohl of Subterranean Vision',
      lore: 'Unlocks the treasures of the earth on the left eye, but seals eternal blindness on the right.',
      x: '50%',
      y: '66%'
    }
  }
};

export const StoryIllustration: React.FC<StoryIllustrationProps> = ({
  storyId,
  className = '',
  fitMode = 'contain',
  onObjectDiscovered
}) => {
  const visual = STORY_VISUALS[storyId] || STORY_VISUALS.cinderella;
  const [hasDiscovered, setHasDiscovered] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const [customImage, setCustomImage] = useState<string | null>(null);

  // Check custom uploaded artwork from localStorage or dedicated slot
  useEffect(() => {
    const loadCustom = () => {
      const stored = localStorage.getItem(`custom_illustration_${storyId}`);
      if (stored) {
        setCustomImage(stored);
      } else {
        setCustomImage(null);
      }
    };
    loadCustom();

    const handler = () => loadCustom();
    window.addEventListener('golden_thread_illustration_updated', handler);
    return () => window.removeEventListener('golden_thread_illustration_updated', handler);
  }, [storyId]);

  const handleTokenClick = () => {
    playCelestialChime();
    setHasDiscovered(true);
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 1200);

    if (onObjectDiscovered) {
      onObjectDiscovered(visual.object.name, visual.object.lore);
    }
  };

  const handleInlineUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        localStorage.setItem(`custom_illustration_${storyId}`, dataUrl);
        setCustomImage(dataUrl);
        window.dispatchEvent(new Event('golden_thread_illustration_updated'));
        playCelestialChime();
      }
    };
    reader.readAsDataURL(file);
  };

  // Determine active image source
  const effectiveSrc = customImage || visual.src;

  return (
    <div
      className={`relative w-full h-full rounded-lg overflow-hidden border-2 border-[#D6B36B]/80 shadow-[0_8px_30px_rgba(0,0,0,0.5)] select-none ${className}`}
      style={{ minHeight: '230px' }}
    >
      {/* If this story has an active illustration image */}
      {effectiveSrc ? (
        <div className="relative w-full h-full bg-[#10141E] flex items-center justify-center overflow-hidden">
          <img
            src={effectiveSrc}
            alt={visual.alt}
            className={`w-full h-full transition-transform duration-700 hover:scale-[1.02] ${
              fitMode === 'contain' ? 'object-contain' : 'object-cover'
            }`}
          />
          {/* Subtle antique vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
        </div>
      ) : (
        /* Rich medieval illuminated manuscript plate for tales awaiting image artwork */
        <div
          className={`relative w-full h-full bg-gradient-to-br ${visual.colorScheme.gradient} p-4 flex flex-col justify-between items-center text-center overflow-hidden`}
        >
          {/* Antique parchment filigree grid */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#D6B36B_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Ornamental corner flourishes */}
          <div className="absolute top-2 left-2 text-[#D6B36B]/50 font-serif text-sm">╔</div>
          <div className="absolute top-2 right-2 text-[#D6B36B]/50 font-serif text-sm">╗</div>
          <div className="absolute bottom-2 left-2 text-[#D6B36B]/50 font-serif text-sm">╚</div>
          <div className="absolute bottom-2 right-2 text-[#D6B36B]/50 font-serif text-sm">╝</div>

          {/* Top Banner Ribbon */}
          <div className="relative z-10 pt-1">
            <span className="text-[10px] tracking-[0.25em] uppercase font-sans font-semibold text-[#D6B36B]/90">
              Dedicated Illustration Slot
            </span>
          </div>

          {/* Central Emblem & Celestial Aura */}
          <div className="relative z-10 my-auto flex flex-col items-center">
            <div className="relative flex items-center justify-center w-20 h-20 rounded-full border border-[#D6B36B]/60 bg-black/40 shadow-[0_0_35px_rgba(214,179,107,0.25)]">
              <span className="text-3xl drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] animate-pulse">
                {visual.symbol}
              </span>
              <div className="absolute inset-0 rounded-full border border-dashed border-[#D6B36B]/30 animate-[spin_40s_linear_infinite]" />
            </div>

            <h4 className="mt-2.5 text-base font-serif font-bold text-[#F1E5CC] tracking-wide">
              {visual.bannerTitle}
            </h4>
            <p className="mt-1 text-xs text-[#E7CCA0]/80 font-sans max-w-[280px] line-clamp-2 px-2">
              {visual.alt}
            </p>

            {/* Inline Supply Artwork Button */}
            <label className="mt-2.5 px-3 py-1 rounded-full bg-[#D6B36B]/20 hover:bg-[#D6B36B]/40 text-[#D6B36B] hover:text-[#FFF7E8] text-[11px] font-sans font-semibold border border-[#D6B36B]/50 transition-all cursor-pointer flex items-center gap-1 shadow-sm">
              <span>✦ Supply Artwork</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleInlineUpload(file);
                }}
              />
            </label>
          </div>

          {/* Bottom Manuscript Caption */}
          <div className="relative z-10 pb-0.5">
            <span className="text-[10px] italic font-serif text-[#D6B36B]/70">
              Slot: /public/assets/images/stories/{storyId}.jpg · Tap seal for lore token
            </span>
          </div>
        </div>
      )}

      {/* Interactive Discoverable Object Seal on the Illustration */}
      <div
        className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
        style={{ left: visual.object.x, top: visual.object.y }}
        onClick={handleTokenClick}
      >
        <div
          className={`relative flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-300 ${
            hasDiscovered
              ? 'bg-[#D6B36B] border-[#FFF7E8] text-[#19372F] shadow-[0_0_20px_rgba(214,179,107,0.9)]'
              : 'bg-[#0B1424]/85 border-[#D6B36B] text-[#D6B36B] hover:scale-115 shadow-[0_0_15px_rgba(214,179,107,0.5)]'
          }`}
          title={`Discover ${visual.object.name}`}
        >
          <Sparkles className="w-4 h-4 animate-spin-slow" />

          {/* Expanding golden ripple wave */}
          {showRipple && (
            <div className="absolute inset-0 rounded-full border-2 border-[#D6B36B] animate-ping pointer-events-none" />
          )}

          {/* Pulsing ring aura */}
          <div className="absolute -inset-1 rounded-full border border-[#D6B36B]/50 animate-pulse pointer-events-none" />
        </div>

        {/* Floating tooltip preview */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none whitespace-nowrap z-30">
          <div className="px-2.5 py-1 rounded bg-[#0B1424]/95 border border-[#D6B36B]/80 text-[10px] font-sans font-medium text-[#FFF7E8] shadow-lg backdrop-blur-sm">
            ✦ Inspect {visual.object.name}
          </div>
        </div>
      </div>
    </div>
  );
};
