import { StoryData } from '../types';

export const STORIES: StoryData[] = [
  // 1. Cinderella (France / Western Europe)
  {
    id: 'cinderella',
    title: 'Cinderella',
    originalOrAlternateTitle: 'Cendrillon ou la petite pantoufle de verre',
    country: 'France',
    culturalTradition: 'French Literary Fairy Tale (Late 17th Century)',
    coordinates: {
      lat: 48.8566,
      lng: 2.3522,
      label: 'Paris, France'
    },
    summary:
      'Charles Perrault’s definitive 1697 courtly retelling of an oppressed daughter whose virtue, aided by a fairy godmother and a lost glass slipper, guides her from the hearth to the royal palace.',
    shortRetelling:
      'Forced into scullery ashes by her cruel stepfamily, gentle Cinderella is gifted a golden coach and glass slippers by her fairy godmother. Fleeing the royal ball at midnight, she loses one slipper on the palace stairway. The prince tests the realm, recognizing her true grace.',
    fullRetelling: [
      'Following her father’s remarriage, a gentle young woman is relegated to the scullery by her vain stepmother and haughty stepsisters, sleeping near the fireplace among the ashes—earning the mocking sobriquet Cendrillon.',
      'When the King’s son announces a grand royal ball, the sisters depart in splendor while Cinderella weeps in solitude. Her fairy godmother appears, miraculously transfiguring a pumpkin into a gilded carriage, mice into dappled steeds, a rat into a coachman, and her threadbare rags into a gown of cloth of gold and silver, completed with delicate glass slippers (pantoufles de verre).',
      'Warned to depart before the stroke of midnight, Cinderella enchants the prince. On the second evening, fleeing as the clock strikes twelve, she inadvertently leaves behind one of her glass slippers upon the palace stairway.',
      'The prince proclaims he will marry whoever can wear the slipper without force. After court ladies and stepsisters fail, Cinderella effortlessly slides her foot into the slipper and produces its mate, forgiving her humbled sisters and ascending to the throne.'
    ],
    keyElements: [
      'A mistreated, virtuous young woman degraded to domestic ashes',
      'Cruel stepmother and arrogant stepsisters',
      'Fairy godmother as a magical patroness',
      'Marvelous courtly transformation of common objects',
      'The royal ball and strict midnight curfew',
      'The lost glass slipper (pantoufle de verre)',
      'Recognition, courtly clemency, and royal marriage'
    ],
    motifs: [
      'unjust-treatment',
      'supernatural-assistance',
      'lost-object-recognition',
      'transformation',
      'reversal-of-fortune',
      'separation-and-reunion'
    ],
    narrativeTraditionType: 'Cinderella-Type Folktale',
    sources: [
      {
        title: 'Histoires ou contes du temps passé, avec des moralités',
        authorOrAttribution: 'Charles Perrault',
        dateOrEra: '1697 (Paris: Claude Barbin)',
        context: 'Written in the sophisticated literary salon culture of Louis XIV’s France, moralizing oral folklore into high courtly prose.'
      }
    ],
    motifManifestations: {
      'unjust-treatment':
        'Forced into the kitchen ashes and servant labor by her haughty stepfamily, who deny her nobility and basic comfort.',
      'supernatural-assistance':
        'A fairy godmother arrives spontaneously to comfort her tears, wielding a magic wand to conjure royal luxury.',
      'lost-object-recognition':
        'The unyielding glass slipper—which cannot stretch or deceive—identifies her foot uniquely among all women of the realm.',
      'transformation':
        'A hollowed pumpkin becomes a gold coach, garden creatures become footmen, and ash-dusted rags turn into woven silver and jewels.',
      'reversal-of-fortune':
        'Elevated from domestic servitude to royal sovereign, while displaying courtly magnanimity toward her repentant kin.',
      'separation-and-reunion':
        'Torn away from the prince by the midnight toll, remaining separated until the search across Paris brings them together.'
    },
    distinctiveFeatures:
      'Introduction of the fairy godmother, the pumpkin coach, and glass slippers as literary inventions of the French court.',
    quote: 'Grace is the true gift of the fairies; without it, one can do nothing; with it, one can do all.'
  },

  // 2. Kongjwi and Patjwi (Korea / East Asia)
  {
    id: 'kongjwi',
    title: 'Kongjwi and Patjwi',
    originalOrAlternateTitle: 'Kongjwi Patjwi Jeon (콩쥐팥쥐전)',
    country: 'Korea',
    culturalTradition: 'Korean Joseon Dynasty Oral Folktale',
    coordinates: {
      lat: 37.5665,
      lng: 126.978,
      label: 'Seoul / Jeolla Province, Korea'
    },
    summary:
      'A beloved Korean classic of the Joseon era where virtuous Kongjwi overcomes impossible agrarian tasks through animal and celestial helpers, losing a silk slipper while hurrying to a village festival.',
    shortRetelling:
      'Tormented by her stepmother and stepsister Patjwi with broken farming tools, virtuous Kongjwi is assisted by a black ox, toad, and flock of sparrows. Rushing to a magistrate’s banquet, she drops an embroidered silk shoe into a mountain stream. The magistrate traces the delicate shoe to her door.',
    fullRetelling: [
      'Following the death of her mother, gentle Kongjwi is subjected to relentless malice by her stepmother Madam Bae and stepsister Patjwi. While Patjwi is pampered in silk, Kongjwi is clothed in rags and burdened with insurmountable agrarian labor.',
      'Before departing for a family feast, Madam Bae assigns Kongjwi impossible chores: plowing a stony hillside with a wooden hoe, filling a cracked earthen water jar, and hulling sacks of grain. As Kongjwi weeps, a black ox arrives from the clouds to till the soil, a giant toad plugs the jar leak with its body, and a flock of sparrows cleanly husks the grain.',
      'A celestial fairy descends with shimmering festival attire and a pair of exquisite embroidered silk shoes (kkotshin). Rushing across a mountain stream to view the regional magistrate’s procession, Kongjwi drops one shoe into the flowing waters.',
      'The magistrate finds the shoe, captivated by its delicate artistry. Declaring he will wed the woman whose foot it fits, his search leads to Kongjwi. Her foot slips into the silk shoe perfectly, unveiling her inner nobility.'
    ],
    keyElements: [
      'Virtuous maiden assigned impossible agrarian tasks (broken hoe, cracked water jug)',
      'Helpful animal spirits (black ox, toad, sparrows)',
      'Celestial maiden offering festival garments',
      'Lost embroidered silk shoe (kkotshin) dropped in a mountain stream',
      'Magistrate recognition and elevation to noble wife',
      'Agrarian community ethics and Buddhist/shamanic karmic balance'
    ],
    motifs: [
      'unjust-treatment',
      'supernatural-assistance',
      'lost-object-recognition',
      'reversal-of-fortune',
      'separation-and-reunion'
    ],
    narrativeTraditionType: 'Cinderella-Type Folktale',
    sources: [
      {
        title: 'Oral folktale transcribed into Hangul woodblock editions (Sinjeung Dongguk Yeoji Seungnam)',
        authorOrAttribution: 'Oral tradition compiled in late Joseon Dynasty',
        dateOrEra: '17th–18th Century CE (Joseon Korea)',
        context: 'Reflects Confucian filial devotion, shamanistic nature reverence, and communal agrarian solidarity.'
      }
    ],
    motifManifestations: {
      'unjust-treatment':
        'Deliberately sabotaged with a wooden hoe on rocky land and a cracked water vessel to prevent her attending the festival.',
      'supernatural-assistance':
        'Helpful creatures from nature (ox, water toad, sparrows) and a descending heavenly fairy resolve impossible agricultural chores.',
      'lost-object-recognition':
        'The embroidered silk shoe (kkotshin) dropped in a mountain stream proves Kongjwi’s singular beauty and virtue.',
      'reversal-of-fortune':
        'The impoverished, sun-browned maiden is recognized by the district magistrate and elevated to honored first wife.',
      'separation-and-reunion':
        'Fleeing the stream bank in bashfulness, she is reunited with the magistrate when he tours the countryside with the lost shoe.'
    },
    distinctiveFeatures:
      'Emphasizes communal agrarian labor, nature spirits rather than wands, and Confucian karmic justice.',
    quote: 'Though the hoe breaks upon the rock, heaven hears the sincere heart that does not curse.'
  },

  // 3. Ye Xian (China / East Asia)
  {
    id: 'yexian',
    title: 'Ye Xian',
    originalOrAlternateTitle: '葉限 (The Story of Ye Xian)',
    country: 'China',
    culturalTradition: 'Tang Dynasty Literary Collection (Southern China / Zhuang peoples)',
    coordinates: {
      lat: 22.817,
      lng: 108.3665,
      label: 'Guangxi Region, China'
    },
    summary:
      'Recorded circa 860 CE during the Tang Dynasty by Duan Chengshi, Ye Xian is the world’s earliest recorded Cinderella tale, featuring an orphaned maiden, a magical spirit-fish, and golden filigree shoes.',
    shortRetelling:
      'Orphaned in ancient Guangxi, clever Ye Xian befriends a miraculous red-finned fish. When her envious stepmother slaughters the fish, an old sage instructs Ye Xian to bury its bones. The wish-granting bones yield a gown of kingfisher feathers and tiny golden shoes, which lead an island king to seek her out.',
    fullRetelling: [
      'In an ancient cave settlement of southern China, intelligent and gifted Ye Xian loses both mother and father. Her harsh stepmother forces her to gather firewood along treacherous cliffs and draw water from deep, perilous chasms.',
      'Ye Xian finds solace in nurturing a two-inch fish with golden eyes and crimson fins in a mountain pond. Over time, the fish grows to ten cubits and surfaces only when Ye Xian approaches. Discovering this, the jealous stepmother tricks the fish with Ye Xian’s coat, kills and feasts upon it.',
      'Weeping, Ye Xian is visited by an elder with flowing hair who descends from the sky, revealing that the bones of the fish are imbued with potent ancestral spirit power. He instructs her to hide the bones in her room and pray to them in times of need.',
      'During the annual cave festival, Ye Xian prays to the bones and is endowed with a cloak woven from kingfisher feathers and slippers crafted from pure golden filigree. Fleeing when recognized by her stepsister, she drops a tiny golden shoe. The shoe is traded to King Tuohan of an island realm, who is astonished by its feather-light weight and tiny dimensions. He searches every household until Ye Xian puts it on, emerging in transcendent splendour.'
    ],
    keyElements: [
      'Orphaned cave-dwelling heroine with extraordinary pottery and textile skills',
      'Helpful companion fish with red fins and golden eyes',
      'Stepmother killing and eating the spirit animal',
      'Miraculous spirit-bones granting desires upon prayer',
      'Kingfisher feather cape and golden filigree shoes',
      'Cave-festival flight and dropped golden slipper',
      'Island King Tuohan conducting a kingdom-wide search'
    ],
    motifs: [
      'unjust-treatment',
      'supernatural-assistance',
      'lost-object-recognition',
      'transformation',
      'reversal-of-fortune'
    ],
    narrativeTraditionType: 'Cinderella-Type Folktale',
    sources: [
      {
        title: 'Youyang Zazu (酉陽雜俎) - Miscellaneous Morsels from Youyang',
        authorOrAttribution: 'Duan Chengshi (段成式)',
        dateOrEra: 'c. 860 CE (Tang Dynasty)',
        context: 'Preserved by an imperial official from his servant Li Shiyuan, recording indigenous oral traditions of southern China.'
      }
    ],
    motifManifestations: {
      'unjust-treatment':
        'Sent to chop wood on perilous jagged precipices and fetch water from bottomless pools hoping she will perish.',
      'supernatural-assistance':
        'The spirit of the red-finned companion fish, whose venerated bones grant divine robes and food in response to ancestral prayers.',
      'lost-object-recognition':
        'The tiny golden filigree slipper (jinlüxie), as light as down, which fits no woman in the entire kingdom except Ye Xian.',
      'transformation':
        'Humble rags turn into iridescent green-blue kingfisher feather capes and radiant golden footwear.',
      'reversal-of-fortune':
        'Ye Xian is wed to King Tuohan and leaves the desolate cave for an ocean kingdom, while the stepmother is crushed in a stone cave-in.'
    },
    distinctiveFeatures:
      'Pre-dates European Cinderella variants by over 800 years; fish ancestor reverence reflecting ancient southern Chinese water culture.',
    quote: 'The bones of the spirit-fish hold the breath of heaven; whatever your heart desires, pray to them and it shall appear.'
  },

  // 4. Shakuntala (India / South Asia)
  {
    id: 'shakuntala',
    title: 'The Recognition of Shakuntala',
    originalOrAlternateTitle: 'Abhijnanasakuntalam (अभिज्ञानशाकुन्तलम्)',
    country: 'India',
    culturalTradition: 'Classical Sanskrit Dramatic Masterpiece (Mahakavya)',
    coordinates: {
      lat: 29.9457,
      lng: 78.1642,
      label: 'Malini River Hermitage, Uttarakhand, India'
    },
    summary:
      'Kalidasa’s 4th–5th century CE Sanskrit drama from the Mahabharata: King Dushyanta weds hermit maiden Shakuntala, but a sage’s curse causes him to forget her until his lost royal signet ring is discovered in a fish.',
    shortRetelling:
      'In a sacred forest hermitage, King Dushyanta weds the gentle maiden Shakuntala, leaving his signet ring as a token of pledge. Struck by a sage’s curse, the king loses all memory of her. When Shakuntala loses the ring in a river, she is repudiated at court—until a fisherman recovers the fateful gem.',
    fullRetelling: [
      'In a serene forest hermitage on the banks of the Malini River, King Dushyanta meets Shakuntala, the foster daughter of Sage Kanva and offspring of the celestial apsara Menaka. Struck by love, they enter into a sacred Gandharva marriage. Before returning to his capital Hastinapura, the king leaves his royal signet ring, promising to send an escort for her.',
      'Lost in reverie of her beloved, Shakuntala inadvertently fails to welcome the irascible Sage Durvasa. Enraged by the slight, Durvasa curses her: the one she is daydreaming of shall forget her entirely, recalling nothing unless shown a fateful token of recognition (abhijñāna).',
      'Pregnant with their child, Shakuntala travels to the capital. While washing her hands at the pilgrimage ford of Sachitirtha, the signet ring slips from her finger into the river waters and is swallowed by a carp. At court, Dushyanta has no memory of their vows and rejects her as an impostor.',
      'Shakuntala is whisked away to the celestial hermitage of Sage Maricha by a column of divine light. Years later, a fisherman finds the royal ring inside the fish’s belly and brings it to the king. Upon beholding the carved jewel, the curse shatters, plunging Dushyanta into grief and penance until the gods unite them in the heavens with their fearless young son Bharata.'
    ],
    keyElements: [
      'Foster daughter of sages and heavenly nymph Menaka living in forest hermitage',
      'Gandharva wedding and pledge with royal signet ring (abhijñāna)',
      'Wrathful sage Durvasa’s curse of total amnesia',
      'Loss of the fateful ring in the sacred river ford',
      'Tragic repudiation in the royal court due to forgotten vows',
      'Recovery of the ring from the belly of a river carp by a humble fisherman',
      'Shattering of the curse, tearful celestial reunion, and birth of Emperor Bharata'
    ],
    motifs: [
      'lost-object-recognition',
      'separation-and-reunion',
      'memory-and-forgetting',
      'love-and-duty'
    ],
    narrativeTraditionType: 'Classical Sanskrit Drama',
    sources: [
      {
        title: 'Abhijñānaśākuntalam (The Recognition of Shakuntala)',
        authorOrAttribution: 'Kalidasa (कालिदास)',
        dateOrEra: 'c. 4th–5th Century CE (Gupta Empire)',
        context: 'Adapted from the Adi Parva of the Mahabharata, celebrated as the pinnacle of classical Indian aesthetic drama.'
      }
    ],
    motifManifestations: {
      'lost-object-recognition':
        'The royal signet ring engraved with Dushyanta’s name is the sole physical token that can pierce the amnesia of Durvasa’s curse.',
      'separation-and-reunion':
        'The lovers endure years of agonizing estrangement across mortal and celestial realms before their fated reunion in the heavens.',
      'memory-and-forgetting':
        'A holy curse causes absolute mental obliteration of love, presenting a psychological drama of forgotten truth.',
      'love-and-duty':
        'Dushyanta struggles between the impulse of righteous monarchical duty (refusing an unknown woman) and the gnawing sorrow of forgotten love.'
    },
    distinctiveFeatures:
      'Not a Cinderella variant, but a profound dramatic exploration of recognition (abhijñāna) and separation (vipralambha-sringara) in classical Sanskrit aesthetics.',
    quote: 'The memory of love is never extinguished; it sleeps beneath the veil of destiny until touched by the token of truth.'
  },

  // 5. Vasilisa the Beautiful (Russia / Slavic)
  {
    id: 'vasilisa',
    title: 'Vasilisa the Beautiful',
    originalOrAlternateTitle: 'Василиса Прекрасная (Vasilisa Prekrasnaya)',
    country: 'Russia',
    culturalTradition: 'East Slavic Oral Wonder Tale (Skazka)',
    coordinates: {
      lat: 55.7558,
      lng: 37.6173,
      label: 'Deep Birch Taiga, Central Russia'
    },
    summary:
      'Oppressed by her stepfamily, Vasilisa is sent into the dark forest to fetch fire from Baba Yaga. Guided by a magical doll blessed by her mother, she survives impossible trials and weaves cloth so luminous it catches the Tsar’s eye.',
    shortRetelling:
      'Sent into the black forest to borrow fire from the dread witch Baba Yaga, young Vasilisa survives thanks to a tiny wooden doll blessed by her dying mother. Returning with a glowing skull of fire that consumes her tormentors, she weaves spun flax so wondrous the Tsar summons her to his throne.',
    fullRetelling: [
      'Before passing away, Vasilisa’s mother gives her eight-year-old daughter a tiny wooden doll, bidding her to keep it secretly in her pocket, feed it bits of food, and ask its counsel whenever misfortune strikes.',
      'Her father remarries a widow with two spiteful daughters who torment Vasilisa with backbreaking labor. But each evening, Vasilisa feeds the doll crumbs; the doll completes her spinning and protects her skin from the harsh elements.',
      'One autumn, the stepmother extinguishes the hearth candles and sends Vasilisa into the ancient forest to fetch fire from Baba Yaga’s hut, which stands on chicken legs encircled by a fence of human bones topped with glowing skulls.',
      'Baba Yaga threatens to devour Vasilisa unless she sorts bushels of grain and poppy seeds before dawn. The enchanted doll accomplishes the tasks while Vasilisa sleeps. Imbued with her mother’s blessing, Vasilisa is sent away with a skull lantern whose burning eyes turn the cruel stepfamily to ash. Vasilisa moves to the capital, weaving linen so fine it passes through a needle’s eye, winning the heart of the young Tsar.'
    ],
    keyElements: [
      'Virtuous maiden persecuted by jealous stepmother and stepsisters',
      'Maternal heirloom: a tiny pocket doll fed with crumbs that acts as miraculous helper',
      'Perilous quest into the taiga to Baba Yaga’s chicken-legged hut',
      'Glowing skull lantern carrying ancestral justice',
      'Luminous spinning and weaving of miraculous linen',
      'Royal recognition by the Tsar through exquisite craftsmanship'
    ],
    motifs: [
      'unjust-treatment',
      'supernatural-assistance',
      'transformation',
      'reversal-of-fortune'
    ],
    narrativeTraditionType: 'Cinderella-Type Folktale',
    sources: [
      {
        title: 'Narodnye russkie skazki (Russian Fairy Tales)',
        authorOrAttribution: 'Alexander Afanasyev (Collection #104)',
        dateOrEra: '1855–1863 CE (Russian Empire)',
        context: 'Foundational East Slavic skazka blending maternal blessings, ancient shamanic forest guardian motifs, and domestic weaving trials.'
      }
    ],
    motifManifestations: {
      'unjust-treatment':
        'Sent deliberately into the winter forest to be killed and eaten by the child-devouring witch Baba Yaga.',
      'supernatural-assistance':
        'A miraculous pocket doll endowed with a mother’s dying blessing performs impossible sorting and spinning tasks.',
      'transformation':
        'Coarse flax fibers are magically spun into cloth so luminous and sheer it can pass through the eye of a needle.',
      'reversal-of-fortune':
        'The skull lantern destroys her persecutors, while her golden hands at the loom elevate her to Tsarina of all Russia.'
    },
    distinctiveFeatures:
      'Features Baba Yaga and the three horsemen of Dawn, Sun, and Night; supernatural assistance comes from a mother’s blessing residing in a small toy.',
    quote: 'Eat, little doll, and listen to my grief; for the mother’s blessing is a shield against all forest shadows.'
  },

  // 6. Anansi and the Box of Stories (Ghana / West Africa)
  {
    id: 'anansi',
    title: 'Anansi and the Box of Stories',
    originalOrAlternateTitle: 'Kweku Anansi and Nyame’s Golden Chest',
    country: 'Ghana',
    culturalTradition: 'Ashanti Oral Storytelling Tradition (Anansesem)',
    coordinates: {
      lat: 6.6885,
      lng: -1.6244,
      label: 'Kumasi, Ashanti Empire, Ghana'
    },
    summary:
      'The clever spider trickster Anansi completes four impossible capture quests assigned by Nyame the Sky God, winning the golden chest containing all the world’s tales and releasing them across humankind.',
    shortRetelling:
      'In the beginning, Nyame the Sky God kept all world stories locked in a golden wooden box. Anansi the spider offered to buy them. Challenged to capture the leopard of terrible teeth, stinging hornets, and unseen fairy, Anansi outwits them all with spun thread and clever traps, liberating storytelling to all mortals.',
    fullRetelling: [
      'In the golden days of the Ashanti people, there were no stories on Earth; all wisdom, humor, and myths belonged exclusively to Nyame, the Sky God, who kept them securely locked in a wooden chest beside his golden stool.',
      'Kweku Anansi, the small and frail spider, climbed a shimmering thread up into the heavens to purchase the stories. Nyame laughed: great kings with armies could not pay the price. Nyame demanded four impossible captures: Osebo the leopard of terrible teeth, Moboro the hornets that sting like fire, Onini the python that swallows men whole, and Mmoatia the invisible wood fairy.',
      'Anansi did not use swords or brute strength. He tricked the hornets into entering a hollow calabash to escape cold rain; he provoked the python into stretching along a bamboo pole to prove its length, binding it with vine threads; he dug a pit for the leopard and pulled him up with silk chords; and he baited the elusive fairy with a gum baby covered in sweet mashed yams.',
      'Carrying the four captives to Nyame’s high council, the Sky God was astonished. Opening the golden chest, Nyame proclaimed: “Henceforth, all stories shall belong to Anansi and be scattered like gold dust over the four corners of the earth.”'
    ],
    keyElements: [
      'The frail spider hero facing impossible quests against mighty beasts',
      'Nyame the Sky God guarding the locked golden chest of world stories',
      'Clever traps using hollow gourds, measurement poles, and sap dolls',
      'Spinning web threads to bridge earth and heaven',
      'The democratization of art and story to all humankind'
    ],
    motifs: [
      'supernatural-assistance',
      'transformation',
      'reversal-of-fortune'
    ],
    narrativeTraditionType: 'Trickster Tale',
    sources: [
      {
        title: 'Ashanti Folk-Tales',
        authorOrAttribution: 'R. S. Rattray (Recorded from Ashanti elders)',
        dateOrEra: '1930 (Oxford University Press)',
        context: 'Foundational myth of the Akan diaspora, explaining the origins of folklore, ingenuity, and oral transmission.'
      }
    ],
    motifManifestations: {
      'supernatural-assistance':
        'Anansi weaves silk ladder threads to reach the sky council and receives the blessings of cosmic narrative power.',
      'transformation':
        'Physical vulnerability is transformed into triumphant intellect; wild ferocious beasts are bound by simple wit.',
      'reversal-of-fortune':
        'The humble, mocked spider humbles the supreme Sky God and wins eternal renown as the keeper of oral wisdom.'
    },
    distinctiveFeatures:
      'Foundational myth for West African and Afro-Caribbean storytelling; celebrates intellect, cunning, and verbal art over physical power.',
    quote: 'The thread of a spider may seem frail as breath, but woven with wit it can bind the leopard and reach the stars.'
  },

  // 7. Momotaro (Peach Boy) (Japan / East Asia)
  {
    id: 'momotaro',
    title: 'Momotaro, the Peach Boy',
    originalOrAlternateTitle: '桃太郎 (Momotarō)',
    country: 'Japan',
    culturalTradition: 'Japanese Muromachi/Edo Period Oral Legend (Mukashibanashi)',
    coordinates: {
      lat: 34.6555,
      lng: 133.9197,
      label: 'Okayama, Inland Sea, Japan'
    },
    summary:
      'Born from a giant floating peach to an elderly couple, heroic Momotaro embarks on a quest to Onigashima (Ogre Island), befriending a dog, monkey, and pheasant with millet dumplings to reclaim stolen treasures for his village.',
    shortRetelling:
      'Discovered inside a colossal peach by childless elders, Momotaro grows strong and kind. When demonic Oni ravage the realm, he sets forth to Onigashima with sweet millet dumplings (kibi dango). Sharing his food, he wins loyal animal companions—a dog, monkey, and pheasant—breaching the fortress and restoring peace.',
    fullRetelling: [
      'An elderly washerwoman sees a gigantic, sweet-smelling peach bobbing down the mountain river. She brings it home to her woodcutter husband; when they slice the fruit, a healthy baby boy emerges from the core. Naming him Momotaro (Peach Boy), they raise him with deep devotion.',
      'As a young man, hearing of the terrifying Oni who pillage coastal villages from their stronghold of Onigashima, Momotaro asks for his parents’ blessing to defeat them. His mother prepares sweet kibi dango (millet cakes) for his pouch.',
      'Along the mountain trail, he is challenged successively by a talking dog, a clever monkey, and a vigilant green pheasant. Rather than fighting, Momotaro offers each one of his mother’s delicious cakes. Bound by the covenant of shared nourishment, the three become sworn allies.',
      'Crossing the rough seas to Onigashima, the pheasant flies over the spiked ramparts, the monkey unbars the heavy gates, and Momotaro and the dog lead the assault. Defeating the Oni king Akandoji, Momotaro extracts an oath of non-violence, returning home with stolen village treasures and filial honor.'
    ],
    keyElements: [
      'Miraculous birth from a floating celestial peach fruit',
      'Elderly childless couple blessed in old age',
      'The sacred kibi dango (millet dumplings) sealing covenants of friendship',
      'Trio of animal allies: faithful dog, nimble monkey, soaring pheasant',
      'Assault on the volcanic fortress of Onigashima',
      'Restoration of community safety, treasure return, and filial harmony'
    ],
    motifs: [
      'supernatural-assistance',
      'transformation',
      'reversal-of-fortune',
      'love-and-duty'
    ],
    narrativeTraditionType: 'Heroic Legend',
    sources: [
      {
        title: 'Kibyoshi & Otogizoshi woodblock editions (Edo period folktale compilations)',
        authorOrAttribution: 'Traditional oral mukashibanashi compiled by Sazanami Iwaya',
        dateOrEra: '14th–17th Century CE (Muromachi to Edo Japan)',
        context: 'Symbol of courage, loyalty, and filial piety deeply embedded in Japanese regional identity and children’s literature.'
      }
    ],
    motifManifestations: {
      'supernatural-assistance':
        'A talking dog, monkey, and pheasant become invincible companions after receiving food hospitality.',
      'transformation':
        'A mysterious river fruit transforms into a living champion who protects the countryside.',
      'reversal-of-fortune':
        'Terrified, pillaged coastal farmers receive back all stolen wealth, while demonic ogres bow in submission.',
      'love-and-duty':
        'Momotaro journeys into mortal danger not for selfish glory, but out of filial duty to his parents and protection of his homeland.'
    },
    distinctiveFeatures:
      'Celebration of food hospitality (kibi dango) creating harmonious unity among distinct species to triumph over malice.',
    quote: 'Half a millet cake given in fellowship makes sworn brothers of strangers across land, forest, and sky.'
  },

  // 8. The Golden Crab (Greece / Mediterranean)
  {
    id: 'golden-crab',
    title: 'The Golden Crab',
    originalOrAlternateTitle: 'Ο Χρυσός Κάβουρας (O Chrysos Kavouras)',
    country: 'Greece',
    culturalTradition: 'Greek Island Folktale (Aegean Sea)',
    coordinates: {
      lat: 37.9838,
      lng: 23.7275,
      label: 'Aegean Archipelago, Greece'
    },
    summary:
      'An enchanted sea crab marries a king’s daughter, shedding its shell at night to reveal a radiant prince. When his secret is betrayed, he vanishes; the faithful princess crosses continents with magical golden gifts to find him.',
    shortRetelling:
      'A poor fisherman catches a golden crab that asks to marry the king’s youngest daughter. In their chamber, the crab casts off his crustacean armor to reveal a prince of sun-like beauty. When their secret is exposed, he is cursed away. The princess traverses high mountains with golden tokens, reclaiming her beloved.',
    fullRetelling: [
      'A humble Greek fisherman hauls his net from the sapphire Aegean and discovers a speaking crab with a shell of pure gold. The crab begs the fisherman to act as an intermediary and ask the King for his youngest daughter’s hand in marriage.',
      'Though mocked by the court, the princess accepts her fate with serene kindness. On their wedding night, the crab sheds its heavy golden shell, revealing an enchanted prince blessed with divine grace. He warns her: if anyone discovers his true form before the curse’s allotted span, he will vanish forever.',
      'At a royal banquet, pressed by her mocking mother, the princess reveals that her husband is the handsomest prince in the world. Instantly, a gust of wind extinguishes the torches and the prince disappears into the realm of the Sun.',
      'Grief-stricken, the princess embarks on an arduous pilgrimage, visiting the mother of the Sun, the mother of the Moon, and the mother of the South Wind. Each provides a golden spinning wheel, a golden hen with chicks, and golden keys. Using these tokens to bribe her way into his enchanted prison, she awakens him with a kiss of devotion.'
    ],
    keyElements: [
      'Enchanted animal bridegroom with a secret golden shell',
      'The prohibition against revealing his secret form',
      'Catastrophic breach of confidence and disappearance into the sky',
      'Arduous pilgrimage to cosmic personifications (Sun, Moon, Winds)',
      'Talismanic golden spinning wheel and golden hen tokens',
      'Reunion through sacrificial endurance and mutual devotion'
    ],
    motifs: [
      'transformation',
      'separation-and-reunion',
      'lost-object-recognition',
      'love-and-duty'
    ],
    narrativeTraditionType: 'Folk Romance',
    sources: [
      {
        title: 'Griechische Märchen, Sagen und Volkslieder',
        authorOrAttribution: 'Bernhard Schmidt & Andrew Lang (Yellow Fairy Book)',
        dateOrEra: '1877 CE (Athens & Leipzig)',
        context: 'Aegean variant of the ancient Cupid and Psyche cycle (ATU 425 The Search for the Lost Husband).'
      }
    ],
    motifManifestations: {
      'transformation':
        'A repulsive ocean crab transforms each night into a dazzling prince of sunlit nobility.',
      'separation-and-reunion':
        'A broken promise causes the lover to vanish across the heavens, requiring a multi-year quest to the ends of the cosmos.',
      'lost-object-recognition':
        'Golden cosmological gifts (golden hen, golden spindle) purchased from cosmic mothers identify her true devotion.',
      'love-and-duty':
        'The princess accepts social ridicule to honor her vows and risks her mortal life to undo her tragic mistake.'
    },
    distinctiveFeatures:
      'Ancient Greco-Roman motifs of Cupid and Psyche preserved in vibrant Aegean maritime folklore.',
    quote: 'Love that is tested by silence and forged across the winds cannot be kept apart by golden shells.'
  },

  // 9. Urashima Taro (Japan / East Asia)
  {
    id: 'urashima-taro',
    title: 'Urashima Taro and the Dragon Palace',
    originalOrAlternateTitle: '浦島太郎 (Urashima Tarō)',
    country: 'Japan',
    culturalTradition: 'Japanese Coastal Oral Myth (Nihon Shoki / Tango Fudoki)',
    coordinates: {
      lat: 35.6762,
      lng: 135.2503,
      label: 'Tango Peninsula Coast, Sea of Japan'
    },
    summary:
      'A kind fisherman rescues a sea turtle and is escorted to the underwater Dragon Palace of Ryugu-jo. Bestowed with a mysterious jeweled box (tamatebako), he returns to discover three centuries have passed.',
    shortRetelling:
      'Rescuing a sea turtle from cruel children on the beach, gentle fisherman Urashima Taro is taken to the coral palace of the Sea God. He spends what feels like three days with Princess Otohime. Longing for his aging mother, he returns with a forbidden jeweled box, discovering three hundred years have slipped away.',
    fullRetelling: [
      'On the misty coast of the Tango Peninsula, poor young fisherman Urashima Taro spots a group of mischievous boys tormenting a small sea turtle. Moved by compassion, he gives them his few coins to rescue the creature and gently returns it to the waves.',
      'Days later, a colossal turtle surfaces, thanking Taro for saving the daughter of Ryujin, the Dragon King of the Sea. Riding upon the turtle’s shell, Taro descends into the fathomless turquoise depths to Ryugu-jo, the radiant underwater coral palace.',
      'Welcomed by the divine Princess Otohime, Taro is treated to feasts, songs, and dances that shift through the four seasons in four courtyards. Though enchanted, thoughts of his frail widowed mother fill his heart with homesick grief, and he asks to return.',
      'Saddened, Princess Otohime gives him the Tamatebako (Jeweled Box of the Heavenly Hand), warning him with solemn tenderness: “Keep this box close, but never open it if you wish to see me again.” Taro returns to his shore, finding strangers in unfamiliar garments; his home is dust and village records show Urashima Taro drowned three hundred years ago. In despair, he unlatches the box: a ribbon of white mist rises, and his youthful skin shrivels into three centuries of white-haired age.'
    ],
    keyElements: [
      'Kindness to a defenseless marine animal rewarded with otherworldly hospitality',
      'Descent to Ryugu-jo, the underwater coral paradise of the Dragon King',
      'The distortion of time between mortal and celestial/divine realms',
      'The Tamatebako: a jeweled box containing time and youth',
      'The tragedy of timelessness versus human mortal attachment'
    ],
    motifs: [
      'supernatural-assistance',
      'transformation',
      'memory-and-forgetting',
      'separation-and-reunion'
    ],
    narrativeTraditionType: 'Heroic Legend',
    sources: [
      {
        title: 'Tango no Kuni Fudoki (丹後国風土記) & Nihon Shoki',
        authorOrAttribution: 'Imperial Chroniclers of Nara Japan',
        dateOrEra: 'c. 720 CE (Classical Japan)',
        context: 'One of the oldest recorded narratives in Japanese literature, meditating on time, compassion, and mortality.'
      }
    ],
    motifManifestations: {
      'supernatural-assistance':
        'A grateful sea turtle guides the fisherman safely beneath the waves to the celestial Dragon Palace.',
      'transformation':
        'Opening the forbidden box releases three centuries in an instant, transforming a young youth into an ancient elder.',
      'memory-and-forgetting':
        'Three centuries pass in what seemed three days; the mortal village has forgotten him completely while he was in bliss.',
      'separation-and-reunion':
        'Torn between the divine love of Princess Otohime and love for his mortal mother, he forever loses both.'
    },
    distinctiveFeatures:
      'Classic contemplation of relativistic time (Rip Van Winkle motif) rooted in Shinto/Daoist water immortality.',
    quote: 'Three days in the coral palace of the sea, and three hundred winters have withered the mortal shore.'
  },

  // 10. Sedna (Inuit / Arctic)
  {
    id: 'sedna',
    title: 'Sedna, Mistress of the Ocean Deep',
    originalOrAlternateTitle: 'Nuliajuk / Taleelayuk (ᓴᓐᓇ)',
    country: 'Canada / Greenland',
    culturalTradition: 'Inuit Circumpolar Sacred Cosmology',
    coordinates: {
      lat: 63.7467,
      lng: -68.517,
      label: 'Baffin Island / Arctic Ocean Waters'
    },
    summary:
      'Sacrificed to the icy sea during a violent storm, young Sedna’s severed finger tips transform into seals, walruses, and whales. Becoming the supreme keeper of life in the ocean abyss, angakkuit (shamans) comb her hair to restore sea game.',
    shortRetelling:
      'Tricked into marrying a deceitful storm bird, young Sedna is rescued by her father in a kayak. When the bird whips up a tempest, her terrified father casts her overboard. As she clings to the gunwale, her frozen fingers fall into the sea, transfiguring into seals, walruses, and great whales.',
    fullRetelling: [
      'On the frozen coast of the high Arctic, beautiful young Sedna rejects human suitors until a handsome hunter wrapped in dark furs promises her endless meat and warm bedding. She weds him, only to discover he is a Petrel bird-spirit whose nest is a harsh, fish-stench cliff.',
      'Her father journeys across the freezing fjords in an umiak to rescue her while the bird is hunting. Pursuing them across open waters, the petrel beats its massive wings, churning the dark ocean into a lethal maelstrom.',
      'In terror for his own life, the father casts Sedna overboard. When she clings with frantic hands to the kayak gunwale, he strikes her fingers with his paddle. Her severed fingertips tumble into the fathomless freezing abyss, transfiguring into the first ringed seals, bearded bearded seals, tusked walruses, and bowhead whales.',
      'Sedna sinks to the ocean floor, becoming Nuliajuk, the supreme Mistress of the Deep (Adlivun). When humans commit sins and break taboos, dirt and tangles foul her long hair; unable to comb it without fingers, she holds back sea creatures. Only when an angakkuq (shaman) travels in trance to wash and comb her locks does she release the animals to nourish the camps.'
    ],
    keyElements: [
      'Heroine betrayed and cast into the icy arctic ocean',
      'Transfiguration of severed fingertips into sea mammals (seals, walruses, whales)',
      'Descent to the abyss of Adlivun as ruler of life and marine game',
      'The shamanic journey of trance to comb her hair and soothe cosmic anger',
      'Sacred ecological reciprocity between human taboos and marine sustenance'
    ],
    motifs: [
      'unjust-treatment',
      'transformation',
      'separation-and-reunion'
    ],
    narrativeTraditionType: 'Mythological Epic',
    sources: [
      {
        title: 'The Central Eskimo (Smithsonian Bureau of Ethnology)',
        authorOrAttribution: 'Franz Boas (Compiled from Baffin Island Inuit elders)',
        dateOrEra: '1888 CE (Smithsonian Institution)',
        context: 'Sacred circumpolar cosmological tradition explaining the origins of sea animals and shamanic intercession.'
      }
    ],
    motifManifestations: {
      'unjust-treatment':
        'Betrayed first by a deceitful animal husband and then cast into freezing waves by her own father in panic.',
      'transformation':
        'Her severed fingers miraculously morph into living marine species, giving birth to the wildlife of the Arctic.',
      'separation-and-reunion':
        'Estranged from human warmth, she is reunited with human community only through the spirit travel of the shaman.'
    },
    distinctiveFeatures:
      'Not a whimsical fairy tale, but a foundational survival myth enshrining human humility and respectful ecological stewardship.',
    quote: 'Beneath the pack ice lies the mother of all seals; comb her tangled hair with gentle reverence, and the camp shall feast.'
  },

  // 11. Rhodopis and the Eagle (Egypt / Mediterranean)
  {
    id: 'rhodopis',
    title: 'Rhodopis and the Rose-Red Slipper',
    originalOrAlternateTitle: 'Ῥοδῶπις (The Rosy-Cheeked Maiden)',
    country: 'Egypt',
    culturalTradition: 'Greco-Egyptian Classical Oral History (Recorded by Strabo)',
    coordinates: {
      lat: 31.02,
      lng: 30.47,
      label: 'Naucratis / Nile Delta, Egypt'
    },
    summary:
      'Recorded by Strabo in the 1st century BCE, this oldest known precursor to Cinderella tells of Rhodopis, an enslaved maiden whose gilded sandal is snatched by an eagle and dropped into the lap of Pharaoh Amasis in Memphis.',
    shortRetelling:
      'While gentle Rhodopis bathes in the Nile, a majestic eagle snatches one of her gilded rose-red sandals. Soaring southward to ancient Memphis, the bird drops the sandal directly into the lap of Pharaoh Amasis. Charmed by its delicate beauty, the King commands his heralds to search all Egypt for its rightful owner.',
    fullRetelling: [
      'In the Greek merchant city of Naucratis in the Nile Delta, a fair-skinned maiden named Rhodopis (The Rosy-Cheeked) is held in servitude. While other domestic servants mock her foreign speech and gentle manners, her aged master notices her sweet singing and rewards her with exquisite rose-red sandals gilded with gold leaf.',
      'One warm afternoon, while Rhodopis is bathing in the shallows of the Nile and her slippers rest upon the reed bank, an eagle—sacred messenger of the sky god Horus—swoops down from the blinding sun, clutches one of the slippers in its talons, and soars away across the desert.',
      'In the royal city of Memphis, Pharaoh Amasis sits upon his open-air judgment throne administering justice to his subjects. The eagle circles above the royal dais and drops the delicate rose-red shoe precisely into the Pharaoh’s lap.',
      'Astonished by the miraculous omen and the shoe’s miniature perfection, the Pharaoh proclaims he will take no woman as his queen until the maiden who wore this slipper is found. Royal emissaries scour every port and oasis of the Nile, arriving at Naucratis where Rhodopis produces the matching slipper from her humble basket and is crowned Queen of Egypt.'
    ],
    keyElements: [
      'Foreign enslaved maiden living in the Nile Delta',
      'Mockery and isolation by fellow servants',
      'Gift of gilded rose-red leather sandals',
      'The eagle of Horus acting as divine catalyst',
      'The lost slipper falling into the Pharaoh’s lap during open court',
      'Kingdom-wide search along the Nile River and royal coronation'
    ],
    motifs: [
      'unjust-treatment',
      'supernatural-assistance',
      'lost-object-recognition',
      'reversal-of-fortune'
    ],
    narrativeTraditionType: 'Cinderella-Type Folktale',
    sources: [
      {
        title: 'Geographica (Book 17, Chapter 1, Section 33)',
        authorOrAttribution: 'Strabo (Στράβων)',
        dateOrEra: 'c. 7 BCE (Classical Greco-Roman Antiquity)',
        context: 'Earliest historically documented Cinderella-type story in written history, citing oral legend surrounding Pharaoh Amasis II.'
      }
    ],
    motifManifestations: {
      'unjust-treatment':
        'Captured from her Thracian homeland and made an enslaved scullery worker in a foreign Egyptian port city.',
      'supernatural-assistance':
        'An eagle of Horus acts as divine courier, bridging the vast distance between a lonely river bank and the royal court.',
      'lost-object-recognition':
        'The rose-red gilded slipper dropped into the Pharaoh’s lap proves her singular grace and matches its hidden companion.',
      'reversal-of-fortune':
        'Elevated from an enslaved foreign laundress to the consort of the Pharaoh and sovereign of the Two Lands.'
    },
    distinctiveFeatures:
      'The earliest known ancestor of the Cinderella cycle; divine eagle intervention replacing fairy godmothers and magical animals.',
    quote: 'The eagle of Horus chooses the path of kings; the smallest sandal in the Delta shall walk upon royal lotus floors.'
  },

  // 12. The Girl Without Hands / One-Hand Girl (Swahili / East Africa)
  {
    id: 'one-hand-girl',
    title: 'The Maiden Without Hands',
    originalOrAlternateTitle: 'Binti Ali and the Healing Tree',
    country: 'Tanzania',
    culturalTradition: 'Swahili Coastal Oral Tradition (Zanzibar Archipelago)',
    coordinates: {
      lat: -6.1659,
      lng: 39.2026,
      label: 'Zanzibar Coast, Tanzania'
    },
    summary:
      'Falsely accused by a jealous sister-in-law and cast out into the wilderness, virtuous Binti Ali receives divine protection from woodland creatures and a healing tree, eventually recognized by the Sultan through her lost golden ring.',
    shortRetelling:
      'Falsely slandered by her spiteful brother’s wife, gentle Binti Ali is banished into the coastal wilderness. Protected by compassionate forest spirits and nourished by an enchanted baobab tree, she marries a travelling prince. When slander separates them again, her lost signet ring reveals the truth, restoring her honor and family.',
    fullRetelling: [
      'In a flourishing Swahili coastal town, young maiden Binti Ali is loved by her elder brother. But when the brother marries a proud and envious woman, the sister-in-law plots her downfall, slaying the family’s prize stallion and blaming Binti Ali.',
      'Deceived by his wife’s feigned tears, the enraged brother casts Binti Ali into the deep scrub jungle, severing her hand as punishment. Weeping in agony, Binti Ali is sheltered by an ancient baobab tree whose hollow trunk opens to protect her, while birds drop wild honey into her mouth.',
      'The Sultan of a neighboring kingdom discovers her during a royal hunt, enchanted by her patience, modesty, and melodious voice. Bringing her to his palace, he has craftsmen fashion her a hand of pure hammered silver, wedding her with royal honor.',
      'When war calls the Sultan away, the vengeful sister-in-law intercepts royal letters, falsely claiming Binti Ali gave birth to a demon. Cast out once more, she wanders until she saves an infant at a sacred spring; miraculously, her hand is fully restored. When the grieving Sultan searches the realm, Binti Ali presents the golden ring he placed upon her finger on their wedding eve, vindicating her innocence.'
    ],
    keyElements: [
      'Innocent maiden falsely accused by a malevolent sister-in-law',
      'Mutilation and exile into the wilderness',
      'Supernatural shelter in an enchanted baobab tree with wild honey',
      'Crafting of an artificial hand of beaten silver',
      'Intercepted correspondence and second trial of exile',
      'Miraculous restoration of health and recognition via a royal wedding ring'
    ],
    motifs: [
      'unjust-treatment',
      'supernatural-assistance',
      'lost-object-recognition',
      'separation-and-reunion',
      'reversal-of-fortune'
    ],
    narrativeTraditionType: 'Cinderella-Type Folktale',
    sources: [
      {
        title: 'Swahili Tales, as told by Natives of Zanzibar',
        authorOrAttribution: 'Edward Steere (Oral Swahili folklore collection)',
        dateOrEra: '1870 CE (Bell & Daldy, London)',
        context: 'Coastal East African variant of the international ATU 706 The Maiden Without Hands cycle, rich in Islamic/Bantu values of sabr (patience).'
      }
    ],
    motifManifestations: {
      'unjust-treatment':
        'Falsely framed for the slaughter of livestock and cast into the thorn wilderness with severed limbs.',
      'supernatural-assistance':
        'An ancient baobab tree opens its trunk to shelter her, and wild doves nourish her with mountain honey.',
      'lost-object-recognition':
        'A royal wedding ring concealed in a silver amulet identifies her to the wandering Sultan searching for his lost queen.',
      'separation-and-reunion':
        'Twice banished by forged letters, she endures long solitary wandering before being restored to her kingdom.',
      'reversal-of-fortune':
        'Her wicked accuser is exposed before the elders, while Binti Ali reigns in justice with her miraculously restored hands.'
    },
    distinctiveFeatures:
      'Blends East African Swahili coastal hospitality, baobab reverence, and moral steadfastness (sabr) against domestic betrayal.',
    quote: 'The thorn tree may tear the garment of the innocent, but the root of truth drinks from deep waters.'
  },

  // 13. Mufaro’s Beautiful Daughters (Zimbabwe / Southern Africa)
  {
    id: 'mufaro',
    title: 'Mufaro’s Beautiful Daughters',
    originalOrAlternateTitle: 'Nyasha and Manyara / The King’s Tests',
    country: 'Zimbabwe',
    culturalTradition: 'Shona Oral Wisdom Tale (Great Zimbabwe Region)',
    coordinates: {
      lat: -20.2686,
      lng: 30.9333,
      label: 'Great Zimbabwe, Masvingo Province, Zimbabwe'
    },
    summary:
      'In a Shona village near Great Zimbabwe, two sisters take the journey to the royal city: haughty Manyara mocks beggars along the trail, while gentle Nyasha feeds them with generosity, discovering the King is a shape-shifting spirit who tested their true hearts.',
    shortRetelling:
      'Mufaro has two daughters: haughty Manyara and gentle Nyasha. When the King summons the land’s maidens to choose his queen, Manyara hurries ahead, rudely scorning a hungry boy and an old woman. Nyasha shares her food and comforts the weary. At the palace, the King reveals he assumed each guise to test their hearts.',
    fullRetelling: [
      'In a fertile valley within sight of the stone spires of Great Zimbabwe lives Mufaro, father of two beautiful daughters: Manyara, proud, short-tempered, and ambitious, and Nyasha, who sings to the birds while tending her plot of millet and yams.',
      'In her garden, Nyasha befriends a harmless little garden snake whom she names Nyoka, sharing crumbs with the creature each morning. Meanwhile, Manyara constantly taunts her sister, boasting that she will one day become Queen and make Nyasha her servant.',
      'When the King announces he will receive the most worthy daughters of the realm to choose his wife, Manyara sets off in the dead of night to arrive first. Along the forest road, she encounters a starving boy who begs for food, whom she angrily pushes aside; next she meets an old woman who advises her which forest fork to take, whom she ignores with scorn.',
      'The following dawn, Nyasha sets out with her father. She warmly shares her millet bread with the hungry boy and heeds the wise old woman’s counsel with grateful humility. Reaching the throne room, Manyara flees in horror, screaming that a multi-headed monster guards the chamber. Nyasha steps inside calmly, finding her little friend Nyoka the garden snake, who transforms into the King himself—revealing he was the hungry boy, the old woman, and the serpent, choosing Nyasha for her kindness.'
    ],
    keyElements: [
      'Two sisters representing opposing moral archetypes (humble virtue versus selfish pride)',
      'Garden companion snake (Nyoka) treated with affection and shared food',
      'Roadside tests of character: the starving boy and the elder counselor',
      'The shape-shifting monarch who tests inner character in varied guises',
      'Triumph of empathy over vanity and coronation as Queen'
    ],
    motifs: [
      'unjust-treatment',
      'supernatural-assistance',
      'transformation',
      'reversal-of-fortune'
    ],
    narrativeTraditionType: 'Cinderella-Type Folktale',
    sources: [
      {
        title: 'Kaffir Folk-Lore / Shona Folktale Traditions',
        authorOrAttribution: 'George McCall Theal & modernized by John Steptoe',
        dateOrEra: '1886 CE (Traditional Shona lore, Matabeleland/Mashonaland)',
        context: 'Shona moral tale celebrating unhu (humanity, empathy) against the majestic backdrop of ancient stone-built Great Zimbabwe.'
      }
    ],
    motifManifestations: {
      'unjust-treatment':
        'Persecuted and demeaned by her sister Manyara, who threatens to turn her into an enslaved domestic servant.',
      'supernatural-assistance':
        'Ancestral spirits and a magical garden snake offer secret protection to the daughter who respects life.',
      'transformation':
        'A tiny garden serpent shape-shifts into a magnificent monarch; a beggar boy transforms into royalty.',
      'reversal-of-fortune':
        'Haughty Manyara becomes a palace servant, while the humble gardening sister Nyasha is crowned beloved Queen.'
    },
    distinctiveFeatures:
      'African ATU 480 Kind and Unkind Girls archetype; emphasizes Ubuntu/Unhu philosophy where personhood is measured by generosity to strangers.',
    quote: 'The heart that shares its morning bread with the traveler needs no crown of gold to be noble.'
  },

  // 14. Popol Vuh Hero Twins (Guatemala / Maya)
  {
    id: 'popol-vuh-twins',
    title: 'The Hero Twins and the Lords of Xibalba',
    originalOrAlternateTitle: 'Hunahpu and Xbalanque (Popol Vuh)',
    country: 'Guatemala',
    culturalTradition: 'K’iche’ Maya Sacred Epic',
    coordinates: {
      lat: 15.0267,
      lng: -91.1497,
      label: 'K’iche’ Highlands / Utatlán, Guatemala'
    },
    summary:
      'Summoned to the treacherous underworld of Xibalba by demonic death lords, heroic twins Hunahpu and Xbalanque use miraculous trickery and mosquito scouts to pass deadly chamber trials, transforming into the celestial Sun and Moon.',
    shortRetelling:
      'Challenged to the underworld ballgame by the cruel Lords of Xibalba, the young K’iche’ Maya twins Hunahpu and Xbalanque survive trials of fire, obsidian blades, and shrieking bats through clever magic and insect allies. Sacrificing themselves in a fiery pit, they resurrect as magicians, outwitting the death lords and rising into the heavens as the Sun and Moon.',
    fullRetelling: [
      'Angered by the noise of the sacred rubber ball bouncing upon the earth, the twelve dread Lords of Death and Sickness in Xibalba summon the young twin brothers Hunahpu and Xbalanque down into the subterranean abyss to play the fatal ballgame.',
      'The underworld lords subject the boys to deadly traps: crossroads of pus and blood, mock wooden mannequin lords, and five terrifying ordeal chambers—the Dark House, the Razor House of slicing blades, the Cold House of freezing blizzards, the Jaguar House of ravenous beasts, and the Bat House of shrieking carnivores.',
      'Using a mosquito spy to bite each lord and discover their secret names, and enlisting fireflies to illuminate their glowing cigars without burning them, the twins triumph through intellect and communion with small creatures.',
      'In the final chamber, Hunahpu’s head is severed by Camazotz the Bat of Death, but Xbalanque carves an enchanted gourd replica to play the ballgame until a rabbit distracts the lords and retrieves the true head. Feigning defeat, the twins jump into a fiery furnace, returning in disguise as wondrous strolling magicians who resurrect the dead; when the gullible Lords of Xibalba ask to be sacrificed and revived, the twins execute them permanently, ascending into the sky as the radiant Sun and Full Moon.'
    ],
    keyElements: [
      'Twin hero brothers defending human dignity against underworld monsters',
      'The sacred Mesoamerican ritual ballgame (pitz)',
      'The ordeals of the five deadly subterranean houses',
      'Small animal scouts: mosquitoes, ants, fireflies, and rabbits',
      'Sacrificial death and glorious resurrection as illusionist masters',
      'Celestial transformation into the eternal Sun and Moon'
    ],
    motifs: [
      'unjust-treatment',
      'supernatural-assistance',
      'transformation',
      'reversal-of-fortune'
    ],
    narrativeTraditionType: 'Mythological Epic',
    sources: [
      {
        title: 'Popol Vuh (The Book of the Council)',
        authorOrAttribution: 'Preserved in K’iche’ Maya by indigenous scribes & transcribed by Fray Francisco Ximénez',
        dateOrEra: 'c. 1550s CE (Guatemala Highlands)',
        context: 'Sacred cosmological epic of the Maya people detailing creation, hero deeds, and the spiritual architecture of the cosmos.'
      }
    ],
    motifManifestations: {
      'unjust-treatment':
        'Arbitrarily tormented and subjected to lethal execution trials by the arrogant death lords of Xibalba.',
      'supernatural-assistance':
        'Fireflies, leaf-cutter ants, and a rabbit companion cooperate to outwit the razor blades and recover the lost head.',
      'transformation':
        'The brothers transform from subterranean prisoners into disguised magicians, and ultimately into the Sun and Moon.',
      'reversal-of-fortune':
        'The boastful, terrifying underworld lords are slaughtered by their own pride, while the orphaned twins reign over the skies.'
    },
    distinctiveFeatures:
      'Indigenous Mesoamerican epic where trickster intellect, sacrifice, and cosmic resurrection conquer mortality and underworld oppression.',
    quote: 'They did not conquer by the heavy club, but by the mosquito’s whisper and the ant’s quiet march through stone.'
  },

  // 15. The Story of Blind Baba Abdalla (Arabian Nights / Middle East)
  {
    id: 'baba-abdalla',
    title: 'The Story of Blind Baba Abdalla',
    originalOrAlternateTitle: 'The Dervish’s Ointment and the Forty Camels',
    country: 'Iraq',
    culturalTradition: 'Abbasid Golden Age Oral Narrative (One Thousand and One Nights)',
    coordinates: {
      lat: 33.3152,
      lng: 44.3661,
      label: 'Baghdad, Abbasid Caliphate, Iraq'
    },
    summary:
      'Entrusted with eighty camels loaded with treasure by a mystical dervish, wealthy merchant Baba Abdalla is granted a magical ointment revealing all earth’s treasures when placed on the left eye, but blinding darkness when greed compels him to rub it on his right eye.',
    shortRetelling:
      'A wealthy caravan master meets an ascetic dervish who leads him to a cave filled with mountains of gems. Gifted with camels and a miraculous ointment that reveals all buried treasures of the world when rubbed on the left eye, insatiable greed drives him to demand it on his right eye too—plunging him into perpetual blindness.',
    fullRetelling: [
      'Walking through the grand bazaar of Baghdad during the reign of Caliph Harun al-Rashid, the Caliph notices a blind beggar named Baba Abdalla who insists on receiving a blow from every donor as penance. Summoning him to the palace, the Caliph demands to hear the cause of this strange vow.',
      'Baba Abdalla confesses he was once the owner of eighty fine camels. In the desert of Basra, he met an impoverished dervish who promised to guide him to an undiscovered cavern crammed with immense heaps of gold, rubies, and pearls, on condition they divide the treasure and camels equally.',
      'Entering the cavern through a wall of rock opened by the dervish’s incense, they load all eighty camels with sparkling riches. Before departing, the dervish pockets a tiny wooden ointment jar. Overcome with sudden avarice along the road home, Baba Abdalla successively begs the dervish to surrender thirty, then ten, and finally all eighty camels, which the gentle mystic peaceably grants.',
      'Obsessed with the little ointment jar, Baba Abdalla demands to know its secret. The dervish explains: “Applied to your left eye, it enables you to see all the hidden treasures of the earth; applied to your right eye, it will strike you stone-blind.” Delighted by the left eye’s miraculous vision, his covetous mind suspects the dervish is hiding greater powers in the right eye. Ignoring the dervish’s warnings, he demands the ointment on his right eye—instantly sinking into black blindness, abandoned to wander in lifelong repentance.'
    ],
    keyElements: [
      'The prosperous caravan master corrupted by insatiable material greed',
      'The mystical wandering dervish possessing the miraculous ointment (kohl)',
      'The cavern of subterranean treasures opened with magic incense',
      'The dual nature of the talisman: worldly illumination versus self-inflicted blindness',
      'The moral confession and public repentance before Caliph Harun al-Rashid'
    ],
    motifs: [
      'transformation',
      'memory-and-forgetting',
      'reversal-of-fortune'
    ],
    narrativeTraditionType: 'Heroic Legend',
    sources: [
      {
        title: 'Kitāb alf laylah wa-laylah (One Thousand and One Nights)',
        authorOrAttribution: 'Antoine Galland & traditional Baghdadi storytellers',
        dateOrEra: 'c. 9th–14th Century CE (Abbasid Era)',
        context: 'Profound Islamic moral fable meditating on greed (tama‘), spiritual insight (basirah), and humility before God.'
      }
    ],
    motifManifestations: {
      'transformation':
        'A magical unguent transfigures ordinary mortal vision into the ability to see through solid earth and mountains of gold.',
      'memory-and-forgetting':
        'Blindness obliterates his memory of daylight and beauty, plunging him into sensory darkness where only conscience speaks.',
      'reversal-of-fortune':
        'From master of eighty camel caravans loaded with diamonds, he falls into a penniless blind beggar pleading for alms in the dust.'
    },
    distinctiveFeatures:
      'Classic Abbasid moral tale contrasting outer physical sight with inner spiritual illumination; illustrates how avarice blinds the soul.',
    quote: 'He who looks upon the gold of this world with both eyes wide open shall lose the light of the sun itself.'
  }
];
