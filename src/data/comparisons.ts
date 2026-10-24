import { ComparisonDetail, StoryId } from '../types';

export const COMPARISONS: ComparisonDetail[] = [
  // 1. Cinderella <-> Kongjwi
  {
    id: 'cinderella-kongjwi',
    storyAId: 'cinderella',
    storyBId: 'kongjwi',
    sharedMotif: 'supernatural-assistance',
    appearanceInA:
      'In France, a fairy godmother appears with a magic wand, transforming a garden pumpkin, mice, and rags into Versailles-style courtly elegance.',
    appearanceInB:
      'In Korea, agricultural animals (a heavenly black cow, a toad plugging a cracked jar, a flock of grain-polishing sparrows) and a celestial maiden (seonnyeo) complete her agrarian domestic chores.',
    culturalDifference:
      'Perrault’s French tale reflects the courtly, aristocratic salon culture of 17th-century France with wands and ballgowns; Kongjwi reflects agrarian Korean village community values, animistic animal solidarity, and traditional hanbok/embroidered slippers.',
    classification: 'cinderella-parallel',
    scholarlyNote:
      'Both belong to the international Cinderella tale type (ATU 510A: Persecuted Heroine). They share the structural sequence of stepfamily oppression, supernatural helpers, footwear loss, and social elevation.'
  },
  {
    id: 'cinderella-kongjwi-shoe',
    storyAId: 'cinderella',
    storyBId: 'kongjwi',
    sharedMotif: 'lost-object-recognition',
    appearanceInA:
      'A delicate glass slipper (pantoufle de verre) dropped on palace steps is fitted upon every maiden in the realm by the royal prince.',
    appearanceInB:
      'An embroidered silk shoe (kkotshin) dropped into a mountain stream is retrieved by the local magistrate during his official procession.',
    culturalDifference:
      'The French test occurs in the palace court with glass slippers symbolizing fragile aristocractic purity; the Korean search is conducted across the countryside by a provincial magistrate following an outdoor water procession.',
    classification: 'cinderella-parallel',
    scholarlyNote:
      'Footwear as an individual signature of size, virtue, and social rank is a defining pillar of the ATU 510A Cinderella cycle across Eurasia.'
  },

  // 2. Cinderella <-> Ye Xian
  {
    id: 'cinderella-yexian',
    storyAId: 'cinderella',
    storyBId: 'yexian',
    sharedMotif: 'supernatural-assistance',
    appearanceInA:
      'A maternal fairy godmother intervenes with enchanted courtly magic, conjuring luxury directly from common kitchen garden objects.',
    appearanceInB:
      'A spirit fish with red fins and golden eyes is killed by the stepmother, but its exhumed bones become a sacred relic granting heartfelt wishes.',
    culturalDifference:
      'The French magic is salon enchantment centered on court etiquette; the Chinese tale involves ancestral/spirit veneration where the bones of an eaten companion animal serve as a spiritual conduit, predating Perrault by over eight centuries.',
    classification: 'cinderella-parallel',
    scholarlyNote:
      'Recorded in 9th-century Tang Dynasty China, Ye Xian is among the world’s earliest documented Cinderella-type tales, demonstrating that the persecuted heroine motif predates European literary fairytales by hundreds of years.'
  },
  {
    id: 'cinderella-yexian-shoe',
    storyAId: 'cinderella',
    storyBId: 'yexian',
    sharedMotif: 'lost-object-recognition',
    appearanceInA:
      'A lost glass slipper fitted by the prince’s emissaries to determine who danced with the heir to the throne.',
    appearanceInB:
      'A lost golden shoe woven with gold thread, light as a feather, sold to the King of the island realm of Tuohan, who tests every woman’s foot.',
    culturalDifference:
      'Perrault chose glass (verre), emphasizing unyielding clarity and court artifice; the Tang record features woven gold filigree footwear suited to southern Chinese ceremonial festival regalia.',
    classification: 'cinderella-parallel',
    scholarlyNote:
      'In both traditions, the lost shoe is miraculous: it does not deform, cannot be forced onto counterfeit feet, and unerringly selects the rightful heroine.'
  },

  // 3. Kongjwi <-> Ye Xian
  {
    id: 'kongjwi-yexian',
    storyAId: 'kongjwi',
    storyBId: 'yexian',
    sharedMotif: 'supernatural-assistance',
    appearanceInA:
      'Help comes through agricultural animals (cow, toad, sparrows) and a heavenly seonnyeo who descend to aid her in heavy domestic labor.',
    appearanceInB:
      'Assistance comes through the spirit and bones of a beloved golden-eyed fish nurtured in a pond, guided by an elder with unbound hair.',
    culturalDifference:
      'Kongjwi emphasizes communal agrarian cooperation and Buddhist-Confucian filial duties; Ye Xian emphasizes the indigenous animist traditions of southern China and ancestral communication through bone relics.',
    classification: 'cinderella-parallel',
    scholarlyNote:
      'Both Asian variants celebrate spiritual reciprocity with the natural world: benevolence toward a creature or living being brings miraculous salvation from familial cruelty.'
  },
  {
    id: 'kongjwi-yexian-shoe',
    storyAId: 'kongjwi',
    storyBId: 'yexian',
    sharedMotif: 'lost-object-recognition',
    appearanceInA:
      'Kongjwi drops an embroidered flower shoe into a running stream as the village magistrate’s palanquin approaches.',
    appearanceInB:
      'Ye Xian loses her woven golden shoe on a mountain path while fleeing from the Cave Festival back to her chores.',
    culturalDifference:
      'Kongjwi’s shoe is dropped in a stream during an administrative procession; Ye Xian’s golden slipper is picked up by a traveler and traded across the sea to an island king.',
    classification: 'cinderella-parallel',
    scholarlyNote:
      'Both tales use the lost shoe to bridge the humble daughter’s domestic isolation with the public realm of leadership and authority.'
  },

  // 4. Cinderella <-> Shakuntala (BROADER THEMATIC PARALLEL)
  {
    id: 'cinderella-shakuntala',
    storyAId: 'cinderella',
    storyBId: 'shakuntala',
    sharedMotif: 'lost-object-recognition',
    appearanceInA:
      'Cinderella’s lost glass slipper serves as physical proof to identify her as the mysterious radiant maiden from the royal ball.',
    appearanceInB:
      'King Dushyanta’s lost signet ring (abhijñāna) retrieved from a fish’s belly breaks an ascetic’s curse of amnesia, restoring the king’s memory of his beloved wife.',
    culturalDifference:
      'CRITICAL DISTINCTION: Cinderella is a European folk/fairy tale of a persecuted domestic stepdaughter rising to royalty. Shakuntala is high classical Sanskrit drama (nataka) centered on royal vows, dharma, divine curses, and cosmic aesthetic rasa (emotional taste).',
    classification: 'thematic-parallel',
    scholarlyNote:
      'IMPORTANT SCHOLARLY DISTINCTION: Shakuntala is NOT a Cinderella variant. It shares the narrative device of recognition through an intimate lost token, which is a global literary device found across epic and dramatic traditions (from Homer’s Odyssey to Kalidasa), rather than a folktale transmission.'
  },

  // 5. Kongjwi <-> Shakuntala (BROADER THEMATIC PARALLEL)
  {
    id: 'kongjwi-shakuntala',
    storyAId: 'kongjwi',
    storyBId: 'shakuntala',
    sharedMotif: 'lost-object-recognition',
    appearanceInA:
      'Kongjwi’s dropped silk embroidered shoe proves her identity to the magistrate who seeks the virtuous woman of the countryside.',
    appearanceInB:
      'The royal signet ring found in a fish belly serves as an undeniable token (abhijñāna) of marriage that cuts through a divine curse of forgetfulness.',
    culturalDifference:
      'In Kongjwi, the lost object establishes an initial matrimonial match based on virtue and smallness; in Shakuntala, the lost ring restores a preexisting sacred marriage severed by a sage’s supernatural curse and forgotten vows.',
    classification: 'thematic-parallel',
    scholarlyNote:
      'This represents a broader thematic parallel: material tokens serve as anchors of truth when spoken words and social testimony fail.'
  },

  // 6. Ye Xian <-> Shakuntala (BROADER THEMATIC PARALLEL + FISH MOTIF RESONANCE)
  {
    id: 'yexian-shakuntala',
    storyAId: 'yexian',
    storyBId: 'shakuntala',
    sharedMotif: 'lost-object-recognition',
    appearanceInA:
      'Ye Xian’s lost golden slipper is sold to a king who seeks its owner across his kingdom, recognizing her transcendent grace.',
    appearanceInB:
      'Dushyanta’s signet ring is swallowed by a fish and retrieved by a fisherman, proving Shakuntala’s rejected marriage claims true.',
    culturalDifference:
      'Both stories feature a fateful relationship with a fish (Ye Xian’s guardian spirit vs. the fish that swallows Shakuntala’s ring), yet Ye Xian is a folktale of domestic vindication while Shakuntala is an epic dramatic exploration of grief, duty, and memory.',
    classification: 'thematic-parallel',
    scholarlyNote:
      'While both stories share the presence of aquatic life and recognition through a lost precious artifact, they originate from entirely separate literary and cultural contexts: Tang-dynasty southern minority folklore vs. classical Sanskrit court theater.'
  }
];

