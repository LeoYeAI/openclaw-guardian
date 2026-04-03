/**
 * claw-buddy Telegram rendering — converts companion data to chat-friendly output
 */

import { assembleCompanion, roll } from './companion.js';
import { renderFace, renderSprite } from './sprites.js';
import type { Companion, CompanionBones, CompanionGrowth, Rarity } from './types.js';
import { RARITY_EMOJI, RARITY_STARS, xpForLevel } from './types.js';

/** Render a stat bar: █████░░░░░ 72 */
function statBar(value: number, width = 10): string {
  const filled = Math.round((value / 100) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled) + ` ${value}`;
}

/** Mood to emoji */
function moodEmoji(mood: string): string {
  switch (mood) {
    case 'happy': return '😊';
    case 'excited': return '🤩';
    case 'sleepy': return '😴';
    default: return '😐';
  }
}

/** XP progress bar */
function xpBar(xp: number, level: number, width = 15): string {
  const needed = xpForLevel(level);
  const filled = Math.round((xp / needed) * width);
  return '▓'.repeat(filled) + '░'.repeat(width - filled) + ` ${xp}/${needed}`;
}

/**
 * Full status card for /buddy command
 */
export function renderStatusCard(
  companion: Companion,
  growth: CompanionGrowth,
): string {
  const sprite = renderSprite(companion, 0);
  const face = renderFace(companion);
  const rarityTag = `${RARITY_EMOJI[companion.rarity]} ${companion.rarity.toUpperCase()} ${RARITY_STARS[companion.rarity]}`;
  const shinyTag = companion.shiny ? ' ✨ SHINY!' : '';

  const lines: string[] = [];
  lines.push(`🐣 ${companion.name}  (${companion.species})${shinyTag}`);
  lines.push(`${rarityTag}`);
  lines.push('');

  // ASCII art in code block
  lines.push('```');
  for (const line of sprite) {
    lines.push(line);
  }
  lines.push('```');
  lines.push('');

  // Level & XP
  lines.push(`⭐ Lv.${growth.level}  ${moodEmoji(growth.mood)} ${growth.mood}`);
  lines.push(`XP: ${xpBar(growth.xp, growth.level)}`);
  lines.push(`❤️ Affection: ${growth.affection}`);
  lines.push('');

  // Stats
  lines.push('📊 Stats:');
  lines.push('```');
  for (const [name, value] of Object.entries(companion.stats)) {
    const padded = name.padEnd(10);
    lines.push(`${padded} ${statBar(value)}`);
  }
  lines.push('```');
  lines.push('');

  // Interaction counts
  lines.push(`💬 Chats: ${growth.totalChats}  🤝 Pets: ${growth.totalPets}  🍖 Feeds: ${growth.totalFeeds}`);

  // Personality
  if (companion.personality) {
    lines.push('');
    lines.push(`💭 "${companion.personality}"`);
  }

  return lines.join('\n');
}

/**
 * Hatch announcement
 */
export function renderHatchMessage(companion: Companion): string {
  const sprite = renderSprite(companion, 0);
  const rarityTag = `${RARITY_EMOJI[companion.rarity]} ${companion.rarity.toUpperCase()} ${RARITY_STARS[companion.rarity]}`;
  const shinyTag = companion.shiny ? '\n\n✨✨✨ SHINY! ✨✨✨' : '';

  const lines: string[] = [];
  lines.push('🥚 → 🐣 A companion hatches!');
  lines.push('');
  lines.push('```');
  for (const line of sprite) {
    lines.push(line);
  }
  lines.push('```');
  lines.push('');
  lines.push(`Meet **${companion.name}**!`);
  lines.push(`${rarityTag}${shinyTag}`);
  lines.push('');
  lines.push(`💭 "${companion.personality}"`);
  lines.push('');
  lines.push('Commands: /buddy, /buddy pet, /buddy feed, /buddy name <name>');

  return lines.join('\n');
}

/**
 * Pet reaction (hearts)
 */
export function renderPetReaction(companion: Companion): string {
  const face = renderFace(companion);
  const hearts = ['❤️', '💕', '💖', '💗', '💝'];
  const heart = hearts[Math.floor(Math.random() * hearts.length)];
  return `${heart} ${face} ${companion.name} purrs happily! ${heart}`;
}

/**
 * Feed reaction
 */
export function renderFeedReaction(companion: Companion): string {
  const face = renderFace(companion);
  const foods = ['🍖', '🐟', '🍪', '🧀', '🍎', '🌮'];
  const food = foods[Math.floor(Math.random() * foods.length)];
  return `${food} → ${face} ${companion.name} munches happily! 😋`;
}

/**
 * Level up announcement
 */
export function renderLevelUp(companion: Companion, newLevel: number): string {
  return `⭐ **LEVEL UP!** ${renderFace(companion)} ${companion.name} is now Lv.${newLevel}! 🎉`;
}

/**
 * Companion reaction to conversation
 */
export function renderReaction(companion: Companion, reaction: string): string {
  const face = renderFace(companion);
  return `${face} 💬 _"${reaction}"_`;
}

/**
 * Mute/unmute confirmation
 */
export function renderMuteToggle(companion: Companion, muted: boolean): string {
  const face = renderFace(companion);
  if (muted) {
    return `🔇 ${face} ${companion.name} will be quiet now.`;
  }
  return `🔊 ${face} ${companion.name} is back! "Did you miss me?"`;
}

/**
 * Name change
 */
export function renderNameChange(
  companion: Companion,
  oldName: string,
  newName: string,
): string {
  const face = renderFace(companion);
  return `${face} ${oldName} → **${newName}**! "I like it!"`;
}
