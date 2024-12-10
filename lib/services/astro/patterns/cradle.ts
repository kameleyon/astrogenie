import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isSextile, isTrine, toPlanetData } from './utils'

/**
 * Detect Cradle pattern (harmonious chain of sextiles and trines)
 */
export function detectCradle(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  for (let i = 0; i < planets.length - 3; i++) {
    for (let j = i + 1; j < planets.length - 2; j++) {
      for (let k = j + 1; k < planets.length - 1; k++) {
        for (let l = k + 1; l < planets.length; l++) {
          const [p1, p2, p3, p4] = [planets[i], planets[j], planets[k], planets[l]]

          if (
            isSextile(p1, p2) && isTrine(p2, p3) &&
            isSextile(p3, p4) && isTrine(p4, p1)
          ) {
            patterns.push({
              name: 'Cradle',
              planets: [p1, p2, p3, p4].map(toPlanetData),
              description: 'A harmonious chain of sextiles and trines.'
            })
          }
        }
      }
    }
  }

  return patterns
}
