# Aidora

**Help your neighbors. No app store, no data harvesting, no middleman.**

Aidora is an offline-first, local-first mutual aid board built with React + TypeScript + Dexie.

## Features
- Request/Offer posts with privacy-preserving fuzzy location
- Feed + Map views with local radius filtering
- Match scoring (category, distance, time, trust)
- Case-style private threads with safety banner
- Local trust + optional CoEvo receipt import compatibility
- Append-only audit logs
- User-controlled sync via Board Pack import/export
- Optional CoEvo capsule generation and manual publish
- PWA installability and offline fallback route

## Run
```bash
pnpm install
pnpm dev
```

## Privacy Promise
- No telemetry or analytics.
- No mandatory backend.
- Data stays in IndexedDB unless user exports manually.

## CoEvo Capsule
Generate a stripped JSON capsule from `/sync`; optional POST is gated by `VITE_COEVO_ENDPOINT`.
