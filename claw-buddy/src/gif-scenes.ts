/**
 * gif-scenes.ts — Scene frame sequences for claw-buddy GIF animations
 *
 * Each scene function returns an array of FrameOptions that gif-engine renders.
 * Uses sharp for PNG output and ffmpeg for GIF assembly.
 */

import { execSync } from 'child_process';
import { renderFrameBuffer, getFrameDimensions, type FrameOptions } from './gif-engine.js';
import type { RGB } from './gif-colors.js';
import { getColors } from './gif-colors.js';
import type { Companion, CompanionGrowth } from './types.js';
import { DEFAULT_GROWTH } from './types.js';
import { renderSprite } from './sprites.js';

let sharp: any;
try {
  sharp = require('sharp');
} catch {
  sharp = null;
}

// ── Helper ──

function getSpriteLines(companion: Companion, frame: number): string[] {
  return renderSprite(companion, frame);
}

async function framesToGif(
  frames: FrameOptions[],
  outputPath: string,
  fps: number = 2.5,
): Promise<void> {
  if (!sharp) throw new Error('sharp not installed');

  const { width, height } = getFrameDimensions();
  const tmpDir = '/tmp/buddy-gif-' + Date.now();
  execSync(`mkdir -p ${tmpDir}`);

  try {
    // Render each frame to PNG
    for (let i = 0; i < frames.length; i++) {
      const buf = renderFrameBuffer(frames[i]!);
      await sharp(buf, { raw: { width, height, channels: 3 } })
        .png({ compressionLevel: 9 })
        .toFile(`${tmpDir}/frame_${String(i).padStart(3, '0')}.png`);
    }

    // ffmpeg: generate palette then encode GIF
    execSync(
      `ffmpeg -y -framerate ${fps} -i "${tmpDir}/frame_%03d.png" ` +
      `-vf "split[s0][s1];[s0]palettegen=max_colors=256[p];[s1][p]paletteuse=dither=none" ` +
      `-loop 0 "${outputPath}"`,
      { stdio: 'pipe' },
    );
  } finally {
    execSync(`rm -rf ${tmpDir}`);
  }
}

// ── Scene: Idle Animation (3 frames) ──

export async function renderIdleGif(
  companion: Companion,
  growth: CompanionGrowth = DEFAULT_GROWTH,
  outputPath: string,
): Promise<void> {
  const frames: FrameOptions[] = [0, 1, 2].map(i => ({
    companion,
    growth,
    spriteLines: getSpriteLines(companion, i),
    frameIdx: i,
    showStatus: true,
  }));

  await framesToGif(frames, outputPath, 2.5);
}

// ── Scene: Pet Animation (4 frames) ──

export async function renderPetGif(
  companion: Companion,
  growth: CompanionGrowth = DEFAULT_GROWTH,
  outputPath: string,
): Promise<void> {
  const { width, height } = getFrameDimensions();
  const totalCols = Math.floor(width / (6 * 6)); // CELL_W * PIXEL_SIZE
  const heartColor: RGB = [255, 80, 120];

  const base0 = getSpriteLines(companion, 0);
  const base1 = getSpriteLines(companion, 1);

  const frames: FrameOptions[] = [
    // Frame 0: normal idle
    {
      companion, growth,
      spriteLines: base0,
      frameIdx: 0,
      showStatus: true,
    },
    // Frame 1: hearts appear above
    {
      companion, growth,
      spriteLines: base1,
      frameIdx: 1,
      showStatus: true,
      effects: [
        { ch: '♥', cx: 7, cy: 4, color: heartColor },
        { ch: '♥', cx: 11, cy: 3, color: heartColor },
      ],
    },
    // Frame 2: hearts float up
    {
      companion, growth,
      spriteLines: base0,
      frameIdx: 2,
      showStatus: true,
      effects: [
        { ch: '♥', cx: 7, cy: 3, color: heartColor },
        { ch: '♥', cx: 11, cy: 2, color: heartColor },
        { ch: '♥', cx: 5, cy: 4, color: heartColor },
      ],
    },
    // Frame 3: hearts scattered, companion happy
    {
      companion, growth,
      spriteLines: base1,
      frameIdx: 3,
      showStatus: true,
      effects: [
        { ch: '♥', cx: 6, cy: 2, color: heartColor },
        { ch: '♥', cx: 10, cy: 3, color: heartColor },
        { ch: '♥', cx: 13, cy: 2, color: heartColor },
      ],
    },
  ];

  await framesToGif(frames, outputPath, 3);
}

// ── Scene: Feed Animation (4 frames) ──

export async function renderFeedGif(
  companion: Companion,
  growth: CompanionGrowth = DEFAULT_GROWTH,
  outputPath: string,
): Promise<void> {
  const sparkColor: RGB = [255, 255, 100];
  const foodColor: RGB = [255, 180, 80];

  const base0 = getSpriteLines(companion, 0);
  const base1 = getSpriteLines(companion, 1);

  const frames: FrameOptions[] = [
    // Frame 0: food appears near mouth
    {
      companion, growth,
      spriteLines: base0,
      frameIdx: 0,
      showStatus: true,
      effects: [
        { ch: 'o', cx: 13, cy: 6, color: foodColor },
      ],
    },
    // Frame 1: food closer
    {
      companion, growth,
      spriteLines: base1,
      frameIdx: 1,
      showStatus: true,
      effects: [
        { ch: 'o', cx: 12, cy: 6, color: foodColor },
      ],
    },
    // Frame 2: eating — sparkles
    {
      companion, growth,
      spriteLines: base0,
      frameIdx: 2,
      showStatus: true,
      effects: [
        { ch: '*', cx: 8, cy: 4, color: sparkColor },
        { ch: '*', cx: 10, cy: 3, color: sparkColor },
      ],
    },
    // Frame 3: satisfied — sparkles above
    {
      companion, growth,
      spriteLines: base1,
      frameIdx: 3,
      showStatus: true,
      effects: [
        { ch: '*', cx: 7, cy: 3, color: sparkColor },
        { ch: '*', cx: 11, cy: 2, color: sparkColor },
        { ch: '*', cx: 9, cy: 2, color: sparkColor },
      ],
    },
  ];

  await framesToGif(frames, outputPath, 3);
}

