import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Post } from '../lib/types';

export function AidoraMap({ posts, center, online }: { posts: Post[]; center: [number, number]; online: boolean }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!online || !mapRef.current) return;

    if (!leafletRef.current) {
      leafletRef.current = L.map(mapRef.current).setView(center, 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(leafletRef.current);
    } else {
      leafletRef.current.setView(center, 12);
    }

    const markers = posts.map((p) => L.marker([p.lat, p.lon]).bindPopup(p.title).addTo(leafletRef.current!));
    return () => {
      markers.forEach((m) => m.remove());
    };
  }, [center, online, posts]);

  useEffect(() => {
    return () => {
      leafletRef.current?.remove();
      leafletRef.current = null;
    };
  }, []);

  if (!online) {
    return <div className="card"><p className="font-semibold">Offline map tiles unavailable</p><div className="h-64 bg-[linear-gradient(#e2e8f0_1px,transparent_1px),linear-gradient(90deg,#e2e8f0_1px,transparent_1px)] bg-[size:20px_20px]" data-testid="offline-grid" /><ul>{posts.map((p)=><li key={p.id}>{p.title}</li>)}</ul></div>;
  }

  return <div aria-label="Aidora map" data-testid="leaflet-map" ref={mapRef} className="h-96 w-full rounded border border-slate-200" />;
}