export function getComparison(storyA: StoryId, storyB: StoryId, motif?: string): ComparisonDetail | undefined {
  return COMPARISONS.find(
    (c) =>
      ((c.storyAId === storyA && c.storyBId === storyB) || (c.storyAId === storyB && c.storyBId === storyA)) &&
      (!motif || c.sharedMotif === motif)
  ) || COMPARISONS.find(
    (c) => (c.storyAId === storyA && c.storyBId === storyB) || (c.storyAId === storyB && c.storyBId === storyA)
  );
}

export function getRelatedStoriesForMotif(currentStoryId: StoryId, motifId: string): StoryId[] {
  // Return all story IDs (excluding currentStoryId) that contain this motif
  const targetMotif = motifId;
  const matches: StoryId[] = [];
  
  if (currentStoryId === 'cinderella') {
    if (targetMotif === 'supernatural-assistance') return ['kongjwi', 'yexian'];
    if (targetMotif === 'lost-object-recognition') return ['kongjwi', 'yexian', 'shakuntala'];
    if (targetMotif === 'unjust-treatment') return ['kongjwi', 'yexian'];
    if (targetMotif === 'reversal-of-fortune') return ['kongjwi', 'yexian'];
  } else if (currentStoryId === 'kongjwi') {
    if (targetMotif === 'supernatural-assistance') return ['cinderella', 'yexian'];
    if (targetMotif === 'lost-object-recognition') return ['cinderella', 'yexian', 'shakuntala'];
    if (targetMotif === 'unjust-treatment') return ['cinderella', 'yexian'];
    if (targetMotif === 'reversal-of-fortune') return ['cinderella', 'yexian'];
  } else if (currentStoryId === 'yexian') {
    if (targetMotif === 'supernatural-assistance') return ['cinderella', 'kongjwi'];
    if (targetMotif === 'lost-object-recognition') return ['cinderella', 'kongjwi', 'shakuntala'];
    if (targetMotif === 'unjust-treatment') return ['cinderella', 'kongjwi'];
    if (targetMotif === 'reversal-of-fortune') return ['cinderella', 'kongjwi'];
  } else if (currentStoryId === 'shakuntala') {
    if (targetMotif === 'lost-object-recognition') return ['cinderella', 'kongjwi', 'yexian'];
    // Other Shakuntala motifs like separation-and-reunion, memory-and-forgetting, love-and-duty are unique to Shakuntala in our 4-story set
  }
  return matches;
}
