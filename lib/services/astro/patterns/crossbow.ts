import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isOpposition, isSquare, toPlanetData } from './utils'

/**
 * Detect Crossbow pattern (a combination of squares and oppositions forming a dynamic configuration)
 */
export function detectCrossbow(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  for (let i = 0; i < planets.length - 3; i++) {
    for (let j = i + 1; j < planets.length - 2; j++) {
      for (let k = j + 1; k < planets.length - 1; k++) {
        for (let l = k + 1; l < planets.length; l++) {
          const [p1, p2, p3, p4] = [planets[i], planets[j], planets[k], planets[l]]

          if (
            isOpposition(p1, p2) &&
            isSquare(p2, p3) &&
            isSquare(p3, p4) &&
            isOpposition(p4, p1)
          ) {
            patterns.push({
              name: 'Crossbow',
              planets: [p1, p2, p3, p4].map(toPlanetData),
              description: 'A dynamic pattern formed by a mix of oppositions and squares.'
            })
          }
        }
      }
    }
  }

  return patterns
}
