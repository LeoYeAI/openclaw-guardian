/**
 * claw-buddy — Virtual Pet Companion Plugin for OpenClaw
 *
 * Ported from Claude Code's buddy module, adapted for Telegram chat.
 * Features: deterministic pet generation, growth system, GIF animations.
 */

import { Type } from '@sinclair/typebox';
import {
  assembleCompanion,
  generateDefaultName,
  generateDefaultPersonality,
  roll,
} from './src/companion.js';
import { generateReaction } from './src/observer.js';
import {
  renderFeedReaction,
  renderHatchMessage,
  renderLevelUp,
  renderMuteToggle,
  renderNameChange,
  renderPetReaction,
  renderReaction,
  renderStatusCard,
} from './src/render.js';
import { BuddyStore } from './src/store.js';
import type { Companion, CompanionGrowth } from './src/types.js';
import { DEFAULT_GROWTH } from './src/types.js';

// ─── GIF Engine (lazy loaded) ───

let gifEngine: typeof import('./src/gif-scenes.js') | null = null;

async function getGifEngine() {
  if (!gifEngine) {
    try {
      gifEngine = await import('./src/gif-scenes.js');
    } catch (e) {
      gifEngine = null;
    }
  }
  return gifEngine;
}

// ─── Config ───

type BuddyConfig = {
  enabled: boolean;
  reactChance: number;
  silentReactions: boolean;
  dbPath?: string;
};

function resolveConfig(raw: unknown): BuddyConfig {
  const obj =
    raw && typeof raw === 'object' && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};
  return {
    enabled: typeof obj.enabled === 'boolean' ? obj.enabled : true,
    reactChance:
      typeof obj.reactChance === 'number' ? obj.reactChance : 0.3,
    silentReactions:
      typeof obj.silentReactions === 'boolean' ? obj.silentReactions : true,
    dbPath: typeof obj.dbPath === 'string' ? obj.dbPath : undefined,
  };
}

// ─── Tool Schema (TypeBox) ───

const BuddyToolSchema = Type.Object({
  action: Type.Optional(
    Type.String({
      description:
        'Buddy action: status, pet, feed, name <newname>, mute, help. Defaults to status if omitted.',
    }),
  ),
});

// ─── Helpers ───

function getOrHatchCompanion(
  store: BuddyStore,
  userId: string,
): { companion: Companion; isNew: boolean } {
  const stored = store.getCompanion(userId);
  if (stored) {
    return { companion: assembleCompanion(userId, stored), isNew: false };
  }

  const { bones } = roll(userId);
  const name = generateDefaultName(userId);
  const personality = generateDefaultPersonality(bones);
  const now = Date.now();

  const newStored = { name, personality, hatchedAt: now };
  store.saveCompanion(userId, newStored);

  return {
    companion: assembleCompanion(userId, newStored),
    isNew: true,
  };
}

// ─── GIF generation helpers ───

async function generateGifForScene(
  scene: 'idle' | 'pet' | 'feed' | 'levelup' | 'hatch',
  companion: Companion,
  growth: CompanionGrowth,
  extra?: { newLevel?: number },
): Promise<string | null> {
  const engine = await getGifEngine();
  if (!engine) return null;

  const ts = Date.now();
  const outputPath = `/tmp/buddy-${scene}-${ts}.gif`;

  try {
    switch (scene) {
      case 'idle':
        await engine.renderIdleGif(companion, growth, outputPath);
        break;
      case 'pet':
        await engine.renderPetGif(companion, growth, outputPath);
        break;
      case 'feed':
        await engine.renderFeedGif(companion, growth, outputPath);
        break;
      case 'levelup':
        await engine.renderLevelUpGif(companion, growth, extra?.newLevel ?? growth.level, outputPath);
        break;
      case 'hatch':
        await engine.renderHatchGif(companion, outputPath);
        break;
    }
    return outputPath;
  } catch (e) {
    return null;
  }
}

// ─── Command result type ───

interface BuddyResult {
  text: string;
  gifPath?: string | null;
  gifCaption?: string;
}

// ─── Command handlers ───

