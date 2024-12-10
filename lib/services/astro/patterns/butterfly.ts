import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isTrine, isSextile, toPlanetData } from './utils'

/**
 * Detect Butterfly pattern (a configuration with harmonious and tense aspects forming a butterfly shape)
 */
export function detectButterfly(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  for (let i = 0; i < planets.length - 3; i++) {
    for (let j = i + 1; j < planets.length - 2; j++) {
      for (let k = j + 1; k < planets.length - 1; k++) {
        for (let l = k + 1; l < planets.length; l++) {
          const [p1, p2, p3, p4] = [planets[i], planets[j], planets[k], planets[l]]

          if (
            isTrine(p1, p2) && isTrine(p3, p4) &&
            isSextile(p2, p3) && isSextile(p4, p1)
          ) {
            patterns.push({
              name: 'Butterfly',
              planets: [p1, p2, p3, p4].map(toPlanetData),
              description: 'A harmonious and balanced pattern resembling a butterfly.'
            })
          }
        }
      }
    }
  }

  return patterns
}