// ── Scene: Level Up Animation (5 frames) ──

export async function renderLevelUpGif(
  companion: Companion,
  growth: CompanionGrowth = DEFAULT_GROWTH,
  newLevel: number,
  outputPath: string,
): Promise<void> {
  const starColor: RGB = [255, 255, 100];
  const flashColor: RGB = [255, 255, 255];
  const { width, height } = getFrameDimensions();

  const base0 = getSpriteLines(companion, 0);
  const base1 = getSpriteLines(companion, 1);
  const base2 = getSpriteLines(companion, 2);

  const frames: FrameOptions[] = [
    // Frame 0: normal with full XP
    {
      companion, growth,
      spriteLines: base0,
      frameIdx: 0,
      showStatus: true,
    },
    // Frame 1: flash white (sprite turns white)
    {
      companion: { ...companion, rarity: companion.rarity, shiny: true },
      growth,
      spriteLines: base1,
      frameIdx: 1, // shiny + odd frame = white flash
      showStatus: true,
    },
    // Frame 2: "LV UP" text + stars
    {
      companion, growth: { ...growth, level: newLevel },
      spriteLines: base2,
      frameIdx: 2,
      showStatus: true,
      effects: [
        { ch: '*', cx: 4, cy: 3, color: starColor },
        { ch: '*', cx: 14, cy: 3, color: starColor },
        { ch: '*', cx: 9, cy: 2, color: starColor },
      ],
    },
    // Frame 3: level number prominent
    {
      companion, growth: { ...growth, level: newLevel },
      spriteLines: base0,
      frameIdx: 3,
      showStatus: true,
      effects: [
        { ch: '*', cx: 5, cy: 2, color: starColor },
        { ch: '*', cx: 13, cy: 4, color: starColor },
      ],
    },
    // Frame 4: settle back to normal
    {
      companion, growth: { ...growth, level: newLevel },
      spriteLines: base1,
      frameIdx: 4,
      showStatus: true,
    },
  ];

  await framesToGif(frames, outputPath, 3);
}

// ── Scene: Hatch Animation (6 frames) ──

export async function renderHatchGif(
  companion: Companion,
  outputPath: string,
): Promise<void> {
  const shellColor: RGB = [200, 200, 180];
  const sparkColor: RGB = [255, 255, 100];
  const colors = getColors(companion.rarity, companion.shiny, 0);

  // Egg ASCII art (5 lines each)
  const eggIntact: string[] = [
    '            ',
    '    .--.    ',
    '   /    \\   ',
    '  |      |  ',
    '   `----´   ',
  ];
  const eggCrack1: string[] = [
    '            ',
    '    .--.    ',
    '   / /  \\   ',
    '  | / \\  |  ',
    '   `----´   ',
  ];
  const eggCrack2: string[] = [
    '            ',
    '    .--     ',
    '   //   \\   ',
    '  |/ \\\\  |  ',
    '   `----´   ',
  ];
  const eggHalf: string[] = [
    '            ',
    '            ',
    '    .  .    ',
    '   / __ \\   ',
    '   `----´   ',
  ];

  const realSprite = getSpriteLines(companion, 0);

  const frames: FrameOptions[] = [
    // Frame 0: intact egg
    { companion, spriteLines: eggIntact, frameIdx: 0, showStatus: false },
    // Frame 1: small crack
    { companion, spriteLines: eggCrack1, frameIdx: 1, showStatus: false },
    // Frame 2: bigger cracks
    { companion, spriteLines: eggCrack2, frameIdx: 2, showStatus: false },
    // Frame 3: half shell + eyes peeking
    {
      companion, spriteLines: eggHalf, frameIdx: 3, showStatus: false,
      effects: [
        { ch: companion.eye, cx: 8, cy: 5, color: colors.sprite },
        { ch: companion.eye, cx: 10, cy: 5, color: colors.sprite },
      ],
    },
    // Frame 4: companion emerges + shell debris
    {
      companion, spriteLines: realSprite, frameIdx: 4, showStatus: false,
      effects: [
        { ch: '.', cx: 5, cy: 8, color: shellColor },
        { ch: '.', cx: 13, cy: 7, color: shellColor },
      ],
    },
    // Frame 5: companion + sparkles (celebration)
    {
      companion, spriteLines: realSprite, frameIdx: 5, showStatus: true,
      effects: [
        { ch: '*', cx: 6, cy: 3, color: sparkColor },
        { ch: '*', cx: 12, cy: 2, color: sparkColor },
        { ch: '*', cx: 9, cy: 2, color: sparkColor },
        { ch: '*', cx: 4, cy: 4, color: sparkColor },
      ],
    },
  ];

  await framesToGif(frames, outputPath, 2);
}
