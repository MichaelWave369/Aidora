export type PostType = 'request' | 'offer';
export type ThreadStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

export interface Post {
  id: string;
  type: PostType;
  title: string;
  description: string;
  category: string;
  tags: string[];
  startAt?: string;
  endAt?: string;
  lat: number;
  lon: number;
  exactLat?: number;
  exactLon?: number;
  shareExact: boolean;
  radiusMiles: number;
  contactMethod: 'in-app' | 'phone' | 'email';
  author: string;
  anonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Thread {
  id: string;
  postId: string;
  participants: string[];
  status: ThreadStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface ReputationEntry {
  id: string;
  from: string;
  to: string;
  tags: string[];
  thanks: number;
  createdAt: string;
  source: 'local' | 'coevo';
}

export interface AuditLog {
  id: string;
  action: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface Settings {
  id: string;
  myLat: number;
  myLon: number;
  myRadiusMiles: number;
  boardCode: string;
  deviceId: string;
  blockedAuthors: string[];
}
