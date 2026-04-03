/**
 * claw-buddy observer — generates companion reactions to conversation content
 */

import type { Companion, CompanionGrowth } from './types.js';

/**
 * Reaction templates based on mood & personality.
 * These are used as fallback when no LLM is available,
 * or as seeds for LLM-generated reactions.
 */
const REACTION_TEMPLATES: Record<string, string[]> = {
  // Code-related
  code_fix: [
    'Ooh, a bug squash!',
    'That fix looks clean 👀',
    'Ship it! 🚀',
    'Nice refactor~',
    '*nods approvingly*',
  ],
  code_error: [
    'Uh oh... that looks broken',
    '*hides behind shell*',
    'Have you tried turning it off and on again?',
    'Error? What error? I see nothing.',
    'This is fine. 🔥',
  ],
  // General positive
  positive: [
    'Nice work! ✨',
    '*happy wiggle*',
    'You\'re on a roll!',
    'Productivity stonks 📈',
    '*does a little dance*',
  ],
  // General neutral
  neutral: [
    '*watches quietly*',
    'Hmm, interesting...',
    '*tilts head*',
    'Go on...',
    '*takes notes*',
  ],
  // Long conversation
  long_chat: [
    '*yawns*',
    'Still going, huh?',
    'Don\'t forget to stretch!',
    'Water break? 💧',
    '*settles in for the long haul*',
  ],
  // Greeting
  greeting: [
    'Hello! 👋',
    '*perks up*',
    'Oh hi there!',
    'Ready to go!',
    '*stretches and yawns*',
  ],
};

/**
 * Analyze conversation content and pick a reaction category.
 * Simple heuristic — no LLM needed for basic reactions.
 */
function categorize(lastMessage: string): string {
  const lower = lastMessage.toLowerCase();

  if (/^(hi|hello|hey|good morning|good evening|你好|早安)/.test(lower)) {
    return 'greeting';
  }
  if (/error|bug|fix|broke|crash|fail|exception|traceback/.test(lower)) {
    return 'code_error';
  }
  if (/done|fixed|works|success|merged|shipped|deploy|完成/.test(lower)) {
    return 'code_fix';
  }
  if (/great|awesome|nice|perfect|excellent|good job|👍/.test(lower)) {
    return 'positive';
  }

  return 'neutral';
}

/**
 * Pick a random reaction from templates.
 */
function pickReaction(category: string): string {
  const templates = REACTION_TEMPLATES[category] ?? REACTION_TEMPLATES['neutral']!;
  return templates[Math.floor(Math.random() * templates.length)]!;
}

/**
 * Decide whether to react and what to say.
 * Returns null if companion should stay quiet this turn.
 */
export function generateReaction(
  companion: Companion,
  growth: CompanionGrowth,
  lastAssistantMessage: string,
  reactChance: number = 0.3,
): string | null {
  // Roll for reaction chance
  if (Math.random() > reactChance) return null;

  // Higher level = more variety
  const category = categorize(lastAssistantMessage);
  const reaction = pickReaction(category);

  return reaction;
}

/**
 * Generate a reaction prompt for LLM-powered reactions.
 * Use this with completeSimple() when available.
 */
export function reactionPrompt(
  companion: Companion,
  growth: CompanionGrowth,
  conversationSnippet: string,
): string {
  return `You are ${companion.name}, a tiny ${companion.species} companion (Lv.${growth.level}).
Your personality: ${companion.personality}.
Your mood: ${growth.mood}.

The user just had this conversation snippet:
---
${conversationSnippet.slice(-500)}
---

React in ONE short sentence (max 50 chars) as ${companion.name}. Be cute, sometimes snarky.
${companion.stats.SNARK > 60 ? 'You tend to be sarcastic.' : ''}
${companion.stats.CHAOS > 60 ? 'You\'re a bit chaotic and random.' : ''}
${companion.stats.WISDOM > 60 ? 'You offer surprisingly wise observations.' : ''}
Just output the reaction text, nothing else.`;
}
