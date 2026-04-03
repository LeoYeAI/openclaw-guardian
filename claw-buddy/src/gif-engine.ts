/**
 * gif-engine.ts — Core pixel rendering engine for claw-buddy GIF generation
 *
 * Draws directly to raw RGB buffers (no SVG, no font rendering).
 * Uses 5×7 bitmap font scaled up by PIXEL_SIZE for crisp pixel art.
 */

import { getGlyph, CELL_W, CELL_H, CHAR_PX_W, CHAR_PX_H } from './bitmap-font.js';
import type { RGB, ColorScheme } from './gif-colors.js';
import { getColors } from './gif-colors.js';
import type { Companion, CompanionGrowth, Rarity } from './types.js';
import { RARITY_EMOJI } from './types.js';
import { renderSprite } from './sprites.js';

// ── Layout constants ──
const PIXEL_SIZE = 6;    // each logical pixel = 6×6 real pixels
const COLS = 14;         // max columns for sprite (12 + 2 padding)
const ROWS = 5;          // sprite rows
const PAD = 2;           // padding in cell units
const TITLE_ROWS = 2;   // title + subtitle
const STATUS_ROWS = 1;  // level/affection bar
const FOOTER_ROWS = 1;  // brand footer
const GAP_ROW = 1;      // gap between sections

const GRID_W = COLS * CELL_W + PAD * 2 * CELL_W;
const GRID_H = (TITLE_ROWS + GAP_ROW + ROWS + GAP_ROW + STATUS_ROWS + FOOTER_ROWS) * CELL_H + PAD * 2 * CELL_H;

export const IMG_W = GRID_W * PIXEL_SIZE;
export const IMG_H = GRID_H * PIXEL_SIZE;

// ── Drawing primitives ──

function setPixel(buf: Buffer, x: number, y: number, w: number, color: RGB): void {
  if (x < 0 || y < 0 || x >= w || y >= IMG_H) return;
  const off = (y * w + x) * 3;
  buf[off] = color[0]!;
  buf[off + 1] = color[1]!;
  buf[off + 2] = color[2]!;
}

function drawGlyph(
  buf: Buffer, ch: string,
  cellX: number, cellY: number,
  color: RGB, imgW: number,
): void {
  const glyph = getGlyph(ch);
  for (let row = 0; row < CHAR_PX_H; row++) {
    const bits = glyph[row]!;
    for (let col = 0; col < CHAR_PX_W; col++) {
      if (bits & (1 << (CHAR_PX_W - 1 - col))) {
        const baseX = cellX * CELL_W * PIXEL_SIZE + col * PIXEL_SIZE;
        const baseY = cellY * CELL_H * PIXEL_SIZE + row * PIXEL_SIZE;
        for (let dy = 0; dy < PIXEL_SIZE; dy++) {
          for (let dx = 0; dx < PIXEL_SIZE; dx++) {
            setPixel(buf, baseX + dx, baseY + dy, imgW, color);
          }
        }
      }
    }
  }
}

function drawString(
  buf: Buffer, str: string,
  cellX: number, cellY: number,
  color: RGB, imgW: number,
): void {
  for (let i = 0; i < str.length; i++) {
    drawGlyph(buf, str[i]!, cellX + i, cellY, color, imgW);
  }
}

/** Center a string of given length within total columns */
function centerX(strLen: number, totalCols: number): number {
  return Math.floor((totalCols - strLen) / 2);
}

// ── Frame renderer ──

export interface FrameOptions {
  companion: Companion;
  growth?: CompanionGrowth;
  spriteLines: string[];   // pre-rendered sprite lines (eye replaced)
  frameIdx: number;
  /** Override sprite lines (for special animations) */
  overlayLines?: (string | null)[];
  /** Extra floating effects: array of {char, cellX, cellY, color} */
  effects?: Array<{ ch: string; cx: number; cy: number; color: RGB }>;
  /** Show status bar */
  showStatus?: boolean;
}

/**
 * Render a single frame to a raw RGB buffer.
 */
export function renderFrameBuffer(opts: FrameOptions): Buffer {
  const { companion, growth, spriteLines, frameIdx, overlayLines, effects, showStatus } = opts;
  const colors = getColors(companion.rarity, companion.shiny, frameIdx);

  const totalCols = COLS + PAD * 2;
  const imgW = totalCols * CELL_W * PIXEL_SIZE;
  const totalRows = PAD + TITLE_ROWS + GAP_ROW + ROWS + GAP_ROW + STATUS_ROWS + FOOTER_ROWS + PAD;
  const imgH = totalRows * CELL_H * PIXEL_SIZE;

  const buf = Buffer.alloc(imgW * imgH * 3);

  // Fill background
  for (let i = 0; i < imgW * imgH; i++) {
    buf[i * 3] = colors.bg[0]!;
    buf[i * 3 + 1] = colors.bg[1]!;
    buf[i * 3 + 2] = colors.bg[2]!;
  }

  // ── Title (name) ──
  const titleRow = PAD;
  const name = companion.name.toUpperCase();
  const nameX = centerX(name.length, totalCols);
  drawString(buf, name, nameX, titleRow, colors.title, imgW);

  // ── Subtitle (rarity + species) ──
  const subtitleRow = PAD + 1;
  const subtitle = `${companion.rarity.toUpperCase()} ${companion.species.toUpperCase()}`;
  const subX = centerX(subtitle.length, totalCols);
  drawString(buf, subtitle, subX, subtitleRow, colors.subtitle, imgW);

  // ── Sprite ──
  const spriteStartRow = PAD + TITLE_ROWS + GAP_ROW;
  const lines = overlayLines ?? spriteLines;
  for (let row = 0; row < lines.length && row < ROWS; row++) {
    const line = lines[row];
    if (!line) continue;
    // Center sprite in grid
    const lineX = centerX(line.length, totalCols);
    for (let col = 0; col < line.length; col++) {
      const ch = line[col]!;
      if (ch !== ' ') {
        drawGlyph(buf, ch, lineX + col, spriteStartRow + row, colors.sprite, imgW);
      }
    }
  }

  // ── Effects overlay ──
  if (effects) {
    for (const eff of effects) {
      drawGlyph(buf, eff.ch, eff.cx, eff.cy, eff.color, imgW);
    }
  }

  // ── Status bar ──
  const statusRow = spriteStartRow + ROWS + GAP_ROW;
  if (showStatus && growth) {
    const lvStr = `Lv.${growth.level}`;
    const affStr = `AFF ${growth.affection}`;
    drawString(buf, lvStr, PAD, statusRow, colors.accent, imgW);
    drawString(buf, affStr, totalCols - PAD - affStr.length, statusRow, colors.accent, imgW);
  }

  // ── Footer ──
  const footerRow = statusRow + STATUS_ROWS;
  const footer = 'claw-buddy';
  const footerX = centerX(footer.length, totalCols);
  drawString(buf, footer, footerX, footerRow, colors.dim, imgW);

  return buf;
}

/**
 * Get the image dimensions for the current layout.
 */
export function getFrameDimensions(): { width: number; height: number } {
  const totalCols = COLS + PAD * 2;
  const totalRows = PAD + TITLE_ROWS + GAP_ROW + ROWS + GAP_ROW + STATUS_ROWS + FOOTER_ROWS + PAD;
  return {
    width: totalCols * CELL_W * PIXEL_SIZE,
    height: totalRows * CELL_H * PIXEL_SIZE,
  };
}
