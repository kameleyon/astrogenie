import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isSquare, isOpposition, toPlanetData } from './utils'

/**
 * Detect T-Square pattern (2 planets in opposition, both square to a third)
 */
export function detectTSquares(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  for (let i = 0; i < planets.length - 2; i++) {
    for (let j = i + 1; j < planets.length - 1; j++) {
      for (let k = j + 1; k < planets.length; k++) {
        const [p1, p2, p3] = [planets[i], planets[j], planets[k]]
        if (
          isOpposition(p1, p2) &&
          isSquare(p1, p3) &&
          isSquare(p2, p3)
        ) {
          patterns.push({
            name: 'T-Square',
            planets: [p1, p2, p3].map(toPlanetData),
            description: 'Two planets in opposition, both square to a third planet'
          })
        }
      }
    }
  }

  return patterns
}
