/**
 * Big Bad Chicken - Game Constants & Data Tables
 */

export const GAME_CONFIG = {
  WORLD_WIDTH: 15000,
  WORLD_HEIGHT: 15000,
  INITIAL_PLAYER_SIZE: 24,
  MAX_PLAYER_SIZE: 2200,
  BASE_SPEED: 210, // Slower, more deliberate and controllable
  DASH_SPEED_MULTIPLIER: 1.6,
  DASH_HUNGER_DRAIN_RATE: 1.5, // Extra hunger drained while dashing
  
  // Hunger Bar - tuned to match the paced gameplay
  INITIAL_HUNGER: 100,
  MAX_HUNGER: 100,
  BASE_HUNGER_DRAIN: 1.8, // % per second (gives ~55s baseline so you don't starve unfairly)
  HUNGER_LOW_THRESHOLD: 25, // %
  
  // Suction / Vacuum
  SUCTION_RANGE_RATIO: 1.7, // Tight, satisfying suction radius
  SUCTION_SPEED: 460,
  
  // Exponential Leveling
  MAX_LEVEL: 1000000,
  BASE_XP: 100,
  
  // Combos
  COMBO_TIMEOUT: 2.8, // Generous combo window
};

// Exponential Level Milestones and Titles
export const LEVEL_MILESTONES = [
  { level: 1, title: 'Hatchling', badge: '🐣' },
  { level: 10, title: 'Yard Pecking Order', badge: '🐥' },
  { level: 50, title: 'Garden Menace', badge: '🌱' },
  { level: 100, title: 'Barnyard Terror', badge: '🐔' },
  { level: 500, title: 'Apex Rooster', badge: '🐓' },
  { level: 1000, title: 'Township Devourer', badge: '🏘️' },
  { level: 5000, title: 'Suburban Leviathan', badge: '🚗' },
  { level: 10000, title: 'Kaiju Clucker', badge: '🦖' },
  { level: 50000, title: 'Skyscraper Crusher', badge: '🏙️' },
  { level: 100000, title: 'Metropolis Feaster', badge: '🌆' },
  { level: 500000, title: 'Titan of the Coop', badge: '🌋' },
  { level: 1000000, title: 'COSMIC APOCALYPSE CHICKEN', badge: '🌌' },
];

/**
 * Calculates exponential level from total calories/points.
 * Paced so early levels take noticeable foraging, middle levels take dozens of farm animals,
 * and Level 1,000,000 is an epic late-game achievement.
 */
export function calculateLevelData(totalCalories) {
  if (totalCalories <= 0) {
    return {
      level: 1,
      progress: 0,
      currentTierTitle: LEVEL_MILESTONES[0].title,
      badge: LEVEL_MILESTONES[0].badge,
      formattedLevel: '1',
    };
  }

  const normalized = Math.max(0, totalCalories);
  let rawLevel = 1 + Math.floor(
    Math.pow(normalized / 45, 0.62) * 0.95 +
    Math.pow(normalized / 800, 1.15) * 0.015 +
    Math.pow(normalized / 12000, 1.58) * 0.0004
  );

  if (rawLevel > GAME_CONFIG.MAX_LEVEL) {
    rawLevel = GAME_CONFIG.MAX_LEVEL;
  }

  // Find corresponding milestone title
  let currentMilestone = LEVEL_MILESTONES[0];
  let nextMilestone = LEVEL_MILESTONES[1];
  for (let i = 0; i < LEVEL_MILESTONES.length; i++) {
    if (rawLevel >= LEVEL_MILESTONES[i].level) {
      currentMilestone = LEVEL_MILESTONES[i];
      nextMilestone = LEVEL_MILESTONES[i + 1] || LEVEL_MILESTONES[i];
    } else {
      break;
    }
  }

  let progress = 0;
  if (nextMilestone.level > currentMilestone.level) {
    progress = Math.min(1, Math.max(0, (rawLevel - currentMilestone.level) / (nextMilestone.level - currentMilestone.level)));
  } else {
    progress = 1;
  }

  return {
    level: rawLevel,
    progress,
    currentTierTitle: currentMilestone.title,
    badge: currentMilestone.badge,
    nextMilestoneLevel: nextMilestone.level,
    formattedLevel: formatNumber(rawLevel),
  };
}

export function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 2) + 'M';
  }
  if (num >= 10000) {
    return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + 'K';
  }
  return num.toLocaleString();
}

