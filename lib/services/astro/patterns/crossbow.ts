import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isOpposition, isSquare, toPlanetData } from './utils'

/**
 * Detect Crossbow pattern
 * Requirements:
 * 1. Two pairs of planets in opposition (180°)
 * 2. Connected by squares (90°) forming a crossbow shape
 * Creates a dynamic pattern of tension and release
 */
export function detectCrossbow(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  console.debug('Checking for Crossbow patterns...')

  for (let i = 0; i < planets.length - 3; i++) {
    for (let j = i + 1; j < planets.length - 2; j++) {
      for (let k = j + 1; k < planets.length - 1; k++) {
        for (let l = k + 1; l < planets.length; l++) {
          const [p1, p2, p3, p4] = [planets[i], planets[j], planets[k], planets[l]]

          // Check both possible configurations
          const configs = [
            // First configuration
            {
              valid: isOpposition(p1, p2) && isSquare(p2, p3) &&
                     isSquare(p3, p4) && isOpposition(p4, p1),
              string: `${p1.name}-${p2.name} and ${p4.name}-${p1.name} in opposition, connected by squares through ${p3.name}`
            },
            // Alternative configuration
            {
              valid: isOpposition(p1, p2) && isSquare(p1, p3) &&
                     isSquare(p3, p4) && isOpposition(p4, p2),
              string: `${p1.name}-${p2.name} and ${p4.name}-${p2.name} in opposition, connected by squares through ${p3.name}`
            }
          ]

          for (const config of configs) {
            if (config.valid) {
              console.debug(`Crossbow pattern found:`)
              console.debug(`First opposition:`)
              console.debug(`- ${p1.name} at ${p1.formatted} ${p1.sign}`)
              console.debug(`- ${p2.name} at ${p2.formatted} ${p2.sign}`)
              console.debug(`Square point:`)
              console.debug(`- ${p3.name} at ${p3.formatted} ${p3.sign}`)
              console.debug(`Second opposition:`)
              console.debug(`- ${p4.name} at ${p4.formatted} ${p4.sign}`)

              const patternPlanets = [p1, p2, p3, p4].map(p => ({
                ...toPlanetData(p),
                position: `${p.formatted} ${p.sign}`
              }))

              patterns.push({
                name: 'Crossbow',
                planets: patternPlanets,
                description: config.string
              })
            }
          }
        }
      }
    }
  }

  return patterns
}
