/**
 * buddy-claw SQLite persistence — companion state, growth, interactions
 */

import Database from 'better-sqlite3';
import { join } from 'node:path';
import type { CompanionGrowth, StoredCompanion } from './types.js';
import { DEFAULT_GROWTH, xpForLevel } from './types.js';

export class BuddyStore {
  private db: Database.Database;

  constructor(dbPath?: string) {
    const path = dbPath ?? join(
      process.env.HOME ?? '/tmp',
      '.openclaw',
      'buddy.db',
    );
    this.db = new Database(path);
    this.db.pragma('journal_mode = WAL');
    this.migrate();
  }

  private migrate(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS companions (
        user_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        personality TEXT NOT NULL DEFAULT '',
        hatched_at INTEGER NOT NULL,
        muted INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS growth (
        user_id TEXT PRIMARY KEY,
        xp INTEGER NOT NULL DEFAULT 0,
        level INTEGER NOT NULL DEFAULT 1,
        affection INTEGER NOT NULL DEFAULT 0,
        mood TEXT NOT NULL DEFAULT 'neutral',
        last_interaction INTEGER NOT NULL DEFAULT 0,
        total_chats INTEGER NOT NULL DEFAULT 0,
        total_pets INTEGER NOT NULL DEFAULT 0,
        total_feeds INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS interactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        detail TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_interactions_user
        ON interactions(user_id, timestamp DESC);
    `);
  }

  // ─── Companion CRUD ───

  getCompanion(userId: string): StoredCompanion | undefined {
    const row = this.db.prepare(
      'SELECT name, personality, hatched_at FROM companions WHERE user_id = ?',
    ).get(userId) as { name: string; personality: string; hatched_at: number } | undefined;
    if (!row) return undefined;
    return {
      name: row.name,
      personality: row.personality,
      hatchedAt: row.hatched_at,
    };
  }

  saveCompanion(userId: string, companion: StoredCompanion): void {
    this.db.prepare(`
      INSERT INTO companions (user_id, name, personality, hatched_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        name = excluded.name,
        personality = excluded.personality
    `).run(userId, companion.name, companion.personality, companion.hatchedAt);
  }

  isMuted(userId: string): boolean {
    const row = this.db.prepare(
      'SELECT muted FROM companions WHERE user_id = ?',
    ).get(userId) as { muted: number } | undefined;
    return row?.muted === 1;
  }

  setMuted(userId: string, muted: boolean): void {
    this.db.prepare(
      'UPDATE companions SET muted = ? WHERE user_id = ?',
    ).run(muted ? 1 : 0, userId);
  }

  setName(userId: string, name: string): void {
    this.db.prepare(
      'UPDATE companions SET name = ? WHERE user_id = ?',
    ).run(name, userId);
  }

  // ─── Growth ───

  getGrowth(userId: string): CompanionGrowth {
    const row = this.db.prepare(
      'SELECT * FROM growth WHERE user_id = ?',
    ).get(userId) as any;
    if (!row) return { ...DEFAULT_GROWTH };
    return {
      xp: row.xp,
      level: row.level,
      affection: row.affection,
      mood: row.mood,
      lastInteraction: row.last_interaction,
      totalChats: row.total_chats,
      totalPets: row.total_pets,
      totalFeeds: row.total_feeds,
    };
  }

  private ensureGrowth(userId: string): void {
    this.db.prepare(`
      INSERT OR IGNORE INTO growth (user_id) VALUES (?)
    `).run(userId);
  }

  addXp(userId: string, amount: number): { leveledUp: boolean; newLevel: number } {
    this.ensureGrowth(userId);
    const growth = this.getGrowth(userId);
    let xp = growth.xp + amount;
    let level = growth.level;
    let leveledUp = false;

    // Check for level up
    while (xp >= xpForLevel(level)) {
      xp -= xpForLevel(level);
      level++;
      leveledUp = true;
    }

    this.db.prepare(`
      UPDATE growth SET xp = ?, level = ?, last_interaction = ? WHERE user_id = ?
    `).run(xp, level, Date.now(), userId);

    return { leveledUp, newLevel: level };
  }

  addAffection(userId: string, amount: number): void {
    this.ensureGrowth(userId);
    this.db.prepare(`
      UPDATE growth SET
        affection = MIN(affection + ?, 1000),
        last_interaction = ?
      WHERE user_id = ?
    `).run(amount, Date.now(), userId);
  }

  setMood(userId: string, mood: CompanionGrowth['mood']): void {
    this.ensureGrowth(userId);
    this.db.prepare(
      'UPDATE growth SET mood = ? WHERE user_id = ?',
    ).run(mood, userId);
  }

  incrementStat(userId: string, stat: 'total_chats' | 'total_pets' | 'total_feeds'): void {
    this.ensureGrowth(userId);
    this.db.prepare(
      `UPDATE growth SET ${stat} = ${stat} + 1, last_interaction = ? WHERE user_id = ?`,
    ).run(Date.now(), userId);
  }

  // ─── Interactions Log ───

  logInteraction(userId: string, type: string, detail?: string): void {
    this.db.prepare(`
      INSERT INTO interactions (user_id, type, timestamp, detail)
      VALUES (?, ?, ?, ?)
    `).run(userId, type, Date.now(), detail ?? null);
  }

  getRecentInteractions(userId: string, limit = 10): Array<{
    type: string;
    timestamp: number;
    detail?: string;
  }> {
    return this.db.prepare(`
      SELECT type, timestamp, detail FROM interactions
      WHERE user_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(userId, limit) as any[];
  }

  close(): void {
    this.db.close();
  }
}
