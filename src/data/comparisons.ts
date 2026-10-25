import { ComparisonDetail, StoryId, MotifId } from '../types';
import { STORIES } from './stories';
import { MOTIFS_CATALOG } from './motifs';

export const COMPARISONS: ComparisonDetail[] = [
  // 1. Cinderella <-> Kongjwi
  {
    id: 'cinderella-kongjwi',
    storyAId: 'cinderella',
    storyBId: 'kongjwi',
    sharedMotif: 'supernatural-assistance',
    similarity: 'Both mistreated heroines receive miraculous intervention to complete impossible tasks and attend celebratory gatherings.',
    culturalDifference: 'Perrault features courtly fairy wand magic, whereas Korean tradition features agrarian animals and ancestral spirits.',
    appearanceInA: 'A fairy godmother transfigures garden pumpkins and mice into a courtly carriage.',
    appearanceInB: 'A black ox, toad, and sparrows assist in plowing, water-carrying, and grain-husking.',
    classification: 'cinderella-parallel',
    scholarlyNote: 'Both belong to the ATU 510A Persecuted Heroine folktale cycle sharing stepfamily oppression and magical rescue.'
  },
  {
    id: 'cinderella-kongjwi-shoe',
    storyAId: 'cinderella',
    storyBId: 'kongjwi',
    sharedMotif: 'lost-object-recognition',
    similarity: 'A lost piece of delicate footwear uniquely identifies the rightful maiden to a searching aristocratic suitor.',
    culturalDifference: 'A French unyielding glass slipper tested at court versus a Korean embroidered silk shoe found in a stream.',
    appearanceInA: 'Glass slipper fitted upon all women in the realm until it slides onto Cinderella’s foot.',
    appearanceInB: 'Embroidered silk shoe dropped during a mountain stream crossing retrieved by the magistrate.',
    classification: 'cinderella-parallel',
    scholarlyNote: 'Footwear as an undeniable signature of identity and moral purity defines Eurasian Cinderella variants.'
  },

  // 2. Cinderella <-> Ye Xian
  {
    id: 'cinderella-yexian',
    storyAId: 'cinderella',
    storyBId: 'yexian',
    sharedMotif: 'supernatural-assistance',
    similarity: 'Spiritual guardians provide magnificent ceremonial attire to an oppressed maiden fleeing familial surveillance.',
    culturalDifference: 'French salon enchantment with wands versus ancient southern Chinese animism and venerated fish bone relics.',
    appearanceInA: 'A fairy godmother conjures cloth of silver and glass slippers from thin air.',
    appearanceInB: 'The buried bones of an eaten companion spirit-fish grant festive gowns and golden shoes.',
    classification: 'cinderella-parallel',
    scholarlyNote: 'Documented c. 860 CE, Ye Xian demonstrates that the persecuted heroine archetype predated European literary tales by centuries.'
  },
  {
    id: 'cinderella-yexian-shoe',
    storyAId: 'cinderella',
    storyBId: 'yexian',
    sharedMotif: 'lost-object-recognition',
    similarity: 'A lost shoe of miraculous lightness fits only the heroine, proving her identity and leading to queenly elevation.',
    culturalDifference: 'Perrault’s unstretchable Parisian glass slipper versus Tang-dynasty woven gold filigree footwear.',
    appearanceInA: 'A glass slipper dropped on palace steps identifies Cinderella among all maidens of France.',
    appearanceInB: 'A tiny golden shoe dropped on a mountain path fits only Ye Xian.',
    classification: 'cinderella-parallel',
    scholarlyNote: 'Both traditions contrast counterfeit attempts by stepfamilies with the effortless fit upon the rightful heroine.'
  },

  // 3. Kongjwi <-> Ye Xian
  {
    id: 'kongjwi-yexian',
    storyAId: 'kongjwi',
    storyBId: 'yexian',
    sharedMotif: 'supernatural-assistance',
    similarity: 'Both heroines are comforted by benevolent animal spirits that counter stepmother cruelty through ancestral blessings.',
    culturalDifference: 'Korean communal agrarian animal helpers versus an individual sacred spirit-fish in southern China.',
    appearanceInA: 'Black ox, river toad, and flock of sparrows finish arduous agricultural labor.',
    appearanceInB: 'The bones of the red-finned spirit fish grant wishes when prayed to in secret.',
    classification: 'cinderella-parallel',
    scholarlyNote: 'Demonstrates deep regional East Asian affinities in animal-spirit reverence and karmic retribution.'
  },

  // 4. Rhodopis <-> Cinderella
  {
    id: 'cinderella-rhodopis',
    storyAId: 'cinderella',
    storyBId: 'rhodopis',
    sharedMotif: 'lost-object-recognition',
    similarity: 'A lost golden shoe dropped during flight is seized upon by a monarch to find the true maiden.',
    culturalDifference: 'An eagle messenger of Horus in Greco-Egyptian antiquity versus a midnight palace staircase in 17th-century France.',
    appearanceInA: 'Cinderella flees the palace ball at midnight, leaving her glass slipper on the marble stair.',
    appearanceInB: 'An eagle snatches Rhodopis’s rose-red sandal from the Nile bank, dropping it in Pharaoh Amasis’s lap.',
    classification: 'cinderella-parallel',
    scholarlyNote: 'Strabo’s account of Rhodopis (c. 7 BCE) is the earliest known historic recorded precursor to the Cinderella cycle.'
  },

  // 5. Vasilisa <-> Cinderella
  {
    id: 'cinderella-vasilisa',
    storyAId: 'cinderella',
    storyBId: 'vasilisa',
    sharedMotif: 'unjust-treatment',
    similarity: 'Both maidens are forced into scullery servitude by cruel stepfamilies who seek to extinguish their beauty.',
    culturalDifference: 'French salon court domestic chores versus deadly Russian taiga exile to the cannibal witch Baba Yaga.',
    appearanceInA: 'Cinderella is mocked and relegated to cleaning fireplace hearth ashes in threadbare rags.',
    appearanceInB: 'Vasilisa is sent into the pitch-black taiga to be devoured by Baba Yaga in her chicken-legged hut.',
    classification: 'cinderella-parallel',
    scholarlyNote: 'East Slavic skazki preserve archaic initiation rites and maternal heirloom magic within the ATU 510 structure.'
  },

  // 6. Shakuntala <-> Cinderella
  {
    id: 'cinderella-shakuntala',
    storyAId: 'cinderella',
    storyBId: 'shakuntala',
    sharedMotif: 'lost-object-recognition',
    similarity: 'A physical token of undeniable singularity pierces deception or amnesia to restore the rightful bride.',
    culturalDifference: 'A pristine glass slipper tested on feet versus a sacred signet ring swallowed by a river fish.',
    appearanceInA: 'The glass slipper fits uniquely upon Cinderella’s foot, proving her courtly identity.',
    appearanceInB: 'The recovered signet ring shatters Durvasa’s curse of amnesia upon King Dushyanta.',
    classification: 'thematic-parallel',
    scholarlyNote: 'While Cinderella is an oral-literary folk tale, Shakuntala is high classical Sanskrit drama exploring philosophical recognition (abhijñāna).'
  },

  // 7. Mufaro <-> Kongjwi
  {
    id: 'kongjwi-mufaro',
    storyAId: 'kongjwi',
    storyBId: 'mufaro',
    sharedMotif: 'reversal-of-fortune',
    similarity: 'The humble, generous sister is exalted to royalty, while the selfish, haughty sibling faces moral downfall.',
    culturalDifference: 'Joseon Confucian filial rewards versus Shona communal ubuntu ethics and hospitality tests.',
    appearanceInA: 'Kongjwi becomes noble wife to the magistrate while Patjwi and Madam Bae face shame.',
    appearanceInB: 'Nyasha becomes Queen of Great Zimbabwe while proud Manyara becomes a humbled servant.',
    classification: 'cinderella-parallel',
    scholarlyNote: 'Both reflect the universal ATU 480 Kind and Unkind Girls motif contrasting empathy with vain ambition.'
  },

  // 8. One-Hand Girl <-> Shakuntala
  {
    id: 'shakuntala-one-hand-girl',
    storyAId: 'shakuntala',
    storyBId: 'one-hand-girl',
    sharedMotif: 'separation-and-reunion',
    similarity: 'Virtuous royal wives are cast into wilderness exile through cruel slander or curses before wedding tokens reunite them.',
    culturalDifference: 'Sanskrit epic poetry of divine hermitage retreat versus Swahili coastal oral lore of sabr (steadfast patience).',
    appearanceInA: 'Shakuntala endures years of estrangement in Sage Maricha’s celestial ashram until the ring is found.',
    appearanceInB: 'Binti Ali wanders in the coastal scrub with her child until her lost golden ring proves her virtue to the Sultan.',
    classification: 'thematic-parallel',
    scholarlyNote: 'Both explore the emotional poetics of long exile, faithful endurance, and reconciliation through a fated ring.'
  },

  // 9. Anansi <-> Popol Vuh Twins
  {
    id: 'anansi-popol-vuh-twins',
    storyAId: 'anansi',
    storyBId: 'popol-vuh-twins',
    sharedMotif: 'supernatural-assistance',
    similarity: 'Underdog heroes enlist clever animal and insect allies to outwit terrifying celestial or underworld rulers.',
    culturalDifference: 'Ashanti single trickster spider outwitting Nyame versus Mayan twin brothers conquering the death lords of Xibalba.',
    appearanceInA: 'Anansi uses spun silk ladders, hollow gourds, and sap dolls to capture the leopard and hornets.',
    appearanceInB: 'Hunahpu and Xbalanque send mosquito scouts, leaf-cutter ants, and fireflies to survive deadly underground houses.',
    classification: 'thematic-parallel',
    scholarlyNote: 'Both represent indigenous traditions where vulnerable protagonists conquer supernatural oppression through keen intellect.'
  },

  // 10. Momotaro <-> Kongjwi
  {
    id: 'kongjwi-momotaro',
    storyAId: 'kongjwi',
    storyBId: 'momotaro',
    sharedMotif: 'supernatural-assistance',
    similarity: 'Protagonists establish covenants with animals through food and kindness, turning creatures into loyal champions.',
    culturalDifference: 'Korean domestic tasks (plowing, husking) versus Japanese martial expedition to Ogre Island (Onigashima).',
    appearanceInA: 'Kongjwi’s gentle tears summon the ox, toad, and sparrows to complete farm labor.',
    appearanceInB: 'Momotaro shares kibi dango (millet cakes) to enlist the dog, monkey, and pheasant.',
    classification: 'thematic-parallel',
    scholarlyNote: 'East Asian folktales repeatedly emphasize non-violent hospitality and inter-species solidarity over solitary ego.'
  },

  // 11. Urashima Taro <-> Baba Abdalla
  {
    id: 'urashima-taro-baba-abdalla',
    storyAId: 'urashima-taro',
    storyBId: 'baba-abdalla',
    sharedMotif: 'transformation',
    similarity: 'A forbidden opening of a magical container irrevocably transforms the protagonist’s mortal body and senses.',
    culturalDifference: 'A tragic consequence of homesickness in Japanese sea mythology versus greedy blindness in Abbasid Baghdad.',
    appearanceInA: 'Urashima unlatches the Tamatebako box: white smoke turns him from youth into a three-century-old elder.',
    appearanceInB: 'Baba Abdalla rubs the dervish’s ointment on his right eye, instantly plunging himself into lifelong blindness.',
    classification: 'thematic-parallel',
    scholarlyNote: 'Both warn of the irreversible boundary between human mortality and supernatural knowledge or timelessness.'
  },

  // 12. Sedna <-> One-Hand Girl
  {
    id: 'sedna-one-hand-girl',
    storyAId: 'sedna',
    storyBId: 'one-hand-girl',
    sharedMotif: 'unjust-treatment',
    similarity: 'Innocent young women endure horrific bodily sacrifice and abandonment in the wild by kin in moments of panic or jealousy.',
    culturalDifference: 'Arctic circumpolar survival myth creating sea animals versus Swahili moral tale of miraculous restoration.',
    appearanceInA: 'Sedna’s fingers are severed by her father into the freezing ocean, morphing into seals and whales.',
    appearanceInB: 'Binti Ali’s hand is cut off through false accusations of a jealous sister-in-law.',
    classification: 'thematic-parallel',
    scholarlyNote: 'Both traditions confront traumatic familial betrayal, transforming bodily severance into sacred power and spiritual authority.'
  }
];

