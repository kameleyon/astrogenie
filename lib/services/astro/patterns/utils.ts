import { BirthChartData, PatternData, PlanetPosition, PatternPlanetData } from '../../../types/birth-chart';

interface SpecialFeature {
  description: string;
  category: 'moon' | 'planets' | 'chart' | 'aspects';
}

/**
 * Calculate the angular distance between two points on the ecliptic
 */
export function getDistance(pos1: number, pos2: number): number {
  const diff = Math.abs(pos1 - pos2);
  return Math.min(diff, 360 - diff);
}

/**
 * Check if two points are in aspect with a specific orb
 */
export function isAspect(long1: number, long2: number, aspectAngle: number, orb: number): boolean {
  const diff = getDistance(long1, long2);
  return Math.abs(diff - aspectAngle) <= orb;
}

/**
 * Check if two planets are in conjunction
 */
export function isConjunction(planet1: PlanetPosition, planet2: PlanetPosition, orb: number = 10): boolean {
  return getDistance(planet1.longitude, planet2.longitude) <= orb;
}

/**
 * Check if two planets are in opposition
 */
export function isOpposition(planet1: PlanetPosition, planet2: PlanetPosition, orb: number = 8): boolean {
  return isAspect(planet1.longitude, planet2.longitude, 180, orb);
}

/**
 * Check if two planets are in square aspect
 */
export function isSquare(planet1: PlanetPosition, planet2: PlanetPosition, orb: number = 8): boolean {
  return isAspect(planet1.longitude, planet2.longitude, 90, orb);
}

/**
 * Check if two planets are in trine aspect
 */
export function isTrine(planet1: PlanetPosition, planet2: PlanetPosition, orb: number = 8): boolean {
  return isAspect(planet1.longitude, planet2.longitude, 120, orb);
}

/**
 * Check if two planets are in sextile aspect
 */
export function isSextile(planet1: PlanetPosition, planet2: PlanetPosition, orb: number = 6): boolean {
  return isAspect(planet1.longitude, planet2.longitude, 60, orb);
}

/**
 * Check if two planets are in quincunx aspect
 */
export function isQuincunx(planet1: PlanetPosition, planet2: PlanetPosition, orb: number = 3): boolean {
  return isAspect(planet1.longitude, planet2.longitude, 150, orb);
}

/**
 * Check if two planets are in sesquiquadrate aspect (135 degrees)
 */
export function isSesquiquadrate(planet1: PlanetPosition, planet2: PlanetPosition, orb: number = 3): boolean {
  return isAspect(planet1.longitude, planet2.longitude, 135, orb);
}

/**
 * Check if two planets are in quintile aspect (72 degrees)
 */
export function isQuintile(planet1: PlanetPosition, planet2: PlanetPosition, orb: number = 2): boolean {
  return isAspect(planet1.longitude, planet2.longitude, 72, orb);
}

/**
 * Convert planet position to pattern planet data
 */
export function toPlanetData(planet: PlanetPosition & { name: string }): PatternPlanetData {
  return {
    name: planet.name,
    sign: planet.sign,
    degree: planet.formatted,
    longitude: planet.longitude
  }
}

/**
 * Helper function to check if a pattern is unique
 */
export function isUniquePattern(newPattern: PatternData, existingPatterns: PatternData[]): boolean {
  return !existingPatterns.some(existing => {
    if (existing.name === newPattern.name) {
      const commonPlanets = existing.planets.filter((p: PatternPlanetData) => 
        newPattern.planets.some((np: PatternPlanetData) => np.name === p.name)
      )
      return commonPlanets.length >= Math.min(existing.planets.length, newPattern.planets.length) - 1
    }
    return false
  })
}
