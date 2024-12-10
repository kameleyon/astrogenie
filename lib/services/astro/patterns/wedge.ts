import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isSextile, isTrine, isOpposition, toPlanetData } from './utils'

/**
 * Detect Wedge pattern (a triangle formed by two planets in sextile and both aspecting a third)
 */
export function detectWedge(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  for (let i = 0; i < planets.length - 2; i++) {
    for (let j = i + 1; j < planets.length - 1; j++) {
      for (let k = j + 1; k < planets.length; k++) {
        const [p1, p2, p3] = [planets[i], planets[j], planets[k]]

        if (
          isSextile(p1, p2) &&
          (isTrine(p1, p3) || isOpposition(p1, p3)) &&
          (isTrine(p2, p3) || isOpposition(p2, p3))
        ) {
          patterns.push({
            name: 'Wedge',
            planets: [p1, p2, p3].map(toPlanetData),
            description: 'A triangular pattern formed by a sextile and two other aspects to a third planet.'
          })
        }
      }
    }
  }

  return patterns
}
