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
    label: 'E-waste',
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

// Catalog of items we know how to celebrate. Add freely.
export const ITEMS = {
  pet_bottle: {
    name: 'PET plastic bottle',
    stream: 'recycle',
    xp: 15,
    tip: 'Rinse and remove the cap before recycling.',
    bin: 'Blue bin'
  },
  paper: {
    name: 'Paper',
    stream: 'recycle',
    xp: 10,
    tip: 'Clean dry paper only — no greasy pizza boxes.',
    bin: 'Blue bin'
  },
  cardboard: {
    name: 'Cardboard',
    stream: 'recycle',
    xp: 10,
    tip: 'Flatten the box to save bin space.',
    bin: 'Blue bin'
  },
  aluminum_can: {
    name: 'Aluminum can',
    stream: 'recycle',
    xp: 15,
    tip: 'Rinse off liquid residue.',
    bin: 'Blue bin'
  },
  glass: {
    name: 'Glass container',
    stream: 'recycle',
    xp: 15,
    tip: 'Rinse — leave the label on.',
    bin: 'Blue bin'
  },
  apple_core: {
    name: 'Apple core',
    stream: 'organic',
    xp: 15,
    tip: 'Compost it — peel the sticker off first.',
    bin: 'Brown bin'
  },
  banana_peel: {
    name: 'Banana peel',
    stream: 'organic',
    xp: 15,
    tip: 'Compost — skip the plastic bag.',
    bin: 'Brown bin'
  },
  food_scraps: {
    name: 'Food scraps',
    stream: 'organic',
    xp: 20,
    tip: 'Drop in the brown bin or backyard compost.',
    bin: 'Brown bin'
  },
  coffee_grounds: {
    name: 'Coffee grounds',
    stream: 'organic',
    xp: 10,
    tip: 'Great compost — paper filter is fine to include.',
    bin: 'Brown bin'
  },
  yard_waste: {
    name: 'Yard waste',
    stream: 'organic',
    xp: 25,
    tip: 'Leaves and twigs only — no plastic ties.',
    bin: 'Green yard bin'
  },
  battery: {
    name: 'Battery',
    stream: 'ewaste',
    xp: 30,
    tip: 'Never the curb. Find an e-waste drop-off.',
    bin: 'E-waste drop-off'
  },
  electronics: {
    name: 'Small electronics',
    stream: 'ewaste',
    xp: 35,
    tip: 'Wipe personal data before dropping off.',
    bin: 'E-waste drop-off'
  },
  unknown: {
    name: 'Unidentified item',
    stream: 'trash',
    xp: 5,
    tip: "We weren't sure. When in doubt, landfill is safer than contaminating recycling.",
    bin: 'Landfill'
  }
};

// Hugging Face model labels → catalog item ids.
// Add your model's exact label strings here. Lowercase + underscore-friendly match.
// Anything not mapped falls through to `unknown`.
export const LABEL_TO_ITEM = {
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
  coffee: 'coffee_grounds',
  coffee_grounds: 'coffee_grounds',
  leaves: 'yard_waste',
  yard_waste: 'yard_waste',
  battery: 'battery',
  electronics: 'electronics',
  phone: 'electronics',
  laptop: 'electronics'
};

export function resolveItem(label) {
  if (!label) return ITEMS.unknown;
  const norm = String(label).toLowerCase().replace(/\s+/g, '_');
  const id = LABEL_TO_ITEM[norm] || LABEL_TO_ITEM[norm.replace(/_/g, ' ')] || 'unknown';
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
