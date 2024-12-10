import { PlanetPosition, PatternData, PatternPlanetData } from '../../../types/birth-chart'
import { isTrine, toPlanetData } from './utils'

/**
 * Detect Grand Trine pattern (3 planets in trine aspects)
 * A Grand Trine is formed when three planets are approximately 120 degrees apart,
 * forming an equilateral triangle in the chart.
 */
export function detectGrandTrines(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  console.debug('Checking for Grand Trine patterns...')

  for (let i = 0; i < planets.length - 2; i++) {
    for (let j = i + 1; j < planets.length - 1; j++) {
      for (let k = j + 1; k < planets.length; k++) {
        const p1 = planets[i]
        const p2 = planets[j]
        const p3 = planets[k]

        if (isTrine(p1, p2) && isTrine(p2, p3) && isTrine(p3, p1)) {
          console.debug(`Grand Trine found between:`)
          console.debug(`- ${p1.name} at ${p1.formatted} ${p1.sign}`)
          console.debug(`- ${p2.name} at ${p2.formatted} ${p2.sign}`)
          console.debug(`- ${p3.name} at ${p3.formatted} ${p3.sign}`)

          patterns.push({
            name: 'Grand Trine',
            planets: [p1, p2, p3].map(toPlanetData),
            description: 'A harmonious triangle of flowing energy between three planets, each approximately 120° apart'
          })
        }
      }
    }
  }

  return patterns
}

/**
 * Get element of a Grand Trine
 * Returns the element (Fire, Earth, Air, Water) if all planets are in the same element,
 * or "Mixed" if they're in different elements
 */
export function getGrandTrineElement(pattern: PatternData): string {
  const elements = {
    'Fire': ['Aries', 'Leo', 'Sagittarius'],
    'Earth': ['Taurus', 'Virgo', 'Capricorn'],
    'Air': ['Gemini', 'Libra', 'Aquarius'],
    'Water': ['Cancer', 'Scorpio', 'Pisces']
  }

  // Find which element contains all the signs
  for (const [element, signs] of Object.entries(elements)) {
    if (pattern.planets.every(planet => signs.includes(planet.sign))) {
      return element
    }
  }

  return 'Mixed'
}

/**
 * Check if a Grand Trine is exact
 * Returns true if all trines are within 2° orb
 */
export function isExactGrandTrine(pattern: PatternData): boolean {
  const EXACT_ORB = 2
  const planets = pattern.planets

  for (let i = 0; i < planets.length; i++) {
    const p1 = planets[i]
    const p2 = planets[(i + 1) % planets.length]
    const angle = Math.abs(p1.longitude - p2.longitude)
    const diff = Math.abs(angle - 120)
    if (diff > EXACT_ORB) {
      return false
    }
  }

  return true
}