// 7 Progressive Tiers of Consumables
export const ITEM_TIERS = [
  {
    tier: 1,
    name: 'Seeds & Insects',
    minPlayerSize: 0,
    items: [
      { id: 'seed_wheat', name: 'Wheat Seed', size: 5, points: 15, hunger: 2.2, coins: 1, color: '#fef08a', shape: 'grain' },
      { id: 'seed_corn', name: 'Corn Kernel', size: 7, points: 28, hunger: 3.5, coins: 2, color: '#facc15', shape: 'kernel' },
      { id: 'earthworm', name: 'Wiggly Earthworm', size: 9, points: 45, hunger: 5.5, coins: 3, color: '#f472b6', shape: 'worm' },
      { id: 'grasshopper', name: 'Crispy Grasshopper', size: 11, points: 70, hunger: 7.0, coins: 4, color: '#86efac', shape: 'bug' },
      { id: 'blueberry', name: 'Sweet Blueberry', size: 10, points: 60, hunger: 6.0, coins: 3, color: '#60a5fa', shape: 'berry' },
      { id: 'bread_crumb', name: 'Golden Breadcrumb', size: 6, points: 20, hunger: 2.8, coins: 1, color: '#fed7aa', shape: 'crumb' },
      { id: 'golden_corn', name: 'Golden Corn', size: 8, points: 80, hunger: 10.0, coins: 25, color: '#fde047', shape: 'kernel', isGolden: true },
    ]
  },
  {
    tier: 2,
    name: 'Garden Critters & Produce',
    minPlayerSize: 45, // Raised from 32 to require ~150-180 tier 1 snacks
    items: [
      { id: 'white_egg', name: 'Stolen Egg', size: 15, points: 150, hunger: 10.0, coins: 8, color: '#f8fafc', shape: 'egg' },
      { id: 'field_mouse', name: 'Field Mouse', size: 18, points: 240, hunger: 13.0, coins: 12, color: '#a1a1aa', shape: 'mouse' },
      { id: 'garden_frog', name: 'Garden Frog', size: 21, points: 340, hunger: 16.0, coins: 15, color: '#4ade80', shape: 'frog' },
      { id: 'red_tomato', name: 'Ripe Tomato', size: 19, points: 280, hunger: 14.0, coins: 14, color: '#ef4444', shape: 'tomato' },
      { id: 'garden_gnome', name: 'Lawn Gnome', size: 25, points: 480, hunger: 19.0, coins: 22, color: '#38bdf8', shape: 'gnome' },
      { id: 'big_pumpkin', name: 'Prize Pumpkin', size: 28, points: 650, hunger: 22.0, coins: 30, color: '#f97316', shape: 'pumpkin' },
      { id: 'golden_egg', name: 'Golden Egg', size: 17, points: 450, hunger: 25.0, coins: 75, color: '#fbbf24', shape: 'egg', isGolden: true },
    ]
  },
  {
    tier: 3,
    name: 'Barnyard Animals & Small Obstacles',
    minPlayerSize: 90,
    items: [
      { id: 'baby_rabbit', name: 'Fluffy Rabbit', size: 38, points: 1200, hunger: 25.0, coins: 50, color: '#e2e8f0', shape: 'rabbit' },
      { id: 'barn_cat', name: 'Mischievous Barn Cat', size: 48, points: 2200, hunger: 32.0, coins: 85, color: '#fb923c', shape: 'cat' },
      { id: 'small_dog', name: 'Terrier Pup', size: 55, points: 3500, hunger: 38.0, coins: 120, color: '#b45309', shape: 'dog' },
      { id: 'hay_bale', name: 'Giant Hay Bale', size: 65, points: 5000, hunger: 42.0, coins: 160, color: '#fde047', shape: 'hay' },
      { id: 'wooden_fence', name: 'Fence Section', size: 52, points: 3200, hunger: 30.0, coins: 100, color: '#a16207', shape: 'fence' },
      { id: 'piglet', name: 'Muddy Pig', size: 70, points: 7000, hunger: 48.0, coins: 220, color: '#f472b6', shape: 'pig' },
      { id: 'gold_piggy', name: 'Gold Piggy Bank', size: 45, points: 2500, hunger: 45.0, coins: 250, color: '#fbbf24', shape: 'pig', isGolden: true },
    ]
  },
  {
    tier: 4,
    name: 'Livestock & Farm Machinery',
    minPlayerSize: 180,
    items: [
      { id: 'flock_sheep', name: 'Woolly Sheep', size: 85, points: 14000, hunger: 55.0, coins: 380, color: '#f1f5f9', shape: 'sheep' },
      { id: 'dairy_cow', name: 'Dairy Cow', size: 105, points: 28000, hunger: 65.0, coins: 650, color: '#1e293b', shape: 'cow' },
      { id: 'wild_horse', name: 'Galloping Horse', size: 120, points: 42000, hunger: 75.0, coins: 900, color: '#78350f', shape: 'horse' },
      { id: 'farm_tractor', name: 'Red Farm Tractor', size: 140, points: 65000, hunger: 85.0, coins: 1400, color: '#dc2626', shape: 'tractor' },
      { id: 'grain_silo', name: 'Grain Silo', size: 165, points: 95000, hunger: 90.0, coins: 2100, color: '#94a3b8', shape: 'silo' },
      { id: 'red_barn', name: 'Two-Story Barn', size: 210, points: 160000, hunger: 100.0, coins: 3500, color: '#991b1b', shape: 'barn' },
    ]
  },
  {
    tier: 5,
    name: 'Town, Cars & Suburbia',
    minPlayerSize: 380,
    items: [
      { id: 'sedan_car', name: 'Family Sedan', size: 230, points: 250000, hunger: 100.0, coins: 5000, color: '#2563eb', shape: 'car' },
      { id: 'police_cruiser', name: 'Police Cruiser', size: 245, points: 320000, hunger: 100.0, coins: 6500, color: '#0284c7', shape: 'police' },
      { id: 'school_bus', name: 'Yellow School Bus', size: 290, points: 520000, hunger: 100.0, coins: 9500, color: '#eab308', shape: 'bus' },
      { id: 'suburban_house', name: 'Suburban House', size: 360, points: 950000, hunger: 100.0, coins: 16000, color: '#f87171', shape: 'house' },
      { id: 'water_tower', name: 'Municipal Water Tower', size: 420, points: 1600000, hunger: 100.0, coins: 25000, color: '#0284c7', shape: 'watertower' },
      { id: 'grocery_store', name: 'Mega Grocery Mart', size: 490, points: 2600000, hunger: 100.0, coins: 38000, color: '#10b981', shape: 'mart' },
    ]
  },
  {
    tier: 6,
    name: 'Metropolis & Mega Structures',
    minPlayerSize: 850,
    items: [
      { id: 'semi_truck', name: 'Semi Highway Truck', size: 520, points: 4200000, hunger: 100.0, coins: 55000, color: '#ea580c', shape: 'truck' },
      { id: 'office_block', name: 'Glass Office Block', size: 680, points: 8500000, hunger: 100.0, coins: 90000, color: '#38bdf8', shape: 'office' },
      { id: 'sports_stadium', name: 'Football Stadium', size: 850, points: 16000000, hunger: 100.0, coins: 160000, color: '#16a34a', shape: 'stadium' },
      { id: 'skyscraper', name: 'Mega Skyscraper', size: 1050, points: 30000000, hunger: 100.0, coins: 280000, color: '#6366f1', shape: 'skyscraper' },
      { id: 'cruise_ship', name: 'Ocean Cruise Liner', size: 1200, points: 50000000, hunger: 100.0, coins: 450000, color: '#f8fafc', shape: 'ship' },
    ]
  },
  {
    tier: 7,
    name: 'Cosmic & Planetary Wonders',
    minPlayerSize: 1700,
    items: [
      { id: 'mountain_peak', name: 'Alpine Mountain Peak', size: 1350, points: 80000000, hunger: 100.0, coins: 750000, color: '#64748b', shape: 'mountain' },
      { id: 'volcano_island', name: 'Active Volcano Island', size: 1550, points: 140000000, hunger: 100.0, coins: 1200000, color: '#dc2626', shape: 'volcano' },
      { id: 'launch_pad', name: 'Orbital Space Rocket', size: 1750, points: 220000000, hunger: 100.0, coins: 1800000, color: '#facc15', shape: 'rocket' },
      { id: 'lunar_moon', name: 'The Moon', size: 2000, points: 400000000, hunger: 100.0, coins: 3000000, color: '#e2e8f0', shape: 'moon' },
    ]
  }
];

