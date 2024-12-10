import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isSextile, isQuincunx, toPlanetData } from './utils'

/**
 * Detect Finger of God (Yod) pattern (two planets in sextile, both quincunx to a third)
 */
export function detectYod(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  for (let i = 0; i < planets.length - 2; i++) {
    for (let j = i + 1; j < planets.length - 1; j++) {
      for (let k = j + 1; k < planets.length; k++) {
        const [p1, p2, p3] = [planets[i], planets[j], planets[k]]

        if (
          isSextile(p1, p2) &&
          isQuincunx(p1, p3) &&
          isQuincunx(p2, p3)
        ) {
          patterns.push({
            name: 'Finger of God (Yod)',
            planets: [p1, p2, p3].map(toPlanetData),
            description: 'Two planets in sextile, both quincunx to a third planet.'
          })
        }
      }
    }
  }

  return patterns
}
