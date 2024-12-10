import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isSextile, isTrine, isOpposition, toPlanetData } from './utils'

/**
 * Detect Arrowhead pattern (a set of planets forming an arrow-like shape)
 */
export function detectArrowhead(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  for (let i = 0; i < planets.length - 2; i++) {
    for (let j = i + 1; j < planets.length - 1; j++) {
      for (let k = j + 1; k < planets.length; k++) {
        const [p1, p2, p3] = [planets[i], planets[j], planets[k]]

        if (
          isSextile(p1, p2) &&
          (isTrine(p2, p3) || isOpposition(p2, p3)) &&
          (isTrine(p1, p3) || isOpposition(p1, p3))
        ) {
          patterns.push({
            name: 'Arrowhead',
            planets: [p1, p2, p3].map(toPlanetData),
            description: 'A triangular pattern forming an arrow-like shape with harmonious and tense aspects.'
          })
        }
      }
    }
  }

  return patterns
}
