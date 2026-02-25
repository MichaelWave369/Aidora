const EARTH_RADIUS_MILES = 3958.8;
const toRad = (d: number) => (d * Math.PI) / 180;

export function haversineMiles(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const aa = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_MILES * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
}

export function fuzzLocation(lat: number, lon: number, precision = 2) {
  const m = 10 ** precision;
  return { lat: Math.round(lat * m) / m, lon: Math.round(lon * m) / m };
}

export function withinRadius(myLat: number, myLon: number, targetLat: number, targetLon: number, miles: number) {
  return haversineMiles(myLat, myLon, targetLat, targetLon) <= miles;
}
