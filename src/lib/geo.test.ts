import { describe, expect, it } from 'vitest';
import { fuzzLocation, haversineMiles } from './geo';

describe('geo', () => {
  it('haversine returns expected', () => {
    const miles = haversineMiles(37.7749, -122.4194, 37.8044, -122.2712);
    expect(miles).toBeGreaterThan(7);
    expect(miles).toBeLessThan(10);
  });

  it('fuzzing deterministic', () => {
    expect(fuzzLocation(37.77494, -122.41948, 2)).toEqual({ lat: 37.77, lon: -122.42 });
  });
});
