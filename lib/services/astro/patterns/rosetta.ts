import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isConjunction, isSquare, isOpposition, toPlanetData } from './utils'

/**
 * Detect Rosetta pattern (two sets of planets in conjunction forming a square with opposing connections)
 */
export function detectRosetta(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  for (let i = 0; i < planets.length - 3; i++) {
    for (let j = i + 1; j < planets.length - 2; j++) {
      for (let k = j + 1; k < planets.length - 1; k++) {
        for (let l = k + 1; l < planets.length; l++) {
          const [p1, p2, p3, p4] = [planets[i], planets[j], planets[k], planets[l]]

          if (
            isConjunction(p1, p2) && isConjunction(p3, p4) &&
            isSquare(p1, p3) && isSquare(p2, p4) &&
            isOpposition(p1, p4) && isOpposition(p2, p3)
          ) {
            patterns.push({
              name: 'Rosetta',
              planets: [p1, p2, p3, p4].map(toPlanetData),
              description: 'Two sets of planets in conjunction forming a square with opposing connections.'
            })
          }
        }
      }
    }
  }

  return patterns
}
