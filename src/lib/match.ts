import { haversineMiles } from './geo';
import type { Post, ReputationEntry } from './types';

export interface MatchResult {
  post: Post;
  score: number;
  reasons: string[];
}

function overlap(a: string[], b: string[]) {
  const set = new Set(a.map((x) => x.toLowerCase()));
  return b.some((x) => set.has(x.toLowerCase())) ? 1 : 0;
}

function timeOverlap(a: Post, b: Post) {
  if (!a.startAt || !b.startAt) return 0.5;
  const as = new Date(a.startAt).getTime();
  const ae = new Date(a.endAt ?? a.startAt).getTime();
  const bs = new Date(b.startAt).getTime();
  const be = new Date(b.endAt ?? b.startAt).getTime();
  return as <= be && bs <= ae ? 1 : 0;
}

export function matchPosts(selected: Post, candidates: Post[], rep: ReputationEntry[]): MatchResult[] {
  return candidates
    .filter((c) => c.id !== selected.id && c.type !== selected.type)
    .map((post) => {
      const categoryMatch = post.category === selected.category ? 1 : 0;
      const tagBonus = overlap(selected.tags, post.tags) ? 0.25 : 0;
      const dist = haversineMiles(selected.lat, selected.lon, post.lat, post.lon);
      const distanceScore = Math.max(0, 1 - dist / 25);
      const timeScore = timeOverlap(selected, post);
      const repScore = Math.min(1, rep.filter((r) => r.to === post.author).length / 5);
      const score = 0.45 * Math.min(1, categoryMatch + tagBonus) + 0.25 * distanceScore + 0.2 * timeScore + 0.1 * repScore;
      const reasons = [
        categoryMatch ? 'Category aligned' : 'Related categories',
        dist < 5 ? 'Nearby' : 'Within area',
        timeScore > 0.5 ? 'Time overlap' : 'Flexible timing',
        repScore > 0 ? 'Trusted helper' : 'New neighbor'
      ];
      return { post, score, reasons };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}
