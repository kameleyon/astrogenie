import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isSextile, isQuincunx, isOpposition, toPlanetData } from './utils'

/**
 * Detect Boomerang Yod pattern (a Yod with an additional opposition)
 */
export function detectBoomerangYod(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  for (let i = 0; i < planets.length - 3; i++) {
    for (let j = i + 1; j < planets.length - 2; j++) {
      for (let k = j + 1; k < planets.length - 1; k++) {
        for (let l = k + 1; l < planets.length; l++) {
          const [p1, p2, p3, p4] = [planets[i], planets[j], planets[k], planets[l]]

          if (
            isSextile(p1, p2) &&
            isQuincunx(p1, p3) && isQuincunx(p2, p3) &&
            isOpposition(p3, p4)
          ) {
            patterns.push({
              name: 'Boomerang Yod',
              planets: [p1, p2, p3, p4].map(toPlanetData),
              description: 'A Yod with an additional opposition creating a boomerang effect.'
            })
          }
        }
      }
    }
  }

  return patterns
}
