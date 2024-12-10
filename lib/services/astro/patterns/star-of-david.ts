import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isTrine, isSextile, toPlanetData } from './utils'

/**
 * Detect Star of David pattern (two Grand Trines interwoven)
 */
export function detectStarOfDavid(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  for (let i = 0; i < planets.length - 5; i++) {
    for (let j = i + 1; j < planets.length - 4; j++) {
      for (let k = j + 1; k < planets.length - 3; k++) {
        for (let l = k + 1; l < planets.length - 2; l++) {
          for (let m = l + 1; m < planets.length - 1; m++) {
            for (let n = m + 1; n < planets.length; n++) {
              const [p1, p2, p3, p4, p5, p6] = [
                planets[i],
                planets[j],
                planets[k],
                planets[l],
                planets[m],
                planets[n]
              ]

              if (
                isTrine(p1, p2) && isTrine(p2, p3) && isTrine(p3, p1) &&
                isTrine(p4, p5) && isTrine(p5, p6) && isTrine(p6, p4) &&
                isSextile(p1, p4) && isSextile(p2, p5) && isSextile(p3, p6)
              ) {
                patterns.push({
                  name: 'Star of David',
                  planets: [p1, p2, p3, p4, p5, p6].map(toPlanetData),
                  description: 'A harmonious and interwoven configuration of two Grand Trines.'
                })
              }
            }
          }
        }
      }
    }
  }

  return patterns
}