// Silly Chicken Skins Catalog
export const CHICKEN_SKINS = [
  {
    id: 'classic',
    name: 'Classic Clucker',
    subtitle: 'The original bold backyard rooster',
    rarity: 'Common',
    cost: 0,
    colors: {
      body: '#ffffff',
      wing: '#f1f5f9',
      comb: '#dc2626',
      beak: '#f59e0b',
      eyes: '#0f172a',
      legs: '#ea580c',
      aura: null,
    },
    perk: 'Classic farmyard tenacity (+0% bonus)',
    speedBonus: 1.0,
    hungerBonus: 1.0,
    coinBonus: 1.0,
    particleType: 'feather',
  },
  {
    id: 'speedy',
    name: 'Speedy Pecker',
    subtitle: 'Fueled by high-octane corn kernels',
    rarity: 'Uncommon',
    cost: 250,
    colors: {
      body: '#fef08a',
      wing: '#fde047',
      comb: '#eab308',
      beak: '#ca8a04',
      eyes: '#1e293b',
      legs: '#f97316',
      aura: '#fef08a',
    },
    perk: '+22% Base Sprint & Walking Speed',
    speedBonus: 1.22,
    hungerBonus: 1.0,
    coinBonus: 1.05,
    particleType: 'sparks',
  },
  {
    id: 'shadow',
    name: 'Shadow Chicken',
    subtitle: 'Born from the void beneath the coop',
    rarity: 'Rare',
    cost: 600,
    colors: {
      body: '#0f172a',
      wing: '#1e1b4b',
      comb: '#7c3aed',
      beak: '#c084fc',
      eyes: '#a855f7',
      legs: '#581c87',
      aura: '#9333ea',
    },
    perk: '+35% Katamari Suction Vortex Range',
    suctionBonus: 1.35,
    speedBonus: 1.05,
    hungerBonus: 1.0,
    coinBonus: 1.1,
    particleType: 'shadow',
  },
  {
    id: 'lava',
    name: 'Lava Chicken',
    subtitle: 'Cooked to magma perfection',
    rarity: 'Epic',
    cost: 1400,
    colors: {
      body: '#ea580c',
      wing: '#9a3412',
      comb: '#fbbf24',
      beak: '#fef08a',
      eyes: '#ffffff',
      legs: '#7c2d12',
      aura: '#f97316',
    },
    perk: '-25% Slower Hunger Drain',
    speedBonus: 1.08,
    hungerBonus: 0.75, // drains at 75% speed
    coinBonus: 1.15,
    particleType: 'fire',
  },
  {
    id: 'disco',
    name: 'Disco Chicken',
    subtitle: 'King of the funky Saturday night coop',
    rarity: 'Epic',
    cost: 2800,
    colors: {
      body: '#ec4899',
      wing: '#a855f7',
      comb: '#06b6d4',
      beak: '#facc15',
      eyes: '#ffffff',
      legs: '#f43f5e',
      aura: '#e879f9',
    },
    perk: '+50% Longer Combo Window & Funky Trails',
    speedBonus: 1.12,
    hungerBonus: 0.9,
    coinBonus: 1.25,
    particleType: 'disco',
  },
  {
    id: 'cyber',
    name: 'Cyber Cluck 2077',
    subtitle: 'Titanium-plated cyborg rooster',
    rarity: 'Legendary',
    cost: 5500,
    colors: {
      body: '#1e293b',
      wing: '#0ea5e9',
      comb: '#06b6d4',
      beak: '#22d3ee',
      eyes: '#38bdf8',
      legs: '#0284c7',
      aura: '#00f0ff',
    },
    perk: '+30% Speed & Instant Sonic Dash recharge',
    speedBonus: 1.3,
    hungerBonus: 0.85,
    coinBonus: 1.35,
    particleType: 'cyber',
  },
  {
    id: 'golden',
    name: 'Golden Nugget',
    subtitle: 'Solid 24-Karat poultry royalty',
    rarity: 'Legendary',
    cost: 10000,
    colors: {
      body: '#facc15',
      wing: '#eab308',
      comb: '#fbbf24',
      beak: '#fef08a',
      eyes: '#78350f',
      legs: '#ca8a04',
      aura: '#fde047',
    },
    perk: '+75% Extra Coins on everything eaten!',
    speedBonus: 1.15,
    hungerBonus: 0.85,
    coinBonus: 1.75,
    particleType: 'gold',
  },
  {
    id: 'trex',
    name: 'T-Rex Chicken',
    subtitle: 'Their ancestors finally returned to claim the throne',
    rarity: 'Mythic',
    cost: 22000,
    colors: {
      body: '#15803d',
      wing: '#166534',
      comb: '#b91c1c',
      beak: '#fef08a',
      eyes: '#dc2626',
      legs: '#14532d',
      aura: '#22c55e',
    },
    perk: '+50% Suction & Fearsome Roar Cluck',
    suctionBonus: 1.5,
    speedBonus: 1.25,
    hungerBonus: 0.8,
    coinBonus: 2.0,
    particleType: 'dino',
  },
  {
    id: 'cosmic',
    name: 'Cosmic Overlord',
    subtitle: 'The infinite celestial devourer of galaxies',
    rarity: 'Divine',
    cost: 50000,
    colors: {
      body: '#030712',
      wing: '#1e1b4b',
      comb: '#818cf8',
      beak: '#c084fc',
      eyes: '#38bdf8',
      legs: '#4338ca',
      aura: '#6366f1',
    },
    perk: 'Cosmic Singularity: +75% Suction, +50% Speed, 2.5x Coins',
    suctionBonus: 1.75,
    speedBonus: 1.5,
    hungerBonus: 0.65,
    coinBonus: 2.5,
    particleType: 'cosmic',
  }
];
