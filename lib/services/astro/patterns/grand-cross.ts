import { PlanetPosition, PatternData, PatternPlanetData } from '../../../types/birth-chart'
import { isSquare, isOpposition, toPlanetData } from './utils'

/**
 * Detect Grand Cross pattern
 * A Grand Cross is formed when four planets are arranged in a cross pattern,
 * with each planet square (90°) to its neighbors and opposite (180°) to the planet across from it.
 */
export function detectGrandCross(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  console.debug('Checking for Grand Cross patterns...')

  for (let i = 0; i < planets.length - 3; i++) {
    for (let j = i + 1; j < planets.length - 2; j++) {
      for (let k = j + 1; k < planets.length - 1; k++) {
        for (let l = k + 1; l < planets.length; l++) {
          const p1 = planets[i]
          const p2 = planets[j]
          const p3 = planets[k]
          const p4 = planets[l]

          if (
            isSquare(p1, p2) && isSquare(p2, p3) &&
            isSquare(p3, p4) && isSquare(p4, p1) &&
            isOpposition(p1, p3) && isOpposition(p2, p4)
          ) {
            console.debug(`Grand Cross found between:`)
            console.debug(`- ${p1.name} at ${p1.formatted} ${p1.sign}`)
            console.debug(`- ${p2.name} at ${p2.formatted} ${p2.sign}`)
            console.debug(`- ${p3.name} at ${p3.formatted} ${p3.sign}`)
            console.debug(`- ${p4.name} at ${p4.formatted} ${p4.sign}`)

            patterns.push({
              name: 'Grand Cross',
              planets: [p1, p2, p3, p4].map(toPlanetData),
              description: 'Four planets forming a cross of squares and oppositions, creating a powerful configuration of dynamic tension and balance'
            })
          }
        }
      }
    }
  }

  return patterns
}

/**
 * Get modality of a Grand Cross
 * Returns the modality (Cardinal, Fixed, Mutable) if all planets are in the same modality,
 * or "Mixed" if they're in different modalities
 */
export function getGrandCrossModality(pattern: PatternData): string {
  const modalities = {
    'Cardinal': ['Aries', 'Cancer', 'Libra', 'Capricorn'],
    'Fixed': ['Taurus', 'Leo', 'Scorpio', 'Aquarius'],
    'Mutable': ['Gemini', 'Virgo', 'Sagittarius', 'Pisces']
  }

  // Find which modality contains all the signs
  for (const [modality, signs] of Object.entries(modalities)) {
    if (pattern.planets.every(planet => signs.includes(planet.sign))) {
      return modality
    }
  }

  return 'Mixed'
}

/**
 * Check if a Grand Cross is exact
 * Returns true if all squares are within 2° orb and all oppositions are within 2° orb
 */
export function isExactGrandCross(pattern: PatternData): boolean {
  const EXACT_ORB = 2
  const planets = pattern.planets

  // Check squares
  for (let i = 0; i < planets.length; i++) {
    const p1 = planets[i]
    const p2 = planets[(i + 1) % planets.length]
    const angle = Math.abs(p1.longitude - p2.longitude)
    const diff = Math.abs(angle - 90)
    if (diff > EXACT_ORB) {
      return false
    }
  }

  // Check oppositions
  const diff1 = Math.abs(Math.abs(planets[0].longitude - planets[2].longitude) - 180)
  const diff2 = Math.abs(Math.abs(planets[1].longitude - planets[3].longitude) - 180)
  
  return diff1 <= EXACT_ORB && diff2 <= EXACT_ORB
}
