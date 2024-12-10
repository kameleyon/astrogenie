import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isQuintile, toPlanetData } from './utils'

/**
 * Detect Grand Quintile pattern (five planets forming a pentagon with quintiles)
 */
export function detectGrandQuintile(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  for (let i = 0; i < planets.length - 4; i++) {
    for (let j = i + 1; j < planets.length - 3; j++) {
      for (let k = j + 1; k < planets.length - 2; k++) {
        for (let l = k + 1; l < planets.length - 1; l++) {
          for (let m = l + 1; m < planets.length; m++) {
            const [p1, p2, p3, p4, p5] = [planets[i], planets[j], planets[k], planets[l], planets[m]]

            if (
              isQuintile(p1, p2) && isQuintile(p2, p3) &&
              isQuintile(p3, p4) && isQuintile(p4, p5) &&
              isQuintile(p5, p1)
            ) {
              patterns.push({
                name: 'Grand Quintile',
                planets: [p1, p2, p3, p4, p5].map(toPlanetData),
                description: 'A rare and harmonious pentagon formed by quintile aspects.'
              })
            }
          }
        }
      }
    }
  }

  return patterns
}
