// Streams = the dual-points system. Each scan credits exactly one stream.
export const STREAMS = {
  recycle: {
    id: 'recycle',
    label: 'Recycle',
    color: '#639922',
    accent: '#97C459',
    soft: '#EAF3DE',
    dark: '#27500A',
    icon: 'ti-recycle'
  },
  organic: {
    id: 'organic',
    label: 'Organic',
    color: '#BA7517',
    accent: '#EF9F27',
    soft: '#FAEEDA',
    dark: '#854F0B',
    icon: 'ti-leaf'
  },
  ewaste: {
    id: 'ewaste',
    label: 'Hazmat / E-waste',
    color: '#1D9E75',
    accent: '#5DCAA5',
    soft: '#E1F5EE',
    dark: '#085041',
    icon: 'ti-bolt'
  },
  trash: {
    id: 'trash',
    label: 'Landfill',
    color: '#888780',
    accent: '#B4B2A9',
    soft: '#F1EFE8',
    dark: '#444441',
    icon: 'ti-trash'
  }
};

// Catalog mirrors the 15 classes from the TrashSmart YOLOv8 + EfficientNetV2
// Space (https://huggingface.co/spaces/ontesla2020/trashsmartapp1). Each
// class is mapped to one of our streams + a tip + base XP reward.
export const ITEMS = {
  paper: {
    name: 'Paper',
    stream: 'recycle',
    xp: 10,
    tip: 'Clean dry paper only — no greasy pizza boxes.',
    bin: 'Blue recycling bin'
  },
  cardboard: {
    name: 'Cardboard',
    stream: 'recycle',
    xp: 10,
    tip: 'Flatten the box before recycling.',
    bin: 'Blue recycling bin'
  },
  plastic_bottle: {
    name: 'Plastic bottle',
    stream: 'recycle',
    xp: 15,
    tip: 'Empty and rinse. Caps on.',
    bin: 'Blue recycling bin'
  },
  hard_plastic: {
    name: 'Hard plastic',
    stream: 'recycle',
    xp: 15,
    tip: 'Rinse before recycling.',
    bin: 'Blue recycling bin'
  },
  plastic_film: {
    name: 'Plastic film',
    stream: 'trash',
    xp: 5,
    tip: 'Not curbside-recyclable. Take to a store film drop-off.',
    bin: 'Store drop-off'
  },
  metal_can: {
    name: 'Metal can',
    stream: 'recycle',
    xp: 15,
    tip: 'Empty and rinse.',
    bin: 'Blue recycling bin'
  },
  other_metal: {
    name: 'Scrap metal',
    stream: 'recycle',
    xp: 15,
    tip: 'Clean before recycling.',
    bin: 'Blue recycling bin'
  },
  glass_bottle: {
    name: 'Glass bottle',
    stream: 'recycle',
    xp: 15,
    tip: 'Rinse — leave the label on.',
    bin: 'Blue recycling bin'
  },
  other_glass: {
    name: 'Broken glass',
    stream: 'trash',
    xp: 5,
    tip: 'Wrap and trash — broken glass is not curbside-recyclable.',
    bin: 'Landfill bin'
  },
  organic_food: {
    name: 'Food waste',
    stream: 'organic',
    xp: 20,
    tip: 'Compost it — skip the plastic bag.',
    bin: 'Green compost bin'
  },
  textiles: {
    name: 'Textiles',
    stream: 'trash',
    xp: 10,
    tip: 'Donate if wearable, or use a textile drop-off bin.',
    bin: 'Donation / drop-off'
  },
  cigarette_waste: {
    name: 'Cigarette waste',
    stream: 'trash',
    xp: 5,
    tip: 'Place in trash. Never on the ground or in storm drains.',
    bin: 'Landfill bin'
  },
  sanitary_waste: {
    name: 'Sanitary waste',
    stream: 'trash',
    xp: 5,
    tip: 'Wrap and trash.',
    bin: 'Landfill bin'
  },
  hazardous: {
    name: 'Hazardous waste',
    stream: 'ewaste',
    xp: 35,
    tip: 'Take to a hazmat facility — never any curbside bin.',
    bin: 'Hazmat facility'
  },
  other_mixed: {
    name: 'Mixed waste',
    stream: 'trash',
    xp: 5,
    tip: 'When in doubt, the trash bin is safer than contaminating recycling.',
    bin: 'Landfill bin'
  },
  unknown: {
    name: 'Unidentified item',
    stream: 'trash',
    xp: 5,
    tip: "We weren't sure. When in doubt, landfill is safer than contaminating recycling.",
    bin: 'Landfill bin'
  }
};

