/**
 * claw-buddy companion generation — ported from Claude Code src/buddy/companion.ts
 * Pure JS PRNG, no Bun dependency.
 */

import {
  type Companion,
  type CompanionBones,
  type CompanionGrowth,
  DEFAULT_GROWTH,
  EYES,
  HATS,
  RARITIES,
  RARITY_WEIGHTS,
  type Rarity,
  SPECIES,
  STAT_NAMES,
  type StatName,
  type StoredCompanion,
} from './types.js';

// Mulberry32 — tiny seeded PRNG, good enough for picking ducks
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// FNV-1a hash — same as Claude Code's non-Bun fallback
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

function rollRarity(rng: () => number): Rarity {
  const total = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
  let roll = rng() * total;
  for (const rarity of RARITIES) {
    roll -= RARITY_WEIGHTS[rarity];
    if (roll < 0) return rarity;
  }
  return 'common';
}

const RARITY_FLOOR: Record<Rarity, number> = {
  common: 5,
  uncommon: 15,
  rare: 25,
  epic: 35,
  legendary: 50,
};

// One peak stat, one dump stat, rest scattered. Rarity bumps the floor.
function rollStats(
  rng: () => number,
  rarity: Rarity,
): Record<StatName, number> {
  const floor = RARITY_FLOOR[rarity];
  const peak = pick(rng, STAT_NAMES);
  let dump = pick(rng, STAT_NAMES);
  while (dump === peak) dump = pick(rng, STAT_NAMES);

  const stats = {} as Record<StatName, number>;
  for (const name of STAT_NAMES) {
    if (name === peak) {
      stats[name] = Math.min(100, floor + 50 + Math.floor(rng() * 30));
    } else if (name === dump) {
      stats[name] = Math.max(1, floor - 10 + Math.floor(rng() * 15));
    } else {
      stats[name] = floor + Math.floor(rng() * 40);
    }
  }
  return stats;
}

const SALT = 'claw-buddy-2026';

export type Roll = {
  bones: CompanionBones;
  inspirationSeed: number;
};

function rollFrom(rng: () => number): Roll {
  const rarity = rollRarity(rng);
  const bones: CompanionBones = {
    rarity,
    species: pick(rng, SPECIES),
    eye: pick(rng, EYES),
    hat: rarity === 'common' ? 'none' : pick(rng, HATS),
    shiny: rng() < 0.01,
    stats: rollStats(rng, rarity),
  };
  return { bones, inspirationSeed: Math.floor(rng() * 1e9) };
}

// Cache the deterministic result per userId
let rollCache: { key: string; value: Roll } | undefined;

export function roll(userId: string): Roll {
  const key = userId + SALT;
  if (rollCache?.key === key) return rollCache.value;
  const value = rollFrom(mulberry32(hashString(key)));
  rollCache = { key, value };
  return value;
}

export function rollWithSeed(seed: string): Roll {
  return rollFrom(mulberry32(hashString(seed)));
}

/**
 * Regenerate bones from userId, merge with stored soul.
 * Bones never persist so species renames can't break stored companions.
 */
export function assembleCompanion(
  userId: string,
  stored: StoredCompanion,
): Companion {
  const { bones } = roll(userId);
  return { ...stored, ...bones };
}

/**
 * Generate a default name for the companion based on species.
 */
const SPECIES_NAMES: Record<string, string[]> = {
  duck: ['Quackers', 'Waddle', 'Ducky', 'Puddle', 'Biscuit'],
  goose: ['Honkers', 'Goober', 'Noodle', 'Bumble', 'Goosey'],
  blob: ['Blobby', 'Smoosh', 'Jiggly', 'Goo', 'Squish'],
  cat: ['Whiskers', 'Mittens', 'Shadow', 'Beans', 'Mochi'],
  dragon: ['Ember', 'Sparky', 'Blaze', 'Pyro', 'Cinder'],
  octopus: ['Inky', 'Tentacles', 'Squidly', 'Bubbles', 'Coral'],
  owl: ['Hoots', 'Owlbert', 'Wisdom', 'Sage', 'Luna'],
  penguin: ['Waddles', 'Tux', 'Flipper', 'Chill', 'Pingu'],
  turtle: ['Shelly', 'Slowpoke', 'Tank', 'Mossy', 'Zen'],
  snail: ['Turbo', 'Slimy', 'Spiral', 'Dash', 'Trail'],
  ghost: ['Spooky', 'Boo', 'Phantom', 'Wispy', 'Casper'],
  axolotl: ['Axel', 'Lotl', 'Gills', 'Pinky', 'Frilly'],
  capybara: ['Capy', 'Chill', 'Boba', 'Mellow', 'Nugget'],
  cactus: ['Spike', 'Prickle', 'Sandy', 'Sunny', 'Thorn'],
  robot: ['Beep', 'Bolt', 'Pixel', 'Circuit', 'Byte'],
  rabbit: ['Bun', 'Clover', 'Hop', 'Floof', 'Carrot'],
  mushroom: ['Shroom', 'Spore', 'Toadie', 'Funghi', 'Truffle'],
  chonk: ['Chonky', 'Fluff', 'Dumpling', 'Chunk', 'Puff'],
};

export function generateDefaultName(userId: string): string {
  const { bones, inspirationSeed } = roll(userId);
  const names = SPECIES_NAMES[bones.species] ?? ['Buddy'];
  const rng = mulberry32(inspirationSeed);
  return pick(rng, names);
}

export function generateDefaultPersonality(
  bones: CompanionBones,
): string {
  const traits: string[] = [];
  const stats = bones.stats;

  if (stats.CHAOS > 60) traits.push('chaotic');
  else if (stats.CHAOS < 25) traits.push('calm');

  if (stats.SNARK > 60) traits.push('snarky');
  else if (stats.SNARK < 25) traits.push('sweet');

  if (stats.WISDOM > 60) traits.push('wise');
  if (stats.PATIENCE > 60) traits.push('patient');
  if (stats.DEBUGGING > 60) traits.push('nerdy');

  if (traits.length === 0) traits.push('chill');

  return `A ${traits.join(', ')} ${bones.species}`;
}
