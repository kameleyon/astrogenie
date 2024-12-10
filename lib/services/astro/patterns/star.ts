import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isSextile, toPlanetData } from './utils'

/**
 * Detect Star pattern (a set of planets forming a star-like geometric configuration)
 */
export function detectStar(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  for (let i = 0; i < planets.length - 4; i++) {
    for (let j = i + 1; j < planets.length - 3; j++) {
      for (let k = j + 1; k < planets.length - 2; k++) {
        for (let l = k + 1; l < planets.length - 1; l++) {
          for (let m = l + 1; m < planets.length; m++) {
            const [p1, p2, p3, p4, p5] = [planets[i], planets[j], planets[k], planets[l], planets[m]]

            if (
              isSextile(p1, p2) && isSextile(p2, p3) &&
              isSextile(p3, p4) && isSextile(p4, p5) &&
              isSextile(p5, p1)
            ) {
              patterns.push({
                name: 'Star',
                planets: [p1, p2, p3, p4, p5].map(toPlanetData),
                description: 'A star-like geometric configuration formed by harmonious sextile aspects.'
              })
            }
          }
        }
      }
    }
  }

  return patterns
}
