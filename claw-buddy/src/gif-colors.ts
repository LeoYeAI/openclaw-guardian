/**
 * gif-colors.ts — Rarity-based color schemes for claw-buddy GIF rendering
 */

import type { Rarity } from './types.js';

export type RGB = [number, number, number];

export interface ColorScheme {
  bg: RGB;           // background
  sprite: RGB;       // main sprite color
  title: RGB;        // name / title text
  subtitle: RGB;     // rarity / species label
  dim: RGB;          // footer / watermark
  accent: RGB;       // highlights, effects
  shinyFlash: RGB;   // shiny alternate color
}

export const RARITY_COLORS: Record<Rarity, ColorScheme> = {
  common: {
    bg:         [13, 13, 26],
    sprite:     [51, 255, 153],
    title:      [255, 153, 68],
    subtitle:   [85, 85, 119],
    dim:        [51, 51, 85],
    accent:     [100, 255, 180],
    shinyFlash: [255, 255, 255],
  },
  uncommon: {
    bg:         [13, 26, 13],
    sprite:     [102, 255, 204],
    title:      [255, 187, 68],
    subtitle:   [85, 119, 85],
    dim:        [51, 85, 51],
    accent:     [150, 255, 220],
    shinyFlash: [255, 255, 255],
  },
  rare: {
    bg:         [13, 13, 42],
    sprite:     [102, 153, 255],
    title:      [68, 187, 255],
    subtitle:   [85, 85, 140],
    dim:        [51, 51, 102],
    accent:     [130, 180, 255],
    shinyFlash: [255, 255, 255],
  },
  epic: {
    bg:         [26, 13, 42],
    sprite:     [204, 102, 255],
    title:      [255, 102, 204],
    subtitle:   [119, 85, 140],
    dim:        [85, 51, 102],
    accent:     [230, 150, 255],
    shinyFlash: [255, 255, 255],
  },
  legendary: {
    bg:         [26, 26, 13],
    sprite:     [255, 221, 68],
    title:      [255, 221, 68],
    subtitle:   [140, 130, 85],
    dim:        [102, 95, 51],
    accent:     [255, 240, 130],
    shinyFlash: [255, 255, 255],
  },
};

/**
 * Get color scheme for a companion, with shiny frame alternation
 */
export function getColors(rarity: Rarity, shiny: boolean, frameIdx: number): ColorScheme {
  const base = RARITY_COLORS[rarity];
  if (shiny && frameIdx % 2 === 1) {
    return { ...base, sprite: base.shinyFlash };
  }
  return base;
}
