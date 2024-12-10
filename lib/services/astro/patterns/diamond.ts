import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isSextile, isOpposition, toPlanetData } from './utils'

/**
 * Detect Diamond pattern (a complex configuration forming a diamond shape)
 */
export function detectDiamond(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  for (let i = 0; i < planets.length - 3; i++) {
    for (let j = i + 1; j < planets.length - 2; j++) {
      for (let k = j + 1; k < planets.length - 1; k++) {
        for (let l = k + 1; l < planets.length; l++) {
          const [p1, p2, p3, p4] = [planets[i], planets[j], planets[k], planets[l]]

          if (
            isSextile(p1, p2) && isSextile(p2, p3) &&
            isSextile(p3, p4) && isSextile(p4, p1) &&
            isOpposition(p1, p3) && isOpposition(p2, p4)
          ) {
            patterns.push({
              name: 'Diamond',
              planets: [p1, p2, p3, p4].map(toPlanetData),
              description: 'A complex and harmonious pattern forming a diamond shape.'
            })
          }
        }
      }
    }
  }

  return patterns
}
