import type { Message, Thread } from '../lib/types';
import { SafetyBanner } from './SafetyBanner';

export function ThreadView({ thread, messages }: { thread: Thread; messages: Message[] }) {
  return <div className="space-y-3"><SafetyBanner /><div className="card"><p data-testid="thread-status">Status: {thread.status}</p><ul>{messages.map((m)=><li key={m.id}><strong>{m.author}:</strong> {m.text}</li>)}</ul></div></div>;
}
