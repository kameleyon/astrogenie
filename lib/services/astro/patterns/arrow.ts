import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isTrine, isSextile, isOpposition, toPlanetData } from './utils'

/**
 * Detect Arrow pattern
 * Requirements:
 * 1. Two planets in trine (120°)
 * 2. One planet sextile (60°) to one end
 * 3. That same planet in opposition (180°) to the other end
 * Creating a pointed arrow-like shape
 */
export function detectArrow(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  console.debug('Checking for Arrow patterns...')

  for (let i = 0; i < planets.length - 2; i++) {
    for (let j = i + 1; j < planets.length - 1; j++) {
      for (let k = j + 1; k < planets.length; k++) {
        const [p1, p2, p3] = [planets[i], planets[j], planets[k]]

        // Check both possible configurations
        const configs = [
          // First configuration
          {
            base1: p1,
            base2: p2,
            point: p3,
            valid: isTrine(p1, p2) && isSextile(p2, p3) && isOpposition(p1, p3)
          },
          // Alternative configuration
          {
            base1: p1,
            base2: p2,
            point: p3,
            valid: isTrine(p1, p2) && isSextile(p1, p3) && isOpposition(p2, p3)
          }
        ]

        for (const config of configs) {
          if (config.valid) {
            console.debug(`Arrow pattern found:`)
            console.debug(`Base trine:`)
            console.debug(`- ${config.base1.name} at ${config.base1.formatted} ${config.base1.sign}`)
            console.debug(`- ${config.base2.name} at ${config.base2.formatted} ${config.base2.sign}`)
            console.debug(`Point:`)
            console.debug(`- ${config.point.name} at ${config.point.formatted} ${config.point.sign}`)

            const patternPlanets = [config.base1, config.base2, config.point].map(p => ({
              ...toPlanetData(p),
              position: `${p.formatted} ${p.sign}`
            }))

            patterns.push({
              name: 'Arrow',
              planets: patternPlanets,
              description: `${config.base1.name} and ${config.base2.name} in trine, with ${config.point.name} forming sextile and opposition`
            })
          }
        }
      }
    }
  }

  return patterns
}