async function handleBuddyCommand(
  args: string,
  userId: string,
  store: BuddyStore,
): Promise<BuddyResult> {
  const parts = args.trim().split(/\s+/);
  const subcommand = parts[0]?.toLowerCase() ?? '';

  switch (subcommand) {
    case '':
    case 'status': {
      const { companion, isNew } = getOrHatchCompanion(store, userId);
      if (isNew) {
        const gifPath = await generateGifForScene('hatch', companion, DEFAULT_GROWTH);
        return {
          text: renderHatchMessage(companion),
          gifPath,
          gifCaption: `🥚→🐣 ${companion.name} hatched!`,
        };
      }
      const growth = store.getGrowth(userId);
      const gifPath = await generateGifForScene('idle', companion, growth);
      return {
        text: renderStatusCard(companion, growth),
        gifPath,
        gifCaption: `${companion.name} — Lv.${growth.level}`,
      };
    }

    case 'pet': {
      const { companion, isNew } = getOrHatchCompanion(store, userId);
      if (isNew) {
        const gifPath = await generateGifForScene('hatch', companion, DEFAULT_GROWTH);
        return { text: renderHatchMessage(companion), gifPath };
      }

      store.incrementStat(userId, 'total_pets');
      store.addAffection(userId, 5);
      const { leveledUp, newLevel } = store.addXp(userId, 2);
      store.logInteraction(userId, 'pet');

      let msg = renderPetReaction(companion);
      let scene: 'pet' | 'levelup' = 'pet';
      let extra: { newLevel?: number } | undefined;

      if (leveledUp) {
        msg += '\n' + renderLevelUp(companion, newLevel);
        scene = 'levelup';
        extra = { newLevel };
      }

      const growth = store.getGrowth(userId);
      const gifPath = await generateGifForScene(scene, companion, growth, extra);
      return {
        text: msg,
        gifPath,
        gifCaption: leveledUp ? `⭐ Level Up! Lv.${newLevel}` : `❤️ ${companion.name}`,
      };
    }

    case 'feed': {
      const { companion, isNew } = getOrHatchCompanion(store, userId);
      if (isNew) {
        const gifPath = await generateGifForScene('hatch', companion, DEFAULT_GROWTH);
        return { text: renderHatchMessage(companion), gifPath };
      }

      store.incrementStat(userId, 'total_feeds');
      store.addAffection(userId, 3);
      const { leveledUp, newLevel } = store.addXp(userId, 3);
      store.setMood(userId, 'happy');
      store.logInteraction(userId, 'feed');

      let msg = renderFeedReaction(companion);
      let scene: 'feed' | 'levelup' = 'feed';
      let extra: { newLevel?: number } | undefined;

      if (leveledUp) {
        msg += '\n' + renderLevelUp(companion, newLevel);
        scene = 'levelup';
        extra = { newLevel };
      }

      const growth = store.getGrowth(userId);
      const gifPath = await generateGifForScene(scene, companion, growth, extra);
      return {
        text: msg,
        gifPath,
        gifCaption: leveledUp ? `⭐ Level Up! Lv.${newLevel}` : `🍖 ${companion.name}`,
      };
    }

    case 'gif': {
      const { companion, isNew } = getOrHatchCompanion(store, userId);
      if (isNew) {
        const gifPath = await generateGifForScene('hatch', companion, DEFAULT_GROWTH);
        return { text: renderHatchMessage(companion), gifPath };
      }
      const growth = store.getGrowth(userId);
      const gifPath = await generateGifForScene('idle', companion, growth);
      return {
        text: `🎬 ${companion.name}`,
        gifPath,
        gifCaption: `${companion.name} — Lv.${growth.level} ${companion.species}`,
      };
    }

    case 'name': {
      const newName = parts.slice(1).join(' ').trim();
      if (!newName) return { text: '❌ Usage: /buddy name <new name>' };
      if (newName.length > 20) return { text: '❌ Name too long (max 20 chars)' };

      const { companion, isNew } = getOrHatchCompanion(store, userId);
      if (isNew) return { text: renderHatchMessage(companion) };

      const oldName = companion.name;
      store.setName(userId, newName);
      store.logInteraction(userId, 'rename', JSON.stringify({ from: oldName, to: newName }));

      return {
        text: renderNameChange({ ...companion, name: newName }, oldName, newName),
      };
    }

    case 'mute': {
      const { companion, isNew } = getOrHatchCompanion(store, userId);
      if (isNew) return { text: renderHatchMessage(companion) };

      const currentMuted = store.isMuted(userId);
      store.setMuted(userId, !currentMuted);

      return { text: renderMuteToggle(companion, !currentMuted) };
    }

    case 'help': {
      return {
        text: [
          '🐣 **Buddy Commands**',
          '',
          '`/buddy` — View companion + idle GIF',
          '`/buddy pet` — Pet companion (❤️ GIF)',
          '`/buddy feed` — Feed companion (🍖 GIF)',
          '`/buddy gif` — Generate idle animation',
          '`/buddy name <name>` — Rename companion',
          '`/buddy mute` — Toggle reaction messages',
          '`/buddy help` — Show this help',
          '',
          '🎬 Pet/feed/status commands include animated GIF!',
        ].join('\n'),
      };
    }

    default:
      return { text: `❓ Unknown command: ${subcommand}\nTry \`/buddy help\`` };
  }
}

