/**
 * claw-buddy types — ported from Claude Code src/buddy/types.ts
 * Stripped of Bun-specific code, all pure TypeScript.
 */

export const RARITIES = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
] as const;
export type Rarity = (typeof RARITIES)[number];

// Species names
export const duck = 'duck' as const;
export const goose = 'goose' as const;
export const blob = 'blob' as const;
export const cat = 'cat' as const;
export const dragon = 'dragon' as const;
export const octopus = 'octopus' as const;
export const owl = 'owl' as const;
export const penguin = 'penguin' as const;
export const turtle = 'turtle' as const;
export const snail = 'snail' as const;
export const ghost = 'ghost' as const;
export const axolotl = 'axolotl' as const;
export const capybara = 'capybara' as const;
export const cactus = 'cactus' as const;
export const robot = 'robot' as const;
export const rabbit = 'rabbit' as const;
export const mushroom = 'mushroom' as const;
export const chonk = 'chonk' as const;

export const SPECIES = [
  duck, goose, blob, cat, dragon, octopus, owl, penguin,
  turtle, snail, ghost, axolotl, capybara, cactus, robot,
  rabbit, mushroom, chonk,
] as const;
export type Species = (typeof SPECIES)[number];

export const EYES = ['·', '✦', '×', '◉', '@', '°'] as const;
export type Eye = (typeof EYES)[number];

export const HATS = [
  'none', 'crown', 'tophat', 'propeller', 'halo',
  'wizard', 'beanie', 'tinyduck',
] as const;
export type Hat = (typeof HATS)[number];

export const STAT_NAMES = [
  'DEBUGGING', 'PATIENCE', 'CHAOS', 'WISDOM', 'SNARK',
] as const;
export type StatName = (typeof STAT_NAMES)[number];

/** Deterministic parts — derived from hash(userId) */
export type CompanionBones = {
  rarity: Rarity;
  species: Species;
  eye: Eye;
  hat: Hat;
  shiny: boolean;
  stats: Record<StatName, number>;
};

/** Model-generated soul — stored after first hatch */
export type CompanionSoul = {
  name: string;
  personality: string;
};

/** Full companion = bones + soul + hatch time */
export type Companion = CompanionBones & CompanionSoul & {
  hatchedAt: number;
};

/** What persists in DB. Bones are regenerated from userId every read. */
export type StoredCompanion = CompanionSoul & { hatchedAt: number };

export const RARITY_WEIGHTS = {
  common: 60,
  uncommon: 25,
  rare: 10,
  epic: 4,
  legendary: 1,
} as const satisfies Record<Rarity, number>;

export const RARITY_STARS: Record<Rarity, string> = {
  common: '★',
  uncommon: '★★',
  rare: '★★★',
  epic: '★★★★',
  legendary: '★★★★★',
};

export const RARITY_EMOJI: Record<Rarity, string> = {
  common: '⚪',
  uncommon: '🟢',
  rare: '🔵',
  epic: '🟣',
  legendary: '🟡',
};

/** Growth state — new for OpenClaw version */
export type CompanionGrowth = {
  xp: number;
  level: number;
  affection: number;
  mood: 'happy' | 'neutral' | 'sleepy' | 'excited';
  lastInteraction: number;
  totalChats: number;
  totalPets: number;
  totalFeeds: number;
};

export const DEFAULT_GROWTH: CompanionGrowth = {
  xp: 0,
  level: 1,
  affection: 0,
  mood: 'neutral',
  lastInteraction: 0,
  totalChats: 0,
  totalPets: 0,
  totalFeeds: 0,
};

/** XP thresholds for leveling up */
export function xpForLevel(level: number): number {
  // 1→2: 10xp, 2→3: 25xp, etc. Quadratic growth.
  return Math.floor(10 * level * (1 + level * 0.3));
}
