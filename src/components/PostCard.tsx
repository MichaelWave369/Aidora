import { Link } from 'react-router-dom';
import type { Post } from '../lib/types';

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="card" data-testid={`post-${post.id}`}>
      <div className="flex justify-between"><h3 className="font-semibold">{post.title}</h3><span className="text-xs uppercase">{post.type}</span></div>
      <p className="text-sm my-1">{post.description}</p>
      <p className="text-xs">{post.category} · {post.radiusMiles}mi</p>
      <Link aria-label="Open post" className="text-teal-700 text-sm" to={`/post/${post.id}`}>Open</Link>
    </article>
  );
}
