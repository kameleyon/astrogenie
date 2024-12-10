import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isTrine, isSextile, isOpposition, toPlanetData } from './utils'

/**
 * Detect Arrow pattern (a triangular configuration with a pointed focus)
 */
export function detectArrow(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  for (let i = 0; i < planets.length - 2; i++) {
    for (let j = i + 1; j < planets.length - 1; j++) {
      for (let k = j + 1; k < planets.length; k++) {
        const [p1, p2, p3] = [planets[i], planets[j], planets[k]]

        if (
          isTrine(p1, p2) && isSextile(p2, p3) && isOpposition(p1, p3)
        ) {
          patterns.push({
            name: 'Arrow',
            planets: [p1, p2, p3].map(toPlanetData),
            description: 'A triangular configuration forming a pointed arrow-like focus.'
          })
        }
      }
    }
  }

  return patterns
}
