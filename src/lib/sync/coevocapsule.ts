import { db } from '../db';
import { redactPII } from '../privacy/redact';

export async function createCoEvoCapsule() {
  const posts = await db.posts.toArray();
  return {
    schemaVersion: '1.0',
    createdAt: new Date().toISOString(),
    posts: posts.map((p) => ({
      id: p.id,
      type: p.type,
      title: p.title,
      description: redactPII(p.description),
      category: p.category,
      tags: p.tags,
      lat: p.lat,
      lon: p.lon,
      radiusMiles: p.radiusMiles
    }))
  };
}