// ─── Plugin export ───

const buddyPlugin = {
  id: 'claw-buddy',
  name: 'Claw Buddy',
  description:
    'Virtual pet companion that lives in your chat — reacts to conversations, grows with interaction, animated GIF sprites',

  register(api: any) {
    const config = resolveConfig(api.config?.get?.('claw-buddy'));
    if (!config.enabled) {
      api.logger.info('[claw-buddy] Plugin disabled by config');
      return;
    }

    const store = new BuddyStore(config.dbPath);
    api.logger.info(
      `[claw-buddy] Plugin loaded (reactChance=${config.reactChance})`,
    );

    // Register /buddy tool
    api.registerTool((ctx: any) => ({
      name: 'buddy',
      label: 'Buddy',
      description:
        'Virtual pet companion — use action "status" to view, "pet" to interact, "feed" to feed, "name <newname>" to rename, "mute" to toggle, "help" for commands',
      parameters: BuddyToolSchema,
      async execute(
        _toolCallId: string,
        params: { action?: string },
      ) {
        const userId = ctx.userId ?? ctx.sessionKey ?? 'default';
        const result = await handleBuddyCommand(
          params.action ?? '',
          userId,
          store,
        );

        // Build content array — text + optional GIF attachment
        const content: any[] = [{ type: 'text' as const, text: result.text }];

        if (result.gifPath) {
          content.push({
            type: 'file' as const,
            filePath: result.gifPath,
            caption: result.gifCaption,
            mimeType: 'image/gif',
          });
        }

        return {
          content,
          details: {
            action: params.action ?? 'status',
            userId,
            gifGenerated: !!result.gifPath,
          },
        };
      },
    }));

    // After-turn hook: companion reacts to conversation
    if (typeof api.registerHook === 'function') {
      api.registerHook('afterTurn', {
        name: 'claw-buddy-reaction',
        async handler(ctx: any) {
          if (Math.random() > config.reactChance) return;

          const userId = ctx.userId ?? ctx.sessionKey ?? 'default';
          const stored = store.getCompanion(userId);
          if (!stored || store.isMuted(userId)) return;

          const companion = assembleCompanion(userId, stored);
          const growth = store.getGrowth(userId);

          const lastMsg =
            ctx.messages?.[ctx.messages.length - 1]?.content ?? '';
          const lastText =
            typeof lastMsg === 'string'
              ? lastMsg
              : Array.isArray(lastMsg)
                ? lastMsg
                    .filter((b: any) => b.type === 'text')
                    .map((b: any) => b.text)
                    .join(' ')
                : '';

          if (!lastText || lastText.length < 10) return;

          const reaction = generateReaction(
            companion,
            growth,
            lastText,
            1.0,
          );

          if (reaction) {
            store.incrementStat(userId, 'total_chats');
            store.addXp(userId, 1);

            const rendered = renderReaction(companion, reaction);

            if (typeof ctx.sendMessage === 'function') {
              ctx.sendMessage({
                text: rendered,
                silent: config.silentReactions,
                parseMode: 'Markdown',
              });
            }
          }
        },
      });
    }

    // Cleanup
    if (typeof api.registerCleanup === 'function') {
      api.registerCleanup(() => {
        store.close();
        api.logger.info('[claw-buddy] Plugin unloaded, DB closed');
      });
    }
  },
};

export default buddyPlugin;
