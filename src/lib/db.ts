import Dexie, { type Table } from 'dexie';
import type { AuditLog, Message, Post, ReputationEntry, Settings, Thread } from './types';

class AidoraDB extends Dexie {
  posts!: Table<Post, string>;
  threads!: Table<Thread, string>;
  messages!: Table<Message, string>;
  reputation!: Table<ReputationEntry, string>;
  auditLogs!: Table<AuditLog, string>;
  settings!: Table<Settings, string>;

  constructor() {
    super('aidora-db');
    this.version(1).stores({
      posts: 'id, type, category, createdAt, author',
      threads: 'id, postId, status, createdAt',
      messages: 'id, threadId, createdAt',
      reputation: 'id, to, source, createdAt',
      auditLogs: 'id, action, createdAt',
      settings: 'id'
    });
  }
}

export const db = new AidoraDB();

export const uid = () => crypto.randomUUID();

export async function ensureSettings() {
  const existing = await db.settings.get('local');
  if (!existing) {
    await db.settings.put({
      id: 'local',
      myLat: 37.7749,
      myLon: -122.4194,
      myRadiusMiles: 5,
      boardCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
      deviceId: uid(),
      blockedAuthors: []
    });
  }
}

export async function appendAudit(action: string, payload: Record<string, unknown>) {
  await db.auditLogs.add({ id: uid(), action, payload, createdAt: new Date().toISOString() });
}
