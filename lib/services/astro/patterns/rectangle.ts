import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isOpposition, isSextile, isTrine, toPlanetData } from './utils'

/**
 * Detect Rectangle pattern
 * Requirements:
 * 1. Two pairs of planets in opposition (180°)
 * 2. The opposing pairs connected by sextiles (60°) or trines (120°)
 */
export function detectRectangle(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  // Find all pairs of planets in opposition
  const oppositionPairs: Array<[PlanetPosition & { name: string }, PlanetPosition & { name: string }]> = []
  for (let i = 0; i < planets.length - 1; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      if (isOpposition(planets[i], planets[j])) {
        oppositionPairs.push([planets[i], planets[j]])
      }
    }
  }

  // Check each combination of opposition pairs
  for (let i = 0; i < oppositionPairs.length - 1; i++) {
    for (let j = i + 1; j < oppositionPairs.length; j++) {
      const [p1, p3] = oppositionPairs[i]  // First opposition pair
      const [p2, p4] = oppositionPairs[j]  // Second opposition pair

      // Check if the pairs are connected by sextiles or trines
      if (
        // First configuration: p1-p2 and p3-p4 connected
        ((isSextile(p1, p2) && isSextile(p3, p4)) ||
         (isTrine(p1, p2) && isTrine(p3, p4))) ||
        // Alternative configuration: p1-p4 and p2-p3 connected
        ((isSextile(p1, p4) && isSextile(p2, p3)) ||
         (isTrine(p1, p4) && isTrine(p2, p3)))
      ) {
        const patternPlanets = [p1, p2, p3, p4].map(p => ({
          ...toPlanetData(p),
          position: `${p.formatted} ${p.sign}`
        }))

        patterns.push({
          name: 'Rectangle',
          planets: patternPlanets,
          description: `${p1.name} opposes ${p3.name}, while ${p2.name} opposes ${p4.name}, forming a rectangle through harmonious aspects`
        })
      }
    }
  }

  return patterns
}
