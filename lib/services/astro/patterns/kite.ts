import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isTrine, isOpposition, isSextile, toPlanetData } from './utils'

/**
 * Detect Kite pattern (Grand Trine with an additional opposition)
 */
export function detectKite(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  for (let i = 0; i < planets.length - 3; i++) {
    for (let j = i + 1; j < planets.length - 2; j++) {
      for (let k = j + 1; k < planets.length - 1; k++) {
        for (let l = k + 1; l < planets.length; l++) {
          const [p1, p2, p3, p4] = [planets[i], planets[j], planets[k], planets[l]]

          if (
            isTrine(p1, p2) && isTrine(p2, p3) && isTrine(p3, p1) &&
            isOpposition(p4, p1) && (isSextile(p4, p2) || isSextile(p4, p3))
          ) {
            patterns.push({
              name: 'Kite',
              planets: [p1, p2, p3, p4].map(toPlanetData),
              description: 'A Grand Trine with an additional opposition forming a kite shape.'
            })
          }
        }
      }
    }
  }

  return patterns
}
