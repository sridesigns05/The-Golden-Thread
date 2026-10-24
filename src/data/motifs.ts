import { MotifId, MotifInfo } from '../types';

export const MOTIFS_CATALOG: Record<MotifId, MotifInfo> = {
  'unjust-treatment': {
    id: 'unjust-treatment',
    name: 'Unjust Treatment & Humiliation',
    shortDescription: 'The protagonist endures cruelty, domestic servitude, or marginalization from family or peers.',
    storySignificance: 'Establishes moral sympathy and structural asymmetry, grounding the protagonist’s worth in virtue despite severe oppression.'
  },
  'supernatural-assistance': {
    id: 'supernatural-assistance',
    name: 'Supernatural Assistance',
    shortDescription: 'Otherworldly or spiritual intervention comes to the aid of an oppressed or virtuous seeker.',
    storySignificance: 'Reveals cosmic justice at work—whether via ancestral spirits, helpful nature spirits, fairy godmothers, or heavenly maidens.'
  },
  'lost-object-recognition': {
    id: 'lost-object-recognition',
    name: 'Recognition Through a Lost Token',
    shortDescription: 'A lost personal artifact (shoe, ring, token) becomes the undeniable proof of true identity and belonging.',
    storySignificance: 'A cornerstone narrative device across folklore and epic drama where external physical proof resolves hidden truth and mistaken identity.'
  },
  'transformation': {
    id: 'transformation',
    name: 'Magical Transformation of Attire',
    shortDescription: 'Commonplace, humble items are transfigured into regal vestments to grant passage to high ceremonial gatherings.',
    storySignificance: 'Symbolizes the revelation of inner royalty, grace, or divine favor disguised beneath earthly squalor.'
  },
  'reversal-of-fortune': {
    id: 'reversal-of-fortune',
    name: 'Reversal of Fortune (Peripeteia)',
    shortDescription: 'A dramatic elevation of the humble and the downfall or moral reckoning of the tormentors.',
    storySignificance: 'Fulfills the universal human desire for restorative justice and moral vindication.'
  },
  'separation-and-reunion': {
    id: 'separation-and-reunion',
    name: 'Separation & Fated Reunion (Vipralambha)',
    shortDescription: 'Lovers are torn apart by estrangement or destiny, enduring trials before an emotional reunion.',
    storySignificance: 'Central aesthetic in classical Sanskrit drama and romance literature, exploring devotion, longing, and spiritual maturity.'
  },
  'memory-and-forgetting': {
    id: 'memory-and-forgetting',
    name: 'Memory, Forgetting & Curses',
    shortDescription: 'A divine curse or twist of fate causes cognitive amnesia until triggered by a fateful talisman.',
    storySignificance: 'Dramatizes human vulnerability to higher cosmic forces and the tragic rift between subjective emotion and objective duty.'
  },
  'love-and-duty': {
    id: 'love-and-duty',
    name: 'Conflict of Love & Royal Duty (Dharma)',
    shortDescription: 'A deep tension between personal desire or affection and societal obligation, honor, or kingly duty.',
    storySignificance: 'Elevates personal drama to universal moral philosophy, exploring righteousness within structured social orders.'
  }
};
