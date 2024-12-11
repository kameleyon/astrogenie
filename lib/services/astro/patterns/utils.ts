import { BirthChartData, PatternData, PlanetPosition, PatternPlanetData } from '../../../types/birth-chart'

/**
 * Normalize angle to 0-360 range
 */
export function normalizeAngle(angle: number): number {
  angle = angle % 360
  return angle < 0 ? angle + 360 : angle
}

/**
 * Calculate the angular distance between two points on the ecliptic
 * Using Swiss Ephemeris approach for precise calculations
 */
export function getDistance(pos1: number, pos2: number): number {
  const angle1 = normalizeAngle(pos1)
  const angle2 = normalizeAngle(pos2)
  const diff = Math.abs(angle1 - angle2)
  return Math.min(diff, 360 - diff)
}

/**
 * Check if two points are in aspect with a specific orb
 * Using Swiss Ephemeris approach for aspect calculations
 */
export function isAspect(long1: number, long2: number, aspectAngle: number, orb: number): boolean {
  const diff = getDistance(long1, long2)
  return Math.abs(diff - aspectAngle) <= orb
}

/**
 * Check if two planets are in conjunction
 * Orb: 12° (standard)
 */
export function isConjunction(planet1: PlanetPosition, planet2: PlanetPosition, orb: number = 12): boolean {
  return getDistance(planet1.longitude, planet2.longitude) <= orb
}

/**
 * Check if two planets are in opposition
 * Orb: 10° (standard)
 */
export function isOpposition(planet1: PlanetPosition, planet2: PlanetPosition, orb: number = 10): boolean {
  return isAspect(planet1.longitude, planet2.longitude, 180, orb)
}

/**
 * Check if two planets are in square aspect
 * Orb: 9° (standard)
 */
export function isSquare(planet1: PlanetPosition, planet2: PlanetPosition, orb: number = 9): boolean {
  return isAspect(planet1.longitude, planet2.longitude, 90, orb)
}

/**
 * Check if two planets are in trine aspect
 * Orb: 9° (standard)
 */
export function isTrine(planet1: PlanetPosition, planet2: PlanetPosition, orb: number = 9): boolean {
  return isAspect(planet1.longitude, planet2.longitude, 120, orb)
}

/**
 * Check if two planets are in sextile aspect
 * Orb: 7° (standard)
 */
export function isSextile(planet1: PlanetPosition, planet2: PlanetPosition, orb: number = 7): boolean {
  return isAspect(planet1.longitude, planet2.longitude, 60, orb)
}

/**
 * Check if two planets are in quincunx aspect
 * Orb: 3° (standard)
 */
export function isQuincunx(planet1: PlanetPosition, planet2: PlanetPosition, orb: number = 3): boolean {
  return isAspect(planet1.longitude, planet2.longitude, 150, orb)
}

/**
 * Check if two planets are in sesquiquadrate aspect
 * Orb: 3° (standard)
 */
export function isSesquiquadrate(planet1: PlanetPosition, planet2: PlanetPosition, orb: number = 3): boolean {
  return isAspect(planet1.longitude, planet2.longitude, 135, orb)
}

/**
 * Check if two planets are in quintile aspect
 * Orb: 2° (standard)
 */
export function isQuintile(planet1: PlanetPosition, planet2: PlanetPosition, orb: number = 2): boolean {
  return isAspect(planet1.longitude, planet2.longitude, 72, orb)
}

/**
 * Convert planet position to pattern planet data
 */
export function toPlanetData(planet: PlanetPosition & { name: string }): PatternPlanetData {
  return {
    name: planet.name,
    sign: planet.sign,
    degree: planet.formatted,
    longitude: normalizeAngle(planet.longitude)
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
