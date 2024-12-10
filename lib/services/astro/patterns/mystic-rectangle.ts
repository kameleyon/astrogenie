import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isOpposition, isSextile, isTrine, toPlanetData } from './utils'

/**
 * Detect Mystic Rectangle pattern (two pairs of planets in opposition connected by sextiles and trines)
 */
export function detectMysticRectangle(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  for (let i = 0; i < planets.length - 3; i++) {
    for (let j = i + 1; j < planets.length - 2; j++) {
      for (let k = j + 1; k < planets.length - 1; k++) {
        for (let l = k + 1; l < planets.length; l++) {
          const [p1, p2, p3, p4] = [planets[i], planets[j], planets[k], planets[l]]

          if (
            isOpposition(p1, p3) && isOpposition(p2, p4) &&
            isSextile(p1, p2) && isTrine(p1, p4) &&
            isSextile(p3, p4) && isTrine(p3, p2)
          ) {
            patterns.push({
              name: 'Mystic Rectangle',
              planets: [p1, p2, p3, p4].map(toPlanetData),
              description: 'A balanced and harmonious rectangle formed by oppositions, sextiles, and trines.'
            })
          }
        }
      }
    }
  }

  return patterns
}