export function getComparison(storyA: StoryId, storyB: StoryId, motif?: string): ComparisonDetail | undefined {
  const match = COMPARISONS.find(
    (c) =>
      ((c.storyAId === storyA && c.storyBId === storyB) || (c.storyAId === storyB && c.storyBId === storyA)) &&
      (!motif || c.sharedMotif === motif)
  );
  if (match) return match;

  const anyMatch = COMPARISONS.find(
    (c) => (c.storyAId === storyA && c.storyBId === storyB) || (c.storyAId === storyB && c.storyBId === storyA)
  );
  if (anyMatch) return anyMatch;

  // Dynamically craft a scholarly grounded comparison from the two stories' curated datasets
  const storyAData = STORIES.find((s) => s.id === storyA);
  const storyBData = STORIES.find((s) => s.id === storyB);

  const sharedMotifId: MotifId =
    (motif as MotifId) ||
    (storyAData?.motifs.find((m) => storyBData?.motifs.includes(m)) as MotifId) ||
    'lost-object-recognition';

  const motifInfo = MOTIFS_CATALOG[sharedMotifId];

  const appA =
    storyAData?.motifManifestations[sharedMotifId] ||
    `${storyAData?.title || 'This tradition'} embodies this archetype through its foundational cultural lore.`;

  const appB =
    storyBData?.motifManifestations[sharedMotifId] ||
    `${storyBData?.title || 'This tradition'} reflects the motif through distinctive regional symbols.`;

  const isCinderellaCycle =
    (storyAData?.narrativeTraditionType === 'Cinderella-Type Folktale' ||
      storyAData?.id === 'cinderella' ||
      storyAData?.id === 'kongjwi' ||
      storyAData?.id === 'yexian' ||
      storyAData?.id === 'rhodopis' ||
      storyAData?.id === 'vasilisa' ||
      storyAData?.id === 'mufaro' ||
      storyAData?.id === 'one-hand-girl') &&
    (storyBData?.narrativeTraditionType === 'Cinderella-Type Folktale' ||
      storyBData?.id === 'cinderella' ||
      storyBData?.id === 'kongjwi' ||
      storyBData?.id === 'yexian' ||
      storyBData?.id === 'rhodopis' ||
      storyBData?.id === 'vasilisa' ||
      storyBData?.id === 'mufaro' ||
      storyBData?.id === 'one-hand-girl');

  return {
    id: `${storyA}-${storyB}-${sharedMotifId}`,
    storyAId: storyA,
    storyBId: storyB,
    sharedMotif: sharedMotifId,
    similarity: `Both ${storyAData?.country || 'traditions'} and ${storyBData?.country || 'cultures'} share the motif of ${motifInfo?.name.toLowerCase() || sharedMotifId}.`,
    culturalDifference: `Contrasting ${storyAData?.culturalTradition.split('(')[0].trim() || 'regional lore'} with ${storyBData?.culturalTradition.split('(')[0].trim() || 'traditional myth'}.`,
    appearanceInA: appA,
    appearanceInB: appB,
    classification: isCinderellaCycle ? 'cinderella-parallel' : 'thematic-parallel',
    scholarlyNote:
      motifInfo?.storySignificance ||
      'Comparative folkloristics reveals that human cultures independently weave identical moral truths through diverse regional expressions.'
  };
}

export function getRelatedStoriesForMotif(currentStoryId: StoryId, motifId: string): StoryId[] {
  return STORIES.filter((s) => s.id !== currentStoryId && s.motifs.includes(motifId as MotifId)).map((s) => s.id);
}
