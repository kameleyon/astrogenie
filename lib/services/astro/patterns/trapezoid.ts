import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isTrine, isSextile, isSquare, isOpposition, toPlanetData } from './utils'

/**
 * Detect Trapezoid pattern (four planets forming a trapezoid with a mix of aspects)
 */
export function detectTrapezoid(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  for (let i = 0; i < planets.length - 3; i++) {
    for (let j = i + 1; j < planets.length - 2; j++) {
      for (let k = j + 1; k < planets.length - 1; k++) {
        for (let l = k + 1; l < planets.length; l++) {
          const [p1, p2, p3, p4] = [planets[i], planets[j], planets[k], planets[l]]

          if (
            (isTrine(p1, p2) || isSextile(p1, p2)) &&
            (isSquare(p2, p3) || isOpposition(p2, p3)) &&
            (isTrine(p3, p4) || isSextile(p3, p4)) &&
            (isSquare(p4, p1) || isOpposition(p4, p1))
          ) {
            patterns.push({
              name: 'Trapezoid',
              planets: [p1, p2, p3, p4].map(toPlanetData),
              description: 'A four-planet configuration forming a trapezoid with mixed aspects.'
            })
          }
        }
      }
    }
  }

  return patterns
}
