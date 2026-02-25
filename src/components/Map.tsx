import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import type { Post } from '../lib/types';

export function AidoraMap({ posts, center, online }: { posts: Post[]; center: [number, number]; online: boolean }) {
  if (!online) {
    return <div className="card"><p className="font-semibold">Offline map tiles unavailable</p><div className="h-64 bg-[linear-gradient(#e2e8f0_1px,transparent_1px),linear-gradient(90deg,#e2e8f0_1px,transparent_1px)] bg-[size:20px_20px]" data-testid="offline-grid" /><ul>{posts.map((p)=><li key={p.id}>{p.title}</li>)}</ul></div>;
  }
  return (
    <MapContainer center={center} zoom={12} className="h-96 w-full" aria-label="Aidora map">
      <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {posts.map((p) => <Marker key={p.id} position={[p.lat, p.lon]}><Popup>{p.title}</Popup></Marker>)}
    </MapContainer>
  );
}
