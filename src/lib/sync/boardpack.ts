import { appendAudit, db } from '../db';
import type { Message, Post, Thread } from '../types';

export interface BoardPack {
  schemaVersion: '1.0';
  createdAt: string;
  deviceId: string;
  boardCode: string;
  hash: string;
  posts: Post[];
  threads: Thread[];
  messages: Message[];
}

const hashOf = async (value: string) => {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
};

export async function exportBoardPack(excludePrivate = true): Promise<BoardPack> {
  const settings = await db.settings.get('local');
  if (!settings) throw new Error('settings missing');
  const posts = await db.posts.toArray();
  const packPosts = posts.map((p) => {
    if (!excludePrivate) return p;
    const { exactLat, exactLon, ...rest } = p;
    return rest;
  }) as Post[];
  const threads = await db.threads.toArray();
  const messages = await db.messages.toArray();
  const payload = JSON.stringify({ posts: packPosts, threads, messages, boardCode: settings.boardCode });
  const pack: BoardPack = {
    schemaVersion: '1.0',
    createdAt: new Date().toISOString(),
    deviceId: settings.deviceId,
    boardCode: settings.boardCode,
    hash: await hashOf(payload),
    posts: packPosts,
    threads,
    messages
  };
  await appendAudit('export-pack', { count: packPosts.length });
  return pack;
}

export async function importBoardPack(pack: BoardPack) {
  const existingIds = new Set((await db.posts.toArray()).map((p) => p.id));
  await db.transaction('rw', db.posts, db.threads, db.messages, async () => {
    for (const p of pack.posts) if (!existingIds.has(p.id)) await db.posts.add(p);
    for (const t of pack.threads) if (!(await db.threads.get(t.id))) await db.threads.add(t);
    for (const m of pack.messages) if (!(await db.messages.get(m.id))) await db.messages.add(m);
  });
  await appendAudit('import-pack', { boardCode: pack.boardCode, count: pack.posts.length });
}
