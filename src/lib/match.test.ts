import { describe, expect, it } from 'vitest';
import { matchPosts } from './match';
import type { Post } from './types';

const mk = (id: string, type: Post['type'], category: string, lat: number): Post => ({ id, type, category, lat, lon: -122.4, title:id, description:'', tags:['tag1'], shareExact:false, radiusMiles:5, contactMethod:'in-app', author:id, anonymous:true, createdAt:'', updatedAt:'' });

describe('matching', () => {
  it('scores and orders', () => {
    const selected = mk('1', 'request', 'food', 37.77);
    const res = matchPosts(selected, [mk('2','offer','food',37.78), mk('3','offer','ride',37.9)], []);
    expect(res[0].post.id).toBe('2');
    expect(res[0].score).toBeGreaterThan(res[1].score);
  });
});