// Maps the model's class strings (and a few aliases) to catalog item ids.
// Add aliases freely — the resolver normalises whitespace and case.
export const LABEL_TO_ITEM = {
<<<<<<< Updated upstream
  // ===== Direct mappings (backend label === existing legacy label) =====
  plastic_bottle: 'pet_bottle',
  'plastic bottle': 'pet_bottle',
  pet: 'pet_bottle',
  bottle: 'pet_bottle',

  paper: 'paper',
  newspaper: 'paper',

  cardboard: 'cardboard',
  box: 'cardboard',

  aluminum_can: 'aluminum_can',
  can: 'aluminum_can',
  metal: 'aluminum_can',
  metal_can: 'aluminum_can',          // backend -> existing item

  glass: 'glass',
  glass_bottle: 'glass',

  apple: 'apple_core',
  apple_core: 'apple_core',
  banana: 'banana_peel',
  banana_peel: 'banana_peel',

  food: 'food_scraps',
  food_waste: 'food_scraps',
  organic: 'food_scraps',
  compost: 'food_scraps',
  organic_food: 'food_scraps',        // backend -> existing item

  coffee: 'coffee_grounds',
  coffee_grounds: 'coffee_grounds',

  leaves: 'yard_waste',
  yard_waste: 'yard_waste',

  battery: 'battery',
  electronics: 'electronics',
  phone: 'electronics',
  laptop: 'electronics',
=======
  paper: 'paper',
  cardboard: 'cardboard',
  plastic_bottle: 'plastic_bottle',
  hard_plastic: 'hard_plastic',
  plastic_film: 'plastic_film',
  metal_can: 'metal_can',
  other_metal: 'other_metal',
  glass_bottle: 'glass_bottle',
  other_glass: 'other_glass',
  organic_food: 'organic_food',
  textiles: 'textiles',
  cigarette_waste: 'cigarette_waste',
  sanitary_waste: 'sanitary_waste',
  hazardous: 'hazardous',
  other_mixed: 'other_mixed'
};
>>>>>>> Stashed changes

  // ===== New backend classes that need mapping =====

  // Hard plastic (yogurt cups, plastic cutlery, tubs) — recyclable like bottles
  hard_plastic: 'pet_bottle',

  // Plastic film (bags, wrappers, cling film) — usually NOT curbside-recyclable.
  // Map to unknown so user gets "landfill" guidance (correct for most cities).
  plastic_film: 'unknown',

  // Other metal (foil, lids, scrap) — recyclable, treat as aluminum_can
  other_metal: 'aluminum_can',

  // Other glass (jars, cups, broken glass) — glass category
  other_glass: 'glass',

  // Textiles — no dedicated catalog item; route to unknown for now.
  // (Consider adding a 'textiles' item to ITEMS with stream: 'recycle'
  //  and bin: 'Textile drop-off' if you want first-class treatment.)
  textiles: 'unknown',

  // Cigarette waste — not recyclable, definitely landfill
  cigarette_waste: 'unknown',

  // Sanitary waste (tissues, masks, gloves) — landfill
  sanitary_waste: 'unknown',

  // Hazardous (batteries, chemicals) — route to battery item so user sees
  // "E-waste drop-off" guidance, which is correct for most hazardous items.
  hazardous: 'battery',

  // Catch-all
  other_mixed: 'unknown',
};
export function resolveItem(label) {
  if (!label) return { id: 'unknown', ...ITEMS.unknown };
  const norm = String(label).toLowerCase().trim().replace(/\s+/g, '_');
  const id = LABEL_TO_ITEM[norm] || 'unknown';
  return { id, ...ITEMS[id] };
}

// Quests. Stream-specific so we can reward best practices per stream.
export const DAILY_QUESTS = [
  {
    id: 'recycle_three',
    stream: 'recycle',
    title: 'Recycle 3 items',
    target: 3,
    bonus: 50
  },
  {
    id: 'rinse_first',
    stream: 'recycle',
    title: 'Verify a rinsed recyclable',
    target: 1,
    bonus: 20,
    requiresVerify: true
  },
  {
    id: 'compost_two',
    stream: 'organic',
    title: 'Compost 2 organics',
    target: 2,
    bonus: 60
  },
  {
    id: 'no_plastic_bag',
    stream: 'organic',
    title: 'Verify a no-bag compost drop',
    target: 1,
    bonus: 30,
    requiresVerify: true
  }
];

// Rewards. Replace with your partner list later.
export const REWARDS = [
  {
    id: 'bean_leaf',
    name: 'Bean & Leaf',
    detail: 'Free 12oz drink',
    cost: 500,
    category: 'cafe',
    icon: 'ti-coffee',
    featured: true
  },
  {
    id: 'ecomart_10',
    name: 'EcoMart 10% off',
    detail: 'In-store discount',
    cost: 800,
    category: 'shop',
    icon: 'ti-shopping-bag'
  },
  {
    id: 'oak_skin',
    name: 'Oak mascot skin',
    detail: 'In-app cosmetic',
    cost: 350,
    category: 'in-app',
    icon: 'ti-plant-2'
  },
  {
    id: 'sapling',
    name: 'Free sapling',
    detail: 'Pickup at Green Garden',
    cost: 1200,
    category: 'shop',
    icon: 'ti-plant'
  }
];
