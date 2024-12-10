import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isTrine, isSextile, toPlanetData } from './utils'

/**
 * Detect Castle pattern (a Grand Trine with additional sextiles or trines for stability)
 */
export function detectCastle(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  for (let i = 0; i < planets.length - 3; i++) {
    for (let j = i + 1; j < planets.length - 2; j++) {
      for (let k = j + 1; k < planets.length - 1; k++) {
        for (let l = k + 1; l < planets.length; l++) {
          const [p1, p2, p3, p4] = [planets[i], planets[j], planets[k], planets[l]]

          if (
            isTrine(p1, p2) && isTrine(p2, p3) && isTrine(p3, p1) &&
            (isSextile(p1, p4) || isTrine(p1, p4)) &&
            (isSextile(p2, p4) || isTrine(p2, p4)) &&
            (isSextile(p3, p4) || isTrine(p3, p4))
          ) {
            patterns.push({
              name: 'Castle',
              planets: [p1, p2, p3, p4].map(toPlanetData),
              description: 'A Grand Trine enhanced with additional harmonious aspects for stability.'
            })
          }
        }
      }
    }
  }

  return patterns
}
